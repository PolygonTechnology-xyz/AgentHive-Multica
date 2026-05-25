# AgentHive Design System

**Source of truth:** the React/Vite prototype in `frontend/` (design reference only — do not extend).  
**Production target:** Next.js implementation must match this design pixel-perfect.

---

## Color Tokens

```css
--bg:           #08080c   /* warm black base */
--bg-1:         #0c0c12   /* slightly elevated */
--bg-2:         #11111a   /* card background */
--bg-elev:      rgba(255,255,255,0.025)
--border:       rgba(255,255,255,0.07)
--border-strong:rgba(255,255,255,0.13)

--text:         #f1f1f4   /* primary text */
--text-dim:     #9a9aa6   /* labels, subtitles */
--text-faint:   #5d5d6b   /* placeholder, disabled */

--accent:       #00ff88   /* neon green — primary CTA, live indicators, active states */
--accent-dim:   #00cc6b
--accent-deep:  #003a1f

--violet:       #a78bfa   /* agent/AI-related UI elements */
--cyan:         #67e8f9   /* stats, informational accents */
--warn:         #fbbf24   /* held funds, warnings */
```

---

## Typography

| Role | Font | Notes |
|------|------|-------|
| Display + Body | `Space Grotesk` | Google Font, weights 400/500/600/700 |
| Monospace / Technical | `JetBrains Mono` | CLI output, code blocks, terminal UI |

```css
font-feature-settings: "ss01", "cv01";
-webkit-font-smoothing: antialiased;
```

---

## Glass Morphism (Card System)

Every card, panel, and elevated container uses this treatment:

```css
background:            rgba(255,255,255,0.05);
backdrop-filter:       blur(14px);
-webkit-backdrop-filter: blur(14px);
border:                1px solid rgba(255,255,255,0.09);
```

In Next.js: create a `<Card>` component or `glass` CSS class that applies these rules.

---

## Border Radius

```css
--radius-sm: 6px    /* small elements: badges, pills */
--radius:    12px   /* standard cards */
--radius-lg: 20px   /* large panels, modals */
```

---

## Color Coding Convention

| Color | Semantic Meaning |
|-------|-----------------|
| `#00ff88` (green) | Active, live, success, primary action |
| `#a78bfa` (violet) | AI/agent related, secondary action |
| `#67e8f9` (cyan) | Stats, informational, neutral metric |
| `#fbbf24` (yellow) | Money held in escrow, warnings |
| `#ef4444` (red) | Error, failed, destructive action |

---

## Page Inventory (41 pages to implement in Next.js)

### Public / Marketing
| Route | Component | Notes |
|-------|-----------|-------|
| `/` | Landing | Animated live bid console (WebSocket/SSE in production) |
| `/hire-agents` | HireAgents | Buyer marketing |
| `/find-work` | FindWork | Freelancer marketing |
| `/about` | About | |
| `/pricing` | Pricing | |

### Auth
| Route | Notes |
|-------|-------|
| `/register` | Role selection — Buyer vs Freelancer |
| `/register/buyer` | Buyer registration form |
| `/register/buyer/verify` | Email verify prompt |
| `/register/buyer/verified` | Verified confirmation |
| `/register/freelancer` | Freelancer registration |
| `/register/freelancer/verify` | |
| `/register/freelancer/verified` | |
| `/login` | Shared role-selection login |
| `/login/buyer` | |
| `/login/freelancer` | |
| `/forgot-password` | |

### Buyer
| Route | Notes |
|-------|-------|
| `/dashboard/buyer` | Stats + recent jobs + onboarding for new users |
| `/jobs/create` | Job creation form |
| `/jobs` | My Jobs list |
| `/jobs/[id]/bids` | Bid review — select winning agent |
| `/jobs/[id]/payment` | Ppay checkout |
| `/jobs/[id]/payment/success` | |
| `/jobs/[id]/payment/failed` | |
| `/jobs/[id]/delivery` | Review deliverable, approve or revision |
| `/jobs/[id]/progress` | In-progress tracker |
| `/jobs/[id]/complete` | Complete confirmation |
| `/jobs/[id]/revision` | Revision submitted |
| `/payments` | Payment history |
| `/account/buyer` | Account settings |
| `/notifications/buyer` | Notification center |

### Freelancer
| Route | Notes |
|-------|-------|
| `/dashboard/freelancer` | Stat cards, BidderAgent panel, active jobs, bid feed |
| `/jobs/freelancer` | Freelancer job list |
| `/agents` | Workforce Agent management (connect/deactivate/remove) |
| `/configuration` | Bidder Agent prompt config panel |
| `/cli-guide` | CLI install + auth guide |
| `/settings` | Account settings |
| `/payments/freelancer` | Payout history + pending |
| `/account/freelancer` | My account |
| `/notifications/freelancer` | |

### Shared
| Route | Notes |
|-------|-------|
| `/freelancer/[handle]` | Public freelancer profile |

---

## Next.js Implementation Notes

### App Router structure
```
app/
├── (public)/           # marketing pages — SSG/ISR
├── (auth)/             # login/register — server-side
├── (buyer)/            # buyer-protected routes
├── (freelancer)/       # freelancer-protected routes
└── (shared)/           # public profile
```

### Client vs Server components
- Dashboard panels with live data (bid feed, agent status) → `"use client"`
- Static/marketing pages → Server Components (better SEO, faster load)
- Forms → Client Components

### CSS approach
- Keep the same custom CSS from prototype (already clean, scoped, fast)
- Convert to CSS Modules (`.module.css`) per component — avoids global conflicts
- Design tokens go in `styles/globals.css` as `:root` CSS variables

### Auth
- Use NextAuth.js (now Auth.js) for Google OAuth + credentials
- Middleware for route protection (buyer vs freelancer vs admin)
