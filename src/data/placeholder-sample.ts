// PLACEHOLDER CONTENT for Level 0 pipeline testing only.
// These are the ten Heavenly Stems + first ten Earthly Branches (甲乙丙丁...) —
// a neutral, well-known secular sequence used purely as 20 distinct single-
// character units with unambiguous pinyin. This is NOT the verified 楞严咒
// 261-280 excerpt required by the actual Level 0 exit test (docs/design-v0.8.md
// §13.1) — swap this module's data for the real, source-checked mantra text
// (with real per-character timing) before running that test. Content is data;
// nothing here is meant to be load-bearing beyond exercising parser -> f(t) ->
// render end to end.

import { parseSkeleton } from '../parser/skeleton';
import type { AnchorGroup, ContentNode, VisualTemplate } from '../schema/work';

const CHARACTERS = [
  ['甲', 'jiǎ'], ['乙', 'yǐ'], ['丙', 'bǐng'], ['丁', 'dīng'], ['戊', 'wù'],
  ['己', 'jǐ'], ['庚', 'gēng'], ['辛', 'xīn'], ['壬', 'rén'], ['癸', 'guǐ'],
  ['子', 'zǐ'], ['丑', 'chǒu'], ['寅', 'yín'], ['卯', 'mǎo'], ['辰', 'chén'],
  ['巳', 'sì'], ['午', 'wǔ'], ['未', 'wèi'], ['申', 'shēn'], ['酉', 'yǒu']
] as const;

const SECONDS_PER_UNIT = 0.6;

export function buildPlaceholderSample() {
  const skeleton = CHARACTERS.map(([hanzi]) => hanzi).join('\n');
  const nodes: ContentNode[] = parseSkeleton(skeleton);

  const anchors = nodes.map((_, i) => ({
    id: `a${i}`,
    time: i * SECONDS_PER_UNIT,
    origin: 'manual' as const
  }));
  anchors.push({ id: `a${nodes.length}`, time: nodes.length * SECONDS_PER_UNIT, origin: 'manual' });

  nodes.forEach((node, i) => {
    node.timing = { bindings: [{ from: `a${i}`, to: `a${i + 1}` }] };
  });

  const anchorGroup: AnchorGroup = { id: 'ag-main', anchors };

  const annotations: Record<string, string> = {};
  nodes.forEach((node, i) => {
    annotations[node.id] = CHARACTERS[i][1];
  });

  const template: VisualTemplate = {
    id: 'level0.placeholder',
    version: '0.1.0',
    tokens: {
      'color.fg': { light: '#1a1a1a', dark: '#e8e6e0' },
      'color.bg': { light: '#faf8f2', dark: '#1a1714' },
      'color.accent': { light: '#b8860b', dark: '#d4a843' },
      // Simplification for Level 0: referenced directly as "$type.main" /
      // "$type.ruby" (matching how §5.2 uses them), rather than the nested
      // type.scale.{base,main,ruby} shape from §5.1's token example — the
      // doc uses both shapes inconsistently and dotted-branch references
      // (like $motion.easing.solemn) aren't needed until transitions land
      // in Level 2, so this narrower form is enough for now.
      'type.main': { light: 28, dark: 28 },
      'type.ruby': { light: 12, dark: 12 }
    },
    slots: {
      grid: { areas: ['main'] },
      main: { size: '$type.main', color: '$color.fg' },
      ruby: { size: '$type.ruby', position: 'right' }
    }
  };

  return { nodes, anchorGroup, annotations, template, totalDuration: nodes.length * SECONDS_PER_UNIT };
}
