#!/usr/bin/env python3
"""Genera assets/js/ax-tracks.js con los trazados reales de los circuitos del juego AX Rally.

Fuente de los trazados: tools/data/f1-circuits.geojson (github.com/bacinger/f1-circuits, licencia MIT,
© Tomislav Bacinger; ver tools/data/f1-circuits-LICENSE.md). Cada circuito se pasa a metros, se remuestrea
cada 10 m y se orienta en el sentido de carrera (comprobando hacia dónde gira la primera curva).
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools/data/f1-circuits.geojson"
OUT = ROOT / "assets/js/ax-tracks.js"
STEP = 10.0
# id del dataset, id del juego, nombre, bandera, tema de paisaje, sentido de la 1.ª curva (+1 derecha, -1 izquierda)
CIRCUITS = [
    ("mc-1929", "monaco", "Mónaco", "🇲🇨", "city", 1),
    ("be-1925", "spa", "Spa-Francorchamps", "🇧🇪", "forest", 1),
    ("it-1922", "monza", "Monza", "🇮🇹", "park", 1),
    ("gb-1948", "silverstone", "Silverstone", "🇬🇧", "country", 1),
    ("jp-1962", "suzuka", "Suzuka", "🇯🇵", "japan", 1),
    ("br-1940", "interlagos", "Interlagos", "🇧🇷", "tropical", -1),
    ("es-1991", "barcelona", "Circuit de Barcelona-Catalunya", "🇪🇸", "spain", 1),
    ("de-1927", "nurburgring", "Nürburgring", "🇩🇪", "forest", 1),
    ("it-1953", "imola", "Imola", "🇮🇹", "park", -1),
    ("nl-1948", "zandvoort", "Zandvoort", "🇳🇱", "country", 1),
    ("hu-1986", "hungaroring", "Hungaroring", "🇭🇺", "park", 1),
    ("at-1969", "redbullring", "Red Bull Ring", "🇦🇹", "forest", 1),
    ("it-1914", "mugello", "Mugello", "🇮🇹", "park", 1),
    ("us-2012", "cota", "Circuit of the Americas", "🇺🇸", "golden", -1),
    ("ca-1978", "montreal", "Gilles-Villeneuve (Montreal)", "🇨🇦", "park", -1),
    ("az-2016", "baku", "Bakú", "🇦🇿", "city", -1),
    ("us-2023", "lasvegas", "Las Vegas", "🇺🇸", "citynight", -1),
]


def to_m(coords):
    lat0 = sum(c[1] for c in coords) / len(coords)
    kx = 111320 * math.cos(math.radians(lat0)); ky = 110540
    return [((c[0]) * kx, (c[1]) * ky) for c in coords]


def resample(pts, step):
    out = [pts[0]]; acc = 0.0
    seg = list(zip(pts, pts[1:] + [pts[0]]))  # circuito cerrado
    carry = 0.0
    for (x1, y1), (x2, y2) in seg:
        d = math.hypot(x2 - x1, y2 - y1)
        t = step - carry
        while t <= d:
            out.append((x1 + (x2 - x1) * t / d, y1 + (y2 - y1) * t / d)); t += step
        carry = d - (t - step)
    return out


def headings(pts):
    hs = []
    for i in range(len(pts)):
        x1, y1 = pts[i]; x2, y2 = pts[(i + 1) % len(pts)]
        hs.append(math.atan2(y2 - y1, x2 - x1))
    return hs


def first_turn_sign(pts):
    hs = headings(pts); tot = 0.0
    for i in range(1, len(hs) // 3):
        d = (hs[i] - hs[i - 1] + math.pi) % (2 * math.pi) - math.pi
        tot += d
        if abs(tot) > math.radians(40):
            return -1 if tot > 0 else 1   # giro antihorario (y hacia el norte) = izquierda
        if abs(d) < math.radians(0.3):
            tot *= 0.97
    return 1


def build():
    data = {f["properties"]["id"]: f for f in json.loads(SRC.read_text(encoding="utf-8"))["features"]}
    tracks = []
    for did, gid, name, flag, theme, first in CIRCUITS:
        f = data.get(did)
        if not f:
            continue
        coords = f["geometry"]["coordinates"]
        if coords[0] == coords[-1]:
            coords = coords[:-1]
        pts = resample(to_m(coords), STEP)
        if first_turn_sign(pts) != first:
            pts = [pts[0]] + pts[1:][::-1]
        x0, y0 = pts[0]
        flat = []
        for x, y in pts:
            flat += [round(x - x0), round(y0 - y)]   # y hacia abajo, como en la pantalla
        tracks.append({"id": gid, "name": name, "flag": flag, "theme": theme, "km": round(f["properties"]["length"] / 1000, 3), "step": STEP, "p": flat})
    js = ("/* Trazados reales de los circuitos del juego AX Rally. Generado por tools/game_tracks.py.\n"
          "   Datos: github.com/bacinger/f1-circuits (licencia MIT, © Tomislav Bacinger). No editar a mano. */\n"
          "window.AX_TRACKS = " + json.dumps(tracks, ensure_ascii=False, separators=(",", ":")) + ";\n")
    OUT.write_text(js, encoding="utf-8")
    return len(tracks), OUT.stat().st_size


if __name__ == "__main__":
    print(build())
