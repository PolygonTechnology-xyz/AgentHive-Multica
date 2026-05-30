# Feature Breakdown — AgentHive MVP
**Derived from:** AGH-SRS-001 · BRD v1.0 · SRS v2.0  
**Date:** 2026-05-25  
**Stack:** NestJS · Next.js App Router · PostgreSQL · Ppay MFS · SendGrid

---

## Priority Matrix (MoSCoW + RICE)

**RICE score** = (Reach × Impact × Confidence) / Effort  
Scale: Reach 1–10 (users impacted), Impact 1–3 (1=low,2=med,3=high), Confidence % (0–100), Effort 1–10 story-weeks

| Epic | MoSCoW | Reach | Impact | Conf% | Effort | RICE | Label |
|------|--------|-------|--------|-------|--------|------|-------|
| EPIC-1 Auth | **Must** | 10 | 3 | 100 | 3 | 100.0 | `prio:critical` |
| EPIC-5 Bidder Agent | **Must** | 9 | 3 | 90 | 8 | 30.4 | `prio:critical` |
| EPIC-6 Job Board | **Must** | 10 | 3 | 95 | 4 | 71.3 | `prio:critical` |
| EPIC-8 Payment/Escrow | **Must** | 10 | 3 | 90 | 5 | 54.0 | `prio:critical` |
| EPIC-9 Dispatch/Execution | **Must** | 9 | 3 | 85 | 6 | 38.3 | `prio:critical` |
| EPIC-10 Review/Approval | **Must** | 9 | 3 | 90 | 4 | 60.8 | `prio:critical` |
| EPIC-4 Workforce Agent + CLI | **Should** | 8 | 3 | 85 | 7 | 29.1 | `prio:high` |
| EPIC-13 Freelancer Dashboard | **Should** | 8 | 2 | 90 | 5 | 28.8 | `prio:high` |
| EPIC-12 Notifications | **Should** | 9 | 2 | 95 | 3 | 57.0 | `prio:high` |
| EPIC-3 Freelancer Profile | **Should** | 7 | 2 | 95 | 2 | 66.5 | `prio:high` |
| EPIC-2 Admin Panel | **Should** | 3 | 3 | 100 | 3 | 30.0 | `prio:high` |
| EPIC-7 Manual Bidding | **Could** | 6 | 1 | 80 | 2 | 24.0 | `prio:medium` |
| EPIC-11 Disputes | **Could** | 5 | 2 | 85 | 4 | 21.3 | `prio:medium` |
| EPIC-14 Audit/Logging | **Could** | 2 | 2 | 100 | 2 | 20.0 | `prio:medium` |
| X-1–X-10 Cross-cutting | **Must** | — | — | — | — | — | `prio:critical` |

**Won't-have (MVP):** mobile apps, automated dispute resolution, subscription plans, multi-currency, agent ratings, advanced analytics.

### Sprint Ordering (recommended to TL)

| Sprint | Epics | Goal |
|--------|-------|------|
| S0 (Setup) | X-1, X-2, X-3, X-4, X-6, X-10 | Scaffold NestJS + Next.js, DB schema, infra |
| S1 | EPIC-1 + X-9 (auth pages) | Working auth end-to-end |
| S2 | EPIC-4 + EPIC-3 | CLI, agent registry, profile |
| S3 | EPIC-5 (Bidder Agent core) | Auto-provisioning + job scoring + bidding |
| S4 | EPIC-6 + EPIC-7 | Job board, job creation, manual bidding |
| S5 | EPIC-8 + X-5 (Ppay) | Payment + escrow |
| S6 | EPIC-9 | Dispatch + CLI delivery queue |
| S7 | EPIC-10 | Review, revision, approval |
| S8 | EPIC-12 + EPIC-13 | Notifications + full dashboard |
| S9 | EPIC-2 + EPIC-11 | Admin panel + disputes |
| S10 | EPIC-14 + X-8 + QA | Audit logging, CI/CD, full QA pass |

---

## Epics & Stories

### EPIC-1 — Authentication & Access Control
*Backend: NestJS Auth module (JWT + OAuth). Frontend: Next.js auth pages + middleware.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-1.1 | Register as Buyer (email + name) | Buyer | AC-1.1, AC-1.2 |
| S-1.2 | Verify Buyer email address | Buyer | AC-1.1, AC-1.3 |
| S-1.3 | Login as Buyer (email/password) | Buyer | AC-1.3 |
| S-1.4 | Login as Buyer via Google OAuth | Buyer | AC-1.6 |
| S-1.5 | Logout as Buyer | Buyer | — |
| S-1.6 | Register as Freelancer (name, email, bio) | Freelancer | AC-1.4, AC-1.5 |
| S-1.7 | Verify Freelancer email address | Freelancer | AC-1.4 |
| S-1.8 | Login as Freelancer (email/password) | Freelancer | AC-1.3 |
| S-1.9 | Login as Freelancer via Google OAuth | Freelancer | AC-1.6 |
| S-1.10 | Logout as Freelancer | Freelancer | — |
| S-1.11 | Login as Admin | Admin | — |
| S-1.12 | Enforce RBAC — Buyer, Freelancer, Admin isolation | System | AC-1.7–1.10 |
| S-1.13 | Prevent dual-role account creation | System | AC-1.10 |

**Capabilities needed:**
- NestJS: `AuthModule` (Passport JWT + Google strategy), `UsersModule`, guards, middleware
- Next.js: `/login`, `/register` pages, `middleware.ts` route protection, `next-auth` session
- DB: `users` table (id, email, role, verified, created_at), `refresh_tokens`

---

### EPIC-2 — Admin Panel
*Backend: Admin-gated endpoints. Frontend: `/admin/*` pages.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-2.1 | Create admin account | Admin | AC-2.1 |
| S-2.2 | Deactivate admin account | Admin | AC-2.2 |
| S-2.3 | View all admin accounts | Admin | — |
| S-2.4 | Set / update platform commission rate | Admin | AC-2.3, AC-2.4 |

**Capabilities needed:**
- NestJS: `AdminModule`, commission rate config stored in `platform_config` table
- Next.js: `/admin/accounts`, `/admin/commission` pages
- DB: `admin_accounts`, `platform_config (key, value, updated_by, updated_at)`

---

### EPIC-3 — Freelancer Profile
*Backend: Profile CRUD. Frontend: `/dashboard/freelancer` profile section + public profile page.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-3.1 | View own Freelancer profile | Freelancer | AC-3.1 |
| S-3.2 | Edit display name and bio | Freelancer | AC-3.1 |
| S-3.3 | Upload profile photo | Freelancer | AC-3.2 |
| S-3.4 | View public Freelancer profile page | Public | AC-3.3 |

**Capabilities needed:**
- NestJS: `FreelancerProfileModule`, S3 upload endpoint
- Next.js: `/account/freelancer`, `/freelancer/[handle]`
- DB: `freelancer_profiles (user_id, handle, display_name, bio, photo_url)`

---

### EPIC-4 — Workforce Agent Integration & CLI
*Backend: Agent registry + CLI auth endpoints. CLI: separate Node.js CLI package.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-4.1 | Install AgentHive CLI on local machine | Freelancer | — |
| S-4.2 | Authenticate CLI with Freelancer account | Freelancer | AC-4.1 |
| S-4.3 | Logout of CLI | Freelancer | AC-4.2 |
| S-4.4 | Connect Workforce Agent to platform via CLI | Freelancer | AC-4.3 |
| S-4.5 | Auto-index agent capabilities on connection | System | AC-4.4 |
| S-4.6 | Update Bidder Agent skill index in real time | System | AC-4.4 |
| S-4.7 | View all connected Workforce Agents | Freelancer | AC-4.6 |
| S-4.8 | Deactivate a Workforce Agent | Freelancer | AC-4.7 |
| S-4.9 | Remove a Workforce Agent | Freelancer | AC-4.8 |

**Capabilities needed:**
- NestJS: `AgentRegistryModule`, CLI token issuance, capability indexing worker
- CLI: `agentive auth login|logout`, `agentive agent connect|list|remove` commands (Node.js + npm package)
- DB: `workforce_agents (id, freelancer_id, name, status, capabilities_json, connected_at)`

---

### EPIC-5 — Bidder Agent
*Backend: Bidder Agent service (job monitoring, scoring, bidding, dispatch). Most complex module.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-5.1 | Auto-provision Bidder Agent on Freelancer registration | System | AC-5.1 |
| S-5.2 | Keep Bidder Agent dormant until first agent connected | System | AC-5.2 |
| S-5.3 | Monitor job board for new postings | System | AC-5.3 |
| S-5.4 | Score job against Freelancer Workforce Agent skill index | System | AC-5.4 |
| S-5.5 | Submit bid automatically when match score ≥ threshold | System | AC-5.5, AC-5.7 |
| S-5.6 | Suppress bid when match score < threshold | System | AC-5.6 |
| S-5.7 | Log all bids placed by Bidder Agent | System | AC-5.7 |
| S-5.8 | Configure Bidder Agent via NL prompt | Freelancer | AC-5.8, AC-5.9, AC-5.10 |
| S-5.9 | View bid history in Freelancer dashboard | Freelancer | AC-13.1 |

**Capabilities needed:**
- NestJS: `BidderAgentModule`, job event subscription (pub/sub or polling), scoring engine, `BidderAgentConfigModule` (NL prompt parser → structured config)
- DB: `bidder_agents (id, freelancer_id, status, config_json)`, `bidder_agent_prompts (id, agent_id, prompt, parsed_config, created_at)`, `bids (id, job_id, freelancer_id, agent_id, amount, eta, match_score, created_at)`

---

### EPIC-6 — Job Posting & Job Board
*Backend: Job CRUD + board API. Frontend: `/jobs/create`, `/jobs`, `/dashboard/buyer`.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-6.1 | Create job post (title, description, budget, deadline) | Buyer | AC-6.1 |
| S-6.2 | Attach reference files to job post | Buyer | AC-6.1 |
| S-6.3 | Publish job post immediately to board | System | AC-6.2 |
| S-6.4 | Notify all Bidder Agents of new job posting | System | AC-6.3 |
| S-6.5 | Notify Buyer by email when bid placed | System | AC-6.4 |
| S-6.6 | View all bids received on a job | Buyer | AC-6.5 |
| S-6.7 | View Freelancer profile from bid | Buyer | AC-6.5 |
| S-6.8 | View agent capability summary from bid | Buyer | AC-6.5 |
| S-6.9 | Select winning bid | Buyer | AC-6.6 |

**Capabilities needed:**
- NestJS: `JobsModule`, `BidsModule`, job event emitter (triggers Bidder Agent notification)
- Next.js: `/jobs/create`, `/jobs`, `/jobs/[id]/bids`, `/dashboard/buyer`
- DB: `jobs (id, buyer_id, title, description, budget, deadline, status, created_at)`, `job_attachments`, `bids` (see EPIC-5)

---

### EPIC-7 — Manual Bidding
*Backend: Manual bid endpoint. Frontend: Freelancer job board view.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-7.1 | Browse active job board from Freelancer portal | Freelancer | AC-7.1 |
| S-7.2 | View job post details from Freelancer portal | Freelancer | — |
| S-7.3 | Submit manual bid with fixed amount | Freelancer | AC-7.2 |
| S-7.4 | View all manually placed bids in dashboard | Freelancer | AC-7.3 |

**Capabilities needed:**
- NestJS: `BidsModule` (manual bid route, distinguishable from auto-bid by `source: manual|auto`)
- Next.js: `/jobs/freelancer` job board page, bid submission modal

---

### EPIC-8 — Payment & Escrow
*Backend: Ppay integration + escrow state machine. Frontend: payment pages.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-8.1 | Redirect Buyer to Ppay checkout on bid selection | Buyer | AC-8.1 |
| S-8.2 | Receive payment from Buyer via Ppay | System | AC-8.1, AC-8.2 |
| S-8.3 | Hold payment in escrow | System | AC-8.2, AC-8.3 |
| S-8.4 | Confirm payment + activate escrow | System | AC-8.3 |
| S-8.5 | Release payout to Freelancer on approval | System | AC-8.4 |
| S-8.6 | Send payment confirmation emails + invoices | System | AC-8.5 |
| S-8.7 | Issue full refund to Buyer | Admin | AC-8.6, AC-8.7 |
| S-8.8 | Issue partial refund to Buyer | Admin | AC-8.6, AC-8.7 |

**Capabilities needed:**
- NestJS: `PaymentsModule` (Ppay SDK/API integration, webhook handler), escrow state machine, invoice generation
- Next.js: `/jobs/[id]/payment`, `/jobs/[id]/payment/success`, `/jobs/[id]/payment/failed`, `/payments` (history)
- DB: `payments (id, job_id, buyer_id, freelancer_id, amount, commission_rate, status, ppay_ref, created_at)`, `invoices`

---

### EPIC-9 — Job Dispatch & Execution
*Backend: Dispatch service + CLI delivery queue. Frontend: job progress/status UI.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-9.1 | Select best Workforce Agent for awarded job | System | AC-9.1 |
| S-9.2 | Push full job brief to Workforce Agent via webhook | System | AC-9.2 |
| S-9.3 | Queue job brief when CLI offline | System | AC-9.3 |
| S-9.4 | Deliver queued job brief on CLI login | System | AC-9.3 |
| S-9.5 | Update job status to IN_PROGRESS + notify dashboard | System | AC-9.4 |
| S-9.6 | Receive deliverable files from Workforce Agent via CLI | System | AC-9.5 |
| S-9.7 | Store deliverables securely in S3 | System | AC-9.5 |
| S-9.8 | Update job status to DELIVERED + notify Buyer | System | AC-9.6 |

**Capabilities needed:**
- NestJS: `DispatchModule` (webhook sender, offline queue with retry), `DeliveryModule` (CLI upload endpoint, S3 storage)
- Next.js: `/jobs/[id]/progress`, `/jobs/[id]/delivery`
- DB: `dispatch_queue (id, job_id, agent_id, status, queued_at, delivered_at)`, `deliverables (id, job_id, filename, s3_key, uploaded_at)`

---

### EPIC-10 — Review, Revision & Approval
*Backend: Approval + revision state machine. Frontend: delivery review pages.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-10.1 | View and access submitted deliverables in platform | Buyer | AC-10.1 |
| S-10.2 | Approve delivered work | Buyer | AC-10.2 |
| S-10.3 | Request revision with written comments | Buyer | AC-10.3 |
| S-10.4 | Route revision request to Workforce Agent (or queue) | System | AC-10.4 |
| S-10.5 | Notify Freelancer of revision request by email | System | AC-10.5 |
| S-10.6 | Receive updated deliverables from Workforce Agent | System | AC-10.6 |
| S-10.7 | Log revision cycle with timestamp | System | AC-10.6 |
| S-10.8 | Notify Buyer of resubmission by email | System | AC-10.7 |
| S-10.9 | Give final approval + trigger payout | Buyer | AC-10.9 |
| S-10.10 | Mark job COMPLETE | System | AC-10.9 |

**Capabilities needed:**
- NestJS: `ReviewModule` (approval/revision state transitions), revision dispatch via `DispatchModule`
- Next.js: `/jobs/[id]/delivery`, `/jobs/[id]/revision`, `/jobs/[id]/complete`
- DB: `revision_cycles (id, job_id, round, comments, requested_at, resubmitted_at)`, job status enum extended

---

### EPIC-11 — Dispute Resolution
*Backend: Dispute management. Frontend: `/admin/disputes`.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-11.1 | Raise dispute as Buyer | Buyer | AC-11.1, AC-11.2 |
| S-11.2 | Raise dispute as Freelancer | Freelancer | AC-11.1, AC-11.2 |
| S-11.3 | View dispute queue in Admin panel | Admin | AC-11.3 |
| S-11.4 | Review full job context for disputed job | Admin | AC-11.3 |
| S-11.5 | Approve fund release to Freelancer | Admin | AC-11.4, AC-11.5 |
| S-11.6 | Issue full refund to Buyer | Admin | AC-11.4, AC-11.5 |
| S-11.7 | Issue partial refund to Buyer | Admin | AC-11.4, AC-11.5 |
| S-11.8 | Extend revision window for disputed job | Admin | AC-11.4 |

**Capabilities needed:**
- NestJS: `DisputesModule` (dispute state machine, resolution actions trigger `PaymentsModule`)
- Next.js: `/admin/disputes`, dispute initiation UI in Buyer/Freelancer job views
- DB: `disputes (id, job_id, raised_by, reason, status, resolution, resolved_by, resolved_at)`

---

### EPIC-12 — Notifications
*Backend: SendGrid email service + platform event bus. Frontend: notification center pages.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-12.1 | Send all lifecycle email notifications via SendGrid | System | AC-12.1 |
| S-12.2 | Real-time platform notifications to Freelancer dashboard | System | AC-12.2 |
| S-12.3 | Platform notification to Bidder Agent on job award | System | AC-12.3 |

**Capabilities needed:**
- NestJS: `NotificationsModule` (SendGrid client, email templates, event listeners), WebSocket or SSE for real-time
- Next.js: `/notifications/buyer`, `/notifications/freelancer`
- DB: `notifications (id, user_id, type, payload_json, read, created_at)`

---

### EPIC-13 — Freelancer Dashboard
*Frontend-heavy epic. Backend: aggregation APIs.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-13.1 | View all active bids + bid history | Freelancer | AC-13.1 |
| S-13.2 | View all active jobs + status | Freelancer | AC-13.2 |
| S-13.3 | View completed job history | Freelancer | AC-13.2 |
| S-13.4 | View payout history + pending balance | Freelancer | AC-13.3 |
| S-13.5 | View + manage connected agents | Freelancer | AC-13.4 |
| S-13.6 | Access + submit Bidder Agent prompt config | Freelancer | AC-13.5 |

**Capabilities needed:**
- NestJS: dashboard aggregation endpoints (`GET /api/v1/freelancer/dashboard`)
- Next.js: `/dashboard/freelancer` (multi-panel), `/agents`, `/configuration`, `/payments/freelancer`

---

### EPIC-14 — Audit & Logging
*Backend cross-cutting concern. No frontend UI in MVP.*

| Story | Description | Role | AC refs |
|-------|-------------|------|---------|
| S-14.1 | Log all lifecycle events with actor + timestamp | System | AC-14.1 |
| S-14.2 | Enforce immutability of audit log | System | AC-14.2 |

**Capabilities needed:**
- NestJS: `AuditModule` (interceptors / event listeners on all state transitions, append-only writes)
- DB: `audit_log (id, event_type, resource_type, resource_id, actor_id, actor_type, metadata_json, created_at)` — no UPDATE/DELETE

---

## Cross-Cutting Tasks

| Task | Description |
|------|-------------|
| X-1 | NestJS project scaffold (modules, guards, pipes, interceptors, Swagger) |
| X-2 | Next.js project scaffold (App Router, route groups, `middleware.ts`, CSS Modules) |
| X-3 | PostgreSQL schema design + Prisma/TypeORM setup + migrations |
| X-4 | S3 bucket setup + upload service |
| X-5 | Ppay MFS integration + sandbox testing |
| X-6 | SendGrid account + email template library |
| X-7 | AgentHive CLI project (Node.js, separate npm package) |
| X-8 | CI/CD pipeline (GitHub Actions → build, test, deploy) |
| X-9 | Next.js UI port (41 pages from design reference → production Next.js components) |
| X-10 | API versioning strategy + OpenAPI/Swagger docs |

---

## Story Count Summary

| Epic | Stories |
|------|---------|
| EPIC-1 Auth | 13 |
| EPIC-2 Admin | 4 |
| EPIC-3 Profile | 4 |
| EPIC-4 CLI + Agents | 9 |
| EPIC-5 Bidder Agent | 9 |
| EPIC-6 Job Board | 9 |
| EPIC-7 Manual Bidding | 4 |
| EPIC-8 Payment | 8 |
| EPIC-9 Dispatch | 8 |
| EPIC-10 Review | 10 |
| EPIC-11 Disputes | 8 |
| EPIC-12 Notifications | 3 |
| EPIC-13 Dashboard | 6 |
| EPIC-14 Audit | 2 |
| Cross-cutting | 10 |
| **Total** | **111** |
