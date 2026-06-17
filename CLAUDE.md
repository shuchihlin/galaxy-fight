# Galaxy Fight

A Galaga-inspired retro 2D space shooter. Vanilla JavaScript + HTML5 Canvas,
bundled with Vite, deployed as a static site on Vercel. Zero runtime
dependencies; all art and sound are generated in code.

> Original art and sound — *inspired by* Galaga, not affiliated with Namco/Bandai.
> Keep all assets original; never add ripped sprites/audio.

## Commands

- `npm install` — install dependencies (Vite only)
- `npm run dev` — local dev server with hot reload (Vite, port 5173)
- `npm run build` — static production build to `dist/`
- `npm run preview` — serve the production build locally

## Deploy

Hosted on Vercel (Hobby tier), repo `shuchihlin/galaxy-fight`. Every push to
`main` auto-deploys to `galaxy-fight.vercel.app`; pull requests get preview
URLs. Vercel auto-detects Vite (build `vite build`, output `dist`).

## Architecture

A fixed-timestep loop (`src/core/loop.js`) drives `Game` (`src/game.js`), a
state machine: **title → splash → playing → gameover**, where `playing` has
sub-phases **intro → fighting → clear**. Internal resolution is a portrait
224×288, integer-scaled to fit (`src/core/canvas.js`). Pixel-art sprites are
row-string + palette maps (`src/sprite.js`, `src/sprites.js`). Enemies follow
Catmull-Rom spline flight paths (`src/path.js`). See `README.md` for the full
file-by-file map.

## Conventions

- ES modules, plain vanilla JS — no TypeScript, no game framework.
- Everything generated in code; the only asset file is `public/splash.gif`.
- Verify gameplay changes by running the dev server and observing behavior in
  the browser before committing. Build must be clean.
- Branch naming: `feature/*`, `bugfix/*`, `refactor/*`.

## Tuning knobs

- `src/difficulty.js` — per-stage enemy aggression curve (dive rate, divers,
  speed, fire rate, capture rate).
- `src/entities/player.js` — `MAX_BULLETS` / `MAX_BULLETS_DUAL` (currently
  3 / 6), `FIRE_COOLDOWN`.
- `src/game.js` — `SPLASH_TIME` (intro splash duration, currently 2.2s).

## Notes

- A dev-only `window.game` handle is exposed in `main.js` via
  `import.meta.env.DEV` for console debugging; it is stripped from production
  builds (don't rely on it at runtime).
