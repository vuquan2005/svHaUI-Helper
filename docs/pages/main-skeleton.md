html
├─ head
│ ├─ meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
│ ├─ meta name="apple-itunes-app" content="app-id=1469388309"
│ ├─ meta name="google-play-app" content="app-id=com.dhcn.MyHAUI"
│ ├─ link rel="shortcut icon" href=".../img/logo-haui-32x32.png"
│ ├─ title "Đại học công nghiệp Hà Nội - Cổng thông tin điện tử"
│ ├─ link rel="stylesheet" href=".../lib/perfect-scrollbar/css/perfect-scrollbar.min.css"
│ ├─ link rel="stylesheet" href=".../lib/material-design-icons/css/material-design-iconic-font.min.css"
│ ├─ link rel="stylesheet" href=".../lib/font-awesome-4.7.0/css/font-awesome.min.css"
│ ├─ link rel="stylesheet" href=".../vnkresource/css/flaticon.css"
│ ├─ link rel="stylesheet" href=".../lib/datetimepicker/css/bootstrap-datetimepicker.min.css"
│ ├─ link rel="stylesheet" href=".../lib/select2/css/select2.min.css"
│ ├─ link rel="stylesheet" href=".../css/style.css"
│ └─ link rel="stylesheet" href=".../css/kstyle.css"
└─ body
├─ div.be-wrapper.be-fixed-sidebar
│ ├─ nav.navbar.navbar-default.navbar-fixed-top.be-top-header > div.container-fluid
│ │ ├─ div.navbar-header > a.navbar-brand href="/"
│ │ └─ div.be-right-navbar
│ │ ├─ ul.nav.navbar-nav.navbar-right.be-user-nav > li.dropdown
│ │ │ ├─ a.dropdown-toggle href="#" > span.user-name "Nguyễn Văn A"
│ │ │ └─ ul.dropdown-menu
│ │ │ ├─ li > div.user-info > div.user-name "Nguyễn Văn A"
│ │ │ ├─ li > a "Account" href="/member/profiles"
│ │ │ │ └─ span.icon.mdi.mdi-face
│ │ │ ├─ li > a "Settings" href="#"
│ │ │ │ └─ span.icon.mdi.mdi-settings
│ │ │ └─ li > a "Logout" href="/logout/..."
│ │ │ └─ span.icon.mdi.mdi-power
│ │ └─ div.page-title > span "Cổng thông tin Sinh viên"
│ ├─ div.be-left-sidebar > div.left-sidebar-wrapper
│ │ ├─ a.left-sidebar-toggle "HỆ THỐNG QUẢN LÝ ĐẠI HỌC - QMC_e.Uni" href="#"
│ │ └─ div.left-sidebar-spacer > div.left-sidebar-scroll > div.left-sidebar-content > ul.sidebar-elements
│ │ ├─ li.divider "TÀI KHOẢN SINH VIÊN"
│ │ ├─ li > a href="/"
│ │ │ ├─ i.icon.mdi.mdi-home
│ │ │ └─ span "Trang chủ"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.fa.fa-book.icon
│ │ │ │ └─ span "Tiện ích"
│ │ │ └─ ul.sub-menu
│ │ │ ├─ li > a href="/student/application/notifilist" > span "Thông báo từ nhà trường"
│ │ │ ├─ li > a href="/student/application/messengeruserlist" > span "Thông báo cá nhân"
│ │ │ ├─ li > a href="/student/recharge/serviceonegate" > span "Dịch vụ một cửa"
│ │ │ ├─ li > a href="/STSV2023/index.html" > span "Sổ tay sinh viên"
│ │ │ ├─ li > a href="/student/application/sotayantoan" > span "Sổ tay an toàn"
│ │ │ ├─ li > a "HDSD phần mềm, ứng dụng" href="https://itc.haui.edu.vn/vn/ung-dung"
│ │ │ ├─ li > a "HD khai thác hạ tầng mạng" href="https://itc.haui.edu.vn/vn/khai-thac-ha-tang"
│ │ │ └─ li > a "HD đánh giá KQ học tập" href="/student/application/hddanhgiaketquahoctap"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.fa.flaticon-live2.icon
│ │ │ │ └─ span "Chia sẻ thông tin"
│ │ │ └─ ul
│ │ │ ├─ li > a "Chia sẻ trong lớp" href="/messages"
│ │ │ ├─ li > a "Chia sẻ với nhà trường" href="/messages/group"
│ │ │ └─ li > a "Trao đổi thông tin lớp học phần" href="/messages/listclass"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.fa.flaticon-student40.icon
│ │ │ │ └─ span "Hỗ trợ việc làm"
│ │ │ └─ ul.sub-menu
│ │ │ ├─ li > a href="/student/application/advertiselist?t=1" > span "Tuyển dụng"
│ │ │ ├─ li > a href="/student/application/advertiselist?t=2" > span "Hội thảo việc làm"
│ │ │ ├─ li > a href="/student/application/advertiselist?t=3" > span "Đào tạo tuyển dụng"
│ │ │ ├─ li > a href="/student/application/advertiselist?t=4" > span "Tham quan doanh nghiệp"
│ │ │ ├─ li > a href="/student/application/advertiselist?t=5" > span "Thực tập doanh nghiệp"
│ │ │ ├─ li > a href="/student/application/advertiselist?t=6" > span "Trải nghiệm thực tế"
│ │ │ └─ li > a href="/student/application/advertiselist?t=7" > span "Tài trợ học bổng"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.fa.flaticon-boy31.icon
│ │ │ │ └─ span "Thông tin cá nhân"
│ │ │ └─ ul.sub-menu
│ │ │ ├─ li > a#sub_userdetail href="/student/userdetail/userdetail"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Cập nhật thông tin sinh viên"
│ │ │ ├─ li > a#sub_userprofile href="/student/userdetail/updateuserprofile"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Cập nhật hồ sơ sinh viên"
│ │ │ ├─ li > a#sub_usercerupdate href="/student/userdetail/usercerupdate"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Cập nhật thông tin in bằng"
│ │ │ ├─ li > a#sub_changepass href="/member/changepass"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Đổi mật khẩu"
│ │ │ ├─ li > a#sub_userrevenueslist href="/student/userdetail/userrevenueslist"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "DS giấy tờ hồ sơ"
│ │ │ └─ li > a#sub_militaryclothes href="/student/userdetail/militaryclothes"
│ │ │ ├─ span.imgwrap
│ │ │ └─ span.linkwrap "ĐK Quân tư trang"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.icon.mdi.mdi-money-box
│ │ │ │ └─ span "Theo dõi giao dịch"
│ │ │ └─ ul
│ │ │ ├─ li > a#sub_cashinqr href="/student/recharge/cashinqr"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Nạp tiền QR code"
│ │ │ ├─ li > a#sub_cashin href="/student/recharge/cashin"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Nạp tiền vào tài khoản"
│ │ │ ├─ li > a#sub_inpatientpayment href="/student/recharge/inpatientpayment"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Thanh toán công nợ"
│ │ │ ├─ li > a#sub_transactionhistory href="/student/recharge/transactionhistory"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Lịch sử giao dịch"
│ │ │ └─ li > a#sub_listeinvoice href="/student/recharge/listeinvoice"
│ │ │ ├─ span.imgwrap
│ │ │ └─ span.linkwrap "In hóa đơn điện tử"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.icon.mdi.mdi-book
│ │ │ │ └─ span "Chương trình đào tạo"
│ │ │ └─ ul
│ │ │ ├─ li > a#sub_viewcourseindustry href="/training/viewcourseindustry"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Khung chương trình"
│ │ │ └─ li > a#sub_viewcourseindustry1 href="/training/programmodulessemester"
│ │ │ ├─ span.imgwrap
│ │ │ └─ span.linkwrap "Khung theo kỳ"
│ │ ├─ li > a#sub_preorder href="/register/dangkyhocphan"
│ │ │ ├─ i.icon.mdi.mdi-calendar-note
│ │ │ └─ span "ĐK HP dự kiến"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.fa.flaticon-key105.icon
│ │ │ │ └─ span "Đăng ký học phần"
│ │ │ └─ ul
│ │ │ ├─ li > a#sub_register href="/register/"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Đăng ký học phần"
│ │ │ ├─ li > a#sub_dangkyDAKLTN href="/register/dangkyDAKLTN"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Đăng ký học phần ĐA/KLTN"
│ │ │ ├─ li > a#sub_removeclasslist href="/training/removeclasslist"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Rút học phần"
│ │ │ ├─ li > a#sub_statisticregister href="/training/statisticregister"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Thông tin đăng ký học phần"
│ │ │ ├─ li > a#sub_viewprogram href="/training/viewprogram"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Đăng ký học CT2"
│ │ │ ├─ li > a#sub_viewprogramtwo href="/training/listprogramtwo"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "DS đơn đăng ký học CT2"
│ │ │ └─ li > a#sub_viewmodules2 href="/training/viewmodules2"
│ │ │ ├─ span.imgwrap
│ │ │ └─ span.linkwrap "Kiểm tra tiến độ CT2"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.fa.flaticon-key105.icon
│ │ │ │ └─ span "ĐK học trước thạc sĩ"
│ │ │ └─ ul
│ │ │ ├─ li > a#sub_viewprogramsdh href="/training/viewprogramsdh"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "ĐK học trước HP thạc sĩ"
│ │ │ ├─ li > a#sub_listprogramsdh href="/training/listprogramsdh"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "DS đơn đăng ký"
│ │ │ ├─ li > a#sub_viewmodulessdh href="/training/viewmodulessdh"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Kiểm tra tiến độ"
│ │ │ └─ li > a#sub_onlineregister href="/registersdh/onlineregister"
│ │ │ ├─ span.imgwrap
│ │ │ └─ span.linkwrap "Đăng ký học phần"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.icon.mdi.mdi-alarm-check
│ │ │ │ └─ span "Thời khóa biểu"
│ │ │ └─ ul.sub-menu
│ │ │ ├─ li > a href="/timestable/calendarct" > span "KH học tập đầu khóa"
│ │ │ ├─ li > a#sub_calendarcl href="/timestable/calendarcl"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Thời khóa biểu"
│ │ │ └─ li > a#sub_timestableview href="/timestable/timestableview"
│ │ │ ├─ span.imgwrap
│ │ │ └─ span.linkwrap "Xem lịch giảng dạy"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.fa.flaticon-calendar130.icon
│ │ │ │ └─ span "Theo dõi lịch thi"
│ │ │ └─ ul.sub-menu
│ │ │ ├─ li > a#sub_examplant href="/student/schedulefees/examplant"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Kế hoạch thi"
│ │ │ ├─ li > a#sub_transactionmodules href="/student/schedulefees/transactionmodules"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Lịch thi"
│ │ │ └─ li > a#sub_shcd href="https://tracnghiem.haui.edu.vn/login/index.php?u=...&p=..."
│ │ │ ├─ span.imgwrap
│ │ │ └─ span.linkwrap "Đánh giá tuần SHCD"
│ │ ├─ li > a href="/study"
│ │ │ ├─ i.fa.flaticon-science1.icon
│ │ │ └─ span "Học trực tuyến"
│ │ ├─ li > a href="/sso/qpan"
│ │ │ ├─ i.fa.flaticon-student40.icon
│ │ │ └─ span "Giáo dục QP&AN Online"
│ │ ├─ li > a href="/sso/dlearning"
│ │ │ ├─ i.fa.flaticon-student40.icon
│ │ │ └─ span "Đào tạo từ xa"
│ │ ├─ li > a#sub_testonline href="/student/schedulefees/testonline"
│ │ │ ├─ i.fa.flaticon-basic2.icon
│ │ │ └─ span "Thi Online"
│ │ ├─ li > a#sub_testonlineqpan href="/student/schedulefees/testonlineqpan"
│ │ │ ├─ i.icon.mdi.mdi-balance-wallet
│ │ │ └─ span.linkwrap "Thi GD QP&AN Online"
│ │ ├─ li > a#sub_dakltnonline href="/student/schedulefees/dakltnonline"
│ │ │ ├─ i.icon.mdi.mdi-group
│ │ │ └─ span.linkwrap "Bảo vệ ĐAKLTN Online"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.fa.flaticon-a10.icon
│ │ │ │ └─ span "Theo dõi KQ học tập"
│ │ │ └─ ul.sub-menu
│ │ │ ├─ li > a#sub_studyresults href="/student/result/studyresults"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Kết quả học tập"
│ │ │ ├─ li > a#sub_examresult href="/student/result/examresult"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Kết quả thi"
│ │ │ ├─ li > a#sub_sendreceiveapplications href="/student/result/sendreceiveapplications"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Nộp đơn phúc tra"
│ │ │ ├─ li > a#sub_sendexamreview href="/student/result/sendexamreview"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Đăng ký xem lại bài"
│ │ │ ├─ li > a#sub_viewscorebysemester href="/student/result/viewscorebysemester"
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Trung bình chung học kỳ"
│ │ │ └─ li > a#sub_viewmodules href="/student/result/viewmodules"
│ │ │ ├─ span.imgwrap
│ │ │ └─ span.linkwrap "Trung bình chung tích lũy"
│ │ ├─ li > a href="/tttn/htdn/list"
│ │ │ ├─ i.fa.flaticon-person277.icon
│ │ │ └─ span "Thực tập tốt nghiệp"
│ │ ├─ li > a#sub_graduatecal href="/student/result/graduatecal"
│ │ │ ├─ i.icon.mdi.mdi-folder-star-alt
│ │ │ ├─ span.imgwrap
│ │ │ └─ span.linkwrap "Xét tốt nghiệp"
│ │ ├─ li.parent
│ │ │ ├─ a href="#"
│ │ │ │ ├─ i.fa.flaticon-a10.icon
│ │ │ │ └─ span "Thông tin in bằng"
│ │ │ └─ ul.sub-menu
│ │ │ ├─ li > a#sub_degreeview href="/student/result/degreeview"
│ │ │ │ ├─ i.icon.mdi.mdi-folder-star-alt
│ │ │ │ ├─ span.imgwrap
│ │ │ │ └─ span.linkwrap "Thông tin in bằng"
│ │ │ └─ li > a#sub_degreeprint href="/student/result/degreeprint"
│ │ │ ├─ i.icon.mdi.mdi-folder-star-alt
│ │ │ ├─ span.imgwrap
│ │ │ └─ span.linkwrap "Bản in"
│ │ ├─ li > a href="/student/evaluation/listsemester"
│ │ │ ├─ i.fa.flaticon-person277.icon
│ │ │ └─ span "Đánh giá rèn luyện"
│ │ ├─ li > a href="/sso/btl"
│ │ │ ├─ i.fa.flaticon-academic.icon
│ │ │ └─ span "Kiểm tra luận văn"
│ │ └─ li > a href="/survey"
│ │ ├─ i.fa.flaticon-questions.icon
│ │ └─ span "Khảo sát"
│ └─ div.be-content > div.main-content.container-fluid > form#frmMain name="frmMain"
│ ├─ div > input#**VIEWSTATE name="**VIEWSTATE"
│ ├─ div > input#**VIEWSTATEGENERATOR name="**VIEWSTATEGENERATOR"
│ └─ **Main content**
├─ div#kZoom.modal.fade.bs-example-modal-lg > div.modal-dialog.modal-lg > div#kbox.modal-content
├─ div#pdg
└─ div#notification
