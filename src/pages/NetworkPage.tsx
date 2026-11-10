"use client"

import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import confetti from "canvas-confetti"
import {
  Rocket,
  Search,
  ExternalLink,
  Plus,
  Phone,
  Globe,
  Mail,
  MessageSquare,
  User,
  Edit3,
  ChevronDown,
  LogIn,
  LogOut,
  X,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
  Flame,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Building2,
  Terminal,
  Filter,
  Briefcase,
  Layers,
  Award,
  Star,
  Bookmark,
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Share2,
  PlusSquare,
} from "lucide-react"
import { GithubIcon } from "@/components/icons"
import { StartupFavicon } from "@/components/StartupFavicon"
import { networkApi, type UserProfile, type StartupItem, type BuilderProfileWithStats } from "@/services/networkApi"
import { usePageMeta } from "@/hooks/usePageMeta"
import { StartupScreenshotModal } from "@/components/StartupScreenshotModal"
import { StartupPromoteModal } from "@/components/StartupPromoteModal"
import { ProfileUpgradeModal } from "@/components/ProfileUpgradeModal"
import { VerifiedBadge } from "@/components/VerifiedBadge"
import { NetworkAvatarCloud } from "@/components/NetworkAvatarCloud"
import { askGeminiForStartup, inspectLinkMetadata, type AiStartupSuggestion } from "@/services/geminiAiService"

const CATEGORIES = ["ALL", "Software", "Hardware", "Security", "AI", "Education & Tooling"]

export function NetworkPage() {
  usePageMeta({
    title: "Founder Network & Startup Launchpad | Reco Labs (recolabs.in)",
    description: "The professional builder launchpad on Reco Labs (recolabs.in). Discover early-stage startups, submit functional reviews on idea/execution/design, and connect with peer founders.",
    image: "/twitter-network.png",
  })

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null)
  const [startups, setStartups] = React.useState<StartupItem[]>(() => {
    try {
      const saved = localStorage.getItem("reco_cached_startups")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [loading, setLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("ALL")
  const [builders, setBuilders] = React.useState<BuilderProfileWithStats[]>(() => {
    try {
      const saved = localStorage.getItem("reco_cached_builders")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [activeDirectoryTab, setActiveDirectoryTab] = React.useState<"startups" | "builders">("startups")


  // Modals & Panels
  const [showAuthModal, setShowAuthModal] = React.useState(false)
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("signup")
  const [showPostModal, setShowPostModal] = React.useState(false)
  const [showProfileModal, setShowProfileModal] = React.useState(false)
  const [screenshotStartup, setScreenshotStartup] = React.useState<StartupItem | null>(null)
  const [promoteStartup, setPromoteStartup] = React.useState<StartupItem | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)

  // Selected Startup for Peerlist Launchpad Detail Modal
  const [selectedStartup, setSelectedStartup] = React.useState<StartupItem | null>(null)
  const [startupComments, setStartupComments] = React.useState<any[]>([])
  const [loadingComments, setLoadingComments] = React.useState(false)
  const [commentText, setCommentText] = React.useState("")
  const [submittingComment, setSubmittingComment] = React.useState(false)
  const [commentSuccessMsg, setCommentSuccessMsg] = React.useState("")
  const [copiedLinkNotice, setCopiedLinkNotice] = React.useState(false)

  // Functional Ratings State (Real Database Numbers Only)
  const [startupRatings, setStartupRatings] = React.useState<{
    totalRatings: number
    overall: number
    idea: number
    execution: number
    design: number
  }>({
    totalRatings: 0,
    overall: 0,
    idea: 0,
    execution: 0,
    design: 0,
  })
  const [showRatingInput, setShowRatingInput] = React.useState(false)
  const [userRatingScores, setUserRatingScores] = React.useState({
    idea: 5,
    execution: 5,
    design: 5,
  })
  const [submittingRating, setSubmittingRating] = React.useState(false)
  const [ratingSubmittedNotice, setRatingSubmittedNotice] = React.useState(false)

  // Gemini AI Search State
  const [aiStartupSuggestion, setAiStartupSuggestion] = React.useState<AiStartupSuggestion | null>(null)
  const [aiSearching, setAiSearching] = React.useState(false)
  const [aiSearchError, setAiSearchError] = React.useState<string | null>(null)

  const handleAiStartupSearch = async () => {
    if (!searchQuery.trim() || aiSearching) return
    setAiSearching(true)
    setAiSearchError(null)
    try {
      const suggestion = await askGeminiForStartup(searchQuery, startups)
      setAiStartupSuggestion(suggestion)
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#FA5D00", "#FA5D00", "#ffffff"],
      })
    } catch (err: any) {
      setAiSearchError(err.message || "Failed to generate AI suggestion.")
    } finally {
      setAiSearching(false)
    }
  }

  // Link Inspection State for Project Posting
  const [inspectingLink, setInspectingLink] = React.useState(false)
  const [inspectNotice, setInspectNotice] = React.useState<string | null>(null)

  const handleInspectUrl = async (urlToInspect: string) => {
    const trimmed = urlToInspect.trim()
    if (!trimmed || trimmed.length < 4) return
    setInspectingLink(true)
    setInspectNotice(null)
    try {
      const data = await inspectLinkMetadata(trimmed)
      if (data && data.success) {
        setStartupForm((prev) => ({
          ...prev,
          name: prev.name || data.title || "",
          problem_solving: prev.problem_solving || data.problem_solving || "",
          category: data.category || prev.category,
        }))
        setInspectNotice("✨ Auto-filled project details & category from link!")
        setTimeout(() => setInspectNotice(null), 4000)
      }
    } catch (err) {
      console.warn("Link metadata inspect notice:", err)
    } finally {
      setInspectingLink(false)
    }
  }
  const [favorites, setFavorites] = React.useState<number[]>(() => {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(localStorage.getItem("reco_startup_favorites") || "[]")
    } catch {
      return []
    }
  })

  const filteredStartups = React.useMemo(() => {
    return startups.filter((item) => {
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = item.name?.toLowerCase().includes(q)
        const matchesProblem = item.problem_solving?.toLowerCase().includes(q)
        const matchesFounder = item.founder_name?.toLowerCase().includes(q)
        const matchesCat = item.category?.toLowerCase().includes(q)
        const matchesUrl = item.url?.toLowerCase().includes(q)
        return Boolean(matchesName || matchesProblem || matchesFounder || matchesCat || matchesUrl)
      }
      return true
    })
  }, [startups, selectedCategory, searchQuery])

  const selectStartupWithUrl = React.useCallback((item: StartupItem | null) => {
    setSelectedStartup(item)
    setShowRatingInput(false)
    if (item?.id) {
      navigate({ search: `?s=${item.id}` }, { replace: true })
    } else {
      navigate({ search: "" }, { replace: true })
    }
  }, [navigate])

  // Deep-link check on startup load or URL change
  React.useEffect(() => {
    const sParam = searchParams.get("s") || searchParams.get("startup")
    if (!sParam || startups.length === 0) return
    const match = startups.find((s) => String(s.id) === String(sParam))
    if (match && (!selectedStartup || String(selectedStartup.id) !== String(match.id))) {
      setSelectedStartup(match)
    }
  }, [searchParams, startups])

  // Load comments & ratings when selectedStartup changes
  React.useEffect(() => {
    if (!selectedStartup?.id) {
      setStartupComments([])
      setCommentSuccessMsg("")
      return
    }
    setLoadingComments(true)
    Promise.all([
      networkApi.getStartupComments(selectedStartup.id),
      networkApi.getStartupRatings(selectedStartup.id),
    ]).then(([comments, ratings]) => {
      setStartupComments(comments || [])
      setStartupRatings(ratings || { totalRatings: 0, overall: 0, idea: 0, execution: 0, design: 0 })
      setLoadingComments(false)
    })
  }, [selectedStartup?.id])

  // Navigation indices for Prev / Next arrows
  const currentStartupIndex = React.useMemo(() => {
    if (!selectedStartup) return -1
    return startups.findIndex((s) => String(s.id) === String(selectedStartup.id))
  }, [selectedStartup, startups])

  const prevStartup = currentStartupIndex > 0 ? startups[currentStartupIndex - 1] : null
  const nextStartup = currentStartupIndex >= 0 && currentStartupIndex < startups.length - 1 ? startups[currentStartupIndex + 1] : null

  const handlePostStartupComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      setShowAuthModal(true)
      return
    }
    if (!selectedStartup?.id || !commentText.trim() || submittingComment) return
    setSubmittingComment(true)
    const authorName = currentUser?.name || "Curious Builder"
    const authorUsername = currentUser?.username || undefined
    const authorAvatar = currentUser?.avatar_url || undefined

    const res = await networkApi.addStartupComment(selectedStartup.id, {
      content: commentText.trim(),
      authorName,
      authorUsername,
      authorAvatar,
    })
    if (res.success && res.comment) {
      setStartupComments((prev) => [res.comment, ...prev])
      setCommentText("")
      setCommentSuccessMsg("Feedback posted!")
      setTimeout(() => setCommentSuccessMsg(""), 3000)
    }
    setSubmittingComment(false)
  }

  const handleSubmitRating = async () => {
    if (!selectedStartup?.id || submittingRating) return
    setSubmittingRating(true)
    const res = await networkApi.submitStartupRating(selectedStartup.id, userRatingScores)
    if (res.success && res.ratings) {
      setStartupRatings(res.ratings)
      setRatingSubmittedNotice(true)
      setShowRatingInput(false)
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } })
      setTimeout(() => setRatingSubmittedNotice(false), 3000)
    }
    setSubmittingRating(false)
  }

  const toggleFavoriteStartup = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      localStorage.setItem("reco_startup_favorites", JSON.stringify(next))
      return next
    })
  }

  const handleCopyStartupShareLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedStartup) return
    const url = `https://recolabs.in/network?s=${selectedStartup.id}`
    navigator.clipboard.writeText(url)
    setCopiedLinkNotice(true)
    setTimeout(() => setCopiedLinkNotice(false), 2500)
  }

  // Auth Form State (Social links removed per request)
  const [authForm, setAuthForm] = React.useState({
    name: "",
    username: "",
    email: "",
    password: "",
  })
  const [authLoading, setAuthLoading] = React.useState(false)
  const [authError, setAuthError] = React.useState("")

  // Startup Post Form State
  const [startupForm, setStartupForm] = React.useState({
    name: "",
    url: "",
    problem_solving: "",
    category: "Software",
    stage: "Prototype",
    founder_name: "",
    founder_phone: "",
    founder_website: "",
    founder_discord: "",
  })
  const [postLoading, setPostLoading] = React.useState(false)
  const [postError, setPostError] = React.useState("")

  // Profile Edit State
  const [profileForm, setProfileForm] = React.useState({
    name: "",
    username: "",
    phone: "",
    website: "",
    bio: "",
    discord: "",
  })
  const [profileLoading, setProfileLoading] = React.useState(false)
  const [profileSuccess, setProfileSuccess] = React.useState(false)

  // Peerlist-style Hero State
  const [claimUsername, setClaimUsername] = React.useState("")
  const [showLiveReport, setShowLiveReport] = React.useState(false)
  const [networkStats, setNetworkStats] = React.useState<{
    totalBuilders: number
    totalStartups: number
    queryTimeMs: number
    indexStatus: string
    builders: any[]
  }>({
    totalBuilders: 0,
    totalStartups: 0,
    queryTimeMs: 0.045,
    indexStatus: "active (7 indexes, zero sequential scans)",
    builders: [],
  })

  // Load Session and Startups
  React.useEffect(() => {
    const syncSession = () => {
      const user = networkApi.getCurrentUser()
      if (user) {
        setCurrentUser(user)
        setProfileForm({
          name: user.name || "",
          username: user.username || "",
          phone: user.phone || "",
          website: user.website || "",
          bio: user.bio || "",
          discord: user.discord || "",
        })
        setStartupForm((prev) => ({
          ...prev,
          founder_name: user.name || "",
          founder_phone: user.phone || "",
          founder_website: user.website || "",
          founder_discord: user.discord || "",
        }))
      }
    }

    // Check if OAuth redirected back with access token hash
    networkApi.handleOAuthCallback().then((res) => {
      if (res?.user) {
        setCurrentUser(res.user)
        syncSession()
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
      }
    })

    syncSession()
    window.addEventListener("reco_auth_changed", syncSession)
    loadStartups()

    // Fetch live network builders and statistics
    networkApi.getBuilders().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setBuilders(list)
        try {
          localStorage.setItem("reco_cached_builders", JSON.stringify(list))
        } catch {}
      }
    })

    networkApi.getNetworkStats().then((data) => {
      if (data) {
        setNetworkStats(data)
      }
    })

    return () => {
      window.removeEventListener("reco_auth_changed", syncSession)
    }
  }, [])

  // Auto-trigger signup or login modal if navigated with query params or custom event
  React.useEffect(() => {
    const isLogin = searchParams.get("auth") === "login" || searchParams.get("login") === "true"
    const shouldSignup = searchParams.get("signup") === "true" || searchParams.get("auth") === "signup"
    const prefillEmail = (searchParams.get("email") || "").trim()

    if (isLogin) {
      if (prefillEmail) {
        setAuthForm((prev) => ({ ...prev, email: prefillEmail }))
      }
      setAuthMode("login")
      setShowAuthModal(true)
    } else if (shouldSignup || prefillEmail) {
      if (prefillEmail) {
        setAuthForm((prev) => ({ ...prev, email: prefillEmail }))
      }
      setAuthMode("signup")
      setShowAuthModal(true)
    }
  }, [searchParams])

  // Global event listener to open login / signup modal from anywhere (e.g. Navbar)
  React.useEffect(() => {
    const handleOpenAuth = (e: any) => {
      const mode = e?.detail?.mode === "signup" ? "signup" : "login"
      setAuthMode(mode)
      setShowAuthModal(true)
    }
    window.addEventListener("reco_open_auth", handleOpenAuth)
    return () => window.removeEventListener("reco_open_auth", handleOpenAuth)
  }, [])

  const handleClaimUsername = (override?: string) => {
    const raw = (override || claimUsername).trim().toLowerCase().replace(/[^a-z0-9_-]/g, "")
    if (!raw) return

    if (currentUser) {
      navigate(`/builder/${raw}`)
      return
    }

    setAuthForm((prev) => ({ ...prev, username: raw }))
    setAuthMode("signup")
    setShowAuthModal(true)
  }

  const loadStartups = async () => {
    try {
      if (startups.length === 0) setLoading(true)
      const data = await networkApi.getStartups({
        search: searchQuery,
        category: selectedCategory,
      })
      setStartups(data)
      try {
        localStorage.setItem("reco_cached_startups", JSON.stringify(data))
      } catch {}
    } catch (err: any) {
      console.error("Failed to load startups:", err)
    } finally {
      setLoading(false)
    }
  }

  // Trigger search on query/category change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadStartups()
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory])

  // Handle Auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    setAuthLoading(true)
    try {
      if (authMode === "signup") {
        const res = await networkApi.signUp(authForm)
        setCurrentUser(res.user)
        setShowAuthModal(false)
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
        // Redirect directly to their builder profile with edit modal open
        navigate(`/builder/${res.user.username}?edit=true`)
        return
      } else {
        const res = await networkApi.login({
          email: authForm.email,
          password: authForm.password,
        })
        setCurrentUser(res.user)
        setShowAuthModal(false)
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed.")
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle Logout
  const handleLogout = () => {
    networkApi.logout()
    setCurrentUser(null)
  }

  // Handle Post Startup
  const handlePostStartup = async (e: React.FormEvent) => {
    e.preventDefault()
    setPostError("")
    if (!startupForm.name || !startupForm.url || !startupForm.problem_solving) {
      setPostError("Please fill out Name, URL, and Problem Solving.")
      return
    }

    setPostLoading(true)
    try {
      const created = await networkApi.createStartup({
        ...startupForm,
        founder_name: startupForm.founder_name || currentUser?.name || "Anonymous",
        founder_phone: startupForm.founder_phone || currentUser?.phone || undefined,
        founder_website: startupForm.founder_website || currentUser?.website || undefined,
        founder_discord: startupForm.founder_discord || currentUser?.discord || undefined,
      })
      setStartups((prev) => [created, ...prev])
      setShowPostModal(false)
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } })
      // Reset form
      setStartupForm({
        name: "",
        url: "",
        problem_solving: "",
        category: "Software",
        stage: "Prototype",
        founder_name: currentUser?.name || "",
        founder_phone: currentUser?.phone || "",
        founder_website: currentUser?.website || "",
        founder_discord: currentUser?.discord || "",
      })
    } catch (err: any) {
      setPostError(err.message || "Failed to post startup.")
    } finally {
      setPostLoading(false)
    }
  }

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const updated = await networkApi.updateProfile(profileForm)
      setCurrentUser(updated)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 2000)
    } catch (err: any) {
      console.error(err)
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className="relative w-full pt-28 sm:pt-32 pb-24 px-4 sm:px-8 bg-transparent overflow-hidden">
      {/* Seamless ambient blurred glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#FA5D00]/[0.025] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        
        {/* ======================================================== */}
        {/* 1. MINIMAL ANIMATED HERO SECTION (Responsive & Clean)    */}
        {/* ======================================================== */}
        <div className="relative pt-2 pb-8 sm:pb-10 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl space-y-3">
              {/* Minimal Editorial Title */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight leading-[1.08]">
                Ship with pride<span className="text-[#FA5D00]">.</span>
                <br />
                <span className="italic font-light text-zinc-500 dark:text-zinc-400">
                  Backed by peer proof.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                Curated open-source software, indie products, and hardware from verified builders. Discover tools, evaluate on Idea, Execution & Design, and connect directly.
              </p>

              {/* Guest Claim Strip (Only if not logged in) */}
              {!currentUser && (
                <div className="pt-2 flex flex-wrap items-center gap-2.5 font-mono text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs focus-within:border-[#FA5D00] transition-colors">
                    <span className="text-zinc-400 text-[11px] select-none">recolabs.in/builder/</span>
                    <input
                      type="text"
                      value={claimUsername}
                      onChange={(e) => setClaimUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleClaimUsername()
                      }}
                      placeholder="yourname"
                      className="w-24 sm:w-28 bg-transparent font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleClaimUsername()}
                      className="w-5 h-5 rounded-full bg-[#FA5D00] text-white flex items-center justify-center hover:bg-[#ff7524] active:scale-95 transition-all cursor-pointer"
                      title="Claim builder profile"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login")
                      setShowAuthModal(true)
                    }}
                    className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-[#FA5D00] bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold transition-all cursor-pointer text-xs"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Directory Switcher Tabs: Projects & Builders (NO NUMBERS!) */}
            <div className="flex-none self-start lg:self-end">
              <div className="inline-flex items-center p-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveDirectoryTab("startups")}
                  className={`px-4 py-2 rounded-full font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeDirectoryTab === "startups"
                      ? "bg-[#FA5D00] text-white shadow-sm font-black"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                  }`}
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Projects</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDirectoryTab("builders")}
                  className={`px-4 py-2 rounded-full font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeDirectoryTab === "builders"
                      ? "bg-[#FA5D00] text-white shadow-sm font-black"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Builders</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. STARTUPS DIRECTORY (Always visible for all builders!)   */}
        {/* ======================================================== */}

        {/* ======================================================== */}
        {/* BUILDERS DIRECTORY VIEW (Profiles & Contribution numbers) */}
        {/* ======================================================== */}
        {activeDirectoryTab === "builders" ? (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                  Guild Builders &amp; Contributors
                </h3>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Verified profiles, project contributions, startup launches, and guild standing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {builders.map((builder, idx) => (
                <div
                  key={builder.id}
                  className="p-6 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 shadow-sm hover:border-[#FA5D00] dark:hover:border-[#FA5D00] transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#FA5D00]/15 flex items-center justify-center font-serif font-bold text-sm text-[#FA5D00] border-2 border-black/10 dark:border-white/10 flex-none">
                          {builder.avatar_url ? (
                            <img
                              src={builder.avatar_url}
                              alt={builder.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(builder.username)}`
                              }}
                            />
                          ) : (
                            builder.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/builder/${builder.username}`}
                            className="font-serif text-base font-bold text-zinc-950 dark:text-zinc-50 hover:text-[#FA5D00] transition-colors flex items-center gap-1.5 truncate"
                          >
                            <span className="truncate">{builder.name}</span>
                            {builder.is_verified && <VerifiedBadge size="xs" />}
                          </Link>
                          <div className="font-mono text-xs text-zinc-400 truncate">
                            @{builder.username}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex-none">
                        #{idx + 1} Rank
                      </span>
                    </div>

                    <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 min-h-[32px] leading-relaxed">
                      {builder.bio || "Active builder in the Reco Labs open-source developer collective."}
                    </p>
                  </div>

                  {/* Contribution Breakdown Numbers */}
                  <div className="pt-3 border-t editorial-hairline space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                        <div className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                          {builder.startups_count}
                        </div>
                        <div className="text-[9px] text-zinc-400 uppercase tracking-tight">
                          Startups
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                        <div className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                          {builder.upvotes_count}
                        </div>
                        <div className="text-[9px] text-zinc-400 uppercase tracking-tight">
                          Upvotes
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-[#FA5D00]/10 border border-[#FA5D00]/20 text-[#FA5D00]">
                        <div className="text-xs font-extrabold">
                          {builder.contributions}
                        </div>
                        <div className="text-[9px] uppercase tracking-tight font-bold">
                          Points
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/builder/${builder.username}`}
                      className="w-full py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-white font-mono text-xs font-bold text-center block transition-colors text-zinc-900 dark:text-zinc-100"
                    >
                      View Profile &amp; Projects →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b editorial-hairline">
          {/* Symmetrically Centered Search Input with Gemini 2.5 AI Copilot */}
          <div className="relative flex-1 max-w-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  handleAiStartupSearch()
                }
              }}
              className="relative w-full"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, or describe a problem to ask AI..."
                className="w-full pl-10 pr-24 py-2.5 rounded-full border editorial-hairline bg-white/70 dark:bg-zinc-900/60 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00] transition-colors"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
                <button
                  type="submit"
                  disabled={aiSearching || !searchQuery.trim()}
                  title="Describe a problem and let Gemini AI match the best startup"
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all ${
                    aiSearching
                      ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 animate-pulse"
                      : searchQuery.trim()
                      ? "bg-[#FA5D00] text-white font-black shadow-xs hover:bg-[#ff7524] active:scale-95 cursor-pointer"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <Sparkles className="w-3 h-3 fill-current" />
                  <span>{aiSearching ? "Thinking..." : "Ask AI"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#FA5D00] text-white font-bold shadow-xs border border-[#FA5D00]"
                    : "border editorial-hairline bg-white/50 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:border-[#FA5D00]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gemini AI Recommendation Banner */}
        {aiStartupSuggestion && (
          <div className="mt-6 p-4 rounded-2xl border-2 border-[#FA5D00] bg-gradient-to-br from-[#FA5D00]/[0.08] via-zinc-900/40 to-transparent dark:from-[#FA5D00]/[0.12] dark:via-zinc-900/60 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg shadow-[#FA5D00]/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#FA5D00] text-white flex items-center justify-center font-bold flex-none shadow-sm mt-0.5 sm:mt-0">
                  <Sparkles className="w-5 h-5 fill-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FA5D00] text-white border border-[#FA5D00]">
                      Gemini 2.5 Matchmaker
                    </span>
                    <h3 className="font-serif text-lg font-bold text-zinc-950 dark:text-zinc-50 truncate">
                      {aiStartupSuggestion.suggested_startup_name}
                    </h3>
                  </div>
                  <p className="font-sans text-xs text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
                    {aiStartupSuggestion.reason}
                  </p>
                  {aiStartupSuggestion.search_keywords && aiStartupSuggestion.search_keywords.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="font-mono text-[10px] text-zinc-400">Keywords:</span>
                      {aiStartupSuggestion.search_keywords.map((kw, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSearchQuery(kw)}
                          className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black hover:bg-[#FA5D00] transition-colors cursor-pointer"
                        >
                          #{kw}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-none self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setSearchQuery(aiStartupSuggestion.suggested_startup_name)}
                  className="px-3.5 py-1.5 rounded-full bg-[#FA5D00] text-white font-mono text-[11px] font-black uppercase tracking-wider hover:bg-[#ff7524] transition-colors cursor-pointer shadow-sm shadow-[#FA5D00]/30"
                >
                  Isolate Project
                </button>
                <button
                  type="button"
                  onClick={() => setAiStartupSuggestion(null)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Clear suggestion"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {aiSearchError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-mono text-xs flex items-center justify-between">
            <span>{aiSearchError}</span>
            <button type="button" onClick={() => setAiSearchError(null)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Startups Directory Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#FA5D00] animate-spin mb-3" />
              <p className="font-mono text-xs text-zinc-500">Loading registered startups...</p>
            </div>
          ) : filteredStartups.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8">
              <div className="w-12 h-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 mx-auto mb-3">
                <Rocket className="w-5 h-5 text-[#FA5D00]" />
              </div>
              <h3 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100">No projects match filter</h3>
              <p className="mt-1 font-sans text-xs text-zinc-500">
                Try a different keyword or category, or submit your own project.
              </p>
              <button
                onClick={() => {
                  if (!currentUser) setShowAuthModal(true)
                  else setShowPostModal(true)
                }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#FA5D00] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#ff7524] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List a Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStartups.map((item) => {
                const safeName = item?.founder_name || "Builder"
                const founderUser =
                  item?.founder_username ||
                  (item as any)?.author_username ||
                  safeName.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                const isAiMatch =
                  aiStartupSuggestion &&
                  (String(aiStartupSuggestion.suggested_startup_id) === String(item.id) ||
                    item.name?.toLowerCase() === aiStartupSuggestion.suggested_startup_name.toLowerCase())

                return (
                  <div
                    key={item.id}
                    onClick={() => selectStartupWithUrl(item)}
                    className={`group relative p-6 sm:p-7 rounded-3xl border-2 transition-all flex flex-col justify-between shadow-sm hover:shadow-md cursor-pointer ${
                      isAiMatch
                        ? "border-[#FA5D00] ring-2 ring-[#FA5D00]/60 bg-orange-500/10 shadow-xl shadow-[#FA5D00]/20"
                        : item.is_featured
                        ? "border-[#FA5D00] dark:border-[#FA5D00] bg-orange-500/10 dark:bg-orange-500/10 shadow-xl shadow-orange-400/10 ring-2 ring-orange-400/20"
                        : "border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:border-[#FA5D00] dark:hover:border-[#FA5D00]"
                    }`}
                  >
                    {isAiMatch ? (
                      <div className="absolute -top-3.5 left-6 px-3 py-0.5 rounded-full bg-[#FA5D00] text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 border border-black/20">
                        <Sparkles className="w-3 h-3 fill-black text-black" />
                        <span>AI RECOMMENDED</span>
                      </div>
                    ) : item.is_featured && (
                      <div className="absolute -top-3.5 left-6 px-3 py-0.5 rounded-full bg-[#FA5D00] text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 border border-black/20">
                        <Flame className="w-3.5 h-3.5 fill-black text-black" />
                        <span>BOOSTED · 1 WEEK PIN</span>
                      </div>
                    )}
                    <div>
                      {/* Top Bar: Category, Stage, Screenshot Snap & External Link */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="inline-flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#FA5D00] font-mono text-[10px] font-bold uppercase tracking-wider border border-orange-200 dark:border-orange-900/50">
                            {item.category}
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-500 uppercase font-semibold">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.stage?.toLowerCase() === "live"
                                  ? "bg-emerald-500"
                                  : item.stage?.toLowerCase() === "beta"
                                  ? "bg-[#FA5D00]"
                                  : "bg-zinc-400"
                              }`}
                            />
                            {item.stage}
                          </span>
                        </div>

                        {/* Top Right Actions: Boost & Link */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPromoteStartup(item);
                            }}
                            title="Boost this startup for 1 week"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-mono text-[10px] font-bold uppercase transition-all shadow-2xs active:scale-95 ${
                              item.is_featured
                                ? "border-[#FA5D00] bg-[#FA5D00] text-white font-black"
                                : "border-orange-300 dark:border-orange-800/80 bg-orange-100/80 dark:bg-orange-950/60 text-[#FA5D00] hover:bg-[#FA5D00] hover:text-black"
                            }`}
                          >
                            <Zap className="w-3 h-3" />
                            <span>{item.is_featured ? "Boosted" : "Boost"}</span>
                          </button>

                          <a
                            href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open Startup Website"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-[#FA5D00] hover:border-[#FA5D00] transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Startup Name */}
                      <div className="flex items-center gap-3">
                        <StartupFavicon
                          name={item.name}
                          url={item.url}
                          className="w-8 h-8 rounded-xl flex-none"
                          textClassName="font-serif text-sm font-bold"
                        />
                        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950 dark:text-zinc-50 group-hover:text-[#FA5D00] transition-colors truncate">
                          {item.name}
                        </h2>
                      </div>

                      {/* Clean URL Link */}
                      <div className="mt-1 font-mono text-xs text-zinc-400 truncate">
                        <a
                          href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[#FA5D00] transition-colors underline underline-offset-2"
                        >
                          {item.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      </div>

                      {/* Problem Statement Card */}
                      <div className="mt-4 p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#FA5D00] font-bold block mb-1">
                          PROBLEM SOLVED:
                        </span>
                        <p className="font-sans text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-4">
                          {item.problem_solving}
                        </p>
                      </div>
                    </div>

                    {/* Founder Contact & Profile Strip */}
                    <div className="mt-6 pt-4 border-t editorial-hairline">
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <Link
                          to={`/builder/${founderUser}`}
                          className="flex items-center gap-2 font-mono text-xs text-zinc-900 dark:text-zinc-100 font-bold hover:text-[#FA5D00] transition-colors truncate"
                          title={`View ${item.founder_name}'s profile`}
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-tr from-[#FA5D00] to-amber-400 flex-none border border-black/10 dark:border-white/10 shadow-2xs"><img src={(item as any).avatar_url || (item as any).author_avatar || "https://api.dicebear.com/7.x/identicon/svg?seed=" + encodeURIComponent(founderUser)} alt={item.founder_name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/identicon/svg?seed=" + encodeURIComponent(founderUser); }} /></div>
                          <span className="truncate hover:underline underline-offset-4 decoration-[#FA5D00]">{item.founder_name}</span>
                          {((item as any).is_verified || (item as any).is_pro) && (
                            <VerifiedBadge size="sm" />
                          )}
                        </Link>
                      </div>

                      {/* Contact Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[11px]">
                        {item.founder_phone && (
                          <a
                            href={`tel:${item.founder_phone}`}
                            title={`Call or WhatsApp: ${item.founder_phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border editorial-hairline bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#FA5D00] hover:border-[#FA5D00] transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-500" />
                            <span>{item.founder_phone}</span>
                          </a>
                        )}

                        {item.founder_website && (
                          <a
                            href={item.founder_website.startsWith("http") ? item.founder_website : `https://${item.founder_website}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Founder Website"
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border editorial-hairline bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#FA5D00] hover:border-[#FA5D00] transition-colors"
                          >
                            <Globe className="w-3 h-3 text-blue-500" />
                            <span>Website</span>
                          </a>
                        )}

                        {item.founder_email && (
                          <a
                            href={`mailto:${item.founder_email}`}
                            title={`Email ${item.founder_email}`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border editorial-hairline bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#FA5D00] hover:border-[#FA5D00] transition-colors"
                          >
                            <Mail className="w-3 h-3 text-[#FA5D00]" />
                            <span>Email</span>
                          </a>
                        )}

                        {item.founder_discord && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border editorial-hairline bg-white dark:bg-zinc-800 text-zinc-500">
                            <MessageSquare className="w-3 h-3 text-[#5865F2]" />
                            <span>{item.founder_discord}</span>
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>
        </div>
        )}

      </div>

      {/* MODAL 1: AUTH (SIGN UP / SIGN IN) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#09090b] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tab switch */}
            <div className="flex items-center gap-2 mb-6 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border editorial-hairline w-fit">
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                  authMode === "signup" ? "bg-[#FA5D00] text-black" : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                  authMode === "login" ? "bg-[#FA5D00] text-black" : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                Sign In
              </button>
            </div>

            <h2 className="font-serif text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
              {authMode === "signup" ? "Join the Founder Network" : "Welcome Back"}
            </h2>
            <p className="mt-1 font-sans text-xs text-zinc-500">
              {authMode === "signup"
                ? "Create your profile in seconds. You can fill out your bio and social links right on your builder profile."
                : "Enter your credentials to manage your listings and profile."}
            </p>

            {authError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-mono text-xs">
                {authError}
              </div>
            )}

            {/* Social OAuth Buttons */}
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => networkApi.signInWithGoogle()}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => networkApi.signInWithGitHub()}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
              >
                <GithubIcon className="w-4 h-4 flex-none" />
                <span>Continue with GitHub</span>
              </button>
            </div>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t editorial-hairline" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#09090b] font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                OR WITH EMAIL
              </span>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3 font-mono text-xs">
              {authMode === "signup" && (
                <>
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 mb-1">YOUR NAME *</label>
                    <input
                      type="text"
                      required
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      placeholder="Aditya Prasad"
                      className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 mb-1">CHOOSE USERNAME *</label>
                    <div className="flex items-center rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 px-3">
                      <span className="text-zinc-400 mr-1">@</span>
                      <input
                        type="text"
                        required
                        value={authForm.username}
                        onChange={(e) =>
                          setAuthForm({
                            ...authForm,
                            username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                          })
                        }
                        placeholder="aditya"
                        className="w-full py-2.5 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">
                      Your profile URL: recolabs.in/builder/{authForm.username || "username"}
                    </span>
                  </div>
                </>
              )}

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">EMAIL ADDRESS *</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="founder@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">PASSWORD *</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-4 py-3 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {authLoading ? "Processing..." : authMode === "signup" ? "Create Account & Go to Profile →" : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: POST STARTUP */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#09090b] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPostModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="font-mono text-xs text-[#FA5D00] font-bold uppercase tracking-wider">
              NEW LISTING
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal">
              List Your Project<span className="text-[#FA5D00]">.</span>
            </h2>
            <p className="mt-1 font-sans text-xs text-zinc-500">
              Submit your project so fellow builders, hackathon peers, and mentors can find and contact you.
            </p>

            {postError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-mono text-xs">
                {postError}
              </div>
            )}

            <form onSubmit={handlePostStartup} className="mt-6 space-y-4 font-mono text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-600 dark:text-zinc-400 font-bold text-[11px]">
                    PROJECT URL / REPOSITORY *
                  </label>
                  {inspectingLink ? (
                    <span className="text-[10px] text-[#FA5D00] font-bold flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Fetching details...
                    </span>
                  ) : startupForm.url && (
                    <button
                      type="button"
                      onClick={() => handleInspectUrl(startupForm.url)}
                      className="text-[10px] text-[#FF8C42] dark:text-[#FA5D00] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 fill-current" /> Auto-fetch details
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={startupForm.url}
                    onChange={(e) => {
                      const val = e.target.value
                      setStartupForm({ ...startupForm, url: val })
                      if (val.startsWith("http") || val.includes("github.com") || (val.includes(".") && val.length > 8)) {
                        if ((window as any)._inspectTimer) clearTimeout((window as any)._inspectTimer)
                        ;(window as any)._inspectTimer = setTimeout(() => handleInspectUrl(val), 700)
                      }
                    }}
                    onBlur={() => {
                      if (startupForm.url && (!startupForm.name || !startupForm.problem_solving)) {
                        handleInspectUrl(startupForm.url)
                      }
                    }}
                    placeholder="https://myproject.com or github.com/user/repo"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {startupForm.url && (startupForm.url.startsWith("http") || startupForm.url.includes(".")) ? (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                          startupForm.url.replace(/^https?:\/\//, "").split("/")[0]
                        )}&sz=64`}
                        alt=""
                        className="w-4 h-4 rounded-sm object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none"
                        }}
                      />
                    ) : (
                      <Globe className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>
                {inspectNotice && (
                  <p className="mt-1 text-[11px] text-[#FF8C42] dark:text-[#FA5D00] font-mono animate-in fade-in">
                    {inspectNotice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">STARTUP / PROJECT NAME *</label>
                <input
                  type="text"
                  required
                  value={startupForm.name}
                  onChange={(e) => setStartupForm({ ...startupForm, name: e.target.value })}
                  placeholder="e.g. PulseKit"
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">WHAT PROBLEM ARE YOU SOLVING? *</label>
                <textarea
                  required
                  rows={3}
                  value={startupForm.problem_solving}
                  onChange={(e) => setStartupForm({ ...startupForm, problem_solving: e.target.value })}
                  placeholder="Explain the technical problem and how your build solves it..."
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1">CATEGORY</label>
                  <select
                    value={startupForm.category}
                    onChange={(e) => setStartupForm({ ...startupForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                  >
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Security">Security</option>
                    <option value="AI">AI</option>
                    <option value="Education & Tooling">Education & Tooling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1">STAGE</label>
                  <select
                    value={startupForm.stage}
                    onChange={(e) => setStartupForm({ ...startupForm, stage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                  >
                    <option value="Prototype">Prototype</option>
                    <option value="Beta">Beta</option>
                    <option value="Live">Live</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t editorial-hairline">
                <span className="block font-mono text-[10px] uppercase text-zinc-400 mb-3 font-semibold">
                  FOUNDER CONTACT DETAILS (PUBLICLY SHOWN)
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 mb-1">FOUNDER NAME</label>
                    <input
                      type="text"
                      value={startupForm.founder_name}
                      onChange={(e) => setStartupForm({ ...startupForm, founder_name: e.target.value })}
                      placeholder={currentUser?.name || "Your Name"}
                      className="w-full px-3.5 py-2 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 mb-1">PHONE / WHATSAPP</label>
                      <input
                        type="text"
                        value={startupForm.founder_phone}
                        onChange={(e) => setStartupForm({ ...startupForm, founder_phone: e.target.value })}
                        placeholder="+91..."
                        className="w-full px-3.5 py-2 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 mb-1">WEBSITE</label>
                      <input
                        type="text"
                        value={startupForm.founder_website}
                        onChange={(e) => setStartupForm({ ...startupForm, founder_website: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 mb-1">DISCORD HANDLE</label>
                    <input
                      type="text"
                      value={startupForm.founder_discord}
                      onChange={(e) => setStartupForm({ ...startupForm, founder_discord: e.target.value })}
                      placeholder="user_dev"
                      className="w-full px-3.5 py-2 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={postLoading}
                className="w-full mt-4 py-3 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {postLoading ? "Submitting..." : "Publish Startup Listing"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT PROFILE */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#09090b] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="font-mono text-xs text-[#FA5D00] font-bold uppercase tracking-wider">
              FOUNDER PROFILE
            </span>
            <h2 className="mt-1 font-serif text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
              Edit Details<span className="text-[#FA5D00]">.</span>
            </h2>
            <p className="mt-1 font-sans text-xs text-zinc-500">
              Update how other founders reach out to you.
            </p>

            {profileSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                Profile updated successfully.
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="mt-5 space-y-3 font-mono text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">NAME</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">USERNAME (@handle)</label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1">PHONE</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1">WEBSITE</label>
                  <input
                    type="text"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">DISCORD</label>
                <input
                  type="text"
                  value={profileForm.discord}
                  onChange={(e) => setProfileForm({ ...profileForm, discord: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">SHORT BIO</label>
                <textarea
                  rows={2}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  to={`/builder/${currentUser?.username}`}
                  className="flex-1 py-2.5 rounded-full border editorial-hairline text-center text-zinc-700 dark:text-zinc-300 font-bold hover:border-[#FA5D00]"
                >
                  View Public Profile
                </Link>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 py-2.5 rounded-full bg-[#FA5D00] text-black font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow cursor-pointer disabled:opacity-50"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ======================================================== */}
      {/* 5. STARTUP DETAIL MODAL (Matching Peerlist Launchpad)    */}
      {/* ======================================================== */}
      {selectedStartup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in overflow-y-auto"
          onClick={() => selectStartupWithUrl(null)}
        >
          {/* Floating Previous Startup Arrow (Desktop) */}
          {prevStartup && (
            <div 
              onClick={(e) => {
                e.stopPropagation()
                selectStartupWithUrl(prevStartup)
              }}
              className="hidden xl:flex flex-col items-center gap-1.5 fixed left-6 top-1/2 -translate-y-1/2 z-50 cursor-pointer group select-none"
            >
              <StartupFavicon
                name={prevStartup.name}
                url={prevStartup.url}
                className="w-12 h-12 rounded-2xl group-hover:scale-105 group-hover:border-[#FA5D00] transition-all"
                textClassName="font-serif text-lg font-bold"
              />
              <div className="px-2.5 py-1 rounded-full bg-black/80 border border-zinc-700 text-white font-mono text-[11px] font-medium flex items-center gap-1 group-hover:text-[#FA5D00] transition-colors shadow-md">
                <ArrowLeft className="w-3 h-3" />
                <span>Prev</span>
              </div>
            </div>
          )}

          {/* Floating Next Startup Arrow (Desktop) */}
          {nextStartup && (
            <div 
              onClick={(e) => {
                e.stopPropagation()
                selectStartupWithUrl(nextStartup)
              }}
              className="hidden xl:flex flex-col items-center gap-1.5 fixed right-6 top-1/2 -translate-y-1/2 z-50 cursor-pointer group select-none"
            >
              <StartupFavicon
                name={nextStartup.name}
                url={nextStartup.url}
                className="w-12 h-12 rounded-2xl group-hover:scale-105 group-hover:border-[#FA5D00] transition-all"
                textClassName="font-serif text-lg font-bold"
              />
              <div className="px-2.5 py-1 rounded-full bg-black/80 border border-zinc-700 text-white font-mono text-[11px] font-medium flex items-center gap-1 group-hover:text-[#FA5D00] transition-colors shadow-md">
                <span>Next</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          )}

          {/* Main Modal Card */}
          <div 
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Right Controls Bar */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
              <button
                onClick={(e) => toggleFavoriteStartup(selectedStartup.id, e)}
                title={favorites.includes(selectedStartup.id) ? "Remove bookmark" : "Bookmark startup"}
                className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-750 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-600 dark:text-zinc-300 hover:text-[#FA5D00] dark:hover:text-[#FA5D00] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              >
                <Bookmark className={`w-4 h-4 ${favorites.includes(selectedStartup.id) ? "fill-[#FA5D00] text-[#FA5D00]" : ""}`} />
              </button>

              <button
                onClick={() => selectStartupWithUrl(null)}
                className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-750 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 md:p-10 overflow-y-auto space-y-6">
              
              {/* Header: Icon, Startup Name, Problem Solved & Action Buttons */}
              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <StartupFavicon
                  name={selectedStartup.name}
                  url={selectedStartup.url}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl"
                  textClassName="font-serif text-3xl sm:text-4xl font-bold"
                />

                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
                    {selectedStartup.name}
                  </h2>
                  <p className="mt-1 font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
                    {selectedStartup.problem_solving}
                  </p>
                </div>

                {/* Founder Attribution */}
                <div className="flex items-center justify-center gap-2 font-mono text-xs text-zinc-500">
                  <Link
                    to={`/builder/${selectedStartup.founder_username || selectedStartup.founder_name.toLowerCase().replace(/[^a-z0-9_-]/g, "")}`}
                    className="inline-flex items-center gap-1.5 hover:text-[#FA5D00] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-tr from-[#FA5D00] to-amber-400 flex-none border border-black/10 dark:border-white/10 shadow-2xs"><img src={(selectedStartup as any).avatar_url || (selectedStartup as any).author_avatar || "https://api.dicebear.com/7.x/identicon/svg?seed=" + encodeURIComponent(selectedStartup.founder_username || selectedStartup.founder_name)} alt={selectedStartup.founder_name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/identicon/svg?seed=" + encodeURIComponent(selectedStartup.founder_username || selectedStartup.founder_name); }} /></div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4 decoration-[#FA5D00]">
                      {selectedStartup.founder_name}
                    </span>
                    {(selectedStartup.is_featured || (selectedStartup as any).is_verified) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        <span>Verified</span>
                      </span>
                    )}
                  </Link>
                </div>

                {/* Action Buttons: Visit & Share Link (NO UPVOTE) */}
                <div className="pt-2 flex items-center justify-center gap-3">
                  <a
                    href={selectedStartup.url.startsWith("http") ? selectedStartup.url : `https://${selectedStartup.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-sm transition-all"
                  >
                    <span>Visit</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={handleCopyStartupShareLink}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-sm transition-all cursor-pointer"
                  >
                    {copiedLinkNotice ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Share Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Main 2-Column Split: Details & Feedback (Left) vs Launchpad Card (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                
                {/* LEFT COLUMN: Problem Overview, Tags, Feedback & Comments */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Problem Solving Wireframe Banner */}
                  <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 font-mono text-[10px] text-[#FA5D00] font-bold uppercase tracking-wider">
                      <Rocket className="w-3 h-3" />
                      <span>THE MISSION</span>
                    </div>
                    <p className="font-sans text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
                      {selectedStartup.problem_solving}
                    </p>
                  </div>

                  {/* Badges Strip */}
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#FA5D00] font-bold uppercase border border-orange-200 dark:border-orange-900/50">
                      {selectedStartup.category}
                    </span>
                    <span className="px-3 py-1 rounded-full border editorial-hairline bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 font-semibold uppercase">
                      Stage: {selectedStartup.stage}
                    </span>
                  </div>

                  {/* Founder Contact Row */}
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs pt-1">
                    {selectedStartup.founder_phone && (
                      <a
                        href={`tel:${selectedStartup.founder_phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border editorial-hairline bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#FA5D00] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{selectedStartup.founder_phone}</span>
                      </a>
                    )}
                    {selectedStartup.founder_website && (
                      <a
                        href={selectedStartup.founder_website.startsWith("http") ? selectedStartup.founder_website : `https://${selectedStartup.founder_website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border editorial-hairline bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#FA5D00] transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-500" />
                        <span>Website</span>
                      </a>
                    )}
                    {selectedStartup.founder_email && (
                      <a
                        href={`mailto:${selectedStartup.founder_email}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border editorial-hairline bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#FA5D00] transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-amber-500" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>

                  {/* Community Feedback Input Box */}
                  {!currentUser ? (
                    <div className="mt-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs font-mono">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Sign in to leave verified feedback for this builder.
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(true)}
                        className="px-4 py-2 rounded-full bg-[#FA5D00] text-white font-bold uppercase tracking-wider hover:bg-[#ff7524] transition-colors cursor-pointer flex-none text-[11px]"
                      >
                        Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePostStartupComment} className="mt-4">
                      <div className="flex items-center gap-2 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 shadow-2xs focus-within:ring-2 focus-within:ring-[#FA5D00]/60 transition-all">
                        <div className="w-7 h-7 rounded-full bg-[#FA5D00] text-white font-mono text-xs font-black flex items-center justify-center flex-none ml-1 overflow-hidden">
                          {currentUser.avatar_url ? (
                            <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                          ) : (
                            (currentUser.name || "B")[0].toUpperCase()
                          )}
                        </div>
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share feedback or advice for this builder..."
                          className="flex-grow bg-transparent font-sans text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none px-2"
                        />
                        <button
                          type="submit"
                          disabled={submittingComment || !commentText.trim()}
                          className="w-8 h-8 rounded-full bg-[#FA5D00] text-white hover:bg-[#ff7524] active:scale-95 flex items-center justify-center transition-all cursor-pointer flex-none disabled:opacity-40"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {commentSuccessMsg && (
                        <p className="mt-1.5 text-center font-mono text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                          {commentSuccessMsg}
                        </p>
                      )}
                    </form>
                  )}

                  {/* Comments Header */}
                  <div className="border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-mono text-xs font-bold tracking-wider pt-3 pb-2">
                    <div className="text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#FA5D00]" />
                      <span>Peer Reviews ({startupComments.length})</span>
                    </div>
                  </div>

                  {/* Comments Feed */}
                  <div className="space-y-3 pt-2">
                    {loadingComments ? (
                      <div className="py-6 text-center text-xs font-mono text-zinc-400 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#FA5D00]" />
                        <span>Loading feedback...</span>
                      </div>
                    ) : startupComments.length === 0 ? (
                      <div className="py-8 text-center text-xs font-mono text-zinc-400 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-4">
                        No feedback yet. Be the first peer to leave a review!
                      </div>
                    ) : (
                      startupComments.map((c) => {
                        const avatarUrl =
                          c.author_avatar ||
                          `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                            c.author_username || c.author_name
                          )}`
                        return (
                          <div
                            key={c.id}
                            className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/90 dark:border-zinc-800/90 space-y-2 hover:border-[#FA5D00]/40 transition-colors"
                          >
                            <div className="flex items-center justify-between text-xs font-mono">
                              <div className="flex items-center gap-2">
                                <img
                                  src={avatarUrl}
                                  alt={c.author_name}
                                  className="w-5 h-5 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                                      c.author_name
                                    )}`
                                  }}
                                />
                                {c.author_username ? (
                                  <Link
                                    to={`/builder/${c.author_username}`}
                                    className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-[#FA5D00] transition-colors"
                                  >
                                    {c.author_name}
                                  </Link>
                                ) : (
                                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                    {c.author_name}
                                  </span>
                                )}
                              </div>
                              <span className="text-zinc-400 text-[10px]">
                                {new Date(c.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-sans text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pl-7">
                              {c.content}
                            </p>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Reco Labs Launchpad Card + Real Functional Rating */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 shadow-xs space-y-5">
                    
                    {/* Real Launchpad Header */}
                    <div className="text-center pt-1">
                      <div className="flex items-center justify-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                        <Award className="w-4 h-4 text-[#FA5D00]" />
                        <h3 className="font-serif text-lg font-normal tracking-tight">
                          Builder <span className="font-sans font-light text-zinc-500 italic text-sm">Evaluation</span>
                        </h3>
                      </div>
                    </div>

                    {/* Real Peer Activity: Comments Count & Real Commenter Avatars */}
                    <div className="py-3 border-y border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4 text-zinc-400" />
                        <span className="font-mono text-sm font-bold text-zinc-950 dark:text-zinc-50">
                          {startupComments.length}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
                          {startupComments.length === 1 ? 'Peer Review' : 'Peer Reviews'}
                        </span>
                      </div>
                      {startupComments.length > 0 ? (
                        <div className="flex items-center justify-center -space-x-1.5 pt-0.5">
                          {startupComments.slice(0, 5).map((c, idx) => (
                            <img
                              key={c.id || idx}
                              src={c.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.author_name}`}
                              alt={c.author_name}
                              title={c.author_name}
                              className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 object-cover shadow-xs"
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="font-mono text-[10px] text-zinc-400">
                          No reviews yet — be the first to evaluate below
                        </p>
                      )}
                    </div>

                    {/* Functional Rating Scorecard */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
                      {startupRatings && startupRatings.totalRatings > 0 ? (
                        <div className="grid grid-cols-12 gap-3 items-center">
                          {/* Overall Score */}
                          <div className="col-span-5 text-center">
                            <div className="font-serif text-3xl font-normal text-zinc-950 dark:text-zinc-50 leading-none">
                              {Number(startupRatings.overall).toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center gap-0.5 text-[#FA5D00] mt-1.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${s <= Math.round(Number(startupRatings.overall)) ? 'fill-[#FA5D00] text-[#FA5D00]' : 'text-zinc-300 dark:text-zinc-700'}`}
                                />
                              ))}
                            </div>
                            <span className="font-mono text-[10px] text-zinc-400 block mt-1">
                              {startupRatings.totalRatings} verified rating{startupRatings.totalRatings === 1 ? '' : 's'}
                            </span>
                          </div>

                          {/* Breakdown Bars (Idea, Execution, Design) */}
                          <div className="col-span-7 space-y-2 font-mono text-[11px]">
                            <div>
                              <div className="flex justify-between text-zinc-600 dark:text-zinc-300 mb-0.5">
                                <span>Idea</span>
                                <span className="font-bold">{Number(startupRatings.idea).toFixed(1)}</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${(Number(startupRatings.idea) / 5) * 100}%` }}
                                  className="h-full bg-[#FA5D00] rounded-full"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-zinc-600 dark:text-zinc-300 mb-0.5">
                                <span>Execution</span>
                                <span className="font-bold">{Number(startupRatings.execution).toFixed(1)}</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${(Number(startupRatings.execution) / 5) * 100}%` }}
                                  className="h-full bg-[#FA5D00] rounded-full"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-zinc-600 dark:text-zinc-300 mb-0.5">
                                <span>Design</span>
                                <span className="font-bold">{Number(startupRatings.design).toFixed(1)}</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${(Number(startupRatings.design) / 5) * 100}%` }}
                                  className="h-full bg-[#FA5D00] rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-3 text-center space-y-1 font-mono">
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            No peer ratings yet
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            Rate Idea, Execution, and Design to give feedback to this builder.
                          </p>
                        </div>
                      )}

                      {/* Interactive Rating Form Dropdown */}
                      {showRatingInput ? (
                        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3 font-mono text-xs animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span>Rate Idea:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setUserRatingScores((prev) => ({ ...prev, idea: val }))}
                                  className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center ${userRatingScores.idea >= val ? 'bg-[#FA5D00] text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span>Rate Execution:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setUserRatingScores((prev) => ({ ...prev, execution: val }))}
                                  className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center ${userRatingScores.execution >= val ? 'bg-[#FA5D00] text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span>Rate Design:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setUserRatingScores((prev) => ({ ...prev, design: val }))}
                                  className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center ${userRatingScores.design >= val ? 'bg-[#FA5D00] text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleSubmitRating}
                            disabled={submittingRating}
                            className="w-full py-2 rounded-full bg-[#FA5D00] text-black font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
                          >
                            {submittingRating ? "Submitting..." : "Submit Ratings"}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowRatingInput(true)}
                          className="w-full py-2.5 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-mono text-xs font-bold hover:bg-[#FA5D00] dark:hover:bg-[#FA5D00] dark:hover:text-black transition-colors cursor-pointer shadow-sm text-center"
                        >
                          {ratingSubmittedNotice ? "★ Rating Submitted!" : "Rate Startup"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* MODAL 4: SHAREABLE SCREENSHOT SNAPSHOT CARD */}
      {screenshotStartup && (
        <StartupScreenshotModal
          startup={screenshotStartup}
          onClose={() => setScreenshotStartup(null)}
        />
      )}

      {/* MODAL 5: STARTUP SPOTLIGHT PROMOTION / PIN */}
      {promoteStartup && (
        <StartupPromoteModal
          startup={promoteStartup}
          onClose={() => setPromoteStartup(null)}
          onBoostSuccess={(id) => {
            setStartups((prev) => {
              const updated = prev.map((item) =>
                item.id === id ? { ...item, is_featured: true } : item
              )
              return updated.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
            })
            setPromoteStartup(null)
          }}
        />
      )}

      {/* MODAL 6: PROFILE UPGRADE / BLUE TICK */}
      {showUpgradeModal && currentUser && (
        <ProfileUpgradeModal
          username={currentUser.username}
          name={currentUser.name}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* FLOATING ACTION BUTTON: ONLY + IN A BOX */}
      <button
        type="button"
        onClick={() => {
          if (!currentUser) setShowAuthModal(true)
          else setShowPostModal(true)
        }}
        title="List Project"
        aria-label="List Project"
        className="fixed bottom-6 right-6 z-40 group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FA5D00] text-white hover:bg-[#ff7524] flex items-center justify-center shadow-2xl shadow-[#FA5D00]/40 border-2 border-black dark:border-zinc-800 transition-all hover:scale-110 active:scale-95 cursor-pointer"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-black text-[#FA5D00] flex items-center justify-center font-mono font-black text-base sm:text-lg border border-black/30 group-hover:rotate-90 transition-transform duration-200">
          +
        </div>
      </button>
    </div>
  )
}
