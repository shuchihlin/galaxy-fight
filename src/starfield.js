import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, COLORS } from './config.js';

// A simple multi-layer scrolling starfield for the background.
export class Starfield {
  constructor(count = 70) {
    this.stars = Array.from({ length: count }, () =>
      this.makeStar(Math.random() * VIRTUAL_HEIGHT)
    );
  }

  makeStar(y) {
    const layer = Math.random();
    return {
      x: Math.random() * VIRTUAL_WIDTH,
      y,
      speed: 8 + layer * 34,
      size: layer > 0.75 ? 2 : 1,
      brightness: 0.35 + layer * 0.65,
    };
  }

  update(dt) {
    for (const s of this.stars) {
      s.y += s.speed * dt;
      if (s.y > VIRTUAL_HEIGHT) {
        Object.assign(s, this.makeStar(0));
      }
    }
  }

  render(ctx) {
    ctx.fillStyle = COLORS.star;
    for (const s of this.stars) {
      ctx.globalAlpha = s.brightness;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    }
    ctx.globalAlpha = 1;
  }
}
