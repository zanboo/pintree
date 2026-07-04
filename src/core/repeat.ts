// Repeat parse-time expansion, per docs/design-v0.8.md §2.4.
//
// A node with `repeat.count = N` plus exactly one `timing.bindings` entry
// (that binding's own interval is read as "how long one repetition takes")
// is expanded here into N flattened sibling instances, each with its own
// binding shifted along the timeline. After expansion, f(t) has zero
// awareness that repeat ever existed — it only sees N plain instances,
// matching §2.4's framing exactly. "Current repeat index" is never stored;
// it's derived later by checking which instance is active (see
// widgets/repeatCounterWidget.ts).

import type { AnchorGroup, ContentNode } from '../schema/work';
import { buildAnchorTimeMap } from './frameState';

export interface RepeatGroup {
  originalId: string;
  count: number;
  instanceIds: string[]; // length === count, in playback order
}

function cloneWithoutRepeat(node: ContentNode, id: string, from: string, to: string): ContentNode {
  const { repeat: _repeat, timing: _timing, ...rest } = node;
  return { ...rest, id, timing: { bindings: [{ from, to }] } };
}

export function expandRepeats(
  roots: ContentNode[],
  anchorGroup: AnchorGroup
): { roots: ContentNode[]; anchorGroup: AnchorGroup; repeatGroups: RepeatGroup[] } {
  const anchorTimes = buildAnchorTimeMap(anchorGroup);
  const newAnchors = [...anchorGroup.anchors];
  const repeatGroups: RepeatGroup[] = [];
  let counter = 0;
  const nextAnchorId = (prefix: string) => `${prefix}-x${(counter += 1)}`;

  const expandList = (nodes: ContentNode[]): ContentNode[] => {
    const result: ContentNode[] = [];

    for (const node of nodes) {
      const expandedChildren = node.children ? expandList(node.children) : undefined;
      const withChildren = expandedChildren ? { ...node, children: expandedChildren } : node;

      if (!withChildren.repeat) {
        result.push(withChildren);
        continue;
      }

      const bindings = withChildren.timing?.bindings;
      if (!bindings || bindings.length !== 1) {
        throw new Error(
          `Node ${withChildren.id} has repeat.count but not exactly one timing binding to derive a per-repetition duration from`
        );
      }
      const t0 = anchorTimes.get(bindings[0].from);
      const t1 = anchorTimes.get(bindings[0].to);
      if (t0 === undefined || t1 === undefined) {
        throw new Error(`Unresolved anchor reference on repeating node ${withChildren.id}`);
      }
      const duration = t1 - t0;
      const count = withChildren.repeat.count;

      const boundaryIds = [bindings[0].from, bindings[0].to];
      for (let i = 2; i <= count; i++) {
        const id = nextAnchorId(withChildren.id);
        newAnchors.push({ id, time: t0 + i * duration, origin: 'manual' });
        boundaryIds.push(id);
      }

      const instanceIds: string[] = [];
      for (let i = 0; i < count; i++) {
        const instanceId = `${withChildren.id}-r${i + 1}`;
        instanceIds.push(instanceId);
        result.push(cloneWithoutRepeat(withChildren, instanceId, boundaryIds[i], boundaryIds[i + 1]));
      }
      repeatGroups.push({ originalId: withChildren.id, count, instanceIds });
    }

    return result;
  };

  const expandedRoots = expandList(roots);
  return {
    roots: expandedRoots,
    anchorGroup: { ...anchorGroup, anchors: newAnchors },
    repeatGroups
  };
}
