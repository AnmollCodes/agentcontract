# AgentContract Protocol Specification v1.0

## Abstract
AgentContract defines a standard mechanism for websites to expose authoritative, structured, and cryptographically verifiable information to AI agents. It prioritizes deterministic discovery, intent-based negotiation, and efficient caching.

## 1. Discovery
Agents MUST first attempt to retrieve the canonical truth from:
`GET /.well-known/agent.json`

## 2. The Truth Object
The core payload is a JSON object conforming to the `SiteTruth` schema.

```json
{
  "schema_version": "1.0",
  "site_name": "Example Corp",
  "description": "API documentation and support.",
  "last_updated": "2025-10-01T12:00:00Z",
  "endpoints": { ... },
  "constraints": { ... }
}
```

## 3. Cryptographic Envelope (Trust)
To prevent tampering and ensure authenticity, the Truth Object SHOULD be wrapped in a signed envelope.

```json
{
  "version": 1,
  "algorithm": "ed25519",
  "public_key": "hex_encoded_public_key",
  "signature": "hex_encoded_signature",
  "payload": { ... }
}
```
**Verification Logic:**
1. Agent parses JSON.
2. If envelope fields present:
   a. Extract `payload` and `signature`.
   b. Canonicalize `payload` (deterministic JSON stringify).
   c. specific `public_key` verifies `signature` against `canonical_payload`.

## 4. Headers & Intent
Agents MUST include:
*   `X-Agent-Protocol-Version`: declaring client version.
*   `X-Agent-Intent`: declaring specific intent (`discovery`, `book`, `audit`, etc.).

Websites MAY use Intent to:
*   Rate limit specific actions.
*   Filter sensitive internal endpoints.
*   Provide tailored "truth" subsets.

## 5. Caching
Standard HTTP Caching (ETags) is mandated.
*   Server computes hash of Canonical Payload.
*   Returns `ETag`.
*   Agent sends `If-None-Match`.
*   Server returns `304 Not Modified` if match.

## 6. Versioning
*   `schema_version`: Defined in payload.
*   `supported_versions`: Array of other versions supported by the site.
*   Agents choose the highest version they understand.
