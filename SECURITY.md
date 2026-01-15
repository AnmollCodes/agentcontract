# Security Model & Threat Assessment

## Trust Model
AgentContract operates on a **Trust On First Use (TOFU)** or **DNS-Rooted Trust** model.
The strict binding is:
1.  TLS Certificate verifies domain ownership during discovery.
2.  `agent.json` is fetched from that secured domain.
3.  The `agent.json` contains an Ed25519 Public Key.
4.  The Content is signed by the corresponding Private Key.

This ensures that even if the JSON is cached by an intermediary or mirrored (e.g. via CDN or RAG pipeline), its integrity can be verified against the embedded public key, and the public key's authority is derived from the original SSL fetch.

## Cryptography
*   **Algorithm**: Ed25519 (Edwards-curve Digital Signature Algorithm).
*   **Performance**: High-speed signing/verifying suitable for real-time web requests.
*   **Security Level**: ~128-bit security (comparable to RSA 3072-bit).

## Attack Vectors & Mitigations

### 1. Mitm / Tampering
*   *Risk*: Attacker intercepts JSON and modifies endpoints to phishing URLs.
*   *Mitigation*: Signature verification fails. Agent drops payload. "Fail-closed".

### 2. Replay Attacks
*   *Risk*: Attacker serves an old, valid `agent.json` (e.g., claiming "in stock").
*   *Mitigation*: `last_updated` field MUST be checked against current time windows (Agent policy). HTTPS (TLS) prevents network-level replay.

### 3. Intent Spoofing
*   *Risk*: Malicious bot claims `audit` intent to bypass rate limits.
*   *Mitigation*: Intent is a declarative signal, not a security gate. Sensitive actions must still be authenticated via standard auth protocols (OAuth, etc) defined in `endpoints`.

## Recommendations for Implementers
*   Rotate keys periodically.
*   Never commit private keys to code. Use environment variables.
*   Use `agentcontract-lint` in CI/CD pipelines to prevent malformed updates.
