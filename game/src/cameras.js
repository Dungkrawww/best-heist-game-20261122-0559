// cameras.js — the two wall cameras: sweeping cones, EMP blackouts and
// the question "does any live camera see the thief?".
// One file, one job: the cameras.

import { ALARM, CAMERA } from './config.js';
import { inCone } from './sight.js';

export function createCameras(mounts) {
  return mounts.map((m) => ({
    x: m.x,
    y: m.y,
    baseAngle: m.baseAngle,
    sweep: m.sweep,
    phase: m.phase,
    angle: m.baseAngle,
    seen: false, // does this camera see the thief right now?
  }));
}

export function updateCameras(cameras, now, dt) {
  for (const camera of cameras) {
    camera.angle = camera.baseAngle + Math.sin(now * CAMERA.sweepSpeed + camera.phase) * camera.sweep;
  }
}

// Returns the alarm rise the cameras cause this tick (0 when the thief is
// unseen, or while the EMP has every camera dark).
export function cameraDetection(cameras, thief, hidden, empUntil, now) {
  if (now < empUntil) {
    for (const camera of cameras) camera.seen = false;
    return 0;
  }
  let rise = 0;
  for (const camera of cameras) {
    camera.seen =
      !hidden && inCone(camera.x, camera.y, camera.angle, CAMERA.range, CAMERA.halfAngle, thief.x, thief.y);
    if (camera.seen) rise = Math.max(rise, ALARM.cameraRate);
  }
  return rise;
}

// True while the EMP blackout is still running.
export function camerasDark(empUntil, now) {
  return now < empUntil;
}
