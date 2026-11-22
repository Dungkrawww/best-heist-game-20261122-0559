# The Gilded Vault — Midnight at the Meridian Gallery

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Dungkrawww/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Dungkrawww/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

A top-down heist game for the make.fun **best-heist-game-20261122-0559** bounty ($50, closes 23 Nov 2026 00:59 WIB).

You are Mara Voss, a thief alone in the Meridian Gallery at midnight. Three pieces are on display — the Sunburst Diamond, the Gilded Ledger, the Jade Falcon — and the room is awake: three guards walk patrol loops with sweeping vision cones, two wall cameras sweep the marble, and one alarm meter decides whether you walk out rich or get caught in the lights. Lift all three pieces, then slip out the service exit.

## How to play

- **WASD / arrow keys** — move
- **Shift** — sneak (slower, half the alarm climb, harder to spot)
- **Mouse click** — throw a decoy coin; the nearest guard walks over to look (3 per heist)
- **1 / Q** — smoke pellet: a cloud that blocks every watcher's sight for 5 seconds (3 per heist)
- **2 / E** — EMP burst: every camera goes dark for 6 seconds (2 per heist)
- **Stand beside loot** — lifting a piece takes 1.2 seconds; the ring shows the progress
- **R** — restart after a catch or a getaway · **M** — mute

## The room

Three lanes cross one gallery: the west lane past the ledger behind tall display cases, the open middle lane swept by both cameras, and the east lane past the falcon behind the pillars. Shadow pools in the corners halve the alarm climb. The alarm rises fast when a guard sees you up close, slower at range, and falls while you stay hidden — until lockdown at 75%, when guards start converging on you.

## Run it

```sh
node serve.ts        # then open http://localhost:8080
```

Hand it in (outside the grader, `MAKEFUN_OUTPUT_DIR` stands in for `/output`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `game/index.html` — the page and its canvas
- `game/src/config.js` — every tuning number
- `game/src/level.js` — the gallery floor plan
- `game/src/input.js` — keyboard and mouse
- `game/src/thief.js` — Mara: movement, loot, tools
- `game/src/sight.js` — line of sight and vision cones
- `game/src/guards.js` — patrols, alerts, investigations
- `game/src/cameras.js` — sweeping cameras and EMP blackouts
- `game/src/alarm.js` — the alarm meter and its stages
- `game/src/render.js` — every pixel
- `game/src/audio.js` — synthesised WebAudio sounds, no files
- `game/src/shots.js` — staged scenes for the screenshots
- `game/src/main.js` — the loop, phases and scoring
- `main.ts` — copies `game/` + `screenshots/` and writes `dossier.json`
