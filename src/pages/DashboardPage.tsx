"use client"

import * as React from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import confetti from "canvas-confetti"
import {
  Briefcase,
  Calendar,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  DollarSign,
  Tag,
  Check,
  CheckCircle2,
  AlertCircle,
  Building2,
  Globe,
  Clock,
  Layers,
  Sparkles,
  User,
  LogIn,
  ChevronRight,
  Eye,
  ArrowUpRight,
  Trophy,
  Rocket,
  Laptop,
  RefreshCw,
  X,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Brain,
  Workflow,
  Target,
  Settings,
  Share2,
} from "lucide-react"
import { usePageMeta } from "@/hooks/usePageMeta"
import { networkApi, type UserProfile, type BuilderJob, type BuilderHackathon } from "@/services/networkApi"
import { AdminDashboardView } from "@/components/AdminDashboardView"

type DashboardSection = "overview" | "jobs" | "post-job" | "hackathons" | "post-hackathon" | "startups" | "settings" | "admin"

export function DashboardPage() {
  usePageMeta({
    title: "Builder Console | Reco Labs",
    description: "Manage your engineering listings, post hackathons, and monitor guild telemetry from the Reco Labs console.",
    image: "/twitter-image.png",
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Section State
  const initialSection = (searchParams.get("tab") as DashboardSection) || "overview"
  const [activeSection, setActiveSection] = React.useState<DashboardSection>(initialSection)

  // Auth State
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null)
  const [authLoading, setAuthLoading] = React.useState(true)

  // Data States
  const [myJobs, setMyJobs] = React.useState<BuilderJob[]>([])
  const [myHackathons, setMyHackathons] = React.useState<BuilderHackathon[]>([])
  const [loadingData, setLoadingData] = React.useState(false)

  // Post Job Form State
  const [jobForm, setJobForm] = React.useState({
    title: "",
    company_name: "",
    company_logo: "",
    location: "Remote",
    is_remote: true,
    job_type: "Full-time",
    salary_range: "",
    skills: "",
    description: "",
    apply_url: "",
    is_featured: false,
  })
  const [submittingJob, setSubmittingJob] = React.useState(false)
  const [jobError, setJobError] = React.useState<string | null>(null)
  const [jobSuccess, setJobSuccess] = React.useState(false)

  // Post Hackathon Form State
  const [hackathonForm, setHackathonForm] = React.useState({
    name: "",
    tagline: "",
    description: "",
    banner_url: "",
    website: "",
    start_date: "",
    end_date: "",
    location: "Virtual",
    virtual: true,
    apac: false,
    prize_pool: "",
    eligibility: "Open to all builders",
    tags: "Hackathon, Software, Web3",
  })
  const [submittingHackathon, setSubmittingHackathon] = React.useState(false)
  const [hackathonError, setHackathonError] = React.useState<string | null>(null)
  const [hackathonSuccess, setHackathonSuccess] = React.useState(false)

  // Sync section with URL query
  React.useEffect(() => {
    const tabParam = searchParams.get("tab") as DashboardSection
    if (tabParam && ["overview", "jobs", "post-job", "hackathons", "post-hackathon", "startups", "settings", "admin"].includes(tabParam)) {
      setActiveSection(tabParam)
    }
  }, [searchParams])

  const setSection = (sec: DashboardSection) => {
    setActiveSection(sec)
    setSearchParams({ tab: sec })
  }

  // Load User and Listings
  const loadUserData = React.useCallback(async () => {
    setAuthLoading(true)
    const user = networkApi.getCurrentUser()
    setCurrentUser(user)
    setAuthLoading(false)

    if (user) {
      setLoadingData(true)
      try {
        const [jobs, hackathons] = await Promise.all([
          networkApi.getMyJobs(),
          networkApi.getMyHackathons(),
        ])
        setMyJobs(jobs)
        setMyHackathons(hackathons)
      } catch (err) {
        console.error("Error loading user dashboard data:", err)
      } finally {
        setLoadingData(false)
      }
    }
  }, [])

  React.useEffect(() => {
    loadUserData()
    const onAuth = () => loadUserData()
    window.addEventListener("reco_auth_changed", onAuth)
    return () => window.removeEventListener("reco_auth_changed", onAuth)
  }, [loadUserData])

  // Handle Post Job Submit
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    setSubmittingJob(true)
    setJobError(null)
    setJobSuccess(false)

    try {
      const res = await networkApi.createJob({
        ...jobForm,
        skills: jobForm.skills
          ? jobForm.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      })

      if (res.success && res.job) {
        setJobSuccess(true)
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } })
        setMyJobs((prev) => [res.job!, ...prev])
        setJobForm({
          title: "",
          company_name: "",
          company_logo: "",
          location: "Remote",
          is_remote: true,
          job_type: "Full-time",
          salary_range: "",
          skills: "",
          description: "",
          apply_url: "",
          is_featured: false,
        })
        setTimeout(() => {
          setSection("jobs")
          setJobSuccess(false)
        }, 1200)
      } else {
        setJobError(res.error || "Failed to create job listing.")
      }
    } catch (err: any) {
      setJobError(err.message || "An unexpected error occurred.")
    } finally {
      setSubmittingJob(false)
    }
  }

  // Handle Post Hackathon Submit
  const handlePostHackathon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    setSubmittingHackathon(true)
    setHackathonError(null)
    setHackathonSuccess(false)

    try {
      const res = await networkApi.createBuilderHackathon({
        ...hackathonForm,
        tags: hackathonForm.tags
          ? hackathonForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : ["Hackathon", "Builders"],
      })

      if (res.success && res.hackathon) {
        setHackathonSuccess(true)
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } })
        setMyHackathons((prev) => [res.hackathon!, ...prev])
        setHackathonForm({
          name: "",
          tagline: "",
          description: "",
          banner_url: "",
          website: "",
          start_date: "",
          end_date: "",
          location: "Virtual",
          virtual: true,
          apac: false,
          prize_pool: "",
          eligibility: "Open to all builders",
          tags: "Hackathon, Software, Web3",
        })
        setTimeout(() => {
          setSection("hackathons")
          setHackathonSuccess(false)
        }, 1200)
      } else {
        setHackathonError(res.error || "Failed to create hackathon listing.")
      }
    } catch (err: any) {
      setHackathonError(err.message || "An unexpected error occurred.")
    } finally {
      setSubmittingHackathon(false)
    }
  }

  // Toggle Job Status
  const handleToggleJob = async (job: BuilderJob) => {
    const nextStatus = !job.is_active
    const ok = await networkApi.toggleJobStatus(job.id, nextStatus)
    if (ok) {
      setMyJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, is_active: nextStatus } : j))
      )
    }
  }

  // Delete Job
  const handleDeleteJob = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this job listing?")) return
    const ok = await networkApi.deleteJob(id)
    if (ok) {
      setMyJobs((prev) => prev.filter((j) => j.id !== id))
    }
  }

  // Delete Hackathon
  const handleDeleteHackathon = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this hackathon listing?")) return
    const ok = await networkApi.deleteBuilderHackathon(id)
    if (ok) {
      setMyHackathons((prev) => prev.filter((h) => h.id !== id))
    }
  }

  // -------------------------------------------------------------
  // GUEST STATE (Reco Labs Editorial Style)
  // -------------------------------------------------------------
  if (!authLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-950 dark:text-zinc-50 pt-28 sm:pt-36 pb-24 px-6 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-[11px] font-bold uppercase tracking-wider text-[#FA5D00] shadow-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 fill-[#FA5D00]" />
            <span>RECO LABS BUILDER CONSOLE</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight leading-none">
            Post opportunities<span className="text-[#FA5D00]">.</span> Host hackathons<span className="text-[#FA5D00]">.</span>
          </h1>

          <p className="mt-6 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-2xl mx-auto">
            A single command station for founders and student hackers to publish engineering openings, schedule collegiate sprints, and recruit technical peers.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/network?signup=true")}
              className="px-8 py-3.5 rounded-full bg-[#FA5D00] hover:bg-[#e05300] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Join Guild & Access Console</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/network?login=true")}
              className="px-7 py-3.5 rounded-full border-2 border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:border-[#FA5D00] text-zinc-800 dark:text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              <span>Founder Sign In</span>
            </button>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40 shadow-xs">
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">TALENT POOL</span>
              <div className="font-serif text-4xl text-zinc-950 dark:text-zinc-50 mt-2">1,200+</div>
              <p className="font-sans text-xs text-zinc-500 mt-1">High school hackers and university engineers shipping production code.</p>
            </div>
            <div className="p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40 shadow-xs">
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">COMMUNITY HACKATHONS</span>
              <div className="font-serif text-4xl text-[#FA5D00] mt-2">100% Free</div>
              <p className="font-sans text-xs text-zinc-500 mt-1">Directly aggregated alongside global Hack Club sprint calendars.</p>
            </div>
            <div className="p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40 shadow-xs">
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">ZERO PLATFORM CUT</span>
              <div className="font-serif text-4xl text-zinc-950 dark:text-zinc-50 mt-2">0% Fee</div>
              <p className="font-sans text-xs text-zinc-500 mt-1">Candidates reach your apply link or Discord directly without middlemen.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // AUTHENTICATED CONSOLE WITH SLIM LEFT DOCK (media_1793634262262_92921083.png)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-950 dark:text-zinc-50 flex">
      
      {/* ======================================================== */}
      {/* 1. SLIM VERTICAL LEFT DOCK (Matching Screenshot media_...) */}
      {/* ======================================================== */}
      <aside className="w-18 sm:w-20 fixed left-0 top-0 bottom-0 z-40 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-between py-5 select-none shadow-xs">
        
        {/* Top: Squircle RECO Logo */}
        <div className="flex flex-col items-center gap-6">
          <Link
            to="/"
            className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-850 hover:bg-[#FA5D00] hover:text-black border border-zinc-200 dark:border-zinc-750 flex items-center justify-center p-2 transition-all shadow-xs group"
            title="Reco Labs Home"
          >
            <img
              src="/favicon.png"
              alt="Reco Logo"
              className="w-6 h-6 object-contain group-hover:scale-110 transition-transform"
            />
          </Link>

          {/* Core Navigation Icons Stack */}
          <nav className="flex flex-col items-center gap-2">
            
            {/* 1. Search / Public Directory */}
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group relative cursor-pointer"
              title="Search Opportunities"
            >
              <Search className="w-5 h-5" />
              <span className="hidden group-hover:block absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-black text-white dark:bg-zinc-800 text-[11px] font-mono whitespace-nowrap z-50 shadow-md">
                Find Roles
              </span>
            </button>

            {/* 2. Building / Startups Directory */}
            <button
              type="button"
              onClick={() => navigate("/network")}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group relative cursor-pointer"
              title="Founders Directory"
            >
              <Building2 className="w-5 h-5" />
              <span className="hidden group-hover:block absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-black text-white dark:bg-zinc-800 text-[11px] font-mono whitespace-nowrap z-50 shadow-md">
                Founders Directory
              </span>
            </button>

            {/* 3. Overview (Bar Chart) */}
            <button
              type="button"
              onClick={() => setSection("overview")}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all group relative cursor-pointer ${
                activeSection === "overview"
                  ? "bg-zinc-200/80 dark:bg-zinc-800 text-[#FA5D00] shadow-inner font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              title="Overview & Metrics"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden group-hover:block absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-black text-white dark:bg-zinc-800 text-[11px] font-mono whitespace-nowrap z-50 shadow-md">
                Overview
              </span>
            </button>

            {/* 4. My Jobs / Career Listings (Target) */}
            <button
              type="button"
              onClick={() => setSection("jobs")}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all group relative cursor-pointer ${
                activeSection === "jobs"
                  ? "bg-zinc-200/80 dark:bg-zinc-800 text-[#FA5D00] shadow-inner"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              title="My Jobs"
            >
              <Target className="w-5 h-5" />
              <span className="hidden group-hover:block absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-black text-white dark:bg-zinc-800 text-[11px] font-mono whitespace-nowrap z-50 shadow-md">
                My Job Listings ({myJobs.length})
              </span>
            </button>

            {/* 5. Post a Job (Plus on Target) */}
            <button
              type="button"
              onClick={() => setSection("post-job")}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all group relative cursor-pointer ${
                activeSection === "post-job"
                  ? "bg-[#FA5D00] text-black shadow-md"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-[#FA5D00] hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              title="Post a Job"
            >
              <Briefcase className="w-5 h-5" />
              <span className="hidden group-hover:block absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-black text-white dark:bg-zinc-800 text-[11px] font-mono whitespace-nowrap z-50 shadow-md">
                + Post a Job
              </span>
            </button>

            {/* 6. My Hackathons (Trophy / Sprint) */}
            <button
              type="button"
              onClick={() => setSection("hackathons")}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all group relative cursor-pointer ${
                activeSection === "hackathons"
                  ? "bg-zinc-200/80 dark:bg-zinc-800 text-[#FA5D00] shadow-inner"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              title="My Hackathons"
            >
              <Trophy className="w-5 h-5" />
              <span className="hidden group-hover:block absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-black text-white dark:bg-zinc-800 text-[11px] font-mono whitespace-nowrap z-50 shadow-md">
                My Hackathons ({myHackathons.length})
              </span>
            </button>

            {/* 7. Host a Hackathon (Calendar / Plus) */}
            <button
              type="button"
              onClick={() => setSection("post-hackathon")}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all group relative cursor-pointer ${
                activeSection === "post-hackathon"
                  ? "bg-[#FA5D00] text-black shadow-md"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-[#FA5D00] hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              title="Host Hackathon"
            >
              <Calendar className="w-5 h-5" />
              <span className="hidden group-hover:block absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-black text-white dark:bg-zinc-800 text-[11px] font-mono whitespace-nowrap z-50 shadow-md">
                + Host Hackathon
              </span>
            </button>

            {/* 8. Global Projects Catalogue */}
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group relative cursor-pointer"
              title="Projects Catalogue"
            >
              <Globe className="w-5 h-5" />
              <span className="hidden group-hover:block absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-black text-white dark:bg-zinc-800 text-[11px] font-mono whitespace-nowrap z-50 shadow-md">
                Projects Catalogue
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom: Settings Cog & User Avatar Squircle */}
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/about"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="About Reco Labs"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {/* User Squircle Avatar */}
          <Link
            to={`/builder/${currentUser?.username}`}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FA5D00] via-rose-500 to-amber-400 p-0.5 shadow-sm hover:scale-105 transition-transform"
            title={`View profile (@${currentUser?.username})`}
          >
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center text-zinc-950 dark:text-white font-mono font-bold text-xs">
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={"https://api.dicebear.com/7.x/identicon/svg?seed=" + encodeURIComponent(currentUser?.username || "builder")} alt={currentUser?.name || "Builder"} className="w-full h-full object-cover" />
              )}
            </div>
          </Link>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN DASHBOARD CANVAS (Shifted next to the left dock)   */}
      {/* ======================================================== */}
      <main className="flex-1 ml-18 sm:ml-20 min-h-screen py-10 px-6 sm:px-12 max-w-6xl">
        
        {/* Top Header Row */}
        <div className="pb-8 mb-8 border-b editorial-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] font-bold text-[#FA5D00] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#FA5D00] animate-pulse" />
              <span>FOUNDER CONSOLE · RECO LABS</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
              {activeSection === "overview" && "Console Overview."}
              {activeSection === "jobs" && "Your Career Postings."}
              {activeSection === "post-job" && "Publish Opportunity."}
              {activeSection === "hackathons" && "Your Hosted Hackathons."}
              {activeSection === "admin" && "Admin Master Console."}
              {activeSection === "post-hackathon" && "Schedule Hackathon."}
            </h1>
            <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Signed in as <strong className="text-zinc-900 dark:text-zinc-100">{currentUser?.name}</strong> (@{currentUser?.username}).
            </p>
          </div>

          {/* Quick Header Action Pills */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSection("post-job")}
              className={`px-5 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                activeSection === "post-job"
                  ? "bg-[#FA5D00] text-black shadow-sm"
                  : "bg-black text-white dark:bg-white dark:text-black hover:bg-[#FA5D00] dark:hover:bg-[#FA5D00] dark:hover:text-black"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>+ Post Job</span>
            </button>

            <button
              type="button"
              onClick={() => setSection("post-hackathon")}
              className={`px-5 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                activeSection === "post-hackathon"
                  ? "bg-[#FA5D00] text-black shadow-sm"
                  : "border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:border-[#FA5D00]"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[#FA5D00]" />
              <span>+ Host Event</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION: OVERVIEW                                             */}
        {/* ------------------------------------------------------------- */}
        {activeSection === "overview" && (
          <div className="space-y-8">
            
            {/* Stat Tiles in Signature Reco Editorial Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40 shadow-xs">
                <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
                  <span className="uppercase tracking-wider font-bold">ACTIVE JOB OPENINGS</span>
                  <Briefcase className="w-4 h-4 text-[#FA5D00]" />
                </div>
                <div className="font-serif text-5xl text-zinc-950 dark:text-zinc-50 mt-3">
                  {myJobs.filter((j) => j.is_active).length}
                </div>
                <div className="mt-3 font-mono text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <span>{myJobs.length} total created</span>
                  <span>·</span>
                  <button
                    onClick={() => setSection("jobs")}
                    className="text-[#FA5D00] hover:underline font-bold"
                  >
                    Manage
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40 shadow-xs">
                <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
                  <span className="uppercase tracking-wider font-bold">HACKATHONS HOSTED</span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div className="font-serif text-5xl text-zinc-950 dark:text-zinc-50 mt-3">
                  {myHackathons.length}
                </div>
                <div className="mt-3 font-mono text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <span>Live on collective feed</span>
                  <span>·</span>
                  <button
                    onClick={() => setSection("hackathons")}
                    className="text-[#FA5D00] hover:underline font-bold"
                  >
                    Manage
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40 shadow-xs">
                <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
                  <span className="uppercase tracking-wider font-bold">COLLECTIVE REACH</span>
                  <Globe className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="font-serif text-5xl text-zinc-950 dark:text-zinc-50 mt-3">
                  Global
                </div>
                <div className="mt-3 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Reco Labs & Hack Club aggregates</span>
                </div>
              </div>
            </div>

            {/* Split Grids: Recent Postings & Sprints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Jobs Card */}
              <div className="p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40">
                <div className="flex items-center justify-between pb-4 border-b editorial-hairline mb-4 font-mono">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#FA5D00]" />
                    <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                      Recent Jobs ({myJobs.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setSection("jobs")}
                    className="text-[11px] font-bold text-[#FA5D00] hover:underline"
                  >
                    View all ↗
                  </button>
                </div>

                {myJobs.length === 0 ? (
                  <div className="py-8 text-center font-mono text-xs text-zinc-400">
                    No jobs listed yet.
                    <button
                      onClick={() => setSection("post-job")}
                      className="block mx-auto mt-2 text-[#FA5D00] font-bold hover:underline"
                    >
                      + Create first listing
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="p-3.5 rounded-2xl border editorial-hairline hover:border-[#FA5D00] transition-colors flex items-center justify-between gap-3 font-mono"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {job.title}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {job.company_name} · {job.location}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-none ${
                          job.is_active ? "bg-[#FA5D00]/20 text-[#FA5D00]" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                        }`}>
                          {job.is_active ? "Active" : "Paused"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hackathons Card */}
              <div className="p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40">
                <div className="flex items-center justify-between pb-4 border-b editorial-hairline mb-4 font-mono">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                      Hosted Hackathons ({myHackathons.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setSection("hackathons")}
                    className="text-[11px] font-bold text-[#FA5D00] hover:underline"
                  >
                    View all ↗
                  </button>
                </div>

                {myHackathons.length === 0 ? (
                  <div className="py-8 text-center font-mono text-xs text-zinc-400">
                    No hackathons hosted yet.
                    <button
                      onClick={() => setSection("post-hackathon")}
                      className="block mx-auto mt-2 text-[#FA5D00] font-bold hover:underline"
                    >
                      + Host community hackathon
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myHackathons.slice(0, 3).map((h) => (
                      <div
                        key={h.id}
                        className="p-3.5 rounded-2xl border editorial-hairline hover:border-[#FA5D00] transition-colors flex items-center justify-between gap-3 font-mono"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {h.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {new Date(h.start_date).toLocaleDateString()} · {h.location || (h.virtual ? "Virtual" : "In-Person")}
                          </div>
                        </div>
                        {h.prize_pool && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-none">
                            {h.prize_pool}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION: MY JOBS                                              */}
        {/* ------------------------------------------------------------- */}
        {activeSection === "jobs" && (
          <div className="p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b editorial-hairline">
              <div>
                <h2 className="font-serif text-3xl text-zinc-950 dark:text-zinc-50">
                  Career Postings
                </h2>
                <p className="font-mono text-xs text-zinc-500 mt-1">
                  Manage applications, pause listings, or share direct apply links.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSection("post-job")}
                className="px-5 py-2 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Opening</span>
              </button>
            </div>

            {loadingData ? (
              <div className="py-16 text-center font-mono text-xs text-zinc-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#FA5D00]" />
                <span>Loading your postings...</span>
              </div>
            ) : myJobs.length === 0 ? (
              <div className="py-16 text-center">
                <Briefcase className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="font-serif text-2xl text-zinc-800 dark:text-zinc-200">
                  No active job listings
                </h3>
                <p className="font-mono text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  Publish an engineering role, contract gig, or paid internship to reach the Reco Labs collective.
                </p>
                <button
                  type="button"
                  onClick={() => setSection("post-job")}
                  className="mt-4 px-6 py-2.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post First Job</span>
                </button>
              </div>
            ) : (
              <div className="divide-y editorial-hairline">
                {myJobs.map((job) => (
                  <div
                    key={job.id}
                    className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                          {job.title}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            job.is_active
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {job.is_active ? "Active" : "Paused"}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {job.job_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1.5 flex-wrap font-mono">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          {job.company_name}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FA5D00]" />
                          {job.location}
                        </span>
                        {job.salary_range && (
                          <>
                            <span>·</span>
                            <span className="text-[#FA5D00] font-bold">
                              {job.salary_range}
                            </span>
                          </>
                        )}
                        <span>·</span>
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {job.skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border editorial-hairline text-zinc-600 dark:text-zinc-400"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-none">
                      <button
                        type="button"
                        onClick={() => handleToggleJob(job)}
                        className="px-3 py-1.5 rounded-full border editorial-hairline bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:border-[#FA5D00] transition-colors cursor-pointer"
                      >
                        {job.is_active ? "Pause" : "Activate"}
                      </button>

                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-full border editorial-hairline bg-zinc-100 dark:bg-zinc-850 hover:border-[#FA5D00] text-xs font-bold text-zinc-700 dark:text-zinc-200 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Apply Link</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id)}
                        aria-label="Delete job"
                        className="p-1.5 rounded-full border editorial-hairline text-zinc-400 hover:text-red-500 hover:border-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION: POST A JOB                                           */}
        {/* ------------------------------------------------------------- */}
        {activeSection === "post-job" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-7 p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40">
              <div className="pb-5 mb-5 border-b editorial-hairline">
                <h2 className="font-serif text-3xl text-zinc-950 dark:text-zinc-50">
                  Publish Career Opportunity
                </h2>
                <p className="font-mono text-xs text-zinc-500 mt-1">
                  List directly on the Reco Labs jobs board with instant candidate reach.
                </p>
              </div>

              {jobError && (
                <div className="p-3.5 mb-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-none" />
                  <span>{jobError}</span>
                </div>
              )}

              {jobSuccess && (
                <div className="p-3.5 mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-none" />
                  <span>Job published! Redirecting to listings...</span>
                </div>
              )}

              <form onSubmit={handlePostJob} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    JOB TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Founding Full-Stack Engineer, Rust Intern"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      COMPANY NAME *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Studio, Reco Guild"
                      value={jobForm.company_name}
                      onChange={(e) => setJobForm({ ...jobForm, company_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      COMPANY LOGO URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://.../logo.png"
                      value={jobForm.company_logo}
                      onChange={(e) => setJobForm({ ...jobForm, company_logo: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      ROLE TYPE
                    </label>
                    <select
                      value={jobForm.job_type}
                      onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                      <option value="Bounty">Bounty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      LOCATION
                    </label>
                    <input
                      type="text"
                      placeholder="Remote / Bengaluru"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      SALARY / STIPEND
                    </label>
                    <input
                      type="text"
                      placeholder="$80k-$120k / ₹50k/mo"
                      value={jobForm.salary_range}
                      onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    REQUIRED SKILLS (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Rust, WebGL, AI"
                    value={jobForm.skills}
                    onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    APPLICATION URL OR EMAIL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://.../apply or mailto:founders@studio.com"
                    value={jobForm.apply_url}
                    onChange={(e) => setJobForm({ ...jobForm, apply_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ROLE DESCRIPTION *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Outline what you are building, the architecture, and what the builder will ship in their first 30 days."
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    className="w-full p-4 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans focus:outline-none focus:border-[#FA5D00] resize-y"
                  />
                </div>

                {/* Listing Tier Selector */}
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    LISTING TIER *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setJobForm({ ...jobForm, is_featured: false })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        !jobForm.is_featured
                          ? "border-[#FA5D00] bg-orange-50/50 dark:bg-orange-950/20"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Community Role</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">FREE</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-snug">
                        Standard feed listing. Visible to all guild builders.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setJobForm({ ...jobForm, is_featured: true })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        jobForm.is_featured
                          ? "border-[#FA5D00] bg-orange-500/10 dark:bg-orange-950/40 shadow-sm shadow-[#FA5D00]/10"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-[#FA5D00] flex items-center gap-1">
                          <span>⚡ Featured Guild Role</span>
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#FA5D00] text-black font-extrabold">$99 / ₹3,499</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-snug">
                        Pinned to top of /jobs · Glowing flame border · 5x views.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingJob}
                    className="px-8 py-3 rounded-full bg-[#FA5D00] hover:bg-[#e05300] disabled:opacity-60 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                  >
                    {submittingJob ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <span>Publish Listing</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Card */}
            <div className="xl:col-span-5">
              <div className="sticky top-10 space-y-3 font-mono">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                  LIVE CARD PREVIEW
                </span>

                <div className="p-6 rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#111113] shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border editorial-hairline flex items-center justify-center overflow-hidden flex-none">
                        {jobForm.company_logo ? (
                          <img
                            src={jobForm.company_logo}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-[#FA5D00]" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-serif text-xl text-zinc-950 dark:text-white leading-tight">
                          {jobForm.title || "Job Title Goes Here"}
                        </h3>
                        <div className="text-xs text-zinc-500 font-mono">
                          {jobForm.company_name || "Company Name"}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FA5D00] text-black">
                      {jobForm.job_type}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FA5D00]" />
                      {jobForm.location || "Remote"}
                    </span>
                    {jobForm.salary_range && (
                      <>
                        <span>·</span>
                        <span className="text-[#FA5D00] font-bold">
                          {jobForm.salary_range}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-3 font-sans text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {jobForm.description || "The role overview and description will appear formatted here for candidates to review."}
                  </p>

                  <div className="mt-5 pt-4 border-t editorial-hairline flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      By @{currentUser?.username || "you"}
                    </span>
                    <div className="px-4 py-1.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold inline-flex items-center gap-1 pointer-events-none">
                      <span>Apply</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION: MY HACKATHONS                                        */}
        {/* ------------------------------------------------------------- */}
        {activeSection === "hackathons" && (
          <div className="p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b editorial-hairline">
              <div>
                <h2 className="font-serif text-3xl text-zinc-950 dark:text-zinc-50">
                  Hosted Hackathons
                </h2>
                <p className="font-mono text-xs text-zinc-500 mt-1">
                  Events hosted by you, featured live on the global Reco Labs calendar.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSection("post-hackathon")}
                className="px-5 py-2 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Host Hackathon</span>
              </button>
            </div>

            {loadingData ? (
              <div className="py-16 text-center font-mono text-xs text-zinc-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#FA5D00]" />
                <span>Loading your events...</span>
              </div>
            ) : myHackathons.length === 0 ? (
              <div className="py-16 text-center">
                <Trophy className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="font-serif text-2xl text-zinc-800 dark:text-zinc-200">
                  No hackathons hosted yet
                </h3>
                <p className="font-mono text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  Are you organizing a sprint, university jam, or hardware weekend? List it here for free.
                </p>
                <button
                  type="button"
                  onClick={() => setSection("post-hackathon")}
                  className="mt-4 px-6 py-2.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Hackathon</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 font-mono">
                {myHackathons.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-3xl border editorial-hairline p-5 hover:border-[#FA5D00] transition-colors flex flex-col justify-between bg-white dark:bg-[#111113]"
                  >
                    <div>
                      {h.banner_url && (
                        <div className="h-32 w-full rounded-2xl overflow-hidden mb-3.5 bg-zinc-900">
                          <img
                            src={h.banner_url}
                            alt={h.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif text-2xl text-zinc-950 dark:text-white">
                          {h.name}
                        </h3>
                        {h.prize_pool && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            {h.prize_pool}
                          </span>
                        )}
                      </div>

                      {h.tagline && (
                        <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                          {h.tagline}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#FA5D00]" />
                          {new Date(h.start_date).toLocaleDateString()}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FA5D00]" />
                          {h.location || (h.virtual ? "Virtual" : "In-Person")}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t editorial-hairline flex items-center justify-between">
                      <a
                        href={h.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#FA5D00] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Official Link</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteHackathon(h.id)}
                        className="p-1.5 rounded-full text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION: POST A HACKATHON                                     */}
        {/* ------------------------------------------------------------- */}
        {activeSection === "post-hackathon" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-7 p-6 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40 font-mono text-xs">
              <div className="pb-5 mb-5 border-b editorial-hairline">
                <h2 className="font-serif text-3xl text-zinc-950 dark:text-zinc-50">
                  Host Community Hackathon
                </h2>
                <p className="font-mono text-xs text-zinc-500 mt-1">
                  Feature your hackathon directly on the Reco Labs calendar alongside Hack Club events.
                </p>
              </div>

              {hackathonError && (
                <div className="p-3.5 mb-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-none" />
                  <span>{hackathonError}</span>
                </div>
              )}

              {hackathonSuccess && (
                <div className="p-3.5 mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-none" />
                  <span>Hackathon listed live! Redirecting...</span>
                </div>
              )}

              <form onSubmit={handlePostHackathon} className="space-y-4">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    HACKATHON NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Sprint 2026, Hardware Jam Tokyo"
                    value={hackathonForm.name}
                    onChange={(e) => setHackathonForm({ ...hackathonForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    TAGLINE / THEME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 36 hours building autonomous agents and hardware rigs"
                    value={hackathonForm.tagline}
                    onChange={(e) => setHackathonForm({ ...hackathonForm, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      START DATE *
                    </label>
                    <input
                      type="date"
                      required
                      value={hackathonForm.start_date}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, start_date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      END DATE *
                    </label>
                    <input
                      type="date"
                      required
                      value={hackathonForm.end_date}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, end_date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      LOCATION / CITY
                    </label>
                    <input
                      type="text"
                      placeholder="Virtual / Bengaluru / San Francisco"
                      value={hackathonForm.location}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      PRIZE POOL
                    </label>
                    <input
                      type="text"
                      placeholder="$10,000 or ₹2,00,000 in Grants"
                      value={hackathonForm.prize_pool}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, prize_pool: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      OFFICIAL WEBSITE / REGISTRATION URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://... or luma.com/..."
                      value={hackathonForm.website}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, website: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      BANNER IMAGE URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://.../banner.png"
                      value={hackathonForm.banner_url}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, banner_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hackathonForm.virtual}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, virtual: e.target.checked })}
                      className="rounded accent-[#FA5D00]"
                    />
                    <span>VIRTUAL / ONLINE ATTENDANCE</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hackathonForm.apac}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, apac: e.target.checked })}
                      className="rounded accent-[#FA5D00]"
                    />
                    <span>APAC / INDIA REGION</span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    DESCRIPTION / TRACKS
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe mentors, tracks, hardware provided, and eligibility criteria."
                    value={hackathonForm.description}
                    onChange={(e) => setHackathonForm({ ...hackathonForm, description: e.target.value })}
                    className="w-full p-4 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans focus:outline-none focus:border-[#FA5D00] resize-y"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingHackathon}
                    className="px-8 py-3 rounded-full bg-[#FA5D00] hover:bg-[#e05300] disabled:opacity-60 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                  >
                    {submittingHackathon ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <span>Publish Event</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Hackathon Preview Card */}
            <div className="xl:col-span-5">
              <div className="sticky top-10 space-y-3 font-mono">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                  CALENDAR CARD PREVIEW
                </span>

                <div className="p-6 rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#111113] shadow-md">
                  {hackathonForm.banner_url ? (
                    <div className="h-36 w-full rounded-2xl overflow-hidden mb-4 bg-zinc-900">
                      <img
                        src={hackathonForm.banner_url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  ) : (
                    <div className="h-28 w-full rounded-2xl mb-4 bg-gradient-to-br from-[#FA5D00]/15 via-zinc-200 to-amber-500/10 dark:from-zinc-900 dark:to-zinc-800 border editorial-hairline flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-[#FA5D00]" />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FA5D00] text-black">
                      BUILDER HOSTED
                    </span>
                    {hackathonForm.prize_pool && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        {hackathonForm.prize_pool}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2.5 font-serif text-2xl text-zinc-950 dark:text-white leading-snug">
                    {hackathonForm.name || "Hackathon Name"}
                  </h3>

                  <p className="mt-1 font-sans text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {hackathonForm.tagline || hackathonForm.description || "The tagline or description will appear on the calendar preview."}
                  </p>

                  <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#FA5D00]" />
                      {hackathonForm.start_date || "Start Date"}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FA5D00]" />
                      {hackathonForm.location || (hackathonForm.virtual ? "Virtual" : "In-Person")}
                    </span>
                  </div>

                  <div className="mt-5 pt-4 border-t editorial-hairline flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      By @{currentUser?.username || "you"}
                    </span>
                    <div className="px-4 py-1.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold inline-flex items-center gap-1 pointer-events-none">
                      <span>Register</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* 6. ADMIN MASTER CONSOLE */}
        {activeSection === "admin" && (
          <AdminDashboardView currentUser={currentUser} />
        )}
      </main>
    </div>
  )
}

export default DashboardPage
