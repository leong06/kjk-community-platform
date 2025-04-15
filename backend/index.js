const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
async function getDBConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

// Test route
app.get('/api/modules', async (req, res) => {
  try {
    const connection = await getDBConnection();
    const [rows] = await connection.execute('SELECT * FROM modules');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));