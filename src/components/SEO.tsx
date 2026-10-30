"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
}

const DEFAULT_TITLE = "Reco Labs · The Skill Exchange for Curious Minds"
const DEFAULT_DESC =
  "A collective of young hackers, builders, and makers shipping high-impact software, hardware, and open tools. Started as a Grade 10 experiment, now an open global guild."
const BASE_URL = "https://recolabs.in"
const DEFAULT_OG_IMAGE = "https://recolabs.in/twitter-image.png"

export function SEO({ title, description, canonical, ogImage }: SEOProps) {
  const location = useLocation()

  React.useEffect(() => {
    // 1. Title
    const fullTitle = title
      ? title.includes("Reco Labs")
        ? title
        : `${title} · Reco Labs`
      : DEFAULT_TITLE
    document.title = fullTitle

    // 2. Meta description
    const metaDesc = description || DEFAULT_DESC
    let descTag = document.querySelector('meta[name="description"]')
    if (!descTag) {
      descTag = document.createElement("meta")
      descTag.setAttribute("name", "description")
      document.head.appendChild(descTag)
    }
    descTag.setAttribute("content", metaDesc)

    // 3. Canonical URL
    const canonUrl = canonical || `${BASE_URL}${location.pathname}`
    let canonTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonTag) {
      canonTag = document.createElement("link")
      canonTag.setAttribute("rel", "canonical")
      document.head.appendChild(canonTag)
    }
    canonTag.setAttribute("href", canonUrl)

    // 4. OpenGraph tags
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`)
      if (!el) {
        el = document.createElement("meta")
        el.setAttribute("property", property)
        document.head.appendChild(el)
      }
      el.setAttribute("content", content)
    }

    setMeta("og:title", fullTitle)
    setMeta("og:description", metaDesc)
    setMeta("og:url", canonUrl)
    setMeta("og:image", ogImage || DEFAULT_OG_IMAGE)

    // 5. Twitter tags
    const setTwitterMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`)
      if (!el) {
        el = document.createElement("meta")
        el.setAttribute("name", name)
        document.head.appendChild(el)
      }
      el.setAttribute("content", content)
    }

    setTwitterMeta("twitter:title", fullTitle)
    setTwitterMeta("twitter:description", metaDesc)
    setTwitterMeta("twitter:image", ogImage || DEFAULT_OG_IMAGE)
  }, [title, description, canonical, ogImage, location.pathname])

  return null
}
