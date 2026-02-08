/**
 * OpenCV Loader Utility
 * Handles async loading and initialization of OpenCV.js WASM runtime
 */

import cv from '@techstark/opencv-js';

/** Timeout for OpenCV loading (ms) */
const TIMEOUT_MS = 10000;

/** Polling interval when waiting for OpenCV (ms) */
const POLL_INTERVAL_MS = 100;

/**
 * Check if OpenCV is fully loaded and ready to use
 */
export function isOpenCVReady(): boolean {
    return !!(cv && cv.Mat && typeof cv.Mat === 'function');
}

/**
 * Wait for OpenCV.js to be fully loaded and WASM runtime initialized
 * @returns Promise that resolves when OpenCV is ready
 * @throws Error if OpenCV fails to load within timeout
 */
export function waitForOpenCV(): Promise<void> {
    return new Promise((resolve, reject) => {
        // Check if already fully loaded
        if (isOpenCVReady()) {
            return resolve();
        }

        let attempts = 0;
        const maxAttempts = TIMEOUT_MS / POLL_INTERVAL_MS;

        // Try onRuntimeInitialized callback if cv exists
        if (cv && typeof cv.onRuntimeInitialized !== 'undefined') {
            const originalCallback = cv.onRuntimeInitialized;
            cv.onRuntimeInitialized = () => {
                if (originalCallback) originalCallback();
                resolve();
            };
        }

        // Polling fallback
        const interval = setInterval(() => {
            attempts++;

            if (isOpenCVReady()) {
                clearInterval(interval);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                reject(new Error(`OpenCV failed to load after ${TIMEOUT_MS}ms`));
            }
        }, POLL_INTERVAL_MS);
    });
}
