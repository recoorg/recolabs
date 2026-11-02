"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Heart, Mail, ArrowUpRight, Copy, Check, Plus, ExternalLink } from "lucide-react"

interface HomeSponsorAd {
  id: number
  title: string
  description?: string
  destination_url: string
  placement: string
  badge_label?: string
  sponsor_name?: string
  is_active: boolean
}

export function SponsorSection() {
  const [copied, setCopied] = React.useState(false)
  const [liveAds, setLiveAds] = React.useState<HomeSponsorAd[]>([])
  const sponsorEmail = "devadibxr@gmail.com"

  const handleCopy = () => {
    navigator.clipboard.writeText(sponsorEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Fetch live ads from Supabase / Postgres
  React.useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`/api/network/ads?_t=${Date.now()}`)
        const data = await res.json()
        if (data && Array.isArray(data.ads)) {
          setLiveAds(data.ads.filter((a: HomeSponsorAd) => a && a.is_active))
        }
      } catch (e) {
        console.warn("Home sponsor fetch note:", e)
      }
    }
    fetchAds()
  }, [])

  // 4 Designated Home Screen Sponsor Tiers
  const slotsConfig = [
    {
      key: "home_sponsor_1",
      tierLabel: "TIER 01 · FOUNDING PARTNER",
      defaultName: "Founding Partner Slot",
      defaultDesc: "Hardware lab, global shipping, and beginner workshops sponsor.",
    },
    {
      key: "home_sponsor_2",
      tierLabel: "TIER 02 · HARDWARE LAB",
      defaultName: "Hardware Lab Slot",
      defaultDesc: "Microcontroller dev boards, test benches, and glitcher rigs.",
    },
    {
      key: "home_sponsor_3",
      tierLabel: "TIER 03 · CLOUD & COMPUTE",
      defaultName: "Cloud & Compute Slot",
      defaultDesc: "Server instances, LLM credits, and deployment infrastructure.",
    },
    {
      key: "home_sponsor_4",
      tierLabel: "TIER 04 · COMMUNITY TIER",
      defaultName: "Community Tier Slot",
      defaultDesc: "High school hackathon prize bounties and student mentorship.",
    },
  ]

  const handleAdClick = (adId: number) => {
    fetch("/api/network/ads/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: adId }),
    }).catch(() => {})
  }

  return (
    <section className="relative w-full py-28 px-6 sm:px-8 bg-transparent overflow-hidden">
      {/* Seamless ambient blurred glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#FA5D00]/[0.025] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header - Matching RepoShowcase scale and rhythm */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-14 border-b editorial-hairline">
          
          {/* Left Editorial Copy */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-[#FA5D00] font-mono text-xs font-semibold uppercase tracking-wider mb-4">
              <span>SPONSORSHIP & BUILD GRANTS</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight leading-[1.04]">
              Back the next generation of builders<span className="text-[#FA5D00]">.</span>
            </h2>

            <p className="mt-5 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-2xl">
              Help us sponsor microcontroller boards, sensor kits, server compute, and prize bounties for curious high school and beginner hackers. Zero corporate bloat—every dollar goes directly to hands-on build projects.
            </p>
          </div>

          {/* Right Action Stack */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3.5 flex-none">
            {/* Primary Sponsor Button */}
            <a
              href={`mailto:${sponsorEmail}?subject=Sponsoring%20Reco%20Labs&body=Hi%20Aditya%2C%0A%0AWe%20would%20love%20to%20sponsor%20Reco%20Labs.%20Here%20are%20the%20details%3A`}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-black" />
              <span>Sponsor Reco Labs</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            {/* Email Pill with Copy Trigger */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border editorial-hairline bg-white/70 dark:bg-zinc-900/60 font-mono text-xs text-zinc-700 dark:text-zinc-300 shadow-2xs">
              <Mail className="w-3.5 h-3.5 text-[#FA5D00]" />
              <a href={`mailto:${sponsorEmail}`} className="hover:text-[#FA5D00] transition-colors font-medium">
                {sponsorEmail}
              </a>
              <button
                onClick={handleCopy}
                title="Copy sponsor email"
                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Sponsor Grid: Full-sized, rich cards matching repository showcase density */}
        <div className="mt-14">
          <div className="flex items-center justify-between mb-6 font-mono text-xs text-zinc-400">
            <span className="uppercase tracking-wider font-semibold">OFFICIAL HOMESCREEN SPONSOR TIERS</span>
            <Link
              to="/sponsors"
              className="text-[#FA5D00] font-bold hover:underline inline-flex items-center gap-1.5"
            >
              <span>View All Tiers &amp; Guidelines</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {slotsConfig.map((slot, idx) => {
              // Check if an active ad matches this slot or general home placement
              const assignedAd = liveAds.find(
                (a) =>
                  a.placement === slot.key ||
                  (a.placement === "home_sponsor" && liveAds.indexOf(a) === idx) ||
                  (a.placement === "all" && liveAds.indexOf(a) === idx)
              )

              if (assignedAd) {
                return (
                  <a
                    key={slot.key}
                    href={assignedAd.destination_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleAdClick(assignedAd.id)}
                    className="group relative p-7 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 hover:border-[#FA5D00] dark:hover:border-[#FA5D00] transition-all flex flex-col justify-between min-h-[220px] shadow-xs hover:shadow-xl cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FA5D00] text-black font-mono text-[10px] font-bold uppercase tracking-wider">
                          {assignedAd.badge_label || "Partner"}
                        </span>
                        <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-[#FA5D00] transition-colors" />
                      </div>
                      <h4 className="font-serif text-2xl font-normal text-zinc-950 dark:text-zinc-50 leading-snug">
                        {assignedAd.title}
                      </h4>
                      <p className="mt-2.5 font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {assignedAd.description || slot.defaultDesc}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs font-mono text-zinc-400 flex items-center justify-between">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{assignedAd.sponsor_name || "Official Partner"}</span>
                      <span className="text-[#FA5D00] font-bold group-hover:underline">Visit site ↗</span>
                    </div>
                  </a>
                )
              }

              // Available Placeholder Slot - Rich, full-height card
              return (
                <Link
                  key={slot.key}
                  to="/sponsors"
                  className="group relative p-7 rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-[#FA5D00] dark:hover:border-[#FA5D00] bg-white/50 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-900/60 transition-all flex flex-col items-center justify-center text-center min-h-[220px] shadow-2xs hover:shadow-md cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-[#FA5D00] group-hover:border-[#FA5D00] transition-all mb-3.5 group-hover:scale-110">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#FA5D00] mb-1.5">
                    {slot.tierLabel}
                  </span>
                  <div className="font-serif text-lg sm:text-xl text-zinc-950 dark:text-zinc-50 font-normal">
                    {slot.defaultName}
                  </div>
                  <p className="mt-1.5 font-sans text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed max-w-[220px]">
                    {slot.defaultDesc}
                  </p>
                  <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-mono text-[#FA5D00] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>+ Claim Slot</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}

export default SponsorSection
