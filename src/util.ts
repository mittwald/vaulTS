import {URL} from "url";

export function resolveURL(...parts: string[]): URL {
    // clean up the list of parts by removing leading and tailing slashes
    // afterwards join them together to build a full URL
    parts = parts.map(v => v.trim().replace(/^\/+/, '').replace(/\/+$/, ''));
    return new URL(parts.join('/'));
}
