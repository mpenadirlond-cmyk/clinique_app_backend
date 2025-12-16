require('dotenv').config();
const db = require('./connection');

(async () => {
  try {
    const pool = await db.initDb();
    console.log('DB connection OK');
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
    process.exit(0);
  } catch (err) {
    console.error('DB connection failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
