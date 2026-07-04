// Token -> slot -> override resolve chain, per docs/design-v0.8.md §5.4.
// Level 0 scope only: no `extends`/`compose` (§16-§17 are Level 2). Static,
// pure, no side effects — same inputs always produce the same style bag.

import type { VisualOverride, VisualTemplate, VisualTokens } from '../schema/work';

export function resolveTokenRef(
  value: string | number,
  tokens: VisualTokens,
  theme: string
): string | number {
  if (typeof value !== 'string' || !value.startsWith('$')) return value;

  const tokenName = value.slice(1);
  const branch = tokens[tokenName];
  if (!branch) throw new Error(`Unknown token: ${tokenName}`);

  const resolved = branch[theme] ?? branch.light;
  if (resolved === undefined) {
    throw new Error(`Token ${tokenName} has no value for theme "${theme}" and no light fallback`);
  }
  return resolved;
}

const LAYOUT_ONLY_KEYS = new Set(['place', 'position', 'writingMode']);

/** Resolves the final style bag for one unit: slot defaults -> per-unit override -> token dereference. */
export function resolveUnitStyle(
  template: VisualTemplate,
  theme: string,
  slotName: string,
  overrides: Record<string, VisualOverride> | undefined,
  nodeId: string
): Record<string, string | number> {
  const merged: Record<string, string | number> = {};

  const slotDef = template.slots[slotName];
  if (slotDef && 'areas' in slotDef === false) {
    for (const [key, value] of Object.entries(slotDef as Record<string, unknown>)) {
      if (LAYOUT_ONLY_KEYS.has(key) || value === undefined) continue;
      merged[key] = value as string | number;
    }
  }

  const unitOverride = overrides?.[nodeId];
  if (unitOverride) {
    for (const [key, value] of Object.entries(unitOverride)) {
      merged[key] = value;
    }
  }

  for (const key of Object.keys(merged)) {
    merged[key] = resolveTokenRef(merged[key], template.tokens, theme);
  }

  return merged;
}
