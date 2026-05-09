const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbDir = path.join(__dirname, 'db');
const dbFile = path.join(dbDir, 'sqlite.db');

function ensureDbDir() {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create db directory', err);
    throw err;
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Failed to open database', dbFile, err.message || err);
        return reject(err);
      }
      console.log('Opened (or created) sqlite database at', dbFile);

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS protein_tracker (
          record_date TEXT,
          item_name TEXT,
          item_price INTEGER
        )`;

      db.run(createTableSQL, (tableErr) => {
        if (tableErr) {
          console.error('Failed to ensure protein_tracker table', tableErr.message || tableErr);
          return reject(tableErr);
        }
        console.log('Ensured protein_tracker table exists');

        // Only insert sample data if table is empty
        // Clear existing data and insert updated 10-year sample data
        db.serialize(() => {
          db.run("DELETE FROM protein_tracker", (delErr) => {
            if (delErr) {
              console.error('Failed to clear protein_tracker', delErr.message || delErr);
              return reject(delErr);
            }

            // Years and dates: 2016,2018,2020,2022,2024,2026 all with month-day 05-08
            const years = [2016, 2018, 2020, 2022, 2024, 2026];
            // Prices for 戰神 Mars 乳清 (35g)
            const marsPrices = [25, 30, 35, 45, 50, 60];
            // Prices for 超商即食雞胸肉 (180g)
            const chickenPrices = [45, 49, 55, 59, 69, 79];

            const sampleData = [];
            for (let i = 0; i < years.length; i++) {
              const date = `${years[i]}-05-08`;
              sampleData.push([date, "戰神 Mars 乳清 (35g)", marsPrices[i]]);
              sampleData.push([date, "超商即食雞胸肉 (180g)", chickenPrices[i]]);
            }

            const stmt = db.prepare("INSERT INTO protein_tracker(record_date, item_name, item_price) VALUES (?, ?, ?)");
            for (const rowData of sampleData) {
              stmt.run(rowData[0], rowData[1], rowData[2]);
            }
            stmt.finalize((finErr) => {
              if (finErr) {
                console.error('Failed to finalize insert statement', finErr.message || finErr);
                return reject(finErr);
              }
              console.log('Replaced protein_tracker with 10-year sample data');
              return resolve(db);
            });
          });
        });
      });
      });
    });
  });
}

let dbInstancePromise = (async () => {
  ensureDbDir();
  const db = await openDatabase();
  return db;
})();

module.exports = dbInstancePromise;
