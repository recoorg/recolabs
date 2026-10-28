"use client"

import * as React from "react"
import { Cpu, Globe, Zap, Users, Code, Radio, ShieldCheck, Heart } from "lucide-react"

export function ManifestoSection() {
  const pillars = [
    {
      icon: Zap,
      color: "bg-amber-400 text-black",
      border: "border-black",
      rotate: "-rotate-1",
      title: "Ship Code Every Week",
      desc: "No multi-month committees or endless slide decks. Have an idea at midnight? Spin up a repo on recoorg, hack together a prototype, and push it to production.",
      tag: "SPEED & CRAFT",
    },
    {
      icon: Globe,
      color: "bg-[#ec3750] text-white",
      border: "border-black",
      rotate: "rotate-1",
      title: "100% Open Source",
      desc: "Every line of software, KiCAD PCB schematic, firmware routine, and toolchain lives public on GitHub. We believe true innovation happens out in the sunlight.",
      tag: "NO WALLED GARDENS",
    },
    {
      icon: Cpu,
      color: "bg-cyan-400 text-black",
      border: "border-black",
      rotate: "-rotate-2",
      title: "Hardware to the Metal",
      desc: "We don't stop at the browser. From custom microcontrollers, embedded RTOS, and sensors to mechanical enclosures and WebGL shaders, we build the full stack.",
      tag: "FULL STACK HACKING",
    },
    {
      icon: Users,
      color: "bg-emerald-400 text-black",
      border: "border-black",
      rotate: "rotate-2",
      title: "By Hackers, For Hackers",
      desc: "A tight-knit crew of passionate creators. Hop into our Discord voice channels, screen-share your latest bug, and build lifelong friendships while creating.",
      tag: "ALWAYS FREE",
    },
  ]

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 bg-zinc-100/70 border-y-2 border-black/10">
      <div className="mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-pink-300 px-4 py-1 text-xs font-mono font-bold uppercase tracking-wider text-black shadow-sm rotate-1 mb-4">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#ec3750]" />
            <span>THE RECO LABS MANIFESTO</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-950 font-sans">
            How we think. What we build.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-600 font-medium">
            Like Hack Club, we reject the notion that you need permission, pedigree, or gatekeepers to engineer something extraordinary.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className={`relative p-8 rounded-3xl border-3 ${item.border} bg-white hacker-card-shadow transition-transform hover:-translate-y-1.5 duration-200 ${item.rotate}`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center ${item.color} shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-zinc-100 border border-black/10 text-zinc-700">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-zinc-950 font-sans mb-3">
                  {item.title}
                </h3>

                <p className="text-zinc-600 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* Discord community banner callout */}
        <div className="mt-16 rounded-3xl border-3 border-black bg-gradient-to-r from-[#5865F2] to-[#7289da] p-8 sm:p-12 text-white hacker-card-shadow flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left max-w-xl">
            <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur font-mono text-xs font-bold uppercase tracking-wider mb-3">
              👾 GLOBAL HACKER HOUSE
            </div>
            <h3 className="text-3xl sm:text-4xl font-black font-sans leading-tight">
              Ready to hack with us?
            </h3>
            <p className="mt-2 text-white/90 font-medium text-base">
              Join the official Reco Labs Discord. Talk hardware, share GitHub commits, and hang out with builders around the clock.
            </p>
          </div>

          <a
            href="https://discord.com/invite/7dk4w37BhP"
            target="_blank"
            rel="noreferrer"
            className="flex-none px-8 py-4 rounded-2xl bg-white text-zinc-950 font-mono text-sm font-black uppercase tracking-wider hacker-btn-shadow hover:bg-yellow-300 transition-colors"
          >
            Enter Discord →
          </a>
        </div>

      </div>
    </section>
  )
}

export default ManifestoSection
