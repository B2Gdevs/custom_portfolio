import { DialogueTree } from '../types';
import { FlagSchema } from '../types/flags';
/**
 * Load an example dialogue from a Yarn file
 * This is the unified way to load examples - all examples are Yarn files
 */
export declare function loadExampleDialogue(exampleId: string): Promise<DialogueTree | null>;
/**
 * Get flag schema for an example
 */
export declare function getFlagSchemaForExample(exampleId: string): FlagSchema | null;
/**
 * Get all examples with their metadata
 */
export declare function getAllExamples(): {
    flagSchema: FlagSchema | null;
    id: string;
    title: string;
    description: string;
    filename: string;
    flagSchemaId: string;
    nodeCount?: number;
    features: string[];
}[];
/**
 * Synchronous version for use with pre-loaded examples
 * This is used when examples are bundled/inlined
 */
export declare function loadExampleDialogueSync(exampleId: string, yarnContent: string): DialogueTree | null;
