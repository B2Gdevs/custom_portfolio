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
exports.NPCEdgeV2 = NPCEdgeV2;
const react_1 = __importStar(require("react"));
const reactflow_1 = require("reactflow");
// Loop back edge color
const LOOP_COLOR = '#f59e0b'; // Amber/orange for visibility
function NPCEdgeV2({ id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, selected, data, }) {
    const [hovered, setHovered] = (0, react_1.useState)(false);
    const isBackEdge = data?.isBackEdge ?? false;
    // Use smooth step path for angular look (like the horizontal example)
    // For back edges, use bezier for a more curved appearance
    const [edgePath, labelX, labelY] = isBackEdge
        ? (0, reactflow_1.getBezierPath)({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
            curvature: 0.5,
        })
        : (0, reactflow_1.getSmoothStepPath)({
            sourceX,
            sourceY,
            sourcePosition: sourcePosition || reactflow_1.Position.Bottom,
            targetX,
            targetY,
            targetPosition: targetPosition || reactflow_1.Position.Top,
            borderRadius: 8,
        });
    const isSelected = selected || hovered;
    const isDimmed = data?.isDimmed ?? false;
    // Use orange for back edges, otherwise use grey
    const baseColor = isSelected ? '#8a8aaa' : '#4a4a6a';
    // When dimmed, use a darker grey
    const strokeColor = isDimmed ? '#2a2a3a' : (isBackEdge ? LOOP_COLOR : baseColor);
    const strokeWidth = isSelected ? 4 : 2;
    const opacity = isDimmed ? 0.2 : (isSelected ? 1 : 0.6);
    // Add glow effect when hovered (only if not dimmed)
    const filter = hovered && !isDimmed
        ? isBackEdge
            ? 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.8))'
            : 'drop-shadow(0 0 4px rgba(138, 138, 170, 0.8))'
        : undefined;
    // Create a brighter version of the color for the pulse
    const brightenColor = (hex, percent = 40) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, ((num >> 16) & 0xff) + percent);
        const g = Math.min(255, ((num >> 8) & 0xff) + percent);
        const b = Math.min(255, (num & 0xff) + percent);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    };
    const pulseColor = brightenColor(strokeColor, 50);
    const shouldAnimate = data?.isInPathToSelected ?? false;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("path", { d: edgePath, fill: "none", stroke: "transparent", strokeWidth: 20, style: { cursor: 'pointer', pointerEvents: 'all' }, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }),
        react_1.default.createElement(reactflow_1.BaseEdge, { id: id, path: edgePath, style: {
                stroke: strokeColor,
                strokeWidth,
                opacity,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                filter,
                // Dashed line for back edges
                strokeDasharray: isBackEdge ? '8 4' : undefined,
            }, markerEnd: isBackEdge ? `url(#loop-arrow-${id})` : 'url(#react-flow__arrowclosed)' }),
        isBackEdge && (react_1.default.createElement("g", { transform: `translate(${labelX - 10}, ${labelY - 10})` },
            react_1.default.createElement("circle", { cx: "10", cy: "10", r: "12", fill: "#1a1a2e", stroke: strokeColor, strokeWidth: "2" }),
            react_1.default.createElement("text", { x: "10", y: "14", textAnchor: "middle", fontSize: "12", fill: strokeColor }, "\u21BA"))),
        shouldAnimate && (react_1.default.createElement("circle", { r: "6", fill: pulseColor, opacity: 0.9 },
            react_1.default.createElement("animateMotion", { dur: "2s", repeatCount: "indefinite", path: edgePath }))),
        isBackEdge && (react_1.default.createElement("defs", null,
            react_1.default.createElement("marker", { id: `loop-arrow-${id}`, markerWidth: "12.5", markerHeight: "12.5", viewBox: "-10 -10 20 20", markerUnits: "strokeWidth", orient: "auto", refX: "0", refY: "0" },
                react_1.default.createElement("polyline", { stroke: LOOP_COLOR, strokeLinecap: "round", strokeLinejoin: "round", fill: LOOP_COLOR, points: "-5,-4 0,0 -5,4 -5,-4" }))))));
}
