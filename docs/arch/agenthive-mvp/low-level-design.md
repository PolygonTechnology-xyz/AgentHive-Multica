# Low-Level Design — AgentHive MVP
**Document:** AGH-TL-005  
**Version:** 1.0  
**Date:** 2026-05-25  
**Author:** AH-TL  
**Base URL:** `/api/v1`

---

## 1. API Design Conventions

- REST, versioned at `/api/v1`
- JSON request/response bodies
- Auth: HttpOnly JWT cookie (auto-sent by browser). CLI: `Authorization: Bearer <token>` header.
- Error format: `{ "statusCode": 4xx, "error": "ERROR_CODE", "message": "human description" }`
- Pagination: `?page=1&limit=20` on all list endpoints. Response: `{ data: [], total, page, limit }`
- All IDs: UUID strings

---

## 2. Auth Module Endpoints

### POST `/auth/register/buyer`
**Body:** `{ email, name, password, company? }`  
**Returns:** `{ message: "verification_email_sent" }`  
**Errors:** `EMAIL_ALREADY_EXISTS` (409)

### POST `/auth/register/freelancer`
**Body:** `{ email, name, password, bio? }`  
**Returns:** `{ message: "verification_email_sent" }` + Bidder Agent auto-provisioned  
**Side effects:** `bidder_agents` INSERT with `status: DORMANT`

### GET `/auth/verify-email?token=<jwt>`
**Returns:** `{ message: "email_verified" }` + sets session cookie  
**Errors:** `INVALID_TOKEN` (400), `TOKEN_EXPIRED` (400)

### POST `/auth/login`
**Body:** `{ email, password, role: "buyer" | "freelancer" | "admin" }`  
**Returns:** `{ user: { id, email, role } }` + sets HttpOnly session cookie  
**Errors:** `INVALID_CREDENTIALS` (401), `EMAIL_NOT_VERIFIED` (403), `ACCOUNT_INACTIVE` (403)

### GET `/auth/google?role=buyer|freelancer`
Redirect to Google OAuth. After callback: set session cookie, redirect to dashboard.

### POST `/auth/logout`
Clears cookie, revokes refresh token.  
**Returns:** `{ message: "logged_out" }`

### GET `/auth/me`
Returns current user from session.  
**Returns:** `{ id, email, role, verified }`

---

## 3. Freelancer Profile Endpoints

### GET `/freelancer/profile`
Auth: Freelancer only.  
**Returns:** `{ id, handle, display_name, bio, photo_url }`

### PATCH `/freelancer/profile`
Auth: Freelancer only.  
**Body:** `{ display_name?, bio? }`  
**Returns:** updated profile

### POST `/freelancer/profile/photo`
Auth: Freelancer only.  
**Body:** multipart/form-data `photo` (JPG/PNG, max 5MB)  
**Returns:** `{ photo_url }`  
**Errors:** `FILE_TOO_LARGE` (413), `INVALID_FILE_TYPE` (400)

### GET `/freelancer/:handle`
Public. No auth.  
**Returns:** `{ handle, display_name, bio, photo_url, categories, job_history_count }`

---

## 4. Workforce Agent Endpoints

### GET `/cli/agents`
Auth: CLI Bearer token (Freelancer).  
**Returns:** `[{ id, name, status, categories, tags, connected_at }]`

### POST `/cli/agents`
Auth: CLI Bearer token.  
**Body:** `{ name, categories[], tags[], languages[], frameworks[], specializations[], max_concurrent_jobs, avg_turnaround_hours, webhook_url? }`  
**Returns:** `{ id, name, status: "ACTIVE" }`  
**Side effects:** updates `skill_index`, activates BidderAgent if first agent

### PATCH `/cli/agents/:id`
Auth: CLI Bearer token.  
**Body:** `{ status: "INACTIVE" | "ACTIVE" }`  
**Side effects:** updates BidderAgent skill index

### DELETE `/cli/agents/:id`
Auth: CLI Bearer token.  
**Returns:** `{ message: "removed" }`  
**Side effects:** removes from skill index; if last agent, sets BidderAgent DORMANT

---

## 5. Bidder Agent Endpoints

### GET `/bidder-agent`
Auth: Freelancer.  
**Returns:** `{ id, status, config, prompt_history: [last 20] }`

### POST `/bidder-agent/configure`
Auth: Freelancer.  
**Body:** `{ prompt: "string" }` (natural language)  
**Returns:** `{ config: { tone, price_strategy, category_filters[], match_threshold, auto_bid_enabled } }`  
**Side effects:** parses prompt via Claude API → updates `bidder_agents.config`, inserts `bidder_agent_prompts`

---

## 6. Jobs Endpoints

### POST `/jobs`
Auth: Buyer.  
**Body:** multipart/form-data: `title, description, budget (number), deadline (ISO8601), files[]` (max 10, 20MB each)  
**Returns:** `{ id, title, status: "OPEN", created_at }`  
**Side effects:** uploads to S3, emits `job.published` event

### GET `/jobs`
Public (job board) OR Buyer-filtered.  
**Query:** `?status=OPEN&page=1&limit=20`  
**Returns:** `{ data: [{ id, title, budget, deadline, bid_count, created_at }], total, page, limit }`

### GET `/jobs/:id`
Public.  
**Returns:** full job details including attachment download URLs (presigned S3)

### GET `/jobs/buyer`
Auth: Buyer only.  
**Returns:** Buyer's own jobs list with statuses

### GET `/jobs/freelancer`
Auth: Freelancer only.  
**Returns:** active job board for manual browsing

---

## 7. Bids Endpoints

### GET `/jobs/:id/bids`
Auth: Buyer (owner of job only).  
**Returns:** `[{ id, freelancer: { handle, display_name, photo_url }, amount, eta_hours, match_score, capability_summary, source }]`

### POST `/jobs/:id/bids`
Auth: Freelancer (manual bid).  
**Body:** `{ amount, eta_hours }`  
**Returns:** `{ id, status: "PENDING" }`  
**Errors:** `ALREADY_BID` (409), `JOB_CLOSED` (400)

### POST `/jobs/:id/bids/:bid_id/select`
Auth: Buyer (owner of job).  
**Returns:** `{ payment_url }` (Ppay checkout URL)  
**Side effects:** marks bid WON, marks others LOST, sets job PAYMENT_PENDING

---

## 8. Payments Endpoints

### POST `/payments/webhook/ppay`
No auth (Ppay webhook). Verified by Ppay signature header.  
**Body:** Ppay webhook payload.  
**Side effects:** on success → escrow activated, job → AWAITING_DISPATCH, emit `payment.confirmed`

### GET `/payments`
Auth: Buyer.  
**Returns:** `[{ job_id, job_title, amount, status, paid_at }]`

### GET `/payments/freelancer`
Auth: Freelancer.  
**Returns:** `[{ job_id, job_title, net_payout, status, released_at }]`

---

## 9. Dispatch & Delivery Endpoints

### GET `/cli/pending-jobs`
Auth: CLI Bearer token.  
**Returns:** `[{ job_id, title, description, budget, deadline, attachments: [presigned_url] }]`  
**Side effects:** marks queued items as DELIVERED if previously PENDING

### POST `/cli/deliver`
Auth: CLI Bearer token.  
**Body:** multipart/form-data: `job_id, files[]`  
**Returns:** `{ message: "delivered" }`  
**Side effects:** upload to S3, job → DELIVERED, emit `delivery.submitted`

---

## 10. Review & Revision Endpoints

### GET `/jobs/:id/deliverables`
Auth: Buyer (owner).  
**Returns:** `[{ filename, download_url (presigned S3), round, uploaded_at }]`

### POST `/jobs/:id/approve`
Auth: Buyer (owner).  
**Returns:** `{ message: "approved" }`  
**Side effects:** job → COMPLETE, emit `approval.given` → payment payout

### POST `/jobs/:id/revision`
Auth: Buyer (owner).  
**Body:** `{ comments }` (min 10 chars)  
**Returns:** `{ revision_id, round }`  
**Side effects:** job → IN_REVISION, re-dispatch to Workforce Agent, notify Freelancer

---



### Revision Flow

Buyer revision requests are handled synchronously in the API process for MVP. `POST /deliveries/:deliveryId/request-revision` and the dispatch-scoped equivalent validate job ownership, mark the delivery as `revision_requested`, move the job to `revision`, emit `delivery.revision-requested`, and route the dispatch back to the Workforce Agent path in-process. The dispatch listener makes the dispatch visible to the freelancer's active dispatch lookup immediately, so the five-minute SLA is satisfied by the existing synchronous database write plus the CLI polling/event path. No BullMQ queue is introduced for revision routing unless the broader Workforce Agent dispatch path adopts one later.

### Signed Download URLs

Deliverable uploads use local disk storage for MVP. Freelancers upload files with `POST /dispatch/:dispatchId/files`; files are stored under `uploads/deliveries/<dispatchId>/<uuid>.<ext>` and recorded in `delivery_files` with the dispatch owner, original name, content type, size, and storage path.

Authenticated buyers or the owning freelancer request `GET /files/:id/signed-url`. The API returns a one-hour URL shaped as `/files/:id?exp=<unix>&sig=<hmac>`, where `sig = HMAC-SHA256(id|exp, FILE_SIGNING_SECRET)`. The public `GET /files/:id` route verifies the signature and expiry before streaming the local file with attachment headers. Expired, missing, or tampered signatures return 403; raw storage paths are never exposed in delivery responses.

## 11. Dispute Endpoints

### POST `/jobs/:id/dispute`
Auth: Buyer or Freelancer.  
**Body:** `{ reason }` (min 20 chars)  
**Returns:** `{ dispute_id }`  
**Side effects:** job → DISPUTED

### GET `/admin/disputes`
Auth: Admin only.  
**Returns:** `[{ id, job_id, raised_by, reason, status, created_at }]`

### GET `/admin/disputes/:id`
Auth: Admin only.  
**Returns:** full dispute context: job, bids, deliverables, revision history

### POST `/admin/disputes/:id/resolve`
Auth: Admin only.  
**Body:** `{ resolution: "RELEASED" | "FULL_REFUND" | "PARTIAL_REFUND" | "EXTENDED", partial_amount? }`  
**Side effects:** triggers payment action, emails both parties, closes dispute

---

## 12. Admin Endpoints

### GET `/admin/accounts`
Auth: Admin.  
**Returns:** `[{ id, email, active, created_at }]` (admin accounts only)

### POST `/admin/accounts`
Auth: Admin.  
**Body:** `{ email, name }`  
**Returns:** `{ id }` + sends invite email

### PATCH `/admin/accounts/:id`
Auth: Admin.  
**Body:** `{ active: false }`  
**Side effects:** invalidates all sessions for target account

### GET `/admin/config/commission`
Auth: Admin.  
**Returns:** `{ commission_rate: 0.15 }`

### PATCH `/admin/config/commission`
Auth: Admin.  
**Body:** `{ rate: 0.15 }` (0.0 – 1.0)  
**Side effects:** updates `platform_config`, logs to audit_log

---

## 13. Notifications Endpoints

### GET `/notifications`
Auth: Buyer or Freelancer.  
**Returns:** `[{ id, type, payload, read, created_at }]`

### PATCH `/notifications/:id/read`
Auth: Buyer or Freelancer.  
**Returns:** `{ read: true }`

### GET `/notifications/stream`
Auth: Buyer or Freelancer.  
SSE endpoint. `Content-Type: text/event-stream`.  
Emits events on: job status changes, new bids, deliveries, revisions.

---

## 14. CLI Auth Endpoints

### POST `/cli/auth/token`
**Body:** `{ email, password }`  
**Returns:** `{ access_token, expires_at }` (CLI Bearer token, 30-day expiry)

### DELETE `/cli/auth/token`
Auth: CLI Bearer token.  
**Returns:** `{ message: "logged_out" }` — revokes CLI token

---

## 15. Key Service Interfaces (NestJS)

```typescript
// BidderAgentService
interface BidderAgentService {
  provision(freelancerId: string): Promise<BidderAgent>;
  activate(freelancerId: string): Promise<void>;
  score(agentId: string, jobId: string): Promise<number>; // 0.0–1.0
  submitBid(agentId: string, jobId: string, score: number): Promise<Bid>;
  configure(agentId: string, prompt: string): Promise<BidderAgentConfig>;
}

// DispatchService
interface DispatchService {
  dispatch(jobId: string): Promise<void>;
  queueForOfflineDelivery(jobId: string, agentId: string): Promise<void>;
  deliverPendingJobs(freelancerId: string): Promise<void>;
}

// PaymentsService
interface PaymentsService {
  createCheckout(jobId: string, bidId: string): Promise<{ payment_url: string }>;
  handleWebhook(payload: PpayWebhookPayload): Promise<void>;
  releasePayout(jobId: string): Promise<void>;
  issueRefund(jobId: string, amount?: Decimal): Promise<void>;
}
```
