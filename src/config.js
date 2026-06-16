// Virtual (internal) resolution. Galaga's arcade screen is a portrait
// 224x288 display — we render to that and scale up with crisp pixels.
export const VIRTUAL_WIDTH = 224;
export const VIRTUAL_HEIGHT = 288;

// Retro palette — faithful to the arcade look without copying assets.
export const COLORS = {
  bg: '#04000f',
  white: '#ffffff',
  dim: '#8888aa',
  player: '#41d6ff',
  accent: '#ff3b3b',
  star: '#ffffff',
};

// Player tuning (px and px/second).
export const PLAYER = {
  speed: 110,
  width: 14,
  height: 14,
};
