import {
  canonicalize,
  importPrivateKey,
  signData,
  SiteTruth,
  AgentIntent,
  AgentIntentSchema,
  CURRENT_SCHEMA_VERSION,
  SUPPORTED_SCHEMA_VERSIONS
} from '@anmollcodes/core';
import { createHash } from 'node:crypto';
import { SiteConfig } from './defineSite.js';

export function serveAgent(site: SiteConfig) {
  return {
    GET: async (req?: { headers?: Record<string, string | undefined> }) => {
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.set('X-Agent-Protocol-Version', CURRENT_SCHEMA_VERSION);

      // Normalize incoming headers
      const incomingHeaders: Record<string, string | undefined> = {};
      if (req?.headers) {
        Object.keys(req.headers).forEach(k => {
          incomingHeaders[k.toLowerCase()] = req.headers![k];
        });
      }

      // 1. Intent Validation
      const intentHeader = incomingHeaders['x-agent-intent'];
      let intent: AgentIntent = 'discovery';

      if (intentHeader) {
        const parsed = AgentIntentSchema.safeParse(intentHeader);
        if (parsed.success) {
          intent = parsed.data;
        } else {
          headers.set('X-Agent-Warning', 'Invalid Intent');
        }
      } // else default to discovery

      headers.set('X-Agent-Intent-Reflected', intent);

      // 2. Prepare Payload
      // We strip sensitive keys from the output
      const { privateKey, publicKey, ...rest } = site;

      // Construct the canonical payload
      const payload: SiteTruth = {
        ...rest,
        schema_version: rest.schema_version || CURRENT_SCHEMA_VERSION,
        supported_versions: SUPPORTED_SCHEMA_VERSIONS || [CURRENT_SCHEMA_VERSION]
      };

      // 3. ETag generation (Change Detection)
      const jsonPayload = canonicalize(payload);
      const hash = createHash('sha256').update(jsonPayload).digest('base64');
      const etag = `"${hash.substring(0, 16)}"`;
      headers.set('ETag', etag);

      // Conditional Request
      if (incomingHeaders['if-none-match'] === etag) {
        return { status: 304, headers, body: '' };
      }

      // 4. Cryptographic Envelope (Signing)
      if (privateKey) {
        try {
          if (!publicKey) {
            throw new Error("Configuration Error: publicKey is required when privateKey is present.");
          }
          const pKey = await importPrivateKey(privateKey);
          const signature = await signData(payload, pKey);

          const envelope = {
            version: 1,
            algorithm: 'ed25519',
            public_key: publicKey,
            signature,
            payload
          };

          return { status: 200, headers, body: JSON.stringify(envelope) };
        } catch (e: any) {
          const errorBody = JSON.stringify({ error: "Internal Signing Error", details: e.message });
          return { status: 500, headers, body: errorBody };
        }
      }

      // Return unsigned if no keys provided (User choice, though Protocol prefers signed)
      return { status: 200, headers, body: jsonPayload };
    }
  };
}
