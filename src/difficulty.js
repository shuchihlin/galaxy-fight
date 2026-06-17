// Per-stage difficulty scaling. Higher stages dive more often, with more
// concurrent attackers, faster dives, quicker fire, and more frequent
// capture attempts. Values are clamped so it ramps but stays playable.
export function difficultyFor(stage) {
  const s = stage - 1;
  return {
    diveInterval: Math.max(0.5, 1.4 - s * 0.1), // dive more often, sooner
    maxDivers: Math.min(6, 3 + Math.floor(s / 2)), // more simultaneous attackers
    diveSpeed: 170 + s * 9, // faster, harder-to-dodge dives
    fireInterval: Math.max(0.25, 0.5 - s * 0.03), // enemies shoot more
    captureInterval: Math.max(5, 9 - s * 0.4), // capture attempts a bit sooner
  };
}
