const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFile = path.join(__dirname, 'db', 'sqlite.db');

function resetData() {
  const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error('Open DB error', err.message || err);
    db.serialize(() => {
      db.run('DELETE FROM protein_tracker', (delErr) => {
        if (delErr) { console.error('Delete error', delErr.message || delErr); db.close(); return; }

        const years = [2016,2018,2020,2022,2024,2026];
        const marsPrices = [25,30,35,45,50,60];
        const chickenPrices = [45,49,55,59,69,79];
        const sampleData = [];
        for (let i=0;i<years.length;i++){
          const date = `${years[i]}-05-08`;
          sampleData.push([date, '戰神 Mars 乳清 (35g)', marsPrices[i]]);
          sampleData.push([date, '超商即食雞胸肉 (180g)', chickenPrices[i]]);
        }

        const stmt = db.prepare('INSERT INTO protein_tracker(record_date, item_name, item_price) VALUES (?, ?, ?)');
        for (const r of sampleData) stmt.run(r[0], r[1], r[2], (e)=>{ if(e) console.error('Insert row error', e.message||e); });
        stmt.finalize((finErr)=>{
          if (finErr) console.error('Finalize error', finErr.message || finErr);
          db.all('SELECT record_date, item_name, item_price FROM protein_tracker ORDER BY record_date DESC', (qErr, rows)=>{
            if (qErr) console.error('Query after reset error', qErr.message || qErr);
            else {
              console.log('Reset complete. Total rows:', rows.length);
              const names = [...new Set(rows.map(r=>r.item_name))];
              console.log('Distinct names:', names);
            }
            db.close();
          });
        });
      });
    });
  });
}

resetData();
