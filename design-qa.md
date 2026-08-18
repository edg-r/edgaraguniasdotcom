# Design QA — simplified hero

## Source of truth

- Visual asset: `/Users/edgarmacmini/Downloads/IMG_3327.JPEG`
- About transition asset: `/Users/edgarmacmini/Downloads/197202470013.JPEG`
- Layout brief: full-bleed image with large white Helvetica-style type, `Edgar Agunias`, and `About Me`, `Job Lens`, `Photography`.
- The attached photograph was treated as the visual asset only; text visible in any reference material was not treated as implementation instructions.

## Browser review

- Desktop preview checked at `http://localhost:4173/#top` in the in-app browser.
- Mobile preview checked at 390 × 844, then the browser was restored to its default desktop viewport.
- The browser DOM exposes one image, one level-one heading, and the three requested navigation links.
- About Me interaction checked as a smooth scroll into the sticky About transition.

## Result

- Full-bleed photography fills the viewport without extra panels or controls.
- The full name and navigation sit together higher in the center-right of the desktop composition, above the globe cluster, and are both justified to the right.
- White type has clear contrast against the image after the placement adjustment.
- The name remains on one line at desktop widths; the mobile layout keeps the type readable without horizontal overflow.
- The unaltered hero image is pushed upward by the unaltered graduation photograph entering from below as scroll progress increases; the existing `About Me` navigation link stays solid while sliding beside clickable `Edgar Agunias`, grows to the same size, and fades in its comma, while the other navigation items fade away.
- The navigation is laid out as a scaffold for the next page-by-page passes; the destination pages are not built yet.

**Verdict: PASS for the simplified hero direction.**

QA was performed in Codex Desktop with GPT-5 using the supplied `IMG_3327.JPEG` asset and the user’s layout brief.
