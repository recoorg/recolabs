import * as React from "react"
import { GithubIcon } from "@/components/icons"

export function BlogFooter() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/80 py-6 text-zinc-500 font-mono text-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FA5D00]" />
          <span className="text-zinc-700 dark:text-zinc-300 font-bold">Reco Labs</span>
          <span>&bull;</span>
          <span>Engineering Dispatches</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/recoorg/recolabs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>recoorg/recolabs</span>
          </a>
          <span>&bull;</span>
          <a
            href="https://discord.com/invite/7dk4w37BhP"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#5865F2] transition-colors"
          >
            Discord
          </a>
        </div>
      </div>
    </footer>
  )
}
