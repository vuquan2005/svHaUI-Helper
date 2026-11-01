import { browser } from 'wxt/browser';
import { renderFeatureToggles } from './controls';
import styles from './portal.scss?inline';

/** Mount independently of feature switches so settings always remain accessible. */
export function mountPortalSettings(): () => void {
    const launcher = document.createElement('li');
    launcher.id = 'sv-helper-settings-launcher';
    launcher.style.cssText =
        'display:flex;align-items:center;align-self:stretch;flex:0 0 auto;float:none;margin:0 8px;list-style:none;';
    const launcherContent = document.createElement('div');
    launcherContent.style.display = 'flex';
    launcher.append(launcherContent);
    const launcherRoot = launcherContent.attachShadow({ mode: 'open' });
    const launcherStyle = document.createElement('style');
    launcherStyle.textContent = styles;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'launcher';
    button.title = 'Cài đặt SV Helper';
    button.setAttribute('aria-label', button.title);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-haspopup', 'dialog');
    const logo = document.createElement('img');
    logo.src = browser.runtime.getURL('/icon/32.png');
    logo.alt = '';
    logo.width = 24;
    logo.height = 24;
    button.append(logo);
    launcherRoot.append(launcherStyle, button);

    const host = document.createElement('div');
    host.id = 'sv-helper-settings';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `
        <style>${styles}</style>
        <div class="overlay" hidden>
            <div class="backdrop"></div>
            <section class="panel" role="dialog" aria-labelledby="settings-title">
                <header>
                    <div><h2 id="settings-title">Cài đặt SV Helper</h2><p>Bật hoặc tắt các tính năng hỗ trợ</p></div>
                    <button type="button" class="close" aria-label="Đóng cài đặt" title="Đóng">×</button>
                </header>
                <div class="panel-content"><div class="toggles-list"></div></div>
                <p class="status" role="status" hidden></p>
            </section>
        </div>`;
    const overlay = root.querySelector<HTMLElement>('.overlay')!;
    const list = root.querySelector<HTMLElement>('.toggles-list')!;
    const closeButton = root.querySelector<HTMLButtonElement>('.close')!;
    const status = root.querySelector<HTMLElement>('.status')!;
    let disposed = false;
    let renderVersion = 0;

    const refresh = async () => {
        const version = ++renderVersion;
        try {
            // Render offscreen so a late storage read cannot replace newer controls.
            const content = document.createElement('div');
            await renderFeatureToggles(content);
            if (disposed || version !== renderVersion) return;
            const active = root.activeElement as HTMLElement | null;
            const focusKey = active?.dataset.id ?? active?.dataset.theme;
            list.replaceChildren(content);
            if (focusKey) {
                Array.from(list.querySelectorAll<HTMLElement>('input, button'))
                    .find((element) => (element.dataset.id ?? element.dataset.theme) === focusKey)
                    ?.focus();
            }
            status.hidden = true;
        } catch {
            if (disposed || version !== renderVersion) return;
            status.textContent = 'Không thể tải cài đặt. Hãy đóng bảng và thử lại.';
            status.hidden = false;
        }
    };
    const close = (restoreFocus = true) => {
        overlay.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        if (restoreFocus && launcher.isConnected) button.focus();
    };
    button.addEventListener('click', () => {
        if (!overlay.hidden) {
            close();
            return;
        }
        const header = launcher.closest('.be-top-header');
        const top = Math.max(0, header?.getBoundingClientRect().bottom ?? 0);
        overlay.style.top = `${top}px`;
        overlay.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        closeButton.focus();
        void refresh();
    });
    closeButton.addEventListener('click', () => close());
    root.querySelector('.backdrop')!.addEventListener('click', () => close());
    const onKeydown = (event: KeyboardEvent) => {
        if (!overlay.hidden && event.key === 'Escape') {
            event.preventDefault();
            close();
        }
    };
    document.addEventListener('keydown', onKeydown);
    const onPointerdown = (event: PointerEvent) => {
        if (
            !overlay.hidden &&
            !event.composedPath().includes(host) &&
            !event.composedPath().includes(launcher)
        )
            close(false);
    };
    document.addEventListener('pointerdown', onPointerdown);
    const onStorageChanged = (changes: Record<string, unknown>, area: string) => {
        if (
            area === 'local' &&
            !overlay.hidden &&
            ['app_settings', 'captcha_undo_telex', 'dark_mode_system', 'dark_mode_theme'].some(
                (key) => key in changes
            )
        ) {
            void refresh();
        }
    };
    browser.storage.onChanged.addListener(onStorageChanged);

    let mountedNav: HTMLElement | null = null;
    let restoreNavLayout = () => {};
    const attach = () => {
        const userNav = document.querySelector<HTMLElement>(
            '.be-top-header .be-right-navbar ul.nav.navbar-nav.navbar-right.be-user-nav'
        );
        if (mountedNav !== userNav) {
            restoreNavLayout();
            mountedNav = userNav;
            if (userNav) {
                // Keep both items in the user navigation; don't depend on navbar floats.
                const layout = {
                    display: 'flex',
                    'flex-direction': 'row',
                    'flex-wrap': 'nowrap',
                    'align-items': 'stretch',
                    direction: 'ltr',
                };
                const previous = Object.keys(layout).map((property) => ({
                    property,
                    value: userNav.style.getPropertyValue(property),
                    priority: userNav.style.getPropertyPriority(property),
                }));
                for (const [property, value] of Object.entries(layout)) {
                    userNav.style.setProperty(property, value, 'important');
                }
                restoreNavLayout = () => {
                    for (const { property, value, priority } of previous) {
                        if (value) userNav.style.setProperty(property, value, priority);
                        else userNav.style.removeProperty(property);
                    }
                };
            } else {
                restoreNavLayout = () => {};
            }
        }
        if (!userNav) {
            if (launcher.isConnected) launcher.remove();
            close(false);
            return;
        }
        if (userNav.lastElementChild !== launcher) userNav.append(launcher);
        if (!host.isConnected) document.body.append(host);
        if (!overlay.hidden) {
            overlay.style.top = `${Math.max(0, userNav.closest('.be-top-header')!.getBoundingClientRect().bottom)}px`;
        }
    };
    // The portal can insert or replace its header after content-script startup.
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', attach);
    attach();

    return () => {
        disposed = true;
        observer.disconnect();
        document.removeEventListener('keydown', onKeydown);
        document.removeEventListener('pointerdown', onPointerdown);
        window.removeEventListener('resize', attach);
        browser.storage.onChanged.removeListener(onStorageChanged);
        launcher.remove();
        restoreNavLayout();
        host.remove();
    };
}
