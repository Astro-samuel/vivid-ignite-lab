// XP-to-level thresholds, shared by every place that awards XP so the
// profiles.level column never drifts out of sync with total_xp again.
export function levelForXp(xp: number): number {
  if (xp >= 500) return 3;
  if (xp >= 200) return 2;
  return 1;
}
