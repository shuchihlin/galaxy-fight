// Per-stage difficulty scaling. Higher stages dive more often, with more
// concurrent attackers, faster dives, quicker fire, and more frequent
// capture attempts. Values are clamped so it ramps but stays playable.
export function difficultyFor(stage) {
  const s = stage - 1;
  return {
    diveInterval: Math.max(0.7, 1.8 - s * 0.1),
    maxDivers: Math.min(5, 2 + Math.floor(s / 2)),
    diveSpeed: 155 + s * 8,
    fireInterval: Math.max(0.32, 0.6 - s * 0.025),
    captureInterval: Math.max(6, 10 - s * 0.4),
  };
}
