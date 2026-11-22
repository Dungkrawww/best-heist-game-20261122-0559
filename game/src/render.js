// render.js — every pixel of The Gilded Vault: the gallery floor, cones,
// thief, guards, cameras, loot, smoke and the HUD, plus the title,
// caught and escaped screens. One file, one job: drawing.

import { ALARM, CAMERA, COLORS, GUARD, TOOLS, WORLD } from './config.js';
import { COVER, EXIT_DOOR, SHADOWS, WALLS } from './level.js';
import { alarmFill, alarmStage } from './alarm.js';
import { camerasDark } from './cameras.js';

const TILE = 80;

function drawFloor(ctx) {
  for (let y = 0; y < WORLD.h; y += TILE) {
    for (let x = 0; x < WORLD.w; x += TILE) {
      ctx.fillStyle = ((x + y) / TILE) % 2 === 0 ? COLORS.floorA : COLORS.floorB;
      ctx.fillRect(x, y, TILE, TILE);
    }
  }
  // Faint gold inlay lines along the room's middle.
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, WORLD.h / 2);
  ctx.lineTo(WORLD.w, WORLD.h / 2);
  ctx.moveTo(WORLD.w / 2, 0);
  ctx.lineTo(WORLD.w / 2, WORLD.h);
  ctx.stroke();
}

function drawShadows(ctx) {
  for (const s of SHADOWS) {
    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = 'rgba(120, 180, 255, 0.25)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(s.x + 2, s.y + 2, s.w - 4, s.h - 4);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(120, 180, 255, 0.5)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHADOW', s.x + s.w / 2, s.y + s.h - 8);
  }
}

function drawWalls(ctx) {
  for (const w of WALLS) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
  }
  ctx.strokeStyle = COLORS.wallTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, WORLD.w - 52, WORLD.h - 52);
}

function drawCover(ctx) {
  for (const c of COVER) {
    ctx.fillStyle = COLORS.cover;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = COLORS.coverEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
    if (c.label === 'case' || c.label === 'plinth') {
      ctx.fillStyle = 'rgba(255, 217, 74, 0.18)';
      ctx.fillRect(c.x + 5, c.y + 5, c.w - 10, c.h - 10);
    }
  }
}

function drawExit(ctx, allLootTaken) {
  const d = EXIT_DOOR;
  ctx.fillStyle = allLootTaken ? COLORS.exit : '#3a5a44';
  ctx.fillRect(d.x, d.y, d.w, d.h);
  ctx.strokeStyle = allLootTaken ? '#a9f5c8' : '#6b8a76';
  ctx.lineWidth = 2;
  ctx.strokeRect(d.x + 1, d.y + 1, d.w - 2, d.h - 2);
  ctx.fillStyle = '#06281a';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', d.x + d.w / 2, d.y + d.h / 2 + 4);
}

function drawLoot(ctx, spots, thief, now) {
  for (const spot of spots) {
    if (spot.taken) continue;
    const pulse = 0.5 + 0.5 * Math.sin(now * 3 + spot.x);
    // Glow halo so loot reads at a glance.
    const glow = ctx.createRadialGradient(spot.x, spot.y, 4, spot.x, spot.y, 46);
    glow.addColorStop(0, `rgba(255, 217, 74, ${0.35 + 0.25 * pulse})`);
    glow.addColorStop(1, 'rgba(255, 217, 74, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(spot.x, spot.y, 46, 0, Math.PI * 2);
    ctx.fill();
    // Pedestal.
    ctx.fillStyle = '#39415e';
    ctx.beginPath();
    ctx.arc(spot.x, spot.y + 6, 16, 0, Math.PI * 2);
    ctx.fill();
    // The piece itself: a cut gem.
    ctx.fillStyle = COLORS.loot;
    ctx.beginPath();
    ctx.moveTo(spot.x, spot.y - 14);
    ctx.lineTo(spot.x + 11, spot.y - 2);
    ctx.lineTo(spot.x, spot.y + 10);
    ctx.lineTo(spot.x - 11, spot.y - 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff6c8';
    ctx.beginPath();
    ctx.moveTo(spot.x, spot.y - 14);
    ctx.lineTo(spot.x + 5, spot.y - 2);
    ctx.lineTo(spot.x - 5, spot.y - 2);
    ctx.closePath();
    ctx.fill();
    // Channel ring while the thief is lifting it.
    if (thief.grabbing === spot) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, 26, -Math.PI / 2, -Math.PI / 2 + thief.grabProgress * Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(spot.name.toUpperCase(), spot.x, spot.y + 34);
  }
}

function drawCone(ctx, x, y, angle, range, halfAngle, fill, edge) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(angle - halfAngle) * range, y + Math.sin(angle - halfAngle) * range);
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(angle + halfAngle) * range, y + Math.sin(angle + halfAngle) * range);
  ctx.stroke();
}

function drawCameras(ctx, cameras, empUntil, now) {
  const dark = camerasDark(empUntil, now);
  for (const cam of cameras) {
    if (!dark) drawCone(ctx, cam.x, cam.y, cam.angle, CAMERA.range, CAMERA.halfAngle, COLORS.cameraCone, COLORS.cameraConeEdge);
    ctx.fillStyle = dark ? '#3a3f4d' : '#c0392b';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c2233';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 4, 0, Math.PI * 2);
    ctx.fill();
    if (dark) {
      ctx.fillStyle = '#8a93a8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OFF', cam.x, cam.y + 22);
    }
  }
}

function drawGuards(ctx, guards) {
  for (const guard of guards) {
    const fill = guard.state === 'alert' ? 'rgba(255, 64, 64, 0.25)' : COLORS.guardCone;
    const edge = guard.state === 'alert' ? 'rgba(255, 64, 64, 0.7)' : COLORS.guardConeEdge;
    drawCone(ctx, guard.x, guard.y, guard.facing, GUARD.coneRange, GUARD.coneHalfAngle, fill, edge);
  }
  for (const guard of guards) {
    // Body.
    ctx.fillStyle = COLORS.guard;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, GUARD.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d7e3f5';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Facing tick.
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.x + Math.cos(guard.facing) * 18, guard.y + Math.sin(guard.facing) * 18);
    ctx.stroke();
    // Name and state.
    ctx.fillStyle = '#d7e3f5';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    const tag = guard.state === 'alert' ? '!' : guard.state === 'investigate' ? '?' : guard.name;
    ctx.fillText(tag, guard.x, guard.y - GUARD.radius - 6);
  }
}

function drawThief(ctx, thief) {
  // Sneak ring: the thief is harder to spot while sneaking.
  if (thief.sneaking) {
    ctx.strokeStyle = 'rgba(120, 180, 255, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, thief.radius + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = COLORS.thiefCoat;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, thief.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.thief;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = COLORS.thief;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8e6df';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MARA', thief.x, thief.y - thief.radius - 6);
}

function drawSmokeAndCoins(ctx, thief, now) {
  for (const cloud of thief.smokeClouds) {
    if (now >= cloud.until) continue;
    ctx.fillStyle = COLORS.smoke;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const coin of thief.coins) {
    ctx.fillStyle = '#ffd94a';
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a6d3b';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawHud(ctx, state) {
  const { alarm, spots, thief, time, phase } = state;
  // Top bar.
  ctx.fillStyle = 'rgba(8, 12, 24, 0.88)';
  ctx.fillRect(0, 0, WORLD.w, 54);
  ctx.fillStyle = COLORS.hud;
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('THE GILDED VAULT', 16, 24);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#9aa5bd';
  ctx.fillText('Meridian Gallery · midnight', 16, 43);
  // Alarm meter, centre.
  const stage = alarmStage(alarm);
  const meterX = 400;
  const meterW = 380;
  ctx.fillStyle = '#0b0f1c';
  ctx.fillRect(meterX, 14, meterW, 22);
  const fillColor =
    stage === 'calm' ? COLORS.alarmCalm : stage === 'suspicious' ? COLORS.alarmWarm : COLORS.alarmHot;
  ctx.fillStyle = fillColor;
  ctx.fillRect(meterX + 2, 16, (meterW - 4) * alarmFill(alarm), 18);
  ctx.strokeStyle = '#5a6a8a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(meterX, 14, meterW, 22);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`ALARM ${Math.round(alarm.value)}% — ${stage.toUpperCase()}`, meterX + meterW / 2, 30);
  // Loot, tools and time, right.
  const taken = spots.filter((s) => s.taken).length;
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.hud;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`LOOT ${taken}/${spots.length}`, WORLD.w - 16, 22);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#c9d2e4';
  const mm = Math.floor(time / 60);
  const ss = Math.floor(time % 60).toString().padStart(2, '0');
  ctx.fillText(`${mm}:${ss}   Smoke ${thief.smokeLeft} · EMP ${thief.empLeft} · Coin ${thief.coinLeft}`, WORLD.w - 16, 42);
  // Bottom hint bar.
  ctx.fillStyle = 'rgba(8, 12, 24, 0.88)';
  ctx.fillRect(0, WORLD.h - 30, WORLD.w, 30);
  ctx.fillStyle = '#c9d2e4';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  const lootLeft = spots.filter((s) => !s.taken).length;
  const goal =
    phase === 'playing'
      ? lootLeft > 0
        ? `Lift ${lootLeft} more piece${lootLeft > 1 ? 's' : ''} of loot, then reach the EXIT — WASD move · Shift sneak · Click throws a decoy coin · 1 smoke · 2 EMP`
        : 'All loot lifted — reach the EXIT to escape!'
      : '';
  ctx.fillText(goal, WORLD.w / 2, WORLD.h - 11);
}

function drawSeenFlash(ctx, anySeen) {
  if (!anySeen) return;
  const grad = ctx.createRadialGradient(640, 400, 260, 640, 400, 720);
  grad.addColorStop(0, 'rgba(255, 40, 40, 0)');
  grad.addColorStop(1, 'rgba(255, 40, 40, 0.28)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(5, 8, 16, 0.82)';
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, WORLD.w / 2, 300);
  ctx.fillStyle = '#e8e6df';
  ctx.font = '17px sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, WORLD.w / 2, 350 + i * 30));
}

export function drawGame(ctx, state) {
  const { thief, guards, cameras, spots, alarm, time, phase, now } = state;
  drawFloor(ctx);
  drawShadows(ctx);
  drawExit(ctx, spots.every((s) => s.taken));
  drawLoot(ctx, spots, thief, now);
  drawCover(ctx);
  drawWalls(ctx);
  drawCameras(ctx, cameras, thief.empUntil, now);
  drawGuards(ctx, guards);
  drawSmokeAndCoins(ctx, thief, now);
  drawThief(ctx, thief);
  const anySeen = guards.some((g) => g.seen) || cameras.some((c) => c.seen);
  drawSeenFlash(ctx, anySeen);
  drawHud(ctx, state);
  if (phase === 'title') {
    overlay(ctx, 'THE GILDED VAULT', [
      'Midnight at the Meridian Gallery. Lift all three pieces, then slip out the EXIT.',
      'WASD / arrows move · Shift sneak · Click throws a decoy coin',
      '1 smoke pellet · 2 EMP burst · stay out of the cones — the alarm fills fast',
      '',
      'Press ENTER or click to begin the heist',
    ], '#ffd94a');
  } else if (phase === 'caught') {
    overlay(ctx, 'CAUGHT!', [
      `The alarm hit 100% at ${Math.floor(time)} seconds — the gallery locks down around you.`,
      `Loot lifted: ${spots.filter((s) => s.taken).length} of ${spots.length} · Score ${state.score}`,
      '',
      'Press R to run it back',
    ], '#ff4040');
  } else if (phase === 'escaped') {
    overlay(ctx, 'CLEAN GETAWAY', [
      `Every piece lifted, out the service exit in ${Math.floor(time)} seconds.`,
      `Loot $${state.lootValue} + time bonus $${state.timeBonus} − alarm $${state.alarmPenalty} = SCORE ${state.score}`,
      '',
      'Press R to steal it all again',
    ], '#2fbf71');
  }
}
