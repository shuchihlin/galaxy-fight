import { Enemy } from './entities/enemy.js';

// Schedules and releases enemies into the formation, then periodically
// sends formed-up enemies on dive attacks. Enemies stream in "flights"
// (one per row), alternating entry side, staggered nose-to-tail.
const FLIGHT_STAGGER = 0.18; // seconds between enemies in a flight
const FLIGHT_GAP = 0.5; // extra pause between flights
const FIRST_DELAY = 0.5; // pause before the first enemy enters
const DIVE_INTERVAL = 1.8; // seconds between dive launches
const MAX_DIVERS = 2; // concurrent attackers
const CAPTURE_FIRST = 5; // delay before the first capture attempt
const CAPTURE_INTERVAL = 10; // between capture attempts

// Galaga-style layout: bosses anchor the center of the top row, flanked
// by butterflies, with bees filling the bottom rows.
function typeFor(row, col) {
  if (row === 0 && col >= 2 && col <= 5) return 'boss';
  if (row <= 2) return 'butterfly';
  return 'bee';
}

export class Wave {
  constructor(formation, difficulty = {}) {
    this.formation = formation;
    this.difficulty = difficulty;
    this.diveInterval = difficulty.diveInterval ?? DIVE_INTERVAL;
    this.maxDivers = difficulty.maxDivers ?? MAX_DIVERS;
    this.captureInterval = difficulty.captureInterval ?? CAPTURE_INTERVAL;
    this.enemies = [];
    this.queue = [];
    this.timer = 0;
    this.diveTimer = this.diveInterval;
    this.captureTimer = CAPTURE_FIRST;
    this.buildSchedule();
  }

  buildSchedule() {
    const { rows, cols } = this.formation;
    let t = FIRST_DELAY;

    for (let row = 0; row < rows; row++) {
      const side = row % 2 === 0 ? 'left' : 'right';
      if (row > 0) t += FLIGHT_GAP;

      for (let col = 0; col < cols; col++) {
        this.queue.push({ row, col, side, type: typeFor(row, col), releaseAt: t });
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
      this.enemies.push(new Enemy(this.queue.shift(), this.formation, this.difficulty));
    }

    for (const e of this.enemies) e.update(dt, player, enemyBullets);

    // Once everyone has entered, periodically launch a dive attack.
    this.diveTimer -= dt;
    if (this.diveTimer <= 0 && this.queue.length === 0) {
      const formed = this.enemies.filter((e) => e.state === 'formation');
      const divers = this.enemies.filter(
        (e) => e.state === 'diving' || e.state === 'returning'
      );
      if (formed.length > 0 && divers.length < this.maxDivers) {
        formed[Math.floor(Math.random() * formed.length)].startDive(player);
      }
      this.diveTimer = this.diveInterval;
    }

    // Periodically send a boss to attempt a tractor-beam capture.
    this.captureTimer -= dt;
    const capturing = this.enemies.some((e) => e.state === 'capturing');
    if (this.captureTimer <= 0 && this.queue.length === 0 && !capturing) {
      const bosses = this.enemies.filter(
        (e) => e.type === 'boss' && e.state === 'formation' && !e.hasCaptive
      );
      if (bosses.length > 0) {
        bosses[Math.floor(Math.random() * bosses.length)].startCapture();
      }
      this.captureTimer = this.captureInterval;
    }
  }

  render(ctx) {
    for (const e of this.enemies) e.render(ctx);
  }
}
