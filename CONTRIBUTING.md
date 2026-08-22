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

## 💬 Commit convention

Dự án sử dụng [Conventional Commits](https://www.conventionalcommits.org/) và được kiểm tra tự động qua [commitlint.config.js](./commitlint.config.js) cùng Husky Git hooks.

### Cấu trúc commit message

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

- `<type>`: Bắt buộc, phải thuộc danh sách được định nghĩa trong `commitlint.config.js`.
- `(<scope>)`: Tùy chọn, tên module/feature bị ảnh hưởng (ví dụ: `captcha`, `timetable`, `storage`, `deps`).
- `<subject>`: Bắt buộc, mô tả ngắn gọn thay đổi (viết chữ thường, không dấu chấm cuối câu, tối đa 120 ký tự).

### Danh sách Type hợp lệ

| Type       | Ý nghĩa                                                        | Ví dụ                                                  |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| `feat`     | Thêm tính năng mới cho người dùng                              | `feat(captcha): auto solve captcha with ONNX`          |
| `fix`      | Sửa lỗi / bug fix                                              | `fix(captcha): prevent auto-submit on hidden elements` |
| `docs`     | Thay đổi hoặc bổ sung tài liệu                                 | `docs: update contributing guide`                      |
| `style`    | Thay đổi format code (whitespace, formatting, không đổi logic) | `style: format with prettier`                          |
| `refactor` | Tái cấu trúc code (không fix bug, không thêm feature)          | `refactor(core): simplify feature manager lifecycle`   |
| `perf`     | Cải thiện hiệu năng                                            | `perf(captcha): cache ONNX model and WASM binaries`    |
| `test`     | Thêm hoặc sửa unit test                                        | `test(utils): add tests for isElementVisible`          |
| `build`    | Thay đổi build system hoặc external dependencies               | `build: update vite config`                            |
| `ci`       | Thay đổi CI/CD configuration files hoặc scripts                | `ci: add commitlint check to pull request workflow`    |
| `chore`    | Các công việc bảo trì khác (deps, config, release)             | `chore(deps): bump typescript from 5.9 to 6.0`         |
| `revert`   | Revert lại một commit trước đó                                 | `revert: feat(captcha): auto submit captcha`           |

### Quy tắc commitlint (`commitlint.config.js`)

- **`type-enum`**: `type` phải thuộc một trong các loại ở bảng trên (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`).
- **`type-empty`**: Không được để trống `type`.
- **`subject-empty`**: Không được để trống `subject`.
- **`subject-max-length`**: `subject` không vượt quá 120 ký tự.

---

## 🔀 Pull Request

Dự án áp dụng quy trình GitHub Flow và **bảo vệ branch `main`** (không commit/push trực tiếp vào `main`). Mọi thay đổi đều phải thông qua Pull Request.

### Quy trình tạo Pull Request

1. **Tạo branch mới từ `main`**:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b <type>/<short-description>
   ```

   _Ví dụ:_ `fix/captcha-hidden-elements`, `feat/export-excel`

2. **Thực hiện thay đổi và kiểm tra chất lượng code**:

   ```bash
   pnpm lint:fix          # Chạy eslint và tự động sửa lỗi
   pnpm format            # Định dạng code với Prettier
   pnpm exec tsc --noEmit # Kiểm tra TypeScript types
   pnpm test              # Chạy toàn bộ test suites
   pnpm build:all         # Kiểm tra build userscript
   ```

3. **Commit theo chuẩn Conventional Commits**:

   ```bash
   git add .
   git commit -m "fix(captcha): prevent auto-submitting hidden captcha elements"
   ```

4. **Push branch lên GitHub và tạo PR**:
   ```bash
   git push -u origin <branch-name>
   gh pr create --title "fix(captcha): prevent auto-submitting hidden captcha elements" --body "..."
   ```

> [!IMPORTANT]
> Tiêu đề của Pull Request (**PR Title**) cũng phải tuân thủ chuẩn Conventional Commits (ví dụ: `fix(captcha): ...`) vì GitHub Actions CI sẽ chạy `commitlint` kiểm tra tiêu đề PR.

---

## 🚀 Quy trình CI/CD & Release

- **CI Kiểm tra PR**: Khi tạo hoặc cập nhật Pull Request, workflow `.github/workflows/pull-request.yml` sẽ tự động chạy:
  1. Kiểm tra tiêu đề PR với Commitlint (`npx commitlint`).
  2. Chạy Linter (`pnpm lint`) & Format check (`pnpm format:check`).
  3. Type check (`tsc --noEmit`).
  4. Chạy Unit Tests (`pnpm test`).
  5. Build Userscript artifact (`pnpm build:all`).
- **Release tự động với Release Please**:
  - Khi PR được merge vào `main`, workflow `.github/workflows/release.yml` sử dụng [Release Please](https://github.com/googleapis/release-please) để phân tích các commit Conventional Commits.
  - Tự động tạo Release PR, tính toán Semantic Versioning (SemVer: `fix` → patch, `feat` → minor, `BREAKING CHANGE` → major), cập nhật `CHANGELOG.md` và phát hành GitHub Release với file userscript `.user.js` đã build.

---

## ❓ Câu hỏi?

Nếu có thắc mắc, hãy tạo issue với label `question` hoặc liên hệ qua GitHub.

---

Cảm ơn bạn đã đóng góp! 🙏

---

**☕ Ủng hộ dự án:** Nếu bạn thấy script này hữu ích, hãy cân nhắc ủng hộ mình qua QR code trong [README.md](./README.md#☕-%E1%BB%A7ng-h%E1%BB%97).
