import { FlagSchema } from '../types/flags';
/**
 * Example metadata - describes each example file
 */
export interface ExampleMetadata {
    id: string;
    title: string;
    description: string;
    filename: string;
    flagSchemaId: string;
    nodeCount?: number;
    features: string[];
}
/**
 * Registry of all available examples
 * This is the single source of truth for example discovery
 */
export declare const examplesRegistry: ExampleMetadata[];
/**
 * Flag schemas for examples
 */
export declare const exampleFlagSchemas: Record<string, FlagSchema>;
/**
 * Get example metadata by ID
 */
export declare function getExampleMetadata(id: string): ExampleMetadata | null;
/**
 * List all available example IDs
 */
export declare function listExampleIds(): string[];
/**
 * Get flag schema by ID
 */
export declare function getExampleFlagSchema(id: string): FlagSchema | null;
/**
 * List all available flag schema IDs
 */
export declare function listFlagSchemaIds(): string[];
