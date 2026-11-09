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
  ChevronRight,
  Activity,
  Users,
} from "lucide-react"
import { api } from "@/services/api"
import { TimelineAnimation } from "@/components/ui/timeline-animation"
import GradientASCII from "@/components/ui/GradientASCII"

// Floating Background Icon Pattern (Low Opacity)
const BACKGROUND_ICONS = [
  { Icon: Terminal, x: "8%", y: "18%", size: 28 },
  { Icon: Code2, x: "90%", y: "22%", size: 30 },
  { Icon: ShieldCheck, x: "12%", y: "65%", size: 26 },
  { Icon: Zap, x: "88%", y: "70%", size: 26 },
  { Icon: Rocket, x: "50%", y: "8%", size: 22 },
  { Icon: Globe, x: "82%", y: "45%", size: 26 },
]

export function HeroSection() {
  const timelineRef = React.useRef<HTMLDivElement>(null)
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

  return (
    <section
      ref={timelineRef}
      className="relative min-h-[90vh] w-full pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden bg-[#07090e] text-white flex flex-col justify-center items-center select-none"
    >
      {/* ============================================================ */}
      {/* 1. GRADIENT ASCII CANVAS ENGINE (React Bits GradientASCII)   */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-auto z-0 overflow-hidden">
        <GradientASCII
          colors={["#FA5D00", "#FF8C42", "#4a1c02", "#07090e"]}
          shape="horizon"
          characters=" RECOLABS0123456789<>/{}[];*+"
          cellSize={13}
          density={0.72}
          glyphOpacity={0.65}
          glow={1.3}
          depthOfField={0.35}
          speed={0.4}
          gradientOpacity={0.85}
          grain={0.06}
          mouseInteraction={true}
          clickEffect="wave"
          className="w-full h-full opacity-70"
        />

        {/* Soft bottom vignette & depth mask for seamless integration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07090e]/30 to-[#07090e] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_20%,#07090e_90%)] pointer-events-none" />
      </div>

      {/* Low-Opacity Subtle Atmospheric Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
        {BACKGROUND_ICONS.map(({ Icon, x, y, size }, index) => (
          <div
            key={index}
            style={{ left: x, top: y }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-[#FA5D00]/[0.05]"
          >
            <Icon size={size} strokeWidth={1.5} />
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 2. TIMELINE ANIMATED HERO CORE CONTENT                       */}
      {/* ============================================================ */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center flex flex-col items-center">
        
        {/* Kicker Pill Badge (Timeline Step 1) */}
        <TimelineAnimation
          animationNum={1}
          timelineRef={timelineRef}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#FA5D00]/30 bg-[#0c1018]/80 backdrop-blur-md font-mono text-[11px] font-bold uppercase tracking-wider text-[#FF8C42] shadow-[0_0_20px_rgba(250,93,0,0.2)] mb-7"
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
          className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[96px] leading-[1.01] tracking-[-0.03em] text-white font-normal drop-shadow-md"
        >
          The Skill Exchange <br />
          <span className="italic">
            for curious Mind<span className="text-[#FA5D00] not-italic drop-shadow-[0_0_30px_rgba(250,93,0,0.7)]">.</span>
          </span>
        </TimelineAnimation>

        {/* Supporting Copy (Timeline Step 3) */}
        <TimelineAnimation
          as="p"
          animationNum={3}
          timelineRef={timelineRef}
          className="mt-6 max-w-2xl text-center font-sans text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed font-normal drop-shadow-sm"
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
            className="relative inline-flex items-center justify-between w-full max-w-[390px] sm:max-w-[440px] p-1.5 rounded-full bg-[#0d1017]/90 backdrop-blur-xl border border-zinc-800/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_10px_35px_-5px_rgba(0,0,0,0.7)] focus-within:border-[#FA5D00]/80 focus-within:ring-2 focus-within:ring-[#FA5D00]/30 transition-all"
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
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-xs text-zinc-400">
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

        {/* Minimal Machined Telemetry Status Bar */}
        <TimelineAnimation
          animationNum={5}
          timelineRef={timelineRef}
          className="mt-12 inline-flex flex-wrap items-center justify-center gap-4 px-5 py-2 rounded-2xl bg-[#0c1018]/80 border border-zinc-800/80 backdrop-blur-xl shadow-lg font-mono text-xs text-zinc-400"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-zinc-200 font-bold">900+ Hackathons Synced</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Users className="w-3.5 h-3.5 text-[#FA5D00]" />
            <span>500+ Guild Builders</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>0% Platform Take Rate</span>
          </div>
        </TimelineAnimation>

      </div>
    </section>
  )
}

export default HeroSection
