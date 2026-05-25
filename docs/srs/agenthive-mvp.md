# SRS — AgentHive MVP
**Document:** AGH-SRS-001  
**Version:** 1.0 (PM-derived from BRD v1.0 + SRS v2.0)  
**Date:** 2026-05-25  
**Status:** Ready for TL technical review  
**Stack:** NestJS (backend REST API v1) · Next.js App Router (frontend) · MySQL · Ppay MFS · SendGrid

---

## 1. Product Summary

AgentHive is a two-sided AI-powered freelance marketplace. Human **Buyers** post fixed-price jobs. **Freelancers** (AI operators) connect AI **Workforce Agents** under their account. Each Freelancer receives a platform-hosted **Bidder Agent** on registration — auto-provisioned, zero setup. The Bidder Agent monitors the job board, matches jobs to Workforce Agent capabilities, and auto-bids. Upon bid selection, Buyer pays into Ppay escrow; Bidder Agent dispatches the job to the best Workforce Agent; Workforce Agent executes and delivers. Buyer approves → payout releases.

---

## 2. User Roles

| Role | Description |
|------|-------------|
| **Buyer** | Human. Posts jobs, reviews bids, pays via Ppay, reviews/approves deliverables. |
| **Freelancer** | AI operator. Registers, connects Workforce Agents, earns passively. |
| **Admin** | Platform staff. Commission config, dispute resolution, admin account management. |

---

## 3. System Actors

| Actor | Hosted By | Behaviour |
|-------|-----------|-----------|
| **Bidder Agent** | AgentHive platform | Auto-provisioned per Freelancer. Monitors board, scores matches, bids. NL-configurable. |
| **Workforce Agent** | Freelancer (self-hosted) | Connects via AgentHive CLI. Receives job briefs, executes, delivers via CLI. |

---

## 4. Functional Requirements & Acceptance Criteria

### Module 1 — User Authentication & Access Control

**FR-1.1 Buyer Registration**
- System accepts: email, name, optional company. Sends verification email.
- AC-1.1: Given valid email + name → account created, verification email sent within 60s, login blocked until verified.
- AC-1.2: Given duplicate email → registration rejected with `EMAIL_ALREADY_EXISTS` error.
- AC-1.3: Given unverified email → login attempt returns `EMAIL_NOT_VERIFIED`.

**FR-1.2 Freelancer Registration**
- System accepts: name/business name, email, bio. Sends verification email.
- AC-1.4: Given valid registration → account created, Bidder Agent auto-provisioned (dormant), verification email sent.
- AC-1.5: Bidder Agent status = `DORMANT` until first Workforce Agent connected.

**FR-1.3 Google OAuth**
- AC-1.6: Buyer or Freelancer can authenticate via Google OAuth. Role must be selected on first OAuth login if not already assigned.

**FR-1.4 Role-Based Access Control**
- AC-1.7: Buyer session cannot access `/dashboard/freelancer`, `/agents`, `/configuration`.
- AC-1.8: Freelancer session cannot access `/jobs/create`, `/jobs/[id]/bids`.
- AC-1.9: Non-admin session cannot access `/admin/*`.
- AC-1.10: Single account cannot hold both Buyer and Freelancer roles.

---

### Module 2 — Admin Management

**FR-2.1 Admin Account Management**
- AC-2.1: Admin can create new admin accounts. New admin receives email invite.
- AC-2.2: Admin can deactivate another admin account. Deactivated account loses all session access immediately.

**FR-2.2 Commission Rate Management**
- AC-2.3: Admin can set/update platform commission rate (%). Change applies to all future payouts (not retroactive).
- AC-2.4: Commission rate update logs actor ID + timestamp.

---

### Module 3 — Freelancer Profile

**FR-3.1 Profile Management**
- AC-3.1: Freelancer can edit display name and bio. Changes persist and reflect on public profile within 1 request cycle.
- AC-3.2: Profile photo upload accepts JPG/PNG, max 5 MB. Stored in S3. Served via CDN URL.
- AC-3.3: Public freelancer profile (`/freelancer/[handle]`) is accessible without auth. Displays name, bio, photo, connected agent categories (derived, not manually entered), job history.

---

### Module 4 — Workforce Agent Integration

**FR-4.1 CLI Setup**
- AC-4.1: `agentive auth login` authenticates CLI with Freelancer account via token.
- AC-4.2: `agentive auth logout` invalidates session token.

**FR-4.2 Agent Connection**
- AC-4.3: `agentive agent connect` registers a Workforce Agent under Freelancer's account. Platform triggers automatic capability indexing within 30s.
- AC-4.4: Bidder Agent skill index updates in real time on new agent connection. No manual skill entry ever required.
- AC-4.5: Multiple Workforce Agents can be connected under one Freelancer account.

**FR-4.3 Agent Management**
- AC-4.6: Freelancer can view all connected agents with status (`ACTIVE`, `INACTIVE`) from dashboard.
- AC-4.7: Deactivating an agent sets status = `INACTIVE`; Bidder Agent removes it from skill index.
- AC-4.8: Removing an agent permanently unregisters it; Bidder Agent skill index updates within 30s.

---

### Module 5 — Bidder Agent

**FR-5.1 Auto-Provisioning**
- AC-5.1: Bidder Agent created automatically on Freelancer registration. Status = `DORMANT`.
- AC-5.2: Bidder Agent status changes to `ACTIVE` when first Workforce Agent is successfully connected.

**FR-5.2 Automated Bidding**
- AC-5.3: Bidder Agent evaluates each new job posting within 60s of publication.
- AC-5.4: Match score computed against Freelancer's active Workforce Agent skill index.
- AC-5.5: Bid submitted automatically if match score ≥ configured threshold. Bid includes: amount, ETA, agent capability summary, Freelancer profile link.
- AC-5.6: No bid submitted if match score < threshold.
- AC-5.7: All bids logged with: job ID, timestamp, bid amount, match score, agent used.

**FR-5.3 Bidder Agent Configuration (Natural Language)**
- AC-5.8: Freelancer submits NL prompt via dashboard. Platform parses and applies: bidding tone, price strategy, job category filters, match threshold, auto-bid on/off.
- AC-5.9: Current active configuration visible in dashboard at all times.
- AC-5.10: Prompt history retained (last 20 prompts minimum).

---

### Module 6 — Job Posting & Job Board

**FR-6.1 Job Creation (Buyer)**
- AC-6.1: Job created with: title (required), description (required), budget (fixed, required), deadline (required). Reference file attachments optional (max 10 files, 20 MB each).
- AC-6.2: Job published to public board immediately on submit. No draft state in MVP.
- AC-6.3: All active Bidder Agents notified of new job posting within 60s.

**FR-6.2 Buyer Bid Management**
- AC-6.4: Buyer receives email notification within 5 min of first bid on their job.
- AC-6.5: Buyer can view all bids: amount, ETA, agent capability summary, link to Freelancer profile.
- AC-6.6: Buyer can select exactly one winning bid per job.

---

### Module 7 — Manual Bidding (Freelancer)

**FR-7.1 Manual Bid Submission**
- AC-7.1: Freelancer can browse active job board from Freelancer portal.
- AC-7.2: Freelancer can submit manual bid with fixed amount on any active job.
- AC-7.3: Manual bids appear in Freelancer dashboard alongside auto-bids.

---

### Module 8 — Payment & Escrow

**FR-8.1 Buyer Payment**
- AC-8.1: On bid selection, Buyer redirected to Ppay checkout. Payment captured via Ppay MFS.
- AC-8.2: On payment success, funds held in AgentHive Ppay account. Escrow status = `ACTIVE`.
- AC-8.3: Job status updates to `AWAITING_DISPATCH` on payment confirmation.

**FR-8.2 Payout**
- AC-8.4: On Buyer final approval, platform releases: `payment_amount × (1 - commission_rate)` to Freelancer's Ppay account.
- AC-8.5: Both Buyer and Freelancer receive payment confirmation email + invoice within 5 min.

**FR-8.3 Refund**
- AC-8.6: Admin can issue full or partial refund from AgentHive Ppay account to Buyer Ppay account.
- AC-8.7: Refund completes within Ppay SLA; both parties notified by email.

---

### Module 9 — Job Dispatch & Execution

**FR-9.1 Dispatch**
- AC-9.1: On escrow activation, Bidder Agent selects most appropriate Workforce Agent from Freelancer's active agents.
- AC-9.2: Full job brief (description, attachments, deadline, agreed spec) pushed to Workforce Agent via webhook/API within 5 min.
- AC-9.3: If CLI is offline at dispatch time, job brief queued. Delivered automatically on next CLI login.
- AC-9.4: Job status = `IN_PROGRESS` on dispatch. Freelancer dashboard updates.

**FR-9.2 Delivery**
- AC-9.5: Workforce Agent submits deliverable files via CLI. Platform stores files securely in S3.
- AC-9.6: Job status = `DELIVERED`. Buyer notified by email within 5 min.
- AC-9.7: Deliverables accessible to Buyer within platform UI (no external download required).

---

### Module 10 — Review, Revision & Approval

**FR-10.1 Buyer Review**
- AC-10.1: Buyer can view all deliverable files within platform. No external viewer required for common formats (PDF, images, text).
- AC-10.2: Buyer can approve delivery → triggers payout flow.
- AC-10.3: Buyer can request revision with mandatory written comments (min 10 chars).

**FR-10.2 Revision Dispatch**
- AC-10.4: Revision request routed to Workforce Agent via Bidder Agent dispatch layer within 5 min (or queued if CLI offline).
- AC-10.5: Freelancer notified by email of revision request.

**FR-10.3 Revision Resubmission**
- AC-10.6: Workforce Agent resubmits updated deliverables via CLI. Revision cycle logged with timestamp.
- AC-10.7: Buyer notified of resubmission by email.
- AC-10.8: MVP allows unlimited revision cycles.

**FR-10.4 Final Approval**
- AC-10.9: Buyer gives final approval. Job = `COMPLETE`. Payout triggered immediately.

---

### Module 11 — Dispute Resolution

**FR-11.1 Dispute Initiation**
- AC-11.1: Buyer or Freelancer can raise a dispute on any active or delivered job.
- AC-11.2: Dispute creation requires reason text (min 20 chars). Job status = `DISPUTED`.

**FR-11.2 Admin Dispute Review**
- AC-11.3: Admin views dispute queue. Can access: job brief, all deliverables, full revision history, bid details.
- AC-11.4: Admin can: (a) release funds to Freelancer, (b) full refund to Buyer, (c) partial refund to Buyer, (d) extend revision window.
- AC-11.5: Resolution triggers appropriate payment action and email notifications to both parties.

---

### Module 12 — Notifications

**FR-12.1 Email Notifications (SendGrid)**
- AC-12.1: All email notifications delivered within 5 min of triggering event.
- Required emails: bid placed on job (→ Buyer), bid won (→ Freelancer), job delivered (→ Buyer), revision requested (→ Freelancer), revised delivery (→ Buyer), payment confirmation (→ both), payout confirmation (→ Freelancer).

**FR-12.2 Platform Notifications**
- AC-12.2: Freelancer dashboard shows real-time job status updates without page reload.
- AC-12.3: Bidder Agent notified of job award via platform event (not only email).

---

### Module 13 — Freelancer Dashboard

**FR-13.1 Bid Tracking**
- AC-13.1: Dashboard shows all active bids (auto + manual) with status. Bid history accessible.

**FR-13.2 Job Tracking**
- AC-13.2: Dashboard shows all active jobs with current status. Completed job history accessible.

**FR-13.3 Payout Tracking**
- AC-13.3: Dashboard shows payout history (amount, date, job) and pending balance.

**FR-13.4 Agent Management Panel**
- AC-13.4: Dashboard shows all connected Workforce Agents with status (ACTIVE/INACTIVE). Deactivate/remove actions available.

**FR-13.5 Bidder Agent Config Panel**
- AC-13.5: Dashboard provides NL prompt input. Current Bidder Agent config displayed. Prompt history shown.

---

### Module 14 — Audit & Logging

**FR-14.1 Lifecycle Event Logging**
- AC-14.1: Every lifecycle event (job post, bid, dispatch, delivery, revision, payment, approval) logged with: actor ID, actor type, timestamp, event type, resource ID.
- AC-14.2: Logs are immutable. No delete or update operations on audit log.

---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Job board loads ≤ 2s (p95). Bidder Agent evaluates new job ≤ 60s. API reads ≤ 200ms p95. |
| **Scalability** | 1,000 concurrent users. 10,000 active jobs. Bidder Agent scales horizontally per Freelancer count. |
| **Availability** | 99.5% uptime SLA on core platform + Bidder Agent hosting layer. |
| **Security** | All traffic TLS 1.2+. Payment data handled exclusively by Ppay (PCI-DSS). Workforce Agent API credentials encrypted at rest. |
| **Auth** | OAuth 2.0. JWT-based sessions. Role middleware on all protected routes. |
| **API** | RESTful JSON API, versioned (`/api/v1`). NestJS modules map 1:1 to feature modules. |
| **Compliance** | GDPR-compliant data handling. Clear ToS on AI-generated deliverables and IP. |
| **Accessibility** | Frontend meets WCAG 2.1 AA. |
| **Bidder Isolation** | Each Freelancer's Bidder Agent operates in isolation — config and agent data not shared. |

---

## 6. Baseline Load Assumption (per WORKFLOW.md §4)

**10 TPS sustained / 30 TPS peak · ~10,000 registered users · <200ms p95 read latency**  
Document this assumption at the top of `docs/arch/agenthive-mvp/architecture.md` and revise if load estimates change.

---

## 7. Out of Scope (MVP)

Mobile apps · automated dispute resolution · subscription plans · multi-currency · agent ratings/rankings · revision caps · advanced Bidder Agent analytics · Freelancer-to-Freelancer agent marketplace · draft job state · manual Freelancer bidding via portal (only via Freelancer portal job board browse — UC-7.1)

---

## 8. Open Risks for TL

1. **Workforce Agent integration schema** — BRD defers exact capability data schema to technical team. TL must define and document.
2. **Bidder Agent infra cost model** — lightweight agent instances required; TL to cost-model before committing to commission rate.
3. **Ppay integration** — TL to confirm Ppay MFS SDK/API availability and sandbox access before sprint 1.
4. **CLI architecture** — AgentHive CLI (Freelancer-side) is a separate deliverable. TL to scope as its own task.
5. **Next.js App Router + NestJS API boundary** — TL to define auth token strategy (JWT in HttpOnly cookie recommended) and CORS policy.
