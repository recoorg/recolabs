import * as React from "react"
import { trackEvent } from "@/lib/analytics"

export interface SectionRailItem {
  id: string
  title: string
  snippet: string
  level: number
}

interface RightScrollRailProps {
  sections: SectionRailItem[]
}

export function RightScrollRail({ sections }: RightScrollRailProps) {
  const [activeId, setActiveId] = React.useState<string>("")
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  // Scroll Spy: observe headings
  React.useEffect(() => {
    if (sections.length === 0) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      let currentId = sections[0].id
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el) {
          const top = el.offsetTop
          if (scrollPosition >= top) {
            currentId = section.id
          }
        }
      }
      setActiveId(currentId)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [sections])

  if (sections.length === 0) return null

  const handleDotClick = (id: string) => {
    trackEvent("rail_section_jump", { section_id: id })
    const el = document.getElementById(id)
    if (el) {
      const offset = 90
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <aside
      className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3 py-4 px-2 rounded-full bg-black/85 dark:bg-[#121215]/90 border border-zinc-800 shadow-2xl backdrop-blur-md select-none"
      aria-label="Section Navigation Rail"
    >
      {sections.map((section, idx) => {
        const isActive = activeId === section.id
        const isHovered = hoveredIndex === idx

        return (
          <div
            key={section.id || idx}
            className="relative flex items-center justify-center group"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* The Dot (Matches the user's uploaded vertical dot design) */}
            <button
              onClick={() => handleDotClick(section.id)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                isActive
                  ? "w-3 h-3 bg-[#FA5D00] shadow-[0_0_10px_#FA5D00] scale-110"
                  : "w-2.5 h-2.5 bg-zinc-600/80 hover:bg-zinc-400 hover:scale-125"
              }`}
              aria-label={`Jump to ${section.title}`}
            />

            {/* Hover Tooltip / Preview Card showing h1/h2 title and <p> snippet */}
            {isHovered && (
              <div className="absolute right-7 top-1/2 -translate-y-1/2 w-64 p-3.5 rounded-xl bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                <div className="font-mono text-[10px] text-[#FA5D00] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>SECTION 0{idx + 1}</span>
                  {isActive && <span className="text-[#10B981]">&bull; ACTIVE</span>}
                </div>
                
                {/* Heading (h1/h2) */}
                <h4 className="font-serif text-sm font-bold text-zinc-950 dark:text-white leading-snug line-clamp-2 mb-1.5">
                  {section.title}
                </h4>

                {/* Paragraph Preview (<p>) */}
                {section.snippet ? (
                  <p className="font-sans text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {section.snippet}
                  </p>
                ) : (
                  <p className="font-mono text-[10px] text-zinc-400 italic">
                    Click dot to jump to this section
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </aside>
  )
}
