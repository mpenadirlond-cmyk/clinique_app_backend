const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'clinique.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) { console.error('OPEN_ERR', err); process.exit(1); }
});

db.all('SELECT * FROM lab_tests ORDER BY name', (err, rows) => {
  if (err) { console.error('ERR', err); process.exit(1); }
  console.log(JSON.stringify(rows, null, 2));
  db.close();
});
