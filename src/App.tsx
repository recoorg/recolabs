"use client"

import * as React from "react"
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"
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
import { PrivacyPage } from "@/pages/PrivacyPage"
import { NotFoundPage } from "@/pages/NotFoundPage"

// Blog module
import { BlogHomePage } from "@/pages/blog/BlogHomePage"
import { BlogPostPage } from "@/pages/blog/BlogPostPage"
import { BlogDashboardPage } from "@/pages/blog/BlogDashboardPage"
import { BlogWritePage } from "@/pages/blog/BlogWritePage"

import { networkApi } from "@/services/networkApi"
import { initAnalytics } from "@/lib/analytics"

// Listens to OAuth callback hash (#access_token=...) globally across all pages
function GlobalOAuthListener() {
  const navigate = useNavigate()
  const location = useLocation()

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const hasAccessToken =
      (window.location.hash && window.location.hash.includes("access_token")) ||
      (window.location.search && window.location.search.includes("access_token"))

    if (hasAccessToken) {
      networkApi.handleOAuthCallback().then((res) => {
        if (res?.user) {
          window.dispatchEvent(new Event("reco_auth_changed"))
          // If on home or root, redirect to network to show active session
          if (location.pathname === "/" || location.pathname === "") {
            navigate("/network")
          }
        }
      })
    }
  }, [navigate, location.pathname])

  return null
}

export function App() {
  React.useEffect(() => {
    // Exactly one browser-side analytics client after document is available
    initAnalytics()
  }, [])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <GlobalOAuthListener />
      <div className="relative min-h-screen w-full bg-white dark:bg-[#09090b] font-sans selection:bg-[#FA5D00] selection:text-white flex flex-col justify-between">
        {/* Floating Pill Navigation */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <main className="w-full flex-grow">
          <Routes>
            {/* Core Reco Labs Routes */}
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
            
            {/* Privacy Policy (with typo alias /privary) */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/privary" element={<PrivacyPage />} />

            {/* Reco Labs Blog & Technical Dispatch */}
            <Route path="/blog" element={<BlogHomePage />} />
            <Route path="/blog/dashboard" element={<BlogDashboardPage />} />
            <Route path="/dashboard" element={<BlogDashboardPage />} />
            <Route path="/blog/write" element={<BlogWritePage />} />
            <Route path="/blog/write/:slug" element={<BlogWritePage />} />
            <Route path="/write" element={<BlogWritePage />} />
            <Route path="/write/:slug" element={<BlogWritePage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/blog/post/:slug" element={<BlogPostPage />} />
            <Route path="/post/:slug" element={<BlogPostPage />} />

            {/* Fallback 404 */}
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
