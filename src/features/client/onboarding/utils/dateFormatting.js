/**
 * Formats a date into a user-friendly string
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string (e.g., "Monday, January 1, 2024")
 */
export const formatBookingDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formats a time string into a user-friendly format
 * @param {string} time - Time in HH:MM format
 * @returns {string} - Formatted time string (e.g., "2:30 PM")
 */
export const formatBookingTime = (time) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Formats session booking details for timeline entries
 * @param {string|Date} date - The session date
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {object} - Object with formatted date and time strings
 */
export const formatSessionBookingDetails = (date, startTime, endTime) => {
  return {
    bookedDate: formatBookingDate(date),
    startTimeFormatted: formatBookingTime(startTime),
    endTimeFormatted: formatBookingTime(endTime),
  };
}; 