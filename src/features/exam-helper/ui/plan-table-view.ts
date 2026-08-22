/**
 * Exam Helper - Plan Table View Component
 * Renders an aggregated summary table of all exam plans on the /examplant page.
 */

import { ExamPlanEntry } from '../types';
import { getExamCountdown, ExamUrgency } from '../time-utils';
import styles from '../style.module.scss';

export interface PlanTableViewCallbacks {
    onDownloadSingle?: (entry: ExamPlanEntry) => void;
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
 * Create the aggregated exam plan summary panel.
 *
 * @param entries - All cached exam plan entries
 * @param callbacks - Optional callbacks (e.g., download single course ICS)
 * @returns HTMLDivElement of the summary panel
 */
export function createPlanSummaryTable(
    entries: ExamPlanEntry[],
    callbacks: PlanTableViewCallbacks = {}
): HTMLDivElement {
    const panel = document.createElement('div');
    panel.className = styles.planSummaryPanel;

    // Header
    const header = document.createElement('div');
    header.className = styles.panelHead;

    const title = document.createElement('h3');
    title.innerHTML = `📋 Kế hoạch thi tổng hợp <span class="badge" style="background:#0284c7;color:#fff;">${entries.length} môn</span>`;
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

    // Sort entries by exam date & time (closest first)
    const sortedEntries = [...entries].sort((a, b) => {
        const dateA = a.examDate.split('/').reverse().join('') + a.examTime.padStart(5, '0');
        const dateB = b.examDate.split('/').reverse().join('') + b.examTime.padStart(5, '0');
        return dateA.localeCompare(dateB);
    });

    sortedEntries.forEach((entry, idx) => {
        const countdown = getExamCountdown(entry.examDate, entry.examTime);
        const row = document.createElement('tr');
        const rowHighlight = getRowClass(countdown.urgency);
        if (rowHighlight) {
            row.className = rowHighlight;
        }

        const badgeCls = getBadgeClass(countdown.urgency);

        row.innerHTML = `
            <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
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
                callbacks.onDownloadSingle
                    ? `<td style="text-align: center;">
                        <button type="button" class="btn btn-xs btn-default single-ics-btn" title="Tải file ICS cho môn này">📥</button>
                       </td>`
                    : ''
            }
        `;

        if (callbacks.onDownloadSingle) {
            const btn = row.querySelector('.single-ics-btn');
            btn?.addEventListener('click', (e) => {
                e.stopPropagation();
                callbacks.onDownloadSingle!(entry);
            });
        }

        tbody.appendChild(row);
    });

    tableWrap.appendChild(table);
    panel.appendChild(tableWrap);

    return panel;
}
