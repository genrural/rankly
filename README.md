# Deyscom Motorsport · Web

Web estática (HTML + CSS + JS, sin dependencias) para **Deyscom Motorsport**, Torrelaguna (Madrid).
Se puede alojar en cualquier hosting: Netlify, Vercel, GitHub Pages, Cloudflare Pages o el hosting actual de deyscom.com.

## Páginas

| Página | Archivo |
|---|---|
| Inicio (presupuesto por pasos) | `index.html` |
| Coches de competición | `competicion.html` |
| Restomod | `restomod.html` |
| Pintura (con comparador antes/después) | `pintura.html` |
| Modificaciones performance | `performance.html` |
| Tienda: coches en venta (Wallapop) + merchandising | `tienda.html` |
| Fichas de producto | `camiseta-deyscom.html`, `gorra-deyscom.html`, `pegatinas-deyscom.html` |
| Quiénes somos | `nosotros.html` |
| Contacto (formulario, mapa y horario) | `contacto.html` |
| Aviso legal, privacidad y cookies | `legal.html` |

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
- Si tenéis fotos reales del producto, guárdalas como `assets/img/camiseta-deyscom.jpg`, `gorra-deyscom.jpg` y `pegatinas-deyscom.jpg`. Sustituyen al mockup automáticamente.

## 4. Fotos

La web funciona sin fotos con un fondo gráfico de marca. Para ponerle **vuestras fotos de Instagram**, solo hay que guardar archivos con estos nombres en `assets/img/` (JPG horizontales de unos 1600 px y menos de 300 KB). Aparecen solas, sin tocar código:

| Dónde | Archivo |
|---|---|
| Hero de la home | `hero.jpg` |
| Tarjetas de la home | `home-competicion.jpg`, `home-restomod.jpg`, `home-pintura.jpg`, `home-performance.jpg`, `home-tienda.jpg`, `home-equipo.jpg` |
| Hero de cada servicio | `competicion-hero.jpg`, `restomod-hero.jpg`, `pintura-hero.jpg`, `performance-hero.jpg`, `nosotros-hero.jpg`, `tienda-hero.jpg` |
| Bloque de introducción | `competicion-intro.jpg`, `restomod-intro.jpg`, `pintura-intro.jpg`, `performance-intro.jpg`, `nosotros-historia.jpg` |
| Galerías (5 por página) | `competicion-1.jpg` … `competicion-5.jpg` (igual para `restomod-`, `pintura-`, `performance-` y `nosotros-`) |
| Antes / después | `pintura-antes.jpg`, `pintura-despues.jpg` |
| Imagen al compartir en redes | `og-deyscom.jpg` (1200×630) |

## 5. Editar contenidos

- **Teléfono, WhatsApp, email, horario, redes y pagos:** `assets/js/config.js`.
- **Textos, servicios, FAQs y productos:** `tools/build.py`. Después ejecuta:
  ```bash
  python3 tools/build.py
  ```
  Así se regeneran todos los `.html` con la cabecera y el pie comunes.
- **Estilos:** `assets/css/styles.css`. Los colores de marca son variables al principio del archivo: rosa `#FF66C4` y negro.

## 6. Analítica (opcional)

Pega el snippet de Google Tag Manager o GA4 en el `<head>` (función `head()` de `tools/build.py`). Los eventos de conversión ya se envían al `dataLayer`. Si añadís cookies de analítica o publicidad, recordad incluir un banner de consentimiento.
