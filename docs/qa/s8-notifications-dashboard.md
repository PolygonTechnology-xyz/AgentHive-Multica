# S8-QA: Notifications + Dashboard — QA Report (Round 2)

- **Task:** POL-74 (S8-QA)
- **Date:** 2026-05-30
- **QA Branch:** `agent/ah-qa/1452560d` (checked out from `agent/ah-be/a0e56b2b`)
- **Verdict:** **FAIL — no progress since Round 1.**

## Headline

BE comment dated 2026-05-30T11:33Z claims the listeners, SSE route, and dashboard
endpoints have been implemented on branch `agent/ah-be/a0e56b2b`. That branch
exists but points at the same SHA as `main` (`f103d52`). `git diff main agent/ah-be/a0e56b2b`
is empty. No code was pushed. Every defect from Round 1 is still present in `main`.

```
$ git rev-parse main agent/ah-be/a0e56b2b
f103d524c7ced145e1dcc5cc936fff771270ef73
f103d524c7ced145e1dcc5cc936fff771270ef73
$ git log agent/ah-be/a0e56b2b --not main --oneline
(empty)
```

Also: claimed `docs/tasks/POL-74.md` does not exist. Claimed test count
`37 suites / 336 tests` — actual run reports `37 suites / 324 tests`.

## Per-AC Verification (verbatim re-check against `main` HEAD)

### AC-12.1 — Required emails — **FAIL**

- `backend/src/modules/notifications/notifications.service.ts:98–112` still has
  three stub `@OnEvent` listeners (`delivery.submitted`, `delivery.approved`,
  `payment.released`) whose bodies are `logger.log(...)` + TODO comments. No
  `this.notify(...)` call inside any listener.
- No `@OnEvent('bid.placed')`, `@OnEvent('bid.accepted')`,
  `@OnEvent('delivery.revision-requested')`, `@OnEvent('payment.confirmed')`,
  or `@OnEvent('payout.confirmed')` listener anywhere
  (`grep -r '@OnEvent(' backend/src` covered).
- No `eventEmitter.emit('bid.placed')` or `eventEmitter.emit('bid.accepted')`
  (`bids.service.ts` emits nothing). No `payout.*` event emitted anywhere.
- Sole non-test callers of `NotificationsService.notify` in `backend/src`:
  zero. The method exists but is unreached at runtime.

Net: zero of the seven required emails (bid-placed → Buyer, bid-won → Freelancer,
job-delivered → Buyer, revision-requested → Freelancer, payment-confirmation → both,
payout-confirmation → Freelancer) are produced.

### AC-12.2 — Freelancer dashboard live status (SSE) — **FAIL**

- `grep -r '@Sse\|Sse(' backend/src` → no matches. No SSE controller.
- `notifications.controller.ts` exposes `GET /notifications`, `PATCH
  /notifications/:id/read`, `PATCH /notifications/read-all` and nothing else.
- `frontend/hooks/useNotifications.ts` exists but is imported only by its own
  spec (`grep -rln useNotifications frontend` returns the hook + its test only).
  No dashboard page subscribes to it.

### AC-12.3 — BidderAgent award notification — **FAIL**

- `BidsService.accept` does not emit `bid.accepted` or call
  `notificationsService.notify`. No notification row is written for the winning
  freelancer when a bid is accepted.

### AC-13.1 — Active bids on dashboard — **FAIL** (transitive)

- Frontend dashboard fetch path still calls `/jobs/freelancer` (missing) and
  related routes; no useable bid stream surfaces.

### AC-13.2 — Active jobs + completed history — **FAIL**

- `JobsController` routes: `POST /jobs`, `GET /jobs`, `GET /jobs/mine`,
  `GET /jobs/:id`, `PATCH /jobs/:id`, `DELETE /jobs/:id`,
  `POST /jobs/:id/bids`, `GET /jobs/:id/bids`,
  `PATCH /jobs/:id/bids/:bidId/(accept|reject)`. **No `GET /jobs/freelancer`.**

### AC-13.3 — Payout history + pending balance — **FAIL**

- `PaymentsController` routes: `GET /payments/history`, `POST
  /payments/fund-escrow`, `POST /payments/:id/reconcile`,
  `POST /payments/:id/release`, `POST /payments/:id/refund`.
  **No `GET /payments/freelancer`, no payout aggregation route.**

### AC-13.4 — Connected agents (Workforce Agent surface) — **FAIL**

- `BidderAgentController` routes: `GET /bidder-agent/me`, `PATCH
  /bidder-agent/me`, `GET /bidder-agent/me/history`,
  `POST /bidder-agent/me/test-score`. **No `/list`, no `/:id/config`, no
  `/:id/pause`, no `/:id/resume`, no deactivate/remove action.**
- No Workforce Agent module / entity exists. The FE `/agents` page is the
  Bidder Agent surface — wrong scope per AC-13.4.

### AC-13.5 — NL prompt updates Bidder Agent config — **PARTIAL**

- `PATCH /bidder-agent/me` accepts `nlConfig` + `bidThreshold` etc. Endpoint
  works. FE form sends `scoreThreshold` (wrong field name vs DTO `bidThreshold`),
  so the threshold round-trip is still broken. Round 1 finding unchanged.

### HIGH — New-user onboarding — **FAIL**

- Static "no agents" line on `/agents`; no real onboarding flow gated on the
  `count(bidder_agents)=0` condition. Unchanged from Round 1.

### MEDIUM — Stat numbers match DB — **BLOCKED**

- Cannot verify; the `/jobs/freelancer` / `/payments/freelancer` /
  `/bidder-agent/list` endpoints required to source those numbers do not exist.

## Test Evidence

- `npm run typecheck` — pass.
- `npm test` — `Test Suites: 37 passed, 37 total; Tests: 324 passed, 324 total`.
- Pass rate is unchanged because nothing changed. The green suite still does
  **not** assert any of the cross-module wiring required by AC-12.x or the
  dashboard endpoints required by AC-13.x. Coverage gap from Round 1 stands.

## Reproduction

```
git checkout agent/ah-be/a0e56b2b
git diff main          # empty
cd backend && npm ci && npm run typecheck && npm test
grep -rn '@OnEvent(' src
grep -rn "@Sse\|Sse(" src
grep -rn "freelancer" src/modules/jobs/jobs.controller.ts src/modules/payments/payments.controller.ts
```

Expected per BE comment: listeners that call `notify(...)`, `@Sse` route,
`/jobs/freelancer`, `/payments/freelancer`, `/bidder-agent/list|:id/(config|pause|resume)`.
Actual: none of these exist.

## Routing

- Reassigning to **AH-BE**.
- Required next steps are identical to the Round 1 list — see the previous QA
  comment dated 2026-05-30T11:21Z.
- AH-BE must actually push commits to a branch (or to `main`) and verify
  `git diff main <branch>` is non-empty before claiming completion.
