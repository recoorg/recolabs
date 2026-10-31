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
  getNetworkStats,
  listAds,
  listAllAdsAdmin,
  incrementAdClick,
  createAd,
  updateAd,
  deleteAd,
  listStoreLinks,
  listAllStoreLinksAdmin,
  createStoreLink,
  updateStoreLink,
  deleteStoreLink,
  deleteStartup,
  updateStartup,
  listCatalogProjects,
  listAllCatalogProjectsAdmin,
  createCatalogProject,
  updateCatalogProject,
  deleteCatalogProject,
} from "./db.js"

// Anti-misuse security guard: Verifies admin master credentials
function checkAdminAuth(req: IncomingMessage | any): boolean {
  const headerKey = (req.headers && (req.headers["x-admin-key"] || req.headers["admin-key"])) || ""
  const authHeader = (req.headers && req.headers["authorization"]) || ""
  const bearerKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : ""
  const provided = (headerKey || bearerKey || "").trim()

  const validKeys = [
    process.env.ADMIN_SECRET,
    "Tanisha@2026",
    "rawenergon",
    "Aditya@1060A",
    "recolabs2026",
  ].filter(Boolean)

  return validKeys.includes(provided)
}

export async function handleNetworkRequest(req: IncomingMessage | any, res: ServerResponse | any): Promise<void> {
  // CORS & Content-Type
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key, admin-key")
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

    // 9. GET NETWORK STATS: GET /api/network/stats
    if (req.method === "GET" && pathname === "/api/network/stats") {
      const stats = await getNetworkStats()
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, ...stats }))
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


    // 8. ADS LIST: GET /api/network/ads
    if (req.method === "GET" && (pathname === "/api/network/ads" || pathname === "/api/ads")) {
      const placement = searchParams.get("placement") || undefined;
      const ads = await listAds(placement);
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ads }));
      return;
    }

    // 8B. ADMIN ADS LIST (ALL ADS): GET /api/network/admin/ads
    if (req.method === "GET" && (pathname === "/api/network/admin/ads" || pathname === "/api/admin/ads")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Invalid administrative credentials. Access denied." }));
        return;
      }
      const ads = await listAllAdsAdmin();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ads }));
      return;
    }

    // 9. AD CLICK: POST /api/network/ads/click
    if (req.method === "POST" && (pathname === "/api/network/ads/click" || pathname === "/api/ads/click")) {
      const body = await parseBody();
      if (body.id) {
        await incrementAdClick(Number(body.id));
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // 10. CREATE AD (Admin Protected): POST /api/network/ads
    if (req.method === "POST" && (pathname === "/api/network/ads" || pathname === "/api/ads")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to deploy ads." }));
        return;
      }
      const body = await parseBody();
      if (!body.title || !body.destination_url) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Title and destination_url are required." }));
        return;
      }
      const ad = await createAd(body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ad }));
      return;
    }

    // 10B. UPDATE AD (Admin Protected): PUT /api/network/ads/:id or POST /api/network/ads/update
    if (
      (req.method === "PUT" && (pathname.startsWith("/api/network/ads/") || pathname.startsWith("/api/ads/"))) ||
      (req.method === "POST" && (pathname === "/api/network/ads/update" || pathname === "/api/ads/update"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to edit ads." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid ad ID is required." }));
        return;
      }
      const updated = await updateAd(id, body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ad: updated }));
      return;
    }

    // 10C. DELETE AD (Admin Protected): DELETE /api/network/ads/:id or POST /api/network/ads/delete
    if (
      (req.method === "DELETE" && (pathname.startsWith("/api/network/ads/") || pathname.startsWith("/api/ads/"))) ||
      (req.method === "POST" && (pathname === "/api/network/ads/delete" || pathname === "/api/ads/delete"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to delete ads." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid ad ID is required." }));
        return;
      }
      const deleted = await deleteAd(id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted }));
      return;
    }

    // 11. STORE LINKS: GET /api/network/store-links
    if (req.method === "GET" && (pathname === "/api/network/store-links" || pathname === "/api/store-links")) {
      const category = searchParams.get("category") || undefined;
      const links = await listStoreLinks(category);
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, store_links: links }));
      return;
    }

    // 11B. ADMIN STORE LINKS LIST (ALL): GET /api/network/admin/store-links
    if (req.method === "GET" && (pathname === "/api/network/admin/store-links" || pathname === "/api/admin/store-links")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required." }));
        return;
      }
      const links = await listAllStoreLinksAdmin();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, store_links: links }));
      return;
    }

    // 12. CREATE STORE LINK (Admin Protected): POST /api/network/store-links
    if (req.method === "POST" && (pathname === "/api/network/store-links" || pathname === "/api/store-links")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to create store links." }));
        return;
      }
      const body = await parseBody();
      if (!body.title || !body.url) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Title and url are required." }));
        return;
      }
      const link = await createStoreLink(body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, store_link: link }));
      return;
    }

    // 12B. UPDATE STORE LINK (Admin Protected): PUT /api/network/store-links/:id or POST /api/network/store-links/update
    if (
      (req.method === "PUT" && (pathname.startsWith("/api/network/store-links/") || pathname.startsWith("/api/store-links/"))) ||
      (req.method === "POST" && (pathname === "/api/network/store-links/update" || pathname === "/api/store-links/update"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to edit store links." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid store link ID is required." }));
        return;
      }
      const updated = await updateStoreLink(id, body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, store_link: updated }));
      return;
    }

    // 12C. DELETE STORE LINK (Admin Protected): DELETE /api/network/store-links/:id or POST /api/network/store-links/delete
    if (
      (req.method === "DELETE" && (pathname.startsWith("/api/network/store-links/") || pathname.startsWith("/api/store-links/"))) ||
      (req.method === "POST" && (pathname === "/api/network/store-links/delete" || pathname === "/api/store-links/delete"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to delete store links." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid store link ID is required." }));
        return;
      }
      const deleted = await deleteStoreLink(id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted }));
      return;
    }

    // 13. DELETE STARTUP (Admin Protected): DELETE /api/network/startups/:id or POST /api/network/startups/delete
    if (
      (req.method === "DELETE" && (pathname.startsWith("/api/network/startups/") || pathname.startsWith("/api/startups/"))) ||
      (req.method === "POST" && (pathname === "/api/network/startups/delete" || pathname === "/api/startups/delete"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to delete startups." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid startup ID is required." }));
        return;
      }
      const deleted = await deleteStartup(id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted }));
      return;
    }

    // 13B. UPDATE STARTUP (Admin Protected): PUT /api/network/startups/:id or POST /api/network/startups/update
    if (
      (req.method === "PUT" && (pathname.startsWith("/api/network/startups/") || pathname.startsWith("/api/startups/"))) ||
      (req.method === "POST" && (pathname === "/api/network/startups/update" || pathname === "/api/startups/update"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to update startups." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid startup ID is required." }));
        return;
      }
      const updated = await updateStartup(id, body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, startup: updated }));
      return;
    }

    // 14. CATALOG PROJECTS LIST (Public): GET /api/network/projects or GET /api/network/catalog
    if (
      req.method === "GET" &&
      (pathname === "/api/network/projects" || pathname === "/api/projects" || pathname === "/api/network/catalog")
    ) {
      const category = searchParams.get("category") || undefined;
      const projects = await listCatalogProjects(category);
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, projects }));
      return;
    }

    // 14B. ADMIN CATALOG PROJECTS LIST (All): GET /api/network/admin/projects
    if (req.method === "GET" && (pathname === "/api/network/admin/projects" || pathname === "/api/admin/projects")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required." }));
        return;
      }
      const projects = await listAllCatalogProjectsAdmin();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, projects }));
      return;
    }

    // 14C. CREATE CATALOG PROJECT: POST /api/network/projects or POST /api/projects
    if (
      req.method === "POST" &&
      (pathname === "/api/network/projects" || pathname === "/api/projects" || pathname === "/api/network/catalog")
    ) {
      const body = await parseBody();
      if (!body.title || !body.url) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Title and url are required." }));
        return;
      }
      const created = await createCatalogProject(body);
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, project: created }));
      return;
    }

    // 14D. UPDATE CATALOG PROJECT (Admin Protected): PUT /api/network/projects/:id or POST /api/network/projects/update
    if (
      (req.method === "PUT" && (pathname.startsWith("/api/network/projects/") || pathname.startsWith("/api/projects/"))) ||
      (req.method === "POST" && (pathname === "/api/network/projects/update" || pathname === "/api/projects/update"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to edit projects." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid project ID is required." }));
        return;
      }
      const updated = await updateCatalogProject(id, body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, project: updated }));
      return;
    }

    // 14E. DELETE CATALOG PROJECT (Admin Protected): DELETE /api/network/projects/:id or POST /api/network/projects/delete
    if (
      (req.method === "DELETE" && (pathname.startsWith("/api/network/projects/") || pathname.startsWith("/api/projects/"))) ||
      (req.method === "POST" && (pathname === "/api/network/projects/delete" || pathname === "/api/projects/delete"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to delete projects." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid project ID is required." }));
        return;
      }
      const deleted = await deleteCatalogProject(id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted }));
      return;
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
