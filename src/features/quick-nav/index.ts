/**
 * Quick Navigation Feature
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

export class QuickNavFeature extends Feature {
    private navElement: HTMLSpanElement | null = null;

    constructor() {
        super({
            id: 'quick-nav',
            name: 'Quick Nav',
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
     */
    private generateNavLinks(): NavLink[] {
        const pathname = this.location.path;
        const search = this.location.search;

        // Determine current page type
        const isStudy = pathname.includes('studyresult');
        const isExam = pathname.includes('examresult');

        if (!isStudy && !isExam) return [];

        let studyUrl: string;
        let examUrl: string;

        // Personal pages (no query params needed)
        if (pathname === '/student/result/studyresults') {
            studyUrl = pathname;
            examUrl = '/student/result/examresult';
        } else if (pathname === '/student/result/examresult') {
            studyUrl = '/student/result/studyresults';
            examUrl = pathname;
        }
        // Friend pages
        else if (
            pathname.startsWith('/student/result/viewstudyresult') &&
            !pathname.includes('class')
        ) {
            studyUrl = pathname + search;
            examUrl = pathname.replace('viewstudyresult', 'viewexamresult') + search;
        } else if (
            pathname.startsWith('/student/result/viewexamresult') &&
            !pathname.includes('class')
        ) {
            studyUrl = pathname.replace('viewexamresult', 'viewstudyresult') + search;
            examUrl = pathname + search;
        }
        // Class pages
        else if (pathname.includes('viewstudyresultclass')) {
            studyUrl = pathname + search;
            examUrl = pathname.replace('viewstudyresultclass', 'viewexamresultclass') + search;
        } else if (pathname.includes('viewexamresultclass')) {
            studyUrl = pathname.replace('viewexamresultclass', 'viewstudyresultclass') + search;
            examUrl = pathname + search;
        } else {
            return [];
        }

        return [
            { label: 'Điểm TX', icon: '📊', url: studyUrl, isActive: isStudy },
            { label: 'Điểm thi', icon: '📋', url: examUrl, isActive: isExam },
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
            a.className = `${CSS_PREFIX}-link${link.isActive ? ' active' : ''}`;
            a.textContent = `${link.icon} ${link.label}`;
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
