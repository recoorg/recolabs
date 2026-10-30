import { createTracwell, TracwellClient, EventProperties, TracwellSession } from "tracwell"

// Public Project Key for Tracwell Browser Analytics
export const TRACWELL_PROJECT_KEY =
  (import.meta.env.VITE_TRACWELL_PROJECT_KEY as string) || "tw_live_9ce767f7e41b4c3c91bc783e2a1fa5a9"

export interface AnalyticsEventRecord {
  id: string
  name: string
  properties?: EventProperties
  timestamp: string
}

let clientInstance: TracwellClient | null = null
const localRecentEvents: AnalyticsEventRecord[] = []
const listeners: Array<() => void> = []

function notifyListeners() {
  for (const fn of listeners) {
    try {
      fn()
    } catch {
      // ignore
    }
  }
}

/**
 * Strips any sensitive fields (tokens, passwords, emails, credentials)
 * to enforce telemetry privacy compliance.
 */
function sanitizeProperties(props?: EventProperties): EventProperties | undefined {
  if (!props) return undefined
  const clean: EventProperties = {}
  for (const [key, val] of Object.entries(props)) {
    const lower = key.toLowerCase()
    if (
      lower.includes("password") ||
      lower.includes("token") ||
      lower.includes("secret") ||
      lower.includes("email") ||
      lower.includes("auth") ||
      lower.includes("card") ||
      lower.includes("credential")
    ) {
      continue
    }
    clean[key] = val
  }
  return clean
}

/**
 * Returns or instantiates the singleton browser-side Tracwell client.
 * Guarantees exactly one client is created in browser environment.
 */
export function getTracwellClient(): TracwellClient | null {
  if (typeof window === "undefined") {
    return null
  }

  if (clientInstance) {
    return clientInstance
  }

  try {
    clientInstance = createTracwell({
      projectKey: TRACWELL_PROJECT_KEY,
      collectionMode: "product",
      consent: "granted",
      respectDoNotTrack: true,
      autoTrackPageViews: true, // Let SDK observe standard History API navigation
    })

    return clientInstance
  } catch (err) {
    console.warn("[Tracwell] Initialization error:", err)
    return null
  }
}

/**
 * Initialize analytics once at app root.
 */
export function initAnalytics(): TracwellClient | null {
  return getTracwellClient()
}

/**
 * Track an outcome event with non-sensitive metadata.
 */
export function trackEvent(name: string, properties?: EventProperties): string | undefined {
  const cleanProps = sanitizeProperties(properties)
  const client = getTracwellClient()

  let eventId: string | undefined
  if (client) {
    try {
      eventId = client.track(name, cleanProps)
    } catch (err) {
      console.warn("[Tracwell] track error:", err)
    }
  }

  // Store in local debug buffer for Dashboard display
  const record: AnalyticsEventRecord = {
    id: eventId || `ev_${Math.random().toString(36).slice(2, 9)}`,
    name,
    properties: cleanProps,
    timestamp: new Date().toISOString(),
  }
  localRecentEvents.unshift(record)
  if (localRecentEvents.length > 50) {
    localRecentEvents.pop()
  }
  notifyListeners()

  return eventId
}

/**
 * Identify a signed-in user using an opaque internal identifier.
 * NEVER use email as user ID.
 */
export function identifyUser(opaqueId: string | number, traits?: EventProperties): string | undefined {
  const client = getTracwellClient()
  if (!client) return undefined

  // Enforce opaque ID format (e.g. builder_123 or user_xyz)
  const safeId = String(opaqueId).startsWith("builder_") || String(opaqueId).startsWith("user_")
    ? String(opaqueId)
    : `builder_${opaqueId}`

  const cleanTraits = sanitizeProperties(traits)
  try {
    const res = client.identify(safeId, cleanTraits)
    trackEvent("builder_identified", { opaque_id_prefix: safeId.split("_")[0] })
    return res
  } catch (err) {
    console.warn("[Tracwell] identify error:", err)
    return undefined
  }
}

/**
 * Reset identity upon sign out.
 */
export function resetUser(): void {
  const client = getTracwellClient()
  if (client) {
    try {
      client.reset()
      trackEvent("builder_identity_reset")
    } catch (err) {
      console.warn("[Tracwell] reset error:", err)
    }
  }
}

/**
 * Get active session telemetry.
 */
export function getSessionData(): TracwellSession | undefined {
  const client = getTracwellClient()
  if (!client) return undefined
  try {
    return client.getSession()
  } catch {
    return undefined
  }
}

/**
 * Subscribe to recent event stream for dashboard live telemetry.
 */
export function subscribeToAnalytics(callback: () => void): () => void {
  listeners.push(callback)
  return () => {
    const idx = listeners.indexOf(callback)
    if (idx !== -1) listeners.splice(idx, 1)
  }
}

/**
 * Returns recorded events from current browser session.
 */
export function getRecentEvents(): AnalyticsEventRecord[] {
  return [...localRecentEvents]
}
