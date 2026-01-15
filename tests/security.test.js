import { test, describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import {
    generateKeyPair,
    exportPrivateKey,
    exportPublicKey,
    signData,
    canonicalize,
    importPrivateKey
} from '../packages/core/dist/index.js';
import { defineSite, serveAgent } from '../packages/web/dist/index.js';
import { fetchAgentTruth } from '../packages/agent/dist/index.js';

// Polyfill Headers
if (!globalThis.Headers) {
    globalThis.Headers = class Headers extends Map {
        set(k, v) { super.set(k.toLowerCase(), v); }
        get(k) { return super.get(k.toLowerCase()); }
        forEach(cb) { super.forEach((v, k) => cb(v, k)); }
    };
}

let mockRequestHandler = async (url) => ({ status: 404 });

// Global Mock
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
    try {
        const res = await mockRequestHandler(url, options);
        return {
            ok: res.status >= 200 && res.status < 300,
            status: res.status,
            headers: new Headers(res.headers || {}),
            json: async () => res.body ? JSON.parse(res.body) : null,
            text: async () => res.body
        };
    } catch (e) {
        console.error("Mock Fetch Error:", e);
        throw e;
    }
};

describe('Security & Hardening Tests', () => {
    let siteKeys, attackerKeys;
    let siteHandler;

    before(async () => {
        const priv = await generateKeyPair();
        siteKeys = {
            privHex: await exportPrivateKey(priv.privateKey),
            pubHex: await exportPublicKey(priv.publicKey)
        };

        const att = await generateKeyPair();
        attackerKeys = {
            privHex: await exportPrivateKey(att.privateKey),
        };

        const site = defineSite({
            site_name: "Bank of Agents",
            description: "Secure Test Agent",
            schema_version: "1.0",
            last_updated: new Date().toISOString(),
            privateKey: siteKeys.privHex,
            publicKey: siteKeys.pubHex
        });
        siteHandler = serveAgent(site);
    });

    after(() => {
        globalThis.fetch = originalFetch;
    });

    it('Security violation when signature is invalid', async () => {
        mockRequestHandler = async () => {
            const valid = await siteHandler.GET();
            const body = JSON.parse(valid.body);

            // TAMPER
            body.payload.site_name = "HACKED";

            return { status: 200, body: JSON.stringify(body) };
        };

        await assert.rejects(
            async () => await fetchAgentTruth("http://test.com"),
            /Security Violation/
        );
    });

    it('Security violation when signed by wrong key', async () => {
        mockRequestHandler = async () => {
            const valid = await siteHandler.GET();
            const body = JSON.parse(valid.body);

            // Re-sign with ATTACKER key
            const attackerPriv = await importPrivateKey(attackerKeys.privHex);
            body.signature = await signData(body.payload, attackerPriv);

            return { status: 200, body: JSON.stringify(body) };
        };

        await assert.rejects(
            async () => await fetchAgentTruth("http://test.com"),
            /Security Violation/
        );
    });
});
