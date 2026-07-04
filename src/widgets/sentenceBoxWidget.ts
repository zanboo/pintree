// 当前句方框, per docs/design-v0.8.md §7 widget list. Subscribes to
// sentence-level (line-node) active state, reports which line is current.

import type { Widget } from '../core/widget';

export interface SentenceBoxOutput {
  activeLineId: string | null;
}

export function createSentenceBoxWidget(lineIds: string[]): Widget<SentenceBoxOutput> {
  return {
    subscribe: ['main'],
    render({ activeIds }) {
      const activeLineId = lineIds.find((id) => activeIds.has(id)) ?? null;
      return { activeLineId };
    }
  };
}
