import { test, describe, it, before } from 'node:test';
import assert from 'node:assert';
import { defineSite, serveAgent } from '../packages/web/dist/index.js';
import { fetchAgentTruth } from '../packages/agent/dist/index.js';
import { generateKeyPair, exportPrivateKey, exportPublicKey } from '../packages/core/dist/index.js';

// Polyfill Headers for Node environments < 18 or if missing
if (!globalThis.Headers) {
    globalThis.Headers = class Headers extends Map {
        set(k, v) { super.set(k.toLowerCase(), v); }
        get(k) { return super.get(k.toLowerCase()); }
        forEach(cb) { super.forEach((v, k) => cb(v, k)); }
    };
}

describe('E2E Data Flow', () => {

    let handler;
    // Normalized URL expectations
    const MOCK_URL = "http://example.com/.well-known/agent.json";
    const USER_URL = "http://example.com";

    before(async () => {
        try {
            const { privateKey, publicKey } = await generateKeyPair();
            const privHex = await exportPrivateKey(privateKey);
            const pubHex = await exportPublicKey(publicKey);

            const site = defineSite({
                site_name: "Secured Site",
                description: "A secure site",
                schema_version: "1.0",
                last_updated: new Date().toISOString(),
                privateKey: privHex,
                publicKey: pubHex
            });

            const agentHandler = serveAgent(site);
            handler = agentHandler.GET;

            // Mock Fetch Global
            globalThis.fetch = async (url, options) => {
                // Normalize URL for check
                const u = new URL(url);
                if (u.pathname === '/.well-known/agent.json') {
                    const reqHeaders = options?.headers || {};
                    // Normalize headers to lowercase to simulate HTTP
                    const normalizedHeaders = {};
                    for (const [k, v] of Object.entries(reqHeaders)) {
                        normalizedHeaders[k.toLowerCase()] = v;
                    }

                    const res = await handler({ headers: normalizedHeaders });

                    return {
                        ok: res.status >= 200 && res.status < 300,
                        status: res.status,
                        headers: res.headers,
                        json: async () => res.body ? JSON.parse(res.body) : null,
                        text: async () => res.body
                    };
                }
                return { ok: false, status: 404 };
            };
        } catch (e) {
            throw e;
        }
    });

    it('Agent can fetch and verify signed truth', async () => {
        const truth = await fetchAgentTruth(USER_URL);
        assert.ok(truth);
        assert.strictEqual(truth.site_name, "Secured Site");
    });

    it('Agent handles intent headers & caching (304)', async () => {
        const cache = new Map();
        // 1. First Fetch
        await fetchAgentTruth(USER_URL, { intent: 'audit', cache });

        const cachedEntry = cache.get(MOCK_URL);
        assert.ok(cachedEntry, "Cache should be populated");

        // 2. Second Fetch (Should use ETag)
        // We rely on the mock/handler interaction. Handler returns 304 if ETag matches.
        const truth2 = await fetchAgentTruth(USER_URL, { cache });
        assert.ok(truth2);
        assert.strictEqual(truth2.site_name, "Secured Site");
    });

});
