"use client"

import * as React from "react"
import { Heart, Mail, ArrowUpRight, Copy, Check, Sparkles } from "lucide-react"

export function SponsorSection() {
  const [copied, setCopied] = React.useState(false)
  const sponsorEmail = "devadibxr@gmail.com"

  const handleCopy = () => {
    navigator.clipboard.writeText(sponsorEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
      </div>
    </section>
  )
}

export default SponsorSection
