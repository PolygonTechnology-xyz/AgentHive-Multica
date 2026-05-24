# Contributing to AgentHive

**Single repo. Single source of truth. Main is always deployable.**

---

## Repository

`https://github.com/PolygonTechnology-xyz/AgentHive-Multica`

This is the **only** repository for AgentHive code. Do not create forks or alternative repos.

---

## Branch Strategy

| Branch | Purpose | Who pushes |
|--------|---------|-----------|
| `main` | Production-ready code at all times | TL only (via PR merge) |
| `feature/<ticket-id>-<slug>` | New features | Developers |
| `fix/<ticket-id>-<slug>` | Bug fixes | Developers |
| `chore/<slug>` | Config, deps, tooling | Developers |

**Never commit directly to `main`.** All code reaches `main` through a reviewed PR.

---

## Daily Workflow

### 1. Always start from latest main

```bash
git checkout main
git pull origin main
git checkout -b feature/POL-42-buyer-dashboard
```

### 2. Commit often, commit small

Each commit should represent one logical unit of work.

```bash
git add <specific files>          # never: git add -A blindly
git commit -m "feat(buyer): add stat cards to dashboard"
git push origin feature/POL-42-buyer-dashboard
```

### 3. Commit message format (Conventional Commits)

```
<type>(<scope>): <short description>

[optional body — explain WHY, not WHAT]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`

**Scopes (use the module):** `buyer`, `freelancer`, `agent`, `bidder`, `auth`, `payment`, `admin`, `cli`, `jobs`

Examples:
```
feat(bidder): auto-provision bidder agent on freelancer registration
fix(payment): handle ppay webhook timeout on escrow activation
chore(frontend): upgrade vite to 6.4
docs(srs): add acceptance criteria for UC-5.2.4
```

### 4. Open a Pull Request

- Target: `main`
- Title: mirrors commit format (`feat(scope): description`)
- Description: what changed + link to the Multica issue (`POL-XX`)
- Assign TL as reviewer

### 5. TL reviews and merges

TL approves and merges to `main`. After merge, **delete the feature branch**.

---

## Rules

1. **No `.env` files** — never commit secrets, API keys, or credentials. Use environment variables via the deployment platform.
2. **No `node_modules/`** or `dist/` — covered by `.gitignore`.
3. **No force-pushing to `main`** — ever.
4. **No merge commits from personal machines** to `main` — squash or rebase when TL merges.
5. Every task in Multica maps to a branch. Branch name must include the issue identifier (e.g., `POL-42`).

---

## Folder Ownership

| Folder | Owner role |
|--------|-----------|
| `frontend/` | Frontend developers + TL |
| `backend/` (coming) | Backend developers + TL |
| `docs/` | PM (read-only for devs) |

---

## TL Responsibilities

- Review all PRs before merge
- Merge to `main` (never let developers self-merge)
- Tag releases after each sprint (`v0.1.0`, `v0.2.0`, …)
- Enforce this guide — reject PRs that violate naming or content rules

---

## Questions?

Open a comment on the relevant Multica issue.
