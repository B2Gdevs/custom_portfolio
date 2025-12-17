'use client';

import React, { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { Terminal, Code, FileCode } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  'data-language'?: string;
  'data-label'?: string;
  preProps?: any;
}

const languageIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  bash: Terminal,
  sh: Terminal,
  shell: Terminal,
  terminal: Terminal,
  typescript: Code,
  javascript: Code,
  ts: Code,
  js: Code,
  tsx: Code,
  jsx: Code,
  json: FileCode,
  yaml: FileCode,
  yml: FileCode,
};

// Default to Terminal icon if label contains "Terminal"
const getIconForLabel = (label: string, language: string) => {
  if (label.toLowerCase().includes('terminal')) {
    return Terminal;
  }
  return languageIcons[language.toLowerCase()] || Code;
};

export function CodeBlock({ children, className = '', preProps, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  
  // Extract language from className (e.g., "language-bash" -> "bash")
  const language = props['data-language'] || 
    className
      .split(' ')
      .find(cls => cls.startsWith('language-'))
      ?.replace('language-', '') || '';

  // Get label from data-label
  let label = props['data-label'];
  if (!label) {
    label = language ? language.charAt(0).toUpperCase() + language.slice(1) : 'Code';
  }
  
  // Get icon for language or label
  const Icon = getIconForLabel(label, language);

  const copyToClipboard = async () => {
    if (!codeRef.current) return;
    
    // Get text content from the code element (which contains all the syntax highlighting spans)
    const codeElement = codeRef.current.querySelector('code');
    const code = codeElement?.textContent || codeRef.current.textContent || '';
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Create the pre element with rehype-pretty-code structure
  // preProps contains all the attributes from rehype-pretty-code
  // children is the code element with syntax highlighting spans
  
  return (
    <div className="relative group my-6 overflow-hidden rounded-lg border border-border bg-dark-alt">
      {/* Header bar - Docus style */}
      <div className="flex items-center gap-2 border-b border-border bg-dark-alt px-4 py-2.5">
        <Icon size={14} className="shrink-0 text-green-300" />
        <span className="text-green-200 text-xs font-medium">{label}</span>
        
        {/* Copy button - always visible on mobile, hover on desktop */}
        <button
          type="button"
          onClick={copyToClipboard}
          aria-label="Copy code to clipboard"
          className="ml-auto rounded-md inline-flex items-center text-xs gap-1.5 text-green-300 hover:text-green-200 hover:bg-dark-elevated p-1.5 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
        >
          {copied ? (
            <Check size={14} className="shrink-0 text-accent-4" />
          ) : (
            <Copy size={14} className="shrink-0" />
          )}
        </button>
      </div>
      
      {/* Code block - create pre element with rehype-pretty-code props and children */}
      <pre
        ref={codeRef}
        {...preProps}
        className={`${preProps?.className || ''} m-0 border-0 rounded-none bg-transparent !px-6 py-4 overflow-x-auto`}
        style={{ 
          marginTop: 0,
          marginBottom: 0,
          ...preProps?.style 
        }}
      >
        {children}
      </pre>
    </div>
  );
}

