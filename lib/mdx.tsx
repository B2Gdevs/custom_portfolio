import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import { CodeBlock } from '@/components/docs/CodeBlock';
import YouTubeEmbed from '@/components/projects/YouTubeEmbed';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    img: (props) => {
      // Handle both regular img tags and Next.js Image
      if (props.src) {
        return (
          <div className="my-8 rounded-lg overflow-hidden border border-border shadow-lg">
            <Image
              src={props.src as string}
              alt={props.alt || ''}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
            />
            {props.alt && (
              <p className="text-sm text-text-muted text-center py-2 bg-dark-alt border-t border-border">
                {props.alt}
              </p>
            )}
          </div>
        );
      }
      return <img {...props} />;
    },
    h1: (props) => (
      <h1 
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24" 
        {...props} 
      />
    ),
    h2: (props) => (
      <h2 
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24" 
        {...props} 
      />
    ),
    h3: (props) => (
      <h3 
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24" 
        {...props} 
      />
    ),
    h4: (props) => (
      <h4 
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24" 
        {...props} 
      />
    ),
    p: (props) => (
      <p {...props} />
    ),
    a: (props) => (
      <a
        className="font-medium hover:underline underline-offset-2 transition-colors"
        {...props}
      />
    ),
    code: (props: any) => {
      // Inline code - only style if it's a simple string without newlines
      if (typeof props.children === 'string' && !props.children.includes('\n')) {
        return (
          <code
            className="bg-dark-alt px-1.5 py-0.5 rounded text-sm font-mono border border-border"
            style={{ color: '#f87171' }}
            {...props}
          />
        );
      }
      // Code block - rehype-pretty-code handles syntax highlighting
      // Just pass through to preserve the structure with spans
      return <code {...props} />;
    },
    pre: (props: any) => {
      // rehype-pretty-code already transforms the code block into a <pre> element
      // with syntax highlighting spans inside. We should NOT wrap it in another <pre>
      const codeElement = props.children;
      
      if (!codeElement || typeof codeElement !== 'object') {
        return (
          <pre
            className="bg-dark-alt border border-border rounded-lg p-4 overflow-x-auto mb-6 text-sm"
            {...props}
          />
        );
      }

      // Get code props - rehype-pretty-code adds data-language to the pre element
      const codeProps = codeElement.props || {};
      const className = codeProps.className || '';
      const dataLanguage = props['data-language'] || codeProps['data-language'] || '';
      
      // Extract language from className or data-language
      const langMatch = className.match(/language-(\w+)/);
      const language = langMatch ? langMatch[1] : dataLanguage;
      
      // Pass the pre element directly (rehype-pretty-code already created it with syntax highlighting)
      // props contains the pre element attributes, props.children contains the code element
      return (
        <CodeBlock
          className={className}
          data-language={language}
          preProps={props}
        >
          {codeElement}
        </CodeBlock>
      );
    },
    ul: (props) => (
      <ul className="list-disc list-outside mb-6 space-y-2 ml-6 text-text" {...props} />
    ),
    ol: (props) => (
      <ol className="list-decimal list-outside mb-6 space-y-2 ml-6 text-text" {...props} />
    ),
    li: (props) => (
      <li className="text-base leading-7 pl-2" {...props} />
    ),
    blockquote: (props) => (
      <blockquote
        className="border-l-4 border-accent/30 pl-6 py-2 my-6 italic text-text-muted bg-dark-alt/50 rounded-r"
        {...props}
      />
    ),
    hr: (props) => (
      <hr className="my-8 border-border" {...props} />
    ),
    table: (props) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-border rounded-lg" {...props} />
      </div>
    ),
    th: (props) => (
      <th className="border border-border bg-dark-alt px-4 py-3 text-left font-semibold text-primary" {...props} />
    ),
    td: (props) => (
      <td className="border border-border px-4 py-3 text-text" {...props} />
    ),
    YouTube: (props: { url: string; title?: string }) => (
      <YouTubeEmbed url={props.url} title={props.title} />
    ),
    ...components,
  };
}
