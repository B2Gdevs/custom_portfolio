import React from 'react';
export function ZoomControls({ scale, onZoomIn, onZoomOut, onZoomFit, onZoomToSelection, className }) {
    const zoomPercent = Math.round(scale * 100);
    return (React.createElement("div", { className: `flex flex-col gap-1 ${className}` },
        React.createElement("div", { className: "bg-[#0d0d14] border border-[#2a2a3e] rounded px-2 py-1 text-xs text-gray-400 text-center mb-1" },
            zoomPercent,
            "%"),
        React.createElement("div", { className: "flex flex-col gap-1 bg-[#0d0d14] border border-[#2a2a3e] rounded-lg p-1" },
            React.createElement("button", { onClick: onZoomIn, className: "p-1.5 hover:bg-[#1a1a2e] rounded text-gray-400 hover:text-white transition-colors", title: "Zoom In (Ctrl +)" },
                React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
                    React.createElement("line", { x1: "11", y1: "8", x2: "11", y2: "14" }),
                    React.createElement("line", { x1: "8", y1: "11", x2: "14", y2: "11" }))),
            React.createElement("button", { onClick: onZoomOut, className: "p-1.5 hover:bg-[#1a1a2e] rounded text-gray-400 hover:text-white transition-colors", title: "Zoom Out (Ctrl -)" },
                React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
                    React.createElement("line", { x1: "8", y1: "11", x2: "14", y2: "11" }))),
            React.createElement("div", { className: "h-px bg-[#2a2a3e] my-1" }),
            React.createElement("button", { onClick: onZoomFit, className: "p-1.5 hover:bg-[#1a1a2e] rounded text-gray-400 hover:text-white transition-colors", title: "Zoom to Fit (Ctrl 0)" },
                React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    React.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                    React.createElement("path", { d: "M8 8h8v8" }))),
            onZoomToSelection && (React.createElement("button", { onClick: onZoomToSelection, className: "p-1.5 hover:bg-[#1a1a2e] rounded text-gray-400 hover:text-white transition-colors", title: "Zoom to Selection" },
                React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    React.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                    React.createElement("path", { d: "M8 8h8v8" }),
                    React.createElement("circle", { cx: "12", cy: "12", r: "2" })))))));
}
