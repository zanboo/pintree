// 逐字高亮器, per docs/design-v0.8.md §7 widget list. Subscribes to a text
// track's active state, renders per-unit fill. Long-tone/拖腔 is handled for
// free by §3.5's multi-interval active state — this widget doesn't need to
// know about it.

import type { Widget } from '../core/widget';
import { resolveTokenRef } from '../core/resolve';

export interface HighlightStyle {
  color: string | number;
}

export const highlightWidget: Widget<Record<string, HighlightStyle>> = {
  subscribe: ['main'],
  render({ activeIds, tokens, theme }) {
    const accent = resolveTokenRef('$color.accent', tokens, theme);
    const output: Record<string, HighlightStyle> = {};
    for (const id of activeIds) {
      output[id] = { color: accent };
    }
    return output;
  }
};
