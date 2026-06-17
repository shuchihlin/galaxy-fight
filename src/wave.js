import { Enemy } from './entities/enemy.js';

// Schedules and releases enemies into the formation. Enemies stream in
// "flights" (one per row), alternating entry side, with a stagger so they
// follow nose-to-tail down the same path before peeling into their slots.
const FLIGHT_STAGGER = 0.18; // seconds between enemies in a flight
const FLIGHT_GAP = 0.5; // extra pause between flights
const FIRST_DELAY = 0.5; // pause before the first enemy enters

export class Wave {
  constructor(formation) {
    this.formation = formation;
    this.enemies = [];
    this.queue = [];
    this.timer = 0;
    this.buildSchedule();
  }

  buildSchedule() {
    const { rows, cols } = this.formation;
    let t = FIRST_DELAY;

    for (let row = 0; row < rows; row++) {
      const side = row % 2 === 0 ? 'left' : 'right';
      const type = row < 2 ? 'butterfly' : 'bee';
      if (row > 0) t += FLIGHT_GAP;

      for (let col = 0; col < cols; col++) {
        this.queue.push({ row, col, side, type, releaseAt: t });
        t += FLIGHT_STAGGER;
      }
    }
  }

  get done() {
    return this.queue.length === 0 && this.enemies.every((e) => e.state === 'formation');
  }

  update(dt) {
    this.timer += dt;
    this.formation.update(dt);

    while (this.queue.length && this.queue[0].releaseAt <= this.timer) {
      this.enemies.push(new Enemy(this.queue.shift(), this.formation));
    }

    for (const e of this.enemies) e.update(dt);
  }

  render(ctx) {
    for (const e of this.enemies) e.render(ctx);
  }
}
