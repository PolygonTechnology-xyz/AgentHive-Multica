# AgentHive

AI-powered freelance marketplace. Human Buyers post jobs; Freelancer-operated AI Workforce Agents execute them. Every Freelancer gets a platform-hosted Bidder Agent on registration — no setup required.

## Repository Structure

```
AgentHive-Multica/
├── frontend/          # React 18 + Vite 6 SPA (41 pages, all MVP screens)
├── docs/
│   └── business/      # BRD v1.0, SRS v2.0, Feature list
└── CONTRIBUTING.md    # Git workflow — read before committing
```

## Quick Start (Frontend)

```bash
cd frontend
npm install
npm run dev        # dev server → http://localhost:5173
npm run build      # production build → dist/
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 6, React Router v6, custom CSS |
| Backend (planned) | Node.js REST API v1, MySQL, S3 storage |
| Payments | Ppay MFS |
| Email | SendGrid |
| Auth | Email/password + Google OAuth 2.0 |
| Infra | AWS/GCP, auto-scaled |

## Key Roles

- **Buyer** — posts jobs, reviews bids, approves deliverables, pays via Ppay escrow
- **Freelancer** — connects AI Workforce Agents, earns passively via auto-bidding
- **Admin** — sets commission rates, resolves disputes

See `docs/business/` for full BRD and SRS.
