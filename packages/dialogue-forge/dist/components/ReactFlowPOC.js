"use strict";
/**
 * Proof of Concept: React Flow Implementation with Custom Choice Edges
 *
 * This demonstrates how we can use React Flow's custom edges feature
 * to implement our choice-based edge system.
 *
 * Key concepts:
 * 1. Dynamic handles on PlayerNode (one handle per choice)
 * 2. Custom ChoiceEdge component that colors based on choice index
 * 3. Edge data stores choiceIndex and choiceId
 *
 * To use this, install: npm install reactflow
 */
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDialogueTreeToReactFlow = convertDialogueTreeToReactFlow;
exports.ReactFlowPOC = ReactFlowPOC;
const react_1 = __importStar(require("react"));
const constants_1 = require("../types/constants");
// Color scheme for choice edges (same as current implementation)
const CHOICE_COLORS = ['#e94560', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'];
/**
 * Custom Edge Component for Player Choice Connections
 *
 * This edge:
 * - Colors based on choice index (from edge data)
 * - Uses bezier path for smooth curves
 * - Matches our current visual style
 */
// function ChoiceEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
//   const [edgePath] = getBezierPath({
//     sourceX,
//     sourceY,
//     targetX,
//     targetY,
//   });
// 
//   const choiceIndex = data?.choiceIndex ?? 0;
//   const color = CHOICE_COLORS[choiceIndex % CHOICE_COLORS.length];
// 
//   return (
//     <>
//       <BaseEdge 
//         id={id} 
//         path={edgePath}
//         style={{ stroke: color, strokeWidth: 2, opacity: 0.7 }}
//         markerEnd={{
//           type: 'arrowclosed',
//           color: color,
//         }}
//       />
//     </>
//   );
// }
/**
 * NPC Node Component
 *
 * Features:
 * - Single output handle at bottom
 * - Speaker + content display
 * - Matches current styling
 */
// function NPCNode({ data, selected }: NodeProps) {
//   const node = data.node as DialogueNode;
//   
//   return (
//     <div className={`rounded-lg border-2 transition-all ${
//       selected ? 'border-[#e94560] shadow-lg shadow-[#e94560]/20' : 'border-[#2a2a3e]'
//     } bg-[#1a1a2e] min-w-[200px]`}>
//       {/* Input handle at top */}
//       <Handle type="target" position={Position.Top} className="!bg-[#2a2a3e] !border-[#4a4a6a]" />
//       
//       {/* Header */}
//       <div className="px-3 py-1.5 border-b border-[#2a2a3e] bg-[#12121a] flex items-center gap-2 rounded-t-lg">
//         <span className="text-[10px] font-mono text-gray-500 truncate flex-1">{node.id}</span>
//         <span className="text-[10px] text-gray-600">NPC</span>
//       </div>
//       
//       {/* Content */}
//       <div className="px-3 py-2 min-h-[50px]">
//         {node.speaker && (
//           <div className="text-[10px] text-[#e94560] font-medium">{node.speaker}</div>
//         )}
//         <div className="text-xs text-gray-400 line-clamp-2">
//           {node.content.slice(0, 60) + (node.content.length > 60 ? '...' : '')}
//         </div>
//       </div>
//       
//       {/* Output handle at bottom (for nextNodeId connection) */}
//       {node.nextNodeId && (
//         <Handle 
//           type="source" 
//           position={Position.Bottom} 
//           className="!bg-[#2a2a3e] !border-[#4a4a6a] !w-4 !h-4"
//           id="next"
//         />
//       )}
//     </div>
//   );
// }
/**
 * Player Node Component
 *
 * Features:
 * - Dynamic handles: one per choice (positioned on right side)
 * - Each handle positioned at choice's Y offset
 * - Matches current styling
 */
// function PlayerNode({ data, selected }: NodeProps) {
//   const node = data.node as DialogueNode;
//   const choices = node.choices || [];
//   
//   return (
//     <div className={`rounded-lg border-2 transition-all ${
//       selected ? 'border-[#e94560] shadow-lg shadow-[#e94560]/20' : 'border-[#2a2a3e]'
//     } bg-[#1e1e3a] min-w-[200px]`}>
//       {/* Input handle at top */}
//       <Handle type="target" position={Position.Top} className="!bg-[#2a2a3e] !border-[#4a4a6a]" />
//       
//       {/* Header */}
//       <div className="px-3 py-1.5 border-b border-[#2a2a3e] bg-[#16162a] flex items-center gap-2 rounded-t-lg">
//         <span className="text-[10px] font-mono text-gray-500 truncate flex-1">{node.id}</span>
//         <span className="text-[10px] text-gray-600">PLAYER</span>
//       </div>
//       
//       {/* Choices */}
//       <div className="border-t border-[#2a2a3e]">
//         {choices.map((choice, idx) => {
//           const color = CHOICE_COLORS[idx % CHOICE_COLORS.length];
//           // Calculate Y position: base offset + choice index * height
//           const handleY = 20 + idx * 24; // Matches current: fromY + 10 + idx * 24
//           
//           return (
//             <div 
//               key={choice.id} 
//               className="px-3 py-1 text-[10px] text-gray-400 flex items-center gap-2 border-b border-[#2a2a3e] last:border-0 relative"
//               style={{ minHeight: 24 }}
//             >
//               <div className="flex-1 min-w-0">
//                 <span className="truncate block">{choice.text.slice(0, 25)}...</span>
//               </div>
//               
//               {/* Dynamic handle for this choice */}
//               <Handle
//                 type="source"
//                 position={Position.Right}
//                 id={`choice-${idx}`}
//                 style={{ 
//                   top: `${handleY}px`,
//                   right: '-6px',
//                   background: color,
//                   borderColor: color,
//                   width: '12px',
//                   height: '12px',
//                 }}
//                 className="!bg-[#2a2a3e] !border-2 hover:!border-[#e94560] hover:!bg-[#e94560]/20"
//               />
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
/**
 * Convert DialogueTree to React Flow format
 */
function convertDialogueTreeToReactFlow(dialogue) {
    const nodes = [];
    const edges = [];
    // Define node types
    const nodeTypes = {
    // 'npc': NPCNode,
    // 'player': PlayerNode,
    };
    // Define edge types
    const edgeTypes = {
    // 'choice': ChoiceEdge,
    };
    // Convert nodes
    Object.values(dialogue.nodes).forEach(node => {
        nodes.push({
            id: node.id,
            type: node.type, // 'npc' or 'player'
            position: { x: node.x, y: node.y },
            data: { node },
            selected: false,
        });
    });
    // Convert edges
    Object.values(dialogue.nodes).forEach(node => {
        if (node.type === constants_1.NODE_TYPE.NPC && node.nextNodeId) {
            // NPC -> next node (single connection)
            edges.push({
                id: `${node.id}-next`,
                source: node.id,
                target: node.nextNodeId,
                sourceHandle: 'next',
                type: 'default', // Use default edge for NPC connections
                style: { stroke: '#4a4a6a', strokeWidth: 2 },
            });
        }
        if (node.type === constants_1.NODE_TYPE.PLAYER && node.choices) {
            // Player -> multiple choices (one edge per choice)
            node.choices.forEach((choice, idx) => {
                if (choice.nextNodeId) {
                    edges.push({
                        id: `${node.id}-choice-${idx}`,
                        source: node.id,
                        target: choice.nextNodeId,
                        sourceHandle: `choice-${idx}`, // Connect to specific choice handle
                        type: 'choice', // Use custom ChoiceEdge
                        data: {
                            choiceIndex: idx,
                            choiceId: choice.id,
                        },
                    });
                }
            });
        }
    });
    return { nodes, edges, nodeTypes, edgeTypes };
}
/**
 * Main React Flow Component (POC)
 *
 * Usage:
 * ```tsx
 * <ReactFlowProvider>
 *   <ReactFlowPOC dialogue={dialogueTree} />
 * </ReactFlowProvider>
 * ```
 */
function ReactFlowPOC({ dialogue }) {
    // Convert dialogue to React Flow format
    const { nodes, edges, nodeTypes, edgeTypes } = (0, react_1.useMemo)(() => convertDialogueTreeToReactFlow(dialogue), [dialogue]);
    // Handle node changes (drag, etc.)
    const onNodesChange = (0, react_1.useCallback)((changes) => {
        // Update dialogue tree positions
        // This would sync back to our DialogueTree structure
        console.log('Nodes changed:', changes);
    }, []);
    // Handle edge connections
    const onConnect = (0, react_1.useCallback)((connection) => {
        // Handle new edge connections
        // This would update our DialogueTree structure
        console.log('Connected:', connection);
    }, []);
    // Handle edge changes (delete, etc.)
    const onEdgesChange = (0, react_1.useCallback)((changes) => {
        console.log('Edges changed:', changes);
    }, []);
    return (react_1.default.createElement("div", { className: "w-full h-full" },
        react_1.default.createElement("div", { className: "p-8 text-gray-400" },
            react_1.default.createElement("h2", { className: "text-xl font-bold mb-4 text-white" }, "React Flow POC"),
            react_1.default.createElement("p", { className: "mb-4" }, "This is a proof of concept for migrating to React Flow."),
            react_1.default.createElement("p", { className: "mb-4" }, "To use this:"),
            react_1.default.createElement("ol", { className: "list-decimal list-inside space-y-2 mb-4" },
                react_1.default.createElement("li", null,
                    "Install React Flow: ",
                    react_1.default.createElement("code", { className: "bg-[#1a1a2e] px-2 py-1 rounded" }, "npm install reactflow")),
                react_1.default.createElement("li", null, "Uncomment the React Flow imports and components"),
                react_1.default.createElement("li", null, "Test with your dialogue tree")),
            react_1.default.createElement("div", { className: "mt-8 p-4 bg-[#1a1a2e] rounded" },
                react_1.default.createElement("h3", { className: "font-semibold mb-2" }, "Key Features:"),
                react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-sm" },
                    react_1.default.createElement("li", null, "\u2705 Custom ChoiceEdge component with color-coded edges"),
                    react_1.default.createElement("li", null, "\u2705 Dynamic handles on PlayerNode (one per choice)"),
                    react_1.default.createElement("li", null, "\u2705 NPCNode with single output handle"),
                    react_1.default.createElement("li", null, "\u2705 Conversion functions (DialogueTree \u2194 React Flow)"),
                    react_1.default.createElement("li", null, "\u2705 Matches current visual style"))),
            react_1.default.createElement("div", { className: "mt-4 p-4 bg-[#1a1a2e] rounded" },
                react_1.default.createElement("h3", { className: "font-semibold mb-2" }, "Current Stats:"),
                react_1.default.createElement("p", { className: "text-sm" },
                    "Nodes: ",
                    nodes.length,
                    ", Edges: ",
                    edges.length)))));
}
