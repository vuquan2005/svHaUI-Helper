/**
 * OCR Recognizer
 * Wrapper for Tesseract.js OCR engine
 */

import Tesseract from 'tesseract.js';

export interface OcrRecognizerOptions {
    /** Logger for debug/error messages */
    log: {
        d: (...args: unknown[]) => void;
        e: (...args: unknown[]) => void;
    };
}

/**
 * Handles OCR recognition using Tesseract.js
 * Uses lazy initialization and reuses worker for performance
 */
export class OcrRecognizer {
    private worker: Tesseract.Worker | null = null;
    private log: OcrRecognizerOptions['log'];
    private initializing: Promise<void> | null = null;

    constructor(options: OcrRecognizerOptions) {
        this.log = options.log;
    }

    /**
     * Initialize Tesseract worker (lazy, only when first needed)
     */
    private async ensureWorker(): Promise<Tesseract.Worker> {
        if (this.worker) return this.worker;

        // Prevent multiple initializations
        if (this.initializing) {
            await this.initializing;
            return this.worker!;
        }

        this.initializing = (async () => {
            this.log.d('Initializing Tesseract worker...');

            // Pass logger to options (3rd arg)
            // Pass init options to config (4th arg)
            this.worker = await Tesseract.createWorker(
                'eng',
                Tesseract.OEM.LSTM_ONLY,
                {
                    logger: () => {},
                },
                {
                    load_system_dawg: '0',
                    load_freq_dawg: '0',
                }
            );

            // Configure runtime parameters
            await this.worker.setParameters({
                tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyz',
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
            });

            this.log.d('Tesseract worker initialized');
        })();

        await this.initializing;
        return this.worker!;
    }

    /** Maximum number of characters to keep */
    private static readonly MAX_CHARS = 5;

    /**
     * Recognize text from canvas element
     * @param canvas The canvas containing the preprocessed captcha image
     * @returns Recognized text (trimmed, filtered by confidence, max 5 chars)
     */
    async recognize(canvas: HTMLCanvasElement): Promise<string> {
        try {
            const worker = await this.ensureWorker();
            // Request blocks output to get symbol-level confidence
            const result = await worker.recognize(canvas, {}, { blocks: true });

            // Extract all symbols from nested structure: blocks -> paragraphs -> lines -> words -> symbols
            const symbols: Tesseract.Symbol[] = [];
            for (const block of result.data.blocks ?? []) {
                for (const paragraph of block.paragraphs) {
                    for (const line of paragraph.lines) {
                        for (const word of line.words) {
                            symbols.push(...word.symbols);
                        }
                    }
                }
            }

            this.log.d(
                'OCR raw symbols:',
                symbols.map((s) => `${s.text}(${s.confidence.toFixed(1)})`).join(' ')
            );

            let top: Tesseract.Symbol[];

            if (symbols.length <= OcrRecognizer.MAX_CHARS) {
                top = symbols;
            } else {
                top = symbols
                    .map((s, i) => ({ s, i }))
                    .sort((a, b) => b.s.confidence - a.s.confidence)
                    .slice(0, OcrRecognizer.MAX_CHARS)
                    .sort((a, b) => a.i - b.i)
                    .map((x) => x.s);
            }

            const text = top.map((s) => s.text).join('');
            return text;
        } catch (error) {
            this.log.e('OCR recognition failed:', error);
            return '';
        }
    }

    /**
     * Terminate the Tesseract worker and release resources
     */
    async terminate(): Promise<void> {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.initializing = null;
            this.log.d('Tesseract worker terminated');
        }
    }
}
