/**
 * Wrapper for window.location with normalization methods
 */
export class WindowLocationWrapper {
    constructor(
        private readonly location: Location = typeof window !== 'undefined'
            ? window.location
            : ({} as Location)
    ) {}

    /**
     * Normalized Href (origin + normalized url)
     */
    get href(): string {
        return this.location.href;
    }

    /**
     * Original origin
     */
    get origin(): string {
        return this.location.origin;
    }

    /**
     * Original pathname
     */
    get rawPath(): string {
        return this.location.pathname;
    }

    /**
     * Normalized pathname: removes trailing slashes
     * Example: "/path/" => "/path"
     */
    get path(): string {
        const p = this.location.pathname;
        return p === '/' ? '/' : p.replace(/\/+$/, '');
    }

    /**
     * Original search params
     */
    get search(): string {
        return this.location.search;
    }

    /**
     * Normalized path + search
     */
    get pathAndQuery(): string {
        return this.path + this.search;
    }
    /**
     * Convert a relative or absolute path to a fully qualified URL
     */
    toAbsolute(path: string): string {
        return toAbsoluteUrl(path);
    }
}

export function toAbsoluteUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const origin =
        typeof window !== 'undefined' && window.location?.origin
            ? window.location.origin
            : 'https://sv.haui.edu.vn';
    return new URL(path, origin).href;
}

export const browserLocation = new WindowLocationWrapper();
