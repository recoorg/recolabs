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
      <footer className="relative w-full overflow-hidden border-t editorial-hairline bg-white dark:bg-[#09090b]">
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
              { label: "Read Founders Story", href: "/about" },
              { label: "The Skill Exchange", href: "/" },
              { label: "Grade 10 Origins", href: "/about" },
              { label: "Beginner Roadmaps", href: "/about" },
            ],
          },
          {
            title: "Codebases",
            links: [
              { label: "recolabs (Flagship)", href: "https://github.com/recoorg/recolabs" },
              { label: "Hardware Workbench", href: "/projects" },
              { label: "Hacker Toolkit", href: "/projects" },
              { label: "All Repositories", href: "https://github.com/recoorg" },
            ],
          },
          {
            title: "Participate",
            links: [
              { label: "Hackathons & Sprints", href: "/hackathons" },
              { label: "Guild Roles & Jobs", href: "/jobs" },
              { label: "Open Bounties", href: "/hackathons" },
              { label: "Discord Build Calls", href: "https://discord.com/invite/7dk4w37BhP" },
            ],
          },
          {
            title: "Network",
            links: [
              { label: "Discord Guild", href: "https://discord.com/invite/7dk4w37BhP" },
              { label: "Instagram (@rawenergon)", href: "https://instagram.com/rawenergon" },
              { label: "X (@adibxr)", href: "https://x.com/adibxr" },
              { label: "GitHub (@recoorg)", href: "https://github.com/recoorg" },
            ],
          },
        ]}
        copyright="© 2026 Reco Labs · Founded by Aditya · Built by curious minds worldwide."
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
        serifFamily="'Instrument Serif', Georgia, serif"
        fontFamily="'Geist Mono', monospace"
        doodles={["flame", "star", "bolt", "sparkle", "sandwich", "heart", "plane"]}
        doodleCount={14}
        interactive={true}
        backToTop={false}
      />
      </footer>
    </>
  )
}

export default FooterWrapper
