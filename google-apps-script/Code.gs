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
  'estado', 'valor', 'proxima_accion', 'asignado', 'etiquetas', 'edicion', 'plazas', 'envio', 'actualizado'
];
var ACTIVITY_COLUMNS = ['lead_id', 'fecha', 'usuario', 'tipo', 'texto'];
// Las fechas (ediciones) de las experiencias se editan en el panel de la web (/admin) y se publican en este JSON:
var SITE_EDITIONS_URL = 'https://deyscom.com/ediciones.json';
var SALES_SHEET = 'Ventas';
var SALES_COLUMNS = ['session_id', 'fecha', 'cliente', 'email', 'telefono', 'importe', 'moneda', 'plazas', 'edicion', 'experiencia', 'fecha_edicion', 'lead_id', 'payment_link', 'estado'];
// Stripe: la clave restringida (solo lectura de Checkout Sessions y Payment Links) se guarda en
// Configuración del proyecto → Propiedades del script → STRIPE_KEY. Nunca la pegues en este archivo.
var STRIPE_SYNC_DAYS = 120;
var QUOTES_SHEET = 'Presupuestos';
var QUOTE_COLUMNS = ['numero', 'lead_id', 'fecha', 'cliente', 'email', 'lineas', 'base', 'iva', 'total', 'validez', 'notas', 'estado', 'pdf_id', 'usuario'];
var CRM_URL = 'https://deyscom.com/crm.html';
// Solo si la web está en Netlify: URL de su «Build hook». En IONOS no hace falta
// (el despliegue de GitHub Actions ya se ejecuta cada mañana).
var DEPLOY_HOOK_URL = '';
var EMPRESA = { nombre: 'DEYSCOM MOTORSPORT, S.L.', cif: 'B09939471', direccion: 'C/ Canal de Isabel II, 2, Nave 3 · 28180 Torrelaguna (Madrid)',
  telefono: '(+34) 615 97 22 33', email: 'info@deyscom.com', web: 'deyscom.com' };

// ---------------- JUEGO AX RALLY (home) ----------------
// Ranking general: pestaña "Ranking" (una fila por partida guardada). Gana el 1.º al cierre (fecha en el panel de la web).
var RANKING_SHEET = 'Ranking';
var RANKING_COLUMNS = ['fecha', 'alias', 'nombre', 'email', 'telefono', 'circuito', 'superficie', 'monedas', 'tiempo', 'golpes', 'puntos', 'lead_id', 'valida'];
// Reglas del juego (deben coincidir con assets/js/ax-rally.js): todos los circuitos miden lo mismo.
var GAME = { MAX_COINS: 60, PAR: 85, MIN_TIME: 55, MAX_TIME: 900, COIN_POINTS: 100, TIME_POINTS: 60, DIRT_BONUS: 1.1 };

// ---------------- CRM: usuarios y seguridad ----------------
var ESTADOS = ['Nuevo', 'Contactado', 'Presupuesto enviado', 'Negociación', 'Ganado', 'Perdido'];
var SESSION_SECONDS = 21600;       // la sesión caduca tras 6 h sin actividad
var MAX_LOGIN_FAILS = 5;           // intentos fallidos antes de bloquear 15 minutos
var HASH_ROUNDS = 400;
// Campos que se pueden editar desde el CRM
var EDITABLE = ['estado', 'valor', 'proxima_accion', 'asignado', 'etiquetas', 'edicion', 'envio', 'nombre', 'telefono', 'email', 'servicio', 'vehiculo', 'anio', 'presupuesto', 'plazo', 'mensaje', 'plazas'];

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
    case 'leads':
      var leads = readLeads_();
      return { ok: true, user: s, estados: ESTADOS, leads: leads, activity: readActivity_(), ediciones: readEditions_(leads), presupuestos: readQuotes_(),
        ventas: readSales_(), stripe: !!stripeKey_() };
    case 'syncStripe': return withLock_(function () { return syncStripe_(); });
    case 'quote': return withLock_(function () { return createQuote_(req, s); });
    case 'quotePdf': return quotePdf_(req.numero);
    case 'quoteStatus': return withLock_(function () { return quoteStatus_(req.numero, req.estado, s); });
    case 'digest': return { ok: true, sent: resumenDiario(true) };
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
    if (col === -1) { L.headers.push(k); col = L.headers.length - 1; L.sheet.getRange(1, col + 1).setValue(k).setFontWeight('bold'); current.push(''); }
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
    var req = null;
    try { req = JSON.parse(raw); } catch (err) { return json_({ ok: false, error: 'Petición no válida' }); }
    if (req && req.api) {
      try { return json_(handleApi_(req)); } catch (err) { return json_({ ok: false, error: String((err && err.message) || err) }); }
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

    if (p.formulario === 'juego-ax') return json_(gameScore_(p, L));
    var webId = String(p.id || '');
    p.id = /^w[a-z0-9]{11}$/.test(webId) && findRow_(L, webId) < 0 ? webId : Utilities.getUuid().slice(0, 8);
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
  if (action === 'plazas' || action === 'ediciones') return json_({ ok: true, ediciones: publicEditions_(e.parameter.producto) });
  if (action === 'juego_inicio') return json_(gameStart_());
  if (action === 'ranking') return json_(gameRanking_());
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
  getSheet_(QUOTES_SHEET, QUOTE_COLUMNS);
  getSheet_(SALES_SHEET, SALES_COLUMNS);
  getSheet_(STOCK_SHEET, ['title', 'price', 'image', 'url', 'year', 'km', 'fuel', 'description', 'visible']);
  Logger.log(JSON.stringify(getStock_(true)).slice(0, 1000));
}


// ---------------- EDICIONES (fechas y plazas de experiencias y cursos) ----------------
function sheetObjects_(name, cols) {
  var sh = getSheet_(name, cols);
  var last = sh.getLastRow();
  if (last < 2) return { sheet: sh, rows: [] };
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var rows = sh.getRange(2, 1, last - 1, head.length).getDisplayValues().map(function (r, i) {
    var o = { _row: i + 2 }; head.forEach(function (h, j) { if (h) o[h] = r[j]; }); return o;
  });
  return { sheet: sh, head: head, rows: rows };
}

/** Fechas publicadas en la web (content/ediciones.json → /ediciones.json). Caché de 10 minutos. */
function siteEditions_() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('site_editions');
  if (hit) return JSON.parse(hit);
  var list = [];
  try {
    var res = UrlFetchApp.fetch(SITE_EDITIONS_URL + '?t=' + Date.now(), { muteHttpExceptions: true });
    if (res.getResponseCode() === 200) list = JSON.parse(res.getContentText()).ediciones || [];
  } catch (e) { console.warn('ediciones.json: ' + e); }
  var props = PropertiesService.getScriptProperties();
  if (list.length) props.setProperty('SITE_EDITIONS', JSON.stringify(list));
  else list = JSON.parse(props.getProperty('SITE_EDITIONS') || '[]');   // última copia buena
  try { cache.put('site_editions', JSON.stringify(list), 600); } catch (e) { /* grande */ }
  return list;
}

/** Plazas ocupadas = leads con esa edición en estado «Ganado» (pagados o confirmados a mano). */
function seatsTaken_(leads) {
  var taken = {};
  (leads || readLeads_()).forEach(function (l) {
    if (!l.edicion || l.estado !== 'Ganado') return;
    var n = parseInt(l.plazas, 10); if (!(n > 0)) n = 1;
    taken[l.edicion] = (taken[l.edicion] || 0) + n;
  });
  return taken;
}

function readEditions_(leads) {
  var taken = seatsTaken_(leads);
  return siteEditions_().map(function (r) { var o = JSON.parse(JSON.stringify(r)); o.ocupadas = taken[r.id] || 0; return o; });
}

function publicEditions_(experiencia) {
  var today = Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyy-MM-dd');
  return readEditions_().filter(function (r) {
    return (!experiencia || r.experiencia === experiencia) && r.estado !== 'Cancelada' && r.fecha >= today;
  }).map(function (r) {
    var plazas = parseInt(r.plazas, 10) || 0;
    var libres = plazas ? Math.max(0, plazas - r.ocupadas) : null;
    return { id: r.id, experiencia: r.experiencia, fecha: r.fecha, turno: r.turno, plazas: plazas, libres: libres, completa: r.estado === 'Completa' || libres === 0 };
  });
}

// ---------------- VENTAS (Stripe Payment Links) ----------------
function stripeKey_() { return PropertiesService.getScriptProperties().getProperty('STRIPE_KEY') || ''; }

function stripeGet_(path, params) {
  var qs = Object.keys(params || {}).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
  var res = UrlFetchApp.fetch('https://api.stripe.com/v1/' + path + (qs ? '?' + qs : ''),
    { headers: { Authorization: 'Bearer ' + stripeKey_() }, muteHttpExceptions: true });
  var data = JSON.parse(res.getContentText() || '{}');
  if (res.getResponseCode() !== 200) throw new Error('Stripe ' + res.getResponseCode() + ': ' + ((data.error && data.error.message) || ''));
  return data;
}

function stripeList_(path, params) {
  var out = [], after = '';
  for (var page = 0; page < 20; page++) {
    var p = JSON.parse(JSON.stringify(params || {})); p.limit = 100; if (after) p.starting_after = after;
    var data = stripeGet_(path, p);
    out = out.concat(data.data || []);
    if (!data.has_more || !data.data.length) break;
    after = data.data[data.data.length - 1].id;
  }
  return out;
}

function readSales_() {
  return sheetObjects_(SALES_SHEET, SALES_COLUMNS).rows.map(function (r) { delete r._row; return r; });
}

/** Ejecútala a mano para probar: trae los pagos de Stripe y los vuelca en «Ventas» y en los leads. */
function sincronizarStripe() { Logger.log(JSON.stringify(withLock_(syncStripe_))); }

function syncStripe_() {
  if (!stripeKey_()) return { ok: false, error: 'Falta la clave de Stripe (propiedad del script STRIPE_KEY). Ver README.' };
  var eds = siteEditions_();
  // Si un enlace de pago es de una sola fecha, la venta se asigna a esa fecha. Si es un enlace general (varias fechas),
  // la fecha sale de la reserva hecha en la web (client_reference_id → lead → edición elegida).
  var byUrl = {}, urlCount = {};
  eds.forEach(function (e) { if (!e.stripe) return; var u = String(e.stripe).split('?')[0].replace(/\/$/, ''); urlCount[u] = (urlCount[u] || 0) + 1; byUrl[u] = e; });
  Object.keys(urlCount).forEach(function (u) { if (urlCount[u] > 1) delete byUrl[u]; });
  var byId = {}; eds.forEach(function (e) { byId[e.id] = e; });
  var linkEd = {};
  stripeList_('payment_links', {}).forEach(function (pl) { var e = byUrl[String(pl.url).replace(/\/$/, '')]; if (e) linkEd[pl.id] = e; });
  var since = Math.floor(Date.now() / 1000) - STRIPE_SYNC_DAYS * 86400;
  var sessions = stripeList_('checkout/sessions', { status: 'complete', 'created[gte]': since });
  var sheet = getSheet_(SALES_SHEET, SALES_COLUMNS);
  var known = {}; readSales_().forEach(function (r) { known[r.session_id] = 1; });
  var L = leadsSheet_(), sys = { nombre: 'Stripe' }, nuevas = [];
  sessions.forEach(function (cs) {
    if (known[cs.id] || ['paid', 'no_payment_required'].indexOf(cs.payment_status) === -1) return;
    var importe = (cs.amount_total || 0) / 100, cd = cs.customer_details || {};
    var leadId = cs.client_reference_id && findRow_(L, cs.client_reference_id) > 0 ? cs.client_reference_id : '';
    var lead = null;
    if (leadId) { var row = L.sheet.getRange(findRow_(L, leadId), 1, 1, L.headers.length).getDisplayValues()[0]; lead = {}; L.headers.forEach(function (h, j) { lead[h] = row[j]; }); }
    var ed = (lead && byId[lead.edicion]) || (cs.payment_link && linkEd[cs.payment_link]) || null;
    var plazas = ed && Number(ed.precio) ? Math.max(1, Math.round(importe / Number(ed.precio))) : 1;
    var fields = { estado: 'Ganado', valor: String(importe), plazas: String(plazas) };
    if (ed) fields.edicion = ed.id;
    if (lead) {
      updateLead_(leadId, fields, sys);
    } else {
      var created = createLead_({ nombre: cd.name || cd.email || 'Cliente Stripe', email: cd.email || '', telefono: cd.phone || '',
        servicio: ed ? ed.nombre : 'Pago Stripe', origen: 'Stripe' }, sys);
      leadId = created.id;
      updateLead_(leadId, fields, sys);
    }
    sheet.appendRow([text_(cs.id), text_(new Date(cs.created * 1000).toISOString()), clean_(cd.name || (lead && lead.nombre) || ''), clean_(cd.email || ''),
      clean_(cd.phone || (lead && lead.telefono) || ''), importe, String(cs.currency || 'eur').toUpperCase(), plazas, text_(ed ? ed.id : ''),
      clean_(ed ? ed.nombre : ''), clean_(ed ? ed.etiqueta : ''), text_(leadId), text_(cs.payment_link || ''), 'Pagado']);
    logActivity_(leadId, sys, 'pago', 'Pago recibido en Stripe: ' + money_(importe) + (ed ? ' · ' + ed.nombre + ' · ' + ed.etiqueta : '') + ' · ' + plazas + (plazas === 1 ? ' plaza' : ' plazas'));
    nuevas.push({ cliente: cd.name || cd.email, importe: importe, ed: ed });
    known[cs.id] = 1;
  });
  if (nuevas.length && NOTIFY_EMAIL) {
    MailApp.sendEmail({ to: NOTIFY_EMAIL, name: 'CRM Deyscom', subject: '💳 ' + nuevas.length + (nuevas.length === 1 ? ' venta nueva' : ' ventas nuevas') + ' en Stripe',
      htmlBody: '<ul>' + nuevas.map(function (v) { return '<li><b>' + escHtml_(v.cliente) + '</b> · ' + money_(v.importe) + (v.ed ? ' · ' + escHtml_(v.ed.nombre + ' · ' + v.ed.etiqueta) : '') + '</li>'; }).join('') +
        '</ul><p><a href="' + CRM_URL + '">Ver en el CRM</a></p>' });
  }
  CacheService.getScriptCache().remove('site_editions');
  return { ok: true, nuevas: nuevas.length, revisadas: sessions.length };
}

// ---------------- PRESUPUESTOS EN PDF ----------------
function readQuotes_() {
  return sheetObjects_(QUOTES_SHEET, QUOTE_COLUMNS).rows.map(function (r) { delete r._row; return r; });
}

function quotesFolder_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('QUOTES_FOLDER');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { /* borrada: se crea otra */ } }
  var f = DriveApp.createFolder('Presupuestos Deyscom Motorsport');
  props.setProperty('QUOTES_FOLDER', f.getId());
  return f;
}

function nextQuoteNumber_() {
  var year = Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyy');
  var max = 0;
  readQuotes_().forEach(function (q) { var m = String(q.numero).match(/^P-(\d{4})-(\d+)$/); if (m && m[1] === year) max = Math.max(max, +m[2]); });
  return 'P-' + year + '-' + ('00' + (max + 1)).slice(-3);
}

function money_(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
function escHtml_(t) { return String(t === undefined || t === null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

function quoteHtml_(q) {
  var rows = q.lineas.map(function (l) {
    return '<tr><td>' + escHtml_(l.concepto) + '</td><td class="n">' + escHtml_(l.cantidad) + '</td><td class="n">' + money_(l.precio) + '</td><td class="n">' + money_(l.cantidad * l.precio) + '</td></tr>';
  }).join('');
  return '<html><head><meta charset="utf-8"><style>' +
    'body{font-family:Arial,Helvetica,sans-serif;color:#111;font-size:11pt;margin:0}' +
    '.top{border-bottom:4px solid #ff66c4;padding-bottom:12px;margin-bottom:18px}' +
    '.brand{font-size:24pt;font-weight:bold;font-style:italic;letter-spacing:1px}.brand span{color:#ff66c4}' +
    '.small{font-size:9pt;color:#555}h1{font-size:16pt;margin:0 0 4px}' +
    'table{width:100%;border-collapse:collapse}th{background:#111;color:#fff;text-align:left;padding:7px;font-size:9pt}td{padding:7px;border-bottom:1px solid #ddd;vertical-align:top}' +
    '.n{text-align:right;white-space:nowrap}.tot td{border:0;padding:4px 7px}.tot .big td{font-size:14pt;font-weight:bold;border-top:2px solid #111}' +
    '.box{background:#f6f6f6;padding:10px;margin-top:16px;font-size:9.5pt}' +
    '</style></head><body>' +
    '<table class="top"><tr><td><div class="brand">DEYS<span>COM</span> MOTORSPORT</div><div class="small">' + escHtml_(EMPRESA.nombre) + ' · CIF ' + EMPRESA.cif + '<br>' +
    escHtml_(EMPRESA.direccion) + '<br>' + EMPRESA.telefono + ' · ' + EMPRESA.email + ' · ' + EMPRESA.web + '</div></td>' +
    '<td class="n"><h1>PRESUPUESTO</h1><b>' + escHtml_(q.numero) + '</b><br><span class="small">Fecha: ' + escHtml_(q.fechaTxt) + '<br>Válido hasta: ' + escHtml_(q.validezTxt) + '</span></td></tr></table>' +
    '<p><b>Cliente:</b> ' + escHtml_(q.cliente) + (q.email ? ' · ' + escHtml_(q.email) : '') + (q.telefono ? ' · ' + escHtml_(q.telefono) : '') +
    (q.vehiculo ? '<br><b>Vehículo:</b> ' + escHtml_(q.vehiculo) : '') + (q.servicio ? '<br><b>Servicio:</b> ' + escHtml_(q.servicio) : '') + '</p>' +
    '<table><tr><th>Concepto</th><th class="n">Cant.</th><th class="n">Precio</th><th class="n">Importe</th></tr>' + rows + '</table>' +
    '<table class="tot" style="width:45%;margin-left:55%;margin-top:10px"><tr><td>Base imponible</td><td class="n">' + money_(q.base) + '</td></tr>' +
    '<tr><td>IVA (' + q.ivaPct + '%)</td><td class="n">' + money_(q.iva) + '</td></tr><tr class="big"><td>Total</td><td class="n">' + money_(q.total) + '</td></tr></table>' +
    (q.notas ? '<div class="box"><b>Observaciones</b><br>' + escHtml_(q.notas).replace(/\n/g, '<br>') + '</div>' : '') +
    '<p class="small" style="margin-top:22px">Presupuesto sin compromiso. Los trabajos no previstos que aparezcan durante la reparación se comunicarán y presupuestarán antes de realizarse. ' +
    'Para aceptarlo, responde a este email o escríbenos al ' + EMPRESA.telefono + '.</p></body></html>';
}

function createQuote_(req, s) {
  var L = leadsSheet_();
  var row = findRow_(L, req.lead_id);
  if (row < 0) return { ok: false, error: 'Lead no encontrado.' };
  var cur = L.sheet.getRange(row, 1, 1, L.headers.length).getDisplayValues()[0];
  var lead = {}; L.headers.forEach(function (h, j) { lead[h] = cur[j]; });
  var lineas = (req.lineas || []).map(function (l) {
    return { concepto: String(l.concepto || '').slice(0, 300), cantidad: Number(l.cantidad) || 0, precio: Number(l.precio) || 0 };
  }).filter(function (l) { return l.concepto && l.cantidad; });
  if (!lineas.length) return { ok: false, error: 'Añade al menos una línea.' };
  var ivaPct = req.iva === undefined ? 21 : Number(req.iva) || 0;
  var base = lineas.reduce(function (t, l) { return t + l.cantidad * l.precio; }, 0);
  var iva = Math.round(base * ivaPct) / 100, total = Math.round((base + iva) * 100) / 100;
  var now = new Date(), dias = Number(req.validez) || 30;
  var q = { numero: nextQuoteNumber_(), cliente: lead.nombre, email: req.email || lead.email, telefono: lead.telefono, vehiculo: lead.vehiculo, servicio: lead.servicio,
    lineas: lineas, base: base, iva: iva, total: total, ivaPct: ivaPct, notas: req.notas || '',
    fechaTxt: Utilities.formatDate(now, 'Europe/Madrid', 'dd/MM/yyyy'),
    validezTxt: Utilities.formatDate(new Date(now.getTime() + dias * 86400000), 'Europe/Madrid', 'dd/MM/yyyy') };
  var pdf = Utilities.newBlob(quoteHtml_(q), 'text/html', q.numero + '.html').getAs('application/pdf').setName('Presupuesto ' + q.numero + ' - ' + (lead.nombre || '') + '.pdf');
  var file = quotesFolder_().createFile(pdf);
  getSheet_(QUOTES_SHEET, QUOTE_COLUMNS).appendRow([q.numero, text_(req.lead_id), text_(Utilities.formatDate(now, 'Europe/Madrid', 'yyyy-MM-dd')), clean_(q.cliente), clean_(q.email),
    JSON.stringify(lineas), base, iva, total, text_(Utilities.formatDate(new Date(now.getTime() + dias * 86400000), 'Europe/Madrid', 'yyyy-MM-dd')), clean_(q.notas),
    req.enviar ? 'Enviado' : 'Creado', file.getId(), clean_(s.nombre)]);
  var sent = false;
  if (req.enviar && q.email) {
    MailApp.sendEmail({ to: q.email, replyTo: EMPRESA.email, name: 'Deyscom Motorsport',
      subject: 'Presupuesto ' + q.numero + ' · Deyscom Motorsport',
      htmlBody: '<p>Hola ' + escHtml_(String(lead.nombre || '').split(' ')[0]) + ',</p><p>Te enviamos el presupuesto que nos pediste' + (lead.servicio ? ' para <b>' + escHtml_(lead.servicio) + '</b>' : '') +
        '. Lo tienes adjunto en PDF.</p><p>Total: <b>' + money_(total) + '</b> (IVA incluido). Válido hasta el ' + q.validezTxt + '.</p>' +
        '<p>Cualquier duda, responde a este email o escríbenos por WhatsApp al ' + EMPRESA.telefono + '.</p><p>¡Un saludo!<br><b>Deyscom Motorsport</b></p>',
      attachments: [pdf] });
    sent = true;
  }
  var upd = { valor: String(total) };
  if (['Nuevo', 'Contactado'].indexOf(lead.estado) > -1) upd.estado = 'Presupuesto enviado';
  updateLead_(req.lead_id, upd, s);
  logActivity_(req.lead_id, s, 'presupuesto', 'Presupuesto ' + q.numero + ' · ' + money_(total) + (sent ? ' · enviado a ' + q.email : ''));
  return { ok: true, numero: q.numero, total: total, sent: sent, pdf: Utilities.base64Encode(pdf.getBytes()) };
}

function quotePdf_(numero) {
  var q = readQuotes_().filter(function (x) { return x.numero === numero; })[0];
  if (!q || !q.pdf_id) return { ok: false, error: 'Presupuesto no encontrado.' };
  return { ok: true, numero: numero, pdf: Utilities.base64Encode(DriveApp.getFileById(q.pdf_id).getBlob().getBytes()) };
}

function quoteStatus_(numero, estado, s) {
  if (['Creado', 'Enviado', 'Aceptado', 'Rechazado'].indexOf(estado) === -1) return { ok: false, error: 'Estado no válido.' };
  var T = sheetObjects_(QUOTES_SHEET, QUOTE_COLUMNS);
  var row = T.rows.filter(function (r) { return r.numero === numero; })[0];
  if (!row) return { ok: false, error: 'Presupuesto no encontrado.' };
  T.sheet.getRange(row._row, T.head.indexOf('estado') + 1).setValue(estado);
  logActivity_(row.lead_id, s, 'presupuesto', 'Presupuesto ' + numero + ' → ' + estado);
  if (estado === 'Aceptado') updateLead_(row.lead_id, { estado: 'Ganado', valor: String(row.total).replace(',', '.') }, s);
  return { ok: true };
}

// ---------------- RESUMEN DIARIO E INFORME MENSUAL ----------------
/** Ejecuta UNA vez: programa el resumen diario (08:00) y el informe mensual (día 1). */
function activarResumenes() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (['resumenDiario', 'informeMensual', 'sincronizarStripeAuto'].indexOf(t.getHandlerFunction()) > -1) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sincronizarStripeAuto').timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger('resumenDiario').timeBased().everyDays(1).atHour(8).inTimezone('Europe/Madrid').create();
  ScriptApp.newTrigger('informeMensual').timeBased().onMonthDay(1).atHour(9).inTimezone('Europe/Madrid').create();
  Logger.log('Resumen diario (08:00), informe mensual (día 1, 09:00) y sincronización con Stripe (cada 15 min) activados.');
}

function sincronizarStripeAuto() { if (stripeKey_()) withLock_(syncStripe_); }

function digestRecipients_() {
  var users = loadUsers_();
  var list = Object.keys(users).filter(function (k) { return users[k].activo && k.indexOf('@ejemplo.com') === -1; });
  if (NOTIFY_EMAIL && list.indexOf(NOTIFY_EMAIL) === -1) list.push(NOTIFY_EMAIL);
  return list;
}

function leadTime_(l) {
  var d = l.recibido ? new Date(l.recibido) : null;
  if (d && !isNaN(d)) return d.getTime();
  var m = String(l.fecha || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return m ? new Date(+m[3], +m[2] - 1, +m[1]).getTime() : 0;
}

function leadLine_(l, extra) {
  return '<li><b>' + escHtml_(l.nombre || 'Sin nombre') + '</b> · ' + escHtml_(l.servicio || l.formulario || '') + (l.telefono ? ' · ' + escHtml_(l.telefono) : '') + (extra ? ' · ' + extra : '') + '</li>';
}

/** Email de las 08:00: leads nuevos de las últimas 24 h, llamadas de hoy y atrasadas. */
function resumenDiario(force) {
  if (!force && DEPLOY_HOOK_URL) {
    try { UrlFetchApp.fetch(DEPLOY_HOOK_URL, { method: 'post', muteHttpExceptions: true }); } catch (e) { console.warn('Build hook: ' + e); }
  }
  var leads = readLeads_();
  var today = Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyy-MM-dd');
  var since = Date.now() - 86400000;
  var nuevos = leads.filter(function (l) { return leadTime_(l) >= since; });
  var sinContactar = leads.filter(function (l) { return l.estado === 'Nuevo' && leadTime_(l) < since; });
  var abiertos = leads.filter(function (l) { return ['Ganado', 'Perdido'].indexOf(l.estado) === -1 && /^\d{4}-\d{2}-\d{2}$/.test(l.proxima_accion); });
  var hoy = abiertos.filter(function (l) { return l.proxima_accion === today; });
  var tarde = abiertos.filter(function (l) { return l.proxima_accion < today; });
  var ventas = readSales_().filter(function (v) { return new Date(v.fecha).getTime() >= since; });
  if (!force && !nuevos.length && !hoy.length && !tarde.length && !sinContactar.length && !ventas.length) return false;
  var sec = function (t, arr, fn) { return arr.length ? '<h3 style="margin:18px 0 6px">' + t + ' (' + arr.length + ')</h3><ul>' + arr.slice(0, 25).map(fn).join('') + '</ul>' : ''; };
  var html = '<div style="font-family:Arial,sans-serif;max-width:620px"><h2 style="border-bottom:3px solid #ff66c4;padding-bottom:6px">Resumen del día · Deyscom Motorsport</h2>' +
    sec('💳 Ventas (24 h)', ventas, function (v) { return '<li><b>' + escHtml_(v.cliente) + '</b> · ' + escHtml_(v.importe) + ' € · ' + escHtml_(v.experiencia + ' ' + v.fecha_edicion) + '</li>'; }) +
    sec('🆕 Leads nuevos (24 h)', nuevos, function (l) { return leadLine_(l); }) +
    sec('📅 Llamadas para hoy', hoy, function (l) { return leadLine_(l, escHtml_(l.estado)); }) +
    sec('⚠️ Atrasadas', tarde, function (l) { return leadLine_(l, 'desde ' + l.proxima_accion); }) +
    sec('⏳ Siguen sin contactar', sinContactar, function (l) { return leadLine_(l); }) +
    ((nuevos.length + hoy.length + tarde.length + sinContactar.length) ? '' : '<p>Todo al día. 🏁</p>') +
    '<p style="margin-top:22px"><a href="' + CRM_URL + '" style="background:#ff66c4;color:#000;padding:10px 16px;text-decoration:none;font-weight:bold">Abrir el CRM</a></p></div>';
  var to = digestRecipients_();
  if (!to.length) return false;
  MailApp.sendEmail({ to: to.join(','), name: 'CRM Deyscom', subject: '🏁 Resumen del día: ' + nuevos.length + ' nuevos · ' + (hoy.length + tarde.length) + ' llamadas pendientes', htmlBody: html });
  return true;
}

function originName_(l) {
  var ref = String(l.referrer || '').toLowerCase();
  if (l.formulario === 'crm-manual' || ref.indexOf('manual') === 0) return 'Manual';
  if (l.gclid) return 'Google Ads';
  if (l.fbclid) return 'Meta Ads';
  if (l.utm_source) return l.utm_source;
  var map = [['google', 'Google orgánico'], ['bing', 'Bing'], ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'],
    ['chatgpt', 'ChatGPT'], ['openai', 'ChatGPT'], ['perplexity', 'Perplexity'], ['wallapop', 'Wallapop']];
  for (var i = 0; i < map.length; i++) if (ref.indexOf(map[i][0]) > -1) return map[i][1];
  return ref ? 'Otras webs' : 'Directo';
}

/** Email del día 1: resumen del mes anterior por canal y servicio. */
function informeMensual() {
  var now = new Date();
  var start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(), end = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  var mes = Utilities.formatDate(new Date(start), 'Europe/Madrid', 'MMMM yyyy');
  var leads = readLeads_().filter(function (l) { var t = leadTime_(l); return t >= start && t < end; });
  var table = function (fn) {
    var o = {};
    leads.forEach(function (l) { var k = fn(l); o[k] = o[k] || { n: 0, g: 0, v: 0 }; o[k].n++; if (l.estado === 'Ganado') { o[k].g++; o[k].v += parseFloat(String(l.valor).replace(',', '.')) || 0; } });
    return '<table style="border-collapse:collapse;width:100%"><tr style="background:#111;color:#fff"><th align="left" style="padding:6px">Canal</th><th>Leads</th><th>Ganados</th><th>Conversión</th><th align="right" style="padding:6px">Valor ganado</th></tr>' +
      Object.keys(o).sort(function (a, b) { return o[b].n - o[a].n; }).map(function (k) {
        return '<tr><td style="padding:6px;border-bottom:1px solid #ddd">' + escHtml_(k) + '</td><td align="center">' + o[k].n + '</td><td align="center">' + o[k].g + '</td><td align="center">' +
          Math.round(o[k].g / o[k].n * 100) + '%</td><td align="right" style="padding:6px">' + money_(o[k].v) + '</td></tr>';
      }).join('') + '</table>';
  };
  var won = leads.filter(function (l) { return l.estado === 'Ganado'; });
  var html = '<div style="font-family:Arial,sans-serif;max-width:680px"><h2 style="border-bottom:3px solid #ff66c4;padding-bottom:6px">Informe de ' + mes + ' · Deyscom Motorsport</h2>' +
    '<p><b>' + leads.length + '</b> leads · <b>' + won.length + '</b> ganados · <b>' + money_(won.reduce(function (t, l) { return t + (parseFloat(String(l.valor).replace(',', '.')) || 0); }, 0)) + '</b> de valor ganado.</p>' +
    '<h3>Por canal</h3>' + table(originName_) + '<h3>Por servicio</h3>' + table(function (l) { return l.servicio || l.formulario || 'Sin servicio'; }) +
    '<p style="margin-top:22px"><a href="' + CRM_URL + '">Abrir el CRM</a></p></div>';
  var to = digestRecipients_();
  if (to.length) MailApp.sendEmail({ to: to.join(','), name: 'CRM Deyscom', subject: '📊 Informe de ' + mes + ': ' + leads.length + ' leads, ' + won.length + ' ganados', htmlBody: html });
}


// ---------------- JUEGO AX RALLY ----------------
function gamePoints_(monedas, tiempo, superficie) {
  var base = monedas * GAME.COIN_POINTS + Math.max(0, Math.round((GAME.PAR - tiempo) * GAME.TIME_POINTS));
  return Math.round(base * (superficie === 'tierra' ? GAME.DIRT_BONUS : 1));
}

// Al empezar cada partida la web pide un token: sirve para comprobar que la partida ha durado lo que dice.
function gameStart_() {
  var token = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
  CacheService.getScriptCache().put('jg_' + token, String(Date.now()), 7200);
  return { ok: true, token: token };
}

function gameRanking_() {
  var cache = CacheService.getScriptCache();
  var c = cache.get('ranking');
  if (c) return JSON.parse(c);
  var sh = getSheet_(RANKING_SHEET, RANKING_COLUMNS);
  var last = sh.getLastRow(), best = {}, total = 0;
  if (last >= 2) {
    sh.getRange(2, 1, last - 1, RANKING_COLUMNS.length).getValues().forEach(function (r) {
      if (String(r[12]) !== 'sí') return;
      total++;
      var key = String(r[3] || r[1]).toLowerCase(), pts = Number(r[10]) || 0;
      if (!best[key] || pts > best[key].puntos) best[key] = { alias: String(r[1]).slice(0, 18), puntos: pts, circuito: String(r[5]), superficie: String(r[6]), tiempo: Number(r[8]) || 0 };
    });
  }
  var list = Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return b.puntos - a.puntos || a.tiempo - b.tiempo; });
  var res = { ok: true, jugadores: list.length, partidas: total, top: list.slice(0, 20) };
  cache.put('ranking', JSON.stringify(res), 30);
  return res;
}

function gameScore_(p, L) {
  var cache = CacheService.getScriptCache();
  var token = String(p.token || ''), started = Number(cache.get('jg_' + token) || 0);
  var monedas = Math.floor(Number(p.monedas)), tiempo = Number(p.tiempo), superficie = p.superficie === 'tierra' ? 'tierra' : 'asfalto';
  var alias = String(p.alias || p.nombre || 'Piloto').replace(/[<>"']/g, '').trim().slice(0, 18) || 'Piloto';
  var email = String(p.email || '').trim().toLowerCase().slice(0, 120);
  var valid = !!started && monedas >= 0 && monedas <= GAME.MAX_COINS && tiempo >= GAME.MIN_TIME && tiempo <= GAME.MAX_TIME
    && (Date.now() - started) / 1000 >= tiempo - 3 && /^[a-z0-9-]{2,40}$/.test(String(p.circuito || ''));
  if (started) cache.remove('jg_' + token); // cada token sirve para una sola partida
  var puntos = valid ? gamePoints_(monedas, tiempo, superficie) : 0;

  // 1) Lead en el CRM: uno por jugador (por email); las partidas siguientes actualizan su ficha
  var headers = L.headers, sheet = L.sheet, col = function (n) { return headers.indexOf(n); };
  var row = -1, emailCol = col('email'), formCol = col('formulario');
  if (email && emailCol > -1 && sheet.getLastRow() >= 2) {
    var vals = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
    for (var i = vals.length - 1; i >= 0; i--) {
      if (String(vals[i][emailCol]).toLowerCase() === email && String(vals[i][formCol]) === 'juego-ax') { row = i + 2; break; }
    }
  }
  var resumen = 'Juego AX Rally · ' + (valid ? puntos + ' puntos' : 'partida no válida') + ' · ' + monedas + ' monedas · ' + tiempo + ' s · ' + p.circuito + ' (' + superficie + ')'
    + (p.acepta_comunicaciones === 'sí' ? ' · Acepta comunicaciones comerciales' : '');
  var leadId;
  if (row > -1) {
    leadId = String(sheet.getRange(row, col('id') + 1).getValues()[0][0]).replace(/^'/, '');
    var msgCell = sheet.getRange(row, col('mensaje') + 1);
    msgCell.setValue(clean_((resumen + '\n' + msgCell.getValues()[0][0]).slice(0, 4000)));
    if (col('actualizado') > -1) sheet.getRange(row, col('actualizado') + 1).setValue(text_(new Date().toISOString()));
  } else {
    leadId = Utilities.getUuid().slice(0, 8);
    var lead = { id: leadId, recibido: new Date().toISOString(), fecha: p.fecha || '', formulario: 'juego-ax', servicio: 'Juego AX Rally',
      nombre: p.nombre, telefono: p.telefono, email: email, mensaje: resumen, pagina: p.pagina, landing: p.landing, referrer: p.referrer,
      utm_source: p.utm_source, utm_medium: p.utm_medium, utm_campaign: p.utm_campaign, estado: 'Nuevo', etiquetas: 'juego' };
    sheet.appendRow(headers.map(function (h) { return lead[h] === undefined ? '' : TEXT_COLS.indexOf(h) > -1 ? text_(lead[h]) : clean_(lead[h]); }));
  }
  // 2) Partida en el ranking
  var rk = getSheet_(RANKING_SHEET, RANKING_COLUMNS);
  rk.appendRow([text_(new Date().toISOString()), clean_(alias), clean_(p.nombre), clean_(email), clean_(p.telefono), clean_(p.circuito), superficie,
    monedas, tiempo, Math.floor(Number(p.golpes) || 0), puntos, leadId, valid ? 'sí' : 'no']);
  cache.remove('ranking');
  return { ok: true, valida: valid, puntos: puntos };
}
