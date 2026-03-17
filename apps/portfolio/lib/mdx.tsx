import type { MDXComponents } from 'mdx/types';
import React, { type ComponentProps } from 'react';
import Image from 'next/image';
import { CodeBlock } from '@/components/docs/CodeBlock';
import YouTubeEmbed from '@/components/projects/YouTubeEmbed';
import BookReaderEmbed from '@/components/books/BookReaderEmbed';
import Callout from '@/components/blog/Callout';
import DocLinkCard from '@/components/blog/DocLinkCard';

function buildMDXComponents(components: MDXComponents): MDXComponents {
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
      return <img {...(props as ComponentProps<'img'>)} alt={props.alt ?? ''} />;
    },
    h1: (props) => (
      <h1
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24"
        {...(props as ComponentProps<'h1'>)}
      />
    ),
    h2: (props) => (
      <h2
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24"
        {...(props as ComponentProps<'h2'>)}
      />
    ),
    h3: (props) => (
      <h3
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24"
        {...(props as ComponentProps<'h3'>)}
      />
    ),
    h4: (props) => (
      <h4
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24"
        {...(props as ComponentProps<'h4'>)}
      />
    ),
    p: (props) => <p {...(props as ComponentProps<'p'>)} />,
    a: (props) => (
      <a
        className="font-medium hover:underline underline-offset-2 transition-colors"
        {...(props as ComponentProps<'a'>)}
      />
    ),
    code: (props) => {
      // Inline code - only style if it's a simple string without newlines
      if (typeof props.children === 'string' && !props.children.includes('\n')) {
        return (
          <code
            className="bg-dark-alt px-1.5 py-0.5 rounded text-sm font-mono border border-border"
            style={{ color: '#f87171' }}
            {...(props as ComponentProps<'code'>)}
          />
        );
      }
      // Code block - rehype-pretty-code handles syntax highlighting
      // Just pass through to preserve the structure with spans
      return <code {...(props as ComponentProps<'code'>)} />;
    },
    pre: (props) => {
      // rehype-pretty-code already transforms the code block into a <pre> element
      // with syntax highlighting spans inside. We should NOT wrap it in another <pre>
      const codeElement = props.children;
      
      if (!codeElement || !React.isValidElement(codeElement)) {
        return (
          <pre
            className="bg-dark-alt border border-border rounded-lg p-4 overflow-x-auto mb-6 text-sm"
            {...(props as ComponentProps<'pre'>)}
          />
        );
      }

      // Get code props - rehype-pretty-code adds data-language to the pre element
      const codeProps = (codeElement.props || {}) as { className?: string; 'data-language'?: string };
      const className = codeProps.className || '';
      const dataLanguage = (props as Record<string, unknown>)['data-language'] || codeProps['data-language'] || '';
      
      // Extract language from className or data-language
      const langMatch = className.match(/language-(\w+)/);
      const language: string = langMatch ? langMatch[1] : String(dataLanguage ?? '');
      
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
      <ul className="list-disc list-outside mb-6 space-y-2 ml-6 text-text" {...(props as ComponentProps<'ul'>)} />
    ),
    ol: (props) => (
      <ol className="list-decimal list-outside mb-6 space-y-2 ml-6 text-text" {...(props as ComponentProps<'ol'>)} />
    ),
    li: (props) => (
      <li className="text-base leading-7 pl-2" {...(props as ComponentProps<'li'>)} />
    ),
    blockquote: (props) => (
      <blockquote
        className="border-l-4 border-accent/30 pl-6 py-2 my-6 italic text-text-muted bg-dark-alt/50 rounded-r"
        {...(props as ComponentProps<'blockquote'>)}
      />
    ),
    hr: (props) => (
      <hr className="my-8 border-border" {...(props as ComponentProps<'hr'>)} />
    ),
    table: (props) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-border rounded-lg" {...(props as ComponentProps<'table'>)} />
      </div>
    ),
    th: (props) => (
      <th className="border border-border bg-dark-alt px-4 py-3 text-left font-semibold text-primary" {...(props as ComponentProps<'th'>)} />
    ),
    td: (props) => (
      <td className="border border-border px-4 py-3 text-text" {...(props as ComponentProps<'td'>)} />
    ),
    YouTube: (props: { url: string; title?: string }) => (
      <YouTubeEmbed url={props.url} title={props.title} />
    ),
    BookReaderEmbed: (props: { slug: string; title?: string }) => (
      <BookReaderEmbed slug={props.slug} title={props.title} />
    ),
    Callout: (props: { type?: 'info' | 'tip' | 'note' | 'warning'; title?: string; children?: React.ReactNode }) => (
      <Callout type={props.type} title={props.title}>{props.children}</Callout>
    ),
    DocLinkCard: (props: { href: string; title: string; description?: string }) => (
      <DocLinkCard href={props.href} title={props.title} description={props.description} />
    ),
    ...components,
  };
}

/** Hook for use in client components. */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return buildMDXComponents(components);
}

/** Plain function for use in server components (e.g. async blog page). */
export function getMDXComponents(components: MDXComponents = {}): MDXComponents {
  return buildMDXComponents(components);
}
