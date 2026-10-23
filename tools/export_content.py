#!/usr/bin/env python3
"""Vuelca el contenido que hay en el código (build.py, seo_content.py, blog_posts*.py) a content/*.json.

Se usó una vez para crear content/. Si se vuelve a ejecutar, SOBRESCRIBE lo editado en el panel:
úsalo solo con --force y sabiendo lo que haces.
"""
import ast
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build as B  # noqa: E402
from content import to_md  # noqa: E402

OUT = B.ROOT / "content"
if OUT.exists() and "--force" not in sys.argv:
    sys.exit("content/ ya existe. Usa --force para sobrescribirlo (se pierde lo editado en el panel).")


def dump(rel, data):
    p = OUT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def local_list(func, var):
    """Lee una lista literal definida dentro de una función de build.py (p. ej. home_faq en home())."""
    tree = ast.parse((Path(B.__file__)).read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == func:
            for st in ast.walk(node):
                if isinstance(st, ast.Assign) and getattr(st.targets[0], "id", "") == var:
                    v = st.value
                    if isinstance(v, ast.BoolOp):
                        v = v.values[-1]
                    return ast.literal_eval(v)
    return []


cfg = (B.ROOT / "assets/js/config.js").read_text(encoding="utf-8")
endpoint = re.search(r'SHEETS_ENDPOINT:\s*"([^"]*)"', cfg).group(1)
review = (re.search(r'googleReview:\s*"([^"]*)"', cfg) or [None, ""])[1]
pay = dict(re.findall(r'"([a-z0-9-]+)":\s*"([^"]*)"', cfg.split("payLinks", 1)[1].split("}", 1)[0]))
social = dict(re.findall(r'(\w+):\s*"(https://[^"]+)"', cfg.split("social", 1)[1]))

dump("ajustes.json", {
    "telefono": B.PHONE, "telefono_visible": B.PHONE_TXT, "whatsapp": "34615972233", "email": B.EMAIL,
    "aviso_superior": B.AJUSTES["aviso_superior"],
    "sheets_endpoint": endpoint, "google_review": review,
    "ga4_id": B.GA4_ID, "gtm_id": B.GTM_ID, "search_console": B.GSC_VERIFICATION,
    "precios": [{"producto": k, "precio": v} for k, v in B.PRICES.items()],
    "enlaces_pago": [{"producto": k, "url": v} for k, v in pay.items()],
    "redes": social,
})

post_slugs = {p["slug"] for p in B.POSTS}
NAMES = dict(B.CRUMB_NAME, index="Inicio", blog="Blog", contacto="Contacto", **{s: p["name"] for s, p in B.PRODUCTS.items()})
slugs = [s for s in dict.fromkeys(list(B.META) + list(B.H1)) if s not in post_slugs]
dump("seo.json", {"paginas": [{"slug": s, "nombre": NAMES.get(s, s), "titulo": B.META.get(s, ("", ""))[0], "descripcion": B.META.get(s, ("", ""))[1],
                               "h1": B.H1.get(s, ""), "noindex": False} for s in slugs]})

faqs = {"index": local_list("home", "home_faq"), "experiencias": local_list("experiencias", "faqs"),
        "ds-copilot-course": local_list("course_page", "faqs"), "alquiler-coche-de-rally": B.ALQ_FAQ, "coches-de-rally-en-venta": B.VENTA_FAQ}
faqs.update({s: v["faq"] for s, v in B.SERVICES.items()})
faqs.update({s: v["faq"] for s, v in B.EXPERIENCES.items()})
for s in ["index", "competicion", "alquiler-coche-de-rally", "coches-de-rally-en-venta", "restomod", "pintura", "banco-de-potencia",
          "experiencias", "ds-pilot-weekend-circuit", "ds-pilot-weekend-rally", "ds-pilot-weekend-slalom", "ds-copilot-course"]:
    dump(f"paginas/{s}.json", {
        "pagina": NAMES.get(s, s),
        "datos_clave": [{"dato": k, "valor": v} for k, v in B.FACTS.get(s, [])],
        "guias": [{"pregunta": q, "respuesta": to_md(h)} for q, h in B.GUIDES.get(s, [])],
        "faq": [{"pregunta": q, "respuesta": a} for q, a in faqs.get(s, [])],
        "articulos_relacionados": B.RELATED.get(s, []),
    })

for p in B.POSTS:
    dump(f"blog/{p['slug']}.json", {
        "titulo": p["title"], "slug": p["slug"], "seo_titulo": B.META.get(p["slug"], ("", ""))[0], "seo_descripcion": B.META.get(p["slug"], ("", ""))[1], "descripcion": p["desc"],
        "h1": to_md(p["h1"]), "palabras_clave": p["keywords"], "categoria": p["category"], "autor": p["author"], "editor": p.get("editor") or "",
        "fecha": p["date"], "minutos": p["minutes"], "imagen": p["img"], "imagen_subida": "", "imagen_alt": "",
        "respuesta_rapida": to_md(p["tldr"]),
        "secciones": [{"titulo": t, "texto": to_md(h)} for t, h in p["sections"]],
        "faq": [{"pregunta": q, "respuesta": a} for q, a in p["faq"]],
        "fuentes": [{"nombre": n, "url": u} for n, u in p["sources"]],
        "publicado": True,
    })

dump("autores.json", {"autores": [{"id": k, "nombre": a["name"], "cargo": a["role"], "ancla": a["anchor"], "bio": a["bio"]} for k, a in B.AUTHORS.items()]})
dump("patrocinadores.json", {"patrocinadores": [{"nombre": n, "logo": f"assets/img/patrocinadores/{f}", "web": u or ""} for n, f, u in B.SPONSORS]})
for s, p in B.PRODUCTS.items():
    dump(f"productos/{s}.json", {"nombre": p["name"], "nombre_corto": p["short"], "precio": p["price"], "etiqueta": p["tag"],
                                  "descripcion": p["desc"], "caracteristicas": p.get("features", []), "agotado": False})
print("Contenido exportado a", OUT)
