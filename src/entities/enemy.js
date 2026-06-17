import { Path } from '../path.js';
import { drawSprite } from '../sprite.js';
import { BEE_SPRITE, BUTTERFLY_SPRITE } from '../sprites.js';

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

const ENTRY_SPEED = 100; // px/sec along the path

export class Enemy {
  constructor(slot, formation) {
    this.row = slot.row;
    this.col = slot.col;
    this.type = slot.type;
    this.formation = formation;
    this.sprite = this.type === 'butterfly' ? BUTTERFLY_SPRITE : BEE_SPRITE;
    this.width = this.sprite.width;
    this.height = this.sprite.height;

    const common = slot.side === 'left' ? LEFT_ENTRY : RIGHT_ENTRY;
    const home = formation.slotHome(this.row, this.col);
    this.path = new Path([...common, home]);
    this.dist = 0;

    this.state = 'entering';
    const start = this.path.at(0);
    this.x = start.x;
    this.y = start.y;
  }

  update(dt) {
    if (this.state === 'entering') {
      this.dist += ENTRY_SPEED * dt;
      const p = this.path.at(this.dist);
      this.x = p.x;
      this.y = p.y;
      if (this.dist >= this.path.length) this.state = 'formation';
    } else {
      // Lock onto the (swaying) slot, easing out any residual gap.
      const target = this.formation.slotPos(this.row, this.col);
      const k = Math.min(1, 10 * dt);
      this.x += (target.x - this.x) * k;
      this.y += (target.y - this.y) * k;
    }
  }

  render(ctx) {
    drawSprite(
      ctx,
      this.sprite,
      Math.round(this.x - this.width / 2),
      Math.round(this.y - this.height / 2)
    );
  }
}
