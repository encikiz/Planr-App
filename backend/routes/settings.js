/**
 * Settings API routes
 * Provides endpoints for user and application settings
 */
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/api-optimization');
const User = require('../models/User');

// Default application settings
const defaultSettings = {
  theme: 'light',
  notifications: true,
  emailNotifications: true,
  language: 'en',
  timezone: 'UTC'
};

/**
 * @route   GET /api/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/', ensureAuth, asyncHandler(async (req, res) => {
  try {
    // If user is authenticated, try to get their settings
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      
      if (user && user.settings) {
        return res.json(user.settings);
      }
    }
    
    // If no user or no settings, return default settings
    res.json(defaultSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
}));

/**
 * @route   PUT /api/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put('/', ensureAuth, asyncHandler(async (req, res) => {
  try {
    const { theme, notifications, emailNotifications, language, timezone } = req.body;
    
    // Validate settings
    const updatedSettings = {};
    
    if (theme) updatedSettings.theme = theme;
    if (notifications !== undefined) updatedSettings.notifications = notifications;
    if (emailNotifications !== undefined) updatedSettings.emailNotifications = emailNotifications;
    if (language) updatedSettings.language = language;
    if (timezone) updatedSettings.timezone = timezone;
    
    // If user is authenticated, update their settings
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      
      if (user) {
        // Update user settings
        user.settings = {
          ...user.settings,
          ...updatedSettings
        };
        
        await user.save();
        return res.json(user.settings);
      }
    }
    
    // If no user, return the updated settings without saving
    res.json({
      ...defaultSettings,
      ...updatedSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
}));

/**
 * @route   GET /api/settings/app
 * @desc    Get application settings
 * @access  Public
 */
router.get('/app', asyncHandler(async (req, res) => {
  // Application settings that are safe to expose publicly
  const appSettings = {
    appName: 'Planr',
    appVersion: '1.0.0',
    features: {
      guestAccess: true,
      darkMode: true,
      templates: true
    }
  };
  
  res.json(appSettings);
}));

module.exports = router;
