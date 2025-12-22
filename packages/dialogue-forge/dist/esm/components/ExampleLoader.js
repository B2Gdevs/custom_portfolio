import React from 'react';
import { listExamples, listDemoFlagSchemas, getExampleDialogue, getDemoFlagSchema } from '../examples';
export function ExampleLoader({ onLoadDialogue, onLoadFlags }) {
    const handleDialogueChange = (e) => {
        const name = e.target.value;
        if (name) {
            const dialogue = getExampleDialogue(name);
            if (dialogue) {
                onLoadDialogue(dialogue);
            }
        }
    };
    const handleFlagsChange = (e) => {
        const name = e.target.value;
        if (name) {
            const flags = getDemoFlagSchema(name);
            if (flags) {
                onLoadFlags(flags);
            }
        }
    };
    return (React.createElement("div", { className: "flex items-center gap-3" },
        React.createElement("select", { onChange: handleDialogueChange, defaultValue: "", className: "bg-[#12121a] border border-[#2a2a3e] text-white text-sm px-3 py-1.5 rounded hover:border-[#3a3a4e] focus:outline-none focus:border-[#e94560] cursor-pointer", title: "Load Dialogue Example" },
            React.createElement("option", { value: "", disabled: true }, "Dialogue Example..."),
            listExamples().map(name => {
                const dialogue = getExampleDialogue(name);
                if (!dialogue)
                    return null;
                const nodeCount = Object.keys(dialogue.nodes).length;
                return (React.createElement("option", { key: name, value: name },
                    dialogue.title,
                    " (",
                    nodeCount,
                    " nodes)"));
            }).filter(Boolean)),
        React.createElement("select", { onChange: handleFlagsChange, defaultValue: "", className: "bg-[#12121a] border border-[#2a2a3e] text-white text-sm px-3 py-1.5 rounded hover:border-[#3a3a4e] focus:outline-none focus:border-[#e94560] cursor-pointer", title: "Load Flag Schema" },
            React.createElement("option", { value: "", disabled: true }, "Flag Schema..."),
            listDemoFlagSchemas().map(name => {
                const flags = getDemoFlagSchema(name);
                return (React.createElement("option", { key: name, value: name },
                    name.charAt(0).toUpperCase() + name.slice(1),
                    " (",
                    flags?.flags.length || 0,
                    " flags)"));
            }))));
}
