# Kết quả Bạn bè - Page Selectors

> URL: `/student/result/viewstudyresult?code=*&t=*` hoặc `/student/result/viewexamresult?code=*&t=*`

## Panel Header

**Selector:** `span.k-panel-header-text:first-child`

**Format:**
```
Kết quả học tập các môn {TÊN} {LỚP}
Kết quả thi các môn {TÊN} {LỚP}
```

**Ví dụ:**
```
Kết quả học tập các môn Nguyễn Văn A 2023DHCTDT01
Kết quả thi các môn Nguyễn Văn A 2023DHCTDT01
```

## Context Selectors

Thông tin bạn bè nằm trong table đầu tiên:

| Thông tin | Selector |
|-----------|----------|
| Họ tên | `table:first-child > tbody > tr:first-child > td:nth-child(2)` |
| Lớp | `table:first-child > tbody > tr:nth-child(3) > td:nth-child(2)` |

## JavaScript Example

```javascript
const table = document.querySelector('table:first-child');

const name = table.querySelector(
    'tbody > tr:first-child > td:nth-child(2)'
)?.textContent?.trim();

const className = table.querySelector(
    'tbody > tr:nth-child(3) > td:nth-child(2)'
)?.textContent?.trim();

// name = "Nguyễn Văn A"
// className = "2023DHCTDT01"
```
