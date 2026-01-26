import {
    GM,
    GM_getValue,
    GM_setValue,
    GM_deleteValue,
    GM_listValues,
    GM_addValueChangeListener,
    GmValueListenerId,
    GM_removeValueChangeListener,
} from '$';

export type StorageListenerId = GmValueListenerId;

export type ValueChangeHandler<T> = (
    name: string,
    oldValue?: T,
    newValue?: T,
    remote?: boolean
) => void;

/**
 * Low-level Storage API wrapper that provides a unified interface for GM4/GM3 APIs.
 * Prioritizes GM4 (GM.*) API, falls back to GM3 (GM_*) when needed.
 */
const StorageAPI = {
    /**
     * Gets a value from storage.
     * @param key - The key to retrieve
     * @param defaultValue - Optional default value if key doesn't exist
     */
    async getValue<T>(key: string, defaultValue?: T): Promise<T> {
        if (GM?.getValue) {
            return GM.getValue(key, defaultValue);
        }
        if (typeof GM_getValue === 'function') {
            return GM_getValue(key, defaultValue);
        }
        throw new Error('GM.getValue/GM_getValue is not available!');
    },

    /**
     * Sets a value in storage.
     * @param key - The key to set
     * @param value - The value to store
     */
    async setValue<T>(key: string, value: T): Promise<void> {
        if (GM?.setValue) {
            return GM.setValue(key, value);
        }
        if (typeof GM_setValue === 'function') {
            GM_setValue(key, value);
            return;
        }
        throw new Error('GM.setValue/GM_setValue is not available!');
    },

    /**
     * Deletes a value from storage.
     * @param key - The key to delete
     */
    async deleteValue(key: string): Promise<void> {
        if (GM?.deleteValue) {
            return GM.deleteValue(key);
        }
        if (typeof GM_deleteValue === 'function') {
            GM_deleteValue(key);
            return;
        }
        throw new Error('GM.deleteValue/GM_deleteValue is not available!');
    },

    /**
     * Lists all keys in storage.
     */
    async listValues(): Promise<string[]> {
        if (GM?.listValues) {
            return GM.listValues();
        }
        if (typeof GM_listValues === 'function') {
            return GM_listValues();
        }
        throw new Error('GM.listValues/GM_listValues is not available!');
    },

    /**
     * Gets multiple values from storage.
     * Falls back to Promise.all with individual getValue calls if batch API unavailable.
     * @param keysOrDefaults - Array of keys or object with key-default pairs
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getValues<T extends Record<string, any>>(
        keysOrDefaults: string[] | T
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<Record<string, any>> {
        // Try GM4 batch API
        if (GM?.getValues) {
            return GM.getValues(keysOrDefaults);
        }

        // Fallback to Promise.all with individual calls
        if (Array.isArray(keysOrDefaults)) {
            const results = await Promise.all(
                keysOrDefaults.map(async (key) => ({
                    key,
                    value: await StorageAPI.getValue(key),
                }))
            );
            return results.reduce(
                (acc, { key, value }) => {
                    acc[key] = value;
                    return acc;
                },
                {} as Record<string, any>
            );
        } else {
            const entries = Object.entries(keysOrDefaults);
            const results = await Promise.all(
                entries.map(async ([key, defaultValue]) => ({
                    key,
                    value: await StorageAPI.getValue(key, defaultValue),
                }))
            );
            return results.reduce(
                (acc, { key, value }) => {
                    acc[key] = value;
                    return acc;
                },
                {} as Record<string, any>
            );
        }
    },

    /**
     * Sets multiple values in storage.
     * Falls back to Promise.all with individual setValue calls if batch API unavailable.
     * @param values - Object containing key-value pairs to set
     */
    async setValues(values: Record<string, any>): Promise<void> {
        // Try GM4 batch API
        if (GM?.setValues) {
            return GM.setValues(values);
        }

        // Fallback to Promise.all with individual calls
        await Promise.all(
            Object.entries(values).map(([key, value]) => StorageAPI.setValue(key, value))
        );
    },

    /**
     * Deletes multiple values from storage.
     * Falls back to Promise.all with individual deleteValue calls if batch API unavailable.
     * @param keys - Array of keys to delete
     */
    async deleteValues(keys: string[]): Promise<void> {
        // Try GM4 batch API
        if (GM?.deleteValues) {
            return GM.deleteValues(keys);
        }

        // Fallback to Promise.all with individual calls
        await Promise.all(keys.map((key) => StorageAPI.deleteValue(key)));
    },

    /**
     * Adds a listener for value changes.
     * @param key - The key to watch
     * @param callback - Callback function when value changes
     */
    async addValueChangeListener<T>(
        key: string,
        callback: ValueChangeHandler<T>
    ): Promise<GmValueListenerId> {
        if (GM?.addValueChangeListener) {
            return GM.addValueChangeListener(key, callback);
        }

        if (typeof GM_addValueChangeListener === 'function') {
            return GM_addValueChangeListener(key, callback);
        }

        throw new Error('GM.addValueChangeListener/GM_addValueChangeListener is not available!');
    },

    /**
     * Removes a value change listener.
     * @param listenerId - The listener ID to remove
     */
    async removeValueChangeListener(listenerId: GmValueListenerId): Promise<void> {
        if (GM?.removeValueChangeListener) {
            GM.removeValueChangeListener(listenerId);
            return;
        }

        if (typeof GM_removeValueChangeListener === 'function') {
            GM_removeValueChangeListener(listenerId);
            return;
        }

        throw new Error(
            'GM.removeValueChangeListener/GM_removeValueChangeListener is not available!'
        );
    },
};

/**
 * Represents a single entry in storage with a specific key.
 * Provides a convenient object-oriented interface for interacting with a single value.
 *
 * @template T - The type of value stored in this entry
 */
export class StorageEntry<T> {
    /** The storage key for this entry */
    public readonly key: string;

    /**
     * Creates a new StorageEntry instance.
     * @param key - The storage key to use
     */
    constructor(key: string) {
        this.key = key;
    }

    /**
     * Gets the value for this entry from storage.
     * @returns A promise that resolves to the stored value
     */
    public get(): Promise<T> {
        return StorageAPI.getValue(this.key);
    }

    /**
     * Sets the value for this entry in storage.
     * @param value - The value to store
     * @returns A promise that resolves when the value is saved
     */
    public set(value: T): Promise<void> {
        return StorageAPI.setValue(this.key, value);
    }

    /**
     * Deletes this entry from storage.
     * @returns A promise that resolves when the entry is deleted
     */
    public delete(): Promise<void> {
        return StorageAPI.deleteValue(this.key);
    }

    /**
     * Adds a listener for changes to this entry's value.
     * @param callback - Function to call when the value changes
     * @returns A promise that resolves to the listener ID
     */
    public onchange(callback: ValueChangeHandler<T>): Promise<GmValueListenerId> {
        return StorageAPI.addValueChangeListener(this.key, callback);
    }

    /**
     * Removes a value change listener.
     * @param listenerId - The ID of the listener to remove
     * @returns A promise that resolves when the listener is removed
     */
    public removeValueChangeListener(listenerId: GmValueListenerId): Promise<void> {
        return StorageAPI.removeValueChangeListener(listenerId);
    }
}

/**
 * A scoped storage utility that namespaces all keys with a prefix.
 * Provides type-safe access to storage values within a defined scope.
 *
 * ### Available APIs:
 * - `get(key, defaultValue)` - Get a single value
 * - `set(key, value)` - Set a single value
 * - `delete(key)` - Delete a single value
 * - `has(key)` - Check if a key exists
 * - `getMultiple(keys)` - Get multiple values
 * - `setMultiple(values)` - Set multiple values
 * - `deleteMultiple(keys)` - Delete multiple values
 * - `keys()` - List all local keys in scope
 * - `entries()` - Get all key-value pairs in scope
 * - `clear()` - Delete all keys in scope
 * - `onValueChange(key, callback)` - Watch for value changes
 * - `removeValueChangeListener(id)` - Stop watching changes
 *
 * @template T - Record type defining the shape of stored values
 *
 * @example
 * ```typescript
 * interface FeatureConfig {
 *   enabled: boolean;
 *   threshold: number;
 * }
 *
 * const storage = new ScopedStorage<FeatureConfig>('my-feature');
 *
 * // Single operations
 * await storage.set('enabled', true);
 * const isEnabled = await storage.get('enabled', false);
 *
 * // Batch operations
 * await storage.setMultiple({ enabled: true, threshold: 50 });
 * const data = await storage.getMultiple(['enabled', 'threshold']);
 *
 * // React to changes
 * storage.onValueChange('enabled', (oldVal, newVal) => {
 *   console.log(`Status changed from ${oldVal} to ${newVal}`);
 * });
 * ```
 */
export class ScopedStorage<T extends Record<string, any>> {
    private readonly prefix: string;

    /** Separator used between scope name and key */
    static readonly SEPARATOR = '.';

    /**
     * Creates a new ScopedStorage instance.
     * @param scopeName - The prefix to use for all keys (empty string for no prefix)
     */
    constructor(scopeName: string) {
        this.prefix = scopeName ? `${scopeName}${ScopedStorage.SEPARATOR}` : '';
    }

    /**
     * Converts a local key to its full storage key with prefix.
     */
    private getFullKey(key: keyof T & string): string {
        return `${this.prefix}${key}`;
    }

    /**
     * Strips the prefix from a full key to get the local key.
     */
    private getLocalKey(fullKey: string): keyof T & string {
        return fullKey.substring(this.prefix.length) as keyof T & string;
    }

    /**
     * Gets a single value from storage.
     * @param key - The key to retrieve
     * @param defaultValue - Optional default value if key doesn't exist
     */
    async get<K extends keyof T>(key: K & string, defaultValue?: T[K]): Promise<T[K]> {
        return StorageAPI.getValue(this.getFullKey(key), defaultValue);
    }

    /**
     * Gets multiple values from storage.
     * @param input - Array of keys or object with key-default pairs
     */
    async getMultiple(input: (keyof T & string)[] | Partial<T>): Promise<Partial<T>> {
        let payload: string[] | Record<string, any>;

        if (Array.isArray(input)) {
            payload = input.map((k) => this.getFullKey(k));
        } else {
            payload = {};
            for (const [key, value] of Object.entries(input)) {
                payload[this.getFullKey(key)] = value;
            }
        }

        const rawResult = await StorageAPI.getValues(payload);

        const result: Partial<T> = {};
        for (const [fullKey, value] of Object.entries(rawResult)) {
            if (fullKey.startsWith(this.prefix)) {
                const localKey = this.getLocalKey(fullKey);
                (result as any)[localKey] = value;
            }
        }

        return result;
    }

    /**
     * Sets a single value in storage.
     * @param key - The key to set
     * @param value - The value to store
     */
    async set<K extends keyof T>(key: K & string, value: T[K]): Promise<void> {
        await StorageAPI.setValue(this.getFullKey(key), value);
    }

    /**
     * Sets multiple values in storage.
     * @param values - Object containing key-value pairs to set
     */
    async setMultiple(values: Partial<T>): Promise<void> {
        const prefixedValues: Record<string, any> = {};
        for (const [key, value] of Object.entries(values)) {
            prefixedValues[this.getFullKey(key)] = value;
        }
        await StorageAPI.setValues(prefixedValues);
    }

    /**
     * Deletes a single value from storage.
     * @param key - The key to delete
     */
    async delete(key: keyof T & string): Promise<void> {
        await StorageAPI.deleteValue(this.getFullKey(key));
    }

    /**
     * Deletes multiple values from storage.
     * @param keys - Array of keys to delete
     */
    async deleteMultiple(keys: (keyof T & string)[]): Promise<void> {
        await StorageAPI.deleteValues(keys.map((k) => this.getFullKey(k)));
    }

    /**
     * Gets all keys within this scope.
     */
    async keys(): Promise<(keyof T & string)[]> {
        const allGlobalKeys = await StorageAPI.listValues();
        return allGlobalKeys
            .filter((key) => key.startsWith(this.prefix))
            .map((key) => this.getLocalKey(key));
    }

    /**
     * Checks if a key exists in storage.
     * @param key - The key to check
     */
    async has<K extends keyof T>(key: K & string): Promise<boolean> {
        const sentinel =
            'aHR0cHM6Ly9pbWcudmlldHFyLmlvL2ltYWdlL1RQQi0wNzYwMjk4NzAwMC1xcl9vbmx5LnBuZz9hZGRJbmZvPUVhc3RlciUyMEVnZw==';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = await StorageAPI.getValue<any>(this.getFullKey(key), sentinel);
        return value !== sentinel;
    }

    /**
     * Gets all key-value pairs within this scope.
     */
    async entries(): Promise<Partial<T>> {
        const keys = await this.keys();
        if (keys.length === 0) {
            return {};
        }
        return this.getMultiple(keys);
    }

    /**
     * Clears all values within this scope.
     */
    async clear(): Promise<void> {
        const keys = await this.keys();
        if (keys.length > 0) {
            await this.deleteMultiple(keys);
        }
    }

    /**
     * Adds a listener for value changes on a specific key.
     * @param key - The key to watch
     * @param callback - Callback function when value changes
     * @returns Listener ID for removal
     */
    async onValueChange<K extends keyof T>(
        key: K & string,
        callback: (key: K, oldValue?: T[K], newValue?: T[K], remote?: boolean) => void
    ): Promise<GmValueListenerId> {
        const requestedKey = key;
        return StorageAPI.addValueChangeListener<T[K]>(
            this.getFullKey(key),
            (_key, oldValue, newValue, remote) => {
                callback(requestedKey, oldValue, newValue, remote);
            }
        );
    }

    /**
     * Removes a value change listener.
     * @param listenerId - The listener ID to remove
     */
    async removeValueChangeListener(listenerId: GmValueListenerId): Promise<void> {
        await StorageAPI.removeValueChangeListener(listenerId);
    }
}

/**
 * Global storage utilities providing direct access to StorageAPI methods
 * plus a factory for creating scoped storage instances.
 */
export const storage = {
    /** Gets a single value */
    get: StorageAPI.getValue,
    /** Sets a single value */
    set: StorageAPI.setValue,
    /** Deletes a single value */
    delete: StorageAPI.deleteValue,
    /** Lists all keys */
    list: StorageAPI.listValues,
    /** Gets multiple values */
    getMultiple: StorageAPI.getValues,
    /** Sets multiple values */
    setMultiple: StorageAPI.setValues,
    /** Deletes multiple values */
    deleteMultiple: StorageAPI.deleteValues,
    /** Adds a value change listener */
    addValueChangeListener: StorageAPI.addValueChangeListener,
    /** Removes a value change listener */
    removeValueChangeListener: StorageAPI.removeValueChangeListener,
};
