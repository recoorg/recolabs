"use client"

import * as React from "react"
import { ArrowUpRight, CheckCircle2, Sparkles, MessageSquare, Briefcase, Search, MapPin, DollarSign, Building2, Filter, ExternalLink, RefreshCw } from "lucide-react"
import { api, type GoogleJobItem } from "@/services/api"

export function JobsPage() {
  const [jobs, setJobs] = React.useState<GoogleJobItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("ALL")
  const [remoteOnly, setRemoteOnly] = React.useState(false)
  const [selectedJob, setSelectedJob] = React.useState<GoogleJobItem | null>(null)

  React.useEffect(() => {
    let mounted = true
    async function loadJobs() {
      try {
        setLoading(true)
        const data = await api.getGoogleJobs()
        if (mounted) setJobs(data)
      } catch (err) {
        console.error("Failed to load jobs:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadJobs()
    return () => {
      mounted = false
    }
  }, [])

  // Filter jobs based on search query, category, and remote toggle
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company_name.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q)

      if (!matchesSearch) return false

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
  }, [jobs, searchQuery, categoryFilter, remoteOnly])

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
            Curated engineering positions, open hardware lab residencies, and developer fellowships. Filtered to focus exclusively on real technical work and eliminate low-quality internship spam.
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
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, stack, company..."
              className="w-full pl-10 pr-4 py-2 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#FA5D00] transition-colors"
            />
          </div>

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
          </div>
        </div>

        {/* Counter Info */}
        <div className="mt-4 flex items-center justify-between font-mono text-xs text-zinc-500">
          <span>Showing {filteredJobs.length} technical opportunities</span>
          <span>SerpApi & Reco Guild Index</span>
        </div>

        {/* Roles List */}
        <div className="mt-8 space-y-6">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#FA5D00] animate-spin mb-3" />
              <p className="font-mono text-xs text-zinc-500">
                Streaming technical roles from jobs index...
              </p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-20 text-center border rounded-3xl editorial-hairline bg-zinc-50/50 dark:bg-zinc-900/30">
              <p className="font-serif text-2xl text-zinc-800 dark:text-zinc-200">No openings match your search criteria.</p>
              <p className="font-mono text-xs text-zinc-500 mt-2">
                Try selecting &ldquo;ALL&rdquo; or clearing your keywords.
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
                        {job.highlights.map((h, i) => (
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

        {/* Discord Guild Application Box */}
        <div className="mt-20 p-8 rounded-3xl border-2 border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-center">
          <Sparkles className="w-8 h-8 text-[#FA5D00] mx-auto mb-3" />
          <h2 className="font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal">
            Looking for something custom?
          </h2>
          <p className="mt-3 font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Have a unique open-source tool, hardware design, or tutorial series you want to build under Reco Labs? Hop into our Discord and share your idea.
          </p>
          <div className="mt-6">
            <a
              href="https://discord.com/invite/7dk4w37BhP"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Pitch Your Build in Discord</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}

export default JobsPage
