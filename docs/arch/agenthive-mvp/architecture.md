# Architecture — AgentHive MVP
**Document:** AGH-TL-002  
**Version:** 1.0  
**Date:** 2026-05-25  
**Author:** AH-TL  
**Refs:** AGH-TL-001 (Technical Analysis), AGH-SRS-001

---

## Baseline Load

> 10 TPS sustained / 30 TPS peak / ~10,000 registered users / <200ms p95 read latency

---

## 1. System Overview

AgentHive is a monorepo containing three deployable units:

| Unit | Runtime | Entry |
|------|---------|-------|
| `backend/` | NestJS (Node.js 20 LTS) | REST API on port 3001 |
| `frontend/` | Next.js 14 App Router | SSR/CSR on port 3000 |
| `cli/` | Node.js CLI package | npm package `@agenthive/cli` |

Supporting infrastructure:
- **MySQL 8.0** — primary datastore
- **Redis** — BullMQ job queue (Bidder Agent fan-out, offline delivery queue)
- **AWS S3** — file storage (job attachments, deliverables, profile photos)
- **SendGrid** — transactional email
- **Ppay MFS** — payment processing

---

## 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet / CDN                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
          ┌────────────▼─────────────┐
          │    Next.js App Router    │  ← Static + SSR pages
          │    (frontend/)           │    CSS Modules + glassmorphism
          └────────────┬─────────────┘
                       │ HTTPS + HttpOnly Cookie
                       │ (all API calls to /api/v1/*)
          ┌────────────▼─────────────┐
          │     NestJS REST API      │  ← Modular, versioned /api/v1
          │     (backend/)           │    JWT guard on all routes
          └──┬────────┬────────┬─────┘
             │        │        │
    ┌────────▼──┐ ┌───▼────┐ ┌▼──────────────┐
    │  MySQL 8  │ │ Redis  │ │   AWS S3       │
    │ (primary) │ │(BullMQ)│ │(files/media)   │
    └───────────┘ └───┬────┘ └───────────────┘
                      │
          ┌───────────▼──────────────┐
          │   Bidder Agent Workers   │  ← BullMQ workers (NestJS)
          │   (per-agent, stateless) │    One job per new posting
          └──────────────────────────┘
                       ▲
          ┌────────────┴─────────────┐
          │   AgentHive CLI          │  ← npm: @agenthive/cli
          │   (cli/)                 │    Freelancer's machine
          └──────────────────────────┘
```

---

## 3. NestJS Module Map

Each module maps 1:1 to a feature domain. No cross-module database queries — modules communicate via exported services or events.

```
backend/src/
├── auth/                    # JWT, OAuth, guards, RBAC
├── users/                   # User entity, role management
├── freelancer-profile/      # Profile CRUD, S3 photo upload
├── workforce-agent/         # Agent registry, capability indexing
├── bidder-agent/            # Auto-provisioning, scoring, bidding
├── bidder-agent-config/     # NL prompt parser → structured config
├── jobs/                    # Job CRUD, job board, job events
├── bids/                    # Bid management (auto + manual)
├── payments/                # Ppay integration, escrow state machine
├── dispatch/                # Job dispatch, offline queue, delivery
├── review/                  # Approval, revision state machine
├── disputes/                # Dispute state, admin resolution
├── notifications/           # SendGrid email + SSE platform events
├── admin/                   # Admin account management, commission
├── audit/                   # Append-only lifecycle event logging
└── common/                  # Guards, pipes, interceptors, decorators
```

### Inter-Module Communication

Modules communicate via **NestJS EventEmitter** (sync, in-process) for MVP. No external message bus.

Key events:
```
job.published          → [bidder-agent] fan-out to all active agents
payment.confirmed      → [dispatch] trigger agent selection + dispatch
delivery.submitted     → [review] transition job to DELIVERED
approval.given         → [payments] trigger payout
revision.requested     → [dispatch] re-queue to Workforce Agent
dispute.raised         → [admin] create dispute record
```

---

## 4. Bidder Agent Architecture

The Bidder Agent is the most complex subsystem. Design for stateless horizontal scaling.

### 4.1 Job Fan-Out (BullMQ)

```
New Job Published
       │
       ▼
 JobsService.publish()
       │
       ├── emit('job.published')
       │
       ▼
 BidderAgentModule listens
       │
       ├── Query: all active BidderAgents
       │
       └── For each active BidderAgent:
              └── BullMQ.add('score-job', { jobId, agentId })
                         │
                         ▼
                  BidderAgentWorker (stateless)
                         │
                  1. Load agent skill index from DB
                  2. Load job details
                  3. Compute match_score
                  4. If score ≥ threshold → submit bid
                  5. Log bid event
```

### 4.2 NL Prompt → Config Parser

NL prompt processing flow:
```
Freelancer submits prompt text
       │
       ▼
BidderAgentConfigService.parsePrompt(text)
       │
       ├── Call Claude API (or simple rule-based for MVP):
       │     Extract: tone, price_strategy, category_filters,
       │              match_threshold (float), auto_bid_enabled (bool)
       │
       └── Persist to bidder_agents.config_json
           Store raw prompt in bidder_agent_prompts
```

> **MVP decision:** use Claude claude-haiku-4-5 for NL prompt parsing. Single API call, low cost. Prompt engineering is minimal — extract 5 structured fields from free text.

### 4.3 Bidder Agent State Machine

```
DORMANT ──(first agent connected)──→ ACTIVE
ACTIVE  ──(all agents deactivated)──→ DORMANT
ACTIVE  ──(auto_bid = off)──────────→ PAUSED
PAUSED  ──(auto_bid = on)───────────→ ACTIVE
```

---

## 5. CLI Architecture (`@agenthive/cli`)

**Language:** Node.js 20 LTS  
**Framework:** Commander.js  
**Publish:** npm registry as `@agenthive/cli`  
**Config file:** `~/.agenthive/config.json` (stores `api_url`, `access_token`)

### Commands (MVP scope — 5 commands only)

```bash
agentive auth login    # Browser-based OAuth flow or token input. Writes config.
agentive auth logout   # Invalidates token. Clears config.
agentive agent connect # Registers agent, prompts for capabilities, polls for delivery.
agentive agent list    # Lists connected agents with status.
agentive deliver       # Submit deliverable files for current active job.
```

### Online/Offline Job Delivery

```
agentive auth login
       │
       └── On login: GET /api/v1/cli/pending-jobs
              │
              └── If pending jobs in queue:
                     └── Download job briefs, write to ~/.agenthive/jobs/
```

Deliverable submission:
```bash
agentive deliver --job-id <uuid> --files ./output.pdf ./report.md
```

---

## 6. Next.js App Router Structure

### Route Groups

```
frontend/app/
├── (public)/               # No auth required
│   ├── page.tsx            # / Landing
│   ├── hire-agents/        # /hire-agents
│   ├── find-work/          # /find-work
│   ├── about/              # /about
│   ├── pricing/            # /pricing
│   └── freelancer/[handle] # /freelancer/:handle
│
├── (auth)/                 # Auth pages (redirect if already logged in)
│   ├── login/              # /login (role selector)
│   ├── login/buyer/        # /login/buyer
│   ├── login/freelancer/   # /login/freelancer
│   ├── register/           # /register (role selector)
│   ├── register/buyer/     # /register/buyer
│   └── register/freelancer/
│
├── (buyer)/                # Buyer-authenticated routes
│   ├── dashboard/buyer/
│   ├── jobs/
│   ├── payments/
│   ├── account/buyer/
│   └── notifications/buyer/
│
├── (freelancer)/           # Freelancer-authenticated routes
│   ├── dashboard/freelancer/
│   ├── jobs/freelancer/
│   ├── agents/
│   ├── configuration/
│   ├── cli-guide/
│   ├── settings/
│   ├── payments/freelancer/
│   ├── account/freelancer/
│   └── notifications/freelancer/
│
└── (admin)/                # Admin-authenticated routes
    └── admin/
```

### Auth Middleware (`middleware.ts`)

```typescript
// Runs on every request. Reads JWT from HttpOnly cookie.
// Redirects unauthenticated users to /login.
// Redirects wrong-role users to their own dashboard.
```

### Client vs Server Components

| Page type | Rendering | Reason |
|-----------|-----------|--------|
| Landing, marketing, public profile | Server Component | SEO, no auth state needed |
| Dashboard, job board, notifications | Client Component | Real-time updates, user state |
| Job creation form, settings | Client Component | Form state, validation |
| Payment pages | Client Component | Ppay redirect logic |
| Admin pages | Server Component | Fetched server-side, no interactivity |

---

## 7. Deployment Architecture (MVP)

```
                ┌─────────────────┐
                │   Cloudflare    │  ← DNS + CDN + TLS termination
                └────────┬────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
┌─────────▼──────────┐    ┌────────────▼────────────┐
│  Next.js (Vercel   │    │  NestJS (Railway /       │
│  or self-hosted)   │    │  Render / EC2)           │
└─────────────────────┘    └──────────┬──────────────┘
                                      │
              ┌───────────────────────┼───────────────┐
              │                       │               │
   ┌──────────▼──────┐   ┌───────────▼───┐  ┌────────▼────┐
   │   MySQL 8        │   │     Redis     │  │   AWS S3    │
   │ (AWS RDS)        │   │ (Upstash/     │  │  (files)    │
   └──────────────────┘   │  ElastiCache) │  └─────────────┘
                          └───────────────┘
```

**CI/CD:** GitHub Actions → test → build → deploy (S10).

---

## 8. Coding Conventions

### NestJS (Backend)

- One module per domain. Module folder = `src/<domain>/`.
- Files per module: `*.module.ts`, `*.service.ts`, `*.controller.ts`, `*.dto.ts`, `*.entity.ts`.
- DTOs validated with `class-validator`. All input DTOs validated at controller boundary.
- No raw SQL — Prisma ORM only. Entity definitions in `prisma/schema.prisma`.
- Guards: `JwtAuthGuard` (all protected routes) + `RolesGuard` (role-specific routes).
- Interceptors: `AuditInterceptor` (logs all state mutations to `audit_log`).
- Error handling: NestJS `HttpException` subclasses. No raw 500s — always structured `{ error, message, statusCode }`.
- Tests: Jest unit tests per service. Integration tests for controllers using supertest.

### Next.js (Frontend)

- App Router only. No Pages Router.
- CSS Modules (`*.module.css`) — no Tailwind, no styled-components.
- Design tokens from `design-reference/design-system.md` → `frontend/app/globals.css` CSS variables.
- `<Card>` component with glass morphism applied universally.
- `Space Grotesk` and `JetBrains Mono` loaded via `next/font/google`.
- Server Components default. `"use client"` only when required (event handlers, useState, useEffect).
- API calls from Client Components: `fetch('/api/v1/*', { credentials: 'include' })`.
- API calls from Server Components: `fetch` with server-side cookie forwarding.
- No `any` TypeScript. Strict mode enabled.

### CLI

- Commander.js with explicit command definitions.
- Config stored in `~/.agenthive/config.json` (JSON, gitignored).
- Spinner feedback for all network operations (`ora` library).
- All errors exit with non-zero code and human-readable message.
