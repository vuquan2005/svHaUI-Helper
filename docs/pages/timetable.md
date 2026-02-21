# Trang Thời Khóa Biểu - Page Structure

> Tài liệu mô tả cấu trúc trang thời khóa biểu cá nhân.

---

## 1. Tổng quan

- **URL:** `/timestable/calendarcl`
- **Mục đích:** Xem lịch học, lịch thi theo tuần.
- **Selector chính:** `div.panel.panel-default`
- **Container bảng:** `div.panel-body > table`

## 2. Cấu trúc chi tiết

### Header

- **Tiêu đề:** `span.k-panel-header-text` -> "Thời khóa biểu".

### Bộ lọc (Form)

Khu vực chọn khoảng thời gian xem lịch.

| Thành phần             | Selector                     | Mô tả                            |
| :--------------------- | :--------------------------- | :------------------------------- |
| **Ngày bắt đầu (D)**   | `input#ctl03_inpStartDate_d` | Nhập ngày bắt đầu                |
| **Tháng bắt đầu (M)**  | `input#ctl03_inpStartDate_m` | Nhập tháng bắt đầu               |
| **Năm bắt đầu (Y)**    | `input#ctl03_inpStartDate`   | Nhập năm bắt đầu                 |
| **Ngày kết thúc (D)**  | `input#ctl03_inpEndDate_d`   | Nhập ngày kết thúc               |
| **Tháng kết thúc (M)** | `input#ctl03_inpEndDate_m`   | Nhập tháng kết thúc              |
| **Năm kết thúc (Y)**   | `input#ctl03_inpEndDate`     | Nhập năm kết thúc                |
| **Khu vực nút**        | `div.col-sm-4`               | Container chứa các nút chức năng |
| **Nút xem**            | `input#ctl03_butGet`         | Button xem lịch                  |

### Bảng lịch học (`table.table.table-bordered`)

Bảng hiển thị chi tiết lịch học trong tuần.

| Thành phần       | Selector                                  | Mô tả                               |
| :--------------- | :---------------------------------------- | :---------------------------------- |
| **Header Cột**   | `tr.k-table-head > th`                    | STT, Thứ, Ngày, Sáng, Chiều, Tối... |
| **Dòng dữ liệu** | `tbody > tr` (không phải `.k-table-head`) | Các dòng chứa thông tin ngày học    |
| **STT**          | `td:nth-child(1)`                         | Số thứ tự trong tuần                |
| **Thứ**          | `td:nth-child(2)`                         | Tên thứ (Thứ 2, Thứ 3...)           |
| **Ngày**         | `td:nth-child(3)`                         | Ngày tháng (dd/MM/yyyy)             |
| **Ca Sáng**      | `td:nth-child(4)`                         | Nội dung lịch học sáng              |
| **Ca Chiều**     | `td:nth-child(5)`                         | Nội dung lịch học chiều             |
| **Ca Tối**       | `td:nth-child(6)`                         | Nội dung lịch học tối               |

### Ví dụ dữ liệu & Xử lý (Parsing)

Dữ liệu lịch học gốc là HTML. Quy trình xử lý chuẩn là lấy **Text Content** (loại bỏ thẻ HTML) rồi mới áp dụng Regex.

**Dữ liệu dạng Text (Input cho Regex):**

```text
1. (1,2,3) - Tên Môn Học (Lớp: Mã_Lớp_123)
GV: Tên Giảng Viên (098x.xxx.xxx - Tên Khoa)
(Phòng 209 - Nhà A1 - Cơ sở 1)
```

**Phân tích & Regex:**

Áp dụng Regex lên chuỗi văn bản trên:

1.  **Tách thông tin môn học & lớp:**

    ```regex
    /^\d+\.\s*\((?<periods>[\d,]+)\)\s*-\s*(?<course>.+?)\s*\(Lớp:\s*(?<class>[^)]+)\)/
    ```

2.  **Tách thông tin giảng viên:**

    ```regex
    /GV:\s*(?<lecturer>.+?)\s*\((?:(?<sdt>[\d\s.]+)\s*-\s*)?(?<khoa>[^)]+)\)/
    ```

3.  **Tách địa điểm (Zoom/Phòng học):**
    ```regex
    /^\s*\((?<location>[^)]+)\)\s*$/m
    ```

**Kết quả sau khi tách:**

| Group Name | Giá trị mẫu      | Mô tả                      |
| :--------- | :--------------- | :------------------------- |
| `periods`  | `1,2,3`          | Chuỗi tiết học             |
| `course`   | `Tên Môn Học`    | Tên học phần               |
| `class`    | `20251BS...001`  | Mã lớp (Năm+Kỳ+Mã môn+STT) |
| `lecturer` | `Tên Giảng Viên` | Tên giảng viên             |
| `sdt`      | `098x.xxx.xxx`   | SĐT (Có thể không có)      |
| `khoa`     | `Tên Khoa`       | Khoa quản lý               |
| `location` | `Phòng 209...`   | Địa điểm học/thi           |

### Xử lý đa môn học & Lưu ý

Để đảm bảo chính xác khi một buổi có nhiều môn học (nhiều dòng dữ liệu), quy trình xử lý chuẩn như sau:

1.  **Lấy dữ liệu:** Sử dụng thuộc tính `innerText` để lấy nội dung văn bản. Thuộc tính này tự động chuyển đổi các thẻ `<br>` thành ký tự xuống dòng `\n`, giúp bảo toàn cấu trúc dòng cho Regex.
2.  **Tách khối (Block):** Cắt văn bản thành từng khối môn học riêng biệt dựa trên số thứ tự đầu dòng.
    ```javascript
    // Tách thành mảng các block, mỗi block chứa thông tin 1 môn
    const blocks = rawText.split(/(?=^\d+\.)/gm).filter(Boolean);
    ```
3.  **Phân tích:** Duyệt qua từng block và áp dụng Regex để lấy thông tin.

**Ví dụ:**

```javascript
blocks.forEach((block) => {
  const info = block.match(regexInfo); // Lấy thông tin môn
  const gv = block.match(regexGV); // Lấy thông tin GV
  const location = block.match(regexLocation); // Lấy thông tin địa điểm

  if (info) {
    console.log(info.groups.course, gv?.groups?.lecturer, location?.groups?.location);
  }
});
```

### Footer

- **Nút quay lại:** `button.btn.btn-primary` (Text: "Quay lại")

---
