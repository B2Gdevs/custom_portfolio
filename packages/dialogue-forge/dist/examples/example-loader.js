"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadExampleDialogue = loadExampleDialogue;
exports.getFlagSchemaForExample = getFlagSchemaForExample;
exports.getAllExamples = getAllExamples;
exports.loadExampleDialogueSync = loadExampleDialogueSync;
const yarn_converter_1 = require("../lib/yarn-converter");
const examples_registry_1 = require("./examples-registry");
/**
 * Load an example dialogue from a Yarn file
 * This is the unified way to load examples - all examples are Yarn files
 */
async function loadExampleDialogue(exampleId) {
    const metadata = (0, examples_registry_1.getExampleMetadata)(exampleId);
    if (!metadata) {
        console.warn(`Example not found: ${exampleId}`);
        return null;
    }
    try {
        // Dynamically import the Yarn file
        // In a build environment, these will be bundled
        // In Node.js/test environment, we'll read from filesystem
        const yarnContent = await loadYarnFile(metadata.filename);
        if (!yarnContent) {
            console.warn(`Failed to load Yarn file: ${metadata.filename}`);
            return null;
        }
        // Convert Yarn to DialogueTree
        const dialogue = (0, yarn_converter_1.importFromYarn)(yarnContent, metadata.title);
        // Update node count in metadata if not set
        if (!metadata.nodeCount) {
            metadata.nodeCount = Object.keys(dialogue.nodes).length;
        }
        return dialogue;
    }
    catch (error) {
        console.error(`Error loading example ${exampleId}:`, error);
        return null;
    }
}
/**
 * Load Yarn file content
 * This handles both browser (bundled) and Node.js (filesystem) environments
 */
async function loadYarnFile(filename) {
    // In browser/build environment, we'll need to import as text
    // For now, we'll use a simple approach that works in both
    try {
        // Try to import as a module (works in bundlers like Vite/Webpack)
        if (typeof window !== 'undefined') {
            // Browser environment - files should be imported as text
            // This will be handled by the bundler configuration
            const response = await fetch(`/examples/${filename}`);
            if (response.ok) {
                return await response.text();
            }
        }
        // Node.js/test environment - read from filesystem
        if (typeof require !== 'undefined') {
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join(__dirname, filename);
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, 'utf8');
            }
        }
        return null;
    }
    catch (error) {
        console.error(`Error loading Yarn file ${filename}:`, error);
        return null;
    }
}
/**
 * Get flag schema for an example
 */
function getFlagSchemaForExample(exampleId) {
    const metadata = (0, examples_registry_1.getExampleMetadata)(exampleId);
    if (!metadata) {
        return null;
    }
    return (0, examples_registry_1.getExampleFlagSchema)(metadata.flagSchemaId);
}
/**
 * Get all examples with their metadata
 */
function getAllExamples() {
    return examples_registry_1.examplesRegistry.map(metadata => ({
        ...metadata,
        flagSchema: (0, examples_registry_1.getExampleFlagSchema)(metadata.flagSchemaId)
    }));
}
/**
 * Synchronous version for use with pre-loaded examples
 * This is used when examples are bundled/inlined
 */
function loadExampleDialogueSync(exampleId, yarnContent) {
    const metadata = (0, examples_registry_1.getExampleMetadata)(exampleId);
    if (!metadata) {
        return null;
    }
    try {
        return (0, yarn_converter_1.importFromYarn)(yarnContent, metadata.title);
    }
    catch (error) {
        console.error(`Error loading example ${exampleId}:`, error);
        return null;
    }
}
