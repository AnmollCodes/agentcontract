import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import {
    SiteTruthSchema,
    generateKeyPair,
    signData,
    verifyData,
    canonicalize
} from '../packages/core/dist/index.js';

describe('Core Package', () => {

    it('Schema strictly validates SiteTruth', () => {
        const valid = {
            schema_version: "1.0",
            site_name: "Test Site",
            description: "Testing",
            last_updated: new Date().toISOString()
        };

        const result = SiteTruthSchema.safeParse(valid);
        assert.strictEqual(result.success, true);

        const invalid = { site_name: "Missing things" };
        const res2 = SiteTruthSchema.safeParse(invalid);
        assert.strictEqual(res2.success, false);
    });

    it('Crypto Sign/Verify works', async () => {
        const { privateKey, publicKey } = await generateKeyPair();
        const payload = { hello: "world", nested: { a: 1 } };

        // Sign
        const signature = await signData(payload, privateKey);
        assert.ok(signature.length > 0);

        // Verify
        const isValid = await verifyData(payload, signature, publicKey);
        assert.strictEqual(isValid, true);

        // Tamper
        const isValid2 = await verifyData({ ...payload, hello: "hacker" }, signature, publicKey);
        assert.strictEqual(isValid2, false);
    });

    it('Canonicalization is deterministic', () => {
        const a = { x: 1, y: 2 };
        const b = { y: 2, x: 1 };
        assert.strictEqual(canonicalize(a), canonicalize(b));
    });

});
