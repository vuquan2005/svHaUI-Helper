# Tài liệu API

Reference chi tiết cho các APIs có sẵn trong dự án.

## 📦 Core Module

```typescript
import { Feature, featureManager, settings, storage, log, createLogger } from './core';
```

### Feature Manager

Quản lý vòng đời của các features trong ứng dụng.

```typescript
// Đăng ký feature (thường dùng trong main.ts)
featureManager.register(new MyFeature());
featureManager.registerAll([feature1, feature2]);

// Áp dụng các feature dựa trên URL hiện tại (chạy feature mới, dọn dẹp feature cũ)
await featureManager.applyFeatures();

// Kiểm tra trạng thái
featureManager.isRunning('feature-id'); // → boolean

// Điều khiển thủ công (nếu cần)
await featureManager.startFeature('feature-id');
featureManager.stopFeature('feature-id');

// Lấy instance feature
const feature = featureManager.get('feature-id');
```

---

### Feature Base Class

Base class cho tất cả features. Hỗ trợ priority, auto-logger, và lifecycle management.

```typescript
interface MatchPattern {
  pattern: string | RegExp;
  name?: string; // Tên định danh (VD: "login")
}

interface FeatureConfig {
  id: string; // ID duy nhất
  name: string; // Tên hiển thị
  description: string; // Mô tả
  priority?: number; // Độ ưu tiên (cao chạy trước, mặc định 0)
  urlMatch?: RegExp | string | MatchPattern | MatchPattern[]; // Pattern URL
}

abstract class Feature {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly priority: number;

  // Location wrapper (Normalized)
  protected readonly location: WindowLocationWrapper;

  // Logger tự động (Lazy loaded)
  protected readonly log: Logger;

  constructor(config: FeatureConfig);

  // Lifecycle methods

  // 1. Kiểm tra URL (Override nếu cần custom logic)
  shouldRun(): boolean;

  // 2. Chạy feature (Bắt buộc implement)
  abstract run(): void | Promise<void>;

  // 3. Dọn dẹp resource (Tùy chọn)
  cleanup(): void;
}
```

---

### Storage (Type-safe)

```typescript
import { storage } from './core';
```

Wrapper type-safe cho `GM_getValue` / `GM_setValue` / `localStorage`.

```typescript
// 1. Định nghĩa Schema trong src/types/index.ts
interface StorageSchema {
  app_settings: AppSettings;
  grades: CourseGrade[];
  captcha_undo_telex: boolean;
}

// 2. Sử dụng (Type checked)
storage.get('grades', []); // → CourseGrade[]
storage.set('grades', data); // Lưu dữ liệu
storage.remove('grades'); // Xóa
storage.keys(); // → ('app_settings' | 'grades')[]
```

---

### Settings

```typescript
import { settings } from './core';
```

Quản lý cấu hình người dùng (Features toggle & Application settings).

```typescript
// Feature Enable/Disable
const enabled = settings.isFeatureEnabled('feature-id');
settings.setFeatureEnabled('feature-id', true);

// Log Level Configuration
settings.logLevel.getValue(); // → 'debug' | 'info' | 'warn' | 'error' | 'none'
settings.logLevel.setValue('warn');
```

---

### Logger

```typescript
import { log, createLogger } from './core';
```

Hệ thống logging với prefix và log levels.

```typescript
// Global logger
log.i('App started'); // ℹ️ [HaUI] App started

// Custom logger cho module riêng
const myLog = createLogger('MyModule');
myLog.d('Debug info'); // 🔍 [HaUI:MyModule] Debug info

// Log Levels
log.d(obj); // Debug (chỉ hiện khi LogLevel <= Debug)
log.i(msg); // Info
log.w(msg); // Warning
log.e(err); // Error
```

**Note**: Trong class kế thừa `Feature`, hãy dùng `this.log` có sẵn.

---

## 🛠️ Utils Module

Các tiện ích hỗ trợ thao tác DOM và xử lý dữ liệu.

```typescript
import {
  waitForElement,
  createElementFromHTML,
  addStyles,
  removeDiacritics,
  normalizeCaptchaInput,
  browserLocation,
} from './utils';
```

### waitForElement

Đợi một element xuất hiện trong DOM (hữu ích cho SPA/Dynamic content).

```typescript
// Đợi tối đa 10s cho .target-element
const el = await waitForElement<HTMLElement>('.target-element', 10000);
```

### createElementFromHTML

Tạo DOM element từ chuỗi HTML.

```typescript
const btn = createElementFromHTML<HTMLButtonElement>(`<button class="btn">Click me</button>`);
```

### addStyles

Inject CSS vào trang.

```typescript
addStyles(`
  .custom-class { 
    color: red; 
    background: #fff;
  }
`);
```

### Text Utils

Xử lý văn bản tiếng Việt và Captcha.

```typescript
// Xóa dấu tiếng Việt
removeDiacritics('Tiếng Việt'); // "Tieng Viet"

// Chuẩn hóa input Captcha (lowercase + xóa dấu + bỏ ký tự lạ)
normalizeCaptchaInput('ĐâylàCaptcha123'); // "daylacaptcha123"

// Hoàn tác Telex cho Captcha (VD: "as" -> "á" -> undo -> "as")
normalizeCaptchaInputUndo('tias'); // "tias" (giữ nguyên input gốc thay vì thành "tía")
```

### Window Location

Wrapper giúp xử lý URL nhất quán (bỏ trailing slash, chuẩn hóa).

```typescript
// Feature có sẵn this.location hoặc dùng browserLocation
const path = browserLocation.path; // "/dashboard" (không có / ở cuối)
const query = browserLocation.search; // "?q=1"
```

````

---

## 📝 Types

Các định nghĩa TypeScript quan trọng.

```typescript
// src/types/index.ts
import type { StorageSchema, AppSettings, CourseGrade } from '../types';
````
