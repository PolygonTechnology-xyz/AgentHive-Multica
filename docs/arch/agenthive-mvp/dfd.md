# Data Flow Diagrams — AgentHive MVP
**Document:** AGH-TL-003  
**Version:** 1.0  
**Date:** 2026-05-25  
**Author:** AH-TL

---

## L0 — System Context

```
                    ┌─────────────────────────────┐
                    │                             │
   [Buyer] ────────►│                             │◄──── [Admin]
   posts job        │       AgentHive             │       manages
   reviews bids     │       Platform              │       platform
   pays + approves  │                             │
                    │                             │◄──── [Freelancer]
   [Google OAuth]   │                             │       registers
   ────────────────►│                             │       connects agents
                    │                             │
   [Ppay MFS] ◄────►│                             │◄──── [AgentHive CLI]
   escrow/payout    │                             │       delivers jobs
                    │                             │
   [SendGrid] ◄─────│                             │◄──── [Workforce Agent]
   email notify     │                             │       receives briefs
                    └─────────────────────────────┘
```

---

## L1 — Process Decomposition

### L1.1 — Authentication & Registration

```
[Buyer/Freelancer]
      │ registration data
      ▼
  ┌──────────────┐     ┌───────────────┐     ┌──────────┐
  │  Auth Module │────►│  Users Store  │     │ SendGrid │
  │              │     │  (Postgres)      │     │          │
  │ 1.Validate   │     │  users table  │     │          │
  │ 2.Hash pwd   │◄────│               │     │          │
  │ 3.Create     │────►│               │     │          │
  │ 4.Send verify│─────────────────────────────────────►│
  │ 5.Issue JWT  │     │               │     │          │
  └──────┬───────┘     └───────────────┘     └──────────┘
         │
         ▼ HttpOnly Cookie
   [Browser Session]
```

---

### L1.2 — Job Posting & Bidder Agent Fan-Out

```
[Buyer]
  │ POST /api/v1/jobs {title, desc, budget, deadline, files}
  ▼
┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│  Jobs Module │────►│ Postgres:jobs  │     │   S3        │
│              │     │             │     │ (attachments│
│ 1.Validate   │     │             │     │  stored)    │
│ 2.Store job  │────►│             │     │             │
│ 3.Store files│─────────────────────────────────────►│
│ 4.Emit event │     │             │     │             │
└──────┬───────┘     └─────────────┘     └─────────────┘
       │ emit('job.published')
       ▼
┌──────────────────────────────────────────────┐
│           Bidder Agent Module                │
│  Query: SELECT all active bidder_agents      │
│  For each agent: BullMQ.add('score-job', {}) │
└──────────────────────────────────────────────┘
       │ (fan-out via BullMQ)
       ▼ (parallel workers)
┌─────────────────────────────────────────────────────┐
│  BidderAgent Worker (×N, one per score-job task)    │
│  1. Load agent skill_index from Postgres               │
│  2. Load job from Postgres                             │
│  3. Compute match_score (keyword overlap)           │
│  4. If score ≥ threshold:                           │
│     └── INSERT bids (job_id, agent_id, amount, ...) │
│  5. INSERT bid log in audit_log                     │
└─────────────────────────────────────────────────────┘
       │ Bid placed
       ▼
  [SendGrid] ← email notification to Buyer
```

---

### L1.3 — Payment & Escrow

```
[Buyer selects winning bid]
  │ POST /api/v1/jobs/:id/bids/:bid_id/select
  ▼
┌──────────────┐     ┌─────────────────┐
│  Bids Module │────►│ Postgres: bids     │
│ Mark bid won │     │ job: PAYMENT_   │
│              │     │ PENDING         │
└──────┬───────┘     └─────────────────┘
       │ Redirect to Ppay checkout URL
       ▼
   [Ppay MFS]
       │ Webhook: payment_success | payment_failed
       ▼
┌──────────────────┐     ┌────────────────┐
│ Payments Module  │────►│ Postgres:payments │
│ 1.Verify webhook │     │ status:ESCROW  │
│ 2.Create escrow  │     │ job: AWAITING_ │
│ 3.Emit event     │     │ DISPATCH       │
└──────┬───────────┘     └────────────────┘
       │ emit('payment.confirmed')
       ▼
  [Dispatch Module] (see L1.4)
```

---

### L1.4 — Job Dispatch & CLI Delivery

```
emit('payment.confirmed')
       │
       ▼
┌──────────────────────────────────────────────┐
│  Dispatch Module                             │
│  1. Select best active Workforce Agent       │
│     (from freelancer's connected agents)     │
│  2. Try webhook to Agent's registered URL    │
│     ├── Success: job brief delivered         │
│     └── Fail (offline): INSERT dispatch_queue│
│         (status: PENDING, retry on CLI login)│
│  3. UPDATE job status → IN_PROGRESS          │
│  4. Emit('dispatch.sent')                    │
└──────────────────────────────────────────────┘
       │ (if offline)
       ▼
┌──────────────────────────────────────────────┐
│  AgentHive CLI (on next `agentive auth login`)│
│  GET /api/v1/cli/pending-jobs                │
│  Downloads job brief → local file system     │
└──────────────────────────────────────────────┘
       │ Workforce Agent executes job
       │ `agentive deliver --job-id <uuid> --files ...`
       ▼
┌──────────────────┐     ┌────────────┐
│  Delivery Module │────►│  AWS S3    │
│  1.Upload files  │     │ deliverable│
│  2.UPDATE job    │     │ stored     │
│    DELIVERED     │     └────────────┘
│  3.Notify Buyer  │────►[SendGrid]
└──────────────────┘
```

---

### L1.5 — Review, Revision & Approval

```
[Buyer reviews deliverables at /jobs/:id/delivery]
       │
       ├── APPROVE
       │      │ POST /api/v1/jobs/:id/approve
       │      ▼
       │   ┌──────────────────┐     ┌────────────────┐
       │   │  Review Module   │────►│ Postgres:jobs     │
       │   │  1.Job → COMPLETE│     │ status:COMPLETE│
       │   │  2.Emit approval │     └────────────────┘
       │   └──────┬───────────┘
       │          │ emit('approval.given')
       │          ▼
       │      Payments Module → Ppay payout
       │      → SendGrid confirmation to both
       │
       └── REQUEST REVISION
              │ POST /api/v1/jobs/:id/revision {comments}
              ▼
           ┌──────────────────────────────────────┐
           │  Review Module                       │
           │  1.INSERT revision_cycles            │
           │  2.UPDATE job → IN_REVISION          │
           │  3.Emit('revision.requested')        │
           └──────┬───────────────────────────────┘
                  │
                  ▼
             Dispatch Module → re-queue to Workforce Agent
             SendGrid → notify Freelancer
```

---

### L1.6 — Workforce Agent Connection

```
[Freelancer CLI: agentive agent connect]
  │ POST /api/v1/cli/agents {name, categories, tags, ...}
  ▼
┌──────────────────────────────────────────────────┐
│  Workforce Agent Module                          │
│  1. Register agent (INSERT workforce_agents)     │
│  2. Index capabilities (UPDATE skill_index text) │
│  3. If first agent: activate BidderAgent         │
│     UPDATE bidder_agents SET status = 'ACTIVE'   │
│  4. Notify BidderAgentModule to update scoring   │
└──────────────────────────────────────────────────┘
```

---

### L1.7 — Notifications Flow

```
Platform Events                    Channels
─────────────────────────────────────────────────────
job.published (Buyer gets bid)   → SendGrid email
bid.won (Freelancer)             → SendGrid email
job.dispatched                   → SSE → Freelancer dashboard
delivery.submitted               → SendGrid email (Buyer)
revision.requested               → SendGrid email (Freelancer)
revision.resubmitted             → SendGrid email (Buyer)
payment.confirmed                → SendGrid email (both)
payout.released                  → SendGrid email (Freelancer)
dispute.raised                   → SSE → Admin dashboard
```

**SSE (Server-Sent Events):** Single endpoint `GET /api/v1/notifications/stream`.  
Frontend subscribes with `EventSource`. No WebSocket for MVP — SSE is simpler, unidirectional, HTTP/1.1 compatible.
