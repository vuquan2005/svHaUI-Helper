/**
 * DOM Utilities - Utility functions for working with DOM
 */

import { GM_addStyle } from '$';

/**
 * Wait until element appears in DOM
 */
export function waitForElement<T extends Element>(
    selector: string,
    timeout = 10000
): Promise<T | null> {
    return new Promise((resolve) => {
        const existing = document.querySelector<T>(selector);
        if (existing) {
            resolve(existing);
            return;
        }

        const observer = new MutationObserver((_, obs) => {
            const element = document.querySelector<T>(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}

/**
 * Create element from HTML string
 */
export function createElementFromHTML<T extends Element>(html: string): T {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild as T;
}

/**
 * Add CSS to page
 */
export function addStyles(css: string): void {
    GM_addStyle(css);
}
