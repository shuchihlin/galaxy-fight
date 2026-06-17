import { Path } from '../path.js';
import { drawSprite } from '../sprite.js';
import { BEE_SPRITE, BUTTERFLY_SPRITE, BOSS_SPRITE, BOSS_HIT_SPRITE } from '../sprites.js';
import { EnemyBullet } from './bullet.js';
import { VIRTUAL_WIDTH } from '../config.js';

// Shared entry flight paths (in virtual-screen coords). Enemies enter
// from the top corners, swoop down to mid-screen, loop, then peel off
// toward their formation slot (appended as the final waypoint).
const LEFT_ENTRY = [
  { x: 30, y: -16 },
  { x: 70, y: 70 },
  { x: 112, y: 150 },
  { x: 160, y: 110 },
  { x: 130, y: 50 },
];

const RIGHT_ENTRY = [
  { x: 194, y: -16 },
  { x: 154, y: 70 },
  { x: 112, y: 150 },
  { x: 64, y: 110 },
  { x: 94, y: 50 },
];

const ENTRY_SPEED = 100; // px/sec along entry/return paths
const DIVE_SPEED = 155; // px/sec along a dive attack
const DIVE_FIRE_INTERVAL = 0.6;

export class Enemy {
  constructor(slot, formation) {
    this.row = slot.row;
    this.col = slot.col;
    this.type = slot.type;
    this.formation = formation;

    if (this.type === 'boss') {
      this.sprite = BOSS_SPRITE;
      this.hitSprite = BOSS_HIT_SPRITE;
      this.health = 2;
    } else if (this.type === 'butterfly') {
      this.sprite = BUTTERFLY_SPRITE;
      this.health = 1;
    } else {
      this.sprite = BEE_SPRITE;
      this.health = 1;
    }

    this.width = this.sprite.width;
    this.height = this.sprite.height;
    this.dead = false;
    this.damaged = false;
    this.fireTimer = 0;

    const common = slot.side === 'left' ? LEFT_ENTRY : RIGHT_ENTRY;
    const home = formation.slotHome(this.row, this.col);
    this.path = new Path([...common, home]);
    this.dist = 0;

    this.state = 'entering';
    const start = this.path.at(0);
    this.x = start.x;
    this.y = start.y;
  }

  // Break out of formation and swoop down toward the player, then off the
  // bottom of the screen.
  startDive(player) {
    this.state = 'diving';
    const sx = this.x;
    const sy = this.y;
    const px = player && player.alive ? player.x : VIRTUAL_WIDTH / 2;
    const dir = sx < VIRTUAL_WIDTH / 2 ? 1 : -1;
    this.path = new Path([
      { x: sx, y: sy },
      { x: sx + dir * 28, y: sy + 44 },
      { x: px, y: 172 },
      { x: px - dir * 40, y: 232 },
      { x: px + dir * 16, y: 330 },
    ]);
    this.dist = 0;
    this.fireTimer = 0.45;
  }

  // After diving off-screen, re-enter from the top and fly back to slot.
  startReturn() {
    this.state = 'returning';
    const home = this.formation.slotHome(this.row, this.col);
    this.path = new Path([
      { x: home.x, y: -18 },
      { x: home.x, y: home.y },
    ]);
    this.dist = 0;
    this.x = home.x;
    this.y = -18;
  }

  update(dt, player, enemyBullets) {
    if (this.state === 'entering' || this.state === 'returning') {
      this.dist += ENTRY_SPEED * dt;
      const p = this.path.at(this.dist);
      this.x = p.x;
      this.y = p.y;
      if (this.dist >= this.path.length) this.state = 'formation';
    } else if (this.state === 'formation') {
      const target = this.formation.slotPos(this.row, this.col);
      const k = Math.min(1, 10 * dt);
      this.x += (target.x - this.x) * k;
      this.y += (target.y - this.y) * k;
    } else if (this.state === 'diving') {
      this.dist += DIVE_SPEED * dt;
      const p = this.path.at(this.dist);
      this.x = p.x;
      this.y = p.y;

      this.fireTimer -= dt;
      if (this.fireTimer <= 0 && this.y > 40 && this.y < 236 && player && player.alive && enemyBullets) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const len = Math.hypot(dx, dy) || 1;
        const sp = 150;
        enemyBullets.push(new EnemyBullet(this.x, this.y, (dx / len) * sp, (dy / len) * sp));
        this.fireTimer = DIVE_FIRE_INTERVAL;
      }

      if (this.dist >= this.path.length) this.startReturn();
    }
  }

  // Apply one hit. Returns true if this destroyed the enemy, false if it
  // only wounded it (a Boss Galaga survives its first hit and flashes).
  hit() {
    this.health -= 1;
    if (this.health > 0) {
      this.damaged = true;
      return false;
    }
    this.dead = true;
    return true;
  }

  // Galaga-style scoring: worth double while diving.
  get points() {
    const base = this.type === 'boss' ? 150 : this.type === 'butterfly' ? 80 : 50;
    return this.state === 'diving' ? base * 2 : base;
  }

  getBounds() {
    const w = this.width - 2;
    const h = this.height - 2;
    return { x: this.x - w / 2, y: this.y - h / 2, w, h };
  }

  render(ctx) {
    const sprite = this.damaged && this.hitSprite ? this.hitSprite : this.sprite;
    drawSprite(
      ctx,
      sprite,
      Math.round(this.x - this.width / 2),
      Math.round(this.y - this.height / 2)
    );
  }
}
