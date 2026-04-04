# Session Handoff

**Saved:** 2026-04-03
**Next:** `global-auth-03-03` — invite token model, accept route, CLI commands, tests

## Position

| Field | Value |
|-------|-------|
| Current task | Ready to start global-auth-03-03 |
| Last action | global-planning-02/03/04 partial + 05-01 done |
| Repo state | Clean (only `m vendor/grime-time-site` — untracked, ignore) |

## global-auth-03-03 — what to build

From `apps/portfolio/content/docs/global/planning/plans/global-auth-03/PLAN.mdx`:

### 1. Invite token model (Payload collection)
- Collection: `inviteTokens` — fields: `email`, `tenantId`, `role` (owner/admin/member), `tokenHash`, `expiresAt`, `acceptedAt`, `revokedAt`, `createdBy`
- Single-use + expiring + revocable + auditable
- Store token **hashed** (SHA-256), never plaintext

### 2. CLI commands (scripts/auth-ops.cjs or extend existing)
- `pnpm auth:invite <email> --role <admin|member> [--tenant <id>]` — creates invite, outputs accept URL
- `pnpm auth:revoke-invite <email>` — marks invite revoked
- `pnpm auth:set-role <email> --role <role>` — changes role on existing user
- `pnpm auth:disable-user <email>` — disables user + revokes outstanding invites

### 3. Accept-invite route + page
- `GET /invite/accept?token=<plaintext>` — verify token hash, show tenant/role context
- `POST /invite/accept` — set password, consume invite, log in user
- Rate-limit + CSRF-safe

### 4. Tests
- `tests/unit/lib/auth-invite.test.ts` — token creation, hashing, expiry, revoke logic
- `tests/unit/app/api/invite-routes.test.ts` — accept route: valid, expired, already-used, revoked

## Key files to read first

```
apps/portfolio/lib/payload/collections/  — existing collections (users, tenants)
apps/portfolio/scripts/auth-seed.cjs     — existing CLI auth pattern
apps/portfolio/app/api/auth/             — existing auth routes
apps/portfolio/lib/auth-viewer.ts        — entitlement helpers
```

## Verification target (from PLAN.mdx)
- invite new admin → works
- invite new member → works  
- re-invite existing user → upserts, no duplicate account
- revoke before acceptance → clean rejection
- expired invite → rejects cleanly
- member gets 403 on admin routes
- admin gets operator access

## GAD planning track status

| Phase | Status |
|-------|--------|
| global-planning-01 | planning (arch spec done) |
| global-planning-02 | complete |
| global-planning-03 | complete |
| global-planning-04 | planning (XML migration gated on 02-01 + 03-02) |
| global-planning-05 | not started |

## XML migration gate (still blocked)
- `02-01` in-progress: shared data/storage provider abstraction
- `03-02` in-progress: large git blobs / off-repo publish path
