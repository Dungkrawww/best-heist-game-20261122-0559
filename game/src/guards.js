// guards.js — Rook, Bishop and Knight: patrol loops, alert chases and
// decoy investigations, plus the question "does this guard see the thief?".
// One file, one job: the guards.

import { ALARM, GUARD } from './config.js';
import { inCone } from './sight.js';
import { collideCircle } from './thief.js';

export function createGuards(patrols) {
  return patrols.map((p, i) => ({
    name: p.name,
    waypoints: p.waypoints,
    pauseSeconds: p.pauseSeconds,
    x: p.waypoints[0].x,
    y: p.waypoints[0].y,
    targetIndex: 1,
    facing: Math.PI / 2,
    pauseLeft: 0,
    state: 'patrol', // patrol | alert | investigate
    stateUntil: 0,
    investigateX: 0,
    investigateY: 0,
    seen: false, // does this guard see the thief right now?
    seenDistance: Infinity,
  }));
}

// Turn `facing` toward `target` at most `rate * dt` radians.
function turnToward(guard, target, rate, dt) {
  let diff = target - guard.facing;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  const step = Math.max(-rate * dt, Math.min(rate * dt, diff));
  guard.facing += step;
}

// Walk toward (tx, ty) at `speed`; returns true on arrival.
function walkToward(guard, tx, ty, speed, dt) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const d = Math.hypot(dx, dy);
  if (d < 4) return true;
  const step = Math.min(d, speed * dt);
  guard.x += (dx / d) * step;
  guard.y += (dy / d) * step;
  turnToward(guard, Math.atan2(dy, dx), GUARD.turnSpeed * 2.2, dt);
  collideCircle(guard, GUARD.radius);
  return d - step < 4;
}

export function updateGuards(guards, thief, alarm, dt, now) {
  const suspicious = alarm >= ALARM.suspiciousAt;
  const lockdown = alarm >= ALARM.lockdownAt;
  for (const guard of guards) {
    const speedScale = suspicious ? 1.25 : 1;
    if (guard.state === 'alert') {
      // Chase the last seen spot; give up after a few seconds.
      const arrived = walkToward(guard, guard.investigateX, guard.investigateY, GUARD.alertSpeed * speedScale, dt);
      if (arrived || now >= guard.stateUntil) {
        guard.state = 'patrol';
        guard.pauseLeft = 0.6;
      }
    } else if (guard.state === 'investigate') {
      const arrived = walkToward(guard, guard.investigateX, guard.investigateY, GUARD.investigateSpeed * speedScale, dt);
      if (arrived) {
        // Look around, then go back to the patrol loop.
        turnToward(guard, guard.facing + Math.PI * 0.75, GUARD.turnSpeed, dt);
        if (now >= guard.stateUntil) {
          guard.state = 'patrol';
          guard.pauseLeft = 0.4;
        }
      }
    } else {
      // Patrol: walk to the next waypoint, pause, face the next leg.
      if (guard.pauseLeft > 0) {
        guard.pauseLeft -= dt;
        const next = guard.waypoints[guard.targetIndex];
        turnToward(guard, Math.atan2(next.y - guard.y, next.x - guard.x), GUARD.turnSpeed, dt);
      } else {
        const next = guard.waypoints[guard.targetIndex];
        const arrived = walkToward(guard, next.x, next.y, GUARD.patrolSpeed * speedScale, dt);
        if (arrived) {
          guard.targetIndex = (guard.targetIndex + 1) % guard.waypoints.length;
          guard.pauseLeft = guard.pauseSeconds;
        }
      }
    }
    // Lockdown: a patrolling guard turns toward the thief's last known
    // direction once in a while, so hiding in one spot stops working.
    if (lockdown && guard.state === 'patrol' && Math.random() < dt * 0.15) {
      guard.state = 'investigate';
      guard.investigateX = thief.x;
      guard.investigateY = thief.y;
      guard.stateUntil = now + 2.5;
    }
  }
}

// A thrown coin pulls the nearest patrolling guard to the landing spot.
export function distractGuards(guards, x, y, now) {
  let best = null;
  let bestD = Infinity;
  for (const guard of guards) {
    if (guard.state !== 'patrol') continue;
    const d = Math.hypot(guard.x - x, guard.y - y);
    if (d < bestD) {
      bestD = d;
      best = guard;
    }
  }
  if (!best) return false;
  best.state = 'investigate';
  best.investigateX = x;
  best.investigateY = y;
  best.stateUntil = now + 4;
  return true;
}

// Refresh every guard's `seen` flag and, when one spots the thief, flip it
// to alert and remember where the thief was. Returns the fastest alarm
// rise any guard causes this tick (0 when nobody sees the thief).
export function guardDetection(guards, thief, hidden, now) {
  let rise = 0;
  for (const guard of guards) {
    const d = Math.hypot(thief.x - guard.x, thief.y - guard.y);
    guard.seenDistance = d;
    guard.seen =
      !hidden && inCone(guard.x, guard.y, guard.facing, GUARD.coneRange, GUARD.coneHalfAngle, thief.x, thief.y);
    if (!guard.seen) continue;
    rise = Math.max(rise, d < 90 ? ALARM.guardNear : ALARM.guardFar);
    if (guard.state !== 'alert') {
      guard.state = 'alert';
      guard.investigateX = thief.x;
      guard.investigateY = thief.y;
      guard.stateUntil = now + 3.5;
    } else {
      guard.investigateX = thief.x;
      guard.investigateY = thief.y;
      guard.stateUntil = now + 3.5;
    }
  }
  return rise;
}
