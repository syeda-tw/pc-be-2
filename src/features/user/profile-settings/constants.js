// TODO: move to the common folder
export const timezones = [
  { label: "HST", iana: "Pacific/Honolulu" },       // Hawaii Standard Time (no DST)
  { label: "AKDT", iana: "America/Anchorage" },     // Alaska Daylight Time
  { label: "PDT", iana: "America/Los_Angeles" },    // Pacific Daylight Time
  { label: "MDT", iana: "America/Denver" },         // Mountain Daylight Time
  { label: "MST", iana: "America/Denver" },         // Mountain Standard Time (fallback to same)
  { label: "CDT", iana: "America/Chicago" },        // Central Daylight Time
  { label: "EDT", iana: "America/New_York" },       // Eastern Daylight Time
];
