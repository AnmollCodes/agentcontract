import { defineSite, serveAgent } from '@anmollcodes/web';

// Simulated environment variables
const SITE_PVT_KEY = process.env.SITE_PRIVATE_KEY_HEX;
const SITE_PUB_KEY = process.env.SITE_PUBLIC_KEY_HEX;

const saasConfig = defineSite({
    schema_version: "1.0",
    site_name: "CloudScale.io",
    description: "Enterprise autoscaling layout for cloud infrastructure.",
    last_updated: new Date().toISOString(),

    // Security definitions
    privateKey: SITE_PVT_KEY,
    publicKey: SITE_PUB_KEY,

    // Constraints required for Agents
    constraints: {
        authentication_required: true,
        booking_available: false, // Sales only via call
        robots_allowed: true,
    },

    // Authoritative Endpoints
    endpoints: {
        "status": "/api/v1/system/status",
        "pricing": "/api/v1/public/pricing.json",
        "docs": "/docs/agent-index.json"
    },

    // Additional metadata
    metadata: {
        "support_email": "agents@cloudscale.io",
        "rate_limit": "100 req/min"
    }
});

// Create the Handler
const agentHandler = serveAgent(saasConfig);

// Example: Next.js API Route / Express Handler
export async function GET(req: Request) {
    // Convert framework request to AgentKit request
    const headers: Record<string, string> = {};
    req.headers.forEach((v, k) => (headers[k] = v));

    const response = await agentHandler.GET({ headers });

    return new Response(response.body, {
        status: response.status,
        headers: response.headers as any
    });
}
