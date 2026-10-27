# Deyscom Motorsport · Web

Web estática (HTML + CSS + JS, sin dependencias) para **Deyscom Motorsport**, Torrelaguna (Madrid).
Se puede alojar en cualquier hosting: Netlify, Vercel, GitHub Pages, Cloudflare Pages o el hosting actual de deyscom.com.

## Páginas

| Página | Archivo |
|---|---|
| Inicio (promo de experiencias, servicios, tienda, presupuesto por pasos) | `index.html` |
| Coches de competición | `competicion.html` |
| Restomod | `restomod.html` |
| Pintura (con comparador cabina / terminado) | `pintura.html` |
| Banco de potencia | `banco-de-potencia.html` |
| Experiencias (todas las fechas, con pago) | `experiencias.html` |
| Experiencia Rally Eurocem · 4 dic 2026 | `experiencia-rally-eurocem.html` |
| DS Pilot Course · 5, 6 y 7 dic 2026 | `ds-pilot-course.html` |
| Gracias (tras pagar en Stripe; fuera de Google) | `gracias.html` |
| Tienda: merchandising + coches en venta (Wallapop) | `tienda.html` |
| Fichas de producto | `camiseta-edicion-especial-el-molar-2026.html`, `camiseta-deyscom.html`, `sudadera-capucha-deyscom.html`, `chaqueta-deyscom.html`, `gorra-deyscom.html`, `pegatinas-deyscom.html` |
| Blog (9 artículos) | `blog.html`, `blog-coche-de-rally-que-es-y-categorias.html`, `blog-slalom-de-coches-que-es.html`, `blog-circuito-del-jarama-tandas.html`, `blog-cuanto-cuesta-pintar-un-coche.html`, `blog-reformas-itv-y-vehiculos-historicos.html`, `blog-como-empezar-en-los-rallies.html`, `blog-que-hace-un-copiloto-de-rally.html`, `blog-banco-de-potencia-como-leer-la-curva.html`, `blog-que-es-un-restomod.html` |
| Quiénes somos (en el pie) | `nosotros.html` |
| Contacto (en el pie) | `contacto.html` |
| Aviso legal · Privacidad · Cookies · Condiciones de compra | `aviso-legal.html`, `politica-privacidad.html`, `politica-cookies.html`, `condiciones-compra.html` |
| Página de error | `404.html` |
| Área privada · CRM de leads (enlace «Área privada» en el pie, fuera de Google) | `crm.html` |

Menú principal: Competición · Restomod · Pintura · Banco de potencia · Experiencias (Experiencia Rally Eurocem y DS Pilot Course) · **Tienda** (destacada como botón). Blog, Quiénes somos y Contacto están en el pie.

**En la recámara** (no se publican, pero el código está guardado): DS Pilot Weekend Circuit/Rally/Slalom, DS Copilot Course, Cursos, Alquiler de coche de rally y Coches de rally en venta.
- Para recuperar alguna, quítala de `RESERVED` en `tools/build.py` y vuelve a añadirla al menú.

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

Lo normal es editar desde el **panel de contenido** (`deyscom.com/admin`, apartado 13). No hace falta tocar código.

| Qué | Dónde |
|---|---|
| Artículos del blog | Panel → Blog. Archivos en `content/blog/*.json` |
| Título, descripción y H1 de cada página | Panel → SEO / GEO. Archivo `content/seo.json` |
| Datos clave, guías y preguntas frecuentes | Panel → Páginas. Archivos en `content/paginas/*.json` |
| Productos de la tienda (precio, agotado…) | Panel → Tienda. Archivos en `content/productos/*.json` |
| Teléfono, email, aviso superior, precios, enlaces de pago, Google Sheets, GA4, redes | Panel → Ajustes. Archivo `content/ajustes.json` |
| Autores (E-E-A-T) y patrocinadores | Panel → Ajustes |
| Diseño, estructura y secciones nuevas | Código: `tools/build.py` y `assets/css/styles.css` |

Notas:
- `assets/js/config.js` **se genera solo** a partir de los ajustes: no lo edites a mano.
- Para regenerar la web en local:
  ```bash
  pip install -r requirements.txt   # solo la primera vez
  python3 tools/build.py
  ```
- Los colores de marca son variables al principio de `assets/css/styles.css`: rosa `#FF66C4` y negro.

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

## 10. Textos legales, cookies y publicación

- Datos de la sociedad en `COMPANY` (`tools/build.py`): DEYSCOM MOTORSPORT, S.L., CIF B09939471, Registro Mercantil de Madrid, hoja M-764451. Conviene completar tomo y folio con la nota simple del Registro.
- La política de cancelación de experiencias y cursos está en `CANCEL_POLICY` (`tools/build.py`): **revisadla y ajustadla** a vuestras condiciones reales.
- Aviso de cookies propio con **Google Consent Mode v2**, conectado a **GA4 (G-LLGMMVL7M1)**. Si más adelante usáis GTM, rellenad `GTM_ID` y vaciad `GA4_ID` en `tools/build.py`.
- Verificación de **Google Search Console** incluida en todas las páginas (`GSC_VERIFICATION`). Tras publicar, enviad `https://deyscom.com/sitemap.xml` (incluye las imágenes).
- Eventos enviados a GA4: `generate_lead` (formularios, con el nombre del formulario), `whatsapp_click`, `phone_click`, `email_click`, `begin_checkout`, `form_step` y `consent_update`. Marcad `generate_lead`, `whatsapp_click` y `phone_click` como **eventos clave** en GA4.
- `.htaccess` (Apache) y `_headers` (Netlify/Cloudflare): HTTPS, caché, compresión y cabeceras de seguridad. En `.htaccess` hay un hueco para las **redirecciones 301 de la web antigua**.

## 11. SEO local y GEO (buscadores con IA)

- **Palabra clave en cada H1**: cada página tiene un H1 con su búsqueda principal (p. ej. «Taller de pintura de coches en Madrid») y el eslogan grande queda como diseño. Se editan en `H1` dentro de `tools/build.py`; los títulos y descripciones, en `META`.
- **Migas de pan visibles** + `BreadcrumbList`, y un `WebPage` en JSON-LD en todas las páginas.
- **Contenido SEO por página** en `tools/seo_content.py`:
  - `FACTS`: el bloque «Datos clave», con respuestas directas que los buscadores con IA pueden citar.
  - `GUIDES`: guías con títulos en forma de pregunta.
  - `RELATED`: artículos del blog enlazados en cada página.
  - `AREA`: municipios de la zona de servicio. Se usan en el texto y en el `areaServed` del schema.
- **Experiencias con fecha**: cada turno lleva datos estructurados `Event` (fecha, lugar, precio y disponibilidad) para que Google pueda mostrarlo como evento.
- **Blog**: 9 artículos. Los 5 nuevos atacan las búsquedas con más volumen: coche de rally, slalom, Circuito del Jarama, cuánto cuesta pintar un coche, y reformas ITV / vehículos históricos. Están en `tools/blog_posts_extra.py`.
- **IA**: `robots.txt` permite explícitamente a GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc. `llms.txt` es el resumen y `llms-full.txt` el texto completo de las páginas clave (se regeneran solos con cada build).
- **Pendiente fuera de la web** (lo que más mueve el SEO local):
  - Ficha de Google Business Profile con categoría «Taller mecánico», fotos y horario.
  - Reseñas de clientes.
  - Enviar `sitemap.xml` en Search Console.
  - Enlaces desde federaciones, organizadores de rallies y patrocinadores.

## 12. CRM y área privada (`crm.html`)

Un CRM dentro de la web para ver y gestionar todos los leads. Lee y escribe en la misma hoja de Google Sheets donde llegan los formularios: no hay que pagar ningún servicio.

**Qué incluye**
- **Panel**: leads totales, del mes, sin contactar, conversión, valor en curso y ganado, leads por semana, por servicio, por origen (Google, Instagram, Ads, ChatGPT…) y por estado. También próximas acciones (con aviso de atrasadas) y últimos leads.
- **Leads**: buscador y filtros por estado, servicio, origen y periodo. Exportación a CSV (se abre en Excel).
- **Pipeline**: columnas Nuevo → Contactado → Presupuesto enviado → Negociación → Ganado / Perdido. Se arrastran las tarjetas para cambiar el estado.
- **Ficha de cada lead**:
  - Botones de WhatsApp, llamar y email.
  - Estado, valor, próxima acción y responsable.
  - Datos de la solicitud y origen (página, campaña, gclid…).
  - Notas con historial de quién hizo qué y cuándo.
- **Nuevo lead** para llamadas, visitas al taller o mensajes de Instagram.
- **Usuarios** (solo administrador): crear usuarios y generar contraseñas nuevas.
- **Mi cuenta**: cambiar la propia contraseña.

**Roles**
- `admin` puede hacerlo todo, incluido borrar leads y gestionar usuarios.
- `cliente` ve y gestiona leads, pero no borra ni gestiona usuarios.

**Más funciones**
- **Calendario:**
  - Las fechas (turnos) de las experiencias, con plazas vendidas, ingresos, reservas sin pagar y el enlace de pago de cada turno.
  - Las fechas se crean y editan en el panel de contenido (Experiencias → Fechas, plazas y pago). El CRM las lee de la web.
  - Una plaza cuenta como vendida cuando el lead está en «Ganado»: lo pone solo el pago de Stripe, o a mano si alguien paga por otra vía.
- **Ventas (Stripe):**
  - Pagos de Stripe con cliente, experiencia, fecha y turno, plazas e importe.
  - Ocupación de cada fecha y reservas sin pagar, para recuperarlas con la plantilla de WhatsApp «Completar el pago».
  - Ver apartado 15.
- **Presupuestos en PDF:**
  - Se hacen desde la ficha del lead, con líneas, IVA, validez y observaciones.
  - Numeración P-AAAA-NNN.
  - El PDF se guarda en la carpeta de Drive «Presupuestos Deyscom Motorsport» y se puede enviar por email al cliente.
  - Al crearlo, el lead pasa a «Presupuesto enviado» con su valor. Si se marca «Aceptado», pasa a «Ganado».
- **Pedidos:** los pedidos de la tienda, con su estado de envío (pendiente de pago → pagado → preparando → enviado → entregado) e ingresos.
- **Plantillas de WhatsApp** por servicio: primer contacto, pedir fotos, cita en el taller, seguimiento, confirmar plaza, pedido enviado y pedir reseña (usa el enlace de reseñas de los Ajustes).
- **Etiquetas**, aviso de **duplicados** (misma persona con varias solicitudes) y enlace para llevar la próxima acción a **Google Calendar**.
- **Rendimiento por canal** en el panel: leads, ganados, conversión y valor por Google, Instagram, Ads, IA…
- **Emails automáticos:**
  - Cada día a las 08:00, un resumen con los leads nuevos, las llamadas de hoy y las atrasadas.
  - El día 1 de cada mes, un informe por canal y servicio.

**Activarlo (después del apartado 1)**
1. En el Apps Script, busca la función `crearUsuarios` y cambia `TU_EMAIL@ejemplo.com` por tu email. El del cliente ya está puesto: `info@deyscom.com`.
2. Elige `crearUsuarios` en el desplegable y pulsa **Ejecutar**. En **Registro de ejecución** aparecen las dos contraseñas generadas.
   - Guárdalas: no se vuelven a mostrar.
   - Envía la del cliente por un canal privado.
3. Vuelve a ejecutar `setup`. Crea las pestañas **Actividad**, **Ediciones** y **Presupuestos** y pide los permisos nuevos (Drive para los PDF y activadores para los emails).
4. Ejecuta `activarResumenes` una vez para programar el resumen diario y el informe mensual.
5. **Implementar → Gestionar implementaciones → editar → Nueva versión**. Así la URL `/exec` se mantiene y la web la sigue usando.
6. Entra en `https://deyscom.com/crm.html`. Hay un enlace discreto «Área privada» en el pie de la web.

**Seguridad**
- **Contraseñas:** se guardan cifradas (hash con sal), nunca en claro.
- **Inicio de sesión:**
  - Tras 5 intentos fallidos, el acceso se bloquea 15 minutos.
  - La sesión caduca tras 6 h sin actividad.
- **Datos de los formularios:**
  - Se neutralizan para que nadie pueda colar fórmulas en la hoja.
  - Desde la web nadie puede fijar el estado ni el valor de un lead.
- **Buscadores:** `crm.html` no se indexa (`noindex`, `robots.txt` y cabeceras) y no está en el sitemap.

Mientras `SHEETS_ENDPOINT` esté vacío, el CRM se puede probar en **modo demostración** con datos de ejemplo.

## 13. Panel de contenido (`/admin`, tipo WordPress)

Un panel para editar el blog, el SEO/GEO, las páginas, la tienda y los ajustes sin tocar código. Es [Sveltia CMS](https://github.com/sveltia/sveltia-cms) (gratuito).

**Por qué así y no un WordPress**
- La web sigue siendo HTML estático: carga muy rápido y Google y las IA la leen completa, sin depender de JavaScript.
- Cada vez que alguien guarda en el panel:
  1. El cambio se guarda en GitHub (`content/*.json`).
  2. Netlify regenera la web en 1-2 minutos.
- Hay historial de cada cambio y se puede deshacer cualquier cosa.

**Qué se puede editar**
- **Blog:**
  - Crear, editar, programar (fecha futura) y despublicar artículos.
  - Campos: respuesta rápida, secciones H2, FAQ, fuentes, autor y revisor, imagen (elegir una de la web o subir una nueva; se optimiza sola a WebP < 100 KB), título y descripción SEO.
- **Experiencias:**
  - Fechas, turnos, plazas, precio, enlace de pago de Stripe y estado (abierta, completa o cancelada).
  - Los textos de cada experiencia: introducción, ejercicios, qué incluye, datos clave y FAQ.
- **Páginas:** datos clave, guías y preguntas frecuentes de cada servicio y artículos relacionados.
- **SEO / GEO:**
  - Título, descripción y H1 de todas las páginas.
  - Opción de ocultar una página de Google: `noindex` y fuera del sitemap.
- **Tienda:** nombre, precio, etiqueta, descripción, características y «agotado». Si está agotado, el botón pasa a «avísame» y Google ve `OutOfStock`.
- **Ajustes:**
  - Teléfono, email, aviso de la barra superior, precios de experiencias y curso, y enlaces de pago.
  - URL de Google Sheets, GA4/GTM, Search Console y redes.
  - Autores y patrocinadores.

**Acceso**
- Entra en `https://deyscom.com/admin`. En IONOS, con un token de GitHub: ver apartado 14, «Login del panel».
- Cada persona necesita una cuenta de GitHub con acceso al repositorio `genrural/rankly`: GitHub → Settings → Collaborators.
- Desde el CRM hay un acceso directo («Contenido web ↗»).

**Artículos programados:** se publican solos el día indicado. En IONOS lo hace el despliegue diario de las 06:00. En Netlify, pega su *Build hook* en `DEPLOY_HOOK_URL` del Apps Script.

## 14. Publicar en IONOS (deyscom.com)

La web se publica sola en el hosting de IONOS con **GitHub Actions** (`.github/workflows/deploy-ionos.yml`):
- **Cuándo:** con cada cambio en la **rama principal** del repositorio (incluidos los del panel /admin), cada día a las 06:00 (para que salgan los artículos programados) y a mano desde GitHub → Actions → «Publicar en IONOS» → **Run workflow**.
- **Qué hace:** genera la web (`tools/build.py`), prepara `dist/` (solo lo público) y lo sube por **SFTP** a una carpeta del webspace. Borra de esa carpeta lo que ya no existe en la web.

### Paso 1 · Preparar IONOS (panel de IONOS)
1. **Usuario SFTP.** Menú → Hosting → tile **SFTP & SSH** → Gestionar. Anota:
   - el **servidor** (p. ej. `accessNNNNNNNNN.webspace-data.io`),
   - el **usuario** (p. ej. `u12345678`),
   - la **contraseña**. Si no la recuerdas, créala nueva o crea un usuario SFTP solo para la web.
   - Protocolo SFTP, puerto 22.
2. **Carpeta nueva para la web**, por ejemplo `/deyscom-web`. No hace falta crearla, la crea el despliegue.
   - No uses la carpeta de la web actual: así la antigua queda intacta como copia de seguridad.
3. **Certificado SSL.** Menú → Dominios y SSL → `deyscom.com` → SSL → activa el certificado incluido en el plan (SSL Starter / Wildcard) para `deyscom.com` y `www.deyscom.com`.

### Paso 2 · Conectar GitHub con IONOS
En GitHub: repositorio → **Settings → Secrets and variables → Actions → New repository secret**. Crea estos 4:

| Secret | Valor |
|---|---|
| `IONOS_SFTP_HOST` | servidor SFTP de IONOS |
| `IONOS_SFTP_USER` | usuario SFTP (`u…`) |
| `IONOS_SFTP_PASSWORD` | contraseña SFTP |
| `IONOS_SFTP_DIR` | carpeta de destino, p. ej. `/deyscom-web` |

### Paso 3 · Primera publicación
1. Asegúrate de que la rama con la web es la **rama principal** del repositorio (GitHub → Settings → General → Default branch). Hoy lo es `claude/deyscom-motorsport-website-bzk6sw`; si la fusionáis en `main` y la ponéis como principal, todo sigue funcionando igual. El panel /admin guarda en esa misma rama.
2. GitHub → Actions → «Publicar en IONOS» → **Run workflow**. Debe terminar en verde ✅.
3. Comprueba en el explorador de archivos de IONOS (o con FileZilla) que `/deyscom-web` tiene `index.html`, `.htaccess`, `assets/`…

### Paso 4 · Apuntar el dominio (el cambio visible)
1. Menú → Dominios y SSL → `deyscom.com` → **Ajustar destino / Usar dominio → Webspace** → carpeta `/deyscom-web`.
2. Haz lo mismo con `www.deyscom.com`. El `.htaccess` lo redirige a `deyscom.com` sin www y con HTTPS.
3. **No toques los registros MX ni el correo:** solo se cambia la carpeta de destino. `info@deyscom.com` sigue funcionando igual.
4. Tarda de unos minutos a 1 h. Para volver a la web antigua, basta con apuntar el dominio otra vez a su carpeta.

### Paso 5 · Redirecciones de la web antigua (importante para no perder Google)
1. Saca la lista de URLs de la web actual **antes** de cambiar el dominio, por una de estas vías:
   - Su sitemap (`deyscom.com/sitemap.xml` o `/sitemap_index.xml`).
   - Google Search Console → Indexación → Páginas.
2. Añade una línea por URL en `.htaccess`, debajo de «Redirecciones 301»:
   ```apache
   Redirect 301 /servicios/pintura/ https://deyscom.com/pintura.html
   Redirect 301 /contacto/ https://deyscom.com/contacto.html
   ```
3. Haz commit en la rama principal: se publica solo.

### Paso 6 · Después de publicar
- **Search Console:**
  - Verifica la propiedad. La etiqueta ya está en la web.
  - Envía `https://deyscom.com/sitemap.xml`.
  - Si cambiaste URLs, usa «Inspección de URLs» con la home y las páginas clave.
- **Google Business Profile:** pon la web `https://deyscom.com`.
- **Apps Script:** no hace falta cambiar nada. Si aún no está, pega la URL `/exec` en el panel → Ajustes.
- **Prueba en el móvil** un formulario, el WhatsApp y el CRM (`deyscom.com/crm.html`).

### Login del panel de contenido en IONOS
IONOS no da el login con GitHub que da Netlify. Hay dos opciones:
1. **Token (inmediato):**
   - Entra en `deyscom.com/admin` → **Sign In Using Access Token**.
   - El token se crea en GitHub → Settings → Developer settings → **Fine-grained tokens**, solo para `genrural/rankly`, con permiso **Contents: Read and write**, y caducidad de 1 año.
   - Cada persona que edite usa su propio token.
2. **Botón «Sign In with GitHub»:**
   - Despliega gratis [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) en Cloudflare Workers.
   - Pon su URL en `base_url` del backend en `tools/admin_config.py`.

### Alternativa: Netlify o Cloudflare Pages
Si algún día se cambia de hosting, `netlify.toml` ya está listo:
1. Importa el repositorio en Netlify y apunta el DNS del dominio a Netlify.
2. Instala el proveedor OAuth de GitHub en Netlify (Callback `https://api.netlify.com/auth/done`).
3. Desactiva el workflow de IONOS.

En Cloudflare Pages:
- Comando de build: `pip install -r requirements.txt && python3 tools/build.py && python3 tools/dist.py`.
- Carpeta de salida: `dist`.

## 15. Experiencias con pago en Stripe y ventas en el CRM

**Cómo funciona**
1. En la web, cada turno tiene su botón **«Reservar y pagar»**.
2. El cliente deja nombre, teléfono y email: se crea el lead en el CRM, con su fecha y turno.
3. La web le lleva al **enlace de pago de Stripe** de ese turno, con su email ya rellenado y una referencia al lead (`client_reference_id`).
4. Al pagar, Stripe le devuelve a `deyscom.com/gracias.html`. Allí ve la confirmación y GA4 registra la compra (`purchase`).
5. Cada 15 minutos, el Apps Script lee los pagos de Stripe y:
   - pasa el lead a **Ganado** con el importe y las plazas;
   - apunta la venta en la pestaña **Ventas** y en la actividad del lead;
   - avisa por email;
   - descuenta las plazas, que la web muestra en directo («¡Últimas 3 plazas!» o «Completo»).
6. Si alguien deja sus datos pero no paga, aparece en el CRM → Ventas → **Reservas sin pagar**. Se le escribe con la plantilla de WhatsApp «Completar el pago», que incluye su enlace.

**Configurar Stripe (una vez)**
1. **Un enlace de pago por turno.** En Stripe → Enlaces de pago → **Crear**:
   - Producto: p. ej. «DS Pilot Course · 5 dic · Mañana», precio **299 €**.
   - Opciones:
     - «Recopilar el número de teléfono» activado.
     - «Limitar el número de pagos» = plazas del turno (20). Así nunca se vende de más.
   - Después del pago → «No mostrar la página de confirmación» → redirigir a:
     `https://deyscom.com/gracias.html?session_id={CHECKOUT_SESSION_ID}`
2. **Pegar cada enlace** en el panel → Experiencias → Fechas, plazas y pago → campo «Enlace de pago de Stripe» del turno.
   - Mientras un turno no tenga enlace, la web recoge la reserva y os avisa para cobrarla a mano.
3. **Clave para el CRM:**
   1. En Stripe → Desarrolladores → Claves de API → **Crear clave restringida**, con solo **Checkout Sessions: lectura** y **Payment Links: lectura**.
   2. En el Apps Script: ⚙️ Configuración del proyecto → **Propiedades del script** → añade `STRIPE_KEY` con esa clave. No la pegues en el código.
4. **En el Apps Script:**
   - Ejecuta `activarResumenes`: programa la sincronización cada 15 min, además del resumen diario y el informe mensual.
   - Ejecuta `sincronizarStripe` una vez para probarlo.
   - Desde el CRM → Ventas también hay un botón «Sincronizar con Stripe».

**Notas**
- Las devoluciones (reembolsos) no se descuentan solas: si devolvéis una plaza, pasad el lead a «Perdido» en el CRM y se libera la plaza.
- Si cambias el precio o las plazas de un turno, cámbialo también en su enlace de Stripe.
