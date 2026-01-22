export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // Các type cho phép
        'type-enum': [
            2,
            'always',
            [
                'feat', // Tính năng mới
                'fix', // Sửa lỗi
                'docs', // Thay đổi tài liệu
                'style', // Thay đổi format, không ảnh hưởng logic
                'refactor', // Refactor code
                'perf', // Cải thiện hiệu năng
                'test', // Thêm/sửa tests
                'build', // Thay đổi build system
                'ci', // Thay đổi CI config
                'chore', // Các thay đổi khác
                'revert', // Revert commit trước
            ],
        ],
        // Subject không được để trống
        'subject-empty': [2, 'never'],
        // Type không được để trống
        'type-empty': [2, 'never'],
        // Subject tối đa 100 ký tự
        'subject-max-length': [2, 'always', 100],
    },
};
