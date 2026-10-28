"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Compass, Terminal } from "lucide-react"

export function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 pt-32 pb-24 bg-white dark:bg-[#09090b] text-center">
      <div className="max-w-xl mx-auto flex flex-col items-center">
        
        {/* Monospace 404 Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border editorial-hairline bg-zinc-100 dark:bg-zinc-900 font-mono text-xs text-zinc-600 dark:text-zinc-400 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#FA5D00] animate-pulse" />
          <span>HTTP 404 · ROUTE NOT FOUND</span>
        </div>

        {/* Big Instrument Serif Title */}
        <h1 className="font-serif text-7xl sm:text-9xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
          404<span className="text-[#FA5D00]">.</span>
        </h1>

        <p className="font-serif text-2xl sm:text-3xl text-zinc-800 dark:text-zinc-200 mt-2 font-normal">
          Signal lost in the void.
        </p>

        <p className="mt-4 font-sans text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
          The coordinate or repository you are searching for does not exist on this branch. Let&apos;s get you back to the build bench.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-black dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 font-mono text-xs font-bold uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all active:scale-95"
          >
            <Compass className="w-3.5 h-3.5 text-[#FA5D00]" />
            <span>Explore Vaults</span>
          </Link>
        </div>

        {/* Terminal Note */}
        <div className="mt-12 p-3 rounded-lg border editorial-hairline bg-zinc-50 dark:bg-zinc-900/60 font-mono text-[11px] text-zinc-500 max-w-sm flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
          <span>Need help finding a project? Hop into our Discord guild.</span>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
