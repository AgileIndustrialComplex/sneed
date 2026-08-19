# sneed

View **any GitHub account's contribution graph in 3D** — submit a username and get a
rotatable, zoomable field of vertical bars, one bar per day, spanning their **entire**
GitHub history. Heights scaled to the busiest day, colors straight from the GitHub
heatmap.

![demo](docs/screenshot.png)

## Features

- 🧊 **True 3D** — every day is a vertical bar; height scales with your busiest day
- 🖱️ **Orbit + zoom** — drag to rotate, scroll to zoom, damped smoothness
- 🔍 **Hover** — point at a bar to see the exact date and contribution count
- 🎨 **GitHub-accurate colors** — the classic 5-level green scale
- 📅 **Entire history** — every year of activity, laid out as consecutive calendar-year blocks
- ⚡ **100% static, no token** — data comes straight from the client

## Try it

**Live:** https://AgileIndustrialComplex.github.io/sneed/

Type a GitHub username and hit **View in 3D** — e.g. `sudo-rm-rf`, `gaearon`, `torvalds`, or yourself.

## How it works

- Pure static page (`public/index.html`): [Three.js](https://threejs.org) renders each
  day as an instanced box in a GitHub-style calendar grid (weeks × days, ordered by
  year, Sunday on top), with `OrbitControls` for orbit/zoom and a raycast hover readout.
- Contribution data is fetched client-side from the
  [jogruber GitHub-contributions mirror](https://github.com/jogruber/github-contributions-api)
  (CORS-enabled, no API token needed).
- Deployed to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`).

## Run locally

```bash
python3 -m http.server 8080 --directory public
# open http://localhost:8080
```

## License

MIT