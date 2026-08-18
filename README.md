# Edgar Agunias

A personal portfolio site built around film photography, quiet typography, and scroll-led transitions.

The opening experience is intentionally minimal: a full-bleed photograph, a small set of destinations, and one carefully paced transition into the About Me section. The visual language takes cues from the spacious typography and image-led compositions of mid-century corporate annual reports.

## Current experience

- Full-bleed film photograph of globes as the landing view.
- Large white Helvetica-style type for `Edgar Agunias`.
- Right-justified navigation for `About Me`, `Job Lens`, and `Photography`.
- Scroll-linked vertical push into the About Me view: the globe photograph exits upward while the graduation photograph enters from below.
- The existing `About Me` navigation link stays solid while sliding beside the clickable `Edgar Agunias` in the upper-right black space; it grows to the same size and its comma fades in, while the other navigation items fade away.
- Responsive layout with reduced-motion support and keyboard-visible focus states.

The Job Lens and Photography destinations are intentionally scaffolded for the next page-by-page passes.

## Tech stack

- React 19
- Vite 6
- Plain CSS for layout, typography, motion, and responsive behavior
- A small Sites-compatible worker for static hosting and app-route fallback

## Run locally

```bash
npm install
npm run dev
```

Vite will print the local preview URL. To create a production build and preview it:

```bash
npm run build
npm run preview
```

## Validate the project

The repository includes the checks used for the Sites handoff:

```bash
npm run build
npm run test:sites
```

The build produces the client bundle, the worker bundle, and the hosting manifest under `dist/`.

## Project structure

```text
src/
  App.jsx          Scroll story and page composition
  styles.css       Typography, layout, responsive rules, and transitions
  main.jsx         React entry point
public/images/     Optimized user-supplied photography and visual references
worker/            Static hosting worker
scripts/           Sites build preparation
tests/             Worker and packaging checks
```

## Job Lens configuration

The future Job Lens page can be connected to an analysis endpoint through `VITE_AI_ENDPOINT`. The optional endpoint should accept:

```json
{ "description": "..." }
```

and return:

```json
{
  "role": "...",
  "detail": "...",
  "signals": ["..."],
  "note": "..."
}
```

Copy `.env.example` to `.env` when wiring that endpoint locally. No endpoint is required for the current landing page.

## Roadmap

1. Build the About Me page around the graduation portrait.
2. Add the Job Lens paste-and-analyze flow.
3. Add the Photography showcase and gallery behavior.
4. Connect the finished site to the `edgaragunias.com` domain.

## Image rights

The photographs in `public/images/` were supplied for this personal site by Edgar Agunias. Keep the image files with the project when moving or deploying the site.
