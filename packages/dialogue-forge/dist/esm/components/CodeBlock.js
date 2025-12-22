import React from 'react';
export function CodeBlock({ code, language = 'typescript', className = '' }) {
    return (React.createElement("div", { className: `bg-[#12121a] rounded border border-[#2a2a3e] overflow-hidden ${className}` },
        React.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto p-4 m-0" },
            React.createElement("code", { className: `language-${language}` }, code))));
}
