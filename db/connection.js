const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

// Initialize database connection
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

module.exports = {
  initDb,
  run,
  get,
  all
};
