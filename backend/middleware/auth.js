/**
 * Authentication Middleware
 *
 * This file provides middleware functions for authentication and authorization:
 * - ensureAuth: Ensures the user is authenticated (via session or JWT)
 * - ensureGuest: Ensures the user is NOT authenticated (for login pages)
 * - ensureEditPermission: Ensures the user has edit permissions (not a guest)
 *
 * The middleware supports both session-based and JWT-based authentication
 * to ensure maximum compatibility across different environments.
 *
 * Guest users have view-only access and cannot modify data.
 */

// Import JWT verification utility
const { verifyToken } = require('../utils/jwt');

// Check if user is authenticated via JWT
const isAuthenticatedViaJWT = (req) => {
  try {
    // Check for JWT in cookies
    const token = req.cookies.jwt;

    if (!token) {
      return false;
    }

    // Verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
      return false;
    }

    // Set user information on request if not already set
    if (!req.user) {
      req.user = decoded;
      req.isAuthenticated = () => true;
    }

    return true;
  } catch (error) {
    console.error('JWT authentication error:', error);
    return false;
  }
};

// Check if user is authenticated
const ensureAuth = (req, res, next) => {
  // First check if user is authenticated via Passport session
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // Then check if user is authenticated via JWT
  if (isAuthenticatedViaJWT(req)) {
    return next();
  }

  // Not authenticated by any method
  res.redirect('/login');
};

// Check if user is NOT authenticated (for login page)
const ensureGuest = (req, res, next) => {
  // First check if user is authenticated via Passport session
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect('/');
  }

  // Then check if user is authenticated via JWT
  if (isAuthenticatedViaJWT(req)) {
    return res.redirect('/');
  }

  // Not authenticated by any method, proceed to login page
  next();
};

/**
 * Check if user has edit permissions (not a guest)
 *
 * This middleware ensures that only authenticated non-guest users can
 * modify data. Guest users have view-only access and cannot create,
 * update, or delete any data in the application.
 *
 * This is important for maintaining data integrity while still allowing
 * users to explore the application's features without creating an account.
 */
const ensureEditPermission = (req, res, next) => {
  // First check if user is authenticated via Passport session
  const isAuthenticated = req.isAuthenticated && req.isAuthenticated();

  // Then check if user is authenticated via JWT if not already authenticated
  const isAuthenticatedJWT = !isAuthenticated && isAuthenticatedViaJWT(req);

  // Combine the results and check user type
  if ((isAuthenticated || isAuthenticatedJWT) && !req.user.isGuest) {
    // User is authenticated and not a guest - allow edit access
    return next();
  } else if ((isAuthenticated || isAuthenticatedJWT) && req.user.isGuest) {
    // User is authenticated but is a guest - deny edit access
    return res.status(403).json({
      error: 'Guest users have view-only access',
      message: 'Guest accounts cannot modify data. Please create a regular account for full access.'
    });
  } else {
    // User is not authenticated - deny access completely
    return res.status(401).json({ error: 'Not authenticated' });
  }
};

module.exports = {
  ensureAuth,
  ensureGuest,
  ensureEditPermission
};
