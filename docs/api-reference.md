# Tài liệu API

Reference cho các APIs có sẵn trong dự án.

## 📦 Core Module

### Feature

Base class cho tất cả features.

```typescript
import { Feature, FeatureConfig } from './core';
```

#### FeatureConfig

```typescript
interface FeatureConfig {
    id: string;           // ID duy nhất
    name: string;         // Tên hiển thị
    description: string;  // Mô tả
    urlMatch?: RegExp | string;  // URL pattern (optional)
}
```

#### Feature Class

```typescript
abstract class Feature {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly urlMatch?: RegExp | string;

    constructor(config: FeatureConfig);
    
    // Kiểm tra có nên chạy không
    shouldRun(): boolean;
    
    // Khởi tạo feature (bắt buộc override)
    abstract init(): void | Promise<void>;
    
    // Cleanup (optional override)
    destroy(): void;
}
```

---

### FeatureManager

Singleton quản lý tất cả features.

```typescript
import { featureManager } from './core';
```

#### Methods

| Method | Description |
|--------|-------------|
| `register(feature)` | Đăng ký 1 feature |
| `registerAll(features[])` | Đăng ký nhiều features |
| `initAll()` | Khởi chạy tất cả features phù hợp |
| `get(id)` | Lấy feature theo ID |
| `getAll()` | Lấy tất cả features |
| `isInitialized(id)` | Kiểm tra đã init chưa |

---

### Settings

Singleton quản lý cài đặt.

```typescript
import { settings, AppSettings } from './core';
```

#### AppSettings Interface

```typescript
interface AppSettings {
    features: { [key: string]: boolean };
}
```

#### Methods

| Method | Description |
|--------|-------------|
| `get<K>(key)` | Lấy setting theo key |
| `set<K>(key, value)` | Set setting |
| `isFeatureEnabled(id)` | Kiểm tra feature có bật không |
| `setFeatureEnabled(id, bool)` | Bật/tắt feature |
| `getAll()` | Lấy tất cả settings |
| `save()` | Lưu vào storage |

---

## 🛠️ Utils Module

### DOM Utilities

```typescript
import { 
    waitForElement,
    createElementFromHTML,
    addStyles,
    $,
    $$
} from './utils';
```

#### waitForElement

Chờ element xuất hiện trong DOM.

```typescript
function waitForElement<T extends Element>(
    selector: string,
    timeout?: number  // default: 10000ms
): Promise<T | null>;
```

**Ví dụ:**
```typescript
const header = await waitForElement<HTMLElement>('.main-header');
if (header) {
    header.style.display = 'none';
}
```

---

#### createElementFromHTML

Tạo element từ HTML string.

```typescript
function createElementFromHTML<T extends Element>(html: string): T;
```

**Ví dụ:**
```typescript
const button = createElementFromHTML<HTMLButtonElement>(`
    <button class="my-btn" id="action">
        Click me
    </button>
`);
document.body.appendChild(button);
```

---

#### addStyles

Thêm CSS vào trang (wrapper cho GM_addStyle).

```typescript
function addStyles(css: string): void;
```

**Ví dụ:**
```typescript
addStyles(`
    .my-component {
        background: #fff;
        padding: 16px;
        border-radius: 8px;
    }
`);
```

---

#### $ và $$

Query selector shortcuts.

```typescript
function $(selector: string, parent?: ParentNode): Element | null;
function $$(selector: string, parent?: ParentNode): Element[];
```

**Ví dụ:**
```typescript
const header = $('.header');
const items = $$('.item-list > li');

// Với parent
const container = $('.container');
const btn = $('.btn', container);
```

---

### Logger

```typescript
import { log, createLogger } from './utils';
```

#### Main Logger

```typescript
log.d(...args);  // Debug
log.i(...args);  // Info
log.w(...args);  // Warning
log.e(...args);  // Error
```

#### Create Child Logger

```typescript
const featureLog = createLogger('FeatureName');
featureLog.i('Message');  // ℹ️ [HaUI:FeatureName] Message
```

#### Logger Class

```typescript
class Logger {
    d(...args): void;      // Debug
    i(...args): void;      // Info  
    w(...args): void;      // Warning
    e(...args): void;      // Error
    child(name): Logger;   // Tạo child logger
    setEnabled(bool): void; // Bật/tắt
}
```

---

## 🔌 GM_* APIs (từ vite-plugin-monkey)

Import từ `'$'` (client alias):

```typescript
import { 
    GM_getValue,
    GM_setValue,
    GM_addStyle,
    GM_xmlhttpRequest,
    unsafeWindow,
    monkeyWindow
} from '$';
```

### GM_getValue / GM_setValue

Lưu trữ persistent data.

```typescript
// Lưu
GM_setValue('key', { any: 'data' });

// Đọc
const data = GM_getValue<MyType>('key', defaultValue);
```

### GM_addStyle

Thêm CSS (được wrap trong `addStyles()`).

```typescript
GM_addStyle(`
    body { background: red; }
`);
```

### GM_xmlhttpRequest

HTTP request bypass CORS.

```typescript
GM_xmlhttpRequest({
    method: 'GET',
    url: 'https://api.example.com/data',
    onload: (response) => {
        console.log(response.responseText);
    }
});
```

### unsafeWindow

Truy cập window của trang host.

```typescript
// Gọi function của trang
unsafeWindow.someGlobalFunction();

// Truy cập variable
const data = unsafeWindow.pageData;
```

---

## 📝 TypeScript Types

### Có sẵn trong `vite-env.d.ts`

```typescript
/// <reference types="vite/client" />
/// <reference types="vite-plugin-monkey/client" />
```

### Type cho GM_* APIs

Tự động có type hints khi import từ `'$'`.

---

## 🔗 Links

- [vite-plugin-monkey API](https://github.com/lisonge/vite-plugin-monkey#gm_api-usage)
- [Tampermonkey Documentation](https://www.tampermonkey.net/documentation.php)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
