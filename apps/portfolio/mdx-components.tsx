import type { MDXComponents } from 'mdx/types';
import { useMDXComponents as useBaseMDXComponents } from '@/lib/mdx';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return useBaseMDXComponents(components);
}

