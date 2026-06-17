import './style.css';
import { setupCanvas } from './core/canvas.js';
import { setupInput, setupPointer } from './core/input.js';
import { startLoop } from './core/loop.js';
import { Game } from './game.js';
import { audio } from './audio.js';

const canvas = document.getElementById('game');
const ctx = setupCanvas(canvas);
setupInput();
setupPointer(canvas);

// Browsers require a user gesture before audio can start.
function unlockAudio() {
  audio.ensure();
  audio.resume();
}
window.addEventListener('keydown', unlockAudio, { once: true });
window.addEventListener('pointerdown', unlockAudio, { once: true });

const game = new Game(ctx);

// Dev-only handle for debugging in the console (stripped from production builds).
if (import.meta.env.DEV) window.game = game;

startLoop({
  update: (dt) => game.update(dt),
  render: () => game.render(),
});
