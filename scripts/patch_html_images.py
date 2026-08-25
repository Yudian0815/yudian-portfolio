#!/usr/bin/env python3
"""Patch HTML files to use responsive picture elements."""

from __future__ import annotations

import re
import sys
from pathlib import Path

from picture_html import lightbox_src, load_meta, picture_html

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = list(ROOT.glob("*.html")) + list(ROOT.glob("case-study-*.html"))

IMG_RE = re.compile(r"<img\b([^>]*?)>", re.IGNORECASE | re.DOTALL)
SRC_RE = re.compile(r"""src\s*=\s*['"](images/[^'"]+)['"]""", re.IGNORECASE)


def parse_attrs(attr_text: str) -> dict[str, str]:
    attrs: dict[str, str] = {}
    for match in re.finditer(r'(\w[\w-]*)\s*=\s*"([^"]*)"', attr_text):
        attrs[match.group(1)] = match.group(2)
    return attrs


def replace_img_tag(full_match: re.Match[str], meta: dict) -> str:
    attr_text = full_match.group(1)
    attrs = parse_attrs(attr_text)
    src = attrs.get("src")
    if not src or src not in meta:
        return full_match.group(0)

    alt = attrs.get("alt", "")
    class_name = attrs.get("class", "")
    width = attrs.get("width")
    height = attrs.get("height")
    lazy_override = None
    if "loading=" in attr_text:
        lazy_override = attrs.get("loading") != "eager"

    extra = []
    for key, value in attrs.items():
        if key in {"src", "alt", "class", "width", "height", "loading", "decoding"}:
            continue
        extra.append(f'{key}="{value}"')

    return picture_html(
        src,
        meta,
        alt=alt,
        class_name=class_name,
        width=width,
        height=height,
        lazy=lazy_override,
        extra_attrs=" ".join(extra),
    )


def patch_data_src(content: str, meta: dict, attr: str) -> str:
    def repl(match: re.Match[str]) -> str:
        src = match.group(1)
        if src not in meta:
            return match.group(0)
        return f'{attr}="{lightbox_src(src, meta)}"'

    return re.sub(rf'{attr}\s*=\s*"([^"]+)"', repl, content)


def add_lightbox_attrs(content: str, meta: dict) -> str:
    for entry in meta.values():
        lightbox = entry.get("lightbox")
        if not lightbox:
            continue
        slug = entry["slug"]
        pattern = rf'(<img\b[^>]*src="images/opt/{re.escape(slug)}[^"]*"[^>]*)(>)'

        def repl(match: re.Match[str]) -> str:
            tag = match.group(1)
            if "data-lightbox-src=" in tag:
                return match.group(0)
            return f'{tag} data-lightbox-src="{lightbox}"{match.group(2)}'

        content = re.sub(pattern, repl, content)
    return content


def fix_picture_fallbacks(content: str, meta: dict) -> str:
    for entry in meta.values():
        smallest = entry["webp"][str(min(entry["widths"]))]
        slug = re.escape(entry["slug"])
        content = re.sub(
            rf'(<img\b[^>]*src=")images/opt/{slug}-\d+w\.webp("[^>]*>)',
            rf"\1{smallest}\2",
            content,
        )
    return content


def patch_file(path: Path, meta: dict) -> bool:
    original = path.read_text(encoding="utf-8")
    updated = patch_data_src(original, meta, "data-portrait-src")
    updated = patch_data_src(updated, meta, "data-expand-src")
    updated = IMG_RE.sub(lambda m: replace_img_tag(m, meta), updated)
    updated = add_lightbox_attrs(updated, meta)
    updated = fix_picture_fallbacks(updated, meta)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> int:
    meta = load_meta()
    changed = 0
    for path in sorted(set(HTML_FILES)):
        if not path.exists():
            continue
        if patch_file(path, meta):
            print(f"patched {path.name}")
            changed += 1
    print(f"Updated {changed} files")
    return 0


if __name__ == "__main__":
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    raise SystemExit(main())
