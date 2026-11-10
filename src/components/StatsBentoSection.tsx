"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Link } from "react-router-dom"
import { Globe, Users, ShieldCheck, ArrowUpRight, Terminal, Sparkles, CheckCircle2 } from "lucide-react"

export function StatsBentoSection() {
  const chartBars = [15, 30, 55, 40, 75, 60, 95, 80, 110, 120, 130]

  return (
    <section className="relative w-full py-24 sm:py-32 px-6 sm:px-8 bg-[#07090e] text-white overflow-hidden select-none border-t border-zinc-800/80">
      {/* Audited Radial Horizon from ui-layouts stats-section */}
      <div className="absolute inset-0 bg-[radial-gradient(125%_125%_at_50%_10%,rgba(255,255,255,0)_40%,rgba(250,93,0,0.10)_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto pb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#FA5D00]/30 bg-[#FA5D00]/[0.08] text-[#FF8C42] font-mono text-[11px] font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FA5D00] animate-pulse" />
            <span>ECOSYSTEM TELEMETRY · PROOF OF WORK</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl text-white font-normal tracking-tight">
            Our Existence <span className="italic">in Numbers</span><span className="text-[#FA5D00]">.</span>
          </h2>
          <p className="mt-4 font-sans text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            From high school experiments to a global builder network. Real metrics driven by curiosity, code commits, and zero corporate fluff.
          </p>
        </div>

        {/* Bento Grid Architecture (Audited from ui-layouts packages/blocks/src/stats-section/stats-bento.tsx) */}
        <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 max-w-7xl mx-auto">
          
          {/* Primary Stat (3 cols x 2 rows) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="md:col-span-3 md:row-span-2 bg-[#0d1017] rounded-3xl p-8 sm:p-10 border border-zinc-800/90 flex flex-col justify-between overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
          >
            {/* Audited repeating diagonal hatch + radial mask */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#27272a_0px_1px,transparent_1px_10px)] [mask-image:radial-gradient(ellipse_80%_50%_at_100%_0%,#000_70%,transparent_110%)] pointer-events-none opacity-40" />
            
            {/* Audited hover bloom halo */}
            <div className="absolute -inset-20 bg-gradient-to-tr from-[#FA5D00]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono font-bold text-[#FF8C42] uppercase tracking-widest mb-6">
                <Globe className="w-3 h-3 text-[#FA5D00]" />
                GLOBAL AGGREGATION
              </span>
              <div className="font-serif text-6xl sm:text-7xl lg:text-8xl tracking-tight text-white font-normal leading-none">
                900<span className="text-[#FA5D00] font-sans">+</span>
              </div>
              <p className="text-zinc-400 font-sans text-sm sm:text-base max-w-sm mt-4 leading-relaxed">
                Youth, student, and collegiate hackathons indexed worldwide via Hack Club API integration. Real-time squad building and zero registration barriers.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span>Live Feed Synced</span>
              </div>
              <Link to="/hackathons" className="text-[#FA5D00] hover:text-[#ff8c42] flex items-center gap-1 font-bold transition-colors">
                <span>Explore Directory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Secondary Stat A: Guild Growth & Equalizer Bar (3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="md:col-span-3 bg-[#0d1017] rounded-3xl p-8 border border-zinc-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            <div className="absolute -inset-20 bg-gradient-to-tr from-[#FA5D00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                ACTIVE BUILDER GUILD
              </span>
              <div className="font-serif text-5xl sm:text-6xl text-white font-normal">
                500<span className="text-[#FA5D00] font-sans">+</span>
              </div>
              <p className="text-zinc-400 font-sans text-xs mt-2 max-w-xs leading-relaxed">
                Young engineers, reverse engineers, and student makers across Discord, GitHub, and Twitter.
              </p>
            </div>

            {/* Audited Equalizer Bar Visualizer */}
            <div className="relative z-10 flex gap-1.5 items-end h-16 sm:h-20 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shrink-0">
              {chartBars.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 4 }}
                  whileInView={{ height: `${(h / 130) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.04,
                    ease: "easeOut",
                  }}
                  className="w-1.5 sm:w-2 bg-gradient-to-t from-[#FA5D00]/60 to-[#FA5D00] rounded-full min-h-[4px]"
                />
              ))}
            </div>
          </motion.div>

          {/* Tertiary Stat B: Origin Roots (1 col, centered number display) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="md:col-span-1 bg-[#0d1017] rounded-3xl p-6 border border-zinc-800/90 flex flex-col justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            <div className="absolute -inset-10 bg-gradient-to-tr from-[#FA5D00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <p className="font-serif text-3xl sm:text-4xl text-white font-normal mb-1">
                2024
              </p>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                ORIGIN ROOTS
              </p>
              <p className="text-[11px] font-mono text-[#FF8C42] mt-2">
                Grade 10
              </p>
            </div>
          </motion.div>

          {/* Tertiary Stat C: Zero Take Rate / Anti-Paywall (2 cols, star/badge pill) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            className="md:col-span-2 bg-[#0d1017] rounded-3xl p-6 border border-zinc-800/90 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            <div className="absolute -inset-10 bg-gradient-to-tr from-[#FA5D00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none" />

            <div className="relative z-10 size-12 text-2xl rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 shadow-sm font-semibold text-[#FA5D00]">
              <ShieldCheck className="w-6 h-6 text-[#FA5D00]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl font-normal text-white">0%</span>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">PLATFORM CUT</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-snug">
                100% open-source software, zero paywalls, unmoderated peer review.
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}

export default StatsBentoSection
