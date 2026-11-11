#!/usr/bin/env python3
"""Pack Nine Lives (나인 라이브스) index.template.html + assets/rooms into a standalone index.html."""
from __future__ import annotations

import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / "index.template.html"
ASSETS = ROOT / "assets" / "rooms"
OUT = ROOT / "index.html"

MIME = {".mp4": "video/mp4", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}


def main() -> None:
    template = TEMPLATE.read_text(encoding="utf-8")
    marker = "    /* __MEDIA_MAP__ */\n    const MEDIA = null;"
    if marker not in template:
        raise SystemExit("MEDIA marker not found in template")

    media: dict[str, str] = {}
    for path in sorted(ASSETS.iterdir()):
        if not path.is_file() or path.suffix.lower() not in MIME:
            continue
        mime = MIME[path.suffix.lower()]
        data = base64.b64encode(path.read_bytes()).decode("ascii")
        media[path.name] = f"data:{mime};base64,{data}"

    entries = ",\n".join(f"      {json.dumps(k)}: {json.dumps(v)}" for k, v in media.items())
    replacement = "    /* Media is inlined so this file opens with no server. */\n    const MEDIA = {\n" + entries + "\n    };"
    html = template.replace(marker, replacement)
    OUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes) with {len(media)} media files")


if __name__ == "__main__":
    main()
