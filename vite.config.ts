import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: 'SV HaUI Helper',
                namespace: 'https://github.com/vuquan2005/svHaUI',
                author: 'VuQuan',
                description: 'Nâng cao trải nghiệm cho sv HaUI',
                icon: 'https://cdn-001.haui.edu.vn//img/logo-45x45.png',
                match: ['https://sv.haui.edu.vn/*'],
                grant: ['GM_addStyle', 'GM_getValue', 'GM_setValue'],
                'run-at': 'document-end',
            },
        }),
    ],
});
