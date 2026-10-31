"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Heart, Mail, ArrowUpRight, Copy, Check, Plus, ExternalLink, Sparkles } from "lucide-react"

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

  // Fetch live ads from Supabase
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
    <section className="relative w-full py-20 sm:py-24 px-6 sm:px-8 bg-transparent overflow-hidden">
      {/* Seamless ambient blurred glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#FA5D00]/[0.025] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          
          {/* Left Editorial Copy */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-[#FA5D00] font-mono text-xs font-semibold uppercase tracking-wider mb-4">
              <span>SPONSORSHIP & BUILD GRANTS</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight leading-[1.05]">
              Back the Next Generation of Builders<span className="text-[#FA5D00]">.</span>
            </h2>

            <p className="mt-4 font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
              Help us sponsor microcontroller boards, sensor kits, server compute, and prize bounties for curious high school and beginner hackers. Zero corporate bloat—every dollar goes directly to hands-on build projects.
            </p>
          </div>

          {/* Right Action Stack */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 flex-none">
            {/* Primary Sponsor Button */}
            <a
              href={`mailto:${sponsorEmail}?subject=Sponsoring%20Reco%20Labs&body=Hi%20Aditya%2C%0A%0AWe%20would%20love%20to%20sponsor%20Reco%20Labs.%20Here%20are%20the%20details%3A`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-black" />
              <span>Sponsor Reco Labs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* Email Pill with Copy Trigger */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border editorial-hairline bg-white dark:bg-zinc-900 font-mono text-xs text-zinc-700 dark:text-zinc-300 shadow-sm">
              <Mail className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
              <a
                href={`mailto:${sponsorEmail}`}
                className="hover:text-[#FA5D00] transition-colors"
              >
                {sponsorEmail}
              </a>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy email address"
                className="ml-1 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
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

        {/* Sponsor Grid: Shows Live Supabase Ads or Interactive Placeholder Slots */}
        <div className="mt-14 pt-8 border-t editorial-hairline">
          <div className="flex items-center justify-between mb-4 font-mono text-xs text-zinc-400">
            <span className="uppercase tracking-wider">OFFICIAL HOMESCREEN SPONSOR SLOTS</span>
            <Link
              to="/sponsors"
              className="text-[#FA5D00] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>View All Tiers & Guidelines</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    className="group relative p-5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-[#FA5D00] dark:hover:border-[#FA5D00] transition-all flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#FA5D00] text-black font-mono text-[9px] font-bold uppercase">
                          {assignedAd.badge_label || "Partner"}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FA5D00] transition-colors" />
                      </div>
                      <h4 className="font-serif text-base font-normal text-zinc-950 dark:text-zinc-50 line-clamp-1">
                        {assignedAd.title}
                      </h4>
                      <p className="mt-1 font-sans text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {assignedAd.description || slot.defaultDesc}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                      <span>{assignedAd.sponsor_name || "Official Partner"}</span>
                      <span className="text-[#FA5D00] group-hover:underline">Visit site ↗</span>
                    </div>
                  </a>
                )
              }

              // Available Placeholder Slot
              return (
                <Link
                  key={slot.key}
                  to="/sponsors"
                  className="group relative p-5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-[#FA5D00] bg-white/40 dark:bg-zinc-900/20 transition-all flex flex-col items-center justify-center text-center min-h-[140px] cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-[#FA5D00] group-hover:border-[#FA5D00] transition-colors mb-2">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    {slot.tierLabel}
                  </span>
                  <div className="font-serif text-sm text-zinc-800 dark:text-zinc-200 font-normal">
                    {slot.defaultName}
                  </div>
                  <span className="mt-2 text-[10px] font-mono text-[#FA5D00] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    + Claim Slot
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
