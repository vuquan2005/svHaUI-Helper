/**
 * Exam Helper - Schedule Enhancer Component
 * Enhances the native exam schedule table on /student/schedulefees/transactionmodules
 * by adding countdown badges and visual highlighting.
 */

import { getExamCountdown } from '../time-utils';
import { getBadgeClass, getRowClass } from './plan-table-view';
import styles from '../style.module.scss';

const COL_DATE = 3;
const COL_TIME = 4;

/**
 * Enhance the DOM table on the Exam Schedule page.
 *
 * @param tableEl - The schedule table element
 */
export function enhanceScheduleTable(tableEl: HTMLTableElement): void {
    const rows = Array.from(tableEl.querySelectorAll<HTMLTableRowElement>('tbody > tr'));
    if (rows.length === 0) return;

    for (const row of rows) {
        // Skip if already enhanced
        if (row.dataset.examEnhanced === 'true') continue;
        row.dataset.examEnhanced = 'true';

        const cells = row.querySelectorAll('td');
        if (cells.length < COL_TIME) continue;

        const dateCell = cells[COL_DATE - 1];
        const timeCell = cells[COL_TIME - 1];

        const examDate = dateCell?.textContent?.trim() ?? '';
        const examTime = timeCell?.textContent?.trim() ?? '';

        if (!examDate || !examTime) continue;

        const countdown = getExamCountdown(examDate, examTime);

        // Highlight row
        const rowClass = getRowClass(countdown.urgency);
        if (rowClass) {
            row.classList.add(rowClass);
        }

        // Add badge under date
        const badge = document.createElement('div');
        badge.className = `${styles.badge} ${getBadgeClass(countdown.urgency)}`;
        badge.title = countdown.label;
        badge.textContent = countdown.shortLabel;

        dateCell.appendChild(badge);
    }
}
