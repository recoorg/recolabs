---
title: "Fault Injection on the ESP32-S3: Glitching ROM Bootloader Checks"
slug: "esp32-s3-voltage-glitching-rom-bootloader"
excerpt: "Building an open-source Crowbar circuit with a MOSFET and Raspberry Pi Pico to bypass flash encryption and signature verification during stage-1 ROM boot."
category: "Hardware"
tags: ["Hardware", "ESP32", "Fault Injection", "Electronics", "Security"]
coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
author:
  name: "Alex Rivera"
  username: "alexrivera"
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  github: "alexrivera"
  role: "Hardware Lead, Reco Labs"
createdAt: "2026-10-25T11:00:00.000Z"
updatedAt: "2026-10-26T18:20:00.000Z"
readingTime: "9 min read"
isPublished: true
---

# Fault Injection on the ESP32-S3: Glitching ROM Bootloader Checks

Voltage glitching (also called power fault injection or VDD crowbarring) is one of the most effective non-invasive physical attack vectors against modern microcontrollers. By momentarily dropping the core voltage rail to 0V for tens of nanoseconds, we induce clock skew and timing violations in the CPU pipeline, causing critical conditional branch instructions (`BEQ` / `BNE`) to flip their execution outcome.

In this teardown, we document our open-source rig built with a $4 Raspberry Pi Pico, an N-channel MOSFET, and an SMA coax feed line.

---

## 1. Physical Attack Surface: Decoupling Capacitors

To successfully drop the internal `VDD_CPU` rail (nominally 1.1V inside the ESP32-S3 package), we must remove the low-ESR ceramic decoupling capacitors located directly next to the chip pins. If left in place, these capacitors will source current during the glitch pulse and damp the voltage collapse.

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

```c
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
```

> [!NOTE]
> The trigger delay must be swept iteratively across a range of ~500 cycles until the ROM bootloader's SHA-256 digest comparison instruction executes.

---

## 3. Exploit Outcome & Boot Log

When the glitch hits during the signature loop verification:

```text
rst:0x1 (POWERON),boot:0x28 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fce3808,len:0x1640
[GLITCH FIRED AT T+4.182ms]
Signature check bypassed! Jumping to user image...
Welcome to Unsigned Custom Firmware [Reco Core v1.4]
```

We have open-sourced the KiCad schematics and PIO scripts in the Reco Labs hardware repository.
