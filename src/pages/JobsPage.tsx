"use client"

import * as React from "react"
import { ArrowUpRight, CheckCircle2, Sparkles, MessageSquare, Briefcase, Filter } from "lucide-react"

export function JobsPage() {
  const [filter, setFilter] = React.useState("ALL")
  const [selectedRole, setSelectedRole] = React.useState<any | null>(null)

  const roles = [
    {
      id: "ENG-01",
      category: "ENGINEERING",
      title: "Core Infrastructure & Runtime Engineer",
      dept: "SYSTEMS",
      type: "FELLOWSHIP / CORE",
      location: "REMOTE / ASYNC",
      stipend: "Open Bounty + Guild Allocation",
      summary: "Architect the next release of the recolabs core runtime and package automation suite.",
      description: "You will be working on the engine that powers our open-source tools. We need someone who understands TypeScript, modular build systems, and CLI developer experience. You'll ensure our packages install cleanly in one command.",
      requirements: [
        "Strong familiarity with modern TypeScript, Node.js, and Vite",
        "Experience building or contributing to open-source libraries",
        "Passion for minimalist developer tooling and fast load times",
      ],
    },
    {
      id: "HW-02",
      category: "HARDWARE",
      title: "Embedded Systems & Firmware Prototyper",
      dept: "HARDWARE LAB",
      type: "LAB RESIDENCY",
      location: "REMOTE",
      stipend: "Hardware Lab Grant + PCB Sponsoring",
      summary: "Design custom microcontroller schematics and write RTOS firmware routines.",
      description: "Join Aditya in designing open-source hardware modules that solve daily automation tasks. From KiCAD 4-layer boards to C++20 firmware for ESP32 and ARM Cortex microcontrollers, you will push the boundaries of physical computing.",
      requirements: [
        "Hands-on experience with KiCAD or EasyEDA",
        "Writing bare-metal or RTOS C/C++ firmware",
        "Ability to test circuits, debug with logic analyzers, and document BOMs",
      ],
    },
    {
      id: "TUT-03",
      category: "TUTORIALS",
      title: "Beginner Path & Tutorial Architect",
      dept: "EDUCATION",
      type: "FELLOWSHIP",
      location: "REMOTE",
      stipend: "Author Bounty per Milestone",
      summary: "Write zero-fluff, hands-on tutorials that help absolute beginners find their path.",
      description: "In line with Aditya's founding vision, Reco Labs exists to give beginners a clear roadmap without getting trapped in tutorial purgatory. You will write step-by-step guides for building real projects from scratch.",
      requirements: [
        "Clear, engaging, and jargon-free technical writing in English",
        "Empathy for someone opening a terminal for the very first time",
        "Ability to produce code samples that work on the first try",
      ],
    },
    {
      id: "DES-04",
      category: "DESIGN",
      title: "Creative Technologist & UI Engineer",
      dept: "CREATIVE GUILD",
      type: "PART-TIME / BOUNTY",
      location: "REMOTE",
      stipend: "Per-Project Bounty",
      summary: "Build interactive WebGL shaders, micro-interactions, and editorial web experiences.",
      description: "We take craft seriously. You will collaborate on custom web components, 21st.dev style interactions, and high-performance graphic experiments using Tailwind, React, and Canvas.",
      requirements: [
        "High aesthetic sensitivity: typography, motion curves, and layout",
        "Proficiency in React, Tailwind CSS, and WebGL/Canvas",
        "Portfolio of interactive web experiments",
      ],
    },
    {
      id: "COM-05",
      category: "COMMUNITY",
      title: "Community Guild Lead & Event Coordinator",
      dept: "DISCORD & GUILDS",
      type: "COMMUNITY FELLOW",
      location: "REMOTE",
      stipend: "Guild Honorarium",
      summary: "Organize weekend build calls, curate GitHub showcases, and welcome new hackers.",
      description: "The heart of Reco Labs is our Discord. You will host voice room hack sessions, connect beginners with mentors, and coordinate quarterly sprint judging.",
      requirements: [
        "Active presence in developer/hacker communities",
        "High energy, kindness, and welcoming attitude toward new members",
        "Familiarity with GitHub pull request workflows and Discord moderation",
      ],
    },
  ]

  const filteredRoles = filter === "ALL" ? roles : roles.filter((r) => r.category === filter)

  return (
    <div className="w-full pt-32 sm:pt-36 pb-24 px-6 sm:px-8 bg-white dark:bg-[#09090b]">
      <div className="mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto pb-12 border-b editorial-hairline">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
            JOIN THE COLLECTIVE
          </span>
          <h1 className="mt-4 font-serif text-5xl sm:text-7xl lg:text-8xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
            Guild Roles & Openings<span className="text-[#FA5D00]">.</span>
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            No 5-round interviews or pedigree checks. We review your GitHub, your projects, and your curiosity.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
          {["ALL", "ENGINEERING", "HARDWARE", "TUTORIALS", "DESIGN", "COMMUNITY"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full border transition-all cursor-pointer ${
                filter === cat
                  ? "bg-[#FA5D00] border-black text-black font-bold shadow-sm"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-black"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Roles List */}
        <div className="mt-12 divide-y editorial-hairline">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className="py-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6 group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors px-4 -mx-4 rounded-2xl"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-400">
                  <span className="text-[#FA5D00] font-bold">{role.id}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span className="uppercase text-zinc-700 dark:text-zinc-300 font-semibold">{role.dept}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span className="uppercase text-zinc-500">{role.type}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{role.stipend}</span>
                </div>

                <h3 className="mt-3 font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal group-hover:text-[#FA5D00] transition-colors">
                  {role.title}
                </h3>

                <p className="mt-3 font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed">
                  {role.description}
                </p>

                {/* Requirements checklist */}
                <div className="mt-5 space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">WHAT WE VALUE:</span>
                  <ul className="space-y-1.5">
                    {role.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Column */}
              <div className="flex-none flex flex-col sm:items-end justify-between gap-4 pt-2">
                <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                  {role.location}
                </span>

                <a
                  href={`https://discord.com/invite/7dk4w37BhP`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white hover:bg-[#FA5D00] dark:bg-white dark:text-black dark:hover:bg-[#FA5D00] dark:hover:text-white font-mono text-xs font-bold tracking-wider uppercase transition-colors shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Apply on Discord</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Culture / FAQ Callout */}
        <div className="mt-24 p-8 sm:p-12 rounded-3xl border-2 border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-bold">
            // HOW APPLICATIONS WORK
          </span>
          <h3 className="mt-3 font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal">
            No resume filters. Real projects only.
          </h3>
          <p className="mt-3 font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
            To apply, hop into our Discord server and post in the <code>#guild-roles</code> channel. Share your GitHub link, tell us what you&apos;re building, or drop a demo. Aditya and the core team review every post directly.
          </p>
        </div>

      </div>
    </div>
  )
}

export default JobsPage
