/**
 * DEYSCOM MOTORSPORT — Puente web ⇄ Google Sheets ⇄ Wallapop
 *
 *  · POST  → guarda cada formulario de la web como una fila en la pestaña "Leads".
 *  · GET ?action=stock → devuelve en JSON los coches en venta:
 *        1) los lee de Wallapop (perfil configurado abajo), con caché de 30 min;
 *        2) si Wallapop falla o no devuelve nada, usa la pestaña "Stock" de la hoja
 *           (rellenable a mano) como respaldo.
 *
 * Instalación: ver README.md → "Conectar formularios a Google Sheets".
 */

// ---------------- CONFIGURACIÓN ----------------
var LEADS_SHEET = 'Leads';
var STOCK_SHEET = 'Stock';
var NOTIFY_EMAIL = 'info@deyscom.com';           // aviso por email en cada lead ('' para desactivar)
var WALLAPOP_PROFILE = 'https://es.wallapop.com/user/deyscomm-467502343';
var WALLAPOP_USER_ID = '';                        // opcional: ID interno de Wallapop si la detección automática falla
var CACHE_SECONDS = 1800;

var LEAD_COLUMNS = [
  'fecha', 'formulario', 'servicio', 'nombre', 'telefono', 'email', 'vehiculo', 'anio',
  'presupuesto', 'plazo', 'mensaje', 'pagina', 'landing', 'referrer',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'estado'
];

// ---------------- FORMULARIOS ----------------
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = (e && e.parameter) || {};
    var sheet = getSheet_(LEADS_SHEET, LEAD_COLUMNS);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Añade columnas nuevas si el formulario envía campos que aún no existen
    Object.keys(p).forEach(function (k) {
      if (headers.indexOf(k) === -1) {
        headers.push(k);
        sheet.getRange(1, headers.length).setValue(k).setFontWeight('bold');
      }
    });

    if (!p.estado) p.estado = 'Nuevo';
    var row = headers.map(function (h) { return p[h] !== undefined ? String(p[h]).slice(0, 5000) : ''; });
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      var body = headers.filter(function (h) { return p[h]; })
        .map(function (h) { return h.toUpperCase() + ': ' + p[h]; }).join('\n');
      MailApp.sendEmail(NOTIFY_EMAIL, '🏁 Nuevo lead web · ' + (p.servicio || p.formulario || 'Contacto') + ' · ' + (p.nombre || ''), body);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ---------------- STOCK / WALLAPOP ----------------
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'stock') {
    var refresh = e.parameter.refresh === '1';
    return json_(getStock_(refresh));
  }
  return json_({ ok: true, service: 'Deyscom Motorsport web bridge' });
}

function getStock_(refresh) {
  var cache = CacheService.getScriptCache();
  if (!refresh) {
    var cached = cache.get('stock');
    if (cached) return JSON.parse(cached);
  }
  var items = [];
  var source = 'wallapop';
  try { items = fetchWallapop_(); } catch (err) { console.warn('Wallapop: ' + err); }
  if (!items.length) { items = readStockSheet_(); source = 'sheet'; }

  var out = { ok: true, source: source, profile: WALLAPOP_PROFILE, updated: new Date().toISOString(), items: items };
  try { cache.put('stock', JSON.stringify(out), CACHE_SECONDS); } catch (e) { /* demasiado grande para caché */ }
  return out;
}

function fetchWallapop_() {
  var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'es-ES,es;q=0.9',
    'X-DeviceOS': '0'
  };
  var userId = WALLAPOP_USER_ID || detectWallapopUserId_(headers);
  if (!userId) throw new Error('No se pudo detectar el ID de usuario de Wallapop');

  var items = [];
  var next = '';
  for (var page = 0; page < 5; page++) {
    var url = 'https://api.wallapop.com/api/v3/users/' + userId + '/items' + (next ? '?since=' + encodeURIComponent(next) : '');
    var res = UrlFetchApp.fetch(url, { headers: headers, muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error('HTTP ' + res.getResponseCode());
    var data = JSON.parse(res.getContentText());
    var list = data.data || data.items || data.search_objects || [];
    list.forEach(function (it) { var m = mapWallapopItem_(it); if (m) items.push(m); });
    next = (data.meta && (data.meta.next || data.meta.since)) || '';
    if (!next || !list.length) break;
  }
  return items;
}

function detectWallapopUserId_(headers) {
  var cached = PropertiesService.getScriptProperties().getProperty('WALLAPOP_USER_ID');
  if (cached) return cached;
  var html = UrlFetchApp.fetch(WALLAPOP_PROFILE, { headers: headers, muteHttpExceptions: true }).getContentText();
  var m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  var id = '';
  if (m) {
    try {
      var nd = JSON.parse(m[1]);
      var pp = nd.props && nd.props.pageProps || {};
      id = (pp.user && pp.user.id) || (pp.userProfile && pp.userProfile.id) || (pp.profile && pp.profile.id) || '';
    } catch (e) { /* formato cambiado */ }
  }
  if (!id) { var m2 = html.match(/"userId"\s*:\s*"([a-z0-9]{8,})"/i) || html.match(/users\/([a-z0-9]{8,})\//i); if (m2) id = m2[1]; }
  if (id) PropertiesService.getScriptProperties().setProperty('WALLAPOP_USER_ID', id);
  return id;
}

function mapWallapopItem_(it) {
  if (!it) return null;
  var c = it.content || it;
  if (c.flags && c.flags.sold) return null;
  var price = c.price && typeof c.price === 'object' ? c.price.amount : c.price;
  var currency = c.price && c.price.currency || c.currency || 'EUR';
  var img = '';
  var imgs = c.images || [];
  if (imgs.length) { var u = imgs[0].urls || imgs[0]; img = u.medium || u.big || u.original || u.small || u.url || ''; }
  if (!img && c.image) img = c.image.medium || c.image.original || '';
  var slug = c.web_slug || c.slug || '';
  var attrs = c.type_attributes || c.attributes || {};
  var val = function (k) { var a = attrs[k]; return a && typeof a === 'object' ? (a.value !== undefined ? a.value : a.text) : a; };
  return {
    id: c.id || slug,
    title: c.title || '',
    description: (c.description || c.storytelling || '').slice(0, 280),
    price: price || null,
    currency: currency,
    image: img,
    url: slug ? 'https://es.wallapop.com/item/' + slug : WALLAPOP_PROFILE,
    year: val('year') || c.year || '',
    km: val('km') || c.km || '',
    fuel: val('engine') || val('fuel') || '',
    gearbox: val('gearbox') || '',
    reserved: !!(c.flags && c.flags.reserved)
  };
}

/** Pestaña "Stock": título | precio | imagen | url | año | km | combustible | descripcion | visible */
function readStockSheet_() {
  var sheet = getSheet_(STOCK_SHEET, ['title', 'price', 'image', 'url', 'year', 'km', 'fuel', 'description', 'visible']);
  var values = sheet.getDataRange().getValues();
  var head = values.shift();
  return values.filter(function (r) { return r[0] && String(r[head.indexOf('visible')]).toLowerCase() !== 'no'; })
    .map(function (r, i) {
      var o = {}; head.forEach(function (h, j) { o[h] = r[j]; });
      o.id = 'sheet-' + i; o.currency = 'EUR'; o.url = o.url || WALLAPOP_PROFILE;
      return o;
    });
}

// ---------------- UTILIDADES ----------------
function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#ff66c4');
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Ejecuta esta función una vez desde el editor para crear las pestañas y autorizar permisos. */
function setup() {
  getSheet_(LEADS_SHEET, LEAD_COLUMNS);
  getSheet_(STOCK_SHEET, ['title', 'price', 'image', 'url', 'year', 'km', 'fuel', 'description', 'visible']);
  Logger.log(JSON.stringify(getStock_(true)).slice(0, 1000));
}
