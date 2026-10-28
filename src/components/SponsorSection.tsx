"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Heart, Mail, ArrowUpRight, Copy, Check, Sparkles, Plus } from "lucide-react"

export function SponsorSection() {
  const [copied, setCopied] = React.useState(false)
  const sponsorEmail = "devadibxr@gmail.com"

  const handleCopy = () => {
    navigator.clipboard.writeText(sponsorEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const previewSlots = [
    { label: "Partner Slot 01", desc: "Founding Tier" },
    { label: "Partner Slot 02", desc: "Hardware Lab" },
    { label: "Partner Slot 03", desc: "Cloud & Compute" },
    { label: "Partner Slot 04", desc: "Community Tier" },
  ]

  return (
    <section className="relative w-full py-20 sm:py-24 px-6 sm:px-8 border-t editorial-hairline bg-[#fafafa] dark:bg-[#0c0d12]">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          
          {/* Left Editorial Copy */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 text-[#FA5D00] font-mono text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
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
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-black" />
              <span>Sponsor Reco Labs</span>
              <ArrowUpRight className="w-4 h-4" />
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

        {/* Sponsor Placeholder Logo Strip */}
        <div className="mt-14 pt-8 border-t editorial-hairline">
          <div className="flex items-center justify-between mb-4 font-mono text-xs text-zinc-400">
            <span className="uppercase tracking-wider">OFFICIAL SPONSOR SLOTS</span>
            <Link
              to="/sponsors"
              className="text-[#FA5D00] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>View All Tiers & Guidelines</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {previewSlots.map((slot, i) => (
              <Link
                key={i}
                to="/sponsors"
                className="group p-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/30 hover:border-[#FA5D00] transition-all flex flex-col items-center justify-center text-center min-h-[90px]"
              >
                <div className="w-7 h-7 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-[#FA5D00] group-hover:border-[#FA5D00] transition-colors mb-1.5">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div className="font-serif text-sm text-zinc-800 dark:text-zinc-200">{slot.label}</div>
                <div className="font-mono text-[10px] text-zinc-400">{slot.desc}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default SponsorSection
