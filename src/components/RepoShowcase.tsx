"use client"

import * as React from "react"
import GlassFolder from "@/components/ui/glass-folder-cards"
import { ExternalLink, Terminal } from "lucide-react"
import { GithubIcon } from "@/components/icons"

export function RepoShowcase() {
  const [copied, setCopied] = React.useState(false)

  const handleCopyClone = (repo: string) => {
    navigator.clipboard.writeText(`git clone https://github.com/recoorg/${repo}.git`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="projects" className="relative w-full py-28 px-6 sm:px-8 border-t editorial-hairline bg-[#fcfcfd] dark:bg-[#0c0d11]">
      <div className="mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-16 border-b editorial-hairline">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
              FEATURED REPOSITORIES & VAULTS
            </span>
            <h2 className="mt-3 font-serif text-4xl sm:text-6xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
              Selected works & codebases<span className="text-[#FA5D00]">.</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/recoorg"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-semibold hover:opacity-85 transition-opacity"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>recoorg on GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <button
              onClick={() => handleCopyClone("recolabs")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border editorial-hairline bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono text-xs hover:border-[#FA5D00] transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-[#FA5D00]" />
              <span>{copied ? "Copied clone URL!" : "git clone recolabs.git"}</span>
            </button>
          </div>
        </div>

        {/* Glass Folder Cards Grid */}
        <div className="pt-16 pb-10 flex flex-wrap items-center justify-center gap-12 lg:gap-16">
          {/* Vault 1: recolabs Core */}
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center justify-between w-[340px] px-2 font-mono text-xs text-zinc-500">
              <span className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>recoorg / recolabs</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#FA5D00]">PRIMARY</span>
            </div>

            <GlassFolder
              label="recolabs"
              meta="Core Runtime"
              tone="light"
              art="aurora"
              seed={42}
              width={340}
              files={[
                {
                  name: "recolabs (main branch)",
                  meta: "Active · TypeScript",
                  art: "aurora",
                  href: "https://github.com/recoorg/recolabs",
                },
                {
                  name: "src/engine/runtime.ts",
                  meta: "Engine · 12.8 KB",
                  href: "https://github.com/recoorg/recolabs",
                },
                {
                  name: "ARCHITECTURE.md",
                  meta: "Docs · 4.6 KB",
                  art: "glacier",
                  href: "https://github.com/recoorg/recolabs",
                },
                {
                  name: "package.json",
                  meta: "Config · 1.2 KB",
                  href: "https://github.com/recoorg/recolabs",
                },
              ]}
              action="more"
              menu={[
                {
                  label: "Open on GitHub",
                  onSelect: () => window.open("https://github.com/recoorg/recolabs", "_blank"),
                },
                {
                  label: "Copy Clone URL",
                  onSelect: () => handleCopyClone("recolabs"),
                },
              ]}
            />
          </div>

          {/* Vault 2: Hardware Lab */}
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center justify-between w-[340px] px-2 font-mono text-xs text-zinc-500">
              <span className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>hardware-workbench</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-amber-600">CAD & PCB</span>
            </div>

            <GlassFolder
              label="hardware-lab"
              meta="Firmware & Circuits"
              tone="dark"
              art="ember"
              seed={19}
              width={340}
              labelPlacement="top-left"
              files={[
                {
                  name: "main-board-rev2.kicad_pcb",
                  meta: "KiCAD PCB · 4 Layers",
                  art: "ember",
                  href: "https://github.com/recoorg",
                },
                {
                  name: "firmware/mcu-core.cpp",
                  meta: "C++20 · RTOS",
                  href: "https://github.com/recoorg",
                },
                {
                  name: "case-enclosure.step",
                  meta: "3D CAD · Parametric",
                  art: "verdant",
                  href: "https://github.com/recoorg",
                },
                {
                  name: "BOM-components.csv",
                  meta: "Parts Ledger",
                  href: "https://github.com/recoorg",
                },
              ]}
              action="more"
              menu={[
                {
                  label: "Browse recoorg on GitHub",
                  onSelect: () => window.open("https://github.com/recoorg", "_blank"),
                },
                {
                  label: "Hardware channel on Discord",
                  onSelect: () => window.open("https://discord.com/invite/7dk4w37BhP", "_blank"),
                },
              ]}
            />
          </div>

          {/* Vault 3: Hacker Toolkit */}
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center justify-between w-[340px] px-2 font-mono text-xs text-zinc-500">
              <span className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>hacker-toolkit</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-purple-600">SCRIPTS</span>
            </div>

            <GlassFolder
              label="open-hacks"
              meta="Tools & Sandboxes"
              tone="light"
              art="dusk"
              seed={73}
              width={340}
              action="add"
              onAdd={() => ({
                name: `hack-experiment-${Math.floor(Math.random() * 900 + 100)}.sh`,
                meta: "Just added · recoorg",
                art: "verdant",
                href: "https://github.com/recoorg",
              })}
              files={[
                {
                  name: "crowd-canvas-engine.ts",
                  meta: "GSAP + Canvas Walker",
                  art: "dusk",
                  href: "https://github.com/recoorg",
                },
                {
                  name: "liquid-glass-reveal.glsl",
                  meta: "WebGL2 Dispersion Shader",
                  href: "https://github.com/recoorg",
                },
                {
                  name: "hack-night-terminal.py",
                  meta: "CLI Bridge · AsyncIO",
                  art: "aurora",
                  href: "https://github.com/recoorg",
                },
              ]}
            />
          </div>
        </div>

        {/* Footer Note in Geist Mono */}
        <div className="pt-8 border-t editorial-hairline flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
          <div>
            <span>Hover each glass vault to lean with 3D tilt. Click to fan files out.</span>
          </div>
          <a
            href="https://github.com/recoorg"
            target="_blank"
            rel="noreferrer"
            className="text-[#FA5D00] hover:underline"
          >
            Explore all branches on github.com/recoorg →
          </a>
        </div>

      </div>
    </section>
  )
}

export default RepoShowcase
