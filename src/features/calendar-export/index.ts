/**
 * Calendar Export Feature
 * Exports the HaUI timetable to ICS (iCalendar) format.
 *
 * Features:
 * - "📅 Tải lịch" button: exports currently displayed timetable
 * - Semester split-button dropdown: quickly fill dates for a semester and reload
 * - Export history saved to GM Storage
 */

import { Feature } from '@/core';
import { CalendarExportStorage, ExportHistoryEntry } from './types';
import { parseTimetableFromDOM } from './timetable-parser';
import { generateICS, downloadICSFile } from './ics-generator';
import { createCalendarExportUI, fillAndSubmitSemesterForm, readFormDateRange } from './ui';
import { detectCurrentSemester } from './semester-config';

// ============================================
// Constants
// ============================================

/** Maximum number of export history entries to keep */
const MAX_HISTORY_ENTRIES = 20;

// ============================================
// Feature Implementation
// ============================================

export class CalendarExportFeature extends Feature<CalendarExportStorage> {
    private uiContainer: HTMLElement | null = null;

    constructor() {
        super({
            id: 'calendar-export',
            name: 'Calendar Export',
            description: 'Xuất thời khóa biểu sang file ICS',
            urlMatch: [{ name: 'timetable', pattern: '/timestable/calendarcl' }],
        });
    }

    run(): void {
        this.log.i('Initializing Calendar Export...');

        // Find the button area to inject UI
        const buttonArea = document.querySelector('div.col-sm-4');
        if (!buttonArea) {
            this.log.w('Button area (div.col-sm-4) not found');
            return;
        }

        // Create and inject UI
        this.uiContainer = createCalendarExportUI({
            onDownload: () => this.handleDownload(),
            onSemesterSelect: (semesterId) => this.handleSemesterSelect(semesterId),
        });

        buttonArea.appendChild(this.uiContainer);
        this.log.i('UI injected successfully');
    }

    /**
     * Handle the "Tải lịch" button click.
     * Parses the currently displayed timetable and downloads as ICS.
     */
    private async handleDownload(): Promise<void> {
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

            // Generate ICS
            const icsContent = generateICS(entries, 'HaUI - Thời khóa biểu');

            // Generate filename
            const dateRange = readFormDateRange();
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = dateRange
                ? `TKB_${dateRange.start.replace(/\//g, '-')}_${dateRange.end.replace(/\//g, '-')}.ics`
                : `TKB_${timestamp}.ics`;

            // Download
            downloadICSFile(icsContent, filename);
            this.log.i(`Downloaded: ${filename}`);

            // Save to history
            await this.saveExportHistory(icsContent, entries);
        } catch (error) {
            this.log.e('Export failed:', error);
            alert('Xuất lịch thất bại. Xem console để biết chi tiết.');
        }
    }

    /**
     * Handle semester selection from the dropdown.
     * Fills the date inputs and submits the form (page reload).
     */
    private handleSemesterSelect(semesterValue: string): void {
        this.log.i(`Semester selected: ${semesterValue}`);
        fillAndSubmitSemesterForm(semesterValue);
    }

    /**
     * Save export to GM Storage history.
     */
    private async saveExportHistory(
        icsContent: string,
        entries: import('./types').TimetableEntry[]
    ): Promise<void> {
        try {
            const sha256 = await this.hashContent(icsContent);
            const dateRange = readFormDateRange();
            const semesterId = detectCurrentSemester();

            const historyEntry: ExportHistoryEntry = {
                exportedAt: new Date().toISOString(),
                sha256,
                semesterId,
                dateRange: dateRange ?? { start: '', end: '' },
                totalEvents: entries.length,
                events: entries,
            };

            // Load existing history
            const existingHistory = (await this.storage.get('exportHistory', [])) ?? [];

            // Prepend new entry, limit size
            const updatedHistory = [historyEntry, ...existingHistory].slice(0, MAX_HISTORY_ENTRIES);

            await this.storage.set('exportHistory', updatedHistory);
            this.log.i(`Export history saved (${updatedHistory.length} entries)`);
        } catch (error) {
            this.log.w('Failed to save export history:', error);
        }
    }

    /**
     * Compute SHA-256 hash of content using Web Crypto API.
     */
    private async hashContent(content: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Cleanup when feature is disabled or page changes.
     */
    cleanup(): void {
        this.uiContainer?.remove();
        this.uiContainer = null;
    }
}
