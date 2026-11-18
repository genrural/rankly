#!/usr/bin/env python3
"""Esquemas SVG de las figuras del II Slalom Ciudad del Automóvil de Leganés (blog).

Uso: python3 tools/blog_diagrams.py  → assets/img/blog/slalom-leganes-*.svg
Están dibujados a partir de los bocetos del recorrido: son orientativos, no a escala.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/img/blog"

C = {"naranja": "#ff9f43", "rosa": "#ff66c4", "verde": "#7bd33f", "turquesa": "#22c1c3", "lima": "#d6f04a", "blanco": "#f4f4f6"}
TRACK, EDGE, BG = "#2b2b35", "#e9e9ef", "#141419"


class Fig:
    def __init__(self, num, name, sub):
        self.num, self.name, self.sub = num, name, sub
        self.outline, self.fill, self.top, self.legend = [], [], [], []

    # --- pista ---
    def lane(self, d, w=96, cap="round"):
        self.outline.append(f'<path d="{d}" fill="none" stroke="{EDGE}" stroke-width="{w + 8}" stroke-linecap="{cap}" stroke-linejoin="round"/>')
        self.fill.append(f'<path d="{d}" fill="none" stroke="{TRACK}" stroke-width="{w}" stroke-linecap="{cap}" stroke-linejoin="round"/>')

    def circle(self, x, y, r):
        self.outline.append(f'<circle cx="{x}" cy="{y}" r="{r + 4}" fill="{EDGE}"/>')
        self.fill.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{TRACK}"/>')

    def rect(self, x, y, w, h, r=18):
        self.outline.append(f'<rect x="{x - 4}" y="{y - 4}" width="{w + 8}" height="{h + 8}" rx="{r + 4}" fill="{EDGE}"/>')
        self.fill.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{TRACK}"/>')

    def wall(self, x1, y1, x2, y2):
        self.top.insert(0, f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{EDGE}" stroke-width="7" stroke-linecap="round"/>')

    # --- elementos ---
    def cone(self, x, y):
        self.top.append(f'<g transform="translate({x} {y})"><ellipse cy="13" rx="15" ry="5" fill="#000" opacity=".35"/>'
                        '<path d="M-12 12 L-4 -16 L4 -16 L12 12 Z" fill="#ff7a00"/><path d="M-8.4 -1 L8.4 -1 L9.9 5 L-9.9 5 Z" fill="#fff"/>'
                        '<rect x="-15" y="10" width="30" height="5" rx="2" fill="#ff7a00"/></g>')

    def path(self, d, color, label=None, width=6):
        c = C[color]
        self.top.append(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#a-{color})"/>')
        if label and (color, label) not in self.legend:
            self.legend.append((color, label))

    def text(self, x, y, t, color="#a7a7b3", size=15, anchor="middle", weight=700):
        self.top.append(f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" letter-spacing="1.5">{t}</text>')

    def publico(self, x, y):
        self.text(x, y, "PÚBLICO", C["rosa"], 14)

    def fence(self, d):
        self.top.insert(0, f'<path d="{d}" fill="none" stroke="{C["rosa"]}" stroke-width="3" stroke-dasharray="10 8" opacity=".8"/>')

    def svg(self):
        markers = "".join(f'<marker id="a-{k}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">'
                          f'<path d="M0 0 L10 5 L0 10 Z" fill="{v}"/></marker>' for k, v in C.items())
        leg, x, y = [], 40, 618
        for i, (color, label) in enumerate(self.legend):
            cx, cy = (40 + (i % 2) * 270, 618 + (i // 2) * 34)
            leg.append(f'<line x1="{cx}" y1="{cy}" x2="{cx + 34}" y2="{cy}" stroke="{C[color]}" stroke-width="7" stroke-linecap="round"/>'
                       f'<text x="{cx + 46}" y="{cy + 5}" fill="#e9e9ef" font-size="16" font-weight="600">{label}</text>')
        h = 618 + ((len(self.legend) + 1) // 2) * 34 + 16
        title = f"Zona {self.num}: {self.name}"
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 {h}" width="600" height="{h}" role="img" aria-labelledby="t d" '
                'font-family="Inter, Arial, Helvetica, sans-serif">'
                f'<title id="t">{title} · II Slalom Ciudad del Automóvil de Leganés</title><desc id="d">{self.sub}</desc>'
                f'<defs>{markers}</defs><rect width="600" height="{h}" rx="22" fill="{BG}"/>'
                f'<text x="30" y="42" fill="{C["rosa"]}" font-size="14" font-weight="800" letter-spacing="3">ZONA {self.num}</text>'
                f'<text x="30" y="72" fill="#fff" font-size="27" font-weight="900" font-style="italic">{self.name.upper()}</text>'
                f'<text x="570" y="42" fill="#7d7d8a" font-size="12" font-weight="700" text-anchor="end" letter-spacing="1.5">ESQUEMA ORIENTATIVO</text>'
                + "".join(self.outline + self.fill + self.top)
                + f'<line x1="30" y1="590" x2="570" y2="590" stroke="#2c2c36" stroke-width="2"/>' + "".join(leg) + "</svg>")


def trebol():
    f = Fig(1, "El Trébol", "Tres conos en forma de trébol: entrada por el tallo, vuelta al cono superior, al izquierdo y al derecho, y salida por el tallo.")
    f.lane("M300 585 L300 360", 150, "butt")
    for x, y in ((300, 190), (175, 320), (425, 320)):
        f.circle(x, y, 92)
    f.fill.append(f'<circle cx="300" cy="300" r="70" fill="{TRACK}"/>')
    for x, y in ((300, 190), (175, 320), (425, 320)):
        f.cone(x, y)
    f.path("M272 575 L272 330 C262 250 228 150 300 106 C372 106 380 222 318 258 L250 296", "naranja", "Entrada")
    f.path("M240 298 C230 238 128 220 100 300 C82 382 190 414 246 366 L352 344", "rosa", "Parte media")
    f.path("M360 342 C352 238 478 220 505 300 C522 366 462 404 412 382 C368 368 332 410 330 450 L330 575", "verde", "Final y salida")
    f.publico(470, 112); f.publico(500, 470); f.publico(100, 470)
    return f


def trebol4():
    f = Fig(2, "Trébol de cuatro conos", "Cuatro conos en cruz: entrada en diagonal, vuelta al cono izquierdo, al derecho y al superior, y salida rodeando el cono inferior.")
    f.rect(55, 95, 490, 475)
    for x, y in ((300, 160), (160, 310), (440, 310), (300, 455)):
        f.cone(x, y)
    f.path("M500 560 C495 470 420 400 340 360 L305 335", "naranja", "Entrada")
    f.path("M295 325 C255 250 160 226 112 282 C78 340 150 384 212 352 L280 318", "turquesa", "1.er cono")
    f.path("M318 312 C368 232 470 240 496 300 C512 368 420 384 362 350 L322 330", "lima", "2.º cono")
    f.path("M310 318 C258 252 222 168 268 112 C330 76 384 146 344 206 L310 262", "rosa", "3.er cono")
    f.path("M300 270 C250 336 228 424 268 484 C304 528 372 482 344 434 C318 398 252 470 214 560", "verde", "Salida")
    return f


def cascabel():
    f = Fig(3, "La Cascabel", "Una serpiente de calles estrechas que lleva a la cascabel: zigzag entre cuatro conos, vuelta con donuts y regreso por la serpiente.")
    f.circle(110, 168, 58)
    f.lane("M110 120 L110 520 L230 520 L230 175 L350 175 L350 520 L430 520", 92)
    f.rect(410, 120, 140, 450)
    f.cone(110, 168)
    for y in (200, 290, 380, 470):
        f.cone(480, y)
    f.path("M96 122 L96 505 Q96 536 128 536 L214 536 Q246 536 246 504 L246 192 Q246 160 278 160 L322 160 Q354 160 354 192 L354 504 Q354 536 386 536 L440 538", "naranja", "Entrada serpiente")
    f.path("M445 530 C445 500 520 492 520 470 C520 432 440 422 440 380 C440 342 520 332 520 290 C520 252 440 242 440 200 C440 160 470 140 505 140", "lima", "Entrada cascabel")
    f.path("M520 150 C540 178 535 236 500 244 C455 252 448 188 488 176 M518 300 L518 420 C528 470 468 498 450 466 C432 434 470 410 495 430", "turquesa", "Salida cascabel")
    f.path("M430 548 L384 548 Q338 548 338 516 L338 200 Q338 186 322 186 L278 186 Q262 186 262 202 L262 516 Q262 548 230 548 L140 548 Q124 548 124 516 L124 236 C172 240 172 122 124 124 C82 128 80 196 124 198 L126 112", "rosa", "Salida serpiente y donuts")
    return f


def chupachus():
    f = Fig(4, "El Chupachús", "Un tallo y una cabeza redonda con un cono en el centro: el piloto elige giro de 180°, un donut o dos donuts.")
    f.lane("M300 585 L300 360", 130, "butt")
    f.circle(300, 245, 140)
    f.fence("M110 96 L490 96 L490 410 M110 410 L110 96 M140 410 L225 410 M375 410 L460 410")
    f.cone(300, 245)
    f.path("M276 575 L276 400 C228 360 205 262 250 190 C292 140 372 158 380 232 C388 310 332 342 326 400 L326 575", "naranja", "Opción 180°")
    f.path("M300 300 C250 300 248 192 300 192 C352 192 352 296 312 300", "verde", "Opción 1 donut")
    f.path("M300 345 C220 345 196 262 222 210 C252 152 352 150 380 210 C406 268 372 330 318 340 M300 322 C238 322 230 250 252 216", "rosa", "Opción 2 donuts")
    f.publico(152, 124); f.publico(500, 470); f.publico(100, 470)
    return f


def al_lio():
    f = Fig(5, "¡Al lío!", "Tres conos en línea dentro de un rectángulo: un donut en el primero, dos en el segundo y tres en el tercero, y salida por el lateral.")
    f.rect(130, 120, 340, 455)
    f.lane("M210 90 L210 160", 70, "butt")
    f.lane("M410 90 L410 160", 70, "butt")
    for y in (200, 340, 485):
        f.cone(300, y)
    f.path("M210 95 L215 150 C228 165 255 150 300 146 C350 146 352 252 300 254 C246 256 250 176 286 160", "naranja", "Cono 1: 1 donut")
    f.path("M300 262 C270 300 250 282 248 330 C246 392 352 396 354 338 C356 290 300 282 282 296 M300 270 C224 270 220 405 300 410 C378 410 382 282 316 274", "turquesa", "Cono 2: 2 donuts")
    f.path("M300 418 C258 430 254 540 300 542 C346 542 344 438 304 432 M300 420 C226 420 226 556 300 558 C374 558 376 420 316 418", "verde", "Cono 3: 3 donuts")
    f.path("M360 470 C420 470 430 430 428 380 L418 98", "rosa", "Salida")
    f.text(210, 108, "ENTRADA", "#fff", 11); f.text(410, 108, "SALIDA", "#fff", 11)
    f.publico(530, 330); f.publico(70, 330)
    return f


def sube_baja():
    f = Fig(6, "Sube y baja", "Un pasillo largo con cuatro conos en línea: se recorre cuatro veces, bajando y subiendo en zigzag entre los conos.")
    f.lane("M300 95 L300 585", 250, "butt")
    ys = (165, 270, 375, 480)
    for y in ys:
        f.cone(300, y)

    def zig(amp, down, shift):
        pts = list(ys) if down else list(reversed(ys))
        y0, y1 = (110, 570) if down else (570, 110)
        side = 1
        d = f"M{300 + shift} {y0}"
        for y in pts:
            d += f" Q{300 + shift + side * amp * 1.4} {y} {300 + shift} {y + (55 if down else -55)}"
            side = -side
        return d + f" L{300 + shift} {y1}"
    f.path(zig(62, True, -6), "naranja", "1.ª pasada (baja)")
    f.path(zig(84, False, -2), "rosa", "2.ª pasada (sube)")
    f.path(zig(62, True, 4), "verde", "3.ª pasada (baja)")
    f.path(zig(84, False, 8), "turquesa", "4.ª pasada (sube)")
    f.publico(100, 340); f.publico(500, 340)
    return f


def sierra():
    f = Fig(7, "La Sierra", "Calles en zigzag como los dientes de una sierra: se entra por abajo a la derecha y se sale por arriba a la derecha.")
    f.rect(80, 100, 440, 470, 10)
    f.lane("M520 520 L585 520", 90, "butt")
    f.lane("M520 150 L585 150", 90, "butt")
    for y, x1, x2 in ((474, 170, 524), (382, 76, 430), (290, 170, 524), (198, 76, 430)):
        f.wall(x1, y, x2, y)
    f.path("M580 522 L140 522 Q112 522 112 498 L112 452 Q112 428 140 428 L452 428 Q482 428 482 404 L482 360 Q482 336 452 336 L140 336 Q112 336 112 312 L112 268 Q112 244 140 244 L452 244 Q482 244 482 220 L482 176 Q482 150 452 150 L582 150", "naranja", "Sentido de carrera")
    f.text(560, 495, "ENTRADA", "#fff", 11); f.text(560, 124, "SALIDA", "#fff", 11)
    return f


def ocho():
    f = Fig(8, "Mirar al ocho", "Dos conos dentro de un rectángulo: rodeo exterior y ocho entre los conos, con o sin vuelta final, entrando y saliendo por arriba a la derecha.")
    f.rect(100, 110, 400, 465)
    f.lane("M470 82 L470 150", 80, "butt")
    f.cone(300, 230); f.cone(300, 450)
    f.path("M455 95 L440 150 C300 120 150 120 150 230 L150 450 C150 548 450 548 450 450 L450 230 C450 180 420 170 400 168", "naranja", "Rodeo del ocho")
    f.path("M400 168 C330 150 230 160 230 230 C230 300 370 380 370 450 C370 520 230 520 230 450 C230 380 370 300 370 230 C370 196 352 178 330 170", "verde", "Ocho sin vuelta final")
    f.path("M330 170 C300 160 260 168 250 196 C238 232 300 262 352 214 C392 178 430 150 470 100", "turquesa", "Ocho con vuelta final")
    f.text(470, 100, "", "#fff", 11)
    f.publico(560, 340)
    return f


FIGS = [trebol, trebol4, cascabel, chupachus, al_lio, sube_baja, sierra, ocho]
SLUGS = ["el-trebol", "trebol-cuatro-conos", "la-cascabel", "el-chupachus", "al-lio", "sube-y-baja", "la-sierra", "mirar-al-ocho"]


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    out = []
    for fn, slug in zip(FIGS, SLUGS):
        f = fn()
        p = OUT / f"slalom-leganes-{slug}.svg"
        p.write_text(f.svg(), encoding="utf-8")
        out.append(p)
    return out


if __name__ == "__main__":
    for p in build():
        print(p.relative_to(ROOT))
