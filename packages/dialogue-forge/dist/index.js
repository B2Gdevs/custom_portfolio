"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlagValue = exports.validateFlags = exports.mergeFlagUpdates = exports.initializeFlags = exports.importFromYarn = exports.exportToYarn = exports.extractFlagsFromGameState = exports.validateGameState = exports.flattenGameState = exports.listExampleCharacterIds = exports.getExampleCharacter = exports.getExampleCharacters = exports.exampleCharacters = exports.listDemoFlagSchemas = exports.listExamples = exports.getDemoFlagSchema = exports.getExampleDialogue = exports.demoFlagSchemas = exports.exampleDialogues = exports.ExampleLoader = exports.ZoomControls = exports.CharacterSelector = exports.FlagManager = exports.FlagSelector = exports.GuidePanel = exports.DialogueSimulator = exports.ScenePlayer = exports.DialogueEditorV2 = void 0;
var DialogueEditorV2_1 = require("./components/DialogueEditorV2");
Object.defineProperty(exports, "DialogueEditorV2", { enumerable: true, get: function () { return DialogueEditorV2_1.DialogueEditorV2; } });
var ScenePlayer_1 = require("./components/ScenePlayer");
Object.defineProperty(exports, "ScenePlayer", { enumerable: true, get: function () { return ScenePlayer_1.ScenePlayer; } });
// Legacy export for backward compatibility
var ScenePlayer_2 = require("./components/ScenePlayer");
Object.defineProperty(exports, "DialogueSimulator", { enumerable: true, get: function () { return ScenePlayer_2.ScenePlayer; } });
var GuidePanel_1 = require("./components/GuidePanel");
Object.defineProperty(exports, "GuidePanel", { enumerable: true, get: function () { return GuidePanel_1.GuidePanel; } });
var FlagSelector_1 = require("./components/FlagSelector");
Object.defineProperty(exports, "FlagSelector", { enumerable: true, get: function () { return FlagSelector_1.FlagSelector; } });
var FlagManager_1 = require("./components/FlagManager");
Object.defineProperty(exports, "FlagManager", { enumerable: true, get: function () { return FlagManager_1.FlagManager; } });
var CharacterSelector_1 = require("./components/CharacterSelector");
Object.defineProperty(exports, "CharacterSelector", { enumerable: true, get: function () { return CharacterSelector_1.CharacterSelector; } });
var ZoomControls_1 = require("./components/ZoomControls");
Object.defineProperty(exports, "ZoomControls", { enumerable: true, get: function () { return ZoomControls_1.ZoomControls; } });
var ExampleLoader_1 = require("./components/ExampleLoader");
Object.defineProperty(exports, "ExampleLoader", { enumerable: true, get: function () { return ExampleLoader_1.ExampleLoader; } });
// Export styles
require("./styles/scrollbar.css");
require("./styles/theme.css");
// Export examples
var examples_1 = require("./examples");
Object.defineProperty(exports, "exampleDialogues", { enumerable: true, get: function () { return examples_1.exampleDialogues; } });
Object.defineProperty(exports, "demoFlagSchemas", { enumerable: true, get: function () { return examples_1.demoFlagSchemas; } });
Object.defineProperty(exports, "getExampleDialogue", { enumerable: true, get: function () { return examples_1.getExampleDialogue; } });
Object.defineProperty(exports, "getDemoFlagSchema", { enumerable: true, get: function () { return examples_1.getDemoFlagSchema; } });
Object.defineProperty(exports, "listExamples", { enumerable: true, get: function () { return examples_1.listExamples; } });
Object.defineProperty(exports, "listDemoFlagSchemas", { enumerable: true, get: function () { return examples_1.listDemoFlagSchemas; } });
var examples_2 = require("./examples");
Object.defineProperty(exports, "exampleCharacters", { enumerable: true, get: function () { return examples_2.exampleCharacters; } });
Object.defineProperty(exports, "getExampleCharacters", { enumerable: true, get: function () { return examples_2.getExampleCharacters; } });
Object.defineProperty(exports, "getExampleCharacter", { enumerable: true, get: function () { return examples_2.getExampleCharacter; } });
Object.defineProperty(exports, "listExampleCharacterIds", { enumerable: true, get: function () { return examples_2.listExampleCharacterIds; } });
// Export all types
__exportStar(require("./types"), exports);
__exportStar(require("./types/flags"), exports);
__exportStar(require("./types/game-state"), exports);
__exportStar(require("./types/characters"), exports);
__exportStar(require("./types/constants"), exports);
// Export game state utilities
var game_state_flattener_1 = require("./utils/game-state-flattener");
Object.defineProperty(exports, "flattenGameState", { enumerable: true, get: function () { return game_state_flattener_1.flattenGameState; } });
Object.defineProperty(exports, "validateGameState", { enumerable: true, get: function () { return game_state_flattener_1.validateGameState; } });
Object.defineProperty(exports, "extractFlagsFromGameState", { enumerable: true, get: function () { return game_state_flattener_1.extractFlagsFromGameState; } });
// Export utilities
var yarn_converter_1 = require("./lib/yarn-converter");
Object.defineProperty(exports, "exportToYarn", { enumerable: true, get: function () { return yarn_converter_1.exportToYarn; } });
Object.defineProperty(exports, "importFromYarn", { enumerable: true, get: function () { return yarn_converter_1.importFromYarn; } });
var flag_manager_1 = require("./lib/flag-manager");
Object.defineProperty(exports, "initializeFlags", { enumerable: true, get: function () { return flag_manager_1.initializeFlags; } });
Object.defineProperty(exports, "mergeFlagUpdates", { enumerable: true, get: function () { return flag_manager_1.mergeFlagUpdates; } });
Object.defineProperty(exports, "validateFlags", { enumerable: true, get: function () { return flag_manager_1.validateFlags; } });
Object.defineProperty(exports, "getFlagValue", { enumerable: true, get: function () { return flag_manager_1.getFlagValue; } });
__exportStar(require("./utils/node-helpers"), exports);
__exportStar(require("./utils/feature-flags"), exports);
