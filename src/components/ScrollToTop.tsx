"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"

export function ScrollToTop() {
  const { pathname } = useLocation()

  React.useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
    } catch {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}
