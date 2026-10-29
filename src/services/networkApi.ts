export interface UserProfile {
  id: number
  name: string
  email: string
  phone?: string | null
  website?: string | null
  bio?: string | null
  discord?: string | null
  github?: string | null
  created_at?: string
}

export interface StartupItem {
  id: number
  user_id?: number | null
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

  async signUp(data: {
    name: string
    email: string
    password: string
    phone?: string
    website?: string
    bio?: string
    discord?: string
    github?: string
  }): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch("/api/network/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok || json.error) {
      throw new Error(json.error || "Failed to sign up.")
    }
    this.setSession(json.user, json.token)
    return { user: json.user, token: json.token }
  },

  async login(data: { email: string; password: string }): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch("/api/network/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok || json.error) {
      throw new Error(json.error || "Failed to sign in.")
    }
    this.setSession(json.user, json.token)
    return { user: json.user, token: json.token }
  },

  async getProfile(): Promise<UserProfile> {
    const token = this.getToken()
    if (!token) throw new Error("Not authenticated")
    const res = await fetch("/api/network/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const json = await res.json()
    if (!res.ok || json.error) {
      throw new Error(json.error || "Failed to fetch profile.")
    }
    if (json.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(json.user))
    }
    return json.user
  },

  async updateProfile(data: {
    name?: string
    phone?: string
    website?: string
    bio?: string
    discord?: string
    github?: string
  }): Promise<UserProfile> {
    const token = this.getToken()
    if (!token) throw new Error("Not authenticated")
    const res = await fetch("/api/network/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok || json.error) {
      throw new Error(json.error || "Failed to update profile.")
    }
    if (json.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(json.user))
    }
    return json.user
  },

  async getStartups(params?: { search?: string; category?: string }): Promise<StartupItem[]> {
    const q = new URLSearchParams()
    if (params?.search) q.set("search", params.search)
    if (params?.category && params.category !== "ALL") q.set("category", params.category)

    const res = await fetch(`/api/network/startups?${q.toString()}`)
    const json = await res.json()
    if (!res.ok || json.error) {
      throw new Error(json.error || "Failed to fetch startups.")
    }
    return json.startups || []
  },

  async createStartup(data: {
    name: string
    url: string
    problem_solving: string
    category?: string
    stage?: string
    founder_name?: string
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

    const res = await fetch("/api/network/startups", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok || json.error) {
      throw new Error(json.error || "Failed to post startup.")
    }
    return json.startup
  },
}
