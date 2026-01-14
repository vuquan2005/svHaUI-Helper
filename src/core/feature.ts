/**
 * Feature Base Class - Lớp cơ sở cho tất cả các tính năng
 * Mỗi feature kế thừa từ class này để đảm bảo cấu trúc nhất quán
 */

import { settings } from './settings';
import { createLogger, Logger } from './logger';

export interface FeatureConfig {
    id: string;
    name: string;
    description: string;
    // Regex hoặc string để match URL, nếu không set thì chạy trên mọi trang
    urlMatch?: RegExp | string;
}

export abstract class Feature {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly urlMatch?: RegExp | string;

    /** Logger tự động có prefix từ tên feature */
    protected readonly log: Logger;

    constructor(config: FeatureConfig) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.urlMatch = config.urlMatch;

        // Tự động tạo logger với prefix là tên feature
        this.log = createLogger(config.name);
    }

    /**
     * Kiểm tra xem feature có nên chạy trên URL hiện tại không
     */
    shouldRun(): boolean {
        // Kiểm tra feature có được bật không
        if (!settings.isFeatureEnabled(this.id)) {
            return false;
        }

        // Nếu không có urlMatch thì chạy trên mọi trang
        if (!this.urlMatch) {
            return true;
        }

        const currentUrl = window.location.href;

        if (typeof this.urlMatch === 'string') {
            return currentUrl.includes(this.urlMatch);
        }

        return this.urlMatch.test(currentUrl);
    }

    /**
     * Khởi tạo feature - được gọi khi feature được load
     * Override method này để thêm logic khởi tạo
     */
    abstract init(): void | Promise<void>;

    /**
     * Dọn dẹp khi feature bị disable hoặc unload
     * Override nếu cần cleanup
     */
    destroy(): void {
        // Default: không làm gì
    }
}
