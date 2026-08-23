/**
 * Network Utilities
 * Handles cross-origin network requests and binary array buffer fetching
 */

import { GM, GM_xmlhttpRequest } from '$';

/**
 * Downloads a resource as an ArrayBuffer, using GM_xmlhttpRequest if available to bypass CORS restrictions.
 *
 * @param url The target URL to download
 * @returns Promise resolving to the ArrayBuffer content
 */
export async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
    const gmXhr =
        (typeof GM_xmlhttpRequest === 'function' ? GM_xmlhttpRequest : undefined) ??
        (typeof GM !== 'undefined' && typeof GM?.xmlHttpRequest === 'function'
            ? GM.xmlHttpRequest
            : undefined) ??
        (typeof window !== 'undefined' &&
        typeof (window as unknown as { GM_xmlhttpRequest?: typeof GM_xmlhttpRequest })
            .GM_xmlhttpRequest === 'function'
            ? (window as unknown as { GM_xmlhttpRequest: typeof GM_xmlhttpRequest })
                  .GM_xmlhttpRequest
            : undefined) ??
        (typeof window !== 'undefined' &&
        typeof (window as unknown as { GM?: { xmlHttpRequest?: typeof GM_xmlhttpRequest } }).GM
            ?.xmlHttpRequest === 'function'
            ? (window as unknown as { GM: { xmlHttpRequest: typeof GM_xmlhttpRequest } }).GM
                  .xmlHttpRequest
            : undefined);

    if (gmXhr) {
        return new Promise((resolve, reject) => {
            gmXhr({
                method: 'GET',
                url,
                responseType: 'arraybuffer',
                onload: (res) => {
                    if (res.status >= 200 && res.status < 300 && res.response) {
                        resolve(res.response as ArrayBuffer);
                    } else {
                        reject(
                            new Error(
                                `Failed to fetch ArrayBuffer from ${url} (HTTP ${res.status})`
                            )
                        );
                    }
                },
                onerror: (err) =>
                    reject(
                        new Error(
                            `Network error fetching ArrayBuffer from ${url}: ${err.error ?? 'Unknown'}`
                        )
                    ),
            });
        });
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ArrayBuffer from ${url} (HTTP ${response.status})`);
    }
    return await response.arrayBuffer();
}
