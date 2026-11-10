"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { CrowdCanvas } from "@/components/CrowdCanvas"
import { networkApi } from "@/services/networkApi"
import { GithubIcon, DiscordIcon, TwitterIcon, WhatsAppIcon } from "@/components/icons"

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
        { label: "Android APK App ↘", href: "/download/recolabs.apk" },
        { label: "GitHub Codebases ↗", href: "https://github.com/recoorg" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Sponsor Reco Labs", href: "/sponsors" },
        { label: "WhatsApp Guild ↗", href: "https://chat.whatsapp.com/IApnk6YLM0l2j1nwcVzRR5" },
        { label: "Discord Guild ↗", href: "https://discord.com/invite/7dk4w37BhP" },
        { label: "Founder X (@adibxr) ↗", href: "https://x.com/adibxr" },
        { label: "Instagram (@rawenergon) ↗", href: "https://instagram.com/rawenergon" },
      ],
    },
  ]

  return (
    <footer className="relative w-full overflow-hidden bg-transparent pt-16 pb-12 font-mono">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#FA5D00]/[0.02] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top section: Brand & columns - clean centered container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-8">
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
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href="https://chat.whatsapp.com/IApnk6YLM0l2j1nwcVzRR5"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-mono text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4 fill-black" />
                <span>WhatsApp</span>
              </a>
              <a
                href="https://discord.com/invite/7dk4w37BhP"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <DiscordIcon className="w-4 h-4" />
                <span>Discord</span>
              </a>
              <a
                href="https://github.com/recoorg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black dark:border-zinc-700 bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold hover:opacity-85 transition-opacity"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Right 8 cols: Link Columns in Geist Mono */}
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
      </div>

      {/* The Man Movie Animation at Footer - Expanded edge-to-edge across full viewport width, NOT in a box */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] lg:h-[500px] my-4 overflow-hidden pointer-events-none select-none">
        <CrowdCanvas className="w-full h-full" id="crowd-canvas-footer" />
        {/* Soft atmospheric gradient fades so it dissolves smoothly into the page canvas */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white dark:from-[#09090b] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white dark:from-[#09090b] to-transparent pointer-events-none" />
      </div>

      {/* Bottom Copyright & Legal row with Social Icons */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-mono text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60 pt-6">
          <p>© 2026 Reco Labs · Founded by Aditya &amp; Tanish · Built by curious minds worldwide.</p>
          <div className="flex items-center gap-3">
            <a
              href="https://discord.com/invite/7dk4w37BhP"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-[#5865F2] hover:text-white text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-all shadow-2xs"
              title="Discord Guild"
            >
              <DiscordIcon className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/recoorg"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-all shadow-2xs"
              title="GitHub Repositories"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/adibxr"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-all shadow-2xs"
              title="Founder X"
            >
              <TwitterIcon className="w-3.5 h-3.5" />
            </a>
            <Link to="/privacy" className="hover:text-[#FA5D00] transition-colors underline underline-offset-2 ml-2">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterWrapper
