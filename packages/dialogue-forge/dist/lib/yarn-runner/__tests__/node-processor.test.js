"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const node_processor_1 = require("../node-processor");
const variable_manager_1 = require("../variable-manager");
(0, vitest_1.describe)('node-processor', () => {
    let variableManager;
    let availableNodes;
    (0, vitest_1.beforeEach)(() => {
        variableManager = new variable_manager_1.VariableManager({ flag1: true, flag2: 42 });
        availableNodes = {
            node1: {
                id: 'node1',
                type: 'npc',
                content: 'Hello',
                x: 0,
                y: 0,
            },
            node2: {
                id: 'node2',
                type: 'npc',
                content: 'World',
                x: 0,
                y: 0,
            },
        };
    });
    (0, vitest_1.describe)('processNode', () => {
        (0, vitest_1.describe)('NPC nodes', () => {
            (0, vitest_1.it)('should process simple NPC node', () => {
                const node = {
                    id: 'test',
                    type: 'npc',
                    content: 'Hello world',
                    speaker: 'NPC',
                    nextNodeId: 'node1',
                    x: 0,
                    y: 0,
                };
                const result = (0, node_processor_1.processNode)(node, variableManager);
                (0, vitest_1.expect)(result.content).toBe('Hello world');
                (0, vitest_1.expect)(result.speaker).toBe('NPC');
                (0, vitest_1.expect)(result.nextNodeId).toBe('node1');
                (0, vitest_1.expect)(result.isEnd).toBe(false);
                (0, vitest_1.expect)(result.isPlayerChoice).toBe(false);
            });
            (0, vitest_1.it)('should mark as end when no nextNodeId', () => {
                const node = {
                    id: 'test',
                    type: 'npc',
                    content: 'End',
                    x: 0,
                    y: 0,
                };
                const result = (0, node_processor_1.processNode)(node, variableManager);
                (0, vitest_1.expect)(result.isEnd).toBe(true);
                (0, vitest_1.expect)(result.nextNodeId).toBeUndefined();
            });
        });
        (0, vitest_1.describe)('Player nodes', () => {
            (0, vitest_1.it)('should return choices for player node', () => {
                const node = {
                    id: 'test',
                    type: 'player',
                    content: '',
                    choices: [
                        {
                            id: 'c1',
                            text: 'Choice 1',
                            nextNodeId: 'node1',
                        },
                        {
                            id: 'c2',
                            text: 'Choice 2',
                            nextNodeId: 'node2',
                        },
                    ],
                    x: 0,
                    y: 0,
                };
                const result = (0, node_processor_1.processNode)(node, variableManager);
                (0, vitest_1.expect)(result.isPlayerChoice).toBe(true);
                (0, vitest_1.expect)(result.choices).toHaveLength(2);
                (0, vitest_1.expect)(result.choices?.[0].text).toBe('Choice 1');
            });
            (0, vitest_1.it)('should filter choices based on conditions', () => {
                const node = {
                    id: 'test',
                    type: 'player',
                    content: '',
                    choices: [
                        {
                            id: 'c1',
                            text: 'Choice 1',
                            nextNodeId: 'node1',
                            conditions: [
                                { flag: 'flag1', operator: 'is_set' },
                            ],
                        },
                        {
                            id: 'c2',
                            text: 'Choice 2',
                            nextNodeId: 'node2',
                            conditions: [
                                { flag: 'flag3', operator: 'is_set' },
                            ],
                        },
                    ],
                    x: 0,
                    y: 0,
                };
                const result = (0, node_processor_1.processNode)(node, variableManager);
                (0, vitest_1.expect)(result.choices).toHaveLength(1);
                (0, vitest_1.expect)(result.choices?.[0].text).toBe('Choice 1');
            });
        });
        (0, vitest_1.describe)('Conditional nodes', () => {
            (0, vitest_1.it)('should process conditional node with matching if block', () => {
                const node = {
                    id: 'test',
                    type: 'conditional',
                    content: '',
                    conditionalBlocks: [
                        {
                            id: 'b1',
                            type: 'if',
                            condition: [{ flag: 'flag1', operator: 'is_set' }],
                            content: 'If content',
                            speaker: 'Speaker',
                            nextNodeId: 'node1',
                        },
                        {
                            id: 'b2',
                            type: 'else',
                            content: 'Else content',
                        },
                    ],
                    x: 0,
                    y: 0,
                };
                const result = (0, node_processor_1.processNode)(node, variableManager);
                (0, vitest_1.expect)(result.content).toBe('If content');
                (0, vitest_1.expect)(result.speaker).toBe('Speaker');
                (0, vitest_1.expect)(result.nextNodeId).toBe('node1');
            });
            (0, vitest_1.it)('should process conditional node with matching elseif block', () => {
                const node = {
                    id: 'test',
                    type: 'conditional',
                    content: '',
                    conditionalBlocks: [
                        {
                            id: 'b1',
                            type: 'if',
                            condition: [{ flag: 'flag3', operator: 'is_set' }],
                            content: 'If content',
                        },
                        {
                            id: 'b2',
                            type: 'elseif',
                            condition: [{ flag: 'flag1', operator: 'is_set' }],
                            content: 'Elseif content',
                        },
                        {
                            id: 'b3',
                            type: 'else',
                            content: 'Else content',
                        },
                    ],
                    x: 0,
                    y: 0,
                };
                const result = (0, node_processor_1.processNode)(node, variableManager);
                (0, vitest_1.expect)(result.content).toBe('Elseif content');
            });
            (0, vitest_1.it)('should process conditional node with else block when no conditions match', () => {
                const node = {
                    id: 'test',
                    type: 'conditional',
                    content: '',
                    conditionalBlocks: [
                        {
                            id: 'b1',
                            type: 'if',
                            condition: [{ flag: 'flag3', operator: 'is_set' }],
                            content: 'If content',
                        },
                        {
                            id: 'b2',
                            type: 'else',
                            content: 'Else content',
                        },
                    ],
                    x: 0,
                    y: 0,
                };
                const result = (0, node_processor_1.processNode)(node, variableManager);
                (0, vitest_1.expect)(result.content).toBe('Else content');
            });
            (0, vitest_1.it)('should return end when no block matches', () => {
                const node = {
                    id: 'test',
                    type: 'conditional',
                    content: '',
                    conditionalBlocks: [
                        {
                            id: 'b1',
                            type: 'if',
                            condition: [{ flag: 'flag3', operator: 'is_set' }],
                            content: 'If content',
                        },
                    ],
                    x: 0,
                    y: 0,
                };
                const result = (0, node_processor_1.processNode)(node, variableManager);
                (0, vitest_1.expect)(result.isEnd).toBe(true);
                (0, vitest_1.expect)(result.content).toBe('');
            });
        });
    });
    (0, vitest_1.describe)('isValidNextNode', () => {
        (0, vitest_1.it)('should return true for valid node ID', () => {
            (0, vitest_1.expect)((0, node_processor_1.isValidNextNode)('node1', availableNodes)).toBe(true);
        });
        (0, vitest_1.it)('should return false for undefined', () => {
            (0, vitest_1.expect)((0, node_processor_1.isValidNextNode)(undefined, availableNodes)).toBe(false);
        });
        (0, vitest_1.it)('should return false for empty string', () => {
            (0, vitest_1.expect)((0, node_processor_1.isValidNextNode)('', availableNodes)).toBe(false);
        });
        (0, vitest_1.it)('should return false for whitespace-only string', () => {
            (0, vitest_1.expect)((0, node_processor_1.isValidNextNode)('   ', availableNodes)).toBe(false);
        });
        (0, vitest_1.it)('should return false for non-existent node', () => {
            (0, vitest_1.expect)((0, node_processor_1.isValidNextNode)('nonexistent', availableNodes)).toBe(false);
        });
    });
});
