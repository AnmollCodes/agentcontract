#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { SiteTruthSchema } from '@anmollcodes/core';

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command !== 'lint') {
        console.log('Usage: agentcontract-lint lint <file.json>');
        process.exit(1);
    }

    const file = args[1];
    if (!file) {
        console.error('Error: No file specified.');
        process.exit(1);
    }

    try {
        const content = readFileSync(file, 'utf-8');
        const json = JSON.parse(content);

        // Validate
        const result = SiteTruthSchema.safeParse(json);

        if (!result.success) {
            console.error('❌ Validation Failed:');
            result.error.errors.forEach(e => {
                console.error(` - Path: ${e.path.join('.')} | Error: ${e.message}`);
            });
            process.exit(1);
        } else {
            console.log('✅ Site Truth is VALID.');
            process.exit(0);
        }

    } catch (error: any) {
        console.error(`❌ Error reading or parsing file: ${error.message}`);
        process.exit(1);
    }
}

main();
