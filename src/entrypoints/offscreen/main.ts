import { solveCaptchaFromDataUrl } from '@/features/captcha-helper/captcha-solver';
import { browser } from 'wxt/browser';

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.action === 'OFFSCREEN_SOLVE_CAPTCHA') {
        solveCaptchaFromDataUrl(message.dataUrl)
            .then((text) => sendResponse({ success: true, text }))
            .catch((err) => sendResponse({ success: false, error: String(err) }));
        return true;
    }
    return false;
});

console.log('HaUI Helper Offscreen OCR engine ready.');
