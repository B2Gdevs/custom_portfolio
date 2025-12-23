"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeBlock = CodeBlock;
const react_1 = __importDefault(require("react"));
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const prism_1 = require("react-syntax-highlighter/dist/esm/styles/prism");
function CodeBlock({ code, language = 'typescript', className = '' }) {
    return (react_1.default.createElement("div", { className: `bg-[#12121a] rounded border border-[#2a2a3e] overflow-hidden ${className}` },
        react_1.default.createElement(react_syntax_highlighter_1.Prism, { language: language, style: prism_1.vscDarkPlus, customStyle: {
                margin: 0,
                padding: '1rem',
                background: '#12121a',
                fontSize: '0.75rem',
                lineHeight: '1.5',
                borderRadius: 0,
            }, codeTagProps: {
                style: {
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                }
            }, PreTag: "div" }, code)));
}
