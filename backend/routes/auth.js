/**
 * Authentication Routes
 *
 * This file handles all authentication-related routes including:
 * - Google OAuth authentication
 * - Guest user access
 * - User information retrieval
 * - Logout functionality
 *
 * The authentication system uses a dual approach:
 * 1. Session-based authentication (Passport.js) for browser interactions
 * 2. JWT-based authentication for API calls and Vercel compatibility
 *
 * Both methods are used together to ensure maximum compatibility across
 * different environments and use cases.
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// Determine environment for environment-specific behavior
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// Debug middleware for auth routes
router.use((req, res, next) => {
  console.log(`Auth route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Test route
router.get('/test', (req, res) => {
  console.log('Auth test route accessed');
  res.json({ message: 'Auth routes are working!' });
});

// @route   GET /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google', (req, res, next) => {
  console.log('Google auth route accessed');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback', (req, res, next) => {
  console.log('Google callback route accessed');
  passport.authenticate('google', { failureRedirect: '/login' }, (err, user, info) => {
    console.log('Google auth callback executed');
    if (err) {
      console.error('Google auth error:', err);
      return next(err);
    }
    if (!user) {
      console.log('Google auth failed, no user returned');
      return res.redirect('/login');
    }

    // Log session before login
    console.log('Session before login:', req.session);

    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }

      // Generate JWT token for API authentication
      const token = generateToken(user);

      // Set JWT as cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'lax'
      });

      // Log session after login
      console.log('Session after login:', req.session);
      console.log('User authenticated successfully:', user.name);
      console.log('JWT token generated for API authentication');

      return res.redirect('/');
    });
  })(req, res, next);
});

// @route   GET /api/auth/guest
// @desc    Login as guest
// @access  Public
router.get('/guest', async (req, res) => {
  console.log('Guest login route accessed');
  try {
    // Find existing guest user or create a new one if none exists
    let guestUser = await User.findOne({
      email: 'shared-guest@planr.app',
      isGuest: true
    });

    if (!guestUser) {
      // Create a permanent shared guest user
      guestUser = await User.create({
        name: 'Guest User',
        email: 'shared-guest@planr.app',
        isGuest: true,
        role: 'Guest',
        avatar: 'https://ui-avatars.com/api/?name=Guest&background=808080&color=fff'
      });
      console.log('Shared guest user created in database:', guestUser);
    } else {
      console.log('Using existing shared guest account');
    }

    // Log the user in using passport
    req.login(guestUser, (err) => {
      if (err) {
        console.error('Guest login error:', err);
        return res.status(500).json({ error: 'Login error' });
      }

      // Generate JWT token for API authentication
      const token = generateToken(guestUser);

      // Set JWT as cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'lax'
      });

      console.log('Guest user logged in successfully');
      console.log('Session after guest login:', req.session);
      console.log('JWT token generated for guest user');

      // Redirect to dashboard
      res.redirect('/');
    });
  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/auth/user
// @desc    Get current user
// @access  Private
router.get('/user', (req, res) => {
  console.log('User route accessed');
  console.log('Session:', req.session);
  console.log('User:', req.user);

  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// @route   GET /api/auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }

    // Clear session
    if (req.session) {
      req.session.destroy();
    }

    // Clear JWT cookie
    res.clearCookie('jwt');

    console.log('User logged out, session and JWT cleared');

    res.redirect('/login');
  });
});

module.exports = router;
