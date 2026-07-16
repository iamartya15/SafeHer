require('dotenv').config();

// Validate required environment variables at startup
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  console.error(`CRITICAL CONFIGURATION ERROR: Missing environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('./middlewares/xssMiddleware');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { logger } = require('./utils/logger');
const { sendSuccess } = require('./utils/responseHandler');

// Initialize database
connectDB();

const app = express();
app.set("trust proxy", 1);

// Set security headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false // Allow loading images from our local upload server
  })
);

// Compress all responses
app.use(compression());

// Logging middleware with Winston
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev', { stream: logger.stream }));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Cookie parser
app.use(cookieParser());

// Setup CORS - allow credentials and multiple origins (dev/production)
const allowedOrigins = [
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/api\/?$/, '').replace(/\/$/, '') : 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://safeher.live',
  'https://safeher1-s6xf.onrender.com'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xssClean());

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
app.use('/api/map', require('./routes/mapRoutes'));
// Health check and monitoring routes
app.get('/api/health', (req, res) => {
  sendSuccess(res, 'Backend is healthy', {
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.get('/api/status', (req, res) => {
  const dbState = require('mongoose').connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  
  sendSuccess(res, 'System Status', {
    database: states[dbState] || 'unknown',
    memoryUsage: process.memoryUsage(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api', (req, res) => {
  sendSuccess(res, 'SafeHer AI API Server is running.', {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle 404 for API routes
app.use('/api', (req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

// Serve frontend static files in production
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({
      success: true,
      message: "Welcome to SafeHer AI Backend (Frontend not built yet)",
      status: "Running"
    });
  }
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`SafeHer AI Server listening in http://localhost:${PORT}`);
});
