/**
 * Download Utilities - Trigger file downloads in the browser.
 */

/**
 * Trigger a file download in the browser by creating a temporary Blob URL.
 *
 * @param content - File content as string
 * @param filename - Suggested filename
 * @param mimeType - MIME type for the Blob (e.g. 'text/calendar;charset=utf-8')
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}
