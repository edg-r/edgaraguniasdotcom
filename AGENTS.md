# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Current design direction

- Build the personal site page by page, starting with a deliberately minimal hero.
- The hero uses a full-bleed personal photograph, white Helvetica-style sans-serif type, the name `Edgar Agunias`, and the navigation labels `About Me`, `Job Lens`, and `Photography`.
- Keep the opening page quiet and image-led; add the linked pages in later passes rather than expanding the hero with extra copy or controls.
- The current hero annotation places the type block higher in the center-right of the image, above the globe cluster; the full name and navigation are justified to the right within the block.
- The About transition uses a scroll-driven vertical push: the globe image exits upward, the graduation image enters from below, and the text treatment visually scales into the upper-right `About Me, Edgar Agunias` lockup.
