import {
    SiteTruth,
    SiteTruthSchema,
    SignedEnvelopeSchema,
    importPublicKey,
    verifyData,
    AgentIntent,
} from '@anmollcodes/core';

export interface FetchOptions {
    intent?: AgentIntent;
    cache?: Map<string, { etag: string, data: SiteTruth }>;
    timeout?: number;
}

export async function fetchAgentTruth(url: string, options: FetchOptions = {}): Promise<SiteTruth | null> {
    const targetUrl = new URL(url);
    // If user passed root URL, append known path. If specific path passed, keep it.
    if (!targetUrl.pathname.endsWith('agent.json')) {
        targetUrl.pathname = targetUrl.pathname.replace(/\/?$/, '/.well-known/agent.json');
    }

    const { intent = 'discovery', cache, timeout = 5000 } = options;
    const headers: Record<string, string> = {
        'X-Agent-Intent': intent,
        'Accept': 'application/json'
    };

    const cachedResult = cache?.get(targetUrl.toString());
    if (cachedResult) {
        headers['If-None-Match'] = cachedResult.etag;
    }

    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(targetUrl.toString(), {
                headers,
                signal: controller.signal
            });
            clearTimeout(id);

            if (response.status === 304 && cachedResult) {
                return cachedResult.data;
            }

            if (!response.ok) {
                // 404 or other error
                return null;
            }

            const rawBody = await response.json();

            // HEURISTIC: Strict Fail-Closed for Signed Envelopes.
            // If the response LOOKS like a signed envelope (has signature or public_key fields),
            // we MUST validate it as one. We DO NOT fallback to unsigned.
            // This prevents Downgrade Attacks where a bad signature forces a fallback to unsigned interpretation.
            const isSignedCandidate = (typeof rawBody === 'object' && rawBody !== null) &&
                ('signature' in rawBody || 'public_key' in rawBody);

            if (isSignedCandidate) {
                const envelopeResult = SignedEnvelopeSchema.safeParse(rawBody);

                if (!envelopeResult.success) {
                    // The user ATTEMPTED to send a signed envelope but failed schema.
                    // This is a security violation/configuration error.
                    // We do NOT accept this as "Unsigned Truth" even if the payload looks like truth.
                    throw new Error(`Security Violation: Malformed Signed Envelope. ${JSON.stringify(envelopeResult.error)}`);
                }

                const envelope = envelopeResult.data;
                const key = await importPublicKey(envelope.public_key);

                const isValid = await verifyData(envelope.payload, envelope.signature, key);

                if (!isValid) {
                    throw new Error("Security Violation: Invalid Signature");
                }

                // Update Cache
                const etag = response.headers.get('ETag');
                if (cache && etag) {
                    cache.set(targetUrl.toString(), { etag, data: envelope.payload });
                }

                return envelope.payload;
            }

            // 2. Try Raw Truth (Unsigned)
            const plainResult = SiteTruthSchema.safeParse(rawBody);

            if (plainResult.success) {
                return plainResult.data;
            }

            throw new Error("Invalid Schema: Response matched neither Signed Envelope nor Site Truth.");

        } catch (innerError) {
            clearTimeout(id);
            throw innerError;
        }

    } catch (error) {
        console.error(`[AgentContract] Error fetching ${targetUrl}:`, error);
        throw error;
    }
}
