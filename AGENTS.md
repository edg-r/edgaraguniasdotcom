# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Current design direction

- Build the personal site page by page, starting with a deliberately minimal hero.
- The hero uses a full-bleed personal photograph, white Helvetica-style sans-serif type, the name `Edgar Agunias`, and the navigation labels `About Me`, `Career`, and `Photography`.
- Keep the opening page quiet and image-led; add the linked pages in later passes rather than expanding the hero with extra copy or controls.
- The current hero annotation places the type block higher in the center-right of the image, above the globe cluster; the full name and navigation are justified to the right within the block.
- The About transition uses a scroll-driven vertical push: the unaltered globe image exits upward, the unaltered graduation image enters from below, and the existing `About Me` navigation link itself stays solid, slides beside the clickable `Edgar Agunias`, grows to the same size, and fades in its comma; the other navigation items fade away.
- Keep the scroll-driven typography crisp: interpolate the actual font sizes for `Edgar Agunias` and `About Me` instead of scaling text layers with CSS transforms.
- The delayed About photo deck is intentionally oversized, centered vertically on the left side of the graduation image, with the landscape image on top and the portrait image below; the biography remains readable in the upper-right black space. The photo deck should inherit the current pointer-facing tilt before it fades and slides in so the cards do not appear flat on entrance. On desktop, the About lockup and biography should use the right-side black field generously, with responsive type that scales up while leaving breathing room around the red graduation hat and lower-right figures.
- About photo cards are interactive: clicking either card opens an enlarged viewer with its contextual caption beneath the image; the viewer should preserve the cards' tactile 3D quality by approaching on open and receding fully opaque on dismiss, while the separate dark backdrop and caption text fade in and out with the flight. Clicking the image or anywhere outside it dismisses the viewer, with keyboard Escape as a fallback, without changing the underlying scroll-driven layout.
- The primary navigation uses `Career` for the job-matching destination. The hero includes a thin floating liquid-glass Career composer for pasting a job description or attaching a PDF/text file; as the user scrolls into About, it morphs into a small `Job Match` pill and its upward action remains a front-end handoff point for the future matching service.
