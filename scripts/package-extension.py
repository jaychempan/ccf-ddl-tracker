#!/usr/bin/env python3
"""Build a reproducible Chrome Web Store ZIP from extension runtime files."""
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "chrome"
manifest = json.loads((SOURCE / "manifest.json").read_text())
version = manifest["version"]
files = sorted(
    path for path in SOURCE.rglob("*")
    if path.is_file()
    and ((path.parent == SOURCE and path.suffix in {".js", ".css", ".html", ".json"})
         or (path.parent == SOURCE / "icons" and path.suffix in {".png", ".svg"}))
)
names = {path.relative_to(SOURCE).as_posix() for path in files}
required = {"manifest.json", manifest["background"]["service_worker"],
            manifest["action"]["default_popup"], manifest["options_page"]}
required.update(manifest["icons"].values())
for content_script in manifest.get("content_scripts", []):
    required.update(content_script.get("js", []))
    required.update(content_script.get("css", []))
if missing := required - names:
    raise SystemExit(f"Missing runtime files: {sorted(missing)}")

output = ROOT / "dist" / f"ccf-ddl-tracker-v{version}.zip"
output.parent.mkdir(exist_ok=True)
with ZipFile(output, "w", compression=ZIP_DEFLATED) as archive:
    for path in files:
        entry = ZipInfo(path.relative_to(SOURCE).as_posix(), date_time=(1980, 1, 1, 0, 0, 0))
        entry.compress_type = ZIP_DEFLATED
        entry.create_system = 3
        entry.external_attr = 0o100644 << 16
        archive.writestr(entry, path.read_bytes())
with ZipFile(output) as archive:
    if bad := archive.testzip():
        raise SystemExit(f"Invalid archive entry: {bad}")
print(f"Built {output.relative_to(ROOT)} ({len(files)} files, {output.stat().st_size:,} bytes)")
