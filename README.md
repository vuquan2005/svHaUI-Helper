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
  <a href="docs/README_EN.md">English</a> | <strong>Tiếng Việt</strong>
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
  <a href="https://greasyfork.org/vi/scripts/562762-sv-haui-helper">
    <img src="https://img.shields.io/badge/Greasy%20Fork-Script-black?style=flat-square&logo=greasyfork" alt="Greasy Fork">
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

| Tính năng         | Mô tả                                                | Trạng thái |
| ----------------- | ---------------------------------------------------- | ---------: |
| 🏷️ Dynamic Title  | Thay đổi tiêu đề tab theo trang                      |         ✅ |
| 🔐 Captcha Helper | Hỗ trợ nhập captcha (lowercase, bỏ dấu, auto-submit) |         ✅ |
| 🚀 Quick Nav      | Điều hướng nhanh giữa trang Điểm TX và Điểm thi      |         ✅ |

## 🚀 Cài đặt

### Yêu cầu

- Trình duyệt: Chrome, Firefox, Edge, hoặc Safari
- Extension quản lý userscript:
  - [Tampermonkey](https://www.tampermonkey.net/) (Khuyến nghị - Ổn định nhất)
  - [Violentmonkey](https://violentmonkey.github.io/) (Mã nguồn mở)

### Cài đặt nhanh

1. Cài đặt **Tampermonkey** hoặc **Violentmonkey** từ cửa hàng extension của trình duyệt.
2. Chọn **một trong các nguồn** dưới đây để cài đặt script:

| Nguồn             | Link                                                                                                                        | Ghi chú                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Greasy Fork**   | [Cài đặt](https://greasyfork.org/vi/scripts/562762-sv-haui-helper)                                                          | Khuyến nghị - Tự động cập nhật |
| GitHub (readable) | [svhaui-helper.user.js](https://github.com/vuquan2005/svHaUI-Helper/releases/latest/download/svhaui-helper.user.js)         | Dễ đọc, dùng cho dev           |
| GitHub (minified) | [svhaui-helper.min.user.js](https://github.com/vuquan2005/svHaUI-Helper/releases/latest/download/svhaui-helper.min.user.js) | Nhẹ hơn, tự động cập nhật      |

3. Xác nhận cài đặt trong popup của Tampermonkey/Violentmonkey.
4. Truy cập [sv.haui.edu.vn](https://sv.haui.edu.vn) và tận hưởng!

### ⚠️ Lưu ý cho Chrome / Edge (Manifest V3)

Do chính sách bảo mật mới của Google, bạn **bắt buộc** phải cấp quyền thủ công thì Script mới chạy được:

1. Mở trang Quản lý tiện ích: gõ `chrome://extensions` vào thanh địa chỉ.
2. Bật **Developer mode** (Chế độ nhà phát triển) ở góc trên bên phải.
3. Tìm **Tampermonkey/Violentmonkey** → Click nút **Details** (Chi tiết).
4. Kéo xuống tìm và bật công tắc tại dòng:
   > **Cho phép tập lệnh của người dùng** (Allow user scripts)
   > _(Dòng này có chú thích: "Tiện ích này sẽ có thể chạy mã chưa được Google xem xét...")_
5. Nếu thấy popup cảnh báo "Disable developer mode extensions" khi khởi động lại trình duyệt, hãy chọn **Keep (Giữ lại)**.

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

## ☕ Ủng hộ

Nếu bạn thấy dự án hữu ích, hãy cân nhắc ủng hộ tác giả.

<p align="center">
  <img src="assets/donation-qr.png" alt="Donation QR" width="300">
</p>
