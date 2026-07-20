/**
 * OCR Recognizer
 * Wrapper for PP-OCRv4 Mobile ONNX engine using ONNX Runtime Web
 */

import * as ort from 'onnxruntime-web';
import { fetchArrayBuffer } from '@/utils';
import { DEFAULT_MODEL_URL, ORT_WASM_CDN_BASE, CHARACTER_DICT } from './config';
import { prepareInputTensor, ctcDecode } from './ocr-utils';

export interface OcrRecognizerOptions {
    /** Logger for debug/error messages */
    log: {
        d: (...args: unknown[]) => void;
        e: (...args: unknown[]) => void;
    };
    /** Optional ONNX model URL override */
    modelUrl?: string;
}

/**
 * Handles OCR recognition using PP-OCRv4 Mobile ONNX model.
 * Uses lazy initialization and reuses ONNX Runtime session for maximum performance.
 */
export class OcrRecognizer {
    private session: ort.InferenceSession | null = null;
    private log: OcrRecognizerOptions['log'];
    private modelUrl: string;
    private initializing: Promise<void> | null = null;

    constructor(options: OcrRecognizerOptions) {
        this.log = options.log;
        this.modelUrl = options.modelUrl || DEFAULT_MODEL_URL;
    }

    /**
     * Initialize ONNX Runtime session (lazy, only when first needed)
     */
    private async ensureSession(): Promise<ort.InferenceSession> {
        if (this.session) return this.session;

        // Prevent concurrent multiple initializations
        if (this.initializing) {
            await this.initializing;
            return this.session!;
        }

        this.initializing = (async () => {
            this.log.d('Initializing ONNX Runtime session...');

            // Disable multi-threading in WASM to avoid COOP/COEP headers issues in browser/userscript
            ort.env.wasm.numThreads = 1;
            ort.env.wasm.wasmPaths = ORT_WASM_CDN_BASE;

            this.log.d('Fetching ONNX model binary from:', this.modelUrl);
            const modelBuffer = await fetchArrayBuffer(this.modelUrl);

            this.session = await ort.InferenceSession.create(modelBuffer, {
                executionProviders: ['wasm'],
            });

            this.log.d('ONNX Runtime session initialized successfully');
        })();

        await this.initializing;
        return this.session!;
    }

    /**
     * Recognize text from canvas element using PP-OCRv4 ONNX model
     *
     * @param canvas The canvas containing preprocessed captcha image
     * @returns Recognized text string
     */
    async recognize(canvas: HTMLCanvasElement): Promise<string> {
        let inputTensor: ort.Tensor | null = null;
        let outputTensor: ort.Tensor | null = null;
        try {
            const session = await this.ensureSession();
            inputTensor = prepareInputTensor(canvas);

            const inputName = session.inputNames[0];
            const feeds: Record<string, ort.Tensor> = { [inputName]: inputTensor };

            const results = await session.run(feeds);
            outputTensor = results[session.outputNames[0]];

            const dims = outputTensor.dims;
            const numFrames = Number(dims[1]);
            const numClasses = Number(dims[2]);
            const logits = outputTensor.data as Float32Array;

            const text = ctcDecode(logits, numFrames, numClasses, CHARACTER_DICT);
            this.log.d('PP-OCRv4 raw recognized text:', text);

            return text;
        } catch (error) {
            this.log.e('PP-OCRv4 ONNX recognition failed:', error);
            return '';
        } finally {
            inputTensor?.dispose();
            outputTensor?.dispose();
        }
    }

    /**
     * Terminate the ONNX session and release resources
     */
    async terminate(): Promise<void> {
        if (this.session) {
            try {
                await this.session.release();
            } catch (error) {
                this.log.e('Failed to release ONNX session:', error);
            }
            this.session = null;
        }
        this.initializing = null;
        this.log.d('ONNX session released');
    }
}
