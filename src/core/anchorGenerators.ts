// Beat anchor generator, per docs/design-v0.8.md §3.2 ①.
// time_i = startTime + i * (60 / bpm) * beatsPerUnit

import type { Anchor } from '../schema/work';

export interface BeatGeneratorParams {
  bpm: number;
  beatsPerUnit: number;
  startTime: number;
  count: number;
  idPrefix?: string;
}

export function anchorsFromBeats({
  bpm,
  beatsPerUnit,
  startTime,
  count,
  idPrefix = 'beat'
}: BeatGeneratorParams): Anchor[] {
  const step = (60 / bpm) * beatsPerUnit;
  return Array.from({ length: count }, (_, i) => ({
    id: `${idPrefix}-${i}`,
    time: startTime + i * step,
    origin: 'beat' as const
  }));
}
