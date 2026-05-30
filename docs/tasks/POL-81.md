# POL-81 Development Plan

## Context

Implement the S2 backend and CLI fixes needed to close the profile, Workforce Agent, BidderAgent lifecycle, JWT logout, and bearer-only CLI acceptance criteria.

`WORKFLOW.md` is not present in the repository checkout. This plan follows the Multica runtime workflow, the issue body, and the architecture docs under `docs/arch/agenthive-mvp/`.

## Plan

1. Inspect current backend and CLI implementations to preserve module boundaries and existing TypeORM/NestJS patterns.
2. Extend the user/profile surface:
   - Add profile fields and migration support to the `User` entity.
   - Add DTO validation, authenticated `/users/me` read/update, photo upload, and public `/users/by-handle/:handle`.
   - Keep public profile responses sanitized.
3. Add Workforce Agent registry:
   - Create entity, DTOs, service, controller, module wiring, and migration.
   - Enforce owner access, soft removal, bearer-only auth, and reindex job enqueueing.
4. Update BidderAgent lifecycle:
   - Add `DORMANT` status and `skillIndex`.
   - Aggregate active WorkforceAgent skills and transition DORMANT/ACTIVE from registry events.
   - Preserve existing one-to-one BidderAgent/user uniqueness.
5. Fix auth and CLI token behavior:
   - Add JWT `jti`, logout blacklist, JwtStrategy blacklist checks, and login response access token payload.
   - Add bearer-only JWT strategy/guard for CLI-facing controllers.
   - Update CLI auth and agent commands to use bearer tokens only.
6. Add focused unit tests for changed backend services/guards/controllers and CLI commands.
7. Run backend and CLI tests/type checks where dependencies are available, then self-check the issue checklist before handoff.
