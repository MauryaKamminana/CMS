const NodeCache = require('node-cache');

// Create a new cache instance with standard TTL of 5 minutes (300 seconds)
const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 120
});

module.exports = cache; 