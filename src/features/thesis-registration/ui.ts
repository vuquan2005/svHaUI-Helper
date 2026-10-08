/**
 * Thesis Registration Feature - UI Component
 */

import { exportTopicsToCsv, formatTopicsForClipboard, parseTopicName } from './parser';
import { LecturerTopicGroup, ThesisTopic, ThesisViewMode, TopicMemberInfo } from './types';

export interface UIOptions {
    onRefresh: () => void;
    onSelectTopic?: (topic: ThesisTopic) => void;
}

export class ThesisRegistrationUI {
    private container: HTMLElement;
    private options: UIOptions;
    private groups: LecturerTopicGroup[] = [];
    private searchQuery = '';
    private selectedLecturerId = 'all';
    private viewMode: ThesisViewMode = 'table';
    private isLoading = false;
    private progress = { loaded: 0, total: 0 };

    constructor(options: UIOptions) {
        this.options = options;
        this.container = document.createElement('div');
        this.container.className = 'sv-thesis-card';
    }

    /**
     * Mounts the container after the registration form panel.
     */
    mount(targetElement: Element): void {
        if (targetElement.nextSibling) {
            targetElement.parentNode?.insertBefore(this.container, targetElement.nextSibling);
        } else {
            targetElement.parentNode?.appendChild(this.container);
        }
        this.render();
    }

    /**
     * Removes the container from DOM.
     */
    destroy(): void {
        this.container.remove();
    }

    /**
     * Updates loading progress and re-renders progress bar / content.
     */
    updateProgress(loaded: number, total: number, latestGroup?: LecturerTopicGroup): void {
        this.isLoading = loaded < total;
        this.progress = { loaded, total };

        if (latestGroup) {
            const existingIndex = this.groups.findIndex(
                (g) => g.lecturer.id === latestGroup.lecturer.id
            );
            if (existingIndex >= 0) {
                this.groups[existingIndex] = latestGroup;
            } else {
                this.groups.push(latestGroup);
            }
        }

        this.render();
    }

    /**
     * Updates full groups dataset.
     */
    setGroups(groups: LecturerTopicGroup[]): void {
        this.groups = groups;
        this.isLoading = false;
        this.render();
    }

    /**
     * Sets loading state.
     */
    setLoading(loading: boolean, total = 0): void {
        this.isLoading = loading;
        this.progress = { loaded: 0, total };
        this.render();
    }

    /**
     * Main render function
     */
    private render(): void {
        const allTopics = this.getAllTopics();
        const filteredTopics = this.getFilteredTopics();
        const filteredGroups = this.getFilteredGroups();

        this.container.innerHTML = `
            <div class="sv-thesis-card-header">
                <div class="sv-thesis-card-title-group">
                    <h4 class="sv-thesis-card-title" title="Danh sách Đề tài & Giảng viên hướng dẫn">
                        <span>📚</span>
                        <span>Đề tài & Giảng viên hướng dẫn</span>
                    </h4>
                    <span class="sv-thesis-stats-badge">
                        ${this.groups.length} Giảng viên · ${allTopics.length} Đề tài
                    </span>
                </div>
                <div class="sv-thesis-card-actions">
                    <button type="button" class="sv-btn sv-btn-secondary" id="sv-thesis-btn-refresh" title="Tải lại danh sách đề tài mới nhất">
                        <span>🔄</span>
                        <span>${this.isLoading ? 'Đang tải...' : 'Làm mới'}</span>
                    </button>
                    <button type="button" class="sv-btn sv-btn-secondary" id="sv-thesis-btn-copy" ${allTopics.length === 0 ? 'disabled' : ''} title="Sao chép danh sách vào bộ nhớ tạm">
                        <span>📋</span>
                        <span>Sao chép</span>
                    </button>
                    <button type="button" class="sv-btn sv-btn-secondary" id="sv-thesis-btn-export" ${allTopics.length === 0 ? 'disabled' : ''} title="Xuất danh sách ra file CSV">
                        <span>💾</span>
                        <span>Xuất CSV</span>
                    </button>
                </div>
            </div>

            <div class="sv-thesis-card-body">
                ${
                    this.isLoading
                        ? `
                <div class="sv-thesis-progress-container">
                    <div class="sv-thesis-progress-text">
                        <span>Đang tải đề tài từ cổng đào tạo...</span>
                        <span>${this.progress.loaded} / ${this.progress.total} giảng viên</span>
                    </div>
                    <div class="sv-thesis-progress-bar">
                        <div class="sv-thesis-progress-fill" style="width: ${
                            this.progress.total > 0
                                ? Math.round((this.progress.loaded / this.progress.total) * 100)
                                : 0
                        }%"></div>
                    </div>
                </div>
                `
                        : ''
                }

                <div class="sv-thesis-toolbar">
                    <div class="sv-thesis-search-wrap">
                        <span class="sv-thesis-search-icon">🔍</span>
                        <input 
                            type="text" 
                            class="sv-thesis-search-input" 
                            placeholder="Tìm theo tên đề tài hoặc giảng viên..." 
                            value="${this.escapeHtml(this.searchQuery)}"
                            id="sv-thesis-search-input"
                        />
                        ${
                            this.searchQuery
                                ? `<button type="button" class="sv-thesis-search-clear" id="sv-thesis-search-clear" title="Xóa tìm kiếm">✕</button>`
                                : ''
                        }
                    </div>

                    <div class="sv-thesis-filter-wrap">
                        <select class="sv-thesis-select-filter" id="sv-thesis-select-filter" title="Lọc theo giảng viên">
                            <option value="all" ${this.selectedLecturerId === 'all' ? 'selected' : ''}>
                                Tất cả giảng viên (${this.groups.length})
                            </option>
                            ${this.groups
                                .map(
                                    (g) => `
                                <option value="${g.lecturer.id}" ${this.selectedLecturerId === g.lecturer.id ? 'selected' : ''}>
                                    ${this.escapeHtml(g.lecturer.name)} (${g.topics.length})
                                </option>
                            `
                                )
                                .join('')}
                        </select>

                        <div class="sv-thesis-view-toggle">
                            <button type="button" class="sv-thesis-toggle-btn ${this.viewMode === 'table' ? 'active' : ''}" data-mode="table" title="Chế độ xem bảng">
                                Bảng
                            </button>
                            <button type="button" class="sv-thesis-toggle-btn ${this.viewMode === 'grouped' ? 'active' : ''}" data-mode="grouped" title="Chế độ gom nhóm theo giảng viên">
                                Theo GV
                            </button>
                        </div>
                    </div>
                </div>

                <div class="sv-thesis-content">
                    ${
                        this.viewMode === 'table'
                            ? this.renderTableView(filteredTopics)
                            : this.renderGroupedView(filteredGroups)
                    }
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Renders table view
     */
    private renderTableView(topics: ThesisTopic[]): string {
        if (topics.length === 0) {
            return `
                <div class="sv-thesis-empty">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-title">Không tìm thấy đề tài nào</div>
                    <div class="empty-desc">
                        ${this.searchQuery ? 'Thử tìm với từ khóa khác' : 'Chưa có đề tài nào được công bố'}
                    </div>
                </div>
            `;
        }

        return `
            <div class="sv-thesis-table-container">
                <table class="sv-thesis-table">
                    <thead>
                        <tr>
                            <th class="col-stt">STT</th>
                            <th class="col-lecturer">Giảng viên hướng dẫn</th>
                            <th class="col-topic">Tên đề tài đồ án/khóa luận</th>
                            <th class="col-action">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topics
                            .map((t, idx) => {
                                const parsed = parseTopicName(t.name);
                                const badgeHtml = this.renderMemberBadge(parsed.memberInfo);
                                return `
                            <tr>
                                <td class="col-stt">${idx + 1}</td>
                                <td class="col-lecturer">${this.escapeHtml(t.lecturerName)}</td>
                                <td class="col-topic" title="${this.escapeHtml(t.name)}">${this.escapeHtml(parsed.cleanName)}</td>
                                <td class="col-action">
                                    <div class="sv-thesis-action-cell">
                                        ${badgeHtml}
                                        <button 
                                            type="button" 
                                            class="sv-btn sv-btn-primary sv-btn-sm btn-select-topic" 
                                            data-lecturer-id="${t.lecturerId}" 
                                            data-topic-id="${t.id}"
                                        >
                                            Chọn đề tài
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                            })
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Renders grouped cards view
     */
    private renderGroupedView(groups: LecturerTopicGroup[]): string {
        if (groups.length === 0) {
            return `
                <div class="sv-thesis-empty">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-title">Không tìm thấy giảng viên/đề tài nào</div>
                </div>
            `;
        }

        return `
            <div class="sv-thesis-grid">
                ${groups
                    .map(
                        (g) => `
                    <div class="sv-thesis-lecturer-card">
                        <div class="sv-thesis-lecturer-card-header">
                            <span class="sv-thesis-lecturer-card-name">${this.escapeHtml(g.lecturer.name)}</span>
                            <span class="sv-thesis-lecturer-card-badge ${g.topics.length === 0 ? 'empty' : ''}">
                                ${g.topics.length} đề tài
                            </span>
                        </div>
                        <ul class="sv-thesis-lecturer-card-topics">
                            ${
                                g.topics.length > 0
                                    ? g.topics
                                          .map((t) => {
                                              const parsed = parseTopicName(t.name);
                                              const badgeHtml = this.renderMemberBadge(
                                                  parsed.memberInfo
                                              );
                                              return `
                                    <li class="sv-thesis-card-topic-item">
                                        <span class="topic-text" title="${this.escapeHtml(t.name)}">${this.escapeHtml(parsed.cleanName)}</span>
                                        <div class="sv-thesis-card-topic-actions">
                                            ${badgeHtml}
                                            <button 
                                                type="button" 
                                                class="sv-btn sv-btn-primary sv-btn-sm btn-select-topic" 
                                                data-lecturer-id="${t.lecturerId}" 
                                                data-topic-id="${t.id}"
                                            >
                                                Chọn
                                            </button>
                                        </div>
                                    </li>
                                `;
                                          })
                                          .join('')
                                    : `<li class="empty-topics-msg">Chưa có đề tài nào</li>`
                            }
                        </ul>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;
    }

    /**
     * Renders member count badge (e.g. 2/3) next to the select button.
     */
    private renderMemberBadge(memberInfo: TopicMemberInfo | null): string {
        if (!memberInfo) return '';
        const { current, isFull, raw } = memberInfo;
        const statusClass = isFull
            ? 'sv-topic-badge--full'
            : current > 0
              ? 'sv-topic-badge--partial'
              : 'sv-topic-badge--empty';

        const tooltip = isFull ? `Đã đủ thành viên (${raw})` : `Số lượng thành viên: ${raw}`;

        return `<span class="sv-topic-badge ${statusClass}" title="${this.escapeHtml(tooltip)}">${this.escapeHtml(raw)}</span>`;
    }

    /**
     * Attaches interactive DOM listeners
     */
    private attachEventListeners(): void {
        // Refresh button
        const refreshBtn = this.container.querySelector('#sv-thesis-btn-refresh');
        refreshBtn?.addEventListener('click', () => {
            if (!this.isLoading) {
                this.options.onRefresh();
            }
        });

        // Copy button
        const copyBtn = this.container.querySelector('#sv-thesis-btn-copy');
        copyBtn?.addEventListener('click', () => {
            const filtered = this.getFilteredTopics();
            if (filtered.length === 0) return;
            const text = formatTopicsForClipboard(filtered);
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    this.showToast(`Đã sao chép ${filtered.length} đề tài vào bộ nhớ tạm`);
                })
                .catch(() => {
                    this.showToast('Không thể sao chép vào bộ nhớ tạm');
                });
        });

        // Export button
        const exportBtn = this.container.querySelector('#sv-thesis-btn-export');
        exportBtn?.addEventListener('click', () => {
            const filtered = this.getFilteredTopics();
            if (filtered.length === 0) return;
            const csv = exportTopicsToCsv(filtered);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Danh_sach_de_tai_DAKLTN_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showToast(`Đã tải xuống file CSV (${filtered.length} đề tài)`);
        });

        // Search input
        const searchInput =
            this.container.querySelector<HTMLInputElement>('#sv-thesis-search-input');
        searchInput?.addEventListener('input', (e) => {
            this.searchQuery = (e.target as HTMLInputElement).value;
            this.updateContentOnly();
        });

        // Clear search button
        const clearBtn = this.container.querySelector('#sv-thesis-search-clear');
        clearBtn?.addEventListener('click', () => {
            this.searchQuery = '';
            this.render();
        });

        // Lecturer filter select
        const lecturerFilter = this.container.querySelector<HTMLSelectElement>(
            '#sv-thesis-select-filter'
        );
        lecturerFilter?.addEventListener('change', (e) => {
            this.selectedLecturerId = (e.target as HTMLSelectElement).value;
            this.updateContentOnly();
        });

        // View mode toggle
        const toggleButtons = this.container.querySelectorAll<HTMLButtonElement>(
            '.sv-thesis-view-toggle .sv-thesis-toggle-btn'
        );
        toggleButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode as ThesisViewMode;
                if (mode && mode !== this.viewMode) {
                    this.viewMode = mode;
                    this.render();
                }
            });
        });

        // Select topic buttons
        this.container.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest<HTMLButtonElement>(
                '.btn-select-topic'
            );
            if (!target) return;

            const lecturerId = target.dataset.lecturerId;
            const topicId = target.dataset.topicId;

            if (lecturerId && topicId) {
                const topic = this.findTopic(lecturerId, topicId);
                if (topic) {
                    this.handleSelectTopic(topic);
                }
            }
        });
    }

    /**
     * Updates only content area and clear button without re-rendering entire header/toolbar
     */
    private updateContentOnly(): void {
        const content = this.container.querySelector('.sv-thesis-content');
        if (content) {
            const filteredTopics = this.getFilteredTopics();
            const filteredGroups = this.getFilteredGroups();
            content.innerHTML =
                this.viewMode === 'table'
                    ? this.renderTableView(filteredTopics)
                    : this.renderGroupedView(filteredGroups);
        }

        const searchWrap = this.container.querySelector('.sv-thesis-search-wrap');
        const clearBtn = this.container.querySelector('#sv-thesis-search-clear');
        if (this.searchQuery && !clearBtn && searchWrap) {
            const newClear = document.createElement('button');
            newClear.type = 'button';
            newClear.className = 'sv-thesis-search-clear';
            newClear.id = 'sv-thesis-search-clear';
            newClear.textContent = '✕';
            newClear.addEventListener('click', () => {
                this.searchQuery = '';
                this.render();
            });
            searchWrap.appendChild(newClear);
        } else if (!this.searchQuery && clearBtn) {
            clearBtn.remove();
        }
    }

    /**
     * Handles selecting a topic and syncing it with the page's original form
     */
    private handleSelectTopic(topic: ThesisTopic): void {
        // 1. Fill into the native dropdowns
        this.syncDropdowns(topic);

        // 2. Highlight registration panel and scroll
        const regPanel =
            document.querySelector('#ctl03_pnlRegistration .dakltn-reg-selects') ||
            document.querySelector('#ctl03_pnlRegistration');

        if (regPanel) {
            regPanel.classList.remove('sv-highlight-selected');
            // Trigger reflow to restart animation
            void (regPanel as HTMLElement).offsetWidth;
            regPanel.classList.add('sv-highlight-selected');
            regPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // 3. Show toast notification
        const parsed = parseTopicName(topic.name);
        this.showToast(`Đã chọn: ${parsed.cleanName} (GV: ${topic.lecturerName})`);

        // 4. Callback
        this.options.onSelectTopic?.(topic);
    }

    /**
     * Safely synchronizes lecturer and topic dropdowns on HaUI portal without triggering full postback
     */
    private syncDropdowns(topic: ThesisTopic): void {
        const gvSelect =
            document.querySelector<HTMLSelectElement>('#ctl03_ddlGiangVien') ||
            document.querySelector<HTMLSelectElement>('select[name$="ddlGiangVien"]');
        const dtSelect =
            document.querySelector<HTMLSelectElement>('#ctl03_ddlDeTai') ||
            document.querySelector<HTMLSelectElement>('select[name$="ddlDeTai"]');

        if (gvSelect) {
            // Set value directly without triggering inline onchange postback
            gvSelect.value = topic.lecturerId;

            // Update Select2 container if present
            const gvContainer = document.querySelector('#select2-ctl03_ddlGiangVien-container');
            if (gvContainer) {
                gvContainer.textContent = topic.lecturerName;
                gvContainer.setAttribute('title', topic.lecturerName);
            }
        }

        if (dtSelect) {
            // Ensure topic option exists in select
            let optionExists = false;
            for (let i = 0; i < dtSelect.options.length; i++) {
                if (dtSelect.options[i].value === topic.id) {
                    optionExists = true;
                    break;
                }
            }

            if (!optionExists) {
                const opt = document.createElement('option');
                opt.value = topic.id;
                opt.textContent = topic.name;
                dtSelect.appendChild(opt);
            }

            dtSelect.value = topic.id;

            // Update Select2 container if present
            const dtContainer = document.querySelector('#select2-ctl03_ddlDeTai-container');
            if (dtContainer) {
                dtContainer.textContent = topic.name;
                dtContainer.setAttribute('title', topic.name);
            }
        }

        // If jQuery is on window, update Select2 internals safely
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const $ = (window as any).$ || (window as any).jQuery;
            if (typeof $ === 'function') {
                if (gvSelect) $(gvSelect).trigger('change.select2');
                if (dtSelect) $(dtSelect).trigger('change.select2');
            }
        } catch {
            // Ignore if jQuery not directly accessible
        }
    }

    /**
     * Displays a temporary toast notification
     */
    private showToast(message: string): void {
        const existing = document.querySelector('.sv-thesis-toast');
        existing?.remove();

        const toast = document.createElement('div');
        toast.className = 'sv-thesis-toast';
        toast.innerHTML = `<span class="toast-icon">✅</span><span>${this.escapeHtml(message)}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3500);
    }

    private getAllTopics(): ThesisTopic[] {
        return this.groups.flatMap((g) => g.topics);
    }

    private getFilteredTopics(): ThesisTopic[] {
        const query = this.searchQuery.toLowerCase().trim();
        return this.getAllTopics().filter((topic) => {
            if (this.selectedLecturerId !== 'all' && topic.lecturerId !== this.selectedLecturerId) {
                return false;
            }
            if (!query) return true;
            return (
                topic.name.toLowerCase().includes(query) ||
                topic.lecturerName.toLowerCase().includes(query) ||
                topic.id.toLowerCase().includes(query)
            );
        });
    }

    private getFilteredGroups(): LecturerTopicGroup[] {
        const query = this.searchQuery.toLowerCase().trim();
        return this.groups
            .filter((g) => {
                if (
                    this.selectedLecturerId !== 'all' &&
                    g.lecturer.id !== this.selectedLecturerId
                ) {
                    return false;
                }
                return true;
            })
            .map((g) => {
                if (!query) return g;
                const filteredTopics = g.topics.filter(
                    (t) =>
                        t.name.toLowerCase().includes(query) ||
                        t.lecturerName.toLowerCase().includes(query) ||
                        t.id.toLowerCase().includes(query)
                );
                return {
                    ...g,
                    topics: filteredTopics,
                };
            })
            .filter((g) => {
                // If searching, only keep groups that have matching topics or lecturer name matches
                if (!query) return true;
                return g.topics.length > 0 || g.lecturer.name.toLowerCase().includes(query);
            });
    }

    private findTopic(lecturerId: string, topicId: string): ThesisTopic | undefined {
        const group = this.groups.find((g) => g.lecturer.id === lecturerId);
        return group?.topics.find((t) => t.id === topicId);
    }

    private escapeHtml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
