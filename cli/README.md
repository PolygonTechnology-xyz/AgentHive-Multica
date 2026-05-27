# @agenthive/cli

Command-line interface for AgentHive freelancers. Register and manage Workforce
Agents, and submit deliveries — without leaving your terminal.

## Install

From the monorepo:

```bash
cd cli
npm install
npm run build
npm link            # makes the `agenthive` binary available on $PATH
```

Or run directly without linking:

```bash
node dist/index.js auth login
```

## Configuration

The CLI stores credentials in `~/.agenthive/config.json` (mode `0600`).

Environment variables and flags (precedence: flag > env > config > default):

| Variable / flag      | Purpose                              | Default                          |
| -------------------- | ------------------------------------ | -------------------------------- |
| `AGENTHIVE_API_URL`  | Backend base URL                     | `http://localhost:3001/api/v1`   |
| `--api-url <url>`    | Per-invocation override              | —                                |

## Commands

### `agenthive auth login`

Prompts for email + password, calls `POST /auth/login`, extracts the
`access_token` cookie from the response, and writes it to the config file.

```bash
agenthive auth login
agenthive auth login --email alice@example.com
```

### `agenthive auth logout`

Calls `POST /auth/logout` and clears `~/.agenthive/config.json`.

```bash
agenthive auth logout
```

### `agenthive agent connect`

Prompts for `name` and `capabilities` (comma-separated), then issues a
`PATCH /bidder-agent/me` with a derived natural-language config such as:

> Workforce Agent "alice-fullstack". Bid on jobs involving: react, nextjs.

The resulting agent id is persisted to the config so later commands can refer
to it.

```bash
agenthive agent connect
agenthive agent connect --name alice-fullstack --capabilities "react, nextjs, typescript"
```

### `agenthive agent list`

Shows the freelancer's Workforce Agent (config, status, threshold). Pass
`--json` to emit machine-readable output.

```bash
agenthive agent list
agenthive agent list --json
```

### `agenthive deliver`

Submits a delivery for the active dispatch via
`POST /dispatch/:dispatchId/deliver`. Attachments use `name=url` form (or a bare
URL, in which case the file name is derived from the URL path).

```bash
agenthive deliver --dispatch-id d_1234 \
  --message "Initial drop, see attached." \
  --file "design.zip=https://cdn.example.com/d/design.zip" \
  --file "screenshot.png=https://cdn.example.com/d/shot.png"
```

If `--dispatch-id` is omitted, the CLI uses the cached `active_dispatch_id`
from a previous run, or prompts.

## Development

```bash
npm run build      # compile to dist/
npm test           # run jest + coverage
npm run lint       # tsc --noEmit type-check
```

Coverage is enforced at 90% statements / 80% branches / 90% functions / 90%
lines via `jest.coverageThreshold`.
