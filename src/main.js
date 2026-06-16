import './style.css';
import { setupCanvas } from './core/canvas.js';
import { setupInput } from './core/input.js';
import { startLoop } from './core/loop.js';
import { Game } from './game.js';

const canvas = document.getElementById('game');
const ctx = setupCanvas(canvas);
setupInput();

const game = new Game(ctx);

startLoop({
  update: (dt) => game.update(dt),
  render: () => game.render(),
});
