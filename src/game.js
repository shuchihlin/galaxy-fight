import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, COLORS, PLAYER } from './config.js';
import { Starfield } from './starfield.js';
import { input } from './core/input.js';

// Top-level game object. For Phase 0 this is a simple two-state machine
// (title -> playing) that proves the loop, input, and rendering pipeline
// all work end to end. Later phases hang enemies, bullets, etc. off here.
export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.starfield = new Starfield();
    this.state = 'title';
    this.elapsed = 0;
    this.player = {
      x: VIRTUAL_WIDTH / 2,
      y: VIRTUAL_HEIGHT - 28,
    };
  }

  update(dt) {
    this.elapsed += dt;
    this.starfield.update(dt);

    if (this.state === 'title') {
      if (input.wasPressed('start') || input.wasPressed('fire')) {
        this.state = 'playing';
      }
    } else if (this.state === 'playing') {
      const p = this.player;
      if (input.isDown('left')) p.x -= PLAYER.speed * dt;
      if (input.isDown('right')) p.x += PLAYER.speed * dt;
      const half = PLAYER.width / 2;
      p.x = Math.max(half, Math.min(VIRTUAL_WIDTH - half, p.x));
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

    // Blinking prompt.
    if (Math.floor(this.elapsed * 2) % 2 === 0) {
      ctx.fillStyle = COLORS.white;
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('PRESS ENTER', VIRTUAL_WIDTH / 2, 200);
    }

    ctx.fillStyle = COLORS.dim;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('PHASE 0 - SCAFFOLD', VIRTUAL_WIDTH / 2, 272);
  }

  renderPlaying(ctx) {
    this.drawShip(ctx, this.player.x, this.player.y);

    ctx.fillStyle = COLORS.dim;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MOVE: < >', 6, 12);
  }

  // Placeholder triangle ship — real pixel-art sprite arrives in Phase 1.
  drawShip(ctx, x, y) {
    const w = PLAYER.width;
    const h = PLAYER.height;
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.lineTo(x - w / 2, y + h / 2);
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.closePath();
    ctx.fill();
  }
}
