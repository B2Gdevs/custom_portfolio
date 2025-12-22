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
exports.ChoiceEdgeV2 = ChoiceEdgeV2;
const react_1 = __importStar(require("react"));
const reactflow_1 = require("reactflow");
const reactflow_converter_1 = require("../utils/reactflow-converter");
// Loop back edge color
const LOOP_COLOR = '#f59e0b'; // Amber/orange for visibility
function ChoiceEdgeV2({ id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data, selected, }) {
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
    const choiceIndex = data?.choiceIndex ?? 0;
    const baseColor = reactflow_converter_1.CHOICE_COLORS[choiceIndex % reactflow_converter_1.CHOICE_COLORS.length];
    // Use orange for back edges, otherwise use choice color
    const color = isBackEdge ? LOOP_COLOR : baseColor;
    const isSelected = selected || hovered;
    const isDimmed = data?.isDimmed ?? false;
    // Make edge thicker and more opaque when hovered or selected
    // Dim edges not in path when highlighting is on
    const strokeWidth = isSelected ? 4 : 2;
    const opacity = isDimmed ? 0.15 : (isSelected ? 1 : 0.7);
    // Use grey color when dimmed
    const strokeColor = isDimmed ? '#3a3a4a' : color;
    // Add glow effect when hovered (only if not dimmed)
    const filter = hovered && !isDimmed ? `drop-shadow(0 0 4px ${color}80)` : undefined;
    // Create a brighter version of the color for the pulse
    const brightenColor = (hex, percent = 30) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, ((num >> 16) & 0xff) + percent);
        const g = Math.min(255, ((num >> 8) & 0xff) + percent);
        const b = Math.min(255, (num & 0xff) + percent);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    };
    const pulseColor = brightenColor(color, 40);
    const shouldAnimate = data?.isInPathToSelected ?? false;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("path", { d: edgePath, fill: "none", stroke: "transparent", strokeWidth: 20, style: { cursor: 'pointer', pointerEvents: 'all' }, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }),
        react_1.default.createElement(reactflow_1.BaseEdge, { id: id, path: edgePath, style: {
                stroke: strokeColor,
                strokeWidth,
                opacity,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                pointerEvents: 'none',
                filter,
                // Dashed line for back edges
                strokeDasharray: isBackEdge ? '8 4' : undefined,
            }, markerEnd: isDimmed ? undefined : `url(#react-flow__arrowclosed-${color.replace('#', '')})` }),
        isBackEdge && (react_1.default.createElement("g", { transform: `translate(${labelX - 10}, ${labelY - 10})` },
            react_1.default.createElement("circle", { cx: "10", cy: "10", r: "12", fill: "#1a1a2e", stroke: color, strokeWidth: "2" }),
            react_1.default.createElement("text", { x: "10", y: "14", textAnchor: "middle", fontSize: "12", fill: color }, "\u21BA"))),
        shouldAnimate && (react_1.default.createElement("circle", { r: "6", fill: pulseColor, opacity: 0.9 },
            react_1.default.createElement("animateMotion", { dur: "2s", repeatCount: "indefinite", path: edgePath }))),
        react_1.default.createElement("defs", null,
            react_1.default.createElement("marker", { id: `react-flow__arrowclosed-${color.replace('#', '')}`, markerWidth: "12.5", markerHeight: "12.5", viewBox: "-10 -10 20 20", markerUnits: "strokeWidth", orient: "auto", refX: "0", refY: "0" },
                react_1.default.createElement("polyline", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", fill: color, points: "-5,-4 0,0 -5,4 -5,-4" })))));
}
