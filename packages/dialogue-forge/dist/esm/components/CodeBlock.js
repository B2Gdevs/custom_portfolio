import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
export function CodeBlock({ code, language = 'typescript', className = '' }) {
    return (React.createElement("div", { className: `bg-[#12121a] rounded border border-[#2a2a3e] overflow-hidden ${className}` },
        React.createElement(SyntaxHighlighter, { language: language, style: vscDarkPlus, customStyle: {
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
