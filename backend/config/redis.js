const redis = require('redis');

// Create Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
(async () => {
  client.on('error', (err) => console.log('Redis Client Error', err));
  client.on('connect', () => console.log('Connected to Redis'));
  
  await client.connect();
})();

module.exports = client; 