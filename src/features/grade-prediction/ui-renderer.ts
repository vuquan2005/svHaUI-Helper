import { GradeStore } from './grade-store';
import { GRADE_COLORS, CREDITS_COLORS } from './config';
import styles from './style.module.scss';

const PREFIX = styles.cssPrefix;

export class UIRenderer {
    private store: GradeStore;
    private gridContainer: HTMLElement;
    private cardEl: HTMLElement | null = null;
    private unsubscribe: (() => void) | null = null;

    constructor(store: GradeStore, gridContainer: HTMLElement, _mainTable: HTMLTableElement) {
        this.store = store;
        this.gridContainer = gridContainer;
    }

    /**
     * Mount UI components and subscribe to store
     */
    mount(): void {
        this.renderPredictionCard();
        this.bindTableEvents();
        this.updateTableCells();

        this.unsubscribe = this.store.subscribe(() => {
            this.updatePredictionCard();
            this.updateTableCells();
        });
    }

    /**
     * Unmount and clean up
     */
    unmount(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.cardEl?.remove();
    }

    /**
     * Render main Prediction Card containing integrated controls
     */
    private renderPredictionCard(): void {
        this.cardEl?.remove();

        const card = document.createElement('div');
        card.className = `${PREFIX}-card`;

        card.innerHTML = `
            <div class="${PREFIX}-card-header">
                <div class="${PREFIX}-card-title-group">
                    <h4 class="${PREFIX}-card-title" title="Dự đoán & Mục tiêu điểm GPA tốt nghiệp">
                        <span>📊</span>
                        <span>Dự đoán & Mục tiêu GPA</span>
                    </h4>
                    <span id="prediction-status-badge"></span>
                </div>
                <div class="${PREFIX}-card-actions">
                    <button type="button" class="${PREFIX}-btn ${PREFIX}-btn-primary" id="btn-toggle-edit" title="Bật/Tắt chế độ sửa điểm giả lập">
                        <span id="btn-edit-icon">✏️</span>
                        <span id="btn-edit-text">Giả lập</span>
                    </button>
                    <button type="button" class="${PREFIX}-btn ${PREFIX}-btn-secondary" id="btn-reset-edits" style="display: none;" title="Khôi phục toàn bộ điểm gốc">
                        <span>↺</span>
                        <span>Khôi phục</span>
                    </button>
                    <button type="button" class="${PREFIX}-btn ${PREFIX}-btn-secondary" id="btn-clear-selection" style="display: none;" title="Bỏ chọn các môn đang chọn">
                        <span>✕</span>
                        <span id="btn-clear-selection-text">Bỏ chọn</span>
                    </button>
                </div>
            </div>
            <div class="${PREFIX}-card-body">
                <div class="${PREFIX}-section">
                    <div class="${PREFIX}-section-title">Tiến độ & Điểm số</div>
                    <div class="${PREFIX}-stat-grid" id="stat-grid-container">
                        <!-- Fixed 2x2 grid -->
                    </div>
                </div>
                <div class="${PREFIX}-section">
                    <div class="${PREFIX}-section-title">Mục tiêu tốt nghiệp</div>
                    <div class="${PREFIX}-target-list" id="target-list-container">
                        <!-- Target projections -->
                    </div>
                </div>
            </div>
        `;

        const btnToggleEdit = card.querySelector('#btn-toggle-edit') as HTMLButtonElement;
        btnToggleEdit.addEventListener('click', () => {
            this.store.toggleEditMode();
        });

        const btnReset = card.querySelector('#btn-reset-edits') as HTMLButtonElement;
        btnReset.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn khôi phục lại toàn bộ điểm gốc?')) {
                this.store.resetAllEdits();
            }
        });

        const btnClearSelection = card.querySelector('#btn-clear-selection') as HTMLButtonElement;
        btnClearSelection.addEventListener('click', () => {
            this.store.clearSelection();
        });

        this.gridContainer.appendChild(card);
        this.cardEl = card;
        this.updatePredictionCard();
    }

    /**
     * Update Prediction Card data & controls
     */
    private updatePredictionCard(): void {
        if (!this.cardEl) return;

        const prediction = this.store.getPrediction();
        const statGrid = this.cardEl.querySelector('#stat-grid-container');
        const targetList = this.cardEl.querySelector('#target-list-container');
        const statusBadge = this.cardEl.querySelector('#prediction-status-badge');

        const btnToggleEdit = this.cardEl.querySelector('#btn-toggle-edit') as HTMLButtonElement;
        const btnEditIcon = this.cardEl.querySelector('#btn-edit-icon');
        const btnEditText = this.cardEl.querySelector('#btn-edit-text');
        const btnReset = this.cardEl.querySelector('#btn-reset-edits') as HTMLElement;
        const btnClearSelection = this.cardEl.querySelector('#btn-clear-selection') as HTMLElement;
        const btnClearText = this.cardEl.querySelector('#btn-clear-selection-text');

        // Update button states
        if (this.store.isEditMode) {
            btnToggleEdit.classList.add('active');
            if (btnEditIcon) btnEditIcon.textContent = '📝';
            if (btnEditText) btnEditText.textContent = 'Đang giả lập';
        } else {
            btnToggleEdit.classList.remove('active');
            if (btnEditIcon) btnEditIcon.textContent = '✏️';
            if (btnEditText) btnEditText.textContent = 'Giả lập';
        }

        if (btnReset) {
            btnReset.style.display = this.store.isEdited ? 'inline-flex' : 'none';
        }

        if (btnClearSelection) {
            btnClearSelection.style.display = this.store.hasSelection ? 'inline-flex' : 'none';
            if (btnClearText) {
                btnClearText.textContent = `Bỏ chọn (${this.store.selectedCount})`;
            }
        }

        if (statusBadge) {
            if (prediction.isEdited) {
                statusBadge.innerHTML = `<span style="font-size: 11px; font-weight: 600; color: #f59e0b; background: rgba(245, 158, 11, 0.15); padding: 2px 8px; border-radius: 4px;" title="Dữ liệu đang được giả lập">⚡ Giả lập</span>`;
            } else {
                statusBadge.innerHTML = `<span style="font-size: 11px; font-weight: 500; color: #94a3b8;" title="Dữ liệu gốc từ trường">✓ Gốc</span>`;
            }
        }

        // Render fixed 2x2 stats grid
        if (statGrid) {
            // 1. GPA Tích lũy (Gốc)
            const origGPAValue = prediction.originalSummary.gpa.toFixed(2);
            const origGPASub = `Xếp loại: <strong>${prediction.originalSummary.classification}</strong>`;

            // 2. Tín chỉ Tích lũy
            const currentAccCredits = prediction.isEdited
                ? prediction.simulatedSummary.totalAccumulatedCredits
                : prediction.originalSummary.totalAccumulatedCredits;
            const creditsValue = `${currentAccCredits} <span style="font-size: 14px; font-weight: normal; color: #94a3b8;">/</span> <input type="number" id="input-target-credits" class="${PREFIX}-inline-credit-input" min="50" max="250" value="${prediction.totalTargetCredits}" title="Tổng số tín chỉ CTĐT (nhấp để sửa)">`;
            const creditsSub = `Còn lại: <strong>${prediction.remainingCredits}</strong> tín`;

            // 3. GPA Giả lập
            let simValue = '--';
            let simSub = 'Chưa sửa điểm';
            let simClass = 'empty';
            let simTooltip = 'GPA sau giả lập và số môn đã sửa điểm';

            if (prediction.isEdited && prediction.editedOnlySummary) {
                simValue = prediction.simulatedSummary.gpa.toFixed(2);
                simSub = `${prediction.editedOnlySummary.courseCount} môn (${prediction.editedOnlySummary.totalAccumulatedCredits} tín) • ${prediction.simulatedSummary.classification}`;
                simClass = 'simulated';
                simTooltip = `GPA sau giả lập: ${prediction.simulatedSummary.gpa.toFixed(2)} | Đã sửa: ${prediction.editedOnlySummary.courseCount} môn (${prediction.editedOnlySummary.totalAccumulatedCredits} tín) | ĐTB môn sửa: ${prediction.editedOnlySummary.gpa.toFixed(2)}`;
            }

            // 4. Môn đã chọn
            let selValue = '--';
            let selSub = 'Chưa chọn môn';
            let selClass = 'empty';
            let selTooltip = 'Điểm TB các môn chọn ở cột STT';

            if (prediction.hasSelection && prediction.selectedOnlySummary) {
                selValue = prediction.selectedOnlySummary.gpa.toFixed(2);
                selSub = `${prediction.selectedOnlySummary.courseCount} môn (${prediction.selectedOnlySummary.totalAccumulatedCredits} tín) • ${prediction.selectedOnlySummary.classification}`;
                selClass = 'selected';
                selTooltip = `ĐTB môn chọn: ${prediction.selectedOnlySummary.gpa.toFixed(2)} (${prediction.selectedOnlySummary.classification}) | ${prediction.selectedOnlySummary.courseCount} môn (${prediction.selectedOnlySummary.totalAccumulatedCredits} tín)`;
            }

            statGrid.innerHTML = `
                <div class="${PREFIX}-stat-item" title="GPA tích lũy chính thức hệ 4">
                    <div class="${PREFIX}-stat-item-label">GPA Tích lũy</div>
                    <div class="${PREFIX}-stat-item-value highlight">
                        ${origGPAValue}
                    </div>
                    <div class="${PREFIX}-stat-item-sub">
                        ${origGPASub}
                    </div>
                </div>
                <div class="${PREFIX}-stat-item" title="Số tín chỉ đã tích lũy / Tổng số tín chỉ CTĐT">
                    <div class="${PREFIX}-stat-item-label">Tín chỉ tích lũy</div>
                    <div class="${PREFIX}-stat-item-value">
                        ${creditsValue}
                    </div>
                    <div class="${PREFIX}-stat-item-sub">
                        ${creditsSub}
                    </div>
                </div>
                <div class="${PREFIX}-stat-item" title="${simTooltip}">
                    <div class="${PREFIX}-stat-item-label">GPA Giả lập</div>
                    <div class="${PREFIX}-stat-item-value ${simClass}">
                        ${simValue}
                    </div>
                    <div class="${PREFIX}-stat-item-sub">
                        ${simSub}
                    </div>
                </div>
                <div class="${PREFIX}-stat-item" title="${selTooltip}">
                    <div class="${PREFIX}-stat-item-label">Môn đã chọn</div>
                    <div class="${PREFIX}-stat-item-value ${selClass}">
                        ${selValue}
                    </div>
                    <div class="${PREFIX}-stat-item-sub">
                        ${selSub}
                    </div>
                </div>
            `;

            // Attach input event for target credits
            const inputCredits = statGrid.querySelector(
                '#input-target-credits'
            ) as HTMLInputElement | null;
            if (inputCredits) {
                inputCredits.addEventListener('change', () => {
                    const val = parseInt(inputCredits.value, 10);
                    if (!isNaN(val) && val > 0) {
                        this.store.setTotalTargetCredits(val);
                    }
                });
                inputCredits.addEventListener('click', (e) => e.stopPropagation());
                inputCredits.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === 'Enter') inputCredits.blur();
                });
            }
        }

        if (targetList) {
            targetList.innerHTML = prediction.targets
                .map((t) => {
                    let valDisplay: string;
                    let valClass: string;

                    if (t.status === 'no_remaining_credits') {
                        valDisplay = 'Hết tín chỉ';
                        valClass = 'impossible';
                    } else if (t.status === 'impossible') {
                        valDisplay = `Không khả thi (≥ ${t.requiredAverage?.toFixed(2)})`;
                        valClass = 'impossible';
                    } else if (t.requiredAverage === 0) {
                        valDisplay = '✓ Đã đạt';
                        valClass = 'exceeded';
                    } else {
                        valDisplay = `Cần TB ≥ ${t.requiredAverage?.toFixed(2)}`;
                        valClass = 'achievable';
                    }

                    if (t.isCustom) {
                        return `
                            <div class="${PREFIX}-target-item" title="GPA mục tiêu tùy chỉnh">
                                <span class="${PREFIX}-target-item-name">
                                    <span>🎯 Tùy chỉnh:</span>
                                    <input type="number" step="0.05" min="1.0" max="4.0" id="input-custom-target" class="${PREFIX}-target-item-input" value="${this.store.customTargetGPA.toFixed(2)}" title="Nhập GPA mục tiêu (1.0 - 4.0)">
                                </span>
                                <span class="${PREFIX}-target-item-val ${valClass}">${valDisplay}</span>
                            </div>
                        `;
                    }

                    return `
                        <div class="${PREFIX}-target-item" title="Mục tiêu tốt nghiệp loại ${t.label}">
                            <span class="${PREFIX}-target-item-name">${t.label}</span>
                            <span class="${PREFIX}-target-item-val ${valClass}">${valDisplay}</span>
                        </div>
                    `;
                })
                .join('');

            // Attach event listener to custom target GPA input
            const inputCustom = targetList.querySelector(
                '#input-custom-target'
            ) as HTMLInputElement | null;
            if (inputCustom) {
                inputCustom.addEventListener('change', () => {
                    const val = parseFloat(inputCustom.value);
                    if (!isNaN(val) && val >= 0 && val <= 4.0) {
                        this.store.setCustomTargetGPA(val);
                    }
                });
                inputCustom.addEventListener('click', (e) => e.stopPropagation());
                inputCustom.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === 'Enter') inputCustom.blur();
                });
            }
        }
    }

    /**
     * Bind DOM events for table cells
     */
    private bindTableEvents(): void {
        this.store.rows.forEach((row) => {
            // Click STT / indexCell to toggle row selection for semester GPA calculation
            row.indexCell.classList.add(`${PREFIX}-index-cell`);
            row.indexCell.title = 'Chọn môn (tính GPA riêng)';
            row.indexCell.addEventListener('click', () => {
                this.store.toggleCourseSelection(row.id);
            });

            // Click credit cell to toggle non-credit
            row.creditCell.classList.add(`${PREFIX}-credit-badge`);
            row.creditCell.addEventListener('click', (e) => {
                e.stopPropagation();
                this.store.toggleCourseNonCredit(row.id);
            });

            // Prevent browser red spellcheck underline on grade cells
            row.gradeCell.setAttribute('spellcheck', 'false');
            row.gradeCell.setAttribute('autocorrect', 'off');
            row.gradeCell.setAttribute('autocapitalize', 'off');

            // Edit grade cell on focus/blur
            row.gradeCell.addEventListener('focus', () => {
                if (this.store.isEditMode && row.currentGrade) {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(row.gradeCell);
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                }
            });

            row.gradeCell.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    row.gradeCell.blur();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    row.gradeCell.textContent = row.currentGrade || '';
                    row.gradeCell.blur();
                }
            });

            row.gradeCell.addEventListener('blur', () => {
                const text = row.gradeCell.textContent?.trim() || '';
                if (text === '') {
                    this.store.updateCourseGrade(row.id, '');
                } else {
                    const success = this.store.updateCourseGrade(row.id, text);
                    if (!success) {
                        row.gradeCell.textContent = row.currentGrade || '';
                    }
                }
            });
        });
    }

    /**
     * Update styling and values for table cells
     */
    private updateTableCells(): void {
        const isEditMode = this.store.isEditMode;

        this.store.rows.forEach((row) => {
            // Selection row styling
            if (row.isSelected) {
                row.element.classList.add(`${PREFIX}-row-selected`);
            } else {
                row.element.classList.remove(`${PREFIX}-row-selected`);
            }

            // 1. Credit cell & non-credit row dimming
            if (row.isNonCredit) {
                row.element.style.opacity = '0.6';
                row.creditCell.style.backgroundColor = '';
                row.creditCell.style.color = '';
                row.creditCell.style.fontWeight = '';
                row.creditCell.title = 'Môn không tính GPA (nhấp để bật)';
            } else {
                row.element.style.opacity = '';
                const creditKey = row.credits.toFixed(1);
                const creditColor =
                    CREDITS_COLORS[creditKey] ||
                    CREDITS_COLORS[row.credits.toString()] ||
                    '#64748b';
                row.creditCell.style.backgroundColor = creditColor;
                row.creditCell.style.color = '#ffffff';
                row.creditCell.style.fontWeight = 'bold';
                row.creditCell.title = 'Môn tính GPA (nhấp để tắt)';
            }

            // 2. Grade letter cell update
            if (row.currentGrade) {
                row.gradeCell.textContent = row.currentGrade;

                const gradeColor = GRADE_COLORS[row.currentGrade];
                if (gradeColor && !row.isNonCredit) {
                    row.gradeCell.style.backgroundColor = gradeColor.bg;
                    row.gradeCell.style.color = gradeColor.text;
                    row.gradeCell.style.fontWeight = 'bold';
                } else {
                    row.gradeCell.style.backgroundColor = '';
                    row.gradeCell.style.color = '';
                    row.gradeCell.style.fontWeight = '';
                }
            } else {
                row.gradeCell.textContent = '';
                row.gradeCell.style.backgroundColor = '';
                row.gradeCell.style.color = '';
                row.gradeCell.style.fontWeight = '';
            }

            // 3. Score4 cell update
            if (row.currentScore4 !== null) {
                row.score4Cell.textContent = row.currentScore4.toFixed(1);
            } else {
                row.score4Cell.textContent = '';
            }

            // 4. Edited indicator
            if (row.isEdited) {
                row.gradeCell.classList.add(`${PREFIX}-cell-edited`);
                row.score4Cell.classList.add(`${PREFIX}-score4-edited`);
            } else {
                row.gradeCell.classList.remove(`${PREFIX}-cell-edited`);
                row.score4Cell.classList.remove(`${PREFIX}-score4-edited`);
            }

            // 5. Edit mode contenteditable
            if (isEditMode && !row.isNonCredit) {
                row.gradeCell.setAttribute('contenteditable', 'true');
                row.gradeCell.setAttribute('spellcheck', 'false');
                row.gradeCell.classList.add(`${PREFIX}-cell-editable`);
                row.gradeCell.title = 'Nhấp để sửa điểm';
            } else {
                row.gradeCell.setAttribute('contenteditable', 'false');
                row.gradeCell.classList.remove(`${PREFIX}-cell-editable`);
                row.gradeCell.title = '';
            }
        });
    }
}
