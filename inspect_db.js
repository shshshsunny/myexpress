const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFile = path.join(__dirname, 'db', 'sqlite.db');

const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READONLY, (err) => {
  if (err) return console.error('Open DB error', err.message || err);
  db.all("SELECT record_date, item_name, item_price FROM protein_tracker ORDER BY record_date DESC", (e, rows) => {
    if (e) { console.error('Query error', e.message || e); db.close(); return; }
    console.log('Total rows:', rows.length);
    const names = [...new Set(rows.map(r=>r.item_name))];
    console.log('Distinct item_name:', names);
    console.log('Sample rows:');
    console.log(rows.slice(0, 30));
    db.close();
  });
});
