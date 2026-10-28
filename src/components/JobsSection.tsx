"use client"

import * as React from "react"
import { ArrowUpRight } from "lucide-react"

export function JobsSection() {
  const roles = [
    {
      id: "ROLE_01",
      title: "Core Infrastructure Architect",
      department: "SYSTEMS & RUNTIME",
      type: "FELLOWSHIP / CONTROLLER",
      commitment: "FLEXIBLE ASYNC",
      desc: "Architect the core runtime, state hydration engine, and package scaffolding for the next generation of recoorg repositories.",
    },
    {
      id: "ROLE_02",
      title: "Embedded Systems & Firmware Engineer",
      department: "HARDWARE GUILD",
      type: "LAB RESIDENCY",
      commitment: "SPRINT-BASED",
      desc: "Work on low-power ARM Cortex and ESP32 microcontrollers, custom PCB routing in KiCAD, and sensor telemetry over USB/I2C.",
    },
    {
      id: "ROLE_03",
      title: "Creative Technologist (GLSL / Shaders)",
      department: "GRAPHICS LAB",
      type: "BOUNTY FELLOW",
      commitment: "EXPERIMENT-DRIVEN",
      desc: "Design and optimize WebGL2/WebGPU fragment shaders, spring physics, and interactive procedural visual instruments.",
    },
    {
      id: "ROLE_04",
      title: "Community Guild Catalyst",
      department: "DISCORD & EVENTS",
      type: "CORE LEADER",
      commitment: "COMMUNITY-FIRST",
      desc: "Run weekend build-calls, curate showcase galleries, organize peer-pairing sessions, and welcome new curious minds to the collective.",
    },
  ]

  return (
    <section id="jobs" className="relative w-full py-28 px-6 sm:px-8 border-t editorial-hairline bg-white dark:bg-[#09090b]">
      <div className="mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-16 border-b editorial-hairline">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
              // GUILD ROLES & FELLOWSHIPS
            </span>
            <h2 className="mt-3 font-serif text-4xl sm:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
              Opportunities for curious minds<span className="text-[#FA5D00]">.</span>
            </h2>
          </div>

          <p className="max-w-md font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            We don&apos;t do 5-stage corporate interviews. Show us what you&apos;ve built, what you&apos;re curious about, and let&apos;s build together.
          </p>
        </div>

        {/* Editorial Table Rows */}
        <div className="pt-6 divide-y editorial-hairline">
          {roles.map((r) => (
            <div
              key={r.id}
              className="py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors px-4 -mx-4 rounded-2xl"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
                  <span className="text-[#FA5D00] font-bold">{r.id}</span>
                  <span>//</span>
                  <span className="uppercase tracking-wider">{r.department}</span>
                  <span>//</span>
                  <span className="uppercase text-zinc-500">{r.type}</span>
                </div>

                <h3 className="mt-2 font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal group-hover:text-[#FA5D00] transition-colors">
                  {r.title}
                </h3>

                <p className="mt-2 font-sans text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed">
                  {r.desc}
                </p>
              </div>

              <div className="flex-none flex items-center gap-4">
                <span className="hidden sm:inline-block font-mono text-xs text-zinc-500 uppercase tracking-wider">
                  {r.commitment}
                </span>

                <a
                  href="https://discord.com/invite/7dk4w37BhP"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-zinc-900 dark:border-zinc-100 bg-transparent hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-black font-mono text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  <span>Apply on Discord</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default JobsSection
