export const TIMEZONES = [
  {
    value: "America/New_York",
    label: "Eastern Daylight Time (UTC-4) — New York",
  },
  {
    value: "Pacific/Honolulu",
    label: "Hawaii Standard Time (UTC-10) — Honolulu",
  },
  {
    value: "America/Adak",
    label: "Hawaii-Aleutian Daylight Time (UTC-9) — Adak",
  },
  {
    value: "America/Anchorage",
    label: "Alaska Daylight Time (UTC-8) — Anchorage",
  },
  {
    value: "America/Los_Angeles",
    label: "Pacific Daylight Time (UTC-7) — Los Angeles",
  },
  {
    value: "America/Phoenix",
    label: "Mountain Standard Time (UTC-7) — Phoenix",
  },
  {
    value: "America/Denver",
    label: "Mountain Daylight Time (UTC-6) — Salt Lake City",
  },
  {
    value: "America/Chicago",
    label: "Central Daylight Time (UTC-5) — Chicago",
  },
];

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,}$/;

export const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-Binary",
  "Prefer Not to Say"
];

export const PRONOUNS_OPTIONS = [
  "He/Him",
  "She/Her", 
  "They/Them"
];

export const MIN_AGE = 18;
export const MAX_AGE = 150;

export const USER_STATUS_OPTIONS = [
  "onboarding-step-1",
  "onboarding-step-2", 
  "onboarded",
  "verified",
  "disabled"
];