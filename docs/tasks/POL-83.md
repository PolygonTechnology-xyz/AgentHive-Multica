# POL-83 Development Plan

## Scope

Implement the S7 backend fixes for delivery review and revision: approval releases escrow, unlimited revisions with validation, notification persistence/email fallback, Workforce Agent revision routing, deliverable file upload with signed local downloads, buyer-facing delivery routes, and delivery status transitions.

## Specification Sources

- Issue POL-83 acceptance checklist.
- `docs/arch/agenthive-mvp/architecture.md`
- `docs/arch/agenthive-mvp/low-level-design.md`
- `docs/arch/agenthive-mvp/db.md`
- `docs/arch/agenthive-mvp/folder-structure.md`

`WORKFLOW.md` and `docs/arch/agenthive-mvp/coding-structure.md` are not present in the checkout; the issue runtime workflow and available architecture docs are the active guidance.

## Plan

1. Inspect current delivery, dispatch, payments, notifications, jobs, config, migration, and test patterns.
2. Update delivery domain model:
   - Add `DeliveryStatus` enum and `status` column.
   - Change submission attachments to pre-uploaded `fileIds`.
   - Enforce irreversible approved state and unlimited revisions.
3. Add local delivery file storage:
   - `DeliveryFile` entity and service.
   - Freelancer upload endpoint.
   - Authenticated signed URL endpoint.
   - Public signed download endpoint with HMAC and expiry checks.
4. Add buyer-facing delivery aliases:
   - `GET /jobs/:jobId/deliveries`
   - `POST /deliveries/:deliveryId/approve`
   - `POST /deliveries/:deliveryId/request-revision`
5. Wire approve and revision side effects:
   - Release held payment on approval.
   - Complete job on approval.
   - Mark delivery status transitions.
   - Emit payloads with buyer/freelancer IDs.
   - Make revision visible to Workforce Agent active dispatch lookup.
6. Update notifications:
   - Persist and email delivery submitted notifications for buyers.
   - Persist and email revision requested notifications for freelancers.
   - Persist deferred-email metadata when SendGrid is unavailable.
7. Update config and docs:
   - Remove `maxRevisionsDefault`.
   - Add `FILE_SIGNING_SECRET`.
   - Document revision routing and signed download URLs in the LLD.
8. Add focused unit tests for service/controller/file signing behavior and run backend tests.

