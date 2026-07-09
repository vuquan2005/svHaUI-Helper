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

| Tính năng          | Mô tả                                                  | Trạng thái |
| ------------------ | ------------------------------------------------------ | ---------: |
| 🏷️ Dynamic Title   | Thay đổi tiêu đề tab theo trang                        |         ✅ |
| 🔐 Captcha Helper  | Tự động nhận diện (OpenCV + Tesseract) và nhập captcha |         ✅ |
| 🚀 Quick Nav       | Điều hướng nhanh giữa trang Điểm TX và Điểm thi        |         ✅ |
| 📝 Survey Auto     | Đánh giá nhanh (chọn 1-5 điểm cho toàn bộ câu hỏi)     |         ✅ |
| 📅 Calendar Export | Xuất thời khóa biểu sang file ICS, theo dõi cập nhật   |         ✅ |
| ❄️ Remove Snowfall | Ẩn hiệu ứng tuyết rơi trên trang                       |         ✅ |

## 🚀 Cài đặt

### Yêu cầu

- Trình duyệt: Chrome, Firefox, Edge, hoặc Safari
- Extension quản lý userscript:
  - [Tampermonkey](https://www.tampermonkey.net/)
  - [Violentmonkey](https://violentmonkey.github.io/)

### Cài đặt nhanh

1. Cài đặt **Tampermonkey**[[Chrome]](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)[[FireFox]](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) hoặc **Violentmonkey**[[Chrome]](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)[[FireFox]](https://addons.mozilla.org/vi/firefox/addon/violentmonkey/) từ cửa hàng extension của trình duyệt.
2. Chọn **một trong các nguồn** dưới đây để cài đặt script:

| Nguồn               | Link                                                                                                                        | Ghi chú                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Greasy Fork**     | [Cài đặt](https://greasyfork.org/vi/scripts/562762-sv-haui-helper)                                                          | ⭐ Khuyến nghị. Tự động cập nhật. Thích hợp cho đa số người dùng.                                                       |
| GitHub (minified)   | [svhaui-helper.min.user.js](https://github.com/vuquan2005/svHaUI-Helper/releases/latest/download/svhaui-helper.min.user.js) | Nhẹ hơn, nhận bản cập nhật trực tiếp từ kho lưu trữ.                                                                    |
| GitHub (unminified) | [svhaui-helper.user.js](https://github.com/vuquan2005/svHaUI-Helper/releases/latest/download/svhaui-helper.user.js)         | Bản build dễ đọc hơn. Dành để kiểm tra mã (chưa nén). Cài đặt bản mới nhất tại thời điểm tải và không tự động cập nhật. |

3. Xác nhận cài đặt trong popup của Tampermonkey/Violentmonkey.
4. Truy cập [sv.haui.edu.vn](https://sv.haui.edu.vn) và tận hưởng!

### ⚠️ Lưu ý cho Chrome / Edge (Manifest V3)

Do chính sách bảo mật mới của Google, bạn **bắt buộc** phải cấp quyền thủ công thì Script mới chạy được:

1. Mở trang Quản lý tiện ích: gõ `chrome://extensions` vào thanh địa chỉ.
2. Bật **Developer mode** (Chế độ nhà phát triển) ở góc trên bên phải.

![Bật Chế độ nhà phát triển](./assets/enable_extension_dev_mode.png)

3. Tìm **Tampermonkey/Violentmonkey** → Click nút **Details** (Chi tiết).
4. Kéo xuống tìm và bật công tắc tại dòng:

   > **Cho phép tập lệnh của người dùng** (Allow user scripts)

![Cho phép chèn script](./assets/allow_user_script.png)

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
