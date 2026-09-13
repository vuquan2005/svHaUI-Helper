# Thông tin đệ trình tiện ích lên Store (AMO, Edge, Chrome)

Tài liệu này lưu trữ sẵn toàn bộ nội dung cần điền khi nộp **SV HaUI Helper** lên các cửa hàng tiện ích mở rộng (Firefox AMO, Microsoft Edge Partner Center, Chrome Web Store).

---

## 1. Firefox Add-ons (AMO - addons.mozilla.org)

### 📌 Thông tin cơ bản

- **Tên tiện ích**: `SV HaUI Helper`
- **URL tiện ích**: `sv-haui-helper` _(mặc định)_
- **Tóm tắt (Summary)** _(tối đa 250 ký tự)_:

```text
Tiện ích hỗ trợ sinh viên ĐH Công nghiệp Hà Nội (HaUI): tự động giải Captcha, đếm ngược lịch thi, xuất thời khóa biểu .ics và dự đoán điểm GPA.
```

---

### 📝 Miêu tả chi tiết (Description)

_(Hỗ trợ Markdown - copy toàn bộ khung bên dưới)_:

```markdown
**SV HaUI Helper** là tiện ích mở rộng mã nguồn mở giúp nâng cao trải nghiệm cho sinh viên Đại học Công nghiệp Hà Nội (HaUI) khi sử dụng cổng thông tin sinh viên [sv.haui.edu.vn](https://sv.haui.edu.vn).

### 🚀 Các tính năng nổi bật:

- ⚡ **Tự động giải Captcha bằng AI Offline**: Tích hợp mô hình PP-OCRv4 chạy trực tiếp trên trình duyệt qua WebAssembly, nhận diện và tự điền mã bảo vệ siêu tốc mà không gửi dữ liệu ra máy chủ bên ngoài.
- 📅 **Đếm ngược & Quản lý Lịch thi**: Hiển thị đếm ngược ca thi trên trang chủ và bảng lịch thi, hỗ trợ xuất lịch thi ra file `.ics` đồng bộ vào Google Calendar / Apple Calendar.
- 📆 **Xuất Thời khóa biểu tuần**: Tự động trích xuất lịch học cả học kỳ ra file lịch chuẩn `.ics`.
- 📊 **Dự đoán GPA & Tính điểm học kỳ**: Cho phép sinh viên tự nhập điểm thi kết thúc học phần để mô phỏng GPA, CPA tức thì.
- 🎛️ **Giao diện Popup trực quan**: Dễ dàng bật/tắt từng tính năng theo nhu cầu cá nhân.

### 🔒 Quyền riêng tư & Bảo mật:

- Tiện ích chạy **cục bộ 100% (offline)** trên trình duyệt của bạn.
- Hoàn toàn **không thu thập**, không lưu trữ và không gửi bất kỳ thông tin cá nhân, tài khoản hay mật khẩu nào ra ngoài.
- Mã nguồn mở minh bạch: https://github.com/vuquan2005/svHaUI-Helper
```

---

### ⚙️ Các tùy chọn & Phân mục

- **Tiện ích này là thử nghiệm?**: `KHÔNG tick` _(bỏ trống)_
- **Tiện ích này yêu cầu thanh toán...?**: `KHÔNG tick` _(bỏ trống)_
- **Danh mục (Category)**: `Cảnh báo & Cập nhật` _(Alerts & Updates)_
- **Trang web hỗ trợ**: `https://github.com/vuquan2005/svHaUI-Helper/issues`
- **Giấy phép (License)**: `Chỉ Giấy phép Công cộng GNU v3.0` _(GPL-3.0-only)_

---

### 🛡️ Chính sách riêng tư (Privacy Policy)

- **Tiện ích này có một chính sách riêng tư?**: `TICK CÓ`
- **Nội dung chính sách riêng tư**:

```text
SV HaUI Helper tôn trọng quyền riêng tư của người dùng:
1. Tiện ích không thu thập, lưu trữ hay truyền tải bất kỳ dữ liệu cá nhân, thông tin đăng nhập hay dữ liệu duyệt web nào của sinh viên ra khỏi thiết bị.
2. Mọi tác vụ xử lý (bao gồm nhận diện Captcha bằng mô hình OCR và tính toán điểm số) đều được thực hiện cục bộ 100% trên trình duyệt của bạn.
3. Dữ liệu cài đặt tính năng chỉ được lưu trong bộ nhớ cục bộ (browser.storage.local) trên trình duyệt của bạn.
Mã nguồn công khai tại: https://github.com/vuquan2005/svHaUI-Helper
```

---

### 👨‍💻 Ghi chú cho người đánh giá (Notes to Reviewers)

_(Copy toàn bộ đoạn tiếng Anh này dán vào ô Ghi chú của Mozilla AMO)_:

```text
Dear Reviewer,

This extension is an open-source student helper designed for Hanoi University of Industry (HaUI) on the portal https://sv.haui.edu.vn.

Testing without student credentials:
- Reviewers do not need an active student account to test the extension.
- Please visit the public login page: https://sv.haui.edu.vn/sso
- You can observe the extension popup UI (by clicking the toolbar icon) and test the offline Captcha auto-fill feature on the login page (uses bundled ONNX Runtime WebAssembly).

Security & Policy notes:
- Data Collection: The extension operates 100% client-side and does NOT collect or transmit any user data.
- innerHTML warnings: Used strictly for rendering static UI components (exam badges, GPA prediction table, and popup toggles) derived from the university portal's local DOM. No unsanitized remote strings are evaluated.
- Dynamic imports: Originate from the official Microsoft 'onnxruntime-web' library to load bundled local WebAssembly modules.

Source code:
- The source code archive has been provided. Build instructions:
  1. pnpm install
  2. pnpm build:firefox

Thank you very much for your time and assistance!
```

---

## 2. Microsoft Edge Add-ons (Partner Center)

- **Gói tải lên**: File `.output/svhaui-helper-*-chrome.zip`
- **Mô tả ngắn & Chi tiết**: Dùng chung nội dung như trên.
- **Giải trình quyền (Permission justifications)** khi Edge hỏi:
  - `storage`: _"Used to store user preferences and feature toggle states locally on the device."_
  - `offscreen`: _"Used to run Canvas 2D operations and ONNX Runtime WebAssembly model locally for offline Captcha OCR recognition."_
- **URL chính sách riêng tư**: `https://github.com/vuquan2005/svHaUI-Helper#readme`
