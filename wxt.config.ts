import { defineConfig } from 'wxt';
import packageJson from './package.json' with { type: 'json' };

const { version } = packageJson;

const buildTime: string = new Date()
    .toLocaleString('sv-SE', { hour12: false })
    .replace(/[^\d]/g, '')
    .slice(2);

export default defineConfig({
    srcDir: 'src',
    manifest: ({ browser }) => {
        const permissions: string[] = ['storage'];
        // chrome.offscreen is Chromium specific
        if (browser !== 'firefox') {
            permissions.push('offscreen');
        }

        return {
            name: 'SV HaUI Helper',
            description: 'Nâng cao trải nghiệm cho sinh viên HaUI',
            version,
            permissions,
            host_permissions: ['https://sv.haui.edu.vn/*'],
            action: {
                default_title: 'SV HaUI Helper',
                default_icon: {
                    '16': 'icon/16.png',
                    '32': 'icon/32.png',
                    '48': 'icon/48.png',
                    '128': 'icon/128.png',
                },
            },
            content_security_policy: {
                extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
            },
            browser_specific_settings: {
                gecko: {
                    id: 'svhaui-helper@vuquan.dev',
                    strict_min_version: '109.0',
                    data_collection_permissions: {
                        required: ['none'],
                    },
                },
            },
        };
    },
    vite: () => ({
        resolve: {
            conditions: ['onnxruntime-web-use-extern-wasm'],
        },
        define: {
            __APP_VERSION__: JSON.stringify(version),
            __BUILD_TIME__: JSON.stringify(buildTime),
        },
    }),
});
