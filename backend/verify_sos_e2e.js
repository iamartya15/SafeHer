const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Guardian = require('./models/Guardian');
const SOSAlert = require('./models/SOSAlert');
const Notification = require('./models/Notification');
const jwt = require('jsonwebtoken');
const { sendMail } = require('./config/mail');
const { performance } = require('perf_hooks');

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING SOS E2E VERIFICATION');
  console.log('==================================================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed', err);
    process.exit(1);
  }

  // 1. Setup Test Users
  const testUser = await User.findOneAndUpdate(
    { email: 'sos_test_user@example.com' },
    { name: 'SOS Tester', email: 'sos_test_user@example.com', password: 'password123', phone: '1234567890', isVerified: true },
    { upsert: true, new: true }
  );

  const testGuardian1 = await User.findOneAndUpdate(
    { email: 'sos_test_guardian_1@example.com' },
    { name: 'Guardian 1', email: 'sos_test_guardian_1@example.com', password: 'password123', phone: '0987654321', isVerified: true },
    { upsert: true, new: true }
  );
  
  const testGuardian2 = await User.findOneAndUpdate(
    { email: 'sos_test_guardian_2@example.com' },
    { name: 'Guardian 2', email: 'sos_test_guardian_2@example.com', password: 'password123', phone: '0987654322', isVerified: true },
    { upsert: true, new: true }
  );

  // Setup Guardianship
  await Guardian.deleteMany({ userId: testUser._id });
  await Guardian.create([
    { userId: testUser._id, guardianId: testGuardian1._id, guardianEmail: testGuardian1.email, status: 'approved' },
    { userId: testUser._id, guardianId: testGuardian2._id, guardianEmail: testGuardian2.email, status: 'approved' }
  ]);
  
  console.log('✅ Test Data Setup Complete (1 User, 2 Guardians)');

  // Generate Token
  const token = jwt.sign({ id: testUser._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('\n--- SCENARIO 1: NORMAL SOS TRIGGER ---');
  await SOSAlert.deleteMany({ userId: testUser._id });
  await Notification.deleteMany({ recipientId: { $in: [testGuardian1._id, testGuardian2._id] } });

  const startTime = performance.now();
  
  let response;
  try {
    console.log(`[${new Date().toISOString()}] HTTP POST /api/sos/trigger`);
    console.log(`Request Payload: ${JSON.stringify({
      latitude: 40.7128,
      longitude: -74.0060,
      batteryLevel: 85,
      browserInfo: { platform: 'TestScript' }
    })}`);
    response = await axiosInstance.post('/sos/trigger', {
      latitude: 40.7128,
      longitude: -74.0060,
      batteryLevel: 85,
      browserInfo: { platform: 'TestScript' }
    });
  } catch (err) {
    console.error('❌ API Call Failed', err.response?.data || err.message);
    process.exit(1);
  }

  const endTime = performance.now();
  const responseTime = Math.round(endTime - startTime);

  console.log(`\n[${new Date().toISOString()}] HTTP Response Status: ${response.status}`);
  console.log(`HTTP Response Body: ${JSON.stringify(response.data)}`);
  console.log(`⏱️  API Response Time: ${responseTime}ms`);

  // Verify DB insertions
  const sosRecord = await SOSAlert.findOne({ userId: testUser._id }).sort({ createdAt: -1 });
  if (sosRecord) {
    console.log(`\n✅ SOS document instantly created in MongoDB.`);
    console.log(`Document ID: ${sosRecord._id}`);
    console.log(`Created At: ${sosRecord.createdAt}`);
  } else {
    console.log('\n❌ SOS document NOT found.');
  }

  // Wait a bit for background processes (emails/notifications)
  console.log('\n⏳ Waiting 5 seconds for background tasks (SMTP) to complete...');
  await new Promise(res => setTimeout(res, 5000));

  const notifications = await Notification.find({ recipientId: { $in: [testGuardian1._id, testGuardian2._id] } });
  if (notifications.length === 2) {
    console.log(`\n✅ Background Notification documents created successfully.`);
    notifications.forEach((n, idx) => {
      console.log(`Notification ${idx+1} ID: ${n._id} (For Guardian ID: ${n.recipientId})`);
    });
  } else {
    console.log(`\n❌ Expected 2 notifications, found ${notifications.length}.`);
  }

  console.log('\n==================================================');
  console.log('E2E VERIFICATION COMPLETED');
  console.log('==================================================');
  process.exit(0);
}

runTests();
