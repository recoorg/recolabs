"use client"

import * as React from "react"
import { CheckCircle2, Sparkles, MessageSquare, Briefcase, Search, MapPin, ExternalLink, RefreshCw, Key, X } from "lucide-react"
import { api, type GoogleJobItem } from "@/services/api"

export function JobsPage() {
  const [jobs, setJobs] = React.useState<GoogleJobItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("ALL")
  const [remoteOnly, setRemoteOnly] = React.useState(false)
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
  const fetchJobs = React.useCallback(async (query: string) => {
    setLoading(true)
    try {
      const data = await api.getGoogleJobs(query)
      setJobs(data)
    } catch (err) {
      console.error("Failed to search jobs:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  React.useEffect(() => {
    fetchJobs("")
  }, [fetchJobs])

  // Debounced search when user types in the search bar
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      fetchJobs("")
      return
    }
    const timer = setTimeout(() => {
      fetchJobs(searchQuery)
    }, 450)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchJobs])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs(searchQuery)
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
      fetchJobs(searchQuery)
    }
  }

  // Filter jobs based on category and remote toggle
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) => {
      if (categoryFilter !== "ALL") {
        if (job.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false
      }

      if (remoteOnly) {
        const isRemote =
          job.location.toLowerCase().includes("remote") ||
          job.detected_extensions?.work_from_home === true ||
          job.extensions?.some((ext) => ext.toLowerCase().includes("remote") || ext.toLowerCase().includes("work from home"))
        if (!isRemote) return false
      }

      return true
    })
  }, [jobs, categoryFilter, remoteOnly])

  return (
    <div className="w-full pt-32 sm:pt-36 pb-24 px-6 sm:px-8 bg-white dark:bg-[#09090b]">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto pb-12 border-b editorial-hairline">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
            ENGINEERING ROLES & GUILD BOUNTIES
          </span>
          <h1 className="mt-4 font-serif text-5xl sm:text-7xl lg:text-8xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
            Developer Opportunities<span className="text-[#FA5D00]">.</span>
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Live technical job search powered by SerpApi Google Jobs and developer feeds. Filtered to eliminate spam and low-quality unpaid internships.
          </p>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-3 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE JOBS FEED</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <span>ZERO UNPAID SPAM · VERIFIED OPENINGS</span>
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b editorial-hairline">
          
          {/* Active Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keyword (e.g. React, Python, Embedded)..."
              className="w-full pl-10 pr-24 py-2.5 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#FA5D00] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-16 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[11px] font-bold uppercase hover:opacity-85 transition-opacity"
            >
              Search
            </button>
          </form>

          {/* Category Filter Pills & Remote Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "SOFTWARE", "HARDWARE", "SYSTEMS", "TUTORIALS", "FELLOWSHIP"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full border text-[11px] font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-[#FA5D00] text-black border-black font-bold shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-zinc-500 bg-transparent"
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`px-3.5 py-1.5 rounded-full border text-[11px] font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ml-1 ${
                remoteOnly
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-black bg-transparent"
              }`}
            >
              Remote Only
            </button>

            {/* Optional SerpApi Key Settings Trigger */}
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              title="Configure SerpApi Key"
              className="p-2 rounded-full border editorial-hairline text-zinc-500 hover:text-[#FA5D00] hover:border-[#FA5D00] transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Counter Info */}
        <div className="mt-4 flex items-center justify-between font-mono text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            {loading ? (
              <span className="flex items-center gap-1.5 text-[#FA5D00]">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Searching live endpoints...</span>
              </span>
            ) : (
              <span>Showing {filteredJobs.length} live technical opportunities</span>
            )}
          </div>
          <span>SerpApi & Reco Guild Index</span>
        </div>

        {/* Roles List */}
        <div className="mt-8 space-y-6">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#FA5D00] animate-spin mb-3" />
              <p className="font-mono text-xs text-zinc-500">
                Searching Google Jobs and developer feeds for &ldquo;{searchQuery || "developer"}&rdquo;...
              </p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-20 text-center border rounded-3xl editorial-hairline bg-zinc-50/50 dark:bg-zinc-900/30">
              <p className="font-serif text-2xl text-zinc-800 dark:text-zinc-200">No openings match your search query.</p>
              <p className="font-mono text-xs text-zinc-500 mt-2">
                Try searching for broader keywords like &ldquo;software&rdquo;, &ldquo;frontend&rdquo;, or &ldquo;engineer&rdquo;.
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.job_id}
                className="group p-8 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40 hover:border-[#FA5D00] transition-all shadow-sm hover:shadow-md flex flex-col lg:flex-row lg:items-start justify-between gap-6"
              >
                <div className="flex-1">
                  
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-400 pb-3 border-b editorial-hairline">
                    <span className="text-[#FA5D00] font-bold uppercase">{job.category || "ENGINEERING"}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="uppercase text-zinc-700 dark:text-zinc-300 font-semibold">{job.company_name}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="text-zinc-500">{job.via || "Direct"}</span>
                    {job.detected_extensions?.salary && (
                      <>
                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{job.detected_extensions.salary}</span>
                      </>
                    )}
                  </div>

                  {/* Title & Organization */}
                  <div className="mt-4 flex items-start gap-4">
                    {job.thumbnail ? (
                      <img
                        src={job.thumbnail}
                        alt=""
                        className="w-12 h-12 rounded-2xl object-contain bg-zinc-50 dark:bg-zinc-800 p-2 flex-none border editorial-hairline"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border editorial-hairline flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-mono text-base font-bold flex-none">
                        <Briefcase className="w-5 h-5 text-[#FA5D00]" />
                      </div>
                    )}

                    <div>
                      <h3 className="font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal group-hover:text-[#FA5D00] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{job.location}</span>
                        </span>
                        {job.detected_extensions?.schedule_type && (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase">
                            {job.detected_extensions.schedule_type}
                          </span>
                        )}
                        {job.detected_extensions?.posted_at && (
                          <span>Posted {job.detected_extensions.posted_at}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-4 font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal max-w-3xl">
                    {job.description}
                  </p>

                  {/* Highlights Checklist */}
                  {job.highlights && job.highlights.length > 0 && (
                    <div className="mt-5 space-y-1.5 pt-4 border-t editorial-hairline">
                      <span className="font-mono text-[10px] uppercase text-zinc-400 tracking-wider">KEY FOCUS & REQUIREMENTS:</span>
                      <ul className="space-y-1 font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                        {job.highlights.slice(0, 4).map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FA5D00] flex-none mt-1" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tag extensions */}
                  {job.extensions && job.extensions.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {job.extensions.map((ext, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800/80 border editorial-hairline font-mono text-[11px] text-zinc-600 dark:text-zinc-300"
                        >
                          {ext}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Apply Button */}
                <div className="lg:w-48 flex-none flex flex-col justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 editorial-hairline">
                  <a
                    href={job.apply_link || "https://discord.com/invite/7dk4w37BhP"}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-between px-6 py-3 rounded-full bg-black text-white hover:bg-[#FA5D00] dark:bg-white dark:text-black dark:hover:bg-[#FA5D00] dark:hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <a
                    href="https://discord.com/invite/7dk4w37BhP"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 font-mono text-[11px] text-zinc-500 hover:text-[#5865F2] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
                    <span>Discuss in Guild</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for SerpApi Key configuration */}
        {showKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b editorial-hairline">
                <span className="font-mono text-xs font-bold text-[#FA5D00]">SERPAPI CONFIGURATION</span>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="font-mono text-xs text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  [CLOSE]
                </button>
              </div>

              <p className="mt-3 font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Paste your SerpApi API Key from <a href="https://serpapi.com/manage-api-key" target="_blank" rel="noreferrer" className="text-[#FA5D00] underline">serpapi.com</a> to enable direct Google Jobs queries.
              </p>

              <form onSubmit={handleSaveKey} className="mt-4 space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">SERPAPI API KEY</label>
                  <input
                    type="password"
                    value={serpApiKey}
                    onChange={(e) => setSerpApiKey(e.target.value)}
                    placeholder="e.g. 7f98a2..."
                    className="w-full px-4 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:border-[#FA5D00]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2 rounded-full border editorial-hairline text-zinc-600 dark:text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#FA5D00] text-black font-bold uppercase tracking-wider"
                  >
                    Save & Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default JobsPage
