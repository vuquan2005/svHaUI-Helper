# Hướng dẫn tạo Feature mới

Hướng dẫn chi tiết cách tạo một feature mới trong SV HaUI Helper.

## 📋 Tổng quan

Mỗi feature trong dự án:

- Là một class kế thừa từ `Feature`
- Nằm trong folder riêng: `src/features/<feature-name>/`
- Được đăng ký trong `src/features/index.ts`
- Có thể bật/tắt độc lập qua Settings
- **Tự động có logger** với prefix từ tên feature

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
import { addStyles } from '../../utils';

const styles = `
  .my-feature-container {
    /* CSS của bạn */
  }
`;

export class MyFeature extends Feature {
  constructor() {
    super({
      id: 'my-feature',
      name: 'My Feature',
      description: 'Mô tả ngắn',
      urlMatch: /pattern/, // Optional
    });
  }

  init(): void {
    // this.log tự động có prefix [HaUI:My Feature]
    this.log.i('Đang khởi tạo...');
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

export const allFeatures: Feature[] = [new MyFeature()];
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
  id: string; // ID duy nhất, dùng cho settings
  name: string; // Tên hiển thị + prefix cho logger
  description: string; // Mô tả tính năng
  urlMatch?: RegExp | string; // URL pattern để chạy
}
```

### Logger tự động

Mỗi feature đã có sẵn `this.log`:

```typescript
class MyFeature extends Feature {
  init(): void {
    this.log.d('Debug'); // 🔍 [HaUI:My Feature] Debug
    this.log.i('Info'); // ℹ️ [HaUI:My Feature] Info
    this.log.w('Warning'); // ⚠️ [HaUI:My Feature] Warning
    this.log.e('Error'); // ❌ [HaUI:My Feature] Error
  }
}
```

### URL Matching

```typescript
// Match trang chủ
urlMatch: /sv\.haui\.edu\.vn\/?$/;

// Match trang điểm
urlMatch: /sv\.haui\.edu\.vn\/diem/;

// Match bằng string (contains)
urlMatch: '/diem';

// Không set = chạy mọi trang
```

### Lifecycle Methods

```typescript
class MyFeature extends Feature {
  // BẮT BUỘC: Khởi tạo feature
  init(): void | Promise<void> {}

  // TÙY CHỌN: Cleanup
  destroy(): void {}

  // TÙY CHỌN: Override kiểm tra
  shouldRun(): boolean {
    return super.shouldRun() && this.customCondition();
  }
}
```

## 🛠️ Utilities

Xem chi tiết các APIs: [API Reference](api-reference.md)

## 💡 Tips

- **CSS prefix**: Dùng prefix như `.svhaui-` để tránh xung đột
- **Error handling**: Luôn try-catch khi làm việc với DOM
- **Async/await**: `init()` có thể là async
