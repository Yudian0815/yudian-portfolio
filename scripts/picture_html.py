#!/usr/bin/env python3
"""Build responsive <picture> markup from images/opt/meta.json."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
META = ROOT / "images" / "opt" / "meta.json"


def load_meta() -> dict:
    with META.open(encoding="utf-8") as fh:
        return json.load(fh)


def srcset(formats: dict[str, str]) -> str:
    return ", ".join(f"{path} {width}w" for width, path in sorted(formats.items(), key=lambda item: int(item[0])))


def picture_html(
    source: str,
    meta: dict,
    *,
    alt: str = "",
    class_name: str = "",
    width: str | None = None,
    height: str | None = None,
    lazy: bool | None = None,
    extra_attrs: str = "",
) -> str:
    entry = meta[source]
    use_lazy = entry["lazy"] if lazy is None else lazy
    loading = "lazy" if use_lazy else "eager"
    fetch = ' fetchpriority="high"' if not use_lazy and "hero-portrait" in source else ""

    avif = srcset(entry["avif"])
    webp = srcset(entry["webp"])
    smallest = str(min(entry["widths"]))
    fallback = entry["webp"][smallest]
    sizes = entry["sizes"]

    attrs = []
    if class_name:
        attrs.append(f'class="{class_name}"')
    if width:
        attrs.append(f'width="{width}"')
    if height:
        attrs.append(f'height="{height}"')
    attrs.append(f'alt="{alt}"')
    attrs.append(f'loading="{loading}"')
    attrs.append('decoding="async"')
    if extra_attrs:
        attrs.append(extra_attrs.strip())
    if entry.get("lightbox"):
        attrs.append(f'data-lightbox-src="{entry["lightbox"]}"')
    img_attrs = " ".join(attrs)

    return (
        f"<picture>\n"
        f'  <source type="image/avif" srcset="{avif}" sizes="{sizes}">\n'
        f'  <source type="image/webp" srcset="{webp}" sizes="{sizes}">\n'
        f"  <img src=\"{fallback}\" {img_attrs}{fetch}>\n"
        f"</picture>"
    )


def lightbox_src(source: str, meta: dict) -> str:
    entry = meta[source]
    return entry.get("lightbox") or entry["fallback"]


if __name__ == "__main__":
    meta = load_meta()
    print(picture_html("images/hero-portrait.jpg", meta, alt="", class_name="site-nav__avatar", width="40", height="40", lazy=False))
