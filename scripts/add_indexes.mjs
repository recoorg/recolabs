import pg from "pg";

const pool = new pg.Pool({
  connectionString: "postgresql://postgres.zjpbrdbdkkzczdwsgizj:Aditya%401060A@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log("Connecting to Supabase...");
  const client = await pool.connect();
  console.log("Connected.");
  
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id);
    CREATE INDEX IF NOT EXISTS idx_startups_category ON startups(category);
    CREATE INDEX IF NOT EXISTS idx_startups_created_at ON startups(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_startups_founder_username ON startups(LOWER(founder_username));
  `);
  console.log("All indexes verified and created!");

  const res = await client.query(`
    SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;
  `);
  console.log("Indexes in public schema:");
  console.table(res.rows);

  // Check query plan with EXPLAIN ANALYZE
  const explain = await client.query(`
    EXPLAIN ANALYZE SELECT * FROM startups ORDER BY created_at DESC LIMIT 50;
  `);
  console.log("EXPLAIN ANALYZE startups by created_at DESC:");
  console.log(explain.rows.map(r => r["QUERY PLAN"]).join("\n"));

  client.release();
  await pool.end();
}

run().catch(err => {
  console.error("Error running script:", err);
  process.exit(1);
});
