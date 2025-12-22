"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YarnView = YarnView;
const react_1 = __importDefault(require("react"));
const yarn_converter_1 = require("../lib/yarn-converter");
function YarnView({ dialogue, onExport, onImport }) {
    const fileInputRef = react_1.default.useRef(null);
    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result;
            if (onImport) {
                onImport(content);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };
    return (react_1.default.createElement("main", { className: "flex-1 flex flex-col bg-[#0d0d14] overflow-hidden" },
        react_1.default.createElement("div", { className: "border-b border-[#1a1a2e] px-4 py-2 flex items-center justify-between flex-shrink-0" },
            react_1.default.createElement("span", { className: "text-sm text-gray-400" }, "Yarn Spinner Output"),
            react_1.default.createElement("div", { className: "flex items-center gap-2" },
                onImport && (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("button", { onClick: () => fileInputRef.current?.click(), className: "px-3 py-1.5 bg-[#2a2a3e] hover:bg-[#3a3a4e] text-gray-300 text-sm rounded flex items-center gap-2" },
                        react_1.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                            react_1.default.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                            react_1.default.createElement("polyline", { points: "17 8 12 3 7 8" }),
                            react_1.default.createElement("line", { x1: "12", y1: "3", x2: "12", y2: "15" })),
                        "Import .yarn"),
                    react_1.default.createElement("input", { ref: fileInputRef, type: "file", accept: ".yarn", onChange: handleImport, className: "hidden" }))),
                react_1.default.createElement("button", { onClick: onExport, className: "px-3 py-1.5 bg-[#e94560] hover:bg-[#d63850] text-white text-sm rounded flex items-center gap-2" },
                    react_1.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                        react_1.default.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                        react_1.default.createElement("polyline", { points: "7 10 12 15 17 10" }),
                        react_1.default.createElement("line", { x1: "12", y1: "15", x2: "12", y2: "3" })),
                    "Download .yarn"))),
        react_1.default.createElement("div", { className: "flex-1 overflow-y-auto p-4 min-h-0" },
            react_1.default.createElement("pre", { className: "font-mono text-sm text-gray-300 whitespace-pre-wrap bg-[#08080c] rounded-lg p-4 border border-[#1a1a2e]" }, (0, yarn_converter_1.exportToYarn)(dialogue)))));
}
