"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import confetti from "canvas-confetti"
import {
  Search,
  Plus,
  Heart,
  ExternalLink,
  Flame,
  Lightbulb,
  Box,
  Terminal,
  Cpu,
  UserCheck,
  Check,
  Sparkles,
  X,
  LogIn,
  LogOut,
  FolderPlus,
  Share2,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpRight,
  Globe,
  Layers,
  Sparkle,
} from "lucide-react"
import { GithubIcon } from "@/components/icons"
import { networkApi, type UserProfile } from "@/services/networkApi"

interface CatalogProject {
  id: string
  title: string
  url: string
  category: "Finds" | "Interface" | "Motion" | "3D" | "Tools" | "Resources" | "Hardware" | "Inspiration"
  description: string
  author: string
  authorHandle: string
  thumbnailBg: string
  visualType: "wireframe" | "landscape" | "pixel" | "buttons" | "terminal" | "hardware" | "cyber"
  isSponsored?: boolean
  sponsoredLabel?: string
  tags: string[]
  stars?: number
  timestamp?: string
}

// Initial rich curated projects
const INITIAL_PROJECTS: CatalogProject[] = [
  {
    id: "reco-flagship",
    title: "Reco Labs Flagship",
    url: "https://recolabs.in",
    category: "Finds",
    description: "The primary organizational runtime, skill exchange, and founder network for young builders.",
    author: "Aditya Raj",
    authorHandle: "rawenergon",
    thumbnailBg: "#09090b",
    visualType: "wireframe",
    tags: ["React 19", "Vite", "Open Source"],
    stars: 124,
  },
  {
    id: "shafire-tools",
    title: "Shafire Kernel Tools",
    url: "https://github.com/recoorg",
    category: "Tools",
    description: "Ring-0 hook analysis, memory virtualization inspection, and anticheat defeat suite.",
    author: "Tanish",
    authorHandle: "fluxstudio",
    thumbnailBg: "#141417",
    visualType: "terminal",
    tags: ["C++20", "Windows", "Kernel"],
    stars: 88,
  },
  {
    id: "board-ui",
    title: "BoardUI Component Kit",
    url: "https://recolabs.in/projects",
    category: "Interface",
    description: "Tables, charts, and agent-interface components in a React and Tailwind brutalist design system.",
    author: "Reco Labs",
    authorHandle: "recolabs",
    thumbnailBg: "#18181b",
    visualType: "buttons",
    isSponsored: true,
    sponsoredLabel: "Sponsored by Reco Guild",
    tags: ["React", "Tailwind", "Design System"],
    stars: 342,
  },
  {
    id: "hardware-glitcher",
    title: "ESP32-S3 Crowbar Rig",
    url: "https://github.com/recoorg",
    category: "Hardware",
    description: "Voltage glitching test rig to evaluate ROM bootloader timing faults and fuse bypasses.",
    author: "Elena Rostova",
    authorHandle: "erostova",
    thumbnailBg: "#0c0a09",
    visualType: "hardware",
    tags: ["KiCAD", "ESP32", "Firmware"],
    stars: 76,
  },
  {
    id: "afxdp-network",
    title: "Zero-Copy Network Stack",
    url: "https://github.com/recoorg",
    category: "Tools",
    description: "High-throughput Linux AF_XDP raw packet driver with kernel bypass written in safe Rust.",
    author: "Devin Patel",
    authorHandle: "devinp",
    thumbnailBg: "#022c22",
    visualType: "cyber",
    tags: ["Rust", "AF_XDP", "eBPF"],
    stars: 198,
  },
  {
    id: "typingmind-ui",
    title: "TypingMind Canvas",
    url: "https://typingmind.com",
    category: "Inspiration",
    description: "Beautiful next-generation generative AI workspace with local memory and prompt trees.",
    author: "Community",
    authorHandle: "curated",
    thumbnailBg: "#172554",
    visualType: "landscape",
    tags: ["AI", "UI Craft", "Productivity"],
    stars: 512,
  },
  {
    id: "ai-ui-synthesis",
    title: "AI for UI Synthesis",
    url: "https://recolabs.in/network",
    category: "Interface",
    description: "Design and build generative design tokens, state graphs, and autonomous interfaces.",
    author: "Reco AI Labs",
    authorHandle: "recolabs",
    thumbnailBg: "#1e1b4b",
    visualType: "cyber",
    isSponsored: true,
    sponsoredLabel: "Featured Tool",
    tags: ["AI", "Generative", "UI"],
    stars: 265,
  },
  {
    id: "raylib-wasm",
    title: "Raylib WebGL Playground",
    url: "https://raylib.com",
    category: "3D",
    description: "Hardware-accelerated 3D mathematics, spatial lighting caustics, and procedural shaders.",
    author: "Maksym Solomkin",
    authorHandle: "makssolomkin",
    thumbnailBg: "#09090b",
    visualType: "wireframe",
    tags: ["WebGL", "C99", "Shaders"],
    stars: 430,
  },
  {
    id: "hackclub-sprig",
    title: "Hack Club Sprig Console",
    url: "https://sprig.hackclub.com",
    category: "Resources",
    description: "Handheld open-hardware console with a tile-based engine for high school developers.",
    author: "Hack Club",
    authorHandle: "hackclub",
    thumbnailBg: "#3b0764",
    visualType: "pixel",
    tags: ["Hardware", "Education", "Gaming"],
    stars: 820,
  },
]

const CATEGORIES = ["All", "Finds", "Interface", "Motion", "3D", "Tools", "Resources", "Hardware", "Inspiration"]

export function ProjectsPage() {
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null)
  const [projects, setProjects] = React.useState<CatalogProject[]>(() => {
    if (typeof window === "undefined") return INITIAL_PROJECTS
    try {
      const stored = localStorage.getItem("reco_catalog_projects")
      if (stored) {
        const parsed = JSON.parse(stored)
        return [...parsed, ...INITIAL_PROJECTS.filter((p) => !parsed.some((x: any) => x.id === p.id))]
      }
    } catch {}
    return INITIAL_PROJECTS
  })

  // Filter & Search states
  const [activeCategory, setActiveCategory] = React.useState<string>("All")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [selectedSort, setSelectedSort] = React.useState<"recent" | "stars">("recent")
  const [favorites, setFavorites] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(localStorage.getItem("reco_project_favorites") || "[]")
    } catch {
      return []
    }
  })
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false)

  // Modals
  const [showSubmitModal, setShowSubmitModal] = React.useState(false)
  const [showAuthModal, setShowAuthModal] = React.useState(false)
  const [showInfoModal, setShowInfoModal] = React.useState(false)

  // Auth Form State (for quick signin if not logged in)
  const [authEmail, setAuthEmail] = React.useState("")
  const [authPassword, setAuthPassword] = React.useState("")
  const [authName, setAuthName] = React.useState("")
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("signup")
  const [authLoading, setAuthLoading] = React.useState(false)
  const [authError, setAuthError] = React.useState("")

  // Submit Website Form State
  const [submitForm, setSubmitForm] = React.useState({
    title: "",
    url: "",
    category: "Finds" as CatalogProject["category"],
    description: "",
  })
  const [submitLoading, setSubmitLoading] = React.useState(false)
  const [submitSuccess, setSubmitSuccess] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")

  // Sync user session
  React.useEffect(() => {
    const syncUser = () => {
      setCurrentUser(networkApi.getCurrentUser())
    }
    syncUser()
    window.addEventListener("reco_auth_changed", syncUser)
    return () => window.removeEventListener("reco_auth_changed", syncUser)
  }, [])

  // Toggle Favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    let updated: string[] = []
    if (favorites.includes(id)) {
      updated = favorites.filter((f) => f !== id)
    } else {
      updated = [...favorites, id]
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } })
    }
    setFavorites(updated)
    try {
      localStorage.setItem("reco_project_favorites", JSON.stringify(updated))
    } catch {}
  }

  // Handle Submit button click
  const handleOpenSubmit = () => {
    if (!currentUser) {
      setAuthMode("signup")
      setShowAuthModal(true)
    } else {
      setShowSubmitModal(true)
    }
  }

  // Submit Website to Formspree endpoint (the same email endpoint) & local state
  const handleWebsiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submitForm.title || !submitForm.url) {
      setSubmitError("Project title and URL are required.")
      return
    }

    setSubmitLoading(true)
    setSubmitError("")

    const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvkkrjez"
    const submitterName = currentUser?.name || "Anonymous Builder"
    const submitterEmail = currentUser?.email || "builder@recolabs.in"
    const submitterUsername = currentUser?.username || "builder"

    try {
      // Send email payload to the Formspree endpoint
      await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _subject: `New Reco Labs Project Submission: ${submitForm.title}`,
          title: submitForm.title,
          url: submitForm.url,
          category: submitForm.category,
          description: submitForm.description || "No description provided.",
          submitter_name: submitterName,
          submitter_email: submitterEmail,
          submitter_username: submitterUsername,
          source: "Projects Page Catalogue Submission",
          submitted_at: new Date().toISOString(),
        }),
      })

      // Create new visual project in local catalog
      const newProj: CatalogProject = {
        id: `user-${Date.now()}`,
        title: submitForm.title,
        url: submitForm.url.startsWith("http") ? submitForm.url : `https://${submitForm.url}`,
        category: submitForm.category,
        description: submitForm.description || `Curated ${submitForm.category} project submitted by @${submitterUsername}.`,
        author: submitterName,
        authorHandle: submitterUsername,
        thumbnailBg: "#121214",
        visualType: "cyber",
        tags: [submitForm.category, "Community"],
        stars: 1,
        timestamp: new Date().toISOString(),
      }

      const updatedProjects = [newProj, ...projects]
      setProjects(updatedProjects)
      try {
        localStorage.setItem("reco_catalog_projects", JSON.stringify(updatedProjects.slice(0, 30)))
      } catch {}

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } })
      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        setShowSubmitModal(false)
        setSubmitForm({ title: "", url: "", category: "Finds", description: "" })
      }, 2000)
    } catch (err: any) {
      console.warn("Formspree email dispatch notice:", err)
      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        setShowSubmitModal(false)
      }, 2000)
    } finally {
      setSubmitLoading(false)
    }
  }

  // Handle Quick Auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError("")
    try {
      if (authMode === "signup") {
        const username = authName.toLowerCase().replace(/[^a-z0-9_-]/g, "") || "builder"
        const res = await networkApi.signUp({
          name: authName,
          email: authEmail,
          password: authPassword,
          username,
        })
        setCurrentUser(res.user)
      } else {
        const res = await networkApi.login({
          email: authEmail,
          password: authPassword,
        })
        setCurrentUser(res.user)
      }
      setShowAuthModal(false)
      setShowSubmitModal(true)
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed. Try again.")
    } finally {
      setAuthLoading(false)
    }
  }

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category.toLowerCase() === activeCategory.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFav = !showFavoritesOnly || favorites.includes(p.id)
    return matchesCategory && matchesSearch && matchesFav
  })

  // Render stylized visual mockup preview inside the card
  const renderVisualMockup = (p: CatalogProject) => {
    switch (p.visualType) {
      case "wireframe":
        return (
          <div className="w-full h-full flex items-center justify-center bg-zinc-950 p-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="relative w-28 h-28 border border-zinc-700/80 rounded-2xl flex items-center justify-center shadow-inner">
              <span className="font-serif italic text-6xl text-white font-normal select-none">1</span>
              <div className="absolute inset-0 border border-dashed border-[#FA5D00]/40 rounded-2xl animate-pulse" />
            </div>
          </div>
        )
      case "landscape":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/60 via-purple-900/40 to-black p-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="w-full max-w-[200px] h-24 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex flex-col justify-between shadow-xl">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="h-2 w-3/4 rounded bg-white/30" />
              <div className="h-2 w-1/2 rounded bg-white/20" />
            </div>
          </div>
        )
      case "buttons":
        return (
          <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-6 relative group-hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Click
              </div>
              <div className="px-4 py-2 rounded-xl bg-[#FA5D00] text-black font-mono text-xs font-bold shadow-md">
                Loading
              </div>
            </div>
          </div>
        )
      case "terminal":
        return (
          <div className="w-full h-full flex flex-col justify-center bg-[#09090b] p-6 font-mono text-xs text-emerald-400 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="space-y-1">
              <p className="text-zinc-500">// shafire.sys load</p>
              <p className="text-[#FA5D00]">&gt; ring0_hook: bypass</p>
              <p className="text-zinc-300">&gt; mem_scan: complete [0x7FF]</p>
            </div>
          </div>
        )
      case "hardware":
        return (
          <div className="w-full h-full flex items-center justify-center bg-[#1c1917] p-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="w-28 h-20 rounded-lg border-2 border-amber-600/60 bg-amber-950/30 p-2 flex flex-col justify-between font-mono text-[9px] text-amber-400">
              <span className="font-bold">ESP32-S3 RIG</span>
              <div className="grid grid-cols-4 gap-1">
                {[...Array(8)].map((_, i) => (
                  <span key={i} className="h-1.5 bg-amber-500/60 rounded-xs" />
                ))}
              </div>
              <span className="text-[8px] text-zinc-400">PULSE: 12ns</span>
            </div>
          </div>
        )
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-[#09090b] p-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#FA5D00]/20 to-blue-500/20 border border-[#FA5D00]/40 shadow-xl">
              <Sparkles className="w-8 h-8 text-[#FA5D00]" />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row pt-20">
      
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR (Matching designeer.xyz layout)         */}
      {/* ======================================================== */}
      <aside className="w-full md:w-64 lg:w-72 flex-none border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md p-5 flex flex-col justify-between select-none">
        <div>
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-[#FA5D00] p-1.5 flex items-center justify-center shadow-sm flex-none overflow-hidden">
              <img src="/favicon.png" alt="Reco Labs" className="w-full h-full object-contain filter brightness-0" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold tracking-tight text-zinc-950 dark:text-zinc-50 leading-tight">
                recolabs.projects
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">Curated Catalogue</span>
            </div>
          </div>

          <p className="mt-4 font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            A curated collection of interface craft, component libraries, AI tools, hardware rigs, and resources for curious builders.
          </p>

          {/* Browse Navigation */}
          <div className="mt-6">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-2 px-2">
              Browse
            </span>
            <nav className="space-y-1 font-mono text-xs">
              {[
                { label: "Finds", icon: Flame, cat: "Finds", count: 18 },
                { label: "Inspiration", icon: Lightbulb, cat: "Inspiration", count: 24 },
                { label: "Resources", icon: Box, cat: "Resources", count: 15 },
                { label: "Tools", icon: Terminal, cat: "Tools", count: 19 },
                { label: "Hardware", icon: Cpu, cat: "Hardware", count: 12 },
                { label: "Interface", icon: Layers, cat: "Interface", count: 32 },
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeCategory.toLowerCase() === item.cat.toLowerCase()
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActiveCategory(item.cat)
                      setShowFavoritesOnly(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FA5D00]" : "opacity-60"}`} />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] opacity-60 font-normal">{item.count}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Folders & Shortcuts */}
          <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-2 px-2">
              Collections
            </span>
            <div className="space-y-1 font-mono text-xs">
              <button
                onClick={() => {
                  setActiveCategory("All")
                  setShowFavoritesOnly(false)
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeCategory === "All" && !showFavoritesOnly
                    ? "text-[#FA5D00] font-bold"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                ● All Artifacts ({projects.length})
              </button>
              <button
                onClick={() => setShowFavoritesOnly(true)}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                  showFavoritesOnly
                    ? "text-[#FA5D00] font-bold"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <span>♥ My Favourites</span>
                <span className="text-[10px] opacity-60 font-mono">{favorites.length}</span>
              </button>
              <button
                onClick={handleOpenSubmit}
                className="w-full text-left px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-[#FA5D00] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Website</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Bottom Promo Card (Matching BoardUI card in screenshot) */}
        <div className="mt-8 pt-4">
          <div className="p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#FA5D00] text-black font-mono font-bold text-xs flex items-center justify-center">
                B
              </div>
              <div>
                <h4 className="font-mono text-xs font-bold leading-none">BoardUI</h4>
                <span className="text-[9px] uppercase font-mono text-zinc-400">Sponsored</span>
              </div>
            </div>
            <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
              Tables, charts and agent-interface components in a React and Tailwind system.
            </p>
            <a
              href="https://recolabs.in/network"
              className="mt-3 block text-center py-1.5 px-3 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono text-[11px] font-bold hover:bg-[#FA5D00] dark:hover:bg-[#FA5D00] dark:hover:text-black transition-colors"
            >
              Visit site ↗
            </a>
          </div>

          <p className="mt-4 font-mono text-[10px] text-zinc-400 text-center">
            Curated by Reco Labs · © 2026
          </p>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN CATALOGUE CONTENT AREA                           */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 pb-20">
        
        {/* Top Control Bar (Matching designeer.xyz header) */}
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md">
          
          {/* Left Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <Link
                to={`/builder/${currentUser.username}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-semibold hover:border-[#FA5D00] transition-colors"
              >
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-[#FA5D00] text-black text-[9px] font-bold flex items-center justify-center">
                    {(currentUser.name || "B")[0].toUpperCase()}
                  </span>
                )}
                <span>@{currentUser.username}</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("login")
                  setShowAuthModal(true)
                }}
                className="px-3.5 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 font-mono text-xs font-semibold hover:border-[#FA5D00] transition-colors cursor-pointer"
              >
                Login
              </button>
            )}

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-1.5 rounded-full font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showFavoritesOnly
                  ? "bg-[#FA5D00] text-black"
                  : "border border-zinc-200 dark:border-zinc-800 hover:border-[#FA5D00]"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-black" : ""}`} />
              <span>Favourites ({favorites.length})</span>
            </button>

            <button
              onClick={() => setShowInfoModal(true)}
              className="hidden sm:inline-block px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 font-mono text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              Info
            </button>
          </div>

          {/* Center Search Input */}
          <div className="relative flex-1 max-w-xs sm:max-w-md mx-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search interface craft, AI tools, hardware..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00] transition-colors"
            />
          </div>

          {/* Right Action Button (+ Submit) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Central Hero Headline (Matching designeer.xyz) */}
        <div className="px-6 sm:px-10 pt-12 pb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight leading-tight">
            Designeer is a curated catalogue for designers and developers<span className="text-[#FA5D00]">.</span>
          </h1>
          <p className="mt-4 font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Design Inspiration, UI resources, tools and portfolios, each reviewed by hand. Below, the latest visual work picked from across the web.
          </p>
        </div>

        {/* Filter Chips Bar (Matching designeer.xyz) */}
        <div className="px-5 sm:px-10 py-4 flex flex-wrap items-center justify-between gap-4 border-y border-zinc-200 dark:border-zinc-800">
          
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = activeCategory.toLowerCase() === cat.toLowerCase()
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat)
                    setShowFavoritesOnly(false)
                  }}
                  className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                      : "border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Right Filters Dropdown Controls */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setSelectedSort(selectedSort === "recent" ? "stars" : "recent")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-[#FA5D00] transition-colors cursor-pointer"
            >
              <span>{selectedSort === "recent" ? "Recent ⌵" : "Popular ⌵"}</span>
            </button>
          </div>
        </div>

        {/* Project Cards Grid (Masonry / Visual Cards matching Image 3) */}
        <div className="px-5 sm:px-10 pt-8">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20 font-mono text-sm text-zinc-500">
              No projects match your filter.{" "}
              <button
                onClick={() => {
                  setActiveCategory("All")
                  setSearchQuery("")
                  setShowFavoritesOnly(false)
                }}
                className="underline text-[#FA5D00] ml-1 cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((p) => {
                const isFav = favorites.includes(p.id)

                return (
                  <div
                    key={p.id}
                    className="group relative rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#FA5D00] dark:hover:border-[#FA5D00] transition-all flex flex-col justify-between"
                  >
                    {/* Visual Card Canvas Mockup */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80">
                      {renderVisualMockup(p)}

                      {/* Sponsored / Category Tag */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                        {p.isSponsored ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FA5D00] text-black font-mono text-[10px] font-bold uppercase shadow">
                            Sponsored
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-[10px] font-semibold border border-white/20">
                            {p.category}
                          </span>
                        )}
                      </div>

                      {/* Favorite Button Overlay */}
                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        title={isFav ? "Remove from favourites" : "Add to favourites"}
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-rose-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/20"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>

                      {/* Visit Website Hover Overlay Arrow */}
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full bg-[#FA5D00] text-black hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg cursor-pointer"
                        title={`Open ${p.title} ↗`}
                      >
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      </a>
                    </div>

                    {/* Card Meta Content */}
                    <div className="p-5 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-lg font-normal tracking-tight text-zinc-950 dark:text-zinc-50 line-clamp-1">
                            {p.title}
                          </h3>
                        </div>

                        <p className="mt-1.5 font-sans text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      {/* Bottom Footer Info */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span className="truncate">
                          by <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">@{p.authorHandle}</strong>
                        </span>

                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FA5D00] flex items-center gap-1 transition-colors"
                        >
                          <span>Visit</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. SUBMIT WEBSITE MODAL (Requires login + Formspree)     */}
      {/* ======================================================== */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#121214] p-6 sm:p-8 shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-semibold text-[#FA5D00]">
              <Sparkles className="w-4 h-4" />
              <span>CURATED DIRECTORY SUBMISSION</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950 dark:text-zinc-50">
              Submit a Website or Tool
            </h2>
            <p className="mt-1 font-sans text-xs text-zinc-500 dark:text-zinc-400">
              Submitting as <strong className="text-zinc-900 dark:text-zinc-100">@{currentUser?.username || "builder"}</strong> ({currentUser?.email}). Reviewed and indexed by the guild.
            </p>

            {/* Submission Form */}
            <form onSubmit={handleWebsiteSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Project / Website Name *
                </label>
                <input
                  type="text"
                  required
                  value={submitForm.title}
                  onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                  placeholder="e.g. Shafire Kernel Debugger"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-sans text-sm focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Website URL *
                </label>
                <input
                  type="url"
                  required
                  value={submitForm.url}
                  onChange={(e) => setSubmitForm({ ...submitForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-sm focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Category *
                </label>
                <select
                  value={submitForm.category}
                  onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={submitForm.description}
                  onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                  placeholder="What makes this interface, tool or hardware project unique?"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-sans text-sm focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              {submitError && (
                <p className="font-mono text-xs text-red-500 bg-red-500/10 p-2.5 rounded-xl">
                  {submitError}
                </p>
              )}

              {submitSuccess && (
                <div className="font-mono text-xs text-emerald-500 bg-emerald-500/10 p-2.5 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Submitted! Sent to guild review queue.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitLoading || submitSuccess}
                className="w-full py-3 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {submitLoading ? "Dispatching URL..." : submitSuccess ? "Submitted!" : "Submit for Indexing ↗"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. AUTH MODAL (Prompted when user must sign in)         */}
      {/* ======================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#121214] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-[#FA5D00]">
              <Sparkles className="w-4 h-4" />
              <span>BUILDER AUTHENTICATION</span>
            </div>

            <h2 className="font-serif text-2xl font-normal text-zinc-950 dark:text-zinc-50">
              Sign in to Submit
            </h2>
            <p className="mt-1 font-sans text-xs text-zinc-500 dark:text-zinc-400">
              You must be a verified builder on Reco Labs to submit websites, tools, or resources.
            </p>

            {/* Social OAuth One-Click Buttons */}
            <div className="mt-6 space-y-2.5">
              <button
                onClick={() => networkApi.signInWithGoogle()}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border-2 border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold hover:border-[#FA5D00] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                onClick={() => networkApi.signInWithGitHub()}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border-2 border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold hover:border-[#FA5D00] transition-colors cursor-pointer"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Continue with GitHub</span>
              </button>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-white dark:bg-[#121214] px-2 text-zinc-400">or email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3 font-sans">
              {authMode === "signup" && (
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>
              )}
              <div>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#FA5D00]"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              {authError && (
                <p className="font-mono text-xs text-red-500 bg-red-500/10 p-2 rounded-lg">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {authLoading ? "Authenticating..." : authMode === "signup" ? "Create Account & Continue" : "Sign In & Continue"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                className="font-mono text-xs text-zinc-500 hover:text-[#FA5D00] underline cursor-pointer"
              >
                {authMode === "signup" ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. DIRECTORY INFO MODAL                                   */}
      {/* ======================================================== */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#121214] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-2xl font-normal text-zinc-950 dark:text-zinc-50 mb-3">
              About the Catalogue
            </h3>
            <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              Reco Labs Projects is a hand-reviewed directory of websites, interface components, AI tooling, and hardware builds created by students and open-source contributors worldwide.
            </p>
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-xs space-y-1">
              <p>● Free to submit for all signed-in builders.</p>
              <p>● Submissions are routed to the guild review queue.</p>
              <p>● 100% open-source philosophy.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ProjectsPage
