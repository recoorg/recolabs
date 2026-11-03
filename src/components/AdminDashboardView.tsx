"use client"

import * as React from "react"
import {
  ShieldCheck,
  Briefcase,
  Trophy,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Zap,
  UserCheck,
  Building,
  Calendar,
  MapPin,
  Lock,
  KeyRound,
  Filter,
  DollarSign,
  Flame,
} from "lucide-react"
import confetti from "canvas-confetti"
import { networkApi, type BuilderJob, type BuilderHackathon, type UserProfile } from "@/services/networkApi"

interface AdminDashboardViewProps {
  currentUser: UserProfile | null
}

export function AdminDashboardView({ currentUser }: AdminDashboardViewProps) {
  const [adminKey, setAdminKey] = React.useState<string>(() => {
    return localStorage.getItem("reco_admin_key") || "Tanisha@1060"
  })
  const [isUnlocked, setIsUnlocked] = React.useState<boolean>(false)
  const [keyInput, setKeyInput] = React.useState(adminKey)
  const [unlockError, setUnlockError] = React.useState<string | null>(null)

  // Data states
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<"jobs" | "hackathons" | "paid">("jobs")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [jobs, setJobs] = React.useState<BuilderJob[]>([])
  const [hackathons, setHackathons] = React.useState<BuilderHackathon[]>([])
  const [paidEntities, setPaidEntities] = React.useState<{
    featuredStartups: any[]
    featuredJobs: any[]
    verifiedUsers: any[]
  }>({ featuredStartups: [], featuredJobs: [], verifiedUsers: [] })

  const [actionNotice, setActionNotice] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setActionNotice(msg)
    setTimeout(() => setActionNotice(null), 3000)
  }

  // Check if current user is naturally admin
  const isOwner = React.useMemo(() => {
    if (!currentUser) return false
    const u = currentUser.username?.toLowerCase() || ""
    const e = currentUser.email?.toLowerCase() || ""
    return u === "rawenergon" || u === "b127" || u === "aditya" || e === "devadibxr@gmail.com"
  }, [currentUser])

  // Fetch admin master data
  const fetchData = React.useCallback(async (keyToUse: string) => {
    setLoading(true)
    setUnlockError(null)
    try {
      const res = await networkApi.getAdminOverview(keyToUse)
      if (res && res.success) {
        setJobs(res.jobs || [])
        setHackathons(res.hackathons || [])
        setPaidEntities(res.paidEntities || { featuredStartups: [], featuredJobs: [], verifiedUsers: [] })
        setIsUnlocked(true)
        localStorage.setItem("reco_admin_key", keyToUse)
      } else {
        setIsUnlocked(false)
        setUnlockError("Access denied. Please check your admin master key.")
      }
    } catch (err: any) {
      setIsUnlocked(false)
      setUnlockError(err.message || "Failed to authenticate administrative access.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData(adminKey)
  }, [fetchData, adminKey])

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAdminKey(keyInput.trim())
    fetchData(keyInput.trim())
  }

  // Action: Toggle Job Featured
  const handleToggleJobFeatured = async (id: number) => {
    const ok = await networkApi.adminToggleJobFeatured(id, adminKey)
    if (ok) {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, is_featured: !j.is_featured } : j))
      )
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } })
      showToast("Updated featured spotlight for job!")
    } else {
      showToast("Failed to toggle featured status.")
    }
  }

  // Action: Toggle Job Status (Active / Paused)
  const handleToggleJobActive = async (job: BuilderJob) => {
    const nextStatus = !job.is_active
    const ok = await networkApi.toggleJobStatus(job.id, nextStatus)
    if (ok) {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, is_active: nextStatus } : j))
      )
      showToast(`Job ${nextStatus ? "activated" : "paused"} successfully.`)
    }
  }

  // Action: Delete Job
  const handleDeleteJob = async (id: number) => {
    if (!window.confirm("Permanently delete this job opening from Reco Labs?")) return
    const ok = await networkApi.deleteJob(id)
    if (ok) {
      setJobs((prev) => prev.filter((j) => j.id !== id))
      showToast("Job opening deleted.")
    }
  }

  // Action: Approve/Reject Hackathon
  const handleToggleHackathonApproval = async (h: BuilderHackathon) => {
    const nextApprove = !h.is_approved
    const ok = await networkApi.adminApproveHackathon(h.id, nextApprove, adminKey)
    if (ok) {
      setHackathons((prev) =>
        prev.map((item) => (item.id === h.id ? { ...item, is_approved: nextApprove } : item))
      )
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } })
      showToast(`Hackathon ${nextApprove ? "approved and published" : "unapproved"}.`)
    }
  }

  // Action: Delete Hackathon
  const handleDeleteHackathon = async (id: number) => {
    if (!window.confirm("Permanently delete this hackathon from Reco Labs?")) return
    const ok = await networkApi.deleteBuilderHackathon(id)
    if (ok) {
      setHackathons((prev) => prev.filter((h) => h.id !== id))
      showToast("Hackathon deleted.")
    }
  }

  // Action: Toggle Startup Featured
  const handleToggleStartupFeatured = async (id: number) => {
    const ok = await networkApi.adminToggleStartupFeatured(id, adminKey)
    if (ok) {
      setPaidEntities((prev) => ({
        ...prev,
        featuredStartups: prev.featuredStartups.map((s) =>
          s.id === id ? { ...s, is_featured: !s.is_featured } : s
        ),
      }))
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } })
      showToast("Toggled startup spotlight pin!")
    }
  }

  // Action: Toggle User Verification
  const handleToggleUserVerify = async (id: number) => {
    const ok = await networkApi.adminToggleUserVerify(id, adminKey)
    if (ok) {
      setPaidEntities((prev) => ({
        ...prev,
        verifiedUsers: prev.verifiedUsers.map((u) =>
          u.id === id ? { ...u, is_verified: !u.is_verified } : u
        ),
      }))
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } })
      showToast("Toggled user verification badge!")
    }
  }

  // If locked
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 text-center font-mono">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-[#FA5D00] mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
          Admin Control Center
        </h2>
        <p className="text-xs text-zinc-500 mt-2 mb-6">
          Enter administrative access key to manage all live jobs, hackathons, and paid members.
        </p>

        {unlockError && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
            {unlockError}
          </div>
        )}

        <form onSubmit={handleUnlockSubmit} className="space-y-3">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Enter Admin Master Key..."
            className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA5D00]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#FA5D00] text-black font-bold uppercase tracking-wider text-xs hover:bg-[#e05300] active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
            <span>Authenticate Master</span>
          </button>
        </form>
      </div>
    )
  }

  // Filtered queries
  const q = searchQuery.toLowerCase().trim()
  const filteredJobs = jobs.filter(
    (j) =>
      !q ||
      j.title.toLowerCase().includes(q) ||
      j.company_name.toLowerCase().includes(q) ||
      j.author_name.toLowerCase().includes(q)
  )

  const filteredHackathons = hackathons.filter(
    (h) =>
      !q ||
      h.name.toLowerCase().includes(q) ||
      (h.tagline && h.tagline.toLowerCase().includes(q)) ||
      h.author_name.toLowerCase().includes(q)
  )

  const totalPaidStartups = paidEntities.featuredStartups.filter((s) => s.is_featured).length
  const totalFeaturedJobs = jobs.filter((j) => j.is_featured).length
  const totalVerifiedUsers = paidEntities.verifiedUsers.filter((u) => u.is_verified).length

  return (
    <div className="space-y-8 font-mono">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-xl animate-bounce flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#FA5D00]" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border editorial-hairline bg-white dark:bg-zinc-900/60 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase">All Jobs</span>
            <Briefcase className="w-4 h-4 text-[#FA5D00]" />
          </div>
          <div className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{jobs.length}</div>
          <span className="text-[10px] text-zinc-500">{totalFeaturedJobs} Featured ($99)</span>
        </div>

        <div className="p-5 rounded-2xl border editorial-hairline bg-white dark:bg-zinc-900/60 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Hackathons</span>
            <Trophy className="w-4 h-4 text-[#FA5D00]" />
          </div>
          <div className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{hackathons.length}</div>
          <span className="text-[10px] text-zinc-500">
            {hackathons.filter((h) => h.is_approved).length} Approved
          </span>
        </div>

        <div className="p-5 rounded-2xl border editorial-hairline bg-white dark:bg-zinc-900/60 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Paid Spotlights</span>
            <Flame className="w-4 h-4 text-[#FA5D00]" />
          </div>
          <div className="text-2xl font-bold text-[#FA5D00]">{totalPaidStartups}</div>
          <span className="text-[10px] text-zinc-500">$29/$49 Boosts Active</span>
        </div>

        <div className="p-5 rounded-2xl border editorial-hairline bg-white dark:bg-zinc-900/60 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Verified Users</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{totalVerifiedUsers}</div>
          <span className="text-[10px] text-zinc-500">Pro Badge Holders</span>
        </div>
      </div>

      {/* Controls Bar: Tab Selector & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b editorial-hairline">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "jobs"
                ? "bg-[#FA5D00] text-black shadow-sm"
                : "border editorial-hairline text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-zinc-500"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Jobs ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("hackathons")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "hackathons"
                ? "bg-[#FA5D00] text-black shadow-sm"
                : "border editorial-hairline text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-zinc-500"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Hackathons ({hackathons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("paid")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "paid"
                ? "bg-[#FA5D00] text-black shadow-sm"
                : "border editorial-hairline text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-zinc-500"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Paid Users &amp; Boosts ({totalPaidStartups + totalFeaturedJobs + totalVerifiedUsers})</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="w-full h-9 pl-9 pr-3 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00]"
          />
        </div>
      </div>

      {/* TAB 1: ALL LISTED JOBS */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Showing {filteredJobs.length} Careers in Database
            </span>
            <button
              onClick={() => fetchData(adminKey)}
              className="text-xs text-[#FA5D00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  job.is_featured
                    ? "border-[#FA5D00] bg-orange-500/[0.04] dark:bg-orange-500/[0.07]"
                    : "editorial-hairline bg-white dark:bg-zinc-900/40"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border editorial-hairline flex items-center justify-center flex-none overflow-hidden">
                    {job.company_logo ? (
                      <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain p-0.5" />
                    ) : (
                      <Building className="w-5 h-5 text-[#FA5D00]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif text-lg text-zinc-900 dark:text-zinc-100 truncate">
                        {job.title}
                      </h4>
                      {job.is_featured && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FA5D00] text-black text-[9px] font-black uppercase flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" />
                          <span>$99 FEATURED</span>
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          job.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {job.is_active ? "Active" : "Paused"}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2.5 text-xs text-zinc-500 flex-wrap">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{job.company_name}</span>
                      <span>·</span>
                      <span>{job.location}</span>
                      {job.salary_range && (
                        <>
                          <span>·</span>
                          <span className="text-[#FA5D00] font-bold">{job.salary_range}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>Author: {job.author_name}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-none">
                  <button
                    onClick={() => handleToggleJobFeatured(job.id)}
                    title={job.is_featured ? "Remove featured spotlight" : "Promote to #1 Featured ($99 tier)"}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                      job.is_featured
                        ? "bg-[#FA5D00] text-black border-[#FA5D00]"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-[#FA5D00] text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>{job.is_featured ? "Featured" : "Boost $99"}</span>
                  </button>

                  <button
                    onClick={() => handleToggleJobActive(job)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {job.is_active ? "Pause" : "Activate"}
                  </button>

                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:text-[#FA5D00] text-zinc-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                    title="Delete job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ALL LISTED HACKATHONS */}
      {activeTab === "hackathons" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Showing {filteredHackathons.length} Sprints &amp; Hackathons in Database
            </span>
            <button
              onClick={() => fetchData(adminKey)}
              className="text-xs text-[#FA5D00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredHackathons.map((h) => (
              <div
                key={h.id}
                className="p-5 rounded-2xl border editorial-hairline bg-white dark:bg-zinc-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-serif text-lg text-zinc-900 dark:text-zinc-100 truncate">{h.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        h.is_approved
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}
                    >
                      {h.is_approved ? "Approved & Live" : "Pending Approval"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[9px] uppercase">
                      {h.virtual ? "Virtual" : h.location || "In-person"}
                    </span>
                  </div>

                  {h.tagline && <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{h.tagline}</p>}

                  <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#FA5D00]" />
                      {new Date(h.start_date).toLocaleDateString()} – {new Date(h.end_date).toLocaleDateString()}
                    </span>
                    <span>·</span>
                    <span>Submitted by {h.author_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-none">
                  <button
                    onClick={() => handleToggleHackathonApproval(h)}
                    className={`px-4 py-1.5 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                      h.is_approved
                        ? "border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                        : "bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-400"
                    }`}
                  >
                    {h.is_approved ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{h.is_approved ? "Revoke" : "Approve & Publish"}</span>
                  </button>

                  <a
                    href={h.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:text-[#FA5D00] text-zinc-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDeleteHackathon(h.id)}
                    className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                    title="Delete hackathon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ALL PAID USERS, SPOTLIGHTS & VERIFICATIONS */}
      {activeTab === "paid" && (
        <div className="space-y-8">
          {/* Section A: Boosted Startups */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b editorial-hairline">
              <span className="font-bold text-xs uppercase text-[#FA5D00] flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                <span>Active Startup Spotlights ({paidEntities.featuredStartups.length})</span>
              </span>
              <span className="text-[10px] text-zinc-400">$29/$49 Pinned to Top Row</span>
            </div>

            {paidEntities.featuredStartups.length === 0 ? (
              <div className="p-6 rounded-2xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900/30 text-center text-xs text-zinc-500">
                No active startup boosts. Use the Boost button on /network or check Razorpay webhooks.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {paidEntities.featuredStartups.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl border-2 border-[#FA5D00] bg-orange-500/[0.04] dark:bg-orange-500/[0.08] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">{s.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FA5D00] text-black text-[9px] font-black uppercase">
                          🔥 SPOTLIGHT
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase">{s.category}</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Founder: {s.founder_name} (@{s.founder_username || "builder"}) · Stage: {s.stage}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-[#FA5D00]"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleToggleStartupFeatured(s.id)}
                        className="px-3 py-1.5 rounded-xl border border-orange-300 dark:border-orange-800 text-xs font-bold text-[#FA5D00] hover:bg-[#FA5D00] hover:text-black transition-colors cursor-pointer"
                      >
                        Remove Boost
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Verified Pro Builders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b editorial-hairline">
              <span className="font-bold text-xs uppercase text-emerald-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Builders &amp; Pro Accounts ({paidEntities.verifiedUsers.length})</span>
              </span>
              <span className="text-[10px] text-zinc-400">Displaying Blue Checkmark on Profiles</span>
            </div>

            {paidEntities.verifiedUsers.length === 0 ? (
              <div className="p-6 rounded-2xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900/30 text-center text-xs text-zinc-500">
                No verified accounts yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paidEntities.verifiedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl border editorial-hairline bg-white dark:bg-zinc-900/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{u.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-none" />
                      </div>
                      <div className="text-xs text-zinc-500 truncate">@{u.username} · {u.email}</div>
                    </div>

                    <button
                      onClick={() => handleToggleUserVerify(u.id)}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer flex-none"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardView
