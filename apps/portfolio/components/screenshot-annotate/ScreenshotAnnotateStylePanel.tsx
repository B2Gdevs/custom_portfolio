'use client';

/**
 * Stroke, fill, color, and text controls for the four-tool screenshot annotate surface.
 * Omits arrow/line-only pickers that stay empty here but add noise in the default panel.
 */
import {
  DefaultStylePanel,
  StylePanelColorPicker,
  StylePanelDashPicker,
  StylePanelFillPicker,
  StylePanelFontPicker,
  StylePanelGeoShapePicker,
  StylePanelLabelAlignPicker,
  StylePanelOpacityPicker,
  StylePanelSection,
  StylePanelSizePicker,
  StylePanelTextAlignPicker,
  type TLUiStylePanelProps,
} from '@tldraw/tldraw';

export function ScreenshotAnnotateStylePanel(props: TLUiStylePanelProps) {
  return (
    <DefaultStylePanel {...props}>
      <StylePanelSection>
        <StylePanelColorPicker />
        <StylePanelOpacityPicker />
      </StylePanelSection>
      <StylePanelSection>
        <StylePanelFillPicker />
        <StylePanelDashPicker />
        <StylePanelSizePicker />
      </StylePanelSection>
      <StylePanelSection>
        <StylePanelFontPicker />
        <StylePanelTextAlignPicker />
        <StylePanelLabelAlignPicker />
      </StylePanelSection>
      <StylePanelSection>
        <StylePanelGeoShapePicker />
      </StylePanelSection>
    </DefaultStylePanel>
  );
}
