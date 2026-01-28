/**
 * Survey Autofill Feature
 * Allows quick evaluation by clicking on the table headers (1-5)
 */

import { Feature } from '@/core';
import styles from './style.module.scss';

export class SurveyAutofillFeature extends Feature {
    constructor() {
        super({
            id: 'survey-autofill',
            name: 'Survey Autofill',
            description: 'Đánh giá nhanh bằng cách click vào tiêu đề cột điểm',
            urlMatch: /^\/survey\/view/,
        });
    }

    run(): void {
        this.waitForTable();
    }

    /**
     * Wait for table to be available in DOM
     */
    private waitForTable() {
        const check = () => {
            const table = document.querySelector('div#kbox.modal-content table.table-striped');
            if (table) {
                this.log.d('Attached click listeners to survey headers: ', table);
                this.attachListeners(table);
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    }

    private attachListeners(table: Element) {
        const headerRow = table.querySelector('thead > tr:nth-child(2)');
        if (!headerRow) {
            this.log.w('Header row not found');
            return;
        }

        const cells = headerRow.querySelectorAll('td');
        if (cells.length < 5) {
            this.log.w('Not enough header cells found');
            return;
        }

        headerRow.classList.add(styles.cssPrefix);

        cells.forEach((cell, index) => {
            const score = index + 1;

            cell.title = `Click để chọn tất cả mục ${score} điểm`;

            cell.addEventListener('click', () => {
                this.fillColumn(table, score);
            });
        });

        this.log.d('Attached click listeners to survey headers');
    }

    private fillColumn(table: Element, score: number) {
        const selector = `input[type="radio"][id$="_${score}"]`;
        const radios = table.querySelectorAll(selector);

        let count = 0;
        radios.forEach((radio) => {
            if (radio instanceof HTMLInputElement) {
                radio.click();
                radio.checked = true;
                count++;
            } else this.log.w('Radio not found');
        });

        this.log.d(`Selected score ${score} for ${count} questions`);
    }
}
