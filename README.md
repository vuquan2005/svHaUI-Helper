<p align="center">
  <img src="assets/logo.png" alt="Logo" width="80" height="80">
  <h1 align="center">SV HaUI Helper</h1>
  <p align="center">
    🎓 Nâng cao trải nghiệm cho sinh viên HaUI
    <br />
    <a href="https://github.com/vuquan2005/svHaUI-Helper/issues">Báo lỗi</a>
    ·
    <a href="https://github.com/vuquan2005/svHaUI-Helper/issues">Yêu cầu tính năng</a>
  </p>
</p>

<p align="center">
  <a href="https://github.com/vuquan2005/svHaUI-Helper/releases">
    <img src="https://img.shields.io/github/v/release/vuquan2005/svHaUI-Helper?style=flat-square" alt="Release">
  </a>
  <a href="https://github.com/vuquan2005/svHaUI-Helper/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/vuquan2005/svHaUI-Helper?style=flat-square" alt="License">
  </a>
  <a href="https://github.com/vuquan2005/svHaUI-Helper/stargazers">
    <img src="https://img.shields.io/github/stars/vuquan2005/svHaUI-Helper?style=flat-square" alt="Stars">
  </a>
</p>

---

## 📖 Giới thiệu

**SV HaUI Helper** là một userscript được thiết kế để cải thiện trải nghiệm sử dụng cổng thông tin sinh viên [sv.haui.edu.vn](https://sv.haui.edu.vn) của Đại học Công nghiệp Hà Nội (HaUI).

Dự án được xây dựng với kiến trúc module hóa, dễ dàng mở rộng và bảo trì.

## ✨ Tính năng

- 🚀 **Tích hợp sẵn sàng** - Hoạt động ngay khi cài đặt
- ⚙️ **Cài đặt linh hoạt** - Bật/tắt từng tính năng theo ý muốn
- 🎨 **Giao diện đẹp** - UI hiện đại, thân thiện
- 💾 **Lưu trữ cục bộ** - Cài đặt được lưu trên trình duyệt

### Tính năng hiện có

| Tính năng | Mô tả | Trạng thái |
|-----------|-------|-----------:|
| 🏷️ Dynamic Title | Thay đổi tiêu đề tab theo trang | ✅ |
| 🔐 Captcha Helper | Hỗ trợ nhập captcha (lowercase, bỏ dấu, auto-submit) | ✅ |

## 🚀 Cài đặt

### Yêu cầu

- Trình duyệt: Chrome, Firefox, Edge, hoặc Safari
- Extension quản lý userscript:
  - [Tampermonkey](https://www.tampermonkey.net/) (Khuyến nghị)
  - [Violentmonkey](https://violentmonkey.github.io/)
  - [Greasemonkey](https://www.greasespot.net/) (Firefox)

### Cài đặt nhanh

1. Cài đặt Tampermonkey hoặc Violentmonkey từ cửa hàng extension
2. [Nhấn vào đây để cài đặt userscript](https://github.com/vuquan2005/svHaUI-Helper/releases/latest/download/svhaui-helper.user.js)
3. Xác nhận cài đặt trong popup của Tampermonkey
4. Truy cập [sv.haui.edu.vn](https://sv.haui.edu.vn) và tận hưởng!

### ⚠️ Lưu ý cho Chrome (Manifest V3)

Từ Chrome 127+, Google yêu cầu bật **Developer Mode** để sử dụng userscript extensions.

#### Cách bật Developer Mode:

1. Mở `chrome://extensions` trong thanh địa chỉ
2. Bật **Developer mode** (góc trên bên phải)
3. Tìm **Tampermonkey** → Click **Details** (Chi tiết)
4. Bật **Allow access to file URLs** (nếu có)
5. Khởi động lại trình duyệt
6. Khi thấy popup cảnh báo "Disable developer mode extensions", chọn **Keep**

#### Tại sao cần làm điều này?

- Chrome Manifest V3 giới hạn khả năng của extensions
- Tampermonkey cần Developer Mode để inject scripts
- Đây là yêu cầu từ Google, không phải lỗi của extension

#### Trình duyệt thay thế (không cần Developer Mode):

| Trình duyệt | Hỗ trợ | Ghi chú |
|-------------|--------|---------|
| Firefox | ✅ | Khuyến nghị - không giới hạn |
| Edge | ⚠️ | Tương tự Chrome |
| Brave | ⚠️ | Tương tự Chrome |
| Opera | ⚠️ | Tương tự Chrome |


## 🛠️ Phát triển

### Yêu cầu

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (khuyến nghị) hoặc npm

### Thiết lập môi trường

```bash
# Clone repository
git clone https://github.com/vuquan2005/svHaUI-Helper.git
cd svHaUI-Helper

# Cài đặt dependencies
pnpm install

# Chạy development server
pnpm dev
```

Development server sẽ chạy tại `http://localhost:5173/`. Mở URL này trong trình duyệt để cài đặt development version của userscript.

### Build production

```bash
# Build readable (cho Greasy Fork)
pnpm build

# Build minified (nhẹ hơn, cho GitHub Releases)
pnpm build:minify

# Build cả hai
pnpm build:all
```

| Output | Kích thước | Dùng cho |
|--------|------------|----------|
| `dist/svhaui-helper.user.js` | ~14 KB | Greasy Fork, development |
| `dist/svhaui-helper.min.user.js` | ~9 KB | GitHub Releases |

### Release

Khi push tag `v*`, GitHub Actions sẽ tự động:
1. Build cả 2 phiên bản
2. Tạo GitHub Release với assets đính kèm

```bash
git tag v1.2.0
git push origin main --tags
```


## 📁 Cấu trúc dự án

```
svHaUI-Helper/
├── src/
│   ├── main.ts              # Entry point chính
│   ├── vite-env.d.ts        # Type definitions
│   │
│   ├── core/                # Core modules
│   │   ├── feature.ts       # Base class cho features
│   │   ├── feature-manager.ts
│   │   ├── settings.ts      # Quản lý cài đặt
│   │   └── index.ts
│   │
│   │   ├── dynamic-title/   # Tiêu đề động
│   │   ├── captcha-helper/  # Hỗ trợ captcha
│   │   └── index.ts         # Registry
│   │
│   └── utils/               # Tiện ích
│       ├── dom.ts           # DOM helpers
│       ├── text-utils.ts    # Text processing
│       └── index.ts
│
├── dist/                    # Build output
├── vite.config.ts           # Vite + monkey config
├── tsconfig.json
└── package.json
```

## 🔧 Thêm tính năng mới

### 1. Tạo feature class

```typescript
// src/features/my-feature/index.ts
import { Feature } from '../../core';
import { addStyles } from '../../utils';

export class MyFeature extends Feature {
    constructor() {
        super({
            id: 'my-feature',
            name: 'My Feature',
            description: 'Mô tả tính năng',
            urlMatch: /sv\.haui\.edu\.vn\/some-page/,  // Optional
        });
    }

    init(): void {
        // Logic khởi tạo
        console.log('My Feature initialized!');
    }

    destroy(): void {
        // Cleanup khi disable
    }
}
```

### 2. Đăng ký feature

```typescript
// src/features/index.ts
import { MyFeature } from './my-feature';

export const allFeatures: Feature[] = [
    // ... existing features
    new MyFeature(),
];
```

### 3. Test và build

```bash
pnpm dev    # Development
pnpm build  # Production
```

## 📚 Tài liệu

| Tài liệu | Mô tả |
|----------|-------|
| [Hướng dẫn tạo Feature](docs/creating-features.md) | Chi tiết cách tạo feature mới |
| [API Reference](docs/api-reference.md) | Tham khảo các APIs có sẵn |
| [Contributing](CONTRIBUTING.md) | Quy trình đóng góp |

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết.

### Quy trình đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## 👤 Tác giả

**VuQuan**

- GitHub: [@vuquan2005](https://github.com/vuquan2005)

## 🙏 Cảm ơn

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - Vite plugin để build userscript
- [Tampermonkey](https://www.tampermonkey.net/) - Userscript manager
- HaUI - Đại học Công nghiệp Hà Nội

---

<p align="center">
  Made with ❤️ for HaUI Students
</p>
