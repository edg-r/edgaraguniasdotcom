# Edgar Agunias

A personal portfolio site built around film photography, quiet typography, and scroll-led transitions.

The opening experience is intentionally minimal: a full-bleed photograph, a small set of destinations, and one carefully paced transition into the About Me section. The visual language takes cues from the spacious typography and image-led compositions of mid-century corporate annual reports.

## Current experience

- Full-bleed film photograph of globes as the landing view.
- Large white Helvetica-style type for `Edgar Agunias`.
- Right-justified navigation for `About Me`, `Career`, and `Photography`.
- Scroll-linked vertical push into the About Me view: the globe photograph exits upward while the graduation photograph enters from below.
- The existing `About Me` navigation link stays solid while sliding beside the clickable `Edgar Agunias` in the upper-right black space; it grows to the same size and its comma fades in, while the other navigation items fade away.
- Responsive layout with reduced-motion support and keyboard-visible focus states.

The Career section shows the resume as a pointer-responsive card that opens the PDF, with a download link and a link to LinkedIn. The earlier Job Lens job-matching workspace has been removed from the public site; its API lives in the separate private `edgaragunias-api` project.

## Tech stack

- React 19
- Vite 6
- Plain CSS for layout, typography, motion, and responsive behavior
- GitHub Pages deployment for the public frontend

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

The repository includes the checks used by the GitHub Pages build:

```bash
npm run build
```

The GitHub Pages workflow publishes `dist/client`.

## Project structure

```text
src/
  App.jsx          Scroll story and page composition
  styles.css       Typography, layout, responsive rules, and transitions
  main.jsx         React entry point
public/images/     Optimized user-supplied photography and visual references
.github/workflows/ GitHub Pages deployment workflow
docs/              Product and implementation notes
```

## Image rights

The photographs in `public/images/` were supplied for this personal site by Edgar Agunias. Keep the image files with the project when moving or deploying the site.
