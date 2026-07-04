// SAMPLE CONTENT for Level 0 pipeline testing.
// Li Bai's "静夜思" (Quiet Night Thoughts) — 20 characters (4 lines x 5),
// one of the best-known poems in Chinese, chosen specifically because its
// text and pinyin are unambiguous and don't need source verification (unlike
// the 楞严咒 excerpt the design doc's own Level 0 exit test calls for, which
// this project has no verified source for yet — see conversation history).
// It also happens to match v0.8's own §8 "近场" expansion targets (蒙学/诗词
// 吟诵). This is still a stand-in for the project's real target domain
// (Buddhist chant works), not final content — swap it for a verified work
// whenever one becomes available. Content is data; nothing here is
// load-bearing beyond exercising parser -> f(t) -> render end to end.

import { parseSkeleton } from '../parser/skeleton';
import type { AnchorGroup, ContentNode, VisualTemplate } from '../schema/work';

const CHARACTERS = [
  ['床', 'chuáng'], ['前', 'qián'], ['明', 'míng'], ['月', 'yuè'], ['光', 'guāng'],
  ['疑', 'yí'], ['是', 'shì'], ['地', 'dì'], ['上', 'shàng'], ['霜', 'shuāng'],
  ['举', 'jǔ'], ['头', 'tóu'], ['望', 'wàng'], ['明', 'míng'], ['月', 'yuè'],
  ['低', 'dī'], ['头', 'tóu'], ['思', 'sī'], ['故', 'gù'], ['乡', 'xiāng']
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
