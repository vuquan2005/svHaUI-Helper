# Kết quả Lớp học phần - Page Selectors

> URL: `/student/result/viewexamresultclass?id=*&t=*` hoặc `/student/result/viewstudyresultclass?id=*&t=*`

## Panel Header

**Selector:** `span.k-panel-header-text:first-child`

**Format:**
```
Bảng kết quả thi {TÊN MÔN} {MÃ LHP}
Kết quả học tập trên lớp {TÊN MÔN} {MÃ LHP}
```

**Ví dụ:**
```
Bảng kết quả thi Nhập môn nghiên cứu khoa học 20231BS6019012
Kết quả học tập trên lớp Nhập môn nghiên cứu khoa học 20231BS6019012
```

## Context Selectors

Thông tin lớp nằm trong table đầu tiên:

| Thông tin | Selector |
|-----------|----------|
| Tên môn | `table:first-child > tbody > tr:first-child > td:nth-child(2)` |
| Mã lớp HP | `table:first-child > tbody > tr:nth-child(3) > td:nth-child(2)` |

## JavaScript Example

```javascript
const table = document.querySelector('table:first-child');

const subjectName = table.querySelector(
    'tbody > tr:first-child > td:nth-child(2)'
)?.textContent?.trim();

const classCode = table.querySelector(
    'tbody > tr:nth-child(3) > td:nth-child(2)'
)?.textContent?.trim();

// subjectName = "Nhập môn nghiên cứu khoa học"
// classCode = "20231BS6019012"
```
