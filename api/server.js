const http = require('http');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visits (
      id         SERIAL PRIMARY KEY,
      visited_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('DB initialized');
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.url === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (req.url === '/api/hello') {
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Hello from the Node.js API' }));
      return;
    }

    if (req.url === '/api/visits' && req.method === 'POST') {
      await pool.query('INSERT INTO visits DEFAULT VALUES');
      const result = await pool.query('SELECT COUNT(*) FROM visits');
      res.writeHead(201);
      res.end(JSON.stringify({ total_visits: parseInt(result.rows[0].count) }));
      return;
    }

    if (req.url === '/api/visits') {
      const result = await pool.query(
        'SELECT * FROM visits ORDER BY visited_at DESC LIMIT 10'
      );
      res.writeHead(200);
      res.end(JSON.stringify({ visits: result.rows }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

initDB().then(() => {
  server.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}).catch(err => {
  console.error('Failed to init DB:', err);
  process.exit(1);
});
