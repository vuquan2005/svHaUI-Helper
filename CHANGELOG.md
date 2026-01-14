# Changelog

Tất cả thay đổi đáng chú ý của dự án sẽ được ghi lại tại đây.

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
