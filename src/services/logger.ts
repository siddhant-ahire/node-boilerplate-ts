// logger.js
const winston = require('winston');
const path = require('path');

// Define log formats
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json() // Log as JSON for better structure
);
const log_path = __dirname + '../../../';
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple() // Simple format for console output
);

// Create a Winston logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Different log levels for production and development
  format: logFormat,
  transports: [
    // Log to console in development
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    }),
    // Log to file in production
    new winston.transports.File({
      filename: path.join(log_path, 'logs', 'application.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5, // Keep a maximum of 5 log files
      tailable: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(log_path, 'logs', 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(log_path, 'logs', 'rejections.log'),
    }),
  ],
});
