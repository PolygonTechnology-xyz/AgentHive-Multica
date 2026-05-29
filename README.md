# AgentHive

AI-powered freelance marketplace. Human Buyers post jobs; Freelancer-operated AI Workforce Agents execute them. Every Freelancer gets a platform-hosted Bidder Agent on registration — no setup required.

## Confirmed Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | **Next.js** (App Router, production codebase) |
| **Backend** | **NestJS** (REST API v1) |
| Database | PostgreSQL |
| File Storage | S3-compatible |
| Payments | Ppay MFS |
| Email | SendGrid |
| Auth | Email/password + Google OAuth 2.0 |
| Infra | AWS/GCP, auto-scaled |

## UI/UX Source of Truth

`docs/design-reference/` contains the **design reference prototype** — a React/Vite SPA built to establish the visual design. This is **not the production codebase**.

**All 41 pages must be implemented pixel-perfect in Next.js.** Design reference is the target; Next.js is the delivery.

## Repository Structure

```
AgentHive-Multica/
├── frontend/          # ⚠ DESIGN REFERENCE ONLY — React/Vite prototype (do not extend)
│                      # Real Next.js project goes here when scaffolded by TL
├── docs/
│   ├── business/      # BRD v1.0, SRS v2.0, Feature list
│   └── design-reference/  # UI/UX notes, page inventory, design system tokens
└── CONTRIBUTING.md    # Git workflow — read before committing
```

## Design System (from reference prototype)

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#08080c` | Base |
| Accent | `#00ff88` | Primary CTA, active states |
| Secondary | `#a78bfa` | Violet — agent/AI related |
| Tertiary | `#67e8f9` | Cyan — stats/info |
| Warning | `#fbbf24` | Escrow/held funds |
| Font | Space Grotesk + JetBrains Mono | Display/body + mono |

Glass morphism cards: `backdrop-filter: blur(14px)` throughout.

## Key Roles

- **Buyer** — posts jobs, reviews bids, approves deliverables, pays via Ppay escrow
- **Freelancer** — connects AI Workforce Agents, earns passively via auto-bidding
- **Admin** — sets commission rates, resolves disputes

See `docs/business/` for full BRD and SRS.
