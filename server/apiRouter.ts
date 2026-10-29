import type { IncomingMessage, ServerResponse } from "http"
import {
  initDb,
  createUser,
  loginUser,
  syncOAuthUser,
  verifyToken,
  getUserById,
  getUserByUsername,
  updateUserProfile,
  listStartups,
  createStartup,
} from "./db.js"

export function createNetworkApiMiddleware() {
  initDb().catch((err: any) => console.error("Database init error:", err.message))

  return async function networkApiMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    if (!req.url || !req.url.startsWith("/api/network")) {
      return next()
    }

    // CORS & Content-Type
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    res.setHeader("Content-Type", "application/json")

    if (req.method === "OPTIONS") {
      res.statusCode = 204
      return res.end()
    }

    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`)
    const pathname = url.pathname.replace(/\/$/, "")

    // Parse Body helper
    const parseBody = <T = any>(): Promise<T> =>
      new Promise((resolve) => {
        let body = ""
        req.on("data", (chunk) => (body += chunk))
        req.on("end", () => {
          try {
            resolve(body ? JSON.parse(body) : ({} as T))
          } catch {
            resolve({} as T)
          }
        })
      })

    // Get Auth User helper
    const getAuthUser = () => {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith("Bearer ")) return null
      const token = authHeader.split(" ")[1]
      return verifyToken(token)
    }

    try {
      // 1. SIGNUP: POST /api/network/signup
      if (req.method === "POST" && pathname === "/api/network/signup") {
        const body = await parseBody()
        if (!body.email || !body.password || !body.name) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: "Name, email, and password are required." }))
        }
        const data = await createUser(body)
        return res.end(JSON.stringify({ success: true, ...data }))
      }

      // 2. LOGIN: POST /api/network/login
      if (req.method === "POST" && pathname === "/api/network/login") {
        const body = await parseBody()
        if (!body.email || !body.password) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: "Email and password are required." }))
        }
        const data = await loginUser(body)
        return res.end(JSON.stringify({ success: true, ...data }))
      }

      // 3. OAUTH SYNC: POST /api/network/oauth-sync
      if (req.method === "POST" && pathname === "/api/network/oauth-sync") {
        const body = await parseBody()
        if (!body.email) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: "Email is required for OAuth." }))
        }
        const data = await syncOAuthUser({
          email: body.email,
          name: body.name || "Builder",
          avatarUrl: body.avatarUrl,
          provider: body.provider === "github" ? "github" : "google",
          preferredUsername: body.preferredUsername,
        })
        return res.end(JSON.stringify({ success: true, ...data }))
      }

      // 4. GET PROFILE: GET /api/network/profile
      if (req.method === "GET" && pathname === "/api/network/profile") {
        const auth = getAuthUser()
        if (!auth) {
          res.statusCode = 401
          return res.end(JSON.stringify({ error: "Unauthorized. Please sign in." }))
        }
        const user = await getUserById(auth.id)
        return res.end(JSON.stringify({ success: true, user }))
      }

      // 5. UPDATE PROFILE: PUT /api/network/profile
      if (req.method === "PUT" && pathname === "/api/network/profile") {
        const auth = getAuthUser()
        if (!auth) {
          res.statusCode = 401
          return res.end(JSON.stringify({ error: "Unauthorized. Please sign in." }))
        }
        const body = await parseBody()
        const updated = await updateUserProfile(auth.id, body)
        return res.end(JSON.stringify({ success: true, user: updated }))
      }

      // 6. GET BUILDER BY USERNAME: GET /api/network/builder/:username
      if (req.method === "GET" && pathname.startsWith("/api/network/builder/")) {
        const username = pathname.replace("/api/network/builder/", "").trim()
        if (!username) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: "Username is required." }))
        }
        const user = await getUserByUsername(username)
        if (!user) {
          res.statusCode = 404
          return res.end(JSON.stringify({ error: `Builder @${username} not found.` }))
        }
        const startups = await listStartups({ username })
        return res.end(JSON.stringify({ success: true, user, startups }))
      }

      // 7. GET STARTUPS: GET /api/network/startups
      if (req.method === "GET" && pathname === "/api/network/startups") {
        const search = url.searchParams.get("search") || ""
        const category = url.searchParams.get("category") || "ALL"
        const username = url.searchParams.get("username") || undefined
        const startups = await listStartups({ search, category, username })
        return res.end(JSON.stringify({ success: true, count: startups.length, startups }))
      }

      // 8. CREATE STARTUP: POST /api/network/startups
      if (req.method === "POST" && pathname === "/api/network/startups") {
        const body = await parseBody()
        const auth = getAuthUser()

        if (!body.name || !body.url || !body.problem_solving) {
          res.statusCode = 400
          return res.end(
            JSON.stringify({
              error: "Startup Name, URL, and Problem Solving description are required.",
            })
          )
        }

        let founderName = body.founder_name
        let founderUsername = body.founder_username
        let founderEmail = body.founder_email
        let founderPhone = body.founder_phone
        let founderWebsite = body.founder_website
        let founderDiscord = body.founder_discord
        let userId: number | null = null

        if (auth) {
          userId = auth.id
          const user = await getUserById(auth.id)
          if (user) {
            founderName = founderName || user.name
            founderUsername = founderUsername || user.username
            founderEmail = founderEmail || user.email
            founderPhone = founderPhone || user.phone
            founderWebsite = founderWebsite || user.website
            founderDiscord = founderDiscord || user.discord
          }
        }

        if (!founderName) {
          founderName = "Anonymous Founder"
        }

        const startup = await createStartup({
          userId,
          founderUsername,
          founderName,
          founderEmail,
          founderPhone,
          founderWebsite,
          founderDiscord,
          name: body.name,
          url: body.url,
          problemSolving: body.problem_solving,
          category: body.category || "Software",
          stage: body.stage || "Prototype",
        })

        res.statusCode = 201
        return res.end(JSON.stringify({ success: true, startup }))
      }

      res.statusCode = 404
      return res.end(JSON.stringify({ error: "API endpoint not found." }))
    } catch (err: any) {
      console.error("API error:", err)
      res.statusCode = 500
      return res.end(JSON.stringify({ error: err.message || "Internal server error." }))
    }
  }
}
