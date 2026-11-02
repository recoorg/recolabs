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
} from "lucide-react"
import { usePageMeta } from "@/hooks/usePageMeta"
import { networkApi, type UserProfile, type BuilderJob, type BuilderHackathon } from "@/services/networkApi"

type DashboardTab = "overview" | "my-jobs" | "post-job" | "my-hackathons" | "post-hackathon"

export function DashboardPage() {
  usePageMeta({
    title: "Builder Dashboard | Reco Labs",
    description: "Post, manage, and scale technical opportunities, internships, and community hackathons across the Reco Labs builder collective.",
    image: "/twitter-image.png",
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Tab State
  const initialTab = (searchParams.get("tab") as DashboardTab) || "overview"
  const [activeTab, setActiveTab] = React.useState<DashboardTab>(initialTab)

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

  // Sync tab with URL
  React.useEffect(() => {
    const tabParam = searchParams.get("tab") as DashboardTab
    if (tabParam && ["overview", "my-jobs", "post-job", "my-hackathons", "post-hackathon"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const setTab = (tab: DashboardTab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
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
        })
        setTimeout(() => {
          setTab("my-jobs")
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
          setTab("my-hackathons")
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
  // GUEST STATE (Tracwell Spec Hero & Conversion Card)
  // -------------------------------------------------------------
  if (!authLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#f4f4f5] pt-28 sm:pt-36 pb-24 px-6 sm:px-8">
        <div className="max-w-[960px] mx-auto">
          {/* Centered Hero with Two CTAs (Tracwell Section 1) */}
          <div className="py-12 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4f4f5] dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#357dff] animate-pulse" />
              <span>Reco Labs Builder Platform</span>
            </div>

            <h1 className="font-sans text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#0a0a0a] dark:text-white max-w-3xl mx-auto">
              Post jobs. Host hackathons. Build alongside makers.
            </h1>

            <p className="font-sans text-base sm:text-lg font-medium leading-relaxed text-[#0a0a0a]/80 dark:text-zinc-300 max-w-2xl mx-auto mt-6">
              A single dashboard for founders, technical organizers, and engineering teams to recruit high-signal builders and publish community hackathons.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/network?signup=true")}
                className="h-12 px-7 rounded-full bg-[#357dff] hover:bg-[#2563eb] text-white font-sans text-sm font-semibold tracking-normal transition-all shadow-sm active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Join the Guild & Post</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/network?login=true")}
                className="h-12 px-7 rounded-full bg-[#f4f4f5] dark:bg-zinc-800 hover:bg-[#eaeaea] dark:hover:bg-zinc-700 text-[#18181b] dark:text-white font-sans text-sm font-semibold tracking-normal transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Founder Sign In</span>
              </button>
            </div>
          </div>

          {/* Dashboard Preview Card (Tracwell Section 2) */}
          <div className="mt-4 rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-7">
              <div className="p-5 rounded-[14px] bg-[#fafafa] dark:bg-zinc-900/60 border border-[#e5e5e5] dark:border-zinc-800">
                <span className="text-xs font-medium text-zinc-500">Talent Pool</span>
                <div className="text-3xl font-semibold tracking-tight text-[#0a0a0a] dark:text-white mt-1">1,200+</div>
                <span className="text-xs text-[#357dff] font-medium mt-1 inline-block">Active student hackers & devs</span>
              </div>
              <div className="p-5 rounded-[14px] bg-[#fafafa] dark:bg-zinc-900/60 border border-[#e5e5e5] dark:border-zinc-800">
                <span className="text-xs font-medium text-zinc-500">Live Hackathons</span>
                <div className="text-3xl font-semibold tracking-tight text-[#0a0a0a] dark:text-white mt-1">100% Free</div>
                <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Instant discovery in collective feed</span>
              </div>
              <div className="p-5 rounded-[14px] bg-[#fafafa] dark:bg-zinc-900/60 border border-[#e5e5e5] dark:border-zinc-800">
                <span className="text-xs font-medium text-zinc-500">Direct Inquiries</span>
                <div className="text-3xl font-semibold tracking-tight text-[#0a0a0a] dark:text-white mt-1">0% Cut</div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-1 inline-block">Direct apply links & Discord handoffs</span>
              </div>
            </div>

            <div className="text-center py-6 border-t border-[#e5e5e5] dark:border-zinc-800">
              <p className="text-xs text-zinc-500">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/network?login=true")}
                  className="text-[#357dff] hover:underline font-semibold"
                >
                  Log in to access your listings
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // AUTHENTICATED BUILDER DASHBOARD (Tracwell Architecture)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#0a0a0a] dark:text-[#f4f4f5] pt-24 sm:pt-30 pb-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-6 border-b border-[#e5e5e5] dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#357dff]" />
              <span className="text-xs font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
                Reco Labs Console
              </span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-[#0a0a0a] dark:text-white">
              Builder Hub & Listings
            </h1>
            <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Welcome back, <strong className="text-zinc-900 dark:text-zinc-100">@{currentUser?.username}</strong>. Manage your career openings and hackathons.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setTab("post-job")}
              className={`h-12 px-6 rounded-full font-sans text-sm font-semibold tracking-normal transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer ${
                activeTab === "post-job"
                  ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-black"
                  : "bg-[#357dff] hover:bg-[#2563eb] text-white shadow-sm"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Post a Job</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("post-hackathon")}
              className={`h-12 px-6 rounded-full font-sans text-sm font-semibold tracking-normal transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer ${
                activeTab === "post-hackathon"
                  ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-black"
                  : "bg-[#f4f4f5] dark:bg-zinc-800 hover:bg-[#eaeaea] dark:hover:bg-zinc-700 text-[#18181b] dark:text-white"
              }`}
            >
              <Trophy className="w-4 h-4 text-[#357dff]" />
              <span>Host Hackathon</span>
            </button>

            <Link
              to="/network"
              className="h-12 px-5 rounded-full border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 text-xs font-semibold text-zinc-700 dark:text-zinc-300 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Guild</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3 Metric Stat Tiles (Tracwell 18px Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Tile 1 */}
          <div className="rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Jobs</span>
              <div className="w-8 h-8 rounded-full bg-[#f4f4f5] dark:bg-zinc-800 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-[#357dff]" />
              </div>
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-[#0a0a0a] dark:text-white">
              {myJobs.filter((j) => j.is_active).length}
            </div>
            <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5">
              <span>{myJobs.length} total listed</span>
              <span>·</span>
              <button
                onClick={() => setTab("my-jobs")}
                className="text-[#357dff] hover:underline font-medium"
              >
                Manage
              </button>
            </div>
          </div>

          {/* Tile 2 */}
          <div className="rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Hackathons Hosted</span>
              <div className="w-8 h-8 rounded-full bg-[#f4f4f5] dark:bg-zinc-800 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-[#0a0a0a] dark:text-white">
              {myHackathons.length}
            </div>
            <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5">
              <span>Published on Reco feed</span>
              <span>·</span>
              <button
                onClick={() => setTab("my-hackathons")}
                className="text-[#357dff] hover:underline font-medium"
              >
                Manage
              </button>
            </div>
          </div>

          {/* Tile 3 */}
          <div className="rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Candidate Network</span>
              <div className="w-8 h-8 rounded-full bg-[#f4f4f5] dark:bg-zinc-800 flex items-center justify-center">
                <Globe className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-[#0a0a0a] dark:text-white">
              Global
            </div>
            <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Live on Reco Labs & Hack Club aggregates</span>
            </div>
          </div>
        </div>

        {/* Dashboard Frame (Left Navigation Rail 240px + Main Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Rail (Tracwell 240px chrome) */}
          <div className="lg:col-span-3">
            <div className="rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] sticky top-28">
              <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Management
              </div>

              <div className="space-y-1 mt-1">
                <button
                  type="button"
                  onClick={() => setTab("overview")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-[#357dff] text-white"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-[#f4f4f5] dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" />
                    <span>Overview</span>
                  </div>
                  {activeTab === "overview" && <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTab("my-jobs")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === "my-jobs"
                      ? "bg-[#357dff] text-white"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-[#f4f4f5] dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4" />
                    <span>My Jobs</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "my-jobs" ? "bg-white/20 text-white" : "bg-[#f4f4f5] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                    {myJobs.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab("post-job")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === "post-job"
                      ? "bg-[#357dff] text-white"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-[#f4f4f5] dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4" />
                    <span>Post a Job</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold">
                    NEW
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab("my-hackathons")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === "my-hackathons"
                      ? "bg-[#357dff] text-white"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-[#f4f4f5] dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-4 h-4" />
                    <span>My Hackathons</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "my-hackathons" ? "bg-white/20 text-white" : "bg-[#f4f4f5] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                    {myHackathons.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab("post-hackathon")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === "post-hackathon"
                      ? "bg-[#357dff] text-white"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-[#f4f4f5] dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4" />
                    <span>Host Hackathon</span>
                  </div>
                </button>
              </div>

              {/* Public Views Links */}
              <div className="mt-6 pt-5 border-t border-[#e5e5e5] dark:border-zinc-800 px-3">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Public Feeds
                </div>
                <div className="space-y-1.5">
                  <Link
                    to="/jobs"
                    className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#357dff] transition-colors"
                  >
                    <span>View Jobs Board</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                  <Link
                    to="/hackathons"
                    className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#357dff] transition-colors"
                  >
                    <span>View Hackathons Board</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                  <Link
                    to={`/builder/${currentUser?.username}`}
                    className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#357dff] transition-colors"
                  >
                    <span>My Public Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Content Area (Tracwell 18px Card Container) */}
          <div className="lg:col-span-9">
            
            {/* ----------------------------------------------------------- */}
            {/* TAB: OVERVIEW */}
            {/* ----------------------------------------------------------- */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Welcome Card */}
                <div className="rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-[#0a0a0a] dark:text-white">
                        Founder Activity Center
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Post opportunities for collegiate engineers or schedule regional hackathons. Your postings appear live across the collective.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-none">
                      <button
                        type="button"
                        onClick={() => setTab("post-job")}
                        className="h-10 px-5 rounded-full bg-[#357dff] hover:bg-[#2563eb] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Post Job</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab("post-hackathon")}
                        className="h-10 px-5 rounded-full bg-[#f4f4f5] dark:bg-zinc-800 hover:bg-[#eaeaea] dark:hover:bg-zinc-700 text-[#18181b] dark:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5 text-[#357dff]" />
                        <span>Host Event</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Split Row: Recent Jobs & Recent Hackathons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Recent Jobs Preview */}
                  <div className="rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#357dff]" />
                        <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
                          Your Active Jobs ({myJobs.length})
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTab("my-jobs")}
                        className="text-xs text-[#357dff] hover:underline font-semibold"
                      >
                        View all
                      </button>
                    </div>

                    {myJobs.length === 0 ? (
                      <div className="text-center py-10 px-4 rounded-xl bg-[#fafafa] dark:bg-zinc-900/40 border border-dashed border-[#e5e5e5] dark:border-zinc-800">
                        <p className="text-xs text-zinc-500">No jobs posted yet.</p>
                        <button
                          type="button"
                          onClick={() => setTab("post-job")}
                          className="mt-3 text-xs text-[#357dff] font-semibold hover:underline"
                        >
                          + Create your first job listing
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myJobs.slice(0, 3).map((job) => (
                          <div
                            key={job.id}
                            className="p-3.5 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#0a0a0a] dark:text-white truncate">
                                {job.title}
                              </div>
                              <div className="text-[11px] text-zinc-500 truncate">
                                {job.company_name} · {job.location}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-none ${
                                job.is_active
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                              }`}
                            >
                              {job.is_active ? "Active" : "Paused"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Hackathons Preview */}
                  <div className="rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
                          Your Hackathons ({myHackathons.length})
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTab("my-hackathons")}
                        className="text-xs text-[#357dff] hover:underline font-semibold"
                      >
                        View all
                      </button>
                    </div>

                    {myHackathons.length === 0 ? (
                      <div className="text-center py-10 px-4 rounded-xl bg-[#fafafa] dark:bg-zinc-900/40 border border-dashed border-[#e5e5e5] dark:border-zinc-800">
                        <p className="text-xs text-zinc-500">No hackathons hosted yet.</p>
                        <button
                          type="button"
                          onClick={() => setTab("post-hackathon")}
                          className="mt-3 text-xs text-[#357dff] font-semibold hover:underline"
                        >
                          + Host a community hackathon
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myHackathons.slice(0, 3).map((h) => (
                          <div
                            key={h.id}
                            className="p-3.5 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#0a0a0a] dark:text-white truncate">
                                {h.name}
                              </div>
                              <div className="text-[11px] text-zinc-500 truncate">
                                {new Date(h.start_date).toLocaleDateString()} · {h.location || (h.virtual ? "Virtual" : "In-Person")}
                              </div>
                            </div>
                            {h.prize_pool && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex-none">
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

            {/* ----------------------------------------------------------- */}
            {/* TAB: MY JOBS */}
            {/* ----------------------------------------------------------- */}
            {activeTab === "my-jobs" && (
              <div className="rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0a0a0a] dark:text-white">
                      Your Career Postings
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                      Manage listings, pause applications, or share direct apply links.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTab("post-job")}
                    className="h-10 px-5 rounded-full bg-[#357dff] hover:bg-[#2563eb] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Listing</span>
                  </button>
                </div>

                {loadingData ? (
                  <div className="py-16 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#357dff]" />
                    <span>Loading your job postings...</span>
                  </div>
                ) : myJobs.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#f4f4f5] dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-6 h-6 text-zinc-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      No jobs currently posted
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                      Post an engineering role, contract gig, or paid internship to reach the Reco Labs builder collective.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab("post-job")}
                      className="mt-4 h-10 px-6 rounded-full bg-[#357dff] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Post Your First Job</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#e5e5e5] dark:divide-zinc-800">
                    {myJobs.map((job) => (
                      <div
                        key={job.id}
                        className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
                              {job.title}
                            </h3>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                job.is_active
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                              }`}
                            >
                              {job.is_active ? "Accepting Applicants" : "Closed / Paused"}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f4f4f5] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                              {job.job_type}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1.5 flex-wrap">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                              {job.company_name}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                            {job.salary_range && (
                              <>
                                <span>·</span>
                                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                                  {job.salary_range}
                                </span>
                              </>
                            )}
                            <span>·</span>
                            <span>Listed {new Date(job.created_at).toLocaleDateString()}</span>
                          </div>

                          {job.skills && job.skills.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {job.skills.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#fafafa] dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono"
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
                            className="h-9 px-3.5 rounded-full border border-[#e5e5e5] dark:border-zinc-800 bg-[#f4f4f5] dark:bg-zinc-800 hover:border-zinc-400 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                          >
                            {job.is_active ? "Pause" : "Activate"}
                          </button>

                          <a
                            href={job.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-3.5 rounded-full border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 text-xs font-semibold text-zinc-700 dark:text-zinc-200 inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Apply Link</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteJob(job.id)}
                            aria-label="Delete job listing"
                            className="w-9 h-9 rounded-full border border-[#e5e5e5] dark:border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-300 transition-colors flex items-center justify-center cursor-pointer"
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

            {/* ----------------------------------------------------------- */}
            {/* TAB: POST A JOB */}
            {/* ----------------------------------------------------------- */}
            {activeTab === "post-job" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Form Column */}
                <div className="xl:col-span-7 rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="pb-5 mb-5 border-b border-[#e5e5e5] dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-[#0a0a0a] dark:text-white">
                      Publish a Career Opportunity
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                      Post an engineering, product, or design opening directly to the Reco Labs board.
                    </p>
                  </div>

                  {jobError && (
                    <div className="p-3.5 mb-5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-none" />
                      <span>{jobError}</span>
                    </div>
                  )}

                  {jobSuccess && (
                    <div className="p-3.5 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-none" />
                      <span>Job posted successfully! Redirecting to your active listings...</span>
                    </div>
                  )}

                  <form onSubmit={handlePostJob} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Full-Stack Engineer, Founding Designer, Rust Intern"
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Company / Studio Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Acme Studio, Reco Labs Guild"
                          value={jobForm.company_name}
                          onChange={(e) => setJobForm({ ...jobForm, company_name: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Company Logo URL (Optional)
                        </label>
                        <input
                          type="url"
                          placeholder="https://.../logo.png"
                          value={jobForm.company_logo}
                          onChange={(e) => setJobForm({ ...jobForm, company_logo: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Role Type
                        </label>
                        <select
                          value={jobForm.job_type}
                          onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                          className="w-full h-11 px-3.5 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white focus:outline-none focus:border-[#357dff]"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Internship">Internship</option>
                          <option value="Contract">Contract / Freelance</option>
                          <option value="Bounty">Bounty / Grant</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="Remote / San Francisco, CA"
                          value={jobForm.location}
                          onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Salary / Stipend
                        </label>
                        <input
                          type="text"
                          placeholder="$80k - $120k or $2k/mo"
                          value={jobForm.salary_range}
                          onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Required Skills / Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="React, TypeScript, Rust, Next.js, WebGL"
                        value={jobForm.skills}
                        onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Application URL / Email Link *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="https://.../apply or mailto:founder@studio.com"
                        value={jobForm.apply_url}
                        onChange={(e) => setJobForm({ ...jobForm, apply_url: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Role Description & What You Are Building *
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Describe the problem, the tech stack, what the candidate will build in their first 30 days, and how to stand out."
                        value={jobForm.description}
                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                        className="w-full p-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff] resize-y"
                      />
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={submittingJob}
                        className="h-12 px-8 rounded-full bg-[#357dff] hover:bg-[#2563eb] disabled:opacity-60 text-white font-sans text-sm font-semibold tracking-normal transition-all shadow-sm active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                      >
                        {submittingJob ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Publishing to Board...</span>
                          </>
                        ) : (
                          <>
                            <span>Publish Job Listing</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Card Preview Column */}
                <div className="xl:col-span-5">
                  <div className="sticky top-28 space-y-3">
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                      Live Listing Preview
                    </div>

                    <div className="rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#fafafa] dark:bg-zinc-800 border border-[#e5e5e5] dark:border-zinc-700 flex items-center justify-center overflow-hidden flex-none">
                            {jobForm.company_logo ? (
                              <img
                                src={jobForm.company_logo}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.style.display = "none")}
                              />
                            ) : (
                              <Building2 className="w-6 h-6 text-[#357dff]" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
                              {jobForm.title || "Job Title Goes Here"}
                            </h3>
                            <div className="text-xs text-zinc-500">
                              {jobForm.company_name || "Company Name"}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#357dff] border border-blue-200 dark:border-blue-900">
                          {jobForm.job_type}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {jobForm.location || "Remote"}
                        </span>
                        {jobForm.salary_range && (
                          <>
                            <span>·</span>
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                              {jobForm.salary_range}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {jobForm.description || "The role overview and description will be formatted here for candidates to review."}
                      </p>

                      {jobForm.skills && (
                        <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
                          {jobForm.skills.split(",").map((s, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#f4f4f5] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono"
                            >
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 pt-4 border-t border-[#e5e5e5] dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400">
                          By @{currentUser?.username || "you"}
                        </span>
                        <div className="h-9 px-4 rounded-full bg-[#357dff] text-white text-xs font-semibold inline-flex items-center gap-1 pointer-events-none">
                          <span>Apply</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ----------------------------------------------------------- */}
            {/* TAB: MY HACKATHONS */}
            {/* ----------------------------------------------------------- */}
            {activeTab === "my-hackathons" && (
              <div className="rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0a0a0a] dark:text-white">
                      Your Hosted Hackathons
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                      Hackathons submitted by you, featured on the public collective calendar.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTab("post-hackathon")}
                    className="h-10 px-5 rounded-full bg-[#357dff] hover:bg-[#2563eb] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Host New Event</span>
                  </button>
                </div>

                {loadingData ? (
                  <div className="py-16 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#357dff]" />
                    <span>Loading your hackathons...</span>
                  </div>
                ) : myHackathons.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#f4f4f5] dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-zinc-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      No hackathons hosted yet
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                      Are you organizing a high school sprint, university buildathon, or virtual jam? List it here for free.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab("post-hackathon")}
                      className="mt-4 h-10 px-6 rounded-full bg-[#357dff] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Publish Your Hackathon</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                    {myHackathons.map((h) => (
                      <div
                        key={h.id}
                        className="rounded-2xl border border-[#e5e5e5] dark:border-zinc-800 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          {h.banner_url && (
                            <div className="h-32 w-full rounded-xl overflow-hidden mb-3.5 bg-zinc-900">
                              <img
                                src={h.banner_url}
                                alt={h.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
                              {h.name}
                            </h3>
                            {h.prize_pool && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                                {h.prize_pool}
                              </span>
                            )}
                          </div>

                          {h.tagline && (
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                              {h.tagline}
                            </p>
                          )}

                          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(h.start_date).toLocaleDateString()}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {h.location || (h.virtual ? "Virtual" : "In-Person")}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-[#e5e5e5] dark:border-zinc-800 flex items-center justify-between">
                          <a
                            href={h.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#357dff] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Website</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteHackathon(h.id)}
                            aria-label="Delete hackathon"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
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

            {/* ----------------------------------------------------------- */}
            {/* TAB: POST A HACKATHON */}
            {/* ----------------------------------------------------------- */}
            {activeTab === "post-hackathon" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Form Column */}
                <div className="xl:col-span-7 rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="pb-5 mb-5 border-b border-[#e5e5e5] dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-[#0a0a0a] dark:text-white">
                      Host & List a Hackathon
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                      Mix your hackathon directly into the Reco Labs Hackathons feed alongside Hack Club events.
                    </p>
                  </div>

                  {hackathonError && (
                    <div className="p-3.5 mb-5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-none" />
                      <span>{hackathonError}</span>
                    </div>
                  )}

                  {hackathonSuccess && (
                    <div className="p-3.5 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-none" />
                      <span>Hackathon published live! Redirecting to your hosted events...</span>
                    </div>
                  )}

                  <form onSubmit={handlePostHackathon} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Hackathon Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Hack 2026, Hardware Jam Tokyo"
                        value={hackathonForm.name}
                        onChange={(e) => setHackathonForm({ ...hackathonForm, name: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Tagline / Catchphrase
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 36 hours of autonomous robotics and web agents"
                        value={hackathonForm.tagline}
                        onChange={(e) => setHackathonForm({ ...hackathonForm, tagline: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={hackathonForm.start_date}
                          onChange={(e) => setHackathonForm({ ...hackathonForm, start_date: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white focus:outline-none focus:border-[#357dff]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          End Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={hackathonForm.end_date}
                          onChange={(e) => setHackathonForm({ ...hackathonForm, end_date: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white focus:outline-none focus:border-[#357dff]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Location / Format
                        </label>
                        <input
                          type="text"
                          placeholder="Virtual / Bengaluru, India / San Francisco"
                          value={hackathonForm.location}
                          onChange={(e) => setHackathonForm({ ...hackathonForm, location: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Prize Pool / Grants (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="$10,000 or ₹2,00,000 + Swag"
                          value={hackathonForm.prize_pool}
                          onChange={(e) => setHackathonForm({ ...hackathonForm, prize_pool: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Official Website / Registration URL *
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="https://... or luma.com/..."
                          value={hackathonForm.website}
                          onChange={(e) => setHackathonForm({ ...hackathonForm, website: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Banner Image URL (Optional)
                        </label>
                        <input
                          type="url"
                          placeholder="https://.../banner.png"
                          value={hackathonForm.banner_url}
                          onChange={(e) => setHackathonForm({ ...hackathonForm, banner_url: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={hackathonForm.virtual}
                          onChange={(e) => setHackathonForm({ ...hackathonForm, virtual: e.target.checked })}
                          className="rounded text-[#357dff] focus:ring-[#357dff]"
                        />
                        <span>Virtual / Online Attendance</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={hackathonForm.apac}
                          onChange={(e) => setHackathonForm({ ...hackathonForm, apac: e.target.checked })}
                          className="rounded text-[#357dff] focus:ring-[#357dff]"
                        />
                        <span>APAC / India Region</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Description / Tracks / Eligibility
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Detail the tracks, mentors, hardware supplies provided, and eligibility criteria."
                        value={hackathonForm.description}
                        onChange={(e) => setHackathonForm({ ...hackathonForm, description: e.target.value })}
                        className="w-full p-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-[#0a0a0a] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff] resize-y"
                      />
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={submittingHackathon}
                        className="h-12 px-8 rounded-full bg-[#357dff] hover:bg-[#2563eb] disabled:opacity-60 text-white font-sans text-sm font-semibold tracking-normal transition-all shadow-sm active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                      >
                        {submittingHackathon ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Listing Event...</span>
                          </>
                        ) : (
                          <>
                            <span>Publish Hackathon</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Hackathon Card Preview */}
                <div className="xl:col-span-5">
                  <div className="sticky top-28 space-y-3">
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                      Feed Card Preview
                    </div>

                    <div className="rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                      {hackathonForm.banner_url ? (
                        <div className="h-36 w-full rounded-xl overflow-hidden mb-4 bg-zinc-900">
                          <img
                            src={hackathonForm.banner_url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        </div>
                      ) : (
                        <div className="h-28 w-full rounded-xl mb-4 bg-gradient-to-br from-blue-500/10 via-amber-500/10 to-purple-500/10 border border-[#e5e5e5] dark:border-zinc-800 flex items-center justify-center">
                          <Trophy className="w-8 h-8 text-[#357dff]" />
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          BUILDER HOSTED
                        </span>
                        {hackathonForm.prize_pool && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                            {hackathonForm.prize_pool}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 text-base font-semibold text-[#0a0a0a] dark:text-white">
                        {hackathonForm.name || "Hackathon Name"}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {hackathonForm.tagline || hackathonForm.description || "The tagline or description will appear on the calendar preview."}
                      </p>

                      <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {hackathonForm.start_date || "Start Date"}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {hackathonForm.location || (hackathonForm.virtual ? "Virtual" : "In-Person")}
                        </span>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#e5e5e5] dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400">
                          Hosted by @{currentUser?.username || "you"}
                        </span>
                        <div className="h-8 px-4 rounded-full bg-[#357dff] text-white text-xs font-semibold inline-flex items-center gap-1 pointer-events-none">
                          <span>Register</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}

export default DashboardPage
