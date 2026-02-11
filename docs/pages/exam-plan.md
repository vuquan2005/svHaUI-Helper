# Trang Kế hoạch thi - Page Structure

> Tài liệu mô tả cấu trúc trang tra cứu kế hoạch thi theo lớp.

---

## 1. Tổng quan

- **URL:** `/student/schedulefees/examplant`
- **Mục đích:** Tra cứu danh sách môn học và xem chi tiết kế hoạch thi của từng lớp học phần.
- **Cơ chế hoạt động:** Trang hiển thị danh sách môn học. Khi người dùng chọn một môn, trang sẽ chuyển hướng (kèm tham số `?code=...`) và hiển thị thông tin chi tiết kế hoạch thi của môn đó.

## 2. Cấu trúc chi tiết

### Danh sách môn học (Mặc định)

Khu vực hiển thị danh sách toàn bộ các mã lớp độc lập mà sinh viên có thể đăng ký hoặc theo dõi.

- **Tiêu đề section:** "Danh sách môn học và mã lớp độc lập".
- **Selector bảng:** `div.kGrid > div > div.panel-body > table`

| Thành phần         | Selector              | Mô tả                                      |
| :----------------- | :-------------------- | :----------------------------------------- |
| **STT**            | `td:nth-child(1)`     | Số thứ tự                                  |
| **Mã lớp độc lập** | `td:nth-child(2) > a` | Link dẫn đến chi tiết kế hoạch thi của lớp |
| **Môn học**        | `td:nth-child(3) > a` | Link dẫn đến chi tiết kế hoạch thi của lớp |

### Chi tiết kế hoạch thi

Hiển thị khi truy cập đường dẫn cụ thể của môn học (URL có tham số `code`).

#### Thông báo & Tìm kiếm

- **Lưu ý quy chế:** `div.alert.alert-danger` (Thông báo về thẻ SV/CMND).
- **Tìm kiếm nhanh:** `input[name*="inpClassCode"]` (Nhập mã lớp độc lập khác để tra cứu).

#### Bảng thông tin chi tiết

- **Container:** `div#ctl03_ctl00_viewResult`
- **Selector bảng:** `div#ctl03_ctl00_viewResult > div.kGrid > div.panel-body > table`

| Thành phần         | Selector          | Mô tả                         |
| :----------------- | :---------------- | :---------------------------- |
| **STT**            | `td:nth-child(1)` | Số thứ tự dòng                |
| **Mã lớp độc lập** | `td:nth-child(2)` | Mã định danh lớp học phần     |
| **Tên học phần**   | `td:nth-child(3)` | Tên môn thi                   |
| **Ngày thi**       | `td:nth-child(4)` | Ngày thi dự kiến (dd/MM/yyyy) |
| **Ca thi**         | `td:nth-child(5)` | Giờ bắt đầu                   |
| **Lần thi**        | `td:nth-child(6)` | Số lần thi                    |
| **Lớp ưu tiên**    | `td:nth-child(7)` | Mã lớp hành chính/ưu tiên     |
| **Khoa**           | `td:nth-child(8)` | Khoa quản lý môn học          |
