# Trang Khảo Sát - Page Structure

> Tài liệu mô tả cấu trúc trang khảo sát/đánh giá chung.

---

## 1. Tổng quan

- **URL:** `/survey/view?sid=*&p=*&r=*&c=*`
- **Mục đích:** Thu thập ý kiến đánh giá/khảo sát của sinh viên.
- **Selector chính (Modal):** `div#kbox.modal-content`
- **Container bảng:** `div#kSurvey_All`

## 2. Cấu trúc chi tiết

### Header

- **Tiêu đề:** `div.panel-heading span` -> Tên phiếu khảo sát (VD: "PHIẾU ĐÁNH GIÁ...", "KHẢO SÁT...").
- **Hướng dẫn:** `div.panel-full-primary span` -> Chú thích thang điểm (1-5).

### Bảng khảo sát (`table.table-striped`)

Bảng chứa các câu hỏi đánh giá.

| Thành phần           | Selector                       | Mô tả                                 |
| :------------------- | :----------------------------- | :------------------------------------ |
| **Mức điểm (Thead)** | `thead > tr:nth-child(2) > td` | Các cột "1 điểm" ... "5 điểm"         |
| **Tiêu đề nhóm**     | `tr > td > strong`             | VD: "Về hoạt động đào tạo, bồi dưỡng" |
| **STT**              | `tr > td:nth-child(1)`         | Số thứ tự câu hỏi                     |
| **Radio 1 điểm**     | `input[id$="_1"]`              | Value 1 (Kém)                         |
| **Radio 2 điểm**     | `input[id$="_2"]`              | Value 2 (TB)                          |
| **Radio 3 điểm**     | `input[id$="_3"]`              | Value 3 (Khá)                         |
| **Radio 4 điểm**     | `input[id$="_4"]`              | Value 4 (Tốt)                         |
| **Radio 5 điểm**     | `input[id$="_5"]`              | Value 5 (Rất tốt)                     |
| **Nội dung**         | `tr > td:last-child`           | Nội dung câu hỏi                      |

**Lưu ý về Input:**

- `name`: Dạng `ksurXXXX` (VD: `ksur7941`). Các input cùng một câu hỏi sẽ có cùng `name`.
- `id`: Dạng `kvoteXXXX_Y` (VD: `kvote7941_5`).

### Footer

- **Nút gửi:** `button.btn-primary` (Text: "Gửi đánh giá")

---
