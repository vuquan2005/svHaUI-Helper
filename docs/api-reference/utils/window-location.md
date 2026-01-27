[**SV HaUI Helper**](../index.md)

***

# utils/window-location

## WindowLocationWrapper

Wrapper for window.location with normalization methods

### Constructors

#### Constructor

```ts
new WindowLocationWrapper(location): WindowLocationWrapper;
```

##### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `location` | `Location` | `window.location` |

##### Returns

[`WindowLocationWrapper`](#windowlocationwrapper)

### Accessors

#### href

##### Get Signature

```ts
get href(): string;
```

Normalized Href (origin + normalized url)

###### Returns

`string`

#### origin

##### Get Signature

```ts
get origin(): string;
```

Original origin

###### Returns

`string`

#### rawPath

##### Get Signature

```ts
get rawPath(): string;
```

Original pathname

###### Returns

`string`

#### path

##### Get Signature

```ts
get path(): string;
```

Normalized pathname: removes trailing slashes
Example: "/path/" => "/path"

###### Returns

`string`

#### search

##### Get Signature

```ts
get search(): string;
```

Original search params

###### Returns

`string`

#### pathAndQuery

##### Get Signature

```ts
get pathAndQuery(): string;
```

Normalized path + search

###### Returns

`string`

***

## browserLocation

```ts
const browserLocation: WindowLocationWrapper;
```
