import { createHash } from 'node:crypto';
import type { RagChunkDraft, RagSourceDocument } from './types';

const TARGET_CHARS = 1400;
const MIN_CHARS = 350;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sha(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function estimateTokenCount(value: string): number {
  return Math.max(1, Math.round(value.trim().split(/\s+/).length * 1.2));
}

interface Section {
  heading: string;
  anchor: string;
  body: string;
}

function splitIntoSections(document: RagSourceDocument): Section[] {
  const lines = document.body.split('\n');
  const sections: Section[] = [];
  let currentHeading = document.title;
  let currentAnchor = '';
  let buffer: string[] = [];

  const flush = () => {
    const body = stripMarkdown(buffer.join('\n'));
    if (!body) {
      buffer = [];
      return;
    }
    sections.push({
      heading: currentHeading,
      anchor: currentAnchor,
      body,
    });
    buffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flush();
      currentHeading = stripMarkdown(headingMatch[2]).trim() || document.title;
      currentAnchor = slugify(currentHeading);
      continue;
    }
    buffer.push(line);
  }

  flush();

  return sections.length
    ? sections
    : [
        {
          heading: document.title,
          anchor: '',
          body: stripMarkdown(document.body),
        },
      ];
}

function splitSectionIntoChunks(section: Section): string[] {
  if (section.body.length <= TARGET_CHARS) {
    return [section.body];
  }

  const paragraphs = section.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const paragraph of paragraphs) {
    const nextValue = current ? `${current}\n\n${paragraph}` : paragraph;
    if (nextValue.length > TARGET_CHARS && current.length >= MIN_CHARS) {
      chunks.push(current);
      current = paragraph;
      continue;
    }
    current = nextValue;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length ? chunks : [section.body];
}

export function chunkRagSource(document: RagSourceDocument): RagChunkDraft[] {
  const sections = splitIntoSections(document);
  const chunks: RagChunkDraft[] = [];
  let chunkIndex = 0;

  for (const section of sections) {
    for (const chunkBody of splitSectionIntoChunks(section)) {
      const content = section.heading
        ? `${section.heading}\n\n${chunkBody}`.trim()
        : chunkBody.trim();

      if (!content) {
        continue;
      }

      chunks.push({
        chunkIndex,
        heading: section.heading,
        anchor: section.anchor,
        content,
        tokenCount: estimateTokenCount(content),
        contentChecksum: sha(content),
      });
      chunkIndex += 1;
    }
  }

  return chunks;
}
