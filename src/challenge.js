import { Enemy } from './entities/enemy.js';
import { Path } from './path.js';

// A Challenging Stage: enemies fly through in form-up patterns and never
// shoot or settle. You score by hitting them; clearing them all earns a
// perfect bonus. The player can't be hit during these stages.
const FLYTHROUGH_PATHS = [
  [
    { x: -20, y: -10 },
    { x: 70, y: 80 },
    { x: 170, y: 50 },
    { x: 90, y: 170 },
    { x: 200, y: 320 },
  ],
  [
    { x: 244, y: -10 },
    { x: 154, y: 80 },
    { x: 54, y: 50 },
    { x: 134, y: 170 },
    { x: 24, y: 320 },
  ],
  [
    { x: 112, y: -10 },
    { x: 30, y: 110 },
    { x: 112, y: 190 },
    { x: 194, y: 110 },
    { x: 112, y: 320 },
  ],
];

const GROUP_SIZE = 5;
const GROUPS = 6;
const STAGGER = 0.22;
const GAP = 0.7;
const FIRST_DELAY = 0.4;
const TYPES = ['bee', 'butterfly', 'boss'];

export class ChallengingWave {
  constructor() {
    this.enemies = [];
    this.queue = [];
    this.timer = 0;
    this.total = 0;

    let t = FIRST_DELAY;
    for (let g = 0; g < GROUPS; g++) {
      const tmpl = FLYTHROUGH_PATHS[g % FLYTHROUGH_PATHS.length];
      const type = TYPES[g % TYPES.length];
      if (g > 0) t += GAP;
      for (let k = 0; k < GROUP_SIZE; k++) {
        this.queue.push({ type, tmpl, releaseAt: t });
        this.total += 1;
        t += STAGGER;
      }
    }
  }

  get cleared() {
    return this.queue.length === 0 && this.enemies.length === 0;
  }

  update(dt) {
    this.timer += dt;
    while (this.queue.length && this.queue[0].releaseAt <= this.timer) {
      const q = this.queue.shift();
      const e = new Enemy({ type: q.type }, null, {});
      e.startFlythrough(new Path(q.tmpl));
      this.enemies.push(e);
    }
    for (const e of this.enemies) e.update(dt);
    this.enemies = this.enemies.filter((e) => !e.dead && !e.exited);
  }

  render(ctx) {
    for (const e of this.enemies) e.render(ctx);
  }
}
