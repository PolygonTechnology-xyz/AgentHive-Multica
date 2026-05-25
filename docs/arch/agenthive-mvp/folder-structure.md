# Folder Structure — AgentHive MVP
**Document:** AGH-TL-006  
**Version:** 1.0  
**Date:** 2026-05-25  
**Author:** AH-TL

---

## Monorepo Root

```
AgentHive-Multica/
├── backend/                # NestJS REST API
├── frontend/               # Next.js App Router (replaces React prototype)
├── cli/                    # @agenthive/cli npm package
├── prisma/                 # Prisma schema + migrations + seed
├── docs/
│   ├── arch/agenthive-mvp/ # TL architecture docs (this folder)
│   ├── srs/                # PM SRS
│   ├── features/           # PM feature breakdown
│   ├── design-reference/   # Design system + page inventory
│   └── business/           # BRD + original SRS docs
├── .github/
│   └── workflows/          # CI/CD (S10)
├── CONTRIBUTING.md
└── README.md
```

---

## Backend (`backend/`)

```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── google.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── dto/
│   │       ├── register-buyer.dto.ts
│   │       ├── register-freelancer.dto.ts
│   │       └── login.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.repository.ts
│   │
│   ├── freelancer-profile/
│   │   ├── freelancer-profile.module.ts
│   │   ├── freelancer-profile.controller.ts
│   │   ├── freelancer-profile.service.ts
│   │   └── dto/
│   │       └── update-profile.dto.ts
│   │
│   ├── workforce-agent/
│   │   ├── workforce-agent.module.ts
│   │   ├── workforce-agent.controller.ts
│   │   ├── workforce-agent.service.ts
│   │   └── dto/
│   │       └── connect-agent.dto.ts
│   │
│   ├── bidder-agent/
│   │   ├── bidder-agent.module.ts
│   │   ├── bidder-agent.service.ts
│   │   ├── bidder-agent.worker.ts      # BullMQ worker: score-job
│   │   ├── bidder-agent.processor.ts   # BullMQ processor definition
│   │   └── scoring.engine.ts           # match_score computation
│   │
│   ├── bidder-agent-config/
│   │   ├── bidder-agent-config.module.ts
│   │   ├── bidder-agent-config.controller.ts
│   │   ├── bidder-agent-config.service.ts
│   │   └── prompt-parser.service.ts    # Claude API integration
│   │
│   ├── jobs/
│   │   ├── jobs.module.ts
│   │   ├── jobs.controller.ts
│   │   ├── jobs.service.ts
│   │   └── dto/
│   │       └── create-job.dto.ts
│   │
│   ├── bids/
│   │   ├── bids.module.ts
│   │   ├── bids.controller.ts
│   │   ├── bids.service.ts
│   │   └── dto/
│   │       └── create-bid.dto.ts
│   │
│   ├── payments/
│   │   ├── payments.module.ts
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── ppay.client.ts              # Ppay SDK wrapper
│   │   └── dto/
│   │       └── ppay-webhook.dto.ts
│   │
│   ├── dispatch/
│   │   ├── dispatch.module.ts
│   │   ├── dispatch.service.ts
│   │   ├── delivery.controller.ts      # CLI delivery endpoint
│   │   └── offline-queue.service.ts
│   │
│   ├── review/
│   │   ├── review.module.ts
│   │   ├── review.controller.ts
│   │   └── review.service.ts
│   │
│   ├── disputes/
│   │   ├── disputes.module.ts
│   │   ├── disputes.controller.ts
│   │   └── disputes.service.ts
│   │
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts # SSE stream endpoint
│   │   ├── notifications.service.ts
│   │   ├── email.service.ts            # SendGrid wrapper
│   │   └── templates/                  # Email HTML templates
│   │       ├── bid-placed.html
│   │       ├── bid-won.html
│   │       ├── job-delivered.html
│   │       ├── revision-requested.html
│   │       └── payment-confirmation.html
│   │
│   ├── admin/
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   └── admin.service.ts
│   │
│   ├── audit/
│   │   ├── audit.module.ts
│   │   ├── audit.service.ts
│   │   └── audit.interceptor.ts        # NestJS interceptor on state mutations
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── s3/
│   │       └── s3.service.ts           # AWS S3 upload/download
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test/
│   ├── auth.e2e-spec.ts
│   ├── jobs.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## Frontend (`frontend/`)

> Replaces the React/Vite prototype. Start fresh — Next.js App Router.

```
frontend/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # / Landing
│   │   ├── hire-agents/page.tsx
│   │   ├── find-work/page.tsx
│   │   ├── about/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── freelancer/[handle]/page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx                # Role selector
│   │   │   ├── buyer/page.tsx
│   │   │   └── freelancer/page.tsx
│   │   ├── register/
│   │   │   ├── page.tsx                # Role selector
│   │   │   ├── buyer/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── verify/page.tsx
│   │   │   │   └── verified/page.tsx
│   │   │   └── freelancer/
│   │   │       ├── page.tsx
│   │   │       ├── verify/page.tsx
│   │   │       └── verified/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── (buyer)/
│   │   ├── layout.tsx                  # Buyer auth guard
│   │   ├── dashboard/buyer/page.tsx
│   │   ├── jobs/
│   │   │   ├── page.tsx                # My Jobs list
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/
│   │   │       ├── bids/page.tsx
│   │   │       ├── payment/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── success/page.tsx
│   │   │       │   └── failed/page.tsx
│   │   │       ├── progress/page.tsx
│   │   │       ├── delivery/page.tsx
│   │   │       ├── revision/page.tsx
│   │   │       └── complete/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── account/buyer/page.tsx
│   │   └── notifications/buyer/page.tsx
│   │
│   ├── (freelancer)/
│   │   ├── layout.tsx                  # Freelancer auth guard
│   │   ├── dashboard/freelancer/page.tsx
│   │   ├── jobs/freelancer/page.tsx
│   │   ├── agents/page.tsx
│   │   ├── configuration/page.tsx
│   │   ├── cli-guide/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── payments/freelancer/page.tsx
│   │   ├── account/freelancer/page.tsx
│   │   └── notifications/freelancer/page.tsx
│   │
│   ├── (admin)/
│   │   ├── layout.tsx                  # Admin auth guard
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── accounts/page.tsx
│   │       ├── commission/page.tsx
│   │       └── disputes/
│   │           ├── page.tsx
│   │           └── [id]/page.tsx
│   │
│   ├── globals.css                     # CSS variables from design-system.md
│   ├── layout.tsx                      # Root layout (fonts, metadata)
│   └── not-found.tsx
│
├── components/
│   ├── ui/
│   │   ├── Card/
│   │   │   ├── Card.tsx                # Glass morphism card
│   │   │   └── Card.module.css
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Badge/
│   │   ├── Modal/
│   │   └── Spinner/
│   ├── layout/
│   │   ├── BuyerNav/
│   │   ├── FreelancerNav/
│   │   └── AdminNav/
│   └── features/
│       ├── BidCard/
│       ├── JobCard/
│       ├── AgentCard/
│       ├── BidderAgentPanel/
│       ├── BidFeed/                    # Live bid console (Landing + Dashboard)
│       └── NotificationPanel/
│
├── lib/
│   ├── api.ts                          # fetch wrapper with credentials:include
│   ├── auth.ts                         # Session helpers
│   └── utils.ts
│
├── hooks/
│   ├── useNotifications.ts             # SSE subscription hook
│   └── useSession.ts
│
├── types/
│   └── index.ts                        # Shared TS types
│
├── middleware.ts                       # Route protection + role redirect
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## CLI (`cli/`)

```
cli/
├── src/
│   ├── commands/
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   └── logout.ts
│   │   ├── agent/
│   │   │   ├── connect.ts
│   │   │   └── list.ts
│   │   └── deliver.ts
│   ├── lib/
│   │   ├── api.ts                      # API client (Bearer token)
│   │   ├── config.ts                   # ~/.agenthive/config.json manager
│   │   └── spinner.ts                  # ora wrapper
│   └── index.ts                        # Commander.js entry point
├── package.json
└── tsconfig.json
```

---

## Prisma (`prisma/`)

```
prisma/
├── schema.prisma
├── migrations/
│   └── 0001_initial/
│       └── migration.sql
└── seed.ts                             # Admin account + commission rate defaults
```
