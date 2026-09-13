import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';
import path from 'path';
import packageJson from './package.json' with { type: 'json' };

const { version, devDependencies } = packageJson;
const isMinify = process.env.MINIFY === 'true';
const ortVersion = (devDependencies['onnxruntime-web'] || '').replace(/[\^~]/g, '');

const buildTime: string = new Date()
    .toLocaleString('sv-SE', { hour12: false })
    .replace(/[^\d]/g, '')
    .slice(2);

// Determine output file name
const getFileName = () => {
    if (isMinify) return 'svhaui-helper.min.user.js';
    return 'svhaui-helper.user.js';
};

// Deprecated: Do not set updateURL so Tampermonkey stops checking once migrated
const getUpdateUrls = () => ({});

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
        },
    },
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: '[NGỪNG HỖ TRỢ] SV HaUI Helper',
                version,
                namespace: 'https://github.com/vuquan2005/svHaUI-Helper',
                author: 'VuQuan',
                description:
                    '[DEPRECATED] Đã chuyển sang Browser Extension độc lập. Tải tại: https://github.com/vuquan2005/svHaUI-Helper/releases',
                license: 'GPL-3.0-only',
                homepageURL: 'https://github.com/vuquan2005/svHaUI-Helper',
                supportURL: 'https://github.com/vuquan2005/svHaUI-Helper/issues',
                icon: 'https://cdn-001.haui.edu.vn//img/logo-45x45.png',
                match: ['https://sv.haui.edu.vn/*'],
                connect: [
                    'cdn.jsdelivr.net',
                    'raw.githubusercontent.com',
                    'github.com',
                    'objects.githubusercontent.com',
                    'release-assets.githubusercontent.com',
                ],
                'run-at': 'document-end',
                resource: {
                    OCR_MODEL:
                        'https://github.com/vuquan2005/svHaUI-Helper/releases/download/model-v0.0.2/model_quant.onnx',
                    ORT_WASM_SIMD: `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ortVersion}/dist/ort-wasm-simd.wasm`,
                    ORT_WASM: `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ortVersion}/dist/ort-wasm.wasm`,
                },
                ...getUpdateUrls(),
            },
            build: {
                autoGrant: true,
                fileName: getFileName(),
                externalGlobals: {
                    'onnxruntime-web': cdn.jsdelivr('ort', 'dist/ort.wasm.min.js'),
                },
            },
            server: {
                mountGmApi: true,
            },
        }),
    ],
    server: {
        cors: true,
    },
    build: {
        minify: isMinify ? 'esbuild' : false,
        emptyOutDir: false,
    },
    define: {
        __APP_VERSION__: JSON.stringify(version),
        __BUILD_TIME__: JSON.stringify(buildTime),
        __ORT_VERSION__: JSON.stringify(ortVersion),
    },
});
