// shots.js — staged scenes for the entry's screenshots. Each shot poses
// the game (thief, guards, cameras, alarm, loot) so one frame shows the
// whole heist: room, cones, cameras, loot and the alarm meter.
// One file, one job: posing screenshots. Never used during real play.

export function stageShot(state, shot) {
  // Every shot plays from the start of a heist, then poses the pieces.
  state.phase = 'playing';
  const t = state.thief;
  const [rook, bishop, knight] = state.guards;
  const [camNorth, camSouth] = state.cameras;

  if (shot === 1) {
    // COVER — mid-heist: one piece lifted, the thief crossing the open
    // middle lane under a sweeping camera while Rook's cone turns in.
    t.x = 560;
    t.y = 470;
    t.facing = -Math.PI / 2;
    state.spots[0].taken = true; // the diamond is already lifted
    state.lootValue = 500;
    state.alarm.value = 34;
    state.time = 47;
    rook.x = 420;
    rook.y = 300;
    rook.facing = Math.PI / 4;
    bishop.x = 860;
    bishop.y = 480;
    bishop.facing = Math.PI;
    knight.x = 700;
    knight.y = 560;
    knight.facing = -Math.PI / 2;
    camNorth.angle = Math.PI / 2 + 0.5;
    camSouth.angle = -Math.PI / 2 - 0.4;
  } else if (shot === 2) {
    // TOOLS — smoke down by the ledger, EMP darkening the cameras, and
    // Bishop walking to investigate a thrown coin.
    t.x = 230;
    t.y = 420;
    t.facing = Math.PI;
    t.smokeClouds.push({ x: 250, y: 440, radius: 95, until: 1e9 });
    t.smokeLeft = 2;
    t.empLeft = 1;
    t.empUntil = 1e9;
    t.coinLeft = 2;
    t.coins.push({ x: 700, y: 250 });
    state.spots[1].taken = true; // the ledger is lifted
    state.lootValue = 300;
    state.alarm.value = 58;
    state.time = 96;
    rook.x = 420;
    rook.y = 480;
    rook.facing = Math.PI / 2;
    bishop.x = 640;
    bishop.y = 300;
    bishop.facing = Math.PI / 4;
    bishop.state = 'investigate';
    bishop.investigateX = 700;
    bishop.investigateY = 250;
    knight.x = 900;
    knight.y = 560;
    knight.facing = Math.PI;
    camNorth.angle = Math.PI / 2;
    camSouth.angle = -Math.PI / 2;
  } else if (shot === 3) {
    // ALARM — lockdown at 82%: Knight is on the thief's tail, the falcon
    // is the last piece, and the exit is finally open.
    t.x = 1010;
    t.y = 430;
    t.facing = 0;
    state.spots[0].taken = true;
    state.spots[1].taken = true;
    state.lootValue = 800;
    state.alarm.value = 82;
    state.time = 148;
    rook.x = 420;
    rook.y = 660;
    rook.facing = 0;
    bishop.x = 860;
    bishop.y = 300;
    bishop.facing = -Math.PI / 2;
    knight.x = 930;
    knight.y = 470;
    knight.facing = Math.PI;
    knight.state = 'alert';
    knight.investigateX = t.x;
    knight.investigateY = t.y;
    camNorth.angle = Math.PI / 2 - 0.6;
    camSouth.angle = -Math.PI / 2 + 0.5;
  } else {
    // GETAWAY — the clean escape: every piece lifted, out in 1:36.
    state.spots.forEach((s) => {
      s.taken = true;
    });
    state.lootValue = 1200;
    state.time = 96;
    state.timeBonus = Math.max(0, 600 - Math.floor(96) * 5);
    state.alarm.value = 23;
    state.alarmPenalty = 23;
    state.score = state.lootValue + state.timeBonus - state.alarmPenalty;
    state.phase = 'escaped';
    t.x = 1180;
    t.y = 110;
    rook.x = 420;
    rook.y = 300;
    rook.facing = Math.PI;
    bishop.x = 860;
    bishop.y = 480;
    bishop.facing = 0;
    knight.x = 640;
    knight.y = 250;
    knight.facing = Math.PI / 2;
    camNorth.angle = Math.PI / 2 + 0.3;
    camSouth.angle = -Math.PI / 2 - 0.3;
  }
}
