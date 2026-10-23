#!/usr/bin/env python3
"""Copia a dist/ solo lo que se publica (sin tools/, content/, google-apps-script/…). Lo usa el hosting."""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
FILES = [".htaccess", "robots.txt", "sitemap.xml", "llms.txt", "llms-full.txt", "favicon.ico", "site.webmanifest", "_headers", "_redirects"]
DIRS = ["assets", "admin"]

if DIST.exists():
    shutil.rmtree(DIST)
DIST.mkdir()
for f in list(ROOT.glob("*.html")) + [ROOT / n for n in FILES]:
    if f.exists():
        shutil.copy2(f, DIST / f.name)
for d in DIRS:
    if (ROOT / d).exists():
        shutil.copytree(ROOT / d, DIST / d)
print("dist/ listo:", sum(1 for _ in DIST.rglob("*") if _.is_file()), "archivos")
