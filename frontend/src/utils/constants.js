export const XP_ACTIONS = {
  DAILY_CHECK_IN: 10,
  COMPLETE_GOAL: 100,
  COMPLETE_CHALLENGE: 200,
  SEVEN_DAY_STREAK: 50,
  FIRST_PLACE: 300,
};

export const CHALLENGE_TYPES = {
  FIXED_DURATION: { label: 'Fixed Duration', color: 'primary' },
  MILESTONE: { label: 'Milestone', color: 'success' },
  COMPETITIVE: { label: 'Competitive', color: 'accent' },
};

export const CHALLENGE_STATUSES = {
  OPEN: { label: 'Open', color: 'success' },
  ACTIVE: { label: 'Active', color: 'accent' },
  COMPLETED: { label: 'Completed', color: 'dark' },
};
