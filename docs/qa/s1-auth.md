# S1-QA — Auth Module — QA Report

**Task:** POL-54 (S1-QA: Auth Module — QA + Acceptance)
**Branch under test:** `main` @ `0b5c0b7` (latest auth/RBAC code)
**Tester:** AH-QA
**Date:** 2026-05-30

## Overall verdict

**FAIL — CRITICAL.** 5 CRITICAL ACs and 2 HIGH items fail. Auth module
must not ship in current state. Reassign to AH-BE for remediation.

## Method

- Static code review of `backend/src/modules/auth/*`,
  `backend/src/modules/users/*`,
  `backend/src/modules/bidder-agent/*`,
  `backend/src/common/guards/*`,
  `backend/src/common/filters/*`,
  `backend/src/app.module.ts`.
- Ran `jest src/modules/auth src/modules/users src/common/guards
  src/modules/bidder-agent` — 91/91 unit tests pass (but the tests assert
  current code, not SRS acceptance criteria — see findings below).
- Frontend Playwright + Vitest suites and full backend e2e against a
  live MySQL+Redis were not executed: the dev host is at 100% disk
  (`/dev/sda1 19G 19G 40M 100%`), so `npm install` for fresh deps fails
  with `ENOSPC`. Backend unit tests run via a symlinked `node_modules`
  from a sibling worktree (same `package.json` modulo DB driver). UI
  acceptance items below are marked **NOT EXECUTED** and must be re-run
  by FE before tech review.

## Results per checklist item

| # | AC / Item | Severity | Result | Evidence |
|---|-----------|----------|--------|----------|
| 1 | AC-1.1 Register → verification email within 60s, login blocked until verified | CRITICAL | **FAIL** | `backend/src/modules/auth/auth.service.ts:47` — `// TODO: send email via NotificationsService when available`. Verification token is only `console.log`-ed in non-prod and is never persisted to an email channel. SendGrid is in `dependencies` but not wired. Login-blocked half passes (`status !== 'active'` rejects). |
| 2 | AC-1.2 Duplicate email → `EMAIL_ALREADY_EXISTS` | CRITICAL | **FAIL** | `auth.service.ts:36` throws `ConflictException('Email already registered')`. Response body has `detail: "Email already registered"` (filter at `common/filters/http-exception.filter.ts`). No machine-readable `code: "EMAIL_ALREADY_EXISTS"` is emitted. Clients cannot branch on the error. |
| 3 | AC-1.3 Unverified email → `EMAIL_NOT_VERIFIED` (403) | CRITICAL | **FAIL** | `auth.service.ts:71-73` throws `UnauthorizedException` → HTTP **401**, not 403. Message is `"Account not active. Please verify your email first."` — no `EMAIL_NOT_VERIFIED` code. Both the status code and the code string are wrong. |
| 4 | AC-1.4 Freelancer register → Bidder Agent auto-provisioned (DORMANT) | CRITICAL | **FAIL (partial)** | Provisioning fires (`bidder-agent.service.ts:69-74` `@OnEvent('user.registered')` → `provision(userId)`), so a `bidder_agents` row exists. **But** the entity has no `DORMANT` state: `bidder-agent.entity.ts:11-15` defines `BidderAgentStatus { ACTIVE, PAUSED, DISABLED }` and column default `ACTIVE` (entity.ts:28). New agents are immediately `ACTIVE` with `autoBidEnabled=true`. |
| 5 | AC-1.5 Bidder Agent stays DORMANT until first Workforce Agent connects | CRITICAL | **FAIL** | Same enum gap as #4. There is no Workforce-Agent-connect transition handler that flips the bidder agent from dormant to active. `bidder-agent.service.ts:77-89` (`onJobPosted`) will already enqueue scoring jobs for a freshly registered freelancer's agent because its status is `ACTIVE` from creation. |
| 6 | AC-1.6 Google OAuth — role selected on first login | CRITICAL | **FAIL** | `auth.controller.ts:91-97` `googleCallback` calls `loginOAuth(oauthUser, undefined, res)` and immediately `res.redirect(FRONTEND_URL)`. `auth.service.ts:79-102` `loginOAuth` then defaults `defaultRole = UserRole.FREELANCER` and silently creates the account. A Buyer cannot register via Google; no "choose role" handshake exists. |
| 7 | AC-1.7 Buyer cannot reach `/api/v1/agents`, `/api/v1/configuration` → 403 | CRITICAL | **PASS** | `bidder-agent.controller.ts:84-85` `@UseGuards(JwtAuthGuard, RolesGuard) @Roles('freelancer')`. `roles.guard.ts:21` throws `ForbiddenException` → 403. No Buyer-accessible route is exposed under these prefixes. |
| 8 | AC-1.8 Freelancer cannot reach `/api/v1/jobs/create`, `/api/v1/jobs/:id/bids` → 403 | CRITICAL | **PASS** | `jobs/jobs.controller.ts:42-43,122-123` apply `RolesGuard` + `@Roles('buyer')` on `POST /jobs` and `GET /jobs/:id/bids`. 403 path identical to #7. |
| 9 | AC-1.9 Non-admin cannot reach `/api/v1/admin/*` → 403 | CRITICAL | **PASS** | `admin/admin.controller.ts:29-31` applies `@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')` at controller scope. All admin routes inherit. |
| 10 | AC-1.10 Single account cannot hold both roles | CRITICAL | **PASS** | `auth.service.ts:35-36` rejects any second registration for the same email regardless of submitted role. `user.entity.ts:35-36` stores a single `role` column, so dual-role state is structurally impossible. |
| 11 | JWT cookie HttpOnly / Secure / SameSite=Lax | HIGH | **FAIL** | `auth.service.ts:17-23` `COOKIE_OPTS` sets `sameSite: 'strict'`, not `lax`. This will break the Google OAuth callback flow (top-level cross-site redirect) on browsers that drop `strict`-scoped cookies on cross-site navigation. `httpOnly: true` ✓ and `secure: NODE_ENV === 'production'` ✓ are fine. |
| 12 | Expired JWT → 401; refresh extends session | HIGH | **PASS** | `config/configuration.ts` (`jwt.accessExpiry='15m'`) feeds `auth.service.ts:124-126`. `JwtStrategy` rejects expired tokens with 401 (Passport default). Refresh rotates and persists via `users.service.ts:93-119` (bcrypt-hashed at rest, prior token revoked on rotation). |
| 13 | Login rate limit — 11th attempt within 15min → 429 | HIGH | **FAIL** | `auth.controller.ts:30` `@Throttle({ default: { limit: 10, ttl: 60000 } })`. Window is 60 seconds, not 15 minutes. The 11th request in **one minute** is rejected, but a slower attacker (≤10/min sustained) is never rate-limited within the 15-min window the AC requires. |
| 14 | Frontend form validation messages | MEDIUM | **NOT EXECUTED** | Disk-full prevented running Playwright. Static check: `frontend/app/(auth)/register/page.tsx` etc. exist and `frontend/e2e/auth.spec.ts` is present. FE must re-run before tech review. |
| 15 | Verified page auto-redirects to dashboard in 3-5s | MEDIUM | **NOT EXECUTED** | Same reason as #14. |

## Reproduction steps for each CRITICAL failure

### #1 — AC-1.1 (no email sent)

1. `grep -n "TODO: send email" backend/src/modules/auth/auth.service.ts`
   → line 47. Confirms the email channel is unimplemented.
2. `grep -rn "@sendgrid/mail" backend/src` → zero matches. SendGrid is
   in `package.json` only.
3. Expected: `NotificationsService.sendVerificationEmail()` (or
   equivalent) called within `register()`. Actual: never called.

### #2 — AC-1.2 (no `EMAIL_ALREADY_EXISTS` code)

1. `POST /api/v1/auth/register` twice with the same email.
2. Expected response body:
   `{"code":"EMAIL_ALREADY_EXISTS", ...}` (or equivalent
   machine-readable code).
3. Actual response body (from `AllExceptionsFilter`):
   `{"type":"https://httpstatuses.com/409","title":"CONFLICT","status":409,"detail":"Email already registered", ...}`.
   No code field; client must string-match `detail`.

### #3 — AC-1.3 (wrong status + code)

1. `POST /api/v1/auth/register` then immediately `POST /api/v1/auth/login`
   with the same credentials.
2. Expected: HTTP **403** with body containing
   `code: "EMAIL_NOT_VERIFIED"`.
3. Actual: HTTP **401** with
   `detail: "Account not active. Please verify your email first."`.
   Wrong status, no code.

### #4 / #5 — AC-1.4 / AC-1.5 (no DORMANT state)

1. Register a freelancer:
   `POST /api/v1/auth/register { email, password, role: "freelancer" }`.
2. Query DB:
   `SELECT status, auto_bid_enabled FROM bidder_agents WHERE user_id = ?`.
3. Expected: `status='DORMANT'`, `auto_bid_enabled=false` until a
   Workforce Agent connects.
4. Actual: `status='active'`, `auto_bid_enabled=true` (default per
   `bidder-agent.entity.ts:28,55`). Posting any job (`job.posted` event)
   will enqueue scoring for this agent immediately
   (`bidder-agent.service.ts:77-89`).

### #6 — AC-1.6 (OAuth defaults to freelancer)

1. New user, no prior account. Hit `/api/v1/auth/google`, complete
   Google consent.
2. Expected: redirected to a "choose role" page before account
   creation; only buyer or freelancer choices commit the account.
3. Actual: `googleCallback` → `loginOAuth(..., defaultRole = FREELANCER)`
   → user row created with `role='freelancer'`, then immediate redirect
   to `FRONTEND_URL`. A user who intended to be a Buyer is silently
   locked into Freelancer.

### #11 — SameSite=strict not Lax

1. Inspect any `Set-Cookie` header from `POST /auth/login`:
   `SameSite=Strict; HttpOnly; Path=/; ...`
2. Expected: `SameSite=Lax`.
3. Practical impact: the OAuth callback (top-level cross-site redirect
   from `accounts.google.com`) will not send the freshly-set cookie on
   the next request in Strict mode.

### #13 — Throttle window wrong

1. `for i in {1..11}; do curl -sS -o /dev/null -w "%{http_code}\n"
   -XPOST .../auth/login -d '{"email":"a@b.com","password":"x"}'
   -H 'content-type: application/json'; done`
2. Eleventh request returns 429 within 1 minute (the existing
   `@Throttle` window). But spread across 90 seconds the 11th attempt
   succeeds, because the bucket has already refilled — fails the AC's
   15-minute window.

## Unit-test run

```
PASS src/modules/auth/strategies/google.strategy.spec.ts
PASS src/modules/auth/strategies/jwt.strategy.spec.ts
PASS src/modules/users/users.service.spec.ts
PASS src/modules/auth/auth.service.spec.ts
PASS src/modules/auth/auth.controller.spec.ts
PASS src/modules/bidder-agent/scoring.service.spec.ts
PASS src/common/guards/roles.guard.spec.ts
PASS src/modules/bidder-agent/bidder-agent.controller.spec.ts
PASS src/modules/bidder-agent/bidder-agent.processor.spec.ts
PASS src/modules/bidder-agent/bidder-agent.service.spec.ts

Tests: 91 passed, 91 total
```

These tests pass because they were written against the current
implementation rather than the SRS. For example
`auth.service.spec.ts:116-121` asserts `UnauthorizedException` on
unverified login — that test is itself encoding the AC-1.3 defect.
Suite green ≠ AC satisfied.

## Required fixes (for AH-BE)

The Definition of Done says *all CRITICAL ACs pass*. To get there:

1. Wire `NotificationsService.sendVerificationEmail()` (or equivalent
   SendGrid path) into `AuthService.register()`. Add an integration
   test that asserts an email is enqueued/sent.
2. Define structured error codes (`EMAIL_ALREADY_EXISTS`,
   `EMAIL_NOT_VERIFIED`, etc.) and surface them in
   `AllExceptionsFilter` output (e.g. a `code` field). Throw a
   `ForbiddenException` (or a custom 403 exception) for the
   unverified-login case so AC-1.3 returns 403 + code.
3. Add `DORMANT` to `BidderAgentStatus`. Default the column to
   `DORMANT`. Default `autoBidEnabled=false`. Add a transition
   (`activate()`) called the first time a Workforce Agent connects;
   gate `onJobPosted` on `status === ACTIVE`.
4. OAuth role selection: split the callback. On *first* OAuth login
   when no `users` row exists, redirect to a `/auth/complete-profile`
   page; only commit the row after a role POST. Existing accounts skip
   the prompt.
5. Cookie `sameSite` → `'lax'`.
6. Replace `@Throttle({ limit: 10, ttl: 60000 })` on `AuthController`
   with `{ limit: 10, ttl: 900_000 }` (15-min window) — or scope to
   `login` only and keep register/refresh on a separate limit.

## Routing

- Label: `state:qa-failed`.
- Reassign: AH-BE (originating dev for `feat(S1-BE)`).
