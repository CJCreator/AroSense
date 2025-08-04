const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// SQLite DB setup
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    relationship TEXT
  )`);
  // Add more tables as needed
});

// Example endpoints
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { id, email, name } = req.body;
  db.run('INSERT INTO users (id, email, name) VALUES (?, ?, ?)', [id, email, name], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`AroSense backend running on port ${PORT}`);
});
