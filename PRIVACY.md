# Chính sách quyền riêng tư / Privacy Policy

_Cập nhật lần cuối / Last updated: 13/09/2026_

---

## 🇻🇳 Tiếng Việt

**SV HaUI Helper** cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của người dùng. Tài liệu này mô tả rõ ràng các nguyên tắc xử lý dữ liệu của tiện ích mở rộng.

### 1. Không thu thập dữ liệu (Zero Data Collection)

- Tiện ích **hoàn toàn KHÔNG thu thập, lưu trữ, theo dõi hoặc truyền tải** bất kỳ thông tin cá nhân, tài khoản đăng nhập (mã sinh viên, mật khẩu), điểm số, thời khóa biểu, lịch thi hay lịch sử duyệt web của bạn ra khỏi thiết bị.
- Tiện ích không sử dụng bất kỳ dịch vụ phân tích (analytics), dịch vụ theo dõi hành vi (tracking) hay mạng lưới quảng cáo nào của bên thứ ba.

### 2. Xử lý dữ liệu cục bộ 100% (Client-side / Offline)

- Mọi tác vụ tự động hóa và hỗ trợ đều được thực thi trực tiếp trên trình duyệt của bạn:
  - **Tự động giải Captcha**: Sử dụng mô hình AI (PP-OCRv4) tích hợp sẵn trong tiện ích và thực thi qua WebAssembly (ONNX Runtime Web). Ảnh Captcha được xử lý trực tiếp trên thiết bị của bạn và không bao giờ được tải lên bất kỳ máy chủ từ xa nào.
  - **Dự đoán GPA & Đổi màu điểm**: Tính toán toán học trực tiếp trên bảng điểm cục bộ hiển thị trên trang web.
  - **Xuất lịch (.ics)**: Tạo tệp lịch trực tiếp trên máy tính để người dùng tự tải về.

### 3. Lưu trữ cục bộ (Local Storage)

- Dữ liệu cài đặt cá nhân (trạng thái bật/tắt các tính năng trong menu popup) chỉ được lưu trữ trong bộ nhớ cục bộ của trình duyệt (`storage.local`).
- Dữ liệu này nằm hoàn toàn trên thiết bị của bạn và tự động xóa khi bạn gỡ bỏ tiện ích.

### 4. Quyền của tiện ích (Permissions)

- **Truy cập trang `sv.haui.edu.vn`**: Cần thiết để tiện ích có thể tương tác với DOM nhằm hiển thị các nút chức năng, tự điền Captcha và tính điểm.
- **`storage`**: Dùng để lưu cấu hình bật/tắt tính năng theo sở thích của người dùng trên thiết bị.
- **`offscreen`** (Chromium / Edge): Dùng để chạy Canvas và mô hình AI nhận diện Captcha ở tiến trình ngầm tách biệt mà không làm đơ giao diện người dùng.

### 5. Mã nguồn mở & Liên hệ

- SV HaUI Helper là dự án mã nguồn mở phát hành theo giấy phép **GNU General Public License v3.0 (GPL-3.0)**.
- Toàn bộ mã nguồn được công khai minh bạch tại: [https://github.com/vuquan2005/svHaUI-Helper](https://github.com/vuquan2005/svHaUI-Helper)
- Nếu bạn có bất kỳ câu hỏi hoặc khiếu nại nào về quyền riêng tư, vui lòng mở issue tại: [GitHub Issues](https://github.com/vuquan2005/svHaUI-Helper/issues)

---

## 🇬🇧 English

**SV HaUI Helper** is committed to protecting your privacy and personal data. This document outlines how your data is handled.

### 1. Zero Data Collection

- The extension **DOES NOT collect, store, track, or transmit** any personal identifiable information (PII), student credentials (student ID, password), grades, class schedules, exam dates, or web browsing history off your device.
- We do not use any third-party analytics, tracking telemetry, or advertising networks.

### 2. 100% Client-Side / Offline Processing

- All automated tasks and enhancements are executed directly within your browser:
  - **Captcha Recognition**: Uses a bundled AI model (PP-OCRv4) running locally via WebAssembly (ONNX Runtime Web). Captcha images are processed entirely on your local machine and never uploaded to any remote server.
  - **GPA Prediction & Grade Highlighting**: Mathematical computations performed entirely on the client-side DOM.
  - **Calendar Export (.ics)**: Generates standard `.ics` calendar files locally in the browser for user download.

### 3. Local Storage

- User preferences (toggle states of features in the popup menu) are stored exclusively in the browser's local storage (`storage.local`).
- This data remains strictly on your machine and is erased when the extension is uninstalled.

### 4. Extension Permissions

- **Host permissions (`sv.haui.edu.vn`)**: Required to read the DOM for rendering UI enhancements, auto-filling captcha, and calculating grades.
- **`storage`**: Used to save user preferences and feature toggle states locally.
- **`offscreen`** (Chromium / Edge): Used to execute Canvas operations and the ONNX runtime model in a background worker without interrupting user experience.

### 5. Open Source & Contact

- SV HaUI Helper is an open-source project licensed under the **GNU General Public License v3.0 (GPL-3.0)**.
- The full source code is publicly inspectable at: [https://github.com/vuquan2005/svHaUI-Helper](https://github.com/vuquan2005/svHaUI-Helper)
- If you have questions or concerns regarding this policy, please reach out via [GitHub Issues](https://github.com/vuquan2005/svHaUI-Helper/issues).
