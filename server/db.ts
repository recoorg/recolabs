import pg from "pg"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const { Pool } = pg

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:Aditya%401060A@db.zjpbrdbdkkzczdwsgizj.supabase.co:6543/postgres"
const JWT_SECRET = process.env.JWT_SECRET || "recolabs_jwt_secret_key_2026_super_secure"

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// Auto-init schema if not exists
export async function initDb() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        website TEXT,
        bio TEXT,
        twitter TEXT,
        github TEXT,
        discord TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS startups (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        founder_name TEXT NOT NULL,
        founder_email TEXT,
        founder_phone TEXT,
        founder_website TEXT,
        founder_discord TEXT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        problem_solving TEXT NOT NULL,
        category TEXT DEFAULT 'Software',
        stage TEXT DEFAULT 'Prototype',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_startups_created_at ON startups(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `)
  } finally {
    client.release()
  }
}

// User signup
export async function createUser({
  name,
  email,
  password,
  phone,
  website,
  bio,
  discord,
  github,
}: {
  name: string
  email: string
  password: string
  phone?: string
  website?: string
  bio?: string
  discord?: string
  github?: string
}) {
  const passwordHash = await bcrypt.hash(password, 10)
  const client = await pool.connect()
  try {
    const res = await client.query(
      `INSERT INTO users (name, email, password_hash, phone, website, bio, discord, github)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, phone, website, bio, discord, github, created_at`,
      [name, email.toLowerCase().trim(), passwordHash, phone || null, website || null, bio || null, discord || null, github || null]
    )
    const user = res.rows[0]
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "30d" })
    return { user, token }
  } finally {
    client.release()
  }
}

// User login
export async function loginUser({ email, password }: { email: string; password: string }) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      `SELECT id, name, email, password_hash, phone, website, bio, discord, github, created_at
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    )
    if (res.rows.length === 0) {
      throw new Error("Invalid email or password.")
    }
    const user = res.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      throw new Error("Invalid email or password.")
    }
    delete user.password_hash
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "30d" })
    return { user, token }
  } finally {
    client.release()
  }
}

// Verify token
export function verifyToken(token: string): { id: number; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string }
  } catch {
    return null
  }
}

// Get user profile
export async function getUserById(id: number) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      `SELECT id, name, email, phone, website, bio, discord, github, created_at
       FROM users WHERE id = $1`,
      [id]
    )
    return res.rows[0] || null
  } finally {
    client.release()
  }
}

// Update profile
export async function updateUserProfile(
  id: number,
  {
    name,
    phone,
    website,
    bio,
    discord,
    github,
  }: {
    name?: string
    phone?: string
    website?: string
    bio?: string
    discord?: string
    github?: string
  }
) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      `UPDATE users
       SET name = COALESCE($2, name),
           phone = $3,
           website = $4,
           bio = $5,
           discord = $6,
           github = $7,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, email, phone, website, bio, discord, github, updated_at`,
      [id, name, phone || null, website || null, bio || null, discord || null, github || null]
    )
    return res.rows[0]
  } finally {
    client.release()
  }
}

// List startups
export async function listStartups({ search, category }: { search?: string; category?: string } = {}) {
  const client = await pool.connect()
  try {
    let query = `
      SELECT s.id, s.name, s.url, s.problem_solving, s.category, s.stage, s.created_at,
             s.founder_name, s.founder_email, s.founder_phone, s.founder_website, s.founder_discord,
             s.user_id,
             u.name as author_name, u.phone as author_phone, u.website as author_website
      FROM startups s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (category && category !== "ALL") {
      params.push(category)
      query += ` AND s.category = $${params.length}`
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`)
      query += ` AND (LOWER(s.name) LIKE $${params.length} OR LOWER(s.problem_solving) LIKE $${params.length} OR LOWER(s.founder_name) LIKE $${params.length})`
    }

    query += ` ORDER BY s.created_at DESC`
    const res = await client.query(query, params)
    return res.rows
  } finally {
    client.release()
  }
}

// Create startup
export async function createStartup({
  userId,
  founderName,
  founderEmail,
  founderPhone,
  founderWebsite,
  founderDiscord,
  name,
  url,
  problemSolving,
  category = "Software",
  stage = "Prototype",
}: {
  userId?: number | null
  founderName: string
  founderEmail?: string | null
  founderPhone?: string | null
  founderWebsite?: string | null
  founderDiscord?: string | null
  name: string
  url: string
  problemSolving: string
  category?: string
  stage?: string
}) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      `INSERT INTO startups (
        user_id, founder_name, founder_email, founder_phone, founder_website, founder_discord,
        name, url, problem_solving, category, stage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId || null,
        founderName,
        founderEmail || null,
        founderPhone || null,
        founderWebsite || null,
        founderDiscord || null,
        name,
        url,
        problemSolving,
        category,
        stage,
      ]
    )
    return res.rows[0]
  } finally {
    client.release()
  }
}
