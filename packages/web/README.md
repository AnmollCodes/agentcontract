# @anmollcodes/web

> **Make Your Website Agent-Ready.**  
> *The official Publisher SDK for the AgentContract Protocol.*

[![NPM Version](https://img.shields.io/npm/v/@anmollcodes/web?color=blue)](https://www.npmjs.com/package/@anmollcodes/web)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-green.svg)](https://www.typescriptlang.org/)

---

## The Problem
AI Agents (ChatGPT, Claude, Autonomous Bots) are trying to read your website.
*   They scrape your HTML, which is slow and fragile.
*   They hallucinate prices and policies, creating brand risk.
*   They ignore constraints you might want to enforce.

## The Solution
**Don't let AI guess. Tell them the truth.**

`@anmollcodes/web` allows you to expose a **Cryptographically Signed "Agent Truth"** file (`agent.json`). 
It turns your static website into a structured, verifiable API that agents prefer over your competitors.

---

## Features

*   **Simple Config**: Define your site's identity, capabilities, and tools in one JSON object.
*   **Automatic Signing**: We handle the Ed25519 cryptography. You just provide the keys.
*   **Type-Safe**: Built with strict Zod schemas to ensure your data is always valid.
*   **Framework Agnostic**: Works with Next.js, Express, Node.js, or static files.

---

## Installation

```bash
npm install @anmollcodes/web
```

---

## Usage (Next.js Example)

Create a route handler at `app/.well-known/agent.json/route.ts`:

```typescript
import { defineSite, serveAgent } from '@anmollcodes/web';

// 1. Define your Truth
const site = defineSite({
  site_name: "My Brand",
  description: "The official source for high-end widgets.",
  schema_version: "1.0",
  last_updated: new Date().toISOString(),
  endpoints: {
    // These become "Tools" for the AI instantly!
    "check_inventory": {
        url: "/api/inventory",
        method: "GET",
        description: "Check stock levels for a product SKU",
        parameters: {
            sku: { type: "string", description: "The product SKU" }
        }
    }
  },
  constraints: {
    robots_allowed: true,
    booking_available: false
  }
});

// 2. Serve it (We handle headers, signing, and validation)
export const GET = serveAgent(site).GET;
```

---

## Why Agents Will Love You
1.  **Deterministic**: They get JSON, not HTML soup.
2.  **Verified**: They know this data is officially from YOU (thanks to the signature).
3.  **Fast**: No complex parsing required.

## License
MIT © [AnmollCodes](https://github.com/AnmollCodes)
