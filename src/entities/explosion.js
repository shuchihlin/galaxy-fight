// A short particle burst played when a ship is destroyed. Particles fly
// outward and fade; the explosion reports `done` when fully faded.
export class Explosion {
  constructor(x, y, color = '#ffffff') {
    this.parts = [];
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const s = 20 + Math.random() * 45;
      this.parts.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        size: Math.random() < 0.5 ? 1 : 2,
      });
    }
    this.t = 0;
    this.dur = 0.45;
    this.color = color;
    this.done = false;
  }

  update(dt) {
    this.t += dt;
    for (const p of this.parts) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.9;
      p.vy *= 0.9;
    }
    if (this.t >= this.dur) this.done = true;
  }

  render(ctx) {
    ctx.globalAlpha = Math.max(0, 1 - this.t / this.dur);
    ctx.fillStyle = this.color;
    for (const p of this.parts) {
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}
