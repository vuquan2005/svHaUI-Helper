import { browser } from 'wxt/browser';

export type StorageListenerId = number;

export type ValueChangeHandler<T> = (
    name: string,
    oldValue?: T,
    newValue?: T,
    remote?: boolean
) => void;

interface ListenerRecord {
    key: string;
    callback: ValueChangeHandler<unknown>;
}

const listeners = new Map<StorageListenerId, ListenerRecord>();
let listenerIdSeq = 1;
let extensionListenerAttached = false;

function ensureExtensionListener() {
    if (extensionListenerAttached) return;
    try {
        if (typeof browser !== 'undefined' && browser.storage?.onChanged) {
            browser.storage.onChanged.addListener((changes, areaName) => {
                if (areaName && areaName !== 'local') return;
                for (const [changedKey, change] of Object.entries(changes)) {
                    listeners.forEach(({ key, callback }) => {
                        if (key === changedKey) {
                            try {
                                callback(changedKey, change.oldValue, change.newValue, true);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    });
                }
            });
            extensionListenerAttached = true;
        }
    } catch {
        // Non-extension environments (e.g. unit tests)
    }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('storage', (e: StorageEvent) => {
        if (!e.key) return;
        listeners.forEach(({ key, callback }) => {
            if (key === e.key) {
                let oldVal: unknown = undefined;
                let newVal: unknown = undefined;
                try {
                    if (e.oldValue !== null) oldVal = JSON.parse(e.oldValue);
                } catch {
                    oldVal = e.oldValue;
                }
                try {
                    if (e.newValue !== null) newVal = JSON.parse(e.newValue);
                } catch {
                    newVal = e.newValue;
                }
                callback(e.key, oldVal, newVal, true);
            }
        });
    });
}

/**
 * Low-level Storage API wrapper that provides a unified interface for WebExtension storage.
 * Prioritizes browser.storage.local, falls back to localStorage when needed.
 */
const StorageAPI = {
    /**
     * Gets a value from storage.
     * @param key - The key to retrieve
     * @param defaultValue - Optional default value if key doesn't exist
     */
    async getValue<T>(key: string, defaultValue?: T): Promise<T> {
        try {
            if (typeof browser !== 'undefined' && browser.storage?.local) {
                const res = await browser.storage.local.get(key);
                if (res && res[key] !== undefined) {
                    return res[key] as T;
                }
                return defaultValue as T;
            }
        } catch {
            // Fall through to localStorage
        }

        if (typeof window !== 'undefined' && window.localStorage) {
            const raw = window.localStorage.getItem(key);
            if (raw !== null) {
                try {
                    return JSON.parse(raw);
                } catch {
                    return raw as unknown as T;
                }
            }
            return defaultValue as T;
        }

        return defaultValue as T;
    },

    /**
     * Sets a value in storage.
     * @param key - The key to set
     * @param value - The value to store
     */
    async setValue<T>(key: string, value: T): Promise<void> {
        try {
            if (typeof browser !== 'undefined' && browser.storage?.local) {
                await browser.storage.local.set({ [key]: value });
                return;
            }
        } catch {
            // Fall through to localStorage
        }

        if (typeof window !== 'undefined' && window.localStorage) {
            const oldValueRaw = window.localStorage.getItem(key);
            let oldValue: unknown = undefined;
            if (oldValueRaw !== null) {
                try {
                    oldValue = JSON.parse(oldValueRaw);
                } catch {
                    oldValue = oldValueRaw;
                }
            }
            window.localStorage.setItem(key, JSON.stringify(value));
            listeners.forEach(({ key: watchedKey, callback }) => {
                if (watchedKey === key) {
                    try {
                        callback(key, oldValue, value, false);
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
            return;
        }
    },

    /**
     * Deletes a value from storage.
     * @param key - The key to delete
     */
    async deleteValue(key: string): Promise<void> {
        try {
            if (typeof browser !== 'undefined' && browser.storage?.local) {
                await browser.storage.local.remove(key);
                return;
            }
        } catch {
            // Fall through to localStorage
        }

        if (typeof window !== 'undefined' && window.localStorage) {
            const oldValueRaw = window.localStorage.getItem(key);
            let oldValue: unknown = undefined;
            if (oldValueRaw !== null) {
                try {
                    oldValue = JSON.parse(oldValueRaw);
                } catch {
                    oldValue = oldValueRaw;
                }
            }
            window.localStorage.removeItem(key);
            listeners.forEach(({ key: watchedKey, callback }) => {
                if (watchedKey === key) {
                    try {
                        callback(key, oldValue, undefined, false);
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
            return;
        }
    },

    /**
     * Lists all keys in storage.
     */
    async listValues(): Promise<string[]> {
        try {
            if (typeof browser !== 'undefined' && browser.storage?.local) {
                const all = await browser.storage.local.get(null);
                return Object.keys(all);
            }
        } catch {
            // Fall through to localStorage
        }

        if (typeof window !== 'undefined' && window.localStorage) {
            return Object.keys(window.localStorage);
        }

        return [];
    },

    /**
     * Gets multiple values from storage.
     * @param keysOrDefaults - Array of keys or object with key-default pairs
     */
    async getValues<T extends Record<string, unknown>>(
        keysOrDefaults: string[] | T
    ): Promise<Record<string, unknown>> {
        try {
            if (typeof browser !== 'undefined' && browser.storage?.local) {
                return await browser.storage.local.get(keysOrDefaults);
            }
        } catch {
            // Fall through to fallback
        }

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
                {} as Record<string, unknown>
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
                {} as Record<string, unknown>
            );
        }
    },

    /**
     * Sets multiple values in storage.
     * @param values - Object containing key-value pairs to set
     */
    async setValues(values: Record<string, unknown>): Promise<void> {
        try {
            if (typeof browser !== 'undefined' && browser.storage?.local) {
                await browser.storage.local.set(values);
                return;
            }
        } catch {
            // Fall through to fallback
        }

        await Promise.all(
            Object.entries(values).map(([key, value]) => StorageAPI.setValue(key, value))
        );
    },

    /**
     * Deletes multiple values from storage.
     * @param keys - Array of keys to delete
     */
    async deleteValues(keys: string[]): Promise<void> {
        try {
            if (typeof browser !== 'undefined' && browser.storage?.local) {
                await browser.storage.local.remove(keys);
                return;
            }
        } catch {
            // Fall through to fallback
        }

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
    ): Promise<StorageListenerId> {
        ensureExtensionListener();
        const id = listenerIdSeq++;
        listeners.set(id, {
            key,
            callback: callback as ValueChangeHandler<unknown>,
        });
        return id;
    },

    /**
     * Removes a value change listener.
     * @param listenerId - The listener ID to remove
     */
    async removeValueChangeListener(listenerId: StorageListenerId): Promise<void> {
        listeners.delete(listenerId);
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
    public onchange(callback: ValueChangeHandler<T>): Promise<StorageListenerId> {
        return StorageAPI.addValueChangeListener(this.key, callback);
    }

    /**
     * Removes a value change listener.
     * @param listenerId - The ID of the listener to remove
     * @returns A promise that resolves when the listener is removed
     */
    public removeValueChangeListener(listenerId: StorageListenerId): Promise<void> {
        return StorageAPI.removeValueChangeListener(listenerId);
    }
}

/**
 * A scoped storage utility that namespaces all keys with a prefix.
 * Provides type-safe access to storage values within a defined scope.
 *
 * @template T - Record type defining the shape of stored values
 */
export class ScopedStorage<T extends Record<string, unknown>> {
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
        let payload: string[] | Record<string, unknown>;

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
                (result as Record<string, unknown>)[localKey] = value;
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
        const prefixedValues: Record<string, unknown> = {};
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
        const value = await StorageAPI.getValue(this.getFullKey(key));
        return value !== undefined;
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
    ): Promise<StorageListenerId> {
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
    async removeValueChangeListener(listenerId: StorageListenerId): Promise<void> {
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
