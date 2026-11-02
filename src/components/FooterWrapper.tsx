"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { CrowdCanvas } from "@/components/CrowdCanvas"
import { networkApi } from "@/services/networkApi"

export function FooterWrapper() {
  const location = useLocation()
  const [isDark, setIsDark] = React.useState(false)
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(() => !!networkApi.getCurrentUser())

  React.useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!networkApi.getCurrentUser())
    }
    checkAuth()
    window.addEventListener("reco_auth_changed", checkAuth)
    return () => window.removeEventListener("reco_auth_changed", checkAuth)
  }, [])

  React.useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }
    checkDark()

    const observer = new MutationObserver(() => checkDark())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  // Hide global footer on desktop catalogue app (/projects) and Dashboard (/dashboard)
  // Kept after all hooks to strictly adhere to React rules of hooks
  if (
    location.pathname.startsWith("/projects") ||
    location.pathname.startsWith("/project") ||
    location.pathname.startsWith("/dashboard")
  ) {
    return null
  }

  // Remove footer on Network page when user is logged in or signed up
  if (location.pathname.startsWith("/network") && isLoggedIn) {
    return null
  }

  const columns = [
    {
      title: "Guild",
      links: [
        { label: "About Reco Labs", href: "/about" },
        { label: "Skill Exchange", href: "/" },
        { label: "Curated Projects", href: "/projects" },
        { label: "Technical Blog ↗", href: "https://blog.recolabs.in" },
        { label: "Privacy Policy", href: "/privacy" },
      ],
    },
    {
      title: "Ecosystem",
      links: [
        { label: "Founder Network", href: "/network" },
        { label: "Hackathons & Sprints", href: "/hackathons" },
        { label: "Guild Roles & Jobs", href: "/jobs" },
        { label: "GitHub Codebases ↗", href: "https://github.com/recoorg" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Sponsor Reco Labs", href: "/sponsors" },
        { label: "Discord Guild ↗", href: "https://discord.com/invite/7dk4w37BhP" },
        { label: "Founder X (@adibxr) ↗", href: "https://x.com/adibxr" },
        { label: "Instagram (@rawenergon) ↗", href: "https://instagram.com/rawenergon" },
      ],
    },
  ]

  return (
    <footer className="relative w-full overflow-hidden bg-transparent border-t border-zinc-200 dark:border-zinc-800/80 pt-16 pb-12 font-mono">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#FA5D00]/[0.02] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top section: Brand & columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12">
          {/* Left 4 cols: Brand logo, description & actions */}
          <div className="md:col-span-4 flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
              <img
                src={isDark ? "/logo-white.png" : "/logo-black.png"}
                alt="Reco Labs Logo"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
              The Skill Exchange for curious Mind. Started as a Grade 10 project to fix daily problems, now a global open-source collective for young builders.
            </p>
            <p className="font-mono text-[11px] text-[#FA5D00] font-semibold">
              Built by hackers, for hackers. 100% open source.
            </p>
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://discord.com/invite/7dk4w37BhP"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                Join Discord
              </a>
              <a
                href="https://github.com/recoorg"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full border border-black dark:border-zinc-700 bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold hover:opacity-85 transition-opacity"
              >
                Explore GitHub
              </a>
            </div>
          </div>

          {/* Right 8 cols: Link Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 font-mono">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-100 mb-3.5">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("http") ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#FA5D00] dark:hover:text-[#FA5D00] transition-colors inline-flex items-center gap-1"
                        >
                          <span>{link.label}</span>
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#FA5D00] dark:hover:text-[#FA5D00] transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* The Man Movie Animation at Footer */}
        <div className="relative w-full h-[220px] sm:h-[260px] my-4 overflow-hidden border-t border-b border-zinc-100 dark:border-zinc-800/60">
          <CrowdCanvas className="absolute inset-0 w-full h-full pointer-events-none" id="crowd-canvas-footer" />
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-white dark:from-[#09090b] to-transparent pointer-events-none" />
        </div>

        {/* Bottom Copyright & Legal row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left font-mono text-xs text-zinc-500 dark:text-zinc-400">
          <p>© 2026 Reco Labs · Founded by Aditya &amp; Tanish · Built by curious minds worldwide.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-[#FA5D00] transition-colors underline underline-offset-2">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterWrapper
