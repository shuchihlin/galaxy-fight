// Smooth flight paths via a Catmull-Rom spline through a list of
// waypoints. The spline is sampled once into a dense polyline with
// cumulative arc-lengths, so enemies can travel it at a constant speed
// (move by distance, not by curve parameter).

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

export class Path {
  constructor(waypoints, samples = 20) {
    // Pad the ends so the spline reaches the first and last waypoint.
    const w = waypoints;
    const ext = [w[0], ...w, w[w.length - 1]];

    const pts = [];
    for (let i = 0; i < ext.length - 3; i++) {
      for (let s = 0; s < samples; s++) {
        pts.push(catmull(ext[i], ext[i + 1], ext[i + 2], ext[i + 3], s / samples));
      }
    }
    pts.push({ ...w[w.length - 1] });

    this.pts = pts;
    this.cum = [0];
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      this.cum.push(this.cum[i - 1] + Math.hypot(dx, dy));
    }
    this.length = this.cum[this.cum.length - 1];
  }

  // Position at a given distance travelled along the path.
  at(dist) {
    if (dist <= 0) return { ...this.pts[0] };
    if (dist >= this.length) return { ...this.pts[this.pts.length - 1] };

    let i = 1;
    while (i < this.cum.length && this.cum[i] < dist) i++;
    const t = (dist - this.cum[i - 1]) / (this.cum[i] - this.cum[i - 1]);
    const a = this.pts[i - 1];
    const b = this.pts[i];
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }
}
