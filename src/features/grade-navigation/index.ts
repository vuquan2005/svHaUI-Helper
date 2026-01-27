/**
 * Grade Navigation Feature
 * Adds navigation links to switch between study results and exam results pages
 */

import { Feature } from '@/core';
import styles from './style.module.scss';

// ============================================
// Types
// ============================================

interface NavLink {
    label: string;
    icon: string;
    url: string;
    isActive: boolean;
    description: string;
}

// ============================================
// Constants
// ============================================

const CSS_PREFIX = styles.cssPrefix;

// ============================================
// URL Matching Patterns
// ============================================

const URL_PATTERNS = [
    // Personal
    { name: 'personal-study', pattern: /^\/student\/result\/studyresults$/ },
    { name: 'personal-exam', pattern: /^\/student\/result\/examresult$/ },
    // Friend
    { name: 'friend-study', pattern: /^\/student\/result\/viewstudyresult/ },
    { name: 'friend-exam', pattern: /^\/student\/result\/viewexamresult/ },
    // Class
    { name: 'class-study', pattern: /^\/student\/result\/viewstudyresultclass/ },
    { name: 'class-exam', pattern: /^\/student\/result\/viewexamresultclass/ },
];

// ============================================
// Feature Implementation
// ============================================

export class GradeNavigationFeature extends Feature {
    private navElement: HTMLSpanElement | null = null;

    constructor() {
        super({
            id: 'grade-navigation',
            name: 'Grade Navigation',
            description: 'Điều hướng nhanh giữa trang Điểm TX và Điểm thi',
            urlMatch: URL_PATTERNS,
        });
    }

    run(): void {
        // Generate navigation links based on current URL
        const navLinks = this.generateNavLinks();
        if (navLinks.length === 0) {
            this.log.w('No nav links generated for current URL');
            return;
        }

        // Find panel heading container and inject nav
        const panelHeading = document.querySelector('.panel-heading.panel-heading-divider');
        if (!panelHeading) {
            this.log.w('Panel heading not found');
            return;
        }

        // Create and inject nav element at the beginning (float right will position it)
        this.navElement = this.createNavElement(navLinks);
        panelHeading.insertBefore(this.navElement, panelHeading.firstChild);
    }

    /**
     * Generate navigation links based on current URL
     * Refactored for maintainability and scalability
     */
    private generateNavLinks(): NavLink[] {
        const pathname = this.location.path;
        const search = this.location.search;

        const mappings = [
            // Class pages (must first by overlap with Friend)
            {
                type: 'class',
                study: 'viewstudyresultclass',
                exam: 'viewexamresultclass',
                useParams: true,
            },
            // Friend pages
            { type: 'friend', study: 'viewstudyresult', exam: 'viewexamresult', useParams: true },
            // Personal pages
            { type: 'personal', study: 'studyresults', exam: 'examresult', useParams: false },
        ];

        const config = mappings.find(
            (m) => pathname.includes(m.study) || pathname.includes(m.exam)
        );

        if (!config) return [];

        const isStudy = pathname.includes(config.study);
        const isExam = !isStudy;

        const targetPath = isStudy
            ? pathname.replace(config.study, config.exam)
            : pathname.replace(config.exam, config.study);

        const query = config.useParams ? search : '';

        return [
            {
                label: 'Điểm TX',
                icon: '📊',
                url: (isStudy ? pathname : targetPath) + query,
                isActive: isStudy,
                description: 'Xem kết quả học tập',
            },
            {
                label: 'Điểm thi',
                icon: '📋',
                url: (isExam ? pathname : targetPath) + query,
                isActive: isExam,
                description: 'Xem kết quả thi',
            },
        ];
    }

    /**
     * Create the navigation element
     */
    private createNavElement(links: NavLink[]): HTMLSpanElement {
        const container = document.createElement('span');
        container.className = CSS_PREFIX;

        for (const link of links) {
            const a = document.createElement('a');
            a.href = link.url;
            a.title = link.description;
            a.className = `${CSS_PREFIX}-link${link.isActive ? ' active' : ''}`;

            const icon = document.createElement('span');
            icon.className = `${CSS_PREFIX}-link-icon`;
            icon.textContent = link.icon;

            const label = document.createElement('span');
            label.className = `${CSS_PREFIX}-link-label`;
            label.textContent = link.label;

            a.appendChild(icon);
            a.appendChild(label);
            container.appendChild(a);
        }

        return container;
    }

    /**
     * Cleanup when feature is disabled
     */
    cleanup(): void {
        this.navElement?.remove();
        this.navElement = null;
    }
}
