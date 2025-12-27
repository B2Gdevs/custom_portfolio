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
    // Map choice index to CSS variable
    const choiceColorVar = `var(--color-df-edge-choice-${Math.min(choiceIndex % 5, 4) + 1})`;
    // Use loop color for back edges, otherwise use choice color
    const colorVar = isBackEdge ? 'var(--color-df-edge-loop)' : choiceColorVar;
    const isSelected = selected || hovered;
    const isDimmed = data?.isDimmed ?? false;
    // Make edge thicker and more opaque when hovered or selected
    // Dim edges not in path when highlighting is on
    const strokeWidth = isSelected ? 4 : 2;
    const opacity = isDimmed ? 0.15 : (isSelected ? 1 : 0.7);
    // Use dimmed color when dimmed
    const strokeColor = isDimmed ? 'var(--color-df-edge-dimmed)' : colorVar;
    // Add glow effect when hovered (only if not dimmed)
    const filter = hovered && !isDimmed ? `drop-shadow(0 0 4px ${colorVar})` : undefined;
    // For pulse animation, we'll use a slightly brighter version
    // Since we can't easily brighten CSS variables, we'll use the same color with higher opacity
    const pulseColor = colorVar;
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
            }, markerEnd: isDimmed ? undefined : `url(#react-flow__arrowclosed-choice-${choiceIndex})` }),
        isBackEdge && (react_1.default.createElement("g", { transform: `translate(${labelX - 10}, ${labelY - 10})` },
            react_1.default.createElement("circle", { cx: "10", cy: "10", r: "12", fill: "var(--color-df-base)", stroke: strokeColor, strokeWidth: "2" }),
            react_1.default.createElement("text", { x: "10", y: "14", textAnchor: "middle", fontSize: "12", fill: strokeColor }, "\u21BA"))),
        shouldAnimate && (react_1.default.createElement("circle", { r: "6", fill: pulseColor, opacity: 0.9 },
            react_1.default.createElement("animateMotion", { dur: "2s", repeatCount: "indefinite", path: edgePath }))),
        react_1.default.createElement("defs", null,
            react_1.default.createElement("marker", { id: `react-flow__arrowclosed-choice-${choiceIndex}`, markerWidth: "12.5", markerHeight: "12.5", viewBox: "-10 -10 20 20", markerUnits: "strokeWidth", orient: "auto", refX: "0", refY: "0" },
                react_1.default.createElement("polyline", { stroke: colorVar, strokeLinecap: "round", strokeLinejoin: "round", fill: colorVar, points: "-5,-4 0,0 -5,4 -5,-4" })))));
}
