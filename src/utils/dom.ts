/**
 * DOM Utilities - Utility functions for working with DOM
 */

/**
 * Result of the observation operation
 */
export type ObserveResult = {
    /** Whether the check condition was met successfully */
    success: boolean;
    /**
     * Result code:
     * - 'OK': Check passed
     * - 'TIMEOUT': Max time exceeded
     * - 'NOT_FOUND': Target element not found
     * - 'ABORT': Aborted via signal
     * - 'ERROR': Error in callback
     */
    code: 'OK' | 'TIMEOUT' | 'NOT_FOUND' | 'ABORT' | 'ERROR';
};

/**
 * Observes a DOM element for changes until a condition is met or timeout occurs.
 * Useful for waiting for dynamic content changes.
 *
 * @param target - The element to observe or a selector string
 * @param checkCallback - Function that checks the condition. Returns true to stop observing, false to continue.
 * @param options - Configuration options
 * @param options.debounceMs - Debounce time in ms for the observer callback (default: 50)
 * @param options.timeoutMs - Maximum time to wait in ms before giving up (default: 10000). Set to 0 for no timeout.
 * @param options.config - MutationObserver configuration (default: { childList: true, subtree: true })
 * @param options.signal - AbortSignal to cancel the observation
 * @returns Promise resolving to an ObserveResult object
 *
 * @example
 * ```ts
 * const result = await observeDomUntil(
 *   '#content',
 *   () => document.querySelector('.result') !== null,
 *   { timeoutMs: 5000 }
 * );
 * if (result.success) {
 *   console.log('Result found!');
 * }
 * ```
 */
export function observeDomUntil(
    target: Element | string | null,
    checkCallback: () => boolean | Promise<boolean>,
    options: {
        debounceMs?: number;
        timeoutMs?: number;
        config?: MutationObserverInit;
        signal?: AbortSignal;
    } = {}
): Promise<ObserveResult> {
    return new Promise((resolve) => {
        const element = typeof target === 'string' ? document.querySelector(target) : target;

        if (!element) {
            resolve({ success: false, code: 'NOT_FOUND' });
            return;
        }

        const {
            debounceMs = 50,
            timeoutMs = 10000,
            config = { childList: true, subtree: true },
            signal,
        } = options;

        if (signal?.aborted) {
            resolve({ success: false, code: 'ABORT' });
            return;
        }

        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
        let observer: MutationObserver | null = null;
        let done = false;

        const finish = (result: ObserveResult) => {
            if (done) return;
            done = true;

            if (debounceTimer) clearTimeout(debounceTimer);
            if (timeoutTimer) clearTimeout(timeoutTimer);

            observer?.disconnect();
            observer = null;

            signal?.removeEventListener('abort', onAbort);

            resolve(result);
        };

        const onAbort = () => finish({ success: false, code: 'ABORT' });

        signal?.addEventListener('abort', onAbort, { once: true });

        Promise.resolve(checkCallback())
            .then((ok) => {
                if (ok) finish({ success: true, code: 'OK' });
            })
            .catch((err) => {
                console.warn('observeDomUntil initial check error:', err);
                finish({ success: false, code: 'ERROR' });
            });

        if (timeoutMs > 0) {
            timeoutTimer = setTimeout(() => {
                finish({ success: false, code: 'TIMEOUT' });
            }, timeoutMs);
        }

        observer = new MutationObserver(() => {
            if (done) return;

            if (debounceTimer) clearTimeout(debounceTimer);

            debounceTimer = setTimeout(async () => {
                if (done || signal?.aborted) return;

                try {
                    const shouldStop = await checkCallback();
                    if (shouldStop) {
                        finish({ success: true, code: 'OK' });
                    }
                } catch (error) {
                    console.warn('observeDomUntil callback error:', error);
                    finish({ success: false, code: 'ERROR' });
                }
            }, debounceMs);
        });

        observer.observe(element, config);
    });
}
