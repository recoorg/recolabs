"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { HeroSection } from "@/components/HeroSection"
import { StatsBentoSection } from "@/components/StatsBentoSection"
import { RepoShowcase } from "@/components/RepoShowcase"
import { SponsorSection } from "@/components/SponsorSection"
import { ArrowUpRight, Terminal, Users } from "lucide-react"
import { usePageMeta } from "@/hooks/usePageMeta"

export function HomePage() {
  usePageMeta({
    title: "Reco Labs — The Skill Exchange & Open-Source Guild for Builders (recolabs.in)",
    description: "Official platform of Reco Labs (recolabs.in). The Skill Exchange and global open-source collective for curious minds, student builders, and teenage hackers. Founded by Aditya Raj & Tanish. Discover curated engineering vaults, founder startup launchpad, hackathons, and guild opportunities.",
    image: "/twitter-image.png",
  })

  return (
    <div className="w-full">
      {/* Hero Section matching Financial Design System */}
      <HeroSection />

      {/* Brief Manifesto Bridge */}
      <section className="relative w-full py-24 px-6 sm:px-8 bg-transparent overflow-hidden">
        {/* Seamless ambient blurred glow in signature Reco Orange */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-bold">
            FROM HIGH SCHOOL EXPERIMENT TO GLOBAL GUILD
          </span>
          <h2 className="mt-4 font-serif text-4xl sm:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight max-w-3xl mx-auto leading-tight">
            Built to fix real problems, share tutorials, and help beginners find their path<span className="text-[#FA5D00]">.</span>
          </h2>
          <p className="mt-6 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Founded by Aditya and Tanish, Reco Labs is a peer-driven collective where curious minds exchange skills across software, circuits, and open-source infrastructure.
          </p>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-85 transition-opacity shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>Read Founders Story</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent font-mono text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 hover:border-[#FA5D00] hover:text-[#FA5D00] dark:hover:text-[#FA5D00] transition-colors"
            >
              <Terminal className="w-4 h-4 text-[#FA5D00]" />
              <span>Browse Repositories</span>
            </Link>
          </div>
        </div>
      </section>

      {/* UI-Layouts Bento Stats Section based on Real Reco Data */}
      <StatsBentoSection />

      {/* Repositories on Glass Folder Cards */}
      <RepoShowcase />

      {/* Sponsors Section - Displayed Exclusively on HomePage */}
      <SponsorSection />
    </div>
  )
}

export default HomePage
