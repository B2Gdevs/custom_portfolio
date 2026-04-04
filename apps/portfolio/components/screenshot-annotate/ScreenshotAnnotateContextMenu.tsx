'use client';

/**
 * Default tldraw context menu content only renders when the **select** tool is active.
 * For annotation, users often keep geo/text tools selected while editing — we show the
 * same modify/clipboard/reorder actions whenever the menu opens (shape hit-testing still applies).
 */
import {
  ArrangeMenuSubmenu,
  ClipboardMenuGroup,
  ConversionsMenuGroup,
  DefaultContextMenu,
  EditMenuSubmenu,
  ReorderMenuSubmenu,
  SelectAllMenuItem,
  TldrawUiMenuGroup,
  type TLUiContextMenuProps,
} from '@tldraw/tldraw';

export function ScreenshotAnnotateContextMenuContent() {
  return (
    <>
      <TldrawUiMenuGroup id="modify">
        <EditMenuSubmenu />
        <ArrangeMenuSubmenu />
        <ReorderMenuSubmenu />
      </TldrawUiMenuGroup>
      <ClipboardMenuGroup />
      <ConversionsMenuGroup />
      <TldrawUiMenuGroup id="select-all">
        <SelectAllMenuItem />
      </TldrawUiMenuGroup>
    </>
  );
}

export function ScreenshotAnnotateContextMenu({ children, disabled }: TLUiContextMenuProps) {
  return (
    <DefaultContextMenu disabled={disabled}>
      {children ?? <ScreenshotAnnotateContextMenuContent />}
    </DefaultContextMenu>
  );
}
