const axios = require('axios');

async function testEndpoints() {
  console.log('Testing Map Endpoints...');
  const endpoints = [
    '/api/map/gdacs',
    '/api/map/usgs',
    '/api/map/safe-places?bbox=70,10,80,20',
    '/api/map/firms?bbox=70,10,80,20',
    '/api/map/weather?lat=28.7&lon=77.1'
  ];

  for (const ep of endpoints) {
    try {
      const start = Date.now();
      const res = await axios.get(`http://localhost:5000${ep}`);
      const duration = Date.now() - start;
      console.log(`✅ [${duration}ms] ${ep} - Success: ${res.data.success}, Cached: ${res.data.cached}`);
    } catch (error) {
      if (error.response) {
         console.log(`❌ ${ep} - Failed: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else {
         console.log(`❌ ${ep} - Network Error: ${error.message}`);
      }
    }
  }
}

testEndpoints();
