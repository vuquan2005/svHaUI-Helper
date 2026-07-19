# Hướng dẫn đóng góp

Cảm ơn bạn đã quan tâm đến việc đóng góp cho **SV HaUI Helper**! 🎉

## 📋 Mục lục

- [Thiết lập môi trường](#thiết-lập-môi-trường)
- [Quy ước code](#quy-ước-code)
- [Commit convention](#commit-convention)
- [Pull Request](#pull-request)
- [Quy trình CI/CD & Release](#quy-trình-cicd--release)

## 🛠️ Thiết lập môi trường

### Yêu cầu

- Node.js >= 24
- pnpm >= 8 (hoặc npm/yarn)
- Tampermonkey/Violentmonkey extension

### Cài đặt

```bash
# Clone repo
git clone https://github.com/vuquan2005/svHaUI-Helper.git
cd svHaUI-Helper

# Cài dependencies
pnpm install

# Chạy dev server
pnpm dev
```

### Cài đặt userscript dev

1. Mở `http://localhost:5173/`
2. Click vào link `.user.js` để cài vào Tampermonkey
3. Mỗi khi save code, script sẽ tự động reload

## 📝 Quy ước code

### Cấu trúc file

```
src/
├── core/           # Core modules (không sửa trừ khi cần thiết)
├── features/       # Tính năng (thêm feature mới ở đây)
│   └── [name]/
│       ├── index.ts      # Export chính
│       ├── styles.ts     # CSS (optional)
│       └── components/   # Sub-components (optional)
└── utils/          # Utilities dùng chung
```

### Naming conventions

| Loại        | Convention                       | Ví dụ               |
| ----------- | -------------------------------- | ------------------- |
| File/Folder | kebab-case                       | `grade-calculator/` |
| Class       | PascalCase                       | `GradeCalculator`   |
| Function    | camelCase                        | `calculateGpa()`    |
| Constant    | UPPER_SNAKE                      | `MAX_RETRY_COUNT`   |
| Interface   | PascalCase + I prefix (optional) | `FeatureConfig`     |

### TypeScript

- Luôn định nghĩa type thay vì dùng `any`
- Export interface/type khi cần dùng ở nơi khác
- Sử dụng `strict` mode

### Logging

Sử dụng logger thay vì `console.log`:

```typescript
import { createLogger } from '../../core';

const log = createLogger('MyFeature');

log.d('Debug info'); // Development only
log.i('Info'); // General info
log.w('Warning'); // Warnings
log.e('Error'); // Errors
```

## ❓ Câu hỏi?

Nếu có thắc mắc, hãy tạo issue với label `question` hoặc liên hệ qua GitHub.

---

Cảm ơn bạn đã đóng góp! 🙏

---

**☕ Ủng hộ dự án:** Nếu bạn thấy script này hữu ích, hãy cân nhắc ủng hộ mình qua QR code trong [README.md](./README.md#☕-%E1%BB%A7ng-h%E1%BB%97).
