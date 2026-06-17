import { VIRTUAL_WIDTH } from './config.js';

// The enemy formation grid near the top of the screen. The whole grid
// sways gently side to side ("breathing"), and enemies lock to their
// slot's live position once they finish their entry flight.
export class Formation {
  constructor() {
    this.cols = 8;
    this.rows = 5;
    this.cellW = 20;
    this.cellH = 18;
    this.topY = 44;

    this.sway = 0;
    this.swayAmp = 10;
    this.swaySpeed = 1.1;
  }

  update(dt) {
    this.sway += dt * this.swaySpeed;
  }

  offset() {
    return Math.sin(this.sway) * this.swayAmp;
  }

  // Base slot position with no sway — used as the entry-path endpoint.
  slotHome(row, col) {
    const totalW = (this.cols - 1) * this.cellW;
    return {
      x: VIRTUAL_WIDTH / 2 - totalW / 2 + col * this.cellW,
      y: this.topY + row * this.cellH,
    };
  }

  // Live slot position including the current sway offset.
  slotPos(row, col) {
    const home = this.slotHome(row, col);
    return { x: home.x + this.offset(), y: home.y };
  }
}
