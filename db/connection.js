const path = require('path');

// If DATABASE_URL is provided, use pg Pool (Postgres). Otherwise fall back to sqlite3.
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  async function initDb() {
    // For Postgres we just ensure the pool is ready. Schema creation/migration should be handled separately.
    return pool;
  }

  async function run(sql, params = []) {
    const r = await pool.query(sql, params);
    return r;
  }

  async function get(sql, params = []) {
    const r = await pool.query(sql, params);
    return r.rows && r.rows[0] ? r.rows[0] : null;
  }

  async function all(sql, params = []) {
    const r = await pool.query(sql, params);
    return r.rows || [];
  }

  module.exports = { initDb, run, get, all };

} else {
  const sqlite3 = require('sqlite3').verbose();
  let db;

  // Initialize database connection (SQLite)
  function initDb() {
    return new Promise((resolve, reject) => {
      db = new sqlite3.Database(path.join(__dirname, '../../clinique.db'), (err) => {
        if (err) reject(err);
        else resolve(db);
      });
    });
  }

  // Generic run query
  function run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  // Generic get query
  function get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Generic all query
  function all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  module.exports = { initDb, run, get, all };
}
