# Galaxy Fight

A Galaga-inspired retro 2D space shooter. Built with vanilla JavaScript +
HTML5 Canvas, bundled with [Vite](https://vitejs.dev/), and deployed as a
static site on Vercel.

> Original art and sound — *inspired by* Galaga, not affiliated with or
> using assets from Namco/Bandai.

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

## Controls

- **← / →** (or A / D) — move
- **Enter** — start
- **Space** — fire (wired up in Phase 1)

## Deploy (Vercel)

1. Push this repo to GitHub.
2. In Vercel: **New Project → Import** the repo.
3. Vercel auto-detects Vite — Build: `vite build`, Output: `dist`.
4. Deploy. Every push to `main` auto-deploys; PRs get preview URLs.

## Roadmap

- **Phase 0** — Scaffold, game loop, input, deployable placeholder ✅
- **Phase 1** — Player ship, movement, firing (2-bullet limit), starfield
- **Phase 2** — Enemy formation grid + swooping entry flight paths
- **Phase 3** — Diving attacks, enemy fire, collisions, score, lives, HUD
- **Phase 4** — Enemy types (bees, butterflies, boss Galaga)
- **Phase 5** — Tractor-beam capture + dual-fighter rescue
- **Phase 6** — Stage progression + challenging (bonus) stages
- **Phase 7** — Audio (SFX + music)
- **Phase 8** — Title/game-over screens, high scores, pause, responsive
- **Phase 9** — Release
