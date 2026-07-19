// XP-to-level thresholds, shared by every place that awards XP so the
// profiles.level column never drifts out of sync with total_xp again.
export function levelForXp(xp: number): number {
  if (xp >= 500) return 3;
  if (xp >= 200) return 2;
  return 1;
}

// XP needed to reach the level above `level`. Shared by every progress bar.
export function maxXpForLevel(level: number): number {
  if (level >= 3) return 1000;
  if (level >= 2) return 500;
  return 200;
}
