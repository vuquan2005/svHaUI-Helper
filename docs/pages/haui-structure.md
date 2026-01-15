# HaUI Portal - Website Structure Reference

> Tài liệu tham khảo cấu trúc trang web Cổng thông tin sinh viên HaUI (sv.haui.edu.vn).

---

## Tech Stack

**Framework:** ASP.NET Web Forms

**Libraries:**
- CSS: `perfect-scrollbar`, `material-design-icons`, `font-awesome`, `flaticon`, `bootstrap-datetimepicker`, `select2`
- Custom: `style.css`, `kstyle.css`
- JS: `jquery`, `bootstrap`, `perfect-scrollbar`, `moment.js`, `select2`

---

## Layout Structure

```
body > .be-wrapper
├── nav.navbar-fixed-top (.be-top-header)  → Header
├── div.be-left-sidebar                     → Sidebar Menu  
└── div.be-content                          → Main Content
```

### Common Selectors

| Component | Selector |
|-----------|----------|
| Top Header | `.be-top-header` |
| Sidebar | `.be-left-sidebar` |
| Main Content | `.be-content` |
| User Name | `.be-user-nav .user-name` |
| Main Form | `#frmMain` |
| Panel Header | `span.k-panel-header-text:first-child` |

---

## Authentication

> 📄 Chi tiết: [captcha.md](captcha.md)

| URL Pattern | Ghi chú |
|-------------|---------|
| `/sso?token=*` | Captcha page - xác thực SSO |

---

## Page Routes

### Trang chủ
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/` | - | Homepage |

---

### Tài chính
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/recharge/cashinqr` | Nạp tiền QR code | `#sub_cashinqr` |
| `/student/recharge/cashin` | Nạp tiền vào tài khoản | `#sub_cashin` |
| `/student/recharge/inpatientpayment` | Thanh toán công nợ | `#sub_inpatientpayment` |
| `/student/recharge/transactionhistory` | Lịch sử giao dịch | `#sub_transactionhistory` |
| `/student/recharge/listeinvoice` | In hóa đơn điện tử | `#sub_listeinvoice` |

---

### Thông tin cá nhân
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/userdetail/userdetail` | Cập nhật thông tin SV | `#sub_userdetail` |
| `/student/userdetail/updateuserprofile` | Cập nhật hồ sơ | `#sub_userprofile` |
| `/student/userdetail/usercerupdate` | TT in bằng | `#sub_usercerupdate` |
| `/member/changepass` | Đổi mật khẩu | `#sub_changepass` |
| `/student/userdetail/militaryclothes` | ĐK Quân tư trang | `#sub_militaryclothes` |

---

### Đăng ký học phần
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/register/dangkyhocphan` | ĐK HP dự kiến | `#sub_preorder` |
| `/register/` | Đăng ký học phần | `#sub_register` |
| `/training/removeclasslist` | Rút HP | `#sub_removeclasslist` |
| `/training/statisticregister` | Thống kê ĐKHP | `#sub_statisticregister` |
| `/training/viewprogram` | Đăng ký học 2 chương trình | `#sub_viewprogram` |

---

### Chương trình đào tạo
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/training/viewcourseindustry` | Khung chương trình | `#sub_viewcourseindustry` |
| `/training/programmodulessemester` | Khung theo kỳ | `#sub_viewcourseindustry1` |

#### Chi tiết học phần (Dynamic)

> 📄 Chi tiết: [course-detail.md](course-detail.md)

| URL Pattern | Panel Header Example |
|-------------|---------------------|
| `/training/viewmodulescdiosv/*.htm?id=*&ver=*` | CHI TIẾT HỌC PHẦN CDIO: {TÊN} ( {MÃ} ) |
| `/training/viewcourseindustry2/*.htm?id=*&ver=*` | CHI TIẾT HỌC PHẦN: {TÊN} ( {MÃ} ) |

---

### Lịch học & Thời khóa biểu
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/timestable/calendarct` | KH học tập đầu khóa | - |
| `/timestable/calendarcl` | Thời khóa biểu | `#sub_calendarcl` |
| `/timestable/timestableview` | Lịch giảng dạy | `#sub_timestableview` |

---

### Lịch thi
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/schedulefees/examplant` | Kế hoạch thi | `#sub_examplant` |
| `/student/schedulefees/transactionmodules` | Lịch thi | `#sub_transactionmodules` |
| `/student/schedulefees/testonline` | Thi Online | `#sub_testonline` |

---

### Kết quả học tập - Cá nhân
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/result/studyresults` | Kết quả học tập các học phần | `#sub_studyresults` |
| `/student/result/examresult` | Kết quả thi các môn | `#sub_examresult` |
| `/student/result/viewscorebysemester` | ĐTB học kỳ | `#sub_viewscorebysemester` |
| `/student/result/viewmodules` | ĐTB tích lũy | `#sub_viewmodules` |
| `/student/result/sendreceiveapplications` | Phúc tra | `#sub_sendreceiveapplications` |

---

### Kết quả học tập - Lớp (Dynamic)

> 📄 Chi tiết: [class-result.md](class-result.md)

| URL Pattern | Panel Header Example |
|-------------|---------------------|
| `/student/result/viewexamresultclass?id=*&t=*` | Bảng kết quả thi {TÊN MÔN} {MÃ LHP} |
| `/student/result/viewstudyresultclass?id=*&t=*` | Kết quả học tập trên lớp {TÊN MÔN} {MÃ LHP} |

---

### Kết quả học tập - Bạn bè (Dynamic)

> 📄 Chi tiết: [friend-result.md](friend-result.md)

| URL Pattern | Panel Header Example |
|-------------|---------------------|
| `/student/result/viewstudyresult?code=*&t=*` | Kết quả học tập các môn {TÊN} {LỚP} |
| `/student/result/viewexamresult?code=*&t=*` | Kết quả thi các môn {TÊN} {LỚP} |

---

### Tốt nghiệp
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/tttn/htdn/list` | Thực tập tốt nghiệp | - |
| `/student/result/graduatecal` | Xét tốt nghiệp | `#sub_graduatecal` |
| `/student/result/degreeview` | TT in bằng | `#sub_degreeview` |

---

### Tiện ích khác
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/application/notifilist` | Thông báo nhà trường | - |
| `/student/application/messengeruserlist` | Thông báo cá nhân | - |
| `/student/recharge/serviceonegate` | Dịch vụ một cửa | - |
| `/messages` | Chia sẻ trong lớp | - |
| `/messages/group` | Chia sẻ với trường | - |
| `/study` | Học trực tuyến | - |
| `/survey` | Khảo sát | - |

---
