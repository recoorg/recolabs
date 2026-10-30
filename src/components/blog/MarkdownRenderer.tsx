import * as React from "react"
import { marked } from "marked"
import { Check, Copy, ExternalLink, Info, AlertTriangle, AlertCircle, Lightbulb, ShieldAlert } from "lucide-react"

interface MarkdownRendererProps {
  content: string
  className?: string
  onHeadingsExtracted?: (headings: { id: string; text: string; level: number }[]) => void
  onSectionsExtracted?: (sections: { id: string; title: string; snippet: string; level: number }[]) => void
}

export function MarkdownRenderer({ content, className = "", onHeadingsExtracted, onSectionsExtracted }: MarkdownRendererProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)

  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  // Process markdown into HTML with custom enhancements
  const renderedHtml = React.useMemo(() => {
    if (!content) return ""

    // 1. Convert GitHub alert blockquotes
    let processed = content
      .replace(
        />\s*\[!NOTE\]\s*([\s\S]*?)(?=(?:\r?\n\r?\n|$))/g,
        '<div class="reco-alert reco-alert-note"><div class="reco-alert-header"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span>NOTE</span></div><div class="reco-alert-content">$1</div></div>'
      )
      .replace(
        />\s*\[!TIP\]\s*([\s\S]*?)(?=(?:\r?\n\r?\n|$))/g,
        '<div class="reco-alert reco-alert-tip"><div class="reco-alert-header"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"/></svg><span>PRO TIP</span></div><div class="reco-alert-content">$1</div></div>'
      )
      .replace(
        />\s*\[!IMPORTANT\]\s*([\s\S]*?)(?=(?:\r?\n\r?\n|$))/g,
        '<div class="reco-alert reco-alert-important"><div class="reco-alert-header"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>IMPORTANT</span></div><div class="reco-alert-content">$1</div></div>'
      )
      .replace(
        />\s*\[!WARNING\]\s*([\s\S]*?)(?=(?:\r?\n\r?\n|$))/g,
        '<div class="reco-alert reco-alert-warning"><div class="reco-alert-header"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>WARNING</span></div><div class="reco-alert-content">$1</div></div>'
      )
      .replace(
        />\s*\[!CAUTION\]\s*([\s\S]*?)(?=(?:\r?\n\r?\n|$))/g,
        '<div class="reco-alert reco-alert-caution"><div class="reco-alert-header"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>CAUTION</span></div><div class="reco-alert-content">$1</div></div>'
      )

    // Render marked HTML (allows custom HTML and <style> tags to pass through)
    return marked.parse(processed) as string
  }, [content])

  // Extract headings for Table of Contents & attach interactive copy buttons to code blocks
  React.useEffect(() => {
    if (!containerRef.current) return

    const el = containerRef.current

    // Extract headings
    const headingElements = el.querySelectorAll("h1, h2, h3")
    const headings: { id: string; text: string; level: number }[] = []
    const sections: { id: string; title: string; snippet: string; level: number }[] = []

    headingElements.forEach((heading, idx) => {
      const text = heading.textContent || ""
      const slug =
        heading.id ||
        text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-") ||
        `heading-${idx}`

      heading.id = slug
      const level = parseInt(heading.tagName.replace("H", ""), 10)
      headings.push({ id: slug, text, level })

      // Find following paragraph snippet for right-side preview dots
      let snippet = ""
      let sibling = heading.nextElementSibling
      while (sibling && !["H1", "H2", "H3"].includes(sibling.tagName)) {
        if (sibling.tagName === "P" && sibling.textContent) {
          snippet = sibling.textContent.trim().slice(0, 150)
          break
        }
        sibling = sibling.nextElementSibling
      }

      sections.push({
        id: slug,
        title: text,
        snippet,
        level,
      })
    })

    if (onHeadingsExtracted) {
      onHeadingsExtracted(headings)
    }

    if (onSectionsExtracted) {
      onSectionsExtracted(sections)
    }

    // Attach copy buttons to <pre><code> blocks
    const preBlocks = el.querySelectorAll("pre")
    preBlocks.forEach((pre, index) => {
      if (pre.querySelector(".reco-copy-code-btn")) return

      // Wrap pre with container
      const wrapper = document.createElement("div")
      wrapper.className = "reco-code-wrapper relative group my-6 rounded-xl overflow-hidden border border-zinc-800 bg-[#09090b]"
      pre.parentNode?.insertBefore(wrapper, pre)
      wrapper.appendChild(pre)

      // Find code language
      const code = pre.querySelector("code")
      let lang = "TEXT"
      if (code) {
        const langClass = Array.from(code.classList).find((c) => c.startsWith("language-"))
        if (langClass) {
          lang = langClass.replace("language-", "").toUpperCase()
        }
      }

      // Create Header Bar
      const headerBar = document.createElement("div")
      headerBar.className =
        "flex items-center justify-between px-4 py-2 border-b border-zinc-800/80 bg-zinc-950/80 font-mono text-[11px] text-zinc-400 select-none"
      headerBar.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#FA5D00]/80"></span>
          <span class="font-bold text-zinc-300 tracking-wider">${lang}</span>
        </div>
      `

      // Copy Button
      const copyBtn = document.createElement("button")
      copyBtn.className =
        "reco-copy-code-btn flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-[11px] font-mono transition-colors active:scale-95"
      copyBtn.innerHTML = `<span>Copy</span>`
      copyBtn.onclick = () => {
        const textToCopy = code?.innerText || pre.innerText
        navigator.clipboard.writeText(textToCopy)
        copyBtn.innerHTML = `<span style="color:#10B981;">Copied!</span>`
        setTimeout(() => {
          copyBtn.innerHTML = `<span>Copy</span>`
        }, 2000)
      }

      headerBar.appendChild(copyBtn)
      wrapper.insertBefore(headerBar, pre)
    })
  }, [renderedHtml, onHeadingsExtracted])

  return (
    <div
      ref={containerRef}
      className={`reco-prose ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  )
}
