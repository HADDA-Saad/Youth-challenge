export const LEVEL_THRESHOLDS = [
  { name: 'Beginner', xp: 0 },
  { name: 'Explorer', xp: 500 },
  { name: 'Achiever', xp: 1500 },
  { name: 'Champion', xp: 3500 },
  { name: 'Legend', xp: 7000 },
];

export function getLevelInfo(xp) {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || null;
    }
  }

  const xpInLevel = nextLevel ? xp - currentLevel.xp : 0;
  const xpForNextLevel = nextLevel ? nextLevel.xp - currentLevel.xp : 0;

  return {
    level: currentLevel.name,
    currentXp: xp,
    xpInLevel,
    xpForNextLevel,
    nextLevel: nextLevel?.name || null,
    isMaxLevel: !nextLevel,
  };
}
