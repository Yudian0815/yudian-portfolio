# Image optimization

Generates responsive AVIF/WebP variants for site images.

## Requirements

- Python 3.9+
- Pillow (`python3 -m pip install --user Pillow`)

## Regenerate optimized assets

```bash
python3 scripts/optimize_images.py
python3 scripts/patch_html_images.py
```

1. `optimize_images.py` reads `scripts/image_manifest.json` and writes variants to `images/opt/` plus `images/opt/meta.json`.
2. `patch_html_images.py` updates HTML to use `<picture>` elements with `srcset`, lazy loading, and lightbox paths.

To add a new image, add an entry to `image_manifest.json`, place the source file in `images/`, then run both commands.
