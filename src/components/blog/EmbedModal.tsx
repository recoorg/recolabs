import * as React from "react"
import { X, Code, Palette, Layout, AlertTriangle, Table } from "lucide-react"
import { YoutubeIcon } from "@/components/icons"

export type EmbedType = "youtube" | "codepen" | "style" | "html-card" | "alert" | "table"

interface EmbedModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (snippet: string) => void
  defaultType?: EmbedType
}

export function EmbedModal({ isOpen, onClose, onInsert, defaultType = "youtube" }: EmbedModalProps) {
  const [activeTab, setActiveTab] = React.useState<EmbedType>(defaultType)

  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = React.useState("")
  // CodePen state
  const [codepenUrl, setCodepenUrl] = React.useState("")
  // Custom Style template
  const [styleTemplate, setStyleTemplate] = React.useState<"neon" | "terminal" | "hardware">("neon")
  // Alert type
  const [alertType, setAlertType] = React.useState<"NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION">("TIP")
  const [alertText, setAlertText] = React.useState("This hardware pin requires a 10k pull-up resistor to 3.3V rail.")

  React.useEffect(() => {
    if (defaultType) setActiveTab(defaultType)
  }, [defaultType])

  if (!isOpen) return null

  const handleInsertYouTube = () => {
    let videoId = ""
    if (youtubeUrl.includes("v=")) {
      videoId = youtubeUrl.split("v=")[1]?.split("&")[0] || ""
    } else if (youtubeUrl.includes("youtu.be/")) {
      videoId = youtubeUrl.split("youtu.be/")[1]?.split("?")[0] || ""
    } else if (youtubeUrl.includes("embed/")) {
      videoId = youtubeUrl.split("embed/")[1]?.split("?")[0] || ""
    } else {
      videoId = youtubeUrl.trim()
    }

    if (!videoId) return

    const snippet = `
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 12px; margin: 24px 0; border: 1px solid #27272a;">
  <iframe 
    src="https://www.youtube-nocookie.com/embed/${videoId}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>
`
    onInsert(snippet)
    onClose()
  }

  const handleInsertCodePen = () => {
    let penUrl = codepenUrl.trim()
    if (!penUrl) return
    if (!penUrl.includes("/embed/")) {
      penUrl = penUrl.replace("/pen/", "/embed/")
    }

    const snippet = `
<iframe 
  height="450" 
  style="width: 100%; border-radius: 12px; margin: 24px 0; border: 1px solid #27272a;" 
  scrolling="no" 
  title="CodePen Embed" 
  src="${penUrl}?default-tab=html%2Cresult&theme-id=dark" 
  frameborder="no" 
  loading="lazy" 
  allowtransparency="true" 
  allowfullscreen="true">
</iframe>
`
    onInsert(snippet)
    onClose()
  }

  const handleInsertStyle = () => {
    let snippet = ""
    if (styleTemplate === "neon") {
      snippet = `
<style>
  .reco-neon-card {
    background: radial-gradient(circle at top left, rgba(250, 93, 0, 0.15), #09090b 70%);
    border: 1px solid rgba(250, 93, 0, 0.4);
    box-shadow: 0 0 25px rgba(250, 93, 0, 0.15);
    border-radius: 14px;
    padding: 24px;
    margin: 28px 0;
    color: #fafafa;
    font-family: 'Geist', sans-serif;
  }
  .reco-neon-card h4 {
    color: #FA5D00;
    font-family: 'Instrument Serif', serif;
    font-size: 1.5rem;
    margin: 0 0 8px 0;
  }
</style>

<div class="reco-neon-card">
  <h4>Hardware Accelerator Benchmark</h4>
  <p>Custom styled container with isolated CSS embedded right inside this blog dispatch.</p>
</div>
`
    } else if (styleTemplate === "terminal") {
      snippet = `
<style>
  .reco-cli-window {
    background: #000000;
    border: 1px solid #27272a;
    border-radius: 10px;
    margin: 24px 0;
    overflow: hidden;
    font-family: 'Geist Mono', monospace;
  }
  .reco-cli-bar {
    background: #18181b;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid #27272a;
  }
  .reco-cli-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }
  .reco-cli-content {
    padding: 16px;
    font-size: 13px;
    color: #10B981;
    line-height: 1.6;
  }
</style>

<div class="reco-cli-window">
  <div class="reco-cli-bar">
    <span class="reco-cli-dot" style="background: #ef4444;"></span>
    <span class="reco-cli-dot" style="background: #f59e0b;"></span>
    <span class="reco-cli-dot" style="background: #10b981;"></span>
    <span style="margin-left: 8px; font-size: 11px; color: #a1a1aa;">root@recolabs-rig:~</span>
  </div>
  <div class="reco-cli-content">
    $ cargo run --release -- --device /dev/ttyUSB0 --baud 115200<br/>
    [+] Connected to ESP32-S3 JTAG interface.<br/>
    [+] Injecting voltage fault on VDD_CPU at T+4.18ms...<br/>
    [SUCCESS] ROM Bootloader authentication bypassed!
  </div>
</div>
`
    } else {
      snippet = `
<style>
  .reco-spec-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin: 24px 0;
    font-family: 'Geist Mono', monospace;
  }
  .reco-spec-item {
    background: #0d0d10;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 14px;
  }
  .reco-spec-label {
    font-size: 11px;
    text-transform: uppercase;
    color: #a1a1aa;
    margin-bottom: 4px;
  }
  .reco-spec-val {
    font-size: 15px;
    font-weight: 700;
    color: #FA5D00;
  }
</style>

<div class="reco-spec-grid">
  <div class="reco-spec-item">
    <div class="reco-spec-label">Core Clock</div>
    <div class="reco-spec-val">240 MHz</div>
  </div>
  <div class="reco-spec-item">
    <div class="reco-spec-label">SRAM Memory</div>
    <div class="reco-spec-val">512 KB Internal</div>
  </div>
  <div class="reco-spec-item">
    <div class="reco-spec-label">Glitch Resolution</div>
    <div class="reco-spec-val">4.0 ns Pulse</div>
  </div>
</div>
`
    }

    onInsert(snippet)
    onClose()
  }

  const handleInsertAlert = () => {
    const snippet = `\n> [!${alertType}]\n> ${alertText}\n`
    onInsert(snippet)
    onClose()
  }

  const handleInsertTable = () => {
    const snippet = `
| Parameter | Default Value | Target Override | Status |
|---|---|---|---|
| Buffer Ring Size | 2048 frames | 65536 frames | Optimized |
| Packet Rate | 1.2M pps | 10.4M pps | Line Rate |
| Interrupt Delay | 40 &mu;s | 0 &mu;s (Polled) | Zero Jitter |
`
    onInsert(snippet)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-zinc-900 dark:text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold font-sans">Insert Embed or Custom Styling</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-zinc-200 dark:border-zinc-800">
          {[
            { id: "youtube", label: "YouTube", icon: YoutubeIcon },
            { id: "codepen", label: "CodePen", icon: Code },
            { id: "style", label: "Custom CSS / HTML", icon: Palette },
            { id: "alert", label: "Callout Alert", icon: AlertTriangle },
            { id: "table", label: "Data Table", icon: Table },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as EmbedType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[#FA5D00] text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Body Content */}
        <div className="py-4">
          {activeTab === "youtube" && (
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                YouTube Video URL or ID
              </label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
              />
              <p className="text-xs text-zinc-500">
                Automatically embeds an optimized 16:9 responsive player without tracking cookies.
              </p>
              <button
                onClick={handleInsertYouTube}
                disabled={!youtubeUrl.trim()}
                className="w-full py-2.5 rounded-lg bg-[#FA5D00] hover:bg-[#e05300] text-white font-mono text-xs font-bold tracking-wider uppercase disabled:opacity-50 transition-all"
              >
                Insert YouTube Player
              </button>
            </div>
          )}

          {activeTab === "codepen" && (
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                CodePen URL
              </label>
              <input
                type="text"
                value={codepenUrl}
                onChange={(e) => setCodepenUrl(e.target.value)}
                placeholder="https://codepen.io/username/pen/..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
              />
              <button
                onClick={handleInsertCodePen}
                disabled={!codepenUrl.trim()}
                className="w-full py-2.5 rounded-lg bg-[#FA5D00] hover:bg-[#e05300] text-white font-mono text-xs font-bold tracking-wider uppercase disabled:opacity-50 transition-all"
              >
                Insert CodePen Interactive
              </button>
            </div>
          )}

          {activeTab === "style" && (
            <div className="space-y-4">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Select CSS / Component Template
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "neon", name: "Neon Glow Card" },
                  { id: "terminal", name: "Hacker Terminal" },
                  { id: "hardware", name: "Spec Metric Grid" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setStyleTemplate(item.id as any)}
                    className={`p-3 rounded-lg border text-left font-mono text-xs transition-colors ${
                      styleTemplate === item.id
                        ? "border-[#FA5D00] bg-[#FA5D00]/10 text-[#FA5D00] font-bold"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500">
                Injects custom CSS inside a scoped <code>&lt;style&gt;</code> tag and matching HTML elements into your post markdown.
              </p>
              <button
                onClick={handleInsertStyle}
                className="w-full py-2.5 rounded-lg bg-[#FA5D00] hover:bg-[#e05300] text-white font-mono text-xs font-bold tracking-wider uppercase transition-all"
              >
                Insert Custom Styled Block
              </button>
            </div>
          )}

          {activeTab === "alert" && (
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Callout Alert Type
              </label>
              <div className="flex flex-wrap gap-2">
                {(["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAlertType(type)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors ${
                      alertType === type
                        ? "bg-[#FA5D00] text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <textarea
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
                placeholder="Alert text..."
              />
              <button
                onClick={handleInsertAlert}
                className="w-full py-2.5 rounded-lg bg-[#FA5D00] hover:bg-[#e05300] text-white font-mono text-xs font-bold tracking-wider uppercase transition-all"
              >
                Insert Alert Callout
              </button>
            </div>
          )}

          {activeTab === "table" && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Inserts a formatted Markdown data comparison table with columns, alignment, and parameter benchmarks.
              </p>
              <button
                onClick={handleInsertTable}
                className="w-full py-2.5 rounded-lg bg-[#FA5D00] hover:bg-[#e05300] text-white font-mono text-xs font-bold tracking-wider uppercase transition-all"
              >
                Insert Markdown Table
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
