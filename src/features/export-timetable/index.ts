/**
 * Export Timetable Feature
 * Exports the HaUI timetable to ICS (iCalendar) format.
 *
 * Features:
 * - "📥 Tải TKB kỳ này" split-button: auto-fetch current semester timetable & download ICS
 *   - Dropdown: "📅 Tải lịch hiện tại" exports currently displayed timetable
 * - "🔄 Kiểm tra cập nhật" button: compare current TKB with last snapshot
 * - Semester split-button dropdown: quickly fill dates for a semester and reload
 * - Auto-check for updates every 7 days
 */

import { Feature } from '@/core';
import { ExportTimetableStorage } from './types';
import { parseTimetableFromDOM } from './timetable-parser';
import { generateICS, downloadICSFile } from './ics-generator';
import {
    createExportTimetableUI,
    fillAndSubmitSemesterForm,
    readFormDateRange,
    setCheckButtonState,
    showDiffResult,
    UIRefs,
} from './ui';
import { detectCurrentSemester, getSemesterLabel } from './semester-config';
import {
    fetchSemesterTimetable,
    getSemesterDateRangeFormatted,
    entriesEqual,
    diffEntries,
    shouldAutoCheck,
} from './update-checker';

// ============================================
// Feature Implementation
// ============================================

export class ExportTimetableFeature extends Feature<ExportTimetableStorage> {
    private uiRefs: UIRefs | null = null;

    /** Cached pending update data when user declined download */
    private pendingUpdate: {
        semesterId: string;
        entries: import('./types').TimetableEntry[];
        diff: import('./types').TimetableDiff;
    } | null = null;

    constructor() {
        super({
            id: 'export-timetable',
            name: 'Export Timetable',
            description: 'Xuất thời khóa biểu sang file ICS',
            urlMatch: [{ name: 'timetable', pattern: '/timestable/calendarcl' }],
        });
    }

    run(): void {
        // Find the button area to inject UI
        const buttonArea = document.querySelector('div.col-sm-4');
        if (!buttonArea) {
            this.log.w('Button area (div.col-sm-4) not found');
            return;
        }

        // Create and inject UI
        this.uiRefs = createExportTimetableUI({
            onDownloadSemester: () => this.handleDownloadSemester(),
            onDownloadCurrent: () => this.handleDownloadCurrent(),
            onCheckUpdate: () => this.handleCheckUpdate(),
            onSemesterSelect: (semesterId) => this.handleSemesterSelect(semesterId),
        });

        buttonArea.appendChild(this.uiRefs.container);
        this.log.i('UI injected successfully');

        // Run auto-check on page load
        this.autoCheckOnLoad();
    }

    // ============================================
    // Download Handlers
    // ============================================

    /**
     * Handle "📥 Tải TKB kỳ này" — auto-detect semester, fetch, download ICS.
     */
    private async handleDownloadSemester(): Promise<void> {
        try {
            const semesterId = detectCurrentSemester();
            this.log.i(`Downloading semester timetable: ${semesterId}`);

            // Fetch timetable entries
            const entries = await fetchSemesterTimetable(semesterId);
            if (entries.length === 0) {
                this.log.w('No timetable entries found for current semester');
                alert('Không có dữ liệu lịch học cho kỳ hiện tại.');
                return;
            }

            this.log.i(`Fetched ${entries.length} timetable entries`);

            // Generate and Download
            this.downloadSemesterICS(semesterId, entries);

            // Save snapshot
            await this.saveSnapshot(semesterId, entries);
        } catch (error) {
            this.log.e('Semester download failed:', error);
            alert('Tải TKB kỳ này thất bại. Xem console để biết chi tiết.');
        }
    }

    /**
     * Handle "📅 Tải lịch hiện tại" — parse currently displayed timetable and download.
     */
    private async handleDownloadCurrent(): Promise<void> {
        try {
            // Find the timetable table
            const table = document.querySelector<HTMLTableElement>('table.table.table-bordered');
            if (!table) {
                this.log.w('Timetable table not found');
                alert('Không tìm thấy bảng thời khóa biểu. Hãy nhấn "Xem" trước.');
                return;
            }

            // Parse entries
            const entries = parseTimetableFromDOM(table);
            if (entries.length === 0) {
                this.log.w('No timetable entries found');
                alert('Không có dữ liệu lịch học để xuất.');
                return;
            }

            this.log.i(`Parsed ${entries.length} timetable entries`);

            const icsContent = generateICS(entries, 'HaUI - Thời khóa biểu');

            // Generate filename
            const dateRange = readFormDateRange();
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = dateRange
                ? `TKB_${dateRange.start.replace(/\//g, '')}-${dateRange.end.replace(/\//g, '')}.ics`
                : `TKB_${timestamp}.ics`;

            // Download
            downloadICSFile(icsContent, filename);
            this.log.i(`Downloaded: ${filename}`);
        } catch (error) {
            this.log.e('Export failed:', error);
            alert('Xuất lịch thất bại. Xem console để biết chi tiết.');
        }
    }

    // ============================================
    // Update Check
    // ============================================

    /**
     * Handle "🔄 Kiểm tra cập nhật" click.
     * If there's a pending update (user declined download last time),
     * show the cached diff again without re-fetching.
     */
    private async handleCheckUpdate(): Promise<void> {
        if (!this.uiRefs) return;
        const btn = this.uiRefs.checkUpdateBtn;

        // If we already have cached pending update, just re-prompt
        if (this.pendingUpdate) {
            const wantsDownload = showDiffResult(this.pendingUpdate.diff);
            if (wantsDownload) {
                await this.downloadAndSaveUpdate(this.pendingUpdate);
            }
            return;
        }

        try {
            setCheckButtonState(btn, 'checking');

            const semesterId = detectCurrentSemester();
            const newEntries = await fetchSemesterTimetable(semesterId);
            this.log.i(`Check update: fetched ${newEntries.length} entries for ${semesterId}`);

            // Load last snapshot
            const snapshot = await this.storage.get('lastSnapshot');
            const now = new Date().toISOString();

            if (!snapshot || snapshot.semesterId !== semesterId) {
                // No previous snapshot for this semester — save as baseline
                await this.saveSnapshot(semesterId, newEntries);
                await this.storage.set('lastCheckTime', now);
                setCheckButtonState(btn, 'no-update', now);
                this.log.i('No previous snapshot — saved baseline');

                const wantsDownload = confirm(
                    'Đã lưu dữ liệu lần đầu cho kỳ hiện tại để theo dõi cập nhật. Bạn có muốn tải file TKB (ICS) về máy luôn không?'
                );

                if (wantsDownload) {
                    this.downloadSemesterICS(semesterId, newEntries);
                }
                return;
            }

            // Compare
            if (entriesEqual(snapshot.entries, newEntries)) {
                await this.storage.set('lastCheckTime', now);
                setCheckButtonState(btn, 'no-update', now);
                this.log.i('No changes detected');
            } else {
                const diff = diffEntries(snapshot.entries, newEntries);
                this.log.i(
                    `Changes detected: +${diff.added.length} -${diff.removed.length} ~${diff.changed.length}`
                );

                // Cache the pending update
                this.pendingUpdate = { semesterId, entries: newEntries, diff };
                setCheckButtonState(btn, 'has-update', now);

                // Show diff and ask user if they want to download
                const wantsDownload = showDiffResult(diff);
                if (wantsDownload) {
                    await this.downloadAndSaveUpdate(this.pendingUpdate);
                }
                // If user declines: pendingUpdate stays cached
                // → next click re-prompts without re-fetching
            }
        } catch (error) {
            this.log.e('Check update failed:', error);
            setCheckButtonState(btn, 'normal');
            alert('Kiểm tra cập nhật thất bại. Xem console để biết chi tiết.');
        }
    }

    /**
     * Download ICS from pending update and save snapshot.
     */
    private async downloadAndSaveUpdate(
        update: NonNullable<typeof this.pendingUpdate>
    ): Promise<void> {
        const { semesterId, entries } = update;
        this.downloadSemesterICS(semesterId, entries);

        // Save snapshot & clear cache
        await this.saveSnapshot(semesterId, entries);
        const now = new Date().toISOString();
        await this.storage.set('lastCheckTime', now);
        this.pendingUpdate = null;

        if (this.uiRefs) {
            setCheckButtonState(this.uiRefs.checkUpdateBtn, 'normal', now);
        }
    }

    /**
     * Auto-check on page load if enough time has elapsed.
     */
    private async autoCheckOnLoad(): Promise<void> {
        try {
            const lastCheckTime = await this.storage.get('lastCheckTime');

            if (!shouldAutoCheck(lastCheckTime as string | undefined)) {
                // Update button title with last check time
                if (this.uiRefs && lastCheckTime) {
                    setCheckButtonState(
                        this.uiRefs.checkUpdateBtn,
                        'normal',
                        lastCheckTime as string
                    );
                }
                return;
            }

            this.log.i('Auto-check triggered');
            if (!this.uiRefs) return;

            const btn = this.uiRefs.checkUpdateBtn;
            const semesterId = detectCurrentSemester();

            try {
                const newEntries = await fetchSemesterTimetable(semesterId);
                const snapshot = await this.storage.get('lastSnapshot');
                const now = new Date().toISOString();

                if (!snapshot || snapshot.semesterId !== semesterId) {
                    // First time — save silently
                    await this.saveSnapshot(semesterId, newEntries);
                    await this.storage.set('lastCheckTime', now);
                    setCheckButtonState(btn, 'normal', now);
                    return;
                }

                if (!entriesEqual(snapshot.entries, newEntries)) {
                    // Has changes — update button style, don't show alert
                    setCheckButtonState(btn, 'has-update', now);
                    this.log.i('Auto-check: changes detected');
                } else {
                    setCheckButtonState(btn, 'normal', now);
                    this.log.i('Auto-check: no changes');
                }

                await this.storage.set('lastCheckTime', now);
            } catch (error) {
                this.log.w('Auto-check fetch failed:', error);
                // Silently fail — don't bother the user
            }
        } catch (error) {
            this.log.w('Auto-check failed:', error);
        }
    }

    // ============================================
    // Snapshot Management
    // ============================================

    /**
     * Reusable method to generate and download ICS for a semester.
     */
    private downloadSemesterICS(semesterId: string, entries: import('./types').TimetableEntry[]) {
        const icsContent = generateICS(entries, getSemesterLabel(semesterId));
        const filename = `TKB_${semesterId}.ics`;
        downloadICSFile(icsContent, filename);
        this.log.i(`Downloaded ICS: ${filename}`);
    }

    /**
     * Save a snapshot of the current semester's timetable.
     * Also cleans up snapshots from previous semesters.
     */
    private async saveSnapshot(
        semesterId: string,
        entries: import('./types').TimetableEntry[]
    ): Promise<void> {
        const dateRange = getSemesterDateRangeFormatted(semesterId);

        await this.storage.set('lastSnapshot', {
            semesterId,
            entries,
            savedAt: new Date().toISOString(),
            dateRange: dateRange ?? { start: '', end: '' },
        });

        this.log.i(`Snapshot saved for ${semesterId} (${entries.length} entries)`);
    }

    // ============================================
    // Other Handlers
    // ============================================

    /**
     * Handle semester selection from the dropdown.
     */
    private handleSemesterSelect(semesterValue: string): void {
        this.log.i(`Semester selected: ${semesterValue}`);
        fillAndSubmitSemesterForm(semesterValue);
    }

    /**
     * Cleanup when feature is disabled or page changes.
     */
    cleanup(): void {
        this.uiRefs?.container.remove();
        this.uiRefs = null;
    }
}
