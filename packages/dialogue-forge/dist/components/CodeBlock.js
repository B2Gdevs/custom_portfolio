"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeBlock = CodeBlock;
const react_1 = __importDefault(require("react"));
function CodeBlock({ code, language = 'typescript', className = '' }) {
    return (react_1.default.createElement("div", { className: `bg-[#12121a] rounded border border-[#2a2a3e] overflow-hidden ${className}` },
        react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto p-4 m-0" },
            react_1.default.createElement("code", { className: `language-${language}` }, code))));
}
