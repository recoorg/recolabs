"use client"

import * as React from "react"
import { Calendar, MapPin, ExternalLink, Search, RefreshCw } from "lucide-react"
import { api, type HackathonEvent } from "@/services/api"
import { SEO } from "@/components/SEO"

type EndpointMode = "upcoming" | "all"
type AttendanceFilter = "ALL" | "IN_PERSON" | "VIRTUAL" | "APAC"

export function HackathonsPage() {
  const [endpointMode, setEndpointMode] = React.useState<EndpointMode>("upcoming")
  const [upcomingEvents, setUpcomingEvents] = React.useState<HackathonEvent[]>([])
  const [allEvents, setAllEvents] = React.useState<HackathonEvent[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [attendanceFilter, setAttendanceFilter] = React.useState<AttendanceFilter>("ALL")
  const [visibleCount, setVisibleCount] = React.useState(30)

  // Fetch upcoming events on mount
  React.useEffect(() => {
    let mounted = true
    async function fetchUpcoming() {
      try {
        setLoading(true)
        setError(null)
        const data = await api.getUpcomingHackathons()
        if (mounted) {
          setUpcomingEvents(data)
        }
      } catch (err: any) {
        if (mounted) setError("Unable to load hackathons at this moment.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchUpcoming()
    return () => {
      mounted = false
    }
  }, [])

  // Fetch all events when user toggles to "all" mode for the first time
  React.useEffect(() => {
    let mounted = true
    if (endpointMode === "all" && allEvents.length === 0) {
      async function fetchAll() {
        try {
          setLoading(true)
          setError(null)
          const data = await api.getAllHackathons()
          if (mounted) {
            setAllEvents(data)
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
  }, [endpointMode, allEvents.length])

  // Reset pagination count on filter change
  React.useEffect(() => {
    setVisibleCount(30)
  }, [endpointMode, searchQuery, attendanceFilter])

  const activeEvents = endpointMode === "upcoming" ? upcomingEvents : allEvents

  // Filter logic
  const filteredEvents = React.useMemo(() => {
    return activeEvents.filter((ev) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (ev.name && ev.name.toLowerCase().includes(q)) ||
        (ev.city && ev.city.toLowerCase().includes(q)) ||
        (ev.state && ev.state.toLowerCase().includes(q)) ||
        (ev.country && ev.country.toLowerCase().includes(q)) ||
        (ev.countryCode && ev.countryCode.toLowerCase().includes(q))

      if (!matchesSearch) return false

      if (attendanceFilter === "VIRTUAL") return ev.virtual === true
      if (attendanceFilter === "IN_PERSON") return ev.virtual === false
      if (attendanceFilter === "APAC") return ev.apac === true
      return true
    })
  }, [activeEvents, searchQuery, attendanceFilter])

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
    <div className="relative w-full pt-32 sm:pt-36 pb-24 px-6 sm:px-8 bg-transparent overflow-hidden">
      <SEO
        title="Global Hackathons & Build Sprints · Reco Labs"
        description="Comprehensive real-time directory of 900+ high-school and teen hackathons, build sprints, and weekend maker competitions worldwide."
      />
      {/* Seamless ambient blurred glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#FA5D00]/[0.025] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-orange-500/[0.02] dark:bg-orange-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto pb-12 border-b editorial-hairline">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
            HACKATHONS & SPRINTS CALENDAR
          </span>
          <h1 className="mt-4 font-serif text-5xl sm:text-7xl lg:text-8xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
            Hackathons Worldwide<span className="text-[#FA5D00]">.</span>
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Discover upcoming youth hackathons, explore past build jams, and register to ship real software and hardware.
          </p>

          {/* Primary Switcher Tabs */}
          <div className="mt-10 inline-flex items-center p-1.5 rounded-full border-2 border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 shadow-sm">
            <button
              type="button"
              onClick={() => setEndpointMode("upcoming")}
              className={`px-6 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                endpointMode === "upcoming"
                  ? "bg-[#FA5D00] text-black shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Upcoming Sprints ({upcomingEvents.length > 0 ? upcomingEvents.length : "..."})
            </button>
            <button
              type="button"
              onClick={() => setEndpointMode("all")}
              className={`px-6 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                endpointMode === "all"
                  ? "bg-[#FA5D00] text-black shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              All Events Archive ({allEvents.length > 0 ? allEvents.length : "900+"})
            </button>
          </div>
        </div>

        {/* Directory Controls: Search & Filters */}
        <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b editorial-hairline">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, city, country..."
              className="w-full pl-10 pr-4 py-2 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#FA5D00] transition-colors"
            />
          </div>

          {/* Attendance Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-zinc-400 mr-1 hidden sm:inline">FILTER:</span>
            {(["ALL", "IN_PERSON", "VIRTUAL", "APAC"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setAttendanceFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full border text-[11px] font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  attendanceFilter === filter
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-zinc-500 bg-transparent"
                }`}
              >
                {filter === "ALL" ? "All" : filter === "IN_PERSON" ? "In-Person" : filter === "VIRTUAL" ? "Virtual" : "APAC"}
              </button>
            ))}
          </div>
        </div>

        {/* Live Grid */}
        <div className="mt-10">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#FA5D00] animate-spin mb-3" />
              <p className="font-mono text-xs text-zinc-500">
                Loading hackathon schedule...
              </p>
            </div>
          ) : error ? (
            <div className="py-16 text-center border rounded-2xl editorial-hairline bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-mono text-xs">
              {error}
            </div>
          ) : paginatedEvents.length === 0 ? (
            <div className="py-20 text-center border rounded-3xl editorial-hairline bg-zinc-50/50 dark:bg-zinc-900/30">
              <p className="font-serif text-2xl text-zinc-800 dark:text-zinc-200">No hackathons match this filter.</p>
              <p className="font-mono text-xs text-zinc-500 mt-2">
                Try selecting &ldquo;All&rdquo; or clearing your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((event) => (
                <div
                  key={event.id}
                  className="group flex flex-col justify-between rounded-2xl border editorial-hairline bg-white dark:bg-zinc-900/40 hover:border-[#FA5D00] transition-all overflow-hidden shadow-sm hover:shadow-md"
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
                        {event.virtual && (
                          <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-sm text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                            VIRTUAL
                          </span>
                        )}
                        {event.hybrid && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FA5D00]/90 backdrop-blur-sm text-black font-mono text-[10px] font-bold uppercase tracking-wider">
                            HYBRID
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800/80 p-4 flex items-center justify-between border-b editorial-hairline">
                      <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">
                        YOUTH HACKATHON
                      </span>
                      {event.virtual && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FA5D00]/20 text-[#FA5D00] font-mono text-[10px] font-bold uppercase">
                          VIRTUAL
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
                          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 flex items-center justify-center text-[#FA5D00] font-bold font-mono text-sm flex-none">
                            {event.name?.charAt(0) || "H"}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-2xl text-zinc-950 dark:text-zinc-50 group-hover:text-[#FA5D00] transition-colors line-clamp-1 leading-snug">
                            {event.name}
                          </h3>
                        </div>
                      </div>

                      {/* Meta: Dates & Location */}
                      <div className="space-y-2 font-sans text-xs text-zinc-600 dark:text-zinc-400 mt-4 pt-3 border-t editorial-hairline">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
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
                      </div>
                    </div>

                    {/* Footer: External Website Trigger */}
                    <div className="mt-6 pt-4 border-t editorial-hairline flex items-center justify-between">
                      {event.website ? (
                        <a
                          href={event.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-black dark:text-white group-hover:text-[#FA5D00] transition-colors"
                        >
                          <span>Visit Website</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-zinc-400">Website TBD</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        {event.apac && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                            APAC
                          </span>
                        )}
                        {event.mlhAssociated && (
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-bold">
                            MLH
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
                className="px-8 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
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
