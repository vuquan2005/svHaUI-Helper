[**SV HaUI Helper**](../index.md)

***

# features/captcha-helper

## CaptchaHelperFeature

### Extends

- [`Feature`](../core/feature.md#feature)\<`StorageSchema`\>

### Constructors

#### Constructor

```ts
new CaptchaHelperFeature(): CaptchaHelperFeature;
```

##### Returns

[`CaptchaHelperFeature`](#captchahelperfeature)

##### Overrides

[`Feature`](../core/feature.md#feature).[`constructor`](../core/feature.md#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Inherited from |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="location"></a> `location` | `protected` | [`WindowLocationWrapper`](../utils/window-location.md#windowlocationwrapper) | `browserLocation` | - | [`Feature`](../core/feature.md#feature).[`location`](../core/feature.md#location) |
| <a id="id"></a> `id` | `readonly` | `string` | `undefined` | - | [`Feature`](../core/feature.md#feature).[`id`](../core/feature.md#id-1) |
| <a id="name"></a> `name` | `readonly` | `string` | `undefined` | - | [`Feature`](../core/feature.md#feature).[`name`](../core/feature.md#name-2) |
| <a id="description"></a> `description` | `readonly` | `string` | `undefined` | - | [`Feature`](../core/feature.md#feature).[`description`](../core/feature.md#description-1) |
| <a id="priority"></a> `priority` | `readonly` | `number` | `undefined` | - | [`Feature`](../core/feature.md#feature).[`priority`](../core/feature.md#priority-1) |
| <a id="urlmatch"></a> `urlMatch?` | `readonly` | [`UrlMatchConfig`](../core/feature.md#urlmatchconfig) | `undefined` | - | [`Feature`](../core/feature.md#feature).[`urlMatch`](../core/feature.md#urlmatch-1) |
| <a id="matchresult"></a> `matchResult` | `protected` | [`MatchResult`](../core/feature.md#matchresult) \| `null` | `null` | Kết quả match sau khi shouldRun() được gọi | [`Feature`](../core/feature.md#feature).[`matchResult`](../core/feature.md#matchresult-1) |

### Accessors

#### log

##### Get Signature

```ts
get protected log(): Logger;
```

Logger với prefix tự động từ tên feature (Lazy loaded)

###### Returns

[`Logger`](../core/logger.md#logger)

##### Inherited from

[`Feature`](../core/feature.md#feature).[`log`](../core/feature.md#log)

#### storage

##### Get Signature

```ts
get protected storage(): ScopedStorage<TStorage>;
```

###### Returns

[`ScopedStorage`](../core/storage.md#scopedstorage)\<`TStorage`\>

##### Inherited from

[`Feature`](../core/feature.md#feature).[`storage`](../core/feature.md#storage)

### Methods

#### shouldRun()

```ts
shouldRun(): boolean;
```

Check if this feature should run on the current URL

##### Returns

`boolean`

##### Inherited from

[`Feature`](../core/feature.md#feature).[`shouldRun`](../core/feature.md#shouldrun)

#### run()

```ts
run(): Promise<void>;
```

Initialize Captcha Helper
Find and attach event listeners to captcha input field

##### Returns

`Promise`\<`void`\>

##### Overrides

[`Feature`](../core/feature.md#feature).[`run`](../core/feature.md#run)

#### cleanup()

```ts
cleanup(): void;
```

Cleanup resources when feature is disabled
Remove event listeners and clear timers

##### Returns

`void`

##### Overrides

[`Feature`](../core/feature.md#feature).[`cleanup`](../core/feature.md#cleanup)
