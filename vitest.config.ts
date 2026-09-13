import { defineConfig } from 'vitest/config';
import path from 'path';
import packageJson from './package.json' with { type: 'json' };

const { version, devDependencies } = packageJson;
const ortVersion = (devDependencies['onnxruntime-web'] || '').replace(/[\^~]/g, '');

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
        },
    },
    define: {
        __APP_VERSION__: JSON.stringify(version),
        __BUILD_TIME__: JSON.stringify('260908'),
        __ORT_VERSION__: JSON.stringify(ortVersion),
    },
    test: {
        environment: 'node',
    },
});
