const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const port = 4001;

// PostgreSQL Configuration
const pool = new Pool({
  user: 'postgres',
  password: 'PSP.1',
  host: 'localhost',
  port: 5432,
  database: 'nasda',
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files with correct MIME types
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

app.set('view engine', 'ejs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/gallery')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'Home | NASAD',
    path: '/'
  });
});

app.get('/programs', (req, res) => {
    res.render('pages/programs', {
        title: 'Programs | NASDA',
        path: '/programs'
    });
});


app.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact | NASDA',
    path: '/contact'
  });
});

app.get('/donate', (req, res) => {
  res.render('pages/donate', { 
    title: 'Donate', 
    message: null,
    path: '/donate'
  });
});

app.post('/donate', async (req, res) => {
  const { name, email, amount } = req.body;

  // Validate inputs
  if (!name || !email || !amount || isNaN(amount)) {
    return res.render('pages/donate', { 
      title: 'Donate', 
      message: 'Invalid input. Please try again.',
      path: '/donate'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render('pages/donate', { 
      title: 'Donate', 
      message: 'Please enter a valid email address.',
      path: '/donate'
    });
  }

  try {
    // Insert donation into the database
    await pool.query(
      'INSERT INTO donations (name, email, amount) VALUES ($1, $2, $3)',
      [name, email, parseFloat(amount)]
    );
    res.render('pages/donate', { 
      title: 'Donate', 
      message: 'Thank you for your donation!',
      path: '/donate'
    });
  } catch (err) {
    console.error('Database error:', err);
    let errorMessage = 'Error processing donation. Please try again later.';
    if (err.code === '23505') {
      errorMessage = 'This donation has already been recorded.';
    }
    res.render('pages/donate', { 
      title: 'Donate', 
      message: errorMessage,
      path: '/donate'
    });
  }
});

app.get('/programs/mentorship', (req, res) => {
    console.log('Mentorship route accessed');
    res.render('programs/mentorship', {
        title: 'Mentorship Program'
    });
});

app.get('/events', (req, res) => {
    res.render('pages/events', {
        title: 'Events | NASDA',
        path: '/events'
    });
});

// Blog Routes
app.get('/blog', (req, res) => {
    res.render('pages/blog', {
        title: 'Blogs | NASDA',
        path: '/blog'
    });
});

app.get('/blog/:slug', (req, res) => {
    res.render('pages/blog-single', {
        title: 'Blog Post | NASDA',
        path: '/blog'
    });
});

// About routes
app.get('/about', (req, res) => {
    res.render('pages/about', { 
        title: 'About | ANSAD',
        path: '/about'
    });
});

app.get('/about/core-values', (req, res) => {
    res.render('pages/core-values', { path: '/about/core-values' });
});

app.get('/about/team', (req, res) => {
    res.render('pages/team', { path: '/about/team' });
});

// Gallery Route
app.get('/gallery', (req, res) => {
    res.render('pages/gallery', {
        title: 'Gallery | ANSAD',
        path: '/gallery',
        isAdmin: req.session?.user?.isAdmin || false
    });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

