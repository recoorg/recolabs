"use client"

import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "motion/react"
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
  Activity,
  Wifi,
  ExternalLink,
  Users,
  Compass,
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

interface TelemetryLog {
  id: string
  time: string
  tag: "OK" | "SYNC" | "UPVOTE" | "NODE"
  message: string
}

const INITIAL_LOGS: TelemetryLog[] = [
  { id: "1", time: "16:52:10", tag: "OK", message: "GET /api/hackathons?feed=global 200 (14ms)" },
  { id: "2", time: "16:52:18", tag: "SYNC", message: "@tanish published Catalyst v1.2" },
  { id: "3", time: "16:52:26", tag: "UPVOTE", message: "@aditya upvoted ByteEngine Reversal" },
  { id: "4", time: "16:52:34", tag: "NODE", message: "Mumbai & Singapore edge clusters operational" },
  { id: "5", time: "16:52:41", tag: "SYNC", message: "Hack Club API synced 900+ hackathons" },
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
  const [logs, setLogs] = React.useState<TelemetryLog[]>(INITIAL_LOGS)

  // Simulated live event logger stream
  React.useEffect(() => {
    const pool: TelemetryLog[] = [
      { id: "p1", time: "LIVE", tag: "SYNC", message: "Discord builder guild active: 500+ members" },
      { id: "p2", time: "LIVE", tag: "OK", message: "Zero take rate policy verified (0.00%)" },
      { id: "p3", time: "LIVE", tag: "NODE", message: "Edge ping: Tokyo 28ms · Frankfurt 42ms" },
      { id: "p4", time: "LIVE", tag: "UPVOTE", message: "New peer star on Reco DevKit repository" },
      { id: "p5", time: "LIVE", tag: "OK", message: "900+ youth hackathons cache revalidated" },
    ]
    let counter = 0
    const interval = setInterval(() => {
      const now = new Date()
      const timeStr = now.toTimeString().split(" ")[0]
      const nextItem = { ...pool[counter % pool.length], id: String(Date.now()), time: timeStr }
      counter++
      setLogs((prev) => [nextItem, ...prev.slice(0, 4)])
    }, 4500)
    return () => clearInterval(interval)
  }, [])

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
      colors: ["#FA5D00", "#FF8C42", "#ffffff"],
    })
  }

  return (
    <section
      ref={timelineRef}
      className="relative w-full pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-[#07090e] text-white"
    >
      {/* ============================================================ */}
      {/* 1. AUDITED CANONICAL GAUSSIAN BLUR TUBES (Lines 256-270)     */}
      {/* ============================================================ */}
      <svg
        className="absolute top-0 left-0 w-full h-[650px] pointer-events-none z-0"
        viewBox="0 0 1440 650"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.6">
          <g filter="url(#filter0_f_hero)">
            <path
              d="M-50.9961 14.886C104.504 14.886 230.504 140.886 230.504 296.386C230.504 451.886 104.504 577.886 -50.9961 577.886C-206.496 577.886 -332.496 451.886 -332.496 296.386C-332.496 140.886 -206.496 14.886 -50.9961 14.886Z"
              fill="url(#paint0_linear_hero)"
            />
          </g>
          <g filter="url(#filter1_f_hero)">
            <path
              d="M8.04686 -87.1133C143.547 -87.1133 253.547 22.8867 253.547 158.387C253.547 293.887 143.547 403.887 8.04686 403.887C-127.453 403.887 -237.453 293.887 -237.453 158.387C-237.453 22.8867 -127.453 -87.1133 8.04686 -87.1133Z"
              fill="url(#paint1_linear_hero)"
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_f_hero"
            x="-402.496"
            y="-55.114"
            width="703"
            height="703"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="35" result="effect1_foregroundBlur_hero" />
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
      {/* 3. RE-ARCHITECTED COCKPIT TELEMETRY ENGINE (Timeline Step 5)  */}
      {/* Audited from ui-layouts terminal-ui & feature-bento          */}
      {/* ============================================================ */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 mt-14 sm:mt-18 w-full">
        <TimelineAnimation
          animationNum={5}
          timelineRef={timelineRef}
          className="relative rounded-[28px] border border-white/10 bg-[#090c13]/95 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] p-1.5 sm:p-2 overflow-hidden"
        >
          {/* Top Edge Specular Glow */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FA5D00]/80 to-transparent" />

          {/* Inner Machined Chassis */}
          <div className="rounded-[22px] bg-[#0c1018] border border-zinc-800/80 p-4 sm:p-6 overflow-hidden">
            
            {/* ── Console Header (macOS window chrome + breadcrumbs + tabs) ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80 font-mono text-xs">
              
              {/* Left: macOS dots & system identifier */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_6px_rgba(255,95,86,0.4)]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_6px_rgba(255,189,46,0.4)]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_6px_rgba(39,201,63,0.4)]" />
                </div>
                <div className="h-4 w-px bg-zinc-800 mx-1" />
                <div className="flex items-center gap-2 text-zinc-300">
                  <Terminal className="w-3.5 h-3.5 text-[#FA5D00]" />
                  <span className="font-bold text-white tracking-tight">reco.mesh</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-zinc-400 text-[11px]">telemetry.live</span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    SYNCED · 14ms
                  </span>
                </div>
              </div>

              {/* Right: Segmented Navigation Switcher */}
              <div className="flex items-center gap-2 self-start lg:self-auto">
                <div className="inline-flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setActiveTab("network")}
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "network"
                        ? "text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {activeTab === "network" && (
                      <motion.div
                        layoutId="activeTabBadge"
                        className="absolute inset-0 bg-[#FA5D00] rounded-lg shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Flame className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">Launchpad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("hackathons")}
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "hackathons"
                        ? "text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {activeTab === "hackathons" && (
                      <motion.div
                        layoutId="activeTabBadge"
                        className="absolute inset-0 bg-[#FA5D00] rounded-lg shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Globe className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">900+ Hackathons</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("jobs")}
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "jobs"
                        ? "text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {activeTab === "jobs" && (
                      <motion.div
                        layoutId="activeTabBadge"
                        className="absolute inset-0 bg-[#FA5D00] rounded-lg shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Users className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">Guild Roles</span>
                  </button>
                </div>
              </div>

            </div>

            {/* ── Main Cockpit Split Grid (Interactive Feed + Terminal Engine) ── */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* LEFT COLUMN: Interactive Feed Deck (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                <AnimatePresence mode="wait">
                  {activeTab === "network" && (
                    <motion.div
                      key="tab-network"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      {/* Featured Project 1: Catalyst */}
                      <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-[#FA5D00]/50 transition-all duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FA5D00]/[0.06] rounded-full blur-2xl group-hover:bg-[#FA5D00]/[0.12] transition-all" />
                        <div className="flex items-start justify-between gap-3 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-[#FA5D00] font-mono font-bold flex items-center justify-center border border-orange-500/30 text-sm">
                              C
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-serif text-lg font-bold text-white group-hover:text-[#FA5D00] transition-colors">
                                  Catalyst
                                </h4>
                                <span className="px-2 py-0.5 rounded-full bg-[#FA5D00]/15 text-[#FF8C42] border border-[#FA5D00]/30 font-mono text-[9px] font-bold uppercase tracking-wider">
                                  #1 Spotlight
                                </span>
                              </div>
                              <p className="font-mono text-xs text-zinc-400">by Tanish · recolabs.in</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleUpvote("catalyst", e)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                              hasUpvoted["catalyst"]
                                ? "bg-[#FA5D00] text-black shadow-sm"
                                : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-[#FA5D00]"
                            }`}
                          >
                            <span>▲</span>
                            <span>{upvotedItems["catalyst"]}</span>
                          </button>
                        </div>

                        <p className="mt-3 font-sans text-xs text-zinc-300 leading-relaxed relative z-10">
                          Student-focused platform transforming complex engineering roadmaps into interactive, peer-reviewed build challenges.
                        </p>

                        <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px] text-zinc-400 relative z-10">
                          <span className="text-zinc-500">Software · Web AI</span>
                          <Link to="/network" className="text-[#FA5D00] hover:text-[#ff8c42] flex items-center gap-1 font-bold">
                            <span>Inspect Project</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Featured Project 2: ByteEngine Reversal */}
                      <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-cyan-500/50 transition-all duration-300 relative group overflow-hidden">
                        <div className="flex items-start justify-between gap-3 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 font-mono font-bold flex items-center justify-center border border-cyan-500/30 text-sm">
                              B
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-serif text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                                  ByteEngine Reversal
                                </h4>
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono text-[9px] font-bold uppercase tracking-wider">
                                  Systems Vault
                                </span>
                              </div>
                              <p className="font-mono text-xs text-zinc-400">by Aditya · github.com/recoorg</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleUpvote("byteengine", e)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                              hasUpvoted["byteengine"]
                                ? "bg-[#FA5D00] text-black shadow-sm"
                                : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-cyan-400"
                            }`}
                          >
                            <span>▲</span>
                            <span>{upvotedItems["byteengine"]}</span>
                          </button>
                        </div>

                        <p className="mt-3 font-sans text-xs text-zinc-300 leading-relaxed relative z-10">
                          Low-level game memory disassembly, dynamic hooks, and open executable preservation tools built for curious engineers.
                        </p>

                        <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px] text-zinc-400 relative z-10">
                          <span className="text-zinc-500">Reverse Engineering · C++</span>
                          <Link to="/projects" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold">
                            <span>Open Repo</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "hackathons" && (
                    <motion.div
                      key="tab-hackathons"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      {/* Hackathon Item 1 */}
                      <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-emerald-500/50 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase">
                            Worldwide Virtual · $10,000 Pool
                          </span>
                          <span className="font-mono text-xs text-[#FA5D00] font-bold">4/5 Squad Filled</span>
                        </div>
                        <h4 className="font-serif text-lg font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors">
                          Hack Club Global Sprint
                        </h4>
                        <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                          48-hour build sprint across AI agents, open hardware, and dev tooling. Indexed live via Hack Club API.
                        </p>
                        <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px]">
                          <span className="text-zinc-500">Starts This Weekend</span>
                          <Link to="/hackathons" className="text-emerald-400 hover:underline font-bold flex items-center gap-1">
                            <span>Join Squad</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Hackathon Item 2 */}
                      <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-blue-500/50 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-[10px] font-bold uppercase">
                            In-Person · Philadelphia, PA
                          </span>
                          <span className="font-mono text-xs text-zinc-400">1,500 Hackers</span>
                        </div>
                        <h4 className="font-serif text-lg font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">
                          PennApps XXV
                        </h4>
                        <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                          The original collegiate student hackathon at UPenn. Hardware labs, mentor lounges, and sponsor tracks.
                        </p>
                        <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px]">
                          <span className="text-zinc-500">Travel Grants Available</span>
                          <Link to="/hackathons" className="text-blue-400 hover:underline font-bold flex items-center gap-1">
                            <span>View Directory</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "jobs" && (
                    <motion.div
                      key="tab-jobs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      {/* Guild Role 1 */}
                      <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-[#FA5D00]/50 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#FF8C42] font-mono text-[10px] font-bold uppercase">
                            Remote · $3k – $4.5k/mo
                          </span>
                          <span className="font-mono text-xs text-emerald-400 font-bold">100% Peer Verified</span>
                        </div>
                        <h4 className="font-serif text-lg font-bold text-white mt-2 group-hover:text-[#FA5D00] transition-colors">
                          Systems &amp; Reversing Intern
                        </h4>
                        <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                          Tear down binary structures, write custom x86 disassemblers, and audit low-level drivers with senior research peers.
                        </p>
                        <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px]">
                          <span className="text-zinc-500">Security Research Guild</span>
                          <Link to="/jobs" className="text-[#FA5D00] hover:underline font-bold flex items-center gap-1">
                            <span>Apply Directly</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Guild Role 2 */}
                      <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-purple-500/50 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[10px] font-bold uppercase">
                            Full-Time · $90k – $120k + Equity
                          </span>
                          <span className="font-mono text-xs text-emerald-400 font-bold">Early Stage</span>
                        </div>
                        <h4 className="font-serif text-lg font-bold text-white mt-2 group-hover:text-purple-400 transition-colors">
                          Full-Stack Core Engineer
                        </h4>
                        <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                          Build edge-rendered dashboards, real-time sync pipelines, and high-craft React 19 UI for high-velocity developer tools.
                        </p>
                        <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px]">
                          <span className="text-zinc-500">DevTool Startup</span>
                          <Link to="/jobs" className="text-purple-400 hover:underline font-bold flex items-center gap-1">
                            <span>Apply Directly</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Directory CTA Strip */}
                <div className="pt-2 flex items-center justify-between font-mono text-xs text-zinc-400">
                  <span className="text-[11px] text-zinc-500">Curated &amp; Indexed Globally</span>
                  <Link to="/network" className="text-[#FA5D00] hover:text-[#ff8c42] flex items-center gap-1 font-bold">
                    <span>Explore Full Ecosystem</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* RIGHT COLUMN: Terminal Stream & Telemetry Engine (5 Cols) */}
              <div className="lg:col-span-5 bg-black/60 rounded-2xl border border-zinc-800/90 p-4 sm:p-5 flex flex-col justify-between space-y-4 font-mono">
                
                {/* Metric Summary Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-[11px]">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Activity className="w-3.5 h-3.5 text-[#FA5D00] animate-pulse" />
                      <span className="text-white font-bold uppercase tracking-wider">LIVE TELEMETRY STREAM</span>
                    </div>
                    <span className="text-emerald-400 font-bold">99.98% UP</span>
                  </div>

                  {/* Micro Metric Matrix */}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[10px] text-zinc-500 uppercase">INDEXED</div>
                      <div className="font-bold text-sm text-white mt-0.5">900+</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[10px] text-zinc-500 uppercase">BUILDERS</div>
                      <div className="font-bold text-sm text-white mt-0.5">500+</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[10px] text-zinc-500 uppercase">TAKE RATE</div>
                      <div className="font-bold text-sm text-[#FA5D00] mt-0.5">0%</div>
                    </div>
                  </div>
                </div>

                {/* Animated Frequency Bar Throughput Visualizer */}
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-2">
                    <span>L4 EDGE MESH THROUGHPUT</span>
                    <span className="text-emerald-400">342 req/s</span>
                  </div>
                  <div className="flex gap-1 items-end h-8">
                    {[20, 35, 50, 45, 80, 65, 90, 75, 100, 85, 70, 95, 110, 80, 60].map((h, i) => (
                      <div
                        key={i}
                        className="w-full bg-gradient-to-t from-[#FA5D00]/40 to-[#FA5D00] rounded-t-xs"
                        style={{ height: `${(h / 110) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Live Event Terminal Feed (Audited from ui-layouts terminal-ui) */}
                <div className="space-y-1.5 text-[11px] overflow-hidden">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                    <span>REAL-TIME AUDIT LOG</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 text-zinc-300 font-mono text-[10.5px] leading-tight"
                      >
                        <span className="text-zinc-600 flex-none">{log.time}</span>
                        <span
                          className={`px-1 rounded text-[9px] font-bold flex-none ${
                            log.tag === "OK"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : log.tag === "SYNC"
                              ? "bg-blue-500/20 text-blue-400"
                              : log.tag === "UPVOTE"
                              ? "bg-orange-500/20 text-[#FA5D00]"
                              : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          {log.tag}
                        </span>
                        <span className="truncate text-zinc-400">{log.message}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1 text-[#FA5D00] text-[11px]">
                      <span>&gt;</span>
                      <span className="w-2 h-3.5 bg-[#FA5D00] animate-pulse inline-block" />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* ── Console Footer (Founders origins & verification) ── */}
            <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px] text-zinc-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#FA5D00]" />
                  recolabs.in
                </span>
                <span className="text-zinc-700">·</span>
                <span>Founded in Grade 10 by Aditya &amp; Tanish</span>
                <span className="text-zinc-700">·</span>
                <span className="text-emerald-400 font-bold">0% Corporate Cut</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Guild Nodes Operational</span>
              </div>
            </div>

          </div>

        </TimelineAnimation>
      </div>
    </section>
  )
}

export default HeroSection
