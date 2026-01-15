import { createServer } from 'http';
import { defineSite, serveAgent } from '../packages/web/dist/index.js';
import { fetchAgentTruth } from '../packages/agent/dist/index.js';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// 1. Setup the Site Configuration (Publisher side)
const siteConfig = defineSite({
  schema_version: "1.0",
  site_name: "My Site",
  description: "A demo site for AgentContract",
  last_updated: new Date().toISOString(),
  endpoints: {
    "search": "/search?q={q}"
  },
  constraints: {
    delivery_available: true
  }
});

const agentHandler = serveAgent(siteConfig);

// 2. Start a simple HTTP server to serve the agent.json
const server = createServer(async (req, res) => {
  // Handle the well-known URL
  if (req.url === '/.well-known/agent.json') {
    // Adapter for incoming headers
    const reqHeaders = {};
    if (req.headers) {
      Object.entries(req.headers).forEach(([k, v]) => {
        if (typeof v === 'string') reqHeaders[k] = v;
      });
    }

    const response = await agentHandler.GET({ headers: reqHeaders });
    const headers = {};

    // response.headers is a Web Headers object
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // body is already a string
    res.writeHead(response.status, headers);
    res.end(response.body);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, async () => {
  console.log(`[Server] Listening on ${BASE_URL}`);

  try {
    // 3. Simulate an Agent fetching the truth (Consumer side)
    console.log(`[Agent] Fetching truth from ${BASE_URL}...`);
    // Need global fetch for the agent SDK if running in Node < 18
    if (!globalThis.fetch) {
      console.warn("Global fetch invalid - skipping agent fetch demo in this environment");
    } else {
      const truth = await fetchAgentTruth(BASE_URL);

      console.log('\n[Agent] Successfully fetched agent truth:');
      console.log(`       Name: ${truth.site_name}`);

      // WOW FACTOR: Generate tools immediately
      console.log('\n[Agent] 🪄  Generating Zero-Shot AI Tools...');
      const tools = await import('../packages/agent/dist/adapters/index.js').then(m => m.toOpenAiTools(truth));

      console.log(JSON.stringify(tools, null, 2));
      console.log('\n[Agent] Ready to be used by OpenAI/LangChain!');
    }

  } catch (error) {
    console.error('[Agent] Error fetching truth:', error);
  } finally {
    server.close();
    console.log('[Server] Closed.');
  }
});
