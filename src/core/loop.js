// Fixed-timestep game loop. update() always runs in equal `step` slices
// so game logic is deterministic and frame-rate independent; render()
// runs once per animation frame.
export function startLoop({ update, render, step = 1 / 60 }) {
  let last = performance.now();
  let accumulator = 0;

  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    // Clamp huge gaps (tab was backgrounded) so we don't spiral.
    if (dt > 0.25) dt = 0.25;

    accumulator += dt;
    while (accumulator >= step) {
      update(step);
      accumulator -= step;
    }
    render();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
