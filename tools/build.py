#!/usr/bin/env python3
"""
Generador estático de la web de Deyscom Motorsport.

Todas las páginas comparten cabecera, pie y bloques; el contenido vive aquí.
Uso:  python3 tools/build.py      → escribe los .html en la raíz del repo.
"""
import json
import re
from datetime import date
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://deyscom.com"
PHONE = "+34615972233"
PHONE_TXT = "(+34) 615 97 22 33"
EMAIL = "info@deyscom.com"
ADDRESS = "C/ Canal de Isabel II, 2 · Nave 3 · 28180 Torrelaguna (Madrid)"
VERSION = "3"
# Etiquetas de medición. Rellena uno de los dos (GTM recomendado). Con ambos vacíos no se carga nada de Google.
GTM_ID = ""   # p. ej. "GTM-XXXXXXX"
GA4_ID = "G-LLGMMVL7M1"   # Google Analytics 4 · flujo deyscom.com
GSC_VERIFICATION = "_x_mE5JlzHMblp_mzIOxFVX8XV2_VuzrmZg7E8Tc5Ks"   # Google Search Console
TODAY = date.today().isoformat()

# Fotos optimizadas (tools/images.json se genera al procesar las fotos: alt, ancho y alto)
IMG = json.loads((Path(__file__).parent / "images.json").read_text(encoding="utf-8"))
# Logotipo vectorial (colores con --logo-a / --logo-b)
_LOGO_SVG = (Path(__file__).parent / "logo.svg").read_text(encoding="utf-8")
LOGO_VB = re.search(r'viewBox="([^"]+)"', _LOGO_SVG).group(1)
LOGO_PATHS = re.search(r"</title>(.*)</svg>", _LOGO_SVG, re.S).group(1)


LOGO_SYMBOL = f'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="dm-logo" viewBox="{LOGO_VB}">{LOGO_PATHS}</symbol></svg>'


def logo_svg(cls="logo__svg", label=True):
    aria = 'role="img" aria-label="Deyscom Motorsport"' if label else 'aria-hidden="true"'
    return f'<svg class="{cls}" viewBox="{LOGO_VB}" {aria}>{LOGO_PATHS}</svg>'


def pic(name, cls="", eager=False, sizes="(max-width: 800px) 100vw, 50vw"):
    """<picture> responsive con WebP + JPG, ancho/alto y alt SEO."""
    m = IMG[name]
    base = f"assets/img/fotos/{name}"
    load = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    return (f'<picture><source type="image/webp" srcset="{base}-800.webp 800w, {base}.webp {m["w"]}w" sizes="{sizes}">'
            f'<img class="{cls}" src="{base}.jpg" srcset="{base}-800.jpg 800w, {base}.jpg {m["w"]}w" sizes="{sizes}" '
            f'width="{m["w"]}" height="{m["h"]}" alt="{escape(m["alt"])}" {load}></picture>')


def img_url(name):
    return f"{SITE}/assets/img/fotos/{name}.jpg"

# ------------------------------------------------------------------ iconos
I = {
    "arrow": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path class="arrow" d="M4 12h15m-6-7 7 7-7 7"/></svg>',
    "wa": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3M12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.6 15.6 2.1 13.8 2.1 12c0-5.5 4.4-9.9 9.9-9.9 2.6 0 5.1 1 7 2.9 1.9 1.9 2.9 4.4 2.9 7 0 5.4-4.4 9.8-9.9 9.8M20.4 3.6C18.2 1.3 15.2 0 12 0 5.5 0 .2 5.3.2 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.5 0 11.8-5.3 11.8-11.9 0-3.2-1.2-6.1-3.4-8.2"/></svg>',
    "phone": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    "mail": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
    "pin": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    "clock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    "check": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    "flag": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 22V4m0 0h14l-2 4 2 4H4"/></svg>',
    "helmet": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 15a9 9 0 0 1 18-2v4a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3z"/><path d="M12 11h9"/></svg>',
    "wrench": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/></svg>',
    "gauge": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 14l4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/></svg>',
    "spray": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3h.01M7 5h.01M11 7h.01M3 7h.01M7 9h.01M3 11h.01"/><rect x="15" y="5" width="4" height="4"/><path d="m19 9 2 2v10a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V11l2-2"/></svg>',
    "shield": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    "bolt": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    "truck": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    "key": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/></svg>',
    "layers": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></svg>',
    "eye": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    "cpu": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>',
    "wind": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9.6 4.6A2 2 0 1 1 11 8H2m10.6 11.4A2 2 0 1 0 14 16H2m15.7-8.3A2.5 2.5 0 1 1 19.5 12H2"/></svg>',
    "disc": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
    "star": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
    "bag": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>',
    "car": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 17H3v-5l2-5h11l4 5h1v5h-2"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="16.5" cy="17.5" r="2"/><path d="M9.5 17h5"/></svg>',
    # redes
    "instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    "facebook": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.6V14h2.8v8z"/></svg>',
    "tiktok": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.7a2.9 2.9 0 1 1-2-2.8V9.4a6.3 6.3 0 1 0 5.4 6.3V8.7a8.2 8.2 0 0 0 4.8 1.5V6.8z"/></svg>',
    "youtube": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z"/></svg>',
    "wallapop": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h18l-1.5 12.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5z"/><path d="M8 7V6a4 4 0 0 1 8 0v1"/><path d="m8.5 12 1.5 5 2-4 2 4 1.5-5"/></svg>',
}

SOCIAL = [
    ("instagram", "Instagram", "@deyscom_motorsport", "Día a día en el taller, stories y montajes."),
    ("tiktok", "TikTok", "@deyscom_motorsport", "Arranques, sonidos y vídeos cortos."),
    ("youtube", "YouTube", "Deyscom Motorsport", "Proyectos completos, onboards y procesos."),
    ("facebook", "Facebook", "/deyscom", "Novedades, eventos y comunidad."),
    ("wallapop", "Wallapop", "deyscomm", "Coches y piezas a la venta."),
]


I.update({
    "grad": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>',
    "cal": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    "users": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
    "map": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m1 6 7-4 8 4 7-4v16l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>',
    "award": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/></svg>',
    "book": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M8 7h8M8 11h6"/></svg>',
    "mic": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/></svg>',
    "chart": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 6-7"/></svg>',
    "ticket": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4z"/><path d="M13 5v14" stroke-dasharray="2 2"/></svg>',
})

NAV = [
    ("competicion.html", "Competición"),
    ("restomod.html", "Restomod"),
    ("pintura.html", "Pintura"),
    ("banco-de-potencia.html", "Banco de potencia"),
    ("experiencias.html", "Experiencias"),
    ("cursos.html", "Cursos"),
]
FOOTER_NAV = NAV + [("tienda.html", "Tienda"), ("nosotros.html", "Quiénes somos"), ("contacto.html", "Contacto")]

# ---------------------------------------------------------------- precios (None = "Consultar")
PRICES = {
    "ds-pilot-weekend-circuit": None,
    "ds-pilot-weekend-rally": None,
    "ds-pilot-weekend-slalom": None,
    "ds-copilot-course": None,
}


def price_html(slug):
    p = PRICES.get(slug)
    return f"{p} €" if p else "Consultar"


def logo(href="index.html"):
    return f'<a class="logo" href="{href}" aria-label="Deyscom Motorsport — inicio">{logo_svg()}</a>'


def social_links():
    return '<div class="social">' + "".join(
        f'<a data-social="{k}" href="#" aria-label="{n}" title="{n}">{I[k]}</a>' for k, n, *_ in SOCIAL
    ) + "</div>"


ORG_LD = {
    "@context": "https://schema.org",
    "@type": ["AutoRepair", "SportsActivityLocation"],
    "@id": SITE + "/#organizacion",
    "name": "Deyscom Motorsport",
    "legalName": "Deyscom Motorsport S.L.",
    "url": SITE + "/",
    "logo": SITE + "/assets/img/logo-deyscom-motorsport.png",
    "image": SITE + "/assets/img/og-deyscom-motorsport.jpg",
    "telephone": PHONE,
    "email": EMAIL,
    "priceRange": "€€",
    "address": {"@type": "PostalAddress", "streetAddress": "C/ Canal de Isabel II, 2, Nave 3", "postalCode": "28180",
                "addressLocality": "Torrelaguna", "addressRegion": "Madrid", "addressCountry": "ES"},
    "areaServed": "ES",
    "geo": {"@type": "GeoCoordinates", "latitude": 40.8277, "longitude": -3.5381},
    "hasMap": "https://www.google.com/maps/search/?api=1&query=Deyscom+Motorsport+Torrelaguna",
    "vatID": "ESB09939471",
    "founder": {"@type": "Person", "name": "Néstor Aguado", "url": SITE + "/nosotros.html#nestor-aguado"},
    "employee": [{"@type": "Person", "name": "Héctor Guzmán", "jobTitle": "Marketing", "url": SITE + "/nosotros.html#hector-guzman"}],
    "sponsor": [{"@type": "Organization", "name": n} for n in ("EBC Frenos", "HEL Performance", "Mishimoto", "King Elements")],
    "knowsAbout": ["Preparación de coches de rally", "Restomod", "Pintura de automóviles", "Banco de potencia", "Formación de copilotos de rally"],
    "openingHoursSpecification": [{"@type": "OpeningHoursSpecification",
                                   "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                                   "opens": "07:00", "closes": "15:00"}],
    "sameAs": ["https://www.instagram.com/deyscom_motorsport/", "https://www.facebook.com/deyscom/",
               "https://www.tiktok.com/@deyscom_motorsport", "https://www.youtube.com/channel/UCBdUbFXBtKdeDkqQ5_S5C6g",
               "https://es.wallapop.com/user/deyscomm-467502343"],
}


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False).replace("</", "<\\/") + "</script>"


def breadcrumbs_ld(slug, name, parent=None):
    items = [{"@type": "ListItem", "position": 1, "name": "Inicio", "item": SITE + "/"}]
    if parent:
        items.append({"@type": "ListItem", "position": 2, "name": parent[1], "item": f"{SITE}/{parent[0]}"})
    items.append({"@type": "ListItem", "position": len(items) + 1, "name": name, "item": f"{SITE}/{slug}.html"})
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}


PAGES_META = {}  # slug -> (title, desc) para el sitemap



# Títulos (≤ 65 car.) y descripciones (120-160 car.) optimizados para buscadores
META = {
    "index": ("Deyscom Motorsport · Taller de competición en Madrid", "Taller motorsport en Torrelaguna (Madrid): coches de competición, restomod, pintura, banco de potencia, experiencias de pilotaje y curso de copiloto."),
    "competicion": ("Preparación de coches de competición en Madrid | Deyscom", "Preparamos coches de rally, slalom y circuito en Madrid: jaulas de seguridad, set-up, asistencia en carrera y alquiler de coches de competición."),
    "restomod": ("Restomod y restauración de clásicos en Madrid | Deyscom", "Restomod y restauración de clásicos y 4x4 en Madrid: chasis, mecánica moderna, frenos, interior y pintura. Proyectos por fases hechos a mano."),
    "pintura": ("Pintura de coches y decoraciones racing en Madrid | Deyscom", "Pintura en cabina, chapa, chasis, colores especiales y decoraciones de competición en Torrelaguna (Madrid). Acabados de exposición."),
    "banco-de-potencia": ("Banco de potencia en Madrid: mide CV y par | Deyscom", "Banco de potencia en Torrelaguna (Madrid): mide los CV y el par reales de tu coche, diagnostica pérdidas y compara antes y después de modificar."),
    "experiencias": ("Experiencias de pilotaje: circuito, rally y slalom | Deyscom", "DS Pilot Weekend: vive la competición en el Circuito del Jarama, en un rally federado o en slalom con nuestro Peugeot 206 o BMW E36."),
    "ds-pilot-weekend-circuit": ("DS Pilot Weekend Circuit · Piloto en el Jarama | Deyscom", "Un fin de semana como piloto en el Circuito del Jarama: coche de competición, briefing, tandas en pista y equipo Deyscom. Reserva tu plaza."),
    "ds-pilot-weekend-rally": ("DS Pilot Weekend Rally · Corre un rally federado | Deyscom", "Corre un rally federado con nuestro Peugeot 206 1.6 XS de 118 CV o el BMW E36 de 135 CV. Coche, asistencia y equipo Deyscom incluidos."),
    "ds-pilot-weekend-slalom": ("DS Pilot Weekend Slalom · Experiencia de slalom | Deyscom", "Experiencia de slalom con el Peugeot 206 1.6 XS de 118 CV o el BMW E36 de 135 CV. Conos, cronómetro y consejos del equipo Deyscom."),
    "cursos": ("Cursos de motorsport y curso de copiloto | Deyscom", "Cursos de Deyscom Motorsport: DS Copilot Course, curso de copiloto de rally con certificación, teoría y práctica en tramo cerrado."),
    "ds-copilot-course": ("Curso de copiloto de rally certificado · DS Copilot Course", "Curso de copiloto de rally de fin de semana: teoría y práctica en tramo cerrado en Guadalajara, profesor y profesora, certificación y diploma."),
    "nosotros": ("Quiénes somos · Deyscom Motorsport, Torrelaguna", "Conoce a Deyscom Motorsport: Néstor Aguado, Héctor Guzmán y el equipo del taller de competición, restomod y pintura de Torrelaguna (Madrid)."),
    "blog": ("Blog de motorsport: rally, copilotos y técnica | Deyscom", "Guías y experiencia real del taller: cómo empezar en los rallies, qué hace un copiloto, cómo leer el banco de potencia y qué es un restomod."),
    "blog-como-empezar-en-los-rallies": ("Cómo empezar en los rallies: licencia, coche y presupuesto", "Guía para correr tu primer rally en España: licencia federativa, qué coche elegir, equipamiento obligatorio, copiloto y presupuesto."),
    "blog-que-hace-un-copiloto-de-rally": ("Qué hace un copiloto de rally: notas y controles horarios", "El trabajo del copiloto de rally: cómo se cantan las notas, el libro de ruta, el carnet de control, los controles horarios y la seguridad."),
    "blog-banco-de-potencia-como-leer-la-curva": ("Banco de potencia: cómo leer la curva de potencia y par", "Qué mide un banco de potencia, potencia en rueda frente a motor, la relación entre par y potencia y cómo comparar antes y después."),
    "blog-que-es-un-restomod": ("Qué es un restomod y cómo plantearlo por fases", "Qué es un restomod, en qué se diferencia de una restauración y cómo plantearlo por fases: diagnóstico, mecánica, ITV y presupuesto."),
    "camiseta-edicion-especial-el-molar-2026": ("Camiseta Edición Especial El Molar 2026 | Deyscom", "Edición limitada que celebra nuestro primer rally, el II Rallye Comunidad de Madrid – El Molar 2026, con nuestros patrocinadores."),
    "camiseta-deyscom": ("Camiseta negra Deyscom Motorsport · Tienda oficial", "Camiseta oficial negra de Deyscom Motorsport con logo pequeño en el pecho y logo grande en la espalda. Envío o recogida en el taller."),
    "sudadera-capucha-deyscom": ("Sudadera con capucha Deyscom Motorsport · Tienda", "Sudadera con capucha negra de Deyscom Motorsport con bolsillo canguro, logo en el pecho y logo grande en la espalda. Envío a toda España."),
    "chaqueta-deyscom": ("Chaqueta negra Deyscom Motorsport · Tienda oficial", "Chaqueta negra de equipo Deyscom Motorsport con cremallera, logo pequeño arriba a la derecha y logo grande en la espalda."),
    "gorra-deyscom": ("Gorra negra Deyscom Motorsport · Tienda oficial", "Gorra negra Deyscom Motorsport de seis paneles con logo bordado, visera curva y cierre ajustable. Envío o recogida en el taller."),
    "pegatinas-deyscom": ("Pegatinas Deyscom Motorsport · Tienda oficial", "Pack de pegatinas de vinilo Deyscom Motorsport para el coche, el casco o el taller. Resistentes al agua y al sol. Envío a toda España."),
    "tienda": ("Tienda Deyscom Motorsport · Merchandising y coches", "Merchandising oficial de Deyscom Motorsport, edición especial El Molar 2026 y coches y piezas en venta conectados con nuestro Wallapop."),
    "contacto": ("Contacto · Deyscom Motorsport, Torrelaguna (Madrid)", "Contacta con Deyscom Motorsport: (+34) 615 97 22 33, info@deyscom.com. C/ Canal de Isabel II, 2 Nave 3, Torrelaguna. L-V de 07:00 a 15:00."),
}

def head(title, desc, slug, topic, image="og", extra_ld=(), keywords=""):
    title, desc = META.get(slug, (title, desc))
    PAGES_META[slug] = (title, desc)
    canonical = f"{SITE}/" + ("" if slug == "index" else f"{slug}.html")
    og = f"{SITE}/assets/img/og-deyscom-motorsport.jpg" if image == "og" else img_url(image)
    preload = ""
    if image != "og":
        b = f"assets/img/fotos/{image}"
        preload = f'<link rel="preload" as="image" type="image/webp" imagesrcset="{b}-800.webp 800w, {b}.webp 1600w" imagesizes="100vw">\n'
    lds = ld(ORG_LD) + "".join(ld(x) for x in extra_ld)
    return f"""<!doctype html>
<html lang="es-ES">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{consent_head()}
<title>{escape(title)}</title>
<meta name="description" content="{escape(desc)}">
{f'<meta name="keywords" content="{escape(keywords)}">' if keywords else ''}
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="google-site-verification" content="{GSC_VERIFICATION}">
<meta name="author" content="Deyscom Motorsport">
<meta name="geo.region" content="ES-MD">
<meta name="geo.placename" content="Torrelaguna, Madrid">
<meta name="geo.position" content="40.8277;-3.5381">
<meta name="ICBM" content="40.8277, -3.5381">
<link rel="canonical" href="{canonical}">
<link rel="alternate" hreflang="es-ES" href="{canonical}">
<link rel="alternate" hreflang="x-default" href="{canonical}">
<meta name="theme-color" content="#000000">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="Deyscom Motorsport">
<meta property="og:title" content="{escape(title)}">
<meta property="og:description" content="{escape(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{og}">
<meta property="og:image:alt" content="{escape(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{escape(title)}">
<meta name="twitter:description" content="{escape(desc)}">
<meta name="twitter:image" content="{og}">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/img/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600;1,700;1,800;1,900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
{preload}<link rel="stylesheet" href="assets/css/styles.css?v={VERSION}">
{lds}
</head>
<body data-topic="{escape(topic)}">
<a class="skip-link" href="#main">Saltar al contenido</a>
"""



def consent_head():
    """Google Consent Mode v2: todo denegado por defecto y se actualiza con la elección guardada."""
    js = ("window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}"
          "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',"
          "analytics_storage:'denied',personalization_storage:'denied',functionality_storage:'granted',"
          "security_storage:'granted',wait_for_update:500});"
          "gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true);"
          "try{var c=JSON.parse(localStorage.getItem('dm_consent')||'null');"
          "if(c&&c.v===1){gtag('consent','update',{analytics_storage:c.a?'granted':'denied',"
          "ad_storage:c.m?'granted':'denied',ad_user_data:c.m?'granted':'denied',"
          "ad_personalization:c.m?'granted':'denied',personalization_storage:c.p?'granted':'denied'});}}catch(e){}")
    tags = ""
    if GTM_ID:
        tags = ("<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});"
                "var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;"
                f"j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}})(window,document,'script','dataLayer','{GTM_ID}');</script>")
    elif GA4_ID:
        tags = ('<link rel="preconnect" href="https://www.googletagmanager.com">'
                f'<script async src="https://www.googletagmanager.com/gtag/js?id={GA4_ID}"></script>'
                f"<script>window.DM_USE_GTAG=true;gtag('js',new Date());gtag('config','{GA4_ID}');</script>")
    return f"<script>{js}</script>{tags}"


def cookie_banner():
    cats = [("a", "Analítica", "Nos ayuda a saber cuántas personas visitan la web y qué páginas funcionan mejor (Google Analytics)."),
            ("m", "Publicidad", "Permite medir nuestras campañas y mostrarte anuncios relevantes de Deyscom en Google y otras plataformas."),
            ("p", "Personalización", "Recuerda preferencias para adaptar el contenido que ves.")]
    rows = "".join(f'<label class="cc__row"><span><b>{t}</b><small>{d}</small></span><input type="checkbox" data-cc-cat="{k}"><i class="cc__sw" aria-hidden="true"></i></label>' for k, t, d in cats)
    return f"""<div class="cc" id="cc" role="dialog" aria-labelledby="cc-title" aria-describedby="cc-desc" hidden>
  <div class="cc__box">
    <p class="cc__title" id="cc-title">Tu privacidad, a tu ritmo</p>
    <p class="cc__desc" id="cc-desc">Usamos cookies técnicas necesarias para que la web funcione y, solo si nos das permiso, cookies de analítica y publicidad de terceros. Puedes aceptarlas, rechazarlas o elegir cuáles. <a href="politica-cookies.html">Política de cookies</a></p>
    <div class="cc__prefs" hidden>
      <label class="cc__row"><span><b>Técnicas</b><small>Necesarias para el funcionamiento de la web y de los formularios. Siempre activas.</small></span><input type="checkbox" checked disabled><i class="cc__sw" aria-hidden="true"></i></label>
      {rows}
    </div>
    <div class="cc__btns">
      <button type="button" class="cc__btn" data-cc="reject">Rechazar</button>
      <button type="button" class="cc__btn cc__btn--line" data-cc="config">Configurar</button>
      <button type="button" class="cc__btn cc__btn--line" data-cc="save" hidden>Guardar selección</button>
      <button type="button" class="cc__btn" data-cc="accept">Aceptar todo</button>
    </div>
  </div>
</div>"""


def header(slug):
    links = "".join(
        f'<a class="nav__link" href="{h}"{" aria-current=\"page\"" if h == slug + ".html" or (h == "blog.html" and slug.startswith("blog-")) else ""}>'
        f'<span class="nav__num">{i:02d}</span>{t}</a>'
        for i, (h, t) in enumerate(NAV, 1)
    )
    shop_cur = ' aria-current="page"' if slug in ("tienda",) or slug in PRODUCTS else ""
    links += f'<a class="nav__shop" href="tienda.html"{shop_cur}>{I["bag"]} Tienda</a>'
    links += f'<div class="nav__extra"><a href="nosotros.html">Quiénes somos</a><a href="contacto.html">Contacto</a><a href="tel:{PHONE}">{PHONE_TXT}</a></div>'
    return f"""<div class="topbar">
  <div class="container">
    <div class="topbar__left">
      <span><i class="status-dot"></i> <span data-open-status>L-V 07:00–15:00</span></span>
      <a class="topbar__hide-sm topbar__promo" href="ds-copilot-course.html">{I['grad']} Nuevo: DS Copilot Course con certificación</a>
    </div>
    <div class="topbar__right">
      <a href="tel:{PHONE}">{I['phone']} {PHONE_TXT}</a>
      <a class="topbar__hide-sm" href="mailto:{EMAIL}">{I['mail']} {EMAIL}</a>
    </div>
  </div>
</div>
<header class="header">
  <div class="container">
    {logo()}
    <nav class="nav" id="nav" aria-label="Principal">{links}</nav>
    <div class="header__cta">
      <a class="btn btn--icon-sm header__shop" href="tienda.html" aria-label="Tienda">{I['bag']}</a>
      <a class="btn btn--primary-sm" href="contacto.html#presupuesto">Presupuesto</a>
      <button class="burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav"><span></span></button>
    </div>
  </div>
</header>
<main id="main">
"""


def footer():
    col1 = "".join(f'<li><a href="{h}">{t}</a></li>' for h, t in NAV[:4])
    col2 = "".join(f'<li><a href="{h}">{t}</a></li>' for h, t in [
        ("experiencias.html", "Experiencias"), ("ds-pilot-weekend-circuit.html", "DS Pilot Weekend · Circuit"),
        ("ds-pilot-weekend-rally.html", "DS Pilot Weekend · Rally"), ("ds-pilot-weekend-slalom.html", "DS Pilot Weekend · Slalom"),
        ("cursos.html", "Cursos"), ("ds-copilot-course.html", "DS Copilot Course"), ("tienda.html", "Tienda"), ("blog.html", "Blog")])
    return f"""</main>
<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        {logo()}
        <p class="mt-2 max-60">Taller motorsport en Torrelaguna (Madrid): coches de competición, restomod, pintura, banco de potencia, experiencias de pilotaje y cursos de copiloto.</p>
        <div class="mt-2">{social_links()}</div>
      </div>
      <div>
        <h4>Taller</h4>
        <ul>{col1}<li><a href="nosotros.html">Quiénes somos</a></li><li><a href="contacto.html">Contacto</a></li></ul>
      </div>
      <div>
        <h4>Vive Deyscom</h4>
        <ul>{col2}</ul>
      </div>
      <div>
        <h4>Contacto</h4>
        <ul>
          <li><a href="tel:{PHONE}">{PHONE_TXT}</a></li>
          <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
          <li><a data-wa="" data-loc="footer" href="#">WhatsApp directo</a></li>
          <li><a href="https://www.google.com/maps/search/?api=1&query=Calle+Canal+de+Isabel+II+2+Torrelaguna" target="_blank" rel="noopener">C/ Canal de Isabel II, 2 · Nave 3<br>28180 Torrelaguna · Madrid</a></li>
        </ul>
        <div class="mt-2">{hours_table()}</div>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© <span data-year>2026</span> Deyscom Motorsport S.L. · Todos los derechos reservados</span>
      <nav aria-label="Legal"><a href="nosotros.html">Quiénes somos</a><a href="contacto.html">Contacto</a><a href="aviso-legal.html">Aviso legal</a><a href="politica-privacidad.html">Privacidad</a><a href="politica-cookies.html">Cookies</a><a href="condiciones-compra.html">Condiciones de compra</a><button type="button" class="linklike" data-cc-open>Configurar cookies</button></nav>
    </div>
  </div>
</footer>

{cookie_banner()}
<div class="wa-float">
  <div class="wa-float__bubble">¿Hablamos? Te respondemos por WhatsApp 🏁</div>
  <a class="wa-float__btn" data-wa="" data-loc="float" href="#" aria-label="Escríbenos por WhatsApp">{I['wa']}</a>
</div>
<nav class="mobile-cta" aria-label="Acciones rápidas">
  <a href="tel:{PHONE}">{I['phone']} Llamar</a>
  <a class="is-wa" data-wa="" data-loc="mobilebar" href="#">{I['wa']} WhatsApp</a>
  <a class="is-main" href="contacto.html#presupuesto">{I['flag']} Presupuesto</a>
</nav>
<script src="assets/js/config.js?v={VERSION}"></script>
<script src="assets/js/main.js?v={VERSION}" defer></script>
</body>
</html>
"""


def hours_table():
    return """<table class="hours">
  <tr data-day="1,2,3,4,5"><td>Lunes – Viernes</td><td>07:00 – 15:00</td></tr>
  <tr data-day="6"><td>Sábado</td><td class="closed">Cerrado</td></tr>
  <tr data-day="0"><td>Domingo</td><td class="closed">Cerrado</td></tr>
</table>"""


# ------------------------------------------------------------------ bloques
def art(label, x="70%", y="30%", img=None, alt="", sizes="(max-width: 800px) 100vw, 50vw"):
    photo = pic(img, sizes=sizes) if img in IMG else ""
    return (f'<div class="art" style="--x:{x};--y:{y}" aria-hidden="true"><div class="art__label">{label}</div>'
            f'<div class="art__stripe"></div><div class="art__stripe"></div></div>{photo}')


def ticker(words, dark=False):
    items = "".join(f'<span class="ticker__item">{w}</span>' for w in words)
    return f'<div class="ticker{" ticker--dark" if dark else ""}"><div class="ticker__track">{items}</div></div>'


def hero(eyebrow, lines, lead, number, img, chips, topic, cta=("Pide presupuesto", "#presupuesto"), page=True, h1_extra=""):
    h1 = "".join(f'<span class="line"><span>{l}</span></span>' for l in lines)
    chips_html = "".join(f'<span class="chip">{c}</span>' for c in chips)
    photo = pic(img, eager=True, sizes="100vw") if img in IMG else ""
    return f"""<section class="hero{" page-hero" if page else ""}">
  <div class="hero__bg">{photo}</div>
  <div class="hero__grid"></div>
  <div class="hero__speed" aria-hidden="true"></div>
  <div class="hero__number" aria-hidden="true">{number}</div>
  <div class="container hero__inner">
    <span class="eyebrow">{eyebrow}</span>
    <h1{h1_extra}>{h1}</h1>
    <div class="hero__bottom">
      <div>
        <p class="lead">{lead}</p>
        <div class="hero__badges">{chips_html}</div>
      </div>
      <div class="btn-row hero__ctas">
        <a class="btn" href="{cta[1]}">{cta[0]} {I['arrow']}</a>
        <a class="btn btn--wa" data-wa="{escape(topic)}" data-loc="hero" href="#">{I['wa']} WhatsApp</a>
      </div>
    </div>
  </div>
</section>
"""


def cards(items):
    out = "".join(
        f'<article class="card reveal" data-delay="{i % 3}"><div class="card__icon">{I[ic]}</div><h3>{t}</h3><p>{d}</p></article>'
        for i, (ic, t, d) in enumerate(items)
    )
    return f'<div class="cards">{out}</div>'


def process(steps, label="Fase"):
    return "".join(
        f'<div class="step reveal" data-delay="{i}"><span class="step__n">{label} 0{i + 1}</span><h3>{t}</h3><p>{d}</p></div>'
        for i, (t, d) in enumerate(steps)
    )


def gallery(items, word):
    """items: lista de (foto, pie)."""
    out = "".join(
        f'<figure class="gallery__item reveal">{art(word, f"{20 + i * 15}%", "40%", img, cap, "(max-width: 760px) 50vw, 33vw")}'
        f'<figcaption class="gallery__cap">{cap}</figcaption></figure>'
        for i, (img, cap) in enumerate(items)
    )
    return f'<div class="gallery{" gallery--8" if len(items) == 8 else ""}">{out}</div>'


def faq(items):
    return '<div class="faq">' + "".join(
        f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in items
    ) + "</div>"


def faq_ld(items):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}


def mega_cta(title_html, text, topic, primary=("Pide presupuesto", "contacto.html#presupuesto")):
    return f"""<section class="section section--pink mega-cta">
  <div class="mega-cta__flag" aria-hidden="true"></div>
  <div class="container">
    <h2 class="reveal">{title_html}</h2>
    <p class="lead mt-2" style="color:#111">{text}</p>
    <div class="btn-row">
      <a class="btn btn--dark" href="{primary[1]}">{primary[0]} {I['arrow']}</a>
      <a class="btn btn--wa" data-wa="{escape(topic)}" data-loc="megacta" href="#">{I['wa']} WhatsApp</a>
      <a class="btn btn--ghost btn--ghost-dark" href="tel:{PHONE}">{I['phone']} {PHONE_TXT}</a>
    </div>
  </div>
</section>
"""


def success_block(title="¡Bandera a cuadros!", text="Hemos recibido tu solicitud. Te contactamos en menos de 24 h laborables.", pay=False):
    pay_btn = f'<a class="btn" data-pay hidden href="#" target="_blank" rel="noopener">{I["ticket"]} Pagar ahora</a>' if pay else ""
    return f"""<div class="form-success" role="status" aria-live="polite">
  <div class="form-success__icon">{I['check']}</div>
  <h3>{title}</h3>
  <p data-success-note>{text}</p>
  <div class="btn-row" style="justify-content:center">
    {pay_btn}
    <a class="btn btn--wa" data-success-wa href="#" target="_blank" rel="noopener">{I['wa']} Acelerar por WhatsApp</a>
  </div>
</div>"""


def consent():
    return ('<label class="check full"><input type="checkbox" name="consentimiento" value="sí" required> '
            '<span>Acepto la <a href="politica-privacidad.html" target="_blank">política de privacidad</a> y que Deyscom Motorsport me contacte sobre mi solicitud.</span></label>'
            '<p class="gdpr full"><b>Responsable:</b> Deyscom Motorsport S.L. · <b>Finalidad:</b> responder a tu solicitud, presupuesto, reserva o pedido · '
            '<b>Legitimación:</b> tu consentimiento y, en su caso, la ejecución del contrato · <b>Destinatarios:</b> no se ceden datos salvo obligación legal · '
            '<b>Derechos:</b> acceso, rectificación, supresión y otros, en info@deyscom.com · <a href="politica-privacidad.html" target="_blank">Más información</a></p>'
            '<div class="hp" aria-hidden="true"><label>No rellenar<input type="text" name="_hp" tabindex="-1" autocomplete="off"></label></div>')


def legend(text, req=False):
    return f'<legend class="field"><span class="lbl">{text}{" <span class=pink>*</span>" if req else ""}</span></legend>'


def pills(name, options, req=False, checked=None):
    return "".join(
        f'<label class="pill"><input type="radio" name="{name}" value="{escape(o)}"{" required" if req and i == 0 else ""}{" checked" if o == checked else ""}><span>{o}</span></label>'
        for i, o in enumerate(options)
    )


def tel_input(id_):
    return f'<input class="input" id="{id_}" name="telefono" type="tel" autocomplete="tel" required pattern="[0-9 +()\\-]{{9,}}" placeholder="600 000 000">'


def contact_list():
    return f"""<ul class="contact-list">
  <li><span class="ic">{I['wa']}</span><div><small>WhatsApp · respuesta rápida</small><a data-wa="" data-loc="contactlist" href="#">Escríbenos ahora</a></div></li>
  <li><span class="ic">{I['phone']}</span><div><small>Teléfono</small><a href="tel:{PHONE}">{PHONE_TXT}</a></div></li>
  <li><span class="ic">{I['mail']}</span><div><small>Email</small><a href="mailto:{EMAIL}">{EMAIL}</a></div></li>
  <li><span class="ic">{I['clock']}</span><div><small>Horario</small><strong>Lunes a viernes · 07:00 – 15:00</strong></div></li>
</ul>"""


def service_form(service, topic, options, title="Cuéntanos tu proyecto", sub="Respuesta en menos de 24 h laborables. Sin compromiso."):
    return f"""<section class="section section--ink" id="presupuesto">
  <div class="container form-wrap">
    <div class="reveal">
      <span class="eyebrow">Presupuesto · {service}</span>
      <h2>{title}</h2>
      <p class="lead mt-2">{sub}</p>
      {contact_list()}
    </div>
    <div class="form-card reveal" data-delay="1" data-form-wrap>
      <form class="form-body" data-lead="{escape(topic)}" novalidate>
        <input type="hidden" name="servicio" value="{escape(service)}">
        <div class="form-grid">
          <fieldset class="pills full">{legend("¿Qué necesitas?", True)}{pills("interes", options, True)}</fieldset>
          <div class="field"><label for="n-{topic}">Nombre <span class="req">*</span></label><input class="input" id="n-{topic}" name="nombre" autocomplete="name" required placeholder="Tu nombre"></div>
          <div class="field"><label for="t-{topic}">Teléfono <span class="req">*</span></label>{tel_input("t-" + topic)}</div>
          <div class="field"><label for="e-{topic}">Email</label><input class="input" id="e-{topic}" name="email" type="email" autocomplete="email" placeholder="tu@email.com"></div>
          <div class="field"><label for="v-{topic}">Vehículo</label><input class="input" id="v-{topic}" name="vehiculo" placeholder="Marca, modelo y año"></div>
          <div class="field full"><label for="m-{topic}">Tu proyecto</label><textarea class="textarea" id="m-{topic}" name="mensaje" placeholder="Cuéntanos qué tienes en mente, objetivos, plazos…"></textarea></div>
          {consent()}
        </div>
        <div class="form-foot mt-2">
          <button class="btn" type="submit">Quiero mi presupuesto {I['arrow']}</button>
          <small>🔒 Tus datos solo los ve el equipo de Deyscom.</small>
        </div>
        <div class="form-msg" role="alert"></div>
      </form>
      {success_block()}
    </div>
  </div>
</section>
"""


def split(eyebrow, title, body_html, label, img, tag, rev=False, x="60%"):
    return f"""<div class="split{" split--rev" if rev else ""}">
  <div class="reveal">
    <span class="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    <div class="mt-2">{body_html}</div>
  </div>
  <div class="split__media reveal" data-delay="1">{art(label, x, "35%", img, tag)}<span class="split__tag">{tag}</span></div>
</div>"""


def feature_list(items):
    return '<ul class="feature-list">' + "".join(
        f'<li><span class="ix">{i + 1:02d}</span><div><b>{t}</b><span>{d}</span></div></li>' for i, (t, d) in enumerate(items)
    ) + "</ul>"


def social_wall():
    cls = {"instagram": "ig", "tiktok": "tt", "youtube": "yt", "facebook": "fb"}
    tiles = "".join(
        f'<a class="social-tile social-tile--{cls[k]} reveal" data-delay="{i % 4}" data-social="{k}" href="#">'
        f'{I[k]}<div><b>{n}</b><span>{h} · {d}</span></div></a>'
        for i, (k, n, h, d) in enumerate(SOCIAL[:4])
    )
    return f"""<section class="section">
  <div class="container">
    <div class="section__head">
      <div class="reveal"><span class="eyebrow">Síguenos en pista</span><h2>Vive el taller <span class="outline">en directo</span></h2></div>
      <p class="lead muted reveal" data-delay="1">Montajes, arranques, carreras y proyectos de principio a fin. Si te gusta el olor a gasolina y el sonido de un escape, te va a encantar.</p>
    </div>
    <div class="social-wall">{tiles}</div>
  </div>
</section>
"""


def section_head(eyebrow, title, text="", pink=False):
    t = f'<p class="lead {"" if pink else "muted "}reveal" data-delay="1">{text}</p>' if text else ""
    return f'<div class="section__head"><div class="reveal"><span class="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{t}</div>'


# ------------------------------------------------------------------ páginas de servicio
SERVICES = {
    "competicion": dict(
        title="Preparación de coches de competición en Madrid · Rally, Slalom y Circuito | Deyscom Motorsport",
        desc="Preparamos, mantenemos y asistimos coches de competición de rally, slalom, montaña y circuito en Torrelaguna (Madrid): jaulas de seguridad, set-up, asistencia en carrera y alquiler.",
        keywords="preparación coches competición Madrid, taller rally Madrid, jaula de seguridad, asistencia rally, alquiler coche rally, slalom, Torrelaguna",
        topic="coches de competición", name="Coches de competición",
        eyebrow="Coches de competición",
        lines=["Nacidos", "<span class='pink'>para</span>", "<span class='outline'>competir</span>"],
        lead="Rally, slalom, montaña o circuito: preparamos tu coche desde la carrocería desnuda hasta la línea de salida y te acompañamos tramo a tramo.",
        number="01", hero="mitsubishi-lancer-evo-rally-taller-deyscom",
        chips=["Rally · Slalom · Circuito", "Asistencia en carrera", "Alquiler de coches de competición"],
        ticker=["Preparación integral", "Jaulas de seguridad", "Set-up", "Asistencia", "Mantenimiento", "Alquiler"],
        intro=("Del garaje al podio", "Un coche de carreras <span class='pink'>no se compra</span>, se construye",
               "<p class='lead'>Cada preparación empieza con una conversación: qué campeonato, qué reglamento, qué presupuesto y qué piloto. A partir de ahí diseñamos el coche contigo, pieza a pieza.</p>"
               + feature_list([
                   ("Proyecto a medida", "Planificación por fases para ajustarnos al reglamento y a tu presupuesto."),
                   ("Seguridad primero", "Jaulas de seguridad, baquets, arneses, extinción y cortacorrientes."),
                   ("Puesta a punto", "Geometría, reglajes de suspensión y set-up según superficie."),
               ]), "RACE", "jaula-seguridad-multipunto-coche-competicion", "Race ready"),
        cards=[
            ("flag", "Preparación integral", "Construcción de coches de rally, slalom, montaña y circuito desde cero o a partir de tu base."),
            ("shield", "Seguridad", "Montaje de jaulas, baquets, arneses, extintores y cortacorrientes según reglamento."),
            ("gauge", "Set-up y reglajes", "Alturas, geometrías, amortiguación y diferenciales afinados para cada tramo."),
            ("wrench", "Mantenimiento entre pruebas", "Revisiones, desmontajes y reconstrucciones para salir siempre al 100%."),
            ("truck", "Asistencia en carrera", "Nuestro equipo contigo en el parque de asistencia, en cada tramo."),
            ("key", "Alquiler de coches", "¿Quieres correr sin coche propio? Te alquilamos uno listo para competir."),
        ],
        steps=[("Briefing", "Campeonato, reglamento, objetivos y presupuesto."), ("Diseño", "Plan de preparación por fases y lista de piezas."),
               ("Construcción", "Taller, montaje y pruebas."), ("Carrera", "Asistencia, datos y mantenimiento entre pruebas.")],
        gallery=[("baquet-sparco-arneses-jaula-competicion", "Baquet y arneses"), ("soldadura-jaula-seguridad-competicion", "Soldadura de jaula"),
                 ("plano-jaula-seguridad-diseno-competicion", "Diseño de la jaula"), ("volante-interior-coche-competicion", "Puesto de pilotaje"),
                 ("extintor-baquet-sparco-coche-competicion", "Seguridad homologada"), ("jaula-seguridad-soldada-preparacion-rally", "Jaula soldada"),
                 ("renault-clio-competicion-taller-deyscom", "Renault Clio de competición"), ("mecanicos-deyscom-box-resistencia", "Box en carrera de resistencia")],
        word="RALLY",
        faq=[
            ("¿Preparáis coches para cualquier campeonato?", "Trabajamos rally, slalom, montaña y circuito. En el briefing revisamos el reglamento de tu campeonato y planteamos la preparación para cumplirlo."),
            ("¿Puedo alquilar un coche de competición?", "Sí. Tenemos alquiler de coches de competición y, si es tu primera vez, nuestras experiencias DS Pilot Weekend son la mejor forma de empezar."),
            ("¿Ofrecéis asistencia durante la carrera?", "Sí, podemos acompañarte en el parque de asistencia con equipo y material para resolver cualquier incidencia."),
            ("¿Puedo hacer la preparación por fases?", "Claro. Muchos pilotos empiezan por seguridad y fiabilidad y evolucionan el coche temporada a temporada."),
        ],
        form_opts=["Preparar mi coche", "Mantenimiento", "Asistencia en carrera", "Alquilar un coche", "Otro"],
        mega="Tu próxima <span class='outline'>salida</span> empieza aquí",
    ),
    "restomod": dict(
        title="Restomod y restauración de clásicos en Madrid | Deyscom Motorsport",
        desc="Restomod y restauración de clásicos y todoterrenos en Madrid: chasis, mecánica moderna, frenos, suspensión, interior y pintura. Proyectos únicos hechos a mano en Torrelaguna.",
        keywords="restomod Madrid, restauración coches clásicos Madrid, restauración Land Rover Defender, BMW E30 restomod, restauración todoterreno",
        topic="un proyecto restomod", name="Restomod",
        eyebrow="Restomod",
        lines=["El alma", "de un <span class='pink'>clásico</span>", "<span class='outline'>el pulso de hoy</span>"],
        lead="Respetamos la esencia del coche que siempre soñaste y le damos la mecánica, la seguridad y la fiabilidad de un coche moderno. Uno solo. El tuyo.",
        number="02", hero="bmw-e30-clasicos-restomod-deyscom",
        chips=["Clásicos, youngtimers y 4x4", "Proyectos 100% a medida", "Seguimiento con fotos y vídeo"],
        ticker=["Restauración", "Chasis", "Mecánica moderna", "Frenos", "Interior a medida", "Pintura"],
        intro=("Lo mejor de dos épocas", "Ni original, ni moderno: <span class='pink'>único</span>",
               "<p class='lead'>Un restomod no es solo restaurar. Es decidir contigo qué conservar, qué mejorar y cómo quieres que se sienta al volante.</p>"
               + feature_list([
                   ("Diagnóstico de la base", "Revisamos chasis, carrocería y mecánica antes de empezar."),
                   ("Diseño del proyecto", "Definimos estética, prestaciones y presupuesto por fases."),
                   ("Diario de obra", "Te enviamos fotos y vídeos del proceso para que vivas cada avance."),
               ]), "CLASSIC", "todoterreno-chasis-restauracion-completa", "Hecho a mano", True, "35%"),
        cards=[
            ("layers", "Restauración de chasis", "Saneado, tratamiento anticorrosión y refuerzos donde hace falta."),
            ("bolt", "Mecánica actualizada", "Motores, inyección y transmisiones modernas o reconstrucción del original."),
            ("disc", "Frenos y suspensión", "Que frene y gire como un coche actual sin perder su carácter."),
            ("cpu", "Electricidad y electrónica", "Cableado nuevo, iluminación, instrumentación y confort."),
            ("star", "Interior a medida", "Asientos, volante, tapicería y detalles hechos a tu gusto."),
            ("spray", "Pintura y acabados", "Color original o personalizado con acabado de exposición."),
        ],
        steps=[("Idea", "Nos cuentas el coche y el sueño. Si aún no lo tienes, te ayudamos a buscarlo."), ("Proyecto", "Diseño, presupuesto por fases y calendario."),
               ("Taller", "Desmontaje, chapa, mecánica, pintura y montaje."), ("Entrega", "Rodaje, ajustes finales y entrega de tu coche.")],
        gallery=[("eje-trasero-suspension-restauracion-4x4", "Eje y suspensión 4x4"), ("land-rover-defender-restomod-deyscom", "Land Rover Defender"),
                 ("bmw-e30-restauracion-elevador-taller", "BMW E30 en restauración"), ("pickup-clasico-restauracion-taller", "Pick-up clásico"),
                 ("jeep-wrangler-preparacion-offroad-deyscom", "Jeep Wrangler"), ("restomod-todoterreno-clasico-taller-deyscom", "4x4 clásico en obra"),
                 ("land-rover-defender-restomod-verde", "Defender terminado"), ("chasis-tubular-buggy-preparacion", "Chasis tubular")],
        word="RESTO",
        faq=[
            ("¿Con qué coches trabajáis?", "Clásicos, youngtimers y todoterrenos de todo tipo: BMW, Land Rover, Nissan Patrol… Cuéntanos el modelo y valoramos el proyecto sin compromiso."),
            ("¿Cuánto cuesta un restomod?", "Depende del estado de la base y del nivel de modificación. Por eso trabajamos por fases y con presupuesto cerrado para cada una."),
            ("¿Cuánto tarda?", "Un restomod completo suele llevar meses. Te damos un calendario realista desde el principio y te enviamos avances."),
            ("¿Me ayudáis a encontrar el coche base?", "Sí, podemos asesorarte en la compra y revisar el coche antes de que lo compres."),
        ],
        form_opts=["Restomod completo", "Restauración", "Actualizar mecánica", "Busco coche base", "Otro"],
        mega="Hagamos tu <span class='outline'>clásico</span> eterno",
    ),
    "pintura": dict(
        title="Taller de pintura y chapa en Madrid · Cabina y decoraciones racing | Deyscom Motorsport",
        desc="Pintura completa y parcial en cabina, chapa, colores especiales, pintura de chasis y decoraciones de competición en Torrelaguna (Madrid). Acabados de exposición.",
        keywords="taller pintura coches Madrid, cabina de pintura, pintura chasis, decoración coche rally, chapa y pintura Torrelaguna",
        topic="pintura", name="Pintura",
        eyebrow="Pintura",
        lines=["Color", "<span class='pink'>que se</span>", "<span class='outline'>escucha</span>"],
        lead="Chapa, pintura en cabina y decoraciones con acabado de exposición. Desde un chasis completo hasta un cambio de color o una decoración de competición que no pase desapercibida.",
        number="03", hero="cabina-pintura-chasis-rosa",
        chips=["Pintura en cabina", "Chasis y piezas", "Decoraciones de competición"],
        ticker=["Chapa", "Pintura completa", "Chasis", "Colores especiales", "Decoraciones", "Pulido"],
        intro=("Obsesión por el detalle", "La primera impresión <span class='pink'>se pinta</span>",
               "<p class='lead'>Preparamos cada superficie como si fuera a un concurso. Porque la pintura no solo se ve: protege y define el carácter del coche.</p>"
               + feature_list([
                   ("Preparación impecable", "Desmontaje, chapa, aparejo y lijado antes de un solo gramo de color."),
                   ("Color a tu medida", "Originales de fábrica, colores especiales y combinaciones bitono."),
                   ("Decoración racing", "Diseñamos y aplicamos la decoración de tu coche de competición."),
               ]), "PAINT", "subchasis-pintado-rosa-deyscom", "Rosa Deyscom"),
        cards=[
            ("spray", "Pintura completa", "Cambio de color o restauración del original con desmontaje de piezas."),
            ("layers", "Chasis y subchasis", "Pintura de chasis, subchasis, brazos y piezas mecánicas en cabina."),
            ("wrench", "Chapa y reparación", "Golpes, óxido y reparaciones estructurales hechas como deben."),
            ("star", "Colores especiales", "Perlados, mates, tricapa y tonos a medida."),
            ("flag", "Decoraciones de competición", "Diseño y aplicación de decoraciones para rally, slalom y circuito."),
            ("eye", "Pulido y protección", "Corrección de pintura y protección para que dure."),
        ],
        steps=[("Valoración", "Vemos el coche y el acabado que buscas."), ("Preparación", "Desmontaje, chapa, aparejo y lijado."),
               ("Pintura", "Color, barniz y secado en cabina."), ("Acabado", "Pulido, montaje y control de calidad.")],
        gallery=[("cabina-pintura-subchasis-rosa-deyscom", "Subchasis en cabina"), ("nissan-patrol-restaurado-pintura-verde", "Nissan Patrol terminado"),
                 ("piezas-pintadas-rosa-cabina-pintura", "Piezas en rosa"), ("bmw-e36-rotulado-deyscom-motorsport", "Rotulación Deyscom"),
                 ("bmw-e36-competicion-decoracion-rosa", "Decoración de competición")],
        word="COLOR",
        faq=[
            ("¿Pintáis solo una pieza o el coche entero?", "Ambas cosas: desde un paragolpes o un subchasis hasta pintura completa con cambio de color."),
            ("¿Hacéis decoraciones de competición?", "Sí. Te ayudamos a diseñar la decoración y la aplicamos en pintura o vinilo, según lo que mejor encaje."),
            ("¿Cuánto tarda una pintura completa?", "Depende del estado de la chapa y del desmontaje necesario. Tras ver el coche te damos un plazo concreto."),
            ("¿Igualáis el color original?", "Sí, trabajamos con el código de color del fabricante y ajustamos el tono para que la pieza no se distinga."),
        ],
        form_opts=["Pintura completa", "Pieza o reparación", "Chasis / mecánica", "Decoración competición", "Otro"],
        mega="Dale a tu coche <span class='outline'>el color</span> que merece",
    ),
    "banco-de-potencia": dict(
        title="Banco de potencia en Madrid · Medición de CV, par y puesta a punto | Deyscom Motorsport",
        desc="Banco de potencia en Torrelaguna (Madrid): mide los CV y el par reales de tu coche, diagnostica pérdidas, compara antes y después de cada modificación y afina tu coche de calle o competición.",
        keywords="banco de potencia Madrid, medir CV coche, banco de rodillos, prueba de potencia, curva de par, puesta a punto banco, dyno Madrid",
        topic="el banco de potencia", name="Banco de potencia",
        eyebrow="Banco de potencia",
        lines=["Los números", "<span class='pink'>no</span>", "<span class='outline'>mienten</span>"],
        lead="Descubre cuántos caballos y cuánto par tiene de verdad tu coche. Medimos, diagnosticamos y afinamos con datos reales, sin suposiciones.",
        number="04", hero="motor-caja-cambios-desmontado-taller",
        chips=["Potencia y par reales", "Antes / después", "Coches de calle y competición"],
        ticker=["Potencia", "Par motor", "Curvas", "Diagnóstico", "Puesta a punto", "Antes / después"],
        intro=("Datos, no sensaciones", "¿Cuántos CV tiene <span class='pink'>de verdad</span> tu coche?",
               "<p class='lead'>El banco de potencia es la herramienta que convierte sensaciones en datos. Sabrás exactamente cómo rinde tu motor y qué ha aportado cada modificación.</p>"
               + feature_list([
                   ("Medición real", "Potencia y par en todo el rango de revoluciones, con su curva completa."),
                   ("Diagnóstico", "Detectamos pérdidas de potencia, fallos de mezcla o encendido y problemas de transmisión."),
                   ("Informe", "Te llevas tus gráficas para comparar en el futuro."),
               ]), "DYNO", "banco-de-potencia-curva-potencia-par", "Curva real", True, "40%"),
        cards=[
            ("gauge", "Medición de potencia", "CV y par reales de tu coche, medidos en banco y con su curva completa."),
            ("chart", "Antes y después", "Mide antes y después de cada modificación para ver qué ha aportado."),
            ("cpu", "Puesta a punto", "Ajuste del coche en banco para sacar el máximo rendimiento con fiabilidad."),
            ("eye", "Diagnóstico", "Encuentra pérdidas de potencia, tirones o fallos que no se ven en carretera."),
            ("flag", "Competición", "Verificación de la preparación antes de la temporada o de una prueba."),
            ("wind", "Admisión, escape y mecánica", "Te asesoramos sobre qué mejorar según los datos del banco."),
        ],
        steps=[("Revisión", "Comprobamos el coche y lo dejamos listo para medir con seguridad."), ("Medición", "Varias pasadas para obtener potencia y par fiables."),
               ("Análisis", "Revisamos las curvas contigo y detectamos qué se puede mejorar."), ("Informe", "Te llevas tus gráficas y nuestras recomendaciones.")],
        gallery=[("banco-de-potencia-medicion-deyscom", "Sala del banco de potencia"), ("motor-competicion-detalle-admision", "Admisión"),
                 ("caja-cambios-competicion-preparacion", "Transmisión"), ("colector-escape-motor-competicion", "Colector de escape"),
                 ("latiguillos-freno-competicion-detalle", "Frenos"), ("motor-admision-deyscom-peugeot-206", "Motor Deyscom"),
                 ("radiador-intercooler-preparacion-motor", "Refrigeración"), ("soporte-motor-poliuretano-competicion", "Soportes de poliuretano")],
        word="POWER",
        faq=[
            ("¿Qué coches podéis medir en el banco?", "Coches de calle, preparados y de competición. Escríbenos con el modelo y la tracción y te confirmamos disponibilidad y precio."),
            ("¿Cuánto dura una sesión?", "Una medición suele llevar poco tiempo, aunque depende del coche y de si hacemos diagnóstico o puesta a punto. Te lo concretamos al reservar."),
            ("¿Es seguro para el motor?", "Sí. Antes de medir revisamos niveles, estado del coche y fijaciones, y la medición se hace con el coche bien sujeto y refrigerado."),
            ("¿Me dais las gráficas?", "Sí, te llevas las curvas de potencia y par para que puedas comparar después de futuras modificaciones."),
        ],
        form_opts=["Medir potencia", "Antes / después de modificar", "Diagnóstico", "Puesta a punto", "Otro"],
        mega="¿Cuántos <span class='outline'>caballos</span> tienes?",
    ),
}


def service_page(slug):
    s = SERVICES[slug]
    e, t, body, label, img, tag, *rest = s["intro"]
    rev = rest[0] if rest else False
    x = rest[1] if len(rest) > 1 else "60%"
    extra = ""
    if slug == "pintura":
        extra = f"""<section class="section section--tight">
  <div class="container">
    {section_head("Proceso real", "De la cabina <span class='outline'>a la calle</span>", "Arrastra el control (o desliza con el dedo) para ver el Nissan Patrol en la cabina de pintura y terminado.")}
    <div class="ba reveal">
      <div class="ba__layer ba__before">{art("CABINA", "30%", "40%", "nissan-patrol-cabina-pintura-verde", "", "100vw")}</div>
      <div class="ba__layer ba__after">{art("FINAL", "70%", "40%", "nissan-patrol-pintura-verde-terminado", "", "100vw")}</div>
      <span class="ba__lbl ba__lbl--l">En cabina</span><span class="ba__lbl ba__lbl--r">Terminado</span>
      <div class="ba__handle"></div>
      <span class="ba__hint" aria-hidden="true">Arrastra para comparar</span>
      <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Comparador: arrastra o usa las flechas para ver el Nissan Patrol en cabina y terminado">
    </div>
  </div>
</section>"""
    service_ld = {"@context": "https://schema.org", "@type": "Service", "name": s["name"], "serviceType": s["name"],
                  "description": s["desc"], "provider": {"@id": SITE + "/#organizacion"}, "areaServed": "ES",
                  "image": img_url(s["hero"]), "url": f"{SITE}/{slug}.html"}
    html = head(s["title"], s["desc"], slug, s["topic"], s["hero"],
                [service_ld, breadcrumbs_ld(slug, s["name"]), faq_ld(s["faq"])], s["keywords"]) + header(slug)
    html += hero(s["eyebrow"], s["lines"], s["lead"], s["number"], s["hero"], s["chips"], s["topic"])
    html += ticker(s["ticker"])
    html += f'<section class="section"><div class="container">{split(e, t, body, label, img, tag, rev, x)}</div></section>'
    html += f"""<section class="section section--ink">
  <div class="container">
    {section_head("Qué hacemos", "Todo lo que <span class='outline'>necesitas</span>", "Un solo taller para todo el proyecto. Sin intermediarios, sin sorpresas y con trato directo con quien trabaja en tu coche.")}
    {cards(s["cards"])}
  </div>
</section>
<section class="section section--pink">
  <div class="container">
    {section_head("Cómo trabajamos", "De la idea <span class='outline'>a la meta</span>", "Proceso claro, presupuesto cerrado y comunicación constante.", True)}
    <div class="process">{process(s["steps"])}</div>
  </div>
</section>
{extra}
<section class="section">
  <div class="container">
    {section_head("Trabajos reales", "Desde <span class='outline'>el taller</span>", "Más proyectos cada semana en nuestro <a class='pink' data-social='instagram' href='#'>Instagram</a> y <a class='pink' data-social='tiktok' href='#'>TikTok</a>.")}
    {gallery(s["gallery"], s["word"])}
  </div>
</section>
{service_form(s["eyebrow"], slug, s["form_opts"])}
<section class="section">
  <div class="container">
    {section_head("Preguntas frecuentes", "Lo que <span class='outline'>nos preguntáis</span>")}
    {faq(s["faq"])}
  </div>
</section>
{mega_cta(s["mega"], "Escríbenos hoy y te respondemos en menos de 24 h laborables.", s["topic"])}
"""
    return html + footer()


# ------------------------------------------------------------------ experiencias y cursos
CARS = {
    "Peugeot 206 1.6 XS": dict(power="118 CV", img="peugeot-206-1-6-xs-rally-deyscom-motorsport",
                               specs=["1.6 gasolina", "118 CV", "Tracción delantera"],
                               desc="Ligero, ágil y noble. El coche perfecto para aprender a pilotar rápido y con confianza."),
    "BMW E36": dict(power="135 CV", img="bmw-e36-rally-el-molar-deyscom",
                    specs=["135 CV", "Propulsión trasera", "Preparado Deyscom"],
                    desc="Propulsión trasera y carácter puro. Para quien quiere sentir el coche moverse bajo sus manos."),
}

EXPERIENCES = {
    "ds-pilot-weekend-circuit": dict(
        name="DS Pilot Weekend – Circuit", short="Circuit", tag="Circuito del Jarama",
        title="DS Pilot Weekend Circuit · Fin de semana de piloto en el Circuito del Jarama | Deyscom Motorsport",
        desc="Vive un fin de semana como piloto en el Circuito del Jarama con Deyscom Motorsport: coche de competición, equipo técnico, briefing y tandas en pista. Reserva tu plaza.",
        keywords="experiencia piloto Jarama, conducir coche competición circuito, regalo experiencia circuito Madrid, curso pilotaje Jarama, DS Pilot Weekend",
        hero="bmw-e36-atardecer-circuito-competicion", card="bmw-e36-competicion-circuito-curva",
        lines=["Piloto", "<span class='pink'>por un</span>", "<span class='outline'>fin de semana</span>"],
        lead="Un fin de semana completo viviendo el Circuito del Jarama como un piloto más: paddock, briefing, coche de competición y pista.",
        teaser="Un fin de semana como piloto en el Circuito del Jarama.",
        chips=["Circuito del Jarama", "Fin de semana completo", "Coche de competición"],
        story=("La experiencia", "Del paddock <span class='pink'>a la recta</span> del Jarama",
               "<p class='lead'>El Jarama es historia viva del motor en España. Durante un fin de semana serás parte de nuestro equipo: llegarás al paddock, te equiparás, escucharás el briefing y saldrás a pista con un coche de competición preparado por Deyscom.</p>"
               "<p class='muted'>Nuestro equipo te acompaña en todo momento: te explicamos la trazada, las referencias de frenada y cómo sacar lo mejor del coche, tanda a tanda, para que vuelvas a casa con la sensación de haber sido piloto de verdad.</p>"),
        program=[("Sábado · Paddock", "Bienvenida, equipación, briefing técnico y de seguridad y primeras tandas para conocer el coche y el trazado."),
                 ("Sábado · Pista", "Tandas con explicaciones de trazada, frenada y referencias. Feedback de nuestro equipo entre tandas."),
                 ("Domingo · Ritmo", "Más tandas para encadenar vueltas y ganar confianza y ritmo."),
                 ("Domingo · Cierre", "Análisis de tu fin de semana con el equipo y foto en el paddock.")],
        includes=["Fin de semana completo en el Circuito del Jarama", "Coche de competición preparado por Deyscom", "Briefing técnico y de seguridad",
                  "Acompañamiento de nuestro equipo en pista y paddock", "Asistencia mecánica durante todo el fin de semana"],
        cars=None,
        faq=[("¿Necesito experiencia previa?", "No. Adaptamos el fin de semana a tu nivel; solo necesitas carnet de conducir y muchas ganas."),
             ("¿Dónde es?", "En el Circuito del Jarama (San Sebastián de los Reyes, Madrid), a unos 40 minutos de nuestro taller."),
             ("¿Puedo regalarlo?", "Sí, es un regalo perfecto para cualquier apasionado del motor. Escríbenos y te preparamos la reserva a su nombre."),
             ("¿Cuándo son las próximas fechas?", "Las fechas dependen del calendario del circuito. Reserva tu plaza y te confirmamos la próxima edición disponible.")],
    ),
    "ds-pilot-weekend-rally": dict(
        name="DS Pilot Weekend – Rally", short="Rally", tag="Rally federado",
        title="DS Pilot Weekend Rally · Corre un rally federado con Peugeot 206 o BMW E36 | Deyscom Motorsport",
        desc="Apúntate a un rally federado con Deyscom Motorsport y conduce nuestro Peugeot 206 1.6 XS de 118 CV o el BMW E36 de 135 CV. Coche, asistencia y equipo incluidos.",
        keywords="correr un rally, alquiler coche rally, rally federado experiencia, Peugeot 206 rally alquiler, BMW E36 rally, DS Pilot Weekend",
        hero="peugeot-206-rally-tierra-deyscom-motorsport", card="peugeot-206-rally-el-molar-tramo",
        lines=["Tu primer", "<span class='pink'>rally</span>", "<span class='outline'>de verdad</span>"],
        lead="Apúntate a un rally federado y vive la experiencia completa al volante de nuestro Peugeot 206 1.6 XS de 118 CV o del BMW E36 de 135 CV.",
        teaser="Corre un rally federado con nuestro 206 o nuestro BMW E36.",
        chips=["Rally federado", "Peugeot 206 · 118 CV", "BMW E36 · 135 CV"],
        story=("La experiencia", "Tramos, asistencia <span class='pink'>y adrenalina</span>",
               "<p class='lead'>No es una tanda ni una exhibición: es un rally federado de verdad. Verificaciones, parque de asistencia, tramos cronometrados y la emoción de cruzar la meta.</p>"
               "<p class='muted'>Nosotros ponemos el coche preparado, el equipo y la asistencia; tú pones las ganas. Te acompañamos con la inscripción y los trámites para que solo tengas que pensar en conducir.</p>"),
        program=[("Antes del rally", "Te ayudamos con la inscripción y la licencia, y preparamos el coche que elijas."),
                 ("Sábado · Verificaciones", "Verificaciones administrativas y técnicas, briefing y reconocimiento."),
                 ("Día de carrera", "Tramos cronometrados con nuestro equipo de asistencia en cada reagrupamiento."),
                 ("Meta", "Podio final, fotos y la sensación de haber corrido un rally de verdad.")],
        includes=["Inscripción en un rally federado (gestión con nuestro equipo)", "Peugeot 206 1.6 XS (118 CV) o BMW E36 (135 CV) preparado",
                  "Asistencia mecánica durante todo el rally", "Briefing y acompañamiento del equipo Deyscom", "Ayuda con la licencia federativa"],
        cars=["Peugeot 206 1.6 XS", "BMW E36"],
        faq=[("¿Necesito licencia?", "Para competir en un rally federado necesitas licencia federativa. Te ayudamos a tramitarla antes de la prueba."),
             ("¿Y el copiloto?", "En rally se corre con copiloto. Puedes traer el tuyo o consultarnos. Y si quieres formarte como copiloto, tienes nuestro DS Copilot Course."),
             ("¿Qué coche me recomendáis?", "El Peugeot 206 es ideal para empezar por su nobleza; el BMW E36, de propulsión, es para quien busca sensaciones más intensas."),
             ("¿Qué pasa si hay daños en el coche?", "Te explicamos las condiciones de uso y la fianza antes de reservar, para que todo esté claro desde el principio.")],
    ),
    "ds-pilot-weekend-slalom": dict(
        name="DS Pilot Weekend – Slalom", short="Slalom", tag="Slalom",
        title="DS Pilot Weekend Slalom · Experiencia de slalom con Peugeot 206 o BMW E36 | Deyscom Motorsport",
        desc="Vive una experiencia única de slalom con Deyscom Motorsport al volante del Peugeot 206 1.6 XS de 118 CV o el BMW E36 de 135 CV. Precisión, conos y cronómetro.",
        keywords="experiencia slalom, slalom coche Madrid, alquiler coche slalom, conducir Peugeot 206 competición, BMW E36 slalom, DS Pilot Weekend",
        hero="bmw-e36-rally-el-molar-deyscom", card="peugeot-206-rally-comunidad-madrid-montana",
        lines=["Precisión", "<span class='pink'>contra el</span>", "<span class='outline'>cronómetro</span>"],
        lead="Conos, cronómetro y un coche de competición. Vive una experiencia única de slalom con nuestro Peugeot 206 1.6 XS de 118 CV o el BMW E36 de 135 CV.",
        teaser="Conos, cronómetro y una experiencia única al volante.",
        chips=["Slalom", "Peugeot 206 · 118 CV", "BMW E36 · 135 CV"],
        story=("La experiencia", "Cada décima <span class='pink'>cuenta</span>",
               "<p class='lead'>El slalom es la puerta de entrada perfecta a la competición: un recorrido marcado con conos, el cronómetro en marcha y tú buscando la trazada perfecta.</p>"
               "<p class='muted'>Es técnico, divertido y muy seguro. Nuestro equipo te enseña a mirar lejos, a frenar en el punto justo y a mover el coche con precisión, manga a manga.</p>"),
        program=[("Briefing", "Presentación del recorrido, normas de seguridad y explicación del coche."),
                 ("Reconocimiento", "Recorrido a pie y primeras vueltas para memorizar el trazado."),
                 ("Mangas cronometradas", "Varias mangas con feedback de nuestro equipo entre cada una."),
                 ("Resultados", "Tus tiempos, tu evolución y foto con el coche.")],
        includes=["Peugeot 206 1.6 XS (118 CV) o BMW E36 (135 CV) preparado", "Briefing técnico y de seguridad", "Mangas cronometradas",
                  "Acompañamiento y consejos del equipo Deyscom", "Asistencia mecánica"],
        cars=["Peugeot 206 1.6 XS", "BMW E36"],
        faq=[("¿Necesito experiencia?", "No. El slalom es ideal para empezar: es técnico, seguro y se aprende muchísimo en poco tiempo."),
             ("¿Necesito licencia?", "Depende de si la prueba es federada o una jornada privada. Te lo indicamos al confirmar la fecha y te ayudamos con lo necesario."),
             ("¿Puedo venir acompañado?", "Sí, tus acompañantes pueden venir a verte y vivir el ambiente."),
             ("¿Puedo regalarlo?", "Sí, es un regalo perfecto. Escríbenos y preparamos la reserva a nombre de quien quieras.")],
    ),
}

COURSE = dict(
    slug="ds-copilot-course", name="DS Copilot Course",
    title="DS Copilot Course · Curso de copiloto de rally con certificación y diploma | Deyscom Motorsport",
    desc="Curso de copiloto de rally de fin de semana completo con certificación y diploma: teoría y práctica con un profesor y una profesora, y horas prácticas en un tramo cerrado en Guadalajara en exclusiva.",
    keywords="curso copiloto rally, curso de copiloto Madrid, formación copiloto rally Guadalajara, notas de rally, libro de ruta, curso copiloto certificado, DS Copilot Course",
    hero="piloto-copiloto-rally-interior-coche-competicion",
)


def cars_block(names):
    out = ""
    for i, n in enumerate(names):
        c = CARS[n]
        specs = "".join(f"<li>{x}</li>" for x in c["specs"])
        out += (f'<label class="carpick reveal" data-delay="{i}"><input type="radio" name="coche" value="{n}" form="reserva-form"{" checked" if i == 0 else ""}>'
                f'<span class="carpick__box"><span class="carpick__media">{art(n.split()[0].upper(), "60%", "30%", c["img"], n, "(max-width: 760px) 100vw, 50vw")}</span>'
                f'<span class="carpick__body"><span class="carpick__power">{c["power"]}</span><b>{n}</b><span class="muted">{c["desc"]}</span><ul class="car__specs">{specs}</ul>'
                f'<span class="carpick__sel">{I["check"]} Elegido</span></span></span></label>')
    return f'<div class="carpicks">{out}</div>'


def booking_box(slug, name, kind="experience"):
    """Caja lateral de compra/reserva (sticky)."""
    is_course = kind == "course"
    bullets = ([("award", "Certificación y diploma"), ("cal", "Fin de semana completo"), ("users", "Profesor y profesora"), ("map", "Tramo cerrado en Guadalajara")]
               if is_course else [("cal", "Fin de semana"), ("shield", "Seguridad y briefing"), ("wrench", "Asistencia Deyscom"), ("users", "Plazas limitadas")])
    li = "".join(f"<li>{I[ic]} {t}</li>" for ic, t in bullets)
    return f"""<aside class="buybox reveal">
  <span class="buybox__tag">{"Curso" if is_course else "Experiencia"}</span>
  <h3>{name}</h3>
  <div class="buybox__price"><small>Precio</small><span>{price_html(slug)}</span></div>
  <ul class="buybox__list">{li}</ul>
  <a class="btn btn--block" data-buy="{slug}" href="#reserva">{I['ticket']} {"Comprar mi plaza" if is_course else "Reservar plaza"}</a>
  <a class="btn btn--wa btn--block mt-1" data-wa="{escape(name)}" data-loc="buybox" href="#">{I['wa']} Preguntar por WhatsApp</a>
  <p class="buybox__note">Plazas limitadas por edición. Te confirmamos fecha y disponibilidad en menos de 24 h laborables.</p>
</aside>"""


def booking_form(slug, name, cars=None, kind="experience"):
    car_field = ""
    if cars:
        car_field = f'<p class="full muted" style="margin:0">Coche elegido arriba (puedes cambiarlo).</p>'
    level = ["Nunca he competido", "Tandas / track days", "Ya he competido"] if kind == "experience" else ["Ninguna", "He hecho algún rally", "Soy piloto"]
    extra = ""
    if kind == "experience" and cars:
        extra = f'<fieldset class="pills full">{legend("¿Tienes licencia federativa?")}{pills("licencia", ["Sí", "No", "No lo sé"])}</fieldset>'
    if kind == "course":
        extra = f'<div class="field"><label for="r-plazas">Plazas</label><select class="select input" id="r-plazas" name="plazas"><option>1</option><option>2</option><option>3</option><option>4</option></select></div>'
    return f"""<section class="section section--ink" id="reserva">
  <div class="container form-wrap">
    <div class="reveal">
      <span class="eyebrow">{"Compra tu plaza" if kind == "course" else "Reserva"}</span>
      <h2>{"Asegura <span class='outline'>tu plaza</span>" if kind == "course" else "Reserva <span class='outline'>tu fin de semana</span>"}</h2>
      <p class="lead mt-2">Déjanos tus datos y te confirmamos la próxima fecha disponible, el precio final y la forma de pago. Sin compromiso hasta que confirmes.</p>
      {contact_list()}
    </div>
    <div class="form-card reveal" data-delay="1" data-form-wrap>
      <form class="form-body" id="reserva-form" data-lead="{slug}" novalidate>
        <input type="hidden" name="servicio" value="{escape(name)}">
        <div class="form-grid">
          {car_field}
          <div class="field"><label for="r-n">Nombre <span class="req">*</span></label><input class="input" id="r-n" name="nombre" autocomplete="name" required placeholder="Tu nombre"></div>
          <div class="field"><label for="r-t">Teléfono <span class="req">*</span></label>{tel_input("r-t")}</div>
          <div class="field"><label for="r-e">Email <span class="req">*</span></label><input class="input" id="r-e" name="email" type="email" autocomplete="email" required placeholder="tu@email.com"></div>
          <div class="field"><label for="r-f">Fecha preferida</label><input class="input" id="r-f" name="fecha_preferida" placeholder="Mes o fin de semana"></div>
          <fieldset class="pills full">{legend("Tu experiencia")}{pills("experiencia_previa", level)}</fieldset>
          {extra}
          <label class="check full"><input type="checkbox" name="regalo" value="sí"> <span>Es un regalo 🎁</span></label>
          <div class="field full"><label for="r-m">Comentarios</label><textarea class="textarea" id="r-m" name="mensaje" placeholder="¿Algo que debamos saber?"></textarea></div>
          {consent()}
        </div>
        <div class="form-foot mt-2"><button class="btn" type="submit">{I['ticket']} {"Comprar mi plaza" if kind == "course" else "Reservar plaza"}</button><small>🔒 No se cobra nada hasta confirmar.</small></div>
        <div class="form-msg" role="alert"></div>
      </form>
      {success_block("¡Plaza solicitada!", "Te contactamos para confirmar fecha, precio y forma de pago.", pay=True)}
    </div>
  </div>
</section>"""


def includes_list(items):
    return '<ul class="includes">' + "".join(f"<li>{I['check']}<span>{x}</span></li>" for x in items) + "</ul>"


def timeline(items):
    return '<ol class="timeline">' + "".join(
        f'<li class="reveal"><span class="timeline__dot"></span><b>{t}</b><p>{d}</p></li>' for t, d in items) + "</ol>"


def exp_card(slug, e, big=False):
    return f"""<a class="exp reveal{" exp--big" if big else ""}" href="{slug}.html">
  <div class="exp__media">{art(e["short"].upper(), "60%", "30%", e["card"], e["name"], "(max-width: 900px) 100vw, 33vw")}</div>
  <span class="exp__tag">{e["tag"]}</span>
  <div class="exp__body"><span class="exp__kicker">DS Pilot Weekend</span><h3>{e["short"]}</h3><p>{e["teaser"]}</p>
  <span class="svc__go">Descubrir {I["arrow"]}</span></div>
</a>"""


def experience_page(slug):
    e = EXPERIENCES[slug]
    product_ld = {"@context": "https://schema.org", "@type": "Product", "name": e["name"], "description": e["desc"],
                  "image": img_url(e["hero"]), "brand": {"@type": "Brand", "name": "Deyscom Motorsport"}, "category": "Experiencia de conducción",
                  "url": f"{SITE}/{slug}.html"}
    if PRICES.get(slug):
        product_ld["offers"] = {"@type": "Offer", "price": str(PRICES[slug]), "priceCurrency": "EUR", "availability": "https://schema.org/LimitedAvailability", "url": f"{SITE}/{slug}.html"}
    html = head(e["title"], e["desc"], slug, e["name"], e["hero"],
                [product_ld, breadcrumbs_ld(slug, e["name"], ("experiencias.html", "Experiencias")), faq_ld(e["faq"])], e["keywords"]) + header(slug)
    html += hero("DS Pilot Weekend · " + e["short"], e["lines"], e["lead"], e["short"][:2].upper(), e["hero"], e["chips"], e["name"], ("Reservar plaza", "#reserva"))
    html += ticker(["DS Pilot Weekend", e["short"], "Vive la competición", "Equipo Deyscom", e["tag"]], dark=True)
    st = e["story"]
    cars = ""
    if e["cars"]:
        cars = f"""<section class="section section--ink">
  <div class="container">
    {section_head("Elige tu coche", "Dos coches, <span class='outline'>dos caracteres</span>", "Preparados y mantenidos en nuestro taller de Torrelaguna. Elige con cuál quieres vivir la experiencia.")}
    {cars_block(e["cars"])}
  </div>
</section>"""
    others = "".join(exp_card(s, x) for s, x in EXPERIENCES.items() if s != slug)
    html += f"""<section class="section">
  <div class="container exp-layout">
    <div>
      <span class="eyebrow reveal">{st[0]}</span>
      <h2 class="reveal">{st[1]}</h2>
      <div class="mt-2 reveal">{st[2]}</div>
      <h3 class="mt-3 reveal">Qué incluye</h3>
      {includes_list(e["includes"])}
      <h3 class="mt-3 reveal">Programa del fin de semana</h3>
      <p class="muted small">Programa orientativo: se concreta en cada edición.</p>
      {timeline(e["program"])}
    </div>
    {booking_box(slug, e["name"])}
  </div>
</section>
{cars}
{booking_form(slug, e["name"], e["cars"])}
<section class="section">
  <div class="container">
    {section_head("Preguntas frecuentes", "Antes de <span class='outline'>arrancar</span>")}
    {faq(e["faq"])}
  </div>
</section>
<section class="section section--ink section--tight">
  <div class="container">
    {section_head("Más experiencias", "Sigue <span class='outline'>acelerando</span>")}
    <div class="exps exps--2">{others}</div>
  </div>
</section>
{mega_cta("¿Te <span class='outline'>atreves?</span>", "Plazas limitadas por edición. Reserva ahora y te confirmamos la fecha.", e["name"], ("Reservar plaza", "#reserva"))}
"""
    return html + footer()


def experiencias():
    faqs = [("¿Qué es el DS Pilot Weekend?", "Es nuestra línea de experiencias para vivir la competición desde dentro: un fin de semana con coche de competición, equipo y asistencia Deyscom en circuito, rally o slalom."),
            ("¿Necesito experiencia?", "No. Adaptamos cada experiencia a tu nivel. Para rally federado hace falta licencia, y te ayudamos a tramitarla."),
            ("¿Se puede regalar?", "Sí. Es uno de los regalos favoritos de los apasionados del motor. Indícalo en la reserva."),
            ("¿Qué coches se usan?", "En rally y slalom, nuestro Peugeot 206 1.6 XS de 118 CV o el BMW E36 de 135 CV. En circuito, un coche de competición preparado por Deyscom.")]
    html = head("Experiencias de pilotaje DS Pilot Weekend · Circuito, Rally y Slalom | Deyscom Motorsport",
                "Experiencias de pilotaje en Madrid: DS Pilot Weekend Circuit en el Jarama, Rally federado y Slalom con nuestro Peugeot 206 o BMW E36. Vive la competición desde dentro.",
                "experiencias", "las experiencias DS Pilot Weekend", "peugeot-206-rally-polvo-contraluz-deyscom",
                [breadcrumbs_ld("experiencias", "Experiencias"), faq_ld(faqs),
                 {"@context": "https://schema.org", "@type": "ItemList", "itemListElement": [
                     {"@type": "ListItem", "position": i + 1, "url": f"{SITE}/{s}.html", "name": x["name"]} for i, (s, x) in enumerate(EXPERIENCES.items())]}],
                "experiencias pilotaje Madrid, conducir coche de competición, regalo experiencia motor, experiencia rally, experiencia circuito Jarama, slalom") + header("experiencias")
    html += hero("Experiencias · DS Pilot Weekend", ["Vive la", "<span class='pink'>competición</span>", "<span class='outline'>desde dentro</span>"],
                 "Tres formas de sentirte piloto por un fin de semana: circuito, rally federado o slalom. Coche de competición, equipo y asistencia Deyscom.",
                 "DS", "bmw-e36-rally-tierra-contraluz-deyscom", ["Circuit", "Rally", "Slalom"], "las experiencias DS Pilot Weekend", ("Elige tu experiencia", "#experiencias"))
    html += ticker(["DS Pilot Weekend", "Circuit", "Rally", "Slalom", "Jarama", "Peugeot 206", "BMW E36"])
    html += f"""<section class="section" id="experiencias">
  <div class="container">
    {section_head("Elige tu experiencia", "Tres formas de <span class='outline'>acelerar</span>", "Cada experiencia es un fin de semana completo con nuestro equipo. Tú eliges el escenario.")}
    <div class="exps">{"".join(exp_card(s, x) for s, x in EXPERIENCES.items())}</div>
  </div>
</section>
<section class="section section--ink">
  <div class="container">
    {section_head("Nuestros coches", "Los protagonistas", "En rally y slalom eliges entre dos coches muy distintos, preparados en nuestro taller.")}
    <div class="carpicks carpicks--static">{"".join(f'<div class="carpick"><span class="carpick__box"><span class="carpick__media">{art(n.split()[0].upper(), "60%", "30%", c["img"], n)}</span><span class="carpick__body"><span class="carpick__power">{c["power"]}</span><b>{n}</b><span class="muted">{c["desc"]}</span></span></span></div>' for n, c in CARS.items())}</div>
  </div>
</section>
<section class="section section--pink">
  <div class="container">
    {section_head("Cómo funciona", "De la reserva <span class='outline'>a la meta</span>", "", True)}
    <div class="process">{process([("Reserva", "Elige experiencia y déjanos tus datos."), ("Confirmamos", "Te damos fecha, precio y todos los detalles."), ("Preparamos", "Coche, inscripción y equipo listos para ti."), ("Pilotas", "Vive el fin de semana como un piloto más.")], "Paso")}</div>
  </div>
</section>
{course_promo(compact=True)}
<section class="section">
  <div class="container">
    {section_head("Preguntas frecuentes", "Todo <span class='outline'>claro</span>")}
    {faq(faqs)}
  </div>
</section>
{mega_cta("Regala <span class='outline'>adrenalina</span>", "Las experiencias DS Pilot Weekend son el regalo perfecto para cualquier apasionado del motor.", "regalar una experiencia DS Pilot Weekend", ("Ver experiencias", "#experiencias"))}
"""
    return html + footer()


def course_promo(compact=False):
    feats = [("award", "Certificación y diploma", "Acredita tu formación como copiloto."),
             ("cal", "Fin de semana completo", "Teoría y práctica en dos días intensos."),
             ("users", "Profesor y profesora", "Formación impartida por dos docentes con experiencia."),
             ("map", "Tramo cerrado en Guadalajara", "Horas prácticas en un tramo cerrado solo para nosotros.")]
    f = "".join(f'<li><span class="ic">{I[ic]}</span><div><b>{t}</b><span>{d}</span></div></li>' for ic, t, d in feats)
    return f"""<section class="course-promo{" course-promo--compact" if compact else ""}">
  <div class="course-promo__bg">{pic(COURSE["hero"], sizes="100vw")}</div>
  <div class="container course-promo__inner">
    <div class="reveal">
      <span class="course-promo__badge">{I['grad']} Nuevo · Plazas limitadas</span>
      <h2>DS <span class="pink">Copilot</span><br><span class="outline">Course</span></h2>
      <p class="lead">Nuestro primer curso de copiloto de rally: un fin de semana completo de teoría y práctica, con certificación y diploma, y horas reales en un tramo cerrado en Guadalajara solo para nuestros alumnos.</p>
      <div class="btn-row mt-2">
        <a class="btn" href="ds-copilot-course.html">Quiero ser copiloto {I['arrow']}</a>
        <a class="btn btn--ghost" href="ds-copilot-course.html#reserva">{I['ticket']} Comprar plaza</a>
      </div>
    </div>
    <ul class="course-promo__feats reveal" data-delay="1">{f}</ul>
  </div>
</section>"""


def course_page():
    c = COURSE
    slug = c["slug"]
    faqs = [("¿Necesito experiencia previa?", "No. El curso está pensado tanto para quien empieza desde cero como para copilotos y pilotos que quieren mejorar su método."),
            ("¿Qué incluye la certificación?", "Al completar el curso recibes un diploma acreditativo de Deyscom Motorsport con la formación realizada."),
            ("¿Dónde se hace la práctica?", "En un tramo cerrado en la provincia de Guadalajara, reservado única y exclusivamente para nuestros alumnos."),
            ("¿Quién imparte el curso?", "Un profesor y una profesora con experiencia en el mundo del rally, que te acompañan en la teoría y en la práctica."),
            ("¿Cómo se compra la plaza?", "Pulsa «Comprar mi plaza», completa tus datos y te confirmamos la fecha y el pago. Las plazas son limitadas en cada edición.")]
    syllabus = [("book", "El papel del copiloto", "Funciones, responsabilidades y trabajo en equipo con el piloto."),
                ("mic", "Notas y dictado", "Cómo se toman, se escriben y se cantan las notas a ritmo de carrera."),
                ("map", "Libro de ruta y reconocimientos", "Lectura del road book, referencias y método de reconocimiento."),
                ("clock", "Carnet de ruta y controles", "Controles horarios, tiempos, penalizaciones y gestión de la jornada."),
                ("shield", "Reglamento y seguridad", "Normativa básica, equipamiento y protocolos de seguridad."),
                ("users", "Comunicación y presión", "Comunicación con el piloto, gestión del estrés y de los imprevistos.")]
    course_ld = {"@context": "https://schema.org", "@type": "Course", "name": c["name"], "description": c["desc"],
                 "provider": {"@type": "Organization", "name": "Deyscom Motorsport", "sameAs": SITE + "/"},
                 "image": img_url(c["hero"]), "url": f"{SITE}/{slug}.html", "inLanguage": "es", "educationalCredentialAwarded": "Diploma Deyscom Motorsport",
                 "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "onsite", "courseWorkload": "PT2D",
                                       "location": {"@type": "Place", "name": "Tramo cerrado", "address": {"@type": "PostalAddress", "addressRegion": "Guadalajara", "addressCountry": "ES"}}}}
    if PRICES.get(slug):
        course_ld["offers"] = {"@type": "Offer", "price": str(PRICES[slug]), "priceCurrency": "EUR", "category": "Paid", "availability": "https://schema.org/LimitedAvailability"}
    html = head(c["title"], c["desc"], slug, c["name"], c["hero"],
                [course_ld, breadcrumbs_ld(slug, c["name"], ("cursos.html", "Cursos")), faq_ld(faqs)], c["keywords"]) + header(slug)
    html += hero("Curso de copiloto de rally", ["DS", "<span class='pink'>Copilot</span>", "<span class='outline'>Course</span>"],
                 "Fin de semana completo de teoría y práctica con certificación y diploma, impartido por un profesor y una profesora, con horas prácticas en un tramo cerrado en Guadalajara solo para nosotros.",
                 "CO", c["hero"], ["Certificación + diploma", "Fin de semana completo", "Tramo cerrado en Guadalajara"], c["name"], ("Comprar mi plaza", "#reserva"))
    html += ticker(["Notas", "Libro de ruta", "Controles horarios", "Tramo cerrado", "Certificación", "Diploma"])
    syl = "".join(f'<article class="card reveal" data-delay="{i % 3}"><div class="card__icon">{I[ic]}</div><span class="step__n">Módulo 0{i + 1}</span><h3>{t}</h3><p>{d}</p></article>' for i, (ic, t, d) in enumerate(syllabus))
    html += f"""<section class="section">
  <div class="container exp-layout">
    <div>
      <span class="eyebrow reveal">El curso</span>
      <h2 class="reveal">La otra mitad <span class="pink">del coche</span></h2>
      <div class="mt-2 reveal">
        <p class="lead">Un buen copiloto gana rallies. En el DS Copilot Course aprenderás a tomar y cantar notas, a manejar el libro de ruta y los controles horarios, y a ser la voz en la que confía tu piloto.</p>
        <p class="muted">Es un fin de semana completo e intensivo: teoría en aula y práctica real dentro de un coche de rally, en un tramo cerrado en Guadalajara reservado única y exclusivamente para nuestros alumnos. Te lo imparten un profesor y una profesora, y al terminar recibes tu certificación y diploma.</p>
      </div>
      <h3 class="mt-3 reveal">Qué incluye</h3>
      {includes_list(["Fin de semana completo de formación", "Teoría en aula y práctica en coche de rally", "Horas prácticas en un tramo cerrado en Guadalajara, exclusivo para el curso",
                      "Un profesor y una profesora durante todo el curso", "Certificación y diploma acreditativo", "Material del curso"])}
      <h3 class="mt-3 reveal">Programa</h3>
      <p class="muted small">Programa orientativo: se concreta en cada edición.</p>
      {timeline([("Sábado · Teoría", "El papel del copiloto, notas, libro de ruta, carnet de ruta, controles horarios, reglamento y seguridad."),
                 ("Sábado · Primeras prácticas", "Toma y lectura de notas, primeros dictados y trabajo con el piloto."),
                 ("Domingo · Tramo cerrado", "Horas prácticas en el tramo cerrado de Guadalajara, dentro del coche de rally y a ritmo real."),
                 ("Domingo · Certificación", "Evaluación, feedback personalizado y entrega de diplomas.")])}
    </div>
    {booking_box(slug, c["name"], "course")}
  </div>
</section>
<section class="section section--ink">
  <div class="container">
    {section_head("Temario", "Qué vas a <span class='outline'>aprender</span>", "Seis módulos para salir del curso preparado para tu primer rally como copiloto.")}
    <div class="cards">{syl}</div>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="split">
      <div class="reveal">
        <span class="eyebrow">Para quién es</span>
        <h2>Para ti, <span class="outline">si…</span></h2>
        <div class="mt-2">{feature_list([("Quieres empezar en los rallies", "Como copiloto es la forma más directa y accesible de entrar en la competición."),
                                          ("Ya eres copiloto", "Y quieres pulir tu método, tus notas y tu gestión de la jornada."),
                                          ("Eres piloto", "Y quieres entender a tu copiloto para formar un equipo más rápido."),
                                          ("Te apasiona el motor", "Y buscas vivir un rally desde dentro, con certificación incluida.")])}</div>
        <a class="btn mt-2" href="#reserva">{I['ticket']} Comprar mi plaza</a>
      </div>
      <div class="split__media reveal" data-delay="1">{art("COPILOT", "50%", "35%", "copiloto-libro-de-ruta-rally-deyscom", "Copiloto")}<span class="split__tag">Tramo cerrado · Guadalajara</span></div>
    </div>
  </div>
</section>
{booking_form(slug, c["name"], kind="course")}
<section class="section">
  <div class="container">
    {section_head("Preguntas frecuentes", "Resolvemos <span class='outline'>tus dudas</span>")}
    {faq(faqs)}
  </div>
</section>
{mega_cta("Tu piloto <span class='outline'>te espera</span>", "Plazas limitadas en cada edición del DS Copilot Course.", "el DS Copilot Course", ("Comprar mi plaza", "#reserva"))}
"""
    return html + footer()


def cursos():
    html = head("Cursos de motorsport · Curso de copiloto de rally certificado | Deyscom Motorsport",
                "Cursos de Deyscom Motorsport: DS Copilot Course, curso de copiloto de rally con certificación y diploma, teoría y práctica en tramo cerrado en Guadalajara.",
                "cursos", "los cursos", COURSE["hero"], [breadcrumbs_ld("cursos", "Cursos")],
                "cursos motorsport, curso copiloto rally, formación rally Madrid, curso copiloto certificado") + header("cursos")
    html += hero("Cursos Deyscom", ["Aprende", "<span class='pink'>de quien</span>", "<span class='outline'>compite</span>"],
                 "Formación práctica y certificada para dar el salto a la competición. Empezamos con nuestro curso estrella: el DS Copilot Course.",
                 "CU", "copiloto-notas-rally-coche-competicion", ["Certificación + diploma", "Teoría + práctica", "Plazas limitadas"], "los cursos",
                 ("Ver DS Copilot Course", "ds-copilot-course.html"))
    html += course_promo()
    html += f"""<section class="section">
  <div class="container form-wrap">
    <div class="reveal">
      <span class="eyebrow">Próximamente</span>
      <h2>Más cursos <span class="outline">en camino</span></h2>
      <p class="lead mt-2">Estamos preparando nuevas formaciones. Déjanos tu contacto y serás el primero en enterarte de las próximas fechas y cursos.</p>
    </div>
    <div class="form-card reveal" data-delay="1" data-form-wrap>
      <form class="form-body" data-lead="cursos-aviso" novalidate>
        <input type="hidden" name="servicio" value="Aviso nuevos cursos">
        <div class="form-grid">
          <div class="field"><label for="cu-n">Nombre <span class="req">*</span></label><input class="input" id="cu-n" name="nombre" required autocomplete="name"></div>
          <div class="field"><label for="cu-t">Teléfono <span class="req">*</span></label>{tel_input("cu-t")}</div>
          <div class="field full"><label for="cu-e">Email</label><input class="input" id="cu-e" name="email" type="email" autocomplete="email"></div>
          <fieldset class="pills full">{legend("¿Qué te interesa?")}{pills("interes", ["Copiloto", "Pilotaje", "Mecánica de competición", "Otro"])}</fieldset>
          {consent()}
        </div>
        <div class="form-foot mt-2"><button class="btn" type="submit">Avisadme {I['arrow']}</button></div>
        <div class="form-msg" role="alert"></div>
      </form>
      {success_block("¡Apuntado!", "Te avisaremos con las próximas fechas y cursos.")}
    </div>
  </div>
</section>
{mega_cta("¿Empezamos <span class='outline'>a cantar notas?</span>", "Reserva tu plaza en el DS Copilot Course.", "el DS Copilot Course", ("Comprar mi plaza", "ds-copilot-course.html#reserva"))}
"""
    return html + footer()


# ------------------------------------------------------------------ merch
def _lg(x, y, w, extra=""):
    h = w * 97 / 301
    return f'<svg x="{x - w / 2:.1f}" y="{y - h / 2:.1f}" width="{w}" height="{h:.1f}" viewBox="{LOGO_VB}"{extra}>{LOGO_PATHS}</svg>'


TEE = "M120 30 L160 18 Q200 48 240 18 L280 30 L370 80 L340 150 L300 132 L300 400 L100 400 L100 132 L60 150 L30 80 Z"
LONG = "M128 34 L162 20 Q200 46 238 20 L272 34 L338 74 L384 360 L346 370 L308 170 L306 404 L94 404 L92 170 L54 370 L16 360 L62 74 Z"
FONT = "Jost, Futura, Arial, sans-serif"


def _txt(x, y, t, size, fill, weight=800, anchor="middle", spacing=0, italic=True, rotate=None, extra=""):
    tr = f' transform="rotate({rotate} {x} {y})"' if rotate is not None else ""
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" '
            f'{"font-style=\"italic\" " if italic else ""}text-anchor="{anchor}" letter-spacing="{spacing}" fill="{fill}"{tr}{extra}>{t}</text>')


def mock_svg(kind, view="front"):
    """Mockups vectoriales con el logotipo real. kind: camiseta, chaqueta, sudadera, gorra, pegatinas, especial."""
    lab = {"front": "delante", "back": "detrás"}[view]
    cls = f"mock mock--{view}"
    if kind in ("camiseta", "especial"):
        name = "Camiseta" if kind == "camiseta" else "Camiseta Edición Especial El Molar 2026"
        body = f'<path d="{TEE}" fill="#0b0b0d" stroke="rgba(255,255,255,.18)" stroke-width="2"/>'
        if kind == "especial":
            body = (f'<defs><clipPath id="tee-{view}"><path d="{TEE}"/></clipPath></defs>'
                    f'<path d="{TEE}" fill="#ff66c4"/>'
                    f'<g clip-path="url(#tee-{view})"><rect x="0" y="0" width="400" height="232" fill="#151518"/>'
                    f'<rect x="0" y="232" width="400" height="12" fill="#0b0b0d"/>'
                    f'<path d="M0 300 L400 270 L400 284 L0 314 Z" fill="rgba(0,0,0,.12)"/></g>'
                    f'<path d="{TEE}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/>')
        neck = '<path d="M160 18 Q200 48 240 18" fill="none" stroke="rgba(127,127,127,.45)" stroke-width="5"/>'
        if view == "back":
            neck = '<path d="M160 18 Q200 30 240 18" fill="none" stroke="rgba(127,127,127,.45)" stroke-width="5"/>'
        art = ""
        if kind == "camiseta":
            art = _lg(258, 92, 62) if view == "front" else _lg(200, 170, 210)
        elif view == "front":
            art = (_lg(258, 92, 62) + _txt(140, 98, "EBC FRENOS", 11, "#fff", spacing=.5) + _txt(140, 112, "HEL", 12, "#ff3b3b")
                   + _txt(200, 168, "KING ELEMENTS", 14, "#fff", 900, spacing=1) + _txt(200, 186, "MISHIMOTO", 12, "#ff9a3d", 900, spacing=1.5)
                   + _txt(200, 214, "II RALLYE COMUNIDAD DE MADRID · EL MOLAR 2026", 7.4, "#ff66c4", 700, spacing=.8)
                   + _txt(72, 106, "EBC", 10, "#fff", rotate=-58) + _txt(330, 104, "HEL", 10, "#ff3b3b", rotate=58)
                   + _txt(150, 352, "N. Aguado", 17, "#0b0b0d", 600, spacing=0) + _txt(250, 374, "H. Guzmán", 17, "#0b0b0d", 600))
        else:
            art = (_txt(200, 66, "PRIMER RALLY · FIRST RALLY", 11, "#ff66c4", 800, spacing=2)
                   + _lg(200, 120, 190)
                   + _txt(200, 196, "II RALLYE COMUNIDAD DE MADRID", 12, "#fff", 800, spacing=1)
                   + _txt(200, 214, "EL MOLAR · 2026", 12, "#ff66c4", 900, spacing=2)
                   + _txt(200, 300, "NÉSTOR AGUADO", 18, "#0b0b0d", 900, spacing=1) + _txt(200, 322, "HÉCTOR GUZMÁN", 18, "#0b0b0d", 900, spacing=1)
                   + _txt(200, 360, "EBC FRENOS · HEL · MISHIMOTO · KING ELEMENTS", 8, "#0b0b0d", 800, spacing=1))
        return f'<svg class="{cls}" viewBox="0 0 400 420" role="img" aria-label="{name} Deyscom Motorsport ({lab})">{body}{neck}{art}</svg>'
    if kind in ("chaqueta", "sudadera"):
        name = "Chaqueta" if kind == "chaqueta" else "Sudadera con capucha"
        body = f'<path d="{LONG}" fill="#0b0b0d" stroke="rgba(255,255,255,.18)" stroke-width="2"/>'
        cuffs = '<path d="M54 370 L16 360 L20 340 L58 350 Z M346 370 L384 360 L380 340 L342 350 Z" fill="#141417"/><rect x="94" y="388" width="212" height="16" fill="#141417"/>'
        extra = ""
        if kind == "chaqueta":
            if view == "front":
                extra = ('<path d="M162 20 L200 60 L238 20 L238 6 Q200 30 162 6 Z" fill="#141417" stroke="rgba(255,255,255,.2)"/>'
                         '<line x1="200" y1="60" x2="200" y2="404" stroke="rgba(255,255,255,.35)" stroke-width="2.5" stroke-dasharray="3 3"/>'
                         '<path d="M118 280 L170 274 M282 274 L230 280" stroke="rgba(255,255,255,.25)" stroke-width="2"/>' + _lg(262, 96, 58))
            else:
                extra = '<path d="M162 20 Q200 36 238 20 L238 6 Q200 22 162 6 Z" fill="#141417"/>' + _lg(200, 180, 200)
        else:
            if view == "front":
                extra = ('<path d="M150 26 Q200 -20 250 26 Q236 70 200 74 Q164 70 150 26 Z" fill="#141417" stroke="rgba(255,255,255,.18)"/>'
                         '<line x1="186" y1="72" x2="182" y2="130" stroke="#ddd" stroke-width="2"/><line x1="214" y1="72" x2="218" y2="130" stroke="#ddd" stroke-width="2"/>'
                         '<path d="M130 300 L270 300 L286 372 L114 372 Z" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="2"/>' + _lg(262, 110, 58))
            else:
                extra = '<path d="M140 30 Q200 -40 260 30 Q244 96 200 100 Q156 96 140 30 Z" fill="#141417" stroke="rgba(255,255,255,.18)"/>' + _lg(200, 200, 200)
        return f'<svg class="{cls}" viewBox="0 0 400 420" role="img" aria-label="{name} Deyscom Motorsport ({lab})">{body}{cuffs}{extra}</svg>'
    if kind == "gorra":
        return f"""<svg class="{cls}" viewBox="0 0 400 320" role="img" aria-label="Gorra Deyscom Motorsport">
  <path d="M70 200 Q60 70 200 60 Q340 70 330 200 Z" fill="#0b0b0d" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
  <path d="M200 60 L200 112 M135 72 Q120 140 125 200 M265 72 Q280 140 275 200" stroke="rgba(127,127,127,.25)" stroke-width="2" fill="none"/>
  <circle cx="200" cy="62" r="7" fill="#0b0b0d" stroke="rgba(127,127,127,.4)"/>
  <path d="M60 200 Q200 180 340 200 Q380 215 370 245 Q200 215 30 245 Q20 215 60 200 Z" fill="#141417" stroke="rgba(255,255,255,.18)"/>
  {_lg(200, 148, 150)}
</svg>"""
    return f"""<svg class="{cls}" viewBox="0 0 400 360" role="img" aria-label="Pegatinas Deyscom Motorsport">
  <g transform="rotate(-8 200 140)">
    <rect x="40" y="70" width="320" height="130" rx="18" fill="#fff" filter="drop-shadow(0 10px 18px rgba(0,0,0,.5))"/>
    <rect x="52" y="82" width="296" height="106" rx="10" fill="var(--garment,#0b0b0d)"/>
    {_lg(200, 135, 240)}
  </g>
  <g transform="rotate(9 130 280)" style="--logo-a:#000;--logo-b:#fff">
    <rect x="40" y="238" width="180" height="70" rx="12" fill="#ff66c4" filter="drop-shadow(0 8px 14px rgba(0,0,0,.5))"/>
    {_lg(130, 273, 140)}
  </g>
  <g transform="rotate(-6 300 285)" style="--logo-a:#000;--logo-b:#ff66c4">
    <rect x="232" y="250" width="140" height="64" rx="12" fill="#fff" filter="drop-shadow(0 8px 14px rgba(0,0,0,.5))"/>
    {_lg(302, 282, 110)}
  </g>
</svg>"""


SIZES = ["S", "M", "L", "XL", "XXL"]
PRODUCTS = {
    "camiseta-edicion-especial-el-molar-2026": dict(
        photo=True,
        kind="especial", name="Camiseta Edición Especial El Molar 2026", short="Edición especial", price=35, tag="Edición limitada",
        desc="Edición especial para celebrar nuestro primer rally: el II Rallye Comunidad de Madrid – El Molar 2026, al que Néstor Aguado y Héctor Guzmán fueron juntos por primera vez. Diseño bicolor negro y rosa de inspiración racing, con nuestros patrocinadores en pecho y mangas, y las firmas de Néstor y Héctor con el dorsal NH1.",
        colors=[("Negro / Rosa", "#151518", "#ffffff", "#ff66c4")], sizes=SIZES, back=True,
        features=["Edición limitada · El Molar 2026", "Diseño bicolor negro y rosa Deyscom", "Patrocinadores: Mishimoto, EBC Frenos, HEL, King Elements y GT2i", "Firmas de Néstor y Héctor con el dorsal NH1"],
    ),
    "camiseta-deyscom": dict(
        photo=True,
        kind="camiseta", name="Camiseta Deyscom Motorsport", short="Camiseta", price=25, tag="Más vendido",
        desc="La camiseta oficial del equipo, en negro. Logo pequeño en el pecho y logo grande en la espalda, como la que llevamos en el taller y en el paddock.",
        colors=[("Negro", "#0b0b0d", "#ffffff", "#ff66c4")], sizes=SIZES, back=True,
        features=["Color negro", "Logo pequeño en el pecho", "Logo grande en la espalda", "Corte unisex regular"],
    ),
    "sudadera-capucha-deyscom": dict(
        photo=True,
        kind="sudadera", name="Sudadera con capucha Deyscom Motorsport", short="Sudadera", price=45, tag="Nuevo",
        desc="Sudadera con capucha negra con bolsillo canguro, logo pequeño en el pecho y logo grande en la espalda. Para las mañanas frías de tramo y las noches de taller.",
        colors=[("Negro", "#0b0b0d", "#ffffff", "#ff66c4")], sizes=SIZES, back=True,
        features=["Color negro", "Capucha con cordones y bolsillo canguro", "Logo pequeño en el pecho", "Logo grande en la espalda"],
    ),
    "chaqueta-deyscom": dict(
        photo=True,
        kind="chaqueta", name="Chaqueta Deyscom Motorsport", short="Chaqueta", price=59, tag="Nuevo",
        desc="Chaqueta negra de equipo con cremallera completa, logo pequeño arriba a la derecha y logo grande en la espalda. La que verás en nuestro box.",
        colors=[("Negro", "#0b0b0d", "#ffffff", "#ff66c4")], sizes=SIZES, back=True,
        features=["Color negro", "Cremallera completa", "Logo pequeño arriba a la derecha", "Logo grande en la espalda"],
    ),
    "gorra-deyscom": dict(
        photo=True,
        kind="gorra", name="Gorra Deyscom Motorsport", short="Gorra", price=22, tag="Paddock",
        desc="Gorra negra de seis paneles con visera curva y logo bordado. Cierre ajustable para que te quede perfecta en pista y fuera de ella.",
        colors=[("Negro", "#0b0b0d", "#ffffff", "#ff66c4")], sizes=["Talla única ajustable"], back=False,
        features=["Color negro", "Logo bordado", "Visera curva", "Cierre trasero ajustable"],
    ),
    "pegatinas-deyscom": dict(
        kind="pegatinas", name="Pack de pegatinas Deyscom Motorsport", short="Pegatinas", price=6, tag="Pack",
        desc="Pack de pegatinas de vinilo con el logo Deyscom Motorsport: para el coche, el casco, la caja de herramientas o el portátil. Resistentes a la intemperie.",
        colors=[("Negro", "#000000", "#ffffff", "#ff66c4")],
        sizes=["Pack 3 uds", "Pack 6 uds", "Pegatina grande parabrisas"], back=False,
        features=["Vinilo de exterior resistente al agua y UV", "Corte a contorno", "Varios tamaños en el pack", "Ideal para coche, casco y taller"],
    ),
}


def color_style(c):
    st = f"--garment:{c[1]};--logo-a:{c[2]};--logo-b:{c[3]}"
    return st + (f";--brim:{c[4]}" if len(c) > 4 else "")


def product_photo(slug, p, eager=False, big=False):
    """Foto real del producto (delante y detrás) en WebP + JPG."""
    b = f"assets/img/productos/{slug}"
    sizes = "(max-width: 900px) 100vw, 600px" if big else "(max-width: 600px) 100vw, 33vw"
    load = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    return (f'<picture><source type="image/webp" srcset="{b}-600.webp 600w, {b}.webp 1024w" sizes="{sizes}">'
            f'<img class="product__photo" src="{b}.jpg" srcset="{b}-600.jpg 600w, {b}.jpg 1024w" sizes="{sizes}" width="1024" height="1024" '
            f'alt="{escape(p["name"])}: vista delantera y trasera" {load}></picture>')


def product_visual(slug, p, **kw):
    return product_photo(slug, p, **kw) if p.get("photo") else mock_svg(p["kind"])


def product_card(slug, p):
    return f"""<a class="product reveal{" product--special" if p['kind'] == 'especial' else ""}" href="{slug}.html">
  <div class="product__media{" product__media--photo" if p.get("photo") else ""}" style="{color_style(p['colors'][0])}"><span class="product__tag">{p['tag']}</span>{product_visual(slug, p)}</div>
  <div class="product__body"><h3>{p['name']}</h3><span class="product__price">{p['price']} €</span></div>
  <span class="svc__go">Ver producto {I['arrow']}</span>
</a>"""


def tienda():
    html = head("Tienda Deyscom Motorsport · Coches en venta y merchandising oficial",
                "Tienda Deyscom Motorsport: coches de competición, clásicos y piezas a la venta conectados con Wallapop, y merchandising oficial: camisetas, gorras y pegatinas.",
                "tienda", "la tienda", "asistencia-deyscom-peugeot-206-rally", [breadcrumbs_ld("tienda", "Tienda")],
                "comprar coche de rally, coches competición en venta, merchandising motorsport, camiseta Deyscom, gorra Deyscom") + header("tienda")
    html += hero("Tienda Deyscom", ["Llévate", "<span class='pink'>un trozo</span>", "<span class='outline'>de Deyscom</span>"],
                 "Coches y piezas a la venta, revisados por nuestro taller, y el merchandising oficial del equipo.", "05",
                 "bmw-e36-rally-tierra-contraluz-deyscom", ["Edición especial El Molar 2026", "Camisetas · Sudaderas · Chaquetas", "Envío o recogida en taller"], "la tienda",
                 ("Ver merchandising", "#merch"))
    html += ticker(["Coches", "Piezas", "Camisetas", "Gorras", "Pegatinas", "Wallapop"])
    html += f"""<section class="section section--ink" id="merch">
  <div class="container">
    {section_head("Merchandising oficial", "Viste <span class='outline'>el equipo</span>", "Camisetas, gorras y pegatinas con el logo Deyscom Motorsport. Recógelas en el taller o te las enviamos a casa.")}
    <div class="products">{"".join(product_card(s, p) for s, p in PRODUCTS.items())}</div>
  </div>
</section>
<section class="section" id="coches">
  <div class="container">
    <div class="section__head">
      <div class="reveal"><span class="eyebrow">Coches y piezas en venta</span><h2>Listos para <span class="outline">rodar</span></h2></div>
      <div class="reveal" data-delay="1">
        <p class="lead muted">Todo lo que tenemos a la venta, sincronizado con nuestro perfil de Wallapop. ¿Te interesa alguno? Escríbenos y lo vemos juntos.</p>
        <div class="btn-row mt-1"><a class="btn btn--ghost" data-social="wallapop" href="#">{I['wallapop']} Ver perfil en Wallapop</a></div>
      </div>
    </div>
    <div class="stock" data-stock>
      <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
    </div>
    <div class="stock-empty" data-stock-empty hidden>
      <h3>Mira el stock <span class="outline">en Wallapop</span></h3>
      <p>Nuestros coches y piezas en venta se actualizan en Wallapop. Entra en nuestro perfil o dinos qué buscas y te avisamos en cuanto llegue algo.</p>
      <div class="btn-row">
        <a class="btn" data-social="wallapop" href="#">{I['wallapop']} Abrir Wallapop</a>
        <a class="btn btn--wa" data-wa="un coche o pieza que tengáis a la venta" data-loc="stock-empty" href="#">{I['wa']} ¿Qué buscas?</a>
      </div>
    </div>
  </div>
</section>
<section class="section section--ink">
  <div class="container form-wrap">
    <div class="reveal">
      <span class="eyebrow">¿Buscas algo concreto?</span>
      <h2>Te lo <span class="outline">encontramos</span></h2>
      <p class="lead mt-2">¿Buscas un coche de competición, un clásico para restomod o una pieza difícil? Dinos qué necesitas y te avisamos.</p>
      {contact_list()}
    </div>
    <div class="form-card reveal" data-delay="1" data-form-wrap>
      <form class="form-body" data-lead="busqueda" novalidate>
        <input type="hidden" name="servicio" value="Tienda · búsqueda">
        <div class="form-grid">
          <div class="field full"><label for="b-q">¿Qué buscas? <span class="req">*</span></label><input class="input" id="b-q" name="vehiculo" required placeholder="Ej. BMW E36 para rally, pinzas de freno…"></div>
          <div class="field"><label for="b-p">Presupuesto</label><input class="input" id="b-p" name="presupuesto" placeholder="Hasta…"></div>
          <div class="field"><label for="b-n">Nombre <span class="req">*</span></label><input class="input" id="b-n" name="nombre" required autocomplete="name"></div>
          <div class="field full"><label for="b-t">Teléfono <span class="req">*</span></label>{tel_input("b-t")}</div>
          {consent()}
        </div>
        <div class="form-foot mt-2"><button class="btn" type="submit">Avisadme {I['arrow']}</button></div>
        <div class="form-msg" role="alert"></div>
      </form>
      {success_block("¡Apuntado!", "En cuanto tengamos algo que encaje, te avisamos.")}
    </div>
  </div>
</section>
"""
    return html + footer()


def product_page(slug):
    p = PRODUCTS[slug]
    c0 = p["colors"][0]
    single = len(p["colors"]) == 1
    swatches = "".join(
        f'<label class="swatch" title="{c[0]}"><input type="radio" name="color" value="{c[0]}" data-style="{color_style(c)}"{" checked" if i == 0 else ""} required>'
        f'<span style="background:{c[1]}"></span></label>'
        for i, c in enumerate(p["colors"])
    )
    sizes = "".join(
        f'<label class="pill"><input type="radio" name="talla" value="{s}"{" checked" if len(p["sizes"]) == 1 or s == "M" or (s == p["sizes"][0] and p["kind"] == "pegatinas") else ""} required><span>{s}</span></label>'
        for s in p["sizes"]
    )
    feats = "".join(f"<li>{I['check']} {f}</li>" for f in p["features"])
    others = "".join(product_card(s, q) for s, q in PRODUCTS.items() if s != slug)
    prod_ld = {"@context": "https://schema.org", "@type": "Product", "name": p["name"], "description": p["desc"], "sku": slug,
               "image": f"{SITE}/assets/img/productos/{slug}.jpg" if p.get("photo") else SITE + "/assets/img/og-deyscom-motorsport.jpg", "brand": {"@type": "Brand", "name": "Deyscom Motorsport"},
               "offers": {"@type": "Offer", "priceCurrency": "EUR", "price": str(p["price"]), "availability": "https://schema.org/InStock", "url": f"{SITE}/{slug}.html",
                          "seller": {"@id": SITE + "/#organizacion"}}}
    html = head(f"{p['name']} · Merchandising oficial | Deyscom Motorsport", p["desc"], slug, p["name"], "og",
                [prod_ld, breadcrumbs_ld(slug, p["name"], ("tienda.html", "Tienda"))], f"{p['short'].lower()} Deyscom Motorsport, merchandising motorsport, {p['short'].lower()} rally") + header(slug)
    html += f"""<section class="section product-page">
  <div class="container">
    <nav class="crumbs" aria-label="Migas"><a href="index.html">Inicio</a> / <a href="tienda.html#merch">Tienda</a> / <span>{p['short']}</span></nav>
    <div class="pdp" data-product data-price="{p['price']}">
      <div class="pdp__gallery">
        <div class="pdp__stage{" pdp__stage--photo" if p.get("photo") else ""}" data-mock style="{color_style(c0)}">
          <span class="product__tag">{p['tag']}</span>
          {product_photo(slug, p, eager=True, big=True) if p.get("photo") else mock_svg(p['kind'])}
        </div>
        <ul class="pdp__trust">
          <li>{I['truck']} Envío a toda España o recogida en taller</li>
          <li>{I['shield']} Pago seguro al confirmar el pedido</li>
          <li>{I['star']} Producto oficial Deyscom Motorsport</li>
        </ul>
      </div>
      <div class="pdp__info" data-form-wrap>
        <span class="eyebrow">Merchandising oficial</span>
        <h1 class="pdp__title">{p['name']}</h1>
        <div class="pdp__price"><span data-total>{p['price']} €</span><small>IVA incluido</small></div>
        <p class="lead">{p['desc']}</p>
        <form class="form-body" data-lead="pedido" novalidate>
          <input type="hidden" name="servicio" value="Pedido tienda">
          <input type="hidden" name="producto" value="{escape(p['name'])}">
          <input type="hidden" name="precio_unidad" value="{p['price']}">
          <input type="hidden" name="total" value="{p['price']}" data-total-input>
          {f'<input type="hidden" name="color" value="{c0[0]}"><p class="pdp__lbl mt-2">Color: <b>{c0[0]}</b></p>' if single else f'<fieldset class="pills mt-2"><legend class="field"><span class="pdp__lbl">Color: <b data-color-name>{c0[0]}</b></span></legend><div class="swatches">{swatches}</div></fieldset>'}
          <fieldset class="pills mt-2"><legend class="field"><span class="pdp__lbl">{"Talla" if p["kind"] != "pegatinas" else "Formato"}</span></legend>{sizes}</fieldset>
          <div class="pdp__row mt-2">
            <div class="qty" aria-label="Cantidad">
              <button type="button" data-qty="-1" aria-label="Menos">−</button>
              <input name="cantidad" type="number" min="1" max="50" value="1" inputmode="numeric" aria-label="Cantidad">
              <button type="button" data-qty="1" aria-label="Más">+</button>
            </div>
            <button class="btn pdp__open" type="button" data-open-order>{I['bag']} Lo quiero</button>
          </div>
          <div class="pdp__order" data-order hidden>
            <div class="fstep__title mt-2" style="font-size:1.8rem">Datos del pedido</div>
            <p class="fstep__sub">Te confirmamos disponibilidad y forma de pago por WhatsApp o email.</p>
            <div class="form-grid">
              <div class="field"><label for="p-n">Nombre <span class="req">*</span></label><input class="input" id="p-n" name="nombre" autocomplete="name" required></div>
              <div class="field"><label for="p-t">Teléfono <span class="req">*</span></label>{tel_input("p-t")}</div>
              <div class="field full"><label for="p-e">Email</label><input class="input" id="p-e" name="email" type="email" autocomplete="email"></div>
              <fieldset class="pills full"><legend class="field"><span class="pdp__lbl">Entrega</span></legend>
                <label class="pill"><input type="radio" name="entrega" value="Recogida en taller" checked data-ship="0"><span>Recogida en taller (gratis)</span></label>
                <label class="pill"><input type="radio" name="entrega" value="Envío a domicilio" data-ship="1"><span>Envío a domicilio</span></label>
              </fieldset>
              <div class="field full" data-address hidden><label for="p-d">Dirección de envío</label><textarea class="textarea" id="p-d" name="mensaje" placeholder="Calle, número, CP, ciudad, provincia"></textarea></div>
              {consent()}
            </div>
            <div class="form-foot mt-2"><button class="btn btn--block" type="submit">Confirmar pedido · <span data-total>{p['price']} €</span></button></div>
            <div class="form-msg" role="alert"></div>
          </div>
        </form>
        <ul class="pdp__feats">{feats}</ul>
        <div class="btn-row mt-2"><a class="btn btn--wa" data-wa="{escape(p['name'])}" data-loc="pdp" href="#">{I['wa']} Pregúntanos por WhatsApp</a></div>
        {success_block("¡Pedido recibido!", "Te contactamos para confirmar talla, disponibilidad, pago y entrega.", pay=True)}
      </div>
    </div>
  </div>
</section>
<section class="section section--ink section--tight">
  <div class="container">
    {section_head("Completa el look", "También <span class='outline'>te gustará</span>")}
    <div class="products products--2">{others}</div>
  </div>
</section>
"""
    return html + footer()


# ------------------------------------------------------------------ inicio
def home():
    svc = [
        ("competicion.html", "01", "Competición", "Preparación, seguridad, asistencia y alquiler de coches de rally, slalom y circuito.", "RACE", "mitsubishi-lancer-evo-rally-taller-deyscom", "60%"),
        ("restomod.html", "02", "Restomod", "Clásicos y 4x4 con alma y mecánica moderna. Proyectos únicos hechos a mano.", "CLASSIC", "todoterreno-chasis-restauracion-completa", "30%"),
        ("pintura.html", "03", "Pintura", "Cabina de pintura, chapa, chasis, colores especiales y decoraciones racing.", "PAINT", "cabina-pintura-chasis-rosa", "60%"),
        ("banco-de-potencia.html", "04", "Banco de potencia", "Mide los CV y el par reales de tu coche y compara antes y después.", "DYNO", "banco-de-potencia-medicion-deyscom", "40%"),
        ("tienda.html", "05", "Tienda", "Coches y piezas a la venta, y merchandising oficial Deyscom.", "SHOP", "asistencia-deyscom-peugeot-206-rally", "50%"),
    ]
    svc_html = "".join(
        f'<a class="svc reveal" data-delay="{i % 3}" href="{h}"><div class="svc__media">{art(w, x, "30%", img, t, "(max-width: 980px) 100vw, 50vw")}</div>'
        f'<span class="svc__num">{n}</span><h3>{t}</h3><p>{d}</p><span class="svc__go">Descubrir {I["arrow"]}</span></a>'
        for i, (h, n, t, d, w, img, x) in enumerate(svc)
    )
    choices = [("flag", "Competición", "Rally, slalom, circuito"), ("star", "Restomod", "Clásico + mecánica moderna"),
               ("spray", "Pintura", "Chapa, color, decoración"), ("gauge", "Banco de potencia", "Medir CV y par"),
               ("helmet", "Experiencia", "DS Pilot Weekend"), ("grad", "Curso copiloto", "DS Copilot Course")]
    choice_html = "".join(
        f'<label class="choice"><input type="radio" name="servicio" value="{t}"{" required" if i == 0 else ""}>'
        f'<span class="choice__box">{I[ic]}<b>{t}</b><span>{d}</span></span></label>'
        for i, (ic, t, d) in enumerate(choices)
    )
    home_faq = [
        ("¿Dónde estáis?", "En C/ Canal de Isabel II, 2, Nave 3, 28180 Torrelaguna (Madrid). A unos 50 minutos de Madrid capital."),
        ("¿Cuál es vuestro horario?", "De lunes a viernes de 07:00 a 15:00. Sábados y domingos cerrado. Por WhatsApp puedes escribirnos cuando quieras."),
        ("¿Hacéis presupuestos sin compromiso?", "Sí. Cuéntanos tu proyecto por el formulario o WhatsApp y te damos una valoración inicial."),
        ("¿Puedo correr sin tener coche propio?", "Sí: con nuestras experiencias DS Pilot Weekend en circuito, rally o slalom, o con el alquiler de nuestros coches de competición."),
        ("¿Cómo me apunto al curso de copiloto?", "Entra en la página del DS Copilot Course y pulsa «Comprar mi plaza». Las plazas son limitadas."),
    ]
    html = head("Deyscom Motorsport · Taller de competición, restomod, pintura y banco de potencia en Madrid",
                "Taller motorsport en Torrelaguna (Madrid): preparación de coches de competición, restomod, pintura, banco de potencia, experiencias DS Pilot Weekend y curso de copiloto DS Copilot Course.",
                "index", "vuestros servicios", "bmw-e36-rally-tierra-deyscom-motorsport",
                [{"@context": "https://schema.org", "@type": "WebSite", "name": "Deyscom Motorsport", "url": SITE + "/", "inLanguage": "es-ES", "publisher": {"@id": SITE + "/#organizacion"}}, faq_ld(home_faq)],
                "taller competición Madrid, preparación rally Madrid, restomod Madrid, banco de potencia Madrid, curso copiloto rally, experiencia pilotaje, Torrelaguna") + header("index")
    html += hero("Torrelaguna · Madrid · Motorsport", ["Hechos", "para <span class='pink'>correr.</span>", "<span class='outline'>Pensados para ti.</span>"],
                 "Coches de competición, restomods, pintura, banco de potencia, experiencias de pilotaje y cursos. Un taller de apasionados donde cada coche se trata como si fuera nuestro.",
                 "", "bmw-e36-rally-tierra-deyscom-motorsport", ["Competición", "Restomod", "Pintura", "Banco de potencia"], "", ("Empieza tu proyecto", "#presupuesto"), page=False)
    html += ticker(["Competición", "Restomod", "Pintura", "Banco de potencia", "DS Pilot Weekend", "DS Copilot Course"])
    html += course_promo()
    html += f"""
<section class="section">
  <div class="container">
    {section_head("Qué hacemos", "Un taller.<br><span class='outline'>Cinco pasiones.</span>", "Desde un coche de rally listo para el primer tramo hasta un clásico que vuelve a nacer. Elige por dónde quieres empezar.")}
    <div class="services">{svc_html}</div>
  </div>
</section>

<section class="section section--ink">
  <div class="container">
    {section_head("Experiencias · DS Pilot Weekend", "Sé piloto <span class='outline'>un fin de semana</span>", "Circuito del Jarama, rally federado o slalom con nuestro Peugeot 206 o BMW E36. Sin coche propio, con todo el equipo Deyscom.")}
    <div class="exps">{"".join(exp_card(s, x) for s, x in EXPERIENCES.items())}</div>
    <div class="btn-row mt-3"><a class="btn" href="experiencias.html">Ver todas las experiencias {I['arrow']}</a></div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="usp">
      <div class="usp__item reveal"><div class="usp__big">1<span>:</span>1</div><h3>Trato directo</h3><p>Hablas con quien trabaja en tu coche. Sin intermediarios.</p></div>
      <div class="usp__item reveal" data-delay="1"><div class="usp__big">24<span>h</span></div><h3>Respuesta rápida</h3><p>Contestamos tu solicitud en menos de 24 h laborables.</p></div>
      <div class="usp__item reveal" data-delay="2"><div class="usp__big">100<span>%</span></div><h3>A medida</h3><p>Cada proyecto se diseña para tu coche, tu uso y tu presupuesto.</p></div>
      <div class="usp__item reveal" data-delay="3"><div class="usp__big">07<span>:</span>00</div><h3>Madrugamos</h3><p>Abrimos de lunes a viernes a las 7. Tu coche, cuanto antes en pista.</p></div>
    </div>
  </div>
</section>

<section class="section section--ink shop-teaser">
  <div class="container">
    <div class="section__head">
      <div class="reveal"><span class="eyebrow">Tienda Deyscom</span><h2>Viste <span class="outline">el equipo</span></h2></div>
      <div class="reveal" data-delay="1"><p class="lead muted">Merchandising oficial y coches y piezas a la venta, revisados por nuestro taller.</p>
        <div class="btn-row mt-1"><a class="btn" href="tienda.html">{I['bag']} Entrar en la tienda</a><a class="btn btn--ghost" href="tienda.html#coches">{I['car']} Coches en venta</a></div></div>
    </div>
    <div class="products">{"".join(product_card(s, p) for s, p in PRODUCTS.items())}</div>
  </div>
</section>

<section class="section">
  <div class="container">
    {split("Quiénes somos", "Gasolina <span class='pink'>en las venas</span>",
           "<p class='lead'>Deyscom Motorsport nace de una idea sencilla: hacer los coches que a nosotros nos gustaría conducir. Competimos, restauramos, pintamos y preparamos con la misma obsesión por el detalle.</p>"
           "<p class='muted'>Desde nuestra nave en Torrelaguna trabajamos para pilotos, coleccionistas y apasionados de toda España. Cada proyecto se vive, se documenta y se comparte.</p>"
           f'<div class="btn-row mt-2"><a class="btn btn--ghost" href="nosotros.html">Conócenos {I["arrow"]}</a></div>',
           "TEAM", "equipo-deyscom-motorsport-atardecer", "Equipo Deyscom", False, "65%")}
  </div>
</section>

<section class="section section--pink">
  <div class="container">
    {section_head("Cómo trabajamos", "Tu proyecto <span class='outline'>en 4 fases</span>", "Claridad desde el primer día: sabes qué se hace, cuánto cuesta y cuándo estará listo.", True)}
    <div class="process">{process([("Hablamos", "Nos cuentas tu idea por WhatsApp, teléfono o formulario."), ("Valoramos", "Vemos el coche y te damos un presupuesto claro."), ("Trabajamos", "Manos a la obra, con fotos y vídeos del avance."), ("Disfrutas", "Entrega, ajustes y seguimiento. Nos vemos en la pista.")])}</div>
  </div>
</section>

<section class="section section--ink" id="presupuesto">
  <div class="container form-wrap">
    <div class="reveal">
      <span class="eyebrow">Presupuesto en 60 segundos</span>
      <h2>Arranca <span class="outline">tu proyecto</span></h2>
      <p class="lead mt-2">Tres pasos rápidos y te llamamos con una propuesta. Sin compromiso.</p>
      {contact_list()}
    </div>
    <div class="form-card reveal" data-delay="1" data-form-wrap>
      <form class="form-body" data-lead="presupuesto-home" data-steps novalidate>
        <div class="stepper" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="fstep">
          <div class="fstep__title">¿Qué quieres hacer?</div>
          <p class="fstep__sub">Paso 1 de 3 · Elige una opción</p>
          <div class="choice-grid">{choice_html}</div>
          <div class="fstep__nav"><span></span><button class="btn" type="button" data-next>Siguiente {I['arrow']}</button></div>
        </div>
        <div class="fstep">
          <div class="fstep__title">Tu coche y tu idea</div>
          <p class="fstep__sub">Paso 2 de 3 · Cuanto más nos cuentes, mejor</p>
          <div class="form-grid">
            <div class="field"><label for="h-veh">Vehículo</label><input class="input" id="h-veh" name="vehiculo" placeholder="Marca y modelo"></div>
            <div class="field"><label for="h-anio">Año</label><input class="input" id="h-anio" name="anio" inputmode="numeric" placeholder="Ej. 1998"></div>
            <fieldset class="pills full">{legend("Presupuesto aproximado")}{pills("presupuesto", ["< 3.000 €", "3.000 – 10.000 €", "10.000 – 30.000 €", "> 30.000 €", "Aún no lo sé"])}</fieldset>
            <fieldset class="pills full">{legend("¿Para cuándo?")}{pills("plazo", ["Lo antes posible", "1 – 3 meses", "Próxima temporada", "Sin prisa"])}</fieldset>
            <div class="field full"><label for="h-msg">Cuéntanos más</label><textarea class="textarea" id="h-msg" name="mensaje" placeholder="Objetivos, campeonato, color, piezas…"></textarea></div>
          </div>
          <div class="fstep__nav"><button class="btn btn--ghost" type="button" data-prev>Atrás</button><button class="btn" type="button" data-next>Siguiente {I['arrow']}</button></div>
        </div>
        <div class="fstep">
          <div class="fstep__title">¿Dónde te contactamos?</div>
          <p class="fstep__sub">Paso 3 de 3 · Último paso</p>
          <div class="form-grid">
            <div class="field full"><label for="h-n">Nombre <span class="req">*</span></label><input class="input" id="h-n" name="nombre" autocomplete="name" required placeholder="Tu nombre"></div>
            <div class="field"><label for="h-t">Teléfono <span class="req">*</span></label>{tel_input("h-t")}</div>
            <div class="field"><label for="h-e">Email</label><input class="input" id="h-e" name="email" type="email" autocomplete="email" placeholder="tu@email.com"></div>
            {consent()}
          </div>
          <div class="fstep__nav"><button class="btn btn--ghost" type="button" data-prev>Atrás</button><button class="btn" type="submit">Enviar {I['arrow']}</button></div>
          <div class="form-msg" role="alert"></div>
        </div>
      </form>
      {success_block()}
    </div>
  </div>
</section>

{molar_block()}

{sponsors_strip()}

{social_wall()}

<section class="section section--ink">
  <div class="container">
    {section_head("Preguntas frecuentes", "Antes de <span class='outline'>arrancar</span>")}
    {faq(home_faq)}
  </div>
</section>

{mega_cta("¿Arrancamos <span class='outline'>motores?</span>", "Escríbenos por WhatsApp, llámanos o pide presupuesto. Te respondemos en menos de 24 h laborables.", "")}
"""
    return html + footer()


# ------------------------------------------------------------------ nosotros / contacto / legal
def nosotros():
    html = head("Quiénes somos · Deyscom Motorsport, taller motorsport en Torrelaguna (Madrid)",
                "Conoce Deyscom Motorsport: un equipo de apasionados del motor en Torrelaguna (Madrid) especializado en competición, restomod, pintura, banco de potencia, experiencias y formación.",
                "nosotros", "vuestro taller", "peugeot-206-preparacion-rally-taller-torrelaguna", [breadcrumbs_ld("nosotros", "Quiénes somos")]) + header("nosotros")
    html += hero("Quiénes somos", ["Pasión", "<span class='pink'>con</span>", "<span class='outline'>octanaje</span>"],
                 "Somos Deyscom Motorsport, un taller de Torrelaguna (Madrid) donde la competición, la restauración y la preparación se viven a fondo, sin atajos.",
                 "DM", "peugeot-206-preparacion-rally-taller-torrelaguna", ["Torrelaguna · Madrid", "Taller motorsport", "Clientes de toda España"], "vuestro taller", ("Habla con nosotros", "contacto.html"))
    html += ticker(["Pasión", "Detalle", "Honestidad", "Velocidad", "Equipo", "Carácter"], dark=True)
    html += f"""<section class="section">
  <div class="container">
    {split("Nuestra historia", "Del <span class='pink'>paddock</span> al taller",
           "<p class='lead'>Deyscom Motorsport nació de las ganas de hacer las cosas a nuestra manera: con tiempo, con cariño y con la exigencia de quien también se pone el casco.</p>"
           "<p class='muted'>Hoy preparamos coches de competición, damos vida a restomods, pintamos, medimos en banco de potencia y llevamos a nuevos pilotos y copilotos a vivir la competición desde dentro. Lo hacemos desde nuestra nave en Torrelaguna, con trato cercano y comunicación constante.</p>"
           "<p class='muted'>Compartimos cada proyecto en redes porque estamos orgullosos de lo que hacemos y porque creemos que la transparencia es la mejor garantía.</p>",
           "STORY", "bmw-e36-compact-competicion-taller", "Desde Torrelaguna")}
  </div>
</section>
<section class="section section--ink">
  <div class="container">
    {section_head("Valores", "Lo que <span class='outline'>nos mueve</span>", "Las reglas que aplicamos a cada coche que entra por la puerta.")}
    {cards([
        ("helmet", "Lo vivimos", "Somos pilotos, aficionados y mecánicos. Entendemos lo que significa tu coche."),
        ("eye", "Transparencia", "Fotos, vídeos y presupuestos claros. Sabes en todo momento qué se hace."),
        ("shield", "Seguridad", "En competición y en calle, la seguridad nunca es negociable."),
        ("star", "Detalle", "Lo que no se ve importa tanto como lo que se ve."),
        ("grad", "Formación", "Compartimos lo que sabemos con cursos y experiencias."),
        ("flag", "Compromiso", "Plazos realistas y palabra cumplida."),
    ])}
  </div>
</section>
{team_block()}
{molar_block()}
{sponsors_strip("Patrocinadores")}
<section class="section">
  <div class="container">
    {section_head("El taller", "Nuestra <span class='outline'>casa</span>", "Nave 3, Canal de Isabel II, Torrelaguna. Ven a vernos (mejor con cita previa).")}
    {gallery([("nave-taller-deyscom-coches-competicion", "La nave"), ("soldadura-chispas-taller-deyscom", "Manos a la obra"),
              ("elevadores-taller-deyscom-torrelaguna", "Zona de elevadores"), ("mazda-mx5-preparacion-taller-deyscom", "Coches de cliente"),
              ("jeep-wrangler-elevador-taller-deyscom", "4x4 en el elevador"), ("mecanicos-deyscom-box-resistencia", "En el box"),
              ("equipo-deyscom-motorsport-circuito", "El equipo"), ("bmw-clasicos-restomod-taller-deyscom", "Clásicos")], "DEYSCOM")}
  </div>
</section>
{social_wall()}
{mega_cta("Ven a <span class='outline'>conocernos</span>", "Pide cita y tómate un café con nosotros mientras hablamos de tu coche.", "visitar el taller", ("Contactar", "contacto.html"))}
"""
    return html + footer()


def contacto():
    html = head("Contacto · Deyscom Motorsport | Taller en Torrelaguna, Madrid",
                "Contacta con Deyscom Motorsport: (+34) 615 97 22 33 · info@deyscom.com · C/ Canal de Isabel II, 2 Nave 3, 28180 Torrelaguna (Madrid). Lunes a viernes 07:00-15:00.",
                "contacto", "un presupuesto", "og", [breadcrumbs_ld("contacto", "Contacto")]) + header("contacto")
    opts = ["Competición", "Restomod", "Pintura", "Banco de potencia", "Experiencia DS Pilot Weekend", "DS Copilot Course", "Tienda / compra", "Otro"]
    sel = "".join(f'<option value="{o}">{o}</option>' for o in opts)
    html += f"""<section class="hero page-hero" style="min-height:52svh">
  <div class="hero__bg"></div><div class="hero__grid"></div><div class="hero__speed" aria-hidden="true"></div>
  <div class="hero__number" aria-hidden="true">GO</div>
  <div class="container hero__inner">
    <span class="eyebrow">Contacto</span>
    <h1><span class="line"><span>Hablemos</span></span><span class="line"><span class="outline">de motor</span></span></h1>
    <div class="btn-row mt-2">
      <a class="btn btn--wa" data-wa="" data-loc="contact-hero" href="#">{I['wa']} WhatsApp</a>
      <a class="btn" href="tel:{PHONE}">{I['phone']} {PHONE_TXT}</a>
      <a class="btn btn--ghost" href="mailto:{EMAIL}">{I['mail']} {EMAIL}</a>
    </div>
  </div>
</section>
<section class="section" id="presupuesto">
  <div class="container form-wrap">
    <div class="reveal">
      <span class="eyebrow">Datos de contacto</span>
      <h2>Te <span class="outline">esperamos</span></h2>
      <ul class="contact-list">
        <li><span class="ic">{I['phone']}</span><div><small>Teléfono</small><a href="tel:{PHONE}">{PHONE_TXT}</a></div></li>
        <li><span class="ic">{I['wa']}</span><div><small>WhatsApp</small><a data-wa="" data-loc="contact-list" href="#">Escríbenos ahora</a></div></li>
        <li><span class="ic">{I['mail']}</span><div><small>Email</small><a href="mailto:{EMAIL}">{EMAIL}</a></div></li>
        <li><span class="ic">{I['pin']}</span><div><small>Ubicación</small><a href="https://www.google.com/maps/search/?api=1&query=Calle+Canal+de+Isabel+II+2+Torrelaguna" target="_blank" rel="noopener">C/ Canal de Isabel II, 2 · Nave 3<br>28180 Torrelaguna · Madrid</a></div></li>
        <li><span class="ic">{I['clock']}</span><div style="width:100%"><small>Horario de apertura</small>{hours_table()}</div></li>
      </ul>
      <div class="mt-3">{social_links()}</div>
    </div>
    <div class="form-card reveal" data-delay="1" data-form-wrap>
      <form class="form-body" data-lead="contacto" novalidate>
        <div class="fstep__title">Pide presupuesto</div>
        <p class="fstep__sub">Te respondemos en menos de 24 h laborables.</p>
        <div class="form-grid">
          <div class="field"><label for="c-n">Nombre <span class="req">*</span></label><input class="input" id="c-n" name="nombre" autocomplete="name" required placeholder="Tu nombre"></div>
          <div class="field"><label for="c-t">Teléfono <span class="req">*</span></label>{tel_input("c-t")}</div>
          <div class="field"><label for="c-e">Email</label><input class="input" id="c-e" name="email" type="email" autocomplete="email" placeholder="tu@email.com"></div>
          <div class="field"><label for="c-s">Servicio <span class="req">*</span></label><select class="select input" id="c-s" name="servicio" required><option value="">Elige…</option>{sel}</select></div>
          <div class="field full"><label for="c-v">Vehículo</label><input class="input" id="c-v" name="vehiculo" placeholder="Marca, modelo y año"></div>
          <div class="field full"><label for="c-m">Mensaje <span class="req">*</span></label><textarea class="textarea" id="c-m" name="mensaje" required placeholder="Cuéntanos tu proyecto"></textarea></div>
          {consent()}
        </div>
        <div class="form-foot mt-2"><button class="btn" type="submit">Enviar solicitud {I['arrow']}</button><small>🔒 Datos protegidos</small></div>
        <div class="form-msg" role="alert"></div>
      </form>
      {success_block()}
    </div>
  </div>
</section>
<section class="section section--tight section--ink">
  <div class="container">
    <div class="map reveal"><iframe title="Mapa de Deyscom Motorsport en Torrelaguna" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
      src="https://www.google.com/maps?q=Calle+Canal+de+Isabel+II+2,+28180+Torrelaguna,+Madrid&output=embed"></iframe></div>
    <div class="btn-row mt-2"><a class="btn btn--ghost" href="https://www.google.com/maps/dir/?api=1&destination=Calle+Canal+de+Isabel+II+2,+28180+Torrelaguna,+Madrid" target="_blank" rel="noopener">{I['pin']} Cómo llegar</a></div>
  </div>
</section>
"""
    return html + footer()


# ------------------------------------------------------------------ textos legales
COMPANY = dict(
    name="DEYSCOM MOTORSPORT, S.L.", trade="Deyscom Motorsport", cif="B09939471",
    address="C/ Canal de Isabel II, 2, Nave 3, 28180 Torrelaguna (Madrid), España",
    registry="Inscrita en el Registro Mercantil de Madrid, hoja M-764451",
)
LEGAL_UPDATED = "12 de octubre de 2026"
# Política de cancelación de experiencias y cursos (editable por Deyscom)
CANCEL_POLICY = [
    "Con más de 30 días de antelación a la fecha: devolución del 100 % del importe abonado.",
    "Entre 30 y 15 días antes: devolución del 50 % o cambio a otra fecha disponible sin coste.",
    "Con menos de 15 días: no hay devolución, salvo que la plaza la ocupe otra persona; puedes ceder tu plaza a quien quieras avisándonos antes.",
    "Si Deyscom cancela por causas organizativas, meteorológicas o de seguridad, te ofreceremos una nueva fecha o la devolución íntegra.",
]


def legal_page(slug, title, desc, h1, body):
    html = head(title, desc, slug, "información legal", "og", [breadcrumbs_ld(slug, h1.replace("<span class='outline'>", "").replace("</span>", ""))]) + header(slug)
    html = html.replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex, follow">')
    nav = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == slug + ".html" else ""}>{t}</a>' for h, t in [
        ("aviso-legal.html", "Aviso legal"), ("politica-privacidad.html", "Privacidad"), ("politica-cookies.html", "Cookies"), ("condiciones-compra.html", "Condiciones de compra")])
    html += f"""<section class="section legal">
  <div class="container prose" style="max-width:880px">
    <nav class="legal-nav" aria-label="Textos legales">{nav}</nav>
    <span class="eyebrow">Legal · Actualizado el {LEGAL_UPDATED}</span>
    <h1 class="legal__title">{h1}</h1>
    {body}
  </div>
</section>
"""
    return html + footer()


def company_box():
    c = COMPANY
    return (f'<div class="legal-box"><p><strong>Titular:</strong> {c["name"]} ({c["trade"]})<br><strong>CIF:</strong> {c["cif"]}<br>'
            f'<strong>Domicilio social:</strong> {c["address"]}<br><strong>Datos registrales:</strong> {c["registry"]}<br>'
            f'<strong>Email:</strong> <a href="mailto:{EMAIL}">{EMAIL}</a> · <strong>Teléfono:</strong> {PHONE_TXT}</p></div>')


def legal_pages():
    pages = {}
    pages["aviso-legal"] = legal_page("aviso-legal", "Aviso legal | Deyscom Motorsport", "Aviso legal de deyscom.com: datos identificativos de DEYSCOM MOTORSPORT, S.L., condiciones de uso, propiedad intelectual y responsabilidad.",
        "Aviso <span class='outline'>legal</span>", f"""
<h2>1. Datos identificativos</h2>
<p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos del titular de este sitio web:</p>
{company_box()}
<h2>2. Objeto y condiciones de uso</h2>
<p>Este sitio web informa sobre los servicios de taller de Deyscom Motorsport (preparación de coches de competición, restomod, pintura y banco de potencia), sus experiencias de conducción, sus cursos y su tienda, y permite contactar y solicitar presupuestos, reservas y pedidos. El acceso a la web es gratuito y atribuye la condición de usuario, que acepta este aviso legal. El usuario se compromete a hacer un uso adecuado de los contenidos, a no emplearlos para actividades ilícitas y a facilitar datos veraces en los formularios.</p>
<h2>3. Propiedad intelectual e industrial</h2>
<p>Los textos, fotografías, diseños, logotipos, marcas y demás contenidos de esta web son titularidad de DEYSCOM MOTORSPORT, S.L. o de terceros que han autorizado su uso (incluidos fotógrafos y patrocinadores). Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa. Las marcas y logotipos de los patrocinadores pertenecen a sus respectivos titulares.</p>
<h2>4. Responsabilidad</h2>
<p>Deyscom Motorsport trabaja para que la información de la web sea correcta y esté actualizada, pero no garantiza la ausencia de errores ni de interrupciones del servicio. Los precios, plazos y programas de experiencias y cursos son orientativos hasta su confirmación expresa. Los artículos del blog tienen carácter divulgativo y no sustituyen a los reglamentos oficiales ni al asesoramiento profesional.</p>
<h2>5. Enlaces externos</h2>
<p>La web puede incluir enlaces a sitios de terceros (redes sociales, Wallapop, patrocinadores, federaciones). Deyscom Motorsport no se responsabiliza de sus contenidos ni de sus políticas de privacidad.</p>
<h2>6. Legislación aplicable y jurisdicción</h2>
<p>Este aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan conforme a derecho; cuando el usuario sea consumidor, serán competentes los de su domicilio.</p>
""")
    pages["politica-privacidad"] = legal_page("politica-privacidad", "Política de privacidad | Deyscom Motorsport", "Cómo trata DEYSCOM MOTORSPORT, S.L. tus datos personales: finalidades, base legal, conservación, destinatarios, transferencias y tus derechos según el RGPD.",
        "Política de <span class='outline'>privacidad</span>", f"""
<p>En DEYSCOM MOTORSPORT, S.L. tratamos tus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).</p>
<h2>1. Responsable del tratamiento</h2>
{company_box()}
<h2>2. Qué datos tratamos</h2>
<p>Los que nos facilitas en los formularios, por WhatsApp, teléfono o email: nombre, teléfono, email, datos del vehículo, preferencias de reserva o pedido, dirección de envío y el contenido de tu mensaje. Además, datos técnicos de navegación según tus preferencias de cookies (ver la <a href="politica-cookies.html">política de cookies</a>) y el origen de tu visita (por ejemplo, la campaña desde la que llegas), que se guarda solo durante tu sesión y se adjunta a tu solicitud.</p>
<h2>3. Finalidades y base legal</h2>
<div class="table-wrap"><table class="cookie-table">
<thead><tr><th>Finalidad</th><th>Base legal</th><th>Conservación</th></tr></thead>
<tbody>
<tr><td>Responder a consultas y solicitudes de presupuesto</td><td>Consentimiento (art. 6.1.a RGPD) y medidas precontractuales (art. 6.1.b)</td><td>Hasta resolver la consulta y, como máximo, 12 meses si no hay contratación</td></tr>
<tr><td>Gestionar reservas de experiencias, cursos y pedidos de la tienda, incluida la emisión del diploma del curso</td><td>Ejecución del contrato (art. 6.1.b RGPD)</td><td>Durante la relación y después los plazos legales (fiscales y mercantiles, hasta 6 años)</td></tr>
<tr><td>Prestar servicios de taller y emitir facturas</td><td>Ejecución del contrato y obligación legal (art. 6.1.b y 6.1.c)</td><td>Plazos legales de conservación</td></tr>
<tr><td>Analítica de la web y medición de campañas</td><td>Consentimiento (art. 6.1.a), a través del aviso de cookies</td><td>Según la política de cookies</td></tr>
<tr><td>Enviarte novedades de cursos y experiencias si lo solicitas</td><td>Consentimiento (art. 6.1.a)</td><td>Hasta que retires el consentimiento</td></tr>
</tbody></table></div>
<p>Los campos marcados con asterisco son obligatorios: sin ellos no podremos atender tu solicitud. No tomamos decisiones automatizadas ni elaboramos perfiles con efectos jurídicos sobre ti.</p>
<h2>4. Destinatarios y encargados del tratamiento</h2>
<p>No cedemos tus datos a terceros salvo obligación legal o cuando sea necesario para prestar el servicio que pides (por ejemplo, la inscripción en una prueba federada ante la organización y la federación correspondiente, o la empresa de transporte de un pedido). Trabajan con nosotros como encargados del tratamiento, con contrato y garantías adecuadas:</p>
<ul>
<li><strong>Google Ireland Ltd.</strong> (Google Workspace / Sheets y, si los aceptas, Google Analytics y Google Ads), donde se almacenan las solicitudes enviadas por la web.</li>
<li><strong>Proveedor de alojamiento web</strong> de deyscom.com.</li>
<li><strong>Pasarela de pago</strong>, cuando pagues online (por ejemplo Stripe o PayPal).</li>
<li><strong>WhatsApp (Meta Platforms Ireland Ltd.)</strong>, únicamente si decides contactar por WhatsApp.</li>
</ul>
<h2>5. Transferencias internacionales</h2>
<p>Algunos proveedores (Google, Meta, pasarelas de pago) pueden tratar datos fuera del Espacio Económico Europeo. En ese caso se amparan en el Marco de Privacidad de Datos UE-EE. UU. o en cláusulas contractuales tipo aprobadas por la Comisión Europea.</p>
<h2>6. Tus derechos</h2>
<p>Puedes ejercer tus derechos de <strong>acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad</strong>, y <strong>retirar tu consentimiento</strong> en cualquier momento, escribiendo a <a href="mailto:{EMAIL}">{EMAIL}</a> o por correo postal a nuestro domicilio social, indicando el derecho que ejerces. Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la <a href="https://www.aepd.es" target="_blank" rel="noopener">Agencia Española de Protección de Datos</a>.</p>
<h2>7. Menores de edad</h2>
<p>La web no está dirigida a menores de 14 años. Para participar en experiencias de conducción es necesario ser mayor de edad y cumplir los requisitos indicados en cada una.</p>
<h2>8. Seguridad</h2>
<p>Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no autorizados, pérdida o alteración.</p>
<h2>9. Cambios en esta política</h2>
<p>Podemos actualizar esta política para adaptarla a cambios legales o de nuestros servicios. Publicaremos siempre la versión vigente con su fecha de actualización.</p>
""")
    pages["politica-cookies"] = legal_page("politica-cookies", "Política de cookies | Deyscom Motorsport", "Qué cookies utiliza deyscom.com, para qué sirven, cuánto duran y cómo configurarlas. Modo de consentimiento v2 de Google aplicado.",
        "Política de <span class='outline'>cookies</span>", f"""
<p>Una cookie es un pequeño archivo que la web guarda en tu navegador. Usamos <strong>cookies y almacenamiento técnico</strong>, necesarios para que la web funcione, y solo con tu consentimiento <strong>cookies de analítica y publicidad</strong> de terceros. Aplicamos el <strong>modo de consentimiento v2 de Google</strong>: hasta que aceptas, las herramientas de Google funcionan sin cookies de analítica ni de publicidad.</p>
<h2>Responsable</h2>
{company_box()}
<h2>Cookies que utilizamos</h2>
<div class="table-wrap"><table class="cookie-table">
<thead><tr><th>Nombre</th><th>Titular</th><th>Finalidad</th><th>Tipo</th><th>Duración</th></tr></thead>
<tbody>
<tr><td>dm_consent</td><td>Deyscom</td><td>Recordar tu elección sobre cookies</td><td>Técnica (almacenamiento local)</td><td>13 meses</td></tr>
<tr><td>dm_utm_*, dm_landing, dm_referrer</td><td>Deyscom</td><td>Saber desde dónde llegaste cuando envías un formulario</td><td>Técnica (sesión)</td><td>Hasta cerrar el navegador</td></tr>
<tr><td>_ga, _ga_*</td><td>Google Analytics</td><td>Estadísticas de uso de la web</td><td>Analítica · requiere consentimiento</td><td>Hasta 2 años</td></tr>
<tr><td>_gcl_au y similares</td><td>Google Ads</td><td>Medir la conversión de nuestras campañas</td><td>Publicidad · requiere consentimiento</td><td>Hasta 90 días</td></tr>
</tbody></table></div>
<p>El mapa de la página de contacto se carga desde Google Maps, que puede usar sus propias cookies cuando interactúas con él. La lista de cookies de terceros puede variar según las herramientas activas; la mantendremos actualizada.</p>
<h2>Cómo gestionar o retirar tu consentimiento</h2>
<p>Puedes cambiar tu elección en cualquier momento desde <button type="button" class="linklike pink" data-cc-open>Configurar cookies</button> (también disponible en el pie de todas las páginas). Además, puedes borrar o bloquear las cookies desde la configuración de tu navegador; si bloqueas las técnicas, algunas funciones de la web pueden no funcionar.</p>
""")
    cancel = "".join(f"<li>{x}</li>" for x in CANCEL_POLICY)
    pages["condiciones-compra"] = legal_page("condiciones-compra", "Condiciones de compra y reserva | Deyscom Motorsport", "Condiciones de compra de la tienda Deyscom Motorsport y de reserva de experiencias y cursos: precios, pago, envíos, desistimiento, cancelaciones y garantía.",
        "Condiciones de <span class='outline'>compra</span>", f"""
<p>Estas condiciones regulan la compra de productos de la tienda y la reserva de experiencias y cursos de Deyscom Motorsport a través de esta web, WhatsApp, teléfono o email, conforme al Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores y Usuarios) y la LSSI-CE.</p>
<h2>1. Vendedor</h2>
{company_box()}
<h2>2. Proceso de compra o reserva</h2>
<p>Seleccionas el producto, experiencia o curso y envías tu solicitud. Te confirmamos por WhatsApp o email la disponibilidad, el precio final, la forma de pago y la entrega o fecha. El contrato queda perfeccionado cuando aceptas la confirmación y realizas el pago. Te enviaremos justificante de la compra.</p>
<h2>3. Precios y pago</h2>
<p>Los precios se indican en euros e incluyen el IVA. Los gastos de envío, si los hay, se comunican antes de confirmar. El pago puede realizarse por transferencia, Bizum, tarjeta a través de pasarela segura o en el taller, según se indique en la confirmación.</p>
<h2>4. Envíos y recogida</h2>
<p>Puedes recoger tu pedido en el taller (C/ Canal de Isabel II, 2, Nave 3, Torrelaguna) en horario de lunes a viernes de 07:00 a 15:00, o recibirlo en tu domicilio en España. El plazo estimado de entrega se indica en la confirmación y, salvo acuerdo distinto, no superará los 30 días.</p>
<h2>5. Derecho de desistimiento (tienda)</h2>
<p>Si eres consumidor, dispones de <strong>14 días naturales</strong> desde la recepción del producto para desistir de la compra sin necesidad de justificación. Comunícanoslo por escrito a <a href="mailto:{EMAIL}">{EMAIL}</a> (puedes usar el modelo de abajo) y devuélvenos el producto sin usar y en su estado original en los 14 días siguientes. Te reembolsaremos el importe, incluidos los gastos de envío estándar, en un máximo de 14 días desde que recibamos tu comunicación, por el mismo medio de pago. Los gastos de devolución corren de tu cuenta. No se admite el desistimiento de productos personalizados.</p>
<div class="legal-box"><p><strong>Modelo de desistimiento:</strong> «A la atención de DEYSCOM MOTORSPORT, S.L., C/ Canal de Isabel II, 2, Nave 3, 28180 Torrelaguna (Madrid), {EMAIL}: le comunico que desisto de mi contrato de compra del siguiente producto: [producto], pedido el [fecha] / recibido el [fecha]. Nombre, dirección, firma (solo en papel) y fecha.»</p></div>
<h2>6. Experiencias y cursos</h2>
<p>Las experiencias DS Pilot Weekend y el DS Copilot Course son servicios de ocio y formación con fecha determinada, por lo que, conforme al artículo 103.l) del RDL 1/2007, <strong>no les es aplicable el derecho de desistimiento</strong>. Se aplica la siguiente política de cancelación:</p>
<ul>{cancel}</ul>
<p><strong>Requisitos:</strong> para conducir es necesario ser mayor de edad, tener carnet de conducir en vigor y, en pruebas federadas, la licencia correspondiente (te ayudamos a tramitarla). Debes seguir en todo momento las indicaciones de seguridad del equipo y de la organización. Deyscom podrá excluir de la actividad a quien ponga en riesgo su seguridad o la de terceros. Antes de la experiencia te informaremos de las condiciones de uso del coche, del seguro y, en su caso, de la fianza.</p>
<h2>7. Garantía</h2>
<p>Los productos tienen la garantía legal de conformidad de <strong>3 años</strong> desde la entrega prevista en la normativa de consumo. Si un producto llega dañado o no es conforme, escríbenos y lo sustituiremos, repararemos o reembolsaremos.</p>
<h2>8. Atención al cliente y reclamaciones</h2>
<p>Puedes contactar con nosotros en <a href="mailto:{EMAIL}">{EMAIL}</a> o en el {PHONE_TXT}. Disponemos de hojas de reclamaciones a disposición de los consumidores. También puedes acudir a la Junta Arbitral de Consumo de la Comunidad de Madrid.</p>
<h2>9. Legislación aplicable</h2>
<p>Estas condiciones se rigen por la legislación española. Si eres consumidor, serán competentes los juzgados de tu domicilio.</p>
""")
    return pages


# ------------------------------------------------------------------ patrocinadores, equipo y blog
from blog_posts import AUTHORS, POSTS  # noqa: E402

SPONSORS = [
    ("EBC Frenos", "ebc-frenos.png", None),
    ("HEL Performance", "hel-performance.png", None),
    ("Mishimoto", "mishimoto.png", None),
    ("King Elements", "king-elements.png", "https://www.kingelements.com/es/"),
]


def sponsors_strip(title="Nos acompañan"):
    items = ""
    for name, f, url in SPONSORS:
        exists = (ROOT / "assets/img/patrocinadores" / f).exists()
        inner = (f'<img src="assets/img/patrocinadores/{f}" alt="Logotipo de {name}, patrocinador de Deyscom Motorsport" loading="lazy">'
                 if exists else f'<span class="sponsor__name">{name}</span>')
        tag = "a" if url else "div"
        attrs = f' href="{url}" target="_blank" rel="noopener sponsored"' if url else ""
        items += f'<{tag} class="sponsor reveal"{attrs} title="{name}">{inner}</{tag}>'
    return f"""<section class="section section--tight sponsors-sec">
  <div class="container">
    {section_head("Patrocinadores", title + " <span class='outline'>en pista</span>", "Marcas que confían en Deyscom Motorsport y nos ayudan a competir.")}
    <div class="sponsors">{items}</div>
  </div>
</section>"""


def molar_block():
    return f"""<section class="section molar">
  <div class="container split">
    <div class="reveal">
      <span class="eyebrow">Nuestro primer rally · 2026</span>
      <h2>II Rallye Comunidad de Madrid <span class="outline">El Molar</span></h2>
      <div class="mt-2">
        <p class="lead">En 2026 Néstor Aguado y Héctor Guzmán corrieron juntos su primer rally con el Peugeot 206 del equipo: verificaciones, tramos de tierra, polvo, asistencia y la emoción de cruzar la meta.</p>
        <p class="muted">Todo lo que aprendimos ese fin de semana está detrás de nuestras experiencias DS Pilot Weekend, del DS Copilot Course y de la edición especial que hemos creado para celebrarlo.</p>
        <div class="btn-row mt-2"><a class="btn" href="camiseta-edicion-especial-el-molar-2026.html">{I['bag']} Edición especial El Molar 2026</a><a class="btn btn--ghost" href="ds-pilot-weekend-rally.html">Corre tu primer rally</a></div>
      </div>
    </div>
    <div class="split__media reveal" data-delay="1">{art("EL MOLAR", "50%", "35%", "peugeot-206-rally-el-molar-tramo", "El Molar 2026")}<span class="split__tag">El Molar · 2026</span></div>
  </div>
</section>"""


def team_block():
    roles = [("wrench", "Mecánica y preparación", "Motores, transmisiones, suspensiones y montaje de coches de competición."),
             ("spray", "Chapa y pintura", "Cabina de pintura, chasis, carrocería y decoraciones."),
             ("truck", "Asistencia en carrera", "El equipo que se desplaza con los coches a rallies y circuitos."),
             ("gauge", "Banco y puesta a punto", "Mediciones, diagnóstico y ajustes con datos reales."),
             ("grad", "Formación y experiencias", "Profesores, copilotos y pilotos de nuestras experiencias y cursos."),
             ("mic", "Comunicación", "Fotos, vídeos y redes para contar cada proyecto.")]
    roles_html = "".join(f'<li><span class="ic">{I[ic]}</span><div><b>{t}</b><span>{d}</span></div></li>' for ic, t, d in roles)
    leads = "".join(f'<span class="lead-person" id="{AUTHORS[k]["anchor"]}"><b>{AUTHORS[k]["name"]}</b> · {AUTHORS[k]["role"]}</span>' for k in ("nestor", "hector"))
    photos = "".join(f'<figure class="team-photos__item reveal">{pic(n, sizes="(max-width: 760px) 100vw, 50vw")}</figure>'
                     for n in ("equipo-deyscom-motorsport-atardecer", "equipo-deyscom-motorsport-circuito", "mecanicos-deyscom-box-resistencia"))
    return f"""<section class="section section--ink">
  <div class="container">
    {section_head("El equipo", "Mucha gente <span class='outline'>detrás</span>", "Deyscom no es una persona: es un equipo de mecánicos, preparadores, chapistas, pintores, técnicos de asistencia, formadores y gente de comunicación que vive el motor cada día, en el taller y en las carreras.")}
    <div class="team">
      <div class="team-photos">{photos}</div>
      <div class="reveal">
        <ul class="team-roles">{roles_html}</ul>
        <div class="team-leads"><span class="eyebrow">Al frente</span>{leads}</div>
      </div>
    </div>
  </div>
</section>"""


def person_ld(k):
    a = AUTHORS[k]
    return {"@type": "Person", "name": a["name"], "jobTitle": a["role"], "url": f"{SITE}/nosotros.html#{a['anchor']}",
            "worksFor": {"@id": SITE + "/#organizacion"}}


def fmt_date(d):
    meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
    y, m, dd = d.split("-")
    return f"{int(dd)} de {meses[int(m) - 1]} de {y}"


def post_card(pst, big=False):
    a = AUTHORS[pst["author"]]
    return f"""<a class="post-card reveal{" post-card--big" if big else ""}" href="{pst['slug']}.html">
  <div class="post-card__media">{art(pst['category'].upper(), "60%", "30%", pst['img'], pst['title'], "(max-width: 900px) 100vw, 50vw")}</div>
  <div class="post-card__body">
    <span class="post-card__cat">{pst['category']} · {pst['minutes']} min</span>
    <h3>{pst['title']}</h3>
    <p>{pst['desc']}</p>
    <span class="post-card__meta">{a['name']} · {fmt_date(pst['date'])}</span>
  </div>
</a>"""


def blog_index():
    items = "".join(post_card(pp, i == 0) for i, pp in enumerate(POSTS))
    blog_ld = {"@context": "https://schema.org", "@type": "Blog", "name": "Blog de Deyscom Motorsport", "url": f"{SITE}/blog.html",
               "inLanguage": "es-ES", "publisher": {"@id": SITE + "/#organizacion"},
               "blogPost": [{"@type": "BlogPosting", "headline": pp["title"], "url": f"{SITE}/{pp['slug']}.html", "datePublished": pp["date"]} for pp in POSTS]}
    html = head("Blog de motorsport · Rally, copilotos, banco de potencia y restomod | Deyscom Motorsport",
                "Guías y experiencia real del taller Deyscom Motorsport: cómo empezar en los rallies, qué hace un copiloto, cómo leer una curva de banco de potencia y qué es un restomod.",
                "blog", "el blog", POSTS[0]["img"], [blog_ld, breadcrumbs_ld("blog", "Blog")],
                "blog motorsport, blog rally, consejos rally, copiloto de rally, banco de potencia, restomod") + header("blog")
    html += f"""<section class="hero page-hero" style="min-height:46svh">
  <div class="hero__bg">{pic(POSTS[0]['img'], eager=True, sizes='100vw')}</div><div class="hero__grid"></div><div class="hero__speed" aria-hidden="true"></div>
  <div class="container hero__inner">
    <span class="eyebrow">Blog Deyscom</span>
    <h1><span class="line"><span>Desde</span></span><span class="line"><span class="outline">el paddock</span></span></h1>
    <p class="lead">Guías prácticas y experiencia real del taller y de nuestras carreras, escritas por el equipo de Deyscom Motorsport.</p>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="posts">{items}</div>
  </div>
</section>
{mega_cta("¿Tienes <span class='outline'>dudas?</span>", "Escríbenos y te ayudamos con tu proyecto, tu primer rally o tu formación como copiloto.", "una consulta del blog")}
"""
    return html + footer()


def blog_post(pst):
    a = AUTHORS[pst["author"]]
    ed = AUTHORS.get(pst.get("editor"))
    toc = "".join(f'<li><a href="#s{i + 1}">{t}</a></li>' for i, (t, _) in enumerate(pst["sections"]))
    body = "".join(f'<h2 id="s{i + 1}">{t}</h2>{c}' for i, (t, c) in enumerate(pst["sections"]))
    words = len(re.sub(r"<[^>]+>", " ", body).split())
    sources = "".join(f'<li><a href="{u}" target="_blank" rel="noopener">{n}</a></li>' for n, u in pst["sources"])
    related = "".join(post_card(x) for x in POSTS if x["slug"] != pst["slug"])
    m = IMG[pst["img"]]
    art_ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": pst["title"], "description": pst["desc"],
              "image": {"@type": "ImageObject", "url": img_url(pst["img"]), "width": m["w"], "height": m["h"]},
              "datePublished": pst["date"], "dateModified": TODAY, "inLanguage": "es-ES", "wordCount": words,
              "articleSection": pst["category"], "keywords": pst["keywords"],
              "author": person_ld(pst["author"]), "publisher": {"@id": SITE + "/#organizacion"},
              "mainEntityOfPage": f"{SITE}/{pst['slug']}.html",
              "citation": [u for _, u in pst["sources"]]}
    if ed:
        art_ld["editor"] = person_ld(pst["editor"])
    html = head(pst["title"] + " | Deyscom Motorsport", pst["desc"], pst["slug"], pst["title"], pst["img"],
                [art_ld, breadcrumbs_ld(pst["slug"], pst["title"], ("blog.html", "Blog")), faq_ld(pst["faq"])], pst["keywords"]) + header(pst["slug"])
    html = html.replace('<meta property="og:type" content="website">', f'<meta property="og:type" content="article">\n<meta property="article:published_time" content="{pst["date"]}">\n<meta property="article:modified_time" content="{TODAY}">\n<meta property="article:author" content="{a["name"]}">\n<meta property="article:section" content="{pst["category"]}">')
    html += f"""<article class="post">
  <header class="post__head">
    <div class="container post__narrow">
      <nav class="crumbs" aria-label="Migas"><a href="index.html">Inicio</a> / <a href="blog.html">Blog</a> / <span>{pst['category']}</span></nav>
      <span class="eyebrow">{pst['category']} · {pst['minutes']} min de lectura</span>
      <h1 class="post__title">{pst['h1']}</h1>
      <p class="lead">{pst['desc']}</p>
      <div class="post__meta">
        <span class="person__avatar person__avatar--sm">{"".join(w[0] for w in a['name'].split()[:2])}</span>
        <div><a href="nosotros.html#{a['anchor']}"><b>{a['name']}</b></a><span>{a['role']}</span>
        <span>Publicado el <time datetime="{pst['date']}">{fmt_date(pst['date'])}</time> · Actualizado el <time datetime="{TODAY}">{fmt_date(TODAY)}</time>{f" · Edición: {ed['name']}" if ed else ""}</span></div>
      </div>
    </div>
  </header>
  <div class="container post__narrow">
    <figure class="post__hero">{pic(pst['img'], eager=True, sizes="(max-width: 900px) 100vw, 860px")}<figcaption>{IMG[pst['img']]['alt']}</figcaption></figure>
    <aside class="tldr" aria-label="Respuesta rápida"><span class="tldr__lbl">{I['bolt']} Respuesta rápida</span><p>{pst['tldr']}</p></aside>
    <nav class="toc" aria-label="Índice"><b>En este artículo</b><ol>{toc}</ol></nav>
    <div class="prose post__body">{body}
      <h2 id="faq">Preguntas frecuentes</h2>
      {faq(pst['faq'])}
      <h2 id="fuentes">Fuentes y referencias</h2>
      <ul class="sources">{sources}</ul>
      <p class="small muted">Este artículo combina información de fuentes oficiales con la experiencia práctica del taller Deyscom Motorsport. Los reglamentos cambian cada temporada: consulta siempre la normativa vigente.</p>
    </div>
    <aside class="author-box">
      <span class="person__avatar">{"".join(w[0] for w in a['name'].split()[:2])}</span>
      <div><span class="eyebrow">Sobre el autor</span><h3>{a['name']}</h3><span class="person__role">{a['role']}</span><p>{a['bio']}</p>
      <a class="pink" href="nosotros.html#{a['anchor']}">Conoce al equipo {I['arrow']}</a></div>
    </aside>
  </div>
</article>
<section class="section section--ink section--tight">
  <div class="container">
    {section_head("Sigue leyendo", "Más del <span class='outline'>blog</span>")}
    <div class="posts posts--3">{related}</div>
  </div>
</section>
{mega_cta("¿Hablamos de <span class='outline'>tu proyecto?</span>", "Escríbenos y te respondemos en menos de 24 h laborables.", pst['title'])}
"""
    return html + footer()


LLMS_TXT = f"""# Deyscom Motorsport

> Taller de motorsport en Torrelaguna (Madrid, España): preparación de coches de competición (rally, slalom, montaña y circuito), restomod y restauración de clásicos y 4x4, pintura y chapa en cabina, banco de potencia, experiencias de pilotaje DS Pilot Weekend y el curso de copiloto DS Copilot Course con certificación.

- Dirección: C/ Canal de Isabel II, 2, Nave 3, 28180 Torrelaguna (Madrid)
- Teléfono y WhatsApp: {PHONE_TXT}
- Email: {EMAIL}
- Horario: lunes a viernes de 07:00 a 15:00; sábado y domingo cerrado
- Propietario: Néstor Aguado. Marketing: Héctor Guzmán.
- Primer rally del equipo: II Rallye Comunidad de Madrid – El Molar 2026, con un Peugeot 206.
- Patrocinadores: EBC Frenos, HEL Performance, Mishimoto, King Elements.

## Servicios
- [Coches de competición]({SITE}/competicion.html): preparación, jaulas de seguridad, set-up, asistencia en carrera y alquiler.
- [Restomod]({SITE}/restomod.html): restauración y modernización de clásicos y todoterrenos por fases.
- [Pintura]({SITE}/pintura.html): pintura en cabina, chapa, chasis y decoraciones de competición.
- [Banco de potencia]({SITE}/banco-de-potencia.html): medición de potencia y par, diagnóstico y comparativas antes/después.

## Experiencias y formación
- [DS Pilot Weekend – Circuit]({SITE}/ds-pilot-weekend-circuit.html): fin de semana como piloto en el Circuito del Jarama.
- [DS Pilot Weekend – Rally]({SITE}/ds-pilot-weekend-rally.html): rally federado con Peugeot 206 1.6 XS (118 CV) o BMW E36 (135 CV).
- [DS Pilot Weekend – Slalom]({SITE}/ds-pilot-weekend-slalom.html): slalom con Peugeot 206 1.6 XS o BMW E36.
- [DS Copilot Course]({SITE}/ds-copilot-course.html): curso de copiloto de rally de fin de semana, teoría y práctica, impartido por un profesor y una profesora, horas prácticas en un tramo cerrado en Guadalajara, con certificación y diploma.

## Tienda
- [Tienda]({SITE}/tienda.html): merchandising oficial (camiseta, sudadera, chaqueta, gorra, pegatinas y edición especial El Molar 2026) y coches en venta en Wallapop.

## Blog
""" + "".join(f"- [{pp['title']}]({SITE}/{pp['slug']}.html): {pp['desc']}\n" for pp in POSTS)


def page_404():
    html = head("Página no encontrada | Deyscom Motorsport", "La página que buscas no existe o ha cambiado de dirección. Vuelve al inicio de Deyscom Motorsport o escríbenos por WhatsApp.", "404", "la web")
    html = html.replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex, follow">')
    html += header("404") + f"""<section class="hero page-hero" style="min-height:70svh">
  <div class="hero__bg">{pic("bmw-e36-rally-tierra-deyscom-motorsport", eager=True, sizes="100vw")}</div><div class="hero__grid"></div>
  <div class="hero__number" aria-hidden="true">404</div>
  <div class="container hero__inner">
    <span class="eyebrow">Error 404</span>
    <h1><span class="line"><span>Te has salido</span></span><span class="line"><span class="outline">del tramo</span></span></h1>
    <p class="lead">La página que buscas no existe o ha cambiado de dirección. Vuelve a la pista desde aquí:</p>
    <div class="btn-row mt-2"><a class="btn" href="index.html">Ir al inicio {I['arrow']}</a><a class="btn btn--ghost" href="tienda.html">{I['bag']} Tienda</a><a class="btn btn--wa" data-wa="" data-loc="404" href="#">{I['wa']} WhatsApp</a></div>
  </div>
</section>
"""
    return html + footer()


def main():
    pages = {"index": home(), "experiencias": experiencias(), "cursos": cursos(), "ds-copilot-course": course_page(),
             "nosotros": nosotros(), "contacto": contacto(), "tienda": tienda()}
    pages.update(legal_pages())
    pages["404"] = page_404()
    for s in SERVICES:
        pages[s] = service_page(s)
    for s in EXPERIENCES:
        pages[s] = experience_page(s)
    for s in PRODUCTS:
        pages[s] = product_page(s)
    pages["blog"] = blog_index()
    for pp in POSTS:
        pages[pp["slug"]] = blog_post(pp)
    (ROOT / "llms.txt").write_text(LLMS_TXT, encoding="utf-8")
    for old in ("performance", "legal"):  # páginas retiradas
        f = ROOT / f"{old}.html"
        if f.exists():
            f.unlink()
    for name, html in pages.items():
        html = re.sub(r"\n\s*\n", "\n", html)
        (ROOT / f"{name}.html").write_text(html, encoding="utf-8")
    prio = {"index": "1.0", "ds-copilot-course": "0.9", "experiencias": "0.9", "competicion": "0.8", "restomod": "0.8", "pintura": "0.8",
            "banco-de-potencia": "0.8", "cursos": "0.8", "tienda": "0.8", "blog": "0.7"}
    def imgs_of(html):
        found = []
        for name in dict.fromkeys(re.findall(r'assets/img/(?:fotos|productos)/([a-z0-9-]+?)(?:-800|-600)?\.(?:jpg|webp)', html)):
            folder = "productos" if (ROOT / f"assets/img/productos/{name}.jpg").exists() else "fotos"
            found.append(f"<image:image><image:loc>{SITE}/assets/img/{folder}/{name}.jpg</image:loc></image:image>")
        return "".join(found[:20])
    urls = "".join(
        f"<url><loc>{SITE}/{'' if n == 'index' else n + '.html'}</loc><lastmod>{TODAY}</lastmod><priority>{prio.get(n, '0.6')}</priority>{imgs_of(pages[n])}</url>\n"
        for n in pages if n not in ("404", "aviso-legal", "politica-privacidad", "politica-cookies", "condiciones-compra"))
    (ROOT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n{urls}</urlset>\n', encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /google-apps-script/\nDisallow: /tools/\n\nSitemap: {SITE}/sitemap.xml\n", encoding="utf-8")
    print("Generadas:", ", ".join(f"{n}.html" for n in pages))


if __name__ == "__main__":
    main()
