const messages = {
  personalInfo: {
    updated: "Personal information updated successfully",
  },
  timezone: {
    fetched: "Timezone fetched successfully",
  },
  holiday: {
    fetched: "Holidays fetched successfully",
    updated: "Holidays updated successfully",
  },
  lunch: {
    retrieved: "Daily lunch times retrieved successfully",
    updated: "Daily lunch times updated successfully",
    invalidTimeFormat: "Time must be in 12-hour format (e.g., '9:00 AM')",
    startTimeAfterEnd: "Start time must be before end time"
  },
  error: {
    lunchNotFound: "Lunch times not found",
    userNotFound: "User not found"
  }
};

export { messages };