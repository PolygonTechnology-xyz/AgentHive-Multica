# POL-74 Backend Execution Plan

## Scope

Fix the backend gaps called out by QA for S8 notifications and freelancer dashboard support:

- Persist and email notification events for bid placed, bid won, job delivered, revision requested, payment confirmed, and payout confirmed.
- Add a server-sent events stream for authenticated user notifications.
- Emit missing bid lifecycle events from the bids service.
- Add backend endpoints required by the current freelancer dashboard pages:
  - `GET /jobs/freelancer`
  - `GET /payments/freelancer`
  - `GET /bidder-agent/list`
  - `PATCH /bidder-agent/:id/config`
  - `PATCH /bidder-agent/:id/pause`
  - `PATCH /bidder-agent/:id/resume`
- Add focused unit coverage for the new cross-module wiring.

## Development Plan

1. Inspect current module APIs and entity relationships for jobs, bids, payments, delivery, notifications, and bidder-agent.
2. Implement notification service methods with strict payload types, SendGrid best-effort email sending, and in-process SSE fan-out.
3. Replace placeholder event listeners with real handlers and add missing event names from the QA report.
4. Add service/controller methods for dashboard-compatible jobs, payments, and bidder-agent routes without introducing cross-module DB access outside existing module ownership.
5. Extend unit tests around event emission, notification listeners, SSE controller behavior, and new dashboard endpoints.
6. Run typecheck and backend unit tests, then verify `git diff main...HEAD` is non-empty before handoff.

## Self-Check

- [x] Notification listeners call `notify` for all required event types.
- [x] SSE stream endpoint exists and emits new notifications for the authenticated user.
- [x] Bid placement and acceptance emit platform events.
- [x] Freelancer dashboard backend endpoints exist and are role-guarded.
- [x] Unit tests cover the changed behavior.
- [x] `npm run typecheck` passes.
- [x] Backend unit suite passes.
