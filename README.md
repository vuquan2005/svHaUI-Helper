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

**SV HaUI Helper** là một tiện ích mở rộng trình duyệt (Web Extension) được thiết kế để cải thiện trải nghiệm sử dụng cổng thông tin sinh viên [sv.haui.edu.vn](https://sv.haui.edu.vn) của Đại học Công nghiệp Hà Nội (HaUI).

Dự án hoạt động **offline 100%**, tích hợp mô hình AI ONNX nhận diện captcha ngay trên máy bạn và giao diện popup trực quan, bảo mật và tốc độ cao.

## ✨ Tính năng

| Tính năng          | Mô tả                                                                      | Trạng thái |
| ------------------ | -------------------------------------------------------------------------- | ---------: |
| 🏷️ Dynamic Title   | Thay đổi tiêu đề tab theo trang                                            |         ✅ |
| 🔐 Captcha Helper  | Tự động nhận diện (Transfer learning PP-OCRv4 Mobile ONNX) và nhập captcha |         ✅ |
| 📊 Grade Helper    | Tô màu điểm số, chỉnh sửa điểm giả lập và dự đoán mục tiêu GPA tốt nghiệp  |         ✅ |
| 🚀 Quick Nav       | Điều hướng nhanh giữa trang Điểm TX và Điểm thi                            |         ✅ |
| 📝 Survey Auto     | Đánh giá nhanh (chọn 1-5 điểm cho toàn bộ câu hỏi)                         |         ✅ |
| 📅 Calendar Export | Xuất thời khóa biểu sang file ICS, theo dõi cập nhật                       |         ✅ |
| 📋 Exam Helper     | Đếm ngược, tổng hợp kế hoạch thi và xuất lịch thi sang file ICS            |         ✅ |
| ❄️ Remove Snowfall | Ẩn hiệu ứng tuyết rơi trên trang                                           |         ✅ |
| 🎛️ Popup Menu      | Menu điều khiển nhanh, bật/tắt tính năng theo nhu cầu, đếm ngược thi       |         ✅ |

## 🚀 Cài đặt

### Cài đặt từ GitHub Releases (Khuyến nghị)

#### 🌐 Cho Microsoft Edge / Google Chrome / Cốc Cốc / Brave

1. Tải bản mới nhất `svhaui-helper-<version>-chrome.zip` tại [GitHub Releases](https://github.com/vuquan2005/svHaUI-Helper/releases/latest).
2. Giải nén file `.zip` vào một thư mục trên máy tính của bạn (lưu ý không xóa thư mục này sau khi cài).
3. Mở trình duyệt và truy cập:
   - Edge: `edge://extensions`
   - Chrome / Brave / Cốc Cốc: `chrome://extensions`
4. Bật công tắc **Developer mode** (Chế độ cho nhà phát triển) ở góc trên bên phải hoặc menu bên trái.
5. Nhấp nút **Load unpacked** (Tải tiện ích đã giải nén) và chọn thư mục vừa giải nén.
6. Truy cập [sv.haui.edu.vn](https://sv.haui.edu.vn) và tận hưởng!

#### 🦊 Cho Mozilla Firefox

1. Tải file `svhaui-helper-<version>-firefox.zip` tại [GitHub Releases](https://github.com/vuquan2005/svHaUI-Helper/releases/latest).
2. Trên thanh địa chỉ Firefox, gõ `about:debugging#/runtime/this-firefox` và nhấn Enter.
3. Bấm **Load Temporary Add-on...** (Tải tiện ích tạm thời...) và chọn file zip vừa tải.

---

## 🛠️ Phát triển

### Yêu cầu

- [Node.js](https://nodejs.org/) >= 24
- [pnpm](https://pnpm.io/) >= 9

### Thiết lập môi trường

```bash
# Clone repository
git clone https://github.com/vuquan2005/svHaUI-Helper.git
cd svHaUI-Helper

# Cài đặt dependencies
pnpm install

# Khởi chạy extension ở chế độ Development (Chromium / Edge)
pnpm dev

# Hoặc khởi chạy trên Firefox
pnpm dev:firefox
```

### Đóng gói & Kiểm thử

```bash
# Chạy toàn bộ test suites
pnpm test

# Kiểm tra kiểu dữ liệu
pnpm compile

# Build extension cho Chrome / Edge
pnpm build

# Build extension cho Firefox
pnpm build:firefox

# Đóng gói zip tất cả các nền tảng
pnpm zip:all
```

## ☕ Ủng hộ

Nếu bạn thấy dự án hữu ích, hãy cân nhắc ủng hộ tác giả.

<p align="center">
  <img src="assets/donation-qr.png" alt="Donation QR" width="300">
</p>
