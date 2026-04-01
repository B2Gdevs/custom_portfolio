import type { CliModelTask } from './cli-config';

export type CatalogModel = {
  id: string;
  category: CliModelTask | 'text';
  recommendedFor?: string[];
  note?: string;
};

export const OPENAI_CURATED_MODELS: CatalogModel[] = [
  { id: 'gpt-4o-mini', category: 'chat', recommendedFor: ['prompt-composition', 'rag-summaries'] },
  { id: 'gpt-4.1-mini', category: 'chat', recommendedFor: ['higher-quality-prompting'] },
  { id: 'gpt-4.1-nano', category: 'chat', recommendedFor: ['lowest-cost-drafts'], note: 'Good default for cheap prompt drafts.' },
  { id: 'dall-e-3', category: 'image', recommendedFor: ['book-covers', 'marketing-images'] },
  { id: 'gpt-image-1', category: 'image', recommendedFor: ['iterative-edits', 'prompt-fidelity'] },
  { id: 'text-embedding-3-small', category: 'embedding', recommendedFor: ['rag-default'] },
  { id: 'text-embedding-3-large', category: 'embedding', recommendedFor: ['higher-recall-rag'] },
  { id: 'sora', category: 'video', recommendedFor: ['cinematic-video-tests'] },
];

export function recommendModelForTask(task: CliModelTask): string {
  switch (task) {
    case 'image':
      return 'dall-e-3';
    case 'chat':
      return 'gpt-4.1-nano';
    case 'embedding':
      return 'text-embedding-3-small';
    case 'video':
      return 'sora';
    default:
      return 'gpt-4o-mini';
  }
}

export function recommendCheapChatModel(): string {
  return 'gpt-4.1-nano';
}
