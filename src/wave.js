import { Enemy } from './entities/enemy.js';

// Schedules and releases enemies into the formation, then periodically
// sends formed-up enemies on dive attacks. Enemies stream in "flights"
// (one per row), alternating entry side, staggered nose-to-tail.
const FLIGHT_STAGGER = 0.18; // seconds between enemies in a flight
const FLIGHT_GAP = 0.5; // extra pause between flights
const FIRST_DELAY = 0.5; // pause before the first enemy enters
const DIVE_INTERVAL = 1.8; // seconds between dive launches
const MAX_DIVERS = 2; // concurrent attackers

export class Wave {
  constructor(formation) {
    this.formation = formation;
    this.enemies = [];
    this.queue = [];
    this.timer = 0;
    this.diveTimer = DIVE_INTERVAL;
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

  get cleared() {
    return this.queue.length === 0 && this.enemies.length === 0;
  }

  update(dt, player, enemyBullets) {
    this.timer += dt;
    this.formation.update(dt);

    while (this.queue.length && this.queue[0].releaseAt <= this.timer) {
      this.enemies.push(new Enemy(this.queue.shift(), this.formation));
    }

    for (const e of this.enemies) e.update(dt, player, enemyBullets);

    // Once everyone has entered, periodically launch a dive attack.
    this.diveTimer -= dt;
    if (this.diveTimer <= 0 && this.queue.length === 0) {
      const formed = this.enemies.filter((e) => e.state === 'formation');
      const divers = this.enemies.filter(
        (e) => e.state === 'diving' || e.state === 'returning'
      );
      if (formed.length > 0 && divers.length < MAX_DIVERS) {
        formed[Math.floor(Math.random() * formed.length)].startDive(player);
      }
      this.diveTimer = DIVE_INTERVAL;
    }
  }

  render(ctx) {
    for (const e of this.enemies) e.render(ctx);
  }
}
