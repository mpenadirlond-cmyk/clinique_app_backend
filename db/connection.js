const { Pool } = require("pg");

let pool;

async function initDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected");
  }

  return pool;
}

function run(sql, params = []) {
  return pool.query(sql, params);
}

async function get(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

async function all(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows || [];
}

module.exports = {
  initDb,
  run,
  get,
  all
};
