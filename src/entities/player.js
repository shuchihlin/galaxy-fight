import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, PLAYER } from '../config.js';
import { input } from '../core/input.js';
import { drawSprite } from '../sprite.js';
import { PLAYER_SPRITE } from '../sprites.js';
import { Bullet } from './bullet.js';

// Minimum time between shots. The hard cap, though, is the classic
// Galaga rule enforced in update(): at most 2 player bullets on screen.
const FIRE_COOLDOWN = 0.16;
const MAX_BULLETS = 2;

export class Player {
  constructor() {
    this.width = PLAYER_SPRITE.width;
    this.height = PLAYER_SPRITE.height;
    this.x = VIRTUAL_WIDTH / 2; // center x
    this.y = VIRTUAL_HEIGHT - 22; // center y
    this.cooldown = 0;
  }

  update(dt, bullets) {
    if (input.isDown('left')) this.x -= PLAYER.speed * dt;
    if (input.isDown('right')) this.x += PLAYER.speed * dt;

    const half = this.width / 2;
    this.x = Math.max(half, Math.min(VIRTUAL_WIDTH - half, this.x));

    if (this.cooldown > 0) this.cooldown -= dt;

    if (input.isDown('fire') && this.cooldown <= 0 && bullets.length < MAX_BULLETS) {
      bullets.push(new Bullet(this.x, this.y - this.height / 2));
      this.cooldown = FIRE_COOLDOWN;
    }
  }

  render(ctx) {
    drawSprite(
      ctx,
      PLAYER_SPRITE,
      Math.round(this.x - this.width / 2),
      Math.round(this.y - this.height / 2)
    );
  }
}
