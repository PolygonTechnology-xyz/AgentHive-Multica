# Technical Analysis — AgentHive MVP
**Document:** AGH-TL-001  
**Version:** 1.0  
**Date:** 2026-05-25  
**Author:** AH-TL (Team Lead / Architect)  
**Status:** Approved — baseline for sprint planning

---

## Baseline Load Model

> **Mandated by WORKFLOW.md §4 — document at top of every architecture artifact.**

| Metric | Value |
|--------|-------|
| Sustained throughput | **10 TPS** |
| Peak throughput | **30 TPS** |
| Registered users | **~10,000** |
| Concurrent users (p95) | **~1,000** |
| Active jobs at any time | **~10,000** |
| API read latency (p95) | **<200ms** |
| Bidder Agent evaluation SLA | **≤60s per new job** |
| Availability SLA | **99.5%** |

Single-region deployment is sufficient at this scale. Horizontal scaling of the NestJS app is recommended at ≥500 concurrent users. The Bidder Agent service is the highest-load subsystem and must be designed for stateless horizontal scaling from day one.

---

## 1. Feasibility Assessment

### 1.1 Core Loop

The fundamental AgentHive loop (post → bid → pay → dispatch → deliver → approve) is a well-understood workflow-orchestration problem. All steps are discrete state transitions with clear inputs and outputs. **Technically feasible within the proposed sprint plan.**

### 1.2 Stack Feasibility

| Technology | Assessment | Risk |
|------------|------------|------|
| NestJS (backend) | Production-grade, module-first. Excellent fit for domain-aligned module decomposition. | Low |
| Next.js App Router (frontend) | Supports SSR + Client components. 41-page scope is large but straightforward. | Low |
| PostgreSQL + Prisma ORM | Proven for relational job/payment workflows. Schema migrations manageable. | Low |
| Ppay MFS | **Unknown SDK maturity.** No public documentation reviewed. | **HIGH** |
| SendGrid | Standard integration. | Low |
| AgentHive CLI (npm package) | Node.js CLI with Commander.js is well-trodden. Main risk: capability schema definition. | Medium |

### 1.3 Hardest Technical Problems

In priority order:

1. **Bidder Agent scoring at scale** — One scoring job per Freelancer per new job posting. At 10k Freelancers × 10k active jobs, this is event-driven fan-out. Naive polling will not scale past ~200 Freelancers. Solution: event-driven job publication with per-agent queue workers (see Architecture §4).
2. **Ppay MFS integration** — No sandbox confirmed. If Ppay has no REST API or webhook, the payments sprint (S5) is at risk.
3. **CLI delivery queue for offline agents** — Workforce Agent CLI may be offline when a job is dispatched. Requires a durable queue with retry on next CLI login.
4. **JWT strategy across Next.js ↔ NestJS boundary** — HttpOnly cookie approach requires careful CSRF handling in App Router server actions and API routes.

---

## 2. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| R1 | **Ppay MFS has no sandbox / no REST API** | Medium | Critical — blocks S5 | Confirm SDK availability before S2. If no sandbox by S2 end, replace with Stripe (full-featured, known) for MVP and note Ppay as future migration. |
| R2 | **Bidder Agent fan-out overwhelms DB at scale** | Medium | High | Use NestJS Bull/BullMQ queue (Redis-backed) for job-scoring jobs. One queue worker per active Bidder Agent. See Architecture §4. |
| R3 | **Workforce Agent capability schema not defined** | High | High — blocks S2, S3 | **Resolved in this doc** — see §3 below. |
| R4 | **AgentHive CLI scope creep** | Medium | Medium | CLI is scoped to 5 commands only for MVP. No plugin system. Node.js + Commander.js. Published as `@agenthive/cli` npm package. |
| R5 | **Next.js App Router + NestJS CORS / auth token strategy** | Medium | High | **Resolved in this doc** — see §5 below. |

---

## 3. Workforce Agent Capability Schema (Risk R3 — Resolved)

The BRD deferred this to the TL. Defining it here as a canonical spec all modules must implement.

### 3.1 Capability Document (per Workforce Agent)

```json
{
  "agent_id": "uuid",
  "name": "string",
  "version": "semver",
  "categories": ["string"],
  "tags": ["string"],
  "languages": ["string"],
  "frameworks": ["string"],
  "specializations": ["string"],
  "max_concurrent_jobs": "integer",
  "avg_turnaround_hours": "float",
  "custom": {}
}
```

**`categories`** — top-level domain (e.g., `"software-development"`, `"data-analysis"`, `"content-writing"`, `"image-generation"`, `"research"`).

**`tags`** — free-form capability tags (e.g., `"react"`, `"python"`, `"nextjs"`, `"gpt-4"`, `"pdf-extraction"`).

**`specializations`** — longer-form descriptions (e.g., `"Build REST APIs with NestJS and TypeORM"`).

### 3.2 CLI Command to Register

```bash
agentive agent connect \
  --name "My Coder Agent" \
  --categories software-development \
  --tags react,nextjs,typescript \
  --max-concurrent-jobs 3 \
  --avg-turnaround-hours 4
```

On connection, the backend auto-indexes `categories + tags + specializations` into a full-text searchable column. The Bidder Agent scoring engine queries against this index.

### 3.3 Bidder Agent Scoring Model (MVP)

Simple keyword-overlap score for MVP (not ML):

```
match_score = (
  weighted_overlap(job.title + job.description, agent.categories + agent.tags + agent.specializations)
) × confidence_multiplier(agent.max_concurrent_jobs, agent.avg_turnaround_hours)
```

Score range: 0.0 – 1.0. Threshold default: 0.6. Freelancer-configurable via NL prompt → parsed to float.

---

## 4. Constraints

### 4.1 Business Constraints
- Single payment channel: Ppay MFS. No fallback in MVP.
- Commission rate: configurable by Admin, applied to all future payouts.
- No dual-role accounts (Buyer + Freelancer). One role per email.
- Unlimited revision cycles in MVP.

### 4.2 Technical Constraints
- All traffic TLS 1.2+.
- Payment data: Ppay handles PCI-DSS — AgentHive never stores raw card data.
- Workforce Agent credentials (API tokens) encrypted at rest (AES-256).
- Audit log is append-only — no UPDATE or DELETE on `audit_log` table.
- PostgreSQL — no NoSQL. Redis allowed only as queue backend (BullMQ).
- Frontend: Next.js App Router (not Pages Router). CSS Modules (no Tailwind).

### 4.3 Scope Constraints (Must NOT build in MVP)
- Mobile apps
- Automated dispute resolution
- Subscription plans / multi-currency
- Agent ratings / rankings
- Advanced Bidder Agent analytics
- Draft job state
- Freelancer-to-Freelancer agent marketplace

---

## 5. Auth Token Strategy (Risk R5 — Resolved)

**Decision: HttpOnly cookie with CSRF protection.**

| Aspect | Decision |
|--------|----------|
| Token type | JWT (access token, 15min expiry) + refresh token (7 days) |
| Storage | HttpOnly, Secure, SameSite=Lax cookie (never localStorage) |
| CSRF protection | Double-submit cookie pattern on state-mutating requests |
| NestJS guard | `JwtAuthGuard` on all protected routes — reads cookie |
| Next.js middleware | `middleware.ts` validates session existence, redirects to login |
| CORS | Allow-origin: `https://agenthive.app` (prod) + `http://localhost:3000` (dev) only. Credentials: true. |
| OAuth (Google) | Passport.js Google strategy on NestJS. After OAuth callback, set same HttpOnly cookie. |

---

## 6. Non-Functional Requirements — Engineering Interpretation

| NFR | Engineering approach |
|-----|---------------------|
| Job board ≤2s (p95) | Paginated API, PostgreSQL index on `jobs.status + jobs.created_at`, CDN-cached public listing |
| Bidder Agent ≤60s eval | Event-driven job publication → BullMQ fan-out. Max 60s job timeout in queue worker |
| API reads ≤200ms (p95) | DB query optimization + connection pooling (Prisma pool size 10). No N+1 queries |
| 1,000 concurrent users | Single NestJS instance handles ~500. Add second instance behind load balancer at growth |
| 99.5% uptime | Health-check endpoint `/api/v1/health`. PM2 or Docker restart-always policy |
| WCAG 2.1 AA | Semantic HTML, ARIA roles on interactive elements, colour contrast ≥4.5:1 |
| GDPR | User data deletion endpoint in Admin. No PII in logs or audit trail (user IDs only) |

---

## 7. Open Items → Resolved Before Sprint Start

| Item | Owner | Deadline | Resolution |
|------|-------|----------|------------|
| Ppay MFS SDK/sandbox access | PM + TL | Before S5 | Confirm SDK. Fallback: Stripe. |
| Google OAuth credentials (client ID/secret) | DevOps/Admin | Before S1 | Create OAuth app in Google Cloud Console |
| SendGrid API key + verified sender domain | DevOps | Before S1 | Create SendGrid account, verify domain |
| AWS S3 bucket + IAM credentials | DevOps | Before S0 end | Create bucket, generate access key pair |
| PostgreSQL production instance | DevOps | Before S0 end | AWS RDS PostgreSQL 16 or equivalent |
| Redis instance (BullMQ) | DevOps | Before S3 | AWS ElastiCache Redis or Upstash |
