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
- **Mô tả ngắn & Chi tiết**: Dùng chung nội dung như mục 1 (Firefox AMO).
- **Hình ảnh quảng bá (Store Assets)**:
  - **Logo cửa hàng (Store Logo)**: `assets/store-icon-300.png` _(300 x 300 px, bắt buộc)_
  - **Khung quảng cáo nhỏ (Small Promo Tile)**: `assets/promo-small-440x280.png` _(440 x 280 px, bắt buộc)_
  - **Khung quảng cáo lớn (Large Promo Tile)**: `assets/promo-marquee-1400x560.png` _(1400 x 560 px, tùy chọn)_
- **Giải trình quyền (Permission justifications)** khi Edge hỏi:
  - `storage`: _"Used to store user preferences and feature toggle states locally on the device."_
  - `offscreen`: _"Used to run Canvas 2D operations and ONNX Runtime WebAssembly model locally for offline Captcha OCR recognition."_
- **URL chính sách riêng tư**: `https://github.com/vuquan2005/svHaUI-Helper/blob/main/PRIVACY.md`
- **URL trang web hỗ trợ**: `https://github.com/vuquan2005/svHaUI-Helper/issues`

---

## 3. Google Chrome Web Store (CWS - Developer Dashboard)

### 📌 Thông tin cơ bản (Store Listing)

- **Tên tiện ích (Item name)**: `SV HaUI Helper`
- **Tóm tắt ngắn (Short description)** _(tối đa 132 ký tự)_:

```text
Tiện ích hỗ trợ sinh viên HaUI: tự giải Captcha bằng AI offline, đếm ngược lịch thi, xuất thời khóa biểu .ics và dự đoán GPA.
```

- **Mô tả chi tiết (Detailed description)**: Dùng chung nội dung Markdown ở mục 1.
- **Danh mục (Category)**: `Năng suất` _(Productivity)_ hoặc `Giáo dục` _(Education)_.
- **Ngôn ngữ chính (Primary language)**: `Tiếng Việt` _(Vietnamese)_.

---

### 🎨 Tài nguyên đồ họa (Store Assets)

- **Biểu tượng cửa hàng (Store Icon)**: `public/icon/128.png` _(128 x 128 px)_.
- **Khung quảng cáo nhỏ (Small Promo Tile)**: `assets/promo-small-440x280.png` _(440 x 280 px, bắt buộc)_.
- **Biểu ngữ nổi bật (Marquee Tile)**: `assets/promo-marquee-1400x560.png` _(1400 x 560 px, tùy chọn)_.
- **Ảnh chụp màn hình (Screenshots)**: Tối thiểu 1 ảnh, tỉ lệ chuẩn 1280 x 800 px (hoặc 640 x 400 px).

---

### 🔒 Thực hành quyền riêng tư (Privacy Practices)

#### 1. Mục đích duy nhất (Single Purpose)

Điền câu trả lời tiếng Anh vào ô Single Purpose:

```text
Enhance student productivity on the Hanoi University of Industry (HaUI) portal by providing offline AI Captcha auto-fill, exam countdown and calendar sync (.ics), and semester GPA simulation.
```

#### 2. Giải trình quyền sử dụng (Permission Justifications)

- **`storage`**:
  ```text
  Used to store user feature preferences (such as enabling/disabling exam countdown or auto-fill) locally on the user's browser.
  ```
- **`offscreen`**:
  ```text
  Used to execute Canvas 2D image processing and run the bundled ONNX Runtime WebAssembly model for Captcha recognition off-screen without freezing the UI.
  ```
- **`host_permissions (https://sv.haui.edu.vn/*)`**:
  ```text
  Required to read and modify DOM elements on the university portal: displaying exam countdown widgets, injecting calendar export buttons, and calculating GPA on local grade tables.
  ```

#### 3. Chứng nhận dữ liệu người dùng (User Data Certifications)

- **Thu thập dữ liệu (Data collection)**: `CHỌN KHÔNG (NO)` — Tiện ích không thu thập bất kỳ dữ liệu cá nhân nào.
- **Chứng nhận tuân thủ**: Tick chọn đầy đủ các cam kết:
  - Tiện ích không bán dữ liệu cho bên thứ ba.
  - Tiện ích không sử dụng dữ liệu cho mục đích không liên quan đến chức năng cốt lõi.
  - Tiện ích không sử dụng dữ liệu để xác định khả năng tín dụng hoặc cho mục đích cho vay.
- **URL Chính sách riêng tư**: `https://github.com/vuquan2005/svHaUI-Helper/blob/main/PRIVACY.md`

---

## 4. Bảng tổng hợp quy cách tài nguyên đồ họa (Store Assets Matrix)

| Tệp tài nguyên                                                              | Kích thước     | Định dạng  | Mục đích sử dụng                                 |
| :-------------------------------------------------------------------------- | :------------- | :--------- | :----------------------------------------------- |
| [`public/icon/16.png`](../public/icon/16.png)                               | 16 x 16 px     | PNG (RGBA) | Favicon tab, toolbar nhỏ                         |
| [`public/icon/32.png`](../public/icon/32.png)                               | 32 x 32 px     | PNG (RGBA) | Thanh công cụ extension, Windows Retina          |
| [`public/icon/48.png`](../public/icon/48.png)                               | 48 x 48 px     | PNG (RGBA) | Trang quản lý extension (chrome://extensions)    |
| [`public/icon/128.png`](../public/icon/128.png)                             | 128 x 128 px   | PNG (RGBA) | Biểu tượng Store cài đặt CWS & AMO               |
| [`assets/store-icon-300.png`](../assets/store-icon-300.png)                 | 300 x 300 px   | PNG (RGBA) | Biểu tượng Store bắt buộc trên Microsoft Edge    |
| [`assets/promo-small-440x280.png`](../assets/promo-small-440x280.png)       | 440 x 280 px   | PNG (RGB)  | Thẻ quảng cáo nhỏ trên Chrome Web Store & Edge   |
| [`assets/promo-marquee-1400x560.png`](../assets/promo-marquee-1400x560.png) | 1400 x 560 px  | PNG (RGB)  | Biểu ngữ lớn (Marquee) trang chủ Store           |
| [`assets/logo.png`](../assets/logo.png)                                     | 1024 x 1024 px | PNG (RGBA) | Master Logo gốc chất lượng cao cho README & Docs |
