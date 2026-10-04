/**
 * Export Exam Feature - UI Components
 * Creates download and update buttons for both exam pages.
 * Uses Bootstrap 3 classes already available on HaUI portal.
 */

import './style.scss';

// ============================================
// Types
// ============================================

export interface ExamUICallbacks {
    onDownloadExam: () => void;
    onForceUpdate?: () => void;
}

/**
 * References to UI elements the controller may need to update.
 */
export interface ExamUIRefs {
    container: HTMLElement;
    downloadBtn: HTMLButtonElement;
    updateBtn?: HTMLButtonElement;
    statusText?: HTMLSpanElement;
}

// ============================================
// Button States
// ============================================

export type DownloadBtnState = 'ready' | 'loading' | 'no-data' | 'downloading';
export type UpdateBtnState = 'ready' | 'updating' | 'done' | 'error';

// ============================================
// UI Creation
// ============================================

/**
 * Create the export exam UI for the Exam Plan page.
 * Layout: [📥 Tải lịch thi] [🔄 Cập nhật dữ liệu]
 */
export function createExamPlanUI(callbacks: ExamUICallbacks): ExamUIRefs {
    const container = document.createElement('div');
    container.className = 'sv-exam-container';

    const downloadBtn = createDownloadButton(callbacks.onDownloadExam);
    container.appendChild(downloadBtn);

    let updateBtn: HTMLButtonElement | undefined;
    if (callbacks.onForceUpdate) {
        updateBtn = createUpdateButton(callbacks.onForceUpdate);
        container.appendChild(updateBtn);
    }

    const statusText = document.createElement('span');
    statusText.className = 'text-muted small';
    statusText.style.cssText = 'line-height: 30px; margin-left: 5px;';
    container.appendChild(statusText);

    return { container, downloadBtn, updateBtn, statusText };
}

/**
 * Create the export exam UI for the Exam Schedule page.
 * Layout: [📥 Tải lịch thi]
 */
export function createExamScheduleUI(callbacks: ExamUICallbacks): ExamUIRefs {
    const container = document.createElement('div');
    container.className = 'sv-exam-schedule-container';

    const downloadBtn = createDownloadButton(callbacks.onDownloadExam);
    container.appendChild(downloadBtn);

    const statusText = document.createElement('span');
    statusText.className = 'text-muted small';
    statusText.style.cssText = 'line-height: 30px; margin-left: 5px;';
    container.appendChild(statusText);

    return { container, downloadBtn, statusText };
}

// ============================================
// Individual Buttons
// ============================================

/**
 * Create the "📥 Tải lịch thi" download button.
 */
function createDownloadButton(onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary btn-sm';
    btn.innerHTML = '📥 Tải lịch thi';
    btn.addEventListener('click', onClick);
    return btn;
}

/**
 * Create the "🔄 Cập nhật dữ liệu" force update button.
 */
function createUpdateButton(onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-default btn-sm';
    btn.innerHTML = '🔄 Cập nhật dữ liệu';
    btn.addEventListener('click', onClick);
    return btn;
}

// ============================================
// State Updates
// ============================================

/**
 * Update the download button state.
 */
export function setDownloadBtnState(btn: HTMLButtonElement, state: DownloadBtnState): void {
    btn.disabled = state === 'loading' || state === 'downloading';

    switch (state) {
        case 'ready':
            btn.innerHTML = '📥 Tải lịch thi';
            btn.className = 'btn btn-primary btn-sm';
            break;
        case 'loading':
            btn.innerHTML = '⏳ Đang tải dữ liệu...';
            btn.className = 'btn btn-default btn-sm';
            break;
        case 'no-data':
            btn.innerHTML = '📥 Tải lịch thi (cần cập nhật)';
            btn.className = 'btn btn-warning btn-sm';
            break;
        case 'downloading':
            btn.innerHTML = '⏳ Đang tạo file...';
            btn.className = 'btn btn-default btn-sm';
            break;
    }
}

/**
 * Update the force update button state.
 */
export function setUpdateBtnState(btn: HTMLButtonElement, state: UpdateBtnState): void {
    btn.disabled = state === 'updating';

    switch (state) {
        case 'ready':
            btn.innerHTML = '🔄 Cập nhật dữ liệu';
            btn.className = 'btn btn-default btn-sm';
            break;
        case 'updating':
            btn.innerHTML = '⏳ Đang cập nhật...';
            btn.className = 'btn btn-default btn-sm';
            break;
        case 'done':
            btn.innerHTML = '✅ Đã cập nhật';
            btn.className = 'btn btn-success btn-sm';
            break;
        case 'error':
            btn.innerHTML = '❌ Lỗi cập nhật';
            btn.className = 'btn btn-danger btn-sm';
            break;
    }
}

/**
 * Update the status text message.
 */
export function setStatusText(span: HTMLSpanElement, text: string): void {
    span.textContent = text;
}
