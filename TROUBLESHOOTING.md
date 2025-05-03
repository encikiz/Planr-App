# Planr Application Troubleshooting Guide

This guide will help you resolve common issues when starting or running the Planr application. It covers environment setup, application startup, runtime issues, and deployment concerns.

## Common Startup Issues

### 1. "Node.js is not installed or not in your PATH"

**Problem:** The startup script cannot find Node.js.

**Solution:**
- Install Node.js from [https://nodejs.org/](https://nodejs.org/) (version 16 or higher recommended)
- Make sure Node.js is added to your system PATH
- Restart your command prompt or terminal after installation
- Try running `node --version` to verify Node.js is installed correctly

### 2. "Backend directory not found"

**Problem:** The startup script cannot find the backend directory.

**Solution:**
- Make sure you're running the script from the root directory of the project
- Check if the backend directory exists in the project folder
- If the directory structure is different, modify the startup scripts accordingly

### 3. "server.js not found in backend directory"

**Problem:** The main server file is missing or has a different name.

**Solution:**
- Check if server.js exists in the backend directory
- If it has a different name, update the startup scripts to use the correct filename

### 4. "Cannot connect to MongoDB"

**Problem:** The application cannot connect to the MongoDB database.

**Solution:**
- Check if your MongoDB connection string in the .env file is correct
- Verify that your MongoDB Atlas account is active and the database is running
- Check if your IP address is whitelisted in MongoDB Atlas
- Try connecting to the database using MongoDB Compass or another tool
- Ensure your MongoDB version is compatible (MongoDB Atlas is recommended)
- Check for network restrictions that might block MongoDB connections

### 5. "Port 5000 is already in use"

**Problem:** Another application is already using port 5000.

**Solution:**
- Find and close the application using port 5000
- Modify the PORT variable in backend/server.js to use a different port
- Update the startup scripts to reflect the new port

## Running the Application Manually

If the startup scripts don't work, you can try running the application manually:

1. Open a command prompt or terminal
2. Navigate to the project root directory
3. Run the following commands:

```
cd backend
node server.js
```

## Checking for Errors

If the application starts but doesn't work correctly:

1. Check the console output for error messages
2. Look for errors in the browser console (F12 in most browsers)
3. Verify that all required environment variables are set in the .env file
4. Check if all dependencies are installed by running `npm install` in the backend directory

## Environment-Specific Issues

### Development vs. Production Environment

**Problem:** The application behaves differently in development and production environments.

**Solution:**
- Check the NODE_ENV environment variable (should be "development" or "production")
- Verify that the .env file has the correct configuration for your environment
- Review the environment-aware configurations in:
  - config/session.js (session handling - express-session vs iron-session)
  - config/passport.js (authentication - different callback URLs)
  - utils/jwt-auth.js (JWT authentication middleware)
  - utils/vercel-auth.js (Vercel-specific authentication handlers)
  - server.js (API routes and middleware)

### Authentication System Changes

**Problem:** Authentication behaves differently after recent updates.

**Solution:**
- The application now uses a dual authentication system:
  - Session-based authentication for browser interactions
  - JWT-based authentication for API calls
- Both methods are checked when verifying authentication
- Make sure your SESSION_SECRET is at least 32 characters long
- Check that cookies are not being blocked by the browser
- JWT tokens are automatically set when logging in

### Google OAuth Issues

**Problem:** Google authentication doesn't work or redirects incorrectly.

**Solution:**
- Verify your Google OAuth credentials in the .env file
- Check that the callback URL in Google Cloud Console matches your environment:
  - Development: http://localhost:5000/api/auth/google/callback
  - Production: https://your-domain.com/api/auth/google/callback
- Review the passport.js configuration for environment-specific settings
- Check browser console for CORS or redirect errors

### Session Management Issues

**Problem:** Users are unexpectedly logged out or session data is lost.

**Solution:**
- Ensure SESSION_SECRET is at least 32 characters long
- Check that cookies are not being blocked by the browser
- Verify the session configuration in config/session.js
- In production, ensure iron-session is properly configured
- Check that both JWT and session cookies are being set correctly

### API Endpoint Changes

**Problem:** API requests are failing after recent updates.

**Solution:**
- The application now uses standardized API endpoints:
  - `/api/users` for all user/team member related functionality
  - `/api/templates` for template-related functionality
  - `/api/settings` for user and application settings
- A compatibility layer redirects `/api/members` requests to `/api/users`
- Check your frontend code to ensure it's using the correct endpoints
- All API endpoints now require proper authentication (session or JWT)
- Guest users have view-only access and cannot modify data

## Deployment Issues

### Vercel Deployment

**Problem:** Application works locally but not when deployed to Vercel.

**Solution:**
- Verify all environment variables are set in the Vercel dashboard
- Check that the vercel.json file is properly configured
- Review the Vercel build logs for specific errors
- Ensure the application is using iron-session in production

## Getting Help

If you continue to experience issues:

1. Check the project documentation for specific requirements
2. Search for similar issues in the project's issue tracker
3. Contact the project maintainer for assistance
4. Review the server logs for detailed error messages
5. Check the browser console (F12) for frontend errors
