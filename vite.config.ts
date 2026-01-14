import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { version } from './package.json';

export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: 'SV HaUI Helper',
                version,
                namespace: 'https://github.com/vuquan2005/svHaUI',
                author: 'VuQuan',
                description: 'Nâng cao trải nghiệm cho sv HaUI',
                icon: 'https://cdn-001.haui.edu.vn//img/logo-45x45.png',
                match: ['https://sv.haui.edu.vn/*'],
                'run-at': 'document-end',
            },
            build: {
                autoGrant: true,
            },
        }),
    ],
    define: {
        __APP_VERSION__: JSON.stringify(version),
    },
});
