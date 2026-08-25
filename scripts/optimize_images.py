#!/usr/bin/env python3
"""Generate WebP/AVIF responsive variants for portfolio images."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
OPT = IMAGES / "opt"
MANIFEST = Path(__file__).with_name("image_manifest.json")
META_OUT = OPT / "meta.json"

WEBP_QUALITY = 82
AVIF_QUALITY = 55


def slugify(name: str) -> str:
    stem = Path(name).stem.lower()
    stem = re.sub(r"[^a-z0-9]+", "-", stem)
    return stem.strip("-")


def load_manifest() -> dict:
    with MANIFEST.open(encoding="utf-8") as fh:
        return json.load(fh)


def save_meta(meta: dict) -> None:
    OPT.mkdir(parents=True, exist_ok=True)
    with META_OUT.open("w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2)


def encode_variant(img: Image.Image, out_path: Path, fmt: str) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    working = img
    if working.mode not in ("RGB", "RGBA"):
        working = working.convert("RGBA" if "A" in working.getbands() else "RGB")

    if fmt == "webp":
        save_kwargs = {"format": "WEBP", "quality": WEBP_QUALITY, "method": 6}
        if working.mode == "RGBA":
            save_kwargs["lossless"] = False
        working.save(out_path, **save_kwargs)
    elif fmt == "avif":
        working.save(out_path, format="AVIF", quality=AVIF_QUALITY)
    else:
        raise ValueError(f"Unsupported format: {fmt}")


def pick_widths(source_width: int, requested: list[int]) -> list[int]:
    widths = sorted({w for w in requested if w <= source_width})
    if not widths:
        widths = [source_width]
    if source_width not in widths and source_width <= max(requested):
        widths.append(source_width)
    return widths


def optimize_image(rel_path: str, config: dict) -> dict:
    src = ROOT / rel_path
    if not src.exists():
        src = IMAGES / Path(rel_path).name
    if not src.exists():
        print(f"SKIP missing: {rel_path}", file=sys.stderr)
        return {}

    slug = slugify(src.name)
    with Image.open(src) as image:
        image.load()
        source_width, source_height = image.size
        widths = pick_widths(source_width, config.get("widths", [800]))
        formats = {"webp": {}, "avif": {}}

        for width in widths:
            if width >= source_width:
                resized = image.copy()
                actual_width = source_width
            else:
                ratio = width / source_width
                height = max(1, round(source_height * ratio))
                resized = image.resize((width, height), Image.Resampling.LANCZOS)
                actual_width = width

            for fmt in ("webp", "avif"):
                filename = f"{slug}-{actual_width}w.{fmt}"
                out_path = OPT / filename
                encode_variant(resized, out_path, fmt)
                formats[fmt][str(actual_width)] = f"images/opt/{filename}"

        fallback_width = min(widths, key=lambda w: abs(w - 800)) if widths else source_width
        if str(fallback_width) not in formats["webp"]:
            fallback_width = max(int(w) for w in formats["webp"])

        entry = {
            "source": rel_path.replace("\\", "/"),
            "slug": slug,
            "sizes": config.get("sizes", "100vw"),
            "lazy": bool(config.get("lazy", True)),
            "widths": [int(w) for w in formats["webp"]],
            "webp": formats["webp"],
            "avif": formats["avif"],
            "fallback": formats["webp"][str(fallback_width)],
        }

        lightbox = config.get("lightbox")
        if lightbox:
            lb_width = min(lightbox, source_width)
            if lb_width >= source_width:
                lb_img = image.copy()
                lb_actual = source_width
            else:
                ratio = lb_width / source_width
                lb_height = max(1, round(source_height * ratio))
                lb_img = image.resize((lb_width, lb_height), Image.Resampling.LANCZOS)
                lb_actual = lb_width
            lb_webp = OPT / f"{slug}-{lb_actual}w-lightbox.webp"
            encode_variant(lb_img, lb_webp, "webp")
            entry["lightbox"] = f"images/opt/{lb_webp.name}"

        print(f"OK {rel_path} -> {len(formats['webp'])} widths")
        return entry


def main() -> int:
    manifest = load_manifest()
    meta: dict[str, dict] = {}

    for rel_path, config in manifest.items():
        key = rel_path.replace("\\", "/")
        result = optimize_image(key, config)
        if result:
            meta[key] = result

    save_meta(meta)
    print(f"Wrote {META_OUT} ({len(meta)} images)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
