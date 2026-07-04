<script lang="ts">
  // DOM renderer for Level 0/1: writing-mode: vertical-rl + native <ruby>/<rt>
  // for right-side annotation (§13.1 — this native mechanism is exactly the
  // head-risk being real-device-tested). Active-state updates only ever
  // touch the leaf <ruby> element's own class/color, or a single line span's
  // background (§12.4 rule 1) — never a root-container-level CSS variable.
  import type { ContentNode, VisualTemplate } from '../schema/work';
  import { resolveTokenRef } from '../core/resolve';
  import type { HighlightStyle } from '../widgets/highlightWidget';

  export let lines: ContentNode[]; // each node's `children` are the rendered leaves
  export let annotations: Record<string, string>;
  export let highlight: Record<string, HighlightStyle>;
  export let activeLineId: string | null;
  export let template: VisualTemplate;
  export let theme: string;
  export let baseStyleFor: (nodeId: string) => Record<string, string | number>;

  $: bgColor = resolveTokenRef('$color.bg', template.tokens, theme);
  $: lineHighlightColor = resolveTokenRef('$color.line-highlight', template.tokens, theme);
</script>

<div class="vertical-text" style:background={String(bgColor)}>
  {#each lines as line (line.id)}
    {@const isCurrentLine = line.id === activeLineId}
    <span class="line" class:current={isCurrentLine} style:background={isCurrentLine ? String(lineHighlightColor) : 'transparent'}>
      {#each line.children ?? [] as node (node.id)}
        {@const style = baseStyleFor(node.id)}
        {@const active = node.id in highlight}
        <ruby
          class="unit"
          class:active
          style:color={active ? String(highlight[node.id].color) : String(style.color)}
          style:font-size="{style.size}px"
        >
          {node.block.value}<rt>{annotations[node.id] ?? ''}</rt>
        </ruby>
      {/each}
    </span>
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

  .line {
    border-radius: 4px;
  }

  .unit {
    ruby-position: over; /* maps to the right side under vertical-rl (§13.1 / §5.2 ruby.position:"right") */
  }

  .unit.active {
    font-weight: 700;
  }
</style>
