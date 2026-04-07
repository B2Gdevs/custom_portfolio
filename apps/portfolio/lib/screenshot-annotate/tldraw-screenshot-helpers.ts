import { createShapeId, type Editor, type TLAssetId, type TLShapeId } from '@tldraw/tldraw';
import { findRedactWordMatches, type RedactKind } from './redact-patterns';
import { runTesseractWords } from './ocr-words';

/** First image on the page (base screenshot). */
export function getFirstImageShapeId(editor: Editor): TLShapeId | null {
  const image = editor.getCurrentPageShapes().find((s) => s.type === 'image');
  return image?.id ?? null;
}

/**
 * Map Tesseract bbox (image pixel space, origin top-left) to page-space rectangle.
 * Uses image asset intrinsic size vs page bounds scale.
 */
export function pixelBBoxToPageRect(
  editor: Editor,
  imageShapeId: TLShapeId,
  bbox: { x0: number; y0: number; x1: number; y1: number },
  padPx = 2,
): { x: number; y: number; w: number; h: number } | null {
  const shape = editor.getShape(imageShapeId);
  if (!shape || shape.type !== 'image') return null;
  const pageBounds = editor.getShapePageBounds(imageShapeId);
  if (!pageBounds) return null;
  if (!('props' in shape) || !shape.props || !('assetId' in shape.props)) return null;
  const assetId = shape.props.assetId as TLAssetId | null;
  if (!assetId) return null;
  const asset = editor.getAsset(assetId);
  if (!asset || asset.type !== 'image') return null;
  const iw = asset.props.w;
  const ih = asset.props.h;
  if (typeof iw !== 'number' || typeof ih !== 'number' || iw <= 0 || ih <= 0) return null;

  const pad = padPx;
  const x0 = Math.max(0, bbox.x0 - pad);
  const y0 = Math.max(0, bbox.y0 - pad);
  const x1 = Math.min(iw, bbox.x1 + pad);
  const y1 = Math.min(ih, bbox.y1 + pad);

  const pbw = pageBounds.w;
  const pbh = pageBounds.h;
  const sx = pbw / iw;
  const sy = pbh / ih;

  return {
    x: pageBounds.x + x0 * sx,
    y: pageBounds.y + y0 * sy,
    w: Math.max(4, (x1 - x0) * sx),
    h: Math.max(4, (y1 - y0) * sy),
  };
}

/**
 * Keep pan/zoom tied to the screenshot so the camera does not drift into empty canvas.
 * Call after the base image is on the page (e.g. after `zoomToFit`).
 */
export function applyScreenshotCameraConstraints(editor: Editor): void {
  const id = getFirstImageShapeId(editor);
  if (!id) return;
  const b = editor.getShapePageBounds(id);
  if (!b) return;

  editor.setCameraOptions({
    constraints: {
      bounds: { x: b.x, y: b.y, w: b.w, h: b.h },
      padding: { x: 56, y: 56 },
      origin: { x: 0.5, y: 0.5 },
      initialZoom: 'fit-max-100',
      baseZoom: 'fit-max-100',
      behavior: 'contain',
    },
    zoomSteps: [0.35, 0.5, 0.65, 0.85, 1, 1.25, 1.5, 2, 2.5, 3],
  });

  editor.zoomToFit({ animation: { duration: 200 } });
}

export async function applyRedactPresetsToEditor(
  editor: Editor,
  file: File,
  kinds: RedactKind[],
  onProgress?: (status: string, progress: number) => void,
): Promise<{ added: number }> {
  const kindSet = new Set(kinds);
  const words = await runTesseractWords(file, onProgress);
  const matches = findRedactWordMatches(words, kindSet);
  const imageId = getFirstImageShapeId(editor);
  if (!imageId || matches.length === 0) return { added: 0 };

  const geoDefaults = editor.getShapeUtil('geo').getDefaultProps();

  let added = 0;
  for (const { word, kind } of matches) {
    const rect = pixelBBoxToPageRect(editor, imageId, word.bbox);
    if (!rect) continue;

    editor.createShape({
      id: createShapeId(),
      type: 'geo',
      x: rect.x,
      y: rect.y,
      rotation: 0,
      opacity: kind === 'email' ? 0.94 : 0.9,
      props: {
        ...geoDefaults,
        geo: 'rectangle',
        w: rect.w,
        h: rect.h,
        fill: 'solid',
        color: 'grey',
        labelColor: 'grey',
        dash: 'solid',
        size: 's',
      },
    });
    added += 1;
  }

  return { added };
}
