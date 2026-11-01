import * as React from "react"
import { useLocation } from "react-router-dom"

export interface PageMetaOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: "website" | "profile" | "article"
}

const DEFAULT_TITLE = "Reco Labs"
const DEFAULT_DESC =
  "The Skill Exchange for curious Mind. A global collective of young hackers, builders, and makers shipping high-impact software, hardware rigs, and tutorials."
const DEFAULT_IMAGE = "https://recolabs.in/twitter-image.png"
const BASE_ORIGIN = "https://recolabs.in"

function setOrCreateMeta(selector: string, attrName: string, attrVal: string, content: string) {
  if (typeof document === "undefined") return
  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attrName, attrVal)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

function setOrCreateLink(rel: string, href: string) {
  if (typeof document === "undefined") return
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", rel)
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

export function usePageMeta(options: PageMetaOptions = {}) {
  const location = useLocation()

  React.useEffect(() => {
    if (typeof document === "undefined") return

    const title = options.title || DEFAULT_TITLE
    const description = options.description || DEFAULT_DESC
    let image = options.image || DEFAULT_IMAGE

    // Ensure absolute image URL for Twitter / Open Graph crawlers
    if (image.startsWith("/")) {
      image = `${BASE_ORIGIN}${image}`
    }

    const currentUrl = options.url || `${BASE_ORIGIN}${location.pathname}`
    const pageType = options.type || "website"

    // 1. Browser tab title
    document.title = title

    // 2. Standard Meta
    setOrCreateMeta('meta[name="description"]', "name", "description", description)
    setOrCreateMeta('meta[name="title"]', "name", "title", title)

    // 3. Open Graph
    setOrCreateMeta('meta[property="og:title"]', "property", "og:title", title)
    setOrCreateMeta('meta[property="og:description"]', "property", "og:description", description)
    setOrCreateMeta('meta[property="og:image"]', "property", "og:image", image)
    setOrCreateMeta('meta[property="og:image:secure_url"]', "property", "og:image:secure_url", image)
    setOrCreateMeta('meta[property="og:image:type"]', "property", "og:image:type", "image/png")
    setOrCreateMeta('meta[property="og:image:width"]', "property", "og:image:width", "1200")
    setOrCreateMeta('meta[property="og:image:height"]', "property", "og:image:height", "900")
    setOrCreateMeta('meta[property="og:url"]', "property", "og:url", currentUrl)
    setOrCreateMeta('meta[property="og:type"]', "property", "og:type", pageType)

    // 4. Twitter / X Card
    setOrCreateMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image")
    setOrCreateMeta('meta[name="twitter:title"]', "name", "twitter:title", title)
    setOrCreateMeta('meta[name="twitter:description"]', "name", "twitter:description", description)
    setOrCreateMeta('meta[name="twitter:image"]', "name", "twitter:image", image)

    // 5. Canonical
    setOrCreateLink("canonical", currentUrl)
  }, [options.title, options.description, options.image, options.url, options.type, location.pathname])
}
