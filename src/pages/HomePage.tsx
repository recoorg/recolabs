"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { HeroSection } from "@/components/HeroSection"
import { RepoShowcase } from "@/components/RepoShowcase"
import { ArrowUpRight, Sparkles, Terminal, Flame, Users, BookOpen } from "lucide-react"

export function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section matching exact screenshot */}
      <HeroSection />

      {/* Brief Manifesto Bridge */}
      <section className="relative w-full py-24 px-6 sm:px-8 border-t editorial-hairline bg-white dark:bg-[#09090b]">
        <div className="mx-auto max-w-5xl text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
            FROM HIGH SCHOOL EXPERIMENT TO GLOBAL GUILD
          </span>
          <h2 className="mt-4 font-serif text-4xl sm:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight max-w-3xl mx-auto leading-tight">
            Built to fix real problems, share tutorials, and help beginners find their path<span className="text-[#FA5D00]">.</span>
          </h2>
          <p className="mt-6 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Founded by Aditya in Grade 10, Reco Labs is a peer-driven collective where curious minds exchange skills across software, circuits, and open-source infrastructure.
          </p>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-85 transition-opacity"
            >
              <Users className="w-4 h-4" />
              <span>Read Founders Story</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border editorial-hairline bg-transparent font-mono text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 hover:border-[#FA5D00] transition-colors"
            >
              <Terminal className="w-4 h-4 text-[#FA5D00]" />
              <span>Browse Repositories</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Repositories on Glass Folder Cards */}
      <RepoShowcase />
    </div>
  )
}

export default HomePage
