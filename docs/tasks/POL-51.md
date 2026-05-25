# POL-51 - S0-FE: Next.js Scaffold + Design System

## Execution Plan

1. Replace the React/Vite prototype in `frontend/` with a fresh Next.js 14 App Router application.
2. Recreate the route groups and placeholder pages from `docs/arch/agenthive-mvp/folder-structure.md`.
3. Add global design tokens, Space Grotesk and JetBrains Mono font loading, and base dark theme styles from `docs/design-reference/design-system.md`.
4. Implement role-aware middleware and server-side layout guards for buyer, freelancer, and admin areas.
5. Add reusable UI primitives, API/auth helpers, session and notification hooks, shared types, and the themed `not-found` page.
6. Verify strict TypeScript, lint/build behavior, and local dev startup.

## Route Design

- Public group: `/`, `/hire-agents`, `/find-work`, `/about`, `/pricing`, `/freelancer/[handle]`.
- Auth group: `/login`, `/login/buyer`, `/login/freelancer`, `/register`, `/register/buyer`, `/register/buyer/verify`, `/register/buyer/verified`, `/register/freelancer`, `/register/freelancer/verify`, `/register/freelancer/verified`, `/forgot-password`.
- Buyer group: `/dashboard/buyer`, `/jobs`, `/jobs/create`, `/jobs/[id]/bids`, `/jobs/[id]/payment`, `/jobs/[id]/payment/success`, `/jobs/[id]/payment/failed`, `/jobs/[id]/progress`, `/jobs/[id]/delivery`, `/jobs/[id]/revision`, `/jobs/[id]/complete`, `/payments`, `/account/buyer`, `/notifications/buyer`.
- Freelancer group: `/dashboard/freelancer`, `/jobs/freelancer`, `/agents`, `/configuration`, `/cli-guide`, `/settings`, `/payments/freelancer`, `/account/freelancer`, `/notifications/freelancer`.
- Admin group: `/admin`, `/admin/accounts`, `/admin/commission`, `/admin/disputes`, `/admin/disputes/[id]`.

## Rendering Strategy

- Public marketing and public freelancer profile routes use Server Components with static rendering by default because they need SEO value and have no per-user state in this scaffold.
- Auth routes use Server Components for the initial shell because login/register forms are placeholders in S0 and the backend auth integration will add client form state later.
- Buyer and freelancer dashboards, job lists, settings, payments, and notification routes are protected Server Component placeholders wrapped by server layout guards. Later feature work should convert interactive panels and forms to Client Components only where hooks, form state, or live updates require it.
- Admin routes use protected Server Component placeholders because the target UX is server-fetched administrative data with minimal client interactivity.
- `useSession` and `useNotifications` are Client Component hooks and are isolated under `hooks/` so pages can opt in when interactive features land.

## Self-Verification Checklist

- [x] `frontend/` no longer contains the Vite prototype.
- [x] Next.js 14 App Router starts on port 3000.
- [x] CSS variables and fonts are loaded globally.
- [x] Route groups and placeholders match the folder structure doc.
- [x] Middleware and protected layouts redirect unauthenticated and wrong-role users.
- [x] UI primitives, API/auth helpers, hooks, and shared types exist.
- [x] TypeScript and component tests pass.

## Implementation Note

Next.js 14.2 rejects `next.config.ts` at runtime, so the scaffold uses the supported `next.config.mjs` file with the required API URL and image-domain settings.
