/**
 * DOM Utilities - Các hàm tiện ích làm việc với DOM
 */

import { GM_addStyle } from '$';

/**
 * Chờ cho đến khi element xuất hiện trong DOM
 */
export function waitForElement<T extends Element>(
    selector: string,
    timeout = 10000
): Promise<T | null> {
    return new Promise((resolve) => {
        // Kiểm tra ngay nếu element đã tồn tại
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

        // Timeout
        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}

/**
 * Tạo element từ HTML string
 */
export function createElementFromHTML<T extends Element>(html: string): T {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild as T;
}

/**
 * Thêm CSS vào trang
 */
export function addStyles(css: string): void {
    GM_addStyle(css);
}

/**
 * Query selector với type safety
 */
export function $(selector: string, parent: ParentNode = document): Element | null {
    return parent.querySelector(selector);
}

/**
 * Query selector all với type safety
 */
export function $$(selector: string, parent: ParentNode = document): Element[] {
    return Array.from(parent.querySelectorAll(selector));
}
