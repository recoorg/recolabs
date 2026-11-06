"use client"

import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import confetti from "canvas-confetti"
import { Terminal, ArrowUpRight, Sparkles, Code2, Rocket, Layers, Globe, ShieldCheck } from "lucide-react"
import { api } from "@/services/api"
import { GithubIcon, DiscordIcon } from "@/components/icons"

export function HeroSection() {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [joined, setJoined] = React.useState(false)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail || loading) return
    setLoading(true)
    try {
      await api.joinNewsletter(trimmedEmail).catch(() => {})
      setJoined(true)
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#FA5D00", "#5865F2", "#000000", "#ffffff"],
      })
      setTimeout(() => {
        navigate(`/network?signup=true&email=${encodeURIComponent(trimmedEmail)}`)
      }, 400)
    } catch {
      navigate(`/network?signup=true&email=${encodeURIComponent(trimmedEmail)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="hero-sec"
      className="relative min-h-[90vh] w-full flex flex-col justify-between overflow-hidden bg-white dark:bg-[#08080a] pt-32 sm:pt-36 lg:pt-40 pb-16 select-none"
    >
      {/* 1. Subtle Dot-Matrix & Blueprint Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)] opacity-70" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[360px] bg-[#FA5D00]/[0.035] dark:bg-[#FA5D00]/[0.05] rounded-full blur-3xl" />
      </div>

      {/* 2. Top Editorial Header */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center flex flex-col items-center">
        {/* Subtle Guild Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-lime-400/40 bg-[#ccff00]/10 font-mono text-[11px] font-bold uppercase tracking-wider text-lime-400 dark:text-[#ccff00] shadow-2xs mb-6 animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
          <span>THE SKILL EXCHANGE &amp; OPEN-SOURCE GUILD</span>
          <span className="text-[#ccff00] font-bold">· v2.4</span>
        </div>

        {/* Headline in Signature Instrument Serif */}
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[96px] leading-[1.02] tracking-[-0.025em] text-zinc-950 dark:text-zinc-50 font-normal">
          The Skill Exchange <br />
          <span>
            for curious Mind<span className="text-[#ccff00]">.</span>
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-center font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Open-source engineering stacks, founder launchpad, and collaborative software vaults built by curious minds worldwide.
        </p>

        {/* Minimalist Pill Input Bar */}
        <div className="mt-8 sm:mt-10 w-full flex justify-center">
          <form
            onSubmit={handleJoin}
            className="relative inline-flex items-center justify-between w-full max-w-[360px] sm:max-w-[400px] p-1.5 rounded-full bg-black dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-md transition-all focus-within:ring-2 focus-within:ring-[#ccff00]/60"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={joined ? "You're in! Check your inbox." : "your-email@domain.com"}
              disabled={joined}
              className="bg-transparent pl-4 pr-2 py-1.5 text-xs sm:text-sm font-mono text-zinc-200 placeholder:text-zinc-500 outline-none w-full"
            />
            <button
              type="submit"
              disabled={loading || joined}
              className="flex-none px-5 py-2 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-black font-mono text-xs font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer disabled:opacity-75 shadow-md shadow-[#ccff00]/25"
            >
              {loading ? "..." : joined ? "Joined!" : "Join Guild"}
            </button>
          </form>
        </div>

        {/* Fast Action Coordinates */}
        <div className="mt-4 flex items-center justify-center gap-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
          <Link to="/network" className="hover:text-[#ccff00] transition-colors flex items-center gap-1">
            <span>Founder Directory</span>
            <span className="text-[10px]">→</span>
          </Link>
          <span>·</span>
          <Link to="/projects" className="hover:text-[#ccff00] transition-colors flex items-center gap-1">
            <span>Curated Vault</span>
            <span className="text-[10px]">→</span>
          </Link>
          <span>·</span>
          <a
            href="https://github.com/recoorg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ccff00] transition-colors flex items-center gap-1"
          >
            <span>GitHub</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </div>

      {/* 3. Minimal Hero Pattern Stage (No heavy characters) */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 mt-14 sm:mt-16 w-full">
        {/* Pattern Card Frame: Editorial Hairline with Subtle Grid */}
        <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md p-5 sm:p-7 shadow-xs overflow-hidden">
          
          {/* Subtle Grid Accent Line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#ccff00]/60 to-transparent" />

          {/* 3 Minimal Ecosystem Pillars with Dark Curved Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Pillar 1: Curated Vault */}
            <Link
              to="/projects"
              className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0c0c0e]/60 hover:border-[#ccff00] dark:hover:border-[#ccff00] transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shadow-2xs group-hover:bg-[#ccff00] group-hover:text-black transition-all">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-mono text-[10px] font-bold text-black bg-[#ccff00] px-2 py-0.5 rounded-full uppercase shadow-xs">
                  190+ Stacks ↗
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-lime-400 dark:group-hover:text-[#ccff00] transition-colors">
                Engineering Vault
              </h3>
              <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                Production shaders, design systems, terminal toolkits, and hardware rigs.
              </p>
            </Link>

            {/* Pillar 2: Founder Network */}
            <Link
              to="/network"
              className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0c0c0e]/60 hover:border-[#ccff00] dark:hover:border-[#ccff00] transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shadow-2xs group-hover:bg-[#ccff00] group-hover:text-black transition-all">
                  <Rocket className="w-4 h-4" />
                </div>
                <span className="font-mono text-[10px] font-bold text-lime-400 dark:text-[#ccff00] uppercase flex items-center gap-1.5 border border-lime-400/30 bg-[#ccff00]/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                  Live Directory
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-lime-400 dark:group-hover:text-[#ccff00] transition-colors">
                Founder Network
              </h3>
              <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                Launch prototypes, test peer builds, and collect idea/execution/design reviews.
              </p>
            </Link>

            {/* Pillar 3: Open Guild */}
            <a
              href="https://github.com/recoorg"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0c0c0e]/60 hover:border-[#ccff00] dark:hover:border-[#ccff00] transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shadow-2xs group-hover:bg-[#ccff00] group-hover:text-black transition-all">
                  <GithubIcon className="w-4 h-4" />
                </div>
                <span className="font-mono text-[10px] font-bold text-zinc-400 group-hover:text-[#ccff00] transition-colors uppercase">
                  100% Free ↗
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-lime-400 dark:group-hover:text-[#ccff00] transition-colors">
                Open Source Collective
              </h3>
              <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                Built by teenage hackers and collegiate engineers. No paywalls, zero platform cut.
              </p>
            </a>

          </div>

          {/* Bottom Telemetry Strip */}
          <div className="mt-5 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-bold">
                <Terminal className="w-3.5 h-3.5 text-[#ccff00]" />
                reco.network
              </span>
              <span>·</span>
              <span>1,200+ Registered Peers</span>
              <span>·</span>
              <span>0% Middleman Cut</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
              <span className="text-lime-400 dark:text-[#ccff00] font-semibold">Guild Nodes Operational</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
