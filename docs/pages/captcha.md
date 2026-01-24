# Captcha Pages - DOM Structure Reference

> Captcha xuất hiện trên nhiều trang khác nhau trong hệ thống HaUI.

---

## 1. SSO Login Page

**URL:** `/sso?token=*`

| Element       | Selector            |
| ------------- | ------------------- |
| Captcha Image | `#ctl00_Image1`     |
| Text Input    | `#ctl00_txtimgcode` |
| Submit Button | `#ctl00_butLogin`   |

---

## 2. Register Page (Đăng ký học phần)

**URL:** `/register/`

| Element       | Selector            |
| ------------- | ------------------- |
| Captcha Image | `#ctl02_Image1`     |
| Text Input    | `#ctl02_txtimgcode` |
| Submit Button | `#ctl02_btnSubmit`  |

---

## Captcha Characteristics

- **Chỉ chữ cái thường (a-z)** - không có chữ in hoa
- **Có thể có số (0-9)**
- **Không có dấu** - chỉ ký tự ASCII cơ bản
- **Tổng 5 ký tự**

---

## Integration Notes

- Captcha cần được nhập chính xác
- Auto-submit khi nhấn Enter hoặc blur (out focus)
- Trang này sử dụng ASP.NET Web Forms postback
