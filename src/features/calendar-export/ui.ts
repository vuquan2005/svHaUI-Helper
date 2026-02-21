/**
 * Calendar Export Feature - UI Components
 * Creates the download button and semester dropdown.
 * Uses Bootstrap 3 classes already available on HaUI portal.
 */

import {
    generateSemesterOptions,
    getSemesterDateRange,
    detectCurrentSemester,
} from './semester-config';

// ============================================
// Types
// ============================================

export interface UICallbacks {
    /** Called when "Tải lịch" button is clicked */
    onDownload: () => void;
    /** Called when a semester is selected from the dropdown */
    onSemesterSelect: (semesterValue: string) => void;
}

// ============================================
// UI Creation
// ============================================

/**
 * Create the calendar export UI (download button + semester dropdown).
 */
export function createCalendarExportUI(callbacks: UICallbacks): HTMLElement {
    const container = document.createElement('div');
    container.className = 'svhaui-calendar-export';
    container.style.cssText = 'display: inline-block; margin-left: 5px; vertical-align: top;';

    // Download button
    const downloadBtn = createDownloadButton(callbacks.onDownload);
    container.appendChild(downloadBtn);

    // Semester split-button dropdown
    const semesterDropdown = createSemesterDropdown(callbacks.onSemesterSelect);
    container.appendChild(semesterDropdown);

    return container;
}

/**
 * Create the "📅 Tải lịch" download button.
 */
function createDownloadButton(onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-success';
    btn.innerHTML = '📅 Tải lịch';
    btn.title = 'Xuất thời khóa biểu đang hiển thị thành file ICS';
    btn.style.cssText = 'margin-right: 5px;';
    btn.addEventListener('click', onClick);
    return btn;
}

/**
 * Create a Bootstrap 3 split-button dropdown for semester selection.
 * Shows 5 academic years × 4 terms with emoji labels.
 *
 * Structure:
 * <div class="btn-group">
 *   <button class="btn btn-info">[current semester label]</button>
 *   <button class="btn btn-info dropdown-toggle"><span class="caret"></span></button>
 *   <ul class="dropdown-menu">
 *     <li><a>1️⃣ : 2025 - 2026</a></li>
 *     ...
 *   </ul>
 * </div>
 */
function createSemesterDropdown(onSelect: (semesterValue: string) => void): HTMLElement {
    const group = document.createElement('div');
    group.className = 'btn-group';

    const currentValue = detectCurrentSemester();
    const options = generateSemesterOptions();
    const currentOption = options.find((o) => o.value === currentValue);

    // Main button — click = select current semester
    const mainBtn = document.createElement('button');
    mainBtn.type = 'button';
    mainBtn.className = 'btn btn-info';
    mainBtn.textContent = currentOption ? `📋 ${currentOption.label}` : '📋 Xem kỳ';
    mainBtn.title = 'Chọn kỳ hiện tại';
    mainBtn.addEventListener('click', () => onSelect(currentValue));

    // Dropdown toggle (caret)
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'btn btn-info dropdown-toggle';
    toggleBtn.setAttribute('data-toggle', 'dropdown');
    toggleBtn.setAttribute('aria-haspopup', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');

    const caret = document.createElement('span');
    caret.className = 'caret';
    toggleBtn.appendChild(caret);

    // Dropdown menu
    const menu = document.createElement('ul');
    menu.className = 'dropdown-menu dropdown-menu-right';
    menu.style.cssText = 'max-height: 300px; overflow-y: auto;';

    let lastAcademicYear: number | null = null;

    for (const option of options) {
        // Add divider between academic years
        if (lastAcademicYear !== null && option.academicYear !== lastAcademicYear) {
            const divider = document.createElement('li');
            divider.className = 'divider';
            divider.setAttribute('role', 'separator');
            menu.appendChild(divider);
        }
        lastAcademicYear = option.academicYear;

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.style.cursor = 'pointer';
        a.textContent = option.label;

        // Mark current semester
        if (option.value === currentValue) {
            li.className = 'active';
        }

        a.addEventListener('click', (e) => {
            e.preventDefault();
            onSelect(option.value);
        });

        li.appendChild(a);
        menu.appendChild(li);
    }

    group.appendChild(mainBtn);
    group.appendChild(toggleBtn);
    group.appendChild(menu);

    return group;
}

// ============================================
// DOM Form Manipulation
// ============================================

/**
 * Fill the timetable filter form with semester date range and submit.
 * Triggers a full page reload.
 *
 * @param semesterValue - Encoded semester value (e.g., "20251")
 */
export function fillAndSubmitSemesterForm(semesterValue: string): void {
    const range = getSemesterDateRange(semesterValue);
    if (!range) return;

    // Fill start date
    const startD = document.querySelector<HTMLInputElement>('#ctl03_inpStartDate_d');
    const startM = document.querySelector<HTMLInputElement>('#ctl03_inpStartDate_m');
    const startY = document.querySelector<HTMLInputElement>('#ctl03_inpStartDate');
    // Fill end date
    const endD = document.querySelector<HTMLInputElement>('#ctl03_inpEndDate_d');
    const endM = document.querySelector<HTMLInputElement>('#ctl03_inpEndDate_m');
    const endY = document.querySelector<HTMLInputElement>('#ctl03_inpEndDate');

    if (!startD || !startM || !startY || !endD || !endM || !endY) return;

    startD.value = String(range.start.getDate());
    startM.value = String(range.start.getMonth() + 1);
    startY.value = String(range.start.getFullYear());

    endD.value = String(range.end.getDate());
    endM.value = String(range.end.getMonth() + 1);
    endY.value = String(range.end.getFullYear());

    // Click the native "Xem" button → triggers full page reload
    const viewBtn = document.querySelector<HTMLInputElement>('#ctl03_butGet');
    if (viewBtn) {
        viewBtn.click();
    }
}

/**
 * Read the current date range from the form inputs.
 */
export function readFormDateRange(): { start: string; end: string } | null {
    const startD = document.querySelector<HTMLInputElement>('#ctl03_inpStartDate_d');
    const startM = document.querySelector<HTMLInputElement>('#ctl03_inpStartDate_m');
    const startY = document.querySelector<HTMLInputElement>('#ctl03_inpStartDate');
    const endD = document.querySelector<HTMLInputElement>('#ctl03_inpEndDate_d');
    const endM = document.querySelector<HTMLInputElement>('#ctl03_inpEndDate_m');
    const endY = document.querySelector<HTMLInputElement>('#ctl03_inpEndDate');

    if (!startD || !startM || !startY || !endD || !endM || !endY) return null;

    const sd = startD.value.padStart(2, '0');
    const sm = startM.value.padStart(2, '0');
    const sy = startY.value;
    const ed = endD.value.padStart(2, '0');
    const em = endM.value.padStart(2, '0');
    const ey = endY.value;

    return {
        start: `${sd}/${sm}/${sy}`,
        end: `${ed}/${em}/${ey}`,
    };
}

/**
 * Try to detect semester value from the current form date range.
 * Useful for determining semesterId in export history.
 */
export function detectSemesterFromForm(): string {
    return detectCurrentSemester();
}
