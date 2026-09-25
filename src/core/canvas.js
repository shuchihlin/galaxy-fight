import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../config.js';

// Sets the canvas backbuffer to the virtual resolution and scales the
// element up to the largest size that fits the viewport while keeping the
// aspect ratio. Scaling is fractional (not whole-number) so the game fills
// the width on phones; `image-rendering: pixelated` keeps pixels sharp.
export function setupCanvas(canvas) {
  canvas.width = VIRTUAL_WIDTH;
  canvas.height = VIRTUAL_HEIGHT;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  function resize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / VIRTUAL_WIDTH, vh / VIRTUAL_HEIGHT);
    canvas.style.width = `${Math.floor(VIRTUAL_WIDTH * scale)}px`;
    canvas.style.height = `${Math.floor(VIRTUAL_HEIGHT * scale)}px`;
  }

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resize);
  }
  resize();

  return ctx;
}
