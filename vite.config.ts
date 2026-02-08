import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';
import path from 'path';
import { version } from './package.json';

const isMinify = process.env.MINIFY === 'true';

// GitHub release URLs for auto-update (only for minified version)
const GITHUB_RELEASE_BASE = 'https://github.com/vuquan2005/svHaUI-Helper/releases/latest/download';
const MINIFIED_SCRIPT_NAME = 'svhaui-helper.min.user.js';

const buildTime: string = new Date()
    .toLocaleString('sv-SE', { hour12: false })
    .replace(/[^\d]/g, '')
    .slice(2);

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
                name: 'SV HaUI Helper',
                version,
                namespace: 'https://github.com/vuquan2005/svHaUI-Helper',
                author: 'VuQuan',
                description: 'Nâng cao trải nghiệm cho sinh viên HaUI',
                license: 'GPL-3.0-only',
                homepageURL: 'https://github.com/vuquan2005/svHaUI-Helper',
                supportURL: 'https://github.com/vuquan2005/svHaUI-Helper/issues',
                icon: 'https://cdn-001.haui.edu.vn//img/logo-45x45.png',
                match: ['https://sv.haui.edu.vn/*'],
                'run-at': 'document-end',
                // Only add update URLs for minified version (GitHub distribution)
                // Greasy Fork version (readable) doesn't need these
                ...(isMinify && {
                    downloadURL: `${GITHUB_RELEASE_BASE}/${MINIFIED_SCRIPT_NAME}`,
                    updateURL: `${GITHUB_RELEASE_BASE}/${MINIFIED_SCRIPT_NAME}`,
                }),
            },
            build: {
                autoGrant: true,
                fileName: isMinify ? 'svhaui-helper.min.user.js' : 'svhaui-helper.user.js',
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
