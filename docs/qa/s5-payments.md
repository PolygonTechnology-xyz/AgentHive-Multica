# S5-QA: Payment + Escrow — QA Report

**Issue:** S5-QA (`bf00b963-824f-4721-acef-ee7931cc28ab`)
**SRS:** Module 8 (`docs/srs/agenthive-mvp.md`) — AC-8.1 through AC-8.7
**Deps:** S5-BE (`backend/src/modules/payments`), S5-FE (`frontend/app/(buyer)/payments/...`, `frontend/app/(freelancer)/payments/...`)
**Result:** **FAIL** — 7 of 7 CRITICAL acceptance criteria unmet, plus 1 HIGH and 1 MEDIUM unmet.
**Routing:** back to AH-BE (originating backend dev). Status flipped to `todo`. Label `state:qa-failed` (manual — CLI uses status, not labels).

---

## Test environment

- Repo: AgentHive-Multica @ `main` (last commit `4b8d998`)
- Backend: NestJS, Jest. `npm install` succeeded. `npx jest src/modules/payments` → 4 suites / **34 tests passed**.
- Caveat: backend unit tests assert the **implementation** (`PaymentStatus.HELD`, `JobStatus.IN_PROGRESS`), not the **spec** (`ESCROW`, `AWAITING_DISPATCH`). They pass while the spec is unmet. This is the canonical "test what the dev built, not what the spec says" failure mode — the hard rule says we test against the spec.

---

## Acceptance criteria — per-item verdict

| Item | Severity | Verdict | Evidence |
|---|---|---|---|
| AC-8.1 Buyer redirected to Ppay/Stripe checkout. Payment captured. | CRITICAL | **FAIL** | `PpayAdapter.createPayment` does return `redirectUrl` (`backend/src/modules/payments/adapters/ppay.adapter.ts:52`), but `PaymentsService.fundEscrow` ignores it and immediately calls `gateway.confirmPayment` inline (`backend/src/modules/payments/payments.service.ts:78-89`). No redirect URL is propagated to the controller response. Frontend `frontend/app/(buyer)/payments/[jobId]/page.tsx` POSTs to `/payments/fund` — backend route is `POST /payments/fund-escrow` (`payments.controller.ts:49`). End-to-end the buyer never visits Ppay. |
| AC-8.2 `payments.status = ESCROW` after success. | CRITICAL | **FAIL** | Enum is `PaymentStatus.HELD` (`payments/payment.entity.ts`). Neither the SRS literal (`ACTIVE` / `ESCROW`) nor the checklist literal (`ESCROW`) is present. Will not match any API consumer reading the spec'd value. |
| AC-8.3 Job status → `AWAITING_DISPATCH` on payment confirmation. | CRITICAL | **FAIL** | `payments.service.ts:88` runs `txManager.update(Job, jobId, { status: JobStatus.IN_PROGRESS })`. Enum `JobStatus` has no `AWAITING_DISPATCH` member. Workflow is also inverted: `fundEscrow` requires `Job.status = DISPATCHED` before funding (`payments.service.ts:60-62`), but the spec is fund → AWAITING_DISPATCH → dispatch. |
| AC-8.4 Buyer approval → payout released. `net_payout = amount × (1 - commission_rate)`. Freelancer Ppay account receives correct amount. | CRITICAL | **FAIL** | `PaymentsService.release` calls `gateway.confirmPayment(payment.ppayReference)` (`payments.service.ts:104-107`) — that re-confirms the original capture; it is **not** a transfer to the freelancer's Ppay account. `PpayAdapter` has no `transfer`/`payout` method. `payment.platformFee` is computed at funding time but never used as a deduction at release. No freelancer Ppay account ID is stored on `User`. |
| AC-8.5 Both Buyer and Freelancer receive email within 5 min, with amount + job details. | CRITICAL | **FAIL** | `NotificationsService.onPaymentReleased` is a stub: one `logger.log` call, no DB write, no buyer/freelancer lookup, no email, no amount (`notifications.service.ts:109-112`). No listener on `payment.held` to receipt the buyer. SendGrid is wired but unused for payment events. |
| AC-8.6 Admin full refund — funds returned to Buyer. Payment status → REFUNDED. | CRITICAL | **FAIL** | `PaymentsController.refund` (`payments.controller.ts:61-64`) is `JwtAuthGuard` only — no admin role guard. `PaymentsService.refund` rejects with `ForbiddenException` unless `payment.buyerId === requesterId` (`payments.service.ts:121-126`), so an admin who is not the buyer cannot refund through this endpoint. No partial-refund support (always refunds `payment.amount`). |
| AC-8.7 Refund within Ppay SLA, both parties notified. | CRITICAL | **FAIL** | No `payment.refunded` event is emitted from `PaymentsService.refund` (compare to `payment.held`/`payment.released`). No `@OnEvent('payment.refunded')` listener in `NotificationsService`. No notification record or email. SLA cannot be measured because the event chain doesn't exist. |
| Webhook idempotency: duplicate webhook with same `ppay_ref` → no duplicate payment record. | HIGH | **FAIL** | No webhook controller/route exists in `backend/src/modules/payments`. `idempotencyKey` on `/fund-escrow` (`payments.service.ts:65-71`) dedupes client-initiated retries, not inbound webhooks from Ppay. |
| Commission rate change: new rate applies only to future payments, not existing. | HIGH | **PARTIAL** | `Payment.platformFee` is persisted per-row at funding time (`payments.service.ts:79-83`), so existing payments are immune to later changes. **However** there is no admin endpoint to change `PLATFORM_FEE_PERCENT` at runtime — it is read from env at boot only (`backend/src/config/configuration.ts:52`). Frontend `app/(admin)/admin/commission/page.tsx` exists but has no backing API. |
| Invoice downloadable from payment history page. | MEDIUM | **FAIL** | No invoice generation (no PDF lib, no `invoices` table, no `/payments/:id/invoice` route). FE payment-history pages contain no download UI. |

---

## Test cases executed

### Static / contract checks (against spec)

1. **TC-01 enum literal `ESCROW`** — `grep -rn "'ESCROW'" backend/src/modules/payments` → 0 results. **FAIL** (AC-8.2).
2. **TC-02 enum literal `AWAITING_DISPATCH`** — `grep -rn "AWAITING_DISPATCH" backend/src` → 0 results. **FAIL** (AC-8.3).
3. **TC-03 redirect URL returned to caller** — `PaymentsController.fundEscrow` returns `paymentsService.fundEscrow(...)` which returns the `Payment` entity, not the gateway redirect URL. **FAIL** (AC-8.1).
4. **TC-04 admin-role guard on refund** — no `@Roles('admin')` decorator or `AdminGuard` on `POST /payments/:id/refund`. **FAIL** (AC-8.6).
5. **TC-05 webhook route exists** — `grep -rn "@Post(.*webhook" backend/src/modules/payments` → 0 results. **FAIL** (HIGH webhook).
6. **TC-06 `payment.refunded` event emitted** — `grep -n "payment.refunded" backend/src` → 0 results. **FAIL** (AC-8.7).
7. **TC-07 freelancer Ppay account field** — no `ppayAccountId` / `payoutAccount` on `User` entity. **FAIL** (AC-8.4).
8. **TC-08 invoice endpoint** — no `/invoice` route or PDF generation. **FAIL** (MEDIUM invoice).
9. **TC-09 FE → BE route match** — FE `payments/[jobId]/page.tsx` posts to `/payments/fund`; BE route is `/payments/fund-escrow`. Buyer flow returns 404. **FAIL** (AC-8.1).

### Dynamic — backend unit tests

10. **TC-10 `npx jest src/modules/payments`** — 4 suites / 34 tests passing. These verify the implementation's own contracts and **do not** verify spec values; they cannot be used to certify the ACs.

### Integration tests not run

- End-to-end Ppay redirect (AC-8.1) — blocked: FE route mismatch + no redirect propagation.
- Email delivery within 5 min (AC-8.5) — blocked: no listener exists.
- Admin-refund SLA (AC-8.6, AC-8.7) — blocked: no admin path + no event.
- Webhook replay (HIGH) — blocked: no webhook endpoint.

---

## Bug reports (reproducible)

### BUG-1 — `payments.status` value is `HELD`, spec requires `ESCROW`
- **Steps:** call `POST /payments/fund-escrow` → inspect persisted `Payment.status`.
- **Expected:** `ESCROW`.
- **Actual:** `HELD`.
- **Fix hint:** rename `PaymentStatus.HELD` → `ESCROW` (or add `ESCROW` as alias) in `payments/payment.entity.ts` and propagate through service + tests.

### BUG-2 — Job moves to `IN_PROGRESS`, spec requires `AWAITING_DISPATCH`
- **Steps:** fund escrow against an accepted bid.
- **Expected:** `Job.status = AWAITING_DISPATCH`.
- **Actual:** `Job.status = IN_PROGRESS`. The `AWAITING_DISPATCH` member does not exist.
- **Fix hint:** add `AWAITING_DISPATCH` to `JobStatus` enum; set it from `PaymentsService.fundEscrow` on gateway success; move the `IN_PROGRESS` transition to dispatch acceptance.

### BUG-3 — Buyer never redirected to Ppay; FE/BE route mismatch
- **Steps:** as buyer, click "Fund escrow" on `/payments/[jobId]`. Inspect network.
- **Expected:** 302 → Ppay checkout URL.
- **Actual:** `POST /payments/fund` → 404. Even if FE called `/payments/fund-escrow`, the response is a `Payment` entity, not a redirect URL.
- **Fix hint:** (a) fix FE endpoint to `/payments/fund-escrow`; (b) change `PaymentsService.fundEscrow` to skip inline `confirmPayment` and return `{ paymentId, redirectUrl }` from the gateway `createPayment` result; (c) add a Ppay webhook controller that does the confirm + status flip on `payment.captured` event.

### BUG-4 — `release` does not transfer net payout to freelancer Ppay
- **Steps:** approve delivery → `POST /payments/:id/release`.
- **Expected:** `gateway.transfer(freelancer.ppayAccountId, amount × (1 - commission_rate))`. Freelancer Ppay balance increases by net payout.
- **Actual:** `gateway.confirmPayment(payment.ppayReference)` is called — a no-op confirm on the buyer's capture. No funds move to freelancer. `platformFee` field is ignored at release time.
- **Fix hint:** add `transfer(accountId, amount)` to `PaymentGateway` interface, implement in `PpayAdapter` and `MockPaymentAdapter`; persist `ppayAccountId` on `User`; call `transfer(freelancer.ppayAccountId, payment.amount - payment.platformFee)` in `PaymentsService.release`.

### BUG-5 — No emails on `payment.held` or `payment.released`; no listener on `payment.refunded`
- **Steps:** fund escrow → release → refund. Inspect `notifications` table and SendGrid logs.
- **Expected:** 2 notifications (buyer + freelancer) per event with amount and job title.
- **Actual:** `onPaymentReleased` only `logger.log`s the jobId. No record, no email. No listener for `payment.held` or `payment.refunded` (latter event isn't even emitted).
- **Fix hint:** in `NotificationsService`, inject `PaymentsService` + `UsersService`; implement listeners for `payment.held`, `payment.released`, `payment.refunded` that call `notify(...)` with `sendEmail: true` for buyer and freelancer, body containing `amount`, `currency`, and `jobTitle`. Emit `payment.refunded` from `PaymentsService.refund`.

### BUG-6 — Admin cannot refund; only buyer can
- **Steps:** authenticate as admin (role=admin, id ≠ buyerId) → `POST /payments/:id/refund`.
- **Expected:** 200, payment → `REFUNDED`, both parties notified.
- **Actual:** `ForbiddenException` from `payments.service.ts:121-126`.
- **Fix hint:** add `@Roles('admin')` decorator + `RolesGuard` on the refund route; in `PaymentsService.refund`, accept an `actor` with `{ id, role }` and skip the buyer check when `role === 'admin'`. Add a `reason` field for audit. Consider partial-refund DTO.

### BUG-7 — No Ppay webhook endpoint; webhook-idempotency claim untestable
- **Steps:** simulate Ppay POSTing `{ event: 'payment.captured', ppay_ref: 'X' }` twice.
- **Expected:** one `Payment` row, second POST is a no-op (idempotent by `ppay_ref`).
- **Actual:** No webhook route exists in `payments.controller.ts`.
- **Fix hint:** add `POST /payments/webhook/ppay` with HMAC signature verification + unique index on `Payment.ppayReference` + `INSERT ... ON CONFLICT DO NOTHING` semantics.

### BUG-8 — No runtime commission-rate change (admin UI is a stub)
- **Steps:** `/admin/commission` page submits.
- **Expected:** new rate persisted; future escrows use new rate.
- **Actual:** no backing API; rate is `PLATFORM_FEE_PERCENT` env, read at boot. *Behavior on existing payments is correct* (each row stores its own `platformFee`), so HIGH item is partial.
- **Fix hint:** add a `platform_settings` table + `GET/PUT /admin/settings/commission` (admin-only); `PaymentsService.fundEscrow` reads from DB instead of `ConfigService`.

### BUG-9 — No invoice generation or download
- **Steps:** open buyer payment history → look for "Download invoice".
- **Expected:** PDF link per row.
- **Actual:** no UI, no endpoint, no PDF dependency.
- **Fix hint:** add `GET /payments/:id/invoice` returning a PDF (pdfkit or puppeteer); render row with download link in FE history page.

---

## Pass / Fail summary

- CRITICAL: 7 / 7 **FAIL**
- HIGH: 1 FAIL + 1 PARTIAL (commission-rate runtime change missing, but existing-payment immutability holds)
- MEDIUM: 1 / 1 **FAIL**

Per the hard rule (no CRITICAL may remain open), the task **does not pass QA**. Returned to AH-BE.
