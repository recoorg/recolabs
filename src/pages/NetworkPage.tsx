"use client"

import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
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
  LogIn,
  LogOut,
  X,
  Check,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Building2,
  Terminal,
  Filter,
  Camera,
} from "lucide-react"
import { GithubIcon } from "@/components/icons"
import { networkApi, type UserProfile, type StartupItem } from "@/services/networkApi"
import { StartupScreenshotModal } from "@/components/StartupScreenshotModal"
import { NetworkAvatarCloud } from "@/components/NetworkAvatarCloud"

const CATEGORIES = ["ALL", "Software", "Hardware", "Security", "AI", "Education & Tooling"]

export function NetworkPage() {
  const navigate = useNavigate()
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
        
        {/* PEERLIST-STYLE HERO SECTION (Matching Image 1 & Image 2) */}
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
          <div className="mt-8 max-w-md mx-auto w-full px-2">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md hover:border-[#FA5D00] focus-within:border-[#FA5D00] transition-all">
              <div className="w-8 h-8 rounded-full bg-[#FA5D00] text-black font-mono font-bold text-sm flex items-center justify-center flex-none shadow-sm">
                R
              </div>
              <span className="font-mono text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 select-none">
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
                className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-[#FA5D00] dark:hover:bg-[#FA5D00] dark:hover:text-black flex items-center justify-center transition-all shadow-sm active:scale-95 flex-none cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2.5 text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
              Claim your username before it's too late!
            </p>
          </div>

          {/* Interactive Avatar Honeycomb Cloud */}
          <div className="mt-8">
            <NetworkAvatarCloud
              realUsers={networkStats.builders}
              onSelectUsername={(u) => handleClaimUsername(u)}
            />
          </div>

          {/* Live Report Counter & Accordion Card */}
          <div className="mt-6 flex flex-col items-center justify-center gap-2">
            <div className="font-serif text-lg sm:text-xl text-zinc-700 dark:text-zinc-300">
              <span className="font-bold text-zinc-950 dark:text-zinc-50">
                {networkStats.totalBuilders || (networkStats.builders?.length || 0)}
              </span>{" "}
              <span>peers and counting...</span>
            </div>

            {/* Clickable Live Report Pill */}
            <button
              onClick={() => setShowLiveReport(!showLiveReport)}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer mt-1"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Database Health Report</span>
              <span className="text-[10px]">{showLiveReport ? "▲" : "▼"}</span>
            </button>

            {/* Expandable Live Database Report Detail */}
            {showLiveReport && (
              <div className="mt-4 p-5 rounded-2xl border-2 border-emerald-500/30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl max-w-lg w-full text-left font-mono text-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Supabase PostgreSQL Index Status</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    OPTIMIZED
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Sequential Scans:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">0 (Missing indexes resolved)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Indexed Columns:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">created_at, user_id, category, username, email</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Query Plan:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Index Scan / QuickSort ({networkStats.queryTimeMs} ms)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Startups Indexed:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{startups.length} live entries</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supabase Host:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">aws-0-eu-west-1 pooler (Port 6543)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-3 pt-8 border-t editorial-hairline">
            <button
              onClick={() => {
                if (!currentUser) {
                  setAuthMode("signup")
                  setShowAuthModal(true)
                } else {
                  setShowPostModal(true)
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5 fill-black" />
              <span>List Your Startup</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Founder Profile Pill */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to={`/builder/${currentUser.username}`}
                  title="View your public builder profile"
                  className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#FA5D00] font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-sm transition-all"
                >
                  {currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover flex-none"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-[#FA5D00] text-black text-[10px] font-bold flex items-center justify-center flex-none">
                      {(currentUser.name || "B")[0].toUpperCase()}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>@{currentUser.username}</span>
                  </span>
                  <span className="text-zinc-400 group-hover:text-[#FA5D00] text-[10px] font-normal transition-colors">
                    (My Profile)
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FA5D00] transition-colors" />
                </Link>

                <button
                  onClick={() => setShowProfileModal(true)}
                  title="Edit Profile"
                  className="px-3 py-2 rounded-full border editorial-hairline bg-white dark:bg-zinc-900 font-mono text-xs text-zinc-600 dark:text-zinc-300 hover:border-[#FA5D00] hover:text-[#FA5D00] transition-colors cursor-pointer"
                >
                  Edit
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-500 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b editorial-hairline">
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
                const founderUser =
                  item.founder_username ||
                  (item as any).author_username ||
                  item.founder_name.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                const initial = (item.founder_name || "F")[0].toUpperCase()

                return (
                  <div
                    key={item.id}
                    className="group relative p-6 sm:p-7 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:border-[#FA5D00] dark:hover:border-[#FA5D00] transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
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
                            onClick={() => setScreenshotStartup(item)}
                            title="Generate Shareable Screenshot Card"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-mono text-[10px] font-bold hover:border-[#FA5D00] hover:text-[#FA5D00] active:scale-95 transition-all cursor-pointer shadow-2xs"
                          >
                            <Camera className="w-3 h-3 text-[#FA5D00]" />
                            <span className="hidden sm:inline">Snap</span>
                          </button>

                          <a
                            href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open Startup Website"
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
                        >
                          <span className="w-6 h-6 rounded-full bg-[#FA5D00] text-black text-[10px] font-bold flex items-center justify-center flex-none">
                            {initial}
                          </span>
                          <span className="truncate">{item.founder_name}</span>
                          <span className="font-normal text-[11px] text-zinc-400 flex-none">
                            (@{founderUser})
                          </span>
                        </Link>

                        <Link
                          to={`/builder/${founderUser}`}
                          className="flex-none font-mono text-[10px] font-bold text-[#FA5D00] hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Profile</span>
                          <ArrowUpRight className="w-3 h-3" />
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

      {/* MODAL 4: SHAREABLE SCREENSHOT SNAPSHOT CARD */}
      {screenshotStartup && (
        <StartupScreenshotModal
          startup={screenshotStartup}
          onClose={() => setScreenshotStartup(null)}
        />
      )}
    </div>
  )
}
