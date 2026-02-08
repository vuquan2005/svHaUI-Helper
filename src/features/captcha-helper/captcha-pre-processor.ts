import cv from '@techstark/opencv-js';

export class CaptchaPreprocessor {
    /**
     * Xử lý tiền xử lý ảnh Captcha
     * @param originalSrc Ảnh màu đầu vào (cv.Mat)
     * @returns Ảnh đã qua xử lý (cv.Mat)
     */
    public process(originalSrc: cv.Mat): cv.Mat {
        const steps: cv.Mat[] = [];

        // --- STEP[1]: Chuyển sang không gian màu HSV ---
        const hsv = new cv.Mat();
        cv.cvtColor(originalSrc, hsv, cv.COLOR_RGB2HSV);
        steps[1] = hsv;

        // --- STEP[2]: Tách và lấy kênh S (Saturation) ---
        const channels = new cv.MatVector();
        cv.split(hsv, channels);
        const sChannel = channels.get(1).clone(); // Clone để giữ lại dùng cho Step 7
        steps[2] = sChannel;
        channels.delete();

        // --- STEP[3]: Ngưỡng hóa Otsu ---
        const binary = new cv.Mat();
        // Lưu ý: src ở đây dùng sChannel từ bước trước
        cv.threshold(sChannel, binary, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
        steps[3] = binary;

        // --- STEP[4]: Morphological Opening (Khử nhiễu nhỏ) ---
        const opened = new cv.Mat();
        const kernelOpen = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
        cv.morphologyEx(binary, opened, cv.MORPH_OPEN, kernelOpen);
        steps[4] = opened;
        kernelOpen.delete();

        // --- STEP[5]: Lọc 5 Blobs lớn nhất và tìm dấu chấm (i, j) ---
        const processedMask = this.filterContours(opened);
        steps[5] = processedMask;

        // --- STEP[6]: Morphological Dilate (Làm dày nét) ---
        const dilated = new cv.Mat();
        const kernelDilate = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
        cv.morphologyEx(processedMask, dilated, cv.MORPH_DILATE, kernelDilate);
        steps[6] = dilated;
        kernelDilate.delete();

        // --- STEP[7]: Lấy dữ liệu từ kênh S dựa trên Mask ---
        const maskedS = cv.Mat.zeros(originalSrc.rows, originalSrc.cols, cv.CV_8UC1);
        // Cắt dữ liệu từ kênh S (steps[2]) dựa trên vùng trắng của bước 6
        steps[2].copyTo(maskedS, dilated);
        steps[7] = maskedS;

        // --- STEP[8]: Threshold ---
        const finalResult = new cv.Mat();
        cv.threshold(maskedS, finalResult, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
        steps[8] = finalResult;

        // Giải phóng bộ nhớ các bước trung gian
        steps.forEach((mat, index) => {
            if (mat && index !== 8) mat.delete();
        });

        return finalResult;
    }

    private filterContours(src: cv.Mat): cv.Mat {
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        const stems: any[] = [];
        const candidates: any[] = [];
        const allItems: any[] = [];

        for (let i = 0; i < contours.size(); i++) {
            const c = contours.get(i);
            const area = cv.contourArea(c);
            const rect = cv.boundingRect(c);

            const item = {
                id: i,
                area: area,
                cx: rect.x + rect.width / 2,
                y: rect.y,
                h: rect.height,
                w: rect.width,
            };

            allItems.push(item);

            const aspectRatio = rect.width / rect.height;
            if (area > 50 && aspectRatio < 0.6) {
                stems.push(item);
            } else if (area > 10 && area < 200) {
                candidates.push(item);
            }
            c.delete();
        }

        // Giữ lại Top 5 vùng lớn nhất
        allItems.sort((a, b) => b.area - a.area);
        const indicesToKeep = new Set<number>();
        for (let i = 0; i < Math.min(5, allItems.length); i++) {
            indicesToKeep.add(allItems[i].id);
        }

        // Logic tìm dấu chấm phía trên chữ i, j
        for (const stem of stems) {
            for (const dot of candidates) {
                const xDiff = Math.abs(stem.cx - dot.cx);
                const xLimit = Math.max(stem.w, 10);
                const distY = stem.y - (dot.y + dot.h);

                if (xDiff < xLimit && dot.y < stem.y && distY < 35 && distY > -5) {
                    indicesToKeep.add(dot.id);
                }
            }
        }

        // Tạo Mask kết quả
        const mask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
        for (let i = 0; i < contours.size(); i++) {
            if (indicesToKeep.has(i)) {
                cv.drawContours(mask, contours, i, new cv.Scalar(255), -1);
            }
        }

        contours.delete();
        hierarchy.delete();
        return mask;
    }
}
