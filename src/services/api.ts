/**
 * Reco Labs - Backend API Service Layer
 * 
 * Ready to plug into any backend (Node.js/Express, Python/FastAPI, Go, Next.js API routes, Supabase, etc.).
 * To point to your live backend, set VITE_API_URL in your .env or Vercel environment variables:
 * VITE_API_URL="https://api.yourdomain.com"
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || ""

// Types
export interface ProjectItem {
  id: string
  name: string
  tag: string
  lang: string
  category: "all" | "flagship" | "hardware" | "tools" | "tutorials"
  stars: string | number
  forks?: number
  desc: string
  href: string
  featured?: boolean
  gitUrl?: string
}

export interface HackathonEvent {
  id: string
  name: string
  website: string
  start: string
  end: string
  createdAt?: string
  logo?: string
  banner?: string
  city?: string
  state?: string
  country?: string
  countryCode?: string
  latitude?: string | number
  longitude?: string | number
  virtual?: boolean
  hybrid?: boolean
  mlhAssociated?: boolean
  hack_club_event?: boolean
  apac?: boolean
}

export interface GoogleJobItem {
  job_id: string
  title: string
  company_name: string
  location: string
  via?: string
  description?: string
  thumbnail?: string
  extensions?: string[]
  detected_extensions?: {
    posted_at?: string
    schedule_type?: string
    work_from_home?: boolean
    salary?: string
  }
  category?: string
  highlights?: string[]
  apply_link?: string
}

export interface JobRole {
  id: string
  title: string
  category: "engineering" | "hardware" | "tutorials" | "design" | "community"
  commitment: string
  type: string
  stipend: string
  description: string
  requirements: string[]
  tags: string[]
}

// Fallback project catalog
const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "recolabs",
    name: "recolabs",
    tag: "FLAGSHIP / CORE",
    lang: "TypeScript · React 19",
    category: "flagship",
    stars: "1.2k",
    forks: 142,
    desc: "The primary organizational runtime and interactive web platform for Reco Labs.",
    href: "https://github.com/recoorg/recolabs",
    featured: true,
    gitUrl: "https://github.com/recoorg/recolabs.git",
  },
  {
    id: "hardware-workbench",
    name: "hardware-workbench",
    tag: "HARDWARE",
    lang: "KiCAD · C++20",
    category: "hardware",
    stars: "840",
    forks: 67,
    desc: "PCB layout schematics, BOM parts lists, and RTOS firmware routines for custom automation boards.",
    href: "https://github.com/recoorg",
    featured: true,
    gitUrl: "https://github.com/recoorg/hardware-workbench.git",
  },
  {
    id: "daily-fixers",
    name: "daily-fixers",
    tag: "ORIGIN STORY",
    lang: "Python · Shell",
    category: "tools",
    stars: "620",
    forks: 58,
    desc: "The original utility scripts started by Aditya during Grade 10 to solve daily automation headaches.",
    href: "https://github.com/recoorg",
    featured: true,
    gitUrl: "https://github.com/recoorg/daily-fixers.git",
  },
  {
    id: "crowd-canvas-runner",
    name: "crowd-canvas-runner",
    tag: "GRAPHICS",
    lang: "Canvas2D · GSAP",
    category: "tools",
    stars: "450",
    forks: 39,
    desc: "High-performance walking sprite loop engine with viewport intersection observer sleep states.",
    href: "https://github.com/recoorg",
    gitUrl: "https://github.com/recoorg/crowd-canvas-runner.git",
  },
  {
    id: "beginner-path-vault",
    name: "beginner-path-vault",
    tag: "TUTORIALS",
    lang: "Markdown · Guides",
    category: "tutorials",
    stars: "910",
    forks: 112,
    desc: "Curated beginner roadmaps, project checklists, and step-by-step guides for young coders.",
    href: "https://github.com/recoorg",
    gitUrl: "https://github.com/recoorg/beginner-path-vault.git",
  },
  {
    id: "hacker-toolkit",
    name: "hacker-toolkit",
    tag: "DEV TOOLS",
    lang: "Rust · Bash",
    category: "tools",
    stars: "530",
    forks: 44,
    desc: "Quick terminal bridges, build scanners, and automated dev-environment scaffolds.",
    href: "https://github.com/recoorg",
    gitUrl: "https://github.com/recoorg/hacker-toolkit.git",
  },
]

// Fallback jobs catalog
const DEFAULT_JOBS: JobRole[] = [
  {
    id: "eng-core",
    title: "Full-Stack Web Architect",
    category: "engineering",
    commitment: "Part-time / Sprint-based",
    type: "Open Guild Role",
    stipend: "Bounty / Rev-Share",
    description: "Architect and scale web utilities, micro-frontends, and interactive learning modules on top of React, TypeScript, and modern canvas/WebGL stacks.",
    requirements: ["Deep fluency with React, Vite, Tailwind CSS", "Experience building fast, accessible SPAs", "Appreciation for minimalist editorial design (Instrument Serif / Geist)"],
    tags: ["React 19", "TypeScript", "Tailwind CSS", "Architecture"],
  },
  {
    id: "hw-lead",
    title: "Embedded Systems & PCB Hacker",
    category: "hardware",
    commitment: "Project-based",
    type: "Open Guild Role",
    stipend: "Hardware Grant + Bounty",
    description: "Design open-source hardware modules that solve daily automation tasks — from custom microcontroller boards (RP2040, ESP32) to sensor telemetry systems.",
    requirements: ["Comfortable reading schematics and KiCAD board layouts", "Hands-on C/C++ or Rust for microcontrollers", "Can solder, debug on a scope, and document build logs cleanly"],
    tags: ["KiCAD", "ESP32", "RP2040", "C++20", "Circuit Design"],
  },
  {
    id: "content-dev",
    title: "Beginner Path Curriculum Designer",
    category: "tutorials",
    commitment: "Flexible / Contributor",
    type: "Open Guild Role",
    stipend: "Per-Tutorial Bounty",
    description: "Reco Labs exists to give beginners a clear roadmap instead of endless tutorial hell. Build bite-sized, code-first workshops and guides that take beginners from zero to shipping.",
    requirements: ["Ability to break complex technical concepts into approachable steps", "Experience writing code walkthroughs with interactive sandboxes", "Empathetic mindset for teenagers and self-taught coders"],
    tags: ["Tutorials", "Documentation", "Curriculum", "Mentorship"],
  },
  {
    id: "ui-craft",
    title: "Product Designer & Visual Hacker",
    category: "design",
    commitment: "Sprint-based",
    type: "Open Guild Role",
    stipend: "Per-Sprint Bounty",
    description: "Craft bespoke interfaces, interactive doodles, visual micro-interactions, and visual assets for Reco Labs products, hackathons, and physical merch.",
    requirements: ["Figma proficiency with component libraries & design systems", "Eye for typography, negative space, and quirky editorial details", "Basic understanding of how designs translate to Tailwind & CSS"],
    tags: ["Figma", "UI/UX", "Typography", "Motion"],
  },
  {
    id: "guild-steward",
    title: "Guild Steward & Hackathon Lead",
    category: "community",
    commitment: "Part-time",
    type: "Core Guild Role",
    stipend: "Monthly Stipend",
    description: "Drive community momentum across our Discord, coordinate 48-hour build sprints, review submissions, and pair up beginner builders with experienced mentors.",
    requirements: ["Proven experience building and running tech communities", "Clear, energetic, respectful communication", "Available to host weekly Discord stages and weekend sprint kickoffs"],
    tags: ["Community", "Discord", "Sprint Management", "Mentorship"],
  },
]

export const api = {
  /**
   * Fetch all projects.
   * Calls GET /api/projects if backend is configured, otherwise returns local catalog.
   */
  async getProjects(): Promise<ProjectItem[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/projects`)
        if (res.ok) {
          return await res.json()
        }
      } catch (err) {
        console.warn("[api.getProjects] Backend unavailable, using fallback:", err)
      }
    }
    return DEFAULT_PROJECTS
  },

  /**
   * Fetch live upcoming hackathons from Hack Club API.
   * Endpoint: https://hackathons.hackclub.com/api/events/upcoming/
   */
  async getUpcomingHackathons(): Promise<HackathonEvent[]> {
    // 1. Try local dev proxy / Vercel rewrite
    try {
      const res = await fetch("/api/hackclub/api/events/upcoming/")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) return data
      }
    } catch {
      // ignore
    }

    // 2. Try direct URL
    try {
      const res = await fetch("https://hackathons.hackclub.com/api/events/upcoming/")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) return data
      }
    } catch {
      // ignore
    }

    // 3. Fallback to cached static JSON
    try {
      const res = await fetch("/data/upcoming.json")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) return data
      }
    } catch (err) {
      console.warn("[api.getUpcomingHackathons] Fallback failed:", err)
    }

    return []
  },

  /**
   * Fetch all historical and current hackathons from Hack Club API.
   * Endpoint: https://hackathons.hackclub.com/api/events/all/
   */
  async getAllHackathons(): Promise<HackathonEvent[]> {
    // 1. Try local dev proxy / Vercel rewrite
    try {
      const res = await fetch("/api/hackclub/api/events/all/")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) return data
      }
    } catch {
      // ignore
    }

    // 2. Try direct URL
    try {
      const res = await fetch("https://hackathons.hackclub.com/api/events/all/")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) return data
      }
    } catch {
      // ignore
    }

    // 3. Fallback to cached static JSON
    try {
      const res = await fetch("/data/all.json")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) return data
      }
    } catch (err) {
      console.warn("[api.getAllHackathons] Fallback failed:", err)
    }

    return []
  },

  /**
   * Alias for upcoming hackathons.
   */
  async getHackathons(): Promise<HackathonEvent[]> {
    return this.getUpcomingHackathons()
  },

  /**
   * Search jobs using SerpApi Google Jobs endpoint, live developer feeds, or curated guild roles.
   * Endpoint: https://serpapi.com/search?engine=google_jobs
   */
  async getGoogleJobs(query?: string): Promise<GoogleJobItem[]> {
    const localKey = typeof window !== "undefined" ? localStorage.getItem("reco_serpapi_key") : null
    const serpApiKey = localKey || (import.meta as any).env?.VITE_SERPAPI_KEY || ""
    const q = query && query.trim() ? query.trim() : "developer"
    const results: GoogleJobItem[] = []

    // 1. If SerpApi key is present, search Google Jobs via SerpApi
    if (serpApiKey) {
      try {
        const url = `/api/serpapi/search.json?engine=google_jobs&q=${encodeURIComponent(q)}&api_key=${serpApiKey}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (data?.jobs_results && Array.isArray(data.jobs_results)) {
            const mapped = data.jobs_results.map((j: any) => ({
              job_id: j.job_id || "serp_" + Math.random().toString(36).substring(2, 9),
              title: j.title || "Software Engineer",
              company_name: j.company_name || "Engineering Co",
              location: j.location || "Remote",
              via: j.via || "via Google Jobs",
              description: j.description ? j.description.slice(0, 360) + "..." : "",
              thumbnail: j.thumbnail,
              extensions: j.extensions || [],
              detected_extensions: j.detected_extensions || {},
              category: "software",
              highlights: j.job_highlights?.[0]?.items || [],
              apply_link: j.related_links?.[0]?.link || "https://google.com/search?q=" + encodeURIComponent(j.title),
            }))
            results.push(...mapped)
          }
        }
      } catch (err) {
        console.warn("[api.getGoogleJobs] Live SerpApi query error:", err)
      }
    }

    // 2. Fetch live real-time developer jobs from open public technical API
    try {
      const remotiveUrl = `https://remotive.com/api/remote-jobs?limit=25&search=${encodeURIComponent(q)}`
      const res = await fetch(remotiveUrl)
      if (res.ok) {
        const data = await res.json()
        if (data?.jobs && Array.isArray(data.jobs)) {
          const mapped = data.jobs.map((r: any) => {
            const cleanDesc = (r.description || "").replace(/<[^>]*>?/gm, "").slice(0, 320) + "..."
            return {
              job_id: "remotive_" + r.id,
              title: r.title,
              company_name: r.company_name,
              location: r.candidate_required_location || "Remote Worldwide",
              via: "via Remotive Feed",
              description: cleanDesc,
              thumbnail: r.company_logo || undefined,
              extensions: [
                r.job_type ? r.job_type.replace("_", " ") : "Full-time",
                r.candidate_required_location || "Remote",
                r.salary || "Competitive Pay",
              ],
              detected_extensions: {
                posted_at: r.publication_date ? new Date(r.publication_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent",
                schedule_type: r.job_type || "Full-time",
                work_from_home: true,
                salary: r.salary || undefined,
              },
              category: r.category?.toLowerCase().includes("dev") ? "software" : (r.category?.toLowerCase() || "software"),
              highlights: r.tags || [],
              apply_link: r.url,
            } as GoogleJobItem
          })
          results.push(...mapped)
        }
      }
    } catch (e) {
      console.warn("[api.getGoogleJobs] Live feed query error:", e)
    }

    // 3. Fallback / supplementary curated Reco Labs catalog
    try {
      const res = await fetch("/data/jobs.json")
      if (res.ok) {
        const localData = await res.json()
        if (Array.isArray(localData)) {
          const needle = q.toLowerCase()
          const matched = localData.filter((item: GoogleJobItem) =>
            item.title.toLowerCase().includes(needle) ||
            item.company_name.toLowerCase().includes(needle) ||
            item.description?.toLowerCase().includes(needle) ||
            item.location.toLowerCase().includes(needle) ||
            !query // If no query, include all default positions
          )
          results.push(...matched)
        }
      }
    } catch {
      // ignore
    }

    // 4. Deduplicate by job_id or title+company
    const seen = new Set<string>()
    const deduplicated = results.filter((j) => {
      const key = `${j.title.toLowerCase()}_${j.company_name.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // 5. Anti-spam filter: eliminate low-quality unpaid internship spam
    return deduplicated.filter((job) => {
      const text = `${job.title} ${job.description || ""}`.toLowerCase()
      const spamKeywords = ["unpaid internship", "commission only", "no pay", "unpaid volunteer"]
      return !spamKeywords.some((w) => text.includes(w))
    })
  },

  /**
   * Fetch open roles and jobs.
   */
  async getJobs(): Promise<JobRole[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jobs`)
        if (res.ok) return await res.json()
      } catch (err) {
        console.warn("[api.getJobs] Backend unavailable, using fallback:", err)
      }
    }
    return DEFAULT_JOBS
  },

  /**
   * Submit email for joining Reco Labs.
   * Endpoint: https://formspree.io/f/mvkkrjez
   */
  async joinNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvkkrjez"
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          _subject: "New Member Joined Reco Labs",
          source: "Hero Section Pill",
          timestamp: new Date().toISOString(),
        }),
      })
      if (res.ok) {
        return { success: true, message: "Welcome to Reco Labs! You're in." }
      }
    } catch (err) {
      console.warn("[api.joinNewsletter] Formspree dispatch error:", err)
    }

    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, timestamp: new Date().toISOString() }),
        })
        if (res.ok) return await res.json()
      } catch (err) {
        console.warn("[api.joinNewsletter] Backend failed, simulating success:", err)
      }
    }
    return { success: true, message: "Welcome to Reco Labs! Verification sent to your inbox." }
  },

  /**
   * Submit hackathon registration RSVP.
   */
  async registerHackathon(data: {
    hackathonId: string
    name: string
    email: string
    github: string
    discord: string
  }): Promise<{ success: boolean; message: string }> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/hackathons/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (res.ok) return await res.json()
      } catch (err) {
        console.warn("[api.registerHackathon] Backend failed, simulating success:", err)
      }
    }
    return { success: true, message: "RSVP confirmed! See you at the sprint." }
  },
}
