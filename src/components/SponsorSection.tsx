"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Heart, Mail, ArrowUpRight, Copy, Check, Plus, Sparkles } from "lucide-react"

export function SponsorSection() {
  const [copied, setCopied] = React.useState(false)
  const sponsorEmail = "devadibxr@gmail.com"

  const handleCopy = () => {
    navigator.clipboard.writeText(sponsorEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const previewSlots = [
    { label: "Partner Slot 01", desc: "Founding Partner" },
    { label: "Partner Slot 02", desc: "Hardware & PCB Lab" },
    { label: "Partner Slot 03", desc: "Cloud & Compute" },
    { label: "Partner Slot 04", desc: "Community Tier" },
  ]

  return (
    <section className="relative w-full py-20 sm:py-24 px-6 sm:px-8 border-t border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-[#0c0c0e]/80 overflow-hidden">
      {/* Seamless ambient blurred glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#FA5D00]/[0.03] dark:bg-[#FA5D00]/[0.045] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          
          {/* Left Editorial Copy */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900/60 text-[#FA5D00] font-mono text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPONSORSHIP & BUILD GRANTS</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight leading-[1.08]">
              Back the Next Generation of Builders<span className="text-[#FA5D00]">.</span>
            </h2>

            <p className="mt-4 font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed">
              Help us sponsor microcontroller boards, sensor kits, server compute, and prize bounties for curious high school and beginner hackers. Zero corporate bloat—every dollar goes directly to hands-on build projects.
            </p>
          </div>

          {/* Right Action Stack with Matched Button Sizes */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 flex-none">
            {/* Primary Sponsor Button (exact matched height & typography) */}
            <a
              href={`mailto:${sponsorEmail}?subject=Sponsoring%20Reco%20Labs&body=Hi%20Aditya%2C%0A%0AWe%20would%20love%20to%20sponsor%20Reco%20Labs.%20Here%20are%20the%20details%3A`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer border border-[#FA5D00] w-full sm:w-auto"
            >
              <Heart className="w-3.5 h-3.5 fill-black" />
              <span>Sponsor Reco Labs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* Email Pill with Copy Trigger (exact matched height & typography) */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-xs text-zinc-800 dark:text-zinc-200 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                <a
                  href={`mailto:${sponsorEmail}`}
                  className="hover:text-[#FA5D00] transition-colors truncate font-semibold"
                >
                  {sponsorEmail}
                </a>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy email address"
                className="ml-1 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer flex-none"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Sponsor Placeholder Logo Strip */}
        <div className="mt-14 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            <span className="uppercase tracking-wider font-semibold">OFFICIAL SPONSOR SLOTS</span>
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
                className="group p-5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-[#FA5D00] dark:hover:border-[#FA5D00] transition-all flex flex-col items-center justify-center text-center min-h-[105px] shadow-2xs hover:shadow-xs"
              >
                <div className="w-8 h-8 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-[#FA5D00] group-hover:border-[#FA5D00] transition-colors mb-2 bg-zinc-50 dark:bg-zinc-800/50">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="font-serif text-base text-zinc-950 dark:text-zinc-100 group-hover:text-[#FA5D00] transition-colors">
                  {slot.label}
                </div>
                <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {slot.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default SponsorSection
