/**
 * Exam Helper Feature
 * Comprehensive exam management for HaUI students:
 * - Aggregates & displays unified exam plans on /student/schedulefees/examplant
 * - Enhances official exam schedule with countdown badges & highlighting on /student/schedulefees/transactionmodules
 * - Injects an upcoming exam alert widget on Homepage (/ or /home)
 * - Exports exam calendar events to standard ICS format with stable UIDs
 */

import { Feature } from '@/core';
import { observeDomUntil } from '@/utils/dom';
import { ExportExamStorage, ExamPlanEntry } from './types';
import { parseExamScheduleFromDOM, findExamScheduleTable } from './exam-schedule-parser';
import {
    parseExamPlanList,
    fetchAllExamPlansBatched,
    fetchExamPlansByClassCodes,
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
import { createPlanSummaryTable, createStreamingPlanTable } from './ui/plan-table-view';
import { enhanceScheduleTable } from './ui/schedule-enhancer';
import { createHomeExamWidget } from './ui/home-exam-widget';
import { getExamCountdown, detectExamSemester } from './time-utils';

// ============================================
// Constants
// ============================================

/** Auto-update interval during exam period: 1 day */
const AUTO_UPDATE_EXAM_PERIOD_MS = 1 * 24 * 60 * 60 * 1000;

/** Auto-update interval outside exam period: 3 days */
const AUTO_UPDATE_NORMAL_MS = 3 * 24 * 60 * 60 * 1000;

// ============================================
// Feature Implementation
// ============================================

export class ExamHelperFeature extends Feature<ExportExamStorage> {
    private uiRefs: ExamUIRefs | null = null;
    private abortController: AbortController | null = null;

    constructor() {
        super({
            id: 'exam-helper',
            name: 'Exam Helper',
            description: 'Kế hoạch thi, lịch thi đếm ngược và xuất lịch thi sang file ICS',
            urlMatch: [
                { name: 'exam-plan', pattern: '/student/schedulefees/examplant' },
                { name: 'exam-schedule', pattern: '/student/schedulefees/transactionmodules' },
                { name: 'home-root', pattern: /^\/$/ },
                { name: 'home-path', pattern: /^\/home$/ },
            ],
        });
    }

    async run(): Promise<void> {
        this.abortController = new AbortController();
        const pageName = this.matchResult?.matchName;

        if (pageName === 'exam-plan') {
            await this.runOnExamPlanPage();
        } else if (pageName === 'exam-schedule') {
            await this.runOnExamSchedulePage();
        } else if (pageName === 'home-root' || pageName === 'home-path') {
            await this.runOnHomePage();
        }
    }

    // ============================================
    // Exam Plan Page (/student/schedulefees/examplant)
    // ============================================

    private async runOnExamPlanPage(): Promise<void> {
        const result = await observeDomUntil(
            'div.box_tracuu',
            () => {
                const anchor = document.querySelector<HTMLElement>('div.box_tracuu');
                if (!anchor) return false;

                // Avoid injecting twice
                if (anchor.querySelector(`.${this.id}-injected`)) return true;

                this.uiRefs = createExamPlanUI({
                    onDownloadExam: () => this.handleDownloadFromPlan(),
                    onForceUpdate: () => this.handleForceUpdate(),
                });
                this.uiRefs.container.classList.add(`${this.id}-injected`);

                anchor.appendChild(this.uiRefs.container);
                this.log.i('UI buttons injected on exam plan page');
                return true;
            },
            {
                signal: this.abortController?.signal,
                timeoutMs: 8000,
            }
        );

        if (result.success) {
            // Initial data load or auto-update & render table
            await this.ensurePlanData();
        } else if (result.code !== 'ABORT') {
            this.log.w('Could not find injection point on exam plan page');
        }
    }

    /**
     * Mounts the summary table panel into DOM at the standard location.
     */
    private mountPlanSummaryPanel(panel: HTMLElement): void {
        const existing = document.querySelector<HTMLElement>(`.${this.id}-plan-summary`);
        existing?.remove();

        panel.classList.add(`${this.id}-plan-summary`);

        const insertTarget =
            document.querySelector<HTMLElement>('div#ctl03_ctl00_viewResult') ||
            document.querySelector<HTMLElement>('div.kGrid') ||
            document.querySelector<HTMLElement>('div.panel-body');

        if (insertTarget && insertTarget.parentElement) {
            insertTarget.parentElement.insertBefore(panel, insertTarget.nextSibling);
        }
    }

    /**
     * Ensure plan data is available and render the summary table.
     */
    private async ensurePlanData(): Promise<void> {
        const [planEntries, fetchedClassCodes, lastFetchTime, lastAutoUpdate] = await Promise.all([
            this.storage.get('planEntries'),
            this.storage.get('fetchedClassCodes'),
            this.storage.get('lastFetchTime'),
            this.storage.get('lastAutoUpdate'),
        ]);

        const pageItems = parseExamPlanList(document);
        const pageCodes = pageItems.map((item) => item.classCode);

        // First time: no data at all -> progressive fetch all page codes
        if (!fetchedClassCodes && (!planEntries || planEntries.length === 0)) {
            this.log.i('No plan data found — progressive fetching all');
            await this.fetchAndSaveAllPlans();
            return;
        }

        // Check if there are missing codes (codes on page that have NEVER been fetched)
        const checkedCodeSet = new Set(
            fetchedClassCodes ?? planEntries?.map((e) => e.classCode) ?? []
        );
        const missingCodes = pageCodes.filter((code) => !checkedCodeSet.has(code));

        if (missingCodes.length > 0) {
            this.log.i(`Found ${missingCodes.length} missing plan codes — resuming fetch`);
            await this.fetchMissingPlans(planEntries ?? [], fetchedClassCodes ?? [], missingCodes);
            return;
        }

        // Render summary table with existing data
        this.renderPlanSummaryTable(planEntries ?? []);

        // Check if auto-update is needed
        if (this.shouldAutoUpdate(lastAutoUpdate)) {
            this.log.i('Auto-update triggered');
            await this.updateCurrentSemesterPlans(planEntries ?? []);
            return;
        }

        const count = planEntries?.length ?? 0;
        const lastTime = lastAutoUpdate ?? lastFetchTime;
        if (lastTime && this.uiRefs?.statusText) {
            const formatted = new Date(lastTime).toLocaleDateString('vi-VN');
            setStatusText(this.uiRefs.statusText, `${count} môn · Cập nhật: ${formatted}`);
        }
    }

    /**
     * Render static plan summary table.
     */
    private renderPlanSummaryTable(entries: ExamPlanEntry[]): void {
        if (entries.length === 0) return;

        const tablePanel = createPlanSummaryTable(entries, {
            onDownloadSingle: (entry) => this.handleDownloadSingleCourse(entry),
        });

        this.mountPlanSummaryPanel(tablePanel);
        this.log.i(`Rendered summary table with ${entries.length} exam plans`);
    }

    /**
     * Download ICS for a single course from the plan table.
     */
    private handleDownloadSingleCourse(entry: ExamPlanEntry): void {
        const events = planEntriesToEvents([entry]);
        const icsContent = generateExamICS(events, `Lịch thi - ${entry.course}`);
        if (icsContent) {
            const filename = `LichThi_${entry.classCode}.ics`;
            downloadExamICSFile(icsContent, filename);
        }
    }

    /**
     * Fetch missing plan entries progressively (when resuming after interruption).
     */
    private async fetchMissingPlans(
        existingEntries: ExamPlanEntry[],
        existingFetchedCodes: string[],
        missingCodes: string[]
    ): Promise<void> {
        if (!this.uiRefs) return;

        try {
            setDownloadBtnState(this.uiRefs.downloadBtn, 'loading');
            if (this.uiRefs.statusText) {
                setStatusText(
                    this.uiRefs.statusText,
                    `Đang tải tiếp ${missingCodes.length} môn...`
                );
            }

            const totalCount = existingEntries.length + missingCodes.length;
            const controller = createStreamingPlanTable(totalCount, {
                onDownloadSingle: (entry) => this.handleDownloadSingleCourse(entry),
            });
            // Pre-fill existing entries
            controller.appendEntries(existingEntries);
            this.mountPlanSummaryPanel(controller.panel);

            const accumulated = [...existingEntries];
            const freshEntries = await fetchExamPlansByClassCodes(
                [...missingCodes].reverse(),
                async (batch, loaded, _total) => {
                    accumulated.push(...batch);
                    controller.appendEntries(batch);
                    controller.setProgress(existingEntries.length + loaded, totalCount);
                    if (this.uiRefs?.statusText) {
                        setStatusText(
                            this.uiRefs.statusText,
                            `Đang tải: ${existingEntries.length + loaded}/${totalCount} môn...`
                        );
                    }
                    await this.storage.set('planEntries', [...accumulated]);
                }
            );

            const merged = [...existingEntries, ...freshEntries];
            const allFetchedCodes = [...new Set([...existingFetchedCodes, ...missingCodes])];

            controller.finalize(merged);

            await this.storage.set('planEntries', merged);
            await this.storage.set('fetchedClassCodes', allFetchedCodes);
            const now = new Date().toISOString();
            await this.storage.set('lastAutoUpdate', now);

            setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
            if (this.uiRefs.statusText) {
                setStatusText(this.uiRefs.statusText, `${merged.length} môn · Vừa cập nhật`);
            }
        } catch (error) {
            this.log.e('Failed to fetch missing plans:', error);
            setDownloadBtnState(this.uiRefs.downloadBtn, 'no-data');
            if (this.uiRefs.statusText) {
                setStatusText(this.uiRefs.statusText, 'Lỗi tải dữ liệu');
            }
        }
    }

    /**
     * Fetch all exam plan data progressively and save to storage.
     */
    private async fetchAndSaveAllPlans(): Promise<void> {
        if (!this.uiRefs) return;

        try {
            setDownloadBtnState(this.uiRefs.downloadBtn, 'loading');
            if (this.uiRefs.statusText) {
                setStatusText(this.uiRefs.statusText, 'Đang chuẩn bị dữ liệu...');
            }

            const pageItems = parseExamPlanList(document);
            const pageCodes = pageItems.map((item) => item.classCode);
            const totalExpected = pageItems.length;

            // Create streaming table controller and mount immediately
            const controller = createStreamingPlanTable(totalExpected, {
                onDownloadSingle: (entry) => this.handleDownloadSingleCourse(entry),
            });
            this.mountPlanSummaryPanel(controller.panel);

            const accumulated: ExamPlanEntry[] = [];
            const entries = await fetchAllExamPlansBatched(async (batch, loaded, total) => {
                accumulated.push(...batch);
                controller.appendEntries(batch);
                controller.setProgress(loaded, total);
                if (this.uiRefs?.statusText) {
                    setStatusText(this.uiRefs.statusText, `Đang tải: ${loaded}/${total} môn...`);
                }
                // Save incrementally after each batch
                await this.storage.set('planEntries', [...accumulated]);
            });

            controller.finalize(entries);

            await this.storage.set('planEntries', entries);
            await this.storage.set('fetchedClassCodes', pageCodes);
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
     * Update active/current semester classes with progressive updates.
     */
    private async updateCurrentSemesterPlans(existingEntries: ExamPlanEntry[]): Promise<void> {
        if (!this.uiRefs) return;

        try {
            if (this.uiRefs.updateBtn) setUpdateBtnState(this.uiRefs.updateBtn, 'updating');
            if (this.uiRefs.statusText) setStatusText(this.uiRefs.statusText, 'Đang cập nhật...');

            const [fetchedClassCodes] = await Promise.all([this.storage.get('fetchedClassCodes')]);

            const pageItems = parseExamPlanList(document);
            const pageCodes = pageItems.map((item) => item.classCode);

            // Determine target codes to update:
            // Find latest semester prefix (e.g., "20251") present on the page
            const prefixes = pageCodes.map((c) => c.slice(0, 5)).filter(Boolean);
            prefixes.sort();
            const latestPrefix = prefixes[prefixes.length - 1];

            // If there's an active prefix, update courses from that semester, else update all page codes
            const targetCodes = latestPrefix
                ? pageCodes.filter((c) => c.startsWith(latestPrefix))
                : pageCodes;

            if (targetCodes.length === 0) {
                this.log.i('No class codes found on page to update');
                if (this.uiRefs.updateBtn) {
                    setUpdateBtnState(this.uiRefs.updateBtn, 'done');
                    setTimeout(() => {
                        if (this.uiRefs?.updateBtn)
                            setUpdateBtnState(this.uiRefs.updateBtn, 'ready');
                    }, 2000);
                }
                if (this.uiRefs.statusText) {
                    setStatusText(
                        this.uiRefs.statusText,
                        `${existingEntries.length} môn · Đã cập nhật`
                    );
                }
                return;
            }

            const freshEntries = await fetchExamPlansByClassCodes(
                [...targetCodes].reverse(),
                (_batch, loaded, total) => {
                    if (this.uiRefs?.statusText) {
                        setStatusText(
                            this.uiRefs.statusText,
                            `Đang cập nhật: ${loaded}/${total} môn...`
                        );
                    }
                }
            );

            // Replace existing entries for target codes with fresh entries
            const targetCodeSet = new Set(targetCodes);
            const existingOther = existingEntries.filter((e) => !targetCodeSet.has(e.classCode));
            const merged = [...existingOther, ...freshEntries];
            const allFetchedCodes = [
                ...new Set([...(fetchedClassCodes ?? pageCodes), ...targetCodes]),
            ];

            await this.storage.set('planEntries', merged);
            await this.storage.set('fetchedClassCodes', allFetchedCodes);
            const now = new Date().toISOString();
            await this.storage.set('lastAutoUpdate', now);

            this.log.i(`Updated ${freshEntries.length} entries, total: ${merged.length}`);

            if (this.uiRefs.updateBtn) {
                setUpdateBtnState(this.uiRefs.updateBtn, 'done');
                setTimeout(() => {
                    if (this.uiRefs?.updateBtn) setUpdateBtnState(this.uiRefs.updateBtn, 'ready');
                }, 3000);
            }
            if (this.uiRefs.statusText) {
                setStatusText(this.uiRefs.statusText, `${merged.length} môn · Vừa cập nhật`);
            }

            this.renderPlanSummaryTable(merged);
        } catch (error) {
            this.log.e('Failed to update current semester plans:', error);
            if (this.uiRefs?.updateBtn) setUpdateBtnState(this.uiRefs.updateBtn, 'error');
            if (this.uiRefs?.statusText) setStatusText(this.uiRefs.statusText, 'Lỗi cập nhật');
        }
    }

    /**
     * Handle "📥 Tải lịch thi" from the Exam Plan page.
     */
    private async handleDownloadFromPlan(): Promise<void> {
        if (!this.uiRefs) return;

        try {
            setDownloadBtnState(this.uiRefs.downloadBtn, 'downloading');

            let planEntries = await this.storage.get('planEntries');

            if (!planEntries || planEntries.length === 0) {
                await this.fetchAndSaveAllPlans();
                planEntries = await this.storage.get('planEntries');
            }

            if (!planEntries || planEntries.length === 0) {
                alert('Không có dữ liệu lịch thi. Vui lòng thử cập nhật lại.');
                setDownloadBtnState(this.uiRefs.downloadBtn, 'no-data');
                return;
            }

            // Filter only upcoming (not yet passed) exams
            const upcomingPlans = planEntries.filter(
                (e) => getExamCountdown(e.examDate, e.examTime).direction === 1
            );

            if (upcomingPlans.length === 0) {
                alert(
                    'Tất cả các môn thi trong kế hoạch đều đã diễn ra. Không có môn nào sắp tới để xuất.'
                );
                setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
                return;
            }

            const events = planEntriesToEvents(upcomingPlans);
            const icsContent = generateExamICS(events);

            if (!icsContent) {
                alert('Không thể tạo file lịch thi.');
                setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
                return;
            }

            const semesterId = detectExamSemester();
            const filename = `LichThi_${semesterId}.ics`;
            downloadExamICSFile(icsContent, filename);

            this.log.i(`Downloaded upcoming exam ICS: ${filename} (${events.length} events)`);
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
    // Exam Schedule Page (/student/schedulefees/transactionmodules)
    // ============================================

    private async runOnExamSchedulePage(): Promise<void> {
        const result = await observeDomUntil(
            'div.panel-heading.panel-heading-divider, div.panel.panel-default > div.panel-heading',
            () => {
                const anchor =
                    document.querySelector<HTMLElement>(
                        'div.panel-heading.panel-heading-divider'
                    ) ||
                    document.querySelector<HTMLElement>(
                        'div.panel.panel-default > div.panel-heading'
                    );

                if (!anchor) return false;

                // Avoid duplicate injection
                if (anchor.querySelector(`.${this.id}-injected`)) return true;

                this.uiRefs = createExamScheduleUI({
                    onDownloadExam: () => this.handleDownloadFromSchedule(),
                });
                this.uiRefs.container.classList.add(`${this.id}-injected`);

                // Insert at the beginning, CSS will float it to the right
                anchor.insertBefore(this.uiRefs.container, anchor.firstChild);
                this.log.i('UI injected on exam schedule page');
                return true;
            },
            {
                signal: this.abortController?.signal,
                timeoutMs: 8000,
            }
        );

        if (result.success) {
            // Enhance schedule table with countdown badges & cache entries
            const table = findExamScheduleTable();
            if (table) {
                enhanceScheduleTable(table);
                const scheduleEntries = parseExamScheduleFromDOM(table);
                if (scheduleEntries.length > 0) {
                    await this.storage.set('scheduleEntries', scheduleEntries);
                    await this.storage.set('lastScheduleFetchTime', new Date().toISOString());
                    this.log.d(`Enhanced & cached ${scheduleEntries.length} schedule entries`);
                }
            }

            // Also run auto-update check for plan data
            await this.autoUpdatePlanIfNeeded();
        } else if (result.code !== 'ABORT') {
            this.log.w('Could not find injection point on exam schedule page');
        }
    }

    /**
     * Auto-update plan data if interval has elapsed.
     */
    private async autoUpdatePlanIfNeeded(): Promise<void> {
        const [planEntries, lastAutoUpdate] = await Promise.all([
            this.storage.get('planEntries'),
            this.storage.get('lastAutoUpdate'),
        ]);

        if (!planEntries || planEntries.length === 0) return;

        if (this.shouldAutoUpdate(lastAutoUpdate)) {
            this.log.i('Auto-update plan data from schedule page');
            await this.updateCurrentSemesterPlans(planEntries);
        }
    }

    /**
     * Handle "📥 Tải lịch thi" from the Exam Schedule page.
     */
    private async handleDownloadFromSchedule(): Promise<void> {
        if (!this.uiRefs) return;

        try {
            setDownloadBtnState(this.uiRefs.downloadBtn, 'downloading');

            const table = findExamScheduleTable();
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

            // Update schedule cache
            await this.storage.set('scheduleEntries', scheduleEntries);
            await this.storage.set('lastScheduleFetchTime', new Date().toISOString());

            // Filter only upcoming (not yet passed) schedule entries
            const upcomingSchedules = scheduleEntries.filter(
                (e) => getExamCountdown(e.examDate, e.examTime).direction === 1
            );

            if (upcomingSchedules.length === 0) {
                alert(
                    'Tất cả các môn trong lịch thi đều đã diễn ra. Không có môn nào sắp tới để xuất.'
                );
                setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
                return;
            }

            let planEntries = await this.storage.get('planEntries');

            if (!planEntries || planEntries.length === 0) {
                this.log.i('No plan data — fetching before merge');
                if (this.uiRefs.statusText) {
                    setStatusText(this.uiRefs.statusText, 'Đang tải dữ liệu kế hoạch thi...');
                }
                await this.fetchAndSaveAllPlans();
                planEntries = await this.storage.get('planEntries');
            }

            // Merge schedule + plan (with cascade matching & fallback UIDs)
            const { events, unmatched } = mergeExamData(upcomingSchedules, planEntries ?? []);

            if (unmatched.length > 0) {
                this.log.w(
                    `${unmatched.length} schedule entries using fallback UID:`,
                    unmatched.map((u) => u.course)
                );
            }

            if (events.length === 0) {
                alert('Không thể tạo dữ liệu lịch thi.');
                setDownloadBtnState(this.uiRefs.downloadBtn, 'no-data');
                return;
            }

            const icsContent = generateExamICS(events);
            if (!icsContent) {
                alert('Không thể tạo file lịch thi.');
                setDownloadBtnState(this.uiRefs.downloadBtn, 'ready');
                return;
            }

            const semesterId = detectExamSemester();
            const filename = `LichThi_${semesterId}.ics`;
            downloadExamICSFile(icsContent, filename);

            this.log.i(`Downloaded upcoming exam ICS: ${filename} (${events.length} events)`);
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
    // Home Page (/ or /home)
    // ============================================

    private async runOnHomePage(): Promise<void> {
        const [scheduleEntries, planEntries] = await Promise.all([
            this.storage.get('scheduleEntries'),
            this.storage.get('planEntries'),
        ]);

        const widget = createHomeExamWidget(scheduleEntries, planEntries);
        if (!widget) return;

        widget.classList.add(`${this.id}-home-widget`);

        observeDomUntil(
            'div.cttsv-dashboard, div.be-content',
            () => {
                const dashboard = document.querySelector('div.cttsv-dashboard');
                if (!dashboard) return false;

                // Avoid injecting twice
                if (dashboard.querySelector(`.${this.id}-home-widget`)) return true;

                // Insert right before the overview section or action grid
                const overviewSection = dashboard.querySelector('section.cttsv-overview-section');
                const actionGrid = dashboard.querySelector(
                    'section.cttsv-action-grid, div.cttsv-action-grid'
                );
                const target = overviewSection || actionGrid;

                if (target) {
                    dashboard.insertBefore(widget, target);
                } else {
                    dashboard.appendChild(widget);
                }

                this.log.i('Home exam widget injected');
                return true;
            },
            {
                signal: this.abortController?.signal,
                timeoutMs: 8000,
            }
        );
    }

    // ============================================
    // Helpers
    // ============================================

    private shouldAutoUpdate(lastAutoUpdate: string | undefined): boolean {
        if (!lastAutoUpdate) return true;

        const elapsed = Date.now() - new Date(lastAutoUpdate).getTime();
        const interval = this.isExamPeriod() ? AUTO_UPDATE_EXAM_PERIOD_MS : AUTO_UPDATE_NORMAL_MS;

        return elapsed >= interval;
    }

    private isExamPeriod(): boolean {
        const month = new Date().getMonth() + 1;
        return [1, 6, 7, 12].includes(month);
    }

    // ============================================
    // Lifecycle
    // ============================================

    cleanup(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }

        const elements = document.querySelectorAll(
            `.${this.id}-injected, .${this.id}-plan-summary, .${this.id}-home-widget`
        );
        elements.forEach((el) => el.remove());

        this.uiRefs = null;
    }
}
