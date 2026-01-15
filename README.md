# AgentContract

> **The Standard Interface Layer for the Agentic Web.**  
> Make your website authoritative, deterministic, and verifyable for AI Agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)

## What is AgentContract?

AgentContract is a protocol and SDK suite that allows websites to expose a **Canonical Truth Object** to AI agents. 
Instead of forcing agents to scrape HTML, guess intentions, or hallucinate outdated data, AgentContract provides a cryptographic, typed, and versioned channel for site owners to declare:
- **Identity & Authority** (Who are you?)
- **Capabilities** (What can an agent do here?)
- **Constraints** (What are the rules?)

## ✨ Features

- **🔐 Cryptographic Trust**: Ed25519 signatures ensure agents only trust verified data.
- **⚡ Zero-Shot Tools**: Automatically generates OpenAI Function Definitions from your API config.
- **🕵️ Agent Inspector**: CLI tool to visualize how agents see your site.
- **🚀 Performance**: ETag caching and optimized JSON schemas.

## 📦 Packages

*   **`@anmollcodes/core`**: Shared schemas, types, and Ed25519 cryptographic primitives.
*   **`@anmollcodes/web`**: SDK for website owners to define and serve `agent.json`.
*   **`@anmollcodes/agent`**: SDK for AI builders to discover, verify, and consume site truth.

## 🚀 Quickstart

### For Website Owners (Publisher)

1.  **Install**
    ```bash
    npm install @anmollcodes/web
    ```

2.  **Define your Site Truth**
    ```typescript
    import { defineSite, serveAgent } from '@anmollcodes/web';

    const site = defineSite({
      site_name: "Acme Corp",
      description: "We sell anvils.",
      schema_version: "1.0",
      last_updated: new Date().toISOString(),
      // Define Actions that map to your API
      endpoints: {
          "search_products": {
              url: "/api/products",
              method: "GET",
              parameters: {
                  q: { type: "string", description: "Search query" }
              }
          }
      }
    });

    // Serve this via your favorite framework (Next.js, Express, etc)
    export const GET = serveAgent(site).GET;
    ```

### For Agent Builders (Consumer)

1.  **Install**
    ```bash
    npm install @anmollcodes/agent
    ```

2.  **Fetch & Auto-Generate Tools**
    ```typescript
    import { fetchAgentTruth } from '@anmollcodes/agent';
    import { toOpenAiTools } from '@anmollcodes/agent/adapters';

    const truth = await fetchAgentTruth('https://acme.com');

    if (truth) {
      // Instantly give your LLM the ability to use this site
      const tools = toOpenAiTools(truth);
      console.log(tools); 
    }
    ```

## 🛠️ Tools

**Agent Inspector CLI**:
Audit any website's agent compatibility.
```bash
npx agentcontract-inspect https://example.com
```

## 📜 Protocol & Security

AgentContract is based on the **Agent-Readable Web Protocol**.
- See [PROTOCOL.md](./PROTOCOL.md) for the full specification.
- See [SECURITY.md](./SECURITY.md) for the threat model.

## License

MIT