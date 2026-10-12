# Deyscom Motorsport · Web

Web estática (HTML + CSS + JS, sin dependencias) para **Deyscom Motorsport**, Torrelaguna (Madrid).
Se puede alojar en cualquier hosting: Netlify, Vercel, GitHub Pages, Cloudflare Pages o el hosting actual de deyscom.com.

## Páginas

| Página | Archivo |
|---|---|
| Inicio (promo DS Copilot Course, servicios, experiencias, tienda, presupuesto por pasos) | `index.html` |
| Coches de competición | `competicion.html` |
| Restomod | `restomod.html` |
| Pintura (con comparador cabina / terminado) | `pintura.html` |
| Banco de potencia | `banco-de-potencia.html` |
| Experiencias (portada) | `experiencias.html` |
| DS Pilot Weekend – Circuit / Rally / Slalom | `ds-pilot-weekend-circuit.html`, `ds-pilot-weekend-rally.html`, `ds-pilot-weekend-slalom.html` |
| Cursos (portada) | `cursos.html` |
| DS Copilot Course (compra de plaza) | `ds-copilot-course.html` |
| Tienda: merchandising + coches en venta (Wallapop) | `tienda.html` |
| Fichas de producto | `camiseta-edicion-especial-el-molar-2026.html`, `camiseta-deyscom.html`, `sudadera-capucha-deyscom.html`, `chaqueta-deyscom.html`, `gorra-deyscom.html`, `pegatinas-deyscom.html` |
| Blog (4 artículos) | `blog.html`, `blog-como-empezar-en-los-rallies.html`, `blog-que-hace-un-copiloto-de-rally.html`, `blog-banco-de-potencia-como-leer-la-curva.html`, `blog-que-es-un-restomod.html` |
| Quiénes somos (en el pie) | `nosotros.html` |
| Contacto (en el pie) | `contacto.html` |
| Aviso legal, privacidad y cookies | `legal.html` |

Menú principal: Competición · Restomod · Pintura · Banco de potencia · Experiencias · Cursos · **Tienda** (destacada como botón). Blog, Quiénes somos y Contacto están en el pie.

## Pensada para convertir

- Botón flotante de **WhatsApp** (615 97 22 33) en todas las páginas, con un mensaje distinto según la página.
- Barra fija en móvil con **Llamar · WhatsApp · Presupuesto**.
- Aviso de **abierto/cerrado** en tiempo real (hora de Madrid).
- Formulario de presupuesto en 3 pasos en la home y un formulario por cada servicio.
- Los leads se guardan en **Google Sheets** y llega un email a info@deyscom.com en cada uno.
- Si Google Sheets aún no está conectado, el formulario abre WhatsApp con los datos ya escritos. Así no se pierde ningún lead.
- Se guarda el origen de cada lead (`utm_*`, `gclid`, `fbclid`, página de entrada y referrer).
- Eventos `dataLayer` listos para Google Tag Manager, GA4 y Meta Pixel: `generate_lead`, `whatsapp_click`, `phone_click`, `begin_checkout`…
- SEO: títulos y descripciones por página, schema.org `AutoRepair` y `Product`, `sitemap.xml` y Open Graph.

## 1. Conectar formularios a Google Sheets (≈5 minutos)

1. Crea una hoja de cálculo nueva en Google Drive, por ejemplo «Leads web Deyscom».
2. Menú **Extensiones → Apps Script**. Borra el contenido y pega el de `google-apps-script/Code.gs`. Guarda.
3. En el desplegable de funciones elige `setup` y pulsa **Ejecutar**. Acepta los permisos. Se crean las pestañas **Leads** y **Stock**.
4. **Implementar → Nueva implementación → Tipo: Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
5. Copia la URL que termina en `/exec` y pégala en `assets/js/config.js`:
   ```js
   SHEETS_ENDPOINT: "https://script.google.com/macros/s/XXXX/exec",
   ```
6. Listo. Cada formulario añade una fila en «Leads» con fecha, servicio, datos de contacto, vehículo, presupuesto, origen y una columna `estado` para hacer el seguimiento («Nuevo», «Llamado», «Presupuestado»…).

> Si más adelante cambias el código del Apps Script, usa **Implementar → Gestionar implementaciones → Editar → Nueva versión** para mantener la misma URL.

## 2. Tienda: coches en venta conectados a Wallapop

Wallapop **no tiene una API pública oficial**. El Apps Script hace de puente:

1. Lee los anuncios del perfil `https://es.wallapop.com/user/deyscomm-467502343` con el endpoint interno de Wallapop (el mismo que usa su web) y los guarda en caché 30 minutos.
2. La página `tienda.html` los muestra con foto, precio, año y km, y dos botones: «Me interesa» (WhatsApp) y «Ver en Wallapop».
3. **Respaldo:** si Wallapop cambia su web o bloquea la consulta, se muestran los coches de la pestaña **Stock** de la hoja (columnas: `title, price, image, url, year, km, fuel, description, visible`). Si no hay ninguno, aparece un bloque con enlace directo al perfil de Wallapop.

Si la detección automática del perfil falla, abre el perfil de Wallapop en el navegador, busca el ID interno de usuario en el código fuente (`"id":"…"`) y ponlo en `WALLAPOP_USER_ID` dentro de `Code.gs`. Para forzar una recarga sin caché: `URL_DEL_SCRIPT?action=stock&refresh=1`.

## 3. Merchandising (camiseta, gorra y pegatinas)

- Cada ficha tiene selector de color (el mockup cambia de color en vivo), talla o formato, cantidad y total.
- «Lo quiero» abre un pedido rápido con recogida en el taller o envío a domicilio. El pedido llega a Google Sheets (formulario `pedido`) y por email.
- **Cobro online (opcional):** crea un Payment Link de Stripe, PayPal u otra pasarela por producto y pégalo en `payLinks` dentro de `assets/js/config.js`. Tras confirmar el pedido aparecerá el botón «Pagar ahora».
- **Precios orientativos** (25 €, 22 € y 6 €): cámbialos en `tools/build.py` (`PRODUCTS`) y regenera la web.
- Los mockups llevan el logotipo real vectorizado y cambian de color en vivo (camiseta negra, blanca o rosa; gorra con visera a juego; pegatinas en varias versiones).

## 4. Fotos, logotipo y SEO

- Las fotos están en `assets/img/fotos/` con **nombres descriptivos para SEO** (por ejemplo `bmw-e36-rally-tierra-deyscom-motorsport.jpg`), en JPG + WebP y en dos tamaños (1600 px y 800 px). Se sirven con `<picture>`, `srcset`, `width`/`height`, *lazy loading* y un texto `alt` descriptivo. Se han eliminado los metadatos EXIF (incluida la ubicación GPS).
- Los textos alternativos y tamaños están en `tools/images.json`. Para añadir fotos nuevas: optimízalas con el mismo patrón de nombres, añádelas a `images.json` y úsalas por su nombre en `tools/build.py`.
- **Logotipo**: vectorizado en SVG a partir del archivo original (`assets/img/logo-deyscom-motorsport-blanco.svg` / `-negro.svg`, más un PNG para redes y Google). En la web se pinta en línea, así que se ve nítido a cualquier tamaño y cambia de color según el fondo (también en el merchandising).
- **Tipografía**: el logo usa Futura. Como Futura es de pago para web, los títulos usan **Jost**, su alternativa libre en Google Fonts. Si tenéis licencia web de Futura, basta con cambiar `--f-display` en `assets/css/styles.css`.
- **SEO de cada página**: título y descripción únicos, palabras clave, canonical, `hreflang`, Open Graph y Twitter con la foto de la página, geolocalización, precarga de la imagen principal y datos estructurados de schema.org (`AutoRepair`, `Service`, `Product`, `Course`, `FAQPage`, `BreadcrumbList`, `ItemList`, `WebSite`). Además: `sitemap.xml` con prioridades y `robots.txt`.

## 5. Editar contenidos

- **Teléfono, WhatsApp, email, horario, redes y pagos:** `assets/js/config.js`.
- **Textos, servicios, experiencias, curso, FAQs y productos:** `tools/build.py`.
- **Precios del curso y las experiencias:** diccionario `PRICES` en `tools/build.py`. Ahora mismo ponen «Consultar»; si escribís un número, aparece el precio en la página y en Google.
- **Compra directa del curso o de las experiencias:** pegad un enlace de pago (Stripe Payment Link, PayPal…) en `payLinks` dentro de `assets/js/config.js`. El botón «Comprar mi plaza» llevará directamente al pago. Si está vacío, abre el formulario de reserva, que llega a Google Sheets. Después ejecuta:
  ```bash
  python3 tools/build.py
  ```
  Así se regeneran todos los `.html` con la cabecera y el pie comunes.
- **Estilos:** `assets/css/styles.css`. Los colores de marca son variables al principio del archivo: rosa `#FF66C4` y negro.

## 6. Analítica (opcional)

Pega el snippet de Google Tag Manager o GA4 en el `<head>` (función `head()` de `tools/build.py`). Los eventos de conversión ya se envían al `dataLayer`. Si añadís cookies de analítica o publicidad, recordad incluir un banner de consentimiento.

## 7. Blog, GEO y E-E-A-T

- Los artículos están en `tools/blog_posts.py` (texto, autor, fecha, FAQ y fuentes). Para añadir uno, copia un bloque de `POSTS` y ejecuta `python3 tools/build.py`.
- Cada artículo empieza con una **respuesta rápida** (lo que citan los buscadores con IA), tiene índice, preguntas frecuentes con datos estructurados `FAQPage`, **fuentes oficiales**, autor con nombre y cargo (`BlogPosting` + `Person`), fecha de publicación y actualización, y enlaces internos a servicios y experiencias.
- `llms.txt` (en la raíz) resume el negocio, los servicios y los artículos para asistentes de IA.
- Equipo con fichas en `nosotros.html#nestor-aguado` y `#hector-guzman`, enlazadas desde los artículos.

## 8. Patrocinadores y merchandising

- Logos en `assets/img/patrocinadores/` (EBC Frenos, HEL, Mishimoto y King Elements). La lista está en `SPONSORS` dentro de `tools/build.py`; solo King Elements lleva enlace (`rel="sponsored"`).
- Merch: camiseta, sudadera, chaqueta y gorra en negro y **edición especial El Molar 2026**, con fotos reales de producto en `assets/img/productos/`; pegatinas solo en negro. Los precios (35, 25, 45, 59, 22 y 6 €) son orientativos: cámbialos en `PRODUCTS`.

## 9. Peso de las imágenes y favicon

- Todas las imágenes pesan **menos de 100 KB**. Si añades fotos nuevas, ejecuta `python3 tools/optimize_images.py`: recomprime JPG y WebP hasta bajar del límite y actualiza `tools/images.json`.
- Favicon generado a partir del logo: `favicon.ico`, `assets/img/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` y `site.webmanifest`.
