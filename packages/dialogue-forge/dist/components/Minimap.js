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
exports.Minimap = Minimap;
const react_1 = __importStar(require("react"));
const constants_1 = require("../types/constants");
const MINIMAP_SIZE = 200;
const NODE_SIZE = 4;
function Minimap({ dialogue, viewport, onNavigate, className }) {
    const minimapRef = (0, react_1.useRef)(null);
    // Calculate bounds of all nodes
    const bounds = react_1.default.useMemo(() => {
        const nodes = Object.values(dialogue.nodes);
        if (nodes.length === 0) {
            return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
        }
        const xs = nodes.map(n => n.x);
        const ys = nodes.map(n => n.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs.map(x => x + 200)); // NODE_WIDTH
        const maxY = Math.max(...ys.map(y => y + 100)); // NODE_HEIGHT
        return { minX, minY, maxX, maxY };
    }, [dialogue.nodes]);
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const scaleX = MINIMAP_SIZE / Math.max(width, 100);
    const scaleY = MINIMAP_SIZE / Math.max(height, 100);
    const scale = Math.min(scaleX, scaleY);
    const handleClick = (e) => {
        if (!minimapRef.current)
            return;
        const rect = minimapRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale - bounds.minX;
        const y = (e.clientY - rect.top) / scale - bounds.minY;
        onNavigate(x, y);
    };
    // Calculate viewport indicator position
    // Account for graph scale and offset
    const viewportX = ((viewport.x - bounds.minX) / viewport.scale) * scale;
    const viewportY = ((viewport.y - bounds.minY) / viewport.scale) * scale;
    const viewportWidth = (viewport.width / viewport.scale) * scale;
    const viewportHeight = (viewport.height / viewport.scale) * scale;
    return (react_1.default.createElement("div", { ref: minimapRef, className: `absolute bottom-4 right-4 bg-[#0d0d14] border border-[#2a2a3e] rounded-lg overflow-hidden ${className}`, style: { width: MINIMAP_SIZE, height: MINIMAP_SIZE }, onClick: handleClick },
        react_1.default.createElement("svg", { width: MINIMAP_SIZE, height: MINIMAP_SIZE, className: "absolute inset-0" },
            react_1.default.createElement("rect", { width: MINIMAP_SIZE, height: MINIMAP_SIZE, fill: "#0d0d14" }),
            react_1.default.createElement("defs", null,
                react_1.default.createElement("pattern", { id: "minimapGrid", width: "10", height: "10", patternUnits: "userSpaceOnUse" },
                    react_1.default.createElement("path", { d: "M 10 0 L 0 0 0 10", fill: "none", stroke: "#1a1a2e", strokeWidth: "0.5" }))),
            react_1.default.createElement("rect", { width: MINIMAP_SIZE, height: MINIMAP_SIZE, fill: "url(#minimapGrid)" }),
            Object.values(dialogue.nodes).map(node => {
                const x = (node.x - bounds.minX) * scale;
                const y = (node.y - bounds.minY) * scale;
                const color = node.type === constants_1.NODE_TYPE.NPC ? '#e94560' : '#8b5cf6';
                return (react_1.default.createElement("g", { key: node.id },
                    react_1.default.createElement("rect", { x: x, y: y, width: NODE_SIZE * 2, height: NODE_SIZE * 2, fill: color, opacity: 0.6, stroke: color, strokeWidth: "0.5" }),
                    node.id === dialogue.startNodeId && (react_1.default.createElement("circle", { cx: x + NODE_SIZE, cy: y + NODE_SIZE, r: NODE_SIZE * 1.5, fill: "none", stroke: "#22c55e", strokeWidth: "1", opacity: 0.8 }))));
            }),
            react_1.default.createElement("rect", { x: viewportX, y: viewportY, width: viewportWidth, height: viewportHeight, fill: "none", stroke: "#06b6d4", strokeWidth: "2", opacity: 0.8, strokeDasharray: "4 4" })),
        react_1.default.createElement("div", { className: "absolute top-1 left-1 text-[8px] text-gray-500 bg-[#0d0d14]/80 px-1 rounded" }, "Minimap")));
}
