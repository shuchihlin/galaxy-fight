import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, PLAYER } from '../config.js';
import { input, pointer } from '../core/input.js';
import { drawSprite } from '../sprite.js';
import { PLAYER_SPRITE } from '../sprites.js';
import { Bullet } from './bullet.js';
import { audio } from '../audio.js';

const FIRE_COOLDOWN = 0.16;
const RESPAWN_DELAY = 1.2;
const RESPAWN_INVULN = 2.0;
const MAX_BULLETS = 3; // bullets on screen for a single fighter
const MAX_BULLETS_DUAL = 6; // dual fighter keeps double the cap

export class Player {
  constructor() {
    this.width = PLAYER_SPRITE.width;
    this.height = PLAYER_SPRITE.height;
    this.baseY = VIRTUAL_HEIGHT - 22; // the ship's home line at the bottom
    this.x = VIRTUAL_WIDTH / 2;
    this.y = this.baseY;
    this.cooldown = 0;
    this.alive = true;
    this.invuln = 0;
    this.respawnTimer = 0;

    // Capture / dual-fighter state.
    this.captured = false;
    this.captor = null;
    this.captureSpin = 0;
    this.dual = false;
    this.dualOffset = Math.floor(this.width / 2);
  }

  // Called by the game when the player is hit (and not invulnerable).
  kill() {
    this.alive = false;
    this.respawnTimer = RESPAWN_DELAY;
    this.dual = false;
  }

  update(dt, bullets) {
    if (this.captured) {
      this.updateCaptured(dt);
      return;
    }

    if (!this.alive) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.alive = true;
        this.invuln = RESPAWN_INVULN;
        this.x = VIRTUAL_WIDTH / 2;
        this.y = this.baseY;
      }
      return;
    }

    if (this.invuln > 0) this.invuln -= dt;

    const step = PLAYER.speed * dt;
    if (input.isDown('left')) this.x -= step;
    if (input.isDown('right')) this.x += step;
    // Touch / mouse: glide toward the pointer's x.
    if (pointer.active) {
      const dx = pointer.x - this.x;
      this.x += Math.abs(dx) <= step ? dx : Math.sign(dx) * step;
    }
    const half = this.dual ? this.dualOffset + this.width / 2 : this.width / 2;
    this.x = Math.max(half, Math.min(VIRTUAL_WIDTH - half, this.x));

    if (this.cooldown > 0) this.cooldown -= dt;
    // Holding fire or touching the screen both shoot.
    if ((input.isDown('fire') || pointer.active) && this.cooldown <= 0) this.fire(bullets);
  }

  // Being drawn up into the capturing boss: spin and drift toward it.
  updateCaptured(dt) {
    this.captureSpin += dt * 9;
    const c = this.captor;
    if (!c) {
      this.captured = false;
      return;
    }
    const ty = c.y + c.height / 2 + this.height / 2 + 2;
    const k = Math.min(1, 2.4 * dt);
    this.x += (c.x - this.x) * k;
    this.y += (ty - this.y) * k;
  }

  fire(bullets) {
    const max = this.dual ? MAX_BULLETS_DUAL : MAX_BULLETS;
    if (bullets.length >= max) return;

    const ny = this.y - this.height / 2;
    if (this.dual) {
      bullets.push(new Bullet(this.x - this.dualOffset, ny));
      if (bullets.length < max) bullets.push(new Bullet(this.x + this.dualOffset, ny));
    } else {
      bullets.push(new Bullet(this.x, ny));
    }
    audio.shoot();
    this.cooldown = FIRE_COOLDOWN;
  }

  getBounds() {
    const h = this.height - 4;
    if (this.dual) {
      const w = this.dualOffset * 2 + (this.width - 4);
      return { x: this.x - w / 2, y: this.y - h / 2, w, h };
    }
    const w = this.width - 4;
    return { x: this.x - w / 2, y: this.y - h / 2, w, h };
  }

  render(ctx) {
    if (this.captured) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.captureSpin);
      drawSprite(ctx, PLAYER_SPRITE, -this.width / 2, -this.height / 2);
      ctx.restore();
      return;
    }

    if (!this.alive) return;
    // Blink while invulnerable just after respawning.
    if (this.invuln > 0 && Math.floor(this.invuln * 12) % 2 === 0) return;

    if (this.dual) {
      this.drawAt(ctx, this.x - this.dualOffset);
      this.drawAt(ctx, this.x + this.dualOffset);
    } else {
      this.drawAt(ctx, this.x);
    }
  }

  drawAt(ctx, cx) {
    drawSprite(
      ctx,
      PLAYER_SPRITE,
      Math.round(cx - this.width / 2),
      Math.round(this.y - this.height / 2)
    );
  }
}
