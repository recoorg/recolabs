"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { usePageMeta } from "@/hooks/usePageMeta"
import { Calendar, MapPin, ExternalLink, Search, RefreshCw, Trophy, Plus, ArrowUpRight, Globe, Sparkles, Filter, ChevronDown, Check } from "lucide-react"
import { api, type HackathonEvent } from "@/services/api"
import { networkApi, type BuilderHackathon } from "@/services/networkApi"

type EndpointMode = "upcoming" | "all"
type AttendanceFilter = "ALL" | "IN_PERSON" | "VIRTUAL" | "APAC"
type SourceFilter = "ALL" | "BUILDER" | "HACKCLUB"

interface MixedHackathon {
  id: string
  name: string
  website: string
  start: string
  end: string
  city?: string
  state?: string
  country?: string
  countryCode?: string
  virtual: boolean
  apac: boolean
  banner?: string
  logo?: string
  source: "builder" | "hackclub"
  author_name?: string
  author_username?: string
  prize_pool?: string
  tagline?: string
  description?: string
}

export function HackathonsPage() {
  usePageMeta({
    title: "Hackathons & Builder Sprints | Reco Labs (recolabs.in)",
    description: "Curated youth hackathons and high-velocity builder sprints on Reco Labs (recolabs.in). Host your own hackathon, ship prototypes, and compete for grants and cash bounties.",
    image: "/twitter-hackathons.png",
  })

  const [endpointMode, setEndpointMode] = React.useState<EndpointMode>("upcoming")
  const [hackClubUpcoming, setHackClubUpcoming] = React.useState<HackathonEvent[]>([])
  const [hackClubAll, setHackClubAll] = React.useState<HackathonEvent[]>([])
  const [builderEvents, setBuilderEvents] = React.useState<BuilderHackathon[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [attendanceFilter, setAttendanceFilter] = React.useState<AttendanceFilter>("ALL")
  const [sourceFilter, setSourceFilter] = React.useState<SourceFilter>("ALL")
  const [visibleCount, setVisibleCount] = React.useState(30)
  const [showFilterMenu, setShowFilterMenu] = React.useState(false)

  // Fetch upcoming events & builder events on mount
  React.useEffect(() => {
    let mounted = true
    async function initFetch() {
      try {
        setLoading(true)
        setError(null)
        const [hcData, bData] = await Promise.all([
          api.getUpcomingHackathons().catch(() => []),
          networkApi.getBuilderHackathons().catch(() => []),
        ])
        if (mounted) {
          setHackClubUpcoming(hcData)
          setBuilderEvents(bData)
        }
      } catch (err: any) {
        if (mounted) setError("Unable to load hackathons at this moment.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    initFetch()
    return () => {
      mounted = false
    }
  }, [])

  // Fetch all events when user toggles to "all" mode for the first time
  React.useEffect(() => {
    let mounted = true
    if (endpointMode === "all" && hackClubAll.length === 0) {
      async function fetchAll() {
        try {
          setLoading(true)
          setError(null)
          const data = await api.getAllHackathons()
          if (mounted) {
            setHackClubAll(data)
          }
        } catch (err: any) {
          if (mounted) setError("Unable to load event archives at this moment.")
        } finally {
          if (mounted) setLoading(false)
        }
      }
      fetchAll()
    }
    return () => {
      mounted = false
    }
  }, [endpointMode, hackClubAll.length])

  // Reset pagination count on filter change
  React.useEffect(() => {
    setVisibleCount(30)
  }, [endpointMode, searchQuery, attendanceFilter, sourceFilter])

  // Normalize and Mix Events
  const mixedEvents = React.useMemo<MixedHackathon[]>(() => {
    // 1. Normalized Builder Events
    const normalizedBuilders: MixedHackathon[] = builderEvents.map((b) => ({
      id: `builder-${b.id}`,
      name: b.name,
      website: b.website,
      start: b.start_date,
      end: b.end_date,
      city: b.virtual ? "Virtual" : b.location || "Community",
      state: "",
      country: b.virtual ? "Online" : "",
      countryCode: b.apac ? "IN" : "",
      virtual: b.virtual,
      apac: b.apac,
      banner: b.banner_url || undefined,
      source: "builder",
      author_name: b.author_name,
      author_username: b.author_username || undefined,
      prize_pool: b.prize_pool || undefined,
      tagline: b.tagline || undefined,
      description: b.description || undefined,
    }))

    // 2. Normalized Hack Club Events
    const hcRaw = endpointMode === "upcoming" ? hackClubUpcoming : hackClubAll
    const normalizedHackClub: MixedHackathon[] = hcRaw.map((ev) => ({
      id: `hc-${ev.id}`,
      name: ev.name,
      website: ev.website,
      start: ev.start,
      end: ev.end,
      city: ev.city,
      state: ev.state,
      country: ev.country,
      countryCode: ev.countryCode,
      virtual: !!ev.virtual,
      apac: !!ev.apac,
      banner: ev.banner,
      logo: ev.logo,
      source: "hackclub",
    }))

    return [...normalizedBuilders, ...normalizedHackClub]
  }, [builderEvents, hackClubUpcoming, hackClubAll, endpointMode])

  // Filter logic
  const filteredEvents = React.useMemo(() => {
    return mixedEvents.filter((ev) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (ev.name && ev.name.toLowerCase().includes(q)) ||
        (ev.city && ev.city.toLowerCase().includes(q)) ||
        (ev.state && ev.state.toLowerCase().includes(q)) ||
        (ev.country && ev.country.toLowerCase().includes(q)) ||
        (ev.countryCode && ev.countryCode.toLowerCase().includes(q)) ||
        (ev.tagline && ev.tagline.toLowerCase().includes(q))

      if (!matchesSearch) return false

      if (attendanceFilter === "VIRTUAL") return ev.virtual === true
      if (attendanceFilter === "IN_PERSON") return ev.virtual === false
      if (attendanceFilter === "APAC") return ev.apac === true

      if (sourceFilter === "BUILDER") return ev.source === "builder"
      if (sourceFilter === "HACKCLUB") return ev.source === "hackclub"

      return true
    })
  }, [mixedEvents, searchQuery, attendanceFilter, sourceFilter])

  const formatEventDate = (startStr?: string, endStr?: string) => {
    if (!startStr) return "TBD Date"
    try {
      const s = new Date(startStr)
      const e = endStr ? new Date(endStr) : s
      const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
      const sFormatted = s.toLocaleDateString("en-US", opts)
      const eFormatted = e.toLocaleDateString("en-US", opts)
      return `${sFormatted} – ${eFormatted}, ${s.getFullYear()}`
    } catch {
      return "TBD Date"
    }
  }

  const paginatedEvents = filteredEvents.slice(0, visibleCount)

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-950 dark:text-zinc-50 pt-28 sm:pt-36 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto pb-10 border-b editorial-hairline">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-[11px] font-bold uppercase tracking-wider text-[#FA5D00] shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FA5D00] animate-pulse" />
            <span>GLOBAL SPRINT CALENDAR · RECO LABS & HACK CLUB</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight leading-none">
            Hackathons Worldwide<span className="text-[#FA5D00]">.</span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed mt-4">
            A combined directory of community hackathons hosted by Reco Labs builders and student hackathons across the Hack Club aggregate.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <Link
              to="/dashboard?tab=post-hackathon"
              className="px-8 py-3.5 rounded-full bg-[#FA5D00] hover:bg-[#e05300] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 inline-flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Host a Hackathon</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <div className="inline-flex items-center p-1 rounded-full border-2 border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold">
              <button
                type="button"
                onClick={() => setEndpointMode("upcoming")}
                className={`px-5 py-2 rounded-full uppercase tracking-wider transition-all cursor-pointer ${
                  endpointMode === "upcoming"
                    ? "bg-[#FA5D00] text-black shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Upcoming ({builderEvents.length + hackClubUpcoming.length})
              </button>
              <button
                type="button"
                onClick={() => setEndpointMode("all")}
                className={`px-5 py-2 rounded-full uppercase tracking-wider transition-all cursor-pointer ${
                  endpointMode === "all"
                    ? "bg-[#FA5D00] text-black shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                All Archive
              </button>
            </div>
          </div>
        </div>

        {/* Directory Search & Filters */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b editorial-hairline font-mono">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons, cities, countries..."
              className="w-full h-11 pl-10 pr-4 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00] transition-colors"
            />
          </div>

          {/* Clean Filter Dropdown with Filter Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`h-11 px-5 rounded-full border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                sourceFilter !== "ALL" || attendanceFilter !== "ALL"
                  ? "border-[#FA5D00] bg-[#FA5D00]/10 text-[#FA5D00]"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              <Filter className="w-4 h-4 text-[#FA5D00]" />
              <span>Filter</span>
              {(sourceFilter !== "ALL" || attendanceFilter !== "ALL") && (
                <span className="w-2 h-2 rounded-full bg-[#FA5D00]" />
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showFilterMenu ? "rotate-180" : ""}`} />
            </button>

            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 p-3.5 rounded-2xl bg-white dark:bg-[#0c0c0e] border-2 border-black dark:border-zinc-700 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b editorial-hairline">
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">Filter Hackathons</span>
                  {(sourceFilter !== "ALL" || attendanceFilter !== "ALL") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSourceFilter("ALL")
                        setAttendanceFilter("ALL")
                      }}
                      className="text-[11px] font-mono text-[#FA5D00] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-1 font-mono text-xs">
                  {[
                    { id: "ALL", label: "All Hackathons" },
                    { id: "VIRTUAL", label: "Virtual / Online" },
                    { id: "IN_PERSON", label: "In-Person (IRL)" },
                    { id: "APAC", label: "APAC / India Region" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAttendanceFilter(opt.id as AttendanceFilter)
                        setShowFilterMenu(false)
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        attendanceFilter === opt.id
                          ? "bg-[#FA5D00] text-black font-bold"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {attendanceFilter === opt.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          </div>
        </div>

        {/* Counter Info */}
        <div className="mt-4 flex items-center justify-between font-mono text-xs text-zinc-500">
          <span>Showing {filteredEvents.length} hackathons</span>
          
        </div>

        {/* Live Grid */}
        <div className="mt-8 font-mono">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#FA5D00] animate-spin mb-3" />
              <p className="text-xs text-zinc-500">
                Aggregating Hack Club network and Reco Labs community hackathons...
              </p>
            </div>
          ) : error ? (
            <div className="py-16 text-center rounded-3xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          ) : paginatedEvents.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border editorial-hairline bg-zinc-50/50 dark:bg-zinc-900/30">
              <p className="font-serif text-2xl text-zinc-800 dark:text-zinc-200">No hackathons match this filter.</p>
              <p className="text-xs text-zinc-500 mt-2">
                Try selecting &ldquo;All Sources&rdquo; or clearing your search keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((event) => (
                <div
                  key={event.id}
                  className="group flex flex-col justify-between rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/40 hover:border-[#FA5D00] transition-all overflow-hidden shadow-xs hover:shadow-md"
                >
                  {/* Banner Image */}
                  {event.banner ? (
                    <div className="relative w-full h-40 bg-zinc-100 dark:bg-zinc-800 overflow-hidden border-b editorial-hairline">
                      <img
                        src={event.banner}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none"
                        }}
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                          VERIFIED
                        </span>
                        {event.virtual && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">
                            VIRTUAL
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-r from-[#FA5D00]/15 via-zinc-100 to-amber-500/10 dark:from-zinc-900 dark:to-zinc-800 p-4 flex items-center justify-between border-b editorial-hairline">
                      <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">
                        {event.source === "builder" ? "RECO LABS COMMUNITY" : "YOUTH HACKATHON"}
                      </span>
                      {event.source === "builder" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FA5D00] text-black text-[10px] font-bold uppercase">
                          BUILDER
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase">
                          HACK CLUB
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Logo + Title */}
                      <div className="flex items-start gap-3 mb-3">
                        {event.logo ? (
                          <img
                            src={event.logo}
                            alt=""
                            className="w-10 h-10 rounded-xl object-contain bg-zinc-50 dark:bg-zinc-800 p-1 flex-none border editorial-hairline"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 flex items-center justify-center text-[#FA5D00] font-bold text-sm flex-none">
                            {event.name?.charAt(0) || "H"}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-2xl text-zinc-950 dark:text-white group-hover:text-[#FA5D00] transition-colors line-clamp-1 leading-snug">
                            {event.name}
                          </h3>
                          {event.author_name && (
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              Hosted by {event.author_name} {event.author_username && `(@${event.author_username})`}
                            </p>
                          )}
                        </div>
                      </div>

                      {event.tagline && (
                        <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                          {event.tagline}
                        </p>
                      )}

                      {/* Meta: Dates & Location */}
                      <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 mt-4 pt-3 border-t editorial-hairline font-mono">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {formatEventDate(event.start, event.end)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-none" />
                          <span className="truncate">
                            {event.virtual
                              ? "Online / Virtual Everywhere"
                              : [event.city, event.state, event.countryCode || event.country]
                                  .filter(Boolean)
                                  .join(", ") || "Location Announced on Site"}
                          </span>
                        </div>

                        {event.prize_pool && (
                          <div className="flex items-center gap-2">
                            <Trophy className="w-3.5 h-3.5 text-amber-500 flex-none" />
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              Prize Pool: {event.prize_pool}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer: External Website / Register Trigger */}
                    <div className="mt-6 pt-4 border-t editorial-hairline flex items-center justify-between">
                      {event.website ? (
                        <a
                          href={event.website}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-full bg-[#FA5D00] hover:bg-[#e05300] text-black text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Register</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-400">Link TBD</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        {event.apac && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                            APAC
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button for large archives */}
          {!loading && filteredEvents.length > visibleCount && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 30)}
                className="px-8 py-3.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Load More Hackathons ({filteredEvents.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default HackathonsPage
