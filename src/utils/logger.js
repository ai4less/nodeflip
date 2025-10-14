/**
 * Logging utility for NodeFlip
 * Set DEBUG to false for production builds
 */

const DEBUG = false; // Set to false for production

export const logger = {
  log: (...args) => DEBUG && console.log(...args),
  error: (...args) => console.error(...args), // Always log errors
  warn: (...args) => DEBUG && console.warn(...args),
  info: (...args) => DEBUG && console.info(...args),
}
