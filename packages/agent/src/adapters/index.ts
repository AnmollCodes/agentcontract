import { SiteTruth } from '@anmollcodes/core';

/**
 * Convert SiteTruth into a Markdown formatted system prompt/context.
 * Ideal for pasting into LLM context window.
 */
export function toSystemContext(truth: SiteTruth): string {
    return [
        `# AGI CONNECTION: ${truth.site_name}`,
        `> ${truth.description}`,
        '',
        '## 🛑 Constraints (MUST RESPECT)',
        '```json',
        JSON.stringify(truth.constraints || {}, null, 2),
        '```',
        '',
        '## 🔗 Capabilities & Endpoints',
        '```json',
        JSON.stringify(truth.endpoints || {}, null, 2),
        '```',
        '',
        `Metadata: Schema v${truth.schema_version}`
    ].join('\n');
}

/**
 * Create an OpenAI Function Definition for retrieving dynamic data IF the site exposes it.
 * (Placeholder for future dynamic tool generation based on schema)
 */
/**
 * GENERATE UNIVERSAL TOOLS
 * 
 * Automatically converts the Site Truth's endpoints into OpenAI-compatible 
 * Function Definitions. This allows an Agent to intuitively understand *how* 
 * to use the website's APIs without manual coding.
 */
export function toOpenAiTools(truth: SiteTruth) {
    if (!truth.endpoints) return [];

    return Object.entries(truth.endpoints).map(([name, definition]) => {
        // Handle Legacy/Simple String Endpoints
        if (typeof definition === 'string') {
            return {
                type: "function",
                function: {
                    name: `visit_${name}`,
                    description: `Navigate to ${name} page (URL: ${definition})`,
                    parameters: { type: "object", properties: {} }
                }
            };
        }

        // Handle Advanced Actionable Endpoints
        const parameters: Record<string, any> = {
            type: "object",
            properties: {},
            required: []
        };

        if (definition.parameters) {
            Object.entries(definition.parameters).forEach(([paramName, paramConfig]) => {
                parameters.properties[paramName] = {
                    type: paramConfig.type,
                    description: paramConfig.description
                };
                if (paramConfig.required !== false) { // Default to true
                    parameters.required.push(paramName);
                }
            });
        }

        return {
            type: "function",
            function: {
                name: name, // e.g. "search_products"
                description: definition.description || `Execute ${name} action on ${truth.site_name}`,
                parameters: parameters
            }
        };
    });
}
