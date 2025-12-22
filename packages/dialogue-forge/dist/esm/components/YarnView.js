import React from 'react';
import { exportToYarn } from '../lib/yarn-converter';
export function YarnView({ dialogue, onExport }) {
    return (React.createElement("main", { className: "flex-1 flex flex-col bg-[#0d0d14] overflow-hidden" },
        React.createElement("div", { className: "border-b border-[#1a1a2e] px-4 py-2 flex items-center justify-between flex-shrink-0" },
            React.createElement("span", { className: "text-sm text-gray-400" }, "Yarn Spinner Output"),
            React.createElement("button", { onClick: onExport, className: "px-3 py-1.5 bg-[#e94560] hover:bg-[#d63850] text-white text-sm rounded flex items-center gap-2" },
                React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    React.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                    React.createElement("polyline", { points: "7 10 12 15 17 10" }),
                    React.createElement("line", { x1: "12", y1: "15", x2: "12", y2: "3" })),
                "Download .yarn")),
        React.createElement("div", { className: "flex-1 overflow-y-auto p-4 min-h-0" },
            React.createElement("pre", { className: "font-mono text-sm text-gray-300 whitespace-pre-wrap bg-[#08080c] rounded-lg p-4 border border-[#1a1a2e]" }, exportToYarn(dialogue)))));
}
