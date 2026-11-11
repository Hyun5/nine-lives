#!/usr/bin/env python3
"""Write Nine Lives index.html from index.template.html.

Stills and videos are shipped as separate files under assets/rooms and
assets/rooms_rainy. Videos are never inlined as data URIs.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / "index.template.html"
OUT = ROOT / "index.html"


def main() -> None:
    template = TEMPLATE.read_text(encoding="utf-8")
    marker = "    /* __MEDIA_MAP__ */\n    const MEDIA = null;"
    if marker not in template:
        raise SystemExit("MEDIA marker not found in template")
    # MEDIA stays null: asset() falls back to ./assets/{rooms,rooms_rainy}/.
    html = template
    OUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes); media is served as files")


if __name__ == "__main__":
    main()
