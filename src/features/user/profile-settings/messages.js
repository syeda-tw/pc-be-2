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
    userNotFound: "User not found",
    weeklyScheduleNotFound: "Weekly schedule not found",
    failedToUpdateWeeklySchedule: "Failed to update weekly schedule"
  },
  weeklySchedule: {
    retrieved: "Weekly schedule retrieved successfully",
    updated: "Weekly schedule updated successfully",
  },
  profile: {
    retrieved: "Profile retrieved successfully",
  }
};


export { messages };