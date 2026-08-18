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

The Job Lens destination is wired to the separate private API; Photography remains intentionally scaffolded for a later page-by-page pass.

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

## Job Lens configuration

The Career composer connects to the separate private `edgaragunias-api`
project through `VITE_API_BASE_URL`. The frontend sends only the public API
origin. OpenRouter keys, PostgreSQL credentials, recruiter records, and the
approved evidence catalog remain outside this repository.

The API accepts pasted descriptions and PDF/DOCX/TXT/Markdown/RTF uploads. It
returns an evidence-grounded assessment, optional targeted follow-up questions,
project citations, and a bounded project Q&A surface. Use the API project's
`AI_MODE=simulated` default for local UI work, then configure OpenRouter only on
the private server with `openai/gpt-5.6-sol` as the judge and
`openai/gpt-5.6-luna` as the evidence/research layer.

Copy `.env.example` to `.env` when wiring the public API origin locally. The
public frontend must never receive an OpenRouter key.

## Roadmap

1. Connect the Job Lens API to the public site and validate the simulated flow.
2. Populate and manually approve the private evidence catalog.
3. Configure live OpenRouter inference and bounded company research on the API.
4. Deploy the API through a secure tunnel and publish the validated frontend through GitHub Pages when approved.

## Image rights

The photographs in `public/images/` were supplied for this personal site by Edgar Agunias. Keep the image files with the project when moving or deploying the site.
