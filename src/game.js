import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, COLORS } from './config.js';
import { Starfield } from './starfield.js';
import { input } from './core/input.js';
import { Player } from './entities/player.js';
import { Formation } from './formation.js';
import { Wave } from './wave.js';

// Top-level game object. State machine: title -> playing. Enemies and
// collisions arrive in Phases 2-3 and hang off the playing state here.
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
    this.bullets = [];
    this.formation = new Formation();
    this.wave = new Wave(this.formation);
    this.score = 0;
    this.lives = 3;
  }

  update(dt) {
    this.elapsed += dt;
    this.starfield.update(dt);

    if (this.state === 'title') {
      if (input.wasPressed('start') || input.wasPressed('fire')) {
        this.reset();
        this.state = 'playing';
      }
    } else if (this.state === 'playing') {
      this.wave.update(dt);
      this.player.update(dt, this.bullets);
      for (const b of this.bullets) b.update(dt);
      this.bullets = this.bullets.filter((b) => !b.dead);
    }

    input.clearFrame();
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    this.starfield.render(ctx);

    if (this.state === 'title') this.renderTitle(ctx);
    else this.renderPlaying(ctx);
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
    ctx.fillText('PHASE 2 - FORMATION', VIRTUAL_WIDTH / 2, 272);
  }

  renderPlaying(ctx) {
    this.wave.render(ctx);
    for (const b of this.bullets) b.render(ctx);
    this.player.render(ctx);
    this.renderHud(ctx);
  }

  renderHud(ctx) {
    ctx.fillStyle = COLORS.white;
    ctx.font = '6px "Press Start 2P", monospace';

    ctx.textAlign = 'left';
    ctx.fillText('SCORE ' + String(this.score).padStart(5, '0'), 4, 10);

    ctx.textAlign = 'right';
    ctx.fillText('LIVES ' + this.lives, VIRTUAL_WIDTH - 4, 10);
  }
}
