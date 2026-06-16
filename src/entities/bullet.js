import { COLORS } from '../config.js';

const BULLET_SPEED = 260; // px/sec, travels upward
const BULLET_W = 2;
const BULLET_H = 6;

// A player shot. (x) is the center, (y) is the top of the bolt.
export class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = BULLET_W;
    this.height = BULLET_H;
    this.dead = false;
  }

  update(dt) {
    this.y -= BULLET_SPEED * dt;
    if (this.y + BULLET_H < 0) this.dead = true;
  }

  render(ctx) {
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(Math.round(this.x - BULLET_W / 2), Math.round(this.y), BULLET_W, BULLET_H);
  }
}
