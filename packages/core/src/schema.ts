import { z } from 'zod';

// Feature 1: Schema Versioning
export const CURRENT_SCHEMA_VERSION = "1.0";
export const SUPPORTED_SCHEMA_VERSIONS = ["1.0", "0.1"];

// Feature 4: Agent Intent Declaration
export const AgentIntentSchema = z.enum([
    'read',
    'book',
    'purchase',
    'support',
    'audit',
    'discovery' // Implicit default
]);

export type AgentIntent = z.infer<typeof AgentIntentSchema>;

// Basic Constraints
export const SiteConstraintsSchema = z.object({
    delivery_available: z.boolean().optional(),
    booking_available: z.boolean().optional(),
    authentication_required: z.boolean().optional(),
    robots_allowed: z.boolean().optional(), // standard robots.txt mirror
}).catchall(z.unknown()); // Allow extensibility

// Feature: Actionable Endpoints (Tools)
export const ActionParameterSchema = z.object({
    type: z.enum(['string', 'number', 'boolean']),
    description: z.string(),
    required: z.boolean().default(true)
});

export const AgentActionSchema = z.object({
    url: z.string(), // The actual endpoint
    method: z.enum(['GET', 'POST']).default('GET'),
    description: z.string().optional(), // What this action does
    parameters: z.record(ActionParameterSchema).optional() // { query: { type: 'string' ... } }
});

// Allow either simple string URLs (legacy/simple) or full Action definitions
export const SiteEndpointsSchema = z.record(
    z.union([z.string(), AgentActionSchema])
);

// The Payload (The "Truth")
export const SiteTruthSchema = z.object({
    site_name: z.string(),
    description: z.string(),
    schema_version: z.string(),
    supported_versions: z.array(z.string()).optional(),
    last_updated: z.string().datetime(), // Feature 3: Change detection
    endpoints: SiteEndpointsSchema.optional(),
    constraints: SiteConstraintsSchema.optional(),
    // Permission layers could be defined here
    metadata: z.record(z.unknown()).optional()
});

export type SiteTruth = z.infer<typeof SiteTruthSchema>;

// Feature 2: Cryptographic Trust (The Envelope)
export const SignedEnvelopeSchema = z.object({
    version: z.literal(1), // Envelope version
    algorithm: z.enum(['ed25519']),
    public_key: z.string(), // Hex string
    signature: z.string(), // Hex signature of the JSON stringified payload
    payload: SiteTruthSchema
});

export type SignedEnvelope = z.infer<typeof SignedEnvelopeSchema>;
