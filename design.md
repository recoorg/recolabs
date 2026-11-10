# Reco Labs Design System & Frontend Architecture Specification (`design.md`)

> **Version**: 2.5.0  
> **Target**: `reco-labs` ([recolabs.in](https://www.recolabs.in))  
> **Maintainers**: Aditya Raj (`@rawenergon`, `@adibxr`) & Tanish  
> **Last Updated**: November 2026  

---

## 1. Aesthetic Manifesto & Philosophy

Reco Labs embodies a union between **high-end financial/editorial design systems** (Linear, Stripe Press, Vercel) and an **uncompromising physical lab / hacker guild aesthetic** (Hack Club, hardware teardowns, terminal consoles). 

### Core Principles
1. **Physicality & Texture**: Elements feel like machined hardware — dark obsidian panels, tactile buttons, physical folder tabs, subtle hairline dividers, and interactive canvas particles.
2. **Editorial Contrast**: Classical high-contrast serif typography paired with cold tabular monospace figures. Information is scannable, dense, and confident.
3. **Restraint over Noise**: Color is used purposefully. The entire platform operates on an obsidian/zinc monochrome foundation, punctured only by **Reco Orange (`#FA5D00`)** for active energy and verified blue/amber for proof-of-work credibility.
4. **Zero-Lag Motion**: Transitions are spring-physics based with low bounce and zero perceptible latency. Motion serves orientation, never ornament.

---

## 2. Color Palette & Contrast Ledger

### Brand Colors
| Token | Hex | RGB / HSL | Usage |
|---|---|---|---|
| **Reco Orange** (Primary) | `#FA5D00` | `rgb(250, 93, 0)` | Primary CTAs, active states, glowing pills, cursor trails, highlights |
| **Reco Orange Light** | `#FF8C42` | `rgb(255, 140, 66)` | Hover states, secondary particle sparks |
| **Verified Blue** | `#3B82F6` | `rgb(59, 130, 246)` | Official 12-scalloped seal badge for verified builders |
| **Founder Gold** | `#F59E0B` | `rgb(245, 158, 11)` | VIP Collective, Founder Pass crown badges, premium accents |
| **Success Emerald** | `#10B981` | `rgb(16, 185, 129)` | Live telemetry status, discount badges, payment confirmations |
| **Critical Rose** | `#F43F5E` | `rgb(244, 63, 94)` | Error alerts, coupon rejections, critical warnings |

### Surface Palette
| Layer | Light Mode | Dark Mode (Obsidian) | Purpose |
|---|---|---|---|
| **Canvas / Root** | `#FFFFFF` | `#09090B` | Viewport ground |
| **Card Surface** | `#F4F4F5` / `#FAFAFA` | `#0F0E13` / `#121216` | Standard content cards |
| **PixelCard Obsidian** | `#111114` (Fixed) | `#17151c` → `#0f0e13` | Interactive cyber grid cards |
| **Elevated Modal** | `#FFFFFF` | `#0C0C0E` | Dialogs, floating sheets, popovers |
| **Subtle Hairline** | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | Structural splitters (`.editorial-hairline`) |

### Strict High-Contrast Rule
> [!IMPORTANT]
> **The Obsidian Surface Invariant (The Black-on-Black Prevention Invariant)**:  
> When components (such as `PixelCard`) render dark obsidian canvas backgrounds regardless of user system mode, all internal text **must explicitly use light color tokens** (`text-white`, `text-zinc-200`, `text-zinc-300`, `text-zinc-400`). Never cascade generic theme-dependent `text-zinc-900` onto an obsidian element.

---

## 3. Typography Hierarchy & Font Token Specs

Configured in `src/index.css` via Tailwind v4 `@theme`:
```css
@theme {
  --font-serif: "Instrument Serif", Georgia, serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-sans: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

| Token | Class | Weight | Letter Spacing | Line Height | Application |
|---|---|---|---|---|---|
| **Display Title (Hero)** | `font-serif text-4xl sm:text-6xl` | `400` / `700` | `-0.025em` (`tracking-tight`) | `1.1` (`leading-[1.1]`) | Hero titles, manifesto statements, interview headlines |
| **Section Title** | `font-serif text-2xl sm:text-3xl` | `700` (`font-bold`) | `-0.02em` | `1.2` | Pricing plan headings, modal sheet titles, project names |
| **Monospace Headline** | `font-mono text-xs sm:text-sm` | `700` (`font-bold`) | `0.05em` (`tracking-wider`) | `1.4` | Kicker tags (`// WAIT WAIT WAIT`, `INDIE & SOLO FOUNDERS`) |
| **Price / Stat Numerals**| `font-mono text-4xl sm:text-5xl` | `800` (`font-extrabold`)| `0` (tabular) | `1.0` | Pricing cards (`₹0`, `₹199`, `₹499`), telemetry numbers |
| **Monospace Body / Code**| `font-mono text-xs` (`12px`) | `400` / `500` | `0.025em` | `1.5` | Feature check items, terminal snippets, coupon inputs |
| **Interface Body Copy** | `font-sans text-xs sm:text-sm` | `400` (`font-normal`)| `0` | `1.625` (`leading-relaxed`)| Descriptions, bio copy, FAQ explanations, guidelines |
| **Micro Caption / Stamp**| `font-mono text-[10px]` (`10px`)| `700` / `900` | `0.1em` (`tracking-widest`)| `1.2` | Pill badges (`SAVE 20%`, `BOOSTED · 1 WEEK PIN`, `STEP 2`) |

---

## 4. Corner Radius & Border Geometry Matrix

Every corner radius in the system adheres to a strict 4-tier physical scale:

| Class | Pixel Value | Rem Equiv | Component Applications |
|---|---|---|---|
| **`rounded-3xl`** | **`24px`** | `1.5rem` | • `PixelCard` outer containers (`--pixel-card-radius: 24px`)<br>• `LinearModal` dialog content sheets (`borderRadius: 24px`)<br>• Checkout & Upgrade modal containers<br>• Main project card boxes on `/network`<br>• Verified builder banner top strip |
| **`rounded-2xl`** | **`16px`** | `1.0rem` | • Floating Action Button (FAB) outer container (`56px × 56px`)<br>• Sub-cards & Problem Statement containers (`p-4 rounded-2xl`)<br>• Machined telemetry status bar in Hero<br>• Instant Online / UPI QR payment selector tabs<br>• Coupon input and discount display boxes |
| **`rounded-xl`** | **`12px`** | `0.75rem` | • Startup Favicon frames (`32px × 32px rounded-xl`)<br>• Standard form text inputs (`px-3.5 py-2.5 rounded-xl`)<br>• Billing switcher sub-buttons inside modals<br>• QR image display card wrapper |
| **`rounded-lg`** | **`8px`** | `0.5rem` | • Inner FAB `+` icon badge (`28px × 28px rounded-lg`)<br>• Rating score selector buttons (`24px × 24px`)<br>• Code chips and tag indicators |
| **`rounded-md`** | **`6px`** | `0.375rem` | • Numbered score toggles (1-5 star ratings) |
| **`rounded-full`**| **`9999px`** | Pill | • Primary CTA buttons (`py-3.5 rounded-full`)<br>• Navigation pill bar & billing toggle pills<br>• Category tag badges (`px-2.5 py-0.5 rounded-full`)<br>• Builder profile avatars & custom scrollbar thumbs |

---

## 5. Pixel Dimensions & Component Layout Metrics

### 5.1 Floating Action Button (FAB) — `/network`
- Outer Container: `56px × 56px` (`w-14 h-14 sm:w-14 sm:h-14`), fixed position `bottom: 24px` (`bottom-6`), `right: 24px` (`right-6`), `z-index: 40`.
- Outer Border: `2px solid #000000` (`border-2 border-black dark:border-zinc-800`).
- Inner Badge: `28px × 28px` (`w-7 h-7 rounded-lg bg-black text-[#FA5D00]`), rotates `90deg` on hover.
- Shadow: `shadow-2xl shadow-[#FA5D00]/40`.

### 5.2 Startup Favicon Box
- Dimensions: `32px × 32px` (`w-8 h-8 rounded-xl flex-none`).
- Fallback Font: `font-serif text-sm font-bold`.
- Border: `1px solid rgba(0, 0, 0, 0.08)` / `rgba(255, 255, 255, 0.08)`.

### 5.3 Builder Avatars
- Mini Avatars (Project Cards): `24px × 24px` (`w-6 h-6 rounded-full overflow-hidden`).
- Navigation User Pill: `28px × 28px` (`w-7 h-7 rounded-full`).
- Dashboard Header Avatar: `64px × 64px` (`w-16 h-16 rounded-full`).
- Builder Profile Header Avatar: `96px × 96px` (`w-24 h-24 rounded-full`).

### 5.4 VerifiedBadge (`src/components/VerifiedBadge.tsx`)
12-point scalloped seal rendered via SVG geometry with embedded verification checkmark:
- `xs`: `14px × 14px` (viewBox: `0 0 24 24`)
- `sm`: `18px × 18px` (viewBox: `0 0 24 24`)
- `md`: `22px × 22px` (viewBox: `0 0 24 24`)
- `lg`: `28px × 28px` (viewBox: `0 0 24 24`)
- Blue Fill: `url(#reco-blue-grad)` with stop `#3b82f6` to `#1d4ed8`.
- Gold Fill: `url(#reco-gold-grad)` with stop `#fbbf24` to `#d97706`.

### 5.5 PixelCard Canvas Engine Metrics
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

### 5.6 LinearModal Spring Dialog Metrics
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

### 5.7 Container Width Constraints
- Page Root Container: `max-w-7xl` (`1280px`) centered with `mx-auto px-4 sm:px-6 lg:px-8`.
- Gallery & Content Max-Width: `max-w-5xl` (`1024px`).
- Hero Machined Form: `max-w-[390px]` (mobile) / `max-w-[440px]` (desktop).
- FAQ Accordion Section: `max-w-2xl` (`672px`).
- Checkout & Action Modals: `max-w-lg` (`512px`).
- Transactional Email Template: `520px` fixed table width.

---

## 6. Exact Box Shadows & Inset Bevel Ledger

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

---

## 7. Scrollbars, Selection & Micro-Interactions

- **Custom Scrollbar Width**: `7px` width and height.
- **Scrollbar Track**: `transparent` (zero visual noise).
- **Scrollbar Thumb**: `rgba(0, 0, 0, 0.2)` (light) / `rgba(255, 255, 255, 0.2)` (dark), `border-radius: 9999px`, `border: 1.5px solid transparent`, `background-clip: padding-box`.
- **Scrollbar Thumb Hover**: `#FA5D00` (smooth 200ms transition).
- **Selection Highlight**: `background-color: #FA5D00; color: #FFFFFF;`.
- **Button Micro-interaction**: `active:scale-95 transition-all duration-150 ease-out`.

---

## 8. Interactive Canvas Engines

1. **GSAP Peep Engine (`src/components/PeepCrowd.tsx`)**: Canvas2D sprite animation featuring walking characters that react dynamically to cursor speed and viewport bounds.
2. **PixelCard Canvas Particle Engine (`src/components/ui/PixelCard.tsx`)**: Point grid spotlight with twinking sin waves and radial shockwaves.
3. **Doodle Crew Footer (`src/components/Footer.tsx`)**: Animated mascots with dynamic cursor tracking and subtle physics floating effects.

---

## 9. Transactional Email System Architecture

Automated emails triggered by user registration, post launches, and comments utilize an editorial layout mirroring the Reco platform aesthetic.

### Layout Spec
- **Canvas Width**: `520px` centered table container on `#FFFFFF` ground.
- **Brand Mark**: `https://www.recolabs.in/logo-black.png` at 48px width.
- **Kicker**: `14px` Geist Mono uppercase accent (`color: #ef4444` or `#FA5D00`).
- **Headline**: `28px` Instrument Sans / -apple-system display headline (`font-weight: 500`, `letter-spacing: -0.5px`).
- **Body Text**: `16px` Instrument Sans (`color: #3f3f46`, `line-height: 1.6`).
- **Action Button**: Obsidian pill with `#FA5D00` accent or black fill with white typography.

---

## 10. File Structure Map

```
reco-labs/
├── design.md                  # Master design system specification
├── src/
│   ├── index.css              # Tailwind v4 theme, font imports, scrollbar, selection
│   ├── components/
│   │   ├── Navbar.tsx         # Floating pill nav + WhatsApp & social CTAs
│   │   ├── Footer.tsx         # Comprehensive footer with GitHub, Discord, WhatsApp
│   │   ├── VerifiedBadge.tsx  # 12-scalloped seal badge component
│   │   ├── PeepCrowd.tsx      # Canvas2D interactive sprite crowd engine
│   │   └── ui/
│   │       ├── PixelCard.tsx  # Obsidian particle grid component
│   │       ├── PixelCard.css  # Obsidian surface & edge highlight styles
│   │       └── linear-modal.tsx # Spring physics dialog components
│   └── pages/
│       ├── PricingUpgradePage.tsx # Pricing bento with high-contrast PixelCards
│       ├── HomePage.tsx       # Hero with PeepCrowd, stats bento, telemetry
│       ├── NetworkPage.tsx    # Founder network 3D avatar cloud & startup ranking
│       └── BuilderProfilePage.tsx # Linear-style animated builder showcase
```
