import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

interface RehypeLineNode {
  children: Array<{ type: string; value?: string }>;
  properties?: { className?: string[] };
}

import { serialize } from 'next-mdx-remote/serialize';

type MdxOptionsType = NonNullable<Parameters<typeof serialize>[1]>;

export const mdxOptions: MdxOptionsType = {
  parseFrontmatter: false,
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
          properties: {
            className: ['anchor'],
          },
        },
      ],
      [
        rehypePrettyCode,
        {
          theme: 'github-dark',
          keepBackground: false,
          filter: (node: { tagName?: string; children?: unknown[] }) => {
            if (node.tagName !== 'pre') return true;
            const child = node.children?.[0] as
              | { properties?: { className?: string | string[] } }
              | undefined;
            const cls = child?.properties?.className;
            const list = Array.isArray(cls) ? cls : cls ? [cls] : [];
            return !list.some((c) => String(c).includes('language-mermaid'));
          },
          onVisitLine(node: RehypeLineNode) {
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }];
            }
          },
          onVisitHighlightedLine(node: RehypeLineNode) {
            if (node.properties?.className) {
              node.properties.className.push('highlighted');
            }
          },
          onVisitHighlightedWord(node: RehypeLineNode) {
            if (node.properties) {
              node.properties.className = ['word'];
            }
          },
        },
      ],
    ],
  },
};

