#!/usr/bin/env python3
"""Refresh website script URLs after changing translations or behavior."""
import hashlib
from pathlib import Path
import re

website = Path(__file__).resolve().parents[1] / "website"
version = hashlib.sha256((website / "script.js").read_bytes()).hexdigest()[:12]
updated = 0
for page in sorted(website.rglob("*.html")):
    source = page.read_text()
    result, count = re.subn(
        r'(<script\s+src="(?:\./|\.\./)?script\.js)(?:\?[^"<>]*)?(">)',
        lambda match: f"{match[1]}?v={version}{match[2]}",
        source,
    )
    if count:
        page.write_text(result)
        updated += 1
print(f"Versioned script.js as {version} across {updated} pages")
