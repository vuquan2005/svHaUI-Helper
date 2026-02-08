import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';
import path from 'path';
import { version } from './package.json';

const isMinify = process.env.MINIFY === 'true';
const isDevChannel = process.env.DEV_CHANNEL === 'true';

// GitHub release URLs for auto-update (only for minified version)
const GITHUB_RELEASE_BASE = 'https://github.com/vuquan2005/svHaUI-Helper/releases/latest/download';
const MINIFIED_SCRIPT_NAME = 'svhaui-helper.min.user.js';

// Dev channel uses raw file from main branch (always latest prerelease)
const DEV_SCRIPT_NAME = 'svhaui-helper.dev.user.js';
const DEV_UPDATE_URL = `https://raw.githubusercontent.com/vuquan2005/svHaUI-Helper/main/dist/${DEV_SCRIPT_NAME}`;

const buildTime: string = new Date()
    .toLocaleString('sv-SE', { hour12: false })
    .replace(/[^\d]/g, '')
    .slice(2);

// Determine output file name
const getFileName = () => {
    if (isDevChannel) return DEV_SCRIPT_NAME;
    if (isMinify) return MINIFIED_SCRIPT_NAME;
    return 'svhaui-helper.user.js';
};

// Determine update URLs based on build type
const getUpdateUrls = () => {
    if (isDevChannel) {
        return {
            downloadURL: DEV_UPDATE_URL,
            updateURL: DEV_UPDATE_URL,
        };
    }
    if (isMinify) {
        return {
            downloadURL: `${GITHUB_RELEASE_BASE}/${MINIFIED_SCRIPT_NAME}`,
            updateURL: `${GITHUB_RELEASE_BASE}/${MINIFIED_SCRIPT_NAME}`,
        };
    }
    return {};
};

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: isDevChannel ? 'SV HaUI Helper (Dev)' : 'SV HaUI Helper',
                version,
                namespace: 'https://github.com/vuquan2005/svHaUI-Helper',
                author: 'VuQuan',
                description: isDevChannel
                    ? '⚠️ DEV BUILD - Nâng cao trải nghiệm cho sinh viên HaUI'
                    : 'Nâng cao trải nghiệm cho sinh viên HaUI',
                license: 'GPL-3.0-only',
                homepageURL: 'https://github.com/vuquan2005/svHaUI-Helper',
                supportURL: 'https://github.com/vuquan2005/svHaUI-Helper/issues',
                icon: 'https://cdn-001.haui.edu.vn//img/logo-45x45.png',
                match: ['https://sv.haui.edu.vn/*'],
                'run-at': 'document-end',
                ...getUpdateUrls(),
            },
            build: {
                autoGrant: true,
                fileName: getFileName(),
                externalGlobals: {
                    '@techstark/opencv-js': cdn.jsdelivr('cv', 'dist/opencv.min.js'),
                    'tesseract.js': cdn.jsdelivr('Tesseract', 'dist/tesseract.min.js'),
                },
            },
            server: {
                mountGmApi: true,
            },
        }),
    ],
    build: {
        minify: isMinify ? 'esbuild' : false,
        emptyOutDir: false,
    },
    define: {
        __APP_VERSION__: JSON.stringify(version),
        __BUILD_TIME__: JSON.stringify(buildTime),
    },
});
