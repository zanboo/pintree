<script lang="ts">
  import { onDestroy } from 'svelte';
  import { buildPlaceholderSample } from './data/placeholder-sample';
  import { createSoftwareClock, createAudioClock, type MasterClock } from './core/clock';
  import { buildAnchorTimeMap, computeActiveNodeIds } from './core/frameState';
  import { resolveUnitStyle } from './core/resolve';
  import { anchorsFromBeats } from './core/anchorGenerators';
  import { createTapAligner } from './core/tapAlign';
  import { highlightWidget } from './widgets/highlightWidget';
  import { createSentenceBoxWidget } from './widgets/sentenceBoxWidget';
  import { createRepeatCounterWidget } from './widgets/repeatCounterWidget';
  import VerticalText from './render/VerticalText.svelte';

  const sample = buildPlaceholderSample();
  const anchorTimes = buildAnchorTimeMap(sample.anchorGroup);

  const sentenceBoxWidget = createSentenceBoxWidget(sample.poemLines.map((l) => l.id));
  const repeatGroup = sample.repeatGroups[0];
  const repeatCounterWidget = repeatGroup ? createRepeatCounterWidget(repeatGroup) : null;

  let theme: 'light' | 'dark' = 'light';
  let t = 0;
  let playing = false;
  let rafId: number | null = null;
  let clock: MasterClock = createSoftwareClock();
  let usingAudioClock = false;
  let audioCtx: AudioContext | null = null;

  $: styleCache = Object.fromEntries(
    sample.leafNodes.map((n) => [n.id, resolveUnitStyle(sample.template, theme, 'main', undefined, n.id)])
  );
  const baseStyleFor = (id: string) => styleCache[id];

  $: activeIds = computeActiveNodeIds(sample.allLines, anchorTimes, t);
  $: highlight = highlightWidget.render({ activeIds, tokens: sample.template.tokens, theme });
  $: sentenceBox = sentenceBoxWidget.render({ activeIds, tokens: sample.template.tokens, theme });
  $: repeatCounter = repeatCounterWidget?.render({ activeIds, tokens: sample.template.tokens, theme }) ?? null;

  function tick() {
    t = clock.getTime();
    if (t >= sample.totalDuration) {
      clock.pause();
      t = sample.totalDuration;
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
      if (t >= sample.totalDuration) clock.seek(0);
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

  function switchClock(useAudio: boolean) {
    if (useAudio === usingAudioClock) return;
    const wasPlaying = playing;
    if (wasPlaying) {
      clock.pause();
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      playing = false;
    }
    if (useAudio) {
      audioCtx = audioCtx ?? new AudioContext();
      clock = createAudioClock(audioCtx);
    } else {
      clock = createSoftwareClock();
    }
    clock.seek(t);
    usingAudioClock = useAudio;
    if (wasPlaying) togglePlay();
  }

  // Beat generator (§3.2 ①) — pure function, shown read-only for illustration.
  const beatDemo = anchorsFromBeats({ bpm: 60, beatsPerUnit: 1, startTime: 0, count: 5 });

  // Tap-to-align generator (§3.2 ③) — exercised standalone, not wired into
  // the poem's own timeline (a live editor integration is out of scope; see
  // src/core/tapAlign.ts).
  const tapDemoUnitIds = ['demo-a', 'demo-b', 'demo-c'];
  const tapAligner = createTapAligner(tapDemoUnitIds);
  let tapResults: { unitId: string; time: number }[] = [];
  function handleTapDemo() {
    const result = tapAligner.tap(performance.now() / 1000);
    if (result) tapResults = [...tapResults, { unitId: result.unitId, time: result.anchor.time }];
  }
  function resetTapDemo() {
    tapAligner.reset();
    tapResults = [];
  }

  onDestroy(() => {
    if (rafId !== null) cancelAnimationFrame(rafId);
  });
</script>

<main>
  <h1>Level 1 最小可用播放器</h1>
  <p class="notice">测试内容：李白《静夜思》+ "南無"x3 演示重复展开 — 非项目最终目标内容</p>

  <div class="controls">
    <button on:click={togglePlay}>{playing ? '暂停' : '播放'}</button>
    <input type="range" min="0" max={sample.totalDuration} step="0.01" value={t} on:input={onSeek} />
    <span>{t.toFixed(2)}s / {sample.totalDuration.toFixed(2)}s</span>
    <label>
      <input type="checkbox" on:change={(e) => (theme = e.currentTarget.checked ? 'dark' : 'light')} />
      暗色主题
    </label>
    <label>
      <input type="checkbox" checked={usingAudioClock} on:change={(e) => switchClock(e.currentTarget.checked)} />
      使用 AudioContext 时钟（否则用软时钟）
    </label>
  </div>

  {#if repeatCounter}
    <p class="counter">重复计数器挂件：第 {repeatCounter.current} / {repeatCounter.total} 遍</p>
  {/if}

  <VerticalText
    lines={sample.allLines}
    annotations={sample.annotations}
    {highlight}
    activeLineId={sentenceBox.activeLineId}
    template={sample.template}
    {theme}
    {baseStyleFor}
  />

  <details>
    <summary>锚点生成器演示（§3.2，只读，不接入上面的播放器）</summary>
    <h3>节拍对齐 anchorsFromBeats</h3>
    <ul>
      {#each beatDemo as a (a.id)}
        <li>{a.id}: {a.time.toFixed(2)}s</li>
      {/each}
    </ul>
    <h3>打点对齐 tap-to-align</h3>
    <button on:click={handleTapDemo} disabled={tapResults.length >= tapDemoUnitIds.length}>打点</button>
    <button on:click={resetTapDemo}>重置</button>
    <ul>
      {#each tapResults as r}
        <li>{r.unitId} -&gt; {r.time.toFixed(2)}s</li>
      {/each}
    </ul>
  </details>
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
    flex-wrap: wrap;
  }
  .counter {
    font-weight: 600;
  }
</style>
