const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    // Sanitize sensitive data from meta object if present
    const sanitizedMeta = { ...meta };
    const sensitiveKeys = ['password', 'token', 'refreshToken', 'otp', 'apiKey', 'creditCard'];
    sensitiveKeys.forEach(key => {
      if (sanitizedMeta[key]) sanitizedMeta[key] = '[REDACTED]';
    });
    
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(sanitizedMeta).length > 0 && !sanitizedMeta.httpMessage) {
        logMessage += ` ${JSON.stringify(sanitizedMeta)}`;
    }
    if (stack) {
      logMessage += `\n${stack}`;
    }
    return logMessage;
  })
);

// Transports for different log types
const applicationTransport = new winston.transports.DailyRotateFile({
  filename: 'application-%DATE%.log',
  dirname: logDir,
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  level: 'info'
});

const errorTransport = new winston.transports.DailyRotateFile({
  filename: 'error-%DATE%.log',
  dirname: logDir,
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  level: 'error'
});

const requestTransport = new winston.transports.DailyRotateFile({
  filename: 'requests-%DATE%.log',
  dirname: logDir,
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d'
});

const authTransport = new winston.transports.DailyRotateFile({
  filename: 'auth-%DATE%.log',
  dirname: logDir,
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d'
});

const logger = winston.createLogger({
  level: 'info',
  format: customFormat,
  transports: [
    applicationTransport,
    errorTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    })
  ],
});

// Dedicated loggers for specific concerns
const requestLogger = winston.createLogger({
  level: 'info',
  format: customFormat,
  transports: [requestTransport]
});

const authLogger = winston.createLogger({
  level: 'info',
  format: customFormat,
  transports: [authTransport, new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), customFormat)
  })]
});

// Morgan stream integration
logger.stream = {
  write: function(message) {
    // Sanitize any URL parameters that might contain tokens
    let cleanMessage = message.replace(/(token|apiKey|password)=[^& \n]+/ig, '$1=[REDACTED]');
    requestLogger.info(cleanMessage.trim(), { httpMessage: true });
  }
};

module.exports = { logger, requestLogger, authLogger };
