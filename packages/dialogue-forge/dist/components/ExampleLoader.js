"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleLoader = ExampleLoader;
const react_1 = __importDefault(require("react"));
const examples_1 = require("../examples");
function ExampleLoader({ onLoadDialogue, onLoadFlags }) {
    const handleDialogueChange = (e) => {
        const name = e.target.value;
        if (name) {
            const dialogue = (0, examples_1.getExampleDialogue)(name);
            if (dialogue) {
                onLoadDialogue(dialogue);
            }
        }
    };
    const handleFlagsChange = (e) => {
        const name = e.target.value;
        if (name) {
            const flags = (0, examples_1.getDemoFlagSchema)(name);
            if (flags) {
                onLoadFlags(flags);
            }
        }
    };
    return (react_1.default.createElement("div", { className: "flex items-center gap-3" },
        react_1.default.createElement("select", { onChange: handleDialogueChange, defaultValue: "", className: "bg-[#12121a] border border-[#2a2a3e] text-white text-sm px-3 py-1.5 rounded hover:border-[#3a3a4e] focus:outline-none focus:border-[#e94560] cursor-pointer", title: "Load Dialogue Example" },
            react_1.default.createElement("option", { value: "", disabled: true }, "Dialogue Example..."),
            (0, examples_1.listExamples)().map(name => {
                const dialogue = (0, examples_1.getExampleDialogue)(name);
                if (!dialogue)
                    return null;
                const nodeCount = Object.keys(dialogue.nodes).length;
                return (react_1.default.createElement("option", { key: name, value: name },
                    dialogue.title,
                    " (",
                    nodeCount,
                    " nodes)"));
            }).filter(Boolean)),
        react_1.default.createElement("select", { onChange: handleFlagsChange, defaultValue: "", className: "bg-[#12121a] border border-[#2a2a3e] text-white text-sm px-3 py-1.5 rounded hover:border-[#3a3a4e] focus:outline-none focus:border-[#e94560] cursor-pointer", title: "Load Flag Schema" },
            react_1.default.createElement("option", { value: "", disabled: true }, "Flag Schema..."),
            (0, examples_1.listDemoFlagSchemas)().map(name => {
                const flags = (0, examples_1.getDemoFlagSchema)(name);
                return (react_1.default.createElement("option", { key: name, value: name },
                    name.charAt(0).toUpperCase() + name.slice(1),
                    " (",
                    flags?.flags.length || 0,
                    " flags)"));
            }))));
}
