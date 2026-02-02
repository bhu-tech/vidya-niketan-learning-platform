const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve thumbnail images publicly (PDFs remain protected)
app.use('/uploads/thumbnails', express.static(path.join(__dirname, '../uploads/thumbnails')));

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
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/zoom', require('./routes/zoomRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/toppers', require('./routes/topperRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
