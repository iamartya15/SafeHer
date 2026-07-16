const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

const isMailConfigured = 
  process.env.EMAIL_USER && 
  process.env.EMAIL_PASS && 
  process.env.EMAIL_PASS !== 'mock_email_app_password' &&
  process.env.EMAIL_PASS !== 'your_email_app_password_here' &&
  !process.env.EMAIL_USER.includes('your_safeher_support_email');

let transporter;

if (isMailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) === 465 : true, // true by default for 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  transporter.verify((error, success) => {
    if (error) {
      logger.error('Mail server verification failed:', error.message);
    } else {
      logger.info('Mail server is ready to send notifications.');
    }
  });
} else {
  logger.warn('Mail transporter using DEV/MOCK mode. Emails will be logged to console.');
}

/**
 * Sends an email using Nodemailer, falling back to console logging in development.
 * @param {Object} options - Email parameters
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Text version of email
 * @param {string} options.html - HTML version of email
 * @returns {Promise<boolean>} - Success indicator
 */
const sendMail = async ({ to, subject, text, html }) => {
  try {
    if (isMailConfigured && transporter) {
      await transporter.sendMail({
        from: `"SafeHer AI" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
      });
      return true;
    } else {
      logger.info('\n========================================');
      logger.info(`[DEV EMAIL SENT]`);
      logger.info(`To: ${to}`);
      logger.info(`Subject: ${subject}`);
      logger.info(`Text: ${text}`);
      
      // Extract and print any verification or reset links clearly in the console
      const linkMatch = html.match(/href="([^"]+)"/);
      if (linkMatch && linkMatch[1]) {
        logger.info(`\n👉 ACTION LINK: ${linkMatch[1]}\n`);
      }
      
      logger.info('========================================\n');
      return true;
    }
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    
    // Suppress mail exception in development mode so that registration and flow does not fail
    if (process.env.NODE_ENV !== 'production' || !isMailConfigured) {
      logger.warn(`[DEV FALLBACK] Suppressed mail send failure in development mode.`);
      return true;
    }
    throw error;
  }
};

module.exports = {
  sendMail,
  isMailConfigured
};
