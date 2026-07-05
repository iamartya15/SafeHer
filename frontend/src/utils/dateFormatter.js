/**
 * SafeHer Date & Time Formatting Utility
 * Standardized across both Backend and Frontend.
 * All timestamps are converted to Asia/Kolkata (IST).
 */

const TIMEZONE = 'Asia/Kolkata';
const LOCALE = 'en-IN';

/**
 * Validates and converts input to a Date object.
 * @param {Date|string|number} date 
 * @returns {Date}
 */
const toDate = (date) => {
  if (!date) return new Date();
  return new Date(date);
};

/**
 * Long Format: "5 July 2026, 8:07 AM IST"
 */
export const formatDateTime = (date) => {
  try {
    const formatted = new Intl.DateTimeFormat(LOCALE, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: TIMEZONE,
      hour12: true
    }).format(toDate(date));
    return formatted.replace(/am|pm/i, m => m.toUpperCase()).replace(' at ', ', ');
  } catch (e) {
    return 'Invalid Date';
  }
};

/**
 * Short Format: "05/07/2026, 08:07 AM IST"
 */
export const formatShortDateTime = (date) => {
  try {
    const formatted = new Intl.DateTimeFormat(LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: TIMEZONE,
      hour12: true
    }).format(toDate(date));
    return formatted.replace(/am|pm/i, m => m.toUpperCase());
  } catch (e) {
    return 'Invalid Date';
  }
};

/**
 * Time Only: "08:07 AM"
 */
export const formatTime = (date) => {
  try {
    const formatted = new Intl.DateTimeFormat(LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: TIMEZONE,
      hour12: true
    }).format(toDate(date));
    return formatted.replace(/am|pm/i, m => m.toUpperCase());
  } catch (e) {
    return 'Invalid Time';
  }
};

/**
 * Date Only: "05 Jul 2026"
 */
export const formatDate = (date) => {
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: TIMEZONE
    }).format(toDate(date));
  } catch (e) {
    return 'Invalid Date';
  }
};
