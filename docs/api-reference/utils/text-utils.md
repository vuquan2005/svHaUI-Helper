[**SV HaUI Helper**](../index.md)

***

# utils/text-utils

## getTelexChar()

```ts
function getTelexChar(text): string;
```

Determine corresponding Telex character from input string

### Parameters

| Parameter | Type |
| ------ | ------ |
| `text` | `string` |

### Returns

`string`

***

## removeDiacritics()

```ts
function removeDiacritics(text): string;
```

Remove Vietnamese diacritics and other diacritical marks
Uses Unicode Normalization Form D (NFD) to separate characters and marks,
then removes the combining marks (diacritics)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `text` | `string` |

### Returns

`string`

### Example

```ts
removeDiacritics("Đây là tiếng Việt") // "Đay la tieng Viet"
removeDiacritics("café") // "cafe"
```

***

## keepAlphanumeric()

```ts
function keepAlphanumeric(text): string;
```

Keep only alphanumeric characters (a-z, A-Z, 0-9)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `text` | `string` |

### Returns

`string`

***

## normalizeCaptchaInput()

```ts
function normalizeCaptchaInput(text): string;
```

Normalize text for captcha input:
- Convert to lowercase
- Remove Vietnamese diacritics
- Keep only a-z and 0-9

### Parameters

| Parameter | Type |
| ------ | ------ |
| `text` | `string` |

### Returns

`string`

***

## normalizeCaptchaInputUndo()

```ts
function normalizeCaptchaInputUndo(text): string;
```

Normalize text for captcha input + undo Telex:
- Convert to lowercase
- Undo Vietnamese Telex input (e.g., "às" → "asf")
- Keep only a-z and 0-9

### Parameters

| Parameter | Type |
| ------ | ------ |
| `text` | `string` |

### Returns

`string`
