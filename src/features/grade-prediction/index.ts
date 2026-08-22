/**
 * Grade Prediction & GPA Helper Feature
 * Highlights letter grades & credits, allows in-place score simulations, and predicts target GPAs
 */

import { Feature } from '@/core';
import { GradePredictionStorage } from './types';
import { parseGradeTable } from './table-parser';
import { GradeStore } from './grade-store';
import { UIRenderer } from './ui-renderer';
import { DEFAULT_TOTAL_CREDITS } from './config';

const URL_PATTERNS = [
    { name: 'personal-exam', pattern: /^\/student\/result\/examresult/ },
    { name: 'friend-exam', pattern: /^\/student\/result\/viewexamresult/ },
    { name: 'class-exam', pattern: /^\/student\/result\/viewexamresultclass/ },
];

export class GradePredictionFeature extends Feature<GradePredictionStorage> {
    private store: GradeStore | null = null;
    private renderer: UIRenderer | null = null;

    constructor() {
        super({
            id: 'grade-prediction',
            name: 'Grade Prediction & Highlighting',
            description:
                'Tô màu điểm số, chỉnh sửa điểm giả lập và dự đoán mục tiêu GPA tốt nghiệp',
            urlMatch: URL_PATTERNS,
        });
    }

    run(): void {
        this.log.i(`Đang khởi động trên trang: ${this.location.path}`);
        this.waitForTableAndMount();
    }

    private waitForTableAndMount(): void {
        let retries = 0;
        const maxRetries = 50; // 5 seconds polling fallback

        const check = () => {
            const grid = document.querySelector('div.kGrid') || document.querySelector('#frmMain');

            if (grid) {
                const parseResult = parseGradeTable();
                if (
                    parseResult.rows.length > 0 &&
                    parseResult.gridContainer &&
                    parseResult.mainTable
                ) {
                    this.log.i(`Tìm thấy ${parseResult.rows.length} môn học trong bảng Điểm thi.`);
                    void this.initFeature(parseResult);
                    return;
                }
            }

            retries++;
            if (retries < maxRetries) {
                setTimeout(check, 100);
            } else {
                this.log.w(`Không tìm thấy bảng điểm (div.kGrid) sau ${maxRetries * 100}ms.`);
            }
        };

        check();
    }

    private async initFeature(parseResult: ReturnType<typeof parseGradeTable>): Promise<void> {
        if (!parseResult.gridContainer || !parseResult.mainTable) return;

        const savedCredits = await this.storage.get('defaultTotalCredits', DEFAULT_TOTAL_CREDITS);
        const savedCustomTarget = await this.storage.get('customTargetGPA', 3.0);

        this.store = new GradeStore();
        this.store.setRows(parseResult.rows, savedCredits, savedCustomTarget);

        // Persist total target credits & custom target GPA changes
        this.store.subscribe((store) => {
            if (store.totalTargetCredits !== savedCredits) {
                void this.storage.set('defaultTotalCredits', store.totalTargetCredits);
            }
            if (store.customTargetGPA !== savedCustomTarget) {
                void this.storage.set('customTargetGPA', store.customTargetGPA);
            }
        });

        this.renderer = new UIRenderer(
            this.store,
            parseResult.gridContainer,
            parseResult.mainTable
        );
        this.renderer.mount();

        const prediction = this.store.getPrediction();
        const gradedCount = parseResult.rows.filter((r) => r.originalScore4 !== null).length;

        this.log.i(
            `✅ Đã tải ${gradedCount}/${parseResult.rows.length} môn có điểm | GPA: ${prediction.originalSummary.gpa.toFixed(
                2
            )} (${prediction.originalSummary.classification}) | Tích lũy: ${
                prediction.originalSummary.totalAccumulatedCredits
            }/${prediction.totalTargetCredits} tín chỉ.`
        );

        if (parseResult.officialGPA !== null) {
            this.log.d(
                `Dữ liệu gốc từ trường: GPA = ${parseResult.officialGPA}, Tín tích lũy = ${parseResult.officialAccumulatedCredits}`
            );
        }
    }
}
