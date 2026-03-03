# Trang Lịch Thi & Tiền Thi - Page Structure

> Tài liệu mô tả cấu trúc trang xem lịch thi.

---

## 1. Tổng quan

- **URL:** `/student/schedulefees/transactionmodules`
- **Mục đích:** Xem chi tiết lịch thi, số báo danh (SBD), địa điểm thi.
- **Selector chính:** `div.panel.panel-default`
- **Container bảng:** `div.panel-body > div.kGrid > div > table`

## 2. Cấu trúc chi tiết

### Header & Thông tin sinh viên

- **Tiêu đề:** `span.k-panel-header-text` -> "Lịch thi & Tiền VP phẩm phục vụ thi".
- **Thông tin sinh viên:** Nằm trong bảng đầu tiên (`table.table.table-bordered`).

| Thành phần | Selector                                     | Mô tả          |
| :--------- | :------------------------------------------- | :------------- |
| **Họ tên** | `tr:nth-child(1) > td:nth-child(2) > strong` | Tên sinh viên  |
| **Mã SV**  | `tr:nth-child(2) > td:nth-child(2) > strong` | Mã sinh viên   |
| **Lớp**    | `tr:nth-child(3) > td:nth-child(2) > strong` | Lớp hành chính |

### Thông báo (`div.alert`)

Khu vực hiển thị các lưu ý quan trọng về quy chế thi, giấy tờ tùy thân và các thông báo đặc biệt (ví dụ: thi online do dịch bệnh).

- **Selector:** `div.alert.alert-warning`
- **Nội dung:** Chứa text hướng dẫn và các liên kết liên quan.

### Bảng lịch thi (`table.table.table-bordered.table-striped`)

Bảng chính hiển thị danh sách các môn thi và thông tin chi tiết.

| Thành phần       | Selector                       | Mô tả                                                           |
| :--------------- | :----------------------------- | :-------------------------------------------------------------- |
| **Header Cột**   | `thead > tr.kTableHeader > td` | Tiêu đề các cột dữ liệu                                         |
| **Dòng dữ liệu** | `tbody > tr`                   | Các dòng chứa thông tin môn thi (`.kTableRow`, `.kTableAltRow`) |
| **STT**          | `td:nth-child(1)`              | Số thứ tự                                                       |
| **Môn thi**      | `td:nth-child(2)`              | Tên học phần thi                                                |
| **Ngày thi**     | `td:nth-child(3)`              | Ngày thi (định dạng dd/MM/yyyy)                                 |
| **Ca thi**       | `td:nth-child(4)`              | Giờ bắt đầu thi `H'h'mm`                                        |
| **SBD**          | `td:nth-child(5)`              | Số báo danh của sinh viên \d{6}                                 |
| **Lần thi**      | `td:nth-child(6)`              | Lần thi (1, 2...)                                               |
| **Vị trí thi**   | `td:nth-child(7)`              | Số ghế/Vị trí ngồi trong phòng [A-Z]\d{1,2}                     |
| **Phòng thi**    | `td:nth-child(8)`              | Mã phòng thi                                                    |
| **Tòa nhà**      | `td:nth-child(9)`              | Tòa nhà tổ chức thi [ABC]\d{1,2}                                |
| **Cơ sở**        | `td:nth-child(10)`             | Cơ sở đào tạo (Khu A, B, C...) (thường không cần thiết)         |
| **Tiền VP PVT**  | `td:nth-child(11)`             | Lệ phí thi/Tiền văn phòng phẩm (thường 0đ)                      |
| **Tham gia thi** | `td:nth-child(12)`             | Thường là `Tham gia thi`                                        |
| **Tình trạng**   | `td:nth-child(13)`             | Thường trống                                                    |
| **Check box**    | `td:nth-child(14)`             | Cột trống, ở thead có checkbox                                  |

---
