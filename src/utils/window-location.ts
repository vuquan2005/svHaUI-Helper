/**
 * Wrapper for window.location with normalization methods
 */
export class WindowLocationWrapper {
    constructor(private readonly location: Location = window.location) {}

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
}

export const browserLocation = new WindowLocationWrapper();
