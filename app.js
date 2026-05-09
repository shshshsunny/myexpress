const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');

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

async function openDb() {
  ensureDbDir();
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Failed to open database at', dbFile, '-', err.message || err);
        return reject(err);
      }
      console.log('Successfully opened (or created) sqlite database at', dbFile);
      resolve(db);
    });
  });
}

const app = express();
// allow JSON bodies
app.use(express.json());

// Simple CORS middleware so pages served from other origins (e.g. Live Server) can call the API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve static files from project root (so index.html is available at http://localhost:3000/index.html)
app.use(express.static(__dirname));

// GET /api/prices - return all records ordered by record_date DESC
app.get('/api/prices', async (req, res) => {
  try {
    const db = await openDb();
    const sql = "SELECT record_date, item_name, item_price FROM protein_tracker ORDER BY record_date DESC";
    db.all(sql, (err, rows) => {
      if (err) {
        console.error('Query error', err.message || err);
        res.status(500).json({ error: err.message || err });
      } else {
        res.json(rows);
      }
      db.close((closeErr) => {
        if (closeErr) console.error('Error closing DB', closeErr.message || closeErr);
      });
    });
  } catch (e) {
    console.error('DB open error', e.message || e);
    res.status(500).json({ error: e.message || e });
  }
});

// GET /api/search?name=... - fuzzy search item_name using LIKE
app.get('/api/search', async (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).json({ error: 'Query parameter "name" is required' });
  }

  try {
    const db = await openDb();
    const sql = "SELECT record_date, item_name, item_price FROM protein_tracker WHERE item_name LIKE ? ORDER BY record_date DESC";
    const likePattern = `%${name}%`;
    db.all(sql, [likePattern], (err, rows) => {
      if (err) {
        console.error('Search query error', err.message || err);
        res.status(500).json({ error: err.message || err });
      } else {
        res.json(rows);
      }
      db.close((closeErr) => {
        if (closeErr) console.error('Error closing DB', closeErr.message || closeErr);
      });
    });
  } catch (e) {
    console.error('DB open error', e.message || e);
    res.status(500).json({ error: e.message || e });
  }
});

// POST /api/query or /api - accept JSON body { item_name: "..." } and search
async function handlePostQuery(req, res) {
  const itemName = req.body && req.body.item_name;
  if (!itemName) {
    return res.status(400).json({ error: 'JSON body with "item_name" is required' });
  }

  try {
    const db = await openDb();
    const sql = "SELECT record_date, item_name, item_price FROM protein_tracker WHERE item_name LIKE ? ORDER BY record_date DESC";
    const likePattern = `%${itemName}%`;
    db.all(sql, [likePattern], (err, rows) => {
      if (err) {
        console.error('POST search query error', err.message || err);
        res.status(500).json({ error: err.message || err });
      } else {
        res.json(rows);
      }
      db.close((closeErr) => {
        if (closeErr) console.error('Error closing DB', closeErr.message || closeErr);
      });
    });
  } catch (e) {
    console.error('DB open error', e.message || e);
    res.status(500).json({ error: e.message || e });
  }
}

app.post('/api/query', handlePostQuery);
app.post('/api', handlePostQuery);

// GET /api - convenience endpoint: accept ?item_name=... and forward to same handler
app.get('/api', (req, res) => {
  const q = (req.query && (req.query.item_name || req.query.name));
  if (!q) {
    // no filter provided: return all records
    (async () => {
      try {
        const db = await openDb();
        const sql = "SELECT record_date, item_name, item_price FROM protein_tracker ORDER BY record_date DESC";
        db.all(sql, (err, rows) => {
          if (err) {
            console.error('GET /api all query error', err.message || err);
            res.status(500).json({ error: err.message || err });
          } else {
            res.json(rows);
          }
          db.close((closeErr) => {
            if (closeErr) console.error('Error closing DB', closeErr.message || closeErr);
          });
        });
      } catch (e) {
        console.error('DB open error', e.message || e);
        res.status(500).json({ error: e.message || e });
      }
    })();
    return;
  }
  // synthesize body and call handler for filtered query
  const fakeReq = { body: { item_name: q } };
  return handlePostQuery(fakeReq, res);
});

// GET /api/insert?date=...&name=...&price=... - insert a record via query params
app.get('/api/insert', async (req, res) => {
  const date = req.query && req.query.date;
  const name = req.query && req.query.name;
  const price = req.query && req.query.price;

  if (!date || !name || !price) {
    return res.status(400).send('Missing query parameters: date, name, price are required');
  }

  try {
    const db = await openDb();
    const sql = 'INSERT INTO protein_tracker(record_date, item_name, item_price) VALUES (?, ?, ?)';
    db.run(sql, [date, name, parseInt(price, 10)], function (err) {
      if (err) {
        console.error('GET /api/insert insert error', err.message || err);
        res.status(500).send('Insert failed');
      } else {
        res.send('GET 新增成功');
      }
      db.close((closeErr) => {
        if (closeErr) console.error('Error closing DB', closeErr.message || closeErr);
      });
    });
  } catch (e) {
    console.error('DB open error', e.message || e);
    res.status(500).send('DB open error');
  }
});

// POST /api/insert - insert a record via JSON body { date, name, price }
app.post('/api/insert', async (req, res) => {
  const date = req.body && req.body.date;
  const name = req.body && req.body.name;
  const price = req.body && req.body.price;

  if (!date || !name || price === undefined) {
    return res.status(400).send('Missing JSON body fields: date, name, price are required');
  }

  try {
    const db = await openDb();
    const sql = 'INSERT INTO protein_tracker(record_date, item_name, item_price) VALUES (?, ?, ?)';
    db.run(sql, [date, name, parseInt(price, 10)], function (err) {
      if (err) {
        console.error('POST /api/insert insert error', err.message || err);
        res.status(500).send('Insert failed');
      } else {
        res.send('POST 新增物價紀錄成功');
      }
      db.close((closeErr) => {
        if (closeErr) console.error('Error closing DB', closeErr.message || closeErr);
      });
    });
  } catch (e) {
    console.error('DB open error', e.message || e);
    res.status(500).send('DB open error');
  }
});

// Simple startup check when this module is run directly
if (require.main === module) {
  (async () => {
    try {
      const db = await openDb();
      // quick sanity query
      db.get("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1", (err, row) => {
        if (err) console.error('Sanity query failed', err.message || err);
        else console.log('Sanity query result (one table):', row);
        db.close((closeErr) => {
          if (closeErr) console.error('Error closing DB', closeErr.message || closeErr);
          else console.log('Closed database');
        });
      });

      // start server for manual testing
      const port = process.env.PORT || 3000;
      app.listen(port, () => console.log(`App listening on port ${port}`));
    } catch (e) {
      console.error('Database open failed', e.message || e);
      process.exitCode = 1;
    }
  })();
}

module.exports = { openDb, app };
