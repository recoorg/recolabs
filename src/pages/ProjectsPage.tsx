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
  Image as ImageIcon,
  Upload,
  DollarSign,
  Megaphone,
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
  thumbnailBg?: string
  visualType?: "wireframe" | "landscape" | "pixel" | "buttons" | "terminal" | "hardware" | "cyber" | "space" | "quote" | "tools" | "screenshot"
  preview_image_url?: string
  isSponsored?: boolean
  sponsoredLabel?: string
  tags: string[]
  stars?: number
  timestamp?: string
}

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
    id: "typingmind-ui",
    title: "TypingMind Canvas",
    url: "https://typingmind.com",
    category: "Inspiration",
    description: "Spring pink polysheets and the hill. Visual prompt canvases and spatial generative workspace.",
    author: "Tuan Nguyen",
    authorHandle: "tuan",
    thumbnailBg: "#f8f8f6",
    visualType: "landscape",
    tags: ["AI", "UI Craft", "Productivity"],
    stars: 512,
  },
  {
    id: "ai-ui-synthesis",
    title: "AI for UI",
    url: "https://recolabs.in/network",
    category: "Interface",
    description: "Design and build with AI. Next-generation generative tokens, components, and design systems.",
    author: "Reco AI Labs",
    authorHandle: "recolabs",
    thumbnailBg: "#121214",
    visualType: "cyber",
    isSponsored: true,
    sponsoredLabel: "Sponsored",
    tags: ["AI", "Generative", "UI"],
    stars: 489,
  },
  {
    id: "skeuo-buttons",
    title: "Tactile Neumorphic Buttons",
    url: "https://recolabs.in/projects",
    category: "Interface",
    description: "Multi-state tactile skeuomorphic button components with physical lighting and easing curves.",
    author: "Designeer Guild",
    authorHandle: "curated",
    thumbnailBg: "#e7e6e3",
    visualType: "buttons",
    tags: ["CSS", "Skeuomorphism", "Design System"],
    stars: 342,
  },
  {
    id: "celestial-pixel",
    title: "Starlight Constellation Rig",
    url: "https://github.com/recoorg",
    category: "Motion",
    description: "Interactive celestial sprite simulator with gravitational physics in deep midnight space.",
    author: "Elena Rostova",
    authorHandle: "erostova",
    thumbnailBg: "#060714",
    visualType: "space",
    tags: ["WebGL", "Motion", "Canvas"],
    stars: 275,
  },
  {
    id: "conversations-ui",
    title: "People, and the Work They Start",
    url: "https://recolabs.in",
    category: "Finds",
    description: "Simple tools for the startup. Built for real customer conversations and shared thread context.",
    author: "Dhruv Jaradi",
    authorHandle: "dhruv",
    thumbnailBg: "#ffffff",
    visualType: "quote",
    tags: ["Product", "UI", "Brutalist"],
    stars: 410,
  },
  {
    id: "shared-tools",
    title: "Your Tools. A Shared Understanding",
    url: "https://recolabs.in/network",
    category: "Resources",
    description: "Unified team context, knowledge graphs, and asynchronous collaboration pipelines.",
    author: "Tanish",
    authorHandle: "fluxstudio",
    thumbnailBg: "#ffffff",
    visualType: "tools",
    tags: ["Workflow", "Knowledge", "Async"],
    stars: 198,
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

  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)

  // Modals
  const [showSubmitModal, setShowSubmitModal] = React.useState(false)
  const [showAuthModal, setShowAuthModal] = React.useState(false)
  const [showInfoModal, setShowInfoModal] = React.useState(false)
  const [showSponsorModal, setShowSponsorModal] = React.useState(false)

  // Auth Form State
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
  const [previewImageUrl, setPreviewImageUrl] = React.useState("")
  const [submitLoading, setSubmitLoading] = React.useState(false)
  const [submitSuccess, setSubmitSuccess] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")

  // Sponsor Submission Form State
  const [sponsorForm, setSponsorForm] = React.useState({
    title: "",
    url: "",
    description: "",
    placement: "projects_sidebar",
    sponsor_name: "",
    sponsor_email: "",
  })
  const [sponsorLoading, setSponsorLoading] = React.useState(false)
  const [sponsorSuccess, setSponsorSuccess] = React.useState(false)

  // Live Real-Time Ads from Supabase
  const [liveAds, setLiveAds] = React.useState<any[]>([])
  const [sidebarAd, setSidebarAd] = React.useState<any>(null)

  const fetchLiveAds = async () => {
    try {
      const res = await fetch(`/api/network/ads?_t=${Date.now()}`)
      const data = await res.json()
      if (data.ads && Array.isArray(data.ads)) {
        setLiveAds(data.ads)
        const sAd = data.ads.find((a: any) => a.placement === "projects_sidebar" && a.is_active)
        if (sAd) {
          setSidebarAd(sAd)
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live ads:", err)
    }
  }

  React.useEffect(() => {
    fetchLiveAds()
    const timer = setInterval(fetchLiveAds, 8000)
    const onFocus = () => fetchLiveAds()
    window.addEventListener("focus", onFocus)
    return () => {
      clearInterval(timer)
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  // Sync user session
  React.useEffect(() => {
    const syncUser = () => {
      setCurrentUser(networkApi.getCurrentUser())
    }
    syncUser()
    window.addEventListener("reco_auth_changed", syncUser)
    return () => window.removeEventListener("reco_auth_changed", syncUser)
  }, [])

  // Auto screenshot preview when url changes
  const handleUrlBlur = (url: string) => {
    if (!url) return
    const formatted = url.startsWith("http") ? url : `https://${url}`
    if (!previewImageUrl) {
      // Live automated website screenshot
      const autoScreenshot = `https://s0.wp.com/mshots/v1/${encodeURIComponent(formatted)}?w=800&h=600`
      setPreviewImageUrl(autoScreenshot)
    }
  }

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewImageUrl(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

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

  // Handle Submit button click (requires login)
  const handleOpenSubmit = () => {
    if (!currentUser) {
      setAuthMode("signup")
      setShowAuthModal(true)
    } else {
      setShowSubmitModal(true)
    }
  }

  // Submit Website to Formspree endpoint & store locally
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
    const finalUrl = submitForm.url.startsWith("http") ? submitForm.url : `https://${submitForm.url}`
    const finalScreenshot = previewImageUrl || `https://s0.wp.com/mshots/v1/${encodeURIComponent(finalUrl)}?w=800&h=600`

    try {
      // Send email payload to Formspree endpoint
      await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _subject: `New Reco Labs Project Submission: ${submitForm.title}`,
          title: submitForm.title,
          url: finalUrl,
          category: submitForm.category,
          description: submitForm.description || "No description provided.",
          screenshot_url: finalScreenshot,
          submitter_name: submitterName,
          submitter_email: submitterEmail,
          submitter_username: submitterUsername,
          source: "Projects Page Catalogue Submission",
          submitted_at: new Date().toISOString(),
        }),
      })

      // Add to local projects catalog with live preview
      const newProj: CatalogProject = {
        id: `user-${Date.now()}`,
        title: submitForm.title,
        url: finalUrl,
        category: submitForm.category,
        description: submitForm.description || `Curated ${submitForm.category} project submitted by @${submitterUsername}.`,
        author: submitterName,
        authorHandle: submitterUsername,
        thumbnailBg: "#121214",
        visualType: "screenshot",
        preview_image_url: finalScreenshot,
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
        setPreviewImageUrl("")
      }, 2000)
    } catch (err: any) {
      console.warn("Formspree dispatch notice:", err)
      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        setShowSubmitModal(false)
      }, 2000)
    } finally {
      setSubmitLoading(false)
    }
  }

  // Handle Sponsor Application Submission
  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sponsorForm.title || !sponsorForm.url) return
    setSponsorLoading(true)

    try {
      // 1. Post to Formspree
      await fetch("https://formspree.io/f/mvkkrjez", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Reco Labs Sponsor Application: ${sponsorForm.title}`,
          ...sponsorForm,
          source: "Projects Page Sponsor Slot Application",
          submitted_at: new Date().toISOString(),
        }),
      })

      // 2. Post to Supabase Ads endpoint
      await fetch("/api/network/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sponsorForm.title,
          description: sponsorForm.description,
          destination_url: sponsorForm.url.startsWith("http") ? sponsorForm.url : `https://${sponsorForm.url}`,
          placement: sponsorForm.placement,
          sponsor_name: sponsorForm.sponsor_name,
          sponsor_email: sponsorForm.sponsor_email,
        }),
      }).catch(() => {})

      confetti({ particleCount: 90, spread: 60, origin: { y: 0.5 } })
      setSponsorSuccess(true)
      setTimeout(() => {
        setSponsorSuccess(false)
        setShowSponsorModal(false)
        setSponsorForm({
          title: "",
          url: "",
          description: "",
          placement: "projects_sidebar",
          sponsor_name: "",
          sponsor_email: "",
        })
      }, 2000)
    } finally {
      setSponsorLoading(false)
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

  // Merge live sponsors from Supabase into project feed
  const allProjects = React.useMemo(() => {
    const liveSponsors: CatalogProject[] = liveAds
      .filter((a) => a.is_active && (a.placement === "projects_card" || a.placement === "all"))
      .map((a) => ({
        id: `live-ad-${a.id}`,
        title: a.title,
        url: a.destination_url,
        category: "Interface" as const,
        description: a.description || "Sponsored showcase in the Reco Labs curated ecosystem.",
        author: a.sponsor_name || "Reco Sponsor",
        authorHandle: "sponsor",
        thumbnailBg: "#121214",
        visualType: "cyber" as const,
        preview_image_url: a.image_url || undefined,
        isSponsored: true,
        sponsoredLabel: a.badge_label || "Sponsored",
        tags: ["Sponsored", a.badge_label || "Featured"],
        stars: (a.clicks_count || 0) + 120,
      }))

    // Deduplicate against existing static projects
    const combined = [
      ...liveSponsors,
      ...projects.filter((p) => !liveSponsors.some((s) => s.title.toLowerCase() === p.title.toLowerCase())),
    ]
    return combined
  }, [projects, liveAds])

  // Filter projects
  const filteredProjects = allProjects.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category.toLowerCase() === activeCategory.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFav = !showFavoritesOnly || favorites.includes(p.id)
    return matchesCategory && matchesSearch && matchesFav
  })

  // Render stylized visual mockup preview inside the card matching screenshot
  const renderVisualMockup = (p: CatalogProject) => {
    // If card has an uploaded screenshot or preview image
    if (p.preview_image_url) {
      return (
        <div className="w-full h-full relative overflow-hidden bg-zinc-950 group-hover:scale-105 transition-transform duration-300">
          <img
            src={p.preview_image_url}
            alt={p.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
            className="w-full h-full object-cover object-top"
          />
        </div>
      )
    }

    switch (p.visualType) {
      case "wireframe":
        return (
          <div className="w-full h-full flex items-center justify-center bg-[#0d0d10] p-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            {/* Crosshair grid lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-zinc-800/80" />
              <div className="h-full w-[1px] bg-zinc-800/80 absolute" />
            </div>
            {/* Intricate Wireframe numeral 1 */}
            <div className="relative z-10 select-none flex items-center justify-center">
              <svg viewBox="0 0 100 120" className="w-24 h-28 stroke-zinc-200 fill-none" strokeWidth="1.2">
                <path d="M 40 30 C 45 28 50 20 54 16 L 56 16 L 56 100 M 35 100 L 70 100" strokeDasharray="3 2" />
                <path d="M 38 32 Q 48 24 54 18 L 54 98 M 38 98 L 68 98" />
                <path d="M 42 34 C 47 30 52 24 55 20 M 52 22 L 52 96" strokeWidth="0.8" strokeDasharray="1 1.5" />
                <circle cx="54" cy="18" r="2" fill="white" />
                <circle cx="56" cy="100" r="2.5" fill="white" />
                <circle cx="35" cy="100" r="2" fill="white" />
                <circle cx="70" cy="100" r="2" fill="white" />
              </svg>
            </div>
          </div>
        )
      case "landscape":
        return (
          <div className="w-full h-full flex flex-col justify-between bg-[#faf9f5] text-zinc-800 p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="text-center font-mono text-[9px] text-zinc-500 leading-tight">
              <span className="block font-bold text-zinc-700">TypingMind Canvas</span>
              <span>spring - pink polysheets and the hill</span>
            </div>
            <div className="relative my-2 w-full flex-1 rounded-xl overflow-hidden border border-zinc-200/80 bg-gradient-to-b from-sky-200 via-emerald-100 to-emerald-200 flex flex-col justify-end p-2 shadow-inner">
              <div className="absolute top-2 right-4 w-6 h-6 rounded-full bg-amber-200/60 blur-xs" />
              <div className="relative z-10 flex items-center justify-center gap-1.5 flex-wrap">
                {["🌸", "🪷", "🌸", "🌺", "🌸"].map((flower, i) => (
                  <span key={i} className="text-base drop-shadow-sm animate-pulse">{flower}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1 border-t border-zinc-200/60">
              <span className="w-5 h-3.5 rounded bg-pink-200 border border-pink-300" />
              <span className="w-5 h-3.5 rounded bg-emerald-200 border border-emerald-300" />
              <span className="w-5 h-3.5 rounded bg-sky-200 border border-sky-300" />
            </div>
          </div>
        )
      case "cyber":
        return (
          <div className="w-full h-full flex flex-col justify-between bg-[#121215] p-5 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 p-3 shadow-xl flex items-center justify-center relative">
                <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-cyan-950/40 rounded-xl">
                  {[...Array(16)].map((_, i) => (
                    <span
                      key={i}
                      className={`rounded-xs ${
                        [5, 6, 9, 10, 1, 14].includes(i) ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "bg-cyan-900/40"
                      }`}
                    />
                  ))}
                </div>
                <span className="absolute font-serif italic text-2xl font-bold text-white select-none">e</span>
              </div>
            </div>
            <div className="flex items-end justify-between pt-2">
              <div>
                <h4 className="font-mono text-xs font-bold text-white leading-none">AI for UI</h4>
                <p className="text-[10px] font-sans text-zinc-400 mt-0.5">Design and build with AI</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </div>
        )
      case "buttons":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#e7e6e2] p-6 relative group-hover:scale-105 transition-transform duration-300 select-none">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div className="px-5 py-2.5 rounded-xl bg-[#e7e6e2] shadow-[3px_3px_8px_rgba(0,0,0,0.12),-3px_-3px_8px_rgba(255,255,255,0.9)] font-sans text-xs font-semibold text-zinc-800 border border-white/50 active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15)]">
                  Button
                </div>
                <span className="font-mono text-[10px] text-zinc-500">click</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="px-5 py-2.5 rounded-xl bg-[#e7e6e2] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.12),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] font-sans text-xs font-semibold text-zinc-500 border border-zinc-300/40">
                  Button
                </div>
                <span className="font-mono text-[10px] text-zinc-500">loading</span>
              </div>
            </div>
          </div>
        )
      case "space":
        return (
          <div className="w-full h-full flex items-center justify-center bg-[#070814] p-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 select-none">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-60" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="grid grid-cols-6 gap-1 w-20 h-10">
                {[...Array(24)].map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-xs ${
                      [2, 3, 7, 8, 9, 13, 14, 15, 20].includes(i)
                        ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]"
                        : [1, 10, 16, 21].includes(i)
                        ? "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]"
                        : "opacity-0"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      case "quote":
        return (
          <div className="w-full h-full flex flex-col justify-between bg-white text-zinc-900 p-5 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="text-center font-sans">
              <h4 className="font-serif text-sm font-normal text-zinc-950">People, and the work they start.</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">Simple tools for the startup.</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 shadow-xs text-[10px] text-zinc-700 font-sans leading-relaxed">
              <p className="italic">"The references and the reason we chose a direction stay with the work."</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center font-bold">R</span>
                <span className="w-3.5 h-3.5 rounded-full bg-purple-500 text-[8px] text-white flex items-center justify-center font-bold">A</span>
                <span className="text-[9px] font-mono text-zinc-400 ml-1">2 replies</span>
              </div>
            </div>
          </div>
        )
      case "tools":
        return (
          <div className="w-full h-full flex flex-col justify-between bg-white text-zinc-900 p-5 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-zinc-900 text-white font-mono text-[9px] font-bold flex items-center justify-center">M</div>
              <div>
                <h4 className="font-serif text-xs font-normal text-zinc-950">Your tools. A shared understanding.</h4>
                <p className="text-[9px] text-zinc-400">Everything stays in context.</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 font-mono text-[10px] text-zinc-500 flex items-center justify-between">
              <span>● Canvas Graph Active</span>
              <span className="text-[#FA5D00] font-bold">Sync ↗</span>
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

  // Sidebar Inner Content Component (Reusable for Desktop & Mobile Drawer)
  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full select-none">
      <div>
        {/* Brand & Subtitle */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
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
          {/* Mobile close button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
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
                    setMobileSidebarOpen(false)
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

        {/* Collections & Actions */}
        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-2 px-2">
            Collections
          </span>
          <div className="space-y-1 font-mono text-xs">
            <button
              onClick={() => {
                setActiveCategory("All")
                setShowFavoritesOnly(false)
                setMobileSidebarOpen(false)
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
              onClick={() => {
                setShowFavoritesOnly(true)
                setMobileSidebarOpen(false)
              }}
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
              onClick={() => {
                setMobileSidebarOpen(false)
                handleOpenSubmit()
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-[#FA5D00] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Website</span>
            </button>
            <button
              onClick={() => {
                setMobileSidebarOpen(false)
                setShowSponsorModal(true)
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg text-[#FA5D00] hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>+ Add Sponsor Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Bottom Promo Card (Live from Supabase) */}
      <div className="mt-8 pt-4">
        <div className="p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shadow-sm relative group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-[#FA5D00] text-black font-mono font-bold text-xs flex items-center justify-center flex-none">
              {((sidebarAd?.sponsor_name || sidebarAd?.title || "B")[0] || "B").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-mono text-xs font-bold leading-none truncate">
                {sidebarAd?.title || "BoardUI"}
              </h4>
              <span className="text-[9px] uppercase font-mono text-zinc-400">
                {sidebarAd?.badge_label || "Sponsored"}
              </span>
            </div>
          </div>
          <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-2">
            {sidebarAd?.description || "Tables, charts and agent-interface components in a React and Tailwind system."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <a
              href={sidebarAd?.destination_url || "https://recolabs.in/projects"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (sidebarAd?.id) {
                  fetch("/api/network/ads/click", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: sidebarAd.id }),
                  }).catch(() => {})
                }
              }}
              className="flex-1 text-center py-1.5 px-3 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono text-[11px] font-bold hover:bg-[#FA5D00] dark:hover:bg-[#FA5D00] dark:hover:text-black transition-colors"
            >
              Visit site ↗
            </a>
            <button
              onClick={() => setShowSponsorModal(true)}
              title="Sponsor this sidebar slot"
              className="p-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:border-[#FA5D00] text-zinc-500 hover:text-[#FA5D00] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="mt-4 font-mono text-[10px] text-zinc-400 text-center">
          Curated by Reco Labs · © 2026
        </p>
      </div>
    </div>
  )

  return (
    <div className="relative w-full h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col pt-20 overflow-hidden">
      
      {/* App Body: Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        
        {/* ======================================================== */}
        {/* 1. DESKTOP LEFT SIDEBAR                                  */}
        {/* ======================================================== */}
        <aside className="hidden md:flex w-64 lg:w-72 flex-none border-r border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md p-5 flex-col justify-between h-full overflow-y-auto sliderbar">
          {renderSidebarContent()}
        </aside>

        {/* ======================================================== */}
        {/* 2. MOBILE RESPONSIVE SIDEBAR DRAWER                      */}
        {/* ======================================================== */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-start animate-in fade-in duration-200">
            <div className="w-72 max-w-[85vw] h-full bg-white dark:bg-[#0c0c0e] p-5 shadow-2xl border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto sliderbar animate-in slide-in-from-left duration-200">
              {renderSidebarContent()}
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. MAIN CATALOGUE AREA (Fixed Header + Scrollable Cards) */}
        {/* ======================================================== */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          
          {/* Permanently Fixed Top Control Bar (Never hides behind Navbar!) */}
          <div className="flex-none z-20 flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-8 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md shadow-xs">
            
            {/* Left Controls & Mobile Toggle */}
            <div className="flex items-center gap-2">
              {/* Mobile Sidebar Hamburger Trigger */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-semibold hover:border-[#FA5D00] transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FA5D00]" />
                <span className="hidden xs:inline">Browse</span>
              </button>

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
                <span className="hidden sm:inline">Favourites</span>
                <span>({favorites.length})</span>
              </button>
            </div>

            {/* Center Search Input */}
            <div className="relative flex-1 max-w-xs sm:max-w-md mx-2 min-w-[140px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, AI, hardware..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00] transition-colors"
              />
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSponsorModal(true)}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:border-[#FA5D00] font-mono text-xs font-semibold text-[#FA5D00] transition-colors cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>+ Sponsor</span>
              </button>

              <button
                onClick={handleOpenSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* Scrollable Bottom Content Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-32 sliderbar">
            
            {/* Central Hero Headline (Matching designeer.xyz) */}
            <div className="pt-10 pb-8 text-center max-w-3xl mx-auto">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight leading-tight">
                Designeer is a curated catalogue for designers and developers<span className="text-[#FA5D00]">.</span>
              </h1>
              <p className="mt-4 font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Design Inspiration, UI resources, tools and portfolios, each reviewed by hand. Below, the latest visual work picked from across the web.
              </p>
            </div>

            {/* Filter Chips Toolbar */}
            <div className="py-4 flex flex-wrap items-center justify-between gap-4 border-y border-zinc-200 dark:border-zinc-800">
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

              {/* Right Sort Controls */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={() => setSelectedSort(selectedSort === "recent" ? "stars" : "recent")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-[#FA5D00] transition-colors cursor-pointer"
                >
                  <span>{selectedSort === "recent" ? "Recent ⌵" : "Popular ⌵"}</span>
                </button>
              </div>
            </div>

            {/* Project Cards Grid */}
            <div className="pt-8">
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

                  {/* Dedicated Sponsor Slot Card */}
                  <div
                    onClick={() => setShowSponsorModal(true)}
                    className="relative rounded-3xl border-2 border-dashed border-[#FA5D00]/50 hover:border-[#FA5D00] bg-[#FA5D00]/5 p-6 flex flex-col justify-between items-center text-center cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#FA5D00] text-black flex items-center justify-center shadow-md mb-4 mt-6">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#FA5D00]">
                        SPONSOR SPOTLIGHT
                      </span>
                      <h3 className="font-serif text-xl font-normal text-zinc-950 dark:text-zinc-50 mt-1">
                        Feature Your Project or Tool
                      </h3>
                      <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs">
                        Reach thousands of young builders, students, and engineers actively building the future.
                      </p>
                    </div>
                    <button className="mt-6 px-5 py-2 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider shadow-sm">
                      + Add Sponsor Slot
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* 4. SUBMIT WEBSITE MODAL (Gated by Auth + Photo Preview)  */}
      {/* ======================================================== */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#121214] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-semibold text-[#FA5D00]">
              <Sparkles className="w-4 h-4" />
              <span>CURATED DIRECTORY SUBMISSION</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950 dark:text-zinc-50">
              Submit a Website or Tool
            </h2>
            <p className="mt-1 font-sans text-xs text-zinc-500 dark:text-zinc-400">
              Submitting as <strong className="text-zinc-900 dark:text-zinc-100">@{currentUser?.username || "builder"}</strong> ({currentUser?.email}).
            </p>

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
                  placeholder="e.g. Acme Studio"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Website URL *
                </label>
                <input
                  type="text"
                  required
                  value={submitForm.url}
                  onChange={(e) => setSubmitForm({ ...submitForm, url: e.target.value })}
                  onBlur={(e) => handleUrlBlur(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              {/* Photo Preview & Upload */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Site Preview Photo (Auto-detected or Upload)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex items-center justify-center flex-none">
                    {previewImageUrl ? (
                      <img src={previewImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-zinc-400 dark:border-zinc-600 hover:border-[#FA5D00] text-zinc-600 dark:text-zinc-300 font-mono text-xs text-center justify-center transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Screenshot</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={submitForm.category}
                  onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Description / One-liner
                </label>
                <textarea
                  rows={2}
                  value={submitForm.description}
                  onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                  placeholder="What does your product solve?"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 font-mono text-xs text-red-500">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-500 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Submission dispatched to guild review queue!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitLoading || submitSuccess}
                className="w-full py-3 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {submitLoading ? "Transmitting..." : "Submit for Indexing"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ADD SPONSOR MODAL                                     */}
      {/* ======================================================== */}
      {showSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#121214] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowSponsorModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-semibold text-[#FA5D00]">
              <Megaphone className="w-4 h-4" />
              <span>SPONSORSHIP & ADVERTISING</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950 dark:text-zinc-50">
              Sponsor Reco Projects
            </h2>
            <p className="mt-1 font-sans text-xs text-zinc-500 dark:text-zinc-400">
              Promote your developer platform, hardware board, or startup directly to builders.
            </p>

            <form onSubmit={handleSponsorSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Product / Sponsor Title *
                </label>
                <input
                  type="text"
                  required
                  value={sponsorForm.title}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, title: e.target.value })}
                  placeholder="e.g. BoardUI"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  value={sponsorForm.url}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, url: e.target.value })}
                  placeholder="https://yourproduct.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Placement Slot
                </label>
                <select
                  value={sponsorForm.placement}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, placement: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                >
                  <option value="projects_sidebar">Projects Sidebar (BoardUI slot)</option>
                  <option value="projects_card">Projects Catalogue Card</option>
                  <option value="home_hero">Home Page Hero Banner</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                  Short Tagline
                </label>
                <textarea
                  rows={2}
                  value={sponsorForm.description}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })}
                  placeholder="Tables, charts and components in React and Tailwind."
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                    Your Name / Company
                  </label>
                  <input
                    type="text"
                    value={sponsorForm.sponsor_name}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, sponsor_name: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={sponsorForm.sponsor_email}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, sponsor_email: e.target.value })}
                    placeholder="sponsor@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>
              </div>

              {sponsorSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-500 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Sponsorship application received! We will follow up immediately.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={sponsorLoading || sponsorSuccess}
                className="w-full py-3 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {sponsorLoading ? "Submitting..." : "Apply for Sponsorship"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. QUICK AUTH MODAL                                      */}
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

            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-semibold text-[#FA5D00]">
              <UserCheck className="w-4 h-4" />
              <span>BUILDER AUTHENTICATION</span>
            </div>
            <h2 className="font-serif text-2xl font-normal text-zinc-950 dark:text-zinc-50">
              {authMode === "signup" ? "Join the Directory" : "Founder Sign In"}
            </h2>
            <p className="mt-1 font-sans text-xs text-zinc-500 dark:text-zinc-400">
              Sign in to curate, showcase, and submit projects to the catalogue.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => networkApi.signInWithGoogle()}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-mono text-xs font-semibold hover:border-[#FA5D00] transition-colors"
              >
                <span>Google</span>
              </button>
              <button
                onClick={() => networkApi.signInWithGitHub()}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-mono text-xs font-semibold hover:border-[#FA5D00] transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </button>
            </div>

            <div className="my-4 flex items-center gap-2">
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              <span className="font-mono text-[10px] text-zinc-400 uppercase">Or email</span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3 font-mono text-xs">
              {authMode === "signup" && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Aditya Raj"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="builder@recolabs.in"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              {authError && (
                <p className="text-red-500 text-[11px] font-sans">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-full bg-[#FA5D00] text-black font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {authLoading ? "Authenticating..." : authMode === "signup" ? "Sign Up & Continue" : "Sign In & Continue"}
              </button>
            </form>

            <div className="mt-4 text-center font-mono text-[11px] text-zinc-500">
              {authMode === "signup" ? "Already registered? " : "New to Reco Labs? "}
              <button
                onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                className="underline text-[#FA5D00] font-bold cursor-pointer"
              >
                {authMode === "signup" ? "Sign in" : "Create account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
