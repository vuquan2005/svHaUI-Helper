# Hướng dẫn tạo Feature mới

Hướng dẫn chi tiết cách tạo một feature mới trong SV HaUI Helper.

## 📋 Tổng quan

Mỗi feature trong dự án:
- Là một class kế thừa từ `Feature`
- Nằm trong folder riêng: `src/features/<feature-name>/`
- Được đăng ký trong `src/features/index.ts`
- Có thể bật/tắt độc lập qua Settings

## 🚀 Bắt đầu nhanh

### 1. Tạo folder và file

```
src/features/
└── my-feature/
    └── index.ts
```

### 2. Tạo Feature class

```typescript
// src/features/my-feature/index.ts
import { Feature } from '../../core';
import { addStyles, createLogger } from '../../utils';

const log = createLogger('MyFeature');

const styles = `
  .my-feature-container {
    /* CSS của bạn */
  }
`;

export class MyFeature extends Feature {
    constructor() {
        super({
            id: 'my-feature',           // ID duy nhất
            name: 'My Feature',          // Tên hiển thị
            description: 'Mô tả ngắn',   // Mô tả
            urlMatch: /pattern/,         // Optional: URL regex
        });
    }

    init(): void {
        log.i('Đang khởi tạo...');
        addStyles(styles);
        
        // Logic của bạn ở đây
    }

    destroy(): void {
        // Cleanup khi disable (optional)
    }
}
```

### 3. Đăng ký feature

```typescript
// src/features/index.ts
import { MyFeature } from './my-feature';

export const allFeatures: Feature[] = [
    // ... features khác
    new MyFeature(),
];
```

### 4. Test

```bash
pnpm dev
# Mở sv.haui.edu.vn và kiểm tra
```

## 📖 Chi tiết API

### FeatureConfig

```typescript
interface FeatureConfig {
    id: string;          // ID duy nhất, dùng cho settings
    name: string;        // Tên hiển thị cho user
    description: string; // Mô tả tính năng
    urlMatch?: RegExp | string;  // URL pattern để chạy
}
```

### URL Matching

Feature chỉ chạy khi URL match:

```typescript
// Match trang chủ
urlMatch: /sv\.haui\.edu\.vn\/?$/

// Match trang điểm
urlMatch: /sv\.haui\.edu\.vn\/diem/

// Match nhiều trang (dùng |)
urlMatch: /sv\.haui\.edu\.vn\/(diem|hocphi)/

// Match bằng string (contains)
urlMatch: '/diem'

// Không set = chạy mọi trang
// urlMatch: undefined
```

### Lifecycle Methods

```typescript
class MyFeature extends Feature {
    // BẮT BUỘC: Khởi tạo feature
    init(): void {
        // Được gọi khi:
        // - Trang load xong
        // - URL match (nếu có urlMatch)
        // - Feature được bật trong settings
    }

    // TÙY CHỌN: Cleanup
    destroy(): void {
        // Được gọi khi feature bị disable
        // Xóa event listeners, DOM elements, vv.
    }

    // TÙY CHỌN: Override kiểm tra
    shouldRun(): boolean {
        // Mặc định: kiểm tra settings + urlMatch
        // Override để thêm logic custom
        return super.shouldRun() && this.customCondition();
    }
}
```

## 🎨 Styling

### Cách 1: Inline trong file

```typescript
const styles = `
  .my-class {
    color: red;
  }
`;

init() {
    addStyles(styles);
}
```

### Cách 2: File riêng

```typescript
// src/features/my-feature/styles.ts
export const styles = `
  .my-class { ... }
`;

// src/features/my-feature/index.ts
import { styles } from './styles';
```

### CSS Variables (khuyến nghị)

```css
.my-feature {
    /* Màu sắc */
    --primary: #667eea;
    --secondary: #764ba2;
    
    /* Sử dụng */
    background: var(--primary);
}
```

## 🛠️ Utilities có sẵn

### DOM Utilities

```typescript
import { 
    waitForElement, 
    createElementFromHTML,
    addStyles,
    $,
    $$
} from '../../utils';

// Chờ element xuất hiện
const header = await waitForElement<HTMLElement>('.header');

// Tạo element từ HTML
const btn = createElementFromHTML<HTMLButtonElement>(`
    <button class="my-btn">Click</button>
`);

// Query selector ngắn gọn
const el = $('.my-class');
const els = $$('.items');
```

### Logger

```typescript
import { createLogger } from '../../utils';

const log = createLogger('MyFeature');

log.d('Debug');   // 🔍 [HaUI:MyFeature] Debug
log.i('Info');    // ℹ️ [HaUI:MyFeature] Info
log.w('Warning'); // ⚠️ [HaUI:MyFeature] Warning
log.e('Error');   // ❌ [HaUI:MyFeature] Error
```

### Settings

```typescript
import { settings } from '../../core';

// Lưu/đọc settings
settings.set('myKey', 'value');
const value = settings.get('myKey');

// Kiểm tra feature có được bật không
if (settings.isFeatureEnabled('my-feature')) {
    // ...
}
```

### GM_* APIs

```typescript
import { GM_getValue, GM_setValue, GM_addStyle } from '$';

// Lưu trữ persistent
GM_setValue('key', { data: 'value' });
const data = GM_getValue('key', defaultValue);
```

## 📁 Cấu trúc nâng cao

Cho feature phức tạp:

```
src/features/grade-calculator/
├── index.ts           # Export chính + Feature class
├── styles.ts          # CSS
├── constants.ts       # Constants, config
├── types.ts           # TypeScript types
├── utils.ts           # Helper functions
└── components/        # Sub-components
    ├── GpaDisplay.ts
    └── GradeTable.ts
```

## ✅ Checklist trước khi commit

- [ ] Feature có ID duy nhất
- [ ] Có description rõ ràng
- [ ] urlMatch đúng (nếu cần)
- [ ] Sử dụng logger thay vì console.log
- [ ] CSS có prefix để tránh conflict
- [ ] Không có lỗi TypeScript
- [ ] Đã test trên sv.haui.edu.vn

## 💡 Tips

1. **Prefix CSS class**: Dùng prefix như `.svhaui-` hoặc tên feature để tránh xung đột với CSS của trang

2. **Debounce events**: Với event handlers chạy thường xuyên (scroll, resize), dùng debounce

3. **Error handling**: Luôn try-catch khi làm việc với DOM của trang (có thể thay đổi)

4. **Async/await**: Feature `init()` có thể là async

```typescript
async init(): Promise<void> {
    const element = await waitForElement('.target');
    if (!element) {
        log.w('Element not found');
        return;
    }
    // Continue...
}
```