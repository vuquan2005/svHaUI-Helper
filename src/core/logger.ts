/**
 * Logger Utility - Logging nhanh và đẹp
 * Hỗ trợ log level setting và hiển thị source location (line number)
 *
 * Sử dụng bind trick để DevTools hiển thị đúng line number nơi gọi log
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

// Thứ tự ưu tiên: debug < info < warn < error < none
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4,
};

interface LoggerOptions {
    prefix?: string;
    minLevel?: LogLevel;
}

const LEVEL_STYLES: Record<Exclude<LogLevel, 'none'>, string> = {
    debug: 'color: #9CA3AF',
    info: 'color: #3B82F6',
    warn: 'color: #F59E0B',
    error: 'color: #EF4444; font-weight: bold',
};

const LEVEL_ICONS: Record<Exclude<LogLevel, 'none'>, string> = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
};

// Global log level - có thể thay đổi từ settings
let globalMinLevel: LogLevel = 'debug';

export function setGlobalLogLevel(level: LogLevel): void {
    globalMinLevel = level;
}

export function getGlobalLogLevel(): LogLevel {
    return globalMinLevel;
}

// No-op function khi log bị disabled
const noop = () => {};

export class Logger {
    private prefix: string;
    private minLevel: LogLevel | null;

    constructor(options: LoggerOptions = {}) {
        this.prefix = options.prefix || 'App';
        this.minLevel = options.minLevel || null;
    }

    private getEffectiveLevel(): LogLevel {
        return this.minLevel || globalMinLevel;
    }

    private shouldLog(level: Exclude<LogLevel, 'none'>): boolean {
        const effectiveLevel = this.getEffectiveLevel();
        return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[effectiveLevel];
    }

    /**
     * Debug log - for development
     * Sử dụng: log.d('message', data)
     * Line number sẽ hiển thị đúng vị trí gọi trong DevTools
     */
    get d() {
        if (!this.shouldLog('debug')) return noop;
        const icon = LEVEL_ICONS.debug;
        const style = LEVEL_STYLES.debug;
        return console.log.bind(console, `%c${icon} [${this.prefix}]`, style);
    }

    /**
     * Info log
     */
    get i() {
        if (!this.shouldLog('info')) return noop;
        const icon = LEVEL_ICONS.info;
        const style = LEVEL_STYLES.info;
        return console.info.bind(console, `%c${icon} [${this.prefix}]`, style);
    }

    /**
     * Warning log
     */
    get w() {
        if (!this.shouldLog('warn')) return noop;
        const icon = LEVEL_ICONS.warn;
        const style = LEVEL_STYLES.warn;
        return console.warn.bind(console, `%c${icon} [${this.prefix}]`, style);
    }

    /**
     * Error log
     */
    get e() {
        if (!this.shouldLog('error')) return noop;
        const icon = LEVEL_ICONS.error;
        const style = LEVEL_STYLES.error;
        return console.error.bind(console, `%c${icon} [${this.prefix}]`, style);
    }

    /** Create child logger with sub-prefix */
    child(name: string): Logger {
        const options: LoggerOptions = {
            prefix: `${this.prefix}:${name}`,
        };
        if (this.minLevel) {
            options.minLevel = this.minLevel;
        }
        return new Logger(options);
    }

    /** Set minimum log level for this logger */
    setLevel(level: LogLevel): void {
        this.minLevel = level;
    }
}

// Main app logger
export const log = new Logger({ prefix: 'HaUI' });

// Factory để tạo logger cho từng module
export function createLogger(name: string): Logger {
    return log.child(name);
}
