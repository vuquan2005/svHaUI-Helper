[**SV HaUI Helper**](../index.md)

***

# core/logger

## Logger

### Constructors

#### Constructor

```ts
new Logger(options): Logger;
```

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`LoggerOptions`](#loggeroptions) |

##### Returns

[`Logger`](#logger)

### Accessors

#### d

##### Get Signature

```ts
get d(): (...args) => void;
```

Debug log - for development
Usage: log.d('message', data)
Line number will display correctly in DevTools

###### Returns

```ts
(...args): void;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`args` | `any`[] |

###### Returns

`void`

#### i

##### Get Signature

```ts
get i(): (...args) => void;
```

Info log

###### Returns

```ts
(...args): void;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`args` | `any`[] |

###### Returns

`void`

#### w

##### Get Signature

```ts
get w(): (...args) => void;
```

Warning log

###### Returns

```ts
(...args): void;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`args` | `any`[] |

###### Returns

`void`

#### e

##### Get Signature

```ts
get e(): (...args) => void;
```

Error log

###### Returns

```ts
(...args): void;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`args` | `any`[] |

###### Returns

`void`

### Methods

#### child()

```ts
child(name): Logger;
```

Create child logger with sub-prefix

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

##### Returns

[`Logger`](#logger)

#### setLevel()

```ts
setLevel(level): void;
```

Set minimum log level for this logger

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `level` | [`LogLevel`](#loglevel) |

##### Returns

`void`

***

## LoggerOptions

Configuration options for creating a new Logger instance.

### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="prefix"></a> `prefix?` | `string` | Prefix to display before log messages (e.g. [Storage]) |
| <a id="minlevel"></a> `minLevel?` | [`LogLevel`](#loglevel) | Minimum log level to display for this specific logger instance. If not set, uses global level. |

***

## LogLevel

```ts
type LogLevel = "debug" | "info" | "warn" | "error" | "none";
```

Logger Utility - Fast and beautiful logging
Supports log level setting and source location display (line number)

Uses bind trick so DevTools displays correct line number where log is called

***

## log

```ts
const log: Logger;
```

***

## setGlobalLogLevel()

```ts
function setGlobalLogLevel(level): void;
```

### Parameters

| Parameter | Type |
| ------ | ------ |
| `level` | [`LogLevel`](#loglevel) |

### Returns

`void`

***

## getGlobalLogLevel()

```ts
function getGlobalLogLevel(): LogLevel;
```

### Returns

[`LogLevel`](#loglevel)

***

## createLogger()

```ts
function createLogger(name): Logger;
```

### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

### Returns

[`Logger`](#logger)
