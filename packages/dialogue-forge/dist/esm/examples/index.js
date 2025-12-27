/**
 * Unified Examples System
 *
 * All examples are stored as Yarn files and loaded through the registry system.
 * This provides a single, organized way to discover and load examples.
 *
 * Structure:
 * - examples-registry.ts: Metadata about all examples (titles, descriptions, features)
 * - yarn-examples.ts: Actual Yarn file contents (all examples as Yarn strings)
 * - legacy-examples.ts: Old TypeScript examples (being migrated to Yarn format)
 * - index.ts: Public API for loading examples (this file)
 */
// New unified system exports
export { examplesRegistry, exampleFlagSchemas, getExampleMetadata, listExampleIds, getExampleFlagSchema, listFlagSchemaIds } from './examples-registry';
import { getExampleDialogue as getYarnExampleDialogue } from './yarn-examples';
import { listExampleIds, listFlagSchemaIds, getExampleFlagSchema } from './examples-registry';
// Export character examples
export { exampleCharacters, getExampleCharacters, getExampleCharacter, listExampleCharacterIds, } from './example-characters';
import { exampleDialogues as legacyExamples, demoFlagSchemas as legacySchemas } from './legacy-examples';
// Export legacy examples - these work alongside the new Yarn examples
export const exampleDialogues = legacyExamples;
export const demoFlagSchemas = legacySchemas;
export function listExamples() {
    // Combine both Yarn examples and legacy examples
    const yarnIds = listExampleIds();
    const legacyIds = Object.keys(legacyExamples);
    return [...new Set([...yarnIds, ...legacyIds])];
}
export function listDemoFlagSchemas() {
    // Combine both systems
    const yarnIds = listFlagSchemaIds();
    const legacyIds = Object.keys(legacySchemas);
    return [...new Set([...yarnIds, ...legacyIds])];
}
export function getExampleDialogue(name) {
    // Try new Yarn system first
    const yarnDialogue = getYarnExampleDialogue(name);
    if (yarnDialogue) {
        return yarnDialogue;
    }
    // Fallback to legacy TypeScript examples
    return legacyExamples[name] || null;
}
export function getDemoFlagSchema(name) {
    // Try new system first
    const schema = getExampleFlagSchema(name);
    if (schema) {
        return schema;
    }
    // Fallback to legacy
    return legacySchemas[name] || null;
}
