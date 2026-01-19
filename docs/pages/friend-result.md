# Kết quả Bạn bè - Page Selectors

> Trang xem kết quả học tập/thi của sinh viên khác (bạn bè cùng lớp).

---

## 1. Kết quả học tập (View Study Result)

**URL:** `/student/result/viewstudyresult?code=*&t=*`

**Panel Header:** `Kết quả học tập các môn {TÊN} {LỚP}`

### Info Table

| Thông tin | Selector |
|-----------|----------|
| Container | `table.table.table-bordered.table-striped:first-child > tbody` |
| Họ tên | `tr:nth-child(1) > td:nth-child(2) > strong` |
| Mã SV | `tr:nth-child(2) > td:nth-child(2) > strong` (ẩn một phần: `2********1`) |
| Lớp | `tr:nth-child(3) > td:nth-child(2) > strong` |

### Results Table

**Selector:** `.kGrid table.table-bordered tbody`

| Cột | Index | Giá trị |
|-----|-------|---------|
| STT | 0 | Số thứ tự |
| Tên môn | 1 | Link đến viewstudyresultclass |
| Mã lớp | 2 | Mã lớp HP (VD: 20231BS6019012) |
| Điểm TX 1-6 | 3-8 | Điểm thường xuyên |
| Điểm giữa kỳ | 9 | Điểm giữa kỳ |
| TB KTTX | 10 | Trung bình kiểm tra |
| Số tiết nghỉ | 11 | Số tiết nghỉ |
| Điều kiện | 12 | Đủ/Không đủ điều kiện |
| Ghi chú | 13 | Ghi chú |

---

## 2. Kết quả thi (View Exam Result)

**URL:** `/student/result/viewexamresult?code=*&t=*`

**Panel Header:** `Kết quả thi các môn {TÊN} {LỚP}`

### Info Table

| Thông tin | Selector |
|-----------|----------|
| Container | `table.table.table-bordered.table-striped:first-child > tbody` |
| Họ tên | `tr:nth-child(1) > td:nth-child(2) > strong` |
| Mã SV | `tr:nth-child(2) > td:nth-child(2) > strong` (ẩn một phần) |
| Lớp | `tr:nth-child(3) > td:nth-child(2) > strong` |

### Results Table

**Selector:** `.kGrid table.table-bordered tbody`

| Cột | Index | Giá trị |
|-----|-------|---------|
| STT | 0 | Số thứ tự |
| Mã HP | 1 | Mã học phần (VD: BS6019) |
| Mã in | 2 | Mã in (VD: HP7202) |
| Học phần | 3 | Tên + link |
| Học kỳ | 4 | Học kỳ |
| Số TC | 5 | Số tín chỉ |
| TB KTTX | 6 | Trung bình kiểm tra |
| Điểm thi L1 | 7 | Điểm thi lần 1 |
| Điểm thi L2 | 8 | Điểm thi lần 2 |
| Phúc khảo L1 | 9 | Điểm phúc khảo lần 1 |
| Phúc khảo L2 | 10 | Điểm phúc khảo lần 2 |
| TBM (10) | 11 | Điểm 10 |
| TBM (4) | 12 | Điểm 4 |
| Điểm chữ | 13 | Điểm chữ |
| Xếp loại | 14 | Xếp loại |

### Summary Row

```javascript
// Tổng số tín chỉ: 145
// Trung bình chung tích lũy: 2.98
// Tổng số tín chỉ tích lũy: 86.0
// Xếp loại tốt nghiệp: Khá
```

---

## JavaScript Example

```javascript
const table = document.querySelector('table:first-child');

const name = table.querySelector(
    'tbody > tr:first-child > td:nth-child(2)'
)?.textContent?.trim();

const className = table.querySelector(
    'tbody > tr:nth-child(3) > td:nth-child(2)'
)?.textContent?.trim();
```

---

## Notes

- Mã sinh viên bị **ẩn một phần** (VD: `2********1`)
- Không có cột "Ý kiến" như trang cá nhân
- Không có thông tin cố vấn học tập
