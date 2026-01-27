[**SV HaUI Helper**](index.md)

***

# types

## AppSettings

Application settings

### Properties

| Property | Type |
| ------ | ------ |
| <a id="loglevel"></a> `logLevel` | [`LogLevel`](core/logger.md#loglevel) |
| <a id="features"></a> `features` | `Record`\<`string`, `boolean`\> |

***

## CourseGrade

Course and grade information

### Properties

| Property | Type |
| ------ | ------ |
| <a id="name"></a> `name` | `string` |
| <a id="credits"></a> `credits` | `number` |
| <a id="midterm"></a> `midterm` | `number` \| `null` |
| <a id="final"></a> `final` | `number` \| `null` |
| <a id="average"></a> `average` | `number` \| `null` |
| <a id="lettergrade"></a> `letterGrade` | `string` |
| <a id="gradepoint"></a> `gradePoint` | `number` |

***

## StorageSchema

Define all keys and types in GM storage
Add new keys here for autocomplete and type safety

### Properties

| Property | Type |
| ------ | ------ |
| <a id="app_settings"></a> `app_settings` | [`AppSettings`](#appsettings) |
| <a id="grades"></a> `grades` | [`CourseGrade`](#coursegrade)[] |
| <a id="captcha_undo_telex"></a> `captcha_undo_telex` | `boolean` |

***

## StorageKey

```ts
type StorageKey = keyof StorageSchema;
```
