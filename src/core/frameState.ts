// f(t) evaluator, per docs/design-v0.8.md §3.5 and §12.1/§12.2.
// Pure function: no internal state, no DOM access. Active state is
// recomputed from scratch every call — that purity is the whole point (§12.1).
//
// Scope note: §3.3's sentence-level-binding-with-uniform-child-interpolation
// is intentionally not implemented yet. The Level 0 sample data gives every
// leaf unit its own explicit binding, so interpolation isn't exercised by
// the exit test; add it when a real work actually needs it.

import type { AnchorGroup, ContentNode, TimelineBinding } from '../schema/work';

export function buildAnchorTimeMap(anchorGroup: AnchorGroup): Map<string, number> {
  const map = new Map<string, number>();
  for (const anchor of anchorGroup.anchors) {
    map.set(anchor.id, anchor.time);
  }
  return map;
}

function isBindingActive(
  binding: TimelineBinding,
  anchorTimes: Map<string, number>,
  t: number
): boolean {
  const t0 = anchorTimes.get(binding.from);
  const t1 = anchorTimes.get(binding.to);
  if (t0 === undefined || t1 === undefined) {
    throw new Error(`Unresolved anchor reference: ${binding.from} -> ${binding.to}`);
  }
  return t >= t0 && t < t1;
}

/** §3.5: a unit is active iff any of its binding intervals contains t. Zero, one, or many units may be active at once. */
export function computeActiveNodeIds(
  nodes: ContentNode[],
  anchorTimes: Map<string, number>,
  t: number
): Set<string> {
  const active = new Set<string>();

  const visit = (node: ContentNode) => {
    const bindings = node.timing?.bindings;
    if (bindings?.some((b) => isBindingActive(b, anchorTimes, t))) {
      active.add(node.id);
    }
    node.children?.forEach(visit);
  };

  nodes.forEach(visit);
  return active;
}
