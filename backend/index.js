const express = require('express');
     const cors = require('cors');
     const mysql = require('mysql2/promise');
     const session = require('express-session');
     const multer = require('multer');
     const path = require('path');
     const fs = require('fs');
     const bcrypt = require('bcrypt');
     require('dotenv').config();

     const app = express();
     app.use(cors({ origin: true, credentials: true }));
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
         const hashedPassword = await bcrypt.hash(password, 10);
         await connection.execute(
           'INSERT INTO users (username, password) VALUES (?, ?)',
           [username, hashedPassword]
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
           'SELECT * FROM users WHERE username = ?',
           [username]
         );
         await connection.end();
         if (rows.length === 0) {
           return res.status(401).json({ error: 'Invalid credentials' });
         }
         const isValidPassword = await bcrypt.compare(password, rows[0].password);
         if (!isValidPassword) {
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

     // Update user profile
     app.post('/api/user/update', upload.single('profile_picture'), async (req, res) => {
       if (!req.session.user) {
         return res.status(401).json({ error: 'Not logged in' });
       }
       const { bio } = req.body;
       let profile_picture = null;
       if (req.file) {
         profile_picture = `/uploads/${req.file.filename}`;
       }
       try {
         const connection = await getDBConnection();
         const updates = [];
         const values = [];
         if (bio !== undefined) {
           updates.push('bio = ?');
           values.push(bio);
         }
         if (profile_picture) {
           updates.push('profile_picture = ?');
           values.push(profile_picture);
         }
         if (updates.length === 0) {
           await connection.end();
           return res.status(400).json({ error: 'No updates provided' });
         }
         values.push(req.session.user.id);
         await connection.execute(
           `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
           values
         );
         await connection.end();
         res.json({ message: 'Profile updated' });
       } catch (error) {
         console.error('Profile update error:', error);
         res.status(500).json({ error: 'Server error' });
       }
     });

     // Change user password
     app.post('/api/user/change-password', async (req, res) => {
       if (!req.session.user) {
         return res.status(401).json({ error: 'Not logged in' });
       }
       const { currentPassword, newPassword } = req.body;
       if (!currentPassword || !newPassword) {
         return res.status(400).json({ error: 'Current and new passwords required' });
       }
       try {
         const connection = await getDBConnection();
         const [rows] = await connection.execute(
           'SELECT password FROM users WHERE id = ?',
           [req.session.user.id]
         );
         if (rows.length === 0) {
           await connection.end();
           return res.status(401).json({ error: 'Invalid current password' });
         }
         const isValidPassword = await bcrypt.compare(currentPassword, rows[0].password);
         if (!isValidPassword) {
           await connection.end();
           return res.status(401).json({ error: 'Invalid current password' });
         }
         const hashedNewPassword = await bcrypt.hash(newPassword, 10);
         await connection.execute(
           'UPDATE users SET password = ? WHERE id = ?',
           [hashedNewPassword, req.session.user.id]
         );
         await connection.end();
         res.json({ message: 'Password changed' });
       } catch (error) {
         console.error('Password change error:', error);
         res.status(500).json({ error: 'Server error' });
       }
     });

     // Get user profile and modules
     app.get('/api/users/:username', async (req, res) => {
       try {
         const connection = await getDBConnection();
         const [users] = await connection.execute(
           'SELECT id, username, bio, profile_picture FROM users WHERE username = ?',
           [req.params.username]
         );
         if (users.length === 0) {
           await connection.end();
           return res.status(404).json({ error: 'User not found' });
         }
         const [modules] = await connection.execute(
           'SELECT * FROM modules WHERE user_id = ?',
           [users[0].id]
         );
         await connection.end();
         res.json({ user: users[0], modules });
       } catch (error) {
         console.error('User profile error:', error);
         res.status(500).json({ error: 'Server error' });
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
         const relativePath = rows[0].file_path;
         if (!relativePath.startsWith('/uploads/')) {
           return res.status(400).json({ error: 'Invalid file path' });
         }
         const fileName = path.basename(relativePath);
         const filePath = path.join(__dirname, 'Uploads', fileName);
         if (!fs.existsSync(filePath)) {
           return res.status(404).json({ error: 'File not found on server' });
         }
         res.download(filePath, fileName, (err) => {
           if (err) {
             console.error('Download error:', err);
             if (!res.headersSent) {
               res.status(500).json({ error: 'Error sending file' });
             }
           }
         });
       } catch (error) {
         console.error('Download endpoint error:', error);
         if (!res.headersSent) {
           res.status(500).json({ error: 'Server error' });
         }
       }
     });

     // Get reviews for a module
     app.get('/api/modules/:moduleId/reviews', async (req, res) => {
       try {
         const connection = await getDBConnection();
         const [reviews] = await connection.execute(
           `SELECT r.*, u.username, u.profile_picture
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.module_id = ?
            ORDER BY r.created_at DESC`,
           [req.params.moduleId]
         );
         await connection.end();
         res.json(reviews);
       } catch (error) {
         console.error('Get reviews error:', error);
         res.status(500).json({ error: 'Server error' });
       }
     });

     // Submit a review
     app.post('/api/reviews', async (req, res) => {
       if (!req.session.user) {
         return res.status(401).json({ error: 'Not logged in' });
       }
       const { module_id, rating, review_text } = req.body;
       if (!module_id || !rating) {
         return res.status(400).json({ error: 'Module ID and rating required' });
       }
       if (rating < 0.5 || rating > 5) {
         return res.status(400).json({ error: 'Rating must be between 0.5 and 5' });
       }
       try {
         const connection = await getDBConnection();
         await connection.execute(
           'INSERT INTO reviews (module_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)',
           [module_id, req.session.user.id, rating, review_text || '']
         );
         await connection.end();
         res.json({ message: 'Review submitted' });
       } catch (error) {
         if (error.code === 'ER_DUP_ENTRY') {
           res.status(400).json({ error: 'You have already reviewed this module' });
         } else {
           console.error('Submit review error:', error);
           res.status(500).json({ error: 'Server error' });
         }
       }
     });

     // Serve uploaded files
     app.use('/uploads', express.static('uploads'));

     const PORT = process.env.PORT || 5000;
     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));