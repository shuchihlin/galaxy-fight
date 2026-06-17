import './style.css';
import { setupCanvas } from './core/canvas.js';
import { setupInput } from './core/input.js';
import { startLoop } from './core/loop.js';
import { Game } from './game.js';

const canvas = document.getElementById('game');
const ctx = setupCanvas(canvas);
setupInput();

const game = new Game(ctx);

// Dev-only handle for debugging in the console (stripped from production builds).
if (import.meta.env.DEV) window.game = game;

startLoop({
  update: (dt) => game.update(dt),
  render: () => game.render(),
});
