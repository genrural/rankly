"""Genera admin/config.yml (panel de contenido Sveltia CMS) a partir de los datos actuales.

Se regenera en cada build para que los desplegables (imágenes, artículos, autores) estén al día.
El archivo es JSON, que también es YAML válido.
"""
import json

REPO = "genrural/rankly"
BRANCH = "main"
SVELTIA_VERSION = "0.231.0"

MD_BUTTONS = ["bold", "italic", "link", "heading-three", "bulleted-list", "numbered-list"]


def f(label, name, widget="string", **kw):
    d = {"label": label, "name": name, "widget": widget}
    d.update(kw)
    return d


def faq_field(hint="Aparecen en la página y como datos estructurados FAQ para Google y las IA."):
    return f("Preguntas frecuentes", "faq", "list", required=False, hint=hint, summary="{{fields.pregunta}}",
             fields=[f("Pregunta", "pregunta"), f("Respuesta", "respuesta", "text", hint="Respuesta directa en 1-3 frases.")])


def build_config(g):
    site = g["SITE"]
    img_opts = [{"label": f'{v["alt"]} ({k})', "value": k} for k, v in sorted(g["IMG"].items(), key=lambda kv: kv[1]["alt"])]
    post_opts = [{"label": p["title"], "value": p["slug"]} for p in g["POSTS"]]
    author_opts = [{"label": a["name"], "value": k} for k, a in g["AUTHORS"].items()]
    cats = sorted({p["category"] for p in g["POSTS"]} | {"Competición", "Restomod", "Pintura", "Técnica", "Formación", "Circuito", "Taller", "Noticias"})
    names = dict(g["CRUMB_NAME"], index="Inicio", **{s: p["name"] for s, p in g["PRODUCTS"].items()})
    bookable_old = [{"label": "DS Pilot Weekend – Circuit", "value": "ds-pilot-weekend-circuit"}, {"label": "DS Pilot Weekend – Rally", "value": "ds-pilot-weekend-rally"},
                {"label": "DS Pilot Weekend – Slalom", "value": "ds-pilot-weekend-slalom"}, {"label": "DS Copilot Course", "value": "ds-copilot-course"}]
    payable = [{"label": p["name"], "value": s} for s, p in g["PRODUCTS"].items()]

    blog = {
        "name": "blog", "label": "Blog", "label_singular": "artículo", "folder": "content/blog", "format": "json", "extension": "json",
        "create": True, "delete": True, "slug": "{{slug}}", "identifier_field": "titulo", "summary": "{{titulo}} · {{fecha}}",
        "sortable_fields": ["fecha", "titulo", "categoria"], "description": "Artículos del blog. Se publican al guardar (la web se regenera en 1-2 minutos). Con fecha futura, se publican ese día.",
        "fields": [
            f("Título del artículo", "titulo", hint="El título que se ve en las tarjetas del blog."),
            f("URL (slug)", "slug", pattern=["^blog-[a-z0-9-]+$", "Empieza por blog- y usa solo minúsculas, números y guiones"],
              hint="Ej. blog-como-preparar-un-coche-de-slalom. No la cambies después de publicar (perderías posiciones en Google)."),
            f("Publicado", "publicado", "boolean", default=True, hint="Desactívalo para guardarlo como borrador."),
            f("Fecha de publicación", "fecha", "datetime", format="YYYY-MM-DD", date_format="DD/MM/YYYY", time_format=False),
            f("Categoría", "categoria", "select", options=cats),
            f("Autor", "autor", "select", options=author_opts, hint="Para E-E-A-T: firma quien sabe del tema."),
            f("Revisado por", "editor", "select", options=author_opts, required=False),
            f("Minutos de lectura", "minutos", "number", value_type="int", min=1, max=60, default=5),
            f("H1 (titular grande)", "h1", hint="Pon entre *asteriscos* la parte que va en rosa. Ej: Qué es un *restomod*"),
            f("Imagen principal", "imagen", "select", options=img_opts, required=False, hint="Elige una foto de la web… o sube una nueva abajo."),
            f("…o sube una imagen nueva", "imagen_subida", "image", required=False, hint="JPG o PNG. Se optimiza sola (< 100 KB, WebP)."),
            f("Texto alternativo de la imagen subida", "imagen_alt", required=False, hint="Describe la foto con palabras clave. Ej: Peugeot 206 de rally en un tramo de tierra"),
            f("Respuesta rápida", "respuesta_rapida", "text", hint="2-3 frases que respondan directamente a la pregunta del artículo. Es lo que más citan Google y las IA. Admite **negrita**."),
            f("Secciones", "secciones", "list", summary="{{fields.titulo}}", hint="Cada sección es un H2. Mejor en forma de pregunta (¿Qué es…? ¿Cuánto cuesta…?).",
              fields=[f("Título (H2)", "titulo"), f("Texto", "texto", "markdown", buttons=MD_BUTTONS, editor_components=[], modes=["rich_text", "raw"])]),
            faq_field(),
            f("Fuentes y referencias", "fuentes", "list", required=False, summary="{{fields.nombre}}", hint="Webs oficiales (BOE, RFEDA, FIA…). Suman credibilidad.",
              fields=[f("Nombre", "nombre"), f("URL", "url", pattern=["^https?://", "Debe empezar por https://"])]),
            f("SEO", "seo_grupo", "object", required=False, collapsed=True, hint="Opcional: si lo dejas vacío se usan el título y la descripción.", fields=[]),
            f("Título SEO (pestaña y Google)", "seo_titulo", required=False, hint="Máx. 65 caracteres, con la palabra clave al principio."),
            f("Descripción SEO (Google)", "seo_descripcion", "text", required=False, hint="Entre 120 y 160 caracteres."),
            f("Resumen (tarjetas y redes)", "descripcion", "text", hint="1-2 frases que inviten a leer."),
            f("Palabras clave", "palabras_clave", required=False, hint="Separadas por comas. La primera es la principal."),
        ],
    }
    blog["fields"] = [x for x in blog["fields"] if x["name"] != "seo_grupo"]

    page_files = []
    def page_fields(event=False):
        extra = [f("Introducción («¿En qué consiste?»)", "intro", "markdown", buttons=MD_BUTTONS, editor_components=[], modes=["rich_text", "raw"]),
                 f("Ejercicios", "ejercicios", "list", summary="{{fields.titulo}}", fields=[f("Título", "titulo"), f("Descripción", "texto", "text")]),
                 f("Qué incluye", "incluye", "list", field=f("Elemento", "item"))] if event else []
        return [f("Página", "pagina", "hidden")] + extra + [
            f("Datos clave", "datos_clave", "list", required=False, summary="{{fields.dato}}: {{fields.valor}}",
              hint="Respuestas cortas y concretas (dónde, qué, cuánto…). Es el bloque «Datos clave» y lo que mejor citan las IA.",
              fields=[f("Dato", "dato"), f("Valor", "valor")]),
            f("Guías (preguntas con respuesta larga)", "guias", "list", required=False, summary="{{fields.pregunta}}",
              hint="Cada guía es un H2 con su explicación. Enlaza a otras páginas y artículos.",
              fields=[f("Pregunta (H2)", "pregunta"), f("Respuesta", "respuesta", "markdown", buttons=MD_BUTTONS, editor_components=[], modes=["rich_text", "raw"])]),
            faq_field(),
            f("Artículos relacionados", "articulos_relacionados", "select", multiple=True, required=False, options=post_opts, max=3),
        ]

    for s in ["index", "competicion", "restomod", "pintura", "banco-de-potencia", "experiencias"]:
        page_files.append({"label": names.get(s, s), "name": s, "file": f"content/paginas/{s}.json", "fields": page_fields()})
    event_opts = [{"label": e["name"], "value": k} for k, e in g["EVENTS"].items()]
    editions_file = {"label": "Fechas, plazas y pago", "name": "ediciones", "file": "content/ediciones.json", "fields": [
        f("Fechas", "ediciones", "list", summary="{{fields.fecha}} · {{fields.turno}} · {{fields.experiencia}}",
          hint="Cada fila es un turno que se puede reservar. Aparece en la web con su botón de pago y en el Calendario del CRM.", fields=[
              f("Identificador", "id", pattern=["^[a-z0-9-]{3,60}$", "Minúsculas, números y guiones"], hint="Único. Ej. dspilot-2026-12-05-manana. No lo cambies si ya hay ventas."),
              f("Experiencia", "experiencia", "select", options=event_opts),
              f("Fecha", "fecha", "datetime", format="YYYY-MM-DD", date_format="DD/MM/YYYY", time_format=False),
              f("Turno", "turno", "select", options=["Mañana", "Tarde", "Día completo"]),
              f("Horario", "horario", required=False, hint="Opcional. Ej. 09:00–14:00"),
              f("Lugar", "lugar", default="Circuito El Hito (Cuenca)"),
              f("Plazas", "plazas", "number", value_type="int", min=1, default=20),
              f("Precio por persona (€)", "precio", "number", value_type="float", default=299),
              f("Enlace de pago de Stripe", "stripe", required=False, pattern=["^(https://(buy|checkout)\\.stripe\\.com/.+)?$", "Pega el enlace de pago de Stripe (https://buy.stripe.com/…)"],
                hint="Stripe → Enlaces de pago → crea uno por turno (299 €) y pégalo aquí. Vacío = la web recoge la reserva y os avisa para cobrarla."),
              f("Estado", "estado", "select", options=["Abierta", "Completa", "Cancelada"], default="Abierta"),
              f("Mostrar en la web", "visible", "boolean", default=True)])]}
    event_files = [{"label": e["name"] + " · textos", "name": k, "file": f"content/paginas/{k}.json", "fields": page_fields(True)} for k, e in g["EVENTS"].items()]

    seo_file = {"label": "SEO de las páginas", "name": "seo", "file": "content/seo.json",
                "fields": [f("Páginas", "paginas", "list", allow_add=False, allow_remove=False, allow_reorder=False, summary="{{fields.nombre}}", fields=[
                    f("Página", "nombre", hint="Solo informativo."), f("Archivo", "slug", hint="No lo cambies."),
                    f("Título SEO", "titulo", hint="Máx. 65 caracteres. Palabra clave al principio y marca al final: Taller de pintura de coches en Madrid | Deyscom"),
                    f("Descripción SEO", "descripcion", "text", hint="120-160 caracteres. Qué ofreces, dónde y una llamada a la acción."),
                    f("H1", "h1", required=False, hint="El encabezado principal de la página, con la búsqueda que quieres posicionar."),
                    f("Ocultar de Google (noindex)", "noindex", "boolean", default=False, required=False)])]}

    ajustes_file = {"label": "Ajustes generales", "name": "ajustes", "file": "content/ajustes.json", "fields": [
        f("Teléfono (formato +34…)", "telefono"), f("Teléfono visible", "telefono_visible"),
        f("WhatsApp (solo números, con 34)", "whatsapp", pattern=["^[0-9]{9,15}$", "Solo números, p. ej. 34615972233"]), f("Email", "email"),
        f("Aviso de la barra superior", "aviso_superior", "object", fields=[f("Mostrar", "activo", "boolean", default=True), f("Texto", "texto"), f("Enlace", "enlace", hint="Ej. ds-copilot-course.html")]),
        f("Enlaces de pago de la tienda (Stripe, PayPal…)", "enlaces_pago", "list", required=False, summary="{{fields.producto}}",
          fields=[f("Producto", "producto", "select", options=payable), f("URL de pago", "url", required=False)]),
        f("URL de Google Sheets (Apps Script /exec)", "sheets_endpoint", required=False, hint="Conecta formularios, CRM, stock de Wallapop y fechas. Ver README."),
        f("Enlace para pedir reseñas en Google", "google_review", required=False),
        f("Google Analytics 4 (G-…)", "ga4_id", required=False), f("Google Tag Manager (GTM-…)", "gtm_id", required=False, hint="Si lo rellenas, se usa en lugar de GA4 directo."),
        f("Verificación de Search Console", "search_console", required=False),
        f("Redes sociales", "redes", "object", fields=[f(n.capitalize(), n, required=False) for n in ("instagram", "facebook", "tiktok", "youtube", "wallapop")]),
    ]}
    autores_file = {"label": "Equipo / autores", "name": "autores", "file": "content/autores.json",
                    "fields": [f("Autores", "autores", "list", summary="{{fields.nombre}}", fields=[
                        f("Identificador", "id", pattern=["^[a-z0-9-]+$", "Minúsculas y guiones"], hint="Ej. nestor. No lo cambies si ya tiene artículos."),
                        f("Nombre", "nombre"), f("Cargo", "cargo"), f("Ancla en Quiénes somos", "ancla", required=False), f("Biografía", "bio", "text")])]}
    sponsors_file = {"label": "Patrocinadores", "name": "patrocinadores", "file": "content/patrocinadores.json",
                     "fields": [f("Patrocinadores", "patrocinadores", "list", summary="{{fields.nombre}}", fields=[
                         f("Nombre", "nombre"), f("Logo (PNG transparente)", "logo", "image", required=False, media_folder="/assets/img/patrocinadores", public_folder="assets/img/patrocinadores"),
                         f("Web", "web", required=False)])]}
    product_files = [{"label": p["name"], "name": s, "file": f"content/productos/{s}.json", "fields": [
        f("Nombre", "nombre"), f("Nombre corto", "nombre_corto"), f("Precio (€)", "precio", "number", value_type="float"),
        f("Etiqueta", "etiqueta", hint="Ej. Nuevo, Más vendido, Edición limitada"), f("Agotado", "agotado", "boolean", default=False),
        f("Descripción", "descripcion", "text"), f("Características", "caracteristicas", "list", field=f("Característica", "item"))]} for s, p in g["PRODUCTS"].items()]

    return {
        "backend": {"name": "github", "repo": REPO,  # sin "branch": usa la rama principal del repositorio
                    "commit_messages": {"create": "Panel: crea {{collection}} «{{slug}}»", "update": "Panel: actualiza {{collection}} «{{slug}}»",
                                        "delete": "Panel: borra {{collection}} «{{slug}}»", "uploadMedia": "Panel: sube {{path}}", "deleteMedia": "Panel: borra {{path}}"}},
        "site_url": site, "display_url": site, "logo": {"src": "/assets/img/favicon.svg"},
        "media_folder": "assets/img/subidas", "public_folder": "/assets/img/subidas",
        "slug": {"encoding": "ascii", "clean_accents": True, "sanitize_replacement": "-"},
        "collections": [
            blog,
            {"name": "experiencias", "label": "Experiencias", "label_singular": "experiencia",
             "description": "Fechas, turnos, plazas, precio y enlace de pago de Stripe de cada experiencia, y sus textos.", "files": [editions_file] + event_files},
            {"name": "paginas", "label": "Páginas", "label_singular": "página", "description": "Contenido SEO/GEO de cada página: datos clave, guías y preguntas frecuentes.", "files": page_files},
            {"name": "seo", "label": "SEO / GEO", "files": [seo_file]},
            {"name": "tienda", "label": "Tienda", "label_singular": "producto", "files": product_files},
            {"name": "ajustes", "label": "Ajustes", "files": [ajustes_file, autores_file, sponsors_file]},
        ],
    }


ADMIN_HTML = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Panel de contenido · Deyscom Motorsport</title>
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
</head>
<body>
<script src="https://unpkg.com/@sveltia/cms@{SVELTIA_VERSION}/dist/sveltia-cms.js"></script>
</body>
</html>
"""


def write(g, root):
    d = root / "admin"
    d.mkdir(exist_ok=True)
    (d / "config.yml").write_text("# Generado por tools/build.py (tools/admin_config.py). No editar a mano.\n" +
                                  json.dumps(build_config(g), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (d / "index.html").write_text(ADMIN_HTML, encoding="utf-8")
    (d / ".htaccess").write_text("# Panel de contenido: fuera de buscadores y sin caché (Apache / IONOS)\n<IfModule mod_headers.c>\n"
                                 "  Header set X-Robots-Tag \"noindex, nofollow\"\n  Header set Cache-Control \"no-store\"\n</IfModule>\n", encoding="utf-8")
