"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { usePageMeta } from "@/hooks/usePageMeta"
import { CheckCircle2, Briefcase, Search, MapPin, ExternalLink, RefreshCw, X, Plus, ArrowUpRight, Building2, Sparkles, Filter, ChevronDown, Check } from "lucide-react"
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
  is_featured?: boolean
  source: "builder" | "google"
  author_name?: string
  author_username?: string
  created_at?: string
}

export function JobsPage() {
  usePageMeta({
    title: "Guild Roles & Career Opportunities | Reco Labs (recolabs.in)",
    description: "Engineering roles, founding designer internships, and paid contracts for teenage builders at high-velocity startups on Reco Labs (recolabs.in).",
    image: "/twitter-jobs.png",
  })

  const [builderJobs, setBuilderJobs] = React.useState<BuilderJob[]>([])
  const [googleJobs, setGoogleJobs] = React.useState<GoogleJobItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<"ALL" | "DIRECT" | "REMOTE" | "FULL_TIME" | "INTERNSHIP" | "CONTRACT">("ALL")
  const [showFilterMenu, setShowFilterMenu] = React.useState(false)

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
      is_featured: Boolean(b.is_featured),
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
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-950 dark:text-zinc-50 pt-28 sm:pt-36 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto pb-10 border-b editorial-hairline">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-[11px] font-bold uppercase tracking-wider text-[#FA5D00] shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FA5D00] animate-pulse" />
            <span>DEVELOPER OPPORTUNITIES & ROLES</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight leading-none">
            Developer Opportunities<span className="text-[#FA5D00]">.</span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed mt-4">
            High-velocity software roles, hardware rigs, and paid internships posted directly by founders or indexed across developer tool companies.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <Link
              to="/dashboard?tab=post-job"
              className="px-8 py-3.5 rounded-full bg-[#FA5D00] hover:bg-[#e05300] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 inline-flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Post an Opening</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard?tab=jobs"
              className="px-7 py-3.5 rounded-full border-2 border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:border-[#FA5D00] text-zinc-800 dark:text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <span>Manage Postings</span>
            </Link>
          </div>
        </div>

        {/* Directory Controls: Search & Category Pills */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b editorial-hairline font-mono">
          
          {/* Active Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keyword (e.g. React, Rust, AI)..."
              className="w-full h-11 pl-10 pr-20 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00] transition-colors"
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

          {/* Clean Filter Dropdown with Filter Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`h-11 px-5 rounded-full border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                filterType !== "ALL"
                  ? "border-[#FA5D00] bg-[#FA5D00]/10 text-[#FA5D00]"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              <Filter className="w-4 h-4 text-[#FA5D00]" />
              <span>Filter</span>
              {filterType !== "ALL" && (
                <span className="w-2 h-2 rounded-full bg-[#FA5D00]" />
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showFilterMenu ? "rotate-180" : ""}`} />
            </button>

            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-2xl bg-white dark:bg-[#0c0c0e] border-2 border-black dark:border-zinc-700 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b editorial-hairline">
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">Filter Roles</span>
                  {filterType !== "ALL" && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterType("ALL")
                        setShowFilterMenu(false)
                      }}
                      className="text-[11px] font-mono text-[#FA5D00] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-1 font-mono text-xs">
                  {[
                    { id: "ALL", label: "All Roles" },
                    { id: "REMOTE", label: "Remote Only" },
                    { id: "FULL_TIME", label: "Full-Time" },
                    { id: "INTERNSHIP", label: "Internships" },
                    { id: "CONTRACT", label: "Contract / Freelance" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setFilterType(opt.id as any)
                        setShowFilterMenu(false)
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        filterType === opt.id
                          ? "bg-[#FA5D00] text-black font-bold"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {filterType === opt.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          </div>
        </div>

        {/* Roles List */}
        <div className="mt-6 space-y-4 font-mono">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#FA5D00] animate-spin mb-3" />
              <p className="text-xs text-zinc-500">Loading verified openings...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border editorial-hairline bg-zinc-50/50 dark:bg-zinc-900/30">
              <p className="font-serif text-2xl text-zinc-800 dark:text-zinc-200">No jobs match this filter.</p>
              <p className="text-xs text-zinc-500 mt-2 font-mono">
                Try switching to &ldquo;All Roles&rdquo; or clearing your search term.
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`rounded-3xl border editorial-hairline p-6 transition-all shadow-xs hover:shadow-md hover:border-[#FA5D00] ${
                  job.is_featured
                    ? "bg-orange-500/[0.04] dark:bg-orange-500/[0.07] border-[#FA5D00] shadow-md shadow-[#FA5D00]/10"
                    : "bg-white dark:bg-zinc-900/40"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border editorial-hairline flex items-center justify-center overflow-hidden flex-none">
                      {job.company_logo ? (
                        <img
                          src={job.company_logo}
                          alt={job.company_name}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-[#FA5D00]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="font-serif text-2xl text-zinc-950 dark:text-white leading-tight truncate">
                          {job.title}
                        </h2>

                        {job.is_featured && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#FA5D00] text-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                            <span>🔥 FEATURED ROLE</span>
                          </span>
                        )}
                        {job.source === "builder" ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FA5D00] text-black">
                            DIRECT GUILD POST
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            VERIFIED
                          </span>
                        )}

                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {job.job_type}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          {job.company_name}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FA5D00]" />
                          {job.location}
                        </span>
                        {job.salary && (
                          <>
                            <span>·</span>
                            <span className="font-bold text-[#FA5D00]">
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

                      <p className="mt-3 font-sans text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-2">
                        {job.description}
                      </p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
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
                  </div>

                  <div className="flex items-center gap-3 flex-none self-end lg:self-center">
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-full bg-[#FA5D00] hover:bg-[#e05300] text-black text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
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

    </div>
  )
}

export default JobsPage
