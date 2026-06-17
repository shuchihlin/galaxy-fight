# Galaxy Fight

A Galaga-inspired retro 2D space shooter — built with vanilla JavaScript +
HTML5 Canvas, bundled with [Vite](https://vitejs.dev/), and deployed as a
static site on Vercel. Zero runtime dependencies; all art and sound are
generated in code.

> Original art and sound — *inspired by* Galaga, not affiliated with or
> using assets from Namco/Bandai.

## Features

- Player fighter with the classic **2-bullets-on-screen** firing limit
- Enemy **formations** that enter on swooping Bézier flight paths and sway
- **Diving attacks** with aimed enemy fire, collisions, and explosions
- Three enemy types: **bee**, **butterfly**, and the 2-hit **Boss Galaga**
- The signature **tractor-beam capture** → rescue your ship for a **dual fighter**
- **Stage progression** with escalating difficulty and **Challenging** bonus stages
- Synthesized retro **audio** (SFX + looping music) with a mute toggle
- **Local high-score table**, pause, responsive scaling, and **touch controls**

## Controls

| Input | Action |
|-------|--------|
| **← / →** (or A / D) | Move |
| **Space** | Fire |
| **Enter** | Start / restart |
| **P** | Pause |
| **M** | Mute |
| **Touch / mouse drag** | Move toward finger + auto-fire (mobile) |

## Develop

```bash
npm install
npm run dev      # local dev server with hot reload
```

## Build

```bash
npm run build    # outputs static files to dist/
npm run preview  # serve the production build locally
```

## Deploy (Vercel)

1. Push this repo to GitHub.
2. In Vercel: **New Project → Import** the repo.
3. Vercel auto-detects Vite — Build: `vite build`, Output: `dist`.
4. Deploy. Every push to `main` auto-deploys; PRs get preview URLs.

## Project structure

```
src/
├─ main.js          # entry: wires canvas, input, loop, game
├─ game.js          # state machine, collisions, scoring, stages
├─ config.js        # virtual resolution, palette, tuning
├─ difficulty.js    # per-stage difficulty curve
├─ formation.js     # the swaying enemy grid
├─ wave.js          # spawn schedule, dive & capture scheduling
├─ challenge.js     # challenging (bonus) stage waves
├─ path.js          # Catmull-Rom spline flight paths
├─ starfield.js     # scrolling background
├─ sprite.js        # pixel-art sprite renderer
├─ sprites.js       # sprite definitions (player, enemies)
├─ audio.js         # Web Audio SFX + music
├─ highscores.js    # localStorage high-score table
├─ core/
│  ├─ canvas.js     # crisp integer/fractional scaling
│  ├─ input.js      # keyboard + pointer/touch
│  └─ loop.js       # fixed-timestep game loop
└─ entities/
   ├─ player.js     # movement, firing, capture, dual fighter
   ├─ enemy.js      # entry / formation / dive / capture / flythrough
   ├─ bullet.js     # player & enemy projectiles
   └─ explosion.js  # particle burst
```

## Built in phases

0. Scaffold, game loop, input, deployable placeholder
1. Player ship, movement, firing, starfield
2. Enemy formation grid + swooping entry flight paths
3. Diving attacks, enemy fire, collisions, score, lives, HUD
4. Enemy types + Boss Galaga (2-hit, damage flash)
5. Tractor-beam capture + dual-fighter rescue
6. Stage progression, difficulty scaling, challenging stages
7. Synthesized audio (SFX + music) with mute
8. Pause, high scores, responsive scaling, touch controls
9. Release
