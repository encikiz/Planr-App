const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function(passport) {
  // Log environment variables for debugging (masking sensitive info)
  console.log('Passport configuration:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- VERCEL:', process.env.VERCEL);
  console.log('- GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('- GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);

  // Determine the callback URL based on environment
  const productionUrl = process.env.PRODUCTION_URL || 'https://planr-five.vercel.app';
  const port = process.env.PORT || 5000;
  const callbackURL = process.env.NODE_ENV === 'production'
    ? `${productionUrl}/api/auth/google/callback`
    : `http://localhost:${port}/api/auth/google/callback`;

  console.log('- Using callback URL:', callbackURL);

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
        proxy: true // Enable proxy for Vercel environment
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, return the user
            done(null, user);
          } else {
            // Create new user
            const newUser = {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0].value,
              role: 'user'
            };

            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
