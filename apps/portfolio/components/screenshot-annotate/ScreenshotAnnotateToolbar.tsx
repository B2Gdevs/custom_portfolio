'use client';

import {
  DefaultToolbar,
  HandToolbarItem,
  RectangleToolbarItem,
  SelectToolbarItem,
  TextToolbarItem,
} from '@tldraw/tldraw';

/** Four tools only: Select, Hand, Rectangle (geo), Text — per screenshot-annotate requirements. */
export function ScreenshotAnnotateToolbar() {
  return (
    <DefaultToolbar minItems={4} maxItems={4} minSizePx={200} maxSizePx={360}>
      <SelectToolbarItem />
      <HandToolbarItem />
      <RectangleToolbarItem />
      <TextToolbarItem />
    </DefaultToolbar>
  );
}
