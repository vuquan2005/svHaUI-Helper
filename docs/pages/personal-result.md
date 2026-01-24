# Kết quả Cá nhân - Page Selectors

> Trang kết quả học tập và kết quả thi của chính sinh viên đang đăng nhập.

---

## 1. Kết quả học tập (Study Results)

**URL:** `/student/result/studyresults`

**Panel Header:** `Kết quả học tập các học phần`

### Info Table

| Thông tin | Selector                                                       |
| --------- | -------------------------------------------------------------- |
| Container | `table.table.table-bordered.table-striped:first-child > tbody` |
| Họ tên    | `tr:nth-child(1) > td:nth-child(2) > strong`                   |
| Mã SV     | `tr:nth-child(2) > td:nth-child(2) > strong`                   |
| Lớp       | `tr:nth-child(3) > td:nth-child(2) > strong`                   |
| Cố vấn    | `tr:nth-child(4) > td:nth-child(2) > strong`                   |

### Results Table

**Selector:** `.kGrid table.table-bordered tbody`

| Cột          | Index | Giá trị                        |
| ------------ | ----- | ------------------------------ |
| STT          | 0     | Số thứ tự                      |
| Tên môn      | 1     | Link đến viewstudyresultclass  |
| Tên lớp      | 2     | Mã lớp ngắn (VD: BS6019.3)     |
| Mã lớp       | 3     | Mã lớp HP (VD: 20231BS6019012) |
| Điểm TX 1-10 | 4-13  | Điểm thường xuyên              |
| Điểm giữa kỳ | 14    | Điểm giữa kỳ                   |
| TB KTTX      | 15    | Trung bình kiểm tra            |
| Số tiết nghỉ | 16    | Số tiết nghỉ                   |
| Điểm CC      | 17    | Điểm chuyên cần                |
| Điều kiện    | 18    | Đủ/Không đủ điều kiện          |
| Ghi chú      | 19    | Ghi chú                        |

---

## 2. Kết quả thi (Exam Results)

**URL:** `/student/result/examresult`

**Panel Header:** `Kết quả thi các môn`

### Info Table

| Thông tin | Selector                                                       |
| --------- | -------------------------------------------------------------- |
| Container | `table.table.table-bordered.table-striped:first-child > tbody` |
| Họ tên    | `tr:nth-child(1) > td:nth-child(2) > strong`                   |
| Mã SV     | `tr:nth-child(2) > td:nth-child(2) > strong`                   |
| Lớp       | `tr:nth-child(3) > td:nth-child(2) > strong`                   |
| Cố vấn    | `tr:nth-child(4) > td:nth-child(2) > strong`                   |

### Results Table

**Selector:** `.kGrid table.table-bordered tbody`

| Cột          | Index | Giá trị                            |
| ------------ | ----- | ---------------------------------- |
| STT          | 0     | Số thứ tự                          |
| Mã HP        | 1     | Mã học phần (VD: BS6019)           |
| Mã in        | 2     | Mã in (VD: HP7202)                 |
| Học phần     | 3     | Tên + link đến viewexamresultclass |
| Học kỳ       | 4     | Học kỳ                             |
| Số TC        | 5     | Số tín chỉ                         |
| TB KTTX      | 6     | Trung bình kiểm tra                |
| Điểm thi L1  | 7     | Điểm thi lần 1                     |
| Điểm thi L2  | 8     | Điểm thi lần 2                     |
| Phúc khảo L1 | 9     | Điểm phúc khảo lần 1               |
| Phúc khảo L2 | 10    | Điểm phúc khảo lần 2               |
| TBM (10)     | 11    | Điểm trung bình môn hệ 10          |
| TBM (4)      | 12    | Điểm trung bình môn hệ 4           |
| Điểm chữ     | 13    | Điểm chữ (A, B, C, D, F)           |
| Xếp loại     | 14    | Xếp loại (Giỏi, Khá, TB...)        |
| Ghi chú      | 15    | Ghi chú                            |
| Ý kiến       | 16    | Nút đánh giá môn học               |

### Summary Row

**Selector:** `.kGrid tbody tr:last-child, .kGrid tbody tr:nth-last-child(2)`

```javascript
// Parse summary info
const summaryRows = document.querySelectorAll('.kGrid tbody tr:not(.kTableRow):not(.kTableAltRow)');
// Tổng số tín chỉ: 148
// Trung bình chung tích lũy: 2.63
// Tổng số tín chỉ tích lũy: 91.0
// Xếp loại tốt nghiệp: Khá
```

---

## Notes

- Trang cá nhân hiển thị **đầy đủ thông tin** (không ẩn mã SV)
- Có thêm cột "Ý kiến" để đánh giá môn học (chỉ ở trang examresult)
- Có cảnh báo yêu cầu đánh giá trước khi xem điểm
