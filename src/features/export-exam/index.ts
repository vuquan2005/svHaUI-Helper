/**
 * Export Exam Feature
 * Exports exam schedule to ICS (iCalendar) format by combining data from two pages:
 * - Exam Plan (/student/schedulefees/examplant): has class codes (mã lớp)
 * - Exam Schedule (/student/schedulefees/transactionmodules): has room, SBD, position
 *
 * Features:
 * - "📥 Tải lịch thi" button on both pages
 * - "🔄 Cập nhật dữ liệu" force update on exam plan page
 * - Auto-update plan data: daily during exam period, weekly otherwise
 * - Batch fetching to avoid server overload
 * - Stable ICS UIDs using classCode for event deduplication
 */

import { Feature } from '@/core';
import { ExportExamStorage, ExamPlanEntry } from './types';
import { parseExamScheduleFromDOM } from './exam-schedule-parser';
import {
    parseExamPlanList,
    fetchAllExamPlansBatched,
    fetchExamPlansByClassCodes,
    filterClassCodesBySemester,
} from './exam-plan-parser';
import {
    mergeExamData,
    planEntriesToEvents,
    generateExamICS,
    downloadExamICSFile,
} from './exam-ics-generator';
import {
    createExamPlanUI,
    createExamScheduleUI,
    setDownloadBtnState,
    setUpdateBtnState,
    setStatusText,
    ExamUIRefs,
} from './ui';
import { detectCurrentSemester } from '../export-timetable/semester-config';

// ============================================
// Constants
// ============================================

/** Auto-update interval during exam period: 1 day */
const AUTO_UPDATE_EXAM_PERIOD_MS = 1 * 24 * 60 * 60 * 1000;

/** Auto-update interval outside exam period: 7 days */
const AUTO_UPDATE_NORMAL_MS = 7 * 24 * 60 * 60 * 1000;

// ============================================
// Feature Implementation
// ============================================

export class ExportExamFeature extends Feature<ExportExamStorage> {
    private uiRefs: ExamUIRefs | null = null;

    constructor() {
        super({
            id: 'export-exam',
            name: 'Export Exam',
            description: 'Xuất lịch thi sang file ICS',
            urlMatch: [
                { name: 'exam-plan', pattern: '/student/schedulefees/examplant' },
                { name: 'exam-schedule', pattern: '/student/schedulefees/transactionmodules' },
            ],
        });
    }

    async run(): Promise<void> {
        const pageName = this.matchResult?.matchName;

        if (pageName === 'exam-plan') {
            await this.runOnExamPlanPage();
        } else if (pageName === 'exam-schedule') {
            await this.runOnExamSchedulePage();
        }
    }

    // ============================================
    // Exam Plan Page
    // ============================================

    private async runOnExamPlanPage(): Promise<void> {
        // Find a suitable place to inject UI (next to the submit button)
        const anchor = document.querySelector<HTMLElement>('div.box_tracuu');
        if (!anchor) {
            this.log.w('Could not find injection point on exam plan page');
            return;
        }

        this.uiRefs = createExamPlanUI({
            onDownloadExam: () => this.handleDownloadFromPlan(),
            onForceUpdate: () => this.handleForceUpdate(),
        });

        // Append to box_tracuu so buttons appear after the "Submit" button
        anchor.appendChild(this.uiRefs.container);
        this.log.i('UI injected on exam plan page');

        // Initial data load or auto-update
        await this.ensurePlanData();
    }

    /**
     * Ensure plan data is available:
     * - First time: fetch all
     * - Auto-update: refresh current semester if interval elapsed
     */
    private async ensurePlanData(): Promise<void> {
        const [planEntries, lastFetchTime, lastAutoUpdate] = await Promise.all([
            this.storage.get('planEntries'),
            this.storage.get('lastFetchTime'),
            this.storage.get('lastAutoUpdate'),
        ]);

        // First time: no data at all
        if (!planEntries || planEntries.length === 0) {
            this.log.i('No plan data found — fetching all');
            await this.fetchAndSaveAllPlans();
            return;
        }

        // Check if auto-update is needed
        if (this.shouldAutoUpdate(lastAutoUpdate)) {
            this.log.i('Auto-update triggered');
            await this.updateCurrentSemesterPlans(planEntries);
            return;
        }

        const count = planEntries.length;
        const lastTime = lastAutoUpdate ?? lastFetchTime;
        if (lastTime && this.uiRefs?.statusText) {
            const formatted = new Date(lastTime).toLocaleDateString('vi-VN');
            setStatusText(this.uiRefs.statusText, `${count} môn · Cập nhật: ${formatted}`);
        }
    }

    /**
     * Fetch all exam plan data and save to storage.
     */
    private async fetchAndSaveAllPlans(): Promise<void> {
        if (!this.uiRefs) return;

        try {
            setDownloadBtnState(this.uiRefs.downloadBtn, 'loading');
            if (this.uiRefs.statusText) {
                setStatusText(this.uiRefs.statusText, 'Đang tải dữ liệu lần đầu...');
            }

            const entries = await fetchAllExamPlansBatched();

            await this.storage.set('planEntries', entries);
            const now = new Date().toISOString();
            await this.storage.set('lastFetchTime', now);
            await this.storage.set('lastAutoUpdate', now);

            this.log.i(`Fetched and saved ${entries.length} plan entries`);

            setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
            if (this.uiRefs.statusText) {
                setStatusText(this.uiRefs.statusText, `${entries.length} môn · Vừa cập nhật`);
            }
        } catch (error) {
            this.log.e('Failed to fetch all plans:', error);
            setDownloadBtnState(this.uiRefs.downloadBtn, 'no-data');
            if (this.uiRefs.statusText) {
                setStatusText(this.uiRefs.statusText, 'Lỗi tải dữ liệu');
            }
        }
    }

    /**
     * Update only classes belonging to the current semester.
     */
    private async updateCurrentSemesterPlans(existingEntries: ExamPlanEntry[]): Promise<void> {
        if (!this.uiRefs) return;

        try {
            if (this.uiRefs.updateBtn) setUpdateBtnState(this.uiRefs.updateBtn, 'updating');
            if (this.uiRefs.statusText) setStatusText(this.uiRefs.statusText, 'Đang cập nhật...');

            const semesterId = detectCurrentSemester();

            // Get current semester class codes from existing data
            const currentCodes = filterClassCodesBySemester(
                existingEntries.map((e) => e.classCode),
                semesterId
            );

            // Also check the current page for any new class codes
            const pageItems = parseExamPlanList(document);
            const pageCodes = pageItems.map((item) => item.classCode);
            const newCurrentCodes = filterClassCodesBySemester(pageCodes, semesterId);

            // Combine unique codes
            const allCodes = [...new Set([...currentCodes, ...newCurrentCodes])];

            if (allCodes.length === 0) {
                this.log.i('No current semester codes to update');
                if (this.uiRefs.updateBtn) setUpdateBtnState(this.uiRefs.updateBtn, 'done');
                return;
            }

            // Fetch updated data for current semester
            const freshEntries = await fetchExamPlansByClassCodes(allCodes);

            // Replace current semester entries, keep others
            const existingOtherSemester = existingEntries.filter(
                (e) => !e.classCode.startsWith(semesterId)
            );
            const merged = [...existingOtherSemester, ...freshEntries];

            await this.storage.set('planEntries', merged);
            const now = new Date().toISOString();
            await this.storage.set('lastAutoUpdate', now);

            this.log.i(
                `Updated ${freshEntries.length} entries for semester ${semesterId}, total: ${merged.length}`
            );

            if (this.uiRefs.updateBtn) {
                setUpdateBtnState(this.uiRefs.updateBtn, 'done');
                // Reset button after 3s
                setTimeout(() => {
                    if (this.uiRefs?.updateBtn) setUpdateBtnState(this.uiRefs.updateBtn, 'ready');
                }, 3000);
            }
            if (this.uiRefs.statusText) {
                setStatusText(this.uiRefs.statusText, `${merged.length} môn · Vừa cập nhật`);
            }
        } catch (error) {
            this.log.e('Failed to update current semester plans:', error);
            if (this.uiRefs?.updateBtn) setUpdateBtnState(this.uiRefs.updateBtn, 'error');
            if (this.uiRefs?.statusText) setStatusText(this.uiRefs.statusText, 'Lỗi cập nhật');
        }
    }

    /**
     * Handle "📥 Tải lịch thi" from the Exam Plan page.
     * Uses only plan data (no schedule info available here).
     */
    private async handleDownloadFromPlan(): Promise<void> {
        if (!this.uiRefs) return;

        try {
            setDownloadBtnState(this.uiRefs.downloadBtn, 'downloading');

            let planEntries = await this.storage.get('planEntries');

            // If no data, fetch first
            if (!planEntries || planEntries.length === 0) {
                await this.fetchAndSaveAllPlans();
                planEntries = await this.storage.get('planEntries');
            }

            if (!planEntries || planEntries.length === 0) {
                alert('Không có dữ liệu lịch thi. Vui lòng thử cập nhật lại.');
                setDownloadBtnState(this.uiRefs.downloadBtn, 'no-data');
                return;
            }

            const events = planEntriesToEvents(planEntries);
            const icsContent = generateExamICS(events);

            if (!icsContent) {
                alert('Không thể tạo file lịch thi.');
                setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
                return;
            }

            const semesterId = detectCurrentSemester();
            const filename = `LichThi_${semesterId}.ics`;
            downloadExamICSFile(icsContent, filename);

            this.log.i(`Downloaded exam ICS: ${filename} (${events.length} events)`);
            setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
        } catch (error) {
            this.log.e('Download from plan failed:', error);
            alert('Tải lịch thi thất bại. Xem console để biết chi tiết.');
            setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
        }
    }

    /**
     * Handle "🔄 Cập nhật dữ liệu" force update.
     */
    private async handleForceUpdate(): Promise<void> {
        const planEntries = await this.storage.get('planEntries');
        if (!planEntries || planEntries.length === 0) {
            await this.fetchAndSaveAllPlans();
        } else {
            await this.updateCurrentSemesterPlans(planEntries);
        }
    }

    // ============================================
    // Exam Schedule Page
    // ============================================

    private async runOnExamSchedulePage(): Promise<void> {
        // Find panel heading container and inject UI (similar to grade-navigation)
        const anchor =
            document.querySelector<HTMLElement>('div.panel-heading.panel-heading-divider') ||
            document.querySelector<HTMLElement>('div.panel.panel-default > div.panel-heading');

        if (!anchor) {
            this.log.w('Could not find injection point on exam schedule page');
            return;
        }

        this.uiRefs = createExamScheduleUI({
            onDownloadExam: () => this.handleDownloadFromSchedule(),
        });

        // Insert at the beginning, CSS will float it to the right
        anchor.insertBefore(this.uiRefs.container, anchor.firstChild);
        this.log.i('UI injected on exam schedule page');

        // Also run auto-update check for plan data
        await this.autoUpdatePlanIfNeeded();
    }

    /**
     * Auto-update plan data if interval has elapsed (runs from schedule page too).
     */
    private async autoUpdatePlanIfNeeded(): Promise<void> {
        const [planEntries, lastAutoUpdate] = await Promise.all([
            this.storage.get('planEntries'),
            this.storage.get('lastAutoUpdate'),
        ]);

        if (!planEntries || planEntries.length === 0) {
            // No data at all — will fetch when user clicks download
            return;
        }

        if (this.shouldAutoUpdate(lastAutoUpdate)) {
            this.log.i('Auto-update plan data from schedule page');
            await this.updateCurrentSemesterPlans(planEntries);
        }
    }

    /**
     * Handle "📥 Tải lịch thi" from the Exam Schedule page.
     * Parses schedule DOM + merges with plan data from storage.
     */
    private async handleDownloadFromSchedule(): Promise<void> {
        if (!this.uiRefs) return;

        try {
            setDownloadBtnState(this.uiRefs.downloadBtn, 'downloading');

            // Parse schedule entries from current page
            const table = document.querySelector<HTMLTableElement>(
                'table.table.table-bordered.table-striped'
            );
            if (!table) {
                alert('Không tìm thấy bảng lịch thi trên trang.');
                setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
                return;
            }

            const scheduleEntries = parseExamScheduleFromDOM(table);
            if (scheduleEntries.length === 0) {
                alert('Không có dữ liệu lịch thi để xuất.');
                setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
                return;
            }

            // Get plan data from storage
            let planEntries = await this.storage.get('planEntries');

            // If no plan data, fetch it first
            if (!planEntries || planEntries.length === 0) {
                this.log.i('No plan data — fetching before merge');
                if (this.uiRefs.statusText) {
                    setStatusText(this.uiRefs.statusText, 'Đang tải dữ liệu kế hoạch thi...');
                }
                await this.fetchAndSaveAllPlans();
                planEntries = await this.storage.get('planEntries');
            }

            if (!planEntries || planEntries.length === 0) {
                alert('Không thể tải dữ liệu kế hoạch thi. Vui lòng vào trang Kế hoạch thi trước.');
                setDownloadBtnState(this.uiRefs.downloadBtn, 'no-data');
                return;
            }

            // Merge schedule + plan
            const { events, unmatched } = mergeExamData(scheduleEntries, planEntries);

            if (unmatched.length > 0) {
                this.log.w(
                    `${unmatched.length} schedule entries could not be matched with plan data`
                );
                // Try re-fetching plan data for unmatched entries
                if (this.uiRefs.statusText) {
                    setStatusText(
                        this.uiRefs.statusText,
                        `${unmatched.length} môn thiếu dữ liệu, đang cập nhật...`
                    );
                }
                await this.fetchAndSaveAllPlans();
                planEntries = await this.storage.get('planEntries');

                if (planEntries) {
                    // Re-merge with updated data
                    const retryResult = mergeExamData(scheduleEntries, planEntries);
                    events.length = 0;
                    events.push(...retryResult.events);

                    if (retryResult.unmatched.length > 0) {
                        this.log.w(`Still ${retryResult.unmatched.length} unmatched after refresh`);
                    }
                }
            }

            if (events.length === 0) {
                alert('Không thể ghép dữ liệu lịch thi. Vui lòng cập nhật dữ liệu kế hoạch thi.');
                setDownloadBtnState(this.uiRefs.downloadBtn, 'no-data');
                return;
            }

            const icsContent = generateExamICS(events);
            if (!icsContent) {
                alert('Không thể tạo file lịch thi.');
                setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
                return;
            }

            const semesterId = detectCurrentSemester();
            const filename = `LichThi_${semesterId}.ics`;
            downloadExamICSFile(icsContent, filename);

            this.log.i(`Downloaded exam ICS: ${filename} (${events.length} events)`);
            if (this.uiRefs.statusText) {
                setStatusText(this.uiRefs.statusText, '');
            }
            setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
        } catch (error) {
            this.log.e('Download from schedule failed:', error);
            alert('Tải lịch thi thất bại. Xem console để biết chi tiết.');
            setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
        }
    }

    // ============================================
    // Helpers
    // ============================================

    /**
     * Determine if auto-update should run based on elapsed time.
     * Uses shorter interval during exam period (1 day) and longer outside (7 days).
     */
    private shouldAutoUpdate(lastAutoUpdate: string | undefined): boolean {
        if (!lastAutoUpdate) return true;

        const elapsed = Date.now() - new Date(lastAutoUpdate).getTime();
        const interval = this.isExamPeriod() ? AUTO_UPDATE_EXAM_PERIOD_MS : AUTO_UPDATE_NORMAL_MS;

        return elapsed >= interval;
    }

    /**
     * Simple heuristic to check if we're currently in an exam period.
     * Exam periods typically fall near the end of each term.
     * We check if any plan entry has an exam date within the next 30 days.
     *
     * Falls back to "not in exam period" if no data is available.
     */
    private isExamPeriod(): boolean {
        // Simple month-based heuristic:
        // Exam periods roughly: Jan, Jun-Jul, Dec (end of semesters)
        const month = new Date().getMonth() + 1;
        return [1, 6, 7, 12].includes(month);
    }

    // ============================================
    // Lifecycle
    // ============================================

    cleanup(): void {
        this.uiRefs?.container.remove();
        this.uiRefs = null;
    }
}
