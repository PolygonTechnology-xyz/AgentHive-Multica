# Database Schema — AgentHive MVP
**Document:** AGH-TL-004  
**Version:** 1.0  
**Date:** 2026-05-25  
**Author:** AH-TL  
**Engine:** MySQL 8.0  
**ORM:** Prisma

---

## Schema Conventions

- All PKs: UUID (`CHAR(36)`, generated application-side with `uuid()`)
- All timestamps: `DATETIME(3)` UTC, named `created_at` / `updated_at`
- Status columns: `ENUM` or `VARCHAR(32)` with constraint
- `updated_at`: auto-updated via Prisma `@updatedAt`
- No soft deletes — hard delete or status flag where appropriate
- `audit_log`: **no UPDATE, no DELETE** — append-only enforced at application layer
- All FK columns: `CHAR(36)` — explicit `INDEX` on FK columns

---

## Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// AUTH & USERS
// ─────────────────────────────────────────────

model User {
  id           String   @id @default(uuid()) @db.Char(36)
  email        String   @unique @db.VarChar(255)
  password     String?  @db.VarChar(255)  // null for OAuth-only users
  role         Role
  verified     Boolean  @default(false)
  active       Boolean  @default(true)
  created_at   DateTime @default(now()) @db.DateTime(3)
  updated_at   DateTime @updatedAt @db.DateTime(3)

  refreshTokens    RefreshToken[]
  freelancerProfile FreelancerProfile?
  jobs             Job[]          // Buyer's jobs
  bids             Bid[]          // Freelancer's bids
  disputes         Dispute[]
  notifications    Notification[]

  @@index([email])
  @@index([role])
  @@map("users")
}

enum Role {
  buyer
  freelancer
  admin
}

model RefreshToken {
  id         String   @id @default(uuid()) @db.Char(36)
  user_id    String   @db.Char(36)
  token      String   @db.VarChar(512)
  expires_at DateTime @db.DateTime(3)
  created_at DateTime @default(now()) @db.DateTime(3)
  revoked    Boolean  @default(false)

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([token])
  @@map("refresh_tokens")
}

// ─────────────────────────────────────────────
// ADMIN & CONFIG
// ─────────────────────────────────────────────

model PlatformConfig {
  key        String   @id @db.VarChar(64)
  value      String   @db.VarChar(255)
  updated_by String   @db.Char(36)  // admin user_id
  updated_at DateTime @updatedAt @db.DateTime(3)

  @@map("platform_config")
}

// commission_rate stored as "0.15" (string, parsed as float)

// ─────────────────────────────────────────────
// FREELANCER PROFILE
// ─────────────────────────────────────────────

model FreelancerProfile {
  id           String   @id @default(uuid()) @db.Char(36)
  user_id      String   @unique @db.Char(36)
  handle       String   @unique @db.VarChar(64)  // URL slug
  display_name String   @db.VarChar(128)
  bio          String?  @db.Text
  photo_url    String?  @db.VarChar(512)  // S3 URL
  created_at   DateTime @default(now()) @db.DateTime(3)
  updated_at   DateTime @updatedAt @db.DateTime(3)

  user           User             @relation(fields: [user_id], references: [id], onDelete: Cascade)
  workforceAgents WorkforceAgent[]
  bidderAgent    BidderAgent?

  @@index([handle])
  @@map("freelancer_profiles")
}

// ─────────────────────────────────────────────
// WORKFORCE AGENT
// ─────────────────────────────────────────────

model WorkforceAgent {
  id                  String   @id @default(uuid()) @db.Char(36)
  freelancer_id       String   @db.Char(36)  // FK → freelancer_profiles.id
  name                String   @db.VarChar(128)
  status              AgentStatus @default(ACTIVE)
  categories          Json                    // string[]
  tags                Json                    // string[]
  languages           Json                    // string[]
  frameworks          Json                    // string[]
  specializations     Json                    // string[]
  max_concurrent_jobs Int      @default(1)
  avg_turnaround_hours Float   @default(24)
  skill_index         String   @db.Text       // FULLTEXT search target: concat of all above
  webhook_url         String?  @db.VarChar(512)  // agent's delivery endpoint
  api_token_enc       String?  @db.VarChar(512)  // encrypted AES-256 agent API token
  connected_at        DateTime @default(now()) @db.DateTime(3)
  updated_at          DateTime @updatedAt @db.DateTime(3)

  freelancerProfile FreelancerProfile @relation(fields: [freelancer_id], references: [id], onDelete: Cascade)
  dispatches        DispatchQueue[]

  @@index([freelancer_id])
  @@index([status])
  @@fulltext([skill_index])
  @@map("workforce_agents")
}

enum AgentStatus {
  ACTIVE
  INACTIVE
}

// ─────────────────────────────────────────────
// BIDDER AGENT
// ─────────────────────────────────────────────

model BidderAgent {
  id            String         @id @default(uuid()) @db.Char(36)
  freelancer_id String         @unique @db.Char(36)  // FK → freelancer_profiles.id
  status        BidderStatus   @default(DORMANT)
  config        Json           // structured config (see technical-analysis §3.3)
  created_at    DateTime       @default(now()) @db.DateTime(3)
  updated_at    DateTime       @updatedAt @db.DateTime(3)

  freelancerProfile FreelancerProfile      @relation(fields: [freelancer_id], references: [id])
  prompts           BidderAgentPrompt[]
  bids              Bid[]

  @@index([status])
  @@map("bidder_agents")
}

enum BidderStatus {
  DORMANT
  ACTIVE
  PAUSED
}

model BidderAgentPrompt {
  id            String   @id @default(uuid()) @db.Char(36)
  agent_id      String   @db.Char(36)
  raw_prompt    String   @db.Text
  parsed_config Json     // structured config extracted from prompt
  created_at    DateTime @default(now()) @db.DateTime(3)

  bidderAgent BidderAgent @relation(fields: [agent_id], references: [id], onDelete: Cascade)

  @@index([agent_id])
  @@map("bidder_agent_prompts")
}

// ─────────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────────

model Job {
  id          String    @id @default(uuid()) @db.Char(36)
  buyer_id    String    @db.Char(36)  // FK → users.id
  title       String    @db.VarChar(255)
  description String    @db.Text
  budget      Decimal   @db.Decimal(10, 2)
  deadline    DateTime  @db.DateTime(3)
  status      JobStatus @default(OPEN)
  created_at  DateTime  @default(now()) @db.DateTime(3)
  updated_at  DateTime  @updatedAt @db.DateTime(3)

  buyer          User             @relation(fields: [buyer_id], references: [id])
  attachments    JobAttachment[]
  bids           Bid[]
  payment        Payment?
  dispatchQueue  DispatchQueue[]
  deliverables   Deliverable[]
  revisionCycles RevisionCycle[]
  dispute        Dispute?

  @@index([buyer_id])
  @@index([status])
  @@index([created_at])
  @@map("jobs")
}

enum JobStatus {
  OPEN              // accepting bids
  PAYMENT_PENDING   // bid selected, awaiting payment
  AWAITING_DISPATCH // paid, pending agent selection
  IN_PROGRESS       // dispatched to Workforce Agent
  DELIVERED         // deliverables submitted
  IN_REVISION       // revision requested
  COMPLETE          // buyer approved
  DISPUTED          // dispute raised
  CANCELLED
}

model JobAttachment {
  id         String   @id @default(uuid()) @db.Char(36)
  job_id     String   @db.Char(36)
  filename   String   @db.VarChar(255)
  s3_key     String   @db.VarChar(512)
  size_bytes Int
  created_at DateTime @default(now()) @db.DateTime(3)

  job Job @relation(fields: [job_id], references: [id], onDelete: Cascade)

  @@index([job_id])
  @@map("job_attachments")
}

// ─────────────────────────────────────────────
// BIDS
// ─────────────────────────────────────────────

model Bid {
  id               String    @id @default(uuid()) @db.Char(36)
  job_id           String    @db.Char(36)
  freelancer_id    String    @db.Char(36)  // FK → users.id
  bidder_agent_id  String?   @db.Char(36)  // null for manual bids
  amount           Decimal   @db.Decimal(10, 2)
  eta_hours        Int
  match_score      Float?                  // null for manual bids
  capability_summary String? @db.Text
  source           BidSource @default(auto)
  status           BidStatus @default(PENDING)
  created_at       DateTime  @default(now()) @db.DateTime(3)

  job         Job          @relation(fields: [job_id], references: [id])
  freelancer  User         @relation(fields: [freelancer_id], references: [id])
  bidderAgent BidderAgent? @relation(fields: [bidder_agent_id], references: [id])

  @@index([job_id])
  @@index([freelancer_id])
  @@index([status])
  @@map("bids")
}

enum BidSource {
  auto
  manual
}

enum BidStatus {
  PENDING
  WON
  LOST
  WITHDRAWN
}

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────

model Payment {
  id              String        @id @default(uuid()) @db.Char(36)
  job_id          String        @unique @db.Char(36)
  buyer_id        String        @db.Char(36)
  freelancer_id   String        @db.Char(36)
  amount          Decimal       @db.Decimal(10, 2)
  commission_rate Decimal       @db.Decimal(5, 4)  // e.g. 0.1500
  net_payout      Decimal       @db.Decimal(10, 2)  // amount × (1 - commission_rate)
  status          PaymentStatus @default(PENDING)
  ppay_ref        String?       @db.VarChar(255)  // Ppay transaction reference
  paid_at         DateTime?     @db.DateTime(3)
  released_at     DateTime?     @db.DateTime(3)
  created_at      DateTime      @default(now()) @db.DateTime(3)
  updated_at      DateTime      @updatedAt @db.DateTime(3)

  job Job @relation(fields: [job_id], references: [id])

  @@index([job_id])
  @@index([buyer_id])
  @@index([freelancer_id])
  @@map("payments")
}

enum PaymentStatus {
  PENDING
  ESCROW     // paid, held
  RELEASED   // payout sent to Freelancer
  REFUNDED   // refunded to Buyer
  PARTIAL_REFUND
  FAILED
}

// ─────────────────────────────────────────────
// DISPATCH & DELIVERY
// ─────────────────────────────────────────────

model DispatchQueue {
  id               String         @id @default(uuid()) @db.Char(36)
  job_id           String         @db.Char(36)
  workforce_agent_id String       @db.Char(36)
  status           DispatchStatus @default(PENDING)
  attempt_count    Int            @default(0)
  queued_at        DateTime       @default(now()) @db.DateTime(3)
  delivered_at     DateTime?      @db.DateTime(3)
  last_attempt_at  DateTime?      @db.DateTime(3)

  job            Job            @relation(fields: [job_id], references: [id])
  workforceAgent WorkforceAgent @relation(fields: [workforce_agent_id], references: [id])

  @@index([job_id])
  @@index([workforce_agent_id])
  @@index([status])
  @@map("dispatch_queue")
}

enum DispatchStatus {
  PENDING
  DELIVERED
  FAILED
}

model Deliverable {
  id          String   @id @default(uuid()) @db.Char(36)
  job_id      String   @db.Char(36)
  round       Int      @default(1)  // revision round number
  filename    String   @db.VarChar(255)
  s3_key      String   @db.VarChar(512)
  size_bytes  Int
  uploaded_at DateTime @default(now()) @db.DateTime(3)

  job Job @relation(fields: [job_id], references: [id])

  @@index([job_id])
  @@map("deliverables")
}

// ─────────────────────────────────────────────
// REVIEW & REVISION
// ─────────────────────────────────────────────

model RevisionCycle {
  id             String   @id @default(uuid()) @db.Char(36)
  job_id         String   @db.Char(36)
  round          Int      // 1, 2, 3...
  comments       String   @db.Text
  requested_at   DateTime @default(now()) @db.DateTime(3)
  resubmitted_at DateTime? @db.DateTime(3)

  job Job @relation(fields: [job_id], references: [id])

  @@index([job_id])
  @@map("revision_cycles")
}

// ─────────────────────────────────────────────
// DISPUTES
// ─────────────────────────────────────────────

model Dispute {
  id          String         @id @default(uuid()) @db.Char(36)
  job_id      String         @unique @db.Char(36)
  raised_by   String         @db.Char(36)  // FK → users.id
  reason      String         @db.Text
  status      DisputeStatus  @default(OPEN)
  resolution  String?        @db.VarChar(64)  // RELEASED | FULL_REFUND | PARTIAL_REFUND | EXTENDED
  resolved_by String?        @db.Char(36)     // admin user_id
  resolved_at DateTime?      @db.DateTime(3)
  created_at  DateTime       @default(now()) @db.DateTime(3)

  job       Job  @relation(fields: [job_id], references: [id])
  raisedBy  User @relation(fields: [raised_by], references: [id])

  @@index([status])
  @@map("disputes")
}

enum DisputeStatus {
  OPEN
  RESOLVED
  CLOSED
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

model Notification {
  id         String   @id @default(uuid()) @db.Char(36)
  user_id    String   @db.Char(36)
  type       String   @db.VarChar(64)  // e.g. 'bid.placed', 'job.delivered'
  payload    Json
  read       Boolean  @default(false)
  created_at DateTime @default(now()) @db.DateTime(3)

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([read])
  @@index([created_at])
  @@map("notifications")
}

// ─────────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────────

model AuditLog {
  id            String   @id @default(uuid()) @db.Char(36)
  event_type    String   @db.VarChar(64)    // e.g. 'job.published', 'bid.placed'
  resource_type String   @db.VarChar(64)    // e.g. 'job', 'bid', 'payment'
  resource_id   String   @db.Char(36)
  actor_id      String   @db.Char(36)       // user_id or agent_id — NO PII
  actor_type    String   @db.VarChar(32)    // 'user' | 'bidder_agent' | 'system'
  metadata      Json
  created_at    DateTime @default(now()) @db.DateTime(3)

  // NO updateAt — append only. Application enforces no UPDATE/DELETE.
  @@index([event_type])
  @@index([resource_id])
  @@index([actor_id])
  @@index([created_at])
  @@map("audit_log")
}
```

---

## Key Index Strategy

| Table | Index | Reason |
|-------|-------|--------|
| `users` | `email` | Login lookup |
| `jobs` | `status, created_at` | Board listing (paginated, most recent OPEN jobs) |
| `bids` | `job_id, status` | Bid listing per job |
| `workforce_agents` | `freelancer_id`, FULLTEXT(`skill_index`) | Agent lookup + scoring |
| `bidder_agents` | `status` | Fan-out: all ACTIVE agents |
| `dispatch_queue` | `status, workforce_agent_id` | Pending delivery on CLI login |
| `notifications` | `user_id, read` | Unread notification count |
| `audit_log` | `resource_id`, `created_at` | Event history for disputes |

---

## Migrations

Run via Prisma Migrate:
```bash
npx prisma migrate dev --name <migration-name>
npx prisma migrate deploy  # production
```

Seed script: `prisma/seed.ts` — creates default Admin account + initial commission rate (15%).
