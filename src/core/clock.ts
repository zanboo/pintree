// Master clock, per docs/design-v0.8.md §0. Single source of truth for t.
// Two implementations of the same MasterClock interface — call sites never
// know which one they're driving.

export interface MasterClock {
  getTime(): number;
  isPlaying(): boolean;
  play(): void;
  pause(): void;
  seek(t: number): void;
}

export function createSoftwareClock(): MasterClock {
  let baseWallMs = 0;
  let baseT = 0;
  let playing = false;

  const getTime = () => (playing ? baseT + (performance.now() - baseWallMs) / 1000 : baseT);

  return {
    getTime,
    isPlaying: () => playing,
    play() {
      if (playing) return;
      baseWallMs = performance.now();
      playing = true;
    },
    pause() {
      if (!playing) return;
      baseT = getTime();
      playing = false;
    },
    seek(t: number) {
      baseT = t;
      baseWallMs = performance.now();
    }
  };
}

// `t = audioContext.currentTime - offset` (§0). AudioContext.currentTime is
// monotonic and read-only — it can't be rewound — so "seek" and "pause" are
// both implemented as offset adjustments plus the context's own
// suspend()/resume(), never by touching currentTime itself. currentTime is
// guaranteed to hold steady while suspended and resume counting seamlessly
// on resume, so no re-sync is needed across a pause/resume cycle.
export function createAudioClock(ctx: AudioContext): MasterClock {
  let offset = ctx.currentTime;

  return {
    getTime: () => ctx.currentTime - offset,
    isPlaying: () => ctx.state === 'running',
    play() {
      if (ctx.state !== 'running') void ctx.resume();
    },
    pause() {
      if (ctx.state === 'running') void ctx.suspend();
    },
    seek(t: number) {
      offset = ctx.currentTime - t;
    }
  };
}
