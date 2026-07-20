/**
 * Captcha Image Processor
 * Manages captcha image preprocessing and PP-OCRv4 ONNX recognition
 */

import { CaptchaPreprocessor } from './captcha-pre-processor';
import { OcrRecognizer } from './ocr-recognizer';

export interface CaptchaProcessorOptions {
    /** The captcha image element */
    imgEl: HTMLImageElement;
    /** Callback when text is recognized from captcha */
    onTextRecognized?: (text: string) => void;
    /** Logger for debug/error messages */
    log: {
        d: (...args: unknown[]) => void;
        e: (...args: unknown[]) => void;
    };
}

/**
 * Handles captcha image processing and OCR recognition
 */
export class CaptchaProcessor {
    private imgEl: HTMLImageElement;
    private canvasEl: HTMLCanvasElement | null = null;
    private log: CaptchaProcessorOptions['log'];
    private onTextRecognized?: CaptchaProcessorOptions['onTextRecognized'];
    private ocrRecognizer: OcrRecognizer;

    // Bound handler for proper cleanup
    private handleImgLoad = this.onImgLoad.bind(this);

    constructor(options: CaptchaProcessorOptions) {
        this.imgEl = options.imgEl;
        this.log = options.log;
        this.onTextRecognized = options.onTextRecognized;
        this.ocrRecognizer = new OcrRecognizer({ log: this.log });
    }

    /**
     * Setup processing: create canvas and attach load listener
     */
    setup(): void {
        // Create canvas
        this.canvasEl = document.createElement('canvas');
        this.canvasEl.style.cssText = this.imgEl.style.cssText;
        this.canvasEl.className = this.imgEl.className;
        this.canvasEl.style.display = 'block';

        // Insert canvas after image
        this.imgEl.parentNode?.insertBefore(this.canvasEl, this.imgEl.nextSibling);

        // Listen for load events
        this.imgEl.addEventListener('load', this.handleImgLoad);

        // Initial process if image already loaded
        if (this.imgEl.complete && this.imgEl.naturalWidth > 0) {
            this.process();
        }
    }

    /**
     * Cleanup: remove canvas and event listeners
     */
    async cleanup(): Promise<void> {
        this.imgEl.removeEventListener('load', this.handleImgLoad);

        if (this.canvasEl) {
            this.canvasEl.remove();
            this.canvasEl = null;
        }

        await this.ocrRecognizer.terminate();
    }

    /**
     * Handle image load event
     */
    private async onImgLoad(): Promise<void> {
        await this.process();
    }

    /**
     * Process the captcha image and perform OCR
     */
    private async process(): Promise<void> {
        if (!this.canvasEl) return;

        try {
            // Step 1: Preprocess image using Canvas/JS
            const preprocessor = new CaptchaPreprocessor();
            const { width, height, data } = preprocessor.process(this.imgEl);

            // Resize canvas to match processed image
            this.canvasEl.width = width;
            this.canvasEl.height = height;

            // Draw binary Uint8Array back to canvas
            const ctx = this.canvasEl.getContext('2d');
            if (ctx) {
                const imgData = ctx.createImageData(width, height);
                for (let i = 0; i < data.length; i++) {
                    const val = data[i];
                    const idx = i * 4;
                    imgData.data[idx] = val; // R
                    imgData.data[idx + 1] = val; // G
                    imgData.data[idx + 2] = val; // B
                    imgData.data[idx + 3] = 255; // A
                }
                ctx.putImageData(imgData, 0, 0);
            }

            this.log.d('Captcha image processed');

            // Step 2: Perform OCR on the processed image
            if (this.onTextRecognized) {
                const text = await this.ocrRecognizer.recognize(this.canvasEl);
                if (text) {
                    this.onTextRecognized(text);
                }
            }
        } catch (error) {
            this.log.e('Error processing captcha:', error);
        }
    }
}
