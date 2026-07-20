/**
 * Network Utilities
 * Handles cross-origin network requests and binary array buffer fetching
 */

import { GM_xmlhttpRequest } from '$';

/**
 * Downloads a resource as an ArrayBuffer, using GM_xmlhttpRequest if available to bypass CORS restrictions.
 *
 * @param url The target URL to download
 * @returns Promise resolving to the ArrayBuffer content
 */
export async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
    if (typeof GM_xmlhttpRequest === 'function') {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
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
