import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, COLORS } from './config.js';
import { Starfield } from './starfield.js';
import { input } from './core/input.js';
import { Player } from './entities/player.js';
import { Formation } from './formation.js';
import { Wave } from './wave.js';
import { ChallengingWave } from './challenge.js';
import { difficultyFor } from './difficulty.js';
import { Explosion } from './entities/explosion.js';
import { PLAYER_SPRITE } from './sprites.js';
import { drawSprite } from './sprite.js';
import { audio } from './audio.js';

// A Challenging Stage every 4th stage (3, 7, 11, ...), as in the arcade.
function isChallenging(stage) {
  return stage % 4 === 3;
}

// Axis-aligned bounding-box overlap. Both args are { x, y, w, h } with
// (x, y) the top-left corner.
function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function explosionColor(type) {
  if (type === 'boss') return '#3be86b';
  if (type === 'butterfly') return COLORS.accent;
  return '#3b6cff';
}

// Top-level game object. State machine: title -> playing -> gameover.
export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.starfield = new Starfield();
    this.state = 'title';
    this.elapsed = 0;
    this.reset();
  }

  reset() {
    this.player = new Player();
    this.playerBullets = [];
    this.enemyBullets = [];
    this.explosions = [];
    this.formation = null;
    this.wave = null;
    this.freed = null; // a rescued fighter descending to dock (dual fighter)
    this.score = 0;
    this.lives = 3;
    this.stage = 1;
    this.enterStageIntro();
  }

  // Show the "STAGE n" (or "CHALLENGING STAGE") banner before the wave.
  enterStageIntro() {
    this.phase = 'intro';
    this.phaseTimer = 1.8;
    this.challenge = isChallenging(this.stage);
    this.wave = null;
    this.playerBullets = [];
    this.enemyBullets = [];
    this.stageHits = 0;
    this.stageTotal = 0;
    this.lastBonus = 0;
  }

  beginWave() {
    if (this.challenge) {
      this.wave = new ChallengingWave();
      this.stageTotal = this.wave.total;
    } else {
      this.formation = new Formation();
      this.wave = new Wave(this.formation, difficultyFor(this.stage));
    }
    this.phase = 'fighting';
    audio.stageStart();
  }

  triggerGameOver() {
    this.player.alive = false;
    this.state = 'gameover';
    audio.stopMusic();
    audio.gameOver();
  }

  enterStageClear() {
    this.phase = 'clear';
    if (this.challenge) {
      const perfect = this.stageTotal > 0 && this.stageHits === this.stageTotal;
      this.lastBonus = this.stageHits * 100 + (perfect ? 10000 : 0);
      this.score += this.lastBonus;
      this.phaseTimer = 3.0;
    } else {
      this.phaseTimer = 1.4;
    }
  }

  update(dt) {
    this.elapsed += dt;
    this.starfield.update(dt);

    if (input.wasPressed('mute')) audio.toggleMute();

    if (this.state === 'title') {
      if (input.wasPressed('start') || input.wasPressed('fire')) {
        this.reset();
        this.state = 'playing';
        audio.startMusic();
      }
    } else if (this.state === 'playing') {
      this.updatePlaying(dt);
    } else if (this.state === 'gameover') {
      for (const ex of this.explosions) ex.update(dt);
      this.explosions = this.explosions.filter((e) => !e.done);
      if (input.wasPressed('start')) this.state = 'title';
    }

    input.clearFrame();
  }

  updatePlaying(dt) {
    if (this.phase === 'intro') {
      this.phaseTimer -= dt;
      this.player.update(dt, this.playerBullets);
      if (this.phaseTimer <= 0) this.beginWave();
      return;
    }

    if (this.phase === 'clear') {
      this.phaseTimer -= dt;
      this.player.update(dt, this.playerBullets);
      for (const ex of this.explosions) ex.update(dt);
      this.explosions = this.explosions.filter((e) => !e.done);
      if (this.phaseTimer <= 0) {
        this.stage += 1;
        this.enterStageIntro();
      }
      return;
    }

    // phase === 'fighting'
    this.wave.update(dt, this.player, this.enemyBullets);
    if (!this.challenge) this.handleCapture();
    this.player.update(dt, this.playerBullets);

    for (const b of this.playerBullets) b.update(dt);
    for (const b of this.enemyBullets) b.update(dt);
    for (const ex of this.explosions) ex.update(dt);

    this.handleCollisions();
    if (!this.challenge) this.updateRescue(dt);

    this.playerBullets = this.playerBullets.filter((b) => !b.dead);
    this.enemyBullets = this.enemyBullets.filter((b) => !b.dead);
    this.explosions = this.explosions.filter((e) => !e.done);

    if (this.wave.cleared) this.enterStageClear();
  }

  handleCollisions() {
    // Player shots vs enemies.
    for (const b of this.playerBullets) {
      if (b.dead) continue;
      for (const e of this.wave.enemies) {
        if (e.dead) continue;
        if (aabb(b.getBounds(), e.getBounds())) {
          b.dead = true;
          const destroyed = e.hit();
          if (destroyed) {
            this.score += e.points;
            this.explosions.push(new Explosion(e.x, e.y, explosionColor(e.type)));
            audio.explosion();
            if (this.challenge) this.stageHits += 1;
            // Destroying a boss that holds your ship frees it.
            if (e.hasCaptive && !this.player.dual) this.freed = { x: e.x, y: e.y };
          } else {
            audio.smallHit();
          }
          break;
        }
      }
    }

    const vulnerable = this.player.alive && this.player.invuln <= 0 && !this.player.captured;

    // Enemy shots vs player.
    if (vulnerable) {
      for (const b of this.enemyBullets) {
        if (b.dead) continue;
        if (aabb(b.getBounds(), this.player.getBounds())) {
          b.dead = true;
          this.killPlayer();
          break;
        }
      }
    }

    // Diving enemy bodies vs player.
    if (vulnerable && this.player.alive) {
      for (const e of this.wave.enemies) {
        if (e.dead || e.state !== 'diving') continue;
        if (aabb(e.getBounds(), this.player.getBounds())) {
          e.dead = true;
          this.explosions.push(new Explosion(e.x, e.y, explosionColor(e.type)));
          this.killPlayer();
          break;
        }
      }
    }

    this.wave.enemies = this.wave.enemies.filter((e) => !e.dead);
  }

  killPlayer() {
    // A dual fighter loses one ship and reverts to single — no life lost.
    if (this.player.dual) {
      this.player.dual = false;
      this.player.invuln = 1.2;
      this.explosions.push(
        new Explosion(this.player.x + this.player.dualOffset, this.player.y, COLORS.player)
      );
      return;
    }

    this.explosions.push(new Explosion(this.player.x, this.player.y, COLORS.player));
    audio.explosion();
    this.lives -= 1;
    if (this.lives <= 0) {
      this.triggerGameOver();
    } else {
      this.player.kill();
    }
  }

  // Detect entering a beam, and finalize the capture once the player has
  // been pulled all the way into the boss.
  handleCapture() {
    const p = this.player;

    if (p.captured && p.captor) {
      const c = p.captor;
      const ty = c.y + c.height / 2 + p.height / 2 + 2;
      if (Math.hypot(p.x - c.x, p.y - ty) < 3) {
        c.hasCaptive = true;
        c.captureDone();
        p.captured = false;
        p.captor = null;
        this.lives -= 1;
        if (this.lives <= 0) {
          this.triggerGameOver();
        } else {
          p.kill();
        }
      }
      return;
    }

    if (!p.alive || p.dual || p.invuln > 0) return;
    const captor = this.wave.enemies.find((e) => e.beamActive && !e.hasCaptive);
    if (captor && captor.beamContains(p.x, p.y)) {
      p.captured = true;
      p.captor = captor;
      captor.capturePhase = 'holding';
    }
  }

  // A rescued fighter drifts down and docks with the player → dual fighter.
  updateRescue(dt) {
    if (!this.freed || !this.player.alive) return;
    const f = this.freed;
    const k = Math.min(1, 2.2 * dt);
    f.x += (this.player.x - f.x) * k;
    f.y += (this.player.y - f.y) * k;
    if (Math.hypot(f.x - this.player.x, f.y - this.player.y) < 4) {
      this.player.dual = true;
      this.freed = null;
      audio.rescue();
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    this.starfield.render(ctx);

    if (this.state === 'title') {
      this.renderTitle(ctx);
    } else {
      this.renderPlaying(ctx);
      if (this.state === 'gameover') this.renderGameOver(ctx);
    }
  }

  renderTitle(ctx) {
    ctx.textAlign = 'center';

    ctx.fillStyle = COLORS.player;
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillText('GALAXY', VIRTUAL_WIDTH / 2, 104);
    ctx.fillStyle = COLORS.accent;
    ctx.fillText('FIGHT', VIRTUAL_WIDTH / 2, 132);

    if (Math.floor(this.elapsed * 2) % 2 === 0) {
      ctx.fillStyle = COLORS.white;
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('PRESS ENTER', VIRTUAL_WIDTH / 2, 200);
    }

    ctx.fillStyle = COLORS.dim;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('M = MUTE', VIRTUAL_WIDTH / 2, 224);
    ctx.fillText('PHASE 7 - AUDIO', VIRTUAL_WIDTH / 2, 272);
  }

  renderPlaying(ctx) {
    if (this.wave) this.wave.render(ctx);
    for (const b of this.enemyBullets) b.render(ctx);
    for (const b of this.playerBullets) b.render(ctx);
    for (const ex of this.explosions) ex.render(ctx);
    if (this.freed) {
      drawSprite(
        ctx,
        PLAYER_SPRITE,
        Math.round(this.freed.x - PLAYER_SPRITE.width / 2),
        Math.round(this.freed.y - PLAYER_SPRITE.height / 2)
      );
    }
    this.player.render(ctx);
    this.renderHud(ctx);

    if (this.phase === 'intro') this.renderStageBanner(ctx);
    else if (this.phase === 'clear') this.renderStageClear(ctx);
  }

  renderStageBanner(ctx) {
    ctx.textAlign = 'center';
    if (this.challenge) {
      ctx.fillStyle = '#ffd23f';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText('CHALLENGING', VIRTUAL_WIDTH / 2, 134);
      ctx.fillText('STAGE', VIRTUAL_WIDTH / 2, 152);
    } else {
      ctx.fillStyle = COLORS.player;
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText('STAGE ' + this.stage, VIRTUAL_WIDTH / 2, 144);
    }
  }

  renderStageClear(ctx) {
    if (!this.challenge) return; // normal stages just pause briefly
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd23f';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('HITS ' + this.stageHits + '/' + this.stageTotal, VIRTUAL_WIDTH / 2, 132);

    const perfect = this.stageTotal > 0 && this.stageHits === this.stageTotal;
    ctx.fillStyle = COLORS.white;
    ctx.fillText(
      perfect ? 'PERFECT! 10000' : 'BONUS ' + this.stageHits * 100,
      VIRTUAL_WIDTH / 2,
      152
    );
  }

  renderGameOver(ctx) {
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.accent;
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText('GAME OVER', VIRTUAL_WIDTH / 2, 150);

    if (Math.floor(this.elapsed * 2) % 2 === 0) {
      ctx.fillStyle = COLORS.white;
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('PRESS ENTER', VIRTUAL_WIDTH / 2, 178);
    }
  }

  renderHud(ctx) {
    ctx.fillStyle = COLORS.white;
    ctx.font = '6px "Press Start 2P", monospace';

    ctx.textAlign = 'left';
    ctx.fillText('SCORE ' + String(this.score).padStart(5, '0'), 4, 10);

    ctx.textAlign = 'right';
    ctx.fillText('LIVES ' + this.lives, VIRTUAL_WIDTH - 4, 10);

    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.dim;
    ctx.fillText('ST ' + this.stage, VIRTUAL_WIDTH / 2, 10);

    if (audio.muted) {
      ctx.textAlign = 'left';
      ctx.fillStyle = COLORS.dim;
      ctx.fillText('MUTE', 4, VIRTUAL_HEIGHT - 4);
    }
  }
}
