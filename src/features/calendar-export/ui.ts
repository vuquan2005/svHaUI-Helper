/**
 * Calendar Export Feature - UI Components
 * Creates the download split-button, check update button, and semester dropdown.
 * Uses Bootstrap 3 classes already available on HaUI portal.
 */

import {
    generateSemesterOptions,
    getSemesterDateRange,
    detectCurrentSemester,
} from './semester-config';
import { TimetableDiff } from './types';
import { formatDateVN } from '../../utils/date';

// ============================================
// Types
// ============================================

export interface UICallbacks {
    /** Called when "📥 Tải TKB kỳ này" main button is clicked */
    onDownloadSemester: () => void;
    /** Called when "📅 Tải lịch hiện tại" dropdown item is clicked */
    onDownloadCurrent: () => void;
    /** Called when "🔄 Kiểm tra cập nhật" button is clicked */
    onCheckUpdate: () => void;
    /** Called when a semester is selected from the semester dropdown */
    onSemesterSelect: (semesterValue: string) => void;
}

/**
 * References to UI elements that the controller may need to update.
 */
export interface UIRefs {
    container: HTMLElement;
    checkUpdateBtn: HTMLButtonElement;
}

// ============================================
// UI Creation
// ============================================

/**
 * Create the calendar export UI.
 * Layout: [📥 Tải TKB kỳ này ▾] [🔄 Kiểm tra cập nhật] [📋 Kỳ... ▾]
 */
export function createCalendarExportUI(callbacks: UICallbacks): UIRefs {
    const container = document.createElement('div');
    container.className = 'svhaui-calendar-export';
    container.style.cssText = 'display: inline-block; margin-left: 5px; vertical-align: top;';

    // Download split-button
    const downloadGroup = createDownloadSplitButton(
        callbacks.onDownloadSemester,
        callbacks.onDownloadCurrent
    );
    container.appendChild(downloadGroup);

    // Check update button
    const checkUpdateBtn = createCheckUpdateButton(callbacks.onCheckUpdate);
    container.appendChild(checkUpdateBtn);

    // Semester split-button dropdown
    const semesterDropdown = createSemesterDropdown(callbacks.onSemesterSelect);
    container.appendChild(semesterDropdown);

    return { container, checkUpdateBtn };
}

// ============================================
// Download Split-Button
// ============================================

/**
 * Create a Bootstrap 3 split-button for downloading timetable.
 * Main button: "📅 Tải lịch hiển thị" (parse current DOM)
 * Dropdown item: "📥 Tải TKB kỳ này" (auto-fetch semester)
 */
function createDownloadSplitButton(
    onDownloadSemester: () => void,
    onDownloadCurrent: () => void
): HTMLElement {
    const group = document.createElement('div');
    group.className = 'btn-group';
    group.style.cssText = 'margin-right: 5px;';

    // Main button — download currently displayed timetable
    const mainBtn = document.createElement('button');
    mainBtn.type = 'button';
    mainBtn.className = 'btn btn-success';
    mainBtn.innerHTML = '📅 Tải lịch hiển thị';
    mainBtn.title = 'Xuất lịch đang hiển thị bên dưới thành file ICS';
    mainBtn.addEventListener('click', onDownloadCurrent);

    // Dropdown toggle
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'btn btn-success dropdown-toggle';
    toggleBtn.setAttribute('data-toggle', 'dropdown');
    toggleBtn.setAttribute('aria-haspopup', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');

    const caret = document.createElement('span');
    caret.className = 'caret';
    toggleBtn.appendChild(caret);

    // Dropdown menu
    const menu = document.createElement('ul');
    menu.className = 'dropdown-menu';

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.style.cursor = 'pointer';
    a.textContent = '📥 Tải TKB kỳ này';
    a.title = 'Tự động tải toàn bộ thời khóa biểu kỳ hiện tại';
    a.addEventListener('click', (e) => {
        e.preventDefault();
        onDownloadSemester();
    });
    li.appendChild(a);
    menu.appendChild(li);

    group.appendChild(mainBtn);
    group.appendChild(toggleBtn);
    group.appendChild(menu);

    return group;
}

// ============================================
// Check Update Button
// ============================================

/**
 * Create the "🔄 Kiểm tra cập nhật" button.
 * The controller can later update its text, style, and title.
 */
function createCheckUpdateButton(onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-warning';
    btn.innerHTML = '🔄 Kiểm tra cập nhật';
    btn.title = 'Kiểm tra xem thời khóa biểu có thay đổi không';
    btn.style.cssText = 'margin-right: 5px;';
    btn.addEventListener('click', onClick);
    return btn;
}

/**
 * Update the check button to show "has update" state.
 */
export function setCheckButtonState(
    btn: HTMLButtonElement,
    state: 'normal' | 'has-update' | 'checking' | 'no-update',
    lastCheckTime?: string
): void {
    // Reset classes
    btn.classList.remove('btn-warning', 'btn-danger', 'btn-info', 'btn-default');

    switch (state) {
        case 'checking':
            btn.classList.add('btn-info');
            btn.innerHTML = '⏳ Đang kiểm tra...';
            btn.disabled = true;
            break;
        case 'has-update':
            btn.classList.add('btn-danger');
            btn.innerHTML = '🔄 Có thay đổi!';
            btn.disabled = false;
            break;
        case 'no-update':
            btn.classList.add('btn-default');
            btn.innerHTML = '✅ Không có thay đổi';
            btn.disabled = false;
            // Reset back to normal after 3s
            setTimeout(() => setCheckButtonState(btn, 'normal', lastCheckTime), 3000);
            break;
        case 'normal':
        default:
            btn.classList.add('btn-warning');
            btn.innerHTML = '🔄 Kiểm tra cập nhật';
            btn.disabled = false;
            break;
    }

    // Update title with last check time
    if (lastCheckTime) {
        const dt = new Date(lastCheckTime);
        const formatted = `${formatDateVN(dt)} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
        btn.title = `Lần kiểm tra cuối: ${formatted}`;
    }
}

// ============================================
// Diff Result Display
// ============================================

/**
 * Display the diff result to the user.
 * If changes exist, prompts the user to download the updated ICS.
 *
 * @returns true if user wants to download the updated ICS file
 */
export function showDiffResult(diff: TimetableDiff): boolean {
    const parts: string[] = [];

    parts.push(`📊 Kết quả kiểm tra cập nhật TKB:\n`);

    if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
        parts.push('✅ Không có thay đổi nào.');
        alert(parts.join('\n'));
        return false;
    }

    if (diff.added.length > 0) {
        parts.push(`➕ Thêm mới (${diff.added.length}):`);
        for (const e of diff.added) {
            parts.push(`  • ${e.date} - ${e.course} (${e.classCode})`);
        }
    }
    if (diff.removed.length > 0) {
        parts.push(`\n➖ Đã xoá (${diff.removed.length}):`);
        for (const e of diff.removed) {
            parts.push(`  • ${e.date} - ${e.course} (${e.classCode})`);
        }
    }
    if (diff.changed.length > 0) {
        parts.push(`\n🔄 Thay đổi (${diff.changed.length}):`);
        for (const c of diff.changed) {
            parts.push(`  • ${c.new.date} - ${c.new.course} (${c.new.classCode})`);
        }
    }
    parts.push(`\n📌 Không đổi: ${diff.unchanged} mục`);
    parts.push(`\nBạn có muốn tải file ICS mới không?`);

    return confirm(parts.join('\n'));
}

// ============================================
// Semester Dropdown (mostly unchanged)
// ============================================

/**
 * Create a Bootstrap 3 split-button dropdown for semester selection.
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
