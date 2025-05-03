/**
 * API optimization utilities for caching, pagination, and error handling
 */

/**
 * Set cache headers for API responses
 * @param {Object} res - Express response object
 * @param {Number} maxAge - Cache max age in seconds
 */
const setCacheHeaders = (res, maxAge = 60) => {
  // Only cache in production
  if (process.env.NODE_ENV === 'production') {
    res.set('Cache-Control', `public, max-age=${maxAge}`);
  } else {
    // Disable caching in development
    res.set('Cache-Control', 'no-store');
  }
};

/**
 * Create a paginated response for MongoDB queries
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query object
 * @param {Object} options - Pagination options
 * @returns {Object} Paginated response
 */
const paginatedResponse = async (model, query, options) => {
  const {
    page = 1,
    limit = 10,
    select,
    populate = [],
    sort = { updatedAt: -1 }
  } = options;

  const skip = (page - 1) * limit;

  // Execute query with pagination
  const data = await model.find(query)
    .select(select)
    .populate(populate)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  // Get total count for pagination
  const total = await model.countDocuments(query);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Error handler for async routes
 * Wraps async route handlers to catch errors and pass them to Express error handler
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  setCacheHeaders,
  paginatedResponse,
  asyncHandler
};
