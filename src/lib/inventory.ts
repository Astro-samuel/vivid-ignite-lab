// Shared "does the user own this component" logic — used by the Catalog's
// Can Build / 1 Part Away badges, the Dashboard's What Can I Make? widget,
// and the Generate page's project scoring. One implementation so a fix here
// fixes all three instead of drifting independently.

export function getInventoryComponents(userId?: string): string[] {
  try {
    const key = userId ? `inventory_${userId}` : "userInventory";
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function tokenize(name: string): Set<string> {
  return new Set(
    name
      .toLowerCase()
      .replace(/[()]/g, " ")
      .replace(/×\d+/g, " ")
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
  );
}

// True if one owned inventory item satisfies a project's required component name.
// Plain substring matching breaks the moment word order differs between the two
// independently-authored vocabularies in this app — e.g. "Resistor (220Ω)" (inventory)
// vs "220Ω Resistor" (project data), or "PIR Motion Sensor" vs "PIR Sensor". Token-set
// overlap is order-independent so both of those match correctly.
function isMatch(owned: string, required: string): boolean {
  const ownedLower = owned.toLowerCase();
  const requiredLower = required.toLowerCase();
  if (ownedLower.includes(requiredLower) || requiredLower.includes(ownedLower)) return true;

  const requiredTokens = tokenize(required);
  if (requiredTokens.size === 0) return false;
  const ownedTokens = tokenize(owned);
  let shared = 0;
  requiredTokens.forEach((t) => { if (ownedTokens.has(t)) shared++; });
  return shared / requiredTokens.size >= 0.6;
}

export function hasComponent(inventory: string[], required: string): boolean {
  return inventory.some((owned) => isMatch(owned, required));
}

export function missingComponents(inventory: string[], required: string[]): string[] {
  return required.filter((req) => !hasComponent(inventory, req));
}

export function canBuild(inventory: string[], required: string[]): boolean {
  return required.length > 0 && required.every((req) => hasComponent(inventory, req));
}

// Fraction of `required` already owned — used to rank/sort partial matches.
export function matchScore(inventory: string[], required: string[]): number {
  if (required.length === 0) return 0;
  const matched = required.filter((req) => hasComponent(inventory, req)).length;
  return matched / required.length;
}
