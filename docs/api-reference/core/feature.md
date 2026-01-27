[**SV HaUI Helper**](../index.md)

***

# core/feature

## `abstract` Feature

### Extended by

- [`CaptchaHelperFeature`](../features/captcha-helper.md#captchahelperfeature)
- [`DynamicTitleFeature`](../features/dynamic-title.md#dynamictitlefeature)
- [`QuickNavFeature`](../features/quick-nav.md#quicknavfeature)

### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TStorage` *extends* `Record`\<`string`, `unknown`\> | `Record`\<`string`, `any`\> |

### Constructors

#### Constructor

```ts
new Feature<TStorage>(config): Feature<TStorage>;
```

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`FeatureConfig`](#featureconfig) |

##### Returns

[`Feature`](#feature)\<`TStorage`\>

### Properties

| Property | Modifier | Type | Default value | Description |
| ------ | ------ | ------ | ------ | ------ |
| <a id="location"></a> `location` | `protected` | [`WindowLocationWrapper`](../utils/window-location.md#windowlocationwrapper) | `browserLocation` | - |
| <a id="id-1"></a> `id` | `readonly` | `string` | `undefined` | - |
| <a id="name-2"></a> `name` | `readonly` | `string` | `undefined` | - |
| <a id="description-1"></a> `description` | `readonly` | `string` | `undefined` | - |
| <a id="priority-1"></a> `priority` | `readonly` | `number` | `undefined` | - |
| <a id="urlmatch-1"></a> `urlMatch?` | `readonly` | [`UrlMatchConfig`](#urlmatchconfig) | `undefined` | - |
| <a id="matchresult-1"></a> `matchResult` | `protected` | [`MatchResult`](#matchresult) \| `null` | `null` | Kết quả match sau khi shouldRun() được gọi |

### Accessors

#### log

##### Get Signature

```ts
get protected log(): Logger;
```

Logger với prefix tự động từ tên feature (Lazy loaded)

###### Returns

[`Logger`](logger.md#logger)

#### storage

##### Get Signature

```ts
get protected storage(): ScopedStorage<TStorage>;
```

###### Returns

[`ScopedStorage`](storage.md#scopedstorage)\<`TStorage`\>

### Methods

#### shouldRun()

```ts
shouldRun(): boolean;
```

Check if this feature should run on the current URL

##### Returns

`boolean`

#### run()

```ts
abstract run(): void | Promise<void>;
```

Run feature - called when feature is loaded
Override this method to add logic

##### Returns

`void` \| `Promise`\<`void`\>

#### cleanup()

```ts
cleanup(): void;
```

Cleanup when feature is disabled or unloaded
Override if cleanup is needed

##### Returns

`void`

***

## MatchPattern

A single URL match pattern with optional name

### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="name"></a> `name?` | `string` | Optional name identifier for this pattern (e.g., "sso-login", "register") |
| <a id="pattern"></a> `pattern` | `string` \| `RegExp` | Regex or string to match against normalized URL |

***

## MatchResult

Result of URL matching after shouldRun() is called

### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="matched"></a> `matched` | `boolean` | Whether a pattern matched |
| <a id="matchindex"></a> `matchIndex?` | `number` | Index of the matched pattern in the array (if urlMatch is array) |
| <a id="matchname"></a> `matchName?` | `string` | Name of the matched pattern (if provided) |
| <a id="pattern-1"></a> `pattern?` | `string` \| `RegExp` | The pattern that matched |

***

## FeatureConfig

### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="id"></a> `id` | `string` | - |
| <a id="name-1"></a> `name` | `string` | - |
| <a id="description"></a> `description` | `string` | - |
| <a id="priority"></a> `priority?` | `number` | Priority - higher runs first, default 0 |
| <a id="urlmatch"></a> `urlMatch?` | [`UrlMatchConfig`](#urlmatchconfig) | Regex, string, MatchPattern, or array of MatchPattern to match URL |

***

## UrlMatchConfig

```ts
type UrlMatchConfig = 
  | RegExp
  | string
  | MatchPattern
  | MatchPattern[];
```

URL match can be a single pattern or array of patterns
