# Session Handoff

**Saved:** 2026-04-04
**Next:** `global-auth-03-03` COMPLETE — ready for a DB migration + smoke-test pass, then `global-auth-04` or next milestone

## Position

| Field | Value |
|-------|-------|
| Current task | global-auth-03-03 complete |
| Last action | invite token model, CLI commands, accept route + page, tests |
| Repo state | Modified files uncommitted — see below |

## What was built (global-auth-03-03)

### New files
- `lib/payload/collections/inviteTokens.ts` — Payload collection (email, tenant, role, tokenHash, expiresAt, acceptedAt, revokedAt, createdBy)
- `lib/auth/invite.ts` — core invite library: generate/hash token, create, verify, consume, revoke, acceptInvite
- `scripts/revoke-invite.ts` — `pnpm auth:revoke-invite`
- `scripts/set-user-role.ts` — `pnpm auth:set-role`
- `scripts/disable-user.ts` — `pnpm auth:disable-user`
- `app/api/auth/invite/accept/route.ts` — GET (verify) + POST (consume + login), rate-limited, CSRF-safe
- `app/invite/accept/page.tsx` — acceptance UI (matches login page style)
- `tests/unit/lib/auth-invite.test.ts` — 19 tests covering pure helpers + mocked Payload
- `tests/unit/app/api/invite-routes.test.ts` — 12 tests covering GET + POST paths

### Modified files
- `lib/payload/collections/users.ts` — added `disabled` field
- `scripts/invite-user.ts` — replaced direct user creation with invite token flow (outputs accept URL)
- `payload.config.ts` — registered `inviteTokens` collection
- `package.json` — added `auth:revoke-invite`, `auth:set-role`, `auth:disable-user` scripts

## Test status
- 31 new tests: all pass
- 3 pre-existing failures (payload-admin-mount, planning-pack-modal-data, SiteCopilot) — unrelated

## What still needs doing before this is production-ready
- `pnpm db:generate && pnpm db:migrate` — create the `inviteTokens` table in the DB
- Smoke test: `pnpm auth:invite -- --email=test@x.com --role=member --tenant-slug=magicborn-studios`
- Verify accept page renders correctly at `/invite/accept?token=...`
- Disabled-user login enforcement: the `disabled` field is on the User model but Payload's built-in auth does NOT block login for a disabled user — need to either: (a) add a `beforeLogin` hook in the users collection, or (b) handle it in `auth-worker.ts`

## Key constraint: disabled user login is not yet enforced
Payload's auth doesn't natively gate on a custom `disabled` field. Options:
1. Add `hooks: { beforeLogin: [checkDisabled] }` to the users collection
2. After payload.auth() in session.ts, check viewer.user?.disabled

## GAD planning track status

| Phase | Status |
|-------|--------|
| global-planning-01 | planning (arch spec done) |
| global-planning-02 | complete |
| global-planning-03 | complete |
| global-planning-04 | planning (XML migration gated on 02-01 + 03-02) |
| global-planning-05 | not started |
| global-auth-03-03 | complete |
