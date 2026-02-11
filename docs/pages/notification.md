# Trang Thông Báo - Page Structure

> Tài liệu mô tả cấu trúc trang danh sách thông báo của sinh viên.

---

## 1. Tổng quan

- **URL:** `/student/application/notifilist`
- **Mục đích:** Xem danh sách các thông báo từ nhà trường, bao gồm thông báo chung, thông báo học vụ, khảo sát...
- **Selector chính:** `div.panel.panel-default`
- **Container bảng:** `div.table-responsive > table#ctl03_ctl00_gvList`

## 2. Cấu trúc chi tiết

### Header

- **Tiêu đề:** `span.k-panel-header-text` -> "Danh sách thông báo".

### Bảng danh sách thông báo (`table.table.table-bordered`)

Bảng hiển thị chi tiết các thông báo, được phân trang.

| Thành phần       | Selector                                  | Mô tả                                   |
| :--------------- | :---------------------------------------- | :-------------------------------------- |
| **Header Cột**   | `tr.k-table-head > th`                    | STT, Nội dung thông báo                 |
| **Dòng dữ liệu** | `tbody > tr` (không phải `.k-table-head`) | Các dòng chứa nội dung thông báo        |
| **STT**          | `td:nth-child(1)`                         | Số thứ tự                               |
| **Nội dung**     | `td:nth-child(2)`                         | Chứa tiêu đề, nội dung và file đính kèm |

### Chi tiết nội dung thông báo (`td:nth-child(2)`)

Cấu trúc bên trong ô nội dung thường không đồng nhất, nhưng có các thành phần chính sau:

| Thành phần        | Selector                         | Mô tả                                  |
| :---------------- | :------------------------------- | :------------------------------------- |
| **Tiêu đề**       | `p > strong` (thường ở dòng đầu) | Tiêu đề chính của thông báo            |
| **Nội dung**      | `p` hoặc `span`                  | Chi tiết nội dung thông báo            |
| **File đính kèm** | `a[id*="hplFiles"]`              | Link tải file (bắt đầu bằng `/Files/`) |

### Footer & Phân trang

- **Dòng phân trang:** `tr.Paging` (xuất hiện ở đầu và cuối bảng).
- **Các nút trang:** `tr.Paging table td a`
- **Cơ chế:** Sử dụng `__doPostBack` của ASP.NET.

---

## 3. Ví dụ dữ liệu & Xử lý (Parsing)

Dữ liệu thông báo thường là HTML hỗn hợp text và link. Cần xử lý lấy text và link file đính kèm.

**Dữ liệu HTML mẫu:**

```html
<td>
  <p><strong>THÔNG BÁO</strong></p>
  <p><strong>V/v mở lớp học phần...</strong></p>
  <p>Chi tiết kế hoạch xem tại đây...</p>
  <p>
    <span><a id="ctl03_ctl00_hplFiles" href="/Files/notifi/...">Xem chi tiết</a></span>
  </p>
</td>
```

**Phân tích & Regex:**

Do cấu trúc HTML trong `td` khá lộn xộn, nên ưu tiên dùng DOM Parser để trích xuất.

1.  **Lấy Link File:**
    - Selector: `a[href^="/Files/notifi/"]`
    - Attribute: `href`

2.  **Lấy Tiêu Đề:**
    - Thường nằm trong thẻ `strong` hoặc `b` đầu tiên.
    - Hoặc lấy dòng text đầu tiên (First Line).

3.  **Lấy Nội Dung Tóm Tắt:**
    - Lấy toàn bộ `innerText` của `td`.
    - Loại bỏ phần link "Xem chi tiết".

**Code mẫu:**

```javascript
// Input: `row` là HTMLTableRowElement (dòng tr)
const contentCell = row.cells[1]; // Cột thứ 2 chứa nội dung

// 1. Lấy Link File
const linkNode = contentCell.querySelector('a[id*="hplFiles"]');
const fileUrl = linkNode ? linkNode.getAttribute('href') : null;

// 2. Lấy nội dung text
// Sử dụng innerText để tự động chuyển <br> và p thành xuống dòng
let text = contentCell.innerText.trim();

// Loại bỏ cụm từ "Xem chi tiết" (thường nằm ở cuối)
text = text.replace(/Xem chi tiết/gi, '').trim();

// 3. Tách tiêu đề và nội dung
const lines = text
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);
const title = lines[0]; // Dòng đầu tiên là tiêu đề
const description = lines.slice(1).join('\n'); // Các dòng còn lại

return {
  title,
  description,
  fileUrl: fileUrl ? `https://gv.haui.edu.vn${fileUrl}` : null,
};
```
