"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"

export interface CloudBuilder {
  name: string
  username: string
  avatar: string
  role: string
  badge?: string
}

// 42 Community builders matching the visual layout of Image 2
export const SEED_BUILDERS: CloudBuilder[] = [
  // ROW 1 (10 builders)
  { name: "Aditya Raj", username: "rawenergon", avatar: "https://lh3.googleusercontent.com/a/ACg8ocIz5Xn5RQv1Tsxz198mMviUhkiVqiC2_xQ5w1Y0PYXOAXAxfSQ_=s96-c", role: "Founder @ RECO LABS", badge: "RL" },
  { name: "Tanish", username: "fluxstudio", avatar: "https://lh3.googleusercontent.com/a/ACg8ocJZZHCQrIp1P6Sq0D3oKGyGWb4Z_Oqj7C2zPdK8DrwJDPmXVw=s96-c", role: "Founder @ Shafire", badge: "SC" },
  { name: "Maksym Solomkin", username: "makssolomkin", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", role: "Kernel Hacker" },
  { name: "Akshay Kant", username: "kantakshay", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", role: "Cloud Systems" },
  { name: "Elena Rostova", username: "erostova", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", role: "Firmware Eng" },
  { name: "Devin Patel", username: "devinp", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", role: "AF_XDP Stack" },
  { name: "Sofia Chen", username: "sofiac", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", role: "AI Security" },
  { name: "Marcus Vance", username: "marcusv", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80", role: "Compiler Dev" },
  { name: "Priya Sharma", username: "priyas", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", role: "Robotics Lead" },
  { name: "David Kim", username: "davidk", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80", role: "Zero-Day Research" },

  // ROW 2 (11 builders)
  { name: "Lucas Meyer", username: "lucasm", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", role: "Embedded Systems" },
  { name: "Amina Diallo", username: "aminad", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", role: "Hardware Rig" },
  { name: "Nikita Volkov", username: "nvolkov", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80", role: "Reverse Engineering" },
  { name: "Chloe Dubois", username: "chloed", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80", role: "Graphics Engine" },
  { name: "Arjun Mehta", username: "arjunm", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80", role: "Web3 Security" },
  { name: "Hanna Lind", username: "hannal", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", role: "Autonomous Flight" },
  { name: "James Wilson", username: "jwilson", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&q=80", role: "FPGA Architect" },
  { name: "Yuki Tanaka", username: "yukit", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", role: "Low-Latency C++" },
  { name: "Zack Miller", username: "zackm", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80", role: "Microkernel OS" },
  { name: "Rachel Green", username: "rachelg", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", role: "Applied Crypto" },
  { name: "Leo Rossi", username: "leorossi", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", role: "Distributed Systems" },

  // ROW 3 (11 builders)
  { name: "Farhan Ali", username: "farhana", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", role: "Network Telemetry" },
  { name: "Sara Novak", username: "saran", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", role: "Protocol Eng" },
  { name: "Kevin Zhang", username: "kevinz", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80", role: "Chip Emulation" },
  { name: "Olga Petrov", username: "olgap", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", role: "Neural Net Quant" },
  { name: "Ben Taylor", username: "bent", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", role: "Bootloader Rig" },
  { name: "Ananya Sen", username: "ananyas", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80", role: "Security Tooling" },
  { name: "Julian Gray", username: "juliang", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80", role: "Physical Security" },
  { name: "Mia Wong", username: "miaw", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", role: "PCB Layout" },
  { name: "Tom Becker", username: "tomb", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80", role: "Kernel Bypass" },
  { name: "Ingrid Berg", username: "ingridb", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", role: "High-Freq Data" },
  { name: "Omar Hassan", username: "omarh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", role: "Autonomous Rovers" },

  // ROW 4 (10 builders)
  { name: "Vera Cruz", username: "verac", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", role: "Satellite Comms" },
  { name: "Liam O'Connor", username: "liamo", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", role: "Static Analysis" },
  { name: "Nadia Rossi", username: "nadiar", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", role: "Hypervisor Dev" },
  { name: "Sean Campbell", username: "seanc", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80", role: "ASIC Verification" },
  { name: "Tara Morales", username: "taram", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", role: "Memory Forensics" },
  { name: "Vikram Rao", username: "vikramr", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80", role: "Linux Drivers" },
  { name: "Samira Khan", username: "samirak", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", role: "Quantum Alg" },
  { name: "Felix Vogel", username: "felixv", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", role: "RISC-V Core" },
  { name: "Zoe Martin", username: "zoem", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80", role: "Radio SDR" },
  { name: "Carlos Silva", username: "carloss", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80", role: "RTOS Dev" },
]

interface NetworkAvatarCloudProps {
  realUsers?: any[]
  onSelectUsername?: (username: string) => void
}

export function NetworkAvatarCloud({ realUsers = [], onSelectUsername }: NetworkAvatarCloudProps) {
  const navigate = useNavigate()
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  // Merge real database users into front of cloud
  const builders = React.useMemo(() => {
    const list = [...SEED_BUILDERS]
    if (realUsers && realUsers.length > 0) {
      realUsers.forEach((u, i) => {
        if (u.username) {
          list[i] = {
            name: u.name || u.username,
            username: u.username,
            avatar: u.avatar_url || list[i].avatar,
            role: "Registered Founder",
            badge: (u.name || "B")[0].toUpperCase(),
          }
        }
      })
    }
    return list
  }, [realUsers])

  // Split into 4 rows just like the Peerlist design
  const row1 = builders.slice(0, 10)
  const row2 = builders.slice(10, 21)
  const row3 = builders.slice(21, 32)
  const row4 = builders.slice(32, 42)

  const handleAvatarClick = (b: CloudBuilder) => {
    if (onSelectUsername) {
      onSelectUsername(b.username)
    } else {
      navigate(`/builder/${b.username}`)
    }
  }

  const renderRow = (rowItems: CloudBuilder[], offsetStart: number) => (
    <div className="flex items-center justify-center -space-x-1 sm:-space-x-1.5 md:gap-1.5 md:space-x-0">
      {rowItems.map((b, idx) => {
        const globalIdx = offsetStart + idx
        const isHovered = hoveredIndex === globalIdx

        return (
          <div
            key={b.username + globalIdx}
            className="relative flex-none"
            onMouseEnter={() => setHoveredIndex(globalIdx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <button
              onClick={() => handleAvatarClick(b)}
              title={`${b.name} (@${b.username})`}
              className={`relative block rounded-full transition-all duration-200 cursor-pointer ${
                isHovered
                  ? "scale-125 z-40 shadow-2xl ring-2 ring-[#FA5D00]"
                  : "hover:scale-110 z-10 opacity-90 hover:opacity-100"
              }`}
            >
              <img
                src={b.avatar}
                alt={b.name}
                loading="lazy"
                onError={(e) => {
                  // Fallback to stylized SVG placeholder if external image fails
                  const target = e.currentTarget
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=FA5D00&color=000`
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-full object-cover border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 shadow-sm"
              />
            </button>

            {/* Hover Tooltip Popup (Matching Image 2) */}
            {isHovered && (
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-sans text-xs font-semibold whitespace-nowrap shadow-2xl border border-zinc-800 dark:border-zinc-200 flex items-center gap-1.5">
                  <span>{b.name}</span>
                  <span className="text-[10px] opacity-60 font-mono">@{b.username}</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="relative w-full max-w-4xl mx-auto py-6 flex flex-col items-center gap-2 sm:gap-2.5 select-none overflow-x-hidden">
      {renderRow(row1, 0)}
      {renderRow(row2, 10)}
      {renderRow(row3, 21)}
      {renderRow(row4, 32)}
    </div>
  )
}

export default NetworkAvatarCloud
