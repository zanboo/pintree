// Master clock, per docs/design-v0.8.md §0. Single source of truth for t.
//
// Only the no-audio-track (software) branch is built here: `performance.now()`
// driven, per §0's explicit degradation rule for audio-less works. The
// `AudioContext.currentTime` branch is Level 1 scope (the roadmap lists
// "主时钟契约接入 AudioContext" under Level 1, since Level 0 has no audio
// track yet) — add it as a second implementation of this same interface,
// don't rewrite call sites.

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
