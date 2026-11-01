import { Feature } from '@/core';
import './mobile-sidebar.scss';

/** Keep the open mobile menu below the fixed header. */
export class MobileSidebarFeature extends Feature {
    private dispose: (() => void) | null = null;

    constructor() {
        super({
            id: 'mobile-sidebar',
            name: 'Mobile Sidebar',
            description: 'Giữ menu mobile ngay dưới thanh điều hướng khi mở',
        });
    }

    run(): void {
        this.cleanup();
        const sidebar = document.querySelector<HTMLElement>('.be-wrapper .be-left-sidebar');
        const header = document.querySelector<HTMLElement>('.be-top-header');
        if (!sidebar || !header) return;

        const property = '--sv-mobile-sidebar-top';
        const previous = sidebar.style.getPropertyValue(property);
        const priority = sidebar.style.getPropertyPriority(property);
        const update = () => {
            const top = Math.max(0, header.getBoundingClientRect().bottom);
            sidebar.style.setProperty(property, `${top}px`);
        };
        update();
        sidebar.setAttribute('data-sv-mobile-sidebar', '');

        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(header);
        const stateObserver = new MutationObserver(update);
        stateObserver.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
        window.addEventListener('resize', update);

        this.dispose = () => {
            resizeObserver.disconnect();
            stateObserver.disconnect();
            window.removeEventListener('resize', update);
            sidebar.removeAttribute('data-sv-mobile-sidebar');
            if (previous) sidebar.style.setProperty(property, previous, priority);
            else sidebar.style.removeProperty(property);
        };
    }

    cleanup(): void {
        this.dispose?.();
        this.dispose = null;
    }
}
