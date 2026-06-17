import { Path } from '../path.js';
import { drawSprite } from '../sprite.js';
import {
  BEE_SPRITE,
  BUTTERFLY_SPRITE,
  BOSS_SPRITE,
  BOSS_HIT_SPRITE,
  PLAYER_SPRITE,
} from '../sprites.js';
import { EnemyBullet } from './bullet.js';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../config.js';

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
const DIVE_SPEED = 155; // px/sec along a dive attack (default; scales by stage)
const DIVE_FIRE_INTERVAL = 0.6;
const FLYTHROUGH_SPEED = 115; // px/sec during challenging-stage patterns

// Capture (tractor-beam) tuning.
const HOVER_Y = 150; // where the boss hovers to deploy the beam
const BEAM_MAX_HALF = 26; // beam half-width at the bottom of the screen
const BEAM_GROW = 0.4; // seconds to open / close the beam
const BEAM_HOLD = 2.6; // seconds the beam stays open if it catches nothing

export class Enemy {
  constructor(slot, formation, difficulty = {}) {
    this.row = slot.row ?? 0;
    this.col = slot.col ?? 0;
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
    this.exited = false;
    this.fireTimer = 0;
    this.diveSpeed = difficulty.diveSpeed ?? DIVE_SPEED;
    this.fireInterval = difficulty.fireInterval ?? DIVE_FIRE_INTERVAL;

    // Capture state.
    this.hasCaptive = false;
    this.capturePhase = null;
    this.beamT = 0;
    this.holdTimer = 0;
    this.dist = 0;

    if (formation) {
      const common = slot.side === 'left' ? LEFT_ENTRY : RIGHT_ENTRY;
      const home = formation.slotHome(this.row, this.col);
      this.path = new Path([...common, home]);
      this.state = 'entering';
      const start = this.path.at(0);
      this.x = start.x;
      this.y = start.y;
    } else {
      // Challenging-stage enemy: set up with startFlythrough().
      this.state = 'idle';
      this.x = slot.x ?? 0;
      this.y = slot.y ?? -20;
    }
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

  // A boss-only attack: dive to a hover point and deploy a tractor beam.
  startCapture() {
    this.state = 'capturing';
    this.capturePhase = 'dive';
    const sx = this.x;
    const sy = this.y;
    const dir = sx < VIRTUAL_WIDTH / 2 ? 1 : -1;
    this.path = new Path([
      { x: sx, y: sy },
      { x: sx + dir * 24, y: sy + 50 },
      { x: VIRTUAL_WIDTH / 2, y: HOVER_Y },
    ]);
    this.dist = 0;
    this.beamT = 0;
    this.holdTimer = 0;
  }

  // Called by the game once the player has been fully pulled in.
  captureDone() {
    this.capturePhase = 'retract';
  }

  // Challenging-stage movement: fly a pattern across the screen and exit.
  startFlythrough(path) {
    this.state = 'flythrough';
    this.path = path;
    this.dist = 0;
    const start = path.at(0);
    this.x = start.x;
    this.y = start.y;
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

  get beamActive() {
    return (
      (this.capturePhase === 'beam' || this.capturePhase === 'holding') && this.beamT > 0.4
    );
  }

  beamHalfWidthAt(y) {
    const apexY = this.y + this.height / 2;
    if (y < apexY || y > VIRTUAL_HEIGHT) return 0;
    const frac = (y - apexY) / (VIRTUAL_HEIGHT - apexY);
    return BEAM_MAX_HALF * frac;
  }

  beamContains(px, py) {
    if (!this.beamActive) return false;
    const half = this.beamHalfWidthAt(py);
    return half > 0 && Math.abs(px - this.x) <= half;
  }

  update(dt, player, enemyBullets) {
    if (this.state === 'capturing') {
      this.updateCapture(dt);
      return;
    }

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
      this.dist += this.diveSpeed * dt;
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
        this.fireTimer = this.fireInterval;
      }

      if (this.dist >= this.path.length) this.startReturn();
    } else if (this.state === 'flythrough') {
      this.dist += FLYTHROUGH_SPEED * dt;
      const p = this.path.at(this.dist);
      this.x = p.x;
      this.y = p.y;
      if (this.dist >= this.path.length) this.exited = true;
    }
  }

  updateCapture(dt) {
    if (this.capturePhase === 'dive') {
      this.dist += DIVE_SPEED * dt;
      const p = this.path.at(this.dist);
      this.x = p.x;
      this.y = p.y;
      if (this.dist >= this.path.length) {
        this.capturePhase = 'beam';
        this.beamT = 0;
        this.holdTimer = 0;
      }
    } else if (this.capturePhase === 'beam') {
      this.beamT = Math.min(1, this.beamT + dt / BEAM_GROW);
      this.holdTimer += dt;
      if (this.holdTimer > BEAM_HOLD) this.capturePhase = 'retract';
    } else if (this.capturePhase === 'holding') {
      this.beamT = 1; // hold until the game finishes pulling the player in
    } else if (this.capturePhase === 'retract') {
      this.beamT = Math.max(0, this.beamT - dt / BEAM_GROW);
      if (this.beamT <= 0) {
        this.capturePhase = null;
        this.startReturn();
      }
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
    if (this.beamT > 0.01 && this.capturePhase) this.renderBeam(ctx);

    const sprite = this.damaged && this.hitSprite ? this.hitSprite : this.sprite;
    drawSprite(
      ctx,
      sprite,
      Math.round(this.x - this.width / 2),
      Math.round(this.y - this.height / 2)
    );

    // A captured fighter rides just below the boss that holds it.
    if (this.hasCaptive) {
      drawSprite(
        ctx,
        PLAYER_SPRITE,
        Math.round(this.x - PLAYER_SPRITE.width / 2),
        Math.round(this.y + this.height / 2 + 1)
      );
    }
  }

  renderBeam(ctx) {
    const apexY = this.y + this.height / 2;
    const span = VIRTUAL_HEIGHT - apexY;
    const half = BEAM_MAX_HALF * this.beamT;

    ctx.save();
    // Soft purple cone.
    ctx.globalAlpha = 0.22 * this.beamT;
    ctx.fillStyle = '#7a4dff';
    ctx.beginPath();
    ctx.moveTo(this.x, apexY);
    ctx.lineTo(this.x - half, VIRTUAL_HEIGHT);
    ctx.lineTo(this.x + half, VIRTUAL_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Animated bands sliding down the beam.
    ctx.globalAlpha = 0.5 * this.beamT;
    ctx.fillStyle = '#b39dff';
    const t = (performance.now() / 320) % 1;
    for (let i = 0; i < 5; i++) {
      const f = (i / 5 + t) % 1;
      const by = apexY + f * span;
      const bw = half * f;
      ctx.fillRect(this.x - bw, by, bw * 2, 2);
    }
    ctx.restore();
  }
}
