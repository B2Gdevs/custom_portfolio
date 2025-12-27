"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoFlagSchemas = exports.exampleDialogues = exports.listExampleCharacterIds = exports.getExampleCharacter = exports.getExampleCharacters = exports.exampleCharacters = exports.listFlagSchemaIds = exports.getExampleFlagSchema = exports.listExampleIds = exports.getExampleMetadata = exports.exampleFlagSchemas = exports.examplesRegistry = void 0;
exports.listExamples = listExamples;
exports.listDemoFlagSchemas = listDemoFlagSchemas;
exports.getExampleDialogue = getExampleDialogue;
exports.getDemoFlagSchema = getDemoFlagSchema;
// New unified system exports
var examples_registry_1 = require("./examples-registry");
Object.defineProperty(exports, "examplesRegistry", { enumerable: true, get: function () { return examples_registry_1.examplesRegistry; } });
Object.defineProperty(exports, "exampleFlagSchemas", { enumerable: true, get: function () { return examples_registry_1.exampleFlagSchemas; } });
Object.defineProperty(exports, "getExampleMetadata", { enumerable: true, get: function () { return examples_registry_1.getExampleMetadata; } });
Object.defineProperty(exports, "listExampleIds", { enumerable: true, get: function () { return examples_registry_1.listExampleIds; } });
Object.defineProperty(exports, "getExampleFlagSchema", { enumerable: true, get: function () { return examples_registry_1.getExampleFlagSchema; } });
Object.defineProperty(exports, "listFlagSchemaIds", { enumerable: true, get: function () { return examples_registry_1.listFlagSchemaIds; } });
const yarn_examples_1 = require("./yarn-examples");
const examples_registry_2 = require("./examples-registry");
// Export character examples
var example_characters_1 = require("./example-characters");
Object.defineProperty(exports, "exampleCharacters", { enumerable: true, get: function () { return example_characters_1.exampleCharacters; } });
Object.defineProperty(exports, "getExampleCharacters", { enumerable: true, get: function () { return example_characters_1.getExampleCharacters; } });
Object.defineProperty(exports, "getExampleCharacter", { enumerable: true, get: function () { return example_characters_1.getExampleCharacter; } });
Object.defineProperty(exports, "listExampleCharacterIds", { enumerable: true, get: function () { return example_characters_1.listExampleCharacterIds; } });
const legacy_examples_1 = require("./legacy-examples");
// Export legacy examples - these work alongside the new Yarn examples
exports.exampleDialogues = legacy_examples_1.exampleDialogues;
exports.demoFlagSchemas = legacy_examples_1.demoFlagSchemas;
function listExamples() {
    // Combine both Yarn examples and legacy examples
    const yarnIds = (0, examples_registry_2.listExampleIds)();
    const legacyIds = Object.keys(legacy_examples_1.exampleDialogues);
    return [...new Set([...yarnIds, ...legacyIds])];
}
function listDemoFlagSchemas() {
    // Combine both systems
    const yarnIds = (0, examples_registry_2.listFlagSchemaIds)();
    const legacyIds = Object.keys(legacy_examples_1.demoFlagSchemas);
    return [...new Set([...yarnIds, ...legacyIds])];
}
function getExampleDialogue(name) {
    // Try new Yarn system first
    const yarnDialogue = (0, yarn_examples_1.getExampleDialogue)(name);
    if (yarnDialogue) {
        return yarnDialogue;
    }
    // Fallback to legacy TypeScript examples
    return legacy_examples_1.exampleDialogues[name] || null;
}
function getDemoFlagSchema(name) {
    // Try new system first
    const schema = (0, examples_registry_2.getExampleFlagSchema)(name);
    if (schema) {
        return schema;
    }
    // Fallback to legacy
    return legacy_examples_1.demoFlagSchemas[name] || null;
}
