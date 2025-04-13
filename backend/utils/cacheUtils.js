const { clearCache } = require('../middleware/cache');

// Safe version of clearCache that won't throw errors
exports.safeClearCache = (key) => {
  try {
    if (typeof clearCache === 'function') {
      clearCache(key);
      console.log(`Cache cleared for ${key}`);
    } else {
      console.log('Cache clearing function not available');
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}; 