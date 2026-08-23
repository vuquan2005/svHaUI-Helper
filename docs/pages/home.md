# Trang Chủ / Dashboard - Page Structure

> Tài liệu mô tả cấu trúc trang chủ (Dashboard) và các trạng thái hiển thị của đường dẫn `/` trên cổng thông tin sinh viên HaUI (`sv.haui.edu.vn`).

---

## 1. Tổng quan & Trạng thái đường dẫn (`/`)

Đường dẫn gốc `/` (hoặc `https://sv.haui.edu.vn/`) có **2 trạng thái giao diện hoàn toàn khác nhau** tùy thuộc vào phiên đăng nhập của người dùng:

| Trạng thái                         | Điều kiện                  | Container chính        | Dấu hiệu nhận biết                                                                                                                     |
| :--------------------------------- | :------------------------- | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Đã đăng nhập** (Dashboard)    | Đã có Session hợp lệ       | `div.cttsv-dashboard`  | Có topbar với tên SV (`.be-user-nav .user-name`), sidebar menu (`.be-left-sidebar`), `div.cttsv-action-grid`.                          |
| **B. Chưa đăng nhập** (Login View) | Chưa đăng nhập / Hết phiên | `div.splash-container` | Không có sidebar/tên SV. Xuất hiện form đăng nhập với `#ctl00_inpUserName`, `#ctl00_inpPassword`, `#ctl00_butLogin`, Google reCAPTCHA. |

> [!WARNING]
> **Lưu ý quan trọng khi phát triển Feature (Tránh chèn nhầm UI):**
> Do cả 2 trạng thái đều có cùng URL pathname là `/` và đều có thẻ cha bao bọc là `div.be-content` / `div.main-content`, các feature hiển thị trên trang chủ (như `exam-helper`, `home-shortcuts`) **tuyệt đối không** chỉ dựa vào URL `/` hoặc observe `div.be-content` rồi fallback `prepend`/`appendChild`.
>
> **Bắt buộc** phải kiểm tra sự tồn tại của các container đặc trưng của Dashboard như `div.cttsv-dashboard`, `div.cttsv-action-grid`, `section.cttsv-overview-section` hoặc `.be-user-nav .user-name` trước khi chèn bất kỳ UI nào.

---

## 2. Trạng thái Chưa đăng nhập (Login View - `div.splash-container`)

Khi người dùng chưa đăng nhập, server ASP.NET trả về giao diện form đăng nhập trực tiếp ngay tại URL `/`:

```
div.be-content
└─ div.main-content.container-fluid > form#frmMain name="frmMain"
   ├─ div > input#__VIEWSTATE
   ├─ div > input#__VIEWSTATEGENERATOR
   └─ div.splash-container > div.panel.panel-default.panel-border-color.panel-border-color-primary
      ├─ div.panel-heading.panel-heading-divider
      │  ├─ img.logo-img src=".../img/logo-haui-size.png" alt="logo"
      │  └─ span.splash-description
      │     ├─ h4 "Trường Đại học Công nghiệp Hà Nội"
      │     └─ h5 "Sinh viên đăng nhập"
      ├─ div.panel-body
      │  ├─ div.form-group > input#ctl00_inpUserName.form-control name="ctl00$inpUserName"
      │  ├─ div.form-group > input#ctl00_inpPassword.form-control name="ctl00$inpPassword"
      │  ├─ div.form-group > div.g-recaptcha
      │  │  └─ iframe (Google reCAPTCHA v2)
      │  ├─ div.form-group.login-submit > input#ctl00_butLogin.btn.btn-primary.btn-xl name="ctl00$butLogin"
      │  ├─ div.splash-footer > a "Quên mật khẩu" href="/help?repass=1"
      │  └─ div.splash-footer > a "Xem hướng dẫn" href="https://sv.dhcnhn.vn/files/HDSV_QuenMK.pdf"
      └─ div.panel-body > div.form-group.login-submit.text-center
         └─ a href="https://one.haui.edu.vn/loginapi/sv" (Đăng nhập Microsoft HaUI O365)
```

### Các Selector đặc trưng của Login View

| Thành phần             | Selector                  | Mục đích                                      |
| :--------------------- | :------------------------ | :-------------------------------------------- |
| **Login Container**    | `div.splash-container`    | Khối bao bọc toàn bộ form đăng nhập           |
| **Tên đăng nhập**      | `input#ctl00_inpUserName` | Ô nhập mã SV / Email                          |
| **Mật khẩu**           | `input#ctl00_inpPassword` | Ô nhập mật khẩu                               |
| **Google reCAPTCHA**   | `div.g-recaptcha`         | Widget xác thực người dùng của Google         |
| **Nút Đăng nhập**      | `input#ctl00_butLogin`    | Nút submit form đăng nhập                     |
| **Nút Đăng nhập O365** | `a[href*="loginapi/sv"]`  | Đăng nhập tài khoản Microsoft HaUI Office 365 |
| **Quên mật khẩu**      | `a[href*="repass=1"]`     | Link khôi phục mật khẩu                       |

---

## 3. Trạng thái Đã đăng nhập (Dashboard View - `div.cttsv-dashboard`)

Khi đã xác thực thành công, `/` hiển thị đầy đủ giao diện Dashboard sinh viên.

- **URL:** `/` hoặc `https://sv.haui.edu.vn/` (hoặc `/home`)
- **Mục đích:** Hiển thị tổng quan thông tin cá nhân sinh viên, chỉ số thống kê nhanh (thông báo mới, công nợ, tiến độ học tập), chi tiết học tập & tài chính, cùng danh sách lối tắt điều hướng đến toàn bộ các tính năng chính của hệ thống.
- **Selector chính:** `div.cttsv-dashboard`
- **Form bao bọc:** `form#frmMain` (Chứa `__VIEWSTATE`, `__VIEWSTATEGENERATOR`)

---

## 4. Cấu trúc chi tiết Dashboard (Authenticated)

### 4.1. Hero Section - Thông tin cá nhân & Thao tác nhanh

Khu vực banner chào đón đầu trang chứa ảnh đại diện, thông tin cơ bản của sinh viên và các nút hành động nhanh.

- **Selector container:** `section.cttsv-hero`
- **Slot thông báo:** `div#notification.cttsv-notification-slot`

| Thành phần             | Selector                                        | Mô tả                                              |
| :--------------------- | :---------------------------------------------- | :------------------------------------------------- |
| **Ảnh đại diện**       | `div.cttsv-avatar > img`                        | URL ảnh thẻ sinh viên (`statics.haui.edu.vn`)      |
| **Avatar fallback**    | `div.cttsv-avatar > span.cttsv-avatar-fallback` | Chữ cái viết tắt họ tên (VD: `VQ`)                 |
| **Lời chào & Họ tên**  | `div.cttsv-hero-main > h1`                      | Lời chào kèm họ tên (VD: `Xin chào, Vũ Viết Quân`) |
| **Mã sinh viên**       | `div.cttsv-student-meta > span:nth-child(1)`    | Mã SV (VD: `Mã SV: 2023603547`)                    |
| **Lớp hành chính**     | `div.cttsv-student-meta > span:nth-child(2)`    | Lớp sinh hoạt (VD: `Lớp: 2023DHCODT03`)            |
| **Khóa học**           | `div.cttsv-student-meta > span:nth-child(3)`    | Khóa học (VD: `Khóa: ĐH K18`)                      |
| **Ngành / Khoa**       | `div.cttsv-student-meta > span:nth-child(4)`    | Ngành học/Khoa trực thuộc                          |
| **Nút Cập nhật hồ sơ** | `div.cttsv-hero-actions > a.cttsv-btn-light`    | Link đến `/student/userdetail/userdetail`          |
| **Nút Xem lịch học**   | `div.cttsv-hero-actions > a.cttsv-btn-primary`  | Link đến `/timestable/calendarcl`                  |

---

### 4.2. KPI Grid - Chỉ số thống kê nhanh

Khu vực 3 thẻ thống kê các chỉ số quan trọng (Thông báo mới, Công nợ cần xử lý, Tiến độ học tập).

- **Selector container:** `section.cttsv-kpi-grid`

| Thẻ KPI               | Selector thẻ                        | Giá trị (`strong`)                  | Nhãn (`em`)         | Đường dẫn (`href`)                   |
| :-------------------- | :---------------------------------- | :---------------------------------- | :------------------ | :----------------------------------- |
| **Thông báo mới**     | `a.cttsv-kpi-card.cttsv-kpi-blue`   | Số lượng thông báo mới (VD: `0`)    | "Thông báo mới"     | `/student/application/notifilist`    |
| **Công nợ cần xử lý** | `a.cttsv-kpi-card.cttsv-kpi-orange` | Số tiền công nợ (VD: `6,273,700 đ`) | "Công nợ cần xử lý" | `/student/recharge/inpatientpayment` |
| **Tiến độ học tập**   | `a.cttsv-kpi-card.cttsv-kpi-cyan`   | Tín chỉ tích lũy (VD: `115 TC`)     | "Tiến độ học tập"   | `/student/result/viewmodules`        |

_Cấu trúc chi tiết bên trong mỗi thẻ:_

- `span.cttsv-kpi-icon > i.icon`: Icon đại diện (Material Design Icons).
- `span.cttsv-kpi-body > strong`: Giá trị hiển thị số/tiền tệ.
- `span.cttsv-kpi-body > em`: Nhãn mô tả của chỉ số.

---

### 4.3. Tổng quan cá nhân (Overview Section)

Khối hiển thị 3 bảng tổng quan: Hồ sơ sinh viên, Học tập và Tài chính.

- **Tiêu đề section:** `div.cttsv-section-head > h2` -> "Tổng quan cá nhân"
- **Selector container:** `section.cttsv-overview-section > div.cttsv-overview-grid.cttsv-overview-grid-3`

#### A. Hồ sơ sinh viên (`div.cttsv-profile-card:not(.cttsv-study-card):not(.cttsv-finance-card)`)

Danh sách thông tin cá nhân và cố vấn học tập theo định dạng key-value (`dl.cttsv-data-list`):

| Thông tin          | Selector định vị                              | Ví dụ giá trị                                  |
| :----------------- | :-------------------------------------------- | :--------------------------------------------- |
| **Mã sinh viên**   | `dl.cttsv-data-list > dt:nth-of-type(1) + dd` | `2023603547`                                   |
| **Lớp**            | `dl.cttsv-data-list > dt:nth-of-type(2) + dd` | `2023DHCODT03`                                 |
| **Ngành**          | `dl.cttsv-data-list > dt:nth-of-type(3) + dd` | `Công nghệ kỹ thuật cơ điện tử`                |
| **Email**          | `dl.cttsv-data-list > dt:nth-of-type(4) + dd` | `--`                                           |
| **Điện thoại**     | `dl.cttsv-data-list > dt:nth-of-type(5) + dd` | `0977185826`                                   |
| **Cố vấn học tập** | `dl.cttsv-data-list > dt:nth-of-type(6) + dd` | `Nguyễn Ngọc Hoa (0987139019 - Cơ khí - Ô tô)` |

#### B. Học tập (`div.cttsv-profile-card.cttsv-study-card`)

- **Tiêu đề card:** `div.cttsv-panel-head h3` -> "Học tập"
- **Selector container:** `div.cttsv-stat-grid`

| Chỉ số               | Selector                                    | Ví dụ giá trị |
| :------------------- | :------------------------------------------ | :------------ |
| **Tín chỉ tích lũy** | `div.cttsv-stat-item:nth-child(1) > strong` | `115 TC`      |
| **Điểm TB tích lũy** | `div.cttsv-stat-item:nth-child(2) > strong` | `2.62`        |

#### C. Tài chính (`div.cttsv-profile-card.cttsv-finance-card`)

- **Tiêu đề card:** `div.cttsv-panel-head h3` -> "Tài chính"
- **Selector container:** `dl.cttsv-data-list`

| Thông tin           | Selector định vị                              | Ví dụ giá trị |
| :------------------ | :-------------------------------------------- | :------------ |
| **Số dư tài khoản** | `dl.cttsv-data-list > dt:nth-of-type(1) + dd` | `12,800 đ`    |
| **Công nợ**         | `dl.cttsv-data-list > dt:nth-of-type(2) + dd` | `6,273,700 đ` |
| **Số khoản thu**    | `dl.cttsv-data-list > dt:nth-of-type(3) + dd` | `3 khoản`     |

---

### 4.4. Chức năng sinh viên (Action Grid)

Khu vực thẻ liên kết điều hướng nhanh đến các tính năng nghiệp vụ của sinh viên.

- **Tiêu đề section:** `div.cttsv-section-head > h2` -> "Chức năng sinh viên"
- **Selector container:** `div.cttsv-action-grid`

| Tên chức năng          | Selector card                                     | Link (`href`)                              | Mô tả chức năng (`em`)                |
| :--------------------- | :------------------------------------------------ | :----------------------------------------- | :------------------------------------ |
| **Kết quả học tập**    | `a.cttsv-action-card[href*="studyresults"]`       | `/student/result/studyresults`             | Xem điểm, học kỳ và tích lũy          |
| **Kết quả thi**        | `a.cttsv-action-card[href*="examresult"]`         | `/student/result/examresult`               | Tra cứu điểm thi và khảo sát học phần |
| **Thời khóa biểu**     | `a.cttsv-action-card[href*="calendarcl"]`         | `/timestable/calendarcl`                   | Theo dõi lịch học trong tuần          |
| **Lịch thi**           | `a.cttsv-action-card[href*="transactionmodules"]` | `/student/schedulefees/transactionmodules` | Kế hoạch thi và ca thi sắp tới        |
| **Dịch vụ một cửa**    | `a.cttsv-action-card[href*="serviceonegate"]`     | `/student/recharge/serviceonegate`         | Gửi yêu cầu hỗ trợ sinh viên          |
| **Thanh toán công nợ** | `a.cttsv-action-card[href*="inpatientpayment"]`   | `/student/recharge/inpatientpayment`       | Kiểm tra và thực hiện thanh toán      |
| **Hồ sơ sinh viên**    | `a.cttsv-action-card[href*="userdetail"]`         | `/student/userdetail/userdetail`           | Cập nhật thông tin cá nhân            |
| **Khảo sát**           | `a.cttsv-action-card[href*="survey"]`             | `/survey`                                  | Hoàn thành khảo sát theo yêu cầu      |

_Cấu trúc bên trong mỗi thẻ `a.cttsv-action-card`:_

- `span.cttsv-action-icon`: Container icon với class màu (`.cttsv-action-blue`, `.cttsv-action-green`, `.cttsv-action-orange`, `.cttsv-action-red`, `.cttsv-action-cyan`, `.cttsv-action-purple`).
- `strong`: Tiêu đề tên tính năng.
- `em`: Mô tả tóm tắt tính năng.

---

### 4.5. Khối Thông tin & Liên kết nhanh (Info Grid)

Khu vực hiển thị danh sách nhiệm vụ cần hoàn thành và các liên kết tra cứu học tập chuyên sâu.

- **Selector container:** `section.cttsv-info-grid`

#### A. Panel Thông báo & Việc cần làm (`section.cttsv-info-grid > div.cttsv-panel:nth-child(1)`)

- **Tiêu đề:** `h3` -> "Thông báo"
- **Selector danh sách:** `div.cttsv-task-list > a`

| Mục                         | Selector link                                       | Link (`href`)                        | Trạng thái/Số lượng (`strong`) |
| :-------------------------- | :-------------------------------------------------- | :----------------------------------- | :----------------------------- |
| **Thông báo từ nhà trường** | `div.cttsv-task-list > a[href*="notifilist"]`       | `/student/application/notifilist`    | `0 mới`                        |
| **Công nợ cần thanh toán**  | `div.cttsv-task-list > a[href*="inpatientpayment"]` | `/student/recharge/inpatientpayment` | `3 khoản`                      |
| **Cập nhật hồ sơ**          | `div.cttsv-task-list > a[href*="userdetail"]`       | `/student/userdetail/userdetail`     | `Kiểm tra`                     |

#### B. Panel Liên kết học tập (`section.cttsv-info-grid > div.cttsv-panel:nth-child(2)`)

- **Tiêu đề:** `h3` -> "Học tập"
- **Selector danh sách:** `div.cttsv-link-list > a`

| Tên liên kết                  | Selector link                                          | Link (`href`)                         | Mô tả                              |
| :---------------------------- | :----------------------------------------------------- | :------------------------------------ | :--------------------------------- |
| **Trung bình chung học kỳ**   | `div.cttsv-link-list > a[href*="viewscorebysemester"]` | `/student/result/viewscorebysemester` | Xem điểm trung bình theo từng kỳ   |
| **Trung bình chung tích lũy** | `div.cttsv-link-list > a[href*="viewmodules"]`         | `/student/result/viewmodules`         | Xem điểm tích lũy & các môn đã học |
| **Khung chương trình**        | `div.cttsv-link-list > a[href*="viewcourseindustry"]`  | `/training/viewcourseindustry`        | Xem lộ trình toàn khóa             |
| **Đăng ký học phần**          | `div.cttsv-link-list > a[href*="/register/"]`          | `/register/`                          | Cổng đăng ký môn học trực tuyến    |
