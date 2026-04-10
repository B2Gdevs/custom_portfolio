# GAD Debug Knowledge Base

Resolved debug sessions. Used by `gad-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## phase-12-tsc-test-typing-failures — TypeScript test mocks narrowed service-grid and media slot fixture types too far
- **Date:** 2026-04-10
- **Error patterns:** service-grid-inline-editing.int.spec.tsx, inline-page-media-editor.int.spec.tsx, interactive, featureCards, media property, not assignable to never, type mismatch
- **Root cause:** The two failing tests mutated untyped local mock state, so TypeScript inferred the narrow initial literal shape instead of the real composer/service-grid/media contracts. In `service-grid-inline-editing`, that locked `serviceGridEditor.block` to a `featureCards`-only row shape with no `media`; in `inline-page-media-editor`, untyped registry and toolbar mocks collapsed later assignments to invalid or `never` targets.
- **Fix:** Typed the mutable test fixtures to the real Payload/composer document shapes, routed service-grid mutations through a `ServiceGridBlock`-typed editor block, typed the page-media registry and toolbar mocks explicitly, and regenerated Next `.next/types` before rerunning the full project typecheck.
- **Files changed:** vendor/grime-time-site/tests/int/blocks/service-grid-inline-editing.int.spec.tsx, vendor/grime-time-site/tests/int/components/admin-impersonation/inline-page-media-editor.int.spec.tsx
---
