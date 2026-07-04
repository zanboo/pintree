// Widget contract, per docs/design-v0.8.md §7.5. Deliberately thin:
//
//   Widget {
//     subscribe: [trackRole]
//     render(activeState, tokens, geometry) -> declarative slot content
//   }
//
// A widget's `render` must be a pure function of its inputs: no internal
// state, no reading audio, no reading other widgets, no real DOM access.
// Variants are configuration, not separate widgets (§7.5) — e.g. there is
// one highlight widget, not one per color scheme.

import type { VisualTokens } from '../schema/work';

export interface WidgetGeometry {
  [unitId: string]: { x: number; y: number; w: number; h: number };
}

export interface WidgetInput {
  activeIds: ReadonlySet<string>;
  tokens: VisualTokens;
  theme: string;
  geometry?: WidgetGeometry;
}

export interface Widget<TOutput> {
  subscribe: string[]; // track roles this widget reads active state from
  render: (input: WidgetInput) => TOutput;
}
