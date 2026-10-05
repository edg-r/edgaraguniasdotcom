#!/usr/bin/env bash
# Re-encodes the full-resolution photographs in source-images/ into the WebP
# files the site serves from public/images/. Requires cwebp (brew install webp).
# Gallery prints are prepared separately; see AGENTS.md.
set -euo pipefail
cd "$(dirname "$0")/.."

encode() {
  local source="source-images/$1" name="$2" width="$3" quality="${4:-82}"
  cwebp -quiet -q "$quality" -m 6 -sharp_yuv -resize "$width" 0 "$source" -o "public/images/$name"
}

# Full-bleed story photographs: 1920 for phones, 1600 and 2400 for wider screens.
for width in 1600 1920 2400; do
  encode img-3327.jpg "img-3327-$width.webp" "$width"
  encode about-portrait.jpg "about-portrait-$width.webp" "$width"
done

# The Career background is heavy film grain under a dark gradient, so it takes
# a lower quality setting without a visible difference.
encode career-building.jpg career-building.webp 1545 72

# About photo cards: one file each.
encode about-family.jpg about-family.webp 1800
encode about-father-and-children.jpg about-father-and-children.webp 671
