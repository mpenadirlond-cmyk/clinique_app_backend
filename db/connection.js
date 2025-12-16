const { Pool } = require("pg");

let pool;

/**
 * Initialise la connexion PostgreSQL (Neon)
 */
async function initDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test de connexion
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected (Neon)");
  }

  return pool;
}

/**
 * S'assure que le pool est initialisé avant toute requête
 */
async function ensurePool() {
  if (!pool) {
    await initDb();
  }
}

/**
 * Exécute une requête SQL (INSERT, UPDATE, DELETE)
 */
async function run(sql, params = []) {
  await ensurePool();
  return pool.query(sql, params);
}

/**
 * Retourne une seule ligne
 */
async function get(sql, params = []) {
  await ensurePool();
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

/**
 * Retourne plusieurs lignes
 */
async function all(sql, params = []) {
  await ensurePool();
  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = {
  initDb,
  run,
  get,
  all
};
