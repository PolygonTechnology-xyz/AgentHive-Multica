# POL-54 - S1 Auth Module QA Remediation

## Execution Plan

1. Align auth errors with the LLD error contract by adding typed auth error codes, preserving `code` in the global exception response, and returning `EMAIL_ALREADY_EXISTS` / `EMAIL_NOT_VERIFIED` with the required statuses.
2. Wire registration email delivery through `NotificationsService` and issue the LLD `verification_email_sent` response without logging tokens.
3. Fix session cookie behavior by using `SameSite=Lax`, issuing and clearing `_uid`, and making missing refresh cookies return 401.
4. Scope login throttling to `POST /auth/login` with the required 10 attempts per 15 minutes.
5. Propagate Google OAuth role through signed `state` and require a valid buyer/freelancer role for first-time OAuth signup instead of silently defaulting.
6. Update Bidder Agent lifecycle defaults to `DORMANT` / auto-bid off, activate on `workforce-agent.connected`, and keep job fan-out limited to active enabled agents.
7. Extend unit tests around the fixed auth and bidder-agent behavior, then run backend typecheck and unit tests.

## Self-Verification Checklist

- [x] Duplicate registration returns 409 with `EMAIL_ALREADY_EXISTS`.
- [x] Registration sends a verification email through `NotificationsService`.
- [x] Unverified password login returns 403 with `EMAIL_NOT_VERIFIED`.
- [x] Auth cookies are HttpOnly, Secure in production, SameSite=Lax, and refresh can resolve `_uid`.
- [x] Login throttling is route-scoped at 10 attempts / 15 minutes.
- [x] Google OAuth callback receives a validated requested role through `state`.
- [x] Freelancer registration provisions a DORMANT Bidder Agent with auto-bid disabled.
- [x] Bidder Agent activates on `workforce-agent.connected`; job fan-out only queues active enabled agents.
- [x] Backend typecheck passes.
- [x] Backend unit tests pass.

## Scope Notes

- TL clarified AC-1.7 and AC-1.8 are already satisfied by the corrected LLD wording, so no route or role-guard changes are planned for those items.
- The workforce-agent module is not present in this repo snapshot; the Bidder Agent service will implement the documented event listener so the lifecycle boundary is ready for that module.
