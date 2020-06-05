import { URL } from "url";
import { VaultRequestError } from "./Vault";

export function resolveURL(...parts: string[]): URL {
    // clean up the list of parts by removing leading and tailing slashes
    // afterwards join them together to build a full URL
    parts = parts.map((v) => v.trim().replace(/^\/+/, "").replace(/\/+$/, ""));
    return new URL(parts.join("/"));
}

export function validateKeyName(key: string): void {
    if (key.length === 0) {
        throw new VaultRequestError("key is empty", { statusCode: 400 });
    }
    if (key.includes("/")) {
        throw new VaultRequestError(`key "${key}" includes at least one illegal character ("/")`, { statusCode: 400 });
    }
}
