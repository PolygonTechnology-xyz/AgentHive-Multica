# S6-QA: Dispatch + Delivery — QA + Acceptance (Re-run)

- **Issue:** POL-67 (S6-QA)
- **Sprint:** S6
- **Re-QA date:** 2026-05-30
- **QA branch:** `agent/ah-qa/e56e3efe` (fork of `main` @ `f103d52`)
- **Remediation worktree under review:** `agent/ah-be/aa9b97b4` (AH-BE; uncommitted but applied to `main` @ `f103d52`)
- **SRS refs:** Module 9 (AC-9.1–9.7) — `docs/srs/agenthive-mvp.md:160-171`

## Verdict — FAIL

- CRITICAL: **6 PASS, 1 FAIL** (AC-9.7 — frontend never updated to new backend contract).
- HIGH: **2 PASS**.
- Backend remediation by AH-BE (POL-66) is correct and fully unit-tested. AC-9.7 fails end-to-end because the buyer delivery UI still calls the pre-remediation backend routes, so deliverables are not actually accessible in the platform UI.

Routing: `state:qa-failed`, reassign to **AH-FE** (frontend contract fix). Backend (AH-BE) work passes; no further BE rework requested.

## Per-AC result

| AC | Result | Evidence |
|----|--------|----------|
| AC-9.1 — BidderAgent selects most appropriate Workforce Agent on escrow | PASS | `backend/src/modules/dispatch/dispatch.service.ts:129-154` `selectWorkforceAgent` filters `WorkforceAgent` rows by `freelancerId` + `ACTIVE`, scores each on category/tags/languages/frameworks/specializations/skillIndex overlap with the job, ties broken by `avgTurnaroundHours`. `workforce_agents` table is defined in `workforce-agent.entity.ts`. |
| AC-9.2 — Full job brief pushed via webhook within 5 min | PASS | `dispatch.service.ts:156-171` `pushWebhook` POSTs the `PendingJobBrief` (job_id, dispatch_id, title, description, budget, deadline, attachments) to `agent.webhookUrl`, retries up to 3 times, runs inline inside `@OnEvent('payment.held')` so dispatch is synchronous with escrow activation. |
| AC-9.3 — CLI offline → job brief queued in dispatch_queue | PASS | `dispatch-queue.entity.ts:11-42` defines the `dispatch_queue` table; `dispatch.service.ts:65-75` writes a `PENDING` row with `attemptCount=3` when webhook delivery fails (or `DELIVERED` with `attemptCount=1` on success). |
| AC-9.4 — `agenthive auth login` → pending jobs downloaded automatically | PASS | `cli/src/commands/auth-login.ts:68-77` calls `getPendingJobs` after login and writes each brief to `~/.agenthive/jobs/<job_id>.json` (0600). Backend side: `dispatch.controller.ts:17-20` exposes `GET /cli/pending-jobs`; `dispatch.service.ts:83-98` marks rows `DELIVERED` on read so they only download once. |
| AC-9.5 — `agenthive deliver` → files uploaded; S3 key format verified | PASS | CLI: `cli/src/lib/api.ts:157-184` builds `multipart/form-data` (`files`, `job_id`, `message`) and POSTs `/cli/deliver`. Backend: `delivery.controller.ts:41-45` `FilesInterceptor('files')` → `delivery.service.ts:41-45` calls `S3Service.uploadDeliverable(jobId, deliveryId, file)`. `s3.service.ts:21-30` produces key `deliverables/{jobId}/{deliveryId}/{safeFilename}` and returns `s3Key` + `downloadUrl`. Attachments are persisted with `{name,url,s3Key,sizeBytes}` on the delivery row. |
| AC-9.6 — Job status → DELIVERED, buyer notified by email within 5 min | PASS | `delivery.service.ts:57-60` sets `dispatch.status = DELIVERED`, `job.status = DELIVERED`, and emits `delivery.submitted`. `notifications.service.ts:102-116` listens for that event, looks up the buyer via `jobRepo`/`userRepo`, calls `notify({sendEmail:true,emailTo:buyer.email})`. `sendEmail` dispatches via SendGrid when `SENDGRID_API_KEY` is configured, otherwise warns and short-circuits (acceptable for dev). |
| AC-9.7 — Deliverables accessible in platform UI (presigned URLs load correctly) | **FAIL** | Backend half is fine — `delivery.controller.ts:65-69` exposes `GET /jobs/:jobId/deliverables` and `delivery.service.ts:104-116` returns `{filename, download_url, round, uploaded_at}` with `download_url` produced by `S3Service.presignedUrl`. **But the frontend was not updated to consume this contract.** All three buyer/freelancer screens still call the pre-remediation routes/shape: `frontend/app/(buyer)/jobs/[id]/delivery/page.tsx:17,29,43` calls `GET /deliveries?jobId=` and `PATCH /deliveries/{id}/approve` and reads `attachmentUrls[]`; `frontend/app/(buyer)/jobs/[id]/progress/page.tsx:18` and `frontend/app/(buyer)/jobs/[id]/revision/page.tsx:16,30` and `frontend/app/(freelancer)/jobs/freelancer/[id]/page.tsx:18,34-36` do the same. Backend exposes `GET /dispatch/:dispatchId/deliveries`, `POST .../approve`, and `GET /jobs/:jobId/deliverables`. So the buyer-facing UI 404s on `/deliveries?jobId=…` and never renders the presigned URLs the backend now mints. End-user requirement (deliverables visible in platform UI) is unmet. |

## HIGH

| Item | Result | Evidence |
|------|--------|----------|
| Retry: webhook fails 3× → job lands in `dispatch_queue` | PASS | `dispatch.service.ts:156-171` does 3 attempts inside `pushWebhook`; on `return false` the on-escrow handler writes `DispatchQueueStatus.PENDING` with `attemptCount=3`. Confirmed by `dispatch.service.spec.ts` covering both success and total-failure paths. |
| Multi-file: 5 files in one CLI command | PASS | CLI: `cli/src/lib/api.ts:163-176` iterates `filePaths` and appends each as `files` to the FormData. Backend: `FilesInterceptor('files')` collects them and `delivery.service.ts:41` parallel-uploads with `Promise.all`. No artificial cap. |

## Tests run

In `agent/ah-be/aa9b97b4` worktree (AH-BE remediation):

```
$ cd backend && npx jest --runInBand
  Test Suites: 37 passed, 37 total
  Tests:       325 passed, 325 total
$ cd backend && npm run typecheck   # tsc --noEmit
  exit 0
$ cd cli && npx jest --runInBand
  Test Suites: 3 passed, 3 total
  Tests:       68 passed, 68 total
$ cd cli && npm run lint            # tsc --noEmit
  exit 0
```

QA-authored re-run against the previous (pre-remediation) state on `main` confirmed the prior failure mode and gave a clean baseline; numbers above are from the remediated tree.

## Notes for reassignment

- **AH-FE (POL-65 follow-up):** update buyer + freelancer delivery pages to the post-remediation contract:
  - Listing: `GET /jobs/:jobId/deliverables` → `{filename, download_url, round, uploaded_at}[]` (use `download_url` for the buyer's "Download" link — this is the presigned URL required by AC-9.7). The legacy `GET /deliveries?jobId=` route does not exist on the backend.
  - Approve: `POST /dispatch/:dispatchId/deliveries/:deliveryId/approve` (not `PATCH /deliveries/:id/approve`).
  - Revision: `POST /dispatch/:dispatchId/deliveries/:deliveryId/request-revision` with `{reason}` body.
  - Freelancer submission: prefer the CLI multipart `/cli/deliver` path; if the FE keeps a "submit from browser" form, it must use `POST /dispatch/:dispatchId/deliver` with `SubmitDeliveryDto` shape (`{message, attachments?}`) — the legacy `{jobId, note, attachmentUrls}` body is not accepted.
- **AH-BE (no action):** remediation matches the checklist. Suggest folding the uncommitted worktree change into a real commit on `main` so other agents are not surprised by the divergence.
- **e2e test:** `backend/test/e2e/job-lifecycle.e2e-spec.ts` (flagged in the previous QA pass) still accepts `[201, 400]` on delivery POST and posts a payload that is not `SubmitDeliveryDto`. It currently passes but does not actually exercise the contract. Worth tightening once the FE contract lands.
