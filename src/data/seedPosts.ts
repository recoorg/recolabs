import { BlogPost } from "@/types/blog"

export const SEED_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "Bypassing Usermode Anticheat & Inspecting Ring-0 Hook Tables",
    slug: "bypassing-usermode-anticheat-ring0-hooks",
    excerpt: "A deep dive into defeating user-mode module-walk detectors, indirect system call dispatchers, and inspecting inline kernel hooks from ring 3.",
    category: "Reverse Engineering",
    tags: ["Reverse Engineering", "Systems", "C++", "Windows Kernel", "Security"],
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Aditya Raj",
      username: "rawenergon",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      github: "adibxr",
      role: "Founder, Reco Labs",
      bio: "High school builder shipping hardware toolchains, reversing engines, and systems tooling."
    },
    createdAt: "2026-10-28T14:30:00.000Z",
    updatedAt: "2026-10-29T10:15:00.000Z",
    readingTime: "7 min read",
    isPublished: true,
    githubSha: "7b4c90d81fa",
    githubUrl: "https://github.com/recoorg/blog/blob/main/posts/bypassing-usermode-anticheat-ring0-hooks.md",
    views: 1420,
    content: `
# Bypassing Usermode Anticheat & Inspecting Ring-0 Hook Tables

When modern game protection engines (such as BattlEye, EAC, or Vanguard's user-mode watchdog thread) inject their instrumentation libraries into game memory spaces, their primary initial defense layer is aggressive **Module Walking**, **IAT/EAT Hook Auditing**, and **Page Table Integrity Scans**.

In this dispatch, we analyze how user-mode scanners detect manual mapping, and how to execute indirect syscalls to cleanly circumvent \`NtQueryVirtualMemory\` and thread creation telemetry without tripping telemetry beacons.

---

## 1. The Detection Vector: VAD Node Walk & Module Traversal

Most novice injectors use \`VirtualAllocEx\` with \`PAGE_EXECUTE_READWRITE\` and \`CreateRemoteThread\`. This is trivially detected because the Virtual Address Descriptor (VAD) tree for the allocated region has:

1. \`VadFlags.Protection\` set to RWX without an associated memory-mapped image file backed by disk.
2. The initial instruction pointer of the created thread points outside of any loaded module registered in the PEB (\`InLoadOrderModuleList\`).

<style>
  .memory-vad-visualizer {
    background: #09090b;
    border: 1px solid #27272a;
    border-radius: 12px;
    padding: 24px;
    margin: 28px 0;
    font-family: 'Geist Mono', monospace;
  }
  .vad-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 8px;
    font-size: 13px;
    border: 1px solid #18181b;
  }
  .vad-clean {
    background: rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10B981;
  }
  .vad-flagged {
    background: rgba(250, 93, 0, 0.1);
    border-color: rgba(250, 93, 0, 0.4);
    color: #FA5D00;
  }
  .vad-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
</style>

<div class="memory-vad-visualizer">
  <div style="font-weight: 700; color: #fff; margin-bottom: 12px; font-size: 14px; letter-spacing: 0.05em;">
    [VAD TREE MEMORY INTEGRITY MATRIX]
  </div>
  <div class="vad-node vad-clean">
    <span>0x7FFF0000 - 0x7FFF9000 &bull; ntdll.dll</span>
    <span class="vad-badge" style="background: rgba(16,185,129,0.2);">PAGE_EXECUTE_READ (CLEAN)</span>
  </div>
  <div class="vad-node vad-flagged">
    <span>0x000001FA - 0x000003E0 &bull; Unmapped Dynamic Shell</span>
    <span class="vad-badge" style="background: rgba(250,93,0,0.3);">UNBACKED RWX (ALERT TRIGGERED)</span>
  </div>
  <div class="vad-node vad-clean">
    <span>0x7FFE0000 - 0x7FFE1000 &bull; KUSER_SHARED_DATA</span>
    <span class="vad-badge" style="background: rgba(16,185,129,0.2);">PAGE_READONLY (PASS)</span>
  </div>
</div>

> [!WARNING]
> Allocating executable memory without backed file sections is an immediate heuristic flag in any modern ring-3 anti-cheat pipeline.

---

## 2. Implementing Clean Indirect Syscalls in C++

Instead of calling \`NtAllocateVirtualMemory\` directly through hooked \`ntdll\` stubs, we resolve the System Service Number (SSN) dynamically by parsing the sorted export address table (EAT), then jump to a legitimate \`syscall; ret\` gadget residing *within* ntdll itself.

\`\`\`cpp
// language: C++, target: Windows 11 x64, MSVC
#include <windows.h>
#include <iostream>

extern "C" void* SyscallGadget = nullptr;
extern "C" DWORD SyscallIndex = 0;

// Dynamic SSN extractor using Halo's Gate technique
DWORD GetSSN(const char* functionName) {
    HMODULE hNtdll = GetModuleHandleA("ntdll.dll");
    if (!hNtdll) return 0;
    
    BYTE* func = (BYTE*)GetProcAddress(hNtdll, functionName);
    if (!func) return 0;

    // Check for standard syscall stub pattern:
    // mov r10, rcx
    // mov eax, <SSN>
    if (func[0] == 0x4C && func[1] == 0x8B && func[2] == 0xD1 &&
        func[3] == 0xB8) {
        return *(DWORD*)(func + 4);
    }
    
    // If inline hooked (e.g. 0xE9 JMP), walk neighbouring stubs
    for (int offset = 1; offset < 32; offset++) {
        BYTE* down = func + (offset * 32);
        if (down[0] == 0x4C && down[1] == 0x8B && down[2] == 0xD1 && down[3] == 0xB8) {
            return *(DWORD*)(down + 4) - offset;
        }
    }
    return 0;
}
\`\`\`

---

## 3. The Syscall Assembly Stub

\`\`\`nasm
; language: x64 assembly (MASM)
.code

ExtSyscall PROC
    mov r10, rcx
    mov eax, SyscallIndex
    jmp QWORD PTR [SyscallGadget] ; Jump to syscall; ret inside ntdll!
ExtSyscall ENDP

END
\`\`\`

By jumping into an existing \`syscall; ret\` instruction in \`ntdll.dll\`, the kernel return address on the stack always points within an authenticated Microsoft module boundary, frustrating stack-walking EDR sensors.

---

## 4. Key Takeaways for Guild Builders

1. **Stack Spoofing is Non-Negotiable**: Simply hiding PE headers does not protect against thread call-stack unwinding. Synthetic stack frames must be synthesized.
2. **Handle Stripping**: Never keep an open \`PROCESS_ALL_ACCESS\` handle. Strip rights down to minimum necessary access mask or rely on kernel communication primitives.
3. **Hardware Breakpoints**: Anti-cheats continuously query \`GetThreadContext\` for \`DR0-DR3\` registers. Always intercept or clear debug registers before control flow handoff.
    `
  },
  {
    id: "post-2",
    title: "Fault Injection on the ESP32-S3: Glitching ROM Bootloader Checks",
    slug: "esp32-s3-voltage-glitching-rom-bootloader",
    excerpt: "Building an open-source Crowbar circuit with a MOSFET and Raspberry Pi Pico to bypass flash encryption and signature verification during stage-1 ROM boot.",
    category: "Hardware",
    tags: ["Hardware", "ESP32", "Fault Injection", "Electronics", "Security"],
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Alex Rivera",
      username: "alexrivera",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      github: "alexrivera",
      role: "Hardware Lead, Reco Labs",
      bio: "17yo maker building embedded glitch rigs, custom PCBs, and high-speed logic analyzers."
    },
    createdAt: "2026-10-25T11:00:00.000Z",
    updatedAt: "2026-10-26T18:20:00.000Z",
    readingTime: "9 min read",
    isPublished: true,
    githubSha: "4a2f8190cde",
    githubUrl: "https://github.com/recoorg/blog/blob/main/posts/esp32-s3-voltage-glitching-rom-bootloader.md",
    views: 980,
    content: `
# Fault Injection on the ESP32-S3: Glitching ROM Bootloader Checks

Voltage glitching (also called power fault injection or VDD crowbarring) is one of the most effective non-invasive physical attack vectors against modern microcontrollers. By momentarily dropping the core voltage rail to 0V for tens of nanoseconds, we induce clock skew and timing violations in the CPU pipeline, causing critical conditional branch instructions (\`BEQ\` / \`BNE\`) to flip their execution outcome.

In this teardown, we document our open-source rig built with a \$4 Raspberry Pi Pico, an N-channel MOSFET, and an SMA coax feed line.

---

## 1. Physical Attack Surface: Decoupling Capacitors

To successfully drop the internal \`VDD_CPU\` rail (nominally 1.1V inside the ESP32-S3 package), we must remove the low-ESR ceramic decoupling capacitors located directly next to the chip pins. If left in place, these capacitors will source current during the glitch pulse and damp the voltage collapse.

<style>
  .oscilloscope-canvas {
    background: #000;
    border: 2px solid #27272a;
    border-radius: 12px;
    padding: 20px;
    margin: 24px 0;
    position: relative;
    overflow: hidden;
  }
  .oscilloscope-grid {
    position: absolute;
    inset: 0;
    background-size: 30px 30px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    pointer-events: none;
  }
  .wave-line {
    stroke: #FA5D00;
    stroke-width: 2.5;
    fill: none;
    filter: drop-shadow(0 0 6px #FA5D00);
  }
</style>

<div class="oscilloscope-canvas">
  <div class="oscilloscope-grid"></div>
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-family: 'Geist Mono', monospace; font-size: 12px;">
    <span style="color: #FA5D00; font-weight: 700;">CH1: VDD_CPU (3.3V &rarr; 1.1V LDO)</span>
    <span style="color: #10B981;">GLITCH DURATION: 42.5 ns</span>
  </div>
  <svg viewBox="0 0 800 160" style="width: 100%; height: 120px; display: block;">
    <path class="wave-line" d="M 0,30 L 300,30 L 305,145 L 340,145 L 345,30 L 800,30" />
    <circle cx="305" cy="145" r="4" fill="#10B981" />
    <circle cx="340" cy="145" r="4" fill="#10B981" />
  </svg>
  <div style="font-family: 'Geist Mono', monospace; font-size: 11px; color: #a1a1aa; text-align: right; margin-top: 6px;">
    Crowbar trigger: PIO state machine cycle 1872
  </div>
</div>

---

## 2. Raspberry Pi Pico PIO State Machine Code

The Raspberry Pi Pico's Programmable I/O (PIO) running at 250 MHz gives us a deterministic single-instruction resolution of **4.0 nanoseconds**.

\`\`\`c
// RP2040 PIO Assembly Routine
// Drives GPIO high to gate MOSFET for exact glitch pulse width

.program glitch_crowbar
.side_set 1

; Wait for reset release trigger on GPIO 14
wait 1 pin 0        side 0
wait 0 pin 0        side 0

; Precise delay cycles before target branch check
mov x, osr          side 0
delay_loop:
    jmp x-- delay_loop side 0

; Drop the hammer: Pulse MOSFET Gate HIGH for 10 cycles (40ns)
nop                 side 1 [9]
nop                 side 0

; Halt state machine
push                side 0
\`\`\`

> [!NOTE]
> The trigger delay must be swept iteratively across a range of ~500 cycles until the ROM bootloader's SHA-256 digest comparison instruction executes.

---

## 3. Exploit Outcome & Boot Log

When the glitch hits during the signature loop verification:

\`\`\`text
rst:0x1 (POWERON),boot:0x28 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fce3808,len:0x1640
[GLITCH FIRED AT T+4.182ms]
Signature check bypassed! Jumping to user image...
Welcome to Unsigned Custom Firmware [Reco Core v1.4]
\`\`\`

We have open-sourced the KiCad schematics and PIO scripts in the Reco Labs hardware repository.
    `
  },
  {
    id: "post-3",
    title: "Zero-Copy Network Stack in Rust: 10M Packets/Sec on Commodity Linux",
    slug: "zero-copy-network-stack-rust-af-xdp",
    excerpt: "Bypassing the Linux TCP/IP kernel stack using AF_XDP (eXpress Data Path) and UMEM ring buffers to process packet streams at line rate.",
    category: "Systems",
    tags: ["Rust", "Systems", "Networking", "eBPF", "Linux Kernel"],
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Elena Korolyova",
      username: "elena_k",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      github: "elenakorol",
      role: "Systems Contributor",
      bio: "Writing zero-allocation data structures, SIMD vectorizers, and eBPF drivers."
    },
    createdAt: "2026-10-21T09:15:00.000Z",
    updatedAt: "2026-10-22T12:00:00.000Z",
    readingTime: "6 min read",
    isPublished: true,
    githubSha: "8d91c0e34ba",
    githubUrl: "https://github.com/recoorg/blog/blob/main/posts/zero-copy-network-stack-rust-af-xdp.md",
    views: 840,
    content: `
# Zero-Copy Network Stack in Rust: 10M Packets/Sec on Commodity Linux

Traditional socket programming via standard POSIX \`read()\` and \`write()\` suffers from immense kernel overhead:
1. **Context Switches**: Going from user space to kernel space triggers TLB flushes and cache pollution.
2. **Sk_buff Allocation Overhead**: Linux allocates an internal \`sk_buff\` metadata struct for every single inbound frame.
3. **Memory Copies**: The kernel network driver DMA-transfers bytes into kernel ring buffers, which are then copied a second time into the user application buffer.

With **AF_XDP**, the NIC driver writes packets directly into a user-controlled shared memory pool (**UMEM**), achieving true zero-copy processing.

---

## 1. Architecture: The AF_XDP Ring Buffers

<style>
  .arch-diagram {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin: 24px 0;
    font-family: 'Geist Mono', monospace;
  }
  .arch-box {
    background: #0d0d10;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }
  .arch-title {
    color: #FA5D00;
    font-weight: 700;
    font-size: 13px;
    margin-bottom: 6px;
  }
  .arch-desc {
    color: #a1a1aa;
    font-size: 11px;
    line-height: 1.4;
  }
</style>

<div class="arch-diagram">
  <div class="arch-box">
    <div class="arch-title">1. NIC DMA RX</div>
    <div class="arch-desc">Packets land directly in UMEM memory frames via driver zero-copy mode.</div>
  </div>
  <div class="arch-box">
    <div class="arch-title">2. XDP eBPF Filter</div>
    <div class="arch-desc">Inline BPF program runs at device driver level and redirects matching frames to XSK.</div>
  </div>
  <div class="arch-box">
    <div class="arch-title">3. Rust Worker Ring</div>
    <div class="arch-desc">Consumes ring descriptors without a single memcpy or syscall overhead.</div>
  </div>
</div>

---

## 2. Setting Up the Rust UMEM Ring in \`aya\`

\`\`\`rust
// language: Rust, target: x86_64-unknown-linux-gnu
use std::os::fd::AsRawFd;
use anyhow::Result;

pub struct UmemPool {
    mem: *mut u8,
    frame_size: usize,
    num_frames: usize,
}

impl UmemPool {
    pub fn new(num_frames: usize, frame_size: usize) -> Result<Self> {
        let total_size = num_frames * frame_size;
        
        // Allocate page-aligned memory for zero-copy DMA
        let mem = unsafe {
            libc::mmap(
                std::ptr::null_mut(),
                total_size,
                libc::PROT_READ | libc::PROT_WRITE,
                libc::MAP_PRIVATE | libc::MAP_ANONYMOUS | libc::MAP_POPULATE,
                -1,
                0,
            )
        };

        if mem == libc::MAP_FAILED {
            anyhow::bail!("Failed to allocate aligned UMEM buffer");
        }

        Ok(Self {
            mem: mem as *mut u8,
            frame_size,
            num_frames,
        })
    }
}
\`\`\`

---

## 3. Benchmark Comparison

| Pipeline | Throughput (Packets/Sec) | Latency (p99) | CPU Core Utilization |
|---|---|---|---|
| Standard POSIX \`recvfrom\` | ~1.2M pps | 84.2 &mu;s | 100% (Kernel SoftIRQ bound) |
| Linux \`io_uring\` | ~4.8M pps | 28.1 &mu;s | 68% |
| **AF_XDP Zero-Copy (Rust)** | **10.4M pps** | **3.8 &mu;s** | **22% (Cache coherent)** |

This implementation forms the backbone of our distributed packet replay and fuzzing node for high-frequency trading simulation.
    `
  },
  {
    id: "post-4",
    title: "Building Reco Labs: Architecture & The Guild For High-School Hackers",
    slug: "building-reco-labs-architecture-and-manifesto",
    excerpt: "Why we built Reco Labs as an open ecosystem: moving away from polished web wrappers and returning to raw silicon, compilers, and unpadded code.",
    category: "Software",
    tags: ["Reco Labs", "Architecture", "Community", "Open Source", "Guild"],
    coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    author: {
      name: "Aditya Raj",
      username: "rawenergon",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      github: "adibxr",
      role: "Founder, Reco Labs",
      bio: "High school builder shipping hardware toolchains, reversing engines, and systems tooling."
    },
    createdAt: "2026-10-15T08:00:00.000Z",
    updatedAt: "2026-10-18T14:00:00.000Z",
    readingTime: "4 min read",
    isPublished: true,
    githubSha: "1f893d920ee",
    githubUrl: "https://github.com/recoorg/blog/blob/main/posts/building-reco-labs-architecture-and-manifesto.md",
    views: 2150,
    content: `
# Building Reco Labs: Architecture & The Guild For High-School Hackers

Most developer ecosystems today push beginners toward prefabricated templates: clone a Next.js boilerplate, connect an API key, call an AI endpoint, and declare victory. While accessible, it conceals the foundational craft of computer science: the memory controllers, the instruction decoders, the network rings, and the silicon itself.

**Reco Labs was created to reverse that current.**

---

## 1. The Core Tenets of the Guild

1. **No Toys**: If you build a tool, build it to handle real load. Not a 10-line wrapper, but something that unpacks protocols and solves actual friction.
2. **Direct Contact**: Every builder in the Founder Network exposes raw contact handles—their WhatsApp/phone, GitHub, Discord, and live URL. No gatekept lead forms.
3. **Open Bench**: Knowledge shared openly outlasts closed silos. Every dispatch on this blog is backed by GitHub commits and runnable source.

---

## 2. The Multi-Subdomain Architecture

To keep the platform modular and blazing fast, Reco Labs is partitioned across dedicated subdomains:

- **\`recolabs.in\`**: The primary portal, founder network (\`/network\`), builder profiles (\`/builder/:username\`), and hackathons.
- **\`blog.recolabs.in\`**: The engineering dispatch and developer knowledge base. Every post is written in a dedicated developer dashboard and committed directly to the GitHub repository.

> [!TIP]
> Any guild member with verified builder status can connect their GitHub Personal Access Token to commit dispatches directly to the official publication repo.

Welcome to the bench. Let's build.
    `
  }
]
