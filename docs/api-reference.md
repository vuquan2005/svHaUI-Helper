# Tài liệu API

Reference cho các APIs có sẵn trong dự án.

## 📦 Core Module

```typescript
import { Feature, featureManager, settings, storage, log, createLogger } from './core';
```

### Feature

Base class cho tất cả features. Tự động có logger với prefix từ tên feature.

```typescript
interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  urlMatch?: RegExp | string;
}

abstract class Feature {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  protected readonly log: Logger;

  constructor(config: FeatureConfig);
  shouldRun(): boolean;
  abstract init(): void | Promise<void>;
  destroy(): void;
}
```

---

### Storage (Type-safe)

```typescript
import { storage } from './core';
```

Sử dụng `StorageSchema` để type-safe:

```typescript
// 1. Định nghĩa trong src/types/index.ts
interface StorageSchema {
  app_settings: AppSettings;
  grades: CourseGrade[];
}

// 2. Sử dụng với autocomplete
storage.get('grades', []); // → CourseGrade[]
storage.set('grades', data); // Type checked
storage.remove('grades');
storage.keys(); // → ('app_settings' | 'grades')[]
```

---

### Settings

```typescript
import { settings } from './core';

// Feature enable/disable
settings.isFeatureEnabled('feature-id'); // → boolean
settings.setFeatureEnabled('id', true);

// Log level (class-based)
settings.logLevel.getValue(); // → 'debug' | 'info' | 'warn' | 'error' | 'none'
settings.logLevel.setValue('warn');
settings.logLevel.onChange((e) => console.log(e.newValue));

// Boolean settings
settings.captchaUndoTelex.getValue(); // → boolean
settings.captchaUndoTelex.setValue(false);
```

---

### Logger

```typescript
import { log, createLogger } from './core';

// Main logger
log.i('Message'); // ℹ️ [HaUI] Message

// Child logger
const myLog = createLogger('Module');
myLog.i('Message'); // ℹ️ [HaUI:Module] Message

// Methods
log.d(...args); // Debug
log.i(...args); // Info
log.w(...args); // Warning
log.e(...args); // Error
```

**Note**: Features tự động có `this.log` - không cần import.

---

## 🛠️ Utils Module

```typescript
import { waitForElement, createElementFromHTML, addStyles } from './utils';
```

### waitForElement

```typescript
const el = await waitForElement<HTMLElement>('.selector', 10000);
```

### createElementFromHTML

```typescript
const btn = createElementFromHTML<HTMLButtonElement>(`<button>Click</button>`);
```

### addStyles

```typescript
addStyles(`.my-class { color: red; }`);
```

**Note**: Dùng `document.querySelector()` và `document.querySelectorAll()` trực tiếp.

---

## 🔌 GM\_\* APIs

Import từ `'$'`:

```typescript
import { GM_getValue, GM_setValue, GM_addStyle, GM_xmlhttpRequest } from '$';
```

**Khuyến nghị**: Dùng `storage` wrapper thay vì GM_getValue/GM_setValue trực tiếp.

---

## 📝 Types

```typescript
// src/types/index.ts
import type { StorageSchema, AppSettings, CourseGrade } from '../types';
```
