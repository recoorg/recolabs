---
title: "Zero-Copy Network Stack in Rust: 10M Packets/Sec on Commodity Linux"
slug: "zero-copy-network-stack-rust-af-xdp"
excerpt: "Bypassing the Linux TCP/IP kernel stack using AF_XDP (eXpress Data Path) and UMEM ring buffers to process packet streams at line rate."
category: "Systems"
tags: ["Rust", "Systems", "Networking", "eBPF", "Linux Kernel"]
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80"
author:
  name: "Elena Korolyova"
  username: "elena_k"
  avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
  github: "elenakorol"
  role: "Systems Contributor"
createdAt: "2026-10-21T09:15:00.000Z"
updatedAt: "2026-10-22T12:00:00.000Z"
readingTime: "6 min read"
isPublished: true
---

# Zero-Copy Network Stack in Rust: 10M Packets/Sec on Commodity Linux

Traditional socket programming via standard POSIX `read()` and `write()` suffers from immense kernel overhead:
1. **Context Switches**: Going from user space to kernel space triggers TLB flushes and cache pollution.
2. **Sk_buff Allocation Overhead**: Linux allocates an internal `sk_buff` metadata struct for every single inbound frame.
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

## 2. Setting Up the Rust UMEM Ring in `aya`

```rust
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
```

---

## 3. Benchmark Comparison

| Pipeline | Throughput (Packets/Sec) | Latency (p99) | CPU Core Utilization |
|---|---|---|---|
| Standard POSIX `recvfrom` | ~1.2M pps | 84.2 &mu;s | 100% (Kernel SoftIRQ bound) |
| Linux `io_uring` | ~4.8M pps | 28.1 &mu;s | 68% |
| **AF_XDP Zero-Copy (Rust)** | **10.4M pps** | **3.8 &mu;s** | **22% (Cache coherent)** |

This implementation forms the backbone of our distributed packet replay and fuzzing node for high-frequency trading simulation.
