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
  weeklySchedule: {
    retrieved: "Weekly schedule retrieved successfully",
    updated: "Weekly schedule updated successfully",
  },
  profile: {
    retrieved: "Profile retrieved successfully",
  }
};

const errors = {
  lunchNotFound: { code: 'LUNCH_NOT_FOUND', message: "Lunch times not found" },
  userNotFound: { code: 'USER_NOT_FOUND', message: "User not found" },
  weeklyScheduleNotFound: { code: 'WEEKLY_SCHEDULE_NOT_FOUND', message: "Weekly schedule not found" },
  failedToUpdateWeeklySchedule: { code: 'FAILED_TO_UPDATE_WEEKLY_SCHEDULE', message: "Failed to update weekly schedule" }
};

export { messages, errors };