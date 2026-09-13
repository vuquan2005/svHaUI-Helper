/**
 * Captcha Solver Service
 * Runs PP-OCRv4 model inference in an extension execution environment (Offscreen or Background)
 */

import { OcrRecognizer } from './ocr-recognizer';

let sharedRecognizer: OcrRecognizer | null = null;

export function getSharedOcrRecognizer(): OcrRecognizer {
    if (!sharedRecognizer) {
        sharedRecognizer = new OcrRecognizer({
            log: {
                d: (...args) => console.log('[OCR Solver]', ...args),
                e: (...args) => console.error('[OCR Solver]', ...args),
            },
        });
    }
    return sharedRecognizer;
}

/**
 * Loads an image from a Data URL and performs OCR inference
 *
 * @param dataUrl - Base64 data URL of the image
 * @returns Recognized text
 */
export async function solveCaptchaFromDataUrl(dataUrl: string): Promise<string> {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = dataUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Canvas 2D context not available');
    }
    ctx.drawImage(img, 0, 0);

    const recognizer = getSharedOcrRecognizer();
    try {
        return await recognizer.recognize(canvas);
    } finally {
        canvas.width = 0;
        canvas.height = 0;
    }
}
