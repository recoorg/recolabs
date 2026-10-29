"use client"

import * as React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { FooterWrapper } from "@/components/FooterWrapper"
import { ScrollToTop } from "@/components/ScrollToTop"
import { HomePage } from "@/pages/HomePage"
import { AboutPage } from "@/pages/AboutPage"
import { JobsPage } from "@/pages/JobsPage"
import { ProjectsPage } from "@/pages/ProjectsPage"
import { HackathonsPage } from "@/pages/HackathonsPage"
import { SponsorsPage } from "@/pages/SponsorsPage"
import { NetworkPage } from "@/pages/NetworkPage"
import { BuilderProfilePage } from "@/pages/BuilderProfilePage"
import { NotFoundPage } from "@/pages/NotFoundPage"

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="relative min-h-screen w-full bg-white dark:bg-[#09090b] font-sans selection:bg-[#FA5D00] selection:text-white flex flex-col justify-between">
        {/* Floating Pill Navigation */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <main className="w-full flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/project" element={<ProjectsPage />} />
            <Route path="/hackathons" element={<HackathonsPage />} />
            <Route path="/hackathon" element={<HackathonsPage />} />
            <Route path="/sponsors" element={<SponsorsPage />} />
            <Route path="/sponsor" element={<SponsorsPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/builder/:username" element={<BuilderProfilePage />} />
            <Route path="/builders/:username" element={<BuilderProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Torn Poster Pushpin Footer on Every Page */}
        <FooterWrapper />
      </div>
    </BrowserRouter>
  )
}

export default App
