import React, { useState } from 'react';
import { BaseEdge, getSmoothStepPath, getBezierPath, Position } from 'reactflow';
// Loop back edge color - now uses CSS variable var(--color-df-edge-loop)
export function NPCEdgeV2({ id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, selected, data, }) {
    const [hovered, setHovered] = useState(false);
    const isBackEdge = data?.isBackEdge ?? false;
    // Use smooth step path for angular look (like the horizontal example)
    // For back edges, use bezier for a more curved appearance
    const [edgePath, labelX, labelY] = isBackEdge
        ? getBezierPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
            curvature: 0.5,
        })
        : getSmoothStepPath({
            sourceX,
            sourceY,
            sourcePosition: sourcePosition || Position.Bottom,
            targetX,
            targetY,
            targetPosition: targetPosition || Position.Top,
            borderRadius: 8,
        });
    const isSelected = selected || hovered;
    const isDimmed = data?.isDimmed ?? false;
    // Use CSS variables for colors
    const strokeColor = isDimmed
        ? 'var(--color-df-edge-dimmed)'
        : (isBackEdge ? 'var(--color-df-edge-loop)' : (isSelected ? 'var(--color-df-edge-default-hover)' : 'var(--color-df-edge-default)'));
    const strokeWidth = isSelected ? 4 : 2;
    const opacity = isDimmed ? 0.2 : (isSelected ? 1 : 0.6);
    // Add glow effect when hovered (only if not dimmed)
    const filter = hovered && !isDimmed ? 'drop-shadow(0 0 4px var(--color-df-edge-default-hover))' : undefined;
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
    return (React.createElement(React.Fragment, null,
        React.createElement("path", { d: edgePath, fill: "none", stroke: "transparent", strokeWidth: 20, style: { cursor: 'pointer', pointerEvents: 'all' }, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }),
        React.createElement(BaseEdge, { id: id, path: edgePath, style: {
                stroke: strokeColor,
                strokeWidth,
                opacity,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                filter,
                // Dashed line for back edges
                strokeDasharray: isBackEdge ? '8 4' : undefined,
            }, markerEnd: isBackEdge ? `url(#loop-arrow-${id})` : 'url(#react-flow__arrowclosed)' }),
        isBackEdge && (React.createElement("g", { transform: `translate(${labelX - 10}, ${labelY - 10})` },
            React.createElement("circle", { cx: "10", cy: "10", r: "12", fill: "var(--color-df-base)", stroke: strokeColor, strokeWidth: "2" }),
            React.createElement("text", { x: "10", y: "14", textAnchor: "middle", fontSize: "12", fill: strokeColor }, "\u21BA"))),
        shouldAnimate && (React.createElement("circle", { r: "6", fill: pulseColor, opacity: 0.9 },
            React.createElement("animateMotion", { dur: "2s", repeatCount: "indefinite", path: edgePath }))),
        isBackEdge && (React.createElement("defs", null,
            React.createElement("marker", { id: `loop-arrow-${id}`, markerWidth: "12.5", markerHeight: "12.5", viewBox: "-10 -10 20 20", markerUnits: "strokeWidth", orient: "auto", refX: "0", refY: "0" },
                React.createElement("polyline", { stroke: "var(--color-df-edge-loop)", strokeLinecap: "round", strokeLinejoin: "round", fill: "var(--color-df-edge-loop)", points: "-5,-4 0,0 -5,4 -5,-4" }))))));
}
