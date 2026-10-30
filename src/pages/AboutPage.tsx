"use client"

import * as React from "react"
import { MessageSquare, Terminal, Heart, Compass, Lightbulb, Code } from "lucide-react"
import { GithubIcon } from "@/components/icons"

export function AboutPage() {
  return (
    <div className="relative w-full pt-32 sm:pt-36 pb-20 px-6 sm:px-8 bg-transparent overflow-hidden">
      {/* Seamless ambient blurred glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#FA5D00]/[0.025] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-orange-500/[0.02] dark:bg-orange-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        
        {/* Page Tag & Title */}
        <div className="text-center max-w-3xl mx-auto pb-12 border-b editorial-hairline">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
            FOUNDERS & ORIGINS
          </span>
          <h1 className="mt-4 font-serif text-5xl sm:text-7xl lg:text-8xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
            The Story of Reco Labs<span className="text-[#FA5D00]">.</span>
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Started in Grade 10 to solve daily problems and channel raw curiosity into open tools, reversing, and real-world software for young minds.
          </p>
        </div>

        {/* Founders Feature Section */}
        <div className="mt-16 space-y-24">
          
          {/* Founder 01: Aditya */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Founder Portrait */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[380px] rounded-3xl overflow-hidden border-2 border-black dark:border-zinc-700 shadow-xl group">
                <img
                  src="/founder.jpg"
                  alt="Aditya — Founder of Reco Labs"
                  className="w-full aspect-[4/5] object-cover object-center filter contrast-[1.02] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                  <div className="font-serif text-2xl font-normal">Aditya</div>
                  <div className="font-mono text-[11px] text-zinc-300 uppercase tracking-wider">
                    Founder · Reco Labs
                  </div>
                </div>
              </div>
              <div className="mt-3 font-mono text-[11px] text-zinc-400 uppercase tracking-widest">
                Grade 10 High School Origins · Still Shipping
              </div>
            </div>

            {/* Letter from Aditya */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-[#FA5D00] font-mono text-xs font-semibold uppercase tracking-wider w-fit mb-6">
                <span>A NOTE FROM ADITYA</span>
              </div>

              <div className="space-y-5 font-sans text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                <p className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-100 italic">
                  &ldquo;Hi Nerd, this is Aditya.&rdquo;
                </p>

                <p>
                  Reco Labs was my high school project during Grade 10, in which we created multiple projects that fixed our daily problems and wrote real-world tutorials for friends trying to learn code.
                </p>

                <p>
                  Now, I decided to launch this out to you. This is going to help lots of beginners find a clear path without getting overwhelmed by jargon or stuck behind paywalls.
                </p>

                <p>
                  Every year, we are implementing more features—from open repositories and hardware schematics to weekend hack sprints. Curiosity is the only thing you need to bring.
                </p>
              </div>

              {/* Direct Connect Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4 pt-6 border-t editorial-hairline">
                <a
                  href="https://discordapp.com/users/1487817113191055593"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Talk to Aditya on Discord</span>
                </a>

                <a
                  href="https://github.com/recoorg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 font-mono text-xs font-bold uppercase tracking-wider hover:border-[#FA5D00] transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>github.com/recoorg</span>
                </a>
              </div>
            </div>

          </div>

          {/* Founder 02: Tanish */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-16 border-t editorial-hairline">
            
            {/* Letter from Tanish */}
            <div className="lg:col-span-7 order-2 lg:order-1 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-[#FA5D00] font-mono text-xs font-semibold uppercase tracking-wider w-fit mb-6">
                <span>A NOTE FROM TANISH</span>
              </div>

              <div className="space-y-5 font-sans text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                <p className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-100 italic">
                  &ldquo;From breaking game systems to building real solutions.&rdquo;
                </p>

                <p>
                  I started by reversing game memory, building cheats, and tearing into executables to see how things actually function behind the graphics. That rabbit hole taught me real low-level systems, assembly, and memory mechanics.
                </p>

                <p>
                  Reco Labs helped me bring that energy to the right place. Instead of keeping skills isolated, we are channeling low-level curiosity into open tooling, security research, and solving real engineering problems for young developers stepping into code for the first time.
                </p>

                <p>
                  If you have ever wanted to pull apart software, understand the kernel, or build tools from the ground up without corporate gatekeeping, this is your home.
                </p>
              </div>

              {/* Direct Connect Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4 pt-6 border-t editorial-hairline">
                <a
                  href="https://discord.com/invite/7dk4w37BhP"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Tanish on Discord</span>
                </a>

                <a
                  href="https://github.com/recoorg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 font-mono text-xs font-bold uppercase tracking-wider hover:border-[#FA5D00] transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>github.com/recoorg</span>
                </a>
              </div>
            </div>

            {/* Founder Portrait: Tanish */}
            <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col items-center">
              <div className="relative w-full max-w-[380px] rounded-3xl overflow-hidden border-2 border-black dark:border-zinc-700 shadow-xl group">
                <img
                  src="/tanish.jpg"
                  alt="Tanish — Co-Founder of Reco Labs"
                  className="w-full aspect-[4/5] object-cover object-center filter contrast-[1.02] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                  <div className="font-serif text-2xl font-normal">Tanish</div>
                  <div className="font-mono text-[11px] text-zinc-300 uppercase tracking-wider">
                    Co-Founder · Reco Labs
                  </div>
                </div>
              </div>
              <div className="mt-3 font-mono text-[11px] text-zinc-400 uppercase tracking-widest">
                Reversing & Systems · Builder Collective
              </div>
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
            <div className="p-8 rounded-3xl border editorial-hairline bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="font-mono text-xs text-[#FA5D00] font-bold">PHASE 01 · GRADE 10</span>
              <h3 className="mt-3 font-serif text-2xl text-zinc-950 dark:text-zinc-100">Fixing Daily Problems</h3>
              <p className="mt-3 font-sans text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Started as small scripts, hardware hacks, and straightforward guides written in a notebook to automate homework, debug microcontrollers, and share code among high school peers.
              </p>
            </div>

            <div className="p-8 rounded-3xl border editorial-hairline bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="font-mono text-xs text-[#FA5D00] font-bold">PHASE 02 · THE LAUNCH</span>
              <h3 className="mt-3 font-serif text-2xl text-zinc-950 dark:text-zinc-100">Path for Beginners</h3>
              <p className="mt-3 font-sans text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Opening the project to curious minds globally. Creating beginner pathways so anyone starting out can bypass confusing tutorials and build projects that actually work.
              </p>
            </div>

            <div className="p-8 rounded-3xl border editorial-hairline bg-zinc-50/50 dark:bg-zinc-900/40">
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
