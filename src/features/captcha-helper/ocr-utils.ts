/**
 * OCR Helper Utilities
 * Image tensor transformation and CTC greedy decoding for PP-OCRv4
 */

import * as ort from 'onnxruntime-web';

/**
 * Converts a preprocessed HTMLCanvasElement into a NCHW Float32Tensor [1, 3, 64, W].
 * Scales height to 64px, keeps aspect ratio, and normalizes pixels to [-1.0, 1.0].
 *
 * @param canvas Preprocessed captcha image canvas
 * @returns ONNX Tensor ready for model inference
 */
export function prepareInputTensor(canvas: HTMLCanvasElement): ort.Tensor {
    const targetH = 64;
    const targetW = Math.max(1, Math.round((targetH * canvas.width) / canvas.height));

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = targetW;
    resizedCanvas.height = targetH;
    const ctx = resizedCanvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get 2D context for ONNX input preparation');
    }

    ctx.drawImage(canvas, 0, 0, targetW, targetH);
    const imgData = ctx.getImageData(0, 0, targetW, targetH).data;

    const planeSize = targetH * targetW;
    const floatData = new Float32Array(3 * planeSize);

    for (let i = 0; i < planeSize; i++) {
        const r = imgData[i * 4];
        // Normalize pixel to [-1.0, 1.0]: (val / 255.0 - 0.5) / 0.5
        const normVal = (r / 255.0 - 0.5) / 0.5;

        // Duplicate grayscale channel across 3 channels (R, G, B) in CHW order
        floatData[i] = normVal; // Red
        floatData[planeSize + i] = normVal; // Green
        floatData[planeSize * 2 + i] = normVal; // Blue
    }

    return new ort.Tensor('float32', floatData, [1, 3, targetH, targetW]);
}

/**
 * CTC Greedy Decoder for PP-OCRv4 recognition output logits tensor [1, T, C].
 * Collapses consecutive identical predictions and removes CTC blank token (index 0).
 *
 * @param logits Raw model output logits array
 * @param numFrames Time frames sequence length T
 * @param numClasses Output class dimension C (including CTC blank token at index 0)
 * @param charDict Character dictionary mapping index 0..N-1 to characters
 * @returns Decoded text string
 */
export function ctcDecode(
    logits: Float32Array,
    numFrames: number,
    numClasses: number,
    charDict: readonly string[]
): string {
    const decodedChars: string[] = [];
    let prevClass = 0;

    for (let t = 0; t < numFrames; t++) {
        const offset = t * numClasses;
        let maxIdx = 0;
        let maxVal = -Infinity;

        for (let c = 0; c < numClasses; c++) {
            const val = logits[offset + c];
            if (val > maxVal) {
                maxVal = val;
                maxIdx = c;
            }
        }

        // Collapse consecutive duplicate predictions and skip CTC blank token (index 0)
        if (maxIdx !== 0 && maxIdx !== prevClass) {
            if (maxIdx - 1 < charDict.length) {
                decodedChars.push(charDict[maxIdx - 1]);
            }
        }
        prevClass = maxIdx;
    }

    return decodedChars.join('');
}
