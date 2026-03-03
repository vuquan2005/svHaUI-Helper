// ============================================
// Static URL → Title Mapping
// ============================================

/**
 * Static URL-to-title map. Keyed by pathname (exact match).
 * Grouped by functional domain for easier maintenance.
 */

const home = {
    '/': '🏠 Trang chủ',
} as const;

const auth = {
    '/sso': '🛡️ Xác thực captcha',
} as const;

const finance = {
    '/student/recharge/cashinqr': '💳 Nạp tiền QR',
    '/student/recharge/cashin': '💳 Nạp tiền TK',
    '/student/recharge/inpatientpayment': '💰 Thanh toán môn',
    '/student/recharge/transactionhistory': '📜 Lịch sử GD',
    '/student/recharge/listeinvoice': '🧾 Hóa đơn ĐT',
} as const;

const profile = {
    '/student/userdetail/userdetail': '👤 Thông tin SV',
    '/student/userdetail/updateuser': '👤 Thông tin SV',
    '/student/userdetail/updateuserprofile': '📝 Cập nhật hồ sơ',
    '/student/userdetail/usercerupdate': '🎓 TT in bằng',
    '/member/changepass': '🔐 Đổi mật khẩu',
    '/student/userdetail/militaryclothes': '🎖️ ĐK Quân tư trang',
    '/student/userdetail/userrevenueslist': '📂 Giấy tờ/Hồ sơ',
} as const;

const registration = {
    '/register/dangkyhocphan': '📝 ĐK HP dự kiến',
    '/register/': '📝 Đăng ký học phần',
    '/register/dangkyDAKLTN': '📝 ĐK ĐA/KLTN',
    '/training/removeclasslist': '❌ Rút HP',
    '/training/statisticregister': '📊 TThông tin đăng ký học phần',
    '/training/viewprogram': '📚 ĐK 2 chương trình',
    '/training/listprogramtwo': '📋 DS đơn CT2',
    '/training/viewmodules2': '📊 Tiến độ CT2',
} as const;

const curriculum = {
    '/training/viewcourseindustry': '📚 Khung CT',
    '/training/programmodulessemester': '📅 Khung theo kỳ',
} as const;

const postgraduate = {
    '/training/viewprogramsdh': '🎓 ĐK học trước ThS',
    '/training/listprogramsdh': '📋 DS đơn ThS',
    '/training/viewmodulessdh': '📊 Tiến độ ThS',
    '/registersdh/onlineregister': '📝 ĐK HP ThS',
} as const;

const schedule = {
    '/timestable/calendarct': '📆 Kế hoạch đầu khóa',
    '/timestable/calendarcl': '🗓️ Thời khóa biểu',
    '/timestable/timestableview': '🗓️ Lịch môn học',
} as const;

const exam = {
    '/student/schedulefees/examplant': '📆 Kế hoạch thi',
    '/student/schedulefees/transactionmodules': '📆 Lịch thi',
    '/student/schedulefees/testonline': '💻 Thi Online',
    '/student/schedulefees/testonlineqpan': '🛡️ Thi QP&AN Online',
    '/student/schedulefees/dakltnonline': '🛡️ BV ĐA/KLTN Online',
} as const;

const results = {
    '/student/result/studyresults': '📊 KQ học tập',
    '/student/result/examresult': '📋 KQ thi',
    '/student/result/viewscorebysemester': '📈 ĐTB học kỳ',
    '/student/result/viewmodules': '📈 ĐTB tích lũy',
    '/student/result/sendreceiveapplications': '📨 Phúc khảo',
    '/student/result/sendexamreview': '👁️ Xem lại bài',
} as const;

const graduation = {
    '/tttn/htdn/list': '🎓 Thực tập TN',
    '/student/result/graduatecal': '🎓 Xét tốt nghiệp',
    '/student/result/degreeview': '🎓 Xác nhận thông tin in bằng',
    '/student/result/degreeprint': '🖨️ Bản in bằng',
} as const;

const utilities = {
    '/student/application/advertiselist': '💼 Việc làm & HT',
    '/student/application/notifilist': '📢 Thông báo trường',
    '/student/application/messengeruserlist': '📬 Thông báo cá nhân',
    '/student/recharge/serviceonegate': '🚪 Dịch vụ một cửa',
    '/messages': '💬 Chia sẻ lớp',
    '/messages/group': '💬 Chia sẻ trường',
    '/messages/listclass': '💬 Trao đổi lớp HP',
    '/study': '📖 Học trực tuyến',
    '/sso/qpan': '🛡️ GD QP&AN',
    '/sso/dlearning': '🌐 Đào tạo từ xa',
    '/survey': '📝 Khảo sát',
    '/survey/welcome': '📝 Giới thiệu khảo sát',
    '/survey/view': '📝 Thực hiện khảo sát',
    '/student/evaluation/listsemester': '⭐ ĐG rèn luyện',
    '/sso/btl': '📄 KT luận văn',
    '/STSV2023/index.html': '📘 Sổ tay SV',
    '/student/application/sotayantoan': '📘 Sổ tay an toàn',
    '/student/application/hddanhgiaketquahoctap': '📘 HD đánh giá KQ',
} as const;

export const URL_TITLE_MAP: Record<string, string> = {
    ...home,
    ...auth,
    ...finance,
    ...profile,
    ...registration,
    ...curriculum,
    ...postgraduate,
    ...schedule,
    ...exam,
    ...results,
    ...graduation,
    ...utilities,
};
