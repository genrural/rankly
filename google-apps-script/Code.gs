/**
 * DEYSCOM MOTORSPORT — Puente web ⇄ Google Sheets ⇄ Wallapop + CRM
 *
 *  · POST (formulario) → guarda cada formulario de la web como una fila en la pestaña "Leads".
 *  · POST (JSON con "api") → API privada del CRM (crm.html): login, leads, estados, notas, usuarios.
 *  · GET ?action=stock → devuelve en JSON los coches en venta:
 *        1) los lee de Wallapop (perfil configurado abajo), con caché de 30 min;
 *        2) si Wallapop falla o no devuelve nada, usa la pestaña "Stock" de la hoja
 *           (rellenable a mano) como respaldo.
 *
 * Instalación: ver README.md → "Conectar formularios a Google Sheets" y "CRM y área privada".
 */

// ---------------- CONFIGURACIÓN ----------------
var LEADS_SHEET = 'Leads';
var STOCK_SHEET = 'Stock';
var ACTIVITY_SHEET = 'Actividad';
var NOTIFY_EMAIL = 'info@deyscom.com';           // aviso por email en cada lead ('' para desactivar)
var WALLAPOP_PROFILE = 'https://es.wallapop.com/user/deyscomm-467502343';
var WALLAPOP_USER_ID = '';                        // opcional: ID interno de Wallapop si la detección automática falla
var CACHE_SECONDS = 1800;

var LEAD_COLUMNS = [
  'id', 'recibido', 'fecha', 'formulario', 'servicio', 'nombre', 'telefono', 'email', 'vehiculo', 'anio',
  'presupuesto', 'plazo', 'mensaje', 'pagina', 'landing', 'referrer',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid',
  'estado', 'valor', 'proxima_accion', 'asignado', 'actualizado'
];
var ACTIVITY_COLUMNS = ['lead_id', 'fecha', 'usuario', 'tipo', 'texto'];

// ---------------- CRM: usuarios y seguridad ----------------
var ESTADOS = ['Nuevo', 'Contactado', 'Presupuesto enviado', 'Negociación', 'Ganado', 'Perdido'];
var SESSION_SECONDS = 21600;       // la sesión caduca tras 6 h sin actividad
var MAX_LOGIN_FAILS = 5;           // intentos fallidos antes de bloquear 15 minutos
var HASH_ROUNDS = 400;
// Campos que se pueden editar desde el CRM
var EDITABLE = ['estado', 'valor', 'proxima_accion', 'asignado', 'nombre', 'telefono', 'email', 'servicio', 'vehiculo', 'anio', 'presupuesto', 'plazo', 'mensaje'];

/**
 * 1) Cambia los emails de abajo (el tuyo y el del cliente).
 * 2) Ejecuta esta función UNA vez desde el editor (desplegable de funciones → crearUsuarios → Ejecutar).
 * 3) Abre "Registro de ejecución": ahí aparecen las contraseñas generadas. Guárdalas: no se vuelven a mostrar.
 *    Si la vuelves a ejecutar, se generan contraseñas nuevas para esos usuarios.
 * Roles: 'admin' (todo, incluido borrar leads y gestionar usuarios) · 'cliente' (ver y gestionar leads).
 */
function crearUsuarios() {
  var usuarios = [
    { email: 'TU_EMAIL@ejemplo.com', nombre: 'Administrador', rol: 'admin' },
    { email: 'info@deyscom.com', nombre: 'Deyscom Motorsport', rol: 'cliente' }
  ];
  var users = loadUsers_();
  var out = [];
  usuarios.forEach(function (u) {
    var email = String(u.email).trim().toLowerCase();
    var pass = randomPassword_();
    users[email] = makeUser_(u.nombre, u.rol, pass);
    out.push(email + '   contraseña: ' + pass + '   (' + u.rol + ')');
  });
  saveUsers_(users);
  Logger.log('ACCESOS AL CRM · guárdalos, no se vuelven a mostrar:\n' + out.join('\n'));
}

function loadUsers_() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('CRM_USERS') || '{}'); } catch (e) { return {}; }
}
function saveUsers_(u) { PropertiesService.getScriptProperties().setProperty('CRM_USERS', JSON.stringify(u)); }
function makeUser_(nombre, rol, pass) {
  var salt = Utilities.getUuid();
  return { nombre: nombre, rol: rol === 'admin' ? 'admin' : 'cliente', salt: salt, hash: hash_(pass, salt), activo: true, creado: new Date().toISOString() };
}
function hash_(pass, salt) {
  var h = String(pass);
  for (var i = 0; i < HASH_ROUNDS; i++) {
    h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + '|' + salt, Utilities.Charset.UTF_8));
  }
  return h;
}
function randomPassword_() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + Date.now());
  var out = '';
  for (var i = 0; i < 14; i++) out += chars.charAt(((raw[i] % 256) + 256) % 256 % chars.length);
  return out.slice(0, 4) + '-' + out.slice(4, 9) + '-' + out.slice(9, 14);
}
function newToken_() {
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + Date.now())).replace(/=+$/, '');
}

function login_(req) {
  var email = String(req.email || '').trim().toLowerCase();
  var cache = CacheService.getScriptCache();
  var failKey = 'fail_' + email;
  var fails = Number(cache.get(failKey) || 0);
  if (fails >= MAX_LOGIN_FAILS) return { ok: false, error: 'Demasiados intentos. Espera 15 minutos y vuelve a probar.' };
  var u = loadUsers_()[email];
  if (!u || !u.activo || hash_(String(req.password || ''), u.salt) !== u.hash) {
    cache.put(failKey, String(fails + 1), 900);
    Utilities.sleep(600);
    return { ok: false, error: 'Email o contraseña incorrectos.' };
  }
  cache.remove(failKey);
  var token = newToken_();
  var session = { email: email, nombre: u.nombre, rol: u.rol };
  cache.put('tok_' + token, JSON.stringify(session), SESSION_SECONDS);
  return { ok: true, token: token, user: session };
}

function session_(token) {
  if (!token) return null;
  var cache = CacheService.getScriptCache();
  var raw = cache.get('tok_' + token);
  if (!raw) return null;
  var s = JSON.parse(raw);
  var u = loadUsers_()[s.email];
  if (!u || !u.activo) { cache.remove('tok_' + token); return null; }
  s.rol = u.rol; s.nombre = u.nombre;
  cache.put('tok_' + token, JSON.stringify(s), SESSION_SECONDS);   // renueva la sesión
  return s;
}

function handleApi_(req) {
  if (req.api === 'login') return login_(req);
  var s = session_(req.token);
  if (!s) return { ok: false, error: 'auth' };
  var admin = s.rol === 'admin';
  switch (req.api) {
    case 'me': return { ok: true, user: s };
    case 'logout': CacheService.getScriptCache().remove('tok_' + req.token); return { ok: true };
    case 'leads': return { ok: true, user: s, estados: ESTADOS, leads: readLeads_(), activity: readActivity_() };
    case 'update': return withLock_(function () { return updateLead_(req.id, req.fields || {}, s); });
    case 'note': return withLock_(function () { return addNote_(req.id, req.text, s); });
    case 'create': return withLock_(function () { return createLead_(req.fields || {}, s); });
    case 'delete':
      if (!admin) return { ok: false, error: 'Solo el administrador puede borrar leads.' };
      return withLock_(function () { return deleteLead_(req.id, s); });
    case 'password': return changePassword_(s, req.current, req.next);
    case 'users':
      if (!admin) return { ok: false, error: 'Solo para administradores.' };
      var all = loadUsers_();
      return { ok: true, users: Object.keys(all).map(function (k) { return { email: k, nombre: all[k].nombre, rol: all[k].rol, activo: all[k].activo }; }) };
    case 'resetUser':
      if (!admin) return { ok: false, error: 'Solo para administradores.' };
      return resetUser_(req.email, req.nombre, req.rol, req.activo);
  }
  return { ok: false, error: 'Acción no válida' };
}

function changePassword_(s, current, next) {
  var users = loadUsers_(); var u = users[s.email];
  if (!u || hash_(String(current || ''), u.salt) !== u.hash) return { ok: false, error: 'La contraseña actual no es correcta.' };
  if (!next || String(next).length < 10) return { ok: false, error: 'La nueva contraseña debe tener al menos 10 caracteres.' };
  u.salt = Utilities.getUuid(); u.hash = hash_(String(next), u.salt);
  saveUsers_(users);
  return { ok: true };
}

/** Admin: crea o modifica un usuario. Devuelve una contraseña nueva (solo se muestra una vez). */
function resetUser_(email, nombre, rol, activo) {
  email = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Email no válido.' };
  var users = loadUsers_();
  var pass = randomPassword_();
  var prev = users[email];
  users[email] = makeUser_(nombre || (prev && prev.nombre) || email, rol || (prev && prev.rol) || 'cliente', pass);
  if (activo === false) users[email].activo = false;
  saveUsers_(users);
  return { ok: true, email: email, password: pass };
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

// Evita que un texto enviado desde la web se interprete como fórmula en la hoja
function clean_(v) {
  var t = String(v === undefined || v === null ? '' : v).slice(0, 5000);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}
// Fuerza texto (evita que la hoja convierta fechas ISO a su propio formato)
function text_(v) { return v ? "'" + String(v) : ''; }
var TEXT_COLS = ['recibido', 'proxima_accion', 'actualizado', 'id'];

function leadsSheet_() {
  var sh = getSheet_(LEADS_SHEET, LEAD_COLUMNS);
  var headers = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0];
  LEAD_COLUMNS.forEach(function (c) {
    if (headers.indexOf(c) === -1) { headers.push(c); sh.getRange(1, headers.length).setValue(c).setFontWeight('bold'); }
  });
  return { sheet: sh, headers: headers };
}

function readLeads_() {
  var L = leadsSheet_();
  var last = L.sheet.getLastRow();
  if (last < 2) return [];
  var range = L.sheet.getRange(2, 1, last - 1, L.headers.length);
  var values = range.getDisplayValues();
  var idCol = L.headers.indexOf('id');
  var missing = false;
  values.forEach(function (r) { if (!r[idCol]) { r[idCol] = Utilities.getUuid().slice(0, 8); missing = true; } });
  if (missing) L.sheet.getRange(2, idCol + 1, values.length, 1).setValues(values.map(function (r) { return [text_(r[idCol])]; }));
  return values.map(function (r) { var o = {}; L.headers.forEach(function (h, j) { if (h) o[h] = r[j]; }); return o; });
}

function findRow_(L, id) {
  var idCol = L.headers.indexOf('id');
  var last = L.sheet.getLastRow();
  if (!id || last < 2) return -1;
  var ids = L.sheet.getRange(2, idCol + 1, last - 1, 1).getDisplayValues();
  for (var i = 0; i < ids.length; i++) if (ids[i][0] === String(id)) return i + 2;
  return -1;
}

function updateLead_(id, fields, s) {
  var L = leadsSheet_();
  var row = findRow_(L, id);
  if (row < 0) return { ok: false, error: 'Lead no encontrado.' };
  var current = L.sheet.getRange(row, 1, 1, L.headers.length).getDisplayValues()[0];
  var changes = [];
  EDITABLE.forEach(function (k) {
    if (fields[k] === undefined) return;
    var col = L.headers.indexOf(k);
    var val = String(fields[k]);
    if (k === 'estado' && ESTADOS.indexOf(val) === -1) return;
    if (current[col] === val) return;
    L.sheet.getRange(row, col + 1).setValue(TEXT_COLS.indexOf(k) > -1 ? text_(val) : clean_(val));
    changes.push(k === 'estado' ? 'Estado: ' + (current[col] || '—') + ' → ' + val : k + ': ' + (val || '—'));
  });
  if (changes.length) {
    L.sheet.getRange(row, L.headers.indexOf('actualizado') + 1).setValue(text_(new Date().toISOString()));
    logActivity_(id, s, fields.estado !== undefined && changes.length === 1 && changes[0].indexOf('Estado') === 0 ? 'estado' : 'edicion', changes.join(' · '));
  }
  return { ok: true, changes: changes.length };
}

function addNote_(id, text, s) {
  text = String(text || '').trim();
  if (!text) return { ok: false, error: 'La nota está vacía.' };
  var L = leadsSheet_();
  if (findRow_(L, id) < 0) return { ok: false, error: 'Lead no encontrado.' };
  return { ok: true, activity: logActivity_(id, s, 'nota', text) };
}

function createLead_(fields, s) {
  var L = leadsSheet_();
  var p = {};
  EDITABLE.forEach(function (k) { if (fields[k] !== undefined) p[k] = fields[k]; });
  if (!p.nombre) return { ok: false, error: 'El nombre es obligatorio.' };
  p.id = Utilities.getUuid().slice(0, 8);
  p.recibido = new Date().toISOString();
  p.fecha = Utilities.formatDate(new Date(), 'Europe/Madrid', 'dd/MM/yyyy, HH:mm:ss');
  p.formulario = 'crm-manual';
  p.estado = ESTADOS.indexOf(p.estado) > -1 ? p.estado : 'Nuevo';
  p.referrer = fields.origen ? 'manual:' + fields.origen : 'manual';
  L.sheet.appendRow(L.headers.map(function (h) { return p[h] === undefined ? '' : TEXT_COLS.indexOf(h) > -1 ? text_(p[h]) : clean_(p[h]); }));
  logActivity_(p.id, s, 'creado', 'Lead creado a mano' + (fields.origen ? ' · origen: ' + fields.origen : ''));
  return { ok: true, id: p.id };
}

function deleteLead_(id, s) {
  var L = leadsSheet_();
  var row = findRow_(L, id);
  if (row < 0) return { ok: false, error: 'Lead no encontrado.' };
  L.sheet.deleteRow(row);
  logActivity_(id, s, 'borrado', 'Lead borrado');
  return { ok: true };
}

function logActivity_(id, s, tipo, texto) {
  var sh = getSheet_(ACTIVITY_SHEET, ACTIVITY_COLUMNS);
  var a = { lead_id: String(id), fecha: new Date().toISOString(), usuario: s ? s.nombre : 'web', tipo: tipo, texto: String(texto).slice(0, 5000) };
  sh.appendRow([text_(a.lead_id), text_(a.fecha), clean_(a.usuario), a.tipo, clean_(a.texto)]);
  return a;
}

function readActivity_() {
  var sh = getSheet_(ACTIVITY_SHEET, ACTIVITY_COLUMNS);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var start = Math.max(2, last - 3000);
  return sh.getRange(start, 1, last - start + 1, 5).getDisplayValues().map(function (r) {
    return { lead_id: r[0], fecha: r[1], usuario: r[2], tipo: r[3], texto: r[4] };
  });
}

// ---------------- FORMULARIOS ----------------
function doPost(e) {
  // Peticiones del CRM: cuerpo JSON con "api"
  var raw = e && e.postData && e.postData.contents;
  if (raw && /^\s*\{/.test(raw)) {
    try {
      var req = JSON.parse(raw);
      if (req && req.api) return json_(handleApi_(req));
    } catch (err) {
      return json_({ ok: false, error: 'Petición no válida' });
    }
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = (e && e.parameter) || {};
    var L = leadsSheet_();
    var sheet = L.sheet, headers = L.headers;

    // Añade columnas nuevas si el formulario envía campos que aún no existen
    Object.keys(p).forEach(function (k) {
      if (!/^[a-z0-9_]{1,40}$/i.test(k)) return;
      if (headers.indexOf(k) === -1) {
        headers.push(k);
        sheet.getRange(1, headers.length).setValue(k).setFontWeight('bold');
      }
    });

    p.id = Utilities.getUuid().slice(0, 8);
    p.recibido = new Date().toISOString();
    p.estado = 'Nuevo';
    ['valor', 'proxima_accion', 'asignado', 'actualizado'].forEach(function (k) { delete p[k]; });
    var row = headers.map(function (h) { return p[h] === undefined ? '' : TEXT_COLS.indexOf(h) > -1 ? text_(p[h]) : clean_(p[h]); });
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
  leadsSheet_();
  getSheet_(ACTIVITY_SHEET, ACTIVITY_COLUMNS);
  getSheet_(STOCK_SHEET, ['title', 'price', 'image', 'url', 'year', 'km', 'fuel', 'description', 'visible']);
  Logger.log(JSON.stringify(getStock_(true)).slice(0, 1000));
}
