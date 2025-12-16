const { Pool } = require('pg');

let pool;

function _sslOptionFromMode(mode) {
  if (!mode) return null;
  const m = mode.toLowerCase();
  if (m === 'disable') return false;
  if (m === 'verify-full') return { rejectUnauthorized: true };
  // 'require' and 'no-verify' are commonly used; default to no verification for compatibility
  return { rejectUnauthorized: false };
}

function _parseSslModeFromConnStr(connStr) {
  try {
    const m = connStr.match(/[?&]sslmode=([^&]+)/i);
    return m ? m[1] : null;
  } catch (e) {
    return null;
  }
}

function createPoolFor(connStr) {
  // Pick SSL mode from env `PGSSLMODE`, then from connection string `sslmode`,
  // otherwise infer from hostname (disable for localhost).
  const envSsl = process.env.PGSSLMODE;
  const connStrSsl = _parseSslModeFromConnStr(connStr);
  const useSslByHost = !/localhost|127\.0\.0\.1/.test(connStr);

  let sslOpt = null;
  if (envSsl) sslOpt = _sslOptionFromMode(envSsl);
  else if (connStrSsl) sslOpt = _sslOptionFromMode(connStrSsl);
  else if (useSslByHost) sslOpt = { rejectUnauthorized: false };
  else sslOpt = false;

  const opts = { connectionString: connStr };
  if (sslOpt !== false && sslOpt !== null) opts.ssl = sslOpt;
  return new Pool(opts);
}

function ensurePool() {
  if (!pool) {
    const connStr = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (!connStr) {
      throw new Error('DATABASE_URL or NEON_DATABASE_URL is not set');
    }
    pool = createPoolFor(connStr);
  }
  return pool;
}

// Convert sqlite-style ? placeholders to $1, $2 for pg
function convertPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => '$' + (++i));
}

async function initDb() {
  try {
    const p = ensurePool();
    // simple test
    await p.query('SELECT 1');
    return p;
  } catch (err) {
    // If connection refused and we used localhost, try 127.0.0.1 as fallback (Windows IPv6/IPv4 issue)
    if (err && err.code === 'ECONNREFUSED' && process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
      const fallback = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
      console.warn('Initial DB connection failed with ECONNREFUSED; retrying with 127.0.0.1');
      if (pool) {
        try { await pool.end(); } catch (e) { /* ignore */ }
        pool = null;
      }
      // fallback is local, do not force SSL for 127.0.0.1
      pool = createPoolFor(fallback);
      await pool.query('SELECT 1');
      return pool;
    }
    throw err;
  }
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
