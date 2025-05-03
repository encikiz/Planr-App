/**
 * JWT-based authentication middleware for Vercel environment
 */
const { verifyToken } = require('./jwt');

/**
 * JWT authentication middleware
 * This middleware checks for a JWT token in cookies and sets up req.user and req.isAuthenticated
 * to maintain compatibility with Passport.js
 */
const jwtAuth = (req, res, next) => {
  try {
    // Check for JWT in cookies
    const token = req.cookies.jwt;
    
    if (!token) {
      // No token found, user is not authenticated
      req.isAuthenticated = () => false;
      req.user = null;
      return next();
    }
    
    // Verify the token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      // Invalid token
      req.isAuthenticated = () => false;
      req.user = null;
      return next();
    }
    
    // Set user information on request
    req.user = decoded;
    req.isAuthenticated = () => true;
    
    // Add login/logout methods for compatibility with passport
    req.login = (user, done) => {
      req.user = user;
      if (done) done(null);
    };
    
    req.logout = (done) => {
      req.user = null;
      if (done) done(null);
    };
    
    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    // Continue without authentication in case of error
    req.isAuthenticated = () => false;
    req.user = null;
    next();
  }
};

module.exports = jwtAuth;
