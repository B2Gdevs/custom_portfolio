"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoomControls = ZoomControls;
const react_1 = __importDefault(require("react"));
function ZoomControls({ scale, onZoomIn, onZoomOut, onZoomFit, onZoomToSelection, className }) {
    const zoomPercent = Math.round(scale * 100);
    return (react_1.default.createElement("div", { className: `flex flex-col gap-1 ${className}` },
        react_1.default.createElement("div", { className: "bg-[#0d0d14] border border-[#2a2a3e] rounded px-2 py-1 text-xs text-gray-400 text-center mb-1" },
            zoomPercent,
            "%"),
        react_1.default.createElement("div", { className: "flex flex-col gap-1 bg-[#0d0d14] border border-[#2a2a3e] rounded-lg p-1" },
            react_1.default.createElement("button", { onClick: onZoomIn, className: "p-1.5 hover:bg-[#1a1a2e] rounded text-gray-400 hover:text-white transition-colors", title: "Zoom In (Ctrl +)" },
                react_1.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    react_1.default.createElement("circle", { cx: "11", cy: "11", r: "8" }),
                    react_1.default.createElement("line", { x1: "11", y1: "8", x2: "11", y2: "14" }),
                    react_1.default.createElement("line", { x1: "8", y1: "11", x2: "14", y2: "11" }))),
            react_1.default.createElement("button", { onClick: onZoomOut, className: "p-1.5 hover:bg-[#1a1a2e] rounded text-gray-400 hover:text-white transition-colors", title: "Zoom Out (Ctrl -)" },
                react_1.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    react_1.default.createElement("circle", { cx: "11", cy: "11", r: "8" }),
                    react_1.default.createElement("line", { x1: "8", y1: "11", x2: "14", y2: "11" }))),
            react_1.default.createElement("div", { className: "h-px bg-[#2a2a3e] my-1" }),
            react_1.default.createElement("button", { onClick: onZoomFit, className: "p-1.5 hover:bg-[#1a1a2e] rounded text-gray-400 hover:text-white transition-colors", title: "Zoom to Fit (Ctrl 0)" },
                react_1.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    react_1.default.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                    react_1.default.createElement("path", { d: "M8 8h8v8" }))),
            onZoomToSelection && (react_1.default.createElement("button", { onClick: onZoomToSelection, className: "p-1.5 hover:bg-[#1a1a2e] rounded text-gray-400 hover:text-white transition-colors", title: "Zoom to Selection" },
                react_1.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    react_1.default.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                    react_1.default.createElement("path", { d: "M8 8h8v8" }),
                    react_1.default.createElement("circle", { cx: "12", cy: "12", r: "2" })))))));
}
