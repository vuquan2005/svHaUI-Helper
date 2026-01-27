[**SV HaUI Helper**](../index.md)

***

# core/feature-manager

## FeatureManager

Feature Manager coordinates the lifecycle of all user features.
It handles registration, URL matching, and safe execution/cleanup.

### Constructors

#### Constructor

```ts
new FeatureManager(): FeatureManager;
```

##### Returns

[`FeatureManager`](#featuremanager)

### Methods

#### register()

```ts
register(feature): void;
```

Register a new feature

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `feature` | [`Feature`](feature.md#feature) |

##### Returns

`void`

#### registerAll()

```ts
registerAll(features): void;
```

Register multiple features at once

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `features` | [`Feature`](feature.md#feature)\<`Record`\<`string`, `any`\>\>[] |

##### Returns

`void`

#### applyFeatures()

```ts
applyFeatures(): Promise<void>;
```

Apply features matching the current page
Can be called multiple times (e.g., on SPA route changes)

##### Returns

`Promise`\<`void`\>

#### get()

```ts
get(id): 
  | Feature<Record<string, any>>
  | undefined;
```

Get feature by ID

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

##### Returns

  \| [`Feature`](feature.md#feature)\<`Record`\<`string`, `any`\>\>
  \| `undefined`

#### getAll()

```ts
getAll(): Feature<Record<string, any>>[];
```

Get all registered features

##### Returns

[`Feature`](feature.md#feature)\<`Record`\<`string`, `any`\>\>[]

#### isRunning()

```ts
isRunning(id): boolean;
```

Check if a feature is currently running

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

##### Returns

`boolean`

#### getAllIds()

```ts
getAllIds(): string[];
```

##### Returns

`string`[]

#### getAllRunningIds()

```ts
getAllRunningIds(): string[];
```

##### Returns

`string`[]

#### getAllNotRunningIds()

```ts
getAllNotRunningIds(): string[];
```

##### Returns

`string`[]

#### startFeature()

```ts
startFeature(id): Promise<boolean>;
```

Start a specific feature by ID

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

##### Returns

`Promise`\<`boolean`\>

true if feature was started, false if not found or already running

#### stopFeature()

```ts
stopFeature(id): boolean;
```

Stop a specific feature by ID

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

##### Returns

`boolean`

true if feature was stopped, false if not found or not running

***

## featureManager

```ts
const featureManager: FeatureManager;
```
