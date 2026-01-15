import {
    generateKeyPair,
    exportPrivateKey,
    exportPublicKey,
    signData,
    verifyData,
    importPrivateKey,
    importPublicKey
} from './packages/core/dist/index.js';

async function run() {
    console.log("Generating keys...");
    const keys = await generateKeyPair();
    const privHex = await exportPrivateKey(keys.privateKey);
    const pubHex = await exportPublicKey(keys.publicKey);

    const payload = { site_name: "Original", description: "Safe" };
    console.log("Signing payload:", JSON.stringify(payload));

    // Sign
    const pKey = await importPrivateKey(privHex);
    const signature = await signData(payload, pKey);
    console.log("Signature:", signature);

    // Verify Legit
    const pubKey = await importPublicKey(pubHex);
    const valid = await verifyData(payload, signature, pubKey);
    console.log("Legit Verify:", valid);

    // Verify Tampered
    const tamperedPayload = { ...payload, site_name: "HACKED" };
    console.log("Verifying Tampered:", JSON.stringify(tamperedPayload));

    const validTampered = await verifyData(tamperedPayload, signature, pubKey);
    console.log("Tampered Verify:", validTampered);

    if (validTampered === true) {
        console.error("CRITICAL SECURITY FAILURE: Tampered payload verified as valid!");
        process.exit(1);
    } else {
        console.log("SUCCESS: Tampered payload rejected.");
    }
}

run();
