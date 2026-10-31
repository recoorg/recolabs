"use client"

import * as React from "react"
import DoodleCrewFooter from "@/components/ui/doodle-crew-footer"
import { SponsorSection } from "@/components/SponsorSection"

export function FooterWrapper() {
  const [isDark, setIsDark] = React.useState(false)

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

  return (
    <>
      <SponsorSection />
      <footer className="relative w-full overflow-hidden bg-transparent">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#FA5D00]/[0.02] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
        </div>
        <DoodleCrewFooter
        wordmark="RECOLABS"
        brand="reco labs"
        blurb="The Skill Exchange for curious Mind. Started as a Grade 10 project to fix daily problems, now a global open-source collective for young builders."
        tagline="Built by hackers, for hackers. 100% open source."
        logo={
          <div className="flex items-center justify-center h-8 w-auto">
            <img
              src={isDark ? "/logo-white.png" : "/logo-black.png"}
              alt="Reco Labs Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
        }
        actions={[
          {
            label: "Join Discord",
            href: "https://discord.com/invite/7dk4w37BhP",
            icon: "bolt",
            variant: "solid",
          },
          {
            label: "Explore GitHub",
            href: "https://github.com/recoorg",
            icon: "flame",
            variant: "outline",
          },
        ]}
        columns={[
          {
            title: "Guild",
            links: [
              { label: "About Reco Labs", href: "/about" },
              { label: "Skill Exchange", href: "/" },
              { label: "Curated Projects", href: "/projects" },
              { label: "Technical Blog ↗", href: "https://blog.recolabs.in" },
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
        ]}
        copyright="© 2026 Reco Labs · Founded by Aditya & Tanish · Built by curious minds worldwide."
        legal={[
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Blog ↗", href: "https://blog.recolabs.in" },
          { label: "Sponsors & Partners", href: "/sponsors" },
        ]}
        palette={
          isDark
            ? {
                background: "#09090b",
                ink: "#fafafa",
                accent: "#FA5D00",
              }
            : {
                background: "#ffffff",
                ink: "#09090b",
                accent: "#FA5D00",
              }
        }
        serifFamily="'Geist Mono', monospace"
        fontFamily="'Geist Mono', monospace"
        doodles={["flame", "star", "bolt", "sandwich", "heart", "plane"]}
        doodleCount={12}
        interactive={true}
        backToTop={false}
      />
      </footer>
    </>
  )
}

export default FooterWrapper
