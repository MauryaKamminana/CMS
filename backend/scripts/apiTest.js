const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testAPI() {
  console.log('Testing API connectivity...');
  
  try {
    // Test health endpoint
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('Health endpoint:', healthResponse.data);
    
    // Test debug endpoint
    const debugResponse = await axios.get(`${API_URL}/api/debug`);
    console.log('Debug endpoint:', debugResponse.data);
    
    console.log('API tests passed successfully!');
  } catch (error) {
    console.error('API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAPI(); 