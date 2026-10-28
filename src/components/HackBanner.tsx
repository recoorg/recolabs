import * as React from "react"
import { Sparkles } from "lucide-react"

export function HackBanner() {
  return (
    <a
      href="https://github.com/recoorg"
      target="_blank"
      rel="noreferrer"
      aria-label="Reco Labs on GitHub"
      className="group fixed top-0 left-6 z-50 flex flex-col items-center drop-shadow-md transition-all duration-300 hover:translate-y-1"
    >
      <div className="relative bg-[#ec3750] px-4 pt-3 pb-2 text-white shadow-lg transition-colors group-hover:bg-[#d62740]">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider uppercase">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-300" />
          <span>RECO LABS</span>
        </div>
        <div className="text-center font-mono text-[9px] font-medium tracking-tight text-white/90">
          github.com/recoorg
        </div>
      </div>
      {/* Ribbon notch triangle */}
      <div className="flex w-full">
        <div className="h-0 w-0 border-t-[14px] border-l-[38px] border-t-[#ec3750] border-l-transparent transition-colors group-hover:border-t-[#d62740]" />
        <div className="h-0 w-0 border-t-[14px] border-r-[38px] border-t-[#ec3750] border-r-transparent transition-colors group-hover:border-t-[#d62740]" />
      </div>
    </a>
  )
}
