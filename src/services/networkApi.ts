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
  },

  setSession(user: UserProfile, token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
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

  // Handle incoming OAuth callback hash
  async handleOAuthCallback(): Promise<{ user: UserProfile; token: string } | null> {
    if (typeof window === "undefined" || !window.location.hash) return null
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get("access_token")

    if (!accessToken) return null

    try {
      // Query Supabase user info using accessToken
      const supaRes = await fetch(`${SUPABASE_PROJECT_URL}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: accessToken,
        },
      })

      if (!supaRes.ok) {
        throw new Error("Failed to verify Supabase OAuth access token")
      }

      const supaUser = await supaRes.json()
      const email = supaUser.email
      const metadata = supaUser.user_metadata || {}
      const name = metadata.full_name || metadata.name || email.split("@")[0]
      const avatarUrl = metadata.avatar_url || metadata.picture
      const provider = supaUser.app_metadata?.provider === "github" ? "github" : "google"
      const preferredUsername = metadata.user_name || metadata.preferred_username || name.toLowerCase().replace(/[^a-z0-9]/g, "")

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

      this.setSession(syncJson.user, syncJson.token)

      // Clean URL hash without reload
      window.history.replaceState(null, "", window.location.pathname + window.location.search)

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
