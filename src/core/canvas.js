import { VIEW, requestHeight, applyPendingView, onViewApplied } from './view.js';

// Sizes the canvas backbuffer to the live playfield (VIEW.w x VIEW.h) and
// scales the element to fit the safe area of its container while keeping
// the aspect ratio. The playfield height follows the screen's aspect ratio
// (see view.js), so on phones the game fills the screen with no bars.
// `image-rendering: pixelated` keeps the fractional upscale sharp.
export function setupCanvas(canvas) {
  const container = canvas.parentElement;
  const ctx = canvas.getContext('2d');

  // Content box of the container (excludes safe-area padding).
  function available() {
    const cs = getComputedStyle(container);
    const w =
      container.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h =
      container.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    return { w: Math.max(1, w), h: Math.max(1, h) };
  }

  function fit() {
    const { w, h } = available();
    const scale = Math.min(w / VIEW.w, h / VIEW.h);
    canvas.style.width = `${Math.floor(VIEW.w * scale)}px`;
    canvas.style.height = `${Math.floor(VIEW.h * scale)}px`;
  }

  function applyBackbuffer() {
    canvas.width = VIEW.w;
    canvas.height = VIEW.h;
    ctx.imageSmoothingEnabled = false; // reset by resizing the backbuffer
    fit();
  }

  function resize() {
    const { w, h } = available();
    requestHeight((VIEW.w * h) / w);
    fit();
  }

  onViewApplied(applyBackbuffer);
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resize);
  }

  resize();
  applyPendingView();
  applyBackbuffer();

  return ctx;
}
