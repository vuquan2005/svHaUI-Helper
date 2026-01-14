# Chi tiết Học phần - Page Selectors

> URL: `/training/viewmodulescdiosv/*.htm` hoặc `/training/viewcourseindustry2/*.htm`

## Panel Header

**Selector:** `span.k-panel-header-text:first-child`

**Format:**
```
CHI TIẾT HỌC PHẦN CDIO: {TÊN MÔN} ( {MÃ} )
CHI TIẾT HỌC PHẦN: {TÊN MÔN} ( {MÃ} )
```

**Ví dụ:**
```
CHI TIẾT HỌC PHẦN CDIO: KỸ NĂNG SỬ DỤNG CÔNG NGHỆ THÔNG TIN CƠ BẢN ( IC6005 )
CHI TIẾT HỌC PHẦN: KỸ NĂNG SỬ DỤNG CÔNG NGHỆ THÔNG TIN CƠ BẢN ( IC6005 )
```

## Parse Regex

```javascript
// Match: CHI TIẾT HỌC PHẦN (CDIO): TÊN MÔN ( CODE )
const match = header.match(/CHI TIẾT HỌC PHẦN[^:]*:\s*(.+?)\s*\(\s*([A-Z]{2}\d+)\s*\)/);
// match[1] = Tên môn
// match[2] = Mã môn (IC6005)
```

## Mã học phần

Có 2 dạng mã:
- `HP7527` - Mã số (xuất hiện trong URL query `id=`)
- `IC6005` - Mã ngành (dễ đọc hơn, xuất hiện trong panel header)

Prefix phổ biến:
- `IC` - Công nghệ thông tin
- `FE` - Tiếng Anh
- `ME` - Cơ khí
- `FL` - Ngoại ngữ
- ...
