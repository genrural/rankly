#!/usr/bin/env python3
"""Recomprime todas las imágenes de la web para que cada archivo pese menos de 100 KB.

Uso: python3 tools/optimize_images.py
Ajusta la calidad (y si hace falta el tamaño) de cada JPG/WebP hasta bajar del límite
y actualiza tools/images.json con las dimensiones finales.
"""
import io
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LIMIT = 100 * 1024 - 512


def encode(im, fmt, q):
    buf = io.BytesIO()
    if fmt == "WEBP":
        im.save(buf, "WEBP", quality=q, method=6)
    else:
        im.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
    return buf.getvalue()


def fit(im, fmt, qs=(80, 74, 68, 62, 56, 50, 45, 40)):
    """Devuelve (bytes, imagen) bajo el límite, reduciendo calidad y luego tamaño."""
    cur = im
    while True:
        for q in qs:
            data = encode(cur, fmt, q)
            if len(data) <= LIMIT:
                return data, cur
        w, h = cur.size
        cur = cur.resize((int(w * 0.88), int(h * 0.88)), Image.LANCZOS)


def optimize_dir(folder, meta=None):
    folder = ROOT / folder
    for src in sorted(folder.glob("*.jpg")):
        name = src.stem
        base = Image.open(src).convert("RGB")
        data, out = fit(base, "JPEG")
        src.write_bytes(data)
        webp = src.with_suffix(".webp")
        wdata, wout = fit(out, "WEBP")
        webp.write_bytes(wdata)
        if meta is not None and name in meta:
            meta[name]["w"], meta[name]["h"] = out.size


if __name__ == "__main__":
    mf = ROOT / "tools" / "images.json"
    meta = json.loads(mf.read_text(encoding="utf-8"))
    optimize_dir("assets/img/fotos", meta)
    optimize_dir("assets/img/productos")
    mf.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    for f in ("assets/img/og-deyscom-motorsport.jpg",):
        p = ROOT / f
        data, _ = fit(Image.open(p).convert("RGB"), "JPEG")
        p.write_bytes(data)
    big = [str(p.relative_to(ROOT)) for p in (ROOT / "assets").rglob("*") if p.is_file() and p.stat().st_size > 100 * 1024]
    print("Archivos > 100 KB:", big or "ninguno")
