// main.js — the heist itself: loop, phases, detection, scoring and the
// win/lose rules. One file, one job: running the game.

import { ALARM, SCORE, THIEF, TOOLS, WORLD } from './config.js';
import { CAMERA_MOUNTS, EXIT_DOOR as EXIT, GUARD_PATROLS, LOOT_SPOTS, THIEF_SPAWN, inShadow } from './level.js';
import { hasLineOfSight, inCone } from './sight.js';
import { createInput } from './input.js';
import { createThief, dropSmoke, fireEmp, grabLoot, inSmoke, moveThief, smokeBlocks, throwCoin } from './thief.js';
import { createGuards, distractGuards, guardDetection, updateGuards } from './guards.js';
import { cameraDetection, createCameras, updateCameras } from './cameras.js';
import { alarmStage, createAlarm, updateAlarm } from './alarm.js';
import { drawGame } from './render.js';
import {
  createAudio,
  playCaught,
  playCoin,
  playEmp,
  playEscape,
  playPickup,
  playSmoke,
  playSpotted,
  unlockAudio,
} from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / WORLD.w, window.innerHeight / WORLD.h);
  canvas.width = Math.round(WORLD.w * scale);
  canvas.height = Math.round(WORLD.h * scale);
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;
}

const input = createInput(canvas);
const audio = createAudio();

function freshState() {
  return {
    phase: 'title', // title | playing | caught | escaped
    thief: createThief(THIEF_SPAWN),
    guards: createGuards(GUARD_PATROLS),
    cameras: createCameras(CAMERA_MOUNTS),
    spots: LOOT_SPOTS.map((s) => ({ ...s, taken: false })),
    alarm: createAlarm(),
    time: 0,
    now: 0,
    score: 0,
    lootValue: 0,
    timeBonus: 0,
    alarmPenalty: 0,
    wasSeen: false,
  };
}

let state = freshState();
window.__game = state; // the playtest driver reads this

function reset() {
  state = freshState();
  window.__game = state;
}

function inExit(thief) {
  const d = EXIT;
  return thief.x > d.x - 10 && thief.x < d.x + d.w + 10 && thief.y > d.y - 10 && thief.y < d.y + d.h + 30;
}

function step(dt) {
  const s = state;
  s.now += dt;
  if (s.phase !== 'playing') return;
  s.time += dt;

  // Tools: edge-triggered keys (smoke / EMP) and the mouse coin, so holding
  // a key spends exactly one use.
  if (pressed('smoke') && dropSmoke(s.thief, s.now)) playSmoke(audio);
  if (pressed('emp') && fireEmp(s.thief, s.now)) playEmp(audio);
  const click = input.takeClick();
  if (click) {
    // Clicking on the canvas throws a coin; a click while the game is on
    // the title screen starts it instead (handled by the phase gate below).
    const scaleX = canvas.width / WORLD.w;
    const scaleY = canvas.height / WORLD.h;
    const wx = click.x / scaleX;
    const wy = click.y / scaleY;
    if (throwCoin(s.thief, wx, wy)) {
      distractGuards(s.guards, s.thief.coins[s.thief.coins.length - 1].x, s.thief.coins[s.thief.coins.length - 1].y, s.now);
      playCoin(audio);
    }
  }

  // Movement and loot.
  s.thief.sneaking = input.down('sneak');
  const vec = input.moveVector();
  moveThief(s.thief, vec, dt, s.now);
  const lifted = grabLoot(s.thief, s.spots, dt);
  if (lifted) {
    s.lootValue += lifted.value;
    playPickup(audio);
  }

  // Watchers.
  updateGuards(s.guards, s.thief, s.alarm.value, dt, s.now);
  updateCameras(s.cameras, s.now, dt);
  const hidden = inSmoke(s.thief, s.now);
  let rise = 0;
  if (!hidden) {
    rise += guardDetection(s.guards, s.thief, false, s.now);
    rise += cameraDetection(s.cameras, s.thief, false, s.thief.empUntil, s.now);
  } else {
    // Smoke hides the thief, but watchers still look: clear their flags.
    guardDetection(s.guards, s.thief, true, s.now);
    cameraDetection(s.cameras, s.thief, true, s.thief.empUntil, s.now);
  }
  const anySeen = s.guards.some((g) => g.seen) || s.cameras.some((c) => c.seen);
  if (anySeen && !s.wasSeen) playSpotted(audio);
  s.wasSeen = anySeen;
  updateAlarm(s.alarm, rise, s.thief.sneaking, inShadow(s.thief.x, s.thief.y), dt);

  // Smoke from a guard's eyes: a guard whose line to the thief crosses a
  // cloud cannot see through it even at the cloud's edge.
  for (const guard of s.guards) {
    if (guard.seen && smokeBlocks(s.thief, guard.x, guard.y, s.thief.x, s.thief.y, s.now)) {
      guard.seen = false;
    }
  }

  // Caught.
  if (alarmStage(s.alarm) === 'caught') {
    s.phase = 'caught';
    s.score = s.lootValue;
    playCaught(audio);
    return;
  }

  // Escape: all loot lifted and the thief reaches the service exit.
  if (s.spots.every((p) => p.taken) && inExit(s.thief)) {
    s.phase = 'escaped';
    s.timeBonus = Math.max(0, SCORE.timeBonusMax - Math.floor(s.time) * SCORE.timeBonusPerSecond);
    s.alarmPenalty = Math.round(s.alarm.value);
    s.score = s.lootValue + s.timeBonus - s.alarmPenalty;
    playEscape(audio);
  }
}

let last = performance.now();

// Rising-edge helper: true only on the first frame a key goes down.
const prevKeys = new Set();
function pressed(action) {
  const down = input.down(action);
  const edge = down && !prevKeys.has(action);
  if (down) prevKeys.add(action);
  else prevKeys.delete(action);
  return edge;
}

function frame(nowMs) {
  const dt = Math.min(0.05, (nowMs - last) / 1000);
  last = nowMs;
  unlockAudio(audio);
  if (pressed('restart') && (state.phase === 'caught' || state.phase === 'escaped')) reset();
  if (state.phase === 'title' && (input.down('start') || input.mouse.clicked)) {
    state.phase = 'playing';
    input.mouse.clicked = false;
  }
  if (pressed('mute')) audio.muted = !audio.muted;
  step(dt);
  drawGame(ctx, state);
  requestAnimationFrame(frame);
}

function boot() {
  fitCanvas();
  window.addEventListener('resize', fitCanvas);
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const still = params.get('still') === '1';
  if (shot) {
    // A staged scene for screenshots: the game is posed, then frozen.
    stageShot(state, Number(shot));
    drawGame(ctx, state);
    if (!still) requestAnimationFrame(frame);
    return;
  }
  // Self-test hook for the playtest driver: pure geometry checks.
  if (params.get('selftest') === '1') {
    window.__selftest = runSelfTest();
  }
  requestAnimationFrame(frame);
}

function runSelfTest() {
  // Pure geometry checks the playtest driver reads back: a clear lane is
  // open, the central plinth blocks sight, and a cone reads its angle.
  const checks = [
    { name: 'open lane', ok: hasLineOfSight(180, 400, 180, 700) === true },
    { name: 'plinth blocks', ok: hasLineOfSight(640, 150, 640, 400) === false },
    { name: 'cone ahead', ok: inCone(420, 120, Math.PI / 2, 265, 0.61, 420, 300) === true },
    { name: 'cone side', ok: inCone(420, 120, Math.PI / 2, 265, 0.61, 640, 400) === false },
    { name: 'cone far', ok: inCone(420, 120, Math.PI / 2, 265, 0.61, 420, 700) === false },
  ];
  return { ok: checks.every((c) => c.ok), checks };
}

boot();
