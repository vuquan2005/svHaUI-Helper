/**
 * Type-safe GM storage wrapper
 */

import { GM_getValue, GM_setValue, GM_deleteValue, GM_listValues } from '$';
import type { StorageSchema } from '../types';

class StorageManager {
    get<K extends keyof StorageSchema>(
        key: K,
        defaultValue?: StorageSchema[K]
    ): StorageSchema[K] {
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
}

export const storage = new StorageManager();
