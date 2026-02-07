const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');

dotenv.config();


const app = express();
// Trust first proxy (Render, Heroku, etc.) for correct client IP and rate limiting
app.set('trust proxy', 1);

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: JSON.stringify({ error: 'Too many requests from this IP, please try again later.' }),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests from this IP, please try again later.' });
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login attempts per windowMs
  message: JSON.stringify({ error: 'Too many login attempts, please try again after 15 minutes.' }),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many login attempts, please try again after 15 minutes.' });
  }
});

// Apply general rate limiter to all requests
app.use(generalLimiter);

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://lucky-churros-038b55.netlify.app',
  'https://vidyaniketanhapur.in',
  'https://www.vidyaniketanhapur.in',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve thumbnail images publicly (PDFs remain protected)
const isProduction = process.env.NODE_ENV === 'production';
const uploadsPath = isProduction ? '/tmp/uploads' : path.join(__dirname, '../uploads');
app.use('/uploads/thumbnails', express.static(path.join(uploadsPath, 'thumbnails')));

// Passport initialization
app.use(passport.initialize());
require('./config/passport');

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
  
  // Start notification scheduler after DB connection
  const { startNotificationScheduler } = require('./services/notificationScheduler');
  startNotificationScheduler();
})
.catch(err => console.log('MongoDB connection error:', err));

// Routes
// Apply stricter rate limiting to auth routes
const authRouter = require('./routes/authRoutes');
app.use('/api/auth', authLimiter, authRouter);

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/toppers', require('./routes/topperRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error details to server console
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // In production, send generic errors; in development, send detailed errors
  if (process.env.NODE_ENV === 'production') {
    res.status(statusCode).json({
      error: err.message || 'Something went wrong!',
      status: statusCode
    });
  } else {
    // Development mode - include stack trace
    res.status(statusCode).json({
      error: err.message || 'Something went wrong!',
      status: statusCode,
      stack: err.stack,
      details: err
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
