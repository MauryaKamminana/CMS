const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Default TTL: 5 minutes

// Cache middleware
exports.cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log(`Cache hit for ${key}`);
      return res.json(cachedResponse);
    }

    // Store the original send method
    const originalSend = res.json;

    // Override the send method
    res.json = function(body) {
      if (res.statusCode === 200) {
        console.log(`Caching response for ${key}`);
        cache.set(key, body, duration);
      }
      originalSend.call(this, body);
    };

    next();
  };
};

// Clear cache
exports.clearCache = (key) => {
  if (key) {
    console.log(`Clearing cache for ${key}`);
    cache.del(key);
  } else {
    console.log('Clearing all cache');
    cache.flushAll();
  }
}; 