// level.js — the Meridian Gallery floor plan: walls, cover, shadows,
// loot pedestals, guard patrol loops, camera mounts, exit and spawn.
// One file, one job: the room. No movement, no drawing here.

import { LOOT, WORLD } from './config.js';

// Solid rectangles. Walls ring the room; display cases and pillars block
// both movement and line of sight. Velvet ropes are decoration only.
export const WALLS = [
  { x: 0, y: 0, w: WORLD.w, h: 26 }, // north wall
  { x: 0, y: WORLD.h - 26, w: WORLD.w, h: 26 }, // south wall
  { x: 0, y: 0, w: 26, h: WORLD.h }, // west wall
  { x: WORLD.w - 26, y: 0, w: 26, h: WORLD.h }, // east wall
];

// Interior cover. Three lanes run north-south through the room:
//  - west lane, past the ledger pedestal, behind the tall cases
//  - middle lane, open marble, swept by both cameras
//  - east lane, past the falcon pedestal, behind the pillars
export const COVER = [
  // west tall display cases
  { x: 300, y: 120, w: 26, h: 190, label: 'case' },
  { x: 300, y: 470, w: 26, h: 190, label: 'case' },
  // central statue plinth (the room's heart, blocks sight both ways)
  { x: 590, y: 330, w: 100, h: 90, label: 'plinth' },
  // east pillars
  { x: 950, y: 120, w: 30, h: 30, label: 'pillar' },
  { x: 950, y: 470, w: 30, h: 30, label: 'pillar' },
  // low benches: block sight, can be circled either way
  { x: 470, y: 600, w: 130, h: 26, label: 'bench' },
  { x: 680, y: 600, w: 130, h: 26, label: 'bench' },
];

// Shadow pools: dark corners where the alarm climbs half as fast.
export const SHADOWS = [
  { x: 60, y: 60, w: 150, h: 120 },
  { x: 1070, y: 620, w: 150, h: 120 },
  { x: 60, y: 620, w: 150, h: 120 },
  { x: 1070, y: 60, w: 150, h: 120 },
];

// Loot pedestals, taken from config so names and values live in one place.
export const LOOT_SPOTS = LOOT.map((piece) => ({ ...piece, taken: false }));

// Guard patrol loops: each guard walks its waypoints and pauses at each.
export const GUARD_PATROLS = [
  {
    name: 'Rook',
    waypoints: [
      { x: 420, y: 120 },
      { x: 420, y: 300 },
      { x: 420, y: 660 },
      { x: 420, y: 480 },
    ],
    pauseSeconds: 1.4,
  },
  {
    name: 'Bishop',
    waypoints: [
      { x: 860, y: 660 },
      { x: 860, y: 480 },
      { x: 860, y: 120 },
      { x: 860, y: 300 },
    ],
    pauseSeconds: 1.4,
  },
  {
    name: 'Knight',
    waypoints: [
      { x: 640, y: 250 },
      { x: 900, y: 250 },
      { x: 900, y: 560 },
      { x: 380, y: 560 },
      { x: 380, y: 250 },
    ],
    pauseSeconds: 1.0,
  },
];

// Wall cameras: fixed mounts that sweep a cone back and forth.
export const CAMERA_MOUNTS = [
  { x: 640, y: 72, baseAngle: Math.PI / 2, sweep: 0.85, phase: 0 },
  { x: 640, y: WORLD.h - 72, baseAngle: -Math.PI / 2, sweep: 0.85, phase: 1.6 },
];

export const EXIT_DOOR = { x: 1180, y: 90, w: 62, h: 26, label: 'SERVICE EXIT' };
export const THIEF_SPAWN = { x: 90, y: 700 };

// The room's solid pieces, for collision and line of sight.
export function solids() {
  return [...WALLS, ...COVER];
}

// True when point (px, py) lies inside any shadow pool.
export function inShadow(px, py) {
  return SHADOWS.some((s) => px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h);
}
