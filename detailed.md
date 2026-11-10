# Reco Labs & Adminsys — Master System Documentation & Secrets Ledger

> **Confidential Technical Manual & Architecture Guide**  
> Covers: `reco-labs` ([recolabs.in](https://www.recolabs.in)) & `adminsys` ([nerd.recolabs.in](https://nerd.recolabs.in))  
> Authors & Founders: **Aditya Raj** (`@rawenergon`, `@adibxr`) & **Tanish**  
> Generated: November 2026  

---

## Table of Contents
1. [Executive Overview & Mission](#1-executive-overview--mission)
2. [Dual Repository Architecture](#2-dual-repository-architecture)
3. [Design System, Typography & Frontend Craft](#3-design-system-typography--frontend-craft)
4. [Backend Edge API & Routing Logic](#4-backend-edge-api--routing-logic)
5. [Database Schema & Automated Crons (Supabase PostgreSQL)](#5-database-schema--automated-crons-supabase-postgresql)
6. [Email Infrastructure: Resend API & Noreply Architecture](#6-email-infrastructure-resend-api--noreply-architecture)
7. [The Master Secrets & Credentials Vault](#7-the-master-secrets--credentials-vault)
8. [Feature-by-Feature Engineering Logic](#8-feature-by-feature-engineering-logic)
9. [Deployment & Operations Playbook](#9-deployment--operations-playbook)

---

## 1. Executive Overview & Mission

### Origins
Started as a **Grade 10 high school project** by **Aditya Raj** to solve everyday builder bottlenecks and provide jargon-free, paywall-free tutorials for young developers. Joined by **Tanish** (systems reversing & low-level tooling lead), Reco Labs evolved into an open-source guild and launchpad for curious technical minds worldwide.

### The Problem It Solves
- **Traditional CS Education**: Saturated with dry LeetCode and theory locked behind bootcamps and subscription paywalls.
- **Teenage Hacker Isolation**: Young developers build sophisticated games, micro-apps, and hardware in silos without distribution or peer validation.
- **Credential-Gated Hiring**: Resumes get screened out by 3-5 year corporate experience filters, ignoring real open-source proof of work.

### The Solution Ecosystem
1. **Live Launchpad (Founder Network)**: Pinned 1-week weekly boost cycles, peer upvotes, automatic favicon discovery, verified builder badges.
2. **Youth Hackathon Directory**: Dual-endpoint aggregation of 900+ global events integrated with Hack Club archives.
3. **Guild Roles & Careers**: High-impact developer, security, and internship positions evaluated on code commits.
4. **Open Tooling & Labs**: Hardware schematics, game reversing archives, and a native mobile client (`recolabs.apk`).
5. **Decoupled Admin Command Center (`nerd.recolabs.in`)**: Dedicated operational portal for builder email broadcasts, moderation, and analytics.

---

## 2. Dual Repository Architecture

The platform operates across two synchronized, decoupled GitHub repositories:

```
reco-ecosystem/
├── reco-labs/              # Public Client + Serverless Backend API
│   ├── api/network/        # Vercel serverless catch-all entrypoint [...route].js
│   ├── server/             # Source backend (apiRouter.ts, db.ts)
│   ├── src/                # React 19 SPA frontend (pages, components, hooks)
│   ├── public/             # Static assets (logos, founder portraits, peeps sprites)
│   ├── scripts/            # Build bundler (bundle-api.mjs)
│   ├── vercel.json         # Rewrites, edge routes & security headers
│   └── vite.config.ts      # Vite 8 + Tailwind CSS v4 setup
│
└── adminsys/               # Autonomous Operations Portal (nerd.recolabs.in)
    ├── src/pages/          # Admin pages (MailManager, Startups, Jobs, Ads, etc.)
    ├── src/services/       # adminApi.ts (Typed client with x-admin-key headers)
    ├── src/components/     # Layouts, sidebar, modals, analytics cards
    ├── vercel.json         # SPA routing for nerd.recolabs.in
    └── vite.config.ts      # Vite build configuration
```

### Git Remotes
- **Main Website (`recolabs.in`)**: `https://github.com/recoorg/recolabs.git` (also mirrored at `rawenergon/reco-labs`)
- **Admin System (`nerd.recolabs.in`)**: `https://github.com/rawenergon/adminsys.git`

---

## 3. Design System, Typography & Physical Geometry Ledger

The platform features an editorial tech aesthetic blending luxury magazine typography with physical lab hardware textures and exact mathematical layout geometry.

### 3.1 Typography Hierarchy & Font Token Specs
Configured in `src/index.css` via Tailwind v4 `@theme`:
- `--font-serif`: `"Instrument Serif", Georgia, serif`
- `--font-mono`: `"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace`
- `--font-sans`: `"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

| Token | Class | Weight | Letter Spacing | Line Height | Application |
|---|---|---|---|---|---|
| **Display Title (Hero)** | `font-serif text-4xl sm:text-6xl` | `400` / `700` | `-0.025em` (`tracking-tight`) | `1.1` (`leading-[1.1]`) | Hero titles, manifesto statements, interview headlines |
| **Section Title** | `font-serif text-2xl sm:text-3xl` | `700` (`font-bold`) | `-0.02em` | `1.2` | Pricing plan headings, modal sheet titles, project names |
| **Monospace Headline** | `font-mono text-xs sm:text-sm` | `700` (`font-bold`) | `0.05em` (`tracking-wider`) | `1.4` | Kicker tags (`// WAIT WAIT WAIT`, `INDIE & SOLO FOUNDERS`) |
| **Price / Stat Numerals**| `font-mono text-4xl sm:text-5xl` | `800` (`font-extrabold`)| `0` (tabular) | `1.0` | Pricing cards (`₹0`, `₹199`, `₹499`), telemetry numbers |
| **Monospace Body / Code**| `font-mono text-xs` (`12px`) | `400` / `500` | `0.025em` | `1.5` | Feature check items, terminal snippets, coupon inputs |
| **Interface Body Copy** | `font-sans text-xs sm:text-sm` | `400` (`font-normal`)| `0` | `1.625` (`leading-relaxed`)| Descriptions, bio copy, FAQ explanations, guidelines |
| **Micro Caption / Stamp**| `font-mono text-[10px]` (`10px`)| `700` / `900` | `0.1em` (`tracking-widest`)| `1.2` | Pill badges (`SAVE 20%`, `BOOSTED · 1 WEEK PIN`, `STEP 2`) |

### 3.2 Color Tokens & Invariant Contrast Architecture
| Token Name | Hex Code | RGB Values | Semantic Purpose |
|---|---|---|---|
| **Reco Orange (Primary)**| `#FA5D00` | `250, 93, 0` | Accent glow, active rings, primary CTA buttons, selection fill |
| **Reco Orange Hover** | `#FF6E1A` / `#FF8C42` | `255, 110, 26` | Button hover state, secondary particle color |
| **Deep Obsidian (Root)** | `#09090B` | `9, 9, 11` | Dark mode base ground (`--background`) |
| **Obsidian Surface 1** | `#0C0C0E` / `#0D1017` | `12, 12, 14` | Machined form shells, modal sheets, status bars |
| **Obsidian Surface 2** | `#0F0E13` / `#111114` | `15, 14, 19` | PixelCard default canvas surface, bento tiles |
| **Obsidian Card Active** | `#121216` | `18, 18, 22` | Selected pricing card, highlighted container |
| **Light Canvas Ground** | `#FFFFFF` | `255, 255, 255` | Light mode viewport ground |
| **Verified Blue** | `#3B82F6` | `59, 130, 246` | Official 12-scalloped seal badge for verified builders |
| **Founder Gold** | `#F59E0B` / `#FBBF24` | `245, 158, 11` | VIP Collective, Founder Pass crown badges, premium accents |
| **Success Emerald** | `#10B981` / `#34D399` | `16, 185, 129` | Active promo tags, stage "Live" indicators, verified stamps |
| **Hairline Border (Light)**| `rgba(0,0,0,0.08)` | `0, 0, 0, 0.08` | Minimal dividers (`.editorial-hairline`) |
| **Hairline Border (Dark)** | `rgba(255,255,255,0.08)`| `255, 255, 255, 0.08`| Dark mode structural separators |

> [!IMPORTANT]
> **Obsidian Contrast Floor (The Black-on-Black Prevention Invariant)**:  
> Because components like `PixelCard` enforce a dark obsidian canvas (`--pixel-card-surface: linear-gradient(180deg, #17151c 0%, #0f0e13 100%)`) across all viewport modes, all children elements inside these cards MUST declare explicit light typography tokens (`text-white`, `text-zinc-200`, `text-zinc-300`, `text-zinc-400`). They must never inherit generic `text-zinc-900` or `text-zinc-950` classes, which collapse contrast when the parent page is in light mode.

### 3.3 Corner Radius & Border Geometry Matrix
Every corner radius in the system adheres to a strict 4-tier physical scale:

| Class | Pixel Value | Rem Equiv | Component Applications |
|---|---|---|---|
| **`rounded-3xl`** | **`24px`** | `1.5rem` | • `PixelCard` outer containers (`--pixel-card-radius: 24px`)<br>• `LinearModal` dialog content sheets (`borderRadius: 24px`)<br>• Checkout & Upgrade modal containers<br>• Main project card boxes on `/network`<br>• Verified builder banner top strip |
| **`rounded-2xl`** | **`16px`** | `1.0rem` | • Floating Action Button (FAB) outer container (`56px × 56px`)<br>• Sub-cards & Problem Statement containers (`p-4 rounded-2xl`)<br>• Machined telemetry status bar in Hero<br>• Instant Online / UPI QR payment selector tabs<br>• Coupon input and discount display boxes |
| **`rounded-xl`** | **`12px`** | `0.75rem` | • Startup Favicon frames (`32px × 32px rounded-xl`)<br>• Standard form text inputs (`px-3.5 py-2.5 rounded-xl`)<br>• Billing switcher sub-buttons inside modals<br>• QR image display card wrapper |
| **`rounded-lg`** | **`8px`** | `0.5rem` | • Inner FAB `+` icon badge (`28px × 28px rounded-lg`)<br>• Rating score selector buttons (`24px × 24px`)<br>• Code chips and tag indicators |
| **`rounded-md`** | **`6px`** | `0.375rem` | • Numbered score toggles (1-5 star ratings) |
| **`rounded-full`**| **`9999px`** | Pill | • Primary CTA buttons (`py-3.5 rounded-full`)<br>• Navigation pill bar & billing toggle pills<br>• Category tag badges (`px-2.5 py-0.5 rounded-full`)<br>• Builder profile avatars & custom scrollbar thumbs |

### 3.4 Pixel Dimensions & Component Layout Metrics

#### 1. Floating Action Button (FAB) — `/network`
- Outer Container: `56px × 56px` (`w-14 h-14`), fixed position `bottom: 24px` (`bottom-6`), `right: 24px` (`right-6`), `z-index: 40`.
- Outer Border: `2px solid #000000` (`border-2 border-black dark:border-zinc-800`).
- Inner Badge: `28px × 28px` (`w-7 h-7 rounded-lg bg-black text-[#FA5D00]`), rotates `90deg` on hover.
- Shadow: `shadow-2xl shadow-[#FA5D00]/40`.

#### 2. Startup Favicon Box
- Dimensions: `32px × 32px` (`w-8 h-8 rounded-xl`).
- Fallback Font: `font-serif text-sm font-bold`.
- Border: `1px solid rgba(0, 0, 0, 0.08)` / `rgba(255, 255, 255, 0.08)`.

#### 3. Builder Avatars
- Mini Avatars (Project Cards): `24px × 24px` (`w-6 h-6 rounded-full overflow-hidden`).
- Navigation User Pill: `28px × 28px` (`w-7 h-7 rounded-full`).
- Dashboard Header Avatar: `64px × 64px` (`w-16 h-16 rounded-full`).
- Builder Profile Header Avatar: `96px × 96px` (`w-24 h-24 rounded-full`).

#### 4. VerifiedBadge (`src/components/VerifiedBadge.tsx`)
12-point scalloped seal rendered via SVG geometry with embedded verification checkmark:
- `xs`: `14px × 14px` (viewBox: `0 0 24 24`)
- `sm`: `18px × 18px` (viewBox: `0 0 24 24`)
- `md`: `22px × 22px` (viewBox: `0 0 24 24`)
- `lg`: `28px × 28px` (viewBox: `0 0 24 24`)
- Blue Fill: `url(#reco-blue-grad)` with stop `#3b82f6` to `#1d4ed8`.
- Gold Fill: `url(#reco-gold-grad)` with stop `#fbbf24` to `#d97706`.

#### 5. PixelCard Canvas Engine Metrics
- Canvas Layer: `position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none;`.
- Pseudo Edge Highlight: `::after` layer with `z-index: 2`, `box-shadow: inset 0 0 0 1px var(--pixel-card-edge), inset 0 1px 0 var(--pixel-card-highlight)`.
- Content Elevation: All text/buttons wrapped in `<div className="relative z-10">` to guarantee layer separation.
- Physics Parameters:
  - `pixelSize`: `2px` (square/circle geometry).
  - `gap`: `6px` (Pro/Founder) to `8px` (Hobby).
  - `speed`: `25` to `30` (twinkle frequency).
  - `spotRadius`: `Math.min(width, height) * 0.38 + 30px`.
  - `spotlight`: `0.5` power multiplier.
  - `glow`: `0.5` intensity.
  - `opacity`: `1.0`.
  - `revealDuration`: `600ms`.

#### 6. LinearModal Spring Dialog Metrics
- Overlay: `position: fixed; inset: 0; z-index: 50; backdrop-filter: blur(16px);`.
- Radial Overlay Gradient (Dark): `radial-gradient(125% 125% at 50% 10%, #050505 40%, #1b1b1b 100%)`.
- Radial Overlay Gradient (Light): `radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #b1b1b1 100%)`.
- Dialog Dimensions: `max-w-5xl` (`1024px`), `lg:w-[900px]`, `w-[90%]`, `max-h-[92vh]`.
- Spring Physics Config:
  ```ts
  transition: {
    type: 'spring',
    bounce: 0.05,
    duration: 0.5
  }
  ```

#### 7. Container Width Constraints
- Page Root Container: `max-w-7xl` (`1280px`) centered with `mx-auto px-4 sm:px-6 lg:px-8`.
- Gallery & Content Max-Width: `max-w-5xl` (`1024px`).
- Hero Machined Form: `max-w-[390px]` (mobile) / `max-w-[440px]` (desktop).
- FAQ Accordion Section: `max-w-2xl` (`672px`).
- Checkout & Action Modals: `max-w-lg` (`512px`).
- Transactional Email Template: `520px` fixed table width.

### 3.5 Exact Box Shadows & Inset Bevel Ledger

| Token / Layer | Exact CSS Definition | Purpose |
|---|---|---|
| **PixelCard Surface Shadow** | `0 24px 48px -24px rgba(0, 0, 0, 0.85), 0 8px 18px -10px rgba(0, 0, 0, 0.6)` | Floating depth for obsidian pricing cards |
| **PixelCard Edge Inset** | `inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06)` | Beveled frosted edge lighting |
| **PixelCard Edge Active**| `inset 0 0 0 1px rgba(255, 255, 255, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.06)` | Hover & pointer focus border highlight |
| **Machined Hero Form** | `inset 0 2px 4px rgba(0,0,0,0.6), 0 10px 35px -5px rgba(0,0,0,0.7)` | Physical recessed chassis for newsletter input |
| **Machined Button Bevel** | `inset 2px 2px 5px 0px rgba(0,0,0,0.5), inset -2px -2px 6px 1px rgba(255,255,255,0.25)` | Tactile metallic button click state |
| **Active Pro Card Ring** | `border-2 border-[#FA5D00] shadow-2xl ring-4 ring-orange-500/20` | Most Popular tier emphasis |
| **Active Founder Ring** | `border-2 border-amber-500 shadow-2xl ring-4 ring-amber-500/20` | VIP Collective tier emphasis |
| **Floating FAB Glow** | `shadow-2xl shadow-[#FA5D00]/40` | High-visibility action anchor |
| **Brand Text Glow** | `drop-shadow-[0_0_30px_rgba(250,93,0,0.7)]` | Hero period mark glow (`Mind.`) |

### 3.6 Scrollbars, Selection & Micro-Interactions
- **Custom Scrollbar Width**: `7px` width and height.
- **Scrollbar Track**: `transparent` (zero visual noise).
- **Scrollbar Thumb**: `rgba(0, 0, 0, 0.2)` (light) / `rgba(255, 255, 255, 0.2)` (dark), `border-radius: 9999px`, `border: 1.5px solid transparent`, `background-clip: padding-box`.
- **Scrollbar Thumb Hover**: `#FA5D00` (smooth 200ms transition).
- **Selection Highlight**: `background-color: #FA5D00; color: #FFFFFF;`.
- **Button Micro-interaction**: `active:scale-95 transition-all duration-150 ease-out`.

### 3.7 Interactive Canvas Engines
1. **GSAP Peep Engine (`src/components/PeepCrowd.tsx`)**: Canvas2D sprite animation featuring walking characters that react dynamically to cursor speed and viewport bounds.
2. **PixelCard Canvas Particle Engine (`src/components/ui/PixelCard.tsx`)**: Point grid spotlight with twinking sin waves and radial shockwaves.
3. **Doodle Crew Footer (`src/components/Footer.tsx`)**: Animated mascots with dynamic cursor tracking and subtle physics floating effects.

---

## 4. Backend Edge API & Routing Logic

### Architecture
- The backend lives in `reco-labs/server/apiRouter.ts`.
- When `npm run build` runs, `scripts/bundle-api.mjs` bundles the TypeScript router and `server/db.ts` into a self-contained CommonJS artifact at `api/network/[...route].js`.
- Vercel routes any request to `https://www.recolabs.in/api/network/*` directly to this edge handler.

### Authentication Guards
Administrative endpoints are protected by `checkAdminAuth()`:
```ts
function checkAdminAuth(req): boolean {
  const headerKey = req.headers["x-admin-key"] || req.headers["admin-key"] || "";
  const authHeader = req.headers["authorization"] || "";
  const bearerKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const provided = (headerKey || bearerKey || "").trim();

  const validKeys = [
    process.env.ADMIN_SECRET,
    "Tanisha@1060",
    "Tanisha@2026",
    "rawenergon",
    "Aditya@1060A",
    "recolabs2026",
  ].filter(Boolean);

  return validKeys.includes(provided);
}
```

### Complete API Endpoint Directory

#### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/network/stats` | Aggregated statistics (total builders, startups, launches). |
| `GET` | `/api/network/overview` | Platform feed containing featured startups, top builders, recent launches. |
| `GET` | `/api/network/startups` | List of approved founder projects with upvote counts and boost tags. |
| `GET` | `/api/network/hackathons` | 900+ curated events combining database entries and Hack Club feeds. |
| `GET` | `/api/network/jobs` | Curated developer, security, and internship roles. |
| `GET` | `/api/network/builder/:username` | Detailed profile of a specific builder, projects, and badges. |
| `POST` | `/api/network/ads/click` | Registers analytics click events for sponsor banners. |
| `POST` | `/api/network/coupons/validate` | Validates discount codes during checkout or boost purchases. |
| `POST` | `/api/network/payments/verify` | Verifies Razorpay HMAC signature (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`). |

#### Protected Admin Endpoints (Require `x-admin-key`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/network/admin/builders` | Returns complete list of all 19+ registered builders with emails, plans, and verification status. |
| `POST` | `/api/network/admin/send-email` | Dispatches custom HTML broadcasts from `noreply@recolabs.in` via Resend API with BCC privacy. |
| `GET` | `/api/network/admin/overview` | Master dashboard overview: jobs, hackathons, and paid entities. |
| `POST` | `/api/network/admin/toggle-user-verification` | Toggles verified checkmark badge (`is_verified`) on a builder account. |
| `POST` | `/api/network/admin/toggle-startup-featured` | Toggles featured badge on a project. |
| `POST` | `/api/network/admin/approve-hackathon` | Approves or unapproves a community-submitted hackathon. |
| `GET` | `/api/network/admin/coupons` | Lists all platform promo discount codes. |
| `POST` | `/api/network/admin/coupons` | Creates a new coupon code (`code`, `discount_type`, `discount_value`). |
| `POST` | `/api/network/admin/coupons/toggle` | Activates or pauses a coupon code. |
| `DELETE` | `/api/network/admin/coupons/:id` | Deletes a coupon code. |
| `GET` | `/api/network/admin/ads` | Lists all display sponsor advertisements. |
| `POST` | `/api/network/admin/ads` | Deploys a new ad banner (`title`, `destination_url`, `banner_url`). |
| `PUT` | `/api/network/admin/ads/:id` | Edits an existing ad banner. |
| `DELETE` | `/api/network/admin/ads/:id` | Deletes an ad banner. |
| `GET` | `/api/network/admin/store-links` | Lists all digital store links and products. |
| `POST` | `/api/network/store-links` | Adds a new store link. |
| `DELETE` | `/api/network/admin/store-links/:id` | Deletes a store link. |

---

## 5. Database Schema & Automated Crons (Supabase PostgreSQL)

### Connection
- **Host**: `aws-0-eu-west-1.pooler.supabase.com:6543`
- **Database**: `postgres`
- **User**: `postgres.zjpbrdbdkkzczdwsgizj`
- **Pooler**: Max 10 connections, SSL enabled (`rejectUnauthorized: false`).

### Core Tables
1. **`users`**:
   - `id` (SERIAL PRIMARY KEY)
   - `username` (VARCHAR(50) UNIQUE)
   - `email` (VARCHAR(255) UNIQUE)
   - `password_hash` (TEXT)
   - `name` (VARCHAR(100))
   - `bio`, `website`, `github`, `discord`, `avatar_url` (TEXT)
   - `is_verified` (BOOLEAN DEFAULT false)
   - `is_pro` (BOOLEAN DEFAULT false)
   - `plan` (VARCHAR(20) DEFAULT 'free')
   - `created_at` (TIMESTAMP WITH TIME ZONE)

2. **`startups` (Projects)**:
   - `id` (SERIAL PRIMARY KEY)
   - `user_id` (INTEGER REFERENCES users)
   - `title`, `tagline`, `description`, `url`, `github_url`, `icon_url`, `category`
   - `upvotes_count` (INTEGER DEFAULT 0)
   - `is_featured` (BOOLEAN DEFAULT false)
   - `boosted_at` (TIMESTAMP WITH TIME ZONE)
   - `featured_until` (TIMESTAMP WITH TIME ZONE)
   - `created_at` (TIMESTAMP WITH TIME ZONE)

3. **`builder_jobs`**:
   - `id` (SERIAL PRIMARY KEY)
   - `title`, `company`, `location`, `type` (full-time, remote, contract), `salary`, `apply_url`
   - `source` ('recolabs_guild' | 'external')
   - `is_featured` (BOOLEAN DEFAULT false)
   - `created_at` (TIMESTAMP WITH TIME ZONE)

4. **`builder_hackathons`**:
   - `id` (SERIAL PRIMARY KEY)
   - `title`, `organizer`, `location`, `format` (online, in-person, hybrid), `dates`, `url`, `prize_pool`
   - `is_approved` (BOOLEAN DEFAULT true)
   - `created_at` (TIMESTAMP WITH TIME ZONE)

5. **`coupons`**, **`ads`**, **`store_links`**, **`startup_ratings`**, **`project_comments`**.

### Automated Monday 00:00 UTC Boost Reset Cron
Boosts expire after exactly 7 days (`featured_until <= NOW()`). Additionally, every Monday at 00:00 UTC, the database automatically clears previous-week boosts so all 3 spotlight slots become immediately available:
```sql
UPDATE startups
SET is_featured = false, featured_until = NULL, boosted_at = NULL
WHERE is_featured = true
  AND (
    featured_until IS NULL
    OR featured_until <= NOW()
    OR boosted_at IS NULL
    OR boosted_at < date_trunc('week', NOW())
  );
```

---

## 6. Email Infrastructure: Resend API & Noreply Architecture

### How Sending as `noreply@recolabs.in` Works Without a Google Inbox
- In SMTP protocols, the **`From:`** header is a metadata descriptor. An actual physical Google Workspace mailbox is not required to send outgoing emails.
- Resend holds the cryptographic signing keys for `recolabs.in`. Because DNS contains the required DKIM (`resend._domainkey.recolabs.in`) and SPF (`v=spf1 include:resend.com ~all`) records, Resend signs every outgoing email as 100% authenticated.
- **`From`**: `Reco Labs <noreply@recolabs.in>`
- **`Reply-To`**: `devadibxr@gmail.com`
- **Result**: Recipients see official delivery from `noreply@recolabs.in`. If they hit **Reply**, the email client automatically addresses the reply to `devadibxr@gmail.com`.

### Strict Recipient RFC Extraction
To avoid Resend rejecting batch broadcasts with `422: Invalid bcc field`, both frontend and backend enforce regex extraction:
```ts
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const matches = rawText.match(emailRegex);
// Guarantees zero trailing commas, semicolons, brackets, or unparsed multi-address chunks
```

### BCC Privacy Dispatch
For multi-recipient broadcasts:
- `to`: Set to `["noreply@recolabs.in"]`.
- `bcc`: Array of sanitized recipient email addresses.
- **Result**: Recipients cannot see each other's email addresses.

---

## 7. The Master Secrets & Credentials Vault

> [!CAUTION]
> Below are the active production credentials, master keys, and environment variables powering the Reco Labs network. Keep this file secure.

### Administrative Master Keys (`x-admin-key`)
Used to authenticate to `/api/network/admin/*` and log into `nerd.recolabs.in`:
- `Tanisha@2026`
- `rawenergon`
- `Aditya@1060A`
- `recolabs2026`
- `Tanisha@1060`

### Resend API (Email Dispatcher)
- **Active API Key**: `re_LHAUPRtr_Cfptg9uCBJ3roDJHvabWtYbd`
- **Base64 Encoded**: `cmVfTEhBVVBSdHJfQ2ZwdGc5dUNCSjNyb0RKSHZhYld0WWJk`
- **Domain Name**: `recolabs.in`
- **Domain Status**: `verified` (ID: `c306ac94-31a4-4b55-81ce-5499d7ccd6bc`)
- **Region**: `ap-northeast-1`
- **Sender Address**: `noreply@recolabs.in`
- **Reply-To Address**: `devadibxr@gmail.com`

### Supabase PostgreSQL Database
- **Connection String (`DATABASE_URL`)**:  
  `postgresql://postgres.zjpbrdbdkkzczdwsgizj:Aditya%401060A@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`
- **Project Ref**: `zjpbrdbdkkzczdwsgizj`
- **Database Password**: `Aditya@1060A`
- **Region**: `aws-0-eu-west-1`
- **JWT Secret**: `recolabs_jwt_secret_key_2026_super_secure`

### Razorpay Live Payment Gateway
- **Key ID**: `rzp_live_TwVFw0ACQFDbKn`
- **Key Secret**: `KrWC5wVHLo3PbiQ4K0ptf70e`
- **Webhook Secret**: `KrWC5wVHLo3PbiQ4K0ptf70e`

### Gmail SMTP (Emergency Fallback)
- **Host**: `smtp.gmail.com`
- **Port**: `587` (STARTTLS)
- **User**: `devadibxr@gmail.com`
- **App Password**: `adzxxkjdxekhhjlr`

---

## 8. Feature-by-Feature Engineering Logic

### 1. Founder Launchpad (`/network`)
- Projects display builder name, avatar, category tag, upvote counter, and real-time favicon extracted from target domain.
- "Boosted · 1 Week Pin" projects stay at the top.
- Auto-removal after 7 days and weekly reset every Monday at 00:00 UTC.

### 2. Hackathons Directory (`/hackathons`)
- Aggregates database hackathons with live Hack Club API endpoints:
  - Upcoming events: `https://hackathons.hackclub.com/api/events/upcoming`
  - Global archives: `https://hackathons.hackclub.com/api/events/all`
- Dynamic search by keyword, month filter, and format (Virtual / In-Person).

### 3. Career Opportunities (`/jobs`)
- Uniform card styling with verified tag pills.
- Filters by role (Engineering, Security, Design, Intern).
- Direct application links to verified repositories and startup postings.

### 4. Admin Mail Studio (`/mail` on `nerd.recolabs.in`)
- **Select All Builders**: One-click selection with live counter (`Select All (19 Builders)`).
- **Custom Recipient Ingestion**: Type or paste emails; automatically parsed into removable chip tags.
- **HTML Format**: Dual-view studio (Code View, Live Preview with Desktop/Mobile toggles, Split View).
- **Presets**: Reco Branded Announcement, Hackathon Invite, Minimal Clean Letter.
- **QA Button**: "Send Test to Me" dispatches a test to `devadibxr@gmail.com`.

---

## 9. Deployment & Operations Playbook

### Vercel Production Projects
1. **Main Platform**: `b127s-projects/recolabshq` (Domain: `recolabs.in` / `www.recolabs.in`)
2. **Admin Operations**: `b127s-projects/adminsys` (Domain: `nerd.recolabs.in`)

### How to Build & Deploy

#### Main Platform (`reco-labs`)
```bash
cd C:\Users\bprasad\.gemini\antigravity\scratch\reco-labs
npm run build      # tsc -b && vite build && node scripts/bundle-api.mjs
git add .
git commit -m "feat: updates"
git push origin main
```

#### Admin Platform (`adminsys`)
```bash
cd C:\Users\bprasad\.gemini\antigravity\scratch\adminsys
npm run build      # tsc -b && vite build
git add .
git commit -m "feat: updates"
git push origin main
```

Pushing to `main` on either repository automatically triggers Vercel to build and deploy to the live production domains within 30–60 seconds.

---
*Reco Labs Technical Documentation · Maintained by Aditya Raj & Tanish · [recolabs.in](https://www.recolabs.in)*
