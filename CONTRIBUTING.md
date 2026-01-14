# Hướng dẫn đóng góp

Cảm ơn bạn đã quan tâm đến việc đóng góp cho **SV HaUI Helper**! 🎉

## 📋 Mục lục

- [Quy tắc ứng xử](#quy-tắc-ứng-xử)
- [Cách đóng góp](#cách-đóng-góp)
- [Thiết lập môi trường](#thiết-lập-môi-trường)
- [Quy ước code](#quy-ước-code)
- [Commit convention](#commit-convention)
- [Pull Request](#pull-request)

## 📜 Quy tắc ứng xử

- Tôn trọng lẫn nhau
- Xây dựng, không phá hoại
- Chấp nhận phản hồi mang tính xây dựng

## 🚀 Cách đóng góp

### Báo lỗi (Bug Report)

1. Kiểm tra [Issues](https://github.com/vuquan2005/svHaUI/issues) xem lỗi đã được báo chưa
2. Nếu chưa, tạo issue mới với template Bug Report
3. Mô tả chi tiết: bước tái hiện, kết quả mong đợi, kết quả thực tế

### Yêu cầu tính năng (Feature Request)

1. Tạo issue với template Feature Request
2. Mô tả tính năng và lý do cần thiết
3. Đợi phản hồi trước khi bắt đầu code

### Đóng góp code

1. Fork repository
2. Clone về máy
3. Tạo branch mới từ `main`
4. Code và test
5. Tạo Pull Request

## 🛠️ Thiết lập môi trường

### Yêu cầu

- Node.js >= 18
- pnpm >= 8 (hoặc npm/yarn)
- Tampermonkey/Violentmonkey extension

### Cài đặt

```bash
# Clone repo
git clone https://github.com/vuquan2005/svHaUI.git
cd svHaUI

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

| Loại | Convention | Ví dụ |
|------|------------|-------|
| File/Folder | kebab-case | `grade-calculator/` |
| Class | PascalCase | `GradeCalculator` |
| Function | camelCase | `calculateGpa()` |
| Constant | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Interface | PascalCase + I prefix (optional) | `FeatureConfig` |

### TypeScript

- Luôn định nghĩa type thay vì dùng `any`
- Export interface/type khi cần dùng ở nơi khác
- Sử dụng `strict` mode

### Logging

Sử dụng logger thay vì `console.log`:

```typescript
import { createLogger } from '../../utils';

const log = createLogger('MyFeature');

log.d('Debug info');  // Development only
log.i('Info');        // General info
log.w('Warning');     // Warnings
log.e('Error');       // Errors
```

## 💬 Commit convention

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Mô tả |
|------|-------|
| `feat` | Tính năng mới |
| `fix` | Sửa lỗi |
| `docs` | Thay đổi documentation |
| `style` | Format, không thay đổi logic |
| `refactor` | Refactor code |
| `test` | Thêm/sửa test |
| `chore` | Maintenance |

### Ví dụ

```bash
feat(grade): add GPA calculation feature
fix(notification): fix popup not showing on homepage
docs: update README installation guide
refactor(core): simplify feature manager logic
```

## 🔀 Pull Request

### Trước khi tạo PR

- [ ] Code đã được test trên sv.haui.edu.vn
- [ ] Không có lỗi TypeScript (`pnpm build`)
- [ ] Tuân thủ quy ước code
- [ ] Commit messages đúng convention

### Quy trình review

1. Tạo PR với mô tả chi tiết
2. Link đến issue liên quan (nếu có)
3. Đợi review từ maintainer
4. Sửa theo feedback nếu cần
5. Merge khi được approve

## ❓ Câu hỏi?

Nếu có thắc mắc, hãy tạo issue với label `question` hoặc liên hệ qua GitHub.

---

Cảm ơn bạn đã đóng góp! 🙏
