// Version is injected from package.json via vite.config.ts
declare const __APP_VERSION__: string;

console.log(
    `%c 🎓 SV HaUI Helper %c 🚀 v${__APP_VERSION__} %c 👨‍💻 VuQuan %c` +
        `\n%c✨ Cảm thấy hữu ích? Hãy ủng hộ mình nhé! 👇` +
        `\n%c🏦 TPBank: 07602987000 (VU VIET QUAN)` +
        `\n%c👉 QR Scan: https://img.vietqr.io/image/TPB-07602987000-qr_only.png`,

    'background: #42639eff; color: #fff; padding: 5px 10px; border-radius: 6px 0 0 6px; font-weight: bold; font-size: 14px; margin-top: 5px;',
    'background: #3182ce; color: #fff; padding: 5px 10px; font-weight: bold; font-size: 14px; margin-top: 5px;',
    'background: #9279c9ff; color: #fff; padding: 5px 10px; border-radius: 0 6px 6px 0; font-weight: bold; font-size: 14px; margin-top: 5px;',
    '',
    'color: #c56798ff; font-size: 13px; font-weight: bold; margin-top: 12px; margin-bottom: 3px;',
    'color: #3aac77ff; font-size: 14px; font-weight: bold; margin-bottom: 3px;',
    'color: #5092d7ff; font-size: 13px; font-weight: bold; margin-bottom: 5px;'
);
