"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { MessageSquare, ArrowUpRight, Terminal, Heart, Sparkles, Rocket, Cpu, Users, Code, ShieldCheck } from "lucide-react"
import { GithubIcon } from "@/components/icons"
import { SEO } from "@/components/SEO"

export function AboutPage() {
  const whyJoinPoints = [
    {
      num: "01",
      icon: Terminal,
      title: "Real Code & Hardware, Zero Fluff",
      desc: "We don't build vaporware or polish pitch decks for awards. We solder microcontrollers, write low-level systems code, reverse binaries, and ship production web tools that solve real problems.",
      tag: "CRAFT_FIRST",
    },
    {
      num: "02",
      icon: Users,
      title: "Direct Peer Guild & 2 AM Voice Rooms",
      desc: "No waiting lists, no gatekeeping, and no corporate hierarchy. When you're debugging at 2 AM, the Discord voice channels are buzzing with screen shares, compiler output, and curious minds building alongside you.",
      tag: "PERMISSIONLESS",
    },
    {
      num: "03",
      icon: Rocket,
      title: "Claim Your Founder Registry Spot",
      desc: "Every builder in our collective gets a dedicated builder profile at recolabs.in/builder/:username and a verified listing on the public Founder Network to showcase what they're building and share direct contact channels.",
      tag: "FOUNDER_NETWORK",
    },
    {
      num: "04",
      icon: Code,
      title: "100% Open Artifacts",
      desc: "Everything engineered under Reco Labs is published openly on GitHub at recoorg. From prototype firmware to web runtime engines, we build in public so anyone can study, fork, and contribute.",
      tag: "GITHUB_PUBLIC",
    },
    {
      num: "05",
      icon: Cpu,
      title: "Hardware Kits & Compute Support",
      desc: "We help young builders get their hands on microcontrollers (ESP32, RP2040), sensors, prototyping components, and cloud compute grants so lack of gear never blocks curiosity.",
      tag: "BUILD_GRANTS",
    },
    {
      num: "06",
      icon: ShieldCheck,
      title: "Skill Exchange Over Expensive Paywalls",
      desc: "Curiosity is the only prerequisite. Need to learn embedded C++, custom PCB design, shaders, or reverse engineering? Trade your knowledge with fellow builders who love figuring things out from scratch.",
      tag: "PEER_EXCHANGE",
    },
  ]

  return (
    <div className="relative w-full pt-32 sm:pt-36 pb-24 px-6 sm:px-8 bg-transparent overflow-hidden">
      <SEO
        title="About Reco Labs · High School Origins & The Collective"
        description="Started as a Grade 10 high school project by Aditya to fix daily problems. Today Reco Labs is an open guild where curious young minds build software, circuits, and tools together."
      />

      {/* Seamless ambient blurred glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#FA5D00]/[0.025] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-orange-500/[0.02] dark:bg-orange-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        
        {/* Page Tag & Title */}
        <div className="text-center max-w-3xl mx-auto pb-12 border-b editorial-hairline">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
            ORIGINS & THE GUILD
          </span>
          <h1 className="mt-4 font-serif text-5xl sm:text-7xl lg:text-8xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
            The Story of Reco Labs<span className="text-[#FA5D00]">.</span>
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Started in Grade 10 to solve daily problems and channel raw curiosity into open tools, real hardware, and practical guides for young builders.
          </p>
        </div>

        {/* Note from Founder Section (Photo Removed, Pure Note Editorial) */}
        <div className="mt-16">
          <div className="relative p-8 sm:p-12 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 shadow-sm backdrop-blur-sm">
            
            {/* Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b editorial-hairline mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-[#FA5D00] font-mono text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>A NOTE FROM THE FOUNDER</span>
              </div>
              <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-widest">
                Grade 10 High School Origins · Still Shipping
              </span>
            </div>

            {/* Note Body */}
            <div className="space-y-6 max-w-3xl">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight leading-snug">
                &ldquo;Hi Nerd, this is Aditya.&rdquo;
              </h2>

              <p className="font-sans text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                Reco Labs was my high school project during Grade 10, in which we created multiple projects that fixed our daily problems and wrote real-world tutorials for friends trying to learn code.
              </p>

              <p className="font-sans text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                Now, I decided to launch this out to you. This is going to help lots of beginners find a clear path without getting overwhelmed by jargon or stuck behind paywalls.
              </p>

              <p className="font-sans text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                Every year, we are implementing more features—from open repositories and hardware schematics to weekend hack sprints. Curiosity is the only thing you need to bring.
              </p>
            </div>

            {/* Founder Signature & Contact Strip */}
            <div className="mt-10 pt-6 border-t editorial-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-serif text-2xl font-normal text-zinc-950 dark:text-zinc-50">Aditya</div>
                <div className="font-mono text-xs text-zinc-400">Founder · Reco Labs</div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://discordapp.com/users/1487817113191055593"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Talk to Aditya on Discord</span>
                </a>

                <a
                  href="https://github.com/recoorg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs font-bold uppercase tracking-wider hover:border-[#FA5D00] transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>github.com/recoorg</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* NEW SECTION: Why Should You Join Us */}
        <div className="mt-28 pt-16 border-t editorial-hairline">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
              JOIN THE RECO GUILD
            </span>
            <h2 className="mt-3 font-serif text-4xl sm:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
              Why should you join Us<span className="text-[#FA5D00]">?</span>
            </h2>
            <p className="mt-4 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
              Most communities are passive feeds or corporate resumes. Reco Labs is a hands-on workshop for hackers who learn by building.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyJoinPoints.map((point) => {
              const Icon = point.icon
              return (
                <div
                  key={point.num}
                  className="group relative p-7 sm:p-8 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 hover:border-[#FA5D00] dark:hover:border-[#FA5D00] transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b editorial-hairline mb-5">
                      <div className="w-10 h-10 rounded-2xl bg-orange-100/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-[#FA5D00] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#FA5D00]" />
                      </div>
                      <span className="font-mono text-[10px] tracking-wider text-zinc-400 font-bold uppercase">
                        {point.tag}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl text-zinc-950 dark:text-zinc-50 font-normal group-hover:text-[#FA5D00] transition-colors leading-snug">
                      {point.title}
                    </h3>

                    <p className="mt-3 font-sans text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      {point.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t editorial-hairline flex items-center justify-between font-mono text-[11px] text-zinc-400">
                    <span>POINT {point.num}</span>
                    <span className="text-[#FA5D00] group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Join Call to Action Banner */}
          <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-zinc-950 text-white dark:bg-[#121215] border-2 border-black dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <span className="font-mono text-xs uppercase text-[#FA5D00] font-bold tracking-wider">
                OPEN CALL FOR BUILDERS
              </span>
              <h3 className="mt-1 font-serif text-3xl sm:text-4xl font-normal">
                Ready to build with curious minds?
              </h3>
              <p className="mt-1 font-sans text-sm text-zinc-400 max-w-xl">
                Jump into our Discord, introduce yourself in #introductions, or list your active build on the Founder Network.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 flex-none">
              <a
                href="https://discord.com/invite/7dk4w37BhP"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                Join Discord Guild
              </a>
              <Link
                to="/network"
                className="px-6 py-3 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95"
              >
                Founder Network
              </Link>
            </div>
          </div>
        </div>

        {/* The Evolution Timeline */}
        <div className="mt-28 pt-16 border-t editorial-hairline">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
              EVOLUTION & ROADMAP
            </span>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl text-zinc-950 dark:text-zinc-50 font-normal">
              How the project grew<span className="text-[#FA5D00]">.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="font-mono text-xs text-[#FA5D00] font-bold">PHASE 01 · GRADE 10</span>
              <h3 className="mt-3 font-serif text-2xl text-zinc-950 dark:text-zinc-100">Fixing Daily Problems</h3>
              <p className="mt-3 font-sans text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Started as small scripts, hardware hacks, and straightforward guides written in a notebook to automate homework, debug microcontrollers, and share code among high school peers.
              </p>
            </div>

            <div className="p-8 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="font-mono text-xs text-[#FA5D00] font-bold">PHASE 02 · THE LAUNCH</span>
              <h3 className="mt-3 font-serif text-2xl text-zinc-950 dark:text-zinc-100">Path for Beginners</h3>
              <p className="mt-3 font-sans text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Opening the project to curious minds globally. Creating beginner pathways so anyone starting out can bypass confusing tutorials and build projects that actually work.
              </p>
            </div>

            <div className="p-8 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="font-mono text-xs text-[#FA5D00] font-bold">PHASE 03 · NEW FEATURES</span>
              <h3 className="mt-3 font-serif text-2xl text-zinc-950 dark:text-zinc-100">Continuous Expansion</h3>
              <p className="mt-3 font-sans text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Adding more features every year: autonomous toolchains, open hardware CAD repositories, seasonal hackathons, and a thriving 24/7 Discord guild for real-time collaboration.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AboutPage
