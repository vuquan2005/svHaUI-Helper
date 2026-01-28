# Changelog

Tất cả thay đổi đáng chú ý của dự án sẽ được ghi lại tại đây.

## [2.3.0] - 2026-01-29

### Added

- **Quick Evaluation (Survey Autofill)**:
  - Hỗ trợ đánh giá nhanh trên trang khảo sát (`/survey/view`)
  - Click vào tiêu đề cột (1-5) để chọn tất cả mục tương ứng
  - Tự động nhận diện bảng khảo sát trong modal
  - Giao diện trực quan với hover effect

## [2.2.0] - 2026-01-26

### Added

- **Quick Navigation**:
  - Thêm mô tả chi tiết cho từng link trong menu nhanh
  - Cải thiện giao diện hiển thị danh sách link
- **Settings**:
  - "Undo Telex" tự động cập nhật settings khi có thay đổi từ storage
- **Core**: Thêm thông tin `buildTime` vào log banner khi script khởi chạy

### Refactored

- **Dynamic Title**: Tách `URL_TITLE_MAP` ra module riêng và loại bỏ việc cắt ngắn title
- **Quick Navigation**: Tối ưu logic `generateNavLinks`
- **Storage**: Cập nhật cơ chế storage với fallback (GM4/GM3)

## [2.1.0] - 2026-01-24

### Refactored

- **Feature Manager**:
  - Implement Priority System for features (features with higher priority run first)
  - Rename `initAll()` to `applyFeatures()`
  - Rename `init()`/`destroy()` to `run()`/`cleanup()` in Feature base class
  - Add `startFeature()` and `stopFeature()` methods for dynamic control

### Documentation

- Update `docs/api-reference` with new TypeDoc structure
- Update Feature Creation Guide to match new API

## [2.0.0] - 2026-01-18

### Refactored

- **Settings**: Tái cấu trúc hoàn toàn Settings sang class-based system
  - Thay thế object literals bằng các class kế thừa (`BaseSetting`, `BooleanSetting`, `SelectSetting`)
  - Mỗi setting là một instance riêng biệt với `key`, `label`, `description`, `defaultValue`
  - Hỗ trợ mở rộng dễ dàng cho các loại setting mới
- **Constants**: Thêm `constants.ts` để tập trung quản lý các giá trị mặc định
- **Settings Access**: Thay đổi cách sử dụng settings từ property access sang instance methods

## [1.2.1] - 2026-01-15

### Changed

- **License**: Update license to GPL-3.0
- **Documentation**:
  - Update README to English
  - Preserve Vietnamese README as `README.vi.md`
  - Add language navigation

## [1.2.0] - 2026-01-15

### Added

- **Captcha Helper Feature**: Hỗ trợ nhập captcha tự động
  - Tự động chuyển chữ hoa → thường
  - Loại bỏ dấu tiếng Việt (á → a, đ → d)
  - Chỉ giữ ký tự a-z, 0-9
  - Auto-submit khi nhấn Enter hoặc blur (đủ 5 ký tự)
  - Debounce 150ms để tránh xung đột với IME tiếng Việt
  - Hỗ trợ 2 trang: SSO login (`/sso?token=`) và Register (`/register/`)
  - Kiến trúc mở rộng (`CaptchaPageHandler`) cho các trang khác

### Added (Utilities)

- `text-utils.ts`: Thêm các hàm xử lý text
  - `removeDiacritics()`: Loại bỏ dấu tiếng Việt
  - `diacriticsToTelex()`: Chuyển dấu thành phím Telex
  - `keepAlphanumeric()`: Chỉ giữ a-z, 0-9
  - `normalizeCaptchaInput()`: Normalize cho captcha

### Documentation

- Thêm `docs/pages/captcha.md`: DOM selectors cho các trang captcha
- Cập nhật `docs/pages/haui-structure.md`: Thêm section Authentication

---

## [1.1.0] - 2026-01-15

### Added

- **Dynamic Title Feature**: Thay đổi `document.title` dựa trên trang đang xem
  - 30+ URL mappings cho các trang menu
  - 6 dynamic patterns cho trang cần context (chi tiết HP, KQ lớp, KQ bạn)
  - MutationObserver để update title khi content thay đổi
  - Format: `[Icon] [Title] | HaUI`

### Changed

- **Build system**: Thêm minified build output
  - `pnpm build` → readable (`svhaui-helper.user.js`)
  - `pnpm build:minify` → minified (`svhaui-helper.min.user.js`)
  - `pnpm build:all` → cả hai
- **Metadata**: Thêm `@license`, `@homepageURL`, `@supportURL` cho Greasy Fork

### Infrastructure

- **GitHub Actions CI**: Type-check và build tự động trên push/PR
- **GitHub Actions Release**: Tự động tạo release khi push tag `v*`

### Documentation

- Thêm `docs/pages/` với chi tiết selectors cho từng loại trang:
  - `haui-structure.md` - Cấu trúc tổng quan website
  - `course-detail.md` - Selectors trang chi tiết học phần
  - `class-result.md` - Selectors trang kết quả lớp
  - `friend-result.md` - Selectors trang kết quả bạn

## [1.0.0] - 2026-01-14

### Added

- Initial release
- Core architecture: Feature base class, Logger, Settings, Storage
- Example Feature template
