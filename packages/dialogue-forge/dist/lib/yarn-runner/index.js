"use strict";
/**
 * Yarn Spinner Runner
 *
 * Modular execution engine for running Yarn Spinner dialogue trees.
 * This module provides the core logic for processing nodes, evaluating conditions,
 * and managing state, separate from the UI components.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVariableOperationsInContent = exports.executeVariableOperation = exports.isValidNextNode = exports.processNode = exports.evaluateConditions = exports.evaluateCondition = exports.VariableManager = void 0;
var variable_manager_1 = require("./variable-manager");
Object.defineProperty(exports, "VariableManager", { enumerable: true, get: function () { return variable_manager_1.VariableManager; } });
var condition_evaluator_1 = require("./condition-evaluator");
Object.defineProperty(exports, "evaluateCondition", { enumerable: true, get: function () { return condition_evaluator_1.evaluateCondition; } });
Object.defineProperty(exports, "evaluateConditions", { enumerable: true, get: function () { return condition_evaluator_1.evaluateConditions; } });
var node_processor_1 = require("./node-processor");
Object.defineProperty(exports, "processNode", { enumerable: true, get: function () { return node_processor_1.processNode; } });
Object.defineProperty(exports, "isValidNextNode", { enumerable: true, get: function () { return node_processor_1.isValidNextNode; } });
var variable_operations_1 = require("./variable-operations");
Object.defineProperty(exports, "executeVariableOperation", { enumerable: true, get: function () { return variable_operations_1.executeVariableOperation; } });
Object.defineProperty(exports, "processVariableOperationsInContent", { enumerable: true, get: function () { return variable_operations_1.processVariableOperationsInContent; } });
