/**
 * Type-safe GM storage wrapper
 */

import { GM_getValue, GM_setValue, GM_deleteValue, GM_listValues } from '$';
import type { StorageSchema } from '@/types';

class StorageManager {
    // ============================================
    // Type-safe methods (for known schema keys)
    // ============================================

    get<K extends keyof StorageSchema>(key: K, defaultValue?: StorageSchema[K]): StorageSchema[K] {
        return GM_getValue(key, defaultValue as StorageSchema[K]);
    }

    set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): void {
        GM_setValue(key, value);
    }

    remove<K extends keyof StorageSchema>(key: K): void {
        GM_deleteValue(key);
    }

    keys(): (keyof StorageSchema)[] {
        return GM_listValues() as (keyof StorageSchema)[];
    }

    // ============================================
    // Raw methods (for dynamic keys like settings)
    // ============================================

    /**
     * Get value with any key (for dynamic settings)
     */
    getRaw<T>(key: string, defaultValue?: T): T | undefined {
        return GM_getValue(key, defaultValue);
    }

    /**
     * Set value with any key (for dynamic settings)
     */
    setRaw<T>(key: string, value: T): void {
        GM_setValue(key, value);
    }

    /**
     * Remove value with any key
     */
    removeRaw(key: string): void {
        GM_deleteValue(key);
    }

    /**
     * Get all keys (raw)
     */
    allKeys(): string[] {
        return GM_listValues();
    }
}

export const storage = new StorageManager();
