import { SiteTruth, SiteTruthSchema } from '@anmollcodes/core';

export interface SiteConfig extends SiteTruth {
    // Optional private key for signing the response
    // If provided, serveAgent will generate a signed envelope.
    privateKey?: string;
    publicKey?: string;
}

/**
 * Define the authoritative truth for the website.
 * Validates the configuration against the core schema.
 */
export function defineSite(config: SiteConfig): SiteConfig {
    // Validate the public truth part
    const publicTruth = { ...config };
    delete (publicTruth as any).privateKey;

    const result = SiteTruthSchema.safeParse(publicTruth);

    if (!result.success) {
        const errorMessages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`[AgentContract] Invalid Site Configuration: ${errorMessages}`);
    }

    return config;
}
