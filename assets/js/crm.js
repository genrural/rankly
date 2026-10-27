/* =========================================================
   DEYSCOM MOTORSPORT · CRM (área privada)
   Habla con la API del Apps Script (google-apps-script/Code.gs).
   Sin SHEETS_ENDPOINT configurado funciona en modo demostración.
   ========================================================= */
(function () {
  "use strict";
  var CFG = window.DEYSCOM || {};
  var ENDPOINT = CFG.SHEETS_ENDPOINT || "";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var ESTADOS = ["Nuevo", "Contactado", "Presupuesto enviado", "Negociación", "Ganado", "Perdido"];
  var CERRADOS = ["Ganado", "Perdido"];
  var INTERNAL = ["id", "recibido", "fecha", "formulario", "pagina", "landing", "referrer", "utm_source", "utm_medium", "utm_campaign",
    "utm_term", "utm_content", "gclid", "fbclid", "estado", "valor", "proxima_accion", "asignado", "actualizado", "consentimiento", "nombre", "telefono", "email",
    "etiquetas", "edicion", "envio"];
  var LABELS = { servicio: "Servicio", vehiculo: "Vehículo", anio: "Año", presupuesto: "Presupuesto", plazo: "Plazo", mensaje: "Mensaje",
    coche: "Coche", licencia: "Licencia", experiencia_previa: "Experiencia", regalo: "Regalo", fecha_preferida: "Fecha preferida",
    plazas: "Plazas", prueba: "Prueba", interes: "Interés", uso: "Uso", producto: "Producto", talla: "Talla", color: "Color",
    cantidad: "Cantidad", total: "Total", entrega: "Entrega", direccion: "Dirección" };

  var PRODUCTOS = { "experiencia-rally-eurocem": "Experiencia Rally Eurocem", "ds-pilot-course": "DS Pilot Course" };
  var ENVIOS = ["Pendiente de pago", "Pagado", "Preparando", "Enviado", "Entregado", "Cancelado"];
  var ED_ESTADOS = ["Abierta", "Completa", "Cerrada", "Cancelada"];
  var DIRECCION = "C/ Canal de Isabel II, 2, Nave 3, Torrelaguna (L-V 07:00–15:00)";
  // Plantillas de WhatsApp: {nombre}, {servicio}, {yo}, {edicion}, {resena}. "para" filtra por servicio (vacío = todos).
  var PLANTILLAS = [
    { n: "Primer contacto", t: "¡Hola {nombre}! Soy {yo}, de Deyscom Motorsport. Hemos recibido tu solicitud de {servicio}. ¿Te viene bien que te llamemos hoy o mañana para concretar?" },
    { n: "Pedir fotos del coche", para: /competici|restomod|pintura|banco|chapa|venta|busqueda/i, t: "¡Hola {nombre}! Para darte un presupuesto ajustado de {servicio}, ¿nos mandas unas fotos del coche con buena luz y nos dices modelo y año? ¡Gracias!" },
    { n: "Cita en el taller", t: "¡Hola {nombre}! Te esperamos en el taller: " + DIRECCION + ". ¿Qué día te viene bien para pasarte?" },
    { n: "Presupuesto enviado", t: "¡Hola {nombre}! Te acabamos de enviar por email el presupuesto de {servicio}. Cualquier duda, nos dices por aquí." },
    { n: "Seguimiento del presupuesto", t: "¡Hola {nombre}! ¿Pudiste ver el presupuesto de {servicio}? Si quieres ajustamos algo o lo vemos juntos en el taller." },
    { n: "Completar el pago", para: /pilot|eurocem|experiencia|curso/i, t: "¡Hola {nombre}! Hemos visto que reservaste plaza en {servicio}{edicion} pero el pago no llegó a completarse. Puedes terminarlo aquí: {pago} Si tienes cualquier duda, dímelo por aquí." },
    { n: "Confirmar plaza", para: /pilot|eurocem|experiencia|curso/i, t: "¡Hola {nombre}! Te confirmamos tu plaza en {servicio}{edicion}. Unos días antes te mandamos el horario exacto y la ubicación del circuito. ¡Va a ser brutal!" },
    { n: "Pedido enviado", para: /pedido|tienda/i, t: "¡Hola {nombre}! Tu pedido de la tienda Deyscom ya está en camino. ¡Gracias por vestir el equipo! 🏁" },
    { n: "Pedir reseña en Google", t: "¡Hola {nombre}! Gracias por confiar en Deyscom Motorsport. ¿Nos dejarías una reseña en Google? Nos ayuda muchísimo 🙏{resena}" }
  ];

  var state = { token: null, user: null, leads: [], activity: [], ediciones: [], presupuestos: [], ventas: [], stripe: false, view: "panel",
    filters: { q: "", estado: "", servicio: "", origen: "", periodo: "", etiqueta: "" }, openId: null, demo: false };

  /* ---------------- utilidades ---------------- */
  function esc(v) {
    return String(v === undefined || v === null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function store(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function parseDate(v) {
    if (!v) return null;
    var s = String(v).trim();
    var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    var d = new Date(s);
    return isNaN(d) ? null : d;
  }
  function leadDate(l) { return parseDate(l.recibido) || parseDate(l.fecha) || new Date(0); }
  function ymd(d) { return d ? d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") : ""; }
  function fmtDate(d, time) {
    if (!d || d.getTime() === 0) return "—";
    var o = { day: "2-digit", month: "short", year: "numeric" };
    if (time) { o.hour = "2-digit"; o.minute = "2-digit"; }
    return d.toLocaleString("es-ES", o);
  }
  function ago(d) {
    var s = (Date.now() - d.getTime()) / 1000;
    if (s < 3600) return "hace " + Math.max(1, Math.round(s / 60)) + " min";
    if (s < 86400) return "hace " + Math.round(s / 3600) + " h";
    if (s < 86400 * 30) return "hace " + Math.round(s / 86400) + " d";
    return fmtDate(d);
  }
  function money(n) { return (Number(n) || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }); }
  function money2(n) { return (Number(n) || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function num(v) {
    var t = String(v === undefined || v === null ? "" : v).replace(/[^\d.,-]/g, "");
    if (t.indexOf(",") > -1) t = t.replace(/\./g, "").replace(",", ".");          // 1.234,56
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");           // 1.234
    var n = parseFloat(t); return isNaN(n) ? 0 : n;
  }
  function phoneDigits(p) {
    var d = String(p || "").replace(/[^\d+]/g, "");
    if (d.indexOf("+") === 0) return d.slice(1);
    if (d.indexOf("00") === 0) return d.slice(2);
    if (d.length === 9) return "34" + d;
    return d;
  }
  function origin(l) {
    var ref = String(l.referrer || "").toLowerCase();
    if (l.formulario === "crm-manual" || ref.indexOf("manual") === 0) return ref.indexOf("manual:") === 0 ? "Manual · " + l.referrer.slice(7) : "Manual";
    if (l.gclid) return "Google Ads";
    if (l.fbclid) return "Meta Ads";
    if (l.utm_source) { var src = l.utm_source.charAt(0).toUpperCase() + l.utm_source.slice(1); return l.utm_medium ? src + " · " + l.utm_medium : src; }
    var map = [["google", "Google orgánico"], ["bing", "Bing"], ["instagram", "Instagram"], ["facebook", "Facebook"], ["fb.", "Facebook"],
      ["tiktok", "TikTok"], ["youtube", "YouTube"], ["wallapop", "Wallapop"], ["chatgpt", "ChatGPT"], ["openai", "ChatGPT"], ["perplexity", "Perplexity"], ["claude", "Claude"]];
    for (var i = 0; i < map.length; i++) if (ref.indexOf(map[i][0]) > -1) return map[i][1];
    if (!ref || ref.indexOf("deyscom") > -1) return "Directo";
    try { return new URL(ref).hostname.replace(/^www\./, ""); } catch (e) { return "Otro"; }
  }
  function service(l) { return l.servicio || l.formulario || "Sin servicio"; }
  function productOf(l) {
    if (PRODUCTOS[l.formulario]) return l.formulario;
    for (var k in PRODUCTOS) if (PRODUCTOS[k] === l.servicio) return k;
    return "";
  }
  function isOrder(l) { return l.formulario === "pedido" || /pedido tienda/i.test(l.servicio || ""); }
  function tags(l) { return String(l.etiquetas || "").split(",").map(function (t) { return t.trim(); }).filter(Boolean); }
  function edById(id) { return state.ediciones.filter(function (e) { return e.id === id; })[0]; }
  function edLabel(e) {
    if (!e) return "";
    var d = parseDate(e.fecha);
    return (e.nombre || PRODUCTOS[e.experiencia] || e.experiencia) + " · " + (d ? d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }) : e.fecha) + (e.turno ? " · " + e.turno : "");
  }
  function seats(e) { var p = parseInt(e.plazas, 10) || 0; return { plazas: p, ocupadas: Number(e.ocupadas) || 0, libres: p ? Math.max(0, p - (Number(e.ocupadas) || 0)) : null }; }
  function b64ToBlob(b64, type) { var bin = atob(b64), arr = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); return new Blob([arr], { type: type }); }
  function download(blob, name) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
  function showDlg(d) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
  function hideDlg(d) { if (d.close) d.close(); else d.removeAttribute("open"); }
  function estadoClass(e) { return "st st--" + (ESTADOS.indexOf(e) > -1 ? ESTADOS.indexOf(e) : 0); }
  function toast(msg, bad) {
    var t = $("#crm-toast");
    t.textContent = msg; t.className = "crm-toast is-on" + (bad ? " is-bad" : "");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = "crm-toast"; }, 3200);
  }
  function busy(on) { document.body.classList.toggle("is-busy", !!on); }

  /* ---------------- API ---------------- */
  function api(action, payload) {
    if (state.demo) return Promise.resolve(demoApi(action, payload || {}));
    var body = JSON.stringify(Object.assign({ api: action, token: state.token }, payload || {}));
    return fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body, redirect: "follow" })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok && res.error === "auth") { logout(true); throw new Error("Tu sesión ha caducado. Vuelve a entrar."); }
        if (!res.ok) throw new Error(res.error || "Error");
        return res;
      });
  }

  /* ---------------- modo demostración ---------------- */
  function demoSeed() {
    var names = ["Carlos Martín", "Lucía Gómez", "Javier Ruiz", "Marta Sanz", "Alberto Díaz", "Sara López", "Pablo Herrero", "Elena Navarro",
      "Rubén Castro", "Irene Molina", "Diego Prieto", "Nuria Vega", "Óscar Romero", "Laura Gil", "Iván Moreno", "Paula Ortega",
      "Sergio Rubio", "Cristina Peña", "Andrés Marín", "Beatriz Cano", "Hugo Serrano", "Alba Ramos", "Mario Iglesias", "Clara Fuentes"];
    var svc = [["Competición", "presupuesto-home", "BMW E36", "10.000 – 30.000 €"], ["Pintura", "pintura", "Nissan Patrol", "3.000 – 10.000 €"],
      ["Restomod", "restomod", "Land Rover Defender 110", "> 30.000 €"], ["Banco de potencia", "banco-de-potencia", "Golf GTI Mk2", "< 3.000 €"],
      ["Competición", "contacto", "Peugeot 206", "3.000 – 10.000 €"], ["Pintura", "contacto", "BMW E30", "3.000 – 10.000 €"],
      ["Pedido tienda", "pedido", "", ""], ["Coches de rally en venta · búsqueda", "busqueda-coche-rally", "Peugeot 206 de rally", "Hasta 9.000 €"]];
    var refs = ["https://www.google.com/", "", "https://www.instagram.com/", "https://www.google.com/", "https://l.facebook.com/", "", "https://www.tiktok.com/", "https://chatgpt.com/"];
    var est = ["Nuevo", "Nuevo", "Contactado", "Presupuesto enviado", "Negociación", "Ganado", "Perdido", "Contactado", "Ganado", "Nuevo"];
    var leads = [], act = [], now = Date.now();
    names.forEach(function (n, i) {
      var s = svc[i % svc.length], e = est[(i * 7) % est.length];
      var d = new Date(now - (i * 2.7 + (i % 3)) * 86400000 - i * 3600000);
      var l = { id: "demo" + (100 + i), recibido: d.toISOString(), fecha: d.toLocaleString("es-ES"), formulario: s[1], servicio: s[0], nombre: n,
        telefono: "6" + String(10000000 + i * 3791371).slice(0, 8), email: n.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + "@ejemplo.com",
        vehiculo: s[2], presupuesto: s[3], mensaje: i % 2 ? "Quería información y precio. ¿Tenéis fechas el mes que viene?" : "Me gustaría pasar por el taller para verlo.",
        pagina: "/" + s[1] + ".html", referrer: refs[i % refs.length], utm_source: i % 9 === 4 ? "instagram" : "", utm_medium: i % 9 === 4 ? "social" : "",
        gclid: i % 11 === 3 ? "demo" : "", estado: e, valor: ["Ganado", "Negociación", "Presupuesto enviado"].indexOf(e) > -1 ? String([1800, 4500, 690, 12000, 350][i % 5]) : "",
        proxima_accion: CERRADOS.indexOf(e) === -1 && e !== "Nuevo" ? ymd(new Date(now + ((i % 6) - 1) * 86400000)) : "", asignado: i % 3 ? "Néstor" : "Héctor", actualizado: "" };
      leads.push(l);
      act.push({ lead_id: l.id, fecha: d.toISOString(), usuario: "web", tipo: "creado", texto: "Lead recibido desde " + l.pagina });
      if (e !== "Nuevo") act.push({ lead_id: l.id, fecha: new Date(d.getTime() + 7200000).toISOString(), usuario: l.asignado, tipo: "nota", texto: "Llamado. Le enviamos información por WhatsApp." });
    });
    var eds = (window.DM_EDICIONES || []).map(function (e) { return Object.assign({}, e); });
    var ventas = [];
    var bookers = ["Raúl Benito", "Silvia Pardo", "Tomás Llorente", "Eva Morales", "Jorge Cuesta", "Ana Belén Rey", "Víctor Gallego", "Lidia Sáez", "Marcos Vidal", "Rocío Medina", "Adrián Soler", "Noelia Paz"];
    bookers.forEach(function (n, i) {
      var e = eds[i % Math.max(1, eds.length)]; if (!e) return;
      var paid = i % 4 !== 3, d = new Date(now - (i + 1) * 9 * 3600000);
      var l = { id: "demow" + i, recibido: d.toISOString(), fecha: d.toLocaleString("es-ES"), formulario: e.experiencia, servicio: e.nombre, nombre: n,
        telefono: "6" + String(20000000 + i * 4917131).slice(0, 8), email: n.split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@ejemplo.com",
        edicion: e.id, fecha_elegida: e.etiqueta, plazas: i === 5 ? "2" : "1", pagina: "/" + e.experiencia + ".html", referrer: refs[i % refs.length],
        estado: paid ? "Ganado" : "Nuevo", valor: paid ? String((e.precio || 299) * (i === 5 ? 2 : 1)) : "", asignado: "" };
      leads.push(l);
      act.push({ lead_id: l.id, fecha: d.toISOString(), usuario: "web", tipo: "creado", texto: "Reserva desde la web: " + e.etiqueta });
      if (paid) {
        act.push({ lead_id: l.id, fecha: new Date(d.getTime() + 300000).toISOString(), usuario: "Stripe", tipo: "pago", texto: "Pago recibido en Stripe: " + money2(l.valor) + " · " + e.nombre + " · " + e.etiqueta });
        ventas.push({ session_id: "cs_demo_" + i, fecha: new Date(d.getTime() + 300000).toISOString(), cliente: n, email: l.email, telefono: l.telefono, importe: l.valor, moneda: "EUR",
          plazas: l.plazas, edicion: e.id, experiencia: e.nombre, fecha_edicion: e.etiqueta, lead_id: l.id, estado: "Pagado" });
      }
    });
    leads.forEach(function (l) { if (l.formulario === "pedido") { l.producto = "Camiseta Deyscom"; l.talla = "L"; l.color = "Negro"; l.cantidad = "1"; l.total = "29.00"; l.entrega = "Envío a domicilio"; l.envio = l.estado === "Ganado" ? "Entregado" : "Pagado"; } });
    return { leads: leads, activity: act, ediciones: eds, presupuestos: [], ventas: ventas };
  }
  var demoMem = null;
  function demoDb() {
    if (demoMem) return demoMem;
    var raw = read("dm_crm_demo2");
    if (raw) { try { demoMem = JSON.parse(raw); return demoMem; } catch (e) { /* reinicia */ } }
    demoMem = demoSeed(); store("dm_crm_demo2", JSON.stringify(demoMem)); return demoMem;
  }
  function demoQuoteHtml(q, l) {
    var rows = q.lineas.map(function (x) { return "<tr><td>" + esc(x.concepto) + "</td><td align=right>" + x.cantidad + "</td><td align=right>" + money(x.precio) + "</td><td align=right>" + money(x.cantidad * x.precio) + "</td></tr>"; }).join("");
    return '<html><head><meta charset="utf-8"><title>Presupuesto ' + esc(q.numero) + '</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:30px auto;color:#111}h1{border-bottom:4px solid #ff66c4;padding-bottom:8px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #ddd}th{background:#111;color:#fff;text-align:left}</style></head><body>' +
      "<h1>DEYSCOM MOTORSPORT · Presupuesto " + esc(q.numero) + "</h1><p><b>Cliente:</b> " + esc(l.nombre) + " · " + esc(q.email || "") + "<br><b>Fecha:</b> " + esc(q.fecha) + "</p>" +
      "<table><tr><th>Concepto</th><th>Cant.</th><th>Precio</th><th>Importe</th></tr>" + rows + "</table><p style='text-align:right'>Base " + money(q.base) + " · IVA " + money(q.iva) + "<br><b style='font-size:20px'>Total " + money(q.total) + "</b></p>" +
      (q.notas ? "<p><b>Observaciones:</b> " + esc(q.notas) + "</p>" : "") + "<p style='color:#777;font-size:12px'>Vista de demostración. Con Google Sheets conectado se genera un PDF real, se guarda en Drive y se puede enviar por email.</p></body></html>";
  }
  function demoApi(action, p) {
    var db = demoDb();
    var save = function () { store("dm_crm_demo2", JSON.stringify(db)); };
    var user = state.user || { email: "demo@deyscom.com", nombre: "Modo demo", rol: "admin" };
    var log = function (id, tipo, texto) { var a = { lead_id: id, fecha: new Date().toISOString(), usuario: user.nombre, tipo: tipo, texto: texto }; db.activity.push(a); return a; };
    var find = function (id) { return db.leads.filter(function (l) { return l.id === id; })[0]; };
    switch (action) {
      case "login": return { ok: true, token: "demo", user: user };
      case "logout": return { ok: true };
      case "leads":
        db.presupuestos = db.presupuestos || []; db.ventas = db.ventas || [];
        return { ok: true, user: user, estados: ESTADOS, leads: db.leads, activity: db.activity, ediciones: db.ediciones && db.ediciones.length ? db.ediciones : (window.DM_EDICIONES || []),
          presupuestos: db.presupuestos, ventas: db.ventas, stripe: true };
      case "syncStripe": return { ok: true, nuevas: 0 };
      case "quote":
        var ql = find(p.lead_id), base = p.lineas.reduce(function (t, x) { return t + x.cantidad * x.precio; }, 0), tot = Math.round(base * (1 + (Number(p.iva) || 0) / 100) * 100) / 100;
        var numq = "P-" + new Date().getFullYear() + "-" + ("00" + (db.presupuestos.length + 1)).slice(-3);
        var qq = { numero: numq, lead_id: p.lead_id, fecha: ymd(new Date()), cliente: ql.nombre, email: p.email, lineas: p.lineas, base: base, iva: tot - base, total: tot, notas: p.notas, estado: p.enviar ? "Enviado" : "Creado" };
        db.presupuestos.push(qq); ql.valor = String(tot); if (["Nuevo", "Contactado"].indexOf(ql.estado) > -1) ql.estado = "Presupuesto enviado";
        log(p.lead_id, "presupuesto", "Presupuesto " + numq + " · " + money(tot) + (p.enviar ? " · (demo: no se envía email)" : "")); save();
        return { ok: true, numero: numq, total: tot, sent: false, html: demoQuoteHtml(qq, ql) };
      case "quotePdf": var qd = db.presupuestos.filter(function (x) { return x.numero === p.numero; })[0]; return qd ? { ok: true, html: demoQuoteHtml(qd, find(qd.lead_id) || {}) } : { ok: false, error: "No encontrado" };
      case "quoteStatus":
        var qs = db.presupuestos.filter(function (x) { return x.numero === p.numero; })[0]; if (!qs) return { ok: false, error: "No encontrado" };
        qs.estado = p.estado; if (p.estado === "Aceptado") { var lw = find(qs.lead_id); if (lw) lw.estado = "Ganado"; } log(qs.lead_id, "presupuesto", "Presupuesto " + p.numero + " → " + p.estado); save(); return { ok: true };
      case "digest": return { ok: true, sent: false };
      case "update":
        var l = find(p.id); if (!l) return { ok: false, error: "No encontrado" };
        var ch = [];
        Object.keys(p.fields).forEach(function (k) { if (String(l[k] || "") !== String(p.fields[k])) { ch.push(k === "estado" ? "Estado: " + (l[k] || "—") + " → " + p.fields[k] : k + ": " + (p.fields[k] || "—")); l[k] = String(p.fields[k]); } });
        if (ch.length) { l.actualizado = new Date().toISOString(); log(p.id, ch.length === 1 && ch[0].indexOf("Estado") === 0 ? "estado" : "edicion", ch.join(" · ")); }
        save(); return { ok: true };
      case "note": var a = log(p.id, "nota", p.text); save(); return { ok: true, activity: a };
      case "create":
        var id = "demo" + Date.now().toString(36);
        var nl = Object.assign({ id: id, recibido: new Date().toISOString(), fecha: new Date().toLocaleString("es-ES"), formulario: "crm-manual",
          referrer: p.fields.origen ? "manual:" + p.fields.origen : "manual", estado: "Nuevo" }, p.fields);
        delete nl.origen; db.leads.push(nl); log(id, "creado", "Lead creado a mano"); save(); return { ok: true, id: id };
      case "delete": db.leads = db.leads.filter(function (l) { return l.id !== p.id; }); save(); return { ok: true };
      case "users": return { ok: true, users: [{ email: "tu-email@ejemplo.com", nombre: "Administrador", rol: "admin", activo: true }, { email: "info@deyscom.com", nombre: "Deyscom Motorsport", rol: "cliente", activo: true }] };
      case "resetUser": return { ok: true, email: p.email, password: "Demo-Clave-1234" };
      case "password": return { ok: true };
    }
    return { ok: false, error: "Acción no disponible en la demo" };
  }

  /* ---------------- sesión ---------------- */
  function showApp() {
    $("#crm-login").hidden = true;
    $("#crm-app").hidden = false;
    $("#crm-user-name").textContent = state.user.nombre;
    $("#crm-user-role").textContent = state.user.rol === "admin" ? "Administrador" : "Cliente";
    $$("[data-admin]").forEach(function (el) { el.hidden = state.user.rol !== "admin"; });
    $("#crm-demo-badge").hidden = !state.demo;
    $("#crm-demo-reset").hidden = !state.demo;
    load();
  }
  function logout(expired) {
    if (!state.demo && state.token && !expired) api("logout").catch(function () {});
    state.token = null; state.user = null; state.leads = [];
    store("dm_crm_token", null); store("dm_crm_user", null);
    $("#crm-app").hidden = true; $("#crm-login").hidden = false;
    closeDrawer();
    if (expired) loginError("Tu sesión ha caducado. Vuelve a entrar.");
  }
  function loginError(msg) { var e = $("#crm-login-error"); e.textContent = msg || ""; e.hidden = !msg; }

  $("#crm-login-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    loginError("");
    if (!ENDPOINT) { loginError("El CRM todavía no está conectado a Google Sheets. Mientras tanto puedes entrar en modo demostración."); return; }
    var btn = $("button[type=submit]", this);
    btn.disabled = true; btn.classList.add("is-loading");
    state.demo = false;
    api("login", { email: $("#crm-email").value, password: $("#crm-pass").value })
      .then(function (res) {
        state.token = res.token; state.user = res.user;
        store("dm_crm_token", res.token); store("dm_crm_user", JSON.stringify(res.user));
        $("#crm-pass").value = "";
        showApp();
      })
      .catch(function (err) { loginError(err.message === "Failed to fetch" ? "No hay conexión con el servidor. Inténtalo de nuevo." : err.message); })
      .then(function () { btn.disabled = false; btn.classList.remove("is-loading"); });
  });
  $("#crm-demo").addEventListener("click", function () {
    state.demo = true; state.token = "demo"; state.user = { email: "demo@deyscom.com", nombre: "Modo demo", rol: "admin" };
    showApp();
  });
  $("#crm-pass-toggle").addEventListener("click", function () {
    var i = $("#crm-pass"); var show = i.type === "password"; i.type = show ? "text" : "password";
    this.setAttribute("aria-pressed", show); this.textContent = show ? "Ocultar" : "Ver";
  });
  $("#crm-logout").addEventListener("click", function () { logout(false); });
  if (!ENDPOINT) $("#crm-demo-note").hidden = false;

  /* ---------------- carga y navegación ---------------- */
  function load() {
    busy(true);
    return api("leads").then(function (res) {
      state.leads = (res.leads || []).filter(function (l) { return l.id; });
      state.leads.forEach(function (l) { l._date = leadDate(l); if (!l.estado) l.estado = "Nuevo"; });
      state.leads.sort(function (a, b) { return b._date - a._date; });
      state.activity = res.activity || [];
      var eds = res.ediciones && res.ediciones.length ? res.ediciones : (window.DM_EDICIONES || []);
      state.ediciones = eds.slice().sort(function (a, b) { return (a.fecha + (a.turno === "Tarde" ? 1 : 0)) < (b.fecha + (b.turno === "Tarde" ? 1 : 0)) ? -1 : 1; });
      state.ventas = res.ventas || []; state.stripe = !!res.stripe;
      state.presupuestos = res.presupuestos || [];
      fillFilters(); render();
      $("#crm-sync").textContent = "Actualizado " + new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    }).catch(function (e) { toast(e.message, true); }).then(function () { busy(false); });
  }
  function setView(v) {
    state.view = v;
    $$("[data-view]").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-view") === v); if (b.getAttribute("data-view") === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    $$(".crm-view").forEach(function (s) { s.hidden = s.id !== "view-" + v; });
    $("#crm-title").textContent = { panel: "Panel", leads: "Leads", pipeline: "Pipeline", calendario: "Calendario", ventas: "Ventas", pedidos: "Pedidos", usuarios: "Usuarios", cuenta: "Mi cuenta" }[v];
    $("#crm-filters").hidden = !(v === "leads" || v === "pipeline");
    document.body.classList.remove("nav-open");
    render();
    if (v === "usuarios") loadUsers();
  }
  $$("[data-view]").forEach(function (b) { b.addEventListener("click", function () { setView(b.getAttribute("data-view")); }); });
  $("#crm-refresh").addEventListener("click", load);
  $("#crm-burger").addEventListener("click", function (e) { e.stopPropagation(); document.body.classList.toggle("nav-open"); });
  document.addEventListener("click", function (e) { if (document.body.classList.contains("nav-open") && !e.target.closest(".crm-side")) document.body.classList.remove("nav-open"); });

  /* ---------------- filtros ---------------- */
  function fillFilters() {
    var uniq = function (fn) { var o = {}; state.leads.forEach(function (l) { o[fn(l)] = 1; }); return Object.keys(o).sort(); };
    var opts = function (sel, values, all) {
      var cur = sel.value;
      sel.innerHTML = '<option value="">' + all + "</option>" + values.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + "</option>"; }).join("");
      sel.value = values.indexOf(cur) > -1 ? cur : "";
    };
    opts($("#f-estado"), ESTADOS, "Todos los estados");
    opts($("#f-servicio"), uniq(service), "Todos los servicios");
    opts($("#f-origen"), uniq(origin), "Todos los orígenes");
    var allTags = {}; state.leads.forEach(function (l) { tags(l).forEach(function (t) { allTags[t] = 1; }); });
    opts($("#f-etiqueta"), Object.keys(allTags).sort(), "Todas las etiquetas");
    $("#crm-tags").innerHTML = Object.keys(allTags).sort().map(function (t) { return '<option value="' + esc(t) + '">'; }).join("");
  }
  ["q", "estado", "servicio", "origen", "periodo", "etiqueta"].forEach(function (k) {
    var el = $("#f-" + k);
    el.addEventListener(k === "q" ? "input" : "change", function () { state.filters[k] = el.value; render(); });
  });
  function filtered() {
    var f = state.filters, q = f.q.trim().toLowerCase();
    var since = f.periodo ? Date.now() - Number(f.periodo) * 86400000 : 0;
    return state.leads.filter(function (l) {
      if (f.estado && l.estado !== f.estado) return false;
      if (f.servicio && service(l) !== f.servicio) return false;
      if (f.origen && origin(l) !== f.origen) return false;
      if (since && l._date.getTime() < since) return false;
      if (f.etiqueta && tags(l).indexOf(f.etiqueta) === -1) return false;
      if (q) {
        var hay = [l.nombre, l.telefono, l.email, l.servicio, l.vehiculo, l.mensaje, l.asignado].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* ---------------- render ---------------- */
  function recountSeats() {
    var taken = {};
    state.leads.forEach(function (l) { if (l.edicion && l.estado === "Ganado") taken[l.edicion] = (taken[l.edicion] || 0) + (parseInt(l.plazas, 10) > 0 ? parseInt(l.plazas, 10) : 1); });
    state.ediciones.forEach(function (e) { e.ocupadas = taken[e.id] || 0; });
  }
  function render() {
    if (!state.user) return;
    recountSeats();
    if (state.view === "panel") renderPanel();
    if (state.view === "leads") renderLeads();
    if (state.view === "pipeline") renderPipeline();
    if (state.view === "calendario") renderCalendar();
    if (state.view === "ventas") renderSales();
    if (state.view === "pedidos") renderOrders();
    var nuevos = state.leads.filter(function (l) { return l.estado === "Nuevo"; }).length;
    var badge = $("#crm-badge-new"); badge.textContent = nuevos; badge.hidden = !nuevos;
  }

  function bars(rows, total) {
    if (!rows.length) return '<p class="crm-empty">Sin datos todavía.</p>';
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }));
    return '<ul class="crm-bars">' + rows.map(function (r) {
      return '<li><span class="crm-bars__lbl">' + esc(r[0]) + '</span><span class="crm-bars__track"><i style="width:' + Math.max(4, r[1] / max * 100) + '%"></i></span><b>' + r[1] + '</b><small>' + Math.round(r[1] / total * 100) + "%</small></li>";
    }).join("") + "</ul>";
  }
  function countBy(list, fn) {
    var o = {}; list.forEach(function (l) { var k = fn(l); o[k] = (o[k] || 0) + 1; });
    return Object.keys(o).map(function (k) { return [k, o[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  }
  function renderPanel() {
    var L = state.leads, now = new Date();
    var month = new Date(now.getFullYear(), now.getMonth(), 1), prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    var thisM = L.filter(function (l) { return l._date >= month; }).length;
    var prevM = L.filter(function (l) { return l._date >= prevMonth && l._date < month; }).length;
    var nuevos = L.filter(function (l) { return l.estado === "Nuevo"; });
    var won = L.filter(function (l) { return l.estado === "Ganado"; });
    var closed = L.filter(function (l) { return CERRADOS.indexOf(l.estado) > -1; }).length;
    var open = L.filter(function (l) { return CERRADOS.indexOf(l.estado) === -1; });
    var pipe = open.reduce(function (s, l) { return s + num(l.valor); }, 0);
    var wonV = won.reduce(function (s, l) { return s + num(l.valor); }, 0);
    var delta = prevM ? Math.round((thisM - prevM) / prevM * 100) : null;
    var kpis = [
      ["Leads totales", L.length, "desde el inicio"],
      ["Este mes", thisM, delta === null ? "sin datos del mes anterior" : (delta >= 0 ? "▲ " : "▼ ") + Math.abs(delta) + "% vs mes anterior"],
      ["Sin contactar", nuevos.length, nuevos.length ? "¡llámales hoy!" : "todo al día", nuevos.length ? "hot" : ""],
      ["Conversión", closed ? Math.round(won.length / L.length * 100) + "%" : "—", won.length + (won.length === 1 ? " ganado de " : " ganados de ") + L.length],
      ["En curso", money(pipe), open.length + (open.length === 1 ? " lead abierto" : " leads abiertos")],
      ["Ganado", money(wonV), won.length + (won.length === 1 ? " operación" : " operaciones")]
    ];
    $("#crm-kpis").innerHTML = kpis.map(function (k) {
      return '<div class="kpi' + (k[3] ? " kpi--" + k[3] : "") + '"><span>' + k[0] + "</span><b>" + esc(k[1]) + "</b><small>" + esc(k[2]) + "</small></div>";
    }).join("");

    // leads por semana (12 semanas)
    var weeks = [], start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    for (var i = 11; i >= 0; i--) { var a = new Date(start.getTime() - i * 7 * 86400000); weeks.push([a, 0]); }
    L.forEach(function (l) { for (var j = weeks.length - 1; j >= 0; j--) { if (l._date >= weeks[j][0]) { weeks[j][1]++; break; } } });
    var wmax = Math.max(1, Math.max.apply(null, weeks.map(function (w) { return w[1]; })));
    $("#crm-weeks").innerHTML = '<div class="crm-cols">' + weeks.map(function (w) {
      return '<div class="crm-cols__c" title="Semana del ' + fmtDate(w[0]) + ": " + w[1] + ' leads"><b>' + (w[1] || "") + '</b><i style="height:' + (w[1] / wmax * 100) + '%"></i><small>' + w[0].getDate() + "/" + (w[0].getMonth() + 1) + "</small></div>";
    }).join("") + "</div>";
    $("#crm-by-service").innerHTML = bars(countBy(L, service).slice(0, 8), L.length || 1);
    $("#crm-by-origin").innerHTML = bars(countBy(L, origin).slice(0, 8), L.length || 1);
    $("#crm-by-status").innerHTML = bars(ESTADOS.map(function (e) { return [e, L.filter(function (l) { return l.estado === e; }).length]; }).filter(function (r) { return r[1]; }), L.length || 1);

    var today = ymd(new Date());
    var agenda = open.filter(function (l) { return l.proxima_accion; }).map(function (l) { l._next = ymd(parseDate(l.proxima_accion)); return l; })
      .filter(function (l) { return l._next; }).sort(function (a, b) { return a._next < b._next ? -1 : 1; }).slice(0, 8);
    $("#crm-agenda").innerHTML = agenda.length ? agenda.map(function (l) {
      var late = l._next < today, isToday = l._next === today;
      return '<li><button type="button" data-open="' + esc(l.id) + '"><span class="crm-date' + (late ? " is-late" : isToday ? " is-today" : "") + '">' + (late ? "Atrasado · " : isToday ? "Hoy · " : "") + fmtDate(parseDate(l._next)) +
        "</span><b>" + esc(l.nombre) + "</b><small>" + esc(service(l)) + " · " + esc(l.estado) + "</small></button></li>";
    }).join("") : '<li class="crm-empty">No hay próximas acciones. Ponlas en cada lead para no olvidar ninguna llamada.</li>';
    var ch = {};
    L.forEach(function (l) { var k = origin(l).split(" · ")[0]; ch[k] = ch[k] || { n: 0, g: 0, v: 0 }; ch[k].n++; if (l.estado === "Ganado") { ch[k].g++; ch[k].v += num(l.valor); } });
    $("#crm-channels").innerHTML = Object.keys(ch).length ? '<table class="crm-mini"><thead><tr><th>Canal</th><th>Leads</th><th>Ganados</th><th>Conv.</th><th>Valor ganado</th></tr></thead><tbody>' +
      Object.keys(ch).sort(function (a, b) { return ch[b].n - ch[a].n; }).map(function (k) {
        var c = ch[k]; return "<tr><td>" + esc(k) + "</td><td>" + c.n + "</td><td>" + c.g + "</td><td>" + Math.round(c.g / c.n * 100) + "%</td><td>" + money(c.v) + "</td></tr>";
      }).join("") + "</tbody></table>" : '<p class="crm-empty">Sin datos todavía.</p>';
    var nextEd = state.ediciones.filter(function (e) { return e.fecha >= today && e.estado !== "Cancelada"; }).slice(0, 6);
    $("#crm-next-ed").innerHTML = nextEd.length ? nextEd.map(function (e) {
      var st = seats(e);
      return '<li><button type="button" data-ed="' + esc(e.id) + '"><span class="crm-date">' + fmtDate(parseDate(e.fecha)) + "</span><b>" + esc((e.nombre || PRODUCTOS[e.experiencia]) + (e.turno ? " · " + e.turno : "")) +
        "</b><small>" + (st.plazas ? st.ocupadas + " / " + st.plazas + " plazas" + (st.libres === 0 ? " · COMPLETA" : "") : st.ocupadas + " inscritos") + "</small></button></li>";
    }).join("") : '<li class="crm-empty">No hay ediciones programadas. Créalas en Calendario para mostrar fechas y plazas en la web.</li>';
    $("#crm-latest").innerHTML = L.slice(0, 6).map(function (l) {
      return '<li><button type="button" data-open="' + esc(l.id) + '"><span class="' + estadoClass(l.estado) + '">' + esc(l.estado) + "</span><b>" + esc(l.nombre) + "</b><small>" + esc(service(l)) + " · " + ago(l._date) + "</small></button></li>";
    }).join("") || '<li class="crm-empty">Todavía no hay leads.</li>';
  }

  function renderLeads() {
    var list = filtered();
    $("#crm-count").textContent = list.length + (list.length === 1 ? " lead" : " leads");
    var rows = list.map(function (l) {
      return '<tr data-open="' + esc(l.id) + '" tabindex="0">' +
        '<td data-l="Fecha"><span class="crm-muted">' + fmtDate(l._date, true) + "</span></td>" +
        '<td data-l="Nombre"><b>' + esc(l.nombre || "Sin nombre") + "</b></td>" +
        '<td data-l="Contacto">' + esc(l.telefono) + (l.email ? '<br><span class="crm-muted">' + esc(l.email) + "</span>" : "") + "</td>" +
        '<td data-l="Servicio">' + esc(service(l)) + "</td>" +
        '<td data-l="Estado"><span class="' + estadoClass(l.estado) + '">' + esc(l.estado) + "</span></td>" +
        '<td data-l="Valor">' + (num(l.valor) ? money(num(l.valor)) : '<span class="crm-muted">—</span>') + "</td>" +
        '<td data-l="Próxima acción">' + (l.proxima_accion ? fmtDate(parseDate(l.proxima_accion)) : '<span class="crm-muted">—</span>') + "</td>" +
        '<td data-l="Origen"><span class="crm-muted">' + esc(origin(l)) + "</span></td></tr>";
    }).join("");
    $("#crm-table tbody").innerHTML = rows || '<tr><td colspan="8" class="crm-empty">No hay leads con estos filtros.</td></tr>';
  }

  function renderPipeline() {
    var list = filtered();
    $("#crm-board").innerHTML = ESTADOS.map(function (e) {
      var items = list.filter(function (l) { return l.estado === e; });
      var total = items.reduce(function (s, l) { return s + num(l.valor); }, 0);
      return '<section class="crm-col" data-estado="' + esc(e) + '"><header><span class="' + estadoClass(e) + '">' + esc(e) + "</span><b>" + items.length + "</b>" + (total ? "<small>" + money(total) + "</small>" : "") + "</header>" +
        '<div class="crm-col__list">' + items.map(function (l) {
          return '<article class="crm-card" draggable="true" data-id="' + esc(l.id) + '" data-open="' + esc(l.id) + '" tabindex="0"><b>' + esc(l.nombre || "Sin nombre") + "</b><span>" + esc(service(l)) + "</span>" +
            "<small>" + ago(l._date) + (num(l.valor) ? " · " + money(num(l.valor)) : "") + (l.proxima_accion ? " · 📅 " + fmtDate(parseDate(l.proxima_accion)) : "") + "</small></article>";
        }).join("") + "</div></section>";
    }).join("");
  }

  // arrastrar y soltar en el pipeline
  var dragId = null;
  document.addEventListener("dragstart", function (e) { var c = e.target.closest && e.target.closest(".crm-card"); if (!c) return; dragId = c.getAttribute("data-id"); c.classList.add("is-drag"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", dragId); } catch (x) { /* IE */ } });
  document.addEventListener("dragend", function () { $$(".is-drag, .is-over").forEach(function (el) { el.classList.remove("is-drag", "is-over"); }); });
  document.addEventListener("dragover", function (e) {
    var board = $("#crm-board");
    if (dragId && board) { var r = board.getBoundingClientRect(); if (e.clientX > r.right - 60) board.scrollLeft += 18; else if (e.clientX < r.left + 60) board.scrollLeft -= 18; }
  });
  document.addEventListener("dragover", function (e) { var col = e.target.closest && e.target.closest(".crm-col"); if (!col || !dragId) return; e.preventDefault(); $$(".crm-col.is-over").forEach(function (c) { if (c !== col) c.classList.remove("is-over"); }); col.classList.add("is-over"); });
  document.addEventListener("drop", function (e) {
    var col = e.target.closest && e.target.closest(".crm-col"); if (!col || !dragId) return;
    e.preventDefault();
    var id = dragId; dragId = null;
    var estado = col.getAttribute("data-estado");
    var l = byId(id);
    if (l && l.estado !== estado) saveFields(id, { estado: estado }, "Movido a " + estado);
  });

  /* ---------------- ficha del lead ---------------- */
  function byId(id) { return state.leads.filter(function (l) { return l.id === id; })[0]; }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-open]");
    if (t && !e.target.closest("a, select, input, textarea, label")) openDrawer(t.getAttribute("data-open"));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
    if (e.key === "Enter" && e.target.matches && e.target.matches("tr[data-open], .crm-card")) openDrawer(e.target.getAttribute("data-open"));
  });
  $("#crm-drawer-close").addEventListener("click", closeDrawer);
  $("#crm-overlay").addEventListener("click", closeDrawer);

  function closeDrawer() {
    state.openId = null;
    $("#crm-drawer").classList.remove("is-open"); $("#crm-overlay").classList.remove("is-open");
    $("#crm-drawer").setAttribute("aria-hidden", "true");
  }
  function openDrawer(id) {
    var l = byId(id); if (!l) return;
    state.openId = id;
    var d = $("#crm-drawer");
    var ph = phoneDigits(l.telefono);
    var wa = "https://wa.me/" + ph + "?text=" + encodeURIComponent("¡Hola " + (l.nombre || "").split(" ")[0] + "! Te escribimos de Deyscom Motorsport por tu solicitud de " + service(l) + ".");
    var extra = Object.keys(l).filter(function (k) { return k.charAt(0) !== "_" && INTERNAL.indexOf(k) === -1 && l[k]; }).map(function (k) {
      return "<div><dt>" + esc(LABELS[k] || k.replace(/_/g, " ")) + "</dt><dd>" + esc(l[k]).replace(/\n/g, "<br>") + "</dd></div>";
    }).join("");
    var originRows = [["Origen", origin(l)], ["Formulario", l.formulario], ["Página", l.pagina], ["Entrada", l.landing], ["Referencia", l.referrer],
      ["Campaña", [l.utm_source, l.utm_medium, l.utm_campaign, l.utm_term, l.utm_content].filter(Boolean).join(" · ")], ["gclid / fbclid", l.gclid || l.fbclid]]
      .filter(function (r) { return r[1]; }).map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("");
    var acts = state.activity.filter(function (a) { return a.lead_id === id; }).sort(function (a, b) { return (parseDate(b.fecha) || 0) - (parseDate(a.fecha) || 0); });
    var timeline = acts.map(function (a) {
      return '<li class="tl tl--' + esc(a.tipo) + '"><div><b>' + esc(a.usuario || "—") + "</b> · <span>" + fmtDate(parseDate(a.fecha), true) + "</span></div><p>" + esc(a.texto).replace(/\n/g, "<br>") + "</p></li>";
    }).join("") || '<li class="crm-empty">Sin actividad todavía.</li>';
    var prod = productOf(l);
    var edOpts = state.ediciones.filter(function (e) { return !prod || e.experiencia === prod || e.id === l.edicion; }).map(function (e) {
      var st = seats(e); return '<option value="' + esc(e.id) + '"' + (e.id === l.edicion ? " selected" : "") + ">" + esc(edLabel(e)) + (st.plazas ? " (" + st.libres + " libres)" : "") + "</option>";
    }).join("");
    var tpls = PLANTILLAS.filter(function (t) { return !t.para || t.para.test(service(l) + " " + l.formulario); });
    var quotes = state.presupuestos.filter(function (q) { return q.lead_id === id; });
    var em = String(l.email || "").toLowerCase();
    var dups = state.leads.filter(function (x) { return x.id !== id && ((ph.length > 8 && phoneDigits(x.telefono) === ph) || (em && String(x.email || "").toLowerCase() === em)); });
    var next = parseDate(l.proxima_accion), gcal = "";
    if (next) {
      var d0 = ymd(next).replace(/-/g, ""), d1 = ymd(new Date(next.getTime() + 86400000)).replace(/-/g, "");
      gcal = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent("Deyscom · " + (l.nombre || "") + " · " + service(l)) +
        "&dates=" + d0 + "/" + d1 + "&details=" + encodeURIComponent("Tel: " + (l.telefono || "—") + "\nEmail: " + (l.email || "—") + "\nEstado: " + l.estado + "\n" + location.href.split("#")[0]);
    }
    var estOpts = ESTADOS.map(function (e) { return '<option' + (e === l.estado ? " selected" : "") + ">" + esc(e) + "</option>"; }).join("");
    $("#crm-drawer-body").innerHTML =
      '<div class="dw-head"><span class="' + estadoClass(l.estado) + '">' + esc(l.estado) + '</span><h2 id="crm-drawer-title">' + esc(l.nombre || "Sin nombre") + "</h2>" +
      '<p class="crm-muted">' + esc(service(l)) + " · recibido " + fmtDate(l._date, true) + "</p>" +
      '<div class="dw-actions">' +
      (l.telefono ? '<a class="cbtn cbtn--wa" href="' + esc(wa) + '" target="_blank" rel="noopener">WhatsApp</a><a class="cbtn" href="tel:' + esc("+" + ph) + '">Llamar</a>' : "") +
      (l.email ? '<a class="cbtn" href="mailto:' + esc(l.email) + "?subject=" + encodeURIComponent("Deyscom Motorsport · " + service(l)) + '">Email</a>' : "") +
      '<button class="cbtn" type="button" id="dw-quote">Presupuesto</button>' +
      (gcal ? '<a class="cbtn" href="' + esc(gcal) + '" target="_blank" rel="noopener">📅 Calendar</a>' : "") + "</div>" +
      (l.telefono && tpls.length ? '<div class="dw-tpl"><select class="cin" id="dw-tpl">' + tpls.map(function (t, i) { return '<option value="' + i + '">' + esc(t.n) + "</option>"; }).join("") +
        '</select><button class="cbtn cbtn--wa" type="button" id="dw-tpl-go">Enviar plantilla</button></div>' : "") +
      (tags(l).length ? '<div class="dw-tags">' + tags(l).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div>" : "") +
      (dups.length ? '<div class="dw-dups"><b>⚠️ Esta persona tiene ' + dups.length + (dups.length === 1 ? " solicitud más" : " solicitudes más") + ":</b> " +
        dups.map(function (x) { return '<button type="button" class="linkbtn" data-open="' + esc(x.id) + '">' + esc(service(x)) + " · " + fmtDate(x._date) + "</button>"; }).join(", ") + "</div>" : "") +
      "</div>" +
      '<form class="dw-form" id="dw-form"><div class="dw-grid">' +
      '<label>Estado<select name="estado">' + estOpts + "</select></label>" +
      '<label>Valor estimado (€)<input name="valor" inputmode="decimal" value="' + esc(l.valor) + '" placeholder="0"></label>' +
      '<label>Próxima acción<input name="proxima_accion" type="date" value="' + esc(ymd(parseDate(l.proxima_accion))) + '"></label>' +
      '<label>Responsable<input name="asignado" value="' + esc(l.asignado) + '" placeholder="¿Quién lo lleva?"></label>' +
      '<label>Nombre<input name="nombre" value="' + esc(l.nombre) + '"></label>' +
      '<label>Teléfono<input name="telefono" type="tel" value="' + esc(l.telefono) + '"></label>' +
      '<label class="dw-full">Email<input name="email" type="email" value="' + esc(l.email) + '"></label>' +
      (prod || l.edicion ? '<label class="dw-full">Edición (fecha y plazas)<select name="edicion"><option value="">Sin asignar</option>' + edOpts + "</select></label>" : "") +
      (isOrder(l) ? '<label class="dw-full">Estado del envío<select name="envio">' + ENVIOS.map(function (e) { return "<option" + (e === (l.envio || "Pendiente de pago") ? " selected" : "") + ">" + e + "</option>"; }).join("") + "</select></label>" : "") +
      '<label class="dw-full">Etiquetas (separadas por comas)<input name="etiquetas" list="crm-tags" value="' + esc(l.etiquetas) + '" placeholder="VIP, regalo, rally 2027…"></label>' +
      '</div><button class="cbtn cbtn--pink" type="submit">Guardar cambios</button></form>' +
      '<h3>Presupuestos</h3>' + (quotes.length ? '<ul class="dw-quotes">' + quotes.map(function (q) {
        return '<li><b>' + esc(q.numero) + "</b><span>" + fmtDate(parseDate(q.fecha)) + " · " + money2(num(q.total)) + '</span><select class="cin" data-qstatus="' + esc(q.numero) + '">' +
          ["Creado", "Enviado", "Aceptado", "Rechazado"].map(function (e) { return "<option" + (e === q.estado ? " selected" : "") + ">" + e + "</option>"; }).join("") +
          '</select><button class="cbtn cbtn--sm" type="button" data-qpdf="' + esc(q.numero) + '">PDF</button></li>';
      }).join("") + "</ul>" : '<p class="crm-muted">Aún no hay presupuestos. Créalo con el botón «Presupuesto».</p>') +
      '<h3>Solicitud</h3><dl class="dw-dl">' + (extra || '<div><dd class="crm-muted">Sin más datos.</dd></div>') + "</dl>" +
      '<h3>Notas y actividad</h3><form class="dw-note" id="dw-note"><textarea name="text" rows="3" placeholder="Ej. Llamado, le mando presupuesto el lunes…" required></textarea><button class="cbtn" type="submit">Añadir nota</button></form>' +
      '<ul class="dw-tl">' + timeline + "</ul>" +
      '<h3>Origen del lead</h3><dl class="dw-dl dw-dl--small">' + (originRows || '<div><dd class="crm-muted">Sin datos de origen.</dd></div>') + "</dl>" +
      (state.user.rol === "admin" ? '<button class="cbtn cbtn--danger" type="button" id="dw-delete">Borrar lead</button>' : "");
    d.classList.add("is-open"); $("#crm-overlay").classList.add("is-open"); d.setAttribute("aria-hidden", "false");
    d.scrollTop = 0;
    setTimeout(function () { $("#crm-drawer-close").focus(); }, 50);

    $("#dw-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = {}; new FormData(this).forEach(function (v, k) { f[k] = String(v).trim(); });
      var cur = byId(id), changed = {};
      Object.keys(f).forEach(function (k) { var old = k === "proxima_accion" ? ymd(parseDate(cur[k])) : String(cur[k] || ""); if (old !== f[k]) changed[k] = f[k]; });
      if (!Object.keys(changed).length) { toast("No hay cambios que guardar"); return; }
      saveFields(id, changed, "Cambios guardados");
    });
    $("#dw-note").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var text = this.elements.text.value.trim(); if (!text) return;
      var btn = $("button", this); btn.disabled = true;
      api("note", { id: id, text: text }).then(function (res) {
        state.activity.push(res.activity || { lead_id: id, fecha: new Date().toISOString(), usuario: state.user.nombre, tipo: "nota", texto: text });
        toast("Nota añadida"); openDrawer(id);
      }).catch(function (e) { toast(e.message, true); btn.disabled = false; });
    });
    $("#dw-quote").addEventListener("click", function () { openQuote(id); });
    var tg = $("#dw-tpl-go");
    if (tg) tg.addEventListener("click", function () {
      var t = tpls[+$("#dw-tpl").value]; var e = edById(l.edicion);
      var txt = t.t.replace(/\{nombre\}/g, (l.nombre || "").split(" ")[0]).replace(/\{servicio\}/g, service(l))
        .replace(/\{yo\}/g, (state.user.nombre || "el equipo").split(" ")[0]).replace(/\{edicion\}/g, e ? " (" + edWhen(e) + ")" : "")
        .replace(/\{resena\}/g, CFG.googleReview ? " " + CFG.googleReview : "").replace(/\{pago\}/g, payUrl(e, l) || "(te lo enviamos ahora)");
      window.open("https://wa.me/" + ph + "?text=" + encodeURIComponent(txt), "_blank", "noopener");
      api("note", { id: id, text: "WhatsApp enviado · plantilla «" + t.n + "»" }).then(function (res) { state.activity.push(res.activity); if (state.openId === id) openDrawer(id); }).catch(function () {});
    });
    $$("[data-qstatus]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var n = sel.getAttribute("data-qstatus"), est = sel.value;
        api("quoteStatus", { numero: n, estado: est }).then(function () { toast("Presupuesto " + n + ": " + est); return load(); }).then(function () { if (state.openId === id) openDrawer(id); })
          .catch(function (e) { toast(e.message, true); });
      });
    });
    $$("[data-qpdf]").forEach(function (b) { b.addEventListener("click", function () { quotePdf(b.getAttribute("data-qpdf")); }); });
    var del = $("#dw-delete");
    if (del) del.addEventListener("click", function () {
      if (!confirm("¿Borrar este lead definitivamente? Esta acción no se puede deshacer.")) return;
      api("delete", { id: id }).then(function () { toast("Lead borrado"); closeDrawer(); load(); }).catch(function (e) { toast(e.message, true); });
    });
  }

  function saveFields(id, fields, okMsg) {
    var l = byId(id); if (!l) return;
    var prev = {}; Object.keys(fields).forEach(function (k) { prev[k] = l[k]; l[k] = fields[k]; });
    if (fields.estado && prev.estado !== fields.estado) state.activity.push({ lead_id: id, fecha: new Date().toISOString(), usuario: state.user.nombre, tipo: "estado", texto: "Estado: " + prev.estado + " → " + fields.estado });
    render(); if (state.openId === id) openDrawer(id);
    api("update", { id: id, fields: fields }).then(function () { toast(okMsg || "Guardado"); })
      .catch(function (e) { Object.keys(prev).forEach(function (k) { l[k] = prev[k]; }); render(); if (state.openId === id) openDrawer(id); toast(e.message, true); });
  }

  /* ---------------- calendario de fechas (se editan en el panel /admin) ---------------- */
  function edTitle(e) { return (e.nombre || PRODUCTOS[e.experiencia] || e.experiencia || "") + " · " + edWhen(e); }
  function edWhen(e) {
    var d = parseDate(e.fecha);
    return (d ? d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }) : e.fecha) + (e.turno ? " · " + e.turno : "") + (e.horario ? " (" + e.horario + ")" : "");
  }
  function payUrl(e, l) {
    if (!e || !e.stripe) return "";
    var u = e.stripe + (e.stripe.indexOf("?") > -1 ? "&" : "?") + "client_reference_id=" + encodeURIComponent(l.id);
    if (l.email) u += "&prefilled_email=" + encodeURIComponent(l.email);
    return u;
  }
  function edPaid(id) { return state.leads.filter(function (l) { return l.edicion === id && l.estado === "Ganado"; }); }
  function edPending(id) { return state.leads.filter(function (l) { return l.edicion === id && ["Ganado", "Perdido"].indexOf(l.estado) === -1; }); }
  function renderCalendar() {
    var today = ymd(new Date());
    var future = state.ediciones.filter(function (e) { return e.fecha >= today; });
    var past = state.ediciones.filter(function (e) { return e.fecha < today; }).reverse();
    var card = function (e) {
      var st = seats(e), pct = st.plazas ? Math.min(100, st.ocupadas / st.plazas * 100) : 0;
      var full = st.libres === 0 || e.estado === "Completa", pend = edPending(e.id).length;
      var d = parseDate(e.fecha);
      return '<button type="button" class="ed-card' + (full ? " is-full" : "") + (e.estado === "Cancelada" || e.visible === false ? " is-off" : "") + '" data-ed="' + esc(e.id) + '">' +
        '<span class="ed-card__date"><b>' + (d ? d.getDate() : "?") + "</b>" + (d ? d.toLocaleString("es-ES", { month: "short" }) : "") + "</span>" +
        '<span class="ed-card__body"><b>' + esc(e.nombre || PRODUCTOS[e.experiencia]) + "</b><small>" + esc((e.turno ? "Turno de " + e.turno.toLowerCase() : "") + (e.lugar ? " · " + e.lugar : "")) + (e.precio ? " · " + money(e.precio) : "") + "</small>" +
        (st.plazas ? '<span class="ed-bar"><i style="width:' + pct + '%"></i></span><small>' + st.ocupadas + " de " + st.plazas + " plazas vendidas" + (full ? " · <b class=\"pink\">COMPLETA</b>" : " · quedan " + st.libres) + "</small>"
          : "<small>" + st.ocupadas + " plazas vendidas</small>") +
        (pend ? '<small class="ed-pend">' + pend + (pend === 1 ? " reserva sin pagar" : " reservas sin pagar") + "</small>" : "") +
        (!e.stripe ? '<small class="ed-warn">⚠️ Falta el enlace de pago de Stripe</small>' : "") +
        '</span><span class="st st--' + (e.estado === "Completa" || full ? 0 : e.estado === "Cancelada" ? 5 : 4) + '">' + esc(full ? "Completa" : e.estado || "Abierta") + "</span></button>";
    };
    var months = {};
    future.forEach(function (e) { var d = parseDate(e.fecha); var k = d ? d.toLocaleString("es-ES", { month: "long", year: "numeric" }) : "Sin fecha"; (months[k] = months[k] || []).push(e); });
    $("#crm-cal").innerHTML = (Object.keys(months).length ? Object.keys(months).map(function (k) {
      return '<section class="ed-month"><h2>' + esc(k) + '</h2><div class="ed-list">' + months[k].map(card).join("") + "</div></section>";
    }).join("") : '<div class="crm-box"><p class="crm-empty">No hay fechas programadas. Créalas en el panel de contenido (Experiencias → Fechas y plazas): aparecerán aquí y en la web.</p></div>') +
      (past.length ? '<details class="ed-past"><summary>Fechas pasadas (' + past.length + ")</summary><div class=\"ed-list\">" + past.map(card).join("") + "</div></details>" : "");
  }
  var edDlg = $("#crm-ed");
  function personList(list, empty, withPay, e) {
    if (!list.length) return '<p class="crm-muted">' + empty + "</p>";
    return '<ul class="crm-list">' + list.map(function (l) {
      return '<li><button type="button" data-open="' + esc(l.id) + '"><span class="' + estadoClass(l.estado) + '">' + esc(l.estado) + "</span><b>" + esc(l.nombre) + "</b><small>" +
        esc(l.telefono) + (l.email ? " · " + esc(l.email) : "") + (parseInt(l.plazas, 10) > 1 ? " · " + esc(l.plazas) + " plazas" : "") + (withPay && l.valor ? " · " + money2(num(l.valor)) : "") + "</small></button></li>";
    }).join("") + "</ul>";
  }
  function openEdition(id) {
    var e = edById(id); if (!e) return;
    var st = seats(e), paid = edPaid(id), pend = edPending(id);
    $("#crm-ed-title").textContent = e.nombre || PRODUCTOS[e.experiencia];
    $("#crm-ed-sub").textContent = edWhen(e) + (e.lugar ? " · " + e.lugar : "") + " · " + money(e.precio);
    var income = paid.reduce(function (t, l) { return t + num(l.valor); }, 0);
    $("#crm-ed-ins").innerHTML =
      '<div class="crm-kpis crm-kpis--4 ed-kpis"><div class="kpi"><span>Vendidas</span><b>' + st.ocupadas + (st.plazas ? " / " + st.plazas : "") + '</b></div><div class="kpi"><span>Libres</span><b>' + (st.libres === null ? "—" : st.libres) +
      '</b></div><div class="kpi"><span>Ingresos</span><b>' + money(income) + '</b></div><div class="kpi' + (pend.length ? " kpi--hot" : "") + '"><span>Sin pagar</span><b>' + pend.length + "</b></div></div>" +
      (e.stripe ? '<p class="ed-link"><span class="crm-muted">Enlace de pago:</span> <a href="' + esc(e.stripe) + '" target="_blank" rel="noopener">' + esc(e.stripe) + '</a> <button type="button" class="cbtn cbtn--sm" data-copy="' + esc(e.stripe) + '">Copiar</button></p>'
        : '<p class="ed-warn">⚠️ Esta fecha aún no tiene enlace de pago de Stripe. Añádelo en el panel de contenido para que se pueda pagar desde la web.</p>') +
      "<h3>Plazas pagadas (" + paid.length + ")</h3>" + personList(paid, "Todavía no hay plazas pagadas.", true, e) +
      "<h3>Reservas sin pagar (" + pend.length + ")</h3>" + personList(pend, "Nadie pendiente de pago.", false, e);
    showDlg(edDlg);
  }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("[data-ed]"); if (b) { openEdition(b.getAttribute("data-ed")); return; }
    var o = ev.target.closest && ev.target.closest("#crm-ed [data-open]"); if (o) hideDlg(edDlg);
    var c = ev.target.closest && ev.target.closest("[data-copy]");
    if (c) { var t = c.getAttribute("data-copy"); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast("Enlace copiado"); }, function () { window.prompt("Copia el enlace:", t); }); }
  });
  $("#crm-ed-cancel").addEventListener("click", function () { hideDlg(edDlg); });

  /* ---------------- ventas (Stripe) ---------------- */
  function renderSales() {
    var sales = state.ventas.slice().sort(function (a, b) { return (parseDate(b.fecha) || 0) - (parseDate(a.fecha) || 0); });
    var total = sales.reduce(function (t, v) { return t + num(v.importe); }, 0);
    var seatsSold = sales.reduce(function (t, v) { return t + (parseInt(v.plazas, 10) || 1); }, 0);
    var future = state.ediciones.filter(function (e) { return e.fecha >= ymd(new Date()) && e.estado !== "Cancelada"; });
    var cap = future.reduce(function (t, e) { return t + (parseInt(e.plazas, 10) || 0); }, 0);
    var sold = future.reduce(function (t, e) { return t + seats(e).ocupadas; }, 0);
    var pend = state.leads.filter(function (l) { return l.edicion && ["Ganado", "Perdido"].indexOf(l.estado) === -1; });
    $("#crm-sales-kpis").innerHTML = [["Ingresos", money(total), sales.length + (sales.length === 1 ? " venta" : " ventas")], ["Plazas vendidas", seatsSold, "en Stripe"],
      ["Ocupación", cap ? Math.round(sold / cap * 100) + "%" : "—", sold + " de " + cap + " plazas de las próximas fechas"], ["Sin pagar", pend.length, "reservas pendientes de pago", pend.length ? "hot" : ""]].map(function (k) {
      return '<div class="kpi' + (k[3] ? " kpi--" + k[3] : "") + '"><span>' + k[0] + "</span><b>" + esc(k[1]) + "</b><small>" + esc(k[2]) + "</small></div>";
    }).join("");
    $("#crm-sales-eds").innerHTML = future.length ? '<ul class="crm-bars">' + future.map(function (e) {
      var st = seats(e), pct = st.plazas ? st.ocupadas / st.plazas * 100 : 0;
      return '<li><span class="crm-bars__lbl" title="' + esc(edTitle(e)) + '">' + esc((e.nombre || "").replace("Experiencia ", "") + " · " + (parseDate(e.fecha) ? parseDate(e.fecha).getDate() : "") + " dic · " + (e.turno || "")) +
        '</span><span class="crm-bars__track"><i style="width:' + Math.max(2, pct) + '%"></i></span><b>' + st.ocupadas + "/" + (st.plazas || "∞") + "</b><small>" + Math.round(pct) + "%</small></li>";
    }).join("") + "</ul>" : '<p class="crm-empty">No hay fechas próximas.</p>';
    $("#crm-sales tbody").innerHTML = sales.map(function (v) {
      return '<tr' + (v.lead_id ? ' data-open="' + esc(v.lead_id) + '" tabindex="0"' : "") + '><td data-l="Fecha"><span class="crm-muted">' + fmtDate(parseDate(v.fecha), true) + '</span></td><td data-l="Cliente"><b>' + esc(v.cliente) + "</b><br><span class=\"crm-muted\">" + esc(v.email) + "</span></td>" +
        '<td data-l="Experiencia">' + esc(v.experiencia) + '<br><span class="crm-muted">' + esc(v.fecha_edicion) + '</span></td><td data-l="Plazas">' + esc(v.plazas) + '</td><td data-l="Importe"><b>' + money2(num(v.importe)) + "</b></td></tr>";
    }).join("") || '<tr><td colspan="5" class="crm-empty">' + (state.stripe || state.demo ? "Todavía no hay ventas." : "Conecta Stripe (README → Ventas con Stripe) para ver aquí los pagos.") + "</td></tr>";
    $("#crm-pending tbody").innerHTML = pend.map(function (l) {
      var e = edById(l.edicion);
      return '<tr data-open="' + esc(l.id) + '" tabindex="0"><td data-l="Fecha"><span class="crm-muted">' + fmtDate(l._date, true) + '</span></td><td data-l="Nombre"><b>' + esc(l.nombre) + '</b></td><td data-l="Contacto">' + esc(l.telefono) + "<br><span class=\"crm-muted\">" + esc(l.email) + "</span></td>" +
        '<td data-l="Experiencia">' + esc(e ? edTitle(e) : l.servicio) + '</td><td data-l="Estado"><span class="' + estadoClass(l.estado) + '">' + esc(l.estado) + "</span></td></tr>";
    }).join("") || '<tr><td colspan="5" class="crm-empty">Nadie pendiente de pago.</td></tr>';
    $("#crm-stripe-status").textContent = state.demo ? "Modo demostración: ventas de ejemplo." : state.stripe ? "Pagos de Stripe de las experiencias. Se sincronizan solos cada 15 minutos." : "Stripe aún no está conectado: añade la clave en el Apps Script (README → Ventas con Stripe).";
  }
  $("#crm-sync-stripe").addEventListener("click", function () {
    var b = this; b.disabled = true;
    api("syncStripe").then(function (res) { toast(res.nuevas ? res.nuevas + (res.nuevas === 1 ? " venta nueva" : " ventas nuevas") : "Todo al día: no hay ventas nuevas"); return load(); })
      .catch(function (e) { toast(e.message, true); }).then(function () { b.disabled = false; });
  });

  /* ---------------- pedidos de la tienda ---------------- */
  function renderOrders() {
    var list = state.leads.filter(isOrder);
    var live = list.filter(function (l) { return (l.envio || "Pendiente de pago") !== "Cancelado"; });
    var pend = live.filter(function (l) { return (l.envio || "Pendiente de pago") !== "Entregado"; });
    var total = live.reduce(function (t, l) { return t + num(l.total); }, 0);
    $("#crm-orders-kpis").innerHTML = [["Pedidos", list.length, "en total"], ["Por servir", pend.length, "pendientes de enviar o entregar", pend.length ? "hot" : ""],
      ["Ingresos", money(total), "sin contar cancelados"], ["Ticket medio", money(live.length ? total / live.length : 0), "por pedido"]].map(function (k) {
      return '<div class="kpi' + (k[3] ? " kpi--" + k[3] : "") + '"><span>' + k[0] + "</span><b>" + esc(k[1]) + "</b><small>" + k[2] + "</small></div>";
    }).join("");
    $("#crm-orders tbody").innerHTML = list.map(function (l) {
      var env = l.envio || "Pendiente de pago";
      return '<tr data-open="' + esc(l.id) + '" tabindex="0"><td data-l="Fecha"><span class="crm-muted">' + fmtDate(l._date, true) + '</span></td><td data-l="Cliente"><b>' + esc(l.nombre) + "</b><br><span class=\"crm-muted\">" + esc(l.telefono) + "</span></td>" +
        '<td data-l="Producto">' + esc(l.producto || l.servicio) + '</td><td data-l="Detalle">' + esc([l.color, l.talla, l.cantidad ? "x" + l.cantidad : ""].filter(Boolean).join(" · ")) + "</td>" +
        '<td data-l="Total"><b>' + (l.total ? money(num(l.total)) : "—") + '</b></td><td data-l="Entrega">' + esc(l.entrega || "—") + "</td>" +
        '<td data-l="Envío"><select class="cin cin--sm env env--' + ENVIOS.indexOf(env) + '" data-envio="' + esc(l.id) + '" aria-label="Estado del envío">' +
        ENVIOS.map(function (e) { return "<option" + (e === env ? " selected" : "") + ">" + e + "</option>"; }).join("") + "</select></td></tr>";
    }).join("") || '<tr><td colspan="7" class="crm-empty">Todavía no hay pedidos de la tienda.</td></tr>';
  }
  document.addEventListener("change", function (e) {
    var sel = e.target.closest && e.target.closest("[data-envio]"); if (!sel) return;
    var id = sel.getAttribute("data-envio"), upd = { envio: sel.value };
    var l = byId(id);
    if (sel.value === "Entregado" && l && l.estado !== "Ganado") upd.estado = "Ganado";
    if (sel.value === "Cancelado" && l) upd.estado = "Perdido";
    saveFields(id, upd, "Envío: " + sel.value);
  });

  /* ---------------- presupuestos ---------------- */
  var qDlg = $("#crm-quote");
  function qLine(c, n, p) {
    var tr = document.createElement("div"); tr.className = "q-line";
    tr.innerHTML = '<input class="cin" name="concepto" placeholder="Concepto (p. ej. Pintura completa en cabina)" value="' + esc(c || "") + '">' +
      '<input class="cin" name="cantidad" type="number" min="0" step="0.5" value="' + esc(n || 1) + '" aria-label="Cantidad">' +
      '<input class="cin" name="precio" type="number" min="0" step="0.01" value="' + esc(p || "") + '" placeholder="Precio €" aria-label="Precio sin IVA">' +
      '<button type="button" class="cbtn cbtn--sm cbtn--ghost" data-qdel aria-label="Quitar línea">✕</button>';
    $("#q-lines").appendChild(tr);
  }
  function qTotals() {
    var base = 0;
    $$(".q-line").forEach(function (r) { base += (parseFloat($("[name=cantidad]", r).value) || 0) * (parseFloat($("[name=precio]", r).value) || 0); });
    var iva = base * (parseFloat($("#q-iva").value) || 0) / 100;
    $("#q-totals").innerHTML = "Base " + money2(base) + " · IVA " + money2(iva) + " · <b>Total " + money2(base + iva) + "</b>";
    return { base: base, iva: iva, total: base + iva };
  }
  function openQuote(id) {
    var l = byId(id); if (!l) return;
    state.quoteLead = id;
    $("#q-lines").innerHTML = "";
    qLine(service(l) + (l.vehiculo ? " · " + l.vehiculo : ""), 1, num(l.valor) ? (num(l.valor) / 1.21).toFixed(2) : "");
    $("#q-email").value = l.email || ""; $("#q-notas").value = ""; $("#q-send").checked = !!l.email; $("#q-iva").value = "21"; $("#q-validez").value = "30";
    $("#q-for").textContent = (l.nombre || "") + " · " + service(l);
    qTotals(); showDlg(qDlg);
  }
  $("#q-add").addEventListener("click", function () { qLine("", 1, ""); });
  $("#crm-quote").addEventListener("input", qTotals);
  $("#crm-quote").addEventListener("click", function (e) { var b = e.target.closest("[data-qdel]"); if (b && $$(".q-line").length > 1) { b.parentNode.remove(); qTotals(); } });
  $("#q-cancel").addEventListener("click", function () { hideDlg(qDlg); });
  $("#crm-quote-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var lineas = $$(".q-line").map(function (r) { return { concepto: $("[name=concepto]", r).value.trim(), cantidad: parseFloat($("[name=cantidad]", r).value) || 0, precio: parseFloat($("[name=precio]", r).value) || 0 }; })
      .filter(function (x) { return x.concepto && x.cantidad; });
    if (!lineas.length) { toast("Añade al menos una línea con concepto", true); return; }
    var btn = $("button[type=submit]", this); btn.disabled = true; btn.classList.add("is-loading");
    var id = state.quoteLead;
    api("quote", { lead_id: id, lineas: lineas, iva: $("#q-iva").value, validez: $("#q-validez").value, notas: $("#q-notas").value, email: $("#q-email").value.trim(), enviar: $("#q-send").checked })
      .then(function (res) {
        hideDlg(qDlg);
        toast("Presupuesto " + res.numero + (res.sent ? " creado y enviado por email" : " creado"));
        if (res.pdf) download(b64ToBlob(res.pdf, "application/pdf"), "Presupuesto " + res.numero + ".pdf");
        else if (res.html) printHtml(res.html);
        return load().then(function () { openDrawer(id); });
      })
      .catch(function (e) { toast(e.message, true); })
      .then(function () { btn.disabled = false; btn.classList.remove("is-loading"); });
  });
  function quotePdf(numero) {
    api("quotePdf", { numero: numero }).then(function (res) {
      if (res.pdf) download(b64ToBlob(res.pdf, "application/pdf"), "Presupuesto " + numero + ".pdf"); else if (res.html) printHtml(res.html);
    }).catch(function (e) { toast(e.message, true); });
  }
  function printHtml(html) {
    var w = window.open("", "_blank");
    if (!w) { toast("Permite las ventanas emergentes para ver el presupuesto", true); return; }
    w.document.write(html); w.document.close(); setTimeout(function () { w.print(); }, 400);
  }

  /* ---------------- nuevo lead ---------------- */
  var dlg = $("#crm-new");
  $$("[data-new-lead]").forEach(function (b) { b.addEventListener("click", function () { $("#crm-new-form").reset(); dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", ""); }); });
  $("#crm-new-cancel").addEventListener("click", function () { dlg.close ? dlg.close() : dlg.removeAttribute("open"); });
  $("#crm-new-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = {}; new FormData(this).forEach(function (v, k) { if (String(v).trim()) f[k] = String(v).trim(); });
    var btn = $("button[type=submit]", this); btn.disabled = true;
    api("create", { fields: f }).then(function (res) {
      dlg.close ? dlg.close() : dlg.removeAttribute("open");
      toast("Lead creado");
      return load().then(function () { openDrawer(res.id); });
    }).catch(function (e) { toast(e.message, true); }).then(function () { btn.disabled = false; });
  });

  /* ---------------- exportar CSV ---------------- */
  $("#crm-export").addEventListener("click", function () {
    var list = filtered();
    var cols = ["fecha", "nombre", "telefono", "email", "servicio", "estado", "valor", "proxima_accion", "asignado", "vehiculo", "presupuesto", "mensaje", "origen"];
    var cell = function (v) { var t = String(v === undefined ? "" : v); if (/^[=+\-@]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"'; };
    var csv = "﻿" + cols.join(";") + "\n" + list.map(function (l) {
      return cols.map(function (c) { return cell(c === "origen" ? origin(l) : c === "fecha" ? fmtDate(l._date, true) : l[c]); }).join(";");
    }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "leads-deyscom-" + ymd(new Date()) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------------- usuarios y cuenta ---------------- */
  function loadUsers() {
    api("users").then(function (res) {
      $("#crm-users").innerHTML = res.users.map(function (u) {
        return '<tr><td data-l="Nombre"><b>' + esc(u.nombre) + '</b></td><td data-l="Email">' + esc(u.email) + '</td><td data-l="Rol">' + (u.rol === "admin" ? "Administrador" : "Cliente") +
          '</td><td data-l="Estado">' + (u.activo ? "Activo" : "Desactivado") + '</td><td><button class="cbtn cbtn--sm" type="button" data-reset="' + esc(u.email) + '" data-nombre="' + esc(u.nombre) + '" data-rol="' + esc(u.rol) + '">Nueva contraseña</button></td></tr>';
      }).join("");
    }).catch(function (e) { toast(e.message, true); });
  }
  function showPassword(email, pass) {
    $("#crm-newpass").hidden = false;
    $("#crm-newpass").innerHTML = "<b>Contraseña para " + esc(email) + ":</b> <code>" + esc(pass) + "</code><small>Cópiala ahora: no se vuelve a mostrar. Envíasela por un canal privado.</small>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-reset]"); if (!b) return;
    var email = b.getAttribute("data-reset");
    if (!confirm("¿Generar una contraseña nueva para " + email + "? La anterior dejará de funcionar.")) return;
    api("resetUser", { email: email, nombre: b.getAttribute("data-nombre"), rol: b.getAttribute("data-rol") }).then(function (res) { showPassword(res.email, res.password); }).catch(function (er) { toast(er.message, true); });
  });
  $("#crm-user-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = this;
    api("resetUser", { email: f.elements.email.value, nombre: f.elements.nombre.value, rol: f.elements.rol.value })
      .then(function (res) { showPassword(res.email, res.password); f.reset(); loadUsers(); }).catch(function (er) { toast(er.message, true); });
  });
  $("#crm-pass-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = this;
    if (f.elements.next.value !== f.elements.repeat.value) { toast("Las contraseñas nuevas no coinciden", true); return; }
    api("password", { current: f.elements.current.value, next: f.elements.next.value }).then(function () { toast("Contraseña cambiada"); f.reset(); }).catch(function (er) { toast(er.message, true); });
  });
  $("#crm-digest").addEventListener("click", function () {
    api("digest").then(function (res) { toast(state.demo ? "En la demo no se envían emails" : res.sent ? "Resumen enviado a los usuarios" : "No había nada que enviar"); }).catch(function (e) { toast(e.message, true); });
  });
  $("#crm-demo-reset").addEventListener("click", function () { store("dm_crm_demo2", null); demoMem = null; load(); toast("Datos de ejemplo reiniciados"); });

  /* ---------------- arranque ---------------- */
  var savedToken = read("dm_crm_token"), savedUser = read("dm_crm_user");
  if (ENDPOINT && savedToken && savedUser) {
    try { state.token = savedToken; state.user = JSON.parse(savedUser); showApp(); } catch (e) { logout(true); }
  }
  setView("panel");
  // refresco automático cada 2 minutos mientras la pestaña está visible
  setInterval(function () { if (state.user && !document.hidden && !state.openId) load(); }, 120000);
})();
