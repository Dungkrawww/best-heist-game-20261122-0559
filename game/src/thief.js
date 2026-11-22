// thief.js — Mara Voss: movement, collision, loot grabbing and tools.
// One file, one job: the thief. Guards, cameras and the alarm live elsewhere.

import { THIEF, TOOLS } from './config.js';
import { solids } from './level.js';

// Circle-versus-rectangle push-out: keeps the thief out of walls and cover.
export function collideCircle(pos, radius) {
  for (const rect of solids()) {
    const cx = Math.max(rect.x, Math.min(pos.x, rect.x + rect.w));
    const cy = Math.max(rect.y, Math.min(pos.y, rect.y + rect.h));
    const dx = pos.x - cx;
    const dy = pos.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 >= radius * radius) continue;
    if (d2 === 0) {
      pos.y = rect.y - radius; // centre exactly inside: push up out of it
      continue;
    }
    const d = Math.sqrt(d2);
    pos.x = cx + (dx / d) * radius;
    pos.y = cy + (dy / d) * radius;
  }
}

export function createThief(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    radius: THIEF.radius,
    sneaking: false,
    facing: 0, // radians; the direction the thief last moved
    grabbing: null, // loot piece being channelled, or null
    grabProgress: 0,
    smokeLeft: TOOLS.smoke.count,
    empLeft: TOOLS.emp.count,
    coinLeft: TOOLS.coin.count,
    smokeClouds: [], // {x, y, radius, until}
    empUntil: 0,
    coins: [], // thrown decoys in flight/landed: {x, y}
  };
}

// Move the thief one step. Returns true when the thief actually moved.
export function moveThief(thief, vec, dt, now) {
  const speed = thief.sneaking ? THIEF.sneakSpeed : THIEF.walkSpeed;
  const nx = thief.x + vec.x * speed * dt;
  const ny = thief.y + vec.y * speed * dt;
  if (vec.x !== 0 || vec.y !== 0) thief.facing = Math.atan2(vec.y, vec.x);
  thief.x = nx;
  thief.y = ny;
  collideCircle(thief, thief.radius);
  return vec.x !== 0 || vec.y !== 0;
}

// Stand beside a loot piece to lift it. Returns the piece when the
// channel completes, or null while it is still in progress.
export function grabLoot(thief, spots, dt) {
  let near = null;
  for (const spot of spots) {
    if (spot.taken) continue;
    const d = Math.hypot(thief.x - spot.x, thief.y - spot.y);
    if (d <= THIEF.grabRadius) {
      near = spot;
      break;
    }
  }
  if (!near) {
    thief.grabbing = null;
    thief.grabProgress = 0;
    return null;
  }
  thief.grabbing = near;
  thief.grabProgress += dt / THIEF.grabSeconds;
  if (thief.grabProgress >= 1) {
    near.taken = true;
    thief.grabbing = null;
    thief.grabProgress = 0;
    return near;
  }
  return null;
}

// Drop a smoke pellet at the thief's feet. False when none are left.
export function dropSmoke(thief, now) {
  if (thief.smokeLeft <= 0) return false;
  thief.smokeLeft -= 1;
  thief.smokeClouds.push({
    x: thief.x,
    y: thief.y,
    radius: TOOLS.smoke.radius,
    until: now + TOOLS.smoke.seconds,
  });
  return true;
}

// Fire the EMP: every camera goes dark for a while. False when none left.
export function fireEmp(thief, now) {
  if (thief.empLeft <= 0) return false;
  thief.empLeft -= 1;
  thief.empUntil = now + TOOLS.emp.seconds;
  return true;
}

// Throw a decoy coin toward a clicked point (clamped to throwing range).
// False when no coins are left.
export function throwCoin(thief, tx, ty) {
  if (thief.coinLeft <= 0) return false;
  const dx = tx - thief.x;
  const dy = ty - thief.y;
  const d = Math.hypot(dx, dy);
  const reach = Math.min(d, TOOLS.coin.throwRange);
  const nx = d === 0 ? thief.x : thief.x + (dx / d) * reach;
  const ny = d === 0 ? thief.y : thief.y + (dy / d) * reach;
  thief.coinLeft -= 1;
  thief.coins.push({ x: nx, y: ny });
  return true;
}

// True while the thief stands inside any live smoke cloud.
export function inSmoke(thief, now) {
  return thief.smokeClouds.some(
    (c) => now < c.until && Math.hypot(thief.x - c.x, thief.y - c.y) <= c.radius,
  );
}

// True when the point (px, py) is hidden behind smoke from a viewer at
// (vx, vy): the segment between them crosses a live cloud.
export function smokeBlocks(thief, vx, vy, px, py, now) {
  for (const c of thief.smokeClouds) {
    if (now >= c.until) continue;
    if (segmentHitsCircle(vx, vy, px, py, c.x, c.y, c.radius)) return true;
  }
  return false;
}

function segmentHitsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((cx - x1) * dx + (cy - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = x1 + t * dx;
  const py = y1 + t * dy;
  return Math.hypot(px - cx, py - cy) <= r;
}
