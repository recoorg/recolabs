"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { usePageMeta } from "@/hooks/usePageMeta"
import { CheckCircle2, Briefcase, Search, MapPin, ExternalLink, RefreshCw, Key, X, Plus, ArrowUpRight, Building2, Sparkles, Filter } from "lucide-react"
import { api, type GoogleJobItem } from "@/services/api"
import { networkApi, type BuilderJob } from "@/services/networkApi"

interface UnifiedJob {
  id: string
  title: string
  company_name: string
  company_logo?: string
  location: string
  is_remote: boolean
  job_type: string
  salary?: string
  skills?: string[]
  description: string
  apply_url: string
  source: "builder" | "google"
  author_name?: string
  author_username?: string
  created_at?: string
}

export function JobsPage() {
  usePageMeta({
    title: "Jobs & Opportunities | Reco Labs",
    description: "Work with high-velocity startups and developer tool founders. Verified internships, contracts, and engineering roles.",
    image: "/twitter-jobs.png",
  })

  const [builderJobs, setBuilderJobs] = React.useState<BuilderJob[]>([])
  const [googleJobs, setGoogleJobs] = React.useState<GoogleJobItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<"ALL" | "DIRECT" | "REMOTE" | "FULL_TIME" | "INTERNSHIP" | "CONTRACT">("ALL")
  const [showKeyModal, setShowKeyModal] = React.useState(false)
  const [serpApiKey, setSerpApiKey] = React.useState("")

  // Check saved SerpApi key on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("reco_serpapi_key") || ""
      setSerpApiKey(saved)
    }
  }, [])

  // Core fetch function
  const fetchAllJobs = React.useCallback(async (query: string) => {
    setLoading(true)
    try {
      const [bJobs, gJobs] = await Promise.all([
        networkApi.getJobs().catch(() => []),
        api.getGoogleJobs(query).catch(() => []),
      ])
      setBuilderJobs(bJobs)
      setGoogleJobs(gJobs)
    } catch (err) {
      console.error("Failed to fetch jobs:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  React.useEffect(() => {
    fetchAllJobs("")
  }, [fetchAllJobs])

  // Debounced search
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      fetchAllJobs("")
      return
    }
    const timer = setTimeout(() => {
      fetchAllJobs(searchQuery)
    }, 450)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchAllJobs])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAllJobs(searchQuery)
  }

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== "undefined") {
      if (serpApiKey.trim()) {
        localStorage.setItem("reco_serpapi_key", serpApiKey.trim())
      } else {
        localStorage.removeItem("reco_serpapi_key")
      }
      setShowKeyModal(false)
      fetchAllJobs(searchQuery)
    }
  }

  // Normalize all jobs into unified array
  const unifiedJobs = React.useMemo<UnifiedJob[]>(() => {
    // 1. Direct Builder Postings from Supabase
    const normalizedBuilders: UnifiedJob[] = builderJobs.map((b) => ({
      id: `builder-${b.id}`,
      title: b.title,
      company_name: b.company_name,
      company_logo: b.company_logo || undefined,
      location: b.location || "Remote",
      is_remote: b.is_remote,
      job_type: b.job_type,
      salary: b.salary_range || undefined,
      skills: b.skills || [],
      description: b.description,
      apply_url: b.apply_url,
      source: "builder",
      author_name: b.author_name,
      author_username: b.author_username || undefined,
      created_at: b.created_at,
    }))

    // 2. Google / Curated Jobs
    const normalizedGoogle: UnifiedJob[] = googleJobs.map((g) => {
      const isRemote =
        g.location.toLowerCase().includes("remote") ||
        g.detected_extensions?.work_from_home === true ||
        g.extensions?.some((ext) => ext.toLowerCase().includes("remote") || ext.toLowerCase().includes("work from home")) ||
        false

      return {
        id: `google-${g.job_id || Math.random().toString()}`,
        title: g.title,
        company_name: g.company_name,
        company_logo: g.thumbnail,
        location: g.location,
        is_remote: isRemote,
        job_type: g.detected_extensions?.schedule_type || "Full-time",
        salary: g.detected_extensions?.salary,
        skills: g.extensions?.slice(0, 4) || [],
        description: g.description || "Engineering role with competitive compensation.",
        apply_url: ((g as any).apply_options && (g as any).apply_options[0]?.link) || (g as any).share_link || "https://google.com/search?q=" + encodeURIComponent(g.title + " " + g.company_name),
        source: "google",
      }
    })

    // Priority: Direct Builder Postings first
    return [...normalizedBuilders, ...normalizedGoogle]
  }, [builderJobs, googleJobs])

  // Filter unified jobs
  const filteredJobs = React.useMemo(() => {
    return unifiedJobs.filter((job) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company_name.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        (job.skills && job.skills.some((s) => s.toLowerCase().includes(q)))

      if (!matchesSearch) return false

      if (filterType === "DIRECT") return job.source === "builder"
      if (filterType === "REMOTE") return job.is_remote
      if (filterType === "FULL_TIME") return job.job_type.toLowerCase().includes("full")
      if (filterType === "INTERNSHIP") return job.job_type.toLowerCase().includes("intern")
      if (filterType === "CONTRACT") return job.job_type.toLowerCase().includes("contract") || job.job_type.toLowerCase().includes("part")

      return true
    })
  }, [unifiedJobs, searchQuery, filterType])

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#f4f4f5] pt-28 sm:pt-36 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Tracwell Centered Hero with Two CTAs */}
        <div className="text-center max-w-3xl mx-auto pb-10 border-b border-[#e5e5e5] dark:border-zinc-800">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4f4f5] dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#357dff]" />
            <span>DIRECT BUILDER ROLES & CURATED JOBS</span>
          </div>

          <h1 className="font-sans text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#0a0a0a] dark:text-white">
            Developer Opportunities.
          </h1>

          <p className="font-sans text-base sm:text-lg font-medium leading-relaxed text-[#0a0a0a]/80 dark:text-zinc-300 mt-4">
            High-velocity software roles, hardware gigs, and paid internships posted directly by founders or indexed across developer tool companies.
          </p>

          {/* Action CTAs: Primary Pill + Secondary Pill */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <Link
              to="/dashboard?tab=post-job"
              className="h-12 px-7 rounded-full bg-[#357dff] hover:bg-[#2563eb] text-white font-sans text-sm font-semibold tracking-normal transition-all shadow-sm active:scale-95 inline-flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Post an Opening</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard?tab=my-jobs"
              className="h-12 px-7 rounded-full bg-[#f4f4f5] dark:bg-zinc-800 hover:bg-[#eaeaea] dark:hover:bg-zinc-700 text-[#18181b] dark:text-white font-sans text-sm font-semibold tracking-normal transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <span>Manage Postings</span>
            </Link>
          </div>
        </div>

        {/* Directory Controls: Search & Category Pills */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800">
          
          {/* Active Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, tech stack (e.g. React, Rust, AI)..."
              className="w-full h-11 pl-10 pr-20 rounded-full border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-[#0a0a0a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "ALL"
                  ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-black shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              All Roles
            </button>

            <button
              type="button"
              onClick={() => setFilterType("DIRECT")}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "DIRECT"
                  ? "bg-[#357dff] text-white shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              ✨ Direct Guild ({builderJobs.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType("REMOTE")}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "REMOTE"
                  ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-black shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              Remote
            </button>

            <button
              type="button"
              onClick={() => setFilterType("FULL_TIME")}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "FULL_TIME"
                  ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-black shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              Full-time
            </button>

            <button
              type="button"
              onClick={() => setFilterType("INTERNSHIP")}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "INTERNSHIP"
                  ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-black shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              Internships
            </button>

            <button
              type="button"
              onClick={() => setFilterType("CONTRACT")}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "CONTRACT"
                  ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-black shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              Contract
            </button>

            {/* Optional SerpApi Key Configuration Trigger */}
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              title="Configure SerpApi Key"
              className="w-9 h-9 rounded-full border border-[#e5e5e5] dark:border-zinc-800 text-zinc-500 hover:text-[#357dff] hover:border-[#357dff] transition-colors flex items-center justify-center cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Counter Info */}
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
          <span>
            {loading ? "Searching openings..." : `Showing ${filteredJobs.length} opportunities (${builderJobs.length} direct)`}
          </span>
          <Link to="/dashboard?tab=post-job" className="text-[#357dff] hover:underline font-semibold">
            + Post your engineering opening
          </Link>
        </div>

        {/* Roles List (Tracwell 18px Card Rows) */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#357dff] animate-spin mb-3" />
              <p className="text-xs text-zinc-500">Loading verified engineering openings...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-20 text-center rounded-[18px] border border-[#e5e5e5] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-900/30">
              <p className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">No jobs match this filter.</p>
              <p className="text-xs text-zinc-500 mt-2">
                Try switching to &ldquo;All Roles&rdquo; or clearing your search term.
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`rounded-[18px] border p-6 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md ${
                  job.source === "builder"
                    ? "bg-white dark:bg-[#0c0c0e] border-blue-200 dark:border-blue-900/60 hover:border-[#357dff]"
                    : "bg-white dark:bg-[#0c0c0e] border-[#e5e5e5] dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Company Logo / Placeholder */}
                    <div className="w-12 h-12 rounded-xl bg-[#fafafa] dark:bg-zinc-800 border border-[#e5e5e5] dark:border-zinc-700 flex items-center justify-center overflow-hidden flex-none">
                      {job.company_logo ? (
                        <img
                          src={job.company_logo}
                          alt={job.company_name}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-[#357dff]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-base font-semibold text-[#0a0a0a] dark:text-white truncate">
                          {job.title}
                        </h2>

                        {job.source === "builder" ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#357dff] text-white">
                            DIRECT GUILD POST
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f4f4f5] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            VERIFIED
                          </span>
                        )}

                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#fafafa] dark:bg-zinc-800/80 border border-[#e5e5e5] dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                          {job.job_type}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {job.company_name}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          {job.location}
                        </span>
                        {job.salary && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {job.salary}
                            </span>
                          </>
                        )}
                        {job.author_name && (
                          <>
                            <span>·</span>
                            <span>Posted by {job.author_name} {job.author_username && `(@${job.author_username})`}</span>
                          </>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                          {job.skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#f4f4f5] dark:bg-zinc-800/80 border border-[#e5e5e5] dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-mono"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-none self-end lg:self-center">
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 px-6 rounded-full bg-[#357dff] hover:bg-[#2563eb] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <span>Apply Now</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Optional SerpApi Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[18px] bg-white dark:bg-[#0c0c0e] border border-[#e5e5e5] dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e5] dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
                Custom SerpApi Key
              </h3>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="mt-4 space-y-4">
              <p className="text-xs text-zinc-500 leading-relaxed">
                Provide a SerpApi key to directly search Google Jobs with your own quotas. Leave blank to use public/curated endpoints.
              </p>

              <div>
                <input
                  type="password"
                  placeholder="Paste your SerpApi key here..."
                  value={serpApiKey}
                  onChange={(e) => setSerpApiKey(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-[#0a0a0a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="h-10 px-5 rounded-full border border-[#e5e5e5] dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-full bg-[#357dff] hover:bg-[#2563eb] text-white text-xs font-semibold transition-all shadow-sm"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default JobsPage
