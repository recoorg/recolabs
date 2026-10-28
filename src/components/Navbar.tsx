"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"

export function Navbar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-5 pointer-events-none">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        
        {/* Left: Raw Logo Mark without circle */}
        <Link
          to="/"
          className="pointer-events-auto flex items-center gap-2 hover:opacity-85 transition-opacity"
          aria-label="Reco Labs Home"
        >
          <img
            src="/logo-black.png"
            alt="Reco Labs Logo"
            className="h-9 sm:h-10 w-auto object-contain dark:hidden"
          />
          <img
            src="/logo-white.png"
            alt="Reco Labs Logo"
            className="h-9 sm:h-10 w-auto object-contain hidden dark:block"
          />
        </Link>

        {/* Center: Vibrant Orange Pill Navigation */}
        <nav
          className="pointer-events-auto hidden sm:flex items-center gap-6 md:gap-8 px-7 py-2 rounded-full bg-[#FA5D00] border-2 border-black text-black font-mono text-[13px] font-bold tracking-wider uppercase shadow-sm"
          aria-label="Main Navigation"
        >
          <Link
            to="/about"
            className={`transition-opacity ${isActive("/about") ? "underline underline-offset-4 decoration-2" : "hover:opacity-75"}`}
          >
            ABOUT
          </Link>
          <Link
            to="/jobs"
            className={`transition-opacity ${isActive("/jobs") ? "underline underline-offset-4 decoration-2" : "hover:opacity-75"}`}
          >
            JOBS
          </Link>
          <Link
            to="/projects"
            className={`transition-opacity ${isActive("/projects") || isActive("/project") ? "underline underline-offset-4 decoration-2" : "hover:opacity-75"}`}
          >
            PROJECTS
          </Link>
          <Link
            to="/hackathons"
            className={`transition-opacity ${isActive("/hackathons") || isActive("/hackathon") ? "underline underline-offset-4 decoration-2" : "hover:opacity-75"}`}
          >
            HACKATHONS
          </Link>
        </nav>

        {/* Right: Discord Pill Button */}
        <a
          href="https://discord.com/invite/7dk4w37BhP"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto px-5 py-2 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-95 flex items-center justify-center"
        >
          Discord
        </a>

      </div>

      {/* Mobile nav bar below for small screens */}
      <div className="sm:hidden mt-3 mx-auto flex items-center justify-center pointer-events-auto">
        <nav className="flex items-center gap-5 px-6 py-2 rounded-full bg-[#FA5D00] border-[1.5px] border-black text-black font-mono text-[11px] font-bold tracking-wider uppercase shadow-sm">
          <Link to="/about">ABOUT</Link>
          <Link to="/jobs">JOBS</Link>
          <Link to="/projects">PROJECTS</Link>
          <Link to="/hackathons">HACKS</Link>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
