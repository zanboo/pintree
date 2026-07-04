// Data contracts per docs/design-v0.8.md §1-§5. Field names and shapes are
// pinned by that document; do not add fields it doesn't define (CLAUDE.md
// core principle 3/4 — no domain words, no guessed semantics).

export type AnchorOrigin = 'beat' | 'manual' | 'forced-align' | 'tap';

export interface Anchor {
  id: string;
  time: number; // seconds; the only semantically load-bearing field (§3.1)
  origin: AnchorOrigin; // UI metadata only — engine must never branch on this
}

export interface AnchorGroup {
  id: string;
  anchors: Anchor[];
}

export interface TimelineBinding {
  from: string; // Anchor id
  to: string; // Anchor id
}

export type BlockKind = 'text' | 'image' | 'formula' | 'media' | 'note';

export interface Block {
  kind: BlockKind;
  value: string;
  opaque?: boolean; // default false (§4.3)
}

export interface ContentNode {
  id: string;
  block: Block;
  children?: ContentNode[];
  timing?: { bindings: TimelineBinding[] };
  repeat?: { count: number }; // no `index` — repeat is expanded at parse time (§2.4)
  config?: Record<string, unknown>;
}

export type TrackType = 'text' | 'audio' | 'annotation';

export interface TextTrackContent {
  nodes: ContentNode[];
}

export interface AnnotationTrackContent {
  // node id -> annotation value (e.g. pinyin for that unit)
  values: Record<string, string>;
}

export interface AudioTrackContent {
  src: string;
}

export interface Track {
  id: string;
  type: TrackType;
  role: string; // free-form semantic tag; engine never branches on it
  anchorGroupRef?: string; // §3.4 — omitted means first group
  content: TextTrackContent | AnnotationTrackContent | AudioTrackContent;
}

export type ThemeBranch = 'light' | 'dark' | 'sepia' | string;

export interface VisualTokens {
  [tokenName: string]: Partial<Record<ThemeBranch, string | number>>;
}

export interface SlotDef {
  place?: string;
  size?: string;
  position?: string;
  [key: string]: unknown;
}

export interface VisualSlots {
  grid?: { areas: string[] };
  [slotName: string]: SlotDef | { areas: string[] } | undefined;
}

export interface VisualTemplate {
  id: string;
  version: string;
  tokens: VisualTokens;
  slots: VisualSlots;
}

export interface VisualOverride {
  [property: string]: string | number;
}

export interface Work {
  schemaVersion: '0.8';
  meta: { title: string; domain: string; lang: string[] };
  timeline?: { anchorGroups: AnchorGroup[] }; // omitted = degrades to pure tree
  tracks: Track[];
  playback?: { activeAudioTrack?: string; defaultRate?: number };
  visual: {
    templateRef: { id: string; version: string };
    overrides?: Record<string, VisualOverride>; // keyed by node id (§5.3)
  };
}
