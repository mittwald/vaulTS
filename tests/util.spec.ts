import { resolveURL } from "../src/util";

describe("URL Resolve", () => {
    test("URL Resolves multiple single paths", () => {
        const url = resolveURL("http://example.com", "/test", "/foo", "/bar");
        expect(url.toString()).toEqual("http://example.com/test/foo/bar");
    });

    test("URL Resolves multiple paths in single strings", () => {
        const url = resolveURL("http://example.com", "/test", "/foo/baz/lul", "/bar");
        expect(url.toString()).toEqual("http://example.com/test/foo/baz/lul/bar");
    });

    test("URL Resolve cleans up multiple leading/tailing slashes", () => {
        const url = resolveURL("http://example.com", "/test///", "////foo/baz/lul", "/bar///");
        expect(url.toString()).toEqual("http://example.com/test/foo/baz/lul/bar");
    });

    test("URL Resolve fails with invalid URL", () => {
        const resolveWrap = () => resolveURL("ht/example", "/test///", "////foo/baz/lul", "/bar///");
        expect(resolveWrap).toThrowError(new TypeError("Invalid URL: ht/example/test/foo/baz/lul/bar"));
    });
});
