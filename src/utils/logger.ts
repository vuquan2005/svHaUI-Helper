/**
 * Logger Utility - Logging nhanh và đẹp
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
    prefix?: string;
    enabled?: boolean;
}

const LEVEL_STYLES: Record<LogLevel, string> = {
    debug: 'color: #9CA3AF',
    info: 'color: #3B82F6',
    warn: 'color: #F59E0B',
    error: 'color: #EF4444; font-weight: bold',
};

const LEVEL_ICONS: Record<LogLevel, string> = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
};

class Logger {
    private prefix: string;
    private enabled: boolean;

    constructor(options: LoggerOptions = {}) {
        this.prefix = options.prefix || 'App';
        this.enabled = options.enabled ?? true;
    }

    private log(level: LogLevel, ...args: unknown[]): void {
        if (!this.enabled) return;

        const icon = LEVEL_ICONS[level];
        const style = LEVEL_STYLES[level];
        const tag = `[${this.prefix}]`;

        console[level === 'debug' ? 'log' : level](
            `%c${icon} ${tag}`,
            style,
            ...args
        );
    }

    /** Debug log - for development */
    d(...args: unknown[]): void {
        this.log('debug', ...args);
    }

    /** Info log */
    i(...args: unknown[]): void {
        this.log('info', ...args);
    }

    /** Warning log */
    w(...args: unknown[]): void {
        this.log('warn', ...args);
    }

    /** Error log */
    e(...args: unknown[]): void {
        this.log('error', ...args);
    }

    /** Create child logger with sub-prefix */
    child(name: string): Logger {
        return new Logger({
            prefix: `${this.prefix}:${name}`,
            enabled: this.enabled,
        });
    }

    /** Enable/disable logging */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
}

// Main app logger
export const log = new Logger({ prefix: 'HaUI' });

// Factory để tạo logger cho từng module
export function createLogger(name: string): Logger {
    return log.child(name);
}
