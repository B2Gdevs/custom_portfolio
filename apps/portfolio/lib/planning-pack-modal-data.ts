import type {
  BuiltinEmbedPack,
  BuiltinEmbedPacksPayload,
  PlanningPackItem,
  PlanningPackManifest,
} from 'repo-planner/planning-pack';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function normalizePath(filePath: string) {
  return filePath.replace(/\\/g, '/');
}

function basename(filePath: string) {
  const normalizedPath = normalizePath(filePath);
  const segments = normalizedPath.split('/').filter(Boolean);
  return segments.at(-1) ?? normalizedPath;
}

function titleFromPath(filePath: string) {
  const filename = basename(filePath);
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex <= 0) {
    return filename || filePath;
  }

  return filename.slice(0, lastDotIndex) || filename;
}

export function builtinPackToPlanningPackItems(
  pack: BuiltinEmbedPack,
  createObjectUrl: (input: { content: string; filename: string }) => string,
): PlanningPackItem[] {
  return pack.files.map((file) => {
    const normalizedPath = normalizePath(file.path);
    const filename = basename(normalizedPath);

    return {
      id: `${pack.id}:${normalizedPath}`,
      title: titleFromPath(normalizedPath),
      file: createObjectUrl({
        content: file.content,
        filename,
      }),
      filename,
      section: `builtin/${pack.id}`,
      sectionLabel: pack.label,
      slug: slugify(normalizedPath),
    } satisfies PlanningPackItem;
  });
}

export function mergePlanningPackManifestWithBuiltinPacks(input: {
  manifest: PlanningPackManifest | null;
  builtinPayload: BuiltinEmbedPacksPayload | null;
  createObjectUrl: (input: { content: string; filename: string }) => string;
}): PlanningPackManifest | null {
  const { manifest, builtinPayload, createObjectUrl } = input;

  if (!manifest && !builtinPayload) {
    return null;
  }

  const builtinItems = (builtinPayload?.packs ?? []).flatMap((pack) =>
    builtinPackToPlanningPackItems(pack, createObjectUrl),
  );

  return {
    version: manifest?.version ?? 1,
    generatedAt: manifest?.generatedAt ?? builtinPayload?.generatedAt ?? new Date().toISOString(),
    demo: [...(manifest?.demo ?? []), ...builtinItems],
    site: manifest?.site ?? [],
  };
}
