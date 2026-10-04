/**
 * Exam Helper - Plan Table View Component
 * Renders an aggregated summary table of all exam plans on the /examplant page.
 * Supports static rendering and progressive streaming rendering.
 */

import { ExamPlanEntry } from '../types';
import { getExamCountdown, ExamUrgency } from '../time-utils';

export interface PlanTableViewCallbacks {
    onDownloadSingle?: (entry: ExamPlanEntry) => void;
}

export interface PlanTableController {
    /** The DOM element of the panel */
    panel: HTMLDivElement;
    /** Appends newly fetched batch of entries */
    appendEntries: (newEntries: ExamPlanEntry[]) => void;
    /** Updates progress badge/text in the header */
    setProgress: (loadedCount: number, totalCount: number) => void;
    /** Re-sorts all entries chronologically and finalizes the table */
    finalize: (allEntries: ExamPlanEntry[]) => void;
}

/**
 * Get CSS class for urgency badge
 */
export function getBadgeClass(urgency: ExamUrgency): string {
    switch (urgency) {
        case 'urgent':
            return 'sv-exam-badge--urgent';
        case 'warning':
            return 'sv-exam-badge--warning';
        case 'notice':
            return 'sv-exam-badge--notice';
        case 'passed':
            return 'sv-exam-badge--passed';
        case 'normal':
        default:
            return 'sv-exam-badge--normal';
    }
}

/**
 * Get CSS class for table row highlighting
 */
export function getRowClass(urgency: ExamUrgency): string {
    switch (urgency) {
        case 'urgent':
            return 'sv-exam-row--urgent';
        case 'warning':
            return 'sv-exam-row--warning';
        case 'passed':
            return 'sv-exam-row--passed';
        default:
            return '';
    }
}

/**
 * Creates a single table row for an ExamPlanEntry.
 */
export function createPlanTableRow(
    entry: ExamPlanEntry,
    index: number,
    onDownloadSingle?: (entry: ExamPlanEntry) => void
): HTMLTableRowElement {
    const countdown = getExamCountdown(entry.examDate, entry.examTime);
    const row = document.createElement('tr');
    const rowHighlight = getRowClass(countdown.urgency);
    if (rowHighlight) {
        row.className = rowHighlight;
    }

    const badgeCls = getBadgeClass(countdown.urgency);

    row.innerHTML = `
        <td style="text-align: center; font-weight: 600;">${index}</td>
        <td style="font-family: monospace; font-weight: 500;">${entry.classCode}</td>
        <td style="font-weight: 600; color: #1e293b;">${entry.course}</td>
        <td style="text-align: center;">${entry.examDate}</td>
        <td style="text-align: center; font-weight: 500;">${entry.examTime}</td>
        <td style="text-align: center;">Lần ${entry.attempt}</td>
        <td style="text-align: center;">
            <span class="sv-exam-badge ${badgeCls}" title="${countdown.label}">${countdown.shortLabel}</span>
        </td>
        <td style="text-align: center; font-size: 12px; color: #64748b;">${entry.department || '--'}</td>
        ${
            onDownloadSingle
                ? `<td style="text-align: center;">
                    <button type="button" class="btn btn-xs btn-default single-ics-btn" title="Tải file ICS cho môn này">📥</button>
                   </td>`
                : ''
        }
    `;

    if (onDownloadSingle) {
        const btn = row.querySelector('.single-ics-btn');
        btn?.addEventListener('click', (e) => {
            e.stopPropagation();
            onDownloadSingle(entry);
        });
    }

    return row;
}

/**
 * Sorts exam entries by reversing the school's default order (newest class codes on top).
 */
export function sortPlanEntries(entries: ExamPlanEntry[]): ExamPlanEntry[] {
    return [...entries].sort((a, b) => b.classCode.localeCompare(a.classCode));
}

/**
 * Create the aggregated exam plan summary panel (static).
 *
 * @param entries - All cached exam plan entries
 * @param callbacks - Optional callbacks (e.g., download single course ICS)
 * @returns HTMLDivElement of the summary panel
 */
export function createPlanSummaryTable(
    entries: ExamPlanEntry[],
    callbacks: PlanTableViewCallbacks = {}
): HTMLDivElement {
    const controller = createStreamingPlanTable(entries.length, callbacks);
    controller.finalize(entries);
    return controller.panel;
}

/**
 * Create a streaming plan table controller for progressive rendering.
 *
 * @param totalExpected - Expected total number of courses
 * @param callbacks - Optional callbacks
 * @returns PlanTableController
 */
export function createStreamingPlanTable(
    totalExpected: number,
    callbacks: PlanTableViewCallbacks = {}
): PlanTableController {
    const panel = document.createElement('div');
    panel.className = 'sv-exam-plan-panel';

    // Header
    const header = document.createElement('div');
    header.className = 'sv-exam-panel-head';

    const title = document.createElement('h3');
    const badgeSpan = document.createElement('span');
    badgeSpan.className = 'badge sv-exam-panel-badge sv-exam-panel-badge--loading';
    badgeSpan.textContent = totalExpected > 0 ? `Đang tải (0/${totalExpected})...` : 'Đang tải...';

    title.innerHTML = '📋 Kế hoạch thi tổng hợp ';
    title.appendChild(badgeSpan);
    header.appendChild(title);
    panel.appendChild(header);

    // Responsive table wrapper
    const tableWrap = document.createElement('div');
    tableWrap.className = 'sv-exam-table-responsive table-responsive';

    const table = document.createElement('table');
    table.className = 'table table-bordered table-striped table-hover';

    table.innerHTML = `
        <thead>
            <tr>
                <th style="width: 50px;">STT</th>
                <th style="width: 140px;">Mã lớp ĐL</th>
                <th>Tên học phần</th>
                <th style="width: 110px;">Ngày thi</th>
                <th style="width: 80px;">Ca thi</th>
                <th style="width: 80px;">Lần thi</th>
                <th style="width: 130px;">Trạng thái</th>
                <th style="width: 100px;">Khoa</th>
                ${callbacks.onDownloadSingle ? '<th style="width: 60px;">Tải</th>' : ''}
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody')!;
    tableWrap.appendChild(table);
    panel.appendChild(tableWrap);

    const allCurrentEntries: ExamPlanEntry[] = [];

    const renderTable = (entries: ExamPlanEntry[]): void => {
        tbody.innerHTML = '';
        const sorted = sortPlanEntries(entries);
        sorted.forEach((entry, idx) => {
            const row = createPlanTableRow(entry, idx + 1, callbacks.onDownloadSingle);
            tbody.appendChild(row);
        });
    };

    const appendEntries = (newEntries: ExamPlanEntry[]): void => {
        allCurrentEntries.push(...newEntries);
        renderTable(allCurrentEntries);
    };

    const setProgress = (loadedCount: number, totalCount: number): void => {
        badgeSpan.textContent = `Đang tải (${loadedCount}/${totalCount})...`;
        badgeSpan.className = 'badge sv-exam-panel-badge sv-exam-panel-badge--loading';
    };

    const finalize = (allEntries: ExamPlanEntry[]): void => {
        allCurrentEntries.length = 0;
        allCurrentEntries.push(...allEntries);
        renderTable(allCurrentEntries);

        badgeSpan.textContent = `${allEntries.length} môn`;
        badgeSpan.className = 'badge sv-exam-panel-badge sv-exam-panel-badge--done';
    };

    return {
        panel,
        appendEntries,
        setProgress,
        finalize,
    };
}
