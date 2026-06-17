import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, PLAYER } from '../config.js';
import { input } from '../core/input.js';
import { drawSprite } from '../sprite.js';
import { PLAYER_SPRITE } from '../sprites.js';
import { Bullet } from './bullet.js';

const FIRE_COOLDOWN = 0.16;
const MAX_BULLETS = 2; // classic Galaga 2-bullet limit
const RESPAWN_DELAY = 1.2;
const RESPAWN_INVULN = 2.0;

export class Player {
  constructor() {
    this.width = PLAYER_SPRITE.width;
    this.height = PLAYER_SPRITE.height;
    this.x = VIRTUAL_WIDTH / 2;
    this.y = VIRTUAL_HEIGHT - 22;
    this.cooldown = 0;
    this.alive = true;
    this.invuln = 0;
    this.respawnTimer = 0;
  }

  // Called by the game when the player is hit (and not invulnerable).
  kill() {
    this.alive = false;
    this.respawnTimer = RESPAWN_DELAY;
  }

  update(dt, bullets) {
    if (!this.alive) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.alive = true;
        this.invuln = RESPAWN_INVULN;
        this.x = VIRTUAL_WIDTH / 2;
      }
      return;
    }

    if (this.invuln > 0) this.invuln -= dt;

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

  getBounds() {
    const w = this.width - 4;
    const h = this.height - 4;
    return { x: this.x - w / 2, y: this.y - h / 2, w, h };
  }

  render(ctx) {
    if (!this.alive) return;
    // Blink while invulnerable just after respawning.
    if (this.invuln > 0 && Math.floor(this.invuln * 12) % 2 === 0) return;
    drawSprite(
      ctx,
      PLAYER_SPRITE,
      Math.round(this.x - this.width / 2),
      Math.round(this.y - this.height / 2)
    );
  }
}
