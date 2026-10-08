/**
 * Thesis Registration Feature - Network Fetcher
 * Handles fetching topics for lecturers via ASP.NET WebForms postbacks
 */

import { createLogger } from '@/core';
import { toAbsoluteUrl } from '@/utils';
import { extractTopicsFromHtml } from './parser';
import { FormTokens, Lecturer, LecturerTopicGroup, ThesisTopic } from './types';

const log = createLogger('ThesisFetcher');

declare const cloneInto: (<T>(obj: T, targetScope: unknown) => T) | undefined;

interface WindowWithWrapped extends Window {
    wrappedJSObject?: {
        fetch: typeof window.fetch;
    };
}

/**
 * Executes a fetch request in the page's own security context when running in Firefox,
 * ensuring the Origin header is "https://sv.haui.edu.vn" and all session cookies are sent.
 */
async function doFetch(targetUrl: string, body: string, signal?: AbortSignal): Promise<Response> {
    const rawOptions = {
        method: 'POST',
        credentials: 'include' as const,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        body,
    };

    // If running in Firefox content script, use the page window's fetch via wrappedJSObject
    // so the browser sets Origin: https://sv.haui.edu.vn instead of moz-extension://...
    const pageWindow =
        typeof window !== 'undefined'
            ? (window as unknown as WindowWithWrapped).wrappedJSObject
            : undefined;

    if (typeof cloneInto === 'function' && pageWindow?.fetch) {
        try {
            const clonedOptions = cloneInto(rawOptions, pageWindow);
            return await pageWindow.fetch(targetUrl, clonedOptions);
        } catch (e) {
            log.w('[fetcher] wrappedJSObject.fetch failed, falling back to standard fetch:', e);
        }
    }

    return await fetch(targetUrl, {
        ...rawOptions,
        signal,
    });
}

/**
 * Fetches the topics for a single lecturer via simulated ASP.NET postback.
 */
export async function fetchTopicsForLecturer(
    lecturer: Lecturer,
    tokens: FormTokens,
    signal?: AbortSignal
): Promise<ThesisTopic[]> {
    const params = new URLSearchParams();

    // ASP.NET PostBack parameters - exact 7 fields matching native HaUI browser request
    params.set('__EVENTTARGET', tokens.lecturerFieldName);
    params.set('__EVENTARGUMENT', '');
    params.set('__LASTFOCUS', '');
    params.set('__VIEWSTATE', tokens.viewState);

    if (tokens.viewStateGen) {
        params.set('__VIEWSTATEGENERATOR', tokens.viewStateGen);
    } else {
        params.set('__VIEWSTATEGENERATOR', 'CA0B0334');
    }

    if (tokens.eventValidation) {
        params.set('__EVENTVALIDATION', tokens.eventValidation);
    }

    // Extra hidden inputs (if any exist)
    for (const [key, value] of Object.entries(tokens.extraHiddenFields)) {
        if (!params.has(key)) {
            params.set(key, value);
        }
    }

    // Dropdown values for the target lecturer
    params.set(tokens.lecturerFieldName, lecturer.id);
    params.set(tokens.topicFieldName, '0');

    const targetUrl = toAbsoluteUrl(tokens.actionUrl);
    log.i(`[fetcher] 🚀 Gửi POST tới ${targetUrl} cho GV "${lecturer.name}" (id=${lecturer.id})`);

    const response = await doFetch(targetUrl, params.toString(), signal);

    if (!response.ok) {
        log.e(
            `[fetcher] ❌ Lỗi HTTP ${response.status} ${response.statusText} khi lấy đề tài của GV "${lecturer.name}"`
        );
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    // Detect if server redirected to an error page (e.g. /Error.html)
    if (response.redirected && response.url.includes('Error')) {
        log.e(
            `[fetcher] ❌ Server trả về lỗi và redirect tới: ${response.url} (Server ASP.NET từ chối request POST)`
        );
        throw new Error(`Server redirected to error page: ${response.url}`);
    }

    const html = await response.text();

    if (html.includes('Có lỗi trong quá trình xử lý') || html.includes('aspxerrorpath')) {
        log.e(
            `[fetcher] ❌ Nội dung trả về chứa trang lỗi ASP.NET (Error.html) cho GV "${lecturer.name}"`
        );
        return [];
    }

    const topics = extractTopicsFromHtml(html, lecturer);
    log.i(
        `[fetcher] ✅ Đã lấy ${topics.length} đề tài của GV "${lecturer.name}" (body length: ${html.length})`
    );

    if (topics.length === 0) {
        log.w(`[fetcher] ⚠️ 0 đề tài cho GV "${lecturer.name}". Kiểm tra nhanh HTML:`, {
            responseUrl: response.url,
            redirected: response.redirected,
            hasDeTaiSelect: html.includes('ddlDeTai'),
            htmlSnippet: html.slice(0, 300),
        });
    }

    return topics;
}

/**
 * Fetches topics for all lecturers using an asynchronous concurrency pool.
 * Calls onProgress after each lecturer finishes.
 */
export async function fetchAllLecturersTopics(
    lecturers: Lecturer[],
    tokens: FormTokens,
    onProgress?: (loaded: number, total: number, group: LecturerTopicGroup) => void,
    signal?: AbortSignal,
    concurrency = 3
): Promise<LecturerTopicGroup[]> {
    log.i(
        `[fetcher] 📋 Bắt đầu pool tải đề tài cho ${lecturers.length} giảng viên (concurrency=${concurrency})...`
    );

    const results: LecturerTopicGroup[] = lecturers.map((lecturer) => ({
        lecturer,
        topics: [],
        status: 'pending',
    }));

    let loadedCount = 0;
    let nextIndex = 0;

    async function worker(workerId: number) {
        while (nextIndex < lecturers.length) {
            if (signal?.aborted) {
                log.w(`[fetcher] [Worker #${workerId}] Bị hủy bởi AbortSignal`);
                break;
            }

            const index = nextIndex++;
            const group = results[index];
            group.status = 'loading';
            log.d(
                `[fetcher] [Worker #${workerId}] Bắt đầu lấy (${index + 1}/${lecturers.length}): ${group.lecturer.name}`
            );

            try {
                const topics = await fetchTopicsForLecturer(group.lecturer, tokens, signal);
                group.topics = topics;
                group.status = 'success';
            } catch (err) {
                if (signal?.aborted) return;
                group.status = 'error';
                group.error = err instanceof Error ? err.message : String(err);
                log.e(
                    `[fetcher] [Worker #${workerId}] ❌ Thất bại khi lấy dữ liệu GV "${group.lecturer.name}":`,
                    err
                );
            }

            loadedCount++;
            onProgress?.(loadedCount, lecturers.length, group);
        }
    }

    const workerCount = Math.min(concurrency, lecturers.length);
    const workers = Array.from({ length: workerCount }, (_, i) => worker(i + 1));
    await Promise.all(workers);

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;
    log.i(
        `[fetcher] 🏁 Hoàn tất: ${successCount} thành công, ${errorCount} lỗi trên tổng số ${lecturers.length} GV`
    );

    return results;
}
