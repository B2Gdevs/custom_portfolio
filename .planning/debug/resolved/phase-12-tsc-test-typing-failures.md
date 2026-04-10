---
status: resolved
trigger: "Investigate issue: phase-12-tsc-test-typing-failures"
created: 2026-04-10T01:15:47.0547208-05:00
updated: 2026-04-10T01:29:58.4298952-05:00
---

## Current Focus

hypothesis: confirmed root cause is stale, overly narrow type inference inside the two test-local mutable mock fixtures
test: human verification in the real workflow is still needed, but self-checks already cover targeted typecheck, focused Vitest, regenerated `.next/types`, and full-project `tsc`
expecting: the user should now see `npm.cmd exec -- tsc --noEmit` succeed in `vendor/grime-time-site`
next_action: ask the user to confirm the issue is resolved in their environment or report any remaining failure

## Symptoms

expected: `npm.cmd exec -- tsc --noEmit` succeeds in `vendor/grime-time-site`
actual: TypeScript fails in two test files with type mismatches
errors: `tests/int/blocks/service-grid-inline-editing.int.spec.tsx` reports `Type '"interactive"' is not assignable to type '"featureCards"'` and object literals include a `media` property missing from the expected item type. `tests/int/components/admin-impersonation/inline-page-media-editor.int.spec.tsx` reports a media-slot object is not assignable to type `never`.
reproduction: From `vendor/grime-time-site`, run `npm.cmd exec -- tsc --noEmit`
started: These failures were already present immediately after the webhook/provider-sync slice passed focused tests.

## Eliminated

## Evidence

- timestamp: 2026-04-10T01:16:25.0000000-05:00
  checked: `.planning/debug/knowledge-base.md`
  found: File does not exist, so there is no prior resolved pattern for these type failures.
  implication: Investigate from first principles and record the outcome in this session file.

- timestamp: 2026-04-10T01:17:18.0000000-05:00
  checked: `npm.cmd exec -- tsc --noEmit`
  found: TypeScript fails immediately on dozens of missing files under `.next/types/**` referenced by `tsconfig.json`, before reaching the two reported test-file errors.
  implication: Verification needs either regenerated Next type artifacts or a clean `.next/types` state; the reported test typing issue must be isolated separately from this generated-file problem.

- timestamp: 2026-04-10T01:21:44.0000000-05:00
  checked: `tests/int/blocks/service-grid-inline-editing.int.spec.tsx`, `tests/int/components/admin-impersonation/inline-page-media-editor.int.spec.tsx`, and the related Payload/composer types
  found: Both tests seed mutable toolbar state with untyped object literals, so TypeScript infers the narrow initial literal shape instead of the broader `ServiceGridBlock`/page-composer contract used at runtime.
  implication: The fix should be localized to the test fixtures by annotating them with the real types or typed helper factories rather than widening production code.

- timestamp: 2026-04-10T01:25:09.0000000-05:00
  checked: `npm.cmd exec -- tsc --noEmit -p tsconfig.phase12-tests.json`
  found: The targeted TypeScript project containing only the two affected tests now passes after typing the mocks to the real document/service-grid/media registry contracts.
  implication: The original provider-sync test typing regressions are fixed; remaining work is regression coverage and full-project verification.

- timestamp: 2026-04-10T01:25:50.0000000-05:00
  checked: `npm.cmd exec -- vitest run tests/int/blocks/service-grid-inline-editing.int.spec.tsx tests/int/components/admin-impersonation/inline-page-media-editor.int.spec.tsx --config ./vitest.config.mts` and `npm.cmd exec -- next typegen`
  found: Both focused integration specs passed, and Next regenerated 219 files under `.next/types`, removing the stale route-type state that originally blocked full `tsc`.
  implication: The repo is ready for final end-to-end TypeScript verification.

- timestamp: 2026-04-10T01:27:07.0000000-05:00
  checked: `npm.cmd exec -- tsc --noEmit`
  found: Full-project TypeScript verification now succeeds in `vendor/grime-time-site`.
  implication: The reported provider-sync typing regressions are fixed, and the project-wide typecheck is green after refreshing generated Next route types.

## Resolution

root_cause: The two failing tests mutated untyped local mock state, so TypeScript inferred the narrow initial literal shape instead of the real composer/service-grid/media contracts. In `service-grid-inline-editing`, that locked `serviceGridEditor.block` to a `featureCards`-only row shape with no `media`; in `inline-page-media-editor`, untyped registry and toolbar mocks collapsed later assignments to invalid or `never` targets.
fix: Typed the mutable test fixtures to the real Payload/composer document shapes, routed service-grid mutations through a `ServiceGridBlock`-typed editor block, typed the page-media registry and toolbar mocks explicitly, and regenerated Next `.next/types` before rerunning the full project typecheck.
verification: `npm.cmd exec -- tsc --noEmit -p tsconfig.phase12-tests.json`; `npm.cmd exec -- vitest run tests/int/blocks/service-grid-inline-editing.int.spec.tsx tests/int/components/admin-impersonation/inline-page-media-editor.int.spec.tsx --config ./vitest.config.mts`; `npm.cmd exec -- next typegen`; `npm.cmd exec -- tsc --noEmit`
files_changed: ["vendor/grime-time-site/tests/int/blocks/service-grid-inline-editing.int.spec.tsx", "vendor/grime-time-site/tests/int/components/admin-impersonation/inline-page-media-editor.int.spec.tsx"]
