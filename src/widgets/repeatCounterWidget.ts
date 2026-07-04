// 遍数计数器, per docs/design-v0.8.md §7 widget list. "Current repeat index"
// is derived by reverse lookup against active state (§2.4) — never stored.

import type { Widget } from '../core/widget';
import type { RepeatGroup } from '../core/repeat';

export interface RepeatCounterOutput {
  current: number; // 1-based
  total: number;
}

export function createRepeatCounterWidget(group: RepeatGroup): Widget<RepeatCounterOutput | null> {
  return {
    subscribe: ['main'],
    render({ activeIds }) {
      const index = group.instanceIds.findIndex((id) => activeIds.has(id));
      return index === -1 ? null : { current: index + 1, total: group.count };
    }
  };
}
