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
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Building2,
  Terminal,
  Filter,
  Camera,
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
} from "lucide-react"
import { GithubIcon } from "@/components/icons"
import { networkApi, type UserProfile, type StartupItem } from "@/services/networkApi"
import { usePageMeta } from "@/hooks/usePageMeta"
import { StartupScreenshotModal } from "@/components/StartupScreenshotModal"
import { StartupPromoteModal } from "@/components/StartupPromoteModal"
import { ProfileUpgradeModal } from "@/components/ProfileUpgradeModal"
import { VerifiedBadge } from "@/components/VerifiedBadge"
import { NetworkAvatarCloud } from "@/components/NetworkAvatarCloud"

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
  const [startups, setStartups] = React.useState<StartupItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("ALL")

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

  // Functional Ratings State
  const [startupRatings, setStartupRatings] = React.useState<{
    totalRatings: number
    overall: number
    idea: number
    execution: number
    design: number
  }>({
    totalRatings: 1,
    overall: 5.0,
    idea: 5.0,
    execution: 5.0,
    design: 5.0,
  })
  const [showRatingInput, setShowRatingInput] = React.useState(false)
  const [userRatingScores, setUserRatingScores] = React.useState({
    idea: 5,
    execution: 5,
    design: 5,
  })
  const [submittingRating, setSubmittingRating] = React.useState(false)
  const [ratingSubmittedNotice, setRatingSubmittedNotice] = React.useState(false)
  const [favorites, setFavorites] = React.useState<number[]>(() => {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(localStorage.getItem("reco_startup_favorites") || "[]")
    } catch {
      return []
    }
  })

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
      setStartupRatings(ratings || { totalRatings: 1, overall: 5.0, idea: 5.0, execution: 5.0, design: 5.0 })
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
      setStartupComments((prev) => [...prev, res.comment])
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

    // Fetch live network statistics & registered builders for avatar cloud
    networkApi.getNetworkStats().then((data) => {
      if (data) {
        setNetworkStats(data)
      }
    })

    return () => {
      window.removeEventListener("reco_auth_changed", syncSession)
    }
  }, [])

  // Auto-trigger signup modal if navigated with ?signup=true or ?email=...
  React.useEffect(() => {
    const shouldSignup = searchParams.get("signup") === "true"
    const prefillEmail = (searchParams.get("email") || "").trim()
    if (shouldSignup || prefillEmail) {
      if (prefillEmail) {
        setAuthForm((prev) => ({ ...prev, email: prefillEmail }))
      }
      setAuthMode("signup")
      setShowAuthModal(true)
    }
  }, [searchParams])

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
      setLoading(true)
      const data = await networkApi.getStartups({
        search: searchQuery,
        category: selectedCategory,
      })
      setStartups(data)
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
    <div className="relative w-full pt-32 sm:pt-36 pb-24 px-5 sm:px-8 bg-transparent overflow-hidden">
      {/* Seamless ambient blurred glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#FA5D00]/[0.025] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-orange-500/[0.02] dark:bg-orange-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        
        {/* ======================================================== */}
        {/* 1. GUEST HERO SECTION (Visible ONLY when not logged in)   */}
        {/* ======================================================== */}
        {!currentUser ? (
          <div className="text-center max-w-4xl mx-auto pb-12 pt-4">
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-mono text-xs font-bold tracking-wide shadow-md mb-6 hover:opacity-90 transition-opacity">
              <span className="text-amber-400">✨</span>
              <span>NEW: Introducing Reco Network</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-75" />
            </div>

            {/* Headline */}
            <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-7xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight leading-[1.12]">
              The Professional Network
              <br />
              <span className="not-italic">for builders to show & tell!</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-xl mx-auto">
              Showcase your work, launch projects, find jobs, and connect with the most (in)credible people.
            </p>

            {/* Username Claim Pill Input */}
            <div className="mt-8 max-w-xl sm:max-w-2xl mx-auto w-full px-2 sm:px-4">
              <div className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg hover:border-[#FA5D00] focus-within:border-[#FA5D00] transition-all">
                <div className="w-8 h-8 rounded-full bg-[#FA5D00] p-1.5 flex items-center justify-center flex-none shadow-sm overflow-hidden">
                  <img src="/favicon.png" alt="Reco Labs" className="w-full h-full object-contain filter brightness-0" />
                </div>
                <span className="font-mono text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 select-none whitespace-nowrap">
                  recolabs.in/builder/
                </span>
                <input
                  type="text"
                  value={claimUsername}
                  onChange={(e) => setClaimUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleClaimUsername()
                  }}
                  placeholder="username"
                  className="flex-grow min-w-0 bg-transparent font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
                />
                <button
                  onClick={() => handleClaimUsername()}
                  title="Claim or view builder profile"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-[#FA5D00] dark:hover:bg-[#FA5D00] dark:hover:text-black flex items-center justify-center transition-all shadow-sm active:scale-95 flex-none cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-2 text-center font-mono text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                Claim your username before it's too late!
              </p>
            </div>

            {/* Interactive Avatar Honeycomb Cloud */}
            <div className="mt-8">
              <NetworkAvatarCloud
                realUsers={networkStats.builders}
                onSelectUsername={(u) => navigate(`/builder/${u}`)}
              />
            </div>

            {/* Real Peers Counter */}
            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="font-serif text-lg sm:text-xl text-zinc-700 dark:text-zinc-300">
                <span className="font-bold text-zinc-950 dark:text-zinc-50">
                  {networkStats.totalBuilders || (networkStats.builders?.length || 0)}
                </span>{" "}
                <span>peers and counting...</span>
              </div>
            </div>

            {/* Guest Action Row */}
            <div className="mt-10 flex flex-wrap justify-center items-center gap-3 pt-8 border-t editorial-hairline">
              <button
                onClick={() => {
                  setAuthMode("signup")
                  setShowAuthModal(true)
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5 fill-black" />
                <span>List Your Startup</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setAuthMode("login")
                  setShowAuthModal(true)
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-[#FA5D00] transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#FA5D00]" />
                <span>Founder Sign In / Register</span>
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* 2. AUTHENTICATED FOUNDER BAR (Replaces big hero on login) */
          /* ======================================================== */
          <div className="pb-8 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b editorial-hairline">
            <div>
              <div className="flex items-center gap-2 text-[#FA5D00] text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <Rocket className="w-3.5 h-3.5" />
                <span>Founder Workspace</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal">
                Startups & Founder Directory
              </h1>
              <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Explore, vote, and collaborate with early-stage builder startups across the guild.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Profile Pill with Hover Dropdown (View profile, Edit profile, Logout) */}
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#FA5D00] font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-sm transition-all cursor-pointer"
                >
                  {currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover flex-none"
                    />
                  ) : (
                    <img src={"https://api.dicebear.com/7.x/identicon/svg?seed=" + encodeURIComponent(currentUser.username)} alt={currentUser.name} className="w-5 h-5 rounded-full object-cover flex-none" />
                  )}
                  <span>@{currentUser.username}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FA5D00] transition-colors" />
                </button>

                {/* Hover Dropdown Menu */}
                <div className="absolute right-0 top-full pt-1.5 hidden group-hover:block group-focus-within:block z-50">
                  <div className="w-48 py-1.5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 shadow-xl font-mono text-xs text-zinc-700 dark:text-zinc-300 animate-in fade-in duration-150">
                    <div className="px-3.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 truncate">
                      Signed in as <strong className="text-zinc-800 dark:text-zinc-200">@{currentUser.username}</strong>
                    </div>
                    {currentUser.is_verified || currentUser.is_pro ? (
                      <div className="px-3.5 py-1.5 flex items-center gap-1.5 text-[11px] text-emerald-500 font-bold border-b border-zinc-100 dark:border-zinc-800 bg-emerald-500/5">
                        <VerifiedBadge size="xs" />
                        <span>Verified Builder</span>
                      </div>
                    ) : (
                      <Link
                        to="/pricing"
                        className="flex items-center gap-2 px-3.5 py-2 hover:bg-orange-500/10 text-[#FA5D00] font-semibold transition-colors border-b border-zinc-100 dark:border-zinc-800"
                      >
                        <Zap className="w-3.5 h-3.5 fill-[#FA5D00]" />
                        <span>⚡ Get Blue Tick</span>
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-[#357dff] transition-colors font-semibold"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[#357dff]" />
                      <span>Console / Dashboard</span>
                    </Link>
                    <Link
                      to={`/builder/${currentUser.username}`}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-[#FA5D00] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>View profile</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(true)}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-[#FA5D00] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Edit profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-rose-500/10 hover:text-rose-500 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer border-t border-zinc-100 dark:border-zinc-800"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPostModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5 fill-black" />
                <span>List Your Startup</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. STARTUPS DIRECTORY (Always visible for all builders!)   */}
        {/* ======================================================== */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b editorial-hairline">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search startups, problems, or founder names..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border editorial-hairline bg-white/70 dark:bg-zinc-900/60 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00]"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border editorial-hairline bg-white/50 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:border-[#FA5D00]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Startups Directory Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#FA5D00] animate-spin mb-3" />
              <p className="font-mono text-xs text-zinc-500">Loading registered startups...</p>
            </div>
          ) : startups.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8">
              <div className="w-12 h-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 mx-auto mb-3">
                <Rocket className="w-5 h-5 text-[#FA5D00]" />
              </div>
              <h3 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100">No startups found</h3>
              <p className="mt-1 font-sans text-xs text-zinc-500">
                Be the first founder to post a startup in this category.
              </p>
              <button
                onClick={() => {
                  if (!currentUser) setShowAuthModal(true)
                  else setShowPostModal(true)
                }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List a Startup</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {startups.map((item) => {
                const safeName = item?.founder_name || "Builder"
                const founderUser =
                  item?.founder_username ||
                  (item as any)?.author_username ||
                  safeName.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                const initial = (safeName[0] || "B").toUpperCase()

                return (
                  <div
                    key={item.id}
                    onClick={() => selectStartupWithUrl(item)}
                    className={`group relative p-6 sm:p-7 rounded-3xl border-2 transition-all flex flex-col justify-between shadow-sm hover:shadow-md cursor-pointer ${
                      item.is_featured
                        ? "border-[#FA5D00] dark:border-[#FA5D00] bg-orange-500/[0.04] dark:bg-orange-500/[0.06] shadow-lg shadow-[#FA5D00]/10"
                        : "border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:border-[#FA5D00] dark:hover:border-[#FA5D00]"
                    }`}
                  >
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

                        {/* Top Right Actions: Screenshot Card Snap & Link */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPromoteStartup(item);
                            }}
                            title="Boost this startup to #1"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-orange-300 dark:border-orange-800/80 bg-orange-100/80 dark:bg-orange-950/60 text-[#FA5D00] hover:bg-[#FA5D00] hover:text-black font-mono text-[10px] font-bold uppercase transition-all shadow-2xs active:scale-95"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Boost</span>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setScreenshotStartup(item); }} title="Snap Screenshot Card" className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#FA5D00] hover:border-[#FA5D00] active:scale-95 transition-all cursor-pointer shadow-2xs"><Camera className="w-3.5 h-3.5 text-[#FA5D00]" /></button>

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
                      <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950 dark:text-zinc-50 group-hover:text-[#FA5D00] transition-colors">
                        {item.name}
                      </h2>

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
              List Your Startup<span className="text-[#FA5D00]">.</span>
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
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">PROJECT URL / REPO *</label>
                <input
                  type="text"
                  required
                  value={startupForm.url}
                  onChange={(e) => setStartupForm({ ...startupForm, url: e.target.value })}
                  placeholder="https://myproject.com or github.com/user/repo"
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
              <div className="w-12 h-12 rounded-2xl bg-[#18181b]/90 border border-zinc-700/80 p-2 flex items-center justify-center shadow-2xl backdrop-blur-md group-hover:scale-105 group-hover:border-[#FA5D00] transition-all text-white font-serif text-lg font-bold">
                {prevStartup.name[0].toUpperCase()}
              </div>
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
              <div className="w-12 h-12 rounded-2xl bg-[#18181b]/90 border border-zinc-700/80 p-2 flex items-center justify-center shadow-2xl backdrop-blur-md group-hover:scale-105 group-hover:border-[#FA5D00] transition-all text-white font-serif text-lg font-bold">
                {nextStartup.name[0].toUpperCase()}
              </div>
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white font-serif text-3xl sm:text-4xl font-bold shadow-lg">
                  {selectedStartup.name[0].toUpperCase()}
                </div>

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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-[#FA5D00] text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 text-[#FA5D00]" />
                        <span>Verified Founder</span>
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
                  <form onSubmit={handlePostStartupComment} className="mt-4">
                    <div className="flex items-center gap-2 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 shadow-2xs focus-within:ring-2 focus-within:ring-[#FA5D00]/50 transition-all">
                      <div className="w-7 h-7 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold flex items-center justify-center flex-none ml-1">
                        {(currentUser?.name || "B")[0].toUpperCase()}
                      </div>
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your feedback or advice for this builder..."
                        className="flex-grow bg-transparent font-sans text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none px-2"
                      />
                      <button
                        type="submit"
                        disabled={submittingComment || !commentText.trim()}
                        className="w-8 h-8 rounded-full bg-[#FA5D00] text-black hover:opacity-90 active:scale-95 flex items-center justify-center transition-all cursor-pointer flex-none disabled:opacity-40"
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

                  {/* Comments Tab (NO UPVOTES TAB) */}
                  <div className="border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-6 font-mono text-xs font-bold tracking-wider pt-2">
                    <div className="pb-2 text-[#FA5D00] border-b-2 border-[#FA5D00] uppercase">
                      Comments · {startupComments.length}
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
                      startupComments.map((c) => (
                        <div key={c.id} className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {c.author_name}
                            </span>
                            <span className="text-zinc-400 text-[10px]">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-sans text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Reco Labs Launchpad Card + 5.0 Functional Rating */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 shadow-xs space-y-5">
                    
                    {/* Laurel Wreath Badge Header */}
                    <div className="text-center pt-1">
                      <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-0.5">
                        WEEK 45 · 2026
                      </span>
                      <div className="flex items-center justify-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                        <Award className="w-4 h-4 text-[#FA5D00]" />
                        <h3 className="font-serif text-lg font-normal tracking-tight">
                          Reco Labs <span className="font-sans font-light text-zinc-500 italic text-sm">Launchpad</span>
                        </h3>
                      </div>
                    </div>

                    {/* Stats 2 Columns: Comments & Views (NO UPVOTES) */}
                    <div className="grid grid-cols-2 gap-2 text-center py-2 border-y border-zinc-200 dark:border-zinc-800">
                      <div>
                        <div className="font-serif text-xl text-zinc-950 dark:text-zinc-50 font-normal">
                          {startupComments.length}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                          Comments
                        </div>
                      </div>

                      <div>
                        <div className="font-serif text-xl text-zinc-950 dark:text-zinc-50 font-normal">
                          {((selectedStartup.id * 13 + 47) % 300) + 120}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                          Views
                        </div>
                      </div>
                    </div>

                    {/* Supporting Peers Strip */}
                    <div className="text-center space-y-1.5">
                      <div className="flex items-center justify-center -space-x-1.5">
                        {["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces", "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=64&h=64&fit=crop&crop=faces"].map((pfp, idx) => (<img key={idx} src={pfp} alt="Peer" className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 object-cover shadow-xs" />))}
                      </div>
                      <p className="font-mono text-[11px] text-zinc-500">
                        4 Peers supporting this startup!
                      </p>
                    </div>

                    {/* Functional Rating Scorecard */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        {/* Overall Score */}
                        <div className="col-span-5 text-center">
                          <div className="font-serif text-3xl font-normal text-zinc-950 dark:text-zinc-50 leading-none">
                            {Number(startupRatings?.overall || 5).toFixed(1)}
                          </div>
                          <div className="flex items-center justify-center gap-0.5 text-[#FA5D00] mt-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3 h-3 fill-[#FA5D00]" />
                            ))}
                          </div>
                          <span className="font-mono text-[10px] text-zinc-400 block mt-1">
                            {startupRatings.totalRatings} rating{startupRatings.totalRatings === 1 ? '' : 's'}
                          </span>
                        </div>

                        {/* Breakdown Bars (Idea, Execution, Design) */}
                        <div className="col-span-7 space-y-2 font-mono text-[11px]">
                          <div>
                            <div className="flex justify-between text-zinc-600 dark:text-zinc-300 mb-0.5">
                              <span>Idea</span>
                              <span className="font-bold">{Number(startupRatings?.idea || 5).toFixed(1)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${(Number(startupRatings?.idea || 5) / 5) * 100}%` }}
                                className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-zinc-600 dark:text-zinc-300 mb-0.5">
                              <span>Execution</span>
                              <span className="font-bold">{Number(startupRatings?.execution || 5).toFixed(1)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${(Number(startupRatings?.execution || 5) / 5) * 100}%` }}
                                className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-zinc-600 dark:text-zinc-300 mb-0.5">
                              <span>Design</span>
                              <span className="font-bold">{Number(startupRatings?.design || 5).toFixed(1)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${(Number(startupRatings?.design || 5) / 5) * 100}%` }}
                                className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

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
    </div>
  )
}
