const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';
let token = '';
let userId = '';
let incidentId = '';
let guardianId = '';

async function runTests() {
  console.log('--- STARTING SAFEHER API VALIDATION ---');
  
  try {
    // 1. Auth: Register
    const email = `test_${Date.now()}@test.com`;
    try {
      const regRes = await axios.post(`${API_BASE}/auth/register`, {
        name: 'Validation User',
        email,
        password: 'Password123!',
        phone: '9999999999'
      });
      console.log(`✅ Auth Register: PASS (${regRes.status})`);
      token = regRes.data.accessToken;
    } catch (e) {
      console.log(`❌ Auth Register: FAIL - ${e.response?.data?.message || e.message}`);
    }

    // 2. Auth: Login
    try {
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password: 'Password123!'
      });
      console.log(`✅ Auth Login: PASS (${loginRes.status})`);
      token = loginRes.data.accessToken;
      userId = loginRes.data.user.id;
    } catch (e) {
      console.log(`❌ Auth Login: FAIL - ${e.response?.data?.message || e.message}`);
    }

    // 3. Auth: Profile (Requires Token)
    try {
      const profRes = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Auth Profile: PASS (${profRes.status})`);
    } catch (e) {
      console.log(`❌ Auth Profile: FAIL - ${e.response?.data?.message || e.message}`);
    }

    // 4. Incidents: Create
    try {
      const incRes = await axios.post(`${API_BASE}/incidents`, {
        category: 'Unsafe Area',
        description: 'Testing API Validation',
        latitude: 28.7,
        longitude: 77.1,
        address: 'Validation Street'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Incidents Create: PASS (${incRes.status})`);
      incidentId = incRes.data.report._id;
    } catch (e) {
      console.log(`❌ Incidents Create: FAIL - ${e.response?.data?.message || e.message}`);
    }

    // 5. Incidents: Get All
    try {
      const incGetRes = await axios.get(`${API_BASE}/incidents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Incidents Get All: PASS (${incGetRes.status}) - Found ${incGetRes.data.reports.length}`);
    } catch (e) {
      console.log(`❌ Incidents Get All: FAIL - ${e.response?.data?.message || e.message}`);
    }

    // 6. Guardians: Send Invite
    try {
      const guardRes = await axios.post(`${API_BASE}/guardians/add`, {
        email: `guardian_${Date.now()}@test.com`,
        name: 'Test Guardian',
        phone: '8888888888'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Guardian Add: PASS (${guardRes.status})`);
    } catch (e) {
      console.log(`❌ Guardian Add: FAIL - ${e.response?.data?.message || e.message}`);
    }

    // 7. Map Endpoints
    try {
      await axios.get(`${API_BASE}/map/usgs`);
      console.log(`✅ Map USGS Proxy: PASS`);
    } catch (e) {
      console.log(`❌ Map USGS Proxy: FAIL - ${e.response?.data?.message || e.message}`);
    }

  } catch (err) {
    console.error('CRITICAL VALIDATION ERROR', err);
  }
  
  console.log('--- END API VALIDATION ---');
  process.exit(0);
}

runTests();
