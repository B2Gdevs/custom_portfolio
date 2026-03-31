import { ragChunks } from '@/lib/payload/collections/ragChunks';
import { listenMediaAssets } from '@/lib/payload/collections/listenMediaAssets';
import { publishedBookArtifacts } from '@/lib/payload/collections/publishedBookArtifacts';
import { siteMediaAssets } from '@/lib/payload/collections/siteMediaAssets';

type SimpleField = {
  name: string;
  type: string;
};

function isSimpleField(value: unknown): value is SimpleField {
  return Boolean(value) && typeof value === 'object' && 'name' in value && 'type' in value;
}

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();
}

function toSqlColumnName(field: SimpleField) {
  const base = toSnakeCase(field.name);
  return field.type === 'relationship' ? `${base}_id` : base;
}

describe('payload collection contracts', () => {
  it('avoids SQL column collisions in rag-chunks fields', () => {
    const fields = (ragChunks.fields ?? []).filter(isSimpleField);
    const seen = new Map<string, string>();
    const duplicates: Array<{ column: string; names: string[] }> = [];

    for (const field of fields) {
      const column = toSqlColumnName(field);
      const existing = seen.get(column);
      if (existing) {
        duplicates.push({ column, names: [existing, field.name] });
        continue;
      }

      seen.set(column, field.name);
    }

    expect(duplicates).toEqual([]);
  });

  it('avoids SQL column collisions in published-book-artifacts fields', () => {
    const fields = (publishedBookArtifacts.fields ?? []).filter(isSimpleField);
    const seen = new Map<string, string>();
    const duplicates: Array<{ column: string; names: string[] }> = [];

    for (const field of fields) {
      const column = toSqlColumnName(field);
      const existing = seen.get(column);
      if (existing) {
        duplicates.push({ column, names: [existing, field.name] });
        continue;
      }

      seen.set(column, field.name);
    }

    expect(duplicates).toEqual([]);
  });

  it('avoids SQL column collisions in site-media-assets fields', () => {
    const fields = (siteMediaAssets.fields ?? []).filter(isSimpleField);
    const seen = new Map<string, string>();
    const duplicates: Array<{ column: string; names: string[] }> = [];

    for (const field of fields) {
      const column = toSqlColumnName(field);
      const existing = seen.get(column);
      if (existing) {
        duplicates.push({ column, names: [existing, field.name] });
        continue;
      }

      seen.set(column, field.name);
    }

    expect(duplicates).toEqual([]);
  });

  it('avoids SQL column collisions in listen-media-assets fields', () => {
    const fields = (listenMediaAssets.fields ?? []).filter(isSimpleField);
    const seen = new Map<string, string>();
    const duplicates: Array<{ column: string; names: string[] }> = [];

    for (const field of fields) {
      const column = toSqlColumnName(field);
      const existing = seen.get(column);
      if (existing) {
        duplicates.push({ column, names: [existing, field.name] });
        continue;
      }

      seen.set(column, field.name);
    }

    expect(duplicates).toEqual([]);
  });
});
