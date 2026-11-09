"use client"

import * as React from "react"
import {
  Dialog,
  DialogClose,
  DialogContainer,
  DialogContent,
  DialogDescription,
  DialogImage,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/linear-modal"
import { Plus, ExternalLink, Camera, Sparkles, Globe, User, Tag, ArrowUpRight } from "lucide-react"
import { type StartupItem, type UserProfile } from "@/services/networkApi"

interface BuilderLinearCardProps {
  item: StartupItem
  profile: UserProfile
  onScreenshot?: () => void
}

// Deterministic gradient banners based on item category
const CATEGORY_GRADIENTS: Record<string, string> = {
  Software: "from-orange-500/20 via-zinc-900 to-[#0c0c0e]",
  "Web AI": "from-cyan-500/20 via-zinc-900 to-[#0c0c0e]",
  Hardware: "from-amber-500/20 via-zinc-900 to-[#0c0c0e]",
  "Open Source": "from-emerald-500/20 via-zinc-900 to-[#0c0c0e]",
  Security: "from-purple-500/20 via-zinc-900 to-[#0c0c0e]",
}

export function BuilderLinearCard({ item, profile, onScreenshot }: BuilderLinearCardProps) {
  const gradient = CATEGORY_GRADIENTS[item.category] || "from-orange-500/20 via-zinc-900 to-[#0c0c0e]"
  const cleanUrl = item.url.replace(/^https?:\/\//, "")
  const fullUrl = item.url.startsWith("http") ? item.url : `https://${item.url}`

  return (
    <Dialog
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.5,
      }}
    >
      {/* ── CARD TRIGGER (Expands smoothly on click) ── */}
      <DialogTrigger
        style={{ borderRadius: "24px" }}
        className="w-full flex flex-col justify-between p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 hover:border-[#FA5D00] hover:shadow-xl dark:hover:shadow-[#FA5D00]/5 transition-all duration-300 text-left group overflow-hidden relative"
      >
        <div>
          {/* Top Metadata Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100/70 dark:bg-orange-950/40 text-[#FA5D00] font-mono text-[10px] font-bold uppercase tracking-wider">
              {item.category}
            </span>
            <span className="font-mono text-[10px] text-zinc-400 uppercase">
              {item.stage}
            </span>
          </div>

          {/* Project Title */}
          <DialogTitle className="font-serif text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-[#FA5D00] transition-colors">
            {item.name}
          </DialogTitle>

          {/* Website domain tag */}
          <div className="mt-1 font-mono text-xs text-zinc-400 truncate flex items-center gap-1">
            <Globe className="w-3 h-3 opacity-60" />
            <span>{cleanUrl}</span>
          </div>

          {/* Problem Solved Teaser */}
          <div className="mt-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">
              PROBLEM SOLVED
            </span>
            <p className="font-sans text-xs text-zinc-700 dark:text-zinc-300 line-clamp-3 leading-relaxed">
              {item.problem_solving}
            </p>
          </div>
        </div>

        {/* Card Footer with Expanding Button */}
        <div className="mt-5 pt-3.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#FA5D00] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>View Full Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>

          <div className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-[#FA5D00] group-hover:text-black transition-colors">
            <Plus className="w-4 h-4" />
          </div>
        </div>
      </DialogTrigger>

      {/* ── EXPANDING DIALOG MODAL (Linear Modal Primitive) ── */}
      <DialogContainer
        className="p-4 sm:p-8 flex items-center justify-center z-50"
        overlayClassName="dark:bg-[radial-gradient(125%_125%_at_50%_10%,#050505_40%,#1b1b1b_100%)] bg-[radial-gradient(125%_125%_at_50%_10%,#ffffff_40%,#b1b1b1_100%)] backdrop-blur-md"
      >
        <DialogContent
          style={{ borderRadius: "28px" }}
          className="relative flex flex-col max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] shadow-2xl w-full max-w-2xl p-6 sm:p-8 text-left"
        >
          {/* Header Banner */}
          <div className={`w-full h-32 sm:h-40 rounded-2xl bg-gradient-to-br ${gradient} border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center p-6 relative overflow-hidden mb-6`}>
            <div className="absolute inset-0 bg-[radial-gradient(#FA5D00_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            <div className="relative z-10 text-center">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#FF8C42] border border-[#FA5D00]/40 font-mono text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3 text-[#FA5D00]" />
                {item.category} · {item.stage}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {item.name}
              </h2>
            </div>
          </div>

          {/* Founder Attribution Strip */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-bold text-[10px] overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{profile.name}</span>
              <span>(@{profile.username})</span>
            </div>
            <span className="text-[11px] text-zinc-400">Reco Labs Verified</span>
          </div>

          {/* Full Description & Problem Solved */}
          <DialogDescription
            disableLayoutAnimation
            variants={{
              initial: { opacity: 0, scale: 0.95, y: -20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.95, y: -20 },
            }}
            className="mt-6 space-y-4"
          >
            <div>
              <span className="font-mono text-xs font-bold text-[#FA5D00] uppercase tracking-wider block mb-2">
                PROBLEM &amp; MISSION
              </span>
              <p className="font-sans text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {item.problem_solving}
              </p>
            </div>

            <div className="pt-2 font-mono text-xs text-zinc-500 space-y-1">
              <div><span className="text-zinc-400">CATEGORY:</span> <span className="text-zinc-200 font-bold">{item.category}</span></div>
              <div><span className="text-zinc-400">STAGE:</span> <span className="text-zinc-200 font-bold">{item.stage}</span></div>
              <div><span className="text-zinc-400">LIVE URL:</span> <span className="text-[#FA5D00]">{cleanUrl}</span></div>
            </div>
          </DialogDescription>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
            {onScreenshot && (
              <button
                type="button"
                onClick={onScreenshot}
                className="px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-[#FA5D00] hover:text-[#FA5D00] font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#FA5D00]" />
                <span>Create Screenshot Card</span>
              </button>
            )}

            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-md ml-auto"
            >
              <span>Visit Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Close Button */}
          <DialogClose className="text-zinc-500 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 p-2.5 rounded-full transition-colors" />
        </DialogContent>
      </DialogContainer>
    </Dialog>
  )
}

export default BuilderLinearCard
