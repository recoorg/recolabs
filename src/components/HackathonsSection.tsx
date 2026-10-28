"use client"

import * as React from "react"
import { ArrowUpRight, Calendar, Users, Trophy } from "lucide-react"

export function HackathonsSection() {
  const events = [
    {
      code: "SPRINT_04",
      title: "The Hardware Awakening",
      category: "EMBEDDED & CIRCUITS",
      dates: "November 14 – 16, 2026",
      location: "Discord Voice + Global Shippers",
      desc: "48-hour hardware and firmware build jam. Design a schematic, breadboard a prototype, and push firmware to recoorg. Microcontrollers, sensors, and actuators.",
      status: "REGISTRATION OPEN",
      statusColor: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
      cta: "Register via Discord",
    },
    {
      code: "JAM_11",
      title: "Autonomous Agent Toolchains",
      category: "SYSTEMS & AI",
      dates: "December 05 – 07, 2026",
      location: "recoorg on GitHub",
      desc: "Build developer agents, CLI scaffolds, and terminal tools that execute with surgical precision. Judged purely on speed, robustness, and open-source utility.",
      status: "UPCOMING",
      statusColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
      cta: "View Prompt Brief",
    },
    {
      code: "BOUNTY_09",
      title: "Liquid Refraction Shaders",
      category: "GRAPHICS & WEBGPU",
      dates: "Active Continuous",
      location: "Global Pull Requests",
      desc: "Open bounty for contributors optimizing WebGL2/WebGPU fragment shaders, caustic light loops, and spring physics. Merged PRs earn guild bounties.",
      status: "ACTIVE BOUNTY",
      statusColor: "text-[#FA5D00] border-[#FA5D00]/30 bg-[#FA5D00]/10",
      cta: "Claim Bounty",
    },
  ]

  return (
    <section id="hackathons" className="relative w-full py-28 px-6 sm:px-8 border-t editorial-hairline bg-[#fcfcfd] dark:bg-[#0c0d11]">
      <div className="mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-16 border-b editorial-hairline">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
              // SPRINTS & HACKATHONS
            </span>
            <h2 className="mt-3 font-serif text-4xl sm:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
              Build fast. Ship with a crew<span className="text-[#FA5D00]">.</span>
            </h2>
          </div>

          <p className="max-w-md font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            We host virtual midnight hackathons, weekend hardware sprints, and continuous open-source bounties where anyone can participate.
          </p>
        </div>

        {/* Hackathon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          {events.map((evt) => (
            <div
              key={evt.code}
              className="flex flex-col justify-between p-8 rounded-3xl border editorial-hairline bg-white dark:bg-zinc-900/60 shadow-sm hover:shadow-md hover:border-[#FA5D00]/50 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[11px] pb-4 border-b editorial-hairline">
                  <span className="text-zinc-400">{evt.code}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wider uppercase ${evt.statusColor}`}>
                    {evt.status}
                  </span>
                </div>

                <div className="mt-5 font-mono text-[11px] tracking-wider text-[#FA5D00] uppercase font-semibold">
                  {evt.category}
                </div>

                <h3 className="mt-2 font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
                  {evt.title}
                </h3>

                <p className="mt-4 font-sans text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {evt.desc}
                </p>

                <div className="mt-6 pt-4 border-t editorial-hairline flex flex-col gap-2 font-mono text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{evt.dates}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t editorial-hairline">
                <a
                  href="https://discord.com/invite/7dk4w37BhP"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-between px-5 py-3 rounded-full bg-zinc-900 hover:bg-[#FA5D00] text-white dark:bg-white dark:text-black dark:hover:bg-[#FA5D00] dark:hover:text-white font-mono text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  <span>{evt.cta}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default HackathonsSection
