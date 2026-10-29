"use client"

import * as React from "react"
import { Heart, Mail, ArrowUpRight, Copy, Check, Plus, Image as ImageIcon, ExternalLink, ShieldCheck, Cpu, Zap, Users } from "lucide-react"

// ==============================================================================
// SPONSOR ROSTER CONFIGURATION
// To add or change a sponsor image, place your image inside /public/sponsors/
// and update the 'logo' property below (e.g. logo: "/sponsors/company.png").
// If logo is undefined or empty, a clean placeholder slot is automatically rendered.
// ==============================================================================
export interface SponsorItem {
  id: string
  name: string
  logo?: string // e.g. "/sponsors/partner1.png"
  url?: string
  tier: "founding" | "hardware" | "community"
  tierLabel: string
  description?: string
  slotOpen?: boolean
}

export const INITIAL_SPONSORS: SponsorItem[] = [
  // Tier 1: Founding Partners
  {
    id: "founding-01",
    name: "Founding Partner Slot #1",
    tier: "founding",
    tierLabel: "TIER 01 · FOUNDING PARTNER",
    description: "Anchor sponsor supporting global hackathons, hardware shipments, and beginner workshops.",
    slotOpen: true,
  },
  {
    id: "founding-02",
    name: "Founding Partner Slot #2",
    tier: "founding",
    tierLabel: "TIER 01 · FOUNDING PARTNER",
    description: "Open tier for developer tooling, cloud runtime, and educational infrastructure sponsors.",
    slotOpen: true,
  },
  {
    id: "founding-03",
    name: "Founding Partner Slot #3",
    tier: "founding",
    tierLabel: "TIER 01 · FOUNDING PARTNER",
    description: "Dedicated to open-source software libraries, WebGL tooling, and autonomous agent systems.",
    slotOpen: true,
  },
  {
    id: "founding-04",
    name: "Founding Partner Slot #4",
    tier: "founding",
    tierLabel: "TIER 01 · FOUNDING PARTNER",
    description: "Championing youth hacker collectives, beginner curriculums, and open-access toolchains.",
    slotOpen: true,
  },

  // Tier 2: Hardware & Cloud Backers
  {
    id: "hw-01",
    name: "Hardware Lab Sponsor #1",
    tier: "hardware",
    tierLabel: "TIER 02 · HARDWARE & COMPUTE",
    description: "Sponsoring microcontrollers (ESP32, RP2040) and KiCAD PCB manufacturing grants.",
    slotOpen: true,
  },
  {
    id: "hw-02",
    name: "Hardware Lab Sponsor #2",
    tier: "hardware",
    tierLabel: "TIER 02 · HARDWARE & COMPUTE",
    description: "Sponsoring sensor modules, soldering equipment, and bench diagnostic testing tools.",
    slotOpen: true,
  },
  {
    id: "hw-03",
    name: "Cloud Compute Backer #1",
    tier: "hardware",
    tierLabel: "TIER 02 · HARDWARE & COMPUTE",
    description: "Providing hosting, database clusters, and inference compute for open-source AI builds.",
    slotOpen: true,
  },
  {
    id: "hw-04",
    name: "Cloud Compute Backer #2",
    tier: "hardware",
    tierLabel: "TIER 02 · HARDWARE & COMPUTE",
    description: "Edge networks, CDN distribution, and continuous integration pipeline compute.",
    slotOpen: true,
  },

  // Tier 3: Community & Ecosystem Supporters
  {
    id: "comm-01",
    name: "Ecosystem Supporter #1",
    tier: "community",
    tierLabel: "TIER 03 · COMMUNITY SUPPORTER",
    slotOpen: true,
  },
  {
    id: "comm-02",
    name: "Ecosystem Supporter #2",
    tier: "community",
    tierLabel: "TIER 03 · COMMUNITY SUPPORTER",
    slotOpen: true,
  },
  {
    id: "comm-03",
    name: "Ecosystem Supporter #3",
    tier: "community",
    tierLabel: "TIER 03 · COMMUNITY SUPPORTER",
    slotOpen: true,
  },
  {
    id: "comm-04",
    name: "Ecosystem Supporter #4",
    tier: "community",
    tierLabel: "TIER 03 · COMMUNITY SUPPORTER",
    slotOpen: true,
  },
]

export function SponsorsPage() {
  const [sponsors] = React.useState<SponsorItem[]>(INITIAL_SPONSORS)
  const [copied, setCopied] = React.useState(false)
  const sponsorEmail = "devadibxr@gmail.com"

  const handleCopy = () => {
    navigator.clipboard.writeText(sponsorEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const foundingSponsors = sponsors.filter((s) => s.tier === "founding")
  const hardwareSponsors = sponsors.filter((s) => s.tier === "hardware")
  const communitySponsors = sponsors.filter((s) => s.tier === "community")

  return (
    <div className="relative w-full pt-32 sm:pt-36 pb-24 px-6 sm:px-8 bg-transparent overflow-hidden">
      {/* Seamless ambient blurred glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#FA5D00]/[0.025] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-orange-500/[0.02] dark:bg-orange-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto pb-12 border-b editorial-hairline">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
            SPONSORSHIPS & PARTNERSHIPS
          </span>
          <h1 className="mt-4 font-serif text-5xl sm:text-7xl lg:text-8xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
            Sponsors & Partners<span className="text-[#FA5D00]">.</span>
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Backing open hardware labs, beginner toolchains, and global weekend hack sprints. Zero corporate overhead—every dollar goes directly to physical parts and student build grants.
          </p>

          {/* Action Triggers */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <a
              href={`mailto:${sponsorEmail}?subject=Sponsoring%20Reco%20Labs&body=Hi%20Aditya%2C%0A%0AWe%20would%20love%20to%20become%20a%20sponsor%20for%20Reco%20Labs.%20Here%20are%20the%20details%3A`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-black" />
              <span>Sponsor Reco Labs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-700 dark:text-zinc-300 shadow-sm">
              <Mail className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
              <a href={`mailto:${sponsorEmail}`} className="hover:text-[#FA5D00] transition-colors">
                {sponsorEmail}
              </a>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy email address"
                className="ml-1 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tier 1: Founding Partners */}
        <div className="mt-20">
          <div className="flex items-center justify-between pb-4 border-b editorial-hairline mb-8">
            <div>
              <span className="font-mono text-xs text-[#FA5D00] font-bold uppercase tracking-wider flex items-center gap-2">
                TIER 01 · FOUNDING PARTNERS
              </span>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal">
                Anchor Benefactors & Labs
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-400">4 Featured Slots</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {foundingSponsors.map((s) => (
              <div
                key={s.id}
                className="group relative p-8 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 hover:border-[#FA5D00] transition-all flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b editorial-hairline">
                    <span className="font-mono text-[11px] text-[#FA5D00] font-bold">{s.tierLabel}</span>
                    <span className="font-mono text-[10px] text-zinc-400 uppercase">Available Slot</span>
                  </div>

                  {s.logo ? (
                    <div className="my-6 flex items-center justify-center h-20">
                      <img src={s.logo} alt={s.name} className="max-h-16 max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="my-6 flex flex-col items-center justify-center py-6 text-center">
                      <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-[#FA5D00] group-hover:border-[#FA5D00] transition-colors mb-3">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div className="font-serif text-2xl text-zinc-900 dark:text-zinc-100 font-normal">{s.name}</div>
                      <div className="font-mono text-[11px] text-zinc-500 mt-1">Drop sponsor logo here (`logo: &quot;/sponsors/...&quot;`)</div>
                    </div>
                  )}

                  {s.description && (
                    <p className="font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed text-center max-w-md mx-auto">
                      {s.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t editorial-hairline flex items-center justify-between">
                  <span className="font-mono text-[11px] text-zinc-400">Featured across website, repos & Discord</span>
                  <a
                    href={`mailto:${sponsorEmail}?subject=Founding%20Partner%20Inquiry%20-%20Reco%20Labs&body=Hi%20Aditya%2C%0A%0AWe%20would%20like%20to%20claim%20${encodeURIComponent(s.name)}.`}
                    className="inline-flex items-center gap-1 font-mono text-xs font-bold text-black dark:text-white group-hover:text-[#FA5D00] transition-colors"
                  >
                    <span>Claim Slot</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 2: Hardware & Cloud Compute Backers */}
        <div className="mt-20">
          <div className="flex items-center justify-between pb-4 border-b editorial-hairline mb-8">
            <div>
              <span className="font-mono text-xs text-[#FA5D00] font-bold uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" />
                TIER 02 · HARDWARE & COMPUTE
              </span>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal">
                Workbench & Cloud Infrastructure
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-400">4 Active Slots</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hardwareSponsors.map((s) => (
              <div
                key={s.id}
                className="group p-6 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 hover:border-[#FA5D00] transition-all flex flex-col justify-between min-h-[190px]"
              >
                <div>
                  <div className="font-mono text-[10px] text-[#FA5D00] font-bold uppercase">{s.tierLabel}</div>
                  
                  {s.logo ? (
                    <div className="my-4 flex items-center justify-center h-16">
                      <img src={s.logo} alt={s.name} className="max-h-12 max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="my-4 flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-[#FA5D00] group-hover:border-[#FA5D00] transition-colors mb-2">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="font-serif text-lg text-zinc-900 dark:text-zinc-100">{s.name}</div>
                      <div className="font-mono text-[10px] text-zinc-400 mt-0.5">Available Slot</div>
                    </div>
                  )}

                  {s.description && (
                    <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-normal text-center">
                      {s.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t editorial-hairline text-center">
                  <a
                    href={`mailto:${sponsorEmail}?subject=Hardware%20Compute%20Sponsor%20Inquiry%20-%20Reco%20Labs&body=Hi%20Aditya%2C%0A%0AWe%20would%20like%20to%20sponsor%20${encodeURIComponent(s.name)}.`}
                    className="font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-[#FA5D00] transition-colors inline-flex items-center gap-1"
                  >
                    <span>Claim Slot</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3: Community & Ecosystem Supporters */}
        <div className="mt-20">
          <div className="flex items-center justify-between pb-4 border-b editorial-hairline mb-8">
            <div>
              <span className="font-mono text-xs text-[#FA5D00] font-bold uppercase tracking-wider flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                TIER 03 · COMMUNITY SUPPORTERS
              </span>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal">
                Ecosystem & Micro-Grants
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-400">Open Roster</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {communitySponsors.map((s) => (
              <div
                key={s.id}
                className="group p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 hover:border-[#FA5D00] transition-all flex flex-col items-center justify-center text-center min-h-[100px]"
              >
                <div className="w-8 h-8 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-[#FA5D00] group-hover:border-[#FA5D00] transition-colors mb-1.5">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div className="font-serif text-sm text-zinc-900 dark:text-zinc-100">{s.name}</div>
                <a
                  href={`mailto:${sponsorEmail}?subject=Community%20Supporter%20Inquiry%20-%20Reco%20Labs`}
                  className="font-mono text-[10px] text-[#FA5D00] mt-1 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Inquire</span>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* How Funds are Allocated */}
        <div className="mt-24 pt-16 border-t editorial-hairline">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
              TRANSPARENT ALLOCATION
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal">
              Where Your Sponsorship Goes<span className="text-[#FA5D00]">.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-6 rounded-2xl border editorial-hairline bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="text-2xl font-bold text-[#FA5D00]">50%</span>
              <h3 className="mt-2 font-serif text-xl font-normal text-zinc-900 dark:text-zinc-100">Hardware & Component Grants</h3>
              <p className="mt-2 font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Direct shipment of development boards (ESP32, RP2040), breadboards, sensors, and PCB fabrication credits for high school hackers building physical gadgets.
              </p>
            </div>

            <div className="p-6 rounded-2xl border editorial-hairline bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="text-2xl font-bold text-[#FA5D00]">30%</span>
              <h3 className="mt-2 font-serif text-xl font-normal text-zinc-900 dark:text-zinc-100">Hackathon Prize Bounties</h3>
              <p className="mt-2 font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Direct peer-voted prizes and toolchain bounties awarded to participants at the end of every 48-hour build jam.
              </p>
            </div>

            <div className="p-6 rounded-2xl border editorial-hairline bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="text-2xl font-bold text-[#FA5D00]">20%</span>
              <h3 className="mt-2 font-serif text-xl font-normal text-zinc-900 dark:text-zinc-100">Compute & Infrastructure</h3>
              <p className="mt-2 font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Server hosting, domain registries, and continuous deployment runners keeping all Reco Labs repositories open-source and free for all users.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SponsorsPage
