/* =========================================================
   AX RALLY CHALLENGE · Deyscom Motorsport
   Juego de carreras pseudo-3D con el Citroën AX de Deyscom.
   - Tierra o asfalto, circuitos y tramos más conocidos del mundo.
   - Monedas, logros, mejoras del garaje y ranking general (Google Sheets).
   Las reglas de puntos deben coincidir con google-apps-script/Code.gs (GAME).
   ========================================================= */
(function () {
  "use strict";
  var root = document.querySelector("[data-axgame]");
  if (!root) return;
  var CFG = window.DEYSCOM || {};
  var ENDPOINT = CFG.SHEETS_ENDPOINT || "";
  var RULES = { MAX_COINS: 60, PAR: 85, COIN_POINTS: 100, TIME_POINTS: 60, DIRT_BONUS: 1.1 };
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || root).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); };
  var track = function (ev, data) { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: ev }, data || {})); if (window.gtag) window.gtag("event", ev, data || {}); } catch (e) { /* nada */ } };

  /* ---------------- datos guardados en este navegador ---------------- */
  var KEY = "dmx_ax";
  var save = { coins: 0, played: 0, best: {}, runs: [], ach: [], circuits: [], player: null, skin: {} };
  try { save = Object.assign(save, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* nada */ }
  var persist = function () { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* nada */ } };

  /* ---------------- circuitos ---------------- */
  var THEMES = {
    city:     { sky: ["#5aa9e6", "#cfe8ff"], fog: "#cfe8ff", grass: ["#9aa0a6", "#8f959b"], hills: "#7f8c99", props: ["building", "palm", "building"] },
    forest:   { sky: ["#6f9fc9", "#d7e6ef"], fog: "#d7e6ef", grass: ["#2f7d32", "#2a7130"], hills: "#3e6b48", props: ["pine", "pine", "tree"] },
    park:     { sky: ["#64a8e8", "#d9ecff"], fog: "#d9ecff", grass: ["#4c9a2a", "#448c25"], hills: "#5c8f4a", props: ["tree", "tree", "pine"] },
    country:  { sky: ["#7cb2e3", "#e8f2fb"], fog: "#e8f2fb", grass: ["#7aa63a", "#6f9934"], hills: "#8aa860", props: ["tree", "bush", "tree"] },
    japan:    { sky: ["#8ab6e8", "#fde7f0"], fog: "#fde7f0", grass: ["#5f9d45", "#56903e"], hills: "#7c9c7a", props: ["sakura", "tree", "sakura"] },
    tropical: { sky: ["#3e9be0", "#c9ecff"], fog: "#c9ecff", grass: ["#3f9b3a", "#368c33"], hills: "#3f7f55", props: ["palm", "tree", "palm"] },
    spain:    { sky: ["#4f9fe4", "#fff1d6"], fog: "#fff1d6", grass: ["#c8b26a", "#bca660"], hills: "#b48d5c", props: ["olive", "bush", "olive"] },
    golden:   { sky: ["#6aaee6", "#ffeccc"], fog: "#ffeccc", grass: ["#d1a85a", "#c69c50"], hills: "#a8814a", props: ["oak", "bush", "oak"] },
    aus:      { sky: ["#3f95dc", "#e3f1ff"], fog: "#e3f1ff", grass: ["#8ea64a", "#839a43"], hills: "#6f8a54", props: ["gum", "bush", "gum"] },
    nordic:   { sky: ["#7fb0dc", "#eef5fb"], fog: "#eef5fb", grass: ["#3d7a3f", "#376f39"], hills: "#4a6a58", props: ["pine", "pine", "rock"] },
    snow:     { sky: ["#0d1630", "#3a4b78"], fog: "#3a4b78", grass: ["#e9eef5", "#dde4ee"], hills: "#9fb0c9", props: ["snowpine", "snowpine", "rock"], night: true },
    savanna:  { sky: ["#f2a65a", "#ffe2b0"], fog: "#ffe2b0", grass: ["#c98c4a", "#bf8244"], hills: "#9a6a3a", props: ["acacia", "bush", "acacia"] },
    medrally: { sky: ["#3f9ee6", "#e6f4ff"], fog: "#e6f4ff", grass: ["#a39d5e", "#979157"], hills: "#8a8a6a", props: ["rock", "bush", "olive"] },
    wales:    { sky: ["#8a99a8", "#d5dde4"], fog: "#d5dde4", grass: ["#3c7a3c", "#357036"], hills: "#4d6650", props: ["pine", "tree", "pine"] }
  };
  // [id, nombre, país, tipo, tema, semilla, recta media, curva máx, colinas, horquillas]
  var CIRCUITS = [
    ["monaco", "Mónaco", "🇲🇨", "Circuito", "city", 11, 10, 7, 25, 0.25],
    ["spa", "Spa-Francorchamps", "🇧🇪", "Circuito", "forest", 23, 18, 5, 70, 0.08],
    ["monza", "Monza", "🇮🇹", "Circuito", "park", 37, 34, 4, 10, 0.05],
    ["silverstone", "Silverstone", "🇬🇧", "Circuito", "country", 41, 22, 5, 15, 0.05],
    ["nurburgring", "Nürburgring Nordschleife", "🇩🇪", "Circuito", "forest", 53, 12, 6, 80, 0.12],
    ["suzuka", "Suzuka", "🇯🇵", "Circuito", "japan", 67, 16, 6, 35, 0.1],
    ["interlagos", "Interlagos", "🇧🇷", "Circuito", "tropical", 71, 18, 5, 45, 0.1],
    ["barcelona", "Circuit de Barcelona-Catalunya", "🇪🇸", "Circuito", "spain", 83, 22, 5, 30, 0.08],
    ["jarama", "Jarama", "🇪🇸", "Circuito", "spain", 97, 14, 6, 25, 0.15],
    ["lemans", "Le Mans (La Sarthe)", "🇫🇷", "Circuito", "country", 101, 40, 4, 10, 0.05],
    ["lagunaseca", "Laguna Seca", "🇺🇸", "Circuito", "golden", 113, 14, 6, 75, 0.2],
    ["bathurst", "Bathurst · Mount Panorama", "🇦🇺", "Circuito", "aus", 127, 20, 6, 90, 0.12],
    ["montecarlo", "Rallye Monte-Carlo · Col de Turini", "🇲🇨", "Rally", "snow", 131, 8, 7, 60, 0.3],
    ["finlandia", "Rally de Finlandia · Ouninpohja", "🇫🇮", "Rally", "nordic", 149, 14, 5, 110, 0.06],
    ["safari", "Safari Rally Kenia", "🇰🇪", "Rally", "savanna", 157, 20, 5, 40, 0.08],
    ["cerdena", "Rally de Cerdeña", "🇮🇹", "Rally", "medrally", 163, 10, 6, 50, 0.18],
    ["acropolis", "Rally Acrópolis", "🇬🇷", "Rally", "medrally", 179, 12, 6, 70, 0.15],
    ["corcega", "Tour de Corse", "🇫🇷", "Rally", "medrally", 181, 7, 7, 55, 0.22],
    ["catalunya", "RallyRACC Catalunya", "🇪🇸", "Rally", "spain", 191, 12, 6, 40, 0.15],
    ["gales", "Rally de Gales", "🇬🇧", "Rally", "wales", 197, 12, 6, 65, 0.12],
    ["portugal", "Rally de Portugal · Fafe", "🇵🇹", "Rally", "forest", 211, 12, 6, 90, 0.12]
  ].map(function (c) { return { id: c[0], name: c[1], flag: c[2], kind: c[3], theme: c[4], seed: c[5], straight: c[6], curve: c[7], hills: c[8], hairpin: c[9] }; });
  var byId = {}; CIRCUITS.forEach(function (c) { byId[c.id] = c; });
  var dayIndex = Math.floor((Date.now() + 3600000) / 86400000);
  var DAILY = CIRCUITS[dayIndex % CIRCUITS.length].id;

  /* ---------------- motor pseudo-3D ---------------- */
  var W = 960, H = 540;
  var SEG = 200, RUMBLE = 3, ROAD_W = 2000, LANES = 3, FOV = 100, CAM_H = 1000, DRAW = 220, FOG_D = 5;
  var CAM_D = 1 / Math.tan((FOV / 2) * Math.PI / 180);
  var PLAYER_Z = CAM_H * CAM_D;
  var TRACK_SEGS = 2600;                 // todos los circuitos miden lo mismo → ranking justo
  var STEP = 1 / 60;
  var canvas = $("canvas"), ctx = canvas.getContext("2d");
  var segments = [], trackLength = 0, circuit = null, theme = null, surface = "asfalto";
  var rnd;
  var mulberry = function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  var easeIn = function (a, b, p) { return a + (b - a) * Math.pow(p, 2); };
  var easeInOut = function (a, b, p) { return a + (b - a) * ((-Math.cos(p * Math.PI) / 2) + 0.5); };
  var lastY = function () { return segments.length ? segments[segments.length - 1].p2.world.y : 0; };
  var addSegment = function (curve, y) {
    var n = segments.length;
    segments.push({ index: n, p1: { world: { y: lastY(), z: n * SEG }, camera: {}, screen: {} }, p2: { world: { y: y, z: (n + 1) * SEG }, camera: {}, screen: {} },
      curve: curve, sprites: [], coins: [], dark: Math.floor(n / RUMBLE) % 2 });
  };
  var addRoad = function (enter, hold, leave, curve, y) {
    var startY = lastY(), endY = startY + y * SEG, total = enter + hold + leave, n;
    for (n = 0; n < enter; n++) addSegment(easeIn(0, curve, n / enter), easeInOut(startY, endY, n / total));
    for (n = 0; n < hold; n++) addSegment(curve, easeInOut(startY, endY, (enter + n) / total));
    for (n = 0; n < leave; n++) addSegment(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n) / total));
  };
  var buildTrack = function (c) {
    segments = []; rnd = mulberry(c.seed * 9973);
    // plan de piezas reproducible por semilla, escalado para que todos midan TRACK_SEGS
    var plan = [], used = 0, alt = 0;
    while (used < TRACK_SEGS * 1.3) {
      var r = rnd(), len, curve, hill;
      if (r < 0.32) { len = Math.round(c.straight * (2 + rnd() * 4)); curve = 0; }
      else if (r < 0.32 + c.hairpin) { len = Math.round(30 + rnd() * 30); curve = (rnd() < 0.5 ? -1 : 1) * (c.curve + 1); }
      else { len = Math.round(40 + rnd() * 70); curve = (rnd() < 0.5 ? -1 : 1) * Math.max(1.5, c.curve * (0.35 + rnd() * 0.65)); }
      hill = c.hills ? Math.round((rnd() - 0.5) * c.hills) : 0;
      if (Math.abs(alt + hill) > c.hills * 1.4) hill = -hill;
      alt += hill;
      plan.push([len, curve, hill]); used += len;
    }
    var k = (TRACK_SEGS - 120) / used;
    addRoad(0, 60, 0, 0, 0);
    plan.forEach(function (p) { var L = Math.max(8, Math.round(p[0] * k)); addRoad(Math.round(L / 4), Math.round(L / 2), L - Math.round(L / 4) - Math.round(L / 2), p[1], Math.round(p[2] * k)); });
    while (segments.length < TRACK_SEGS - 60) addSegment(0, lastY());
    segments.length = Math.min(segments.length, TRACK_SEGS - 60);
    addRoad(20, 20, 20, 0, Math.round(-lastY() / SEG));                 // vuelve a la altura de salida
    while (segments.length < TRACK_SEGS + DRAW + 10) addSegment(0, lastY()); // tras la meta, recta para dibujar
    trackLength = segments.length * SEG;
    // salida y meta
    for (var i = 0; i < RUMBLE * 2; i++) { segments[10 + i].start = true; segments[TRACK_SEGS - 4 + i].finish = true; }
    // decorado
    var props = theme.props, side;
    for (i = 30; i < segments.length; i += 6 + Math.floor(rnd() * 8)) {
      side = rnd() < 0.5 ? -1 : 1;
      segments[i].sprites.push({ k: props[Math.floor(rnd() * props.length)], x: side * (1.35 + rnd() * 2.8) });
      if (rnd() < 0.5) segments[i].sprites.push({ k: props[Math.floor(rnd() * props.length)], x: -side * (1.4 + rnd() * 3.2) });
    }
    // vallas publicitarias: Deyscom y patrocinadores
    var ads = ["deyscom", "ebc", "hel", "mishimoto", "king", "deyscom"];
    for (i = 80, k = 0; i < TRACK_SEGS; i += 140, k++) segments[i].sprites.push({ k: "ad_" + ads[k % ads.length], x: (k % 2 ? 1.3 : -1.3), w: 1.6 });
    segments[16].sprites.push({ k: "arch", x: 0, w: 2.6, arch: true });
    segments[TRACK_SEGS - 2].sprites.push({ k: "arch_finish", x: 0, w: 2.6, arch: true });
    // monedas: 60 en grupos que siguen la carretera
    var placed = 0, s = 150, lane;
    while (placed < RULES.MAX_COINS) {
      lane = (Math.floor(rnd() * 3) - 1) * 0.55;
      for (var j = 0; j < 4 && placed < RULES.MAX_COINS; j++) { segments[s + j * 8].coins.push({ x: lane, got: false }); placed++; }
      s += Math.floor((TRACK_SEGS - 300) / 15);
    }
    // obstáculos (conos en asfalto, rocas y balas de paja en tierra)
    for (i = 220; i < TRACK_SEGS - 100; i += 90 + Math.floor(rnd() * 70)) {
      if (segments[i].coins.length) continue;
      segments[i].sprites.push({ k: surface === "tierra" ? (rnd() < 0.5 ? "rockroad" : "hay") : "cone", x: (rnd() - 0.5) * 1.4, hit: true, w: 0.32 });
    }
  };
  var findSeg = function (z) { return segments[Math.floor(z / SEG) % segments.length]; };
  var project = function (p, cx, cy, cz) {
    p.camera.x = (p.world.x || 0) - cx; p.camera.y = (p.world.y || 0) - cy; p.camera.z = (p.world.z || 0) - cz;
    p.screen.scale = CAM_D / p.camera.z;
    p.screen.x = Math.round(W / 2 + p.screen.scale * p.camera.x * W / 2);
    p.screen.y = Math.round(H / 2 - p.screen.scale * p.camera.y * H / 2);
    p.screen.w = Math.round(p.screen.scale * ROAD_W * W / 2);
  };
  var poly = function (x1, y1, x2, y2, x3, y3, x4, y4, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.closePath(); ctx.fill(); };
  var fogOf = function (n) { return 1 / Math.pow(Math.E, (n / DRAW) * (n / DRAW) * FOG_D); };

  /* ---------------- sprites dibujados una vez ---------------- */
  var SPR = {}, logos = {};
  var mk = function (w, h, fn) { var c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); return c; };
  var tri = function (g, x, y, w, h, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w / 2, y); g.lineTo(x - w / 2, y); g.closePath(); g.fill(); };
  var makeSprites = function () {
    SPR.tree = mk(160, 220, function (g) { g.fillStyle = "#5b3b22"; g.fillRect(70, 140, 20, 80); g.fillStyle = "#2f7a2f"; g.beginPath(); g.arc(80, 95, 70, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.arc(60, 70, 35, 0, 7); g.fill(); });
    SPR.oak = mk(180, 200, function (g) { g.fillStyle = "#5b3b22"; g.fillRect(80, 120, 20, 80); g.fillStyle = "#5d7a2e"; g.beginPath(); g.ellipse(90, 90, 85, 55, 0, 0, 7); g.fill(); });
    SPR.olive = mk(160, 170, function (g) { g.fillStyle = "#6b4a2a"; g.fillRect(72, 100, 16, 70); g.fillStyle = "#8a9a5b"; g.beginPath(); g.ellipse(80, 75, 72, 48, 0, 0, 7); g.fill(); g.fillStyle = "#9fae6c"; g.beginPath(); g.ellipse(60, 60, 30, 20, 0, 0, 7); g.fill(); });
    SPR.sakura = mk(170, 210, function (g) { g.fillStyle = "#5b3b22"; g.fillRect(76, 130, 18, 80); g.fillStyle = "#f6a9c9"; g.beginPath(); g.arc(85, 90, 75, 0, 7); g.fill(); g.fillStyle = "#ffd1e3"; g.beginPath(); g.arc(62, 70, 34, 0, 7); g.fill(); });
    SPR.pine = mk(120, 260, function (g) { g.fillStyle = "#4a3020"; g.fillRect(52, 220, 16, 40); tri(g, 60, 230, 120, 120, "#1f5a2c"); tri(g, 60, 170, 100, 110, "#246632"); tri(g, 60, 110, 74, 100, "#2a7338"); });
    SPR.snowpine = mk(120, 260, function (g) { g.fillStyle = "#4a3020"; g.fillRect(52, 220, 16, 40); tri(g, 60, 230, 120, 120, "#1e4a33"); tri(g, 60, 170, 100, 110, "#225539"); tri(g, 60, 110, 74, 100, "#26603f"); tri(g, 60, 60, 40, 50, "#f4f8ff"); g.fillStyle = "#eef4ff"; g.fillRect(14, 222, 92, 8); });
    SPR.palm = mk(180, 280, function (g) { g.strokeStyle = "#8a6a43"; g.lineWidth = 14; g.beginPath(); g.moveTo(90, 280); g.quadraticCurveTo(70, 160, 95, 70); g.stroke(); g.fillStyle = "#2e8b3d"; for (var a = 0; a < 7; a++) { g.save(); g.translate(95, 70); g.rotate(a * 0.9); g.beginPath(); g.ellipse(45, 0, 50, 12, 0.3, 0, 7); g.fill(); g.restore(); } });
    SPR.gum = mk(160, 260, function (g) { g.strokeStyle = "#e6dccb"; g.lineWidth = 14; g.beginPath(); g.moveTo(80, 260); g.lineTo(80, 90); g.stroke(); g.fillStyle = "#6f8f5a"; g.beginPath(); g.ellipse(80, 80, 70, 60, 0, 0, 7); g.fill(); });
    SPR.acacia = mk(220, 180, function (g) { g.strokeStyle = "#5a3d24"; g.lineWidth = 10; g.beginPath(); g.moveTo(110, 180); g.lineTo(110, 80); g.lineTo(70, 50); g.moveTo(110, 90); g.lineTo(150, 50); g.stroke(); g.fillStyle = "#5f7a2e"; g.beginPath(); g.ellipse(110, 45, 105, 26, 0, 0, 7); g.fill(); });
    SPR.bush = mk(140, 80, function (g) { g.fillStyle = "#6b8a3a"; g.beginPath(); g.ellipse(45, 55, 45, 25, 0, 0, 7); g.ellipse(95, 50, 45, 30, 0, 0, 7); g.fill(); });
    SPR.rock = mk(160, 110, function (g) { g.fillStyle = "#8d8a84"; g.beginPath(); g.moveTo(10, 110); g.lineTo(40, 30); g.lineTo(100, 10); g.lineTo(150, 60); g.lineTo(155, 110); g.closePath(); g.fill(); g.fillStyle = "rgba(255,255,255,.15)"; g.beginPath(); g.moveTo(40, 30); g.lineTo(100, 10); g.lineTo(90, 50); g.closePath(); g.fill(); });
    SPR.building = mk(200, 320, function (g) { g.fillStyle = ["#e9d8c4", "#f1c9a5", "#d8e2ea"][Math.floor(Math.random() * 3)]; g.fillRect(0, 20, 200, 300); g.fillStyle = "#b5523b"; g.fillRect(0, 0, 200, 24); g.fillStyle = "#4b6b8a"; for (var y = 50; y < 300; y += 50) for (var x = 20; x < 190; x += 45) g.fillRect(x, y, 26, 32); });
    SPR.cone = mk(80, 100, function (g) { g.fillStyle = "#ff6a00"; g.beginPath(); g.moveTo(40, 0); g.lineTo(70, 90); g.lineTo(10, 90); g.closePath(); g.fill(); g.fillStyle = "#fff"; g.fillRect(24, 40, 32, 10); g.fillStyle = "#222"; g.fillRect(0, 88, 80, 12); });
    SPR.rockroad = mk(110, 80, function (g) { g.fillStyle = "#7b746a"; g.beginPath(); g.moveTo(5, 80); g.lineTo(25, 20); g.lineTo(70, 5); g.lineTo(105, 50); g.lineTo(105, 80); g.closePath(); g.fill(); });
    SPR.hay = mk(140, 90, function (g) { g.fillStyle = "#e3c15c"; g.fillRect(0, 10, 140, 80); g.strokeStyle = "#b8952f"; g.lineWidth = 4; for (var x = 10; x < 140; x += 18) { g.beginPath(); g.moveTo(x, 12); g.lineTo(x, 88); g.stroke(); } g.fillStyle = "#c62828"; g.fillRect(0, 40, 140, 8); });
    SPR.coin = mk(96, 96, function (g) { var gr = g.createRadialGradient(40, 36, 6, 48, 48, 46); gr.addColorStop(0, "#ffd3ec"); gr.addColorStop(1, "#ff3fae"); g.fillStyle = gr; g.beginPath(); g.arc(48, 48, 44, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 5; g.stroke(); g.fillStyle = "#fff"; g.font = "italic 900 52px Jost, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("D", 50, 52); });
    var arch = function (txt) {
      return mk(600, 260, function (g) {
        g.fillStyle = "#111"; g.fillRect(0, 0, 30, 260); g.fillRect(570, 0, 30, 260);
        g.fillStyle = "#ff66c4"; g.fillRect(0, 0, 600, 70);
        if (txt === "META") { for (var i = 0; i < 30; i++) { g.fillStyle = i % 2 ? "#000" : "#fff"; g.fillRect(i * 20, 70, 20, 14); g.fillStyle = i % 2 ? "#fff" : "#000"; g.fillRect(i * 20, 84, 20, 14); } }
        g.fillStyle = "#fff"; g.font = "italic 900 46px Jost, Arial"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(txt === "META" ? "META · DEYSCOM MOTORSPORT" : "SALIDA · AX RALLY", 300, 37);
      });
    };
    SPR.arch = arch("SALIDA"); SPR.arch_finish = arch("META");
    var board = function (draw) {
      return mk(320, 200, function (g) {
        g.fillStyle = "#333"; g.fillRect(40, 120, 14, 80); g.fillRect(266, 120, 14, 80);
        g.fillStyle = "#fff"; g.fillRect(0, 0, 320, 130); g.strokeStyle = "#ff66c4"; g.lineWidth = 8; g.strokeRect(4, 4, 312, 122);
        draw(g);
      });
    };
    SPR.ad_deyscom = board(function (g) { g.fillStyle = "#0b0b0e"; g.fillRect(8, 8, 304, 114); g.font = "italic 900 54px Jost, Arial"; g.textBaseline = "middle"; g.fillStyle = "#fff"; g.fillText("DEYS", 26, 58); g.fillStyle = "#ff66c4"; g.fillText("COM", 166, 58); g.fillStyle = "#fff"; g.font = "italic 600 16px Jost, Arial"; g.fillText("M O T O R S P O R T", 70, 100); });
    [["ebc", "ebc-frenos.png"], ["hel", "hel-performance.png"], ["mishimoto", "mishimoto.png"], ["king", "king-elements.png"]].forEach(function (a) {
      SPR["ad_" + a[0]] = board(function () {});
      var img = new Image(); img.onload = function () {
        var g = SPR["ad_" + a[0]].getContext("2d"), r = Math.min(280 / img.width, 100 / img.height);
        g.drawImage(img, 160 - img.width * r / 2, 65 - img.height * r / 2, img.width * r, img.height * r); logos[a[0]] = img;
      }; img.src = "assets/img/patrocinadores/" + a[1];
    });
  };

  /* ---------------- el Citroën AX visto desde atrás ---------------- */
  var CAR = {};
  var makeCar = function () {
    var skin = save.skin || {};
    var bodyCol = skin.white ? "#f1f1f3" : "#2b2d33", rimCol = skin.gold ? "#e6b422" : "#ff66c4";
    var draw = function (turn, brake) {
      return mk(300, 200, function (g) {
        var sk = turn * 10;
        // ruedas
        g.fillStyle = "#0d0d0f"; g.fillRect(30, 140, 50, 56); g.fillRect(220, 140, 50, 56);
        g.fillStyle = rimCol; g.fillRect(40, 160, 30, 22); g.fillRect(230, 160, 30, 22);
        // carrocería
        g.fillStyle = bodyCol; g.beginPath(); g.moveTo(24, 178); g.lineTo(22, 118); g.lineTo(46 + sk, 52); g.lineTo(254 + sk, 52); g.lineTo(278, 118); g.lineTo(276, 178); g.closePath(); g.fill();
        // techo y luneta (el AX tiene una luneta grande casi vertical)
        g.fillStyle = "#ff66c4"; g.beginPath(); g.moveTo(52 + sk, 40); g.lineTo(248 + sk, 40); g.lineTo(256 + sk, 54); g.lineTo(44 + sk, 54); g.closePath(); g.fill();
        g.fillStyle = "#121821"; g.beginPath(); g.moveTo(56 + sk, 60); g.lineTo(244 + sk, 60); g.lineTo(262, 112); g.lineTo(38, 112); g.closePath(); g.fill();
        g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 3; g.beginPath(); g.moveTo(70 + sk, 68); g.lineTo(52, 104); g.stroke();
        // jaula vista a través de la luneta
        g.strokeStyle = "rgba(230,230,235,.7)"; g.lineWidth = 4; g.beginPath(); g.moveTo(80 + sk, 62); g.lineTo(80, 110); g.moveTo(220 + sk, 62); g.lineTo(220, 110); g.moveTo(80 + sk, 64); g.lineTo(220, 108); g.stroke();
        // alerón
        g.fillStyle = skin.wing ? "#ff66c4" : "#141416"; g.fillRect(skin.wing ? 30 + sk : 50 + sk, skin.wing ? 30 : 50, skin.wing ? 240 : 200, skin.wing ? 10 : 6);
        // pilotos traseros (horizontales)
        g.fillStyle = brake ? "#ff2a2a" : "#b0121b"; g.fillRect(26, 120, 48, 20); g.fillRect(226, 120, 48, 20);
        if (brake) { g.fillStyle = "rgba(255,40,40,.35)"; g.fillRect(16, 112, 68, 36); g.fillRect(216, 112, 68, 36); }
        g.fillStyle = "#ffb000"; g.fillRect(26, 140, 14, 6); g.fillRect(260, 140, 14, 6);
        // portón con DEYSCOM
        g.fillStyle = skin.white ? "#ff66c4" : "#ff66c4"; g.fillRect(80, 118, 140, 4);
        g.font = "italic 900 30px Jost, Arial"; g.textBaseline = "middle"; g.textAlign = "left";
        var w1 = g.measureText("DEYS").width, w2 = g.measureText("COM").width, x0 = 150 - (w1 + w2) / 2;
        g.fillStyle = skin.white ? "#111" : "#fff"; g.fillText("DEYS", x0, 137); g.fillStyle = "#ff66c4"; g.fillText("COM", x0 + w1, 137); g.textAlign = "center";
        // paragolpes y matrícula
        g.fillStyle = "#141416"; g.fillRect(20, 152, 260, 28);
        g.fillStyle = "#fff"; g.fillRect(112, 156, 76, 18); g.fillStyle = "#111"; g.font = "700 12px Arial"; g.fillText("AX · RALLY", 150, 166);
        g.fillStyle = "#8a8a90"; g.fillRect(48, 178, 18, 8);
      });
    };
    CAR.c = draw(0, false); CAR.l = draw(-1, false); CAR.r = draw(1, false);
    CAR.cb = draw(0, true); CAR.lb = draw(-1, true); CAR.rb = draw(1, true);
  };

  /* ---------------- estado de la partida ---------------- */
  var startedAt = 0, S = null, keys = {}, touch = { l: false, r: false, b: false }, raf = 0, last = 0, acc = 0, running = false, paused = false;
  var particles = [], skyOffset = 0, hillOffset = 0, shake = 0, flash = 0;
  var hud = { t: $("[data-ax-time]"), c: $("[data-ax-coins]"), v: $("[data-ax-speed]"), p: $("[data-ax-progress]") };
  var fmtT = function (t) { var m = Math.floor(t / 60), s = t - m * 60; return m + ":" + (s < 10 ? "0" : "") + s.toFixed(2).replace(".", ","); };
  var newGame = function () {
    circuit = byId[state.circuit] || CIRCUITS[0]; theme = THEMES[circuit.theme]; surface = state.surface;
    buildTrack(circuit);
    var dirt = surface === "tierra";
    S = { pos: 0, x: 0, vx: 0, speed: 0, max: SEG * (dirt ? 37 : 40), accel: SEG * (dirt ? 13 : 15), brake: -SEG * 40, decel: -SEG * 6, offDecel: -SEG * 22,
      offMax: SEG * (dirt ? 18 : 12), centrifugal: dirt ? 0.38 : 0.32, grip: dirt ? 5.2 : 12, time: 0, coins: 0, hits: 0, phase: "count", count: 3.6, done: false, token: "" };
    particles = []; skyOffset = hillOffset = 0;
    if (ENDPOINT) fetch(ENDPOINT + "?action=juego_inicio").then(function (r) { return r.json(); }).then(function (d) { if (S && d && d.token) S.token = d.token; }).catch(function () {});
  };

  /* ---------------- actualización ---------------- */
  var update = function (dt) {
    if (S.phase === "count") { S.count -= dt; if (S.count <= 0) { S.phase = "race"; } return; }
    if (S.phase !== "race") return;
    var seg = findSeg(S.pos + PLAYER_Z), sp = S.speed / S.max, dirt = surface === "tierra";
    var left = keys.ArrowLeft || keys.a || keys.A || touch.l, right = keys.ArrowRight || keys.d || keys.D || touch.r;
    var braking = keys.ArrowDown || keys.s || keys.S || keys[" "] || touch.b;
    S.time += dt;
    S.pos += S.speed * dt;
    // dirección con inercia (en tierra el coche desliza más)
    var steer = (left ? -1 : 0) + (right ? 1 : 0), target = steer * 2.2 * sp;
    S.vx += (target - S.vx) * Math.min(1, S.grip * dt);
    S.x += S.vx * dt;
    S.x -= dt * 2 * sp * sp * seg.curve * S.centrifugal;
    S.steer = steer; S.braking = braking;
    // gas automático, freno con flecha abajo / espacio / botón
    if (braking) S.speed += S.brake * dt; else S.speed += S.accel * dt * (1 - 0.55 * sp);
    if (Math.abs(S.x) > 1) { S.speed += S.offDecel * dt * (S.speed > S.offMax ? 1 : 0); if (dirt || Math.random() < 0.4) puff(true); }
    S.x = Math.max(-2.4, Math.min(2.4, S.x));
    S.speed = Math.max(0, Math.min(S.speed, S.max));
    skyOffset += 0.0009 * seg.curve * sp; hillOffset += 0.0018 * seg.curve * sp;
    // monedas y obstáculos del tramo donde está el coche
    var pz = S.pos + PLAYER_Z;
    for (var n = 0; n < 2; n++) {
      var s = findSeg(pz + n * SEG);
      s.coins.forEach(function (c) { if (!c.got && Math.abs(S.x - c.x) < 0.26) { c.got = true; S.coins++; pop("+1", "#ff66c4"); } });
      s.sprites.forEach(function (o) { if (o.hit && !o.gone && Math.abs(S.x - o.x) < 0.3) { o.gone = true; S.hits++; S.speed *= 0.35; shake = 0.4; flash = 0.25; pop("¡Golpe!", "#ffb000"); } });
    }
    if (dirt && S.speed > SEG * 5 && Math.random() < 0.5 + sp * 0.5) puff(false);
    if (shake > 0) shake -= dt; if (flash > 0) flash -= dt;
    if (S.pos >= (TRACK_SEGS - 3) * SEG && !S.done) finish();
  };
  var puff = function (off) {
    if (reduceMotion || particles.length > 120) return;
    var col = surface === "tierra" ? "200,160,110" : "220,220,220";
    particles.push({ x: W / 2 + (Math.random() - 0.5) * 120, y: H - 40 + Math.random() * 10, vx: (Math.random() - 0.5) * 60, vy: -20 - Math.random() * 40, r: 8 + Math.random() * 10, a: off ? 0.8 : 0.5, col: col });
  };
  var pops = [];
  var pop = function (t, c) { pops.push({ t: t, c: c, y: H * 0.62, a: 1 }); };

  /* ---------------- dibujo ---------------- */
  var lerpCol = function (a, b, p) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    var r = (pa >> 16) + (((pb >> 16) - (pa >> 16)) * p), gg = ((pa >> 8) & 255) + ((((pb >> 8) & 255) - ((pa >> 8) & 255)) * p), bl = (pa & 255) + (((pb & 255) - (pa & 255)) * p);
    return "rgb(" + (r | 0) + "," + (gg | 0) + "," + (bl | 0) + ")";
  };
  var drawBackground = function () {
    var g = ctx.createLinearGradient(0, 0, 0, H / 2 + 40); g.addColorStop(0, theme.sky[0]); g.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (theme.night) { ctx.fillStyle = "rgba(255,255,255,.8)"; for (var i = 0; i < 60; i++) ctx.fillRect((i * 97 + skyOffset * 3000) % W, (i * 53) % (H / 2.4), 2, 2); }
    // montañas en dos capas con paralaje
    [[0.35, theme.hills, 90, skyOffset], [0.55, lerpCol(theme.hills, theme.fog, 0.0), 60, hillOffset]].forEach(function (l, li) {
      ctx.fillStyle = li ? theme.hills : lerpCol(theme.hills, theme.fog, 0.45);
      ctx.beginPath(); ctx.moveTo(0, H);
      var off = (l[3] * W * (li ? 2 : 1)) % W, base = H / 2 + (li ? 30 : 10);
      for (var x = -W; x <= W * 2; x += 40) { var h = Math.sin((x + off) / (li ? 110 : 170)) * l[2] * 0.5 + Math.sin((x + off) / 57) * l[2] * 0.2 + l[2] * 0.5; ctx.lineTo(x - off * 0, base - h); }
      ctx.lineTo(W * 2, H); ctx.closePath(); ctx.fill();
    });
  };
  var render = function () {
    var base = findSeg(S.pos), bp = (S.pos % SEG) / SEG, pseg = findSeg(S.pos + PLAYER_Z), pp = ((S.pos + PLAYER_Z) % SEG) / SEG;
    var playerY = pseg.p1.world.y + (pseg.p2.world.y - pseg.p1.world.y) * pp;
    var maxy = H, x = 0, dx = -(base.curve * bp), n, seg, dirt = surface === "tierra";
    ctx.save();
    if (shake > 0 && !reduceMotion) ctx.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8);
    else if (dirt && S.phase === "race" && !reduceMotion) ctx.translate(0, Math.sin(S.time * 40) * (S.speed / S.max) * 1.5);
    drawBackground();
    for (n = 0; n < DRAW; n++) {
      seg = segments[(base.index + n) % segments.length];
      seg.looped = seg.index < base.index; seg.fog = fogOf(n);
      project(seg.p1, S.x * ROAD_W - x, playerY + CAM_H, S.pos - (seg.looped ? trackLength : 0));
      project(seg.p2, S.x * ROAD_W - x - dx, playerY + CAM_H, S.pos - (seg.looped ? trackLength : 0));
      x += dx; dx += seg.curve;
      if (seg.p1.camera.z <= CAM_D || seg.p2.screen.y >= seg.p1.screen.y || seg.p2.screen.y >= maxy) continue;
      drawSegment(seg, dirt);
      maxy = seg.p1.screen.y; seg.clip = maxy;
    }
    // sprites y monedas de atrás hacia delante
    for (n = DRAW - 1; n > 0; n--) {
      seg = segments[(base.index + n) % segments.length];
      if (seg.p1.camera.z <= CAM_D) continue;
      var sc = seg.p1.screen.scale;
      for (var i = 0; i < seg.sprites.length; i++) {
        var o = seg.sprites[i]; if (o.gone) continue;
        var img = SPR[o.k]; if (!img) continue;
        var w = (o.w || (o.k === "building" ? 1.2 : o.k === "bush" ? 0.6 : 0.9)) * sc * ROAD_W * W / 2 / 1.0;
        var h = w * img.height / img.width, sx = seg.p1.screen.x + sc * o.x * ROAD_W * W / 2, sy = seg.p1.screen.y;
        drawSprite(img, sx - w / 2, sy - h, w, h, seg.clip, seg.fog);
      }
      for (i = 0; i < seg.coins.length; i++) {
        var c = seg.coins[i]; if (c.got) continue;
        var cw = 0.22 * sc * ROAD_W * W / 2, spin = Math.abs(Math.cos(performance.now() / 260 + seg.index));
        var cx = seg.p1.screen.x + sc * c.x * ROAD_W * W / 2, cy = seg.p1.screen.y - cw * 1.25;
        drawSprite(SPR.coin, cx - cw * spin / 2, cy, cw * Math.max(0.15, spin), cw, seg.clip, seg.fog);
      }
    }
    // partículas, coche y efectos
    particles.forEach(function (p) { ctx.fillStyle = "rgba(" + p.col + "," + p.a.toFixed(2) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
    var cw2 = W < 700 ? W * 0.3 : W * 0.2, ch2 = cw2 * 200 / 300, bounce = S.phase === "race" ? (Math.random() * (S.speed / S.max) * (dirt ? 4 : 1.5)) : 0;
    var steer = S.steer || 0, key = (steer < 0 ? "l" : steer > 0 ? "r" : "c") + (S.braking ? "b" : "");
    ctx.drawImage(CAR[key], W / 2 - cw2 / 2, H - ch2 - 12 - bounce, cw2, ch2);
    pops.forEach(function (p) { ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.c; ctx.font = "italic 900 34px Jost, Arial"; ctx.textAlign = "center"; ctx.fillText(p.t, W / 2, p.y); ctx.globalAlpha = 1; });
    if (flash > 0) { ctx.fillStyle = "rgba(255,80,80," + (flash * 1.2).toFixed(2) + ")"; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    if (S.phase === "count") drawCountdown();
  };
  var drawSegment = function (seg, dirt) {
    var p1 = seg.p1.screen, p2 = seg.p2.screen, d = seg.dark;
    var grass = theme.grass[d], fog = seg.fog;
    var road = dirt ? (d ? "#a97a4c" : "#b48555") : (d ? "#626266" : "#6b6b70");
    var mix = function (c) { return fog < 1 ? lerpCol(c.charAt(0) === "#" ? c : "#000000", theme.fog, 1 - fog) : c; };
    ctx.fillStyle = mix(grass); ctx.fillRect(0, p2.y, W, p1.y - p2.y);
    var r1 = p1.w / (dirt ? 9 : 6), r2 = p2.w / (dirt ? 9 : 6);
    var rumble = seg.start || seg.finish ? null : dirt ? (d ? "#8d6640" : "#97703f") : (d ? "#d32f2f" : "#f5f5f5");
    if (rumble) { poly(p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y, mix(rumble)); poly(p1.x + p1.w + r1, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x + p2.w + r2, p2.y, mix(rumble)); }
    poly(p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y, mix(road));
    if (seg.start || seg.finish) {
      var cells = 12, cw1 = p1.w * 2 / cells, cw2 = p2.w * 2 / cells;
      for (var i = 0; i < cells; i++) poly(p1.x - p1.w + i * cw1, p1.y, p1.x - p1.w + (i + 1) * cw1, p1.y, p2.x - p2.w + (i + 1) * cw2, p2.y, p2.x - p2.w + i * cw2, p2.y, (i + seg.index) % 2 ? "#111" : "#fff");
    } else if (!dirt && d) {
      var l1 = p1.w / 32, l2 = p2.w / 32, lw1 = p1.w * 2 / LANES, lw2 = p2.w * 2 / LANES, lx1 = p1.x - p1.w + lw1, lx2 = p2.x - p2.w + lw2;
      for (var l = 1; l < LANES; l++, lx1 += lw1, lx2 += lw2) poly(lx1 - l1 / 2, p1.y, lx1 + l1 / 2, p1.y, lx2 + l2 / 2, p2.y, lx2 - l2 / 2, p2.y, mix("#f2f2f2"));
    } else if (dirt) {
      // rodadas de los coches en la tierra
      var t1 = p1.w * 0.35, t2 = p2.w * 0.35, tw1 = p1.w / 14, tw2 = p2.w / 14;
      poly(p1.x - t1 - tw1, p1.y, p1.x - t1 + tw1, p1.y, p2.x - t2 + tw2, p2.y, p2.x - t2 - tw2, p2.y, mix(d ? "#9a6d42" : "#a3764a"));
      poly(p1.x + t1 - tw1, p1.y, p1.x + t1 + tw1, p1.y, p2.x + t2 + tw2, p2.y, p2.x + t2 - tw2, p2.y, mix(d ? "#9a6d42" : "#a3764a"));
    }
  };
  var drawSprite = function (img, x, y, w, h, clipY, fog) {
    if (w < 1 || y > H || x > W || x + w < 0) return;
    var clipH = clipY ? Math.max(0, y + h - clipY) : 0;
    if (clipH >= h) return;
    var sh = img.height * (h - clipH) / h;
    ctx.globalAlpha = Math.max(0.15, Math.min(1, fog + 0.2));
    ctx.drawImage(img, 0, 0, img.width, sh, x, y, w, h - clipH);
    ctx.globalAlpha = 1;
  };
  var drawCountdown = function () {
    var n = Math.ceil(S.count - 0.6), lights = Math.max(0, Math.min(3, 3 - n + 1));
    ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(W / 2 - 110, 60, 220, 70);
    for (var i = 0; i < 3; i++) { ctx.fillStyle = S.count < 0.6 ? "#2bd96b" : i < lights ? "#ff2d2d" : "#2a1517"; ctx.beginPath(); ctx.arc(W / 2 - 60 + i * 60, 95, 22, 0, 7); ctx.fill(); }
    ctx.fillStyle = "#fff"; ctx.font = "italic 900 64px Jost, Arial"; ctx.textAlign = "center";
    ctx.fillText(S.count < 0.6 ? "¡YA!" : String(Math.max(1, n)), W / 2, 220);
  };
  var updateHud = function () {
    hud.t.textContent = fmtT(S.time); hud.c.textContent = S.coins + "/" + RULES.MAX_COINS;
    hud.v.textContent = Math.round(S.speed / SEG * 4.2) + " km/h";
    hud.p.style.width = Math.min(100, S.pos / ((TRACK_SEGS - 3) * SEG) * 100).toFixed(1) + "%";
  };
  var stepParticles = function (dt) {
    particles.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.r += 30 * dt; p.a -= dt * 1.1; });
    particles = particles.filter(function (p) { return p.a > 0; });
    pops.forEach(function (p) { p.y -= 60 * dt; p.a -= dt * 1.4; }); pops = pops.filter(function (p) { return p.a > 0; });
  };
  var frame = function (now) {
    if (!running) return;
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (!paused) {
      acc += dt;
      while (acc > STEP) { update(STEP); stepParticles(STEP); acc -= STEP; }
      render(); updateHud();
    }
    raf = requestAnimationFrame(frame);
  };
  var resize = function () {
    var dpr = Math.min(2, window.devicePixelRatio || 1), portrait = canvas.parentNode.clientWidth < 620;
    W = portrait ? 540 : 960; H = portrait ? 620 : 540;
    canvas.style.aspectRatio = W + " / " + H;
    if (canvas.width === W * dpr && canvas.height === H * dpr) return;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = true;
  };

  /* ---------------- puntuación, logros y garaje ---------------- */
  var points = function (coins, t) { return Math.round((coins * RULES.COIN_POINTS + Math.max(0, Math.round((RULES.PAR - t) * RULES.TIME_POINTS))) * (surface === "tierra" ? RULES.DIRT_BONUS : 1)); };
  var ACH = [
    ["meta", "🏁", "Primera meta", "Termina tu primera carrera"],
    ["coleccionista", "🪙", "Coleccionista", "Coge 50 monedas en una carrera"],
    ["limpio", "✨", "Sin un rasguño", "Termina sin tocar ningún obstáculo"],
    ["tierra", "🟫", "Rey de la tierra", "Termina en tierra en menos de 1:30"],
    ["asfalto", "⬛", "Rey del asfalto", "Termina en asfalto en menos de 1:15"],
    ["trotamundos", "🌍", "Trotamundos", "Corre en 5 circuitos distintos"],
    ["diario", "📅", "Circuito del día", "Corre el circuito del día"],
    ["perfecto", "💯", "Perfecto", "Coge las 60 monedas"]
  ];
  var UNLOCKS = [["gold", 150, "Llantas doradas"], ["white", 400, "Carrocería blanca Kit Car"], ["wing", 800, "Alerón GT rosa"]];
  var finish = function () {
    S.done = true; S.phase = "end";
    var t = Math.round(S.time * 100) / 100, pts = points(S.coins, t), daily = circuit.id === DAILY;
    var earned = S.coins * (daily ? 2 : 1), before = save.coins;
    save.coins += earned; save.played++;
    if (save.circuits.indexOf(circuit.id) < 0) save.circuits.push(circuit.id);
    var bkey = circuit.id + "|" + surface, isBest = !save.best[bkey] || pts > save.best[bkey];
    if (isBest) save.best[bkey] = pts;
    save.runs.push({ c: circuit.id, s: surface, p: pts, t: t, m: S.coins, d: new Date().toISOString().slice(0, 10) });
    save.runs = save.runs.sort(function (a, b) { return b.p - a.p; }).slice(0, 20);
    var got = [];
    var give = function (id) { if (save.ach.indexOf(id) < 0) { save.ach.push(id); got.push(id); } };
    give("meta"); if (S.coins >= 50) give("coleccionista"); if (!S.hits) give("limpio");
    if (surface === "tierra" && t < 90) give("tierra"); if (surface === "asfalto" && t < 75) give("asfalto");
    if (save.circuits.length >= 5) give("trotamundos"); if (daily) give("diario"); if (S.coins >= RULES.MAX_COINS) give("perfecto");
    var unlocked = UNLOCKS.filter(function (u) { return before < u[1] && save.coins >= u[1]; });
    persist();
    last_run = { pts: pts, t: t, coins: S.coins, hits: S.hits, circuit: circuit, surface: surface, token: S.token, earned: earned, daily: daily, best: isBest };
    track("ax_finish", { circuit: circuit.id, surface: surface, points: pts });
    setTimeout(function () { showResults(got, unlocked); }, 700);
  };
  var last_run = null;

  /* ---------------- pantallas ---------------- */
  var state = { circuit: save.lastCircuit || DAILY, surface: save.lastSurface || "tierra" };
  var screens = { menu: $("[data-ax-menu]"), end: $("[data-ax-end]"), hud: $("[data-ax-hud]"), pad: $("[data-ax-pad]") };
  var show = function (name) {
    screens.menu.hidden = name !== "menu"; screens.end.hidden = name !== "end";
    screens.hud.hidden = name !== "race"; screens.pad.hidden = name !== "race";
    root.classList.toggle("is-racing", name === "race");
  };
  var renderMenu = function () {
    var list = $("[data-ax-circuits]");
    list.innerHTML = CIRCUITS.map(function (c) {
      var b = Math.max(save.best[c.id + "|tierra"] || 0, save.best[c.id + "|asfalto"] || 0);
      return '<button type="button" class="ax-circ' + (c.id === state.circuit ? " is-on" : "") + '" data-c="' + c.id + '" aria-pressed="' + (c.id === state.circuit) + '">' +
        '<span class="ax-circ__flag">' + c.flag + '</span><b>' + c.name + '</b><small>' + c.kind + (c.id === DAILY ? ' · <em>x2 monedas hoy</em>' : '') + (b ? ' · récord ' + b : '') + '</small></button>';
    }).join("");
    $$("[data-c]", list).forEach(function (b) { b.addEventListener("click", function () { state.circuit = b.getAttribute("data-c"); renderMenu(); }); });
    $$("[data-surface]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-surface") === state.surface ? "true" : "false"); });
    $("[data-ax-wallet]").textContent = save.coins;
    var sel = byId[state.circuit]; $("[data-ax-sel]").textContent = sel.flag + " " + sel.name + " · " + (state.surface === "tierra" ? "Tierra (+10 % puntos)" : "Asfalto");
    renderGarage(); renderAch();
  };
  var renderGarage = function () {
    var g = $("[data-ax-garage]"); if (!g) return;
    g.innerHTML = UNLOCKS.map(function (u) {
      var on = save.coins >= u[1], act = !!(save.skin || {})[u[0]];
      return '<button type="button" class="ax-unlock' + (on ? "" : " is-locked") + (act ? " is-on" : "") + '" data-skin="' + u[0] + '"' + (on ? "" : " disabled") + '>' +
        (on ? (act ? "✓ " : "") : "🔒 ") + u[2] + '<small>' + (on ? (act ? "Puesto" : "Ponérselo") : u[1] + " monedas") + '</small></button>';
    }).join("");
    $$("[data-skin]", g).forEach(function (b) { b.addEventListener("click", function () { var k = b.getAttribute("data-skin"); save.skin = save.skin || {}; save.skin[k] = !save.skin[k]; persist(); makeCar(); applySkinSvg(); renderGarage(); }); });
    applySkinSvg();
  };
  var applySkinSvg = function () {
    var svg = $(".axg__svg"); if (!svg) return; var sk = save.skin || {};
    svg.style.setProperty("--rim", sk.gold ? "#e6b422" : "#ff66c4");
    svg.classList.toggle("is-white", !!sk.white); svg.classList.toggle("has-wing", !!sk.wing);
  };
  var renderAch = function () {
    var a = $("[data-ax-ach]"); if (!a) return;
    a.innerHTML = ACH.map(function (x) { var on = save.ach.indexOf(x[0]) > -1; return '<li class="' + (on ? "is-on" : "") + '" title="' + x[3] + '"><span>' + x[1] + '</span><b>' + x[2] + '</b><small>' + x[3] + '</small></li>'; }).join("");
    $("[data-ax-achn]").textContent = save.ach.length + "/" + ACH.length;
  };
  var start = function () {
    save.lastCircuit = state.circuit; save.lastSurface = state.surface; persist();
    newGame(); show("race"); running = true; paused = false; $("[data-ax-paused]").hidden = true; last = startedAt = performance.now(); acc = 0;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    track("ax_start", { circuit: state.circuit, surface: state.surface });
    var r = canvas.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) canvas.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  };
  var stop = function () { running = false; cancelAnimationFrame(raf); };

  /* ---------------- resultados y ranking ---------------- */
  var form = $("[data-ax-form]"), msg = $("[data-ax-msg]");
  var showResults = function (got, unlocked) {
    stop(); show("end");
    var r = last_run, bonus = Math.max(0, Math.round((RULES.PAR - r.t) * RULES.TIME_POINTS));
    $("[data-ax-r-pts]").textContent = r.pts.toLocaleString("es-ES");
    $("[data-ax-r-detail]").textContent = r.coins + " monedas × 100 + " + bonus + " por tiempo (" + fmtT(r.t) + ")" + (r.surface === "tierra" ? " · +10 % por tierra" : "") + (r.hits ? " · " + r.hits + " golpes" : "");
    $("[data-ax-r-title]").textContent = r.best ? "¡Nuevo récord personal!" : "¡Bandera a cuadros!";
    var extra = [];
    if (r.earned) extra.push("+" + r.earned + " monedas para el garaje" + (r.daily ? " (x2 circuito del día)" : ""));
    got.forEach(function (id) { var a = ACH.filter(function (x) { return x[0] === id; })[0]; extra.push(a[1] + " Logro: " + a[2]); });
    unlocked.forEach(function (u) { extra.push("🔓 Desbloqueado: " + u[2]); });
    $("[data-ax-r-extra]").innerHTML = extra.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    msg.textContent = ""; msg.className = "form-msg";
    var p = save.player;
    $("[data-ax-known]").hidden = !p; form.hidden = !!p;
    if (p) { $("[data-ax-known-name]").textContent = p.alias; }
    else ["alias", "nombre", "email", "telefono"].forEach(function (k) { var i = form.elements[k]; if (i && !i.value && save.draft && save.draft[k]) i.value = save.draft[k]; });
    renderMenu();
  };
  var submitScore = function (data) {
    var r = last_run;
    var body = { id: "w" + Math.random().toString(36).slice(2, 13).padEnd(11, "0"), formulario: "juego-ax", servicio: "Juego AX Rally",
      alias: data.alias, nombre: data.nombre, email: data.email, telefono: data.telefono, acepta_comunicaciones: data.comunicaciones ? "sí" : "no",
      puntos: r.pts, monedas: r.coins, tiempo: r.t, golpes: r.hits, circuito: r.circuit.id, superficie: r.surface, token: r.token,
      pagina: location.pathname, fecha: new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" }) };
    try { ["landing", "referrer", "utm_source", "utm_medium", "utm_campaign"].forEach(function (k) { var v = sessionStorage.getItem("dm_" + k); if (v) body[k] = v; }); } catch (e) { /* nada */ }
    r.saved = true;
    track("generate_lead", { form: "juego-ax", points: r.pts });
    if (!ENDPOINT) { localRanking(); return Promise.resolve(); }
    var fd = new URLSearchParams(); Object.keys(body).forEach(function (k) { if (body[k] !== undefined && body[k] !== null) fd.append(k, body[k]); });
    return fetch(ENDPOINT, { method: "POST", mode: "no-cors", body: fd }).catch(function () {}).then(function () { setTimeout(loadRanking, 1800); });
  };
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.elements._hp && form.elements._hp.value) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var d = { alias: form.elements.alias.value.trim().slice(0, 18), nombre: form.elements.nombre.value.trim(), email: form.elements.email.value.trim(), telefono: form.elements.telefono.value.trim(), comunicaciones: form.elements.comunicaciones.checked };
    save.player = d; persist();
    submitScore(d).then(function () { msg.className = "form-msg is-ok"; msg.textContent = "¡Guardado! Ya estás en el ranking. Si quedas 1.º al cierre, te llamamos."; form.hidden = true; $("[data-ax-known]").hidden = false; $("[data-ax-known-name]").textContent = d.alias; $("[data-ax-save]").disabled = true; });
  });
  $("[data-ax-save]").addEventListener("click", function () {
    var b = this; if (!save.player || !last_run || last_run.saved) return; b.disabled = true;
    submitScore(save.player).then(function () { msg.className = "form-msg is-ok"; msg.textContent = "¡Puntuación guardada en el ranking!"; });
  });
  $("[data-ax-change]").addEventListener("click", function () { save.draft = save.player; save.player = null; persist(); $("[data-ax-known]").hidden = true; form.hidden = false; });
  var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var paintRanking = function (rows, note, total) {
    var me = save.player && save.player.alias;
    $("[data-ax-rank]").innerHTML = rows.length ? rows.slice(0, 10).map(function (r, i) {
      var c = byId[r.circuito] || {};
      return '<li class="' + (me && r.alias === me ? "is-me" : "") + '"><span class="ax-pos">' + (i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1) + '</span><b>' + esc(r.alias) + '</b><small>' + (c.flag || "") + " " + esc(c.name || r.circuito || "") + (r.superficie === "tierra" ? " · tierra" : "") + '</small><em>' + Number(r.puntos).toLocaleString("es-ES") + '</em></li>';
    }).join("") : '<li class="ax-empty">Aún no hay nadie. ¡Sé el primero!</li>';
    $("[data-ax-rank-note]").textContent = note || "";
    if (total !== undefined) $("[data-ax-players]").textContent = total;
  };
  var localRanking = function () {
    var alias = (save.player && save.player.alias) || "Tú";
    paintRanking(save.runs.map(function (r) { return { alias: alias, puntos: r.p, circuito: r.c, superficie: r.s }; }), "Tus mejores partidas en este dispositivo.", save.runs.length ? 1 : 0);
  };
  var loadRanking = function () {
    if (!ENDPOINT) { localRanking(); return; }
    fetch(ENDPOINT + "?action=ranking").then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.ok) throw new Error("ranking");
      paintRanking(d.top || [], d.partidas ? d.partidas.toLocaleString("es-ES") + " partidas jugadas" : "", d.jugadores || 0);
    }).catch(localRanking);
  };

  /* ---------------- controles ---------------- */
  var inGame = function () { return running && S && S.phase !== "end"; };
  document.addEventListener("keydown", function (e) {
    if (!inGame()) return;
    if (/^(Arrow|a|d|s|A|D|S| )/.test(e.key) && e.key.length < 11) { keys[e.key] = true; if (e.key.indexOf("Arrow") === 0 || e.key === " ") e.preventDefault(); }
    if (e.key === "p" || e.key === "Escape") togglePause();
  });
  document.addEventListener("keyup", function (e) { keys[e.key] = false; });
  $$("[data-pad]").forEach(function (b) {
    var k = b.getAttribute("data-pad");
    var on = function (e) { e.preventDefault(); touch[k] = true; b.classList.add("is-on"); };
    var off = function () { touch[k] = false; b.classList.remove("is-on"); };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
    b.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  });
  var togglePause = function () { paused = !paused; $("[data-ax-paused]").hidden = !paused; last = performance.now(); };
  $("[data-ax-pause]").addEventListener("click", togglePause);
  $("[data-ax-paused]").addEventListener("click", togglePause);
  $("[data-ax-quit]").addEventListener("click", function () { stop(); paused = false; $("[data-ax-paused]").hidden = true; show("menu"); renderMenu(); });
  document.addEventListener("visibilitychange", function () { if (document.hidden && inGame() && !paused) togglePause(); });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { en.forEach(function (x) { if (!x.isIntersecting && inGame() && !paused && performance.now() - startedAt > 2500) togglePause(); }); }, { threshold: 0.2 }).observe(canvas);
  $$("[data-surface]").forEach(function (b) { b.addEventListener("click", function () { state.surface = b.getAttribute("data-surface"); renderMenu(); }); });
  $$("[data-ax-start]").forEach(function (b) { b.addEventListener("click", start); });
  $("[data-ax-menu-btn]").addEventListener("click", function () { show("menu"); renderMenu(); });
  $("[data-ax-share]").addEventListener("click", function () {
    var r = last_run; if (!r) return;
    var txt = "He hecho " + r.pts.toLocaleString("es-ES") + " puntos con el Citroën AX de Deyscom en " + r.circuit.name + ". ¿Me superas? 🏁";
    var url = location.origin + location.pathname + "#ax-rally";
    if (navigator.share) navigator.share({ title: "AX Rally Challenge", text: txt, url: url }).catch(function () {});
    else window.open("https://wa.me/?text=" + encodeURIComponent(txt + " " + url), "_blank", "noopener");
    track("share", { method: navigator.share ? "web_share" : "whatsapp", content_type: "ax_rally" });
  });

  /* ---------------- arranque ---------------- */
  makeSprites(); makeCar(); resize();
  window.addEventListener("resize", function () { var w = canvas.width; resize(); if (w !== canvas.width && !running && circuit) preview(); });
  // vista previa del menú: la salida del circuito elegido
  var preview = function () { circuit = byId[state.circuit]; theme = THEMES[circuit.theme]; surface = state.surface; buildTrack(circuit); S = { pos: 0, x: 0, speed: 0, max: 1, phase: "menu", time: 0, coins: 0 }; render(); };
  var renderMenuOrig = renderMenu;
  renderMenu = function () { renderMenuOrig(); if (!running) preview(); };
  show("menu"); renderMenu(); loadRanking();
  root.classList.add("is-ready");
  // ganchos para pruebas automáticas
  if (/axdebug/.test(location.search)) window.__ax = { S: function () { return S; }, jump: function (f) { S.pos = (TRACK_SEGS - 3) * SEG * f; }, coins: function (n) { S.coins = n; } };
})();
