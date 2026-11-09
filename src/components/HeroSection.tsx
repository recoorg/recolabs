"use client"

import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import confetti from "canvas-confetti"
import {
  Terminal,
  ArrowUpRight,
  Sparkles,
  Code2,
  Rocket,
  Layers,
  Globe,
  ShieldCheck,
  Flame,
  Zap,
  TrendingUp,
  CheckCircle2,
  Cpu,
  Radio,
  ChevronRight,
} from "lucide-react"
import { api } from "@/services/api"
import { TimelineAnimation } from "@/components/ui/timeline-animation"

// Floating Background Icon Pattern (Audited Recipe Lines 119-125)
const BACKGROUND_ICONS = [
  { Icon: Terminal, x: "7%", y: "15%", size: 28 },
  { Icon: Cpu, x: "89%", y: "19%", size: 32 },
  { Icon: Code2, x: "13%", y: "45%", size: 24 },
  { Icon: ShieldCheck, x: "93%", y: "50%", size: 30 },
  { Icon: Zap, x: "6%", y: "76%", size: 26 },
  { Icon: Layers, x: "86%", y: "82%", size: 28 },
  { Icon: Rocket, x: "50%", y: "7%", size: 22 },
  { Icon: Globe, x: "78%", y: "34%", size: 26 },
]

export function HeroSection() {
  const timelineRef = React.useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [joined, setJoined] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"network" | "hackathons" | "jobs">("network")
  const [upvotedItems, setUpvotedItems] = React.useState<Record<string, number>>({
    catalyst: 42,
    byteengine: 38,
    recotools: 29,
  })
  const [hasUpvoted, setHasUpvoted] = React.useState<Record<string, boolean>>({})

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail || loading) return
    setLoading(true)
    try {
      await api.joinNewsletter(trimmedEmail).catch(() => {})
      setJoined(true)
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
        colors: ["#FA5D00", "#FF8C42", "#000000", "#ffffff"],
      })
      setTimeout(() => {
        navigate(`/network?signup=true&email=${encodeURIComponent(trimmedEmail)}`)
      }, 500)
    } catch {
      navigate(`/network?signup=true&email=${encodeURIComponent(trimmedEmail)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasUpvoted[id]) return
    setUpvotedItems((prev) => ({ ...prev, [id]: prev[id] + 1 }))
    setHasUpvoted((prev) => ({ ...prev, [id]: true }))
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.65 },
      colors: ["#FA5D00", "#FF8C42"],
    })
  }

  return (
    <section
      id="hero-sec"
      ref={timelineRef}
      className="relative min-h-[92vh] w-full flex flex-col justify-between overflow-hidden bg-[#07090e] text-zinc-100 pt-32 sm:pt-36 lg:pt-42 pb-20 select-none"
    >
      {/* ============================================================ */}
      {/* 1. CANONICAL AUDITED SVG GAUSSIAN BLUR TUBES (ui-layouts)    */}
      {/* ============================================================ */}
      <svg
        width="358"
        height="483"
        viewBox="0 0 358 483"
        className="absolute top-0 z-0 left-0 pointer-events-none opacity-80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_hero)">
          <rect
            x="-86.9961"
            y="-33.114"
            width="72"
            height="541"
            rx="36"
            transform="rotate(-30.8182 -86.9961 -33.114)"
            fill="url(#paint0_linear_hero)"
          />
        </g>
        <g filter="url(#filter1_f_hero)">
          <rect
            x="-17"
            y="-135.113"
            width="50.0937"
            height="541"
            rx="25.0469"
            transform="rotate(-30.8182 -17 -135.113)"
            fill="url(#paint1_linear_hero)"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_hero"
            x="-137.641"
            y="-120.646"
            width="440.285"
            height="602.787"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="32" result="effect1_foregroundBlur_hero" />
          </filter>
          <filter
            id="filter1_f_hero"
            x="-71.707"
            y="-215.486"
            width="429.598"
            height="599.69"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="32" result="effect1_foregroundBlur_hero" />
          </filter>
          <linearGradient
            id="paint0_linear_hero"
            x1="-50.9961"
            y1="-33.114"
            x2="-50.9961"
            y2="507.886"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FA5D00" stopOpacity="0.45" />
            <stop offset="1" stopColor="#FF8C42" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_hero"
            x1="8.04686"
            y1="-135.113"
            x2="8.04686"
            y2="405.887"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ff7a1a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ffa65c" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* Atmospheric depth halos */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#293244_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_90%)] opacity-35" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-[#FA5D00]/[0.08] rounded-full blur-[140px]" />
        <div className="absolute top-1/4 -right-40 w-[600px] h-[500px] bg-blue-600/[0.04] rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 -left-40 w-[550px] h-[450px] bg-amber-500/[0.035] rounded-full blur-[140px]" />

        {/* Low-Opacity Icon Pattern (Audited Recipe Lines 119-125) */}
        {BACKGROUND_ICONS.map(({ Icon, x, y, size }, index) => (
          <div
            key={index}
            style={{ left: x, top: y }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-zinc-400/[0.04] dark:text-zinc-500/[0.05]"
          >
            <Icon size={size} strokeWidth={1.5} />
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 2. TIMELINE ANIMATED HERO CONTENT                            */}
      {/* ============================================================ */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center flex flex-col items-center">
        
        {/* Kicker Pill Badge (Timeline Step 1) */}
        <TimelineAnimation
          animationNum={1}
          timelineRef={timelineRef}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#FA5D00]/30 bg-[#FA5D00]/[0.08] backdrop-blur-md font-mono text-[11px] font-bold uppercase tracking-wider text-[#FF8C42] shadow-[0_0_20px_rgba(250,93,0,0.15)] mb-7"
        >
          <span className="w-2 h-2 rounded-full bg-[#FA5D00] animate-pulse shadow-[0_0_8px_#FA5D00]" />
          <span>THE SKILL EXCHANGE &amp; OPEN-SOURCE GUILD</span>
          <span className="text-zinc-500">·</span>
          <span className="text-white font-bold">EST. 2024</span>
        </TimelineAnimation>

        {/* Master Headline (Timeline Step 2) */}
        <TimelineAnimation
          as="h1"
          animationNum={2}
          timelineRef={timelineRef}
          className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[98px] leading-[1.01] tracking-[-0.03em] text-white font-normal drop-shadow-sm"
        >
          The Skill Exchange <br />
          <span className="italic">
            for curious Mind<span className="text-[#FA5D00] not-italic drop-shadow-[0_0_25px_rgba(250,93,0,0.6)]">.</span>
          </span>
        </TimelineAnimation>

        {/* Supporting Copy (Timeline Step 3) */}
        <TimelineAnimation
          as="p"
          animationNum={3}
          timelineRef={timelineRef}
          className="mt-5 max-w-2xl text-center font-sans text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed font-normal"
        >
          An open collective of young hackers, builders, and makers shipping high-impact software, reverse engineering vaults, and 900+ global hackathons without paywalls.
        </TimelineAnimation>

        {/* Machined Input & CTA Control (Timeline Step 4 - Audited Inset Shadows) */}
        <TimelineAnimation
          animationNum={4}
          timelineRef={timelineRef}
          className="mt-8 sm:mt-10 w-full flex justify-center"
        >
          <form
            onSubmit={handleJoin}
            className="relative inline-flex items-center justify-between w-full max-w-[380px] sm:max-w-[430px] p-1.5 rounded-full bg-[#0d1017] border border-zinc-800/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_10px_30px_-5px_rgba(0,0,0,0.5)] focus-within:border-[#FA5D00]/80 focus-within:ring-2 focus-within:ring-[#FA5D00]/30 transition-all"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={joined ? "You're in! Check your inbox." : "name@builder.dev"}
              disabled={joined}
              className="bg-transparent pl-4 pr-2 py-2 text-xs sm:text-sm font-mono text-zinc-100 placeholder:text-zinc-500 outline-none w-full"
            />
            <button
              type="submit"
              disabled={loading || joined}
              className="flex-none px-6 py-2.5 rounded-full bg-[#FA5D00] hover:bg-[#ff6e1a] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-75 shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(255,255,255,0.25)] flex items-center gap-1"
            >
              <span>{loading ? "..." : joined ? "Joined!" : "Join Guild"}</span>
              {!joined && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        </TimelineAnimation>

        {/* Fast Action Coordinates Strip */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-xs text-zinc-400">
          <Link to="/network" className="hover:text-[#FA5D00] transition-colors flex items-center gap-1 group">
            <span>Founder Launchpad</span>
            <span className="text-[10px] text-zinc-600 group-hover:text-[#FA5D00] transition-colors">↗</span>
          </Link>
          <span className="text-zinc-700">·</span>
          <Link to="/hackathons" className="hover:text-[#FA5D00] transition-colors flex items-center gap-1 group">
            <span>900+ Hackathons</span>
            <span className="text-[10px] text-zinc-600 group-hover:text-[#FA5D00] transition-colors">↗</span>
          </Link>
          <span className="text-zinc-700">·</span>
          <Link to="/jobs" className="hover:text-[#FA5D00] transition-colors flex items-center gap-1 group">
            <span>Guild Roles</span>
            <span className="text-[10px] text-zinc-600 group-hover:text-[#FA5D00] transition-colors">↗</span>
          </Link>
          <span className="text-zinc-700">·</span>
          <a
            href="https://github.com/recoorg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FA5D00] transition-colors flex items-center gap-1 group"
          >
            <span>GitHub</span>
            <span className="text-[10px] text-zinc-600 group-hover:text-[#FA5D00] transition-colors">↗</span>
          </a>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. TIMELINE ANIMATED DASHBOARD SLAB (Timeline Step 5)        */}
      {/* ============================================================ */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 mt-14 sm:mt-18 w-full">
        <TimelineAnimation
          animationNum={5}
          timelineRef={timelineRef}
          className="relative rounded-3xl border border-zinc-800/90 bg-[#0e121a]/85 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_-10px_rgba(250,93,0,0.12)] p-4 sm:p-7 overflow-hidden"
        >
          {/* Subtle Top Gradient Accent Edge */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FA5D00]/70 to-transparent" />

          {/* Top Instrument Console Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800/80 font-mono text-xs">
            
            {/* Live Telemetry Beacon */}
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="text-zinc-200 font-bold tracking-tight">reco.mesh</span>
              <span className="text-zinc-600">/</span>
              <span className="text-[11px] text-zinc-400">LIVE PLATFORM TELEMETRY</span>
            </div>

            {/* Dashboard View Switcher Controls */}
            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab("network")}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === "network"
                    ? "bg-[#FA5D00] text-black shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Launchpad Feed
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("hackathons")}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === "hackathons"
                    ? "bg-[#FA5D00] text-black shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                900+ Hackathons
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("jobs")}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === "jobs"
                    ? "bg-[#FA5D00] text-black shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Guild Roles
              </button>
            </div>

            {/* Live Counter Badges */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                19 Verified Builders
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 font-bold">
                100% Peer Proof
              </span>
            </div>

          </div>

          {/* TAB 1: FOUNDER NETWORK LAUNCHPAD CARDS */}
          {activeTab === "network" && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
              
              {/* Project Card 1: Catalyst */}
              <div className="p-4 rounded-2xl border border-zinc-800/90 bg-[#121622]/70 hover:border-[#FA5D00]/60 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FA5D00]/15 border border-[#FA5D00]/40 text-[#FA5D00] font-mono text-[10px] font-bold uppercase">
                      <Flame className="w-3 h-3" />
                      Boosted · 1 Week Pin
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleUpvote("catalyst", e)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        hasUpvoted["catalyst"]
                          ? "bg-[#FA5D00] text-black"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-[#FA5D00]"
                      }`}
                    >
                      <span>▲</span>
                      <span>{upvotedItems["catalyst"]}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-600/20 text-[#FA5D00] font-bold font-mono text-xs flex items-center justify-center border border-orange-500/30">
                      C
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-white group-hover:text-[#FA5D00] transition-colors">
                        Catalyst
                      </h3>
                      <span className="font-mono text-[10px] text-zinc-500">by Tanish · recolabs.in</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                    Student-focused platform transforming complex learning roadmaps into interactive, peer-reviewed build challenges.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                  <span className="text-zinc-400">Software · Web AI</span>
                  <Link to="/network" className="text-[#FA5D00] hover:underline flex items-center gap-0.5">
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Project Card 2: ByteEngine Vault */}
              <div className="p-4 rounded-2xl border border-zinc-800/90 bg-[#121622]/70 hover:border-[#FA5D00]/60 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px] font-bold uppercase">
                      <Code2 className="w-3 h-3 text-cyan-400" />
                      Systems Lab
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleUpvote("byteengine", e)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        hasUpvoted["byteengine"]
                          ? "bg-[#FA5D00] text-black"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-[#FA5D00]"
                      }`}
                    >
                      <span>▲</span>
                      <span>{upvotedItems["byteengine"]}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center border border-cyan-500/30">
                      B
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-white group-hover:text-[#FA5D00] transition-colors">
                        ByteEngine Reversal
                      </h3>
                      <span className="font-mono text-[10px] text-zinc-500">by Aditya · github.com/recoorg</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                    Low-level game memory disassembly, dynamic hooks, and open executable preservation tools built for curious engineers.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                  <span className="text-zinc-400">Reverse Engineering · C++</span>
                  <Link to="/projects" className="text-[#FA5D00] hover:underline flex items-center gap-0.5">
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Project Card 3: Reco DevKit */}
              <div className="p-4 rounded-2xl border border-zinc-800/90 bg-[#121622]/70 hover:border-[#FA5D00]/60 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-mono text-[10px] font-bold uppercase">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Open Source
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleUpvote("recotools", e)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        hasUpvoted["recotools"]
                          ? "bg-[#FA5D00] text-black"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-[#FA5D00]"
                      }`}
                    >
                      <span>▲</span>
                      <span>{upvotedItems["recotools"]}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold font-mono text-xs flex items-center justify-center border border-emerald-500/30">
                      R
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-white group-hover:text-[#FA5D00] transition-colors">
                        Reco DevKit
                      </h3>
                      <span className="font-mono text-[10px] text-zinc-500">Community Guild Stack</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                    Custom Instrument Serif components, Tailwind v4 design blueprints, and lightweight edge API dispatch templates.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                  <span className="text-zinc-400">Toolkit · React 19</span>
                  <a href="https://github.com/recoorg" target="_blank" rel="noreferrer" className="text-[#FA5D00] hover:underline flex items-center gap-0.5">
                    <span>Repository</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: GLOBAL YOUTH HACKATHONS RADAR */}
          {activeTab === "hackathons" && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
              
              <div className="p-4 rounded-2xl border border-zinc-800/90 bg-[#121622]/70 hover:border-[#FA5D00]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase">
                      Worldwide Virtual
                    </span>
                    <span className="font-mono text-[10px] text-[#FA5D00] font-bold">$10,000 Pool</span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-white">Hack Club Global Sprint</h3>
                  <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                    High school &amp; collegiate 48-hour build sprint across AI, hardware hacks, and creative tooling.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between font-mono text-[10px] text-zinc-400">
                  <span>Coming this Weekend</span>
                  <Link to="/hackathons" className="text-[#FA5D00] font-bold hover:underline flex items-center gap-0.5">
                    <span>Register Free ↗</span>
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-800/90 bg-[#121622]/70 hover:border-[#FA5D00]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-[10px] font-bold uppercase">
                      In-Person · USA
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">1,500 Hackers</span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-white">PennApps XXV</h3>
                  <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                    The original student hackathon at the University of Pennsylvania. Hardware labs and mentor lounges.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between font-mono text-[10px] text-zinc-400">
                  <span>Philadelphia, PA</span>
                  <Link to="/hackathons" className="text-[#FA5D00] font-bold hover:underline flex items-center gap-0.5">
                    <span>View Details ↗</span>
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-800/90 bg-[#121622]/70 hover:border-[#FA5D00]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[10px] font-bold uppercase">
                      Dual Hybrid
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">Verified</span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-white">HackMIT 2026</h3>
                  <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                    MIT's flagship annual undergraduate hackathon focused on breakthrough technical exploration.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between font-mono text-[10px] text-zinc-400">
                  <span>Cambridge, MA</span>
                  <Link to="/hackathons" className="text-[#FA5D00] font-bold hover:underline flex items-center gap-0.5">
                    <span>Explore 900+ ↗</span>
                  </Link>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: GUILD CAREERS & ROLES MATRIX */}
          {activeTab === "jobs" && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
              
              <div className="p-4 rounded-2xl border border-zinc-800/90 bg-[#121622]/70 hover:border-[#FA5D00]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px] font-bold uppercase">
                      Remote · Paid
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-white">Systems &amp; Reversing Intern</h3>
                  <span className="font-mono text-[10px] text-zinc-500">Security Research Guild</span>
                  <p className="font-sans text-xs text-zinc-400 mt-2 leading-relaxed">
                    Tear down binary structures, write custom x86 disassemblers, and audit low-level drivers.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between font-mono text-[10px] text-zinc-400">
                  <span>$3,000 – $4,500/mo</span>
                  <Link to="/jobs" className="text-[#FA5D00] font-bold hover:underline flex items-center gap-0.5">
                    <span>Apply ↗</span>
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-800/90 bg-[#121622]/70 hover:border-[#FA5D00]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px] font-bold uppercase">
                      Full-Time
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-white">Full-Stack Core Engineer</h3>
                  <span className="font-mono text-[10px] text-zinc-500">Early-Stage DevTool Startup</span>
                  <p className="font-sans text-xs text-zinc-400 mt-2 leading-relaxed">
                    Build edge-rendered dashboards, real-time sync pipelines, and high-craft React 19 UI.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between font-mono text-[10px] text-zinc-400">
                  <span>$90k – $120k + Equity</span>
                  <Link to="/jobs" className="text-[#FA5D00] font-bold hover:underline flex items-center gap-0.5">
                    <span>Apply ↗</span>
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-800/90 bg-[#121622]/70 hover:border-[#FA5D00]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px] font-bold uppercase">
                      Contract
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-white">Creative Frontend Architect</h3>
                  <span className="font-mono text-[10px] text-zinc-500">Design Studio Lab</span>
                  <p className="font-sans text-xs text-zinc-400 mt-2 leading-relaxed">
                    Craft WebGL shaders, Canvas2D interactive physics, and high-prestige typography.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between font-mono text-[10px] text-zinc-400">
                  <span>$75 – $110/hr</span>
                  <Link to="/jobs" className="text-[#FA5D00] font-bold hover:underline flex items-center gap-0.5">
                    <span>Apply ↗</span>
                  </Link>
                </div>
              </div>

            </div>
          )}

          {/* Bottom Telemetry Strip & Founders Note */}
          <div className="mt-6 pt-4 border-t border-zinc-800/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px] text-zinc-400">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-zinc-200 font-bold">
                <Terminal className="w-3.5 h-3.5 text-[#FA5D00]" />
                recolabs.in
              </span>
              <span className="text-zinc-700">·</span>
              <span>Founded in Grade 10 by Aditya &amp; Tanish</span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-300 font-semibold">0% Corporate Cut</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 font-medium">All Guild Nodes Operational</span>
            </div>
          </div>

        </TimelineAnimation>
      </div>
    </section>
  )
}

export default HeroSection
