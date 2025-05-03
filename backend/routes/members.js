/**
 * Members API routes - Redirects to users routes for backward compatibility
 * This file exists to maintain compatibility with any code that might be using /api/members
 * All requests are redirected to the equivalent /api/users endpoint
 */
const express = require('express');
const router = express.Router();

// Redirect all requests to the equivalent users endpoint
router.all('*', (req, res, next) => {
  console.log(`Redirecting request from /api/members${req.url} to /api/users${req.url}`);
  
  // Change the URL to point to /api/users instead of /api/members
  req.url = `/api/users${req.url}`;
  
  // Forward the request to the next middleware
  next('route');
});

module.exports = router;
