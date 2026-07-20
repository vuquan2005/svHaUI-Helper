import {
    rgbToSaturation,
    otsuThreshold,
    getConnectedComponents,
    dilate5x5,
    inpaintTelea,
    Component,
} from './image-utils';

export class CaptchaPreprocessor {
    /**
     * Preprocesses the Captcha image and returns cropped, cleaned grayscale image data
     * @param imgEl HTMLImageElement to process
     * @param paddingY Vertical padding (top/bottom). Default 4px.
     * @param paddingX Horizontal padding (left/right). Default 6px.
     * @returns Processed image dimensions and grayscale data (Uint8Array)
     */
    public process(
        imgEl: HTMLImageElement,
        paddingY = 4,
        paddingX = 6
    ): { width: number; height: number; data: Uint8Array } {
        const width = imgEl.naturalWidth || imgEl.width;
        const height = imgEl.naturalHeight || imgEl.height;

        // Temporary canvas to extract pixels
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2d context for captcha pre-processing');
        }
        ctx.drawImage(imgEl, 0, 0);
        const imgData = ctx.getImageData(0, 0, width, height);

        // --- STEP 1: Grayscale conversion (using Saturation channel of HSV) ---
        const grayImg = rgbToSaturation(imgData.data, width, height);

        // --- STEP 2: Morphological Contours and Connected Components ---
        const thresh = otsuThreshold(grayImg, width, height);
        const components = getConnectedComponents(thresh, width, height);

        const mask = new Uint8Array(width * height);

        if (components.length > 0) {
            // Keep base candidates with area >= 100, sort by area desc, keep top 5
            const baseCandidates = components.filter((c) => c.area >= 100);
            baseCandidates.sort((a, b) => b.area - a.area);
            const baseComponents = baseCandidates.slice(0, 5);

            // Detect stem-dot pairs for letters i and j
            const detectedIjStems: Component[] = [];
            const detectedIjDots: Component[] = [];

            for (const c of baseComponents) {
                const cRatio = c.rect.height / (c.rect.width > 0 ? c.rect.width : 1);
                if (cRatio >= 1.5) {
                    let bestDot: Component | null = null;
                    let minDist = Infinity;

                    for (const d of components) {
                        if (d.id === c.id) continue;
                        if (!(d.area >= 10 && d.area <= 80 && d.area < c.area)) continue;

                        const isAbove = d.rect.y + d.rect.height <= c.rect.y + 8;
                        const vGap = c.rect.y - (d.rect.y + d.rect.height);

                        if (isAbove && vGap >= 0 && vGap <= 22) {
                            const distX = Math.max(
                                0,
                                d.rect.x - (c.rect.x + c.rect.width),
                                c.rect.x - (d.rect.x + d.rect.width)
                            );
                            if (distX <= 3) {
                                const distCenters =
                                    (d.cx - c.cx) * (d.cx - c.cx) + (d.cy - c.cy) * (d.cy - c.cy);
                                if (distCenters < minDist) {
                                    minDist = distCenters;
                                    bestDot = d;
                                }
                            }
                        }
                    }

                    if (bestDot) {
                        detectedIjStems.push(c);
                        detectedIjDots.push(bestDot);
                    }
                }
            }

            // Ensure i/j stems are in base components
            const baseIndices = new Set(baseComponents.map((c) => c.id));
            for (const s of detectedIjStems) {
                if (!baseIndices.has(s.id)) {
                    baseComponents.push(s);
                    baseIndices.add(s.id);
                }
            }

            const keepIndices = new Set(baseIndices);
            for (const d of detectedIjDots) {
                keepIndices.add(d.id);
            }

            for (const comp of components) {
                if (keepIndices.has(comp.id)) {
                    for (const idx of comp.pixels) {
                        mask[idx] = 255;
                    }
                }
            }
        }

        // Morphological dilation on the mask (5x5 kernel)
        const closed = dilate5x5(mask, width, height);

        // --- STEP 3: Clean Grayscale (Inpaint noise & apply mask) ---
        // High-value threshold (130-255) to detect salt noise
        const noiseMask = new Uint8Array(width * height);
        for (let i = 0; i < grayImg.length; i++) {
            if (grayImg[i] >= 130 && grayImg[i] <= 255) {
                noiseMask[i] = 255;
            }
        }

        // Inpaint to remove salt noise
        const denoisedGray = inpaintTelea(grayImg, noiseMask, width, height, 3);

        const cleanedImg = new Uint8Array(width * height);
        for (let i = 0; i < grayImg.length; i++) {
            cleanedImg[i] = closed[i] > 0 ? denoisedGray[i] : 0;
        }

        // --- STEP 4: Crop Margins ---
        let minX = width;
        let maxX = -1;
        let minY = height;
        let maxY = -1;

        for (let y = 0; y < height; y++) {
            const rowOffset = y * width;
            for (let x = 0; x < width; x++) {
                if (cleanedImg[rowOffset + x] > 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        if (maxX >= minX && maxY >= minY) {
            const cropMinY = Math.max(0, minY - paddingY);
            const cropMinX = Math.max(0, minX - paddingX);
            const cropMaxY = Math.min(height - 1, maxY + paddingY);
            const cropMaxX = Math.min(width - 1, maxX + paddingX);

            const croppedWidth = cropMaxX - cropMinX + 1;
            const croppedHeight = cropMaxY - cropMinY + 1;

            const croppedData = new Uint8Array(croppedWidth * croppedHeight);
            for (let y = 0; y < croppedHeight; y++) {
                const srcRow = (cropMinY + y) * width;
                const dstRow = y * croppedWidth;
                for (let x = 0; x < croppedWidth; x++) {
                    croppedData[dstRow + x] = cleanedImg[srcRow + cropMinX + x];
                }
            }

            return {
                width: croppedWidth,
                height: croppedHeight,
                data: croppedData,
            };
        }

        return {
            width,
            height,
            data: cleanedImg,
        };
    }
}
