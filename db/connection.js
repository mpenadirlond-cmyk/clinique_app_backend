const { Pool } = require('pg');

let pool;

function ensurePool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

// Convert sqlite-style ? placeholders to $1, $2 for pg
function convertPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => '$' + (++i));
}

async function initDb() {
  const p = ensurePool();
  // simple test
  await p.query('SELECT 1');
  return p;
}

async function run(sql, params = []) {
  const p = ensurePool();
  const q = convertPlaceholders(sql);
  const res = await p.query(q, params);
  return res; // caller can inspect rows if needed
}

async function get(sql, params = []) {
  const p = ensurePool();
  const q = convertPlaceholders(sql);
  const res = await p.query(q, params);
  return res.rows[0] || null;
}

async function all(sql, params = []) {
  const p = ensurePool();
  const q = convertPlaceholders(sql);
  const res = await p.query(q, params);
  return res.rows || [];
}

module.exports = {
  initDb,
  run,
  get,
  all
};
