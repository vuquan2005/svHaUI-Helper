# Hướng dẫn tạo Feature mới

Hướng dẫn chi tiết cách tạo một feature mới trong SV HaUI Helper.

## 📋 Tổng quan

Mỗi feature trong dự án:

- Là một class kế thừa từ `Feature`
- Nằm trong folder riêng: `src/features/<feature-name>/`
- Được đăng ký trong `src/features/index.ts`
- Có thể bật/tắt độc lập qua Settings
- **Tự động có logger** với prefix từ tên feature
- **Tự động có storage** scope theo feature ID

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

  run(): void {
    // this.log tự động có prefix [HaUI:My Feature]
    this.log.i('Đang khởi tạo...');
    addStyles(styles);

    // Logic của bạn ở đây
  }

  cleanup(): void {
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
import { MatchPattern } from '../../core';

type UrlMatchConfig = RegExp | string | MatchPattern | MatchPattern[];

interface FeatureConfig {
  id: string; // ID duy nhất, dùng cho settings
  name: string; // Tên hiển thị + prefix cho logger
  description: string; // Mô tả tính năng
  priority?: number; // Độ ưu tiên (cao chạy trước, mặc định 0)
  urlMatch?: UrlMatchConfig; // URL pattern để chạy
}
```

### Built-in Properties

Mỗi feature được kế thừa các properties hữu ích:

```typescript
class MyFeature extends Feature<MySettings> {
  run(): void {
    // 1. Logger (prefix tự động)
    this.log.i('Info message');

    // 2. Storage (persist settings)
    const value = this.storage.get('key');
    this.storage.set('key', 'value');

    // 3. Location info
    console.log(this.location.path); // /path/only
    console.log(this.location.pathAndQuery); // /path?query=1

    // 4. Match Result (kết quả URL matching)
    if (this.matchResult?.matched) {
      console.log('Matched pattern:', this.matchResult.matchName);
    }
  }
}
```

### URL Matching

Hỗ trợ nhiều kiểu match linh hoạt:

```typescript
// 1. String: Match chính xác pathname (bỏ qua query param)
urlMatch: '/sv/diem';

// 2. RegExp: Match trên toàn bộ path + query
urlMatch: /\/sv\.haui\.edu\.vn\/diem.*?view=print/;

// 3. MatchPattern Object (kèm tên để phân loại)
urlMatch: {
  name: 'print-view',
  pattern: /view=print/
};

// 4. Array (Nhiều pattern)
urlMatch: [
  { name: 'list', pattern: '/sv/khao-sat' },
  { name: 'detail', pattern: /\/sv\/khao-sat\/.*?/ }
];

// 5. Không set = Chạy mọi trang
```

Khi dùng Array hoặc RegExp, bạn có thể kiểm tra `this.matchResult` trong `run()` để biết pattern nào đã khớp.

### Lifecycle & Feature Manager

`FeatureManager` quản lý việc bật tắt feature dựa trên URL và settings:

1.  **Priority**: Feature có `priority` cao hơn sẽ được xử lý trước.
2.  **Apply Loop** (`applyFeatures`):
    - **Phase 1 (Stop)**: Dừng các feature đang chạy nhưng không còn hợp lệ (do đổi URL hoặc bị tắt). Gọi `cleanup()`.
    - **Phase 2 (Start)**: Khởi chạy các feature chưa chạy nhưng hợp lệ. Gọi `run()`.

```typescript
class MyFeature extends Feature {
  // BẮT BUỘC: Chạy logic chính
  // Có thể là async
  async run(): Promise<void> {
    await this.loadData();
    this.render();
  }

  // TÙY CHỌN: Dọn dẹp
  // Gọi khi URL thay đổi không còn match hoặc user tắt feature
  cleanup(): void {
    document.querySelector('.my-component')?.remove();
  }

  // TÙY CHỌN: Logic điều kiện nâng cao
  // Mặc định đã check URL match
  shouldRun(): boolean {
    return super.shouldRun() && this.someCustomCondition();
  }
}
```

## 🛠️ Utilities

Xem chi tiết các APIs: [API Reference](api-reference.md)

## 💡 Tips

- **CSS prefix**: Dùng prefix như `.svhaui-` để tránh xung đột
- **Error handling**: Luôn try-catch khi làm việc với DOM
- **Async/await**: `run()` có thể là async
