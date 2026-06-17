// Keyboard + pointer/touch input. Exposes held keys, edge-triggered "was
// pressed this frame" queries, and a pointer (touch or mouse) mapped into
// virtual-screen coordinates for drag-to-move + auto-fire on mobile.
import { VIRTUAL_WIDTH } from '../config.js';

const held = new Set();
const pressed = new Set();

const KEY_MAP = {
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
  ' ': 'fire',
  Enter: 'start',
  m: 'mute',
  M: 'mute',
  p: 'pause',
  P: 'pause',
};

export const pointer = { active: false, pressed: false, x: VIRTUAL_WIDTH / 2 };

export function setupInput() {
  window.addEventListener('keydown', (e) => {
    const action = KEY_MAP[e.key];
    if (!action) return;
    if (!held.has(action)) pressed.add(action);
    held.add(action);
    e.preventDefault();
  });

  window.addEventListener('keyup', (e) => {
    const action = KEY_MAP[e.key];
    if (!action) return;
    held.delete(action);
    e.preventDefault();
  });
}

// Maps touch/mouse coordinates onto the virtual playfield. Also works with
// a mouse on desktop.
export function setupPointer(canvas) {
  const toVirtual = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    const vx = ((clientX - rect.left) / rect.width) * VIRTUAL_WIDTH;
    return Math.max(0, Math.min(VIRTUAL_WIDTH, vx));
  };
  const down = (clientX) => {
    if (!pointer.active) pointer.pressed = true;
    pointer.active = true;
    pointer.x = toVirtual(clientX);
  };
  const move = (clientX) => {
    if (pointer.active) pointer.x = toVirtual(clientX);
  };
  const up = () => {
    pointer.active = false;
  };

  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); down(e.touches[0].clientX); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); move(e.touches[0].clientX); }, { passive: false });
  canvas.addEventListener('touchend', (e) => { e.preventDefault(); up(); }, { passive: false });
  canvas.addEventListener('mousedown', (e) => down(e.clientX));
  window.addEventListener('mousemove', (e) => move(e.clientX));
  window.addEventListener('mouseup', up);
}

export const input = {
  isDown: (action) => held.has(action),
  wasPressed: (action) => pressed.has(action),
  // Call once at the end of each update so edge triggers fire only once.
  clearFrame: () => {
    pressed.clear();
    pointer.pressed = false;
  },
};
