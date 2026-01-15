import { webcrypto } from 'node:crypto';
import { TextEncoder, TextDecoder } from 'node:util';

const encoder = new TextEncoder();

// Deterministic JSON stringify by sorting keys
export function canonicalize(value: any): string {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return '[' + value.map(canonicalize).join(',') + ']';
    }

    const keys = Object.keys(value).sort();
    const pairStrings = keys.map((key) => {
        return JSON.stringify(key) + ':' + canonicalize(value[key]);
    });

    return '{' + pairStrings.join(',') + '}';
}

// Convert hex to Uint8Array
function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
}

// Convert Uint8Array to hex
function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Generate Ed25519 KeyPair
export async function generateKeyPair() {
    const pair = await webcrypto.subtle.generateKey(
        {
            name: 'Ed25519',
        },
        true,
        ['sign', 'verify']
    ) as CryptoKeyPair;

    return { privateKey: pair.privateKey, publicKey: pair.publicKey };
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
    const exported = await webcrypto.subtle.exportKey('pkcs8', key);
    return bytesToHex(new Uint8Array(exported));
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
    // raw is usually supported for Ed25519 public keys
    const exported = await webcrypto.subtle.exportKey('raw', key);
    return bytesToHex(new Uint8Array(exported));
}

export async function importPublicKey(hex: string): Promise<CryptoKey> {
    return webcrypto.subtle.importKey(
        'raw',
        hexToBytes(hex),
        { name: 'Ed25519' },
        true,
        ['verify']
    );
}

export async function importPrivateKey(hex: string): Promise<CryptoKey> {
    return webcrypto.subtle.importKey(
        'pkcs8',
        hexToBytes(hex),
        { name: 'Ed25519' },
        true,
        ['sign']
    );
}

// Sign data
export async function signData(payload: any, privateKey: CryptoKey): Promise<string> {
    const data = canonicalize(payload);
    const signature = await webcrypto.subtle.sign(
        { name: 'Ed25519' },
        privateKey,
        encoder.encode(data)
    );
    return bytesToHex(new Uint8Array(signature));
}

// Verify data
export async function verifyData(payload: any, signatureHex: string, publicKey: CryptoKey): Promise<boolean> {
    const data = canonicalize(payload);
    return webcrypto.subtle.verify(
        { name: 'Ed25519' },
        publicKey,
        hexToBytes(signatureHex),
        encoder.encode(data)
    );
}
