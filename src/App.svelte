<script lang="ts">
  import { onDestroy } from 'svelte';
  import { buildPlaceholderSample } from './data/placeholder-sample';
  import { createSoftwareClock } from './core/clock';
  import { buildAnchorTimeMap, computeActiveNodeIds } from './core/frameState';
  import { resolveUnitStyle } from './core/resolve';
  import VerticalText from './render/VerticalText.svelte';

  const { nodes, anchorGroup, annotations, template, totalDuration } = buildPlaceholderSample();
  const anchorTimes = buildAnchorTimeMap(anchorGroup);
  const clock = createSoftwareClock();

  let theme: 'light' | 'dark' = 'light';
  let t = 0;
  let playing = false;
  let rafId: number | null = null;

  // Style resolution doesn't depend on t, only on theme — resolve once per
  // theme change rather than every animation frame (§12.3 spirit: don't
  // redo static work inside the per-frame loop).
  $: styleCache = Object.fromEntries(
    nodes.map((n) => [n.id, resolveUnitStyle(template, theme, 'main', undefined, n.id)])
  );
  const baseStyleFor = (id: string) => styleCache[id];

  $: activeIds = computeActiveNodeIds(nodes, anchorTimes, t);

  function tick() {
    t = clock.getTime();
    if (t >= totalDuration) {
      clock.pause();
      t = totalDuration;
      playing = false;
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function togglePlay() {
    if (playing) {
      clock.pause();
      playing = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    } else {
      if (t >= totalDuration) clock.seek(0);
      clock.play();
      playing = true;
      rafId = requestAnimationFrame(tick);
    }
  }

  function onSeek(e: Event) {
    const value = Number((e.target as HTMLInputElement).value);
    clock.seek(value);
    t = value;
  }

  onDestroy(() => {
    if (rafId !== null) cancelAnimationFrame(rafId);
  });
</script>

<main>
  <h1>Level 0 骨架验证</h1>
  <p class="notice">测试内容：李白《静夜思》20 字，非项目最终目标内容（佛教梵呗）— 见 src/data/placeholder-sample.ts</p>
  <div class="controls">
    <button on:click={togglePlay}>{playing ? '暂停' : '播放'}</button>
    <input type="range" min="0" max={totalDuration} step="0.01" value={t} on:input={onSeek} />
    <span>{t.toFixed(2)}s / {totalDuration.toFixed(2)}s</span>
    <label>
      <input type="checkbox" on:change={(e) => (theme = e.currentTarget.checked ? 'dark' : 'light')} />
      暗色主题
    </label>
  </div>
  <VerticalText {nodes} {annotations} {activeIds} {template} {theme} {baseStyleFor} />
</main>

<style>
  main {
    font-family: system-ui, sans-serif;
  }
  .notice {
    color: #b8860b;
    font-size: 0.85rem;
  }
  .controls {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem 0;
  }
</style>
