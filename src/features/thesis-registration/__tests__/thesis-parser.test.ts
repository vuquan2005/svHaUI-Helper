import { describe, expect, it } from 'vitest';
import {
    exportTopicsToCsv,
    extractFormTokens,
    extractLecturers,
    extractTopics,
    extractTopicsFromHtml,
    formatTopicsForClipboard,
    parseTopicName,
} from '../parser';
import { Lecturer, ThesisTopic } from '../types';

describe('Thesis Registration Parser', () => {
    describe('extractLecturers', () => {
        it('should extract lecturers and ignore placeholder options', () => {
            const mockSelect = {
                options: [
                    { value: '0', textContent: '-- Chọn giáo viên --' },
                    { value: '247', textContent: 'Nguyễn Quốc Tuấn' },
                    { value: '265', textContent: 'Lê Đức Hiếu' },
                    { value: '1180', textContent: 'Trịnh Đắc Phong' },
                    { value: '0', textContent: '-- Không xác định --' },
                ],
            };

            const lecturers = extractLecturers(mockSelect);

            expect(lecturers).toEqual([
                { id: '247', name: 'Nguyễn Quốc Tuấn' },
                { id: '265', name: 'Lê Đức Hiếu' },
                { id: '1180', name: 'Trịnh Đắc Phong' },
            ]);
        });

        it('should return empty array if no valid options exist', () => {
            const mockSelect = {
                options: [{ value: '0', textContent: '-- Chọn giáo viên --' }],
            };

            expect(extractLecturers(mockSelect)).toEqual([]);
        });
    });

    describe('extractTopics', () => {
        it('should extract topics for a given lecturer and ignore placeholder', () => {
            const lecturer: Lecturer = { id: '1180', name: 'Trịnh Đắc Phong' };
            const mockSelect = {
                options: [
                    { value: '0', textContent: '-- Chọn đề tài --' },
                    {
                        value: '5001',
                        textContent: 'Nghiên cứu ứng dụng IoT trong giám sát năng lượng',
                    },
                    { value: '5002', textContent: 'Phát triển hệ thống SCADA trên nền web' },
                ],
            };

            const topics = extractTopics(mockSelect, lecturer);

            expect(topics).toEqual([
                {
                    id: '5001',
                    name: 'Nghiên cứu ứng dụng IoT trong giám sát năng lượng',
                    lecturerId: '1180',
                    lecturerName: 'Trịnh Đắc Phong',
                },
                {
                    id: '5002',
                    name: 'Phát triển hệ thống SCADA trên nền web',
                    lecturerId: '1180',
                    lecturerName: 'Trịnh Đắc Phong',
                },
            ]);
        });
    });

    describe('extractTopicsFromHtml', () => {
        it('should parse HTML text and extract topics from #ctl03_ddlDeTai', () => {
            const lecturer: Lecturer = { id: '247', name: 'Nguyễn Quốc Tuấn' };
            const html = `
                <!DOCTYPE html>
                <html>
                <body>
                    <form id="frmMain">
                        <select name="ctl03$ddlDeTai" id="ctl03_ddlDeTai">
                            <option value="0">-- Chọn đề tài --</option>
                            <option value="9901">Thiết kế xe tự hành AGV ứng dụng ROS</option>
                        </select>
                    </form>
                </body>
                </html>
            `;

            const topics = extractTopicsFromHtml(html, lecturer);

            expect(topics).toHaveLength(1);
            expect(topics[0]).toEqual({
                id: '9901',
                name: 'Thiết kế xe tự hành AGV ứng dụng ROS',
                lecturerId: '247',
                lecturerName: 'Nguyễn Quốc Tuấn',
            });
        });

        it('should return empty array if topic select is missing', () => {
            const lecturer: Lecturer = { id: '247', name: 'Nguyễn Quốc Tuấn' };
            const html = `<div>No select here</div>`;

            expect(extractTopicsFromHtml(html, lecturer)).toEqual([]);
        });
    });

    describe('extractFormTokens', () => {
        it('should extract ASP.NET hidden tokens and field names from mock form', () => {
            const mockForm = {
                getAttribute: (attr: string) =>
                    attr === 'action' ? '/register/dangkyDAKLTN' : null,
                querySelector: (sel: string) => {
                    if (sel === '#__VIEWSTATE') return { value: 'my-mock-viewstate' };
                    if (sel === '#__VIEWSTATEGENERATOR') return { value: 'CA0B0334' };
                    if (sel === '#__EVENTVALIDATION') return null;
                    if (sel === '#ctl03_ddlGiangVien')
                        return { getAttribute: () => 'ctl03$ddlGiangVien' };
                    if (sel === '#ctl03_ddlDeTai') return { getAttribute: () => 'ctl03$ddlDeTai' };
                    return null;
                },
                querySelectorAll: (sel: string) => {
                    if (sel === 'input[type="hidden"]') {
                        return [
                            { name: '__VIEWSTATE', value: 'my-mock-viewstate' },
                            { name: '__VIEWSTATEGENERATOR', value: 'CA0B0334' },
                            { name: 'customToken', value: 'abc123xyz' },
                        ];
                    }
                    return [];
                },
            } as unknown as HTMLFormElement;

            const tokens = extractFormTokens(mockForm);

            expect(tokens.actionUrl).toBe('/register/dangkyDAKLTN');
            expect(tokens.viewState).toBe('my-mock-viewstate');
            expect(tokens.viewStateGen).toBe('CA0B0334');
            expect(tokens.lecturerFieldName).toBe('ctl03$ddlGiangVien');
            expect(tokens.topicFieldName).toBe('ctl03$ddlDeTai');
            expect(tokens.extraHiddenFields).toEqual({ customToken: 'abc123xyz' });
        });
    });

    describe('exportTopicsToCsv & formatTopicsForClipboard', () => {
        const mockTopics: ThesisTopic[] = [
            {
                id: '101',
                name: 'Đề tài 1 "Mô hình AI"',
                lecturerId: '247',
                lecturerName: 'Nguyễn Quốc Tuấn',
            },
            {
                id: '102',
                name: 'Đề tài 2',
                lecturerId: '265',
                lecturerName: 'Lê Đức Hiếu',
            },
        ];

        it('should export to CSV with UTF-8 BOM and correct quoting', () => {
            const csv = exportTopicsToCsv(mockTopics);
            expect(csv.startsWith('\uFEFF')).toBe(true);
            expect(csv).toContain('STT,Giảng viên,Mã đề tài,Tên đề tài');
            expect(csv).toContain('"Nguyễn Quốc Tuấn","101","Đề tài 1 ""Mô hình AI"""');
            expect(csv).toContain('"Lê Đức Hiếu","102","Đề tài 2"');
        });

        it('should format to TSV for clipboard', () => {
            const tsv = formatTopicsForClipboard(mockTopics);
            expect(tsv).toContain('STT\tGiảng viên\tMã đề tài\tTên đề tài');
            expect(tsv).toContain('1\tNguyễn Quốc Tuấn\t101\tĐề tài 1 "Mô hình AI"');
        });
    });

    describe('parseTopicName', () => {
        it('should parse standard member format (2/3) and extract clean title', () => {
            const result = parseTopicName(
                'Nghiên cứu ứng dụng IoT trong giám sát năng lượng (2/3)'
            );
            expect(result.cleanName).toBe('Nghiên cứu ứng dụng IoT trong giám sát năng lượng');
            expect(result.memberInfo).toEqual({
                current: 2,
                max: 3,
                raw: '2/3',
                isFull: false,
            });
        });

        it('should correctly identify full capacity topics (3/3)', () => {
            const result = parseTopicName('Phát triển hệ thống SCADA trên nền web (3/3)');
            expect(result.cleanName).toBe('Phát triển hệ thống SCADA trên nền web');
            expect(result.memberInfo).toEqual({
                current: 3,
                max: 3,
                raw: '3/3',
                isFull: true,
            });
        });

        it('should handle empty registration topics (0/2)', () => {
            const result = parseTopicName('Ứng dụng Blockchain trong chuỗi cung ứng (0/2)');
            expect(result.cleanName).toBe('Ứng dụng Blockchain trong chuỗi cung ứng');
            expect(result.memberInfo).toEqual({
                current: 0,
                max: 2,
                raw: '0/2',
                isFull: false,
            });
        });

        it('should parse formats with internal spaces and brackets like ( 1 / 2 ) and [1/2]', () => {
            const spaced = parseTopicName('Thiết kế hệ thống nhúng ( 1 / 2 )');
            expect(spaced.cleanName).toBe('Thiết kế hệ thống nhúng');
            expect(spaced.memberInfo?.raw).toBe('1/2');

            const bracketed = parseTopicName('Phát triển robot di động [2/2]');
            expect(bracketed.cleanName).toBe('Phát triển robot di động');
            expect(bracketed.memberInfo?.isFull).toBe(true);
        });

        it('should handle prefixes like SV/TV e.g. (SV: 2/3) and hyphen separators', () => {
            const withPrefix = parseTopicName('Mô hình AI nhận diện khuôn mặt - (SV: 2/3)');
            expect(withPrefix.cleanName).toBe('Mô hình AI nhận diện khuôn mặt');
            expect(withPrefix.memberInfo).toEqual({
                current: 2,
                max: 3,
                raw: '2/3',
                isFull: false,
            });
        });

        it('should preserve parentheses within topic title', () => {
            const result = parseTopicName(
                'Nghiên cứu CNN (Convolutional Neural Network) trong y tế (1/3)'
            );
            expect(result.cleanName).toBe(
                'Nghiên cứu CNN (Convolutional Neural Network) trong y tế'
            );
            expect(result.memberInfo).toEqual({
                current: 1,
                max: 3,
                raw: '1/3',
                isFull: false,
            });
        });

        it('should return memberInfo null if no capacity is specified', () => {
            const result = parseTopicName('Đề tài nghiên cứu khoa học cơ bản');
            expect(result.cleanName).toBe('Đề tài nghiên cứu khoa học cơ bản');
            expect(result.memberInfo).toBeNull();
        });
    });
});
