# HaUI Portal - Website Structure Reference

> Tài liệu tham khảo cấu trúc trang web Cổng thông tin sinh viên HaUI (sv.haui.edu.vn).

---

## Tech Stack

**Server Framework:** ASP.NET Web Forms (Viewstate detected)

**UI Framework:** Bootstrap (implied by grid system and components)

**Template Pattern:** Beagle Admin-like structure (`.be-wrapper`, `.be-top-header`, `.be-left-sidebar`)

**Libraries:**
- **CSS:**
  - `perfect-scrollbar`
  - `material-design-icons`
  - `font-awesome` (v4.7.0)
  - `flaticon`
  - `bootstrap-datetimepicker`
  - `select2`
- **JS:** `jquery (1.12.4)`, `bootstrap (3.3.7)`, `perfect-scrollbar`, `moment.js`, `select2`
- **Custom:** `style.css`, `kstyle.css`

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

### Tiện ích
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/application/notifilist` | Thông báo từ nhà trường | - |
| `/student/application/messengeruserlist` | Thông báo cá nhân | - |
| `/student/recharge/serviceonegate` | Dịch vụ một cửa | - |
| `/STSV2023/index.html` | Sổ tay sinh viên | - |
| `/student/application/sotayantoan` | Sổ tay an toàn | - |
| `https://itc.haui.edu.vn/vn/ung-dung` | HDSD phần mềm, ứng dụng | External |
| `https://itc.haui.edu.vn/vn/khai-thac-ha-tang` | HD khai thác hạ tầng mạng | External |
| `/student/application/hddanhgiaketquahoctap` | HD đánh giá KQ học tập | - |

---

### Chia sẻ thông tin
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/messages` | Chia sẻ trong lớp | - |
| `/messages/group` | Chia sẻ với nhà trường | - |
| `/messages/listclass` | Trao đổi thông tin lớp học phần | - |

---

### Hỗ trợ việc làm
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/application/advertiselist?t=1` | Tuyển dụng | - |
| `/student/application/advertiselist?t=2` | Hội thảo việc làm | - |
| `/student/application/advertiselist?t=3` | Đào tạo tuyển dụng | - |
| `/student/application/advertiselist?t=4` | Tham quan doanh nghiệp | - |
| `/student/application/advertiselist?t=5` | Thực tập doanh nghiệp | - |
| `/student/application/advertiselist?t=6` | Trải nghiệm thực tế | - |
| `/student/application/advertiselist?t=7` | Tài trợ học bổng | - |

---

### Thông tin cá nhân
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/userdetail/userdetail` | Cập nhật thông tin sinh viên | `#sub_userdetail` |
| `/student/userdetail/updateuserprofile` | Cập nhật hồ sơ sinh viên | `#sub_userprofile` |
| `/student/userdetail/usercerupdate` | Cập nhật thông tin in bằng | `#sub_usercerupdate` |
| `/member/changepass` | Đổi mật khẩu | `#sub_changepass` |
| `/student/userdetail/userrevenueslist` | DS giấy tờ hồ sơ | `#sub_userrevenueslist` |
| `/student/userdetail/militaryclothes` | ĐK Quân tư trang | `#sub_militaryclothes` |

---

### Theo dõi giao dịch (Tài chính)
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/recharge/cashinqr` | Nạp tiền QR code | `#sub_cashinqr` |
| `/student/recharge/cashin` | Nạp tiền vào tài khoản | `#sub_cashin` |
| `/student/recharge/inpatientpayment` | Thanh toán công nợ | `#sub_inpatientpayment` |
| `/student/recharge/transactionhistory` | Lịch sử giao dịch | `#sub_transactionhistory` |
| `/student/recharge/listeinvoice` | In hóa đơn điện tử | `#sub_listeinvoice` |

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

### ĐK HP dự kiến
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/register/dangkyhocphan` | ĐK HP dự kiến | `#sub_preorder` |

---

### Đăng ký học phần
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/register/` | Đăng ký học phần | `#sub_register` |
| `/register/dangkyDAKLTN` | Đăng ký học phần ĐA/KLTN | `#sub_dangkyDAKLTN` |
| `/training/removeclasslist` | Rút học phần | `#sub_removeclasslist` |
| `/training/statisticregister` | Thông tin đăng ký học phần | `#sub_statisticregister` |
| `/training/viewprogram` | Đăng ký học CT2 | `#sub_viewprogram` |
| `/training/listprogramtwo` | DS đơn đăng ký học CT2 | `#sub_viewprogramtwo` |
| `/training/viewmodules2` | Kiểm tra tiến độ CT2 | `#sub_viewmodules2` |

---

### ĐK học trước thạc sĩ
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/training/viewprogramsdh` | ĐK học trước HP thạc sĩ | `#sub_viewprogramsdh` |
| `/training/listprogramsdh` | DS đơn đăng ký | `#sub_listprogramsdh` |
| `/training/viewmodulessdh` | Kiểm tra tiến độ | `#sub_viewmodulessdh` |
| `/registersdh/onlineregister` | Đăng ký học phần | `#sub_onlineregister` |

---

### Thời khóa biểu
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/timestable/calendarct` | KH học tập đầu khóa | - |
| `/timestable/calendarcl` | Thời khóa biểu | `#sub_calendarcl` |
| `/timestable/timestableview` | Xem lịch giảng dạy | `#sub_timestableview` |

---

### Theo dõi lịch thi
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/schedulefees/examplant` | Kế hoạch thi | `#sub_examplant` |
| `/student/schedulefees/transactionmodules` | Lịch thi | `#sub_transactionmodules` |
| `https://tracnghiem.haui.edu.vn/login/index.php?...` | Đánh giá tuần SHCD | `#sub_shcd`, External |

---

### Học trực tuyến
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/study` | Học trực tuyến | - |
| `/sso/qpan` | Giáo dục QP&AN Online | - |
| `/sso/dlearning` | Đào tạo từ xa | - |

---

### Thi Online
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/schedulefees/testonline` | Thi Online | `#sub_testonline` |
| `/student/schedulefees/testonlineqpan` | Thi GD QP&AN Online | `#sub_testonlineqpan` |
| `/student/schedulefees/dakltnonline` | Bảo vệ ĐAKLTN Online | `#sub_dakltnonline` |

---

### Theo dõi KQ học tập

> 📄 Chi tiết: [personal-result.md](personal-result.md)

| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/result/studyresults` | Kết quả học tập | `#sub_studyresults` |
| `/student/result/examresult` | Kết quả thi | `#sub_examresult` |
| `/student/result/sendreceiveapplications` | Nộp đơn phúc tra | `#sub_sendreceiveapplications` |
| `/student/result/sendexamreview` | Đăng ký xem lại bài | `#sub_sendexamreview` |
| `/student/result/viewscorebysemester` | Trung bình chung học kỳ | `#sub_viewscorebysemester` |
| `/student/result/viewmodules` | Trung bình chung tích lũy | `#sub_viewmodules` |

#### Kết quả học tập - Lớp (Dynamic)

> 📄 Chi tiết: [class-result.md](class-result.md)

| URL Pattern | Panel Header Example |
|-------------|---------------------|
| `/student/result/viewexamresultclass?id=*&t=*` | Bảng kết quả thi {TÊN MÔN} {MÃ LHP} |
| `/student/result/viewstudyresultclass?id=*&t=*` | Kết quả học tập trên lớp {TÊN MÔN} {MÃ LHP} |

#### Kết quả học tập - Bạn bè (Dynamic)

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

---

### Thông tin in bằng
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/result/degreeview` | Thông tin in bằng | `#sub_degreeview` |
| `/student/result/degreeprint` | Bản in | `#sub_degreeprint` |

---

### Khác
| URL | Panel Header | Ghi chú |
|-----|--------------|---------|
| `/student/evaluation/listsemester` | Đánh giá rèn luyện | - |
| `/sso/btl` | Kiểm tra luận văn | - |
| `/survey` | Khảo sát | - |

---
