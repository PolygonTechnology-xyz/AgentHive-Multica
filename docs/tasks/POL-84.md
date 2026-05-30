# POL-84 - S7-FE-FIX: Review + Revision Frontend

## Execution Plan

1. Realign buyer delivery, revision, and completion pages with the S7 delivery/review API contract.
2. Add an accessible approve confirmation dialog before releasing escrow payment.
3. Render buyer delivery history by revision round, with the latest submitted round expanded for action.
4. Validate revision notes client-side before any request and surface backend `ApiError.message` on failures.
5. Update review submission to use the latest delivery's `submittedBy` as `revieweeId`.
6. Add component and Playwright coverage for attachment rendering, status gating, revision validation, and approve confirmation.

## Route Design

- `/jobs/[id]/delivery`: buyer delivery review, delivery history, approve, and request-revision actions.
- `/jobs/[id]/revision`: buyer focused revision request form for the latest delivery.
- `/jobs/[id]/complete`: buyer post-approval review form.

No new routes are required; this task updates existing protected buyer routes.

## Rendering Strategy

- `/jobs/[id]/delivery` remains a Client Component because it depends on per-user authenticated SWR data, textarea state, inline validation, modal state, and mutation actions. SSR would not improve SEO for this protected buyer workflow.
- `/jobs/[id]/revision` remains a Client Component for the same authenticated fetch and mutation/form-state reasons.
- `/jobs/[id]/complete` remains a Client Component because it loads the latest delivery client-side to identify the freelancer reviewee and handles an interactive review form. The route is protected, non-indexable, and data must be fresh after approval.

## Self-Verification Checklist

- [x] Delivery page fetches `/jobs/:id/deliveries` and renders `attachments[].downloadUrl`.
- [x] Delivery actions are shown only for `latest.status === "submitted"`.
- [x] Approve posts to `/deliveries/:deliveryId/approve` after confirmation.
- [x] Revision requests post `{ reason }` to `/deliveries/:deliveryId/request-revision`.
- [x] Revision notes shorter than 10 characters are blocked client-side.
- [x] Complete page posts reviews to `/jobs/:id/reviews` with `revieweeId`.
- [x] Delivery history displays round badges.
- [x] Component/unit tests cover the critical delivery behavior.
- [x] Playwright covers revision validation and approve confirmation.
