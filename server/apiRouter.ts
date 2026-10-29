import { IncomingMessage, ServerResponse } from "http"
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

export async function handleNetworkRequest(req: IncomingMessage | any, res: ServerResponse | any): Promise<void> {
  // CORS & Content-Type
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  res.setHeader("Content-Type", "application/json")

  if (req.method === "OPTIONS") {
    res.statusCode = 204
    res.end()
    return
  }

  // Resolve true pathname across Vite local dev and Vercel serverless
  let pathname = ""
  const qRoute = (req as any).query?.route
  if (qRoute) {
    const segs = Array.isArray(qRoute) ? qRoute.join("/") : qRoute
    pathname = `/api/network/${segs}`
  } else if (req.headers && req.headers["x-matched-path"]) {
    pathname = String(req.headers["x-matched-path"])
  } else if (req.url) {
    pathname = new URL(req.url, "http://localhost").pathname
  }
  pathname = pathname.replace(/\/$/, "")

  // Search parameters
  let searchParams = new URLSearchParams()
  if (req.url && req.url.includes("?")) {
    searchParams = new URL(req.url, "http://localhost").searchParams
  } else if ((req as any).query) {
    for (const [k, v] of Object.entries((req as any).query)) {
      if (k !== "route" && typeof v === "string") {
        searchParams.set(k, v)
      }
    }
  }

  // Parse Body helper
  const parseBody = <T = any>(): Promise<T> =>
    new Promise((resolve) => {
      if ((req as any).body && typeof (req as any).body === "object") {
        return resolve((req as any).body as T)
      }
      if (typeof (req as any).body === "string") {
        try {
          return resolve(JSON.parse((req as any).body) as T)
        } catch {
          return resolve({} as T)
        }
      }
      let body = ""
      req.on("data", (chunk: any) => (body += chunk))
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : ({} as T))
        } catch {
          resolve({} as T)
        }
      })
      req.on("error", () => resolve({} as T))
    })

  // Get Auth User helper
  const getAuthUser = () => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null
    const token = authHeader.split(" ")[1]
    return verifyToken(token)
  }

  try {
    await initDb()

    // 1. SIGNUP: POST /api/network/signup
    if (req.method === "POST" && pathname === "/api/network/signup") {
      const body = await parseBody()
      if (!body.email || !body.password || !body.name) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Name, email, and password are required." }))
        return
      }
      const data = await createUser(body)
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, ...data }))
      return
    }

    // 2. LOGIN: POST /api/network/login
    if (req.method === "POST" && pathname === "/api/network/login") {
      const body = await parseBody()
      if (!body.email || !body.password) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Email and password are required." }))
        return
      }
      const data = await loginUser(body)
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, ...data }))
      return
    }

    // 3. OAUTH SYNC: POST /api/network/oauth-sync
    if (req.method === "POST" && pathname === "/api/network/oauth-sync") {
      const body = await parseBody()
      if (!body.email) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Email is required for OAuth." }))
        return
      }
      const data = await syncOAuthUser({
        email: body.email,
        name: body.name || "Builder",
        avatarUrl: body.avatarUrl,
        provider: body.provider === "github" ? "github" : "google",
        preferredUsername: body.preferredUsername,
      })
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, ...data }))
      return
    }

    // 4. GET PROFILE: GET /api/network/profile
    if (req.method === "GET" && pathname === "/api/network/profile") {
      const auth = getAuthUser()
      if (!auth) {
        res.statusCode = 401
        res.end(JSON.stringify({ error: "Unauthorized. Please sign in." }))
        return
      }
      const user = await getUserById(auth.id)
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, user }))
      return
    }

    // 5. UPDATE PROFILE: PUT /api/network/profile
    if (req.method === "PUT" && pathname === "/api/network/profile") {
      const auth = getAuthUser()
      if (!auth) {
        res.statusCode = 401
        res.end(JSON.stringify({ error: "Unauthorized. Please sign in." }))
        return
      }
      const body = await parseBody()
      const updated = await updateUserProfile(auth.id, body)
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, user: updated }))
      return
    }

    // 6. GET BUILDER BY USERNAME: GET /api/network/builder/:username
    if (req.method === "GET" && pathname.startsWith("/api/network/builder/")) {
      const username = pathname.replace("/api/network/builder/", "").trim()
      if (!username) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Username is required." }))
        return
      }
      const user = await getUserByUsername(username)
      if (!user) {
        res.statusCode = 404
        res.end(JSON.stringify({ error: `Builder @${username} not found.` }))
        return
      }
      const startups = await listStartups({ username })
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, user, startups }))
      return
    }

    // 7. GET STARTUPS: GET /api/network/startups
    if (req.method === "GET" && (pathname === "/api/network/startups" || pathname === "/api/network")) {
      const search = searchParams.get("search") || ""
      const category = searchParams.get("category") || "ALL"
      const username = searchParams.get("username") || undefined
      const startups = await listStartups({ search, category, username })
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, count: startups.length, startups }))
      return
    }

    // 8. CREATE STARTUP: POST /api/network/startups
    if (req.method === "POST" && pathname === "/api/network/startups") {
      const body = await parseBody()
      const auth = getAuthUser()

      if (!body.name || !body.url || !body.problem_solving) {
        res.statusCode = 400
        res.end(
          JSON.stringify({
            error: "Startup Name, URL, and Problem Solving description are required.",
          })
        )
        return
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
      res.end(JSON.stringify({ success: true, startup }))
      return
    }

    res.statusCode = 404
    res.end(JSON.stringify({ error: `API endpoint not found: ${req.method} ${pathname}` }))
  } catch (err: any) {
    console.error("API error:", err)
    res.statusCode = 500
    res.end(JSON.stringify({ error: err.message || "Internal server error." }))
  }
}

// Vite middleware adapter
export function createNetworkApiMiddleware() {
  return async function networkApiMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    if (!req.url || !req.url.startsWith("/api/network")) {
      return next()
    }
    await handleNetworkRequest(req, res)
  }
}

// Vercel serverless default export
export default async function vercelHandler(req: any, res: any) {
  await handleNetworkRequest(req, res)
}
