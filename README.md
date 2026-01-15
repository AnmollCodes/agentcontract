
# AgentContract

> **The Standard Interface Layer for the Agentic Web.**  
> *Make your website Authoritative, Deterministic, and Verifiable for AI Agents.*

[![NPM Version](https://img.shields.io/npm/v/@anmollcodes/web?color=blue)](https://www.npmjs.com/package/@anmollcodes/web)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://github.com/AnmollCodes/agentcontract/actions/workflows/ci.yml/badge.svg)](https://github.com/AnmollCodes/agentcontract/actions)

---

## 🌍 The Problem: The Web Wasn't Built for Agents

Today, AI agents are trying to "read" a web built for humans. This leads to broken experiences:

*   **Scraping Intelligence**: Agents waste tokens parsing HTML, guessing CSS selectors, and fighting captchas.
*   **Hallucinations**: Without a source of truth, LLMs guess your business hours, prices, or policies.
*   **Security Risks**: A compromised or spoofed site can feed an agent false instructions (Prompt Injection via HTML).
*   **Probabilistic Chaos**: Code is deterministic. Agents are probabilistic. Mixing them creates unreliable software.

**The result?** Agents are blocked, banned, or confused. And site owners have zero control over how they are perceived by AI.

---

## 💡 The Solution: AgentContract

**AgentContract** is not another SEO tool or Schema.org wrapper. It is a **Security-First Protocol** that allows websites to explicitly declare their "Canonical Truth" to AI agents.

Think of it as **`robots.txt` for the 21st century**—but instead of just saying "Allowed/Disallowed", it says:
> *"Here is who I am. Here is my cryptographic signature proving it. Here are the tools I allow you to use."*

### 🔥 Key Unique Features

Unlike basic metadata libraries, **AgentContract** is a full-stack protocol with enterprise-grade features:

1.  **🔐 Cryptographic Trust (Ed25519)**
    *   **The Problem**: Anyone can host a JSON file and claim to be "Bank of America".
    *   **Our Solution**: AgentContract mandates **Ed25519 Signatures**. Agents verify the data integrity before consuming it. If the signature fails, the agent *refuses* to act (Fail-Closed Security).

2.  **⚡ Zero-Shot Tool Generation**
    *   **The Problem**: Teaching an LLM to use your API takes hours of prompt engineering.
    *   **Our Solution**: The SDK automatically converts your `agent.json` definition into **OpenAI Tool Schemas** instantly. An agent can discover your site and start using your tools in milliseconds without prior training.

3.  **🕵️ "Fail-Closed" Security Architecture**
    *   **The Problem**: Downgrade attacks where hackers strip security headers.
    *   **Our Solution**: The SDK detects "Signed Candidates" and enforces strict validation. We never fallback to insecure data if a secure channel was attempted.

4.  **🚀 Performance Optimized**
    *   Supports ETag caching and minimal payload sizes to save LLM context window tokens.

---

## 📦 The Ecosystem

This monorepo publishes the complete suite:

| Package | Description | Who is it for? |
| :--- | :--- | :--- |
| **`@anmollcodes/web`** | Define & serve your `agent.json` truth. | **Website Owners** (Publishers) |
| **`@anmollcodes/agent`** | Discover, verify & consume site truth securely. | **AI/Bot Builders** (Consumers) |
| **`@anmollcodes/core`** | Shared schemas & crypto primitives. | **Protocol Maintainers** |

---

## 🚀 Quickstart

### 1️⃣ For Website Owners (The Publisher)

Stop letting agents guess. Tell them the truth.

**Install:**
```bash
npm install @anmollcodes/web
```

**Implementation (Next.js / Express / Node):**
```typescript
import { defineSite, serveAgent } from '@anmollcodes/web';

// Define your Canonical Truth
const site = defineSite({
  site_name: "Minimoir",
  description: "Luxury minimalist silver jewellery",
  schema_version: "1.0",
  last_updated: new Date().toISOString(),
  endpoints: {
    // Define Real Tools the Agent can use!
    "search_products": {
        url: "/api/products",
        method: "GET",
        description: "Search for jewelry items by keyword",
        parameters: {
            q: { type: "string", description: "Search query (e.g. 'silver ring')" }
        }
    }
  },
  constraints: {
    delivery_available: true
  }
});

// Serve this at GET /.well-known/agent.json
export const GET = serveAgent(site).GET;
```

---

### 2️⃣ For AI Builders (The Consumer)

Build agents that "fail safe" and don't hallucinate.

**Install:**
```bash
npm install @anmollcodes/agent
```

**Usage:**
```typescript
import { fetchAgentTruth } from '@anmollcodes/agent';
import { toOpenAiTools } from '@anmollcodes/agent/adapters';

// 1. Discovery & Verification
// (Automatically fetches, checks signature, and validates schema)
const truth = await fetchAgentTruth('https://minimoir.com');

if (!truth) {
  console.log("Site does not support AgentContract. Falling back to scraping.");
} else {
    // 2. Zero-Shot Integration
    // Instantly convert the site's truth into tools your LLM understands
    const tools = toOpenAiTools(truth);
    
    console.log(`Verified Truth from: ${truth.site_name}`);
    console.log(`Tools Discoverd: ${tools.length}`);
    
    // Pass 'tools' directly to OpenAI/LangChain...
}
```

---

## 🛠️ Developer Tools

We include a CLI to audit any website's AgentContract compliance.

```bash
# Audit a live site
npx @anmollcodes/agent-inspect https://your-website.com
```

**Output:**
```text
🕵️   AGENTCONTRACT INSPECTOR v1.0
target: https://your-website.com
----------------------------------------
✅  DISCOVERY: Found agent.json in 45ms
✅  TRUST:     Signature Verified (Ed25519)
✅  SCHEMA:    Valid (v1.0)

📋  SITE IDENTITY
    Name:      Minimoir
    Updated:   2026-01-15T12:00:00Z

🛠️   AGENT CAPABILITIES
    [FUNCTION] search_products
       └─ Search for jewelry items by keyword
          • q

✨  SCORECARD: 100% AGENT READY
```

---

## 📜 Design Principles

1.  **Deterministic over Probabilistic**: If a feature increases ambiguity, we reject it.
2.  **Intent-Based**: We define *what* can be done, not *how* the page looks.
3.  **Security First**: Cryptography is mandatory for trust, not optional.
4.  **Zero UI Coupling**: This protocol works even if your frontend changes completely.

---

## 📄 License
MIT © [AnmollCodes](https://github.com/AnmollCodes)