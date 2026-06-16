import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../config.js';

// Sets the canvas backbuffer to the virtual resolution and scales the
// element up by the largest whole-number factor that fits the window,
// so pixels stay sharp and square.
export function setupCanvas(canvas) {
  canvas.width = VIRTUAL_WIDTH;
  canvas.height = VIRTUAL_HEIGHT;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  function resize() {
    const scale = Math.max(
      1,
      Math.floor(
        Math.min(
          window.innerWidth / VIRTUAL_WIDTH,
          window.innerHeight / VIRTUAL_HEIGHT
        )
      )
    );
    canvas.style.width = `${VIRTUAL_WIDTH * scale}px`;
    canvas.style.height = `${VIRTUAL_HEIGHT * scale}px`;
  }

  window.addEventListener('resize', resize);
  resize();

  return ctx;
}
