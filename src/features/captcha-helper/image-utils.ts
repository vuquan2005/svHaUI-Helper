/**
 * Image processing utilities using vanilla JS and TypedArrays.
 * Replaces OpenCV.js functions.
 */

export interface Component {
    id: number;
    area: number;
    rect: { x: number; y: number; width: number; height: number };
    cx: number;
    cy: number;
    y: number;
    h: number;
    w: number;
    pixels: number[];
}

/**
 * Converts RGBA image data to Saturation channel (HSV space)
 */
export function rgbToSaturation(
    rgbaData: Uint8ClampedArray,
    width: number,
    height: number
): Uint8Array {
    const sChannel = new Uint8Array(width * height);
    for (let i = 0; i < rgbaData.length; i += 4) {
        const r = rgbaData[i] / 255;
        const g = rgbaData[i + 1] / 255;
        const b = rgbaData[i + 2] / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        sChannel[i / 4] = max > 0 ? ((max - min) / max) * 255 : 0;
    }
    return sChannel;
}

/**
 * Applies Otsu's thresholding to a single-channel grayscale image
 */
export function otsuThreshold(src: Uint8Array, width: number, height: number): Uint8Array {
    const total = width * height;
    const histogram = new Int32Array(256);

    // Count frequencies
    for (let i = 0; i < total; i++) {
        histogram[src[i]]++;
    }

    // Compute sum of all intensity values
    let sum = 0;
    for (let i = 0; i < 256; i++) {
        sum += i * histogram[i];
    }

    let sumB = 0;
    let wB = 0;
    let varMax = 0;
    let threshold = 0;

    // Search for optimal threshold
    for (let t = 0; t < 256; t++) {
        wB += histogram[t]; // Weight Background
        if (wB === 0) continue;

        const wF = total - wB; // Weight Foreground
        if (wF === 0) break;

        sumB += t * histogram[t];
        const mB = sumB / wB; // Mean Background
        const mF = (sum - sumB) / wF; // Mean Foreground

        // Calculate Between Class Variance
        const varBetween = wB * wF * (mB - mF) * (mB - mF);

        // Check if new maximum found
        if (varBetween > varMax) {
            varMax = varBetween;
            threshold = t;
        }
    }

    // Binarize image
    const dst = new Uint8Array(total);
    for (let i = 0; i < total; i++) {
        dst[i] = src[i] > threshold ? 255 : 0;
    }
    return dst;
}

/**
 * Performs Morphological Opening 2x2 (Erosion 2x2 followed by Dilation 2x2)
 */
export function opening2x2(src: Uint8Array, w: number, h: number): Uint8Array {
    // 1. Erosion 2x2
    const eroded = new Uint8Array(w * h);
    for (let y = 0; y < h - 1; y++) {
        const rowOffset = y * w;
        const nextRowOffset = (y + 1) * w;
        for (let x = 0; x < w - 1; x++) {
            if (
                src[rowOffset + x] === 255 &&
                src[rowOffset + x + 1] === 255 &&
                src[nextRowOffset + x] === 255 &&
                src[nextRowOffset + x + 1] === 255
            ) {
                eroded[rowOffset + x] = 255;
            }
        }
    }

    // 2. Dilation 2x2
    const opened = new Uint8Array(w * h);
    for (let y = 0; y < h - 1; y++) {
        const rowOffset = y * w;
        const nextRowOffset = (y + 1) * w;
        for (let x = 0; x < w - 1; x++) {
            if (eroded[rowOffset + x] === 255) {
                opened[rowOffset + x] = 255;
                opened[rowOffset + x + 1] = 255;
                opened[nextRowOffset + x] = 255;
                opened[nextRowOffset + x + 1] = 255;
            }
        }
    }

    return opened;
}

/**
 * Connected Component Labeling using 8-connectivity (Breadth-First Search)
 */
export function getConnectedComponents(src: Uint8Array, w: number, h: number): Component[] {
    const visited = new Uint8Array(w * h);
    const components: Component[] = [];
    let componentId = 0;

    for (let i = 0; i < src.length; i++) {
        if (src[i] === 255 && visited[i] === 0) {
            const pixels: number[] = [];
            const queue: number[] = [i];
            visited[i] = 1;

            let minX = i % w;
            let maxX = minX;
            let minY = Math.floor(i / w);
            let maxY = minY;

            let sumX = 0;
            let sumY = 0;

            let head = 0;
            while (head < queue.length) {
                const curr = queue[head++];
                pixels.push(curr);

                const cx = curr % w;
                const cy = Math.floor(curr / w);

                sumX += cx;
                sumY += cy;

                if (cx < minX) minX = cx;
                if (cx > maxX) maxX = cx;
                if (cy < minY) minY = cy;
                if (cy > maxY) maxY = cy;

                // Check 8 neighbors
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dy === 0 && dx === 0) continue;
                        const nx = cx + dx;
                        if (nx >= 0 && nx < w) {
                            const ny = cy + dy;
                            if (ny >= 0 && ny < h) {
                                const nidx = ny * w + nx;
                                if (src[nidx] === 255 && visited[nidx] === 0) {
                                    visited[nidx] = 1;
                                    queue.push(nidx);
                                }
                            }
                        }
                    }
                }
            }

            const rectW = maxX - minX + 1;
            const rectH = maxY - minY + 1;
            const area = pixels.length;

            components.push({
                id: componentId++,
                area,
                rect: { x: minX, y: minY, width: rectW, height: rectH },
                cx: sumX / area,
                cy: sumY / area,
                y: minY,
                h: rectH,
                w: rectW,
                pixels,
            });
        }
    }

    return components;
}

/**
 * Performs Morphological Dilation with 3x3 Rect kernel
 */
export function dilate3x3(src: Uint8Array, w: number, h: number): Uint8Array {
    const dst = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
        const rowOffset = y * w;
        for (let x = 0; x < w; x++) {
            if (src[rowOffset + x] === 255) {
                for (let dy = -1; dy <= 1; dy++) {
                    const ny = y + dy;
                    if (ny >= 0 && ny < h) {
                        const targetRowOffset = ny * w;
                        for (let dx = -1; dx <= 1; dx++) {
                            const nx = x + dx;
                            if (nx >= 0 && nx < w) {
                                dst[targetRowOffset + nx] = 255;
                            }
                        }
                    }
                }
            }
        }
    }
    return dst;
}

/**
 * Performs Morphological Dilation with 5x5 Rect kernel (radius 2)
 */
export function dilate5x5(src: Uint8Array, w: number, h: number): Uint8Array {
    const dst = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
        const rowOffset = y * w;
        for (let x = 0; x < w; x++) {
            if (src[rowOffset + x] === 255) {
                for (let dy = -2; dy <= 2; dy++) {
                    const ny = y + dy;
                    if (ny >= 0 && ny < h) {
                        const targetRowOffset = ny * w;
                        for (let dx = -2; dx <= 2; dx++) {
                            const nx = x + dx;
                            if (nx >= 0 && nx < w) {
                                dst[targetRowOffset + nx] = 255;
                            }
                        }
                    }
                }
            }
        }
    }
    return dst;
}

/** Neighbor relative X coordinates for fast inpainting within radius 2 (Euclidean distance <= 2) */
const INPAINT_OFFSETS_DX = new Int8Array([-1, 0, 1, -1, 1, -1, 0, 1, -2, 2, 0, 0]);
/** Neighbor relative Y coordinates for fast inpainting within radius 2 */
const INPAINT_OFFSETS_DY = new Int8Array([0, -1, 0, 1, -1, -1, 1, 1, 0, 0, -2, 2]);
/** Precomputed inverse Euclidean distance weights: 1.0 for d=1, 0.7071 for d=sqrt(2), 0.5 for d=2 */
const INPAINT_OFFSETS_WEIGHT = new Float32Array([
    1.0, 1.0, 1.0, 1.0, 0.70710678, 0.70710678, 0.70710678, 0.70710678, 0.5, 0.5, 0.5, 0.5,
]);
const NUM_INPAINT_OFFSETS = INPAINT_OFFSETS_DX.length;

/**
 * Fast multi-pass neighbor-weighted inpainting algorithm.
 * Replaces heavy FMM queue-based Telea algorithm with static LUT offsets and raster sweeps.
 * Up to 10x faster on mobile CPU with near-identical visual/OCR output.
 */
export function inpaintFast(src: Uint8Array, mask: Uint8Array, w: number, h: number): Uint8Array {
    const total = w * h;
    const dst = new Uint8Array(src);
    const isNoise = new Uint8Array(total);
    let noiseCount = 0;

    for (let i = 0; i < total; i++) {
        if (mask[i] > 0) {
            isNoise[i] = 1;
            noiseCount++;
        }
    }

    if (noiseCount === 0) return dst;

    let remaining = noiseCount;
    let maxIterations = 2;

    while (remaining > 0 && maxIterations-- > 0) {
        let resolved = 0;
        for (let y = 0; y < h; y++) {
            const rowOffset = y * w;
            for (let x = 0; x < w; x++) {
                const idx = rowOffset + x;
                if (isNoise[idx] === 1) {
                    let sumVal = 0;
                    let sumWeight = 0;

                    for (let k = 0; k < NUM_INPAINT_OFFSETS; k++) {
                        const nx = x + INPAINT_OFFSETS_DX[k];
                        const ny = y + INPAINT_OFFSETS_DY[k];
                        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                            const nidx = ny * w + nx;
                            if (isNoise[nidx] === 0) {
                                const weight = INPAINT_OFFSETS_WEIGHT[k];
                                sumVal += dst[nidx] * weight;
                                sumWeight += weight;
                            }
                        }
                    }

                    if (sumWeight > 0) {
                        dst[idx] = (sumVal / sumWeight + 0.5) | 0;
                        isNoise[idx] = 0;
                        resolved++;
                    }
                }
            }
        }
        remaining -= resolved;
        if (resolved === 0) break;
    }

    return dst;
}

/**
 * Backward compatibility alias for inpaintTelea
 */
export const inpaintTelea = inpaintFast;
