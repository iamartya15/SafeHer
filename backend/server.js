require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');

// Initialize database
connectDB();

const app = express();

// Set security headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false // Allow loading images from our local upload server
  })
);

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Cookie parser alternative for JWT in bodies, authorization headers, or parse simple cookie headers manually
app.use((req, res, next) => {
  req.cookies = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      req.cookies[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  next();
});

// Setup CORS - allow credentials and multiple origins (dev/production)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://safeher-ai.vercel.app' // Example production URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Setup Static Upload Folders
const publicUploads = path.join(__dirname, 'public', 'uploads');
const publicTemp = path.join(__dirname, 'public', 'temp');

if (!fs.existsSync(publicUploads)) {
  fs.mkdirSync(publicUploads, { recursive: true });
}
if (!fs.existsSync(publicTemp)) {
  fs.mkdirSync(publicTemp, { recursive: true });
}

app.use('/uploads', express.static(publicUploads));

// Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Limit login/register/reset requests
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/guardians', require('./routes/guardianRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check and root route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SafeHer AI API Server is running.',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle 404 routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SafeHer AI Server listening in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
