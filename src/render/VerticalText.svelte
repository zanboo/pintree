<script lang="ts">
  // Minimal DOM renderer for Level 0: writing-mode: vertical-rl + native
  // <ruby>/<rt> for right-side annotation (§13.1 — this native mechanism is
  // exactly the head-risk being real-device-tested). Active-state updates
  // only ever touch the leaf <ruby> element's own class (§12.4 rule 1) —
  // never a container-level CSS variable.
  import type { ContentNode } from '../schema/work';
  import { resolveTokenRef } from '../core/resolve';
  import type { VisualTemplate } from '../schema/work';

  export let nodes: ContentNode[];
  export let annotations: Record<string, string>;
  export let activeIds: Set<string>;
  export let template: VisualTemplate;
  export let theme: string;
  export let baseStyleFor: (nodeId: string) => Record<string, string | number>;

  $: accentColor = resolveTokenRef('$color.accent', template.tokens, theme);
  $: bgColor = resolveTokenRef('$color.bg', template.tokens, theme);
</script>

<div class="vertical-text" style:background={String(bgColor)}>
  {#each nodes as node (node.id)}
    {@const style = baseStyleFor(node.id)}
    {@const active = activeIds.has(node.id)}
    <ruby
      class="unit"
      class:active
      style:color={active ? String(accentColor) : String(style.color)}
      style:font-size="{style.size}px"
    >
      {node.block.value}<rt>{annotations[node.id] ?? ''}</rt>
    </ruby>
  {/each}
</div>

<style>
  .vertical-text {
    writing-mode: vertical-rl;
    text-orientation: upright;
    line-height: 2.2;
    padding: 2rem;
    min-height: 60vh;
  }

  .unit {
    ruby-position: over; /* maps to the right side under vertical-rl (§13.1 / §5.2 ruby.position:"right") */
  }

  .unit.active {
    font-weight: 700;
  }
</style>
