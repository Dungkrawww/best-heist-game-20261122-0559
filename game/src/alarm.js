// alarm.js — the alarm meter: rises while the thief is seen, falls while
// hidden, and names the stage the heist is in.
// One file, one job: the alarm.

import { ALARM } from './config.js';

export function createAlarm() {
  return { value: 0 };
}

// `rise` is alarm points per second from every watcher this tick.
// Sneaking and shadows slow the climb; smoke blocks it entirely.
export function updateAlarm(alarm, rise, thiefSneaking, thiefInShadow, dt) {
  let rate = rise;
  if (thiefSneaking) rate *= ALARM.sneakFactor;
  if (thiefInShadow) rate *= ALARM.shadowFactor;
  if (rate > 0) {
    alarm.value = Math.min(ALARM.max, alarm.value + rate * dt);
  } else if (alarm.value < ALARM.lockdownAt) {
    alarm.value = Math.max(0, alarm.value - ALARM.decayPerSecond * dt);
  }
}

// 'calm' | 'suspicious' | 'lockdown' | 'caught'
export function alarmStage(alarm) {
  if (alarm.value >= ALARM.caughtAt) return 'caught';
  if (alarm.value >= ALARM.lockdownAt) return 'lockdown';
  if (alarm.value >= ALARM.suspiciousAt) return 'suspicious';
  return 'calm';
}

// 0..1 fill for the meter bar.
export function alarmFill(alarm) {
  return alarm.value / ALARM.max;
}
