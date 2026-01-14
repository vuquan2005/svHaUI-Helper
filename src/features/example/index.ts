/**
 * Example Feature - Mẫu để tạo feature mới
 * Copy folder này và đổi tên để tạo feature mới
 */

import { Feature } from '../../core';
import { addStyles, createLogger } from '../../utils';

const log = createLogger('Example');

// CSS cho feature này
const styles = `
  .example-feature-badge {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    z-index: 9999;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .example-feature-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  }
`;

export class ExampleFeature extends Feature {
    private badgeElement: HTMLElement | null = null;

    constructor() {
        super({
            id: 'example',
            name: 'Example Feature',
            description: 'Đây là feature mẫu để tham khảo cách tạo feature mới',
            // Chỉ chạy trên trang chủ (comment out để chạy mọi trang)
            // urlMatch: /sv\.haui\.edu\.vn\/?$/,
        });
    }

    init(): void {
        log.i('Initializing...');

        // Thêm CSS
        addStyles(styles);

        // Tạo badge element
        this.badgeElement = document.createElement('div');
        this.badgeElement.className = 'example-feature-badge';
        this.badgeElement.textContent = '🚀 SV HaUI Helper đang hoạt động!';
        this.badgeElement.onclick = () => {
            alert('Hello from SV HaUI Helper!\n\nĐây là example feature.');
        };

        document.body.appendChild(this.badgeElement);

        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            if (this.badgeElement) {
                this.badgeElement.style.opacity = '0';
                this.badgeElement.style.transition = 'opacity 0.5s';
                setTimeout(() => this.badgeElement?.remove(), 500);
            }
        }, 5000);
    }

    destroy(): void {
        this.badgeElement?.remove();
        this.badgeElement = null;
    }
}
