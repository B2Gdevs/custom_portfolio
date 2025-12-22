/**
 * Inline Yarn file contents for examples
 * This allows examples to be bundled and loaded synchronously
 *
 * To add a new example:
 * 1. Create a .yarn file in the examples directory
 * 2. Copy its content here as a string literal
 * 3. Add it to the yarnExamplesContent object
 */
import { DialogueTree } from '../types';
/**
 * Load all examples synchronously
 * This should be called once at initialization
 */
export declare function loadAllExamples(): Record<string, DialogueTree>;
/**
 * Get a loaded example dialogue
 */
export declare function getExampleDialogue(exampleId: string): DialogueTree | null;
/**
 * Get all loaded examples
 */
export declare function getAllExampleDialogues(): Record<string, DialogueTree>;
/**
 * Get flag schema for an example
 */
export declare function getExampleFlagSchema(exampleId: string): import("..").FlagSchema | null;
/**
 * Check if an example has Yarn content available
 */
export declare function hasExampleContent(exampleId: string): boolean;
/**
 * Get list of example IDs that have content available
 */
export declare function getAvailableExampleIds(): string[];
