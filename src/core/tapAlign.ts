// Tap-to-align anchor generator, per docs/design-v0.8.md §3.2 ③. An
// authoring-time session recorder: each tap() call binds an origin:'tap'
// anchor to the next not-yet-aligned unit, in order. This is deliberately
// stateful — it's an editor/authoring tool, not part of the f(t) runtime —
// same category as §20's command-log, not a second playback clock.
//
// This only implements the generator itself; a full tap-align editor UI
// (scrubbing the real timeline against it) is the timeline workbench the
// project has explicitly cut from phase one (CLAUDE.md point 5) — out of
// scope here.

import type { Anchor } from '../schema/work';

export interface TapResult {
  anchor: Anchor;
  unitId: string;
}

export interface TapAligner {
  tap(currentTime: number): TapResult | null; // null once every unit is aligned
  reset(): void;
  remaining(): string[];
}

export function createTapAligner(unitIds: string[], idPrefix = 'tap'): TapAligner {
  let cursor = 0;
  let tapCount = 0;

  return {
    tap(currentTime: number) {
      if (cursor >= unitIds.length) return null;
      const unitId = unitIds[cursor];
      cursor += 1;
      tapCount += 1;
      return { anchor: { id: `${idPrefix}-${tapCount}`, time: currentTime, origin: 'tap' }, unitId };
    },
    reset() {
      cursor = 0;
      tapCount = 0;
    },
    remaining() {
      return unitIds.slice(cursor);
    }
  };
}
