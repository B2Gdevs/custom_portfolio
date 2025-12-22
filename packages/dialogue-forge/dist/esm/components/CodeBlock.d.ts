import React from 'react';
interface CodeBlockProps {
    code: string;
    language?: string;
    className?: string;
}
export declare function CodeBlock({ code, language, className }: CodeBlockProps): React.JSX.Element;
export {};
