# Reco Labs Design System & Frontend Architecture Specification (`design.md`)

> **Version**: 2.4.0  
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
> **The Obsidian Surface Invariant**: When components (such as `PixelCard`) render dark obsidian canvas backgrounds regardless of user system mode, all internal text **must explicitly use light color tokens** (`text-white`, `text-zinc-200`, `text-zinc-300`, `text-zinc-400`). Never cascade generic theme-dependent `text-zinc-900` onto an obsidian element.

---

## 3. Typography Stack & Tokens

The typography stack balances editorial gravitas with engineer precision. Configured in `src/index.css` via Tailwind v4 `@theme`.

```css
@theme {
  --font-serif: "Instrument Serif", Georgia, serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-sans: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

### Hierarchy & Application Rules
1. **Display Headings (`font-serif`)**:
   - Class: `font-serif tracking-tight font-normal sm:font-bold`
   - Purpose: Hero section headlines, plan titles, manifesto intros, interview features.
   - Example: *"Build in Public. Get Verified & Boosted."*
2. **Technical Telemetry & Code (`font-mono`)**:
   - Class: `font-mono tracking-wider uppercase text-xs font-bold`
   - Purpose: Kicker badges, timestamps, pricing numerals (`₹199/month`), commit SHAs, stats cards.
   - Example: `// INDIE & SOLO FOUNDERS`, `2.4k STARS`
3. **Interface Copy & Descriptions (`font-sans`)**:
   - Class: `font-sans text-sm sm:text-base leading-relaxed`
   - Purpose: Paragraph body copy, form labels, card explanations, documentation text.

---

## 4. Key Component Systems

### 4.1 PixelCard (`src/components/ui/PixelCard.tsx`)
Interactive HTML5 Canvas particle system embedded inside an obsidian card shell.
- **Physics**: Tracks cursor coordinates via pointer events, wakes GPU-composited canvas loops on hover or focus, triggers radial shockwave ripples on click.
- **Surface Elevation**: All text and button children live inside a `<div className="relative z-10">` wrapper to stay above the canvas and pseudo-border highlight layers.
- **Palettes**:
  - `Default`: Slate/zinc particles (`["#94a3b8", "#64748b", "#475569"]`)
  - `Orange`: Reco brand particles (`["#FA5D00", "#FF8C42", "#ffa65c"]`)
  - `Yellow`: Founder pass particles (`["#fbbf24", "#f59e0b", "#d97706"]`)

### 4.2 Linear Modal & Spring Expanders (`src/components/ui/linear-modal.tsx`)
Physics-modeled expanding dialogs inspired by Linear.
- **Motion Spec**:
  ```ts
  transition: {
    type: 'spring',
    bounce: 0.05,
    duration: 0.5
  }
  ```
- **Structure**:
  - `DialogTrigger`: Container thumbnail that smoothly interpolates into fullscreen modal.
  - `DialogContainer`: Radial gradient backdrop blur (`dark:bg-[radial-gradient(...)]`).
  - `DialogContent`: Rounded sheet (`rounded-3xl` / `rounded-[24px]`) with spring transition.

### 4.3 VerifiedBadge (`src/components/VerifiedBadge.tsx`)
Authentic 12-scalloped seal badge rendering SVG geometry with embedded checkmark icon.
- **Variants**:
  - `Verified Pro`: Royal blue gradient (`#3b82f6` to `#1d4ed8`), blue glow filter.
  - `Pro Founder`: Amber/gold gradient (`#f59e0b` to `#d97706`), golden crown accent.
- **Sizes**: `xs` (14px), `sm` (18px), `md` (22px), `lg` (28px).

### 4.4 Global Navigation & Header (`src/components/Navbar.tsx`)
- Floating pill structure with backdrop blur (`backdrop-blur-xl bg-white/70 dark:bg-black/70`).
- Direct communication channel: Top WhatsApp community join button (`https://chat.whatsapp.com/IApnk6YLM0l2j1nwcVzRR5`).
- Footer links complete ecosystem: GitHub, Discord, WhatsApp, Twitter/X.

### 4.5 PeepCrowd Interactive Engine (`src/components/PeepCrowd.tsx`)
2D Canvas sprite simulation featuring animated builder avatars. Avatars accelerate and react to cursor proximity, scattering and reorganizing across the hero boundary without consuming main-thread DOM cycles.

---

## 5. Animation Vocabulary & Curves

All UI animations must adhere to these mechanical timing functions:

| Motion Type | Duration | Easing Curve | Use Case |
|---|---|---|---|
| **Micro-interaction** | `150ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Button press scale (`active:scale-95`), hover pills |
| **Sheet / Modal Open**| `350ms - 500ms` | Spring (`stiffness: 300, damping: 28`) | Dialogs, drawer open, checkout popover |
| **Canvas Particles**  | Frame-driven | `requestAnimationFrame` with delta time clamping | PixelCard twinkle and spotlight tracking |
| **Page Transition**   | `200ms` | `ease-out` | Route switching, tab content crossfades |

---

## 6. Transactional Email System Architecture

Automated emails triggered by user registration, post launches, and comments utilize an editorial layout mirroring the Reco platform aesthetic.

### Layout Spec
- **Canvas Width**: `520px` centered table container on `#FFFFFF` ground.
- **Brand Mark**: `https://www.recolabs.in/logo-black.png` at 48px width.
- **Kicker**: `14px` Geist Mono uppercase accent (`color: #ef4444` or `#FA5D00`).
- **Headline**: `28px` Instrument Sans / -apple-system display headline (`font-weight: 500`, `letter-spacing: -0.5px`).
- **Body Text**: `16px` Instrument Sans (`color: #3f3f46`, `line-height: 1.6`).
- **Action Button**: Obsidian pill with `#FA5D00` accent or black fill with white typography.

---

## 7. Responsive Breakpoint Rules

| Breakpoint | Width | Behavior |
|---|---|---|
| **Mobile (`< 640px`)** | `100%` width | Single-column cards, bottom fixed navigation sheets, full-width checkout buttons. |
| **Tablet (`640px - 1024px`)** | 2-column grid | Compact cards with truncated descriptions, scrollable bento items. |
| **Desktop (`> 1024px`)** | 3-column grid | Max-width `1280px` centered canvas, side dock expansion, full PixelCard canvas effects. |

---

## 8. File Structure Map

```
reco-labs/
├── design.md                  # This master design specification
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
