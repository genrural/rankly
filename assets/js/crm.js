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
    "utm_term", "utm_content", "gclid", "fbclid", "estado", "valor", "proxima_accion", "asignado", "actualizado", "consentimiento", "nombre", "telefono", "email"];
  var LABELS = { servicio: "Servicio", vehiculo: "Vehículo", anio: "Año", presupuesto: "Presupuesto", plazo: "Plazo", mensaje: "Mensaje",
    coche: "Coche", licencia: "Licencia", experiencia_previa: "Experiencia", regalo: "Regalo", fecha_preferida: "Fecha preferida",
    plazas: "Plazas", prueba: "Prueba", interes: "Interés", uso: "Uso", producto: "Producto", talla: "Talla", color: "Color",
    cantidad: "Cantidad", total: "Total", entrega: "Entrega", direccion: "Dirección" };

  var state = { token: null, user: null, leads: [], activity: [], view: "panel", filters: { q: "", estado: "", servicio: "", origen: "", periodo: "" }, openId: null, demo: false };

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
  function num(v) { var n = parseFloat(String(v || "").replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")); return isNaN(n) ? 0 : n; }
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
      ["DS Pilot Weekend – Rally", "ds-pilot-weekend-rally", "", ""], ["DS Copilot Course", "ds-copilot-course", "", ""],
      ["Alquiler de coche de rally", "alquiler-coche-de-rally", "", ""], ["DS Pilot Weekend – Circuit", "ds-pilot-weekend-circuit", "", ""],
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
    return { leads: leads, activity: act };
  }
  var demoMem = null;
  function demoDb() {
    if (demoMem) return demoMem;
    var raw = read("dm_crm_demo");
    if (raw) { try { demoMem = JSON.parse(raw); return demoMem; } catch (e) { /* reinicia */ } }
    demoMem = demoSeed(); store("dm_crm_demo", JSON.stringify(demoMem)); return demoMem;
  }
  function demoApi(action, p) {
    var db = demoDb();
    var save = function () { store("dm_crm_demo", JSON.stringify(db)); };
    var user = state.user || { email: "demo@deyscom.com", nombre: "Modo demo", rol: "admin" };
    var log = function (id, tipo, texto) { var a = { lead_id: id, fecha: new Date().toISOString(), usuario: user.nombre, tipo: tipo, texto: texto }; db.activity.push(a); return a; };
    var find = function (id) { return db.leads.filter(function (l) { return l.id === id; })[0]; };
    switch (action) {
      case "login": return { ok: true, token: "demo", user: user };
      case "logout": return { ok: true };
      case "leads": return { ok: true, user: user, estados: ESTADOS, leads: db.leads, activity: db.activity };
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
      fillFilters(); render();
      $("#crm-sync").textContent = "Actualizado " + new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    }).catch(function (e) { toast(e.message, true); }).then(function () { busy(false); });
  }
  function setView(v) {
    state.view = v;
    $$("[data-view]").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-view") === v); if (b.getAttribute("data-view") === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    $$(".crm-view").forEach(function (s) { s.hidden = s.id !== "view-" + v; });
    $("#crm-title").textContent = { panel: "Panel", leads: "Leads", pipeline: "Pipeline", usuarios: "Usuarios", cuenta: "Mi cuenta" }[v];
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
  }
  ["q", "estado", "servicio", "origen", "periodo"].forEach(function (k) {
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
      if (q) {
        var hay = [l.nombre, l.telefono, l.email, l.servicio, l.vehiculo, l.mensaje, l.asignado].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* ---------------- render ---------------- */
  function render() {
    if (!state.user) return;
    if (state.view === "panel") renderPanel();
    if (state.view === "leads") renderLeads();
    if (state.view === "pipeline") renderPipeline();
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
    if (t && !e.target.closest("a")) openDrawer(t.getAttribute("data-open"));
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
    var estOpts = ESTADOS.map(function (e) { return '<option' + (e === l.estado ? " selected" : "") + ">" + esc(e) + "</option>"; }).join("");
    $("#crm-drawer-body").innerHTML =
      '<div class="dw-head"><span class="' + estadoClass(l.estado) + '">' + esc(l.estado) + '</span><h2 id="crm-drawer-title">' + esc(l.nombre || "Sin nombre") + "</h2>" +
      '<p class="crm-muted">' + esc(service(l)) + " · recibido " + fmtDate(l._date, true) + "</p>" +
      '<div class="dw-actions">' +
      (l.telefono ? '<a class="cbtn cbtn--wa" href="' + esc(wa) + '" target="_blank" rel="noopener">WhatsApp</a><a class="cbtn" href="tel:' + esc("+" + ph) + '">Llamar</a>' : "") +
      (l.email ? '<a class="cbtn" href="mailto:' + esc(l.email) + "?subject=" + encodeURIComponent("Deyscom Motorsport · " + service(l)) + '">Email</a>' : "") + "</div></div>" +
      '<form class="dw-form" id="dw-form"><div class="dw-grid">' +
      '<label>Estado<select name="estado">' + estOpts + "</select></label>" +
      '<label>Valor estimado (€)<input name="valor" inputmode="decimal" value="' + esc(l.valor) + '" placeholder="0"></label>' +
      '<label>Próxima acción<input name="proxima_accion" type="date" value="' + esc(ymd(parseDate(l.proxima_accion))) + '"></label>' +
      '<label>Responsable<input name="asignado" value="' + esc(l.asignado) + '" placeholder="¿Quién lo lleva?"></label>' +
      '<label>Nombre<input name="nombre" value="' + esc(l.nombre) + '"></label>' +
      '<label>Teléfono<input name="telefono" type="tel" value="' + esc(l.telefono) + '"></label>' +
      '<label class="dw-full">Email<input name="email" type="email" value="' + esc(l.email) + '"></label>' +
      '</div><button class="cbtn cbtn--pink" type="submit">Guardar cambios</button></form>' +
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
  $("#crm-demo-reset").addEventListener("click", function () { store("dm_crm_demo", null); demoMem = null; load(); toast("Datos de ejemplo reiniciados"); });

  /* ---------------- arranque ---------------- */
  var savedToken = read("dm_crm_token"), savedUser = read("dm_crm_user");
  if (ENDPOINT && savedToken && savedUser) {
    try { state.token = savedToken; state.user = JSON.parse(savedUser); showApp(); } catch (e) { logout(true); }
  }
  setView("panel");
  // refresco automático cada 2 minutos mientras la pestaña está visible
  setInterval(function () { if (state.user && !document.hidden && !state.openId) load(); }, 120000);
})();
