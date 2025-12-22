import React, { useRef } from 'react';
import { NODE_TYPE } from '../types/constants';
const MINIMAP_SIZE = 200;
const NODE_SIZE = 4;
export function Minimap({ dialogue, viewport, onNavigate, className }) {
    const minimapRef = useRef(null);
    // Calculate bounds of all nodes
    const bounds = React.useMemo(() => {
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
    return (React.createElement("div", { ref: minimapRef, className: `absolute bottom-4 right-4 bg-[#0d0d14] border border-[#2a2a3e] rounded-lg overflow-hidden ${className}`, style: { width: MINIMAP_SIZE, height: MINIMAP_SIZE }, onClick: handleClick },
        React.createElement("svg", { width: MINIMAP_SIZE, height: MINIMAP_SIZE, className: "absolute inset-0" },
            React.createElement("rect", { width: MINIMAP_SIZE, height: MINIMAP_SIZE, fill: "#0d0d14" }),
            React.createElement("defs", null,
                React.createElement("pattern", { id: "minimapGrid", width: "10", height: "10", patternUnits: "userSpaceOnUse" },
                    React.createElement("path", { d: "M 10 0 L 0 0 0 10", fill: "none", stroke: "#1a1a2e", strokeWidth: "0.5" }))),
            React.createElement("rect", { width: MINIMAP_SIZE, height: MINIMAP_SIZE, fill: "url(#minimapGrid)" }),
            Object.values(dialogue.nodes).map(node => {
                const x = (node.x - bounds.minX) * scale;
                const y = (node.y - bounds.minY) * scale;
                const color = node.type === NODE_TYPE.NPC ? '#e94560' : '#8b5cf6';
                return (React.createElement("g", { key: node.id },
                    React.createElement("rect", { x: x, y: y, width: NODE_SIZE * 2, height: NODE_SIZE * 2, fill: color, opacity: 0.6, stroke: color, strokeWidth: "0.5" }),
                    node.id === dialogue.startNodeId && (React.createElement("circle", { cx: x + NODE_SIZE, cy: y + NODE_SIZE, r: NODE_SIZE * 1.5, fill: "none", stroke: "#22c55e", strokeWidth: "1", opacity: 0.8 }))));
            }),
            React.createElement("rect", { x: viewportX, y: viewportY, width: viewportWidth, height: viewportHeight, fill: "none", stroke: "#06b6d4", strokeWidth: "2", opacity: 0.8, strokeDasharray: "4 4" })),
        React.createElement("div", { className: "absolute top-1 left-1 text-[8px] text-gray-500 bg-[#0d0d14]/80 px-1 rounded" }, "Minimap")));
}
