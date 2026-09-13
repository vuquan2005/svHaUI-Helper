import { browser } from 'wxt/browser';

export default defineBackground(() => {
    async function ensureOffscreenDocument(): Promise<void> {
        if (typeof chrome === 'undefined' || !chrome.offscreen) return;
        const hasDoc = await chrome.offscreen.hasDocument();
        if (!hasDoc) {
            await chrome.offscreen.createDocument({
                url: browser.runtime.getURL('/offscreen.html'),
                reasons: [chrome.offscreen.Reason.DOM_PARSER],
                justification: 'Run ONNX Runtime WebAssembly and Canvas for Captcha OCR',
            });
        }
    }

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message?.action === 'SOLVE_CAPTCHA') {
            (async () => {
                try {
                    if (import.meta.env.BROWSER === 'firefox') {
                        const { solveCaptchaFromDataUrl } =
                            await import('@/features/captcha-helper/captcha-solver');
                        const text = await solveCaptchaFromDataUrl(message.dataUrl);
                        sendResponse({ success: true, text });
                    } else {
                        await ensureOffscreenDocument();
                        const response = await browser.runtime.sendMessage({
                            action: 'OFFSCREEN_SOLVE_CAPTCHA',
                            dataUrl: message.dataUrl,
                        });
                        sendResponse(response);
                    }
                } catch (err) {
                    sendResponse({ success: false, error: String(err) });
                }
            })();
            return true; // Keep message channel open for async response
        }
        return false;
    });
});
