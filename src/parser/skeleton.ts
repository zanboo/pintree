// Skeleton -> node tree parser, per docs/design-v0.8.md §8.
// Import format only — not a storage format, no round-trip guarantee (§8).
// No hierarchy-name or domain vocabulary lives here; depth is purely `#` count.

import type { ContentNode } from '../schema/work';

const HEADING = /^(#+)\s+(.*)$/;
const REPEAT_SUFFIX = /\s*×(\d+)\s*$/;

function nextId(counter: { n: number }): string {
  counter.n += 1;
  return `u-${String(counter.n).padStart(4, '0')}`;
}

function stripRepeat(text: string): { value: string; count?: number } {
  const match = text.match(REPEAT_SUFFIX);
  if (!match) return { value: text };
  return { value: text.slice(0, match.index).trimEnd(), count: Number(match[1]) };
}

function makeNode(counter: { n: number }, text: string): ContentNode {
  const { value, count } = stripRepeat(text);
  const node: ContentNode = { id: nextId(counter), block: { kind: 'text', value } };
  if (count !== undefined) node.repeat = { count };
  return node;
}

export function parseSkeleton(source: string): ContentNode[] {
  const roots: ContentNode[] = [];
  const stack: { depth: number; node: ContentNode }[] = [];
  const counter = { n: 0 };

  const appendToParent = (node: ContentNode) => {
    const parent = stack[stack.length - 1];
    if (parent) {
      parent.node.children = parent.node.children ?? [];
      parent.node.children.push(node);
    } else {
      roots.push(node);
    }
  };

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trimEnd();
    if (line.trim() === '') continue; // blank line = segment break; no tree effect (§8)

    const heading = line.match(HEADING);
    if (heading) {
      const depth = heading[1].length;
      while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
        stack.pop();
      }
      const node = makeNode(counter, heading[2]);
      appendToParent(node);
      stack.push({ depth, node });
    } else {
      appendToParent(makeNode(counter, line.trim()));
    }
  }

  return roots;
}
