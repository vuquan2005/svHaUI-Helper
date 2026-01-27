[**SV HaUI Helper**](../index.md)

***

# utils/dom

## ObserveResult

```ts
type ObserveResult = object;
```

Result of the observation operation

### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="success"></a> `success` | `boolean` | Whether the check condition was met successfully |
| <a id="code"></a> `code` | `"OK"` \| `"TIMEOUT"` \| `"NOT_FOUND"` \| `"ABORT"` \| `"ERROR"` | Result code: - 'OK': Check passed - 'TIMEOUT': Max time exceeded - 'NOT_FOUND': Target element not found - 'ABORT': Aborted via signal - 'ERROR': Error in callback |

***

## observeDomUntil()

```ts
function observeDomUntil(
   target, 
   checkCallback, 
options): Promise<ObserveResult>;
```

Observes a DOM element for changes until a condition is met or timeout occurs.
Useful for waiting for dynamic content changes.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `string` \| `Element` \| `null` | The element to observe or a selector string |
| `checkCallback` | () => `boolean` \| `Promise`\<`boolean`\> | Function that checks the condition. Returns true to stop observing, false to continue. |
| `options` | \{ `debounceMs?`: `number`; `timeoutMs?`: `number`; `config?`: `MutationObserverInit`; `signal?`: `AbortSignal`; \} | Configuration options |
| `options.debounceMs?` | `number` | Debounce time in ms for the observer callback (default: 50) |
| `options.timeoutMs?` | `number` | Maximum time to wait in ms before giving up (default: 10000). Set to 0 for no timeout. |
| `options.config?` | `MutationObserverInit` | MutationObserver configuration (default: { childList: true, subtree: true }) |
| `options.signal?` | `AbortSignal` | AbortSignal to cancel the observation |

### Returns

`Promise`\<[`ObserveResult`](#observeresult)\>

Promise resolving to an ObserveResult object

### Example

```ts
const result = await observeDomUntil(
  '#content',
  () => document.querySelector('.result') !== null,
  { timeoutMs: 5000 }
);
if (result.success) {
  console.log('Result found!');
}
```
