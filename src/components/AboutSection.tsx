"use client"

import * as React from "react"
import { ArrowUpRight } from "lucide-react"

export function AboutSection() {
  const points = [
    {
      num: "01",
      title: "The Skill Exchange",
      desc: "A decentralized peer-learning guild. Need to learn embedded C++, custom PCB routing, shaders, or reverse engineering? Trade your knowledge with other curious minds in real time.",
      meta: "PEER_TO_PEER",
    },
    {
      num: "02",
      title: "No Gatekeepers",
      desc: "Inspired by the raw, energetic spirit of Hack Club. No resumes, no waiting lists, no permission needed. You don't need a degree or a corporate sponsor—just a willingness to build.",
      meta: "PERMISSIONLESS",
    },
    {
      num: "03",
      title: "100% Open Artifacts",
      desc: "Everything engineered under Reco Labs is published openly on GitHub at recoorg. From prototype firmware to web runtime engines, we build in public for the global collective.",
      meta: "GITHUB_PUBLIC",
    },
    {
      num: "04",
      title: "Midnight Sprints",
      desc: "When curiosity strikes at 2 AM, the Discord voice rooms are humming with screen shares, compiler logs, and lively debugging sessions. Ship fast, break things, iterate.",
      meta: "DISCORD_VOICE",
    },
  ]

  return (
    <section id="about" className="relative w-full py-28 px-6 sm:px-8 border-t editorial-hairline bg-white dark:bg-[#09090b]">
      <div className="mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-16 border-b editorial-hairline">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
              // ABOUT THE COLLECTIVE
            </span>
            <h2 className="mt-3 font-serif text-4xl sm:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
              Curiosity is the only prerequisite<span className="text-[#FA5D00]">.</span>
            </h2>
          </div>

          <p className="max-w-md font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Reco Labs is an open laboratory and skill exchange for independent builders, teen hackers, and curious engineers who care about craft.
          </p>
        </div>

        {/* 4 Editorial Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-16">
          {points.map((p) => (
            <div key={p.num} className="flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-zinc-400 pb-4 border-b editorial-hairline">
                  <span>{p.num}</span>
                  <span className="text-[10px] tracking-wider text-zinc-500 uppercase">{p.meta}</span>
                </div>
                
                <h3 className="mt-6 font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-100 font-normal">
                  {p.title}
                </h3>
                
                <p className="mt-3 font-sans text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {p.desc}
                </p>
              </div>

              <div className="pt-8">
                <a
                  href="https://discord.com/invite/7dk4w37BhP"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-[#FA5D00] hover:underline"
                >
                  <span>Learn more</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Minimalist Stats Strip in Geist Mono */}
        <div className="mt-24 pt-12 border-t editorial-hairline grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-serif text-4xl sm:text-5xl text-zinc-950 dark:text-zinc-50">100+</div>
            <div className="mt-1 font-mono text-xs text-zinc-500 uppercase tracking-wider">HACKERS IN NETWORK</div>
          </div>
          <div>
            <div className="font-serif text-4xl sm:text-5xl text-zinc-950 dark:text-zinc-50">100%</div>
            <div className="mt-1 font-mono text-xs text-zinc-500 uppercase tracking-wider">OPEN ARTIFACTS</div>
          </div>
          <div>
            <div className="font-serif text-4xl sm:text-5xl text-zinc-950 dark:text-zinc-50">24/7</div>
            <div className="mt-1 font-mono text-xs text-zinc-500 uppercase tracking-wider">DISCORD DISPATCH</div>
          </div>
          <div>
            <div className="font-serif text-4xl sm:text-5xl text-[#FA5D00]">$0</div>
            <div className="mt-1 font-mono text-xs text-zinc-500 uppercase tracking-wider">COST TO PARTICIPATE</div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default AboutSection
