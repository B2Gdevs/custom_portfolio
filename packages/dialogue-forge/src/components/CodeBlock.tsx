import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = 'typescript', className = '' }: CodeBlockProps) {
  return (
    <div className={`bg-[#12121a] rounded border border-[#2a2a3e] overflow-hidden ${className}`}>
      <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto p-4 m-0">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}

