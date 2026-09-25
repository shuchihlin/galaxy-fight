// Virtual (internal) resolution. Galaga's arcade screen is a portrait
// 224x288 display. These are the *design* dimensions: gameplay constants
// are authored in this space. The live field height adapts to the screen
// (see core/view.js); width is always 224.
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
