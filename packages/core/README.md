# @anmollcodes/core

> **The Cryptographic Bedrock of the AgentContract Protocol.**  
> *Shared logic, Zod Schemas, and Ed25519 Primitives.*

[![NPM Version](https://img.shields.io/npm/v/@anmollcodes/core?color=grey)](https://www.npmjs.com/package/@anmollcodes/core)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](https://github.com/AnmollCodes/agentcontract)

---

## Overview

This package is the low-level foundation for:
1.  **`@anmollcodes/web`** (Publisher SDK)
2.  **`@anmollcodes/agent`** (Consumer SDK)

It contains the **Single Source of Truth** for the protocol specification. Use this if you are building your own implementation of AgentContract in a different language or framework.

---

## Components

### 1. Schemas (Zod)
Defines the strict shape of the Agentic Web.

```typescript
import { SiteTruthSchema, SignedEnvelopeSchema } from '@anmollcodes/core';

// Validate untrusted input
const result = SiteTruthSchema.safeParse(incomingJson);
```

### 2. Cryptography (Ed25519)
Standardized signing and verification logic using WebCrypto API.

```typescript
import { signData, verifyData, generateKeyPair } from '@anmollcodes/core';

// 1. Sign
const signature = await signData(payload, privateKey);

// 2. Verify
const isValid = await verifyData(payload, signature, publicKey);
```

### 3. Canonicalization
Ensures JSON determinism for consistent signatures across platforms.

---

## Installation

```bash
npm install @anmollcodes/core
```

*Note: Most users should install `@anmollcodes/web` or `@anmollcodes/agent` instead.*

---

## Contributing

This protocol is open source. If you want to propose a schema change (e.g. adding new capability types), please open a PR on GitHub.

## License

MIT © [AnmollCodes](https://github.com/AnmollCodes)
