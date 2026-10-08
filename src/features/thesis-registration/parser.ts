/**
 * Thesis Registration Feature - Parser & Helper Utilities
 */

import { FormTokens, Lecturer, ParsedTopicInfo, ThesisTopic } from './types';

/**
 * Parses a topic name to extract clean title and member capacity info (e.g., "(2/3)").
 */
export function parseTopicName(name: string): ParsedTopicInfo {
    const trimmed = name.trim();
    // Matches member capacity annotations such as (2/3), [1/2], (0/2), (SV: 2/3), etc.
    const match = trimmed.match(
        /\s*[-–—]?\s*[([]\s*(?:SV|TV|thành viên|sinh viên)?\s*:?\s*(\d+)\s*\/\s*(\d+)\s*(?:SV|TV|thành viên|sinh viên)?\s*[)\]][\s.]*$/i
    );

    if (!match) {
        return {
            cleanName: trimmed,
            memberInfo: null,
        };
    }

    const current = parseInt(match[1], 10);
    const max = parseInt(match[2], 10);
    let cleanName = trimmed.slice(0, match.index).trim();
    cleanName = cleanName.replace(/[\s\-–—:]+$/, '').trim() || trimmed;

    return {
        cleanName,
        memberInfo: {
            current,
            max,
            raw: `${current}/${max}`,
            isFull: current >= max && max > 0,
        },
    };
}

export interface SelectOptionLike {
    value: string;
    textContent?: string | null;
}

export interface SelectElementLike {
    options: ArrayLike<SelectOptionLike>;
}

/**
 * Extracts list of lecturers from the teacher dropdown select element.
 */
export function extractLecturers(selectElement: SelectElementLike): Lecturer[] {
    const lecturers: Lecturer[] = [];
    const options = Array.from(selectElement.options);

    for (const option of options) {
        const val = option.value?.trim();
        const text = option.textContent?.trim() || '';

        // Skip placeholders like "-- Chọn giáo viên --" or value "0" / empty
        if (!val || val === '0' || text.startsWith('--')) {
            continue;
        }

        lecturers.push({
            id: val,
            name: text,
        });
    }

    return lecturers;
}

/**
 * Extracts topics from a topic select element.
 */
export function extractTopics(topicSelect: SelectElementLike, lecturer: Lecturer): ThesisTopic[] {
    const topics: ThesisTopic[] = [];
    const options = Array.from(topicSelect.options);

    for (const option of options) {
        const val = option.value?.trim();
        const text = option.textContent?.trim() || '';

        // Skip placeholders like "-- Chọn đề tài --" or value "0" / empty
        if (!val || val === '0' || text.startsWith('--')) {
            continue;
        }

        topics.push({
            id: val,
            name: text,
            lecturerId: lecturer.id,
            lecturerName: lecturer.name,
        });
    }

    return topics;
}

/**
 * Parses response HTML string and extracts topics for a given lecturer.
 */
export function extractTopicsFromHtml(
    html: string,
    lecturer: Lecturer,
    topicSelectSelector = '#ctl03_ddlDeTai'
): ThesisTopic[] {
    if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const topicSelect =
            doc.querySelector<HTMLSelectElement>(topicSelectSelector) ||
            doc.querySelector<HTMLSelectElement>('select[name$="ddlDeTai"]');

        if (!topicSelect) {
            return [];
        }

        return extractTopics(topicSelect, lecturer);
    }

    // Fallback regex parser for Node / non-DOM environments
    const selectRegex =
        /<select[^>]*?(?:id="ctl03_ddlDeTai"|name="[^"]*ddlDeTai")[^>]*>([\s\S]*?)<\/select>/i;
    const match = html.match(selectRegex);
    if (!match) return [];

    const optionsHtml = match[1];
    const optionRegex = /<option[^>]*?value="([^"]*)"[^>]*>([\s\S]*?)<\/option>/gi;
    const topics: ThesisTopic[] = [];

    let optMatch: RegExpExecArray | null;
    while ((optMatch = optionRegex.exec(optionsHtml)) !== null) {
        const val = optMatch[1].trim();
        const text = optMatch[2].trim();
        if (!val || val === '0' || text.startsWith('--')) continue;

        topics.push({
            id: val,
            name: text,
            lecturerId: lecturer.id,
            lecturerName: lecturer.name,
        });
    }

    return topics;
}

/**
 * Extracts ASP.NET form tokens and input names from the registration form.
 */
export function extractFormTokens(form: HTMLFormElement): FormTokens {
    const actionUrl =
        (typeof form.action === 'string' && form.action) ||
        form.getAttribute('action') ||
        '/register/dangkyDAKLTN';
    const viewState = form.querySelector<HTMLInputElement>('#__VIEWSTATE')?.value ?? '';
    const viewStateGen = form.querySelector<HTMLInputElement>('#__VIEWSTATEGENERATOR')?.value;
    const eventValidation = form.querySelector<HTMLInputElement>('#__EVENTVALIDATION')?.value;

    const gvSelect =
        form.querySelector<HTMLSelectElement>('#ctl03_ddlGiangVien') ||
        form.querySelector<HTMLSelectElement>('select[name$="ddlGiangVien"]');
    const dtSelect =
        form.querySelector<HTMLSelectElement>('#ctl03_ddlDeTai') ||
        form.querySelector<HTMLSelectElement>('select[name$="ddlDeTai"]');

    const lecturerFieldName = gvSelect?.getAttribute('name') || 'ctl03$ddlGiangVien';
    const topicFieldName = dtSelect?.getAttribute('name') || 'ctl03$ddlDeTai';

    const extraHiddenFields: Record<string, string> = {};
    const hiddenInputs = form.querySelectorAll<HTMLInputElement>('input[type="hidden"]');
    hiddenInputs.forEach((input) => {
        const name = input.name;
        if (
            name &&
            name !== '__VIEWSTATE' &&
            name !== '__VIEWSTATEGENERATOR' &&
            name !== '__EVENTVALIDATION' &&
            name !== '__EVENTTARGET' &&
            name !== '__EVENTARGUMENT' &&
            name !== '__LASTFOCUS'
        ) {
            extraHiddenFields[name] = input.value;
        }
    });

    const baseFormData: Record<string, string> = {};
    const submitButtonNames: string[] = [];

    if (typeof form.querySelectorAll === 'function') {
        const controls = form.querySelectorAll<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >('input, select, textarea');
        controls.forEach((el) => {
            const name = el.getAttribute('name') || el.name;
            if (!name) return;

            const type = (el as HTMLInputElement).type?.toLowerCase();
            if (type === 'submit' || type === 'button' || type === 'image') {
                submitButtonNames.push(name);
                return;
            }

            if ((type === 'checkbox' || type === 'radio') && !(el as HTMLInputElement).checked) {
                return;
            }

            baseFormData[name] = el.value ?? '';
        });
    }

    return {
        actionUrl,
        viewState,
        viewStateGen,
        eventValidation,
        lecturerFieldName,
        topicFieldName,
        extraHiddenFields,
        baseFormData,
        submitButtonNames,
    };
}

/**
 * Exports topic list to CSV with UTF-8 BOM so Excel opens with correct Vietnamese diacritics.
 */
export function exportTopicsToCsv(topics: ThesisTopic[]): string {
    const header = ['STT', 'Giảng viên', 'Mã đề tài', 'Tên đề tài'];
    const rows = topics.map((t, idx) => [
        String(idx + 1),
        `"${t.lecturerName.replace(/"/g, '""')}"`,
        `"${t.id.replace(/"/g, '""')}"`,
        `"${t.name.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    return '\uFEFF' + csvContent;
}

/**
 * Formats topics into Tab-Separated Values (TSV) for direct clipboard paste into Excel / Sheets.
 */
export function formatTopicsForClipboard(topics: ThesisTopic[]): string {
    const header = ['STT', 'Giảng viên', 'Mã đề tài', 'Tên đề tài'];
    const rows = topics.map((t, idx) => [String(idx + 1), t.lecturerName, t.id, t.name]);

    return [header.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
}
