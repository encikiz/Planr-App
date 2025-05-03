const session = require('express-session');
// Iron session import for Vercel compatibility
let ironSession;
try {
  ironSession = require('iron-session');
} catch (error) {
  console.log('Iron session not available, will use express-session as fallback');
}

// Determine if we're in production or Vercel environment
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// Log environment for debugging
console.log('Session configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- VERCEL:', process.env.VERCEL);
console.log('- SESSION_SECRET exists:', !!process.env.SESSION_SECRET);

// Base session configuration for express-session (development)
const baseSessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // Set secure based on environment
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: 'lax',
  }
};

// Iron session configuration for Vercel compatibility (production)
// Ensure password is at least 32 characters for security
const ironSessionConfig = {
  cookieName: 'planr_session',
  password: process.env.SESSION_SECRET,
  ttl: 24 * 60 * 60, // 1 day in seconds
  cookieOptions: {
    secure: isProduction,
    maxAge: 24 * 60 * 60, // 1 day in seconds
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  }
};

// Choose the appropriate session middleware based on environment
let sessionMiddleware;

if (isProduction || isVercel) {
  console.log('Using Iron Session for production/Vercel environment');
  // Use iron-session for Vercel compatibility in production
  try {
    // Ensure the password is at least 32 characters
    if (!process.env.SESSION_SECRET) {
      console.error('ERROR: SESSION_SECRET environment variable is not set!');
      console.error('Iron session requires a secret of at least 32 characters');
      // Fallback to express-session in case of error
      sessionMiddleware = session(baseSessionConfig);
    } else if (process.env.SESSION_SECRET.length < 32) {
      console.error('ERROR: SESSION_SECRET is too short for iron-session!');
      console.error('Iron session requires a secret of at least 32 characters');
      // Fallback to express-session in case of error
      sessionMiddleware = session(baseSessionConfig);
    } else {
      // For Vercel environment, we'll use express-session as a fallback
      // since iron-session has compatibility issues
      console.log('Using express-session for Vercel environment');
      sessionMiddleware = session(baseSessionConfig);
    }
  } catch (error) {
    console.error('Iron Session setup error:', error);
    // Fallback to express-session in case of error
    sessionMiddleware = session(baseSessionConfig);
  }
} else {
  console.log('Using Express Session for development');
  // Use express-session for development
  if (!process.env.SESSION_SECRET) {
    console.error('ERROR: SESSION_SECRET environment variable is not set!');
    console.error('Please set SESSION_SECRET in your .env file');
  }
  sessionMiddleware = session(baseSessionConfig);
}

module.exports = {
  sessionMiddleware,
  sessionConfig: isProduction ? ironSessionConfig : baseSessionConfig
};
