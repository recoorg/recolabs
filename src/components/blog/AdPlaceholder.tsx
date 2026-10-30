import * as React from "react"
import { Megaphone, ArrowUpRight } from "lucide-react"

interface AdPlaceholderProps {
  className?: string
  slotName?: string
}

export function AdPlaceholder({ className = "", slotName = "DISPATCH-MIDFEED-01" }: AdPlaceholderProps) {
  return (
    <div
      className={`my-8 p-5 sm:p-6 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/60 dark:bg-[#0e0e12]/60 text-zinc-800 dark:text-zinc-200 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-lg">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-[#FA5D00] tracking-wider">
            <Megaphone className="w-3.5 h-3.5" />
            <span>ADVERTISEMENT SPACE &bull; {slotName}</span>
          </div>
          <h4 className="font-serif text-lg sm:text-xl text-zinc-950 dark:text-white">
            Sponsor Reco Labs Engineering Dispatches
          </h4>
          <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Showcase your developer platform, compiler infrastructure, or hardware rigs to curious young makers and engineers.
          </p>
        </div>

        <a
          href="mailto:ads@recolabs.in?subject=Reco%20Labs%20Blog%20Ad%20Placement"
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 font-mono text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-sm"
        >
          <span>Reserve Slot</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}
