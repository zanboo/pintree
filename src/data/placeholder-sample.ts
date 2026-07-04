// SAMPLE CONTENT for Level 0/1 pipeline testing.
// Li Bai's "静夜思" (Quiet Night Thoughts) — 20 characters (4 lines x 5),
// one of the best-known poems in Chinese, chosen specifically because its
// text and pinyin are unambiguous and don't need source verification (unlike
// the 楞严咒 excerpt the design doc's own Level 0 exit test calls for, which
// this project has no verified source for yet — see conversation history).
// It also happens to match v0.8's own §8 "近场" expansion targets (蒙学/诗词
// 吟诵). A trailing "南無" x3 section is appended purely to exercise repeat
// expansion (§2.4) and the repeat-counter widget — "南無" itself is a
// universally known, unambiguous Buddhist term, not a precision-sensitive
// numbered excerpt, so it doesn't carry the same accuracy risk the mantra
// text does. None of this is the project's real target content — swap it
// for a verified work whenever one becomes available.

import { parseSkeleton } from '../parser/skeleton';
import { expandRepeats } from '../core/repeat';
import type { Anchor, AnchorGroup, ContentNode, VisualTemplate } from '../schema/work';

const LINES = [
  [['床', 'chuáng'], ['前', 'qián'], ['明', 'míng'], ['月', 'yuè'], ['光', 'guāng']],
  [['疑', 'yí'], ['是', 'shì'], ['地', 'dì'], ['上', 'shàng'], ['霜', 'shuāng']],
  [['举', 'jǔ'], ['头', 'tóu'], ['望', 'wàng'], ['明', 'míng'], ['月', 'yuè']],
  [['低', 'dī'], ['头', 'tóu'], ['思', 'sī'], ['故', 'gù'], ['乡', 'xiāng']]
] as const;

const SECONDS_PER_CHAR = 0.6;
const REPEAT_SECONDS = 1.0;
const REPEAT_COUNT = 3;

function buildSkeletonText(): string {
  const poemPart = LINES.map((line) => {
    const heading = `# ${line.map(([hanzi]) => hanzi).join('')}`;
    const body = line.map(([hanzi]) => hanzi).join('\n');
    return `${heading}\n${body}`;
  }).join('\n\n');
  return `${poemPart}\n\n# 持诵\n南無×${REPEAT_COUNT}`;
}

export function buildPlaceholderSample() {
  const roots = parseSkeleton(buildSkeletonText());
  const poemLines = roots.slice(0, LINES.length);
  const repeatSection = roots[LINES.length];
  const repeatNode = repeatSection.children?.[0];
  if (!repeatNode) throw new Error('Expected a repeat child node under the 持诵 heading');

  const poemLeaves = poemLines.flatMap((line) => line.children ?? []);
  const totalPoemSeconds = poemLeaves.length * SECONDS_PER_CHAR;

  const anchors: Anchor[] = poemLeaves.map((_, i) => ({
    id: `a${i}`,
    time: i * SECONDS_PER_CHAR,
    origin: 'manual'
  }));
  anchors.push({ id: `a${poemLeaves.length}`, time: totalPoemSeconds, origin: 'manual' });
  anchors.push({ id: 'a-repeat-end', time: totalPoemSeconds + REPEAT_SECONDS, origin: 'manual' });

  poemLeaves.forEach((node, i) => {
    node.timing = { bindings: [{ from: `a${i}`, to: `a${i + 1}` }] };
  });
  poemLines.forEach((line, li) => {
    const from = `a${li * LINES[0].length}`;
    const to = `a${(li + 1) * LINES[0].length}`;
    line.timing = { bindings: [{ from, to }] };
  });
  repeatNode.timing = { bindings: [{ from: `a${poemLeaves.length}`, to: 'a-repeat-end' }] };
  repeatNode.repeat = { count: REPEAT_COUNT };

  const anchorGroupBeforeExpansion: AnchorGroup = { id: 'ag-main', anchors };
  const { roots: expandedRoots, anchorGroup, repeatGroups } = expandRepeats(roots, anchorGroupBeforeExpansion);

  const expandedPoemLines = expandedRoots.slice(0, LINES.length);
  const expandedRepeatSection = expandedRoots[LINES.length];
  const repeatInstances = expandedRepeatSection.children ?? [];
  const poemLeafNodes = expandedPoemLines.flatMap((line: ContentNode) => line.children ?? []);
  const leafNodes = [...poemLeafNodes, ...repeatInstances];

  const annotations: Record<string, string> = {};
  poemLeafNodes.forEach((node: ContentNode, i: number) => {
    const flatIndex = i;
    const [, pinyin] = LINES.flat()[flatIndex];
    annotations[node.id] = pinyin;
  });
  repeatInstances.forEach((node: ContentNode) => {
    annotations[node.id] = 'nāmó';
  });

  const template: VisualTemplate = {
    id: 'level0.placeholder',
    version: '0.1.0',
    tokens: {
      'color.fg': { light: '#1a1a1a', dark: '#e8e6e0' },
      'color.bg': { light: '#faf8f2', dark: '#1a1714' },
      'color.accent': { light: '#b8860b', dark: '#d4a843' },
      'color.line-highlight': { light: 'rgba(184,134,11,0.15)', dark: 'rgba(212,168,67,0.2)' },
      // Simplification for Level 0/1: referenced directly as "$type.main" /
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

  const totalDuration = Math.max(...anchorGroup.anchors.map((a) => a.time));

  return {
    poemLines: expandedPoemLines,
    allLines: [...expandedPoemLines, expandedRepeatSection],
    leafNodes,
    anchorGroup,
    annotations,
    template,
    totalDuration,
    repeatGroups
  };
}
