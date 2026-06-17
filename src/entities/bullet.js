import { COLORS, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../config.js';

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

  getBounds() {
    return { x: this.x - this.width / 2, y: this.y, w: this.width, h: this.height };
  }

  render(ctx) {
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(Math.round(this.x - BULLET_W / 2), Math.round(this.y), BULLET_W, BULLET_H);
  }
}

const E_BULLET_W = 3;
const E_BULLET_H = 5;

// An enemy shot fired during a dive. Travels along a fixed velocity
// (aimed at the player at fire time).
export class EnemyBullet {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = E_BULLET_W;
    this.height = E_BULLET_H;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y > VIRTUAL_HEIGHT + 8 || this.x < -8 || this.x > VIRTUAL_WIDTH + 8) {
      this.dead = true;
    }
  }

  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      w: this.width,
      h: this.height,
    };
  }

  render(ctx) {
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(
      Math.round(this.x - E_BULLET_W / 2),
      Math.round(this.y - E_BULLET_H / 2),
      E_BULLET_W,
      E_BULLET_H
    );
  }
}
