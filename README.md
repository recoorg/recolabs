# Reco Labs (`recolabs`)

<p align="center">
  <img src="public/logo-black.png" alt="Reco Labs Logo" width="120" />
</p>

<p align="center">
  <strong>The Skill Exchange for curious Mind.</strong><br />
  A collective of young hackers, builders, and makers shipping high-impact software, hardware, and tutorials.
</p>

<p align="center">
  <a href="https://discord.com/invite/7dk4w37BhP"><img src="https://img.shields.io/badge/Discord-Join%20Guild-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord" /></a>
  <a href="https://github.com/recoorg"><img src="https://img.shields.io/badge/GitHub-recoorg-black?style=flat&logo=github" alt="GitHub" /></a>
  <a href="https://instagram.com/rawenergon"><img src="https://img.shields.io/badge/Instagram-@rawenergon-E4405F?style=flat&logo=instagram&logoColor=white" alt="Instagram" /></a>
  <a href="https://x.com/adibxr"><img src="https://img.shields.io/badge/X-@adibxr-000000?style=flat&logo=x&logoColor=white" alt="X" /></a>
</p>

---

## ⚡ Overview

Started as a Grade 10 high school project by **Aditya** to solve daily problems and share tutorials for beginners, **Reco Labs** has grown into an open-source collective for curious minds worldwide.

- **Editorial Design Language**: Built with **Instrument Serif** display typography, **Geist Mono** technical badges, and signature Reco orange accents (`#FA5D00`).
- **Interactive Crowd Canvas**: Viewport-aware GSAP walking peep sprites inspired by hackclub.com.
- **Live Youth Hackathon Directory**: Dual-endpoint integration connecting to Hack Club's upcoming and global archives (900+ events).
- **Interactive 3D Glass Folder Cards**: Physics-based interactive file showcases for hardware, software, and developer tools.
- **Doodle Crew Interactive Footer**: Hand-drawn animated mascots with cursor tracking and physics floaters.
- **Backend Ready**: Decoupled, typed service layer (`src/services/api.ts`) ready for deployment with any REST/GraphQL backend.
- **Vercel Native**: Zero-configuration SPA routing and asset caching via `vercel.json`.

---

## 🛠️ Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8 with HMR
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Animation**: GSAP + Canvas2D
- **Icons**: Lucide React
- **Typography**: Instrument Serif, Geist Mono, Geist Sans

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/recoorg/recolabs.git
cd recolabs
npm install
```

### Development

```bash
npm run dev
```

Runs the development server locally on `http://localhost:5173/`.

### Production Build

```bash
npm run build
```

Compiles the production artifact into `dist/`.

---

## 🌐 Deploy to Vercel

The repository includes a production-ready `vercel.json` configured with SPA rewrites and proxy endpoints:

```bash
npx vercel
```

---

## 📜 License

Open source under the [MIT License](LICENSE). Built by curious minds worldwide.
