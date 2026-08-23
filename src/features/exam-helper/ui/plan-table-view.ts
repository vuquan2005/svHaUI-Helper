/**
 * Exam Helper - Plan Table View Component
 * Renders an aggregated summary table of all exam plans on the /examplant page.
 * Supports static rendering and progressive streaming rendering.
 */

import { ExamPlanEntry } from '../types';
import { getExamCountdown, ExamUrgency } from '../time-utils';
import styles from '../style.module.scss';

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
            return styles.badgeUrgent;
        case 'warning':
            return styles.badgeWarning;
        case 'notice':
            return styles.badgeNotice;
        case 'passed':
            return styles.badgePassed;
        case 'normal':
        default:
            return styles.badgeNormal;
    }
}

/**
 * Get CSS class for table row highlighting
 */
export function getRowClass(urgency: ExamUrgency): string {
    switch (urgency) {
        case 'urgent':
            return styles.rowUrgent;
        case 'warning':
            return styles.rowWarning;
        case 'passed':
            return styles.rowPassed;
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
            <span class="${styles.badge} ${badgeCls}" title="${countdown.label}">${countdown.shortLabel}</span>
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
    panel.className = styles.planSummaryPanel;

    // Header
    const header = document.createElement('div');
    header.className = styles.panelHead;

    const title = document.createElement('h3');
    const badgeSpan = document.createElement('span');
    badgeSpan.className = 'badge';
    badgeSpan.style.cssText = 'background: #eab308; color: #fff; margin-left: 6px;';
    badgeSpan.textContent = totalExpected > 0 ? `Đang tải (0/${totalExpected})...` : 'Đang tải...';

    title.innerHTML = '📋 Kế hoạch thi tổng hợp ';
    title.appendChild(badgeSpan);
    header.appendChild(title);
    panel.appendChild(header);

    // Responsive table wrapper
    const tableWrap = document.createElement('div');
    tableWrap.className = `${styles.tableResponsive} table-responsive`;

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

    let currentRowCount = 0;

    const appendEntries = (newEntries: ExamPlanEntry[]): void => {
        for (const entry of newEntries) {
            currentRowCount++;
            const row = createPlanTableRow(entry, currentRowCount, callbacks.onDownloadSingle);
            tbody.appendChild(row);
        }
    };

    const setProgress = (loadedCount: number, totalCount: number): void => {
        badgeSpan.textContent = `Đang tải (${loadedCount}/${totalCount})...`;
        badgeSpan.style.background = '#eab308';
    };

    const finalize = (allEntries: ExamPlanEntry[]): void => {
        tbody.innerHTML = '';
        const sorted = sortPlanEntries(allEntries);
        sorted.forEach((entry, idx) => {
            const row = createPlanTableRow(entry, idx + 1, callbacks.onDownloadSingle);
            tbody.appendChild(row);
        });

        badgeSpan.textContent = `${allEntries.length} môn`;
        badgeSpan.style.background = '#0284c7';
    };

    return {
        panel,
        appendEntries,
        setProgress,
        finalize,
    };
}
