"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNode = createNode;
exports.addChoiceToNode = addChoiceToNode;
exports.removeChoiceFromNode = removeChoiceFromNode;
exports.updateChoiceInNode = updateChoiceInNode;
exports.deleteNodeFromTree = deleteNodeFromTree;
const constants_1 = require("../types/constants");
function createNode(type, id, x, y) {
    if (type === constants_1.NODE_TYPE.NPC) {
        return {
            id,
            type,
            content: 'New dialogue...',
            speaker: 'Character',
            x,
            y
        };
    }
    else if (type === constants_1.NODE_TYPE.PLAYER) {
        return {
            id,
            type,
            content: '',
            choices: [{ id: `c_${Date.now()}`, text: 'Choice 1', nextNodeId: '' }],
            x,
            y
        };
    }
    else if (type === constants_1.NODE_TYPE.CONDITIONAL) {
        return {
            id,
            type,
            content: '',
            conditionalBlocks: [{
                    id: `block_${Date.now()}`,
                    type: 'if',
                    condition: [],
                    content: 'New dialogue...',
                    speaker: undefined
                }],
            x,
            y
        };
    }
    // Fallback
    return {
        id,
        type,
        content: '',
        x,
        y
    };
}
function addChoiceToNode(node) {
    if (node.type !== constants_1.NODE_TYPE.PLAYER)
        return node;
    const newChoice = {
        id: `c_${Date.now()}`,
        text: 'New choice...',
        nextNodeId: ''
    };
    return {
        ...node,
        choices: [...(node.choices || []), newChoice]
    };
}
function removeChoiceFromNode(node, choiceIdx) {
    if (node.type !== constants_1.NODE_TYPE.PLAYER || !node.choices)
        return node;
    return {
        ...node,
        choices: node.choices.filter((_, i) => i !== choiceIdx)
    };
}
function updateChoiceInNode(node, choiceIdx, updates) {
    if (node.type !== constants_1.NODE_TYPE.PLAYER || !node.choices)
        return node;
    const newChoices = [...node.choices];
    newChoices[choiceIdx] = { ...newChoices[choiceIdx], ...updates };
    return { ...node, choices: newChoices };
}
function deleteNodeFromTree(tree, nodeId) {
    if (nodeId === tree.startNodeId) {
        throw new Error("Cannot delete the start node");
    }
    const { [nodeId]: _, ...rest } = tree.nodes;
    // Remove references to deleted node
    Object.keys(rest).forEach(id => {
        if (rest[id].nextNodeId === nodeId) {
            rest[id] = { ...rest[id], nextNodeId: undefined };
        }
        if (rest[id].choices) {
            rest[id] = {
                ...rest[id],
                choices: rest[id].choices.map(c => c.nextNodeId === nodeId ? { ...c, nextNodeId: '' } : c)
            };
        }
    });
    return { ...tree, nodes: rest };
}
