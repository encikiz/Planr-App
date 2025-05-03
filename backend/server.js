/**
 * Planr - Project Management Application Server
 *
 * This is the main server file for the Planr application.
 * It sets up Express, connects to MongoDB, configures authentication,
 * and registers API routes.
 *
 * The server is environment-aware and adapts its behavior based on
 * whether it's running in development or production/Vercel.
 */

// Core dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Determine environment for environment-specific behavior
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// Load environment variables from parent directory
// This ensures that the .env file in the root directory is used
// rather than requiring a separate .env file in the backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Passport config
require('./config/passport')(passport);

// Connect to MongoDB with optimized settings for serverless environment
const connectToMongoDB = async () => {
  try {
    // Check if we already have a connection
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    // Connection options optimized for serverless
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
  }
};

// Connect to MongoDB
connectToMongoDB();

const app = express();
const PORT = 5000;

// Middleware Setup
// These middleware functions process incoming requests before they reach route handlers

// CORS - Allow cross-origin requests (important for development and API access)
app.use(cors());

// Body Parser - Parse JSON request bodies
app.use(express.json());

// Cookie Parser - Parse cookies for authentication and session management
app.use(cookieParser());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Import session middleware from the dedicated configuration file
// This is environment-aware and uses different session handling approaches based on the environment:
// - Development: Uses express-session for easier debugging and development
// - Production/Vercel: Uses iron-session for better compatibility with serverless environments
// This approach ensures optimal performance and compatibility in each environment
const { sessionMiddleware } = require('./config/session');

// Apply session middleware - must be before passport initialization
app.use(sessionMiddleware);

// Add JWT authentication middleware for API routes
// This allows both session-based and token-based authentication
// Session-based is used for browser interactions
// Token-based is used for API calls and Vercel environment
const jwtAuth = require('./utils/jwt-auth');
app.use('/api', jwtAuth);

// Debug middleware for session (only in development)
if (!isProduction) {
  app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session:', req.session);
    next();
  });
}

// Passport middleware - must be after session
app.use(passport.initialize());
app.use(passport.session());

// Auth routes - register after passport
console.log('Registering auth routes');
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Note: Auth routes are registered separately because they need to be registered
// immediately after the passport middleware

// Static files
// This allows the backend to serve the frontend files directly
// No separate frontend server is needed - the Express server handles both API and static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Auth middleware
const { ensureAuth, ensureEditPermission } = require('./middleware/auth');

// Helper function to read JSON data
const readJsonFile = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write JSON data
const writeJsonFile = (filename, data) => {
  const filePath = path.join(__dirname, 'data', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Routes for projects are now handled by MongoDB
// See routes/projects.js

// Routes for tasks are now handled by MongoDB
// See routes/tasks.js

// Routes for team members are now handled by MongoDB
// See routes/users.js

// Progress data is now stored directly in the project document
// See routes/projects.js

// Routes for milestones are now handled by MongoDB
// See routes/milestones.js

// Register API routes (auth routes are registered separately above)
// This approach uses a centralized route registration pattern for better maintainability
// It makes it easier to add, remove, or modify routes in the future
// The array-based approach also provides better error handling and logging

// Define available routes
const availableRoutes = [
  { path: '/api/projects', module: './routes/projects' },
  { path: '/api/tasks', module: './routes/tasks' },
  { path: '/api/milestones', module: './routes/milestones' },
  { path: '/api/users', module: './routes/users' },  // User management endpoints
  { path: '/api/teams', module: './routes/teams' },   // Team management endpoints
  { path: '/api/templates', module: './routes/templates' }, // Template endpoints
  { path: '/api/settings', module: './routes/settings' },   // Settings endpoints
  { path: '/api/members', module: './routes/members' }      // Redirects to /api/users for backward compatibility
];

// Register each route with error handling
availableRoutes.forEach(route => {
  console.log(`Registering route: ${route.path} -> ${route.module}`);
  try {
    // For Vercel environment, use a different path resolution approach
    if (isVercel) {
      const modulePath = path.join(__dirname, route.module.replace('./', '/'));
      console.log(`Vercel environment: Loading module from ${modulePath}`);
      app.use(route.path, require(modulePath));
    } else {
      app.use(route.path, require(route.module));
    }
  } catch (error) {
    console.warn(`Could not load module ${route.module}:`, error.message);
    // Log the error but continue loading other routes
    // This prevents one bad route from crashing the entire application
  }
});

// Debug route to test auth routes
app.get('/test-auth', (req, res) => {
  res.send('<h1>Auth Test</h1><p>Click the links below to test auth routes:</p><ul><li><a href="/api/auth/guest">Guest Login</a></li><li><a href="/api/auth/google">Google Login</a></li></ul>');
});

// Debug route to check all registered routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if(middleware.route) { // routes registered directly on the app
      routes.push(middleware.route.path);
    } else if(middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach(handler => {
        if(handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods).join(', ');
          routes.push(`${methods.toUpperCase()} ${middleware.regexp} ${path}`);
        }
      });
    }
  });
  res.json(routes);
});

// Login page route
app.get('/login', (req, res) => {
  console.log('Login route accessed');
  const loginPath = path.join(__dirname, '../frontend/login.html');
  console.log('Login file path:', loginPath);
  res.sendFile(loginPath);
});

// Test login page route
app.get('/test-login', (req, res) => {
  console.log('Test login route accessed');
  const testLoginPath = path.join(__dirname, '../frontend/test-login.html');
  console.log('Test login file path:', testLoginPath);
  res.sendFile(testLoginPath);
});

// Serve the frontend for authenticated routes
app.get('/', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve other pages with authentication
app.get('/pages/*', ensureAuth, (req, res) => {
  const requestedPath = path.join(__dirname, '../frontend', req.path);
  res.sendFile(requestedPath);
});

// Fallback route
app.get('*', (req, res) => {
  console.log(`404 Not Found: ${req.originalUrl}`);
  res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
