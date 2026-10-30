"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, ArrowUpRight, MessageSquare, Terminal } from "lucide-react"
import { GithubIcon } from "@/components/icons"

export function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Close mobile menu whenever route changes
  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Prevent background scroll when mobile drawer is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { label: "ABOUT", path: "/about" },
    { label: "BLOG", path: "https://blog.recolabs.in", external: true },
    { label: "JOBS", path: "/jobs" },
    { label: "PROJECTS", path: "/projects" },
    { label: "HACKATHONS", path: "/hackathons" },
    { label: "NETWORK", path: "/network" },
    { label: "SPONSORS", path: "/sponsors" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-5 sm:px-6 py-4 sm:py-5 pointer-events-none">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        
        {/* Left: Raw Logo Mark */}
        <Link
          to="/"
          className="pointer-events-auto flex items-center gap-2 hover:opacity-85 transition-opacity"
          aria-label="Reco Labs Home"
        >
          <img
            src="/logo-black.png"
            alt="Reco Labs Logo"
            className="h-8 sm:h-10 w-auto object-contain dark:hidden"
          />
          <img
            src="/logo-white.png"
            alt="Reco Labs Logo"
            className="h-8 sm:h-10 w-auto object-contain hidden dark:block"
          />
        </Link>

        {/* Center: Desktop Vibrant Orange Pill Navigation */}
        <nav
          className="pointer-events-auto hidden sm:flex items-center gap-4 md:gap-6 px-6 py-2 rounded-full bg-[#FA5D00] border-2 border-black text-black font-mono text-[12px] md:text-[13px] font-bold tracking-wider uppercase shadow-sm"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75 transition-opacity inline-flex items-center gap-0.5"
                title="Reco Labs Blog (opens in new tab)"
              >
                <span>{link.label}</span>
                <span className="text-[10px] leading-none opacity-70">↗</span>
              </a>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-opacity ${isActive(link.path) ? "underline underline-offset-4 decoration-2" : "hover:opacity-75"}`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Right Desktop: Discord Button */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://discord.com/invite/7dk4w37BhP"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto px-5 py-2 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-95 flex items-center justify-center"
          >
            Discord
          </a>
        </div>

        {/* Right Mobile: 3-line Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2 pointer-events-auto">
          <a
            href="https://discord.com/invite/7dk4w37BhP"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-full bg-[#5865F2] text-white font-mono text-[11px] font-bold tracking-wider uppercase shadow-sm"
          >
            Discord
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm active:scale-90 transition-all cursor-pointer"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-[#FA5D00]" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 w-4">
                <span className="w-4 h-[2px] bg-black dark:bg-white rounded-full transition-transform" />
                <span className="w-4 h-[2px] bg-black dark:bg-white rounded-full transition-transform" />
                <span className="w-4 h-[2px] bg-black dark:bg-white rounded-full transition-transform" />
              </div>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 top-[68px] z-40 bg-black/60 backdrop-blur-md pointer-events-auto animate-in fade-in duration-200">
          <div className="mx-4 mt-2 p-6 rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#09090b] shadow-2xl flex flex-col justify-between max-h-[calc(100vh-90px)] overflow-y-auto">
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b editorial-hairline">
              <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-bold">
                RECO LABS · NAVIGATION
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                Menu
              </span>
            </div>

            {/* Nav list */}
            <nav className="flex flex-col py-6 space-y-3 font-mono">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between py-2 text-base font-bold tracking-wider transition-colors ${
                  isActive("/") ? "text-[#FA5D00]" : "text-zinc-900 dark:text-zinc-100 hover:text-[#FA5D00]"
                }`}
              >
                <span>01. HOME</span>
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </Link>

              {navLinks.map((link, idx) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-2 text-base font-bold tracking-wider transition-colors border-t editorial-hairline text-zinc-900 dark:text-zinc-100 hover:text-[#FA5D00]"
                  >
                    <span>0{idx + 2}. {link.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#FA5D00]" />
                  </a>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between py-2 text-base font-bold tracking-wider transition-colors border-t editorial-hairline ${
                      isActive(link.path) ? "text-[#FA5D00]" : "text-zinc-900 dark:text-zinc-100 hover:text-[#FA5D00]"
                    }`}
                  >
                    <span>0{idx + 2}. {link.label}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-50" />
                  </Link>
                )
              )}
            </nav>

            {/* Bottom Actions */}
            <div className="pt-4 border-t editorial-hairline flex flex-col gap-3">
              <a
                href="https://discord.com/invite/7dk4w37BhP"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#5865F2] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Join Discord Guild</span>
              </a>

              <a
                href="https://github.com/recoorg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-800 dark:text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider hover:border-[#FA5D00]"
              >
                <GithubIcon className="w-4 h-4" />
                <span>recoorg on GitHub</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
