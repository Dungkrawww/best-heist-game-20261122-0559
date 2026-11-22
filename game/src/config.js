// config.js — every tuning number for The Gilded Vault in one place.
// One file, one job: constants. Nothing here runs the game.

export const WORLD = { w: 1280, h: 800 };

export const THIEF = {
  radius: 13,
  walkSpeed: 205, // pixels per second
  sneakSpeed: 115,
  grabSeconds: 1.2, // channel time beside a loot piece
  grabRadius: 46,
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 78,
  alertSpeed: 132,
  investigateSpeed: 105,
  coneRange: 265,
  coneHalfAngle: 0.61, // ~35 degrees each side
  turnSpeed: 2.4, // radians per second while patrolling
};

export const CAMERA = {
  range: 300,
  halfAngle: 0.42, // ~24 degrees each side
  sweepSpeed: 0.55, // radians per second
};

export const ALARM = {
  max: 100,
  decayPerSecond: 2.2, // falls while nobody sees the thief
  // detection rate (alarm points per second) while seen, scaled by distance
  guardNear: 34, // closer than 90 px inside a guard cone
  guardFar: 13, // farther inside a guard cone
  cameraRate: 20,
  sneakFactor: 0.5, // sneaking halves how fast the alarm climbs
  shadowFactor: 0.5, // standing in a shadow pool halves it again
  suspiciousAt: 40, // guards walk faster, cones turn quicker
  lockdownAt: 75, // guards converge on the thief, alarm decays no more
  caughtAt: 100,
};

export const TOOLS = {
  smoke: { count: 3, radius: 95, seconds: 5 },
  emp: { count: 2, seconds: 6 },
  coin: { count: 3, throwRange: 420 },
};

export const LOOT = [
  { id: 'diamond', name: 'Sunburst Diamond', value: 500, x: 640, y: 150 },
  { id: 'ledger', name: 'Gilded Ledger', value: 300, x: 180, y: 400 },
  { id: 'falcon', name: 'Jade Falcon', value: 400, x: 1100, y: 400 },
];

export const SCORE = {
  timeBonusMax: 600, // escaping fast pays; loses 5 points a second
  timeBonusPerSecond: 5,
};

export const COLORS = {
  floorA: '#171d2b',
  floorB: '#131826',
  wall: '#2c3550',
  wallTrim: '#c9a227',
  cover: '#232c44',
  coverEdge: '#3a4767',
  rope: '#8a6d3b',
  shadow: '#0d1526',
  exit: '#2fbf71',
  thief: '#e8e6df',
  thiefCoat: '#b3402e',
  guard: '#4a6fa5',
  guardCone: 'rgba(255, 176, 32, 0.20)',
  guardConeEdge: 'rgba(255, 176, 32, 0.55)',
  cameraCone: 'rgba(255, 64, 64, 0.16)',
  cameraConeEdge: 'rgba(255, 64, 64, 0.5)',
  loot: '#ffd94a',
  smoke: 'rgba(200, 205, 215, 0.55)',
  hud: '#e8e6df',
  alarmCalm: '#2fbf71',
  alarmWarm: '#ffb020',
  alarmHot: '#ff4040',
};
