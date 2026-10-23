"""Contenido editable de la web (panel /admin).

Los textos que se editan desde el panel de contenido viven en `content/` como JSON:
  content/ajustes.json          teléfono, email, aviso superior, precios, conexiones (Sheets, GA4…)
  content/seo.json              título, descripción y H1 de cada página
  content/paginas/<slug>.json   datos clave, guías, preguntas frecuentes y artículos relacionados
  content/blog/<slug>.json      artículos del blog
  content/autores.json          autores (E-E-A-T)
  content/patrocinadores.json   patrocinadores
  content/productos/<slug>.json productos de la tienda

`apply(globals())` se llama desde build.py y sustituye los valores por defecto del código
por lo que haya en estos archivos. Si un archivo no existe, se usa el valor por defecto.
"""
import json
import re
from datetime import date
from html import escape
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
LIST_RE = re.compile(r"^\s*([-*+]|\d+[.)])\s+")


# ------------------------------------------------------------------ Markdown mínimo → HTML
def inline(t):
    t = escape(t, quote=False)

    def link(m):
        txt, url = m.group(1), m.group(2).strip().replace('"', "%22")
        ext = re.match(r"https?://", url) and "deyscom.com" not in url
        return f'<a href="{url}"' + (' target="_blank" rel="noopener"' if ext else "") + f">{txt}</a>"

    t = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![*\w])\*(?![\s*])(.+?)(?<![\s*])\*(?![*\w])", r"<em>\1</em>", t)
    return t


def md(text):
    """Párrafos, listas (- y 1.), ### subtítulos, **negrita**, *cursiva* y [enlaces](url)."""
    out, para = [], []
    lines = str(text or "").replace("\r", "").split("\n")

    def flush():
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para.clear()

    i = 0
    while i < len(lines):
        s = lines[i].strip()
        if not s:
            flush(); i += 1; continue
        h = re.match(r"^(#{2,4})\s+(.*)", s)
        if h:
            flush()
            lvl = max(3, len(h.group(1)))
            out.append(f"<h{lvl}>{inline(h.group(2))}</h{lvl}>")
            i += 1; continue
        if LIST_RE.match(s):
            flush()
            ordered = s[0].isdigit()
            items = []
            while i < len(lines) and LIST_RE.match(lines[i]):
                items.append(LIST_RE.sub("", lines[i]).strip()); i += 1
                while i < len(lines) and lines[i].startswith("  ") and lines[i].strip() and not LIST_RE.match(lines[i]):
                    items[-1] += " " + lines[i].strip(); i += 1
            tag = "ol" if ordered else "ul"
            out.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>")
            continue
        para.append(s); i += 1
    flush()
    return "\n".join(out)


def md_inline(text):
    """Una sola línea (respuesta rápida, H1): sin <p>."""
    return inline(" ".join(str(text or "").split()))


def h1_html(text):
    """H1 del blog: la parte entre *asteriscos* sale en rosa."""
    t = escape(" ".join(str(text or "").split()), quote=False)
    return re.sub(r"\*(.+?)\*", r"<span class='pink'>\1</span>", t)


# ------------------------------------------------------------------ HTML → Markdown (migración)
class _ToMd(HTMLParser):
    def __init__(self):
        super().__init__()
        self.out, self.stack, self.href, self.counter = [], [], [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("ul", "ol"):
            self.stack.append(tag); self.counter.append(0); self.out.append("\n")
        elif tag == "li":
            self.counter[-1] += 1
            self.out.append("\n" + (f"{self.counter[-1]}. " if self.stack[-1] == "ol" else "- "))
        elif tag == "p":
            self.out.append("\n\n")
        elif tag in ("strong", "b"):
            self.out.append("**")
        elif tag in ("em", "i"):
            self.out.append("*")
        elif tag == "a":
            self.href.append(a.get("href", "")); self.out.append("[")
        elif tag == "br":
            self.out.append("\n")
        elif tag in ("h3", "h4"):
            self.out.append("\n\n### ")
        elif tag == "span":
            if "pink" in (a.get("class") or ""):
                self.out.append("*")
            self.stack.append("span:" + ("pink" if "pink" in (a.get("class") or "") else ""))

    def handle_endtag(self, tag):
        if tag in ("ul", "ol"):
            self.stack.pop(); self.counter.pop(); self.out.append("\n\n")
        elif tag in ("strong", "b"):
            self.out.append("**")
        elif tag in ("em", "i"):
            self.out.append("*")
        elif tag == "a":
            self.out.append(f"]({self.href.pop()})")
        elif tag == "p":
            self.out.append("\n\n")
        elif tag == "span":
            if self.stack and self.stack.pop() == "span:pink":
                self.out.append("*")

    def handle_data(self, data):
        self.out.append(re.sub(r"\s+", " ", data))


def to_md(html_text):
    p = _ToMd()
    p.feed(html_text or "")
    txt = "".join(p.out)
    lines = [ln.strip() for ln in txt.split("\n")]
    txt = "\n".join(lines)
    txt = re.sub(r"\n{3,}", "\n\n", txt).strip()
    txt = re.sub(r"\n\n(?=(- |\d+\. ))", "\n\n", txt)
    return txt


# ------------------------------------------------------------------ lectura
def read(rel):
    p = CONTENT / rel
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding="utf-8"))


def pairs(items, a, b, conv=None):
    return [(x.get(a, ""), conv(x.get(b, "")) if conv else x.get(b, "")) for x in (items or []) if x.get(a)]


def post_from_json(d):
    """Artículo del panel → dict que usa build.py."""
    slug = d.get("slug") or ""
    return dict(
        slug=slug, title=d.get("titulo", ""), h1=h1_html(d.get("h1") or d.get("titulo", "")),
        desc=d.get("descripcion", ""), keywords=d.get("palabras_clave", ""), category=d.get("categoria", "Blog"),
        author=d.get("autor", "nestor"), editor=d.get("editor") or None, date=str(d.get("fecha", ""))[:10],
        minutes=int(d.get("minutos") or 5), img=d.get("imagen") or "", img_upload=d.get("imagen_subida") or "",
        img_alt=d.get("imagen_alt") or "", tldr=md_inline(d.get("respuesta_rapida", "")),
        sections=pairs(d.get("secciones"), "titulo", "texto", md), faq=pairs(d.get("faq"), "pregunta", "respuesta"),
        sources=pairs(d.get("fuentes"), "nombre", "url"), seo_title=d.get("seo_titulo") or "", seo_desc=d.get("seo_descripcion") or "",
        published=d.get("publicado", True) is not False,
    )


def apply(g):
    """Sustituye en build.py (g = globals()) los valores por defecto por el contenido del panel."""
    if not CONTENT.exists():
        return
    a = read("ajustes.json")
    if a:
        g["AJUSTES"].update(a)
        for k, key in (("telefono", "PHONE"), ("telefono_visible", "PHONE_TXT"), ("email", "EMAIL"), ("ga4_id", "GA4_ID"),
                       ("gtm_id", "GTM_ID"), ("search_console", "GSC_VERIFICATION")):
            if a.get(k) is not None:
                g[key] = a[k]
        g["ORG_LD"]["telephone"], g["ORG_LD"]["email"] = g["PHONE"], g["EMAIL"]
        for p in a.get("precios") or []:
            if p.get("producto") in g["PRICES"]:
                g["PRICES"][p["producto"]] = p.get("precio") or None

    seo = read("seo.json")
    if seo:
        for p in seo.get("paginas") or []:
            s = p.get("slug")
            if not s:
                continue
            if p.get("titulo") and p.get("descripcion"):
                g["META"][s] = (p["titulo"], p["descripcion"])
            if p.get("h1"):
                g["H1"][s] = p["h1"]
            if p.get("noindex"):
                g["NOINDEX"].add(s)

    pdir = CONTENT / "paginas"
    for f in sorted(pdir.glob("*.json")) if pdir.exists() else []:
        d, s = json.loads(f.read_text(encoding="utf-8")), f.stem
        if "datos_clave" in d:
            g["FACTS"][s] = pairs(d["datos_clave"], "dato", "valor")
        if "guias" in d:
            g["GUIDES"][s] = pairs(d["guias"], "pregunta", "respuesta", md)
        if "articulos_relacionados" in d:
            g["RELATED"][s] = [x for x in d["articulos_relacionados"] if x]
        if "faq" in d:
            faq = pairs(d["faq"], "pregunta", "respuesta")
            g["FAQ_OVERRIDE"][s] = faq
            for coll in ("SERVICES", "EXPERIENCES"):
                if s in g[coll]:
                    g[coll][s]["faq"] = faq

    au = read("autores.json")
    if au and au.get("autores"):
        g["AUTHORS"].clear()
        for x in au["autores"]:
            g["AUTHORS"][x["id"]] = dict(name=x["nombre"], role=x.get("cargo", ""), anchor=x.get("ancla") or x["id"], bio=x.get("bio", ""))

    bdir = CONTENT / "blog"
    if bdir.exists():
        today = date.today().isoformat()
        posts = [post_from_json(json.loads(f.read_text(encoding="utf-8"))) for f in sorted(bdir.glob("*.json"))]
        posts = [p for p in posts if p["slug"] and p["published"] and p["date"] <= today and p["author"] in g["AUTHORS"]]
        for p in posts:
            if p["img_upload"]:
                p["img"] = g["register_upload"](p["img_upload"], p["img_alt"] or p["title"]) or p["img"]
            if p["img"] not in g["IMG"]:
                p["img"] = "peugeot-206-rally-polvo-contraluz-deyscom"
            if p["editor"] not in g["AUTHORS"]:
                p["editor"] = None
            if p["seo_title"] or p["seo_desc"]:
                g["META"][p["slug"]] = (p["seo_title"] or p["title"] + " | Deyscom Motorsport", p["seo_desc"] or p["desc"])
        posts.sort(key=lambda p: p["date"], reverse=True)
        g["POSTS"][:] = posts
        g["POST_BY_SLUG"].clear()
        g["POST_BY_SLUG"].update({p["slug"]: p for p in posts})

    sp = read("patrocinadores.json")
    if sp and sp.get("patrocinadores") is not None:
        g["SPONSORS"][:] = [(x["nombre"], Path(x.get("logo") or "").name, x.get("web") or None) for x in sp["patrocinadores"] if x.get("nombre")]
        g["ORG_LD"]["sponsor"] = [{"@type": "Organization", "name": n} for n, *_ in g["SPONSORS"]]

    prdir = CONTENT / "productos"
    for f in sorted(prdir.glob("*.json")) if prdir.exists() else []:
        s, d = f.stem, json.loads(f.read_text(encoding="utf-8"))
        if s not in g["PRODUCTS"]:
            continue
        p = g["PRODUCTS"][s]
        for k_es, k in (("nombre", "name"), ("nombre_corto", "short"), ("etiqueta", "tag"), ("descripcion", "desc")):
            if d.get(k_es):
                p[k] = d[k_es]
        if d.get("precio") is not None:
            p["price"] = d["precio"]
        if d.get("caracteristicas"):
            p["features"] = [x for x in d["caracteristicas"] if x]
        p["soldout"] = bool(d.get("agotado"))
