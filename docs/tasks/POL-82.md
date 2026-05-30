# POL-82 — Freelancer Profile UI Fix

## Scope

Close S2 freelancer profile acceptance criteria:

- Account profile form loads from `GET /users/me` and saves `displayName`, `handle`, `bio`, and `skills` to `PATCH /users/me`.
- Client validation covers display name, handle, and bio, including 409 handle collisions as a field error.
- Profile photo upload accepts JPG/PNG up to 5 MB, posts multipart field `file` to `POST /users/me/photo`, and updates the avatar.
- Public `/freelancer/[handle]` renders real profile data from `GET /users/by-handle/:handle`, is unauthenticated, and returns Next 404 on API 404.
- Add focused component and E2E coverage for the fixed flows.

## Route And Rendering Plan

- `/account/freelancer`: protected freelancer route in `(freelancer)`, implemented as a Client Component because it needs authenticated browser fetches, form state, file input state, validation, and save/upload interactions. Data freshness is user-specific and interactive, so CSR with `credentials: include` is appropriate.
- `/freelancer/[handle]`: public route in `(public)`, implemented as a Server Component with SSR `fetch` against `NEXT_PUBLIC_API_URL`. It needs SEO metadata, unauthenticated access, and fresh public profile content, so SSR with `cache: "no-store"` is appropriate.

## Execution Checklist

- [x] Read workflow substitute, issue description, architecture, LLD, folder structure, and existing frontend code.
- [x] Implement account profile form, validation, upload, and avatar behavior.
- [x] Implement public profile route and SEO metadata.
- [x] Add component and Playwright tests.
- [x] Run frontend test/typecheck/E2E where feasible.
- [x] Handoff with results and remaining risk.
