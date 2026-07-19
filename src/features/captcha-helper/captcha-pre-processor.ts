import {
    rgbToSaturation,
    otsuThreshold,
    opening2x2,
    getConnectedComponents,
    dilate3x3,
    Component,
} from './image-utils';

export class CaptchaPreprocessor {
    /**
     * Preprocesses the Captcha image and returns binary image data
     * @param imgEl HTMLImageElement to process
     * @returns Processed image dimensions and binary data (Uint8Array)
     */
    public process(imgEl: HTMLImageElement): { width: number; height: number; data: Uint8Array } {
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

        // --- STEP[1] & [2]: Convert to HSV and extract Saturation (S) channel ---
        const sChannel = rgbToSaturation(imgData.data, width, height);

        // --- STEP[3]: Otsu's Thresholding ---
        const binary = otsuThreshold(sChannel, width, height);

        // --- STEP[4]: Morphological Opening (Remove small noise) ---
        const opened = opening2x2(binary, width, height);

        // --- STEP[5]: Filter top 5 largest blobs and find i/j dots ---
        const components = getConnectedComponents(opened, width, height);
        const processedMask = this.filterComponents(components, width, height);

        // --- STEP[6]: Morphological Dilate (Thicken lines) ---
        const dilated = dilate3x3(processedMask, width, height);

        // --- STEP[7]: Mask S channel using the dilated mask ---
        const maskedS = new Uint8Array(width * height);
        for (let i = 0; i < sChannel.length; i++) {
            maskedS[i] = dilated[i] === 255 ? sChannel[i] : 0;
        }

        // --- STEP[8]: Final Otsu Threshold ---
        const finalResult = otsuThreshold(maskedS, width, height);

        return {
            width,
            height,
            data: finalResult,
        };
    }

    private filterComponents(components: Component[], w: number, h: number): Uint8Array {
        const stems: Component[] = [];
        const candidates: Component[] = [];

        for (const comp of components) {
            const aspectRatio = comp.w / comp.h;
            if (comp.area > 50 && aspectRatio < 0.6) {
                stems.push(comp);
            } else if (comp.area > 10 && comp.area < 200) {
                candidates.push(comp);
            }
        }

        // Get Top 5 largest blobs by area
        const sorted = [...components].sort((a, b) => b.area - a.area);
        const indicesToKeep = new Set<number>();
        for (let i = 0; i < Math.min(5, sorted.length); i++) {
            indicesToKeep.add(sorted[i].id);
        }

        // Find dot candidates for i/j characters
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

        // Draw kept components to a binary mask
        const mask = new Uint8Array(w * h);
        for (const comp of components) {
            if (indicesToKeep.has(comp.id)) {
                for (const idx of comp.pixels) {
                    mask[idx] = 255;
                }
            }
        }

        return mask;
    }
}
