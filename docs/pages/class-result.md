# Kết quả Lớp học phần - Page Selectors

> Chi tiết kết quả của một lớp học phần cụ thể (danh sách sinh viên trong lớp).

---

## 1. Kết quả thi (Exam Result Class)

**URL:** `/student/result/viewexamresultclass?id=*&t=*`

**Panel Header:** `Bảng kết quả thi {TÊN MÔN} {MÃ LHP}`

### Class Info Table

**Selector:** `table.table:first-child`

| Thông tin   | Selector                                     |
| ----------- | -------------------------------------------- |
| Môn         | `tr:nth-child(1) > td:nth-child(2) > strong` |
| Mã lớp ĐL   | `tr:nth-child(3) > td:nth-child(2) > strong` |
| Lớp ưu tiên | `tr:nth-child(3) > td:nth-child(4) > strong` |

### Student List Table

**Selector:** `.kGrid table.table-bordered tbody`

| Cột     | Index | Giá trị                           |
| ------- | ----- | --------------------------------- |
| STT     | 0     | Số thứ tự                         |
| Mã SV   | 1     | Mã sinh viên (ẩn một phần)        |
| Họ tên  | 2     | Link đến trang cá nhân của bạn bè |
| Điểm L1 | 3     | Điểm thi lần 1                    |
| Điểm L2 | 4     | Điểm thi lần 2                    |
| Ghi chú | 5     | Ghi chú                           |

### Statistics Table (Thống kê điểm)

**Selector:** `div.k-panel-mc:last-child table.table`

| Mức điểm           | Màu sắc (class) | Selector          |
| ------------------ | --------------- | ----------------- |
| Xuất sắc (9-10)    | `.green`        | `tr:nth-child(2)` |
| Giỏi (8.0-8.9)     | `.green`        | `tr:nth-child(3)` |
| Khá (7.0-7.9)      | `.blue`         | `tr:nth-child(4)` |
| TB Khá (6-7)       | `.orange`       | `tr:nth-child(5)` |
| Trung bình (5-5.9) | `.yellow`       | `tr:nth-child(6)` |
| Yếu (4-4.9)        | `.red`          | `tr:nth-child(7)` |
| Kém (0-4)          | `.red`          | `tr:nth-child(8)` |

---

## 2. Kết quả học tập (Study Result Class)

**URL:** `/student/result/viewstudyresultclass?id=*&t=*`

**Panel Header:** `Kết quả học tập trên lớp {TÊN MÔN} {MÃ LHP}`

### Student List Table

**Selector:** `.kGrid table.table-bordered tbody`

| Cột           | Index | Giá trị                                  |
| ------------- | ----- | ---------------------------------------- |
| STT           | 0     | Số thứ tự                                |
| Mã SV         | 1     | Mã sinh viên                             |
| Họ tên        | 2     | Link profile                             |
| Điểm TX (1-3) | 3-5   | Điểm thường xuyên cột 1-3                |
| Điểm GK (1-3) | 6-8   | Điểm giữa kỳ cột 1-3                     |
| TB KTTX       | 9-11  | ? (Cần kiểm tra lại mapping cột thực tế) |
| Số tiết nghỉ  | 12    | Số tiết nghỉ                             |
| Điều kiện     | 13    | Đủ/Không đủ điều kiện thi                |

---

## JavaScript Example

```javascript
// Lấy tên môn và mã lớp
const infoTable = document.querySelector('table:first-child');
const subjectName = infoTable
  .querySelector('tr:first-child > td:nth-child(2) > strong')
  ?.textContent?.trim();
const classCode = infoTable
  .querySelector('tr:nth-child(3) > td:nth-child(2) > strong')
  ?.textContent?.trim();

// Lấy danh sách sinh viên
const rows = document.querySelectorAll('.kGrid tbody tr');
rows.forEach((row) => {
  const cells = row.querySelectorAll('td');
  const studentId = cells[1].textContent.trim();
  const name = cells[2].querySelector('a').textContent.trim();
  // ...
});
```
