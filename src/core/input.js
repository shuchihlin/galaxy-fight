// Minimal keyboard manager exposing held keys plus edge-triggered
// "was pressed this frame" queries for actions like fire/start.

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
};

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

export const input = {
  isDown: (action) => held.has(action),
  wasPressed: (action) => pressed.has(action),
  // Call once at the end of each update so edge triggers fire only once.
  clearFrame: () => pressed.clear(),
};
