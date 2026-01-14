/**
 * Feature Manager - Quản lý và điều phối các features
 */

import { Feature } from './feature';

class FeatureManager {
    private features: Map<string, Feature> = new Map();
    private initialized: Set<string> = new Set();

    /**
     * Đăng ký một feature mới
     */
    register(feature: Feature): void {
        if (this.features.has(feature.id)) {
            console.warn(`[FeatureManager] Feature "${feature.id}" đã được đăng ký, bỏ qua.`);
            return;
        }
        this.features.set(feature.id, feature);
        console.log(`[FeatureManager] Đã đăng ký feature: ${feature.name}`);
    }

    /**
     * Đăng ký nhiều features cùng lúc
     */
    registerAll(features: Feature[]): void {
        features.forEach((f) => this.register(f));
    }

    /**
     * Khởi chạy tất cả features phù hợp với trang hiện tại
     */
    async initAll(): Promise<void> {
        console.log('[FeatureManager] Bắt đầu khởi tạo features...');

        for (const [id, feature] of this.features) {
            if (this.initialized.has(id)) {
                continue;
            }

            if (!feature.shouldRun()) {
                console.log(`[FeatureManager] Bỏ qua feature "${feature.name}" (không match URL hoặc bị tắt)`);
                continue;
            }

            try {
                console.log(`[FeatureManager] Khởi tạo feature: ${feature.name}`);
                await feature.init();
                this.initialized.add(id);
            } catch (error) {
                console.error(`[FeatureManager] Lỗi khi khởi tạo feature "${feature.name}":`, error);
            }
        }

        console.log(`[FeatureManager] Đã khởi tạo ${this.initialized.size}/${this.features.size} features`);
    }

    /**
     * Lấy feature theo ID
     */
    get(id: string): Feature | undefined {
        return this.features.get(id);
    }

    /**
     * Lấy danh sách tất cả features
     */
    getAll(): Feature[] {
        return Array.from(this.features.values());
    }

    /**
     * Kiểm tra feature đã được khởi tạo chưa
     */
    isInitialized(id: string): boolean {
        return this.initialized.has(id);
    }
}

export const featureManager = new FeatureManager();
