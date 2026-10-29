"use client"

import * as React from "react"
import { CrowdCanvas } from "@/components/CrowdCanvas"
import confetti from "canvas-confetti"
import { api } from "@/services/api"

export function HeroSection() {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [joined, setJoined] = React.useState(false)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || loading) return
    setLoading(true)
    try {
      await api.joinNewsletter(email)
      setJoined(true)
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#FA5D00", "#5865F2", "#000000", "#ffffff"],
      })
      setTimeout(() => setJoined(false), 3500)
      setEmail("")
    } catch {
      setJoined(true)
      setTimeout(() => setJoined(false), 3500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="hero-sec"
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-white dark:bg-[#09090b] pt-32 sm:pt-36 lg:pt-40"
    >
      {/* Top Editorial Copy Area */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center flex flex-col items-center">
        
        {/* Headline in Instrument Serif */}
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[96px] leading-[1.02] tracking-[-0.025em] text-zinc-950 dark:text-zinc-50 font-normal">
          The Skill Exchange <br />
          <span>
            for curious Mind<span className="text-[#FA5D00]">.</span>
          </span>
        </h1>

        {/* Minimalist Pill Input Bar */}
        <div className="mt-8 sm:mt-10 w-full flex justify-center">
          <form
            onSubmit={handleJoin}
            className="relative inline-flex items-center justify-between w-full max-w-[340px] sm:max-w-[380px] p-1.5 rounded-full bg-black dark:bg-zinc-900 border border-black dark:border-zinc-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#FA5D00]/50"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={joined ? "You're in! Check your inbox." : "admin@example.com"}
              disabled={joined}
              className="bg-transparent pl-4 pr-2 py-1 text-xs sm:text-sm font-mono text-zinc-300 placeholder:text-zinc-500 outline-none w-full"
            />
            <button
              type="submit"
              disabled={loading || joined}
              className="flex-none px-5 py-1.5 rounded-full bg-white text-black font-mono text-xs font-bold hover:bg-zinc-100 active:scale-95 transition-all cursor-pointer disabled:opacity-75"
            >
              {loading ? "..." : joined ? "Joined!" : "Join!"}
            </button>
          </form>
        </div>
      </div>

      {/* Hero Bottom: Dense Comic Crowd of Peeps */}
      <div className="relative w-full h-[340px] sm:h-[420px] md:h-[480px] lg:h-[520px] mt-2 overflow-hidden">
        <CrowdCanvas className="absolute inset-0 w-full h-full pointer-events-none" />
        {/* Soft bottom edge blend */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white dark:from-[#09090b] to-transparent pointer-events-none" />
      </div>
    </section>
  )
}

export default HeroSection
