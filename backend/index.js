const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Session setup
app.use(
  session({
    secret: 'simple-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.zip', '.png', '.jpg', '.jpeg'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip, .png, .jpg, .jpeg files are allowed'));
    }
  },
});

// Database connection
async function getDBConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const connection = await getDBConnection();
    await connection.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password]
    );
    await connection.end();
    res.json({ message: 'User registered' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const connection = await getDBConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    await connection.end();
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.user = { id: rows[0].id, username: rows[0].username };
    res.json({ message: 'Logged in', user: req.session.user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

// Get current user
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
});

// Upload module
app.post('/api/modules', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'images', maxCount: 4 }]), async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { title, description, long_description } = req.body;
  if (!title || !description || !req.files.file) {
    return res.status(400).json({ error: 'Title, description, and .zip file required' });
  }
  const file_path = `/uploads/${req.files.file[0].filename}`;
  try {
    const connection = await getDBConnection();
    const [result] = await connection.execute(
      'INSERT INTO modules (title, description, long_description, author, file_path, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, long_description || '', req.session.user.username, file_path, req.session.user.id]
    );
    const moduleId = result.insertId;
    if (req.files.images) {
      for (const img of req.files.images) {
        await connection.execute(
          'INSERT INTO images (module_id, file_path) VALUES (?, ?)',
          [moduleId, `/uploads/${img.filename}`]
        );
      }
    }
    await connection.end();
    res.json({ message: 'Module uploaded' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all modules
app.get('/api/modules', async (req, res) => {
  try {
    const connection = await getDBConnection();
    const [rows] = await connection.execute('SELECT * FROM modules');
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single module with images
app.get('/api/modules/:id', async (req, res) => {
  try {
    const connection = await getDBConnection();
    const [modules] = await connection.execute('SELECT * FROM modules WHERE id = ?', [req.params.id]);
    if (modules.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Module not found' });
    }
    const [images] = await connection.execute('SELECT file_path FROM images WHERE module_id = ?', [req.params.id]);
    await connection.end();
    res.json({ ...modules[0], images: images.map(img => img.file_path) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Download module by ID
app.get('/api/modules/:id/download', async (req, res) => {
  try {
    const connection = await getDBConnection();
    const [rows] = await connection.execute('SELECT file_path FROM modules WHERE id = ?', [req.params.id]);
    await connection.end();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    const filePath = path.join(__dirname, rows[0].file_path.replace('/uploads/', 'uploads/'));
    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));