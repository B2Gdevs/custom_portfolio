# Books & reader – design and styling

Design and styling for book content and the RichEPub reader. Use Fumadocs as a **structural/component guide**, not a visual copy; aim for **book-like**, reading-first presentation.

## Book-like vs docs-like

- **Reading-first:** Serif or highly readable font for body, comfortable line length (~45–65 chars), clear hierarchy. Fewer “docs UI” chrome (sidebars, search, nav bars).
- **Fumadocs as guide:** Reuse ideas for **structure** (sections, callouts, nav, code blocks). **Styling** should be calmer and more book-like.

## Typography

- **Body:** Serif or readable sans; comfortable line-height (e.g. 1.6–1.7).
- **Scale:** Clear heading levels; body size readable on all devices.
- **Max-width:** Prose constrained (e.g. 42rem / 65ch) for line length.

## Components (Fumadocs-inspired, book-specific)

List what we want; implement later.

- **Callout / admonition:** Blockquote-style callouts (note, warning, etc.) with optional icon/title.
- **Chapter title / section divider:** Clear “part” vs “chapter” structure; optional decorative dividers.
- **Blockquote:** Styled quotes, optionally with attribution.
- **Figure with caption:** Image + caption block.
- **Code block:** Syntax-highlighted code (when needed in narrative).
- **TOC / sidebar (optional):** For .repub reader, optional sidebar or floating TOC; keep minimal so it doesn’t dominate.

Later: character/setting callouts, timeline, maps, etc.

## Theme

- **Modes:** Light, dark (and optionally sepia) for the reader.
- **Toggle:** Reader UI and/or system preference. Document how we want it to work (e.g. reader toolbar vs global theme).

## Future MDX reader

- The React-based .repub reader will use a **component map** for MDX (e.g. `Callout`, `ChapterTitle`, custom blocks).
- **Framer Motion:** Use in layout (chapter transition, scroll-triggered reveals) and in custom MDX components (e.g. Callout expand, image reveal). Keep animations **subtle** so they don’t distract from reading.
- MDX in that context can use Framer Motion via the components we provide in the map (client components).

## Single source, two outputs

Same `books/<slug>/` source → **EPUB** (HTML, base64 images) and **RichEPub** (static HTML today; React+MDX bundle later). One requirements doc (`.planning/REQUIREMENTS.md`) and this design doc keep the intent clear.
