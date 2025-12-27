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
export { examplesRegistry, exampleFlagSchemas, getExampleMetadata, listExampleIds, getExampleFlagSchema, listFlagSchemaIds, type ExampleMetadata } from './examples-registry';
export { exampleCharacters, getExampleCharacters, getExampleCharacter, listExampleCharacterIds, } from './example-characters';
/**
 * Legacy exports for backward compatibility
 * These maintain the old API while we migrate examples to Yarn format
 * TODO: Remove once all examples are migrated and code is updated
 */
import { DialogueTree } from '../types';
import { FlagSchema } from '../types/flags';
export declare const exampleDialogues: Record<string, DialogueTree>;
export declare const demoFlagSchemas: Record<string, FlagSchema>;
export declare function listExamples(): string[];
export declare function listDemoFlagSchemas(): string[];
export declare function getExampleDialogue(name: string): DialogueTree | null;
export declare function getDemoFlagSchema(name: string): FlagSchema | null;
