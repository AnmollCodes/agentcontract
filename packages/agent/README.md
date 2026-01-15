# @anmollcodes/agent

> **The Safe Way for AI Agents to Consume the Web.**  
> *The official Consumer SDK for the AgentContract Protocol.*

[![NPM Version](https://img.shields.io/npm/v/@anmollcodes/agent?color=red)](https://www.npmjs.com/package/@anmollcodes/agent)
[![Security](https://img.shields.io/badge/Security-Fail--Closed-red.svg)](https://github.com/AnmollCodes/agentcontract)

---

## The Problem
Building AI Agents is hard:
*   **Scraping is flaky**: Site layouts change, breaking your bot.
*   **Data is untrusted**: How do you know the "price" you scraped wasn't injected by a 3rd party?
*   **Tooling is manual**: You have to manually write "Function Configurations" for every API you want your agent to use.

## The Solution
**@anmollcodes/agent** is the "Browser" for the Agentic Web. 
It discovers, verifies, and ingests structured data from websites that support the **AgentContract** protocol.

---

## Features

*   **Automatic Discovery**: Finds `/.well-known/agent.json` automatically.
*   **Fail-Closed Security**: Verifies Ed25519 signatures. If the data is tampered with, we reject it. Zero compromises.
*   **Zero-Shot Tools**: Automatically converts the remote site's API into **OpenAI Tool Definitions** ready for `gpt-4`.
*   **Anti-Hallucination**: gives your LLM "Canonical Truth" instead of probability.

---

## Installation

```bash
npm install @anmollcodes/agent
```

---

## Usage

### 1. Fetch & Verify
Don't just `fetch()`. Verify authority.

```typescript
import { fetchAgentTruth } from '@anmollcodes/agent';

// This performs: DNS check + Schema Validation + Crypto Signature Verification
const truth = await fetchAgentTruth('https://example.com');

if (!truth) {
    console.log("This site is not agent-ready.");
    return;
}

console.log(`Connected to: ${truth.site_name}`);
console.log(`Trust verified: Valid`);
```

### 2. Generate AI Tools (The Magic Part)

Connect any "AgentContract" website to OpenAI in 1 line of code.

```typescript
import { toOpenAiTools } from '@anmollcodes/agent/adapters';

const tools = toOpenAiTools(truth);

// Pass directly to OpenAI!
const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: "Check inventory for SKU-123" }],
    tools: tools, // <--- Instant capability!
});
```

---

## Security Guarantee
This SDK implements a **Strict Fail-Closed** policy. 
If a site presents partial security headers but fails signature verification, this SDK throws a `SecurityViolation`. We do not allow downgrade attacks.

## License
MIT © [AnmollCodes](https://github.com/AnmollCodes)
