// sight.js — geometry both watchers share: line of sight and vision cones.
// One file, one job: what a watcher can see. No movement, no drawing here.

import { solids } from './level.js';

// True when the straight segment between two points crosses no solid.
export function hasLineOfSight(x1, y1, x2, y2) {
  for (const rect of solids()) {
    if (segmentHitsRect(x1, y1, x2, y2, rect)) return false;
  }
  return true;
}

// True when point (px, py) sits inside a cone from (ox, oy) facing
// `angle`, within `range` and `halfAngle`, with a clear line of sight.
export function inCone(ox, oy, angle, range, halfAngle, px, py) {
  const dx = px - ox;
  const dy = py - oy;
  const d = Math.hypot(dx, dy);
  if (d > range) return false;
  if (d < 1) return true; // standing on the watcher is always seen
  let diff = Math.atan2(dy, dx) - angle;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  if (Math.abs(diff) > halfAngle) return false;
  return hasLineOfSight(ox, oy, px, py);
}

// Segment-versus-rectangle: true when the segment touches the rectangle.
// A segment that starts inside the rectangle counts as a hit.
function segmentHitsRect(x1, y1, x2, y2, r) {
  if (pointInRect(x1, y1, r) || pointInRect(x2, y2, r)) return true;
  const edges = [
    [r.x, r.y, r.x + r.w, r.y],
    [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
    [r.x + r.w, r.y + r.h, r.x, r.y + r.h],
    [r.x, r.y + r.h, r.x, r.y],
  ];
  return edges.some(([ax, ay, bx, by]) => segmentsCross(x1, y1, x2, y2, ax, ay, bx, by));
}

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function segmentsCross(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d1 = cross(x3 - x1, y3 - y1, x2 - x1, y2 - y1);
  const d2 = cross(x4 - x1, y4 - y1, x2 - x1, y2 - y1);
  const d3 = cross(x1 - x3, y1 - y3, x4 - x3, y4 - y3);
  const d4 = cross(x2 - x3, y2 - y3, x4 - x3, y4 - y3);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function cross(ax, ay, bx, by) {
  return ax * by - ay * bx;
}
