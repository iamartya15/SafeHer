require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('==================================================');
console.log('SAFEHER AI - BACKEND PRODUCTION SANITY VERIFICATION');
console.log('==================================================');

const checks = [];

const runCheck = (name, fn) => {
  try {
    fn();
    console.log(`✅ [SUCCESS] ${name}`);
    checks.push({ name, status: 'PASSED' });
  } catch (error) {
    console.error(`❌ [FAILED] ${name}`);
    console.error(`   Error details: ${error.message}`);
    checks.push({ name, status: 'FAILED', error: error.message });
  }
};

// 1. Check Configuration files
runCheck('DB Config Import', () => {
  const db = require('./config/db');
  if (typeof db !== 'function') throw new Error('config/db.js should export a function');
});

runCheck('Cloudinary Config Import', () => {
  const cloudinary = require('./config/cloudinary');
  if (typeof cloudinary.uploadImage !== 'function') throw new Error('cloudinary.js should export uploadImage');
});

runCheck('Mail Config Import', () => {
  const mail = require('./config/mail');
  if (typeof mail.sendMail !== 'function') throw new Error('mail.js should export sendMail');
});

// 2. Check Database Models
const models = ['User', 'Guardian', 'IncidentReport', 'SOSAlert', 'Notification', 'ChatHistory'];
models.forEach(modelName => {
  runCheck(`Database Model: ${modelName}`, () => {
    const model = require(`./models/${modelName}`);
    if (!model.modelName) throw new Error(`${modelName} is not a valid Mongoose Model`);
  });
});

// 3. Check Controllers
const controllers = [
  'authController',
  'incidentController',
  'sosController',
  'guardianController',
  'adminController',
  'chatController',
  'notificationController'
];
controllers.forEach(ctrl => {
  runCheck(`Controller Import: ${ctrl}`, () => {
    const controller = require(`./controllers/${ctrl}`);
    if (Object.keys(controller).length === 0) throw new Error(`${ctrl} has empty exports`);
  });
});

// 4. Check Middlewares
runCheck('Auth Middleware Import', () => {
  const auth = require('./middlewares/authMiddleware');
  if (typeof auth.protect !== 'function') throw new Error('protect middleware missing');
});

runCheck('Upload Middleware Import', () => {
  const upload = require('./middlewares/uploadMiddleware');
  if (!upload.single) throw new Error('upload middleware is not a valid multer instance');
});

runCheck('Error Middleware Import', () => {
  const errorHandler = require('./middlewares/errorMiddleware');
  if (typeof errorHandler !== 'function') throw new Error('errorHandler must be a function');
});

// 5. Check Services
runCheck('Gemini Service Import', () => {
  const gemini = require('./services/geminiService');
  if (typeof gemini.getSafetyAdvice !== 'function') throw new Error('getSafetyAdvice method missing');
});

// 6. Check Routing Registry
const routes = [
  'authRoutes',
  'incidentRoutes',
  'sosRoutes',
  'guardianRoutes',
  'adminRoutes',
  'chatRoutes',
  'notificationRoutes'
];
routes.forEach(routeFile => {
  runCheck(`Router Mapping: ${routeFile}`, () => {
    const router = require(`./routes/${routeFile}`);
    if (typeof router !== 'function') throw new Error(`${routeFile} does not export an Express Router`);
  });
});

// Summary
console.log('\n==================================================');
console.log('VERIFICATION SUMMARY');
console.log('==================================================');
const failed = checks.filter(c => c.status === 'FAILED');
console.log(`Total checks: ${checks.length}`);
console.log(`Passed checks: ${checks.length - failed.length}`);
console.log(`Failed checks: ${failed.length}`);

if (failed.length > 0) {
  console.log('\n🚨 Error Details:');
  failed.forEach(f => {
    console.log(`- ${f.name}: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('\n🌟 ALL BACKEND SANITY CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
}
