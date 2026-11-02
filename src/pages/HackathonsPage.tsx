"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { usePageMeta } from "@/hooks/usePageMeta"
import { Calendar, MapPin, ExternalLink, Search, RefreshCw, Trophy, Plus, ArrowUpRight, Globe, Sparkles } from "lucide-react"
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
    title: "Hackathons | Reco Labs",
    description: "Curated youth hackathons and builder sprints. Host your own hackathon or join high-velocity build jams across the globe.",
    image: "/twitter-image.png",
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

    // Put Builder-Hosted hackathons prominently at the top, followed by Hack Club events
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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#f4f4f5] pt-28 sm:pt-36 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Tracwell Centered Hero with Two CTAs */}
        <div className="text-center max-w-3xl mx-auto pb-10 border-b border-[#e5e5e5] dark:border-zinc-800">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4f4f5] dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#357dff]" />
            <span>GLOBAL SPRINT CALENDAR · RECO LABS & HACK CLUB</span>
          </div>

          <h1 className="font-sans text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#0a0a0a] dark:text-white">
            Hackathons Worldwide.
          </h1>

          <p className="font-sans text-base sm:text-lg font-medium leading-relaxed text-[#0a0a0a]/80 dark:text-zinc-300 mt-4">
            A combined directory of community hackathons hosted by Reco Labs builders and student hackathons across the Hack Club aggregate.
          </p>

          {/* Action CTAs: Primary Pill + Secondary Pill */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <Link
              to="/dashboard?tab=post-hackathon"
              className="h-12 px-7 rounded-full bg-[#357dff] hover:bg-[#2563eb] text-white font-sans text-sm font-semibold tracking-normal transition-all shadow-sm active:scale-95 inline-flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Host a Hackathon</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <div className="inline-flex items-center p-1 rounded-full bg-[#f4f4f5] dark:bg-zinc-800/80 border border-[#e5e5e5] dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setEndpointMode("upcoming")}
                className={`h-10 px-5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  endpointMode === "upcoming"
                    ? "bg-white dark:bg-zinc-900 text-[#0a0a0a] dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Upcoming Sprints ({builderEvents.length + hackClubUpcoming.length})
              </button>
              <button
                type="button"
                onClick={() => setEndpointMode("all")}
                className={`h-10 px-5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  endpointMode === "all"
                    ? "bg-white dark:bg-zinc-900 text-[#0a0a0a] dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                All Events Archive
              </button>
            </div>
          </div>
        </div>

        {/* Directory Search & Filters (Tracwell Hairline Container) */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons, cities, countries..."
              className="w-full h-11 pl-10 pr-4 rounded-full border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-[#0a0a0a] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#357dff] transition-colors"
            />
          </div>

          {/* Source & Attendance Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSourceFilter("ALL")
                setAttendanceFilter("ALL")
              }}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                sourceFilter === "ALL" && attendanceFilter === "ALL"
                  ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-black shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              All Sources
            </button>

            <button
              type="button"
              onClick={() => setSourceFilter(sourceFilter === "BUILDER" ? "ALL" : "BUILDER")}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                sourceFilter === "BUILDER"
                  ? "bg-[#357dff] text-white shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              ✨ Builder Hosted ({builderEvents.length})
            </button>

            <button
              type="button"
              onClick={() => setSourceFilter(sourceFilter === "HACKCLUB" ? "ALL" : "HACKCLUB")}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                sourceFilter === "HACKCLUB"
                  ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-black shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              Hack Club
            </button>

            <button
              type="button"
              onClick={() => setAttendanceFilter(attendanceFilter === "VIRTUAL" ? "ALL" : "VIRTUAL")}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                attendanceFilter === "VIRTUAL"
                  ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-black shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              Virtual
            </button>

            <button
              type="button"
              onClick={() => setAttendanceFilter(attendanceFilter === "IN_PERSON" ? "ALL" : "IN_PERSON")}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                attendanceFilter === "IN_PERSON"
                  ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-black shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              In-Person
            </button>

            <button
              type="button"
              onClick={() => setAttendanceFilter(attendanceFilter === "APAC" ? "ALL" : "APAC")}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                attendanceFilter === "APAC"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "border border-[#e5e5e5] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-transparent"
              }`}
            >
              APAC / India
            </button>
          </div>
        </div>

        {/* Counter Info */}
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
          <span>Showing {filteredEvents.length} hackathons ({builderEvents.length} Community Hosted)</span>
          <Link to="/dashboard?tab=post-hackathon" className="text-[#357dff] hover:underline font-semibold">
            + Host your hackathon here
          </Link>
        </div>

        {/* Live Grid (Tracwell 18px Cards) */}
        <div className="mt-8">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#357dff] animate-spin mb-3" />
              <p className="text-xs text-zinc-500">
                Aggregating Hack Club network and Reco Labs community hackathons...
              </p>
            </div>
          ) : error ? (
            <div className="py-16 text-center rounded-[18px] border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          ) : paginatedEvents.length === 0 ? (
            <div className="py-20 text-center rounded-[18px] border border-[#e5e5e5] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-900/30">
              <p className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">No hackathons match this filter.</p>
              <p className="text-xs text-zinc-500 mt-2">
                Try selecting &ldquo;All Sources&rdquo; or clearing your search keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((event) => (
                <div
                  key={event.id}
                  className="group flex flex-col justify-between rounded-[18px] border border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] hover:border-[#357dff] dark:hover:border-[#357dff] transition-all overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md"
                >
                  {/* Banner Image */}
                  {event.banner ? (
                    <div className="relative w-full h-40 bg-zinc-100 dark:bg-zinc-800 overflow-hidden border-b border-[#e5e5e5] dark:border-zinc-800">
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
                        {event.source === "builder" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#357dff] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            BUILDER HOSTED
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                            HACK CLUB
                          </span>
                        )}
                        {event.virtual && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">
                            VIRTUAL
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-r from-blue-500/10 via-zinc-100 to-amber-500/10 dark:from-zinc-900 dark:to-zinc-800 p-4 flex items-center justify-between border-b border-[#e5e5e5] dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                        {event.source === "builder" ? "RECO LABS COMMUNITY" : "YOUTH HACKATHON"}
                      </span>
                      {event.source === "builder" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#357dff] text-white text-[10px] font-bold uppercase">
                          BUILDER
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase">
                          HACK CLUB
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body Details (28px internal padding) */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Logo + Title */}
                      <div className="flex items-start gap-3 mb-3">
                        {event.logo ? (
                          <img
                            src={event.logo}
                            alt=""
                            className="w-10 h-10 rounded-xl object-contain bg-zinc-50 dark:bg-zinc-800 p-1 flex-none border border-[#e5e5e5] dark:border-zinc-700"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#357dff] font-bold text-sm flex-none">
                            {event.name?.charAt(0) || "H"}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-[#0a0a0a] dark:text-white group-hover:text-[#357dff] transition-colors line-clamp-1 leading-snug">
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
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                          {event.tagline}
                        </p>
                      )}

                      {/* Meta: Dates & Location */}
                      <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 mt-4 pt-3 border-t border-[#e5e5e5] dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#357dff] flex-none" />
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

                        {event.prize_pool && (
                          <div className="flex items-center gap-2">
                            <Trophy className="w-3.5 h-3.5 text-amber-500 flex-none" />
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              Prize Pool: {event.prize_pool}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer: External Website / Register Trigger */}
                    <div className="mt-6 pt-4 border-t border-[#e5e5e5] dark:border-zinc-800 flex items-center justify-between">
                      {event.website ? (
                        <a
                          href={event.website}
                          target="_blank"
                          rel="noreferrer"
                          className="h-9 px-4 rounded-full bg-[#f4f4f5] dark:bg-zinc-800 hover:bg-[#357dff] hover:text-white dark:hover:bg-[#357dff] text-zinc-800 dark:text-zinc-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Register</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-400">Link TBD</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        {event.apac && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-semibold">
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
                className="h-12 px-8 rounded-full bg-[#0a0a0a] text-white dark:bg-white dark:text-black text-xs font-semibold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
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
