[**SV HaUI Helper**](../index.md)

***

# core/storage

## StorageEntry

Represents a single entry in storage with a specific key.
Provides a convenient object-oriented interface for interacting with a single value.

### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The type of value stored in this entry |

### Constructors

#### Constructor

```ts
new StorageEntry<T>(key): StorageEntry<T>;
```

Creates a new StorageEntry instance.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The storage key to use |

##### Returns

[`StorageEntry`](#storageentry)\<`T`\>

### Properties

| Property | Modifier | Type | Description |
| ------ | ------ | ------ | ------ |
| <a id="key"></a> `key` | `readonly` | `string` | The storage key for this entry |

### Methods

#### get()

```ts
get(): Promise<T>;
```

Gets the value for this entry from storage.

##### Returns

`Promise`\<`T`\>

A promise that resolves to the stored value

#### set()

```ts
set(value): Promise<void>;
```

Sets the value for this entry in storage.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `T` | The value to store |

##### Returns

`Promise`\<`void`\>

A promise that resolves when the value is saved

#### delete()

```ts
delete(): Promise<void>;
```

Deletes this entry from storage.

##### Returns

`Promise`\<`void`\>

A promise that resolves when the entry is deleted

#### onchange()

```ts
onchange(callback): Promise<GmValueListenerId>;
```

Adds a listener for changes to this entry's value.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`ValueChangeHandler`](#valuechangehandler)\<`T`\> | Function to call when the value changes |

##### Returns

`Promise`\<`GmValueListenerId`\>

A promise that resolves to the listener ID

#### removeValueChangeListener()

```ts
removeValueChangeListener(listenerId): Promise<void>;
```

Removes a value change listener.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listenerId` | `GmValueListenerId` | The ID of the listener to remove |

##### Returns

`Promise`\<`void`\>

A promise that resolves when the listener is removed

***

## ScopedStorage

A scoped storage utility that namespaces all keys with a prefix.
Provides type-safe access to storage values within a defined scope.

### Available APIs:
- `get(key, defaultValue)` - Get a single value
- `set(key, value)` - Set a single value
- `delete(key)` - Delete a single value
- `has(key)` - Check if a key exists
- `getMultiple(keys)` - Get multiple values
- `setMultiple(values)` - Set multiple values
- `deleteMultiple(keys)` - Delete multiple values
- `keys()` - List all local keys in scope
- `entries()` - Get all key-value pairs in scope
- `clear()` - Delete all keys in scope
- `onValueChange(key, callback)` - Watch for value changes
- `removeValueChangeListener(id)` - Stop watching changes

### Example

```typescript
interface FeatureConfig {
  enabled: boolean;
  threshold: number;
}

const storage = new ScopedStorage<FeatureConfig>('my-feature');

// Single operations
await storage.set('enabled', true);
const isEnabled = await storage.get('enabled', false);

// Batch operations
await storage.setMultiple({ enabled: true, threshold: 50 });
const data = await storage.getMultiple(['enabled', 'threshold']);

// React to changes
storage.onValueChange('enabled', (oldVal, newVal) => {
  console.log(`Status changed from ${oldVal} to ${newVal}`);
});
```

### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `any`\> | Record type defining the shape of stored values |

### Constructors

#### Constructor

```ts
new ScopedStorage<T>(scopeName): ScopedStorage<T>;
```

Creates a new ScopedStorage instance.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scopeName` | `string` | The prefix to use for all keys (empty string for no prefix) |

##### Returns

[`ScopedStorage`](#scopedstorage)\<`T`\>

### Properties

| Property | Modifier | Type | Default value | Description |
| ------ | ------ | ------ | ------ | ------ |
| <a id="separator"></a> `SEPARATOR` | `readonly` | `"."` | `'.'` | Separator used between scope name and key |

### Methods

#### get()

```ts
get<K>(key, defaultValue?): Promise<T[K]>;
```

Gets a single value from storage.

##### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* `string` \| `number` \| `symbol` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `K` & `string` | The key to retrieve |
| `defaultValue?` | `T`\[`K`\] | Optional default value if key doesn't exist |

##### Returns

`Promise`\<`T`\[`K`\]\>

#### getMultiple()

```ts
getMultiple(input): Promise<Partial<T>>;
```

Gets multiple values from storage.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `Partial`\<`T`\> \| keyof `T` & `string`[] | Array of keys or object with key-default pairs |

##### Returns

`Promise`\<`Partial`\<`T`\>\>

#### set()

```ts
set<K>(key, value): Promise<void>;
```

Sets a single value in storage.

##### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* `string` \| `number` \| `symbol` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `K` & `string` | The key to set |
| `value` | `T`\[`K`\] | The value to store |

##### Returns

`Promise`\<`void`\>

#### setMultiple()

```ts
setMultiple(values): Promise<void>;
```

Sets multiple values in storage.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `values` | `Partial`\<`T`\> | Object containing key-value pairs to set |

##### Returns

`Promise`\<`void`\>

#### delete()

```ts
delete(key): Promise<void>;
```

Deletes a single value from storage.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | keyof `T` & `string` | The key to delete |

##### Returns

`Promise`\<`void`\>

#### deleteMultiple()

```ts
deleteMultiple(keys): Promise<void>;
```

Deletes multiple values from storage.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `keys` | keyof `T` & `string`[] | Array of keys to delete |

##### Returns

`Promise`\<`void`\>

#### keys()

```ts
keys(): Promise<keyof T & string[]>;
```

Gets all keys within this scope.

##### Returns

`Promise`\<keyof `T` & `string`[]\>

#### has()

```ts
has<K>(key): Promise<boolean>;
```

Checks if a key exists in storage.

##### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* `string` \| `number` \| `symbol` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `K` & `string` | The key to check |

##### Returns

`Promise`\<`boolean`\>

#### entries()

```ts
entries(): Promise<Partial<T>>;
```

Gets all key-value pairs within this scope.

##### Returns

`Promise`\<`Partial`\<`T`\>\>

#### clear()

```ts
clear(): Promise<void>;
```

Clears all values within this scope.

##### Returns

`Promise`\<`void`\>

#### onValueChange()

```ts
onValueChange<K>(key, callback): Promise<GmValueListenerId>;
```

Adds a listener for value changes on a specific key.

##### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* `string` \| `number` \| `symbol` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `K` & `string` | The key to watch |
| `callback` | (`key`, `oldValue?`, `newValue?`, `remote?`) => `void` | Callback function when value changes |

##### Returns

`Promise`\<`GmValueListenerId`\>

Listener ID for removal

#### removeValueChangeListener()

```ts
removeValueChangeListener(listenerId): Promise<void>;
```

Removes a value change listener.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listenerId` | `GmValueListenerId` | The listener ID to remove |

##### Returns

`Promise`\<`void`\>

***

## StorageManager

Global storage manager providing direct access to storage methods.

### Constructors

#### Constructor

```ts
new StorageManager(): StorageManager;
```

##### Returns

[`StorageManager`](#storagemanager)

### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="get-4"></a> `get` | \<`T`\>(`key`, `defaultValue?`) => `Promise`\<`T`\> | `StorageAPI.getValue` | Gets a single value from storage |
| <a id="set-4"></a> `set` | \<`T`\>(`key`, `value`) => `Promise`\<`void`\> | `StorageAPI.setValue` | Sets a single value in storage |
| <a id="delete-4"></a> `delete` | (`key`) => `Promise`\<`void`\> | `StorageAPI.deleteValue` | Deletes a single value from storage |
| <a id="list"></a> `list` | () => `Promise`\<`string`[]\> | `StorageAPI.listValues` | Lists all keys in storage |
| <a id="getmultiple-2"></a> `getMultiple` | \<`T`\>(`keysOrDefaults`) => `Promise`\<`Record`\<`string`, `any`\>\> | `StorageAPI.getValues` | Gets multiple values from storage |
| <a id="setmultiple-2"></a> `setMultiple` | (`values`) => `Promise`\<`void`\> | `StorageAPI.setValues` | Sets multiple values in storage |
| <a id="deletemultiple-2"></a> `deleteMultiple` | (`keys`) => `Promise`\<`void`\> | `StorageAPI.deleteValues` | Deletes multiple values from storage |
| <a id="addvaluechangelistener"></a> `addValueChangeListener` | \<`T`\>(`key`, `callback`) => `Promise`\<`GmValueListenerId`\> | `StorageAPI.addValueChangeListener` | Adds a value change listener |
| <a id="removevaluechangelistener-4"></a> `removeValueChangeListener` | (`listenerId`) => `Promise`\<`void`\> | `StorageAPI.removeValueChangeListener` | Removes a value change listener |

***

## StorageListenerId

```ts
type StorageListenerId = GmValueListenerId;
```

***

## ValueChangeHandler()

```ts
type ValueChangeHandler<T> = (name, oldValue?, newValue?, remote?) => void;
```

### Type Parameters

| Type Parameter |
| ------ |
| `T` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `oldValue?` | `T` |
| `newValue?` | `T` |
| `remote?` | `boolean` |

### Returns

`void`

***

## storage

```ts
const storage: StorageManager;
```

Global storage utilities instance.
