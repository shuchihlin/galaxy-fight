import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../config.js';

// Live playfield size. Width is fixed at the arcade's 224; height grows to
// match the screen's aspect ratio (e.g. ~433 on a portrait iPhone) so the
// game fills the display instead of letterboxing.
//
// Gameplay constants are authored for the original 224x288 field. `sy()`
// maps a design Y onto the current field (y * ky), and path/bullet speeds
// are scaled so travel *times* match the original game.
export const MIN_HEIGHT = VIRTUAL_HEIGHT; // desktop / landscape: classic 224x288
export const MAX_HEIGHT = 520; // cap for extreme aspect ratios

export const VIEW = {
  w: VIRTUAL_WIDTH,
  h: VIRTUAL_HEIGHT,
  ky: 1, // h / 288
};

let pendingH = VIRTUAL_HEIGHT;
let applyHook = null;

// Design Y (288-tall space) -> current field Y.
export const sy = (y) => y * VIEW.ky;

// Record the height the current viewport wants. It is applied only via
// applyPendingView(), which the game calls outside of active play so the
// field never changes size mid-game.
export function requestHeight(h) {
  pendingH = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(h)));
}

export function onViewApplied(fn) {
  applyHook = fn;
}

// Returns true if the field size changed.
export function applyPendingView() {
  if (pendingH === VIEW.h) return false;
  VIEW.h = pendingH;
  VIEW.ky = VIEW.h / VIRTUAL_HEIGHT;
  if (applyHook) applyHook();
  return true;
}
