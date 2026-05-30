# QA Report — S9: Admin Panel + Disputes (POL-77)

**Task:** POL-77 (S9-QA)
**Sprint:** S9
**QA owner:** AH-QA
**Date:** 2026-05-30
**Verdict:** **FAIL** — multiple CRITICAL items unimplemented or broken
**Route back to:** AH-BE (S9-BE, POL-75) primary · AH-FE (S9-FE, POL-76) secondary

**Repo state:** `main` @ `f103d52` (verified via `git log`). S9-BE merge commit `00d818d` (07bc521).

---

## Summary

S9-BE shipped only dispute filing, dispute resolution (FSM-only, no money movement),
user listing/suspension, and read-only platform stats. **Module 2 (Admin Management)
acceptance criteria for AC-2.1, AC-2.3, AC-2.4 are entirely unimplemented** —
no admin invite/create endpoint, no commission rate management endpoint, no
SystemConfig storage. **Module 11 (Disputes) is only partially implemented** —
no dispute detail endpoint, partial-refund logic does not actually refund or split
funds, no email notifications on resolution. Frontend dispute review page is wired
to non-existent or wrong-shape backend endpoints.

Of 12 checklist items: **2 PASS, 1 PARTIAL, 9 FAIL**.

---

## Checklist results

| ID | Severity | AC | Result | Notes |
|----|----------|----|--------|-------|
| AC-2.1 | CRITICAL | Admin creates new admin account; invite email sent; new admin can log in | **FAIL** | No backend endpoint. No FE UI. No invite/email flow. |
| AC-2.2 | CRITICAL | Admin deactivates admin account; deactivated account loses session immediately | **PARTIAL FAIL** | Status flip to `suspended` works. JWT validation does NOT check user status; existing cookie sessions remain valid until JWT expiry. |
| AC-2.3 | CRITICAL | Commission rate updated; new rate applies to next payout, not existing | **FAIL** | No `/admin/config` or `/admin/config/commission` endpoint. Commission read from `config.feePct` (env), unchangeable at runtime. |
| AC-2.4 | CRITICAL | Commission rate change logged in audit_log with actor ID + timestamp | **FAIL** | Cascading from AC-2.3 — no commission update path exists to log. |
| AC-11.1 | CRITICAL | Buyer or Freelancer raises dispute; Job → DISPUTED | **PASS** | `DisputesService.fileDispute` updates Job → DISPUTED, gates by buyer/freelancer identity, valid source statuses (`IN_PROGRESS`, `DELIVERED`, `REVISION`). |
| AC-11.2 | CRITICAL | Dispute creation requires reason ≥ 20 chars; shorter → rejected | **PASS** | `CreateDisputeDto` uses `@MinLength(20)`. Verified via unit-test coverage and manual DTO read. |
| AC-11.3 | CRITICAL | Admin views dispute queue with all context (job brief, deliverables, revision history, bid details) | **FAIL** | `GET /admin/disputes` returns only paginated `Dispute` rows — no join with Job, deliverables, revisions, or bids. No `GET /admin/disputes/:id` endpoint exists (FE expects one and 404s). |
| AC-11.4 | CRITICAL | Admin can: release funds, full refund, partial refund, extend revision | **FAIL** | `ResolutionOutcome` enum has only `BUYER`, `FREELANCER`, `PARTIAL` — **no `EXTEND_REVISION`**. Partial outcome flips payment status to `PARTIALLY_REFUNDED` but **never calls the payment gateway**. |
| AC-11.5 | CRITICAL | Resolution triggers payment action; both parties notified by email | **FAIL** | Status-only "payment action" (no gateway call for refund/partial). **Zero email/notification trigger on dispute resolution** — `disputes.service.ts` has no notification call; `notifications.*` has no dispute handler. |
| HIGH-1 | HIGH | Non-admin cannot access `/api/v1/admin/*` → 403 | **PASS** | `AdminController` uses `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`. `RolesGuard` throws `ForbiddenException` on role mismatch. |
| HIGH-2 | HIGH | Partial refund: correct amount released to Buyer; remainder handled correctly | **FAIL** | Same root cause as AC-11.4 — partial-refund path is a status flag only. No `gateway.refund(amount × percent / 100)` call, no remainder release to Freelancer, no platform-fee adjustment. `buyerRefundPercent` is persisted but never read. |

---

## Reproducible bug reports (route to AH-BE / AH-FE)

### BUG-S9-01 [CRITICAL] AC-2.1 — Admin account creation flow is missing entirely
- **Expected:** Authenticated admin POSTs to an endpoint (e.g. `POST /admin/users` with `{email, displayName, role: 'admin'}`); system creates user row with role=`admin`, status=`pending_verify`, sends invite email via SendGrid; recipient clicks invite, sets password, logs in.
- **Actual:** No route, no service method, no DTO, no FE button. The architecture doc references `/admin/config/commission` and admin invite flow, but none was implemented.
- **Steps:** `curl -X POST http://localhost:3000/api/v1/admin/users -H "Authorization: Bearer <admin-jwt>" -d '{"email":"new-admin@x.com","role":"admin"}'` → 404 Not Found.
- **Fix scope:** AH-BE — add `POST /admin/users` (DTO + service + audit-log emit + SendGrid invite template + accept-invite controller). AH-FE — add invite form to `/admin/accounts`.

### BUG-S9-02 [CRITICAL] AC-2.2 — Suspended user keeps JWT session until token expiry
- **Expected:** `PATCH /admin/users/:id/status {status:"suspended"}` invalidates all existing sessions immediately (next API call from that user → 401/403).
- **Actual:** `backend/src/modules/auth/strategies/jwt.strategy.ts:24-28` — `validate()` only checks user existence via `usersService.findById`, never inspects `user.status`. Suspended user keeps full access until JWT TTL elapses. Confirmed by code read.
- **Steps:** Log in as user U → store `access_token` cookie. As admin, suspend U. From U's cookie, hit any protected endpoint → still 200.
- **Fix scope:** AH-BE — in `JwtStrategy.validate`, throw `UnauthorizedException` when `user.status !== 'active'`. Also reject access in `RolesGuard` / `JwtAuthGuard` for suspended users. Add unit test.

### BUG-S9-03 [CRITICAL] AC-2.3 + AC-2.4 — Commission rate management not implemented
- **Expected:** `GET /admin/config/commission` returns current rate; `PATCH /admin/config/commission {rate: 0.15}` updates rate, applies to future `PaymentsService.fundEscrow` calls (not retro-active), and writes one audit_log row.
- **Actual:** No `SystemConfig` entity, no `/admin/config*` route. `PaymentsService.fundEscrow` reads `config.feePct` from env config (`backend/src/modules/payments/payments.service.ts:84`). Commission rate cannot be changed at runtime. FE `/admin/commission` page calls `/admin/config` (GET + PATCH) — both 404.
- **Fix scope:** AH-BE — add `SystemConfig` entity (or single-row settings table), seed default fee, add `GET`/`PATCH /admin/config/commission`, switch `fundEscrow` to read from DB-backed config, ensure audit-log interceptor (or explicit write) captures the change with actor_id + timestamp. AH-FE — verify FE shape matches.

### BUG-S9-04 [CRITICAL] AC-11.3 — Dispute detail endpoint missing; queue lacks context
- **Expected:** `GET /admin/disputes/:id` returns dispute with embedded job brief, deliverables list, revision history, bid details (for admin adjudication). Queue listing includes enough summary fields to triage.
- **Actual:** No `GET /admin/disputes/:id` exists in `AdminController` or `DisputesController`. `listDisputes` returns plain `Dispute` rows without joined Job / Payment / Bid / Delivery data. FE `frontend/app/(admin)/admin/disputes/[id]/page.tsx:26` calls `/admin/disputes/${id}` and 404s; the rendered detail fields (`details`, `againstUser`, etc.) are never populated.
- **Fix scope:** AH-BE — add `GET /admin/disputes/:id` returning Dispute + Job + Deliveries + Revisions + Bid summary. Optionally enrich `listDisputes` with summary fields. AH-FE — align fetched shape.

### BUG-S9-05 [CRITICAL] AC-11.4 — `extend revision` outcome missing; partial refund FE/BE shape mismatch
- **Expected:** Resolve dispute supports four outcomes: release-to-freelancer, full-refund-to-buyer, partial-refund, extend-revision-window. Each routes to correct payment + job-state action.
- **Actual:**
  - `ResolutionOutcome` enum (`backend/src/modules/disputes/dto/resolve-dispute.dto.ts:4-8`) defines only `BUYER`, `FREELANCER`, `PARTIAL` — no `EXTEND_REVISION`.
  - FE dispute detail (`frontend/app/(admin)/admin/disputes/[id]/page.tsx:39-42`) sends `PATCH /admin/disputes/:id/resolve` with body `{adminNote: note}` — backend `ResolveDisputeDto` requires `outcome` + `resolution` (+ `buyerRefundPercent` for partial). FE call will fail class-validator.
  - FE also calls `PATCH /admin/disputes/:id/cancel` — no such route.
- **Fix scope:** AH-BE — add `EXTEND_REVISION` outcome (extends `Job.deadline` and/or moves status back to `REVISION`, no payment movement). AH-FE — replace single "Mark Resolved" button with four outcome buttons matching backend enum; switch payload to `{outcome, resolution, buyerRefundPercent?}`; drop the `/cancel` call or implement it.

### BUG-S9-06 [CRITICAL] AC-11.4 + HIGH-2 — Partial refund does not actually refund or release
- **Expected:** Partial outcome with `buyerRefundPercent=X`: refund `amount × X/100` to Buyer via Ppay, release `amount × (1 - X/100) × (1 - commission)` to Freelancer, recompute platform fee on the released portion.
- **Actual:** `backend/src/modules/disputes/disputes.service.ts:104-115` only updates `payment.status = PARTIALLY_REFUNDED`. No `gateway.refund()` call. No release branch. No Freelancer payout. No fee recompute. `buyerRefundPercent` is saved on the Dispute row but never used to compute any amount. Money simply does not move.
- **Steps:** Seed a HELD Payment with amount=100. File dispute. Resolve PARTIAL with percent=50. Check Ppay gateway mock — no refund call recorded. Check Payment row — `releasedAt` and `refundedAt` are both null; only `status='partially_refunded'`.
- **Fix scope:** AH-BE — wire partial-refund branch to `gateway.refund(reference, ipnUrl, reason, amountOverride)` (or extend gateway API), then release the remainder to Freelancer; idempotency on retry. Add unit test asserting both gateway calls + final balances.

### BUG-S9-07 [CRITICAL] AC-11.5 — No email notifications on dispute resolution
- **Expected:** On resolution, send email to both Buyer and Freelancer with outcome + amount + reasoning.
- **Actual:** `disputes.service.ts` has zero imports from `notifications` or SendGrid adapter. `notifications.service.ts` has no `disputeResolved` / `disputeFiled` method. Search `dispute|resolveDispute` in `backend/src/modules/notifications` → 0 matches.
- **Fix scope:** AH-BE — emit `dispute.resolved` event (EventEmitter2 already wired for `payment.released`); add notification listener; add SendGrid template; cover both parties.

---

## Tests run

- Unit: `npx jest --testPathPattern="(admin|disputes)"` → 44/44 pass, 4 suites. (Coverage of what IS implemented is fine; what's NOT implemented isn't tested.)
- Build: `npm run build` → clean (NestJS compiles).
- Integration: not performed — failing the gate at the implementation-coverage layer makes runtime integration testing premature. Will run on resubmit.

---

## Routing

Per WORKFLOW: any unresolved CRITICAL → `state:qa-failed`, reassign to originating dev.

- Primary owner: **AH-BE** — 6 of 7 bug reports above are backend gaps. Reassigning POL-77 to AH-BE with this report linked.
- FE-side fixes (BUG-S9-05 UI, BUG-S9-04 fetched-shape alignment): AH-FE should pick up after BE re-issues the contract. Not blocking BE handoff; AH-BE should flag AH-FE in the resubmit comment.

**Do not** route to AH-TL until all CRITICAL items pass.
