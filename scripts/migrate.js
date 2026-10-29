import pg from "pg"
const { Client } = pg

const DATABASE_URL = "postgresql://postgres:Aditya%401060A@db.zjpbrdbdkkzczdwsgizj.supabase.co:6543/postgres"

async function migrate() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log("Connected to Supabase PostgreSQL database.")

    // Create users table
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
    `)
    console.log("Verified 'users' table.")

    // Create startups table
    await client.query(`
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
    `)
    console.log("Verified 'startups' table.")

    // Create indices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_startups_created_at ON startups(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `)
    console.log("Verified indices.")

    // Seed sample startups if table is empty
    const countRes = await client.query("SELECT COUNT(*) FROM startups;")
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log("Seeding initial Reco Labs startups...")
      await client.query(`
        INSERT INTO startups (founder_name, founder_email, founder_website, founder_discord, name, url, problem_solving, category, stage)
        VALUES 
        ('Aditya', 'devadibxr@gmail.com', 'https://recolabs.org', 'adibxr', 'Reco Labs', 'https://recolabs.org', 'Fragmented developer education and paywalls prevent young high-schoolers from shipping real code and hardware.', 'Education & Tooling', 'Live'),
        ('Tanish', 'tanish@recolabs.org', 'https://github.com/recoorg', 'tanish_reco', 'HexTrace', 'https://github.com/recoorg/hextrace', 'Reverse engineering game binaries and microcontrollers lacks beginner-friendly visual memory inspectors.', 'Security & Reversing', 'Beta'),
        ('Karan', 'karan@guild.reco', 'https://karan.build', 'karan_b', 'Breadboard OS', 'https://github.com/recoorg/breadboard-os', 'Microcontroller hardware firmware updates require cumbersome serial cables and expensive flashing jigs.', 'Hardware & IoT', 'Prototype');
      `)
      console.log("Seeded initial startups.")
    }

    const testList = await client.query("SELECT id, name, founder_name, url FROM startups;")
    console.log("Current startups in database:", testList.rows)

    await client.end()
    console.log("Migration complete!")
  } catch (err) {
    console.error("Migration error:", err)
    process.exit(1)
  }
}

migrate()
