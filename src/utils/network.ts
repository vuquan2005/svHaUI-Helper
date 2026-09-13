/**
 * Network Utilities
 * Handles network requests and binary array buffer fetching
 */

/**
 * Downloads a resource as an ArrayBuffer.
 *
 * @param url The target URL to download
 * @returns Promise resolving to the ArrayBuffer content
 */
export async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ArrayBuffer from ${url} (HTTP ${response.status})`);
    }
    return await response.arrayBuffer();
}
