// Language: TypeScript, File: src/services/geminiAiService.ts
// Gemini AI Copilot for Reco Labs Vault — Problem-to-Tool Suggestion Service

const GEMINI_API_KEY = typeof atob !== "undefined"
  ? atob("QVEuQWI4Uk42S1BwYWI4VGsxM2JtNnlZSGVnSzlDblZkMmMzY3hDQnRaTHFGNDZ6Q19QRVE=")
  : Buffer.from("QVEuQWI4Uk42S1BwYWI4VGsxM2JtNnlZSGVnSzlDblZkMmMzY3hDQnRaTHFGNDZ6Q19QRVE=", "base64").toString()

export interface CatalogToolSummary {
  title: string
  category?: string
  description?: string
  tags?: string[]
}

export interface AiToolSuggestion {
  suggested_tool_title: string
  reason: string
  search_keywords: string[]
  category?: string
}

export async function askGeminiForTool(
  problem: string,
  catalog: CatalogToolSummary[]
): Promise<AiToolSuggestion> {
  const trimmed = problem.trim()
  if (!trimmed) {
    throw new Error("Please describe your problem or what tool you are looking for.")
  }

  // Pick a concise representative sample of tools for prompt context
  const sample = catalog.slice(0, 60).map((t) => ({
    title: t.title,
    category: t.category || "General",
    desc: (t.description || "").slice(0, 80),
    tags: (t.tags || []).slice(0, 3),
  }))

  const promptText = `You are the Reco Labs AI Engineering Copilot. A developer is looking for a tool from the Reco Labs curated engineering vault to solve their specific technical problem.

User's Problem / Need:
"${trimmed}"

Available Curated Tools Sample (choose from these if matching, or recommend the ideal tool):
${JSON.stringify(sample, null, 1)}

Instruction:
1. Select the single best tool from the catalog that directly solves or aids their problem. If no exact catalog tool fits, name the industry standard tool.
2. Provide a crisp, 1-2 sentence explanation of WHY it solves their exact problem.
3. Provide 2-4 search keywords for finding it.

Format your response strictly as valid JSON with no markdown backticks or commentary:
{
  "suggested_tool_title": "Tool Name",
  "reason": "1-2 sentence explanation",
  "search_keywords": ["keyword1", "keyword2"]
}`

  const requestBody = {
    contents: [
      {
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 300,
    },
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error("Gemini API error:", errText)
    throw new Error(`AI suggestion service responded with status ${response.status}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ""

  // Clean JSON output (strip ```json ... ``` fences if present)
  const cleaned = rawText
    .replace(/^```json/im, "")
    .replace(/^```/im, "")
    .replace(/```$/im, "")
    .trim()

  try {
    const parsed = JSON.parse(cleaned)
    return {
      suggested_tool_title: parsed.suggested_tool_title || "Recommended Tool",
      reason: parsed.reason || "Matches your problem description.",
      search_keywords: Array.isArray(parsed.search_keywords) ? parsed.search_keywords : [trimmed],
      category: parsed.category || undefined,
    }
  } catch (parseErr) {
    console.warn("JSON parse fallback for Gemini response:", rawText)
    return {
      suggested_tool_title: "Recommended Match",
      reason: rawText.slice(0, 150),
      search_keywords: [trimmed],
    }
  }
}
