import { fetchAgentTruth, adapters } from '@anmollcodes/agent';

async function main() {
    const targetUrl = "https://cloudscale.io";

    console.log(`🤖 Agent connecting to ${targetUrl}...`);

    // 1. Fetch Canonical Truth
    // Intent: We are auditing the site for capabilities
    const truth = await fetchAgentTruth(targetUrl, {
        intent: 'audit'
    });

    if (!truth) {
        console.error("❌ Failed to connect to Agent Interface.");
        process.exit(1);
    }

    // 2. Process Truth
    console.log(`✅ Verified Connection to: ${truth.site_name}`);
    console.log(`   Last Updated: ${truth.last_updated}`);

    if (truth.constraints?.authentication_required) {
        console.log("🔒 Site requires authentication. Preparing credentials...");
    }

    // 3. Convert to LLM Context
    const systemPrompt = adapters.toSystemContext(truth);
    console.log("\n--- SYSTEM PROMPT GENERATED ---\n");
    console.log(systemPrompt);

    // 4. (Optional) Check specific endpoints
    if (truth.endpoints?.pricing) {
        console.log(`\n💰 Pricing data available at: ${truth.endpoints.pricing}`);
        // fetch(truth.endpoints.pricing)...
    }
}

main();
