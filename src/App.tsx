"use client"

import * as React from "react"
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { FooterWrapper } from "@/components/FooterWrapper"
import { ScrollToTop } from "@/components/ScrollToTop"
import { ErrorBoundary } from "@/components/ErrorBoundary"
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
import { DashboardPage } from "@/pages/DashboardPage"
import { PricingUpgradePage } from "@/pages/PricingUpgradePage"
import { networkApi } from "@/services/networkApi"

function GlobalOAuthListener() {
  const navigate = useNavigate()

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const hasAccessToken =
      (window.location.hash && window.location.hash.includes("access_token")) ||
      (window.location.search && window.location.search.includes("access_token"))

    if (hasAccessToken) {
      networkApi.handleOAuthCallback().then((res) => {
        if (res?.user) {
          window.dispatchEvent(new Event("reco_auth_changed"))
          
          // Check if user came from Launchpad or external origin
          const searchParams = new URLSearchParams(window.location.search)
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
          const returnTo = searchParams.get("return_to") || hashParams.get("return_to") || localStorage.getItem("reco_return_to")
          
          if (returnTo) {
            localStorage.removeItem("reco_return_to")
            const token = networkApi.getToken()
            try {
              const targetUrl = new URL(returnTo)
              if (token) targetUrl.searchParams.set("sso_token", token)
              window.location.href = targetUrl.toString()
              return
            } catch {
              window.location.href = returnTo
              return
            }
          }

          if (window.location.pathname === "/" || window.location.pathname === "") {
            navigate("/network")
          }
        }
      })
    }
  }, [navigate])

  return null
}

function AppContent() {
  const location = useLocation()
  const isProjects = location.pathname.startsWith("/projects") || location.pathname.startsWith("/project")

  return (
    <div
      className={`relative w-full font-sans selection:bg-[#FA5D00] selection:text-white bg-white dark:bg-[#09090b] ${
        isProjects ? "h-screen overflow-hidden flex flex-col" : "min-h-screen flex flex-col justify-between"
      }`}
    >
      {/* Floating Pill Navigation (Hidden automatically on /projects) */}
      <Navbar />

      {/* Dynamic Route Pages with Strict Flex Constraint */}
      <main className={`w-full ${isProjects ? "flex-1 min-h-0 flex flex-col overflow-hidden" : "flex-grow"}`}>
        <ErrorBoundary key={location.pathname}>
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pricing" element={<PricingUpgradePage />} />
            <Route path="/upgrade" element={<PricingUpgradePage />} />
            <Route path="/payment" element={<PricingUpgradePage />} />
            <Route path="/builder/:username" element={<BuilderProfilePage />} />
            <Route path="/builders/:username" element={<BuilderProfilePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/privary" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Torn Poster Pushpin Footer on Every Page (Hidden automatically on /projects) */}
      <FooterWrapper />
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <GlobalOAuthListener />
      <AppContent />
    </BrowserRouter>
  )
}

export default App
