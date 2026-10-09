#!/usr/bin/env python3
"""
Generador estático de la web de Deyscom Motorsport.

Todas las páginas comparten cabecera, pie y bloques; el contenido vive aquí.
Uso:  python3 tools/build.py      → escribe los .html en la raíz del repo.
"""
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://deyscom.com"
PHONE = "+34615972233"
PHONE_TXT = "(+34) 615 97 22 33"
EMAIL = "info@deyscom.com"
ADDRESS = "C/ Canal de Isabel II, 2 · Nave 3 · 28180 Torrelaguna (Madrid)"
VERSION = "1"

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

NAV = [
    ("competicion.html", "Competición"),
    ("restomod.html", "Restomod"),
    ("pintura.html", "Pintura"),
    ("performance.html", "Performance"),
    ("tienda.html", "Tienda"),
    ("nosotros.html", "Quiénes somos"),
    ("contacto.html", "Contacto"),
]


def logo():
    return ('<a class="logo" href="index.html" aria-label="Deyscom Motorsport — inicio">'
            '<span class="logo__word">DEYS<span>COM</span></span>'
            '<span class="logo__sub">Motorsport</span></a>')


def social_links():
    return '<div class="social">' + "".join(
        f'<a data-social="{k}" href="#" aria-label="{n}" title="{n}">{I[k]}</a>' for k, n, *_ in SOCIAL
    ) + "</div>"


def head(title, desc, slug, topic):
    canonical = f"{SITE}/" + ("" if slug == "index" else f"{slug}.html")
    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{escape(title)}</title>
<meta name="description" content="{escape(desc)}">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#050506">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="Deyscom Motorsport">
<meta property="og:title" content="{escape(title)}">
<meta property="og:description" content="{escape(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE}/assets/img/og-deyscom.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;1,600;1,700;1,800;1,900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/styles.css?v={VERSION}">
<script type="application/ld+json">{LD_JSON}</script>
</head>
<body data-topic="{escape(topic)}">
<a class="skip-link" href="#main">Saltar al contenido</a>
"""


LD_JSON = (
    '{"@context":"https://schema.org","@type":"AutoRepair","name":"Deyscom Motorsport",'
    '"url":"' + SITE + '","logo":"' + SITE + '/assets/img/logo-deyscom.png","image":"' + SITE + '/assets/img/og-deyscom.jpg",'
    '"telephone":"' + PHONE + '","email":"' + EMAIL + '",'
    '"address":{"@type":"PostalAddress","streetAddress":"C/ Canal de Isabel II, 2, Nave 3","postalCode":"28180",'
    '"addressLocality":"Torrelaguna","addressRegion":"Madrid","addressCountry":"ES"},'
    '"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"07:00","closes":"15:00"}],'
    '"sameAs":["https://www.instagram.com/deyscom_motorsport/","https://www.facebook.com/deyscom/",'
    '"https://www.tiktok.com/@deyscom_motorsport","https://www.youtube.com/channel/UCBdUbFXBtKdeDkqQ5_S5C6g",'
    '"https://es.wallapop.com/user/deyscomm-467502343"]}'
)


def header(slug):
    links = "".join(
        f'<a class="nav__link" href="{h}"{" aria-current=\"page\"" if h == slug + ".html" else ""}>'
        f'<span class="nav__num">{i:02d}</span>{t}</a>'
        for i, (h, t) in enumerate(NAV, 1)
    )
    return f"""<div class="topbar">
  <div class="container">
    <div class="topbar__left">
      <span><i class="status-dot"></i> <span data-open-status>L-V 07:00–15:00</span></span>
      <span class="topbar__hide-sm">{I['pin']} Torrelaguna · Madrid</span>
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
      <a class="btn btn--ghost" href="tel:{PHONE}">{I['phone']} Llamar</a>
      <a class="btn btn--primary-sm" href="contacto.html#presupuesto">Pide presupuesto</a>
      <button class="burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav"><span></span></button>
    </div>
  </div>
</header>
<main id="main">
"""


def footer():
    nav = "".join(f'<li><a href="{h}">{t}</a></li>' for h, t in NAV)
    return f"""</main>
<footer class="footer">
  <div class="container">
    <div class="footer__giant" aria-hidden="true">DEYS<span>COM</span> MOTORSPORT</div>
    <div class="footer__grid">
      <div>
        {logo()}
        <p class="mt-2 max-60">Taller de preparación, competición, restomod, pintura y performance en Torrelaguna (Madrid). Coches que se conducen con el corazón.</p>
        <div class="mt-2">{social_links()}</div>
      </div>
      <div>
        <h4>Taller</h4>
        <ul>{nav}</ul>
      </div>
      <div>
        <h4>Contacto</h4>
        <ul>
          <li><a href="tel:{PHONE}">{PHONE_TXT}</a></li>
          <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
          <li><a data-wa="" data-loc="footer" href="#">WhatsApp directo</a></li>
          <li>C/ Canal de Isabel II, 2 · Nave 3<br>28180 Torrelaguna · Madrid</li>
        </ul>
      </div>
      <div>
        <h4>Horario</h4>
        {hours_table()}
      </div>
    </div>
    <div class="footer__bottom">
      <span>© <span data-year>2026</span> Deyscom Motorsport S.L. · Todos los derechos reservados</span>
      <nav aria-label="Legal"><a href="legal.html#aviso">Aviso legal</a><a href="legal.html#privacidad">Privacidad</a><a href="legal.html#cookies">Cookies</a></nav>
    </div>
  </div>
</footer>

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
def art(label, x="70%", y="30%", img=None, alt=""):
    pic = f'<img src="assets/img/{img}" alt="{escape(alt)}" loading="lazy" data-optional>' if img else ""
    return (f'<div class="art" style="--x:{x};--y:{y}" aria-hidden="true"><div class="art__label">{label}</div>'
            f'<div class="art__stripe"></div><div class="art__stripe"></div></div>{pic}')


def ticker(words, dark=False):
    items = "".join(f'<span class="ticker__item">{w}</span>' for w in words)
    return f'<div class="ticker{" ticker--dark" if dark else ""}"><div class="ticker__track">{items}</div></div>'


def page_hero(eyebrow, lines, lead, number, img, chips, topic, cta="Pide presupuesto", page=True):
    h1 = "".join(f'<span class="line"><span>{l}</span></span>' for l in lines)
    chips_html = "".join(f'<span class="chip">{c}</span>' for c in chips)
    pic = f'<img src="assets/img/{img}" alt="" data-optional>' if img else ""
    return f"""<section class="hero{" page-hero" if page else ""}">
  <div class="hero__bg">{pic}</div>
  <div class="hero__grid"></div>
  <div class="hero__speed" aria-hidden="true"></div>
  <div class="hero__number" aria-hidden="true">{number}</div>
  <div class="container hero__inner">
    <span class="eyebrow">{eyebrow}</span>
    <h1>{h1}</h1>
    <div class="hero__bottom">
      <div>
        <p class="lead">{lead}</p>
        <div class="hero__badges">{chips_html}</div>
      </div>
      <div class="btn-row" style="justify-content:flex-end">
        <a class="btn" href="#presupuesto">{cta} {I['arrow']}</a>
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


def process(steps, pink=True):
    s = "".join(
        f'<div class="step reveal" data-delay="{i}"><span class="step__n">Fase 0{i + 1}</span><h3>{t}</h3><p>{d}</p></div>'
        for i, (t, d) in enumerate(steps)
    )
    return s


def gallery(slug, caps, word):
    items = "".join(
        f'<figure class="gallery__item reveal" style="margin:0">{art(word, f"{20 + i * 15}%", "40%", f"{slug}-{i + 1}.jpg", c)}'
        f'<figcaption class="gallery__cap">{c}</figcaption></figure>'
        for i, c in enumerate(caps)
    )
    return f'<div class="gallery">{items}</div>'


def faq(items):
    return '<div class="faq">' + "".join(
        f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in items
    ) + "</div>"


def mega_cta(title_html, text, topic):
    return f"""<section class="section section--pink mega-cta">
  <div class="mega-cta__flag" aria-hidden="true"></div>
  <div class="container">
    <h2 class="reveal">{title_html}</h2>
    <p class="lead mt-2" style="color:#111">{text}</p>
    <div class="btn-row">
      <a class="btn btn--dark" href="contacto.html#presupuesto">Pide presupuesto {I['arrow']}</a>
      <a class="btn btn--wa" data-wa="{escape(topic)}" data-loc="megacta" href="#">{I['wa']} WhatsApp</a>
      <a class="btn btn--ghost" style="--fg:#000;box-shadow:inset 0 0 0 2px #000" href="tel:{PHONE}">{I['phone']} {PHONE_TXT}</a>
    </div>
  </div>
</section>
"""


def success_block(title="¡Bandera a cuadros!", text="Hemos recibido tu solicitud. Te contactamos en menos de 24 h laborables."):
    return f"""<div class="form-success" role="status" aria-live="polite">
  <div class="form-success__icon">{I['check']}</div>
  <h3>{title}</h3>
  <p data-success-note>{text}</p>
  <div class="btn-row" style="justify-content:center">
    <a class="btn btn--wa" data-success-wa href="#" target="_blank" rel="noopener">{I['wa']} Acelerar por WhatsApp</a>
  </div>
</div>"""


def consent():
    return ('<label class="check full"><input type="checkbox" name="consentimiento" value="sí" required> '
            '<span>Acepto la <a href="legal.html#privacidad" target="_blank">política de privacidad</a> y que Deyscom Motorsport me contacte sobre mi solicitud.</span></label>'
            '<div class="hp" aria-hidden="true"><label>No rellenar<input type="text" name="_hp" tabindex="-1" autocomplete="off"></label></div>')


def service_form(service, topic, options, title="Cuéntanos tu proyecto", sub="Respuesta en menos de 24 h laborables. Sin compromiso."):
    pills = "".join(
        f'<label class="pill"><input type="radio" name="interes" value="{escape(o)}"{" required" if i == 0 else ""}><span>{o}</span></label>'
        for i, o in enumerate(options)
    )
    return f"""<section class="section section--ink" id="presupuesto">
  <div class="container form-wrap">
    <div class="reveal">
      <span class="eyebrow">Presupuesto · {service}</span>
      <h2>{title}</h2>
      <p class="lead mt-2">{sub}</p>
      {contact_list()}
    </div>
    <div class="form-card reveal" data-delay="1" data-form-wrap>
      <form class="form-body" data-lead="{escape(service.lower())}" novalidate>
        <input type="hidden" name="servicio" value="{escape(service)}">
        <div class="form-grid">
          <fieldset class="pills full"><legend class="field"><span style="font-family:var(--f-display);font-style:italic;font-weight:700;text-transform:uppercase;letter-spacing:.1em;font-size:.9rem;color:#fff">¿Qué necesitas? <span class="pink">*</span></span></legend>{pills}</fieldset>
          <div class="field"><label for="n-{topic}">Nombre <span class="req">*</span></label><input class="input" id="n-{topic}" name="nombre" autocomplete="name" required placeholder="Tu nombre"></div>
          <div class="field"><label for="t-{topic}">Teléfono <span class="req">*</span></label><input class="input" id="t-{topic}" name="telefono" type="tel" autocomplete="tel" required pattern="[0-9 +()\\-]{{9,}}" placeholder="600 000 000"></div>
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


def contact_list():
    return f"""<ul class="contact-list">
  <li><span class="ic">{I['wa']}</span><div><small>WhatsApp · respuesta rápida</small><a data-wa="" data-loc="contactlist" href="#">Escríbenos ahora</a></div></li>
  <li><span class="ic">{I['phone']}</span><div><small>Teléfono</small><a href="tel:{PHONE}">{PHONE_TXT}</a></div></li>
  <li><span class="ic">{I['mail']}</span><div><small>Email</small><a href="mailto:{EMAIL}">{EMAIL}</a></div></li>
  <li><span class="ic">{I['clock']}</span><div><small>Horario</small><strong>Lunes a viernes · 07:00 – 15:00</strong></div></li>
</ul>"""


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
    tiles = "".join(
        f'<a class="social-tile social-tile--{ {"instagram": "ig", "tiktok": "tt", "youtube": "yt", "facebook": "fb", "wallapop": "fb"}[k] } reveal" data-delay="{i % 4}" data-social="{k}" href="#">'
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


# ------------------------------------------------------------------ páginas de servicio
SERVICES = {
    "competicion": dict(
        title="Coches de competición · Preparación rally y circuito | Deyscom Motorsport",
        desc="Preparamos, mantenemos y asistimos coches de competición de rally, montaña y circuito en Madrid. Seguridad, set-up, asistencia en carrera y alquiler de coches de competición.",
        topic="coches de competición",
        eyebrow="Coches de competición",
        lines=["Nacidos", "<span class='pink'>para</span>", "<span class='outline'>competir</span>"],
        lead="Rally, montaña, circuito o subida: preparamos tu coche desde la carrocería desnuda hasta la línea de salida y te acompañamos tramo a tramo.",
        number="01",
        chips=["Rally · Montaña · Circuito", "Asistencia en carrera", "Alquiler de coches de competición"],
        ticker=["Preparación integral", "Seguridad", "Set-up", "Asistencia", "Mantenimiento", "Alquiler"],
        intro=("Del garaje al podio", "Un coche de carreras <span class='pink'>no se compra</span>, se construye",
               "<p class='lead'>Cada preparación empieza con una conversación: qué campeonato, qué reglamento, qué presupuesto y qué piloto. A partir de ahí diseñamos el coche contigo, pieza a pieza.</p>"
               + feature_list([
                   ("Proyecto a medida", "Planificación por fases para ajustarnos al reglamento y a tu presupuesto."),
                   ("Seguridad primero", "Arcos de seguridad, baquets, arneses, extinción y cortacorrientes."),
                   ("Puesta a punto", "Geometría, reglajes de suspensión y set-up según superficie."),
               ]), "RACE", "competicion-intro.jpg", "Race ready"),
        cards=[
            ("flag", "Preparación integral", "Construcción de coches de rally, montaña y circuito desde cero o a partir de tu base."),
            ("shield", "Seguridad", "Montaje de arcos, baquets, arneses, extintores y cortacorrientes según reglamento."),
            ("gauge", "Set-up y reglajes", "Alturas, geometrías, amortiguación y diferenciales afinados para cada tramo."),
            ("wrench", "Mantenimiento entre pruebas", "Revisiones, desmontajes y reconstrucciones para salir siempre al 100%."),
            ("truck", "Asistencia en carrera", "Nuestro equipo contigo en el parque de asistencia, en cada tramo."),
            ("key", "Alquiler de coches", "¿Quieres correr sin tener coche propio? Te alquilamos uno listo para competir."),
        ],
        steps=[("Briefing", "Campeonato, reglamento, objetivos y presupuesto."), ("Diseño", "Plan de preparación por fases y lista de piezas."),
               ("Construcción", "Taller, montaje y pruebas en banco y en pista."), ("Carrera", "Asistencia, datos y mantenimiento entre pruebas.")],
        gallery=["Tramo de tierra", "Interior y jaula", "Parque de asistencia", "Detalle motor", "Salida"],
        word="RALLY",
        faq=[
            ("¿Preparáis coches para cualquier campeonato?", "Trabajamos rally, montaña, circuito y regularidad. En el briefing revisamos el reglamento de tu campeonato y planteamos la preparación para cumplirlo."),
            ("¿Puedo alquilar un coche de competición?", "Sí. Tenemos opción de alquiler de coches de competición. Escríbenos con la prueba y fechas y te contamos disponibilidad y condiciones."),
            ("¿Ofrecéis asistencia durante la carrera?", "Sí, podemos acompañarte en el parque de asistencia con equipo y material para resolver cualquier incidencia."),
            ("¿Puedo hacer la preparación por fases?", "Claro. Muchos pilotos empiezan por seguridad y fiabilidad y evolucionan el coche temporada a temporada."),
        ],
        form_opts=["Preparar mi coche", "Mantenimiento", "Asistencia en carrera", "Alquilar un coche", "Otro"],
        mega="Tu próxima <span class='outline'>salida</span> empieza aquí",
    ),
    "restomod": dict(
        title="Restomod · Clásicos con alma y mecánica moderna | Deyscom Motorsport",
        desc="Restomod en Madrid: restauramos clásicos y youngtimers con mecánica, frenos, suspensión y electrónica modernas. Proyectos únicos hechos a mano en Torrelaguna.",
        topic="un proyecto restomod",
        eyebrow="Restomod",
        lines=["El alma", "de un <span class='pink'>clásico</span>", "<span class='outline'>el pulso de hoy</span>"],
        lead="Respetamos la esencia del coche que siempre soñaste y le damos la mecánica, la seguridad y la fiabilidad de un coche moderno. Uno solo. El tuyo.",
        number="02",
        chips=["Clásicos y youngtimers", "Proyectos 100% a medida", "Seguimiento con fotos y vídeo"],
        ticker=["Restauración", "Chasis", "Motor moderno", "Frenos", "Interior a medida", "Pintura"],
        intro=("Lo mejor de dos épocas", "Ni original, ni moderno: <span class='pink'>único</span>",
               "<p class='lead'>Un restomod no es solo restaurar. Es decidir contigo qué conservar, qué mejorar y cómo quieres que se sienta al volante.</p>"
               + feature_list([
                   ("Diagnóstico de la base", "Revisamos chasis, carrocería y mecánica antes de empezar."),
                   ("Diseño del proyecto", "Definimos estética, prestaciones y presupuesto por fases."),
                   ("Diario de obra", "Te enviamos fotos y vídeos del proceso para que vivas cada avance."),
               ]), "CLASSIC", "restomod-intro.jpg", "Hecho a mano", True, "35%"),
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
        gallery=["Antes de empezar", "Carrocería desnuda", "Motor", "Interior", "Entrega"],
        word="RESTO",
        faq=[
            ("¿Con qué coches trabajáis?", "Clásicos y youngtimers de todo tipo. Cuéntanos el modelo y valoramos el proyecto sin compromiso."),
            ("¿Cuánto cuesta un restomod?", "Depende del estado de la base y del nivel de modificación. Por eso trabajamos por fases y con presupuesto cerrado para cada una."),
            ("¿Cuánto tarda?", "Un restomod completo suele llevar meses. Te damos un calendario realista desde el principio y te enviamos avances."),
            ("¿Me ayudáis a encontrar el coche base?", "Sí, podemos asesorarte en la compra y revisar el coche antes de que lo compres."),
        ],
        form_opts=["Restomod completo", "Restauración", "Actualizar mecánica", "Busco coche base", "Otro"],
        mega="Hagamos tu <span class='outline'>clásico</span> eterno",
    ),
    "pintura": dict(
        title="Pintura de coches y decoraciones de competición | Deyscom Motorsport",
        desc="Pintura completa y parcial, chapa, colores especiales y decoraciones de competición en Torrelaguna (Madrid). Acabados de exposición para calle y pista.",
        topic="pintura",
        eyebrow="Pintura",
        lines=["Color", "<span class='pink'>que se</span>", "<span class='outline'>escucha</span>"],
        lead="Chapa, pintura y decoraciones con acabado de exposición. Desde un retoque perfecto hasta un cambio de color completo o una decoración de competición que no pase desapercibida.",
        number="03",
        chips=["Pintura completa y parcial", "Decoraciones de competición", "Colores especiales"],
        ticker=["Chapa", "Pintura completa", "Colores especiales", "Decoraciones", "Pulido", "Llantas"],
        intro=("Obsesión por el detalle", "La primera impresión <span class='pink'>se pinta</span>",
               "<p class='lead'>Preparamos cada superficie como si fuera a un concurso. Porque la pintura no solo se ve: protege y define el carácter del coche.</p>"
               + feature_list([
                   ("Preparación impecable", "Desmontaje, chapa, aparejo y lijado antes de un solo gramo de color."),
                   ("Color a tu medida", "Originales de fábrica, colores especiales y combinaciones bitono."),
                   ("Decoración racing", "Diseñamos y aplicamos la decoración de tu coche de competición."),
               ]), "PAINT", "pintura-intro.jpg", "Acabado espejo"),
        cards=[
            ("spray", "Pintura completa", "Cambio de color o restauración del original con desmontaje de piezas."),
            ("wrench", "Chapa y reparación", "Golpes, óxido y reparaciones estructurales hechas como deben."),
            ("star", "Colores especiales", "Perlados, mates, tricapa y tonos a medida."),
            ("flag", "Decoraciones de competición", "Diseño y aplicación de libreas para rally y circuito."),
            ("disc", "Llantas y piezas", "Pintura de llantas, pinzas, cubiertas y detalles."),
            ("eye", "Pulido y protección", "Corrección de pintura y protección para que dure."),
        ],
        steps=[("Valoración", "Vemos el coche y el acabado que buscas."), ("Preparación", "Desmontaje, chapa, aparejo y lijado."),
               ("Pintura", "Color, barniz y secado controlado."), ("Acabado", "Pulido, montaje y control de calidad.")],
        gallery=["Cabina", "Color", "Decoración", "Detalle", "Pulido"],
        word="COLOR",
        faq=[
            ("¿Pintáis solo una pieza o el coche entero?", "Ambas cosas: desde un paragolpes o una aleta hasta pintura completa con cambio de color."),
            ("¿Hacéis decoraciones de competición?", "Sí. Te ayudamos a diseñar la decoración y la aplicamos en pintura o vinilo, según lo que mejor encaje."),
            ("¿Cuánto tarda una pintura completa?", "Depende del estado de la chapa y del desmontaje necesario. Tras ver el coche te damos un plazo concreto."),
            ("¿Igualáis el color original?", "Sí, trabajamos con el código de color del fabricante y ajustamos el tono para que la pieza no se distinga."),
        ],
        form_opts=["Pintura completa", "Pieza o reparación", "Decoración competición", "Llantas / detalles", "Otro"],
        mega="Dale a tu coche <span class='outline'>el color</span> que merece",
    ),
    "performance": dict(
        title="Modificaciones performance · Escapes, potencia y chasis | Deyscom Motorsport",
        desc="Modificaciones performance en Madrid: escapes, admisión, reprogramación, suspensión, frenos y embragues. Más potencia, mejor respuesta y más diversión al volante.",
        topic="modificaciones performance",
        eyebrow="Modificaciones performance",
        lines=["Más", "<span class='pink'>respuesta.</span>", "<span class='outline'>Más sonrisa.</span>"],
        lead="Escapes, admisión, potencia, suspensión y frenos. Mejoramos tu coche de calle o de tandas con piezas de calidad y un objetivo claro: que disfrutes cada curva.",
        number="04",
        chips=["Escapes a medida", "Suspensión y frenos", "Potencia y fiabilidad"],
        ticker=["Escapes", "Admisión", "Potencia", "Suspensión", "Frenos", "Embragues"],
        intro=("Calle, tandas o track day", "Potencia <span class='pink'>con cabeza</span>",
               "<p class='lead'>No se trata de montar piezas, sino de que el coche funcione como un conjunto. Analizamos tu uso y te proponemos un plan por etapas.</p>"
               + feature_list([
                   ("Plan por etapas", "Empieza por lo que más se nota y crece cuando quieras."),
                   ("Piezas de calidad", "Trabajamos con marcas contrastadas y montaje profesional."),
                   ("Fiabilidad", "Más prestaciones sin renunciar a usar tu coche cada día."),
               ]), "POWER", "performance-intro.jpg", "Stage up", True, "40%"),
        cards=[
            ("wind", "Escapes", "Montaje y fabricación de escapes: sonido, peso y flujo a tu gusto."),
            ("bolt", "Admisión y potencia", "Admisión, intercooler, turbo y puesta a punto del motor."),
            ("cpu", "Electrónica", "Reprogramación y gestión del motor adaptada a tus modificaciones."),
            ("gauge", "Suspensión", "Coilovers, barras, silentblocks y geometría para mejor paso por curva."),
            ("disc", "Frenos", "Kits de freno, latiguillos, pastillas y líquidos de alto rendimiento."),
            ("layers", "Transmisión", "Embragues reforzados, volantes motor y autoblocantes."),
        ],
        steps=[("Uso", "¿Calle, tandas o competición? Definimos el objetivo."), ("Propuesta", "Plan por etapas con piezas y presupuesto."),
               ("Montaje", "Instalación profesional y puesta a punto."), ("Prueba", "Comprobación en carretera y entrega.")],
        gallery=["Escape", "Admisión", "Frenos", "Suspensión", "Motor"],
        word="TUNED",
        faq=[
            ("¿Las modificaciones son legales?", "Te asesoramos sobre qué piezas requieren homologación o reforma y cómo hacerlo correctamente."),
            ("¿Montáis piezas que traiga yo?", "Sí, valoramos la pieza y te decimos si es adecuada para tu coche antes de montarla."),
            ("¿Fabricáis escapes a medida?", "Sí, montamos y adaptamos escapes según el sonido y las prestaciones que busques."),
            ("¿Afecta a la fiabilidad?", "Una modificación bien planteada y bien montada no tiene por qué. Por eso trabajamos por etapas y con piezas contrastadas."),
        ],
        form_opts=["Escape", "Potencia / reprogramación", "Suspensión", "Frenos", "Plan completo"],
        mega="¿Listo para <span class='outline'>subir de nivel</span>?",
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
    <div class="section__head"><div class="reveal"><span class="eyebrow">Antes / después</span><h2>Desliza y <span class="outline">compara</span></h2></div>
    <p class="lead muted reveal">Arrastra el control para ver la transformación. (Sustituye las imágenes por tus propios trabajos en <code>assets/img/pintura-antes.jpg</code> y <code>pintura-despues.jpg</code>.)</p></div>
    <div class="ba reveal">
      <div class="ba__layer ba__before">{art("ANTES", "30%", "40%", "pintura-antes.jpg", "Antes")}</div>
      <div class="ba__layer ba__after">{art("DESPUÉS", "70%", "40%", "pintura-despues.jpg", "Después")}</div>
      <span class="ba__lbl ba__lbl--l">Antes</span><span class="ba__lbl ba__lbl--r">Después</span>
      <div class="ba__handle"></div>
      <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Comparar antes y después">
    </div>
  </div>
</section>"""
    html = head(s["title"], s["desc"], slug, s["topic"]) + header(slug)
    html += page_hero(s["eyebrow"], s["lines"], s["lead"], s["number"], f"{slug}-hero.jpg", s["chips"], s["topic"])
    html += ticker(s["ticker"])
    html += f'<section class="section"><div class="container">{split(e, t, body, label, img, tag, rev, x)}</div></section>'
    html += f"""<section class="section section--ink">
  <div class="container">
    <div class="section__head">
      <div class="reveal"><span class="eyebrow">Qué hacemos</span><h2>Todo lo que <span class="outline">necesitas</span></h2></div>
      <p class="lead muted reveal" data-delay="1">Un solo taller para todo el proyecto. Sin intermediarios, sin sorpresas y con trato directo con quien trabaja en tu coche.</p>
    </div>
    {cards(s["cards"])}
  </div>
</section>
<section class="section section--pink">
  <div class="container">
    <div class="section__head"><div><span class="eyebrow" style="color:#000">Cómo trabajamos</span><h2>De la idea <span class="outline" style="-webkit-text-stroke-color:#000">a la meta</span></h2></div>
    <p class="lead" style="color:#111">Proceso claro, presupuesto cerrado por fases y comunicación constante.</p></div>
    <div class="process">{process(s["steps"])}</div>
  </div>
</section>
{extra}
<section class="section">
  <div class="container">
    <div class="section__head"><div class="reveal"><span class="eyebrow">Trabajos</span><h2>Desde <span class="outline">el taller</span></h2></div>
    <p class="lead muted reveal" data-delay="1">Más proyectos cada semana en nuestro <a class="pink" data-social="instagram" href="#">Instagram</a> y <a class="pink" data-social="tiktok" href="#">TikTok</a>.</p></div>
    {gallery(slug, s["gallery"], s["word"])}
  </div>
</section>
{service_form(s["eyebrow"], slug, s["form_opts"])}
<section class="section">
  <div class="container">
    <div class="section__head"><div class="reveal"><span class="eyebrow">Preguntas frecuentes</span><h2>Lo que <span class="outline">nos preguntáis</span></h2></div></div>
    {faq(s["faq"])}
  </div>
</section>
{mega_cta(s["mega"], "Escríbenos hoy y te respondemos en menos de 24 h laborables.", s["topic"])}
"""
    return html + footer()


# ------------------------------------------------------------------ inicio
def home():
    svc = [
        ("competicion.html", "01", "Competición", "Preparación, seguridad, asistencia y alquiler de coches de rally, montaña y circuito.", "RACE", "home-competicion.jpg", "75%"),
        ("restomod.html", "02", "Restomod", "Clásicos con alma y mecánica moderna. Proyectos únicos hechos a mano.", "CLASSIC", "home-restomod.jpg", "30%"),
        ("pintura.html", "03", "Pintura", "Chapa, pintura completa, colores especiales y decoraciones racing.", "PAINT", "home-pintura.jpg", "60%"),
        ("performance.html", "04", "Performance", "Escapes, potencia, suspensión y frenos. Más respuesta, más diversión.", "POWER", "home-performance.jpg", "40%"),
        ("tienda.html", "05", "Tienda", "Coches y piezas a la venta, y merchandising oficial Deyscom.", "SHOP", "home-tienda.jpg", "70%"),
    ]
    svc_html = "".join(
        f'<a class="svc reveal" data-delay="{i % 3}" href="{h}"><div class="svc__media">{art(w, x, "30%", img, t)}</div>'
        f'<span class="svc__num">{n}</span><h3>{t}</h3><p>{d}</p><span class="svc__go">Descubrir {I["arrow"]}</span></a>'
        for i, (h, n, t, d, w, img, x) in enumerate(svc)
    )
    choices = [
        ("flag", "Competición", "Rally, montaña, circuito"),
        ("star", "Restomod", "Clásico + mecánica moderna"),
        ("spray", "Pintura", "Chapa, color, decoración"),
        ("bolt", "Performance", "Escape, potencia, chasis"),
        ("key", "Alquiler", "Coche de competición"),
        ("wrench", "Otro", "Cuéntanos tu idea"),
    ]
    choice_html = "".join(
        f'<label class="choice"><input type="radio" name="servicio" value="{t}"{" required" if i == 0 else ""}>'
        f'<span class="choice__box">{I[ic]}<b>{t}</b><span>{d}</span></span></label>'
        for i, (ic, t, d) in enumerate(choices)
    )
    budgets = ["< 3.000 €", "3.000 – 10.000 €", "10.000 – 30.000 €", "> 30.000 €", "Aún no lo sé"]
    budget_html = "".join(f'<label class="pill"><input type="radio" name="presupuesto" value="{b}"><span>{b}</span></label>' for b in budgets)
    plazos = ["Lo antes posible", "1 – 3 meses", "Para la próxima temporada", "Sin prisa"]
    plazo_html = "".join(f'<label class="pill"><input type="radio" name="plazo" value="{b}"><span>{b}</span></label>' for b in plazos)

    html = head("Deyscom Motorsport · Competición, Restomod, Pintura y Performance en Madrid",
                "Taller motorsport en Torrelaguna (Madrid): coches de competición, restomod, pintura y modificaciones performance. Pide presupuesto o escríbenos por WhatsApp.",
                "index", "vuestros servicios") + header("index")
    html += f"""<section class="hero">
  <div class="hero__bg"><img src="assets/img/hero.jpg" alt="" data-optional></div>
  <div class="hero__grid"></div>
  <div class="hero__speed" aria-hidden="true"></div>
  <div class="container hero__inner">
    <span class="eyebrow">Torrelaguna · Madrid · Motorsport workshop</span>
    <h1><span class="line"><span>Hechos</span></span><span class="line"><span>para <span class="pink">correr.</span></span></span><span class="line"><span class="outline">Pensados para ti.</span></span></h1>
    <div class="hero__bottom">
      <div>
        <p class="lead">Coches de competición, restomods, pintura y modificaciones performance. Un taller de apasionados donde cada coche se trata como si fuera nuestro.</p>
        <div class="hero__badges">
          <span class="chip"><b>●</b> Competición</span><span class="chip"><b>●</b> Restomod</span><span class="chip"><b>●</b> Pintura</span><span class="chip"><b>●</b> Performance</span>
        </div>
      </div>
      <div class="btn-row" style="justify-content:flex-end">
        <a class="btn" href="#presupuesto">Empieza tu proyecto {I['arrow']}</a>
        <a class="btn btn--wa" data-wa="" data-loc="hero" href="#">{I['wa']} WhatsApp</a>
      </div>
    </div>
  </div>
</section>
{ticker(["Competición", "Restomod", "Pintura", "Performance", "Asistencia en carrera", "Hecho en Madrid"])}

<section class="section">
  <div class="container">
    <div class="section__head">
      <div class="reveal"><span class="eyebrow">Qué hacemos</span><h2>Un taller.<br><span class="outline">Cinco pasiones.</span></h2></div>
      <p class="lead muted reveal" data-delay="1">Desde un coche de rally listo para el primer tramo hasta un clásico que vuelve a nacer. Elige por dónde quieres empezar.</p>
    </div>
    <div class="services">{svc_html}</div>
  </div>
</section>

<section class="section section--ink section--tight">
  <div class="container">
    <div class="usp">
      <div class="usp__item reveal"><div class="usp__big">1<span>:</span>1</div><h3>Trato directo</h3><p>Hablas con quien trabaja en tu coche. Sin intermediarios.</p></div>
      <div class="usp__item reveal" data-delay="1"><div class="usp__big">24<span>h</span></div><h3>Respuesta rápida</h3><p>Contestamos tu solicitud en menos de 24 h laborables.</p></div>
      <div class="usp__item reveal" data-delay="2"><div class="usp__big">100<span>%</span></div><h3>A medida</h3><p>Cada proyecto se diseña para tu coche, tu uso y tu presupuesto.</p></div>
      <div class="usp__item reveal" data-delay="3"><div class="usp__big">07<span>:</span>00</div><h3>Madrugamos</h3><p>Abrimos de lunes a viernes a las 7. Tu coche, cuanto antes en pista.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    {split("Quiénes somos", "Gasolina <span class='pink'>en las venas</span>",
           "<p class='lead'>Deyscom Motorsport nace de una idea sencilla: hacer los coches que a nosotros nos gustaría conducir. Competimos, restauramos, pintamos y preparamos con la misma obsesión por el detalle.</p>"
           "<p class='muted'>Desde nuestra nave en Torrelaguna trabajamos para pilotos, coleccionistas y apasionados de toda España. Cada proyecto se vive, se documenta y se comparte.</p>"
           f"<div class='btn-row mt-2'><a class='btn btn--ghost' href='nosotros.html'>Conócenos {I['arrow']}</a></div>",
           "TEAM", "home-equipo.jpg", "El equipo", False, "65%")}
  </div>
</section>

<section class="section section--pink">
  <div class="container">
    <div class="section__head"><div><span class="eyebrow" style="color:#000">Cómo trabajamos</span><h2>Tu proyecto <span class="outline" style="-webkit-text-stroke-color:#000">en 4 fases</span></h2></div>
    <p class="lead" style="color:#111">Claridad desde el primer día: sabes qué se hace, cuánto cuesta y cuándo estará listo.</p></div>
    <div class="process">{process([("Hablamos", "Nos cuentas tu idea por WhatsApp, teléfono o formulario."), ("Valoramos", "Vemos el coche y te damos un presupuesto claro, por fases."), ("Trabajamos", "Manos a la obra, con fotos y vídeos del avance."), ("Disfrutas", "Entrega, ajustes y seguimiento. Nos vemos en la pista.")])}</div>
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
            <fieldset class="pills full"><legend class="field"><span style="font-family:var(--f-display);font-style:italic;font-weight:700;text-transform:uppercase;letter-spacing:.1em;font-size:.9rem;color:#fff">Presupuesto aproximado</span></legend>{budget_html}</fieldset>
            <fieldset class="pills full"><legend class="field"><span style="font-family:var(--f-display);font-style:italic;font-weight:700;text-transform:uppercase;letter-spacing:.1em;font-size:.9rem;color:#fff">¿Para cuándo?</span></legend>{plazo_html}</fieldset>
            <div class="field full"><label for="h-msg">Cuéntanos más</label><textarea class="textarea" id="h-msg" name="mensaje" placeholder="Objetivos, campeonato, color, piezas…"></textarea></div>
          </div>
          <div class="fstep__nav"><button class="btn btn--ghost" type="button" data-prev>Atrás</button><button class="btn" type="button" data-next>Siguiente {I['arrow']}</button></div>
        </div>
        <div class="fstep">
          <div class="fstep__title">¿Dónde te contactamos?</div>
          <p class="fstep__sub">Paso 3 de 3 · Último paso</p>
          <div class="form-grid">
            <div class="field full"><label for="h-n">Nombre <span class="req">*</span></label><input class="input" id="h-n" name="nombre" autocomplete="name" required placeholder="Tu nombre"></div>
            <div class="field"><label for="h-t">Teléfono <span class="req">*</span></label><input class="input" id="h-t" name="telefono" type="tel" autocomplete="tel" required pattern="[0-9 +()\\-]{{9,}}" placeholder="600 000 000"></div>
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

{social_wall()}

<section class="section section--ink">
  <div class="container">
    <div class="section__head"><div class="reveal"><span class="eyebrow">Preguntas frecuentes</span><h2>Antes de <span class="outline">arrancar</span></h2></div></div>
    {faq([
        ("¿Dónde estáis?", "En C/ Canal de Isabel II, 2, Nave 3, 28180 Torrelaguna (Madrid). A unos 50 minutos de Madrid capital."),
        ("¿Cuál es vuestro horario?", "De lunes a viernes de 07:00 a 15:00. Sábados y domingos cerrado. Por WhatsApp puedes escribirnos cuando quieras y te respondemos en horario de taller."),
        ("¿Hacéis presupuestos sin compromiso?", "Sí. Cuéntanos tu proyecto por el formulario o WhatsApp y te damos una valoración inicial. Para presupuestos cerrados solemos necesitar ver el coche."),
        ("¿Trabajáis con clientes de fuera de Madrid?", "Sí, trabajamos con clientes de toda España. Podemos coordinar el transporte de tu coche hasta el taller."),
        ("¿Vendéis coches y piezas?", "Sí, publicamos coches y piezas a la venta en nuestra tienda, conectada con nuestro perfil de Wallapop."),
    ])}
  </div>
</section>

{mega_cta("¿Arrancamos <span class='outline'>motores?</span>", "Escríbenos por WhatsApp, llámanos o pide presupuesto. Te respondemos en menos de 24 h laborables.", "")}
"""
    return html + footer()


# ------------------------------------------------------------------ nosotros
def nosotros():
    html = head("Quiénes somos · Deyscom Motorsport | Taller motorsport en Torrelaguna",
                "Conoce Deyscom Motorsport: un equipo de apasionados del motor en Torrelaguna (Madrid) especializado en competición, restomod, pintura y performance.",
                "nosotros", "vuestro taller") + header("nosotros")
    html += page_hero("Quiénes somos", ["Pasión", "<span class='pink'>con</span>", "<span class='outline'>octanaje</span>"],
                      "Somos Deyscom Motorsport, un taller de Torrelaguna (Madrid) donde la competición, la restauración y la preparación se viven a fondo, sin atajos.",
                      "DM", "nosotros-hero.jpg", ["Torrelaguna · Madrid", "Taller motorsport", "Clientes de toda España"], "vuestro taller", "Habla con nosotros")
    html += ticker(["Pasión", "Detalle", "Honestidad", "Velocidad", "Equipo", "Carácter"], dark=True)
    html += f"""<section class="section">
  <div class="container">
    {split("Nuestra historia", "Del <span class='pink'>paddock</span> al taller",
           "<p class='lead'>Deyscom Motorsport nació de las ganas de hacer las cosas a nuestra manera: con tiempo, con cariño y con la exigencia de quien también se pone el casco.</p>"
           "<p class='muted'>Hoy preparamos coches de competición, damos vida a restomods, pintamos y modificamos coches de calle para que cada cliente disfrute de su coche como nunca. Lo hacemos desde nuestra nave en Torrelaguna, con trato cercano y comunicación constante.</p>"
           "<p class='muted'>Compartimos cada proyecto en redes porque estamos orgullosos de lo que hacemos y porque creemos que la transparencia es la mejor garantía.</p>",
           "STORY", "nosotros-historia.jpg", "Desde Torrelaguna")}
  </div>
</section>
<section class="section section--ink">
  <div class="container">
    <div class="section__head"><div class="reveal"><span class="eyebrow">Valores</span><h2>Lo que <span class="outline">nos mueve</span></h2></div>
    <p class="lead muted reveal" data-delay="1">Cuatro reglas que aplicamos a cada coche que entra por la puerta.</p></div>
    {cards([
        ("helmet", "Lo vivimos", "Somos pilotos, aficionados y mecánicos. Entendemos lo que significa tu coche."),
        ("eye", "Transparencia", "Fotos, vídeos y presupuestos claros. Sabes en todo momento qué se hace."),
        ("shield", "Seguridad", "En competición y en calle, la seguridad nunca es negociable."),
        ("star", "Detalle", "Lo que no se ve importa tanto como lo que se ve."),
        ("gauge", "Mejora continua", "Cada carrera y cada proyecto nos hacen mejores."),
        ("flag", "Compromiso", "Plazos realistas y palabra cumplida."),
    ])}
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section__head"><div class="reveal"><span class="eyebrow">El taller</span><h2>Nuestra <span class="outline">casa</span></h2></div>
    <p class="lead muted reveal" data-delay="1">Nave 3, Canal de Isabel II, Torrelaguna. Ven a vernos (mejor con cita previa).</p></div>
    {gallery("nosotros", ["La nave", "Zona de trabajo", "Equipo", "Herramienta", "En pista"], "DEYSCOM")}
  </div>
</section>
{social_wall()}
{mega_cta("Ven a <span class='outline'>conocernos</span>", "Pide cita y tómate un café con nosotros mientras hablamos de tu coche.", "visitar el taller")}
"""
    return html + footer()


# ------------------------------------------------------------------ contacto
def contacto():
    html = head("Contacto · Deyscom Motorsport | Torrelaguna, Madrid",
                "Contacta con Deyscom Motorsport: (+34) 615 97 22 33 · info@deyscom.com · C/ Canal de Isabel II, 2 Nave 3, 28180 Torrelaguna (Madrid). L-V 07:00-15:00.",
                "contacto", "un presupuesto") + header("contacto")
    opts = ["Competición", "Restomod", "Pintura", "Performance", "Alquiler", "Tienda / compra", "Otro"]
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
        <li><span class="ic">{I['pin']}</span><div><small>Ubicación</small><a href="https://www.google.com/maps/search/?api=1&query=Deyscom+Motorsport+Calle+Canal+de+Isabel+II+2+Torrelaguna" target="_blank" rel="noopener">C/ Canal de Isabel II, 2 · Nave 3<br>28180 Torrelaguna · Madrid</a></div></li>
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
          <div class="field"><label for="c-t">Teléfono <span class="req">*</span></label><input class="input" id="c-t" name="telefono" type="tel" autocomplete="tel" required pattern="[0-9 +()\\-]{{9,}}" placeholder="600 000 000"></div>
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
    <div class="map reveal"><iframe title="Mapa Deyscom Motorsport" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
      src="https://www.google.com/maps?q=Calle+Canal+de+Isabel+II+2,+28180+Torrelaguna,+Madrid&output=embed"></iframe></div>
    <div class="btn-row mt-2"><a class="btn btn--ghost" href="https://www.google.com/maps/dir/?api=1&destination=Calle+Canal+de+Isabel+II+2,+28180+Torrelaguna,+Madrid" target="_blank" rel="noopener">{I['pin']} Cómo llegar</a></div>
  </div>
</section>
"""
    return html + footer()


# ------------------------------------------------------------------ tienda / merch
def mock_svg(kind):
    """Mockups vectoriales con el logotipo. El color se controla con --garment / --print."""
    word = ('<text x="0" y="0" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-style="italic" font-weight="900" '
            'text-anchor="middle" fill="var(--print,#fff)">DEYS<tspan fill="#ff66c4">COM</tspan></text>')
    sub = ('<text x="0" y="0" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-style="italic" font-weight="600" '
           'text-anchor="middle" letter-spacing="6" fill="var(--print,#fff)" opacity=".7">MOTORSPORT</text>')
    if kind == "camiseta":
        return f"""<svg class="mock" viewBox="0 0 400 420" role="img" aria-label="Camiseta Deyscom Motorsport">
  <path d="M120 30 L160 18 Q200 48 240 18 L280 30 L370 80 L340 150 L300 132 L300 400 L100 400 L100 132 L60 150 L30 80 Z" fill="var(--garment,#0b0b0d)" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
  <path d="M160 18 Q200 48 240 18" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="5"/>
  <path d="M100 132 L100 150 M300 132 L300 150" stroke="rgba(0,0,0,.25)" stroke-width="2"/>
  <g transform="translate(200 180) skewX(-6)" font-size="54">{word}</g>
  <g transform="translate(200 202)" font-size="13">{sub}</g>
  <rect x="150" y="225" width="100" height="5" fill="#ff66c4" transform="skewX(-20)"/>
</svg>"""
    if kind == "gorra":
        return f"""<svg class="mock" viewBox="0 0 400 320" role="img" aria-label="Gorra Deyscom Motorsport">
  <path d="M70 200 Q60 70 200 60 Q340 70 330 200 Z" fill="var(--garment,#0b0b0d)" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
  <path d="M200 60 L200 200 M135 72 Q120 140 125 200 M265 72 Q280 140 275 200" stroke="rgba(255,255,255,.1)" stroke-width="2" fill="none"/>
  <circle cx="200" cy="62" r="7" fill="var(--garment,#0b0b0d)" stroke="rgba(255,255,255,.25)"/>
  <path d="M60 200 Q200 180 340 200 Q380 215 370 245 Q200 215 30 245 Q20 215 60 200 Z" fill="var(--brim,#ff66c4)"/>
  <g transform="translate(200 150) skewX(-6)" font-size="44">{word}</g>
  <g transform="translate(200 170)" font-size="10">{sub}</g>
</svg>"""
    # pegatinas
    return f"""<svg class="mock" viewBox="0 0 400 360" role="img" aria-label="Pegatinas Deyscom Motorsport">
  <g transform="rotate(-8 200 140)">
    <rect x="50" y="80" width="300" height="120" rx="18" fill="#fff" filter="drop-shadow(0 10px 18px rgba(0,0,0,.5))"/>
    <rect x="62" y="92" width="276" height="96" rx="10" fill="var(--garment,#0b0b0d)"/>
    <g transform="translate(200 148) skewX(-6)" font-size="56">{word}</g>
    <g transform="translate(200 170)" font-size="12">{sub}</g>
  </g>
  <g transform="rotate(10 120 280)">
    <rect x="40" y="235" width="160" height="70" rx="12" fill="#ff66c4" filter="drop-shadow(0 8px 14px rgba(0,0,0,.5))"/>
    <text x="120" y="282" font-family="Barlow Condensed, sans-serif" font-style="italic" font-weight="900" font-size="34" text-anchor="middle" fill="#000">DEYSCOM</text>
  </g>
  <g transform="rotate(-6 290 290)">
    <circle cx="290" cy="285" r="52" fill="#fff" filter="drop-shadow(0 8px 14px rgba(0,0,0,.5))"/>
    <circle cx="290" cy="285" r="44" fill="#000"/>
    <text x="290" y="296" font-family="Barlow Condensed, sans-serif" font-style="italic" font-weight="900" font-size="34" text-anchor="middle" fill="#ff66c4">DM</text>
  </g>
</svg>"""


PRODUCTS = {
    "camiseta-deyscom": dict(
        kind="camiseta", name="Camiseta Deyscom Motorsport", short="Camiseta",
        price=25, tag="Más vendido",
        desc="La camiseta oficial del equipo. Algodón grueso, corte regular y el logo Deyscom Motorsport en el pecho. Para el paddock, el taller o el día a día.",
        colors=[("Negro", "#0b0b0d", "#ffffff"), ("Blanco", "#f2f2f4", "#0b0b0d"), ("Rosa", "#ff66c4", "#0b0b0d")],
        sizes=["S", "M", "L", "XL", "XXL"],
        features=["100% algodón, gramaje alto", "Logo Deyscom Motorsport en el pecho", "Corte unisex regular", "Lavado a 30 °C del revés"],
    ),
    "gorra-deyscom": dict(
        kind="gorra", name="Gorra Deyscom Motorsport", short="Gorra",
        price=22, tag="Paddock",
        desc="Gorra de seis paneles con visera curva y logo bordado. Cierre ajustable para que te quede perfecta en pista y fuera de ella.",
        colors=[("Negro / Rosa", "#0b0b0d", "#ffffff", "#ff66c4"), ("Negro total", "#0b0b0d", "#ffffff", "#0b0b0d"), ("Rosa / Negro", "#ff66c4", "#0b0b0d", "#0b0b0d")],
        sizes=["Talla única ajustable"],
        features=["Logo bordado", "Visera curva", "Cierre trasero ajustable", "Talla única"],
    ),
    "pegatinas-deyscom": dict(
        kind="pegatinas", name="Pack de pegatinas Deyscom", short="Pegatinas",
        price=6, tag="Pack",
        desc="Pack de pegatinas de vinilo con el logo Deyscom Motorsport: para el coche, el casco, la caja de herramientas o el portátil. Resistentes a la intemperie.",
        colors=[("Clásico negro", "#0b0b0d", "#ffffff"), ("Rosa", "#ff66c4", "#0b0b0d")],
        sizes=["Pack 3 uds", "Pack 6 uds", "Pegatina grande parabrisas"],
        features=["Vinilo de exterior resistente al agua y UV", "Corte a contorno", "Varios tamaños en el pack", "Ideal para coche, casco y taller"],
    ),
}


def product_card(slug, p):
    c = p["colors"][0]
    style = f"--garment:{c[1]};--print:{c[2]}" + (f";--brim:{c[3]}" if len(c) > 3 else "")
    return f"""<a class="product reveal" href="{slug}.html">
  <div class="product__media" style="{style}"><span class="product__tag">{p['tag']}</span>{mock_svg(p['kind'])}</div>
  <div class="product__body"><h3>{p['name']}</h3><span class="product__price">{p['price']} €</span></div>
  <span class="svc__go">Ver producto {I['arrow']}</span>
</a>"""


def tienda():
    html = head("Tienda · Coches en venta y merchandising | Deyscom Motorsport",
                "Coches de competición, clásicos y piezas a la venta, conectados con nuestro Wallapop. Y merchandising oficial Deyscom Motorsport: camisetas, gorras y pegatinas.",
                "tienda", "la tienda") + header("tienda")
    html += f"""<section class="hero page-hero" style="min-height:60svh">
  <div class="hero__bg"><img src="assets/img/tienda-hero.jpg" alt="" data-optional></div><div class="hero__grid"></div><div class="hero__speed" aria-hidden="true"></div>
  <div class="hero__number" aria-hidden="true">05</div>
  <div class="container hero__inner">
    <span class="eyebrow">Tienda Deyscom</span>
    <h1><span class="line"><span>Llévate</span></span><span class="line"><span class="pink">un trozo</span></span><span class="line"><span class="outline">de Deyscom</span></span></h1>
    <div class="hero__bottom">
      <p class="lead">Coches y piezas a la venta, revisados por nuestro taller, y el merchandising oficial del equipo.</p>
      <div class="btn-row" style="justify-content:flex-end">
        <a class="btn" href="#coches">{I['car']} Coches en venta</a>
        <a class="btn btn--ghost" href="#merch">{I['bag']} Merchandising</a>
      </div>
    </div>
  </div>
</section>
{ticker(["Coches", "Piezas", "Camisetas", "Gorras", "Pegatinas", "Wallapop"])}
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
<section class="section section--ink" id="merch">
  <div class="container">
    <div class="section__head">
      <div class="reveal"><span class="eyebrow">Merchandising oficial</span><h2>Viste <span class="outline">el equipo</span></h2></div>
      <p class="lead muted reveal" data-delay="1">Camisetas, gorras y pegatinas con el logo Deyscom Motorsport. Recógelas en el taller o te las enviamos a casa.</p>
    </div>
    <div class="products">{"".join(product_card(s, p) for s, p in PRODUCTS.items())}</div>
  </div>
</section>
<section class="section">
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
          <div class="field full"><label for="b-q">¿Qué buscas? <span class="req">*</span></label><input class="input" id="b-q" name="vehiculo" required placeholder="Ej. Clio Williams para rally, pinzas Brembo…"></div>
          <div class="field"><label for="b-p">Presupuesto</label><input class="input" id="b-p" name="presupuesto" placeholder="Hasta…"></div>
          <div class="field"><label for="b-n">Nombre <span class="req">*</span></label><input class="input" id="b-n" name="nombre" required autocomplete="name"></div>
          <div class="field full"><label for="b-t">Teléfono <span class="req">*</span></label><input class="input" id="b-t" name="telefono" type="tel" required autocomplete="tel" pattern="[0-9 +()\\-]{{9,}}" placeholder="600 000 000"></div>
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
    style = f"--garment:{c0[1]};--print:{c0[2]}" + (f";--brim:{c0[3]}" if len(c0) > 3 else "")
    swatches = "".join(
        f'<label class="swatch" title="{c[0]}"><input type="radio" name="color" value="{c[0]}" data-garment="{c[1]}" data-print="{c[2]}"'
        f'{f" data-brim={chr(34)}{c[3]}{chr(34)}" if len(c) > 3 else ""}{" checked" if i == 0 else ""} required>'
        f'<span style="background:{c[1]}{f";box-shadow:inset -14px 0 0 {c[3]}" if len(c) > 3 else ""}"></span></label>'
        for i, c in enumerate(p["colors"])
    )
    sizes = "".join(
        f'<label class="pill"><input type="radio" name="talla" value="{s}"{" checked" if len(p["sizes"]) == 1 or s == "M" else ""} required><span>{s}</span></label>'
        for s in p["sizes"]
    )
    feats = "".join(f"<li>{I['check']} {f}</li>" for f in p["features"])
    others = "".join(product_card(s, q) for s, q in PRODUCTS.items() if s != slug)
    ld = ('{"@context":"https://schema.org","@type":"Product","name":"' + p["name"] + '","brand":{"@type":"Brand","name":"Deyscom Motorsport"},'
          '"description":"' + p["desc"] + '","offers":{"@type":"Offer","priceCurrency":"EUR","price":"' + str(p["price"]) + '","availability":"https://schema.org/InStock","url":"' + SITE + '/' + slug + '.html"}}')

    html = head(f"{p['name']} · Tienda oficial | Deyscom Motorsport", p["desc"], slug, p["name"]) + header("tienda")
    html += f"""<script type="application/ld+json">{ld}</script>
<section class="section product-page">
  <div class="container">
    <nav class="crumbs" aria-label="Migas"><a href="index.html">Inicio</a> / <a href="tienda.html#merch">Tienda</a> / <span>{p['short']}</span></nav>
    <div class="pdp" data-product data-price="{p['price']}">
      <div class="pdp__gallery">
        <div class="pdp__stage" data-mock style="{style}">
          <span class="product__tag">{p['tag']}</span>
          {mock_svg(p['kind'])}
          <img src="assets/img/{slug}.jpg" alt="{escape(p['name'])}" data-optional>
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
          <fieldset class="pills mt-2"><legend class="field"><span class="pdp__lbl">Color: <b data-color-name>{c0[0]}</b></span></legend><div class="swatches">{swatches}</div></fieldset>
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
              <div class="field"><label for="p-t">Teléfono <span class="req">*</span></label><input class="input" id="p-t" name="telefono" type="tel" autocomplete="tel" required pattern="[0-9 +()\\-]{{9,}}" placeholder="600 000 000"></div>
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
        {success_block("¡Pedido recibido!", "Te contactamos para confirmar talla, disponibilidad, pago y entrega.")}
        <a class="btn mt-2" data-pay hidden href="#" target="_blank" rel="noopener">Pagar ahora {I['arrow']}</a>
      </div>
    </div>
  </div>
</section>
<section class="section section--ink section--tight">
  <div class="container">
    <div class="section__head"><div><span class="eyebrow">Completa el look</span><h2>También <span class="outline">te gustará</span></h2></div></div>
    <div class="products products--2">{others}</div>
  </div>
</section>
"""
    return html + footer()


# ------------------------------------------------------------------ legal
def legal():
    html = head("Aviso legal y privacidad | Deyscom Motorsport", "Aviso legal, política de privacidad y cookies de Deyscom Motorsport S.L.", "legal", "información") + header("legal")
    html += f"""<section class="section"><div class="container prose" style="max-width:860px">
<span class="eyebrow">Legal</span>
<h1 style="font-size:clamp(2.6rem,7vw,5rem)">Aviso legal <span class="outline">y privacidad</span></h1>
<p class="muted mt-2"><em>Texto base orientativo. Revísalo con vuestro asesor antes de publicar.</em></p>
<h2 id="aviso">Aviso legal</h2>
<p>Titular: Deyscom Motorsport S.L. · CIF B09939471 · Domicilio: C/ Canal de Isabel II, 2, Nave 3, 28180 Torrelaguna (Madrid) · Email: <a href="mailto:{EMAIL}">{EMAIL}</a> · Teléfono: {PHONE_TXT}.</p>
<p>El acceso a este sitio web atribuye la condición de usuario e implica la aceptación de estas condiciones. Los contenidos (textos, imágenes, logotipos y diseño) son propiedad de Deyscom Motorsport S.L. o de sus legítimos titulares y no pueden reproducirse sin autorización.</p>
<h2 id="privacidad">Política de privacidad</h2>
<p><strong>Responsable:</strong> Deyscom Motorsport S.L. <strong>Finalidad:</strong> atender tus solicitudes de información, presupuestos y pedidos. <strong>Legitimación:</strong> tu consentimiento al enviar el formulario. <strong>Destinatarios:</strong> no se ceden datos a terceros salvo obligación legal; los datos se almacenan en Google Workspace (Google Sheets) como encargado del tratamiento. <strong>Conservación:</strong> el tiempo necesario para atender tu solicitud y los plazos legales. <strong>Derechos:</strong> puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <a href="mailto:{EMAIL}">{EMAIL}</a>, y reclamar ante la AEPD (www.aepd.es).</p>
<h2 id="cookies">Cookies</h2>
<p>Esta web solo utiliza almacenamiento técnico de sesión para recordar el origen de tu visita al enviar un formulario. Si se añaden herramientas de analítica o publicidad (Google Analytics, Meta Pixel), se mostrará un banner para solicitar tu consentimiento.</p>
</div></section>
"""
    return html + footer()


def main():
    pages = {"index": home(), "nosotros": nosotros(), "contacto": contacto(), "tienda": tienda(), "legal": legal()}
    for s in SERVICES:
        pages[s] = service_page(s)
    for s in PRODUCTS:
        pages[s] = product_page(s)
    for name, html in pages.items():
        (ROOT / f"{name}.html").write_text(html, encoding="utf-8")
    urls = "".join(f"<url><loc>{SITE}/{'' if n == 'index' else n + '.html'}</loc></url>" for n in pages)
    (ROOT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n', encoding="utf-8")
    print("Generadas:", ", ".join(f"{n}.html" for n in pages))


if __name__ == "__main__":
    main()
