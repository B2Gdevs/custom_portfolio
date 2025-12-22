"use strict";
/**
 * Dagre Layout Strategy
 *
 * Hierarchical layout using the dagre library.
 * Best for dialogue trees with clear start-to-end flow.
 *
 * @see https://github.com/dagrejs/dagre
 * @see https://reactflow.dev/examples/layout/dagre
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DagreLayoutStrategy = void 0;
const dagre_1 = __importDefault(require("@dagrejs/dagre"));
// ============================================================================
// Constants
// ============================================================================
const NODE_WIDTH = 220;
const NODE_HEIGHT = 120;
const EXTRA_HEIGHT_PER_ITEM = 30;
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Calculate depth of each node from start using BFS
 */
function calculateNodeDepths(dialogue) {
    const depths = new Map();
    if (!dialogue.startNodeId)
        return depths;
    const queue = [
        { id: dialogue.startNodeId, depth: 0 }
    ];
    const visited = new Set();
    while (queue.length > 0) {
        const { id, depth } = queue.shift();
        if (visited.has(id))
            continue;
        visited.add(id);
        depths.set(id, depth);
        const node = dialogue.nodes[id];
        if (!node)
            continue;
        // Queue connected nodes
        const nextIds = getOutgoingNodeIds(node);
        for (const nextId of nextIds) {
            if (dialogue.nodes[nextId] && !visited.has(nextId)) {
                queue.push({ id: nextId, depth: depth + 1 });
            }
        }
    }
    return depths;
}
/**
 * Get all outgoing node IDs from a node
 */
function getOutgoingNodeIds(node) {
    const ids = [];
    if (node.nextNodeId)
        ids.push(node.nextNodeId);
    node.choices?.forEach(c => c.nextNodeId && ids.push(c.nextNodeId));
    node.conditionalBlocks?.forEach(b => b.nextNodeId && ids.push(b.nextNodeId));
    return ids;
}
/**
 * Estimate node height based on content
 */
function estimateNodeHeight(node) {
    const itemCount = Math.max(node.choices?.length || 0, node.conditionalBlocks?.length || 0);
    return NODE_HEIGHT + itemCount * EXTRA_HEIGHT_PER_ITEM;
}
// ============================================================================
// Strategy Implementation
// ============================================================================
class DagreLayoutStrategy {
    constructor() {
        this.id = 'dagre';
        this.name = 'Dagre (Hierarchical)';
        this.description = 'Hierarchical layout that flows from start to end. Best for linear dialogue with branches.';
        this.defaultOptions = {
            direction: 'TB',
            nodeSpacingX: 80,
            nodeSpacingY: 120,
            margin: 50,
        };
    }
    apply(dialogue, options) {
        const startTime = performance.now();
        const opts = { ...this.defaultOptions, ...options };
        const direction = opts.direction || 'TB';
        const isHorizontal = direction === 'LR';
        // Create dagre graph
        const g = new dagre_1.default.graphlib.Graph();
        g.setDefaultEdgeLabel(() => ({}));
        // Configure layout
        g.setGraph({
            rankdir: direction,
            nodesep: isHorizontal ? opts.nodeSpacingX : opts.nodeSpacingY,
            ranksep: isHorizontal ? opts.nodeSpacingY : opts.nodeSpacingX,
            marginx: opts.margin,
            marginy: opts.margin,
            ranker: 'network-simplex',
            align: 'UL',
            acyclicer: 'greedy',
            edgesep: 15,
        });
        // Add nodes ordered by depth
        const nodeDepths = calculateNodeDepths(dialogue);
        const sortedNodeIds = Object.keys(dialogue.nodes).sort((a, b) => {
            return (nodeDepths.get(a) ?? Infinity) - (nodeDepths.get(b) ?? Infinity);
        });
        for (const nodeId of sortedNodeIds) {
            const node = dialogue.nodes[nodeId];
            g.setNode(nodeId, {
                width: NODE_WIDTH,
                height: estimateNodeHeight(node),
            });
        }
        // Add edges with weights
        for (const node of Object.values(dialogue.nodes)) {
            if (node.nextNodeId && dialogue.nodes[node.nextNodeId]) {
                g.setEdge(node.id, node.nextNodeId, { weight: 3, minlen: 1 });
            }
            for (const choice of node.choices || []) {
                if (choice.nextNodeId && dialogue.nodes[choice.nextNodeId]) {
                    g.setEdge(node.id, choice.nextNodeId, { weight: 2, minlen: 1 });
                }
            }
            for (const block of node.conditionalBlocks || []) {
                if (block.nextNodeId && dialogue.nodes[block.nextNodeId]) {
                    g.setEdge(node.id, block.nextNodeId, { weight: 2, minlen: 1 });
                }
            }
        }
        // Run layout
        dagre_1.default.layout(g);
        // Extract positions and calculate bounds
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        const updatedNodes = {};
        for (const nodeId of Object.keys(dialogue.nodes)) {
            const node = dialogue.nodes[nodeId];
            const dagreNode = g.node(nodeId);
            if (dagreNode) {
                const x = dagreNode.x - NODE_WIDTH / 2;
                const y = dagreNode.y - NODE_HEIGHT / 2;
                updatedNodes[nodeId] = { ...node, x, y };
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x + NODE_WIDTH);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y + NODE_HEIGHT);
            }
            else {
                // Orphan node
                updatedNodes[nodeId] = { ...node };
            }
        }
        // Ensure start node is at edge
        const startNodeId = dialogue.startNodeId;
        if (startNodeId && updatedNodes[startNodeId]) {
            const threshold = 50;
            if (isHorizontal && updatedNodes[startNodeId].x - minX > threshold) {
                updatedNodes[startNodeId].x = minX;
            }
            else if (!isHorizontal && updatedNodes[startNodeId].y - minY > threshold) {
                updatedNodes[startNodeId].y = minY;
            }
        }
        const computeTimeMs = performance.now() - startTime;
        return {
            dialogue: { ...dialogue, nodes: updatedNodes },
            metadata: {
                computeTimeMs,
                nodeCount: Object.keys(dialogue.nodes).length,
                bounds: {
                    minX, minY, maxX, maxY,
                    width: maxX - minX,
                    height: maxY - minY,
                },
            },
        };
    }
    supports(dialogue) {
        // Dagre works best with connected graphs that have a clear start
        return !!dialogue.startNodeId && Object.keys(dialogue.nodes).length > 0;
    }
}
exports.DagreLayoutStrategy = DagreLayoutStrategy;
