/**
 * Thesis Registration Feature
 * Shows all graduation thesis/project topics for all lecturers directly on the page,
 * eliminating the need for full page reloads for each lecturer selection.
 */

import { Feature } from '@/core';
import { observeDomUntil } from '@/utils/dom';
import { fetchAllLecturersTopics } from './fetcher';
import { extractFormTokens, extractLecturers, extractTopics } from './parser';
import { LecturerTopicGroup, ThesisStorageData, ThesisTopic } from './types';
import { ThesisRegistrationUI } from './ui';
import './style.scss';

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache

export class ThesisRegistrationFeature extends Feature<ThesisStorageData> {
    private ui: ThesisRegistrationUI | null = null;
    private abortController: AbortController | null = null;

    constructor() {
        super({
            id: 'thesis-registration',
            name: 'Tra cứu Đề tài ĐA/KLTN',
            description:
                'Hiển thị danh sách đề tài của tất cả giảng viên mà không cần tải lại trang',
            urlMatch: /^\/register\/dangkyDAKLTN/i,
        });
    }

    async run(): Promise<void> {
        this.log.i(
            `[ThesisRegistration] 🚀 Khởi chạy feature trên URL: ${window.location.pathname}${window.location.search}`
        );
        this.abortController = new AbortController();

        const container =
            document.querySelector('#frmMain') ||
            document.querySelector('.be-content') ||
            document.body;

        this.log.i('[ThesisRegistration] Đang quan sát DOM để chờ dropdown giảng viên...', {
            containerTag: container?.tagName,
            containerId: container?.id,
        });

        const result = await observeDomUntil(
            container,
            () => {
                const gvSelect = document.querySelector<HTMLSelectElement>(
                    '#ctl03_ddlGiangVien, select[name$="ddlGiangVien"]'
                );
                return !!gvSelect && gvSelect.options.length > 0;
            },
            {
                signal: this.abortController.signal,
                timeoutMs: 10000,
            }
        );

        if (!result.success) {
            this.log.w(
                `[ThesisRegistration] ❌ Không tìm thấy select giảng viên sau timeout (mã: ${result.code})`,
                {
                    currentUrl: window.location.href,
                    gvSelect: document.querySelector(
                        '#ctl03_ddlGiangVien, select[name$="ddlGiangVien"]'
                    ),
                    dtSelect: document.querySelector('#ctl03_ddlDeTai, select[name$="ddlDeTai"]'),
                    pnlRegistration: document.querySelector(
                        '#ctl03_pnlRegistration, div[id$="pnlRegistration"]'
                    ),
                    form: document.querySelector('#frmMain') || document.forms[0],
                }
            );
            return;
        }

        this.log.i(
            '[ThesisRegistration] ✅ Đã phát hiện dropdown giảng viên trong DOM, tiến hành init()...'
        );
        this.init();
    }

    private async init(): Promise<void> {
        const gvSelect =
            document.querySelector<HTMLSelectElement>('#ctl03_ddlGiangVien') ||
            document.querySelector<HTMLSelectElement>('select[name$="ddlGiangVien"]');
        const dtSelect =
            document.querySelector<HTMLSelectElement>('#ctl03_ddlDeTai') ||
            document.querySelector<HTMLSelectElement>('select[name$="ddlDeTai"]');
        const form =
            document.querySelector<HTMLFormElement>('#frmMain') ||
            gvSelect?.closest('form') ||
            document.forms[0];
        const pnlRegistration =
            document.querySelector('#ctl03_pnlRegistration') ||
            document.querySelector('div[id$="pnlRegistration"]') ||
            gvSelect?.closest('div.panel, form, table, .col-md-12') ||
            form;

        this.log.i('[ThesisRegistration] Kiểm tra các phần tử DOM:', {
            pnlFound: !!pnlRegistration,
            pnlTag: pnlRegistration?.tagName,
            gvFound: !!gvSelect,
            gvName: gvSelect?.getAttribute('name'),
            dtFound: !!dtSelect,
            dtName: dtSelect?.getAttribute('name'),
            formFound: !!form,
            formAction: form?.getAttribute('action') || (form as HTMLFormElement)?.action,
        });

        if (!pnlRegistration || !gvSelect || !form) {
            this.log.w('[ThesisRegistration] ❌ Thiếu phần tử bắt buộc trong DOM', {
                hasPnl: !!pnlRegistration,
                hasGv: !!gvSelect,
                hasForm: !!form,
            });
            return;
        }

        const lecturers = extractLecturers(gvSelect);
        this.log.i(
            `[ThesisRegistration] 👥 Bóc tách được ${lecturers.length} giảng viên:`,
            lecturers.slice(0, 5)
        );

        if (lecturers.length === 0) {
            this.log.w('[ThesisRegistration] ⚠️ Dropdown giảng viên không có lựa chọn hợp lệ nào');
            return;
        }

        const gvOnchange = gvSelect.getAttribute('onchange');
        this.log.i(
            '[ThesisRegistration] Thuộc tính onchange của Dropdown giảng viên:',
            gvOnchange ?? '(none)'
        );

        // Check if current DOM already has topics for the currently selected lecturer
        const currentLecturerId = gvSelect.value;
        let currentDomTopics: ThesisTopic[] = [];
        if (currentLecturerId && currentLecturerId !== '0' && dtSelect) {
            const currentLecturer = lecturers.find((l) => l.id === currentLecturerId);
            if (currentLecturer) {
                currentDomTopics = extractTopics(dtSelect, currentLecturer);
                this.log.i(
                    `[ThesisRegistration] 📌 Tìm thấy ${currentDomTopics.length} đề tài có sẵn trong DOM cho GV hiện tại ("${currentLecturer.name}")`
                );
            }
        }

        // Initialize UI
        this.ui = new ThesisRegistrationUI({
            onRefresh: async () => {
                this.log.i(
                    '[ThesisRegistration] 🔄 Người dùng bấm "Làm mới" -> Xóa cache và fetch lại từ đầu'
                );
                await this.storage.delete('cacheTimestamp');
                await this.storage.delete('groups');
                await this.fetchFreshData(lecturers, form, currentLecturerId, currentDomTopics);
            },
            onSelectTopic: (topic) => {
                this.log.d(`[ThesisRegistration] Đã chọn đề tài: ${topic.id} - ${topic.name}`);
            },
        });

        this.ui.mount(pnlRegistration);
        this.log.i('[ThesisRegistration] 🎨 Đã mount UI widget vào giao diện trang');

        // Check cached data
        try {
            const cachedTimestamp = (await this.storage.get('cacheTimestamp', 0)) ?? 0;
            const cachedGroups = (await this.storage.get('groups', [])) ?? [];

            const isCacheFresh = Date.now() - cachedTimestamp < CACHE_DURATION_MS;
            const matchesCurrentLecturers =
                cachedGroups.length > 0 &&
                lecturers.every((l) => cachedGroups.some((g) => g.lecturer.id === l.id));

            this.log.i('[ThesisRegistration] Trạng thái cache trong storage:', {
                cachedTimestamp: cachedTimestamp
                    ? new Date(cachedTimestamp).toLocaleTimeString()
                    : 'none',
                isCacheFresh,
                cachedCount: cachedGroups.length,
                matchesCurrentLecturers,
            });

            if (isCacheFresh && matchesCurrentLecturers) {
                this.log.i(
                    '⚡ [ThesisRegistration] Khôi phục dữ liệu từ Cache (không gửi request mạng). Bấm "Làm mới" trên widget để fetch lại.'
                );
                this.ui.setGroups(cachedGroups);
                return;
            }
        } catch (e) {
            this.log.w('[ThesisRegistration] Lỗi khi đọc cache', e);
        }

        // Fetch fresh data
        await this.fetchFreshData(lecturers, form, currentLecturerId, currentDomTopics);
    }

    private async fetchFreshData(
        lecturers: ReturnType<typeof extractLecturers>,
        form: HTMLFormElement,
        currentLecturerId?: string,
        currentDomTopics: ThesisTopic[] = []
    ): Promise<void> {
        if (!this.ui) return;

        this.ui.setLoading(true, lecturers.length);

        const formTokens = extractFormTokens(form);
        this.log.i('[ThesisRegistration] 🔑 FormTokens trích xuất được:', {
            actionUrl: formTokens.actionUrl,
            viewStateLength: formTokens.viewState.length,
            hasGen: !!formTokens.viewStateGen,
            hasValidation: !!formTokens.eventValidation,
            lecturerField: formTokens.lecturerFieldName,
            topicField: formTokens.topicFieldName,
            extraKeys: Object.keys(formTokens.extraHiddenFields),
            totalBaseControls: formTokens.baseFormData
                ? Object.keys(formTokens.baseFormData).length
                : 0,
            baseControlNames: formTokens.baseFormData ? Object.keys(formTokens.baseFormData) : [],
            submitButtonsExcluded: formTokens.submitButtonNames ?? [],
        });

        // Prepare initial groups with current lecturer pre-populated if available
        const initialGroups: LecturerTopicGroup[] = lecturers.map((lecturer) => {
            if (
                currentLecturerId &&
                lecturer.id === currentLecturerId &&
                currentDomTopics.length > 0
            ) {
                return {
                    lecturer,
                    topics: currentDomTopics,
                    status: 'success',
                };
            }
            return {
                lecturer,
                topics: [],
                status: 'pending',
            };
        });

        // Filter lecturers that actually need fetching
        const lecturersToFetch = lecturers.filter(
            (l) => !(currentLecturerId && l.id === currentLecturerId && currentDomTopics.length > 0)
        );

        this.log.i(
            `[ThesisRegistration] Tổng GV: ${lecturers.length}, Đã có sẵn: ${lecturers.length - lecturersToFetch.length}, Cần fetch: ${lecturersToFetch.length}`
        );

        const loadedCount = lecturers.length - lecturersToFetch.length;
        if (loadedCount > 0) {
            this.ui.updateProgress(loadedCount, lecturers.length);
        }

        try {
            await fetchAllLecturersTopics(
                lecturersToFetch,
                formTokens,
                (loaded, _total, latestGroup) => {
                    const groupIndex = initialGroups.findIndex(
                        (g) => g.lecturer.id === latestGroup.lecturer.id
                    );
                    if (groupIndex >= 0) {
                        initialGroups[groupIndex] = latestGroup;
                    }
                    this.ui?.updateProgress(loadedCount + loaded, lecturers.length, latestGroup);
                },
                this.abortController?.signal,
                3
            );

            this.ui.setGroups(initialGroups);

            // Save to storage cache
            await this.storage.set('cacheTimestamp', Date.now());
            await this.storage.set('groups', initialGroups);

            this.log.i(
                `[ThesisRegistration] 🎉 Hoàn thành tải và lưu cache cho ${initialGroups.length} giảng viên`
            );
        } catch (err) {
            this.log.e('[ThesisRegistration] ❌ Lỗi nghiêm trọng khi fetch topics:', err);
            this.ui.setLoading(false);
        }
    }

    cleanup(): void {
        this.abortController?.abort();
        this.abortController = null;
        this.ui?.destroy();
        this.ui = null;
    }
}
