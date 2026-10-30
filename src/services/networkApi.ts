export interface UserProfile {
  id: number
  name: string
  username: string
  email: string
  phone?: string | null
  website?: string | null
  bio?: string | null
  discord?: string | null
  github?: string | null
  avatar_url?: string | null
  auth_provider?: string
  created_at?: string
}

export interface StartupItem {
  id: number
  user_id?: number | null
  founder_username?: string | null
  founder_name: string
  founder_email?: string | null
  founder_phone?: string | null
  founder_website?: string | null
  founder_discord?: string | null
  name: string
  url: string
  problem_solving: string
  category: string
  stage: string
  created_at: string
}

const TOKEN_KEY = "reco_network_token"
const USER_KEY = "reco_network_user"
const SUPABASE_PROJECT_URL = "https://zjpbrdbdkkzczdwsgizj.supabase.co"

async function safeJsonFetch<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  const text = await res.text()

  let json: any
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(
      res.ok
        ? "Invalid JSON format returned by server."
        : `Server error (${res.status}): ${text.slice(0, 150).trim() || res.statusText}`
    )
  }

  if (!res.ok || json.error) {
    throw new Error(json.error || `Request failed with status ${res.status}`)
  }

  return json as T
}

// Helper to safely decode a JWT payload client-side
function parseJwtPayload(token: string): any {
  try {
    const parts = token.split(".")
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error("JWT parse error:", e)
    return null
  }
}

export const networkApi = {
  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
  },

  getCurrentUser(): UserProfile | null {
    if (typeof window === "undefined") return null
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  logout(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    window.dispatchEvent(new Event("reco_auth_changed"))
  },

  setSession(user: UserProfile, token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event("reco_auth_changed"))
  },

  // Trigger Google OAuth via Supabase
  signInWithGoogle(redirectTo?: string): void {
    if (typeof window === "undefined") return
    const target = redirectTo || `${window.location.origin}/network`
    window.location.href = `${SUPABASE_PROJECT_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(target)}`
  },

  // Trigger GitHub OAuth via Supabase
  signInWithGitHub(redirectTo?: string): void {
    if (typeof window === "undefined") return
    const target = redirectTo || `${window.location.origin}/network`
    window.location.href = `${SUPABASE_PROJECT_URL}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(target)}`
  },

  // Handle incoming OAuth callback (supports both hash fragment and search params)
  async handleOAuthCallback(): Promise<{ user: UserProfile; token: string } | null> {
    if (typeof window === "undefined") return null

    let accessToken: string | null = null

    // 1. Check URL hash (Supabase default: #access_token=...&refresh_token=...)
    if (window.location.hash && window.location.hash.includes("access_token")) {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      accessToken = params.get("access_token")
    }

    // 2. Check query search params fallback (?access_token=...)
    if (!accessToken && window.location.search && window.location.search.includes("access_token")) {
      const searchParams = new URLSearchParams(window.location.search)
      accessToken = searchParams.get("access_token")
    }

    if (!accessToken) return null

    try {
      // Decode JWT payload directly — contains all OAuth user claims without failing on API key checks
      const jwtUser = parseJwtPayload(accessToken)
      if (!jwtUser) {
        throw new Error("Unable to parse access token payload")
      }

      const email = jwtUser.email
      if (!email) {
        throw new Error("No email found in OAuth token")
      }

      const metadata = jwtUser.user_metadata || {}
      const name = metadata.full_name || metadata.name || email.split("@")[0] || "Builder"
      const avatarUrl = metadata.avatar_url || metadata.picture || null
      const provider = jwtUser.app_metadata?.provider === "github" ? "github" : "google"
      const preferredUsername =
        metadata.user_name ||
        metadata.preferred_username ||
        name.toLowerCase().replace(/[^a-z0-9_-]/g, "")

      // Sync with our PostgreSQL backend
      const syncJson = await safeJsonFetch<{ success: boolean; user: UserProfile; token: string }>(
        "/api/network/oauth-sync",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            avatarUrl,
            provider,
            preferredUsername,
          }),
        }
      )

      if (!syncJson.user || !syncJson.token) {
        throw new Error("Invalid sync response from server.")
      }

      this.setSession(syncJson.user, syncJson.token)

      // Clean URL hash and search params without page reload
      window.history.replaceState(null, "", window.location.pathname)

      return { user: syncJson.user, token: syncJson.token }
    } catch (err) {
      console.error("OAuth callback error:", err)
      return null
    }
  },

  async signUp(data: {
    name: string
    username?: string
    email: string
    password: string
    phone?: string
    website?: string
    bio?: string
    discord?: string
    github?: string
  }): Promise<{ user: UserProfile; token: string }> {
    const json = await safeJsonFetch<{ success: boolean; user: UserProfile; token: string }>(
      "/api/network/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    )
    this.setSession(json.user, json.token)
    return { user: json.user, token: json.token }
  },

  async login(data: { email: string; password: string }): Promise<{ user: UserProfile; token: string }> {
    const json = await safeJsonFetch<{ success: boolean; user: UserProfile; token: string }>(
      "/api/network/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    )
    this.setSession(json.user, json.token)
    return { user: json.user, token: json.token }
  },

  async getProfile(): Promise<UserProfile> {
    const token = this.getToken()
    if (!token) throw new Error("Not authenticated")
    const json = await safeJsonFetch<{ success: boolean; user: UserProfile }>("/api/network/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (json.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(json.user))
    }
    return json.user
  },

  async updateProfile(data: {
    name?: string
    username?: string
    phone?: string
    website?: string
    bio?: string
    discord?: string
    github?: string
  }): Promise<UserProfile> {
    const token = this.getToken()
    if (!token) throw new Error("Not authenticated")
    const json = await safeJsonFetch<{ success: boolean; user: UserProfile }>("/api/network/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (json.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(json.user))
    }
    return json.user
  },

  async getBuilderProfile(username: string): Promise<{ user: UserProfile; startups: StartupItem[] }> {
    const json = await safeJsonFetch<{ success: boolean; user: UserProfile; startups: StartupItem[] }>(
      `/api/network/builder/${encodeURIComponent(username)}`
    )
    return { user: json.user, startups: json.startups || [] }
  },

  async getStartups(params?: { search?: string; category?: string; username?: string }): Promise<StartupItem[]> {
    const q = new URLSearchParams()
    if (params?.search) q.set("search", params.search)
    if (params?.category && params.category !== "ALL") q.set("category", params.category)
    if (params?.username) q.set("username", params.username)

    const query = q.toString()
    const json = await safeJsonFetch<{ success: boolean; startups: StartupItem[] }>(
      `/api/network/startups${query ? `?${query}` : ""}`
    )
    return json.startups || []
  },

  async createStartup(data: {
    name: string
    url: string
    problem_solving: string
    category?: string
    stage?: string
    founder_name?: string
    founder_username?: string
    founder_email?: string
    founder_phone?: string
    founder_website?: string
    founder_discord?: string
  }): Promise<StartupItem> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const json = await safeJsonFetch<{ success: boolean; startup: StartupItem }>("/api/network/startups", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    return json.startup
  },
}
