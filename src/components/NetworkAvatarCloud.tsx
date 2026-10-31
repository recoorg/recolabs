"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"

export interface RealUser {
  id: number
  name: string
  username: string
  avatar_url?: string | null
  bio?: string | null
  created_at?: string
}

interface NetworkAvatarCloudProps {
  realUsers?: RealUser[]
  onSelectUsername?: (username: string) => void
}

export function NetworkAvatarCloud({ realUsers = [], onSelectUsername }: NetworkAvatarCloudProps) {
  const navigate = useNavigate()
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  // Filter out any entries without a valid username
  const validUsers = React.useMemo(() => {
    return (realUsers || []).filter((u) => u && u.username)
  }, [realUsers])

  if (validUsers.length === 0) {
    return null
  }

  const handleAvatarClick = (username: string) => {
    if (onSelectUsername) {
      onSelectUsername(username)
    } else {
      navigate(`/builder/${username}`)
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto py-4 flex items-center justify-center select-none">
      <div className="flex flex-wrap items-center justify-center -space-x-2.5 sm:-space-x-3.5 hover:space-x-1 sm:hover:space-x-1.5 transition-all duration-300 p-2">
        {validUsers.map((user, idx) => {
          const isHovered = hoveredIndex === idx
          const displayName = user.name || user.username
          const initial = (displayName[0] || "B").toUpperCase()

          return (
            <div
              key={user.id || user.username || idx}
              className="relative flex-none transition-transform duration-200"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <button
                onClick={() => handleAvatarClick(user.username)}
                title={`${displayName} (@${user.username})`}
                className={`relative block rounded-full transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? "scale-125 z-40 shadow-2xl ring-2 ring-[#FA5D00]"
                    : "hover:scale-115 z-10 opacity-95 hover:opacity-100"
                }`}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={displayName}
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to monogram if external image fails
                      e.currentTarget.style.display = "none"
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"
                      }
                    }}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 shadow-md"
                  />
                ) : null}

                {/* Monogram fallback if no avatar_url or on error */}
                <div
                  style={{ display: user.avatar_url ? "none" : "flex" }}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#FA5D00] to-amber-400 text-black font-mono font-bold text-sm sm:text-base items-center justify-center border-2 border-white dark:border-zinc-900 shadow-md"
                >
                  {initial}
                </div>

                {/* Verified online dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
              </button>

              {/* Hover Tooltip Popup (Matching Image 2 style) */}
              {isHovered && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-sans text-xs font-semibold whitespace-nowrap shadow-2xl border border-zinc-800 dark:border-zinc-200 flex items-center gap-2">
                    <span>{displayName}</span>
                    <span className="text-[11px] opacity-70 font-mono text-[#FA5D00]">
                      @{user.username}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default NetworkAvatarCloud
