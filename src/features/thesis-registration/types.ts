/**
 * Thesis Registration Feature - Types
 */

export interface Lecturer {
    id: string;
    name: string;
}

export interface TopicMemberInfo {
    current: number;
    max: number;
    raw: string;
    isFull: boolean;
}

export interface ParsedTopicInfo {
    cleanName: string;
    memberInfo: TopicMemberInfo | null;
}

export interface ThesisTopic {
    id: string;
    name: string;
    lecturerId: string;
    lecturerName: string;
}

export interface LecturerTopicGroup {
    lecturer: Lecturer;
    topics: ThesisTopic[];
    status: 'idle' | 'pending' | 'loading' | 'success' | 'error';
    error?: string;
}

export interface FormTokens {
    actionUrl: string;
    viewState: string;
    viewStateGen?: string;
    eventValidation?: string;
    lecturerFieldName: string;
    topicFieldName: string;
    extraHiddenFields: Record<string, string>;
    baseFormData?: Record<string, string>;
    submitButtonNames?: string[];
}

export type ThesisViewMode = 'table' | 'grouped';

export interface ThesisStorageData extends Record<string, unknown> {
    cacheTimestamp?: number;
    groups?: LecturerTopicGroup[];
}
