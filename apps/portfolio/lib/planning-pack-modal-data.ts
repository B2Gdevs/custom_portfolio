import type {
  BuiltinEmbedPack,
  BuiltinEmbedPacksPayload,
  PlanningPackGalleryTab,
  PlanningPackItem,
  PlanningPackManifest,
} from 'repo-planner/planning-pack';

const STARTER_TEMPLATE_TAB_ID = 'starter-template';
const SITE_PACKS_TAB_ID = 'site-planning-packs';
const INIT_PACK_ID = 'rp-builtin-init';

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

function findBuiltinPack(packs: BuiltinEmbedPacksPayload['packs'], packId: string) {
  return packs.find((pack) => pack.id === packId) ?? null;
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length;
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
      archivePath: normalizedPath,
      sizeBytes: byteLength(file.content),
      section: `builtin/${pack.id}`,
      sectionLabel: pack.label,
      slug: slugify(normalizedPath),
    } satisfies PlanningPackItem;
  });
}

export function buildPlanningPackGalleryTabs(input: {
  manifest: PlanningPackManifest | null;
  builtinPayload: BuiltinEmbedPacksPayload | null;
  createObjectUrl: (input: { content: string; filename: string }) => string;
}): PlanningPackGalleryTab[] {
  const { manifest, builtinPayload, createObjectUrl } = input;
  const builtinPacks = builtinPayload?.packs ?? [];
  const initPack = findBuiltinPack(builtinPacks, INIT_PACK_ID);

  const starterItems = initPack
    ? builtinPackToPlanningPackItems(initPack, createObjectUrl)
    : (manifest?.demo ?? []);
  const siteItems = manifest?.site ?? [];

  return [
    {
      id: STARTER_TEMPLATE_TAB_ID,
      label: 'Starter Planning Pack',
      icon: '📦',
      description: '',
      items: starterItems,
      mode: 'sections',
      emptyMessage:
        'Starter template unavailable. Run `pnpm planning:embed-packs`, `pnpm dev`, or `pnpm run build` to regenerate the init pack.',
    },
    {
      id: SITE_PACKS_TAB_ID,
      label: 'Site Planning Packs',
      icon: '📦',
      description: '',
      items: siteItems,
      mode: 'collapsible-sections',
      emptyMessage: 'This site has no published planning packs yet.',
    },
  ];
}
