/* =========================================================
   AX RALLY CHALLENGE · Deyscom Motorsport
   Carreras pseudo-3D con el Citroën AX de Deyscom.
   - Circuitos con su trazado real (curvas, nombres y desniveles) y tramos de rally.
   - Rivales en pista, cantos del copiloto, sonido, minimapa y pantalla completa.
   - Teclado, mando y pantalla táctil.
   Las reglas de puntos deben coincidir con google-apps-script/Code.gs (GAME).
   ========================================================= */
(function () {
  "use strict";
  var root = document.querySelector("[data-axgame]");
  if (!root) return;
  var CFG = window.DEYSCOM || {};
  var ENDPOINT = CFG.SHEETS_ENDPOINT || "";
  var RULES = { MAX_COINS: 60, PAR: 95, COIN_POINTS: 100, TIME_POINTS: 60, OVERTAKE_POINTS: 150, MAX_OVERTAKES: 5, DIRT_BONUS: 1.1 };
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia && matchMedia("(pointer: coarse)").matches;
  var $ = function (s, c) { return (c || root).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); };
  var track = function (ev, data) { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: ev }, data || {})); if (window.gtag) window.gtag("event", ev, data || {}); } catch (e) { /* nada */ } };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------------- datos guardados en este navegador ---------------- */
  var KEY = "dmx_ax";
  var save = { coins: 0, played: 0, best: {}, bestTime: {}, runs: [], ach: [], circuits: [], player: null, skin: {}, sound: true, voice: true, autogas: isTouch };
  try { save = Object.assign(save, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* nada */ }
  save.bestTime = save.bestTime || {};
  var persist = function () { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* nada */ } };

  /* ---------------- temas de paisaje ---------------- */
  var THEMES = {
    city:     { sky: ["#5aa9e6", "#cfe8ff"], fog: "#cfe8ff", grass: ["#7d8a6a", "#748160"], hills: "#7f8c99", props: ["building", "palm", "building"] },
    forest:   { sky: ["#6f9fc9", "#d7e6ef"], fog: "#d7e6ef", grass: ["#2f7d32", "#2a7130"], hills: "#3e6b48", props: ["pine", "pine", "tree"] },
    park:     { sky: ["#64a8e8", "#d9ecff"], fog: "#d9ecff", grass: ["#4c9a2a", "#448c25"], hills: "#5c8f4a", props: ["tree", "tree", "pine"] },
    country:  { sky: ["#7cb2e3", "#e8f2fb"], fog: "#e8f2fb", grass: ["#6e9e35", "#669530"], hills: "#8aa860", props: ["tree", "bush", "tree"] },
    japan:    { sky: ["#8ab6e8", "#fde7f0"], fog: "#fde7f0", grass: ["#5f9d45", "#56903e"], hills: "#7c9c7a", props: ["sakura", "tree", "sakura"] },
    tropical: { sky: ["#3e9be0", "#c9ecff"], fog: "#c9ecff", grass: ["#3f9b3a", "#368c33"], hills: "#3f7f55", props: ["palm", "tree", "building"] },
    spain:    { sky: ["#4f9fe4", "#fff1d6"], fog: "#fff1d6", grass: ["#b9a463", "#ad985a"], hills: "#b48d5c", props: ["olive", "bush", "olive"] },
    golden:   { sky: ["#6aaee6", "#ffeccc"], fog: "#ffeccc", grass: ["#c9a257", "#be974e"], hills: "#a8814a", props: ["oak", "bush", "oak"] },
    aus:      { sky: ["#3f95dc", "#e3f1ff"], fog: "#e3f1ff", grass: ["#8ea64a", "#839a43"], hills: "#6f8a54", props: ["gum", "bush", "gum"] },
    nordic:   { sky: ["#7fb0dc", "#eef5fb"], fog: "#eef5fb", grass: ["#3d7a3f", "#376f39"], hills: "#4a6a58", props: ["pine", "pine", "rock"] },
    snow:     { sky: ["#0d1630", "#3a4b78"], fog: "#3a4b78", grass: ["#e9eef5", "#dde4ee"], hills: "#9fb0c9", props: ["snowpine", "snowpine", "rock"], night: true },
    savanna:  { sky: ["#f2a65a", "#ffe2b0"], fog: "#ffe2b0", grass: ["#c98c4a", "#bf8244"], hills: "#9a6a3a", props: ["acacia", "bush", "acacia"] },
    medrally: { sky: ["#3f9ee6", "#e6f4ff"], fog: "#e6f4ff", grass: ["#a39d5e", "#979157"], hills: "#8a8a6a", props: ["rock", "bush", "olive"] },
    wales:    { sky: ["#8a99a8", "#d5dde4"], fog: "#d5dde4", grass: ["#3c7a3c", "#357036"], hills: "#4d6650", props: ["pine", "tree", "pine"] },
    citynight: { sky: ["#0b0f24", "#3b2a5a"], fog: "#3b2a5a", grass: ["#3a3f4a", "#343843"], hills: "#2a2d4a", props: ["building", "palm", "building"], night: true }
  };

  /* ---------------- trazados ----------------
     Piezas separadas por «|»:  S300 = recta de 300 m · R90/35 = derecha de 90° con radio 35 m · L… = izquierda
     +20 / -15 al final = sube o baja esos metros · J = cresta (salto) · «:Nombre» = nombre de la curva o del punto */
  // circuitos: trazado real (assets/js/ax-tracks.js, datos abiertos de github.com/bacinger/f1-circuits, licencia MIT)
  var CIRCUITS = (window.AX_TRACKS || []).map(function (t) { return { id: t.id, name: t.name, flag: t.flag, kind: "Circuito", theme: t.theme, km: t.km, p: t.p, step: t.step }; });
  // tramos de rally (punto a punto) con el carácter de cada prueba
  var STAGES = [
    { id: "montecarlo", name: "Rallye Monte-Carlo · Col de Turini", flag: "🇲🇨", theme: "snow", km: 15.3, seed: 131, o: { minR: 14, maxR: 90, hp: 0.32, jp: 0, hill: 40, straight: 0.6, top: "Col de Turini" } },
    { id: "finlandia", name: "Rally de Finlandia · Ouninpohja", flag: "🇫🇮", theme: "nordic", km: 33.0, seed: 149, o: { minR: 60, maxR: 300, hp: 0.03, jp: 0.35, hill: 25, straight: 1.4, top: "Salto de Ouninpohja" } },
    { id: "safari", name: "Safari Rally Kenia", flag: "🇰🇪", theme: "savanna", km: 21.0, seed: 157, o: { minR: 50, maxR: 260, hp: 0.04, jp: 0.15, hill: 20, straight: 1.6 } },
    { id: "cerdena", name: "Rally de Cerdeña", flag: "🇮🇹", theme: "medrally", km: 18.0, seed: 163, o: { minR: 20, maxR: 120, hp: 0.14, jp: 0.08, hill: 30, straight: 0.8 } },
    { id: "acropolis", name: "Rally Acrópolis", flag: "🇬🇷", theme: "medrally", km: 16.0, seed: 179, o: { minR: 18, maxR: 110, hp: 0.16, jp: 0.05, hill: 45, straight: 0.8 } },
    { id: "corcega", name: "Tour de Corse", flag: "🇫🇷", theme: "medrally", km: 22.0, seed: 181, o: { minR: 18, maxR: 100, hp: 0.12, jp: 0, hill: 35, straight: 0.5 } },
    { id: "catalunya", name: "RallyRACC Catalunya", flag: "🇪🇸", theme: "spain", km: 20.0, seed: 191, o: { minR: 25, maxR: 160, hp: 0.12, jp: 0.04, hill: 30, straight: 1 } },
    { id: "gales", name: "Rally de Gales", flag: "🇬🇧", theme: "wales", km: 19.0, seed: 197, o: { minR: 35, maxR: 200, hp: 0.06, jp: 0.18, hill: 30, straight: 1.1 } },
    { id: "portugal", name: "Rally de Portugal · Fafe", flag: "🇵🇹", theme: "forest", km: 11.2, seed: 211, o: { minR: 25, maxR: 150, hp: 0.1, jp: 0.12, hill: 40, straight: 0.9, top: "Salto de Fafe" } }
  ];
  STAGES.forEach(function (s) { s.kind = "Rally"; CIRCUITS.push(s); });
  var byId = {}; CIRCUITS.forEach(function (c) { byId[c.id] = c; });
  var dayIndex = Math.floor((Date.now() + 3600000) / 86400000);
  var DAILY = CIRCUITS[dayIndex % CIRCUITS.length].id;

  var mulberry = function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  // genera un tramo de rally con el carácter de la prueba
  var stagePieces = function (c) {
    // carretera que serpentea hacia un destino (no se cruza sobre sí misma); las horquillas van encadenadas
    var r = mulberry(c.seed * 7919), o = c.o, out = [], len = 0, target = c.km * 1000, alt = 0, head = 0, topDone = false, chain = 0, lastDir = 1;
    out.push("S150");
    while (len < target) {
      var x = r(), p, h = Math.round((r() - 0.5) * o.hill);
      if (Math.abs(alt + h) > o.hill * 2.5) h = -h;
      alt += h;
      var hs = h ? (h > 0 ? "+" : "") + h : "";
      if (x < 0.26 && !chain) {
        var sl = Math.round((60 + r() * 260) * o.straight); out.push("S" + sl + hs); len += sl;
        if (o.jp && r() < o.jp) { p = "J"; if (!topDone && o.top && len > target * 0.45) { p += ":" + o.top; topDone = true; } out.push(p); }
        continue;
      }
      var hp = chain > 0 || r() < o.hp, rad, ang, dir;
      if (hp) {
        rad = Math.round(12 + r() * 8); ang = 160 + Math.round(r() * 25);
        dir = chain > 0 ? -lastDir : (head > 0 ? -1 : 1);
        chain = chain > 0 ? chain - 1 : (r() < 0.6 ? 1 : 3);
      } else {
        rad = Math.round(o.minR + Math.pow(r(), 1.6) * (o.maxR - o.minR));
        ang = Math.round(20 + r() * (rad < 50 ? 80 : 60));
        dir = Math.abs(head) > 0.5 ? -Math.sign(head) : (r() < 0.5 ? -1 : 1);
        if (Math.abs(head + dir * ang * Math.PI / 180) > 2.1) dir = -dir;
      }
      head += dir * ang * Math.PI / 180; lastDir = dir;
      p = (dir > 0 ? "R" : "L") + ang + "/" + rad + hs;
      if (!topDone && o.top && !o.jp && len > target * 0.5) { p += ":" + o.top; topDone = true; }
      out.push(p); len += ang * Math.PI / 180 * rad;
      if (r() < 0.35) { var sh = Math.round(20 + r() * 60); out.push("S" + sh); len += sh; }
    }
    out.push("S200");
    return out.join("|");
  };
  var parsePieces = function (str) {
    return str.split("|").map(function (t) {
      var name = "", i = t.indexOf(":"); if (i > -1) { name = t.slice(i + 1); t = t.slice(0, i); }
      var m = t.match(/^([SRLJ])(\d+)?(?:\/(\d+))?([+-]\d+)?$/);
      if (!m) return null;
      var p = { type: m[1], name: name, h: m[4] ? Number(m[4]) : 0 };
      if (p.type === "S") p.len = Number(m[2]);
      else if (p.type === "J") p.len = 60;
      else { p.ang = Number(m[2]); p.rad = Number(m[3]); p.dir = p.type === "R" ? 1 : -1; p.len = p.ang * Math.PI / 180 * p.rad; }
      return p;
    }).filter(Boolean);
  };

  /* ---------------- motor pseudo-3D ---------------- */
  var W = 960, H = 540;
  var SEG = 200, RUMBLE = 3, FOV = 100, CAM_H = 1000, DRAW = 220, FOG_D = 5;
  var ROAD_W = 2000;
  var CAM_D = 1 / Math.tan((FOV / 2) * Math.PI / 180);
  var PLAYER_Z = CAM_H * CAM_D;
  var LAP = 3000;                       // todos los recorridos tienen la misma longitud de juego → ranking justo
  var MS = SEG * 46;                    // velocidad máxima (≈ 190 km/h en el marcador)
  var STEP = 1 / 60;
  var canvas = $("canvas"), ctx = canvas.getContext("2d");
  var segments = [], trackLength = 0, circuit = null, theme = null, surface = "asfalto", isRally = false, notes = [], mapPts = [], mapBox = null;
  var rnd = Math.random;
  var easeIn = function (a, b, p) { return a + (b - a) * Math.pow(p, 2); };
  var easeInOut = function (a, b, p) { return a + (b - a) * ((-Math.cos(p * Math.PI) / 2) + 0.5); };
  var lastY = function () { return segments.length ? segments[segments.length - 1].p2.world.y : 0; };
  var addSegment = function (curve, y, meta) {
    var n = segments.length;
    segments.push({ index: n, p1: { world: { y: lastY(), z: n * SEG }, camera: {}, screen: {} }, p2: { world: { y: y, z: (n + 1) * SEG }, camera: {}, screen: {} },
      curve: curve, sprites: [], coins: [], cars: [], dark: Math.floor(n / RUMBLE) % 2, kerb: meta && meta.kerb, gravel: (meta && meta.gravel) || 0, crest: meta && meta.crest });
  };
  var addRoad = function (enter, hold, leave, curve, dy, meta) {
    var startY = lastY(), endY = startY + dy, total = enter + hold + leave, n;
    for (n = 0; n < enter; n++) addSegment(easeIn(0, curve, n / enter), easeInOut(startY, endY, n / total), meta);
    for (n = 0; n < hold; n++) addSegment(curve, easeInOut(startY, endY, (enter + n) / total), meta);
    for (n = 0; n < leave; n++) addSegment(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n) / total), meta);
  };
  var curveOf = function (rad) { return clamp(260 / rad, 0.6, 7.5); };

  // circuito real: curvatura sacada de la geometría (radio de cada curva), sin inventar nada
  var buildFromPoints = function (c) {
    var raw = c.p, n = raw.length / 2, P = [], i, k;
    for (i = 0; i < n; i++) P.push([raw[i * 2], raw[i * 2 + 1]]);
    var dth = [];
    for (i = 0; i < n; i++) {
      var a0 = P[i], a1 = P[(i + 1) % n], a2 = P[(i + 2) % n];
      var h1 = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]), h2 = Math.atan2(a2[1] - a1[1], a2[0] - a1[0]);
      var d = h2 - h1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; dth.push(d);
    }
    var w = 3, kap = [];
    for (i = 0; i < n; i++) { var sum = 0; for (k = -w; k <= w; k++) sum += dth[(i + k + n) % n]; kap.push(sum / ((2 * w + 1) * c.step)); }
    var segM = n * c.step / LAP, curves = [];
    for (k = 0; k < LAP; k++) {
      var idx = Math.floor(k * segM / c.step) % n, cv = clamp(260 * kap[idx], -7.5, 7.5);
      if (Math.abs(cv) < 0.35) cv = 0;
      curves.push(cv); mapPts.push(P[idx]);
    }
    for (k = 0; k < LAP; k++) { var cvk = curves[k]; addSegment(cvk, 0, { kerb: Math.abs(cvk) > 1.2, gravel: cvk ? -Math.sign(cvk) : 0 }); }
    // curvas numeradas como en la realidad: Curva 1, Curva 2…
    var num = 0;
    for (k = 0; k < LAP; k++) {
      if (Math.abs(curves[k]) < 1.1) continue;
      var dir = Math.sign(curves[k]), j = k, ang = 0, maxC = 0, gap = 0;
      while (j < LAP && (Math.sign(curves[j]) === dir && Math.abs(curves[j]) >= 0.6 || gap < 6)) {
        if (Math.sign(curves[j]) === dir && Math.abs(curves[j]) >= 0.6) { gap = 0; ang += Math.abs(curves[j]) / 260 * segM; maxC = Math.max(maxC, Math.abs(curves[j])); } else gap++;
        j++;
      }
      ang = ang * 180 / Math.PI;
      if (ang >= 20) { num++; notes.push({ at: k, dir: dir, ang: Math.round(ang), rad: Math.round(260 / maxC), name: "Curva " + num, len: j - k }); }
      k = j;
    }
    trackLength = segments.length * SEG;
    var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    mapPts.forEach(function (q) { minx = Math.min(minx, q[0]); maxx = Math.max(maxx, q[0]); miny = Math.min(miny, q[1]); maxy = Math.max(maxy, q[1]); });
    mapBox = { minx: minx, miny: miny, w: Math.max(1, maxx - minx), h: Math.max(1, maxy - miny) };
  };

  var buildTrack = function (c) {
    segments = []; notes = []; mapPts = [];
    isRally = c.kind === "Rally";
    ROAD_W = isRally ? 1500 : 2200;
    rnd = mulberry((c.seed || c.id.length * 977) * 31);
    if (c.p) { buildFromPoints(c); decorate(); return; }
    var pieces = parsePieces(c.t || (c.t = stagePieces(c)));
    var total = pieces.reduce(function (a, p) { return a + p.len; }, 0);
    var segPerM = LAP / total, hScale = SEG / (total / LAP) * 0.55;
    // minimapa: geometría real (rumbo y distancia), independiente de la escala del juego
    var hx = 0, hy = 0, head = -Math.PI / 2, pts = [];
    pieces.forEach(function (p) {
      var n = Math.max(p.type === "S" || p.type === "J" ? 4 : 10, Math.round(p.len * segPerM)), k;
      if (p.type === "R" || p.type === "L") {
        var cv = curveOf(p.rad) * p.dir, e = Math.max(2, Math.round(n * 0.2)), l = Math.max(2, Math.round(n * 0.2));
        notes.push({ at: segments.length, dir: p.dir, ang: p.ang, rad: p.rad, name: p.name, len: n });
        for (k = 0; k < n; k++) { pts.push([hx, hy]); head += p.dir * (p.ang * Math.PI / 180) / n; hx += Math.cos(head) * p.len / n; hy += Math.sin(head) * p.len / n; }
        addRoad(e, Math.max(1, n - e - l), l, cv, p.h * hScale, { kerb: true, gravel: -p.dir });
      } else if (p.type === "J") {
        notes.push({ at: segments.length, jump: true, name: p.name, len: n });
        for (k = 0; k < n; k++) { pts.push([hx, hy]); hx += Math.cos(head) * p.len / n; hy += Math.sin(head) * p.len / n; }
        var half = Math.round(n / 2);
        addRoad(0, half, 0, 0, 9 * hScale, { crest: true });
        addRoad(0, n - half, 0, 0, -9 * hScale, {});
      } else {
        for (k = 0; k < n; k++) { pts.push([hx, hy]); hx += Math.cos(head) * p.len / n; hy += Math.sin(head) * p.len / n; }
        addRoad(0, n, 0, 0, p.h * hScale, {});
        if (p.name) notes.push({ at: segments.length - n, name: p.name, straight: true, len: n });
      }
    });
    // ajusta la longitud a LAP y vuelve a la altura de salida
    while (segments.length < LAP) addSegment(0, lastY(), {});
    if (segments.length > LAP) segments.length = LAP;
    notes = notes.filter(function (nt) { return nt.at < LAP - 20; });
    var tail = 60, y0 = segments[LAP - tail].p1.world.y;
    for (var b = 0; b < tail; b++) {
      var sgm = segments[LAP - tail + b];
      sgm.p1.world.y = easeInOut(y0, 0, b / tail); sgm.p2.world.y = easeInOut(y0, 0, (b + 1) / tail);
    }
    if (isRally) while (segments.length < LAP + DRAW + 20) addSegment(0, lastY(), {});
    trackLength = segments.length * SEG;
    while (pts.length < LAP) pts.push(pts[pts.length - 1]);
    pts.length = LAP;
    // cierra el dibujo de los circuitos repartiendo el pequeño error de medida
    if (!isRally) { var ex = pts[0][0] - hx, ey = pts[0][1] - hy; pts = pts.map(function (q, i) { return [q[0] + ex * i / LAP, q[1] + ey * i / LAP]; }); }
    var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    pts.forEach(function (q) { minx = Math.min(minx, q[0]); maxx = Math.max(maxx, q[0]); miny = Math.min(miny, q[1]); maxy = Math.max(maxy, q[1]); });
    mapPts = pts; mapBox = { minx: minx, miny: miny, w: Math.max(1, maxx - minx), h: Math.max(1, maxy - miny) };
    decorate();
  };

  var decorate = function () {
    var props = theme.props, i, n, s;
    // salida, meta y gradas
    for (i = 0; i < RUMBLE * 2; i++) { segments[8 + i].start = true; segments[LAP - 4 + i < segments.length ? LAP - 4 + i : i].finish = true; }
    segments[12].sprites.push({ k: "arch", x: 0, w: 2.7, arch: true });
    if (isRally) segments[LAP - 2].sprites.push({ k: "arch_finish", x: 0, w: 2.7, arch: true });
    if (!isRally) for (i = 20; i < 160; i += 22) { segments[i].sprites.push({ k: "grandstand", x: -2.3, w: 2.2, solid: true }); segments[i + 10].sprites.push({ k: "grandstand", x: 2.3, w: 2.2, solid: true }); }
    // paisaje
    for (i = 30; i < segments.length; i += 4 + Math.floor(rnd() * 6)) {
      s = segments[i]; var side = rnd() < 0.5 ? -1 : 1;
      var near = isRally ? 1.4 + rnd() * 1.6 : 2.7 + rnd() * 2.6;
      s.sprites.push({ k: props[Math.floor(rnd() * props.length)], x: side * near, solid: true });
      if (rnd() < 0.6) s.sprites.push({ k: props[Math.floor(rnd() * props.length)], x: -side * (near + rnd() * 2.5), solid: true });
    }
    // elementos de cada curva: muros de neumáticos, carteles de frenada, espectadores, chevrones
    notes.forEach(function (nt) {
      if (nt.jump) { for (n = -6; n < 6; n += 3) { s = segments[nt.at + n]; if (s) s.sprites.push({ k: "fan", x: (n % 2 ? -1 : 1) * (1.5 + rnd()), w: 0.3, solid: true }); } return; }
      if (nt.straight || !nt.dir) return;
      var out = -nt.dir;
      if (!isRally) {
        if (nt.rad < 120) [[60, "b150"], [40, "b100"], [20, "b50"]].forEach(function (bb) { s = segments[nt.at - bb[0]]; if (s) s.sprites.push({ k: bb[1], x: out * 1.45, w: 0.32, solid: true }); });
        for (n = 0; n < nt.len; n += 5) { s = segments[nt.at + n]; if (s) s.sprites.push({ k: "tyres", x: out * 2.1, w: 0.5, solid: true }); }
      } else {
        if (nt.rad < 45) for (n = 0; n < nt.len; n += 6) { s = segments[nt.at + n]; if (s) s.sprites.push({ k: "fan", x: out * (1.5 + rnd() * 0.8), w: 0.3, solid: true }); }
        if (nt.rad < 70) { s = segments[nt.at - 12]; if (s) s.sprites.push({ k: nt.dir > 0 ? "chevR" : "chevL", x: out * 1.35, w: 0.45, solid: true }); }
        if (rnd() < 0.5) { s = segments[nt.at + Math.floor(nt.len / 2)]; if (s) s.sprites.push({ k: "hay", x: out * 1.3, w: 0.4, solid: true }); }
      }
    });
    // vallas publicitarias: Deyscom y patrocinadores
    var ads = ["deyscom", "ebc", "hel", "gt2i", "mishimoto", "king"];
    for (i = 90, n = 0; i < LAP - 30; i += 130, n++) segments[i].sprites.push({ k: "ad_" + ads[n % ads.length], x: (n % 2 ? 1 : -1) * (isRally ? 1.55 : 1.85), w: 1.5, solid: true });
    // monedas: 60 en grupos de 4 siguiendo la carretera
    var placed = 0; s = 140;
    while (placed < RULES.MAX_COINS) {
      var lane = (Math.floor(rnd() * 3) - 1) * 0.5;
      for (var j = 0; j < 4 && placed < RULES.MAX_COINS; j++) { segments[s + j * 7].coins.push({ x: lane, got: false }); placed++; }
      s += Math.floor((LAP - 320) / 15);
    }
  };
  var findSeg = function (z) { return segments[((Math.floor(z / SEG) % segments.length) + segments.length) % segments.length]; };
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
  var SPR = {}, CARS = {};
  var mk = function (w, h, fn) { var c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); return c; };
  var rr = function (g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  var tri = function (g, x, y, w, h, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w / 2, y); g.lineTo(x - w / 2, y); g.closePath(); g.fill(); };
  var makeSprites = function () {
    SPR.tree = mk(160, 220, function (g) { g.fillStyle = "#5b3b22"; g.fillRect(70, 140, 20, 80); g.fillStyle = "#2f7a2f"; g.beginPath(); g.arc(80, 95, 70, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.arc(60, 70, 35, 0, 7); g.fill(); });
    SPR.oak = mk(180, 200, function (g) { g.fillStyle = "#5b3b22"; g.fillRect(80, 120, 20, 80); g.fillStyle = "#5d7a2e"; g.beginPath(); g.ellipse(90, 90, 85, 55, 0, 0, 7); g.fill(); });
    SPR.olive = mk(160, 170, function (g) { g.fillStyle = "#6b4a2a"; g.fillRect(72, 100, 16, 70); g.fillStyle = "#8a9a5b"; g.beginPath(); g.ellipse(80, 75, 72, 48, 0, 0, 7); g.fill(); });
    SPR.sakura = mk(170, 210, function (g) { g.fillStyle = "#5b3b22"; g.fillRect(76, 130, 18, 80); g.fillStyle = "#f6a9c9"; g.beginPath(); g.arc(85, 90, 75, 0, 7); g.fill(); g.fillStyle = "#ffd1e3"; g.beginPath(); g.arc(62, 70, 34, 0, 7); g.fill(); });
    SPR.pine = mk(120, 260, function (g) { g.fillStyle = "#4a3020"; g.fillRect(52, 220, 16, 40); tri(g, 60, 230, 120, 120, "#1f5a2c"); tri(g, 60, 170, 100, 110, "#246632"); tri(g, 60, 110, 74, 100, "#2a7338"); });
    SPR.snowpine = mk(120, 260, function (g) { g.fillStyle = "#4a3020"; g.fillRect(52, 220, 16, 40); tri(g, 60, 230, 120, 120, "#1e4a33"); tri(g, 60, 170, 100, 110, "#225539"); tri(g, 60, 110, 74, 100, "#26603f"); tri(g, 60, 60, 40, 50, "#f4f8ff"); });
    SPR.palm = mk(180, 280, function (g) { g.strokeStyle = "#8a6a43"; g.lineWidth = 14; g.beginPath(); g.moveTo(90, 280); g.quadraticCurveTo(70, 160, 95, 70); g.stroke(); g.fillStyle = "#2e8b3d"; for (var a = 0; a < 7; a++) { g.save(); g.translate(95, 70); g.rotate(a * 0.9); g.beginPath(); g.ellipse(45, 0, 50, 12, 0.3, 0, 7); g.fill(); g.restore(); } });
    SPR.gum = mk(160, 260, function (g) { g.strokeStyle = "#e6dccb"; g.lineWidth = 14; g.beginPath(); g.moveTo(80, 260); g.lineTo(80, 90); g.stroke(); g.fillStyle = "#6f8f5a"; g.beginPath(); g.ellipse(80, 80, 70, 60, 0, 0, 7); g.fill(); });
    SPR.acacia = mk(220, 180, function (g) { g.strokeStyle = "#5a3d24"; g.lineWidth = 10; g.beginPath(); g.moveTo(110, 180); g.lineTo(110, 80); g.lineTo(70, 50); g.moveTo(110, 90); g.lineTo(150, 50); g.stroke(); g.fillStyle = "#5f7a2e"; g.beginPath(); g.ellipse(110, 45, 105, 26, 0, 0, 7); g.fill(); });
    SPR.bush = mk(140, 80, function (g) { g.fillStyle = "#6b8a3a"; g.beginPath(); g.ellipse(45, 55, 45, 25, 0, 0, 7); g.ellipse(95, 50, 45, 30, 0, 0, 7); g.fill(); });
    SPR.rock = mk(160, 110, function (g) { g.fillStyle = "#8d8a84"; g.beginPath(); g.moveTo(10, 110); g.lineTo(40, 30); g.lineTo(100, 10); g.lineTo(150, 60); g.lineTo(155, 110); g.closePath(); g.fill(); });
    SPR.building = mk(200, 320, function (g) { g.fillStyle = ["#e9d8c4", "#f1c9a5", "#d8e2ea"][Math.floor(Math.random() * 3)]; g.fillRect(0, 20, 200, 300); g.fillStyle = "#b5523b"; g.fillRect(0, 0, 200, 24); g.fillStyle = "#4b6b8a"; for (var y = 50; y < 300; y += 50) for (var x = 20; x < 190; x += 45) g.fillRect(x, y, 26, 32); });
    SPR.hay = mk(140, 90, function (g) { g.fillStyle = "#e3c15c"; g.fillRect(0, 10, 140, 80); g.strokeStyle = "#b8952f"; g.lineWidth = 4; for (var x = 10; x < 140; x += 18) { g.beginPath(); g.moveTo(x, 12); g.lineTo(x, 88); g.stroke(); } g.fillStyle = "#c62828"; g.fillRect(0, 40, 140, 8); });
    SPR.tyres = mk(160, 90, function (g) { for (var r = 0; r < 2; r++) for (var x = 0; x < 4; x++) { g.fillStyle = "#151515"; g.fillRect(x * 40, 10 + r * 40, 38, 38); g.fillStyle = (x + r) % 2 ? "#d32f2f" : "#f2f2f2"; g.fillRect(x * 40, 22 + r * 40, 38, 12); } });
    SPR.grandstand = mk(400, 220, function (g) { g.fillStyle = "#6b7280"; g.fillRect(0, 60, 400, 160); for (var y = 70; y < 210; y += 18) for (var x = 6; x < 396; x += 9) { g.fillStyle = ["#ff66c4", "#ffffff", "#2b6cb0", "#f6c343", "#e53e3e", "#111"][(x * 7 + y * 3) % 6]; g.fillRect(x, y, 6, 8); } g.fillStyle = "#1f2937"; g.fillRect(0, 40, 400, 22); g.fillStyle = "#ff66c4"; g.font = "italic 900 18px Jost, Arial"; g.textAlign = "center"; g.fillText("DEYSCOM MOTORSPORT", 200, 57); });
    SPR.fan = mk(60, 120, function (g) { var c = ["#e53e3e", "#2b6cb0", "#f6c343", "#ff66c4", "#38a169"][Math.floor(Math.random() * 5)]; g.fillStyle = "#f0c9a0"; g.beginPath(); g.arc(30, 18, 13, 0, 7); g.fill(); g.fillStyle = c; rr(g, 12, 32, 36, 50, 8); g.fill(); g.fillStyle = "#2d3748"; g.fillRect(14, 82, 12, 38); g.fillRect(34, 82, 12, 38); });
    var board = function (txt) { return mk(90, 150, function (g) { g.fillStyle = "#555"; g.fillRect(40, 70, 10, 80); g.fillStyle = "#fff"; g.fillRect(0, 0, 90, 74); g.strokeStyle = "#111"; g.lineWidth = 6; g.strokeRect(3, 3, 84, 68); g.fillStyle = "#111"; g.font = "900 34px Arial"; g.textAlign = "center"; g.fillText(txt, 45, 50); }); };
    SPR.b150 = board("150"); SPR.b100 = board("100"); SPR.b50 = board("50");
    var chev = function (dir) { return mk(160, 120, function (g) { g.fillStyle = "#555"; g.fillRect(74, 70, 12, 50); g.fillStyle = "#fff"; g.fillRect(0, 0, 160, 76); g.fillStyle = "#d32f2f"; for (var i = 0; i < 3; i++) { g.beginPath(); var x = 20 + i * 45; if (dir > 0) { g.moveTo(x, 8); g.lineTo(x + 30, 38); g.lineTo(x, 68); g.lineTo(x + 14, 68); g.lineTo(x + 44, 38); g.lineTo(x + 14, 8); } else { g.moveTo(x + 44, 8); g.lineTo(x + 14, 38); g.lineTo(x + 44, 68); g.lineTo(x + 30, 68); g.lineTo(x, 38); g.lineTo(x + 30, 8); } g.closePath(); g.fill(); } }); };
    SPR.chevR = chev(1); SPR.chevL = chev(-1);
    SPR.coin = mk(96, 96, function (g) { var gr = g.createRadialGradient(40, 36, 6, 48, 48, 46); gr.addColorStop(0, "#ffd3ec"); gr.addColorStop(1, "#ff3fae"); g.fillStyle = gr; g.beginPath(); g.arc(48, 48, 44, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 5; g.stroke(); g.fillStyle = "#fff"; g.font = "italic 900 52px Jost, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("D", 50, 52); });
    var arch = function (txt) {
      return mk(600, 260, function (g) {
        g.fillStyle = "#111"; g.fillRect(0, 0, 30, 260); g.fillRect(570, 0, 30, 260);
        g.fillStyle = "#ff66c4"; g.fillRect(0, 0, 600, 70);
        if (txt === "META") for (var i = 0; i < 30; i++) { g.fillStyle = i % 2 ? "#000" : "#fff"; g.fillRect(i * 20, 70, 20, 14); g.fillStyle = i % 2 ? "#fff" : "#000"; g.fillRect(i * 20, 84, 20, 14); }
        g.fillStyle = "#fff"; g.font = "italic 900 44px Jost, Arial"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(txt === "META" ? "META · DEYSCOM MOTORSPORT" : "SALIDA · AX RALLY", 300, 37);
      });
    };
    SPR.arch = arch("SALIDA"); SPR.arch_finish = arch("META");
    var board2 = function () { return mk(320, 200, function (g) { g.fillStyle = "#333"; g.fillRect(40, 120, 14, 80); g.fillRect(266, 120, 14, 80); g.fillStyle = "#fff"; g.fillRect(0, 0, 320, 130); g.strokeStyle = "#ff66c4"; g.lineWidth = 8; g.strokeRect(4, 4, 312, 122); }); };
    SPR.ad_deyscom = board2();
    (function (g) { g.fillStyle = "#0b0b0e"; g.fillRect(8, 8, 304, 114); g.font = "italic 900 54px Jost, Arial"; g.textBaseline = "middle"; g.fillStyle = "#fff"; g.fillText("DEYS", 26, 58); g.fillStyle = "#ff66c4"; g.fillText("COM", 166, 58); g.fillStyle = "#fff"; g.font = "italic 600 16px Jost, Arial"; g.fillText("M O T O R S P O R T", 70, 100); })(SPR.ad_deyscom.getContext("2d"));
    [["ebc", "ebc-frenos.png"], ["hel", "hel-performance.png"], ["mishimoto", "mishimoto.png"], ["king", "king-elements.png"], ["gt2i", "gt2i.png"]].forEach(function (a) {
      SPR["ad_" + a[0]] = board2();
      var img = new Image(); img.onload = function () { var g = SPR["ad_" + a[0]].getContext("2d"), r = Math.min(280 / img.width, 100 / img.height); g.drawImage(img, 160 - img.width * r / 2, 65 - img.height * r / 2, img.width * r, img.height * r); };
      img.src = "/assets/img/patrocinadores/" + a[1];
    });
  };

  /* ---------------- coches vistos desde atrás ---------------- */
  // AX de Deyscom (proporciones reales: 1,56 m de ancho por 1,35 m de alto) y rivales de otros colores
  var drawCar = function (o, turn, brake) {
    return mk(300, 250, function (g) {
      var sk = turn * 9, cx = 150, body = o.body, rim = o.rim;
      g.fillStyle = "rgba(0,0,0,.45)"; g.beginPath(); g.ellipse(cx, 238, 140, 12, 0, 0, 7); g.fill();
      [[18, 80], [220, 282]].forEach(function (w) {
        g.fillStyle = "#0d0d0f"; rr(g, w[0], 176, w[1] - w[0], 62, 10); g.fill();
        g.fillStyle = "#1c1c20"; for (var y = 182; y < 234; y += 8) g.fillRect(w[0] + 4, y, w[1] - w[0] - 8, 3);
        g.fillStyle = rim; rr(g, w[0] + 12, 196, w[1] - w[0] - 24, 26, 5); g.fill();
      });
      g.fillStyle = body; g.beginPath(); g.moveTo(20, 200); g.lineTo(18, 150); g.quadraticCurveTo(20, 128, 34, 122); g.lineTo(266, 122); g.quadraticCurveTo(280, 128, 282, 150); g.lineTo(280, 200); g.closePath(); g.fill();
      g.strokeStyle = "#16161a"; g.lineWidth = 3; rr(g, 4, 140, 92, 46, 12); g.fill(); g.stroke(); rr(g, 204, 140, 92, 46, 12); g.fill(); g.stroke();
      g.fillStyle = "#141416"; rr(g, 8, 176, 84, 10, 4); g.fill(); rr(g, 208, 176, 84, 10, 4); g.fill();
      g.fillStyle = body; g.beginPath(); g.moveTo(40, 124); g.lineTo(62 + sk, 46); g.quadraticCurveTo(66 + sk, 38, 78 + sk, 37); g.lineTo(222 + sk, 37); g.quadraticCurveTo(234 + sk, 38, 238 + sk, 46); g.lineTo(260, 124); g.closePath(); g.fill();
      g.fillStyle = o.roof; g.beginPath(); g.moveTo(70 + sk, 38); g.lineTo(230 + sk, 38); g.lineTo(236 + sk, 46); g.lineTo(64 + sk, 46); g.closePath(); g.fill();
      if (o.wing) { g.fillStyle = o.wingCol; g.fillRect(86 + sk, 22, 8, 18); g.fillRect(206 + sk, 22, 8, 18); rr(g, 34 + sk, 14, 232, 11, 3); g.fill(); g.fillRect(30 + sk, 6, 8, 26); g.fillRect(262 + sk, 6, 8, 26); }
      var glass = g.createLinearGradient(0, 50, 0, 118); glass.addColorStop(0, "#2b394b"); glass.addColorStop(1, "#0d1219");
      g.fillStyle = glass; g.beginPath(); g.moveTo(74 + sk, 52); g.lineTo(226 + sk, 52); g.quadraticCurveTo(234 + sk, 53, 236 + sk * 0.6, 62); g.lineTo(246, 110); g.quadraticCurveTo(247, 118, 238, 118);
      g.lineTo(62, 118); g.quadraticCurveTo(53, 118, 54, 110); g.lineTo(64 + sk * 0.6, 62); g.quadraticCurveTo(66 + sk, 53, 74 + sk, 52); g.closePath(); g.fill();
      g.fillStyle = "#08090c"; rr(g, 92 + sk * 0.7, 70, 34, 30, 8); g.fill(); rr(g, 174 + sk * 0.7, 70, 34, 30, 8); g.fill();
      g.strokeStyle = "rgba(230,230,235,.75)"; g.lineWidth = 4; g.beginPath(); g.moveTo(80 + sk * 0.8, 60); g.lineTo(76, 116); g.moveTo(220 + sk * 0.8, 60); g.lineTo(224, 116); g.moveTo(80 + sk * 0.8, 62); g.lineTo(220 + sk * 0.8, 62); g.moveTo(80 + sk * 0.8, 64); g.lineTo(224, 114); g.stroke();
      g.fillStyle = "#141416"; rr(g, 16 + sk * 0.5, 104, 26, 16, 5); g.fill(); rr(g, 258 + sk * 0.5, 104, 26, 16, 5); g.fill();
      g.fillStyle = o.dark; g.fillRect(30, 124, 240, 3);
      var red = brake ? "#ff2a2a" : "#b0121b";
      [[30, 98], [202, 270]].forEach(function (t) {
        g.fillStyle = "#1a0405"; rr(g, t[0], 130, t[1] - t[0], 30, 4); g.fill();
        g.fillStyle = red; g.fillRect(t[0] + 3, 133, t[1] - t[0] - 6, 14);
        g.fillStyle = "#ff9a1f"; g.fillRect(t[0] + 3, 149, (t[1] - t[0] - 6) / 2, 8); g.fillStyle = "#e9e9ee"; g.fillRect(t[0] + 3 + (t[1] - t[0] - 6) / 2, 149, (t[1] - t[0] - 6) / 2, 8);
        if (brake) { g.fillStyle = "rgba(255,40,40,.32)"; g.fillRect(t[0] - 8, 124, t[1] - t[0] + 16, 40); }
      });
      g.strokeStyle = "#d9d9de"; g.lineWidth = 3; g.beginPath(); g.moveTo(140, 136); g.lineTo(150, 130); g.lineTo(160, 136); g.moveTo(140, 142); g.lineTo(150, 136); g.lineTo(160, 142); g.stroke();
      g.font = "italic 900 17px Jost, Arial"; g.textBaseline = "middle"; g.textAlign = "left";
      var w1 = g.measureText(o.text[0]).width, w2 = g.measureText(o.text[1]).width, x0 = cx - (w1 + w2) / 2;
      g.fillStyle = o.textCol; g.fillText(o.text[0], x0, 154); g.fillStyle = o.accent; g.fillText(o.text[1], x0 + w1, 154);
      g.fillStyle = "#141416"; rr(g, 14, 166, 272, 30, 10); g.fill();
      g.fillStyle = "#fff"; rr(g, 108, 170, 84, 20, 3); g.fill(); g.fillStyle = "#1f4fbf"; g.fillRect(108, 170, 10, 20);
      g.fillStyle = "#111"; g.font = "700 12px Arial"; g.textAlign = "center"; g.fillText(o.plate, 156, 180);
      g.fillStyle = o.accent; g.fillRect(20, 194, 260, 3);
      g.fillStyle = "#8a8a90"; rr(g, 52, 196, 22, 9, 4); g.fill();
    });
  };
  var RIVALS = [
    { body: "#f2f2f2", dark: "#cfcfd4", roof: "#1f4fbf", rim: "#cfcfd4", accent: "#1f4fbf", text: ["RALLY", "SPORT"], textCol: "#111", plate: "R 1", wing: false },
    { body: "#d62828", dark: "#a51d1d", roof: "#111", rim: "#e6e6e6", accent: "#ffd400", text: ["RED", "RACING"], textCol: "#fff", plate: "R 2", wing: true, wingCol: "#111" },
    { body: "#f6c343", dark: "#c99a24", roof: "#111", rim: "#111", accent: "#111", text: ["YELLOW", "TEAM"], textCol: "#111", plate: "R 3", wing: false },
    { body: "#1f7a43", dark: "#145a31", roof: "#f2f2f2", rim: "#f2f2f2", accent: "#f2f2f2", text: ["GREEN", "GT"], textCol: "#fff", plate: "R 4", wing: true, wingCol: "#f2f2f2" },
    { body: "#2563eb", dark: "#1d4fbf", roof: "#ff7a1a", rim: "#ff7a1a", accent: "#ff7a1a", text: ["BLUE", "SPEED"], textCol: "#fff", plate: "R 5", wing: false }
  ];
  var makeCars = function () {
    var skin = save.skin || {};
    var mine = { body: skin.white ? "#f1f1f3" : "#2b2d33", dark: skin.white ? "#d4d4d8" : "#1f2025", roof: "#ff66c4", rim: skin.gold ? "#e6b422" : "#ff66c4",
      accent: "#ff66c4", text: ["DEYS", "COM"], textCol: skin.white ? "#111" : "#fff", plate: "AX · RALLY", wing: true, wingCol: skin.wing ? "#ff66c4" : "#141416" };
    CARS.me = {};
    [["c", 0], ["l", -1], ["r", 1]].forEach(function (d) { CARS.me[d[0]] = drawCar(mine, d[1], false); CARS.me[d[0] + "b"] = drawCar(mine, d[1], true); });
    CARS.rivals = RIVALS.map(function (o) { return { c: drawCar(o, 0, false), l: drawCar(o, -1, false), r: drawCar(o, 1, false), b: drawCar(o, 0, true) }; });
  };

  /* ---------------- sonido (sintetizado, sin archivos) ---------------- */
  var AU = null;
  var audioInit = function () {
    if (AU || !(window.AudioContext || window.webkitAudioContext)) return;
    try {
      var ac = new (window.AudioContext || window.webkitAudioContext)();
      var master = ac.createGain(); master.gain.value = save.sound ? 0.5 : 0; master.connect(ac.destination);
      var eng = ac.createGain(); eng.gain.value = 0; eng.connect(master);
      var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900; lp.connect(eng);
      var o1 = ac.createOscillator(); o1.type = "sawtooth"; o1.connect(lp); o1.start();
      var o2 = ac.createOscillator(); o2.type = "square"; var g2 = ac.createGain(); g2.gain.value = 0.35; o2.connect(g2); g2.connect(lp); o2.start();
      var buf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var nz = ac.createBufferSource(); nz.buffer = buf; nz.loop = true; var bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 0.8;
      var skid = ac.createGain(); skid.gain.value = 0; nz.connect(bp); bp.connect(skid); skid.connect(master); nz.start();
      AU = { ac: ac, master: master, eng: eng, o1: o1, o2: o2, skid: skid, lp: lp };
    } catch (e) { AU = null; }
  };
  var blip = function (f1, f2, t, type, vol) {
    if (!AU || !save.sound) return;
    var ac = AU.ac, o = ac.createOscillator(), g = ac.createGain(); o.type = type || "sine";
    o.frequency.setValueAtTime(f1, ac.currentTime); o.frequency.exponentialRampToValueAtTime(f2, ac.currentTime + t);
    g.gain.setValueAtTime(vol || 0.2, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t);
    o.connect(g); g.connect(AU.master); o.start(); o.stop(ac.currentTime + t + 0.02);
  };
  var engineSound = function (sp, gas, skidAmt) {
    var gears = [0, 0.22, 0.4, 0.58, 0.76, 1.01], gi = 1; while (gi < gears.length - 1 && sp > gears[gi]) gi++;
    if (hud.gear) hud.gear.textContent = sp < 0.02 ? "N" : gi;
    if (!AU) return;
    var lo = gears[gi - 1], hi = gears[gi], rpm = (sp - lo) / (hi - lo || 1);
    var f = 55 + rpm * 95 + gi * 6, t = AU.ac.currentTime, on = running && !paused;
    AU.o1.frequency.setTargetAtTime(f, t, 0.03); AU.o2.frequency.setTargetAtTime(f * 0.5, t, 0.03);
    AU.lp.frequency.setTargetAtTime(500 + (gas ? 900 : 300) + rpm * 600, t, 0.05);
    AU.eng.gain.setTargetAtTime(on ? (0.05 + sp * 0.07 + (gas ? 0.03 : 0)) : 0, t, 0.05);
    AU.skid.gain.setTargetAtTime(on ? skidAmt * 0.12 : 0, t, 0.05);
  };
  var say = function (txt) {
    if (!save.voice || !save.sound || !window.speechSynthesis) return;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(txt); u.lang = "es-ES"; u.rate = 1.25; speechSynthesis.speak(u); } catch (e) { /* nada */ }
  };

  /* ---------------- estado de la partida ---------------- */
  var S = null, keys = {}, touch = { l: false, r: false, g: false, b: false }, raf = 0, last = 0, acc = 0, running = false, paused = false, startedAt = 0;
  var particles = [], pops = [], skyOffset = 0, hillOffset = 0, shake = 0, flash = 0;
  var hud = { t: $("[data-ax-time]"), c: $("[data-ax-coins]"), v: $("[data-ax-speed]"), p: $("[data-ax-progress]"), pos: $("[data-ax-pos]"), gear: $("[data-ax-gear]") };
  var fmtT = function (t) { var m = Math.floor(t / 60), s = t - m * 60; return m + ":" + (s < 10 ? "0" : "") + s.toFixed(2).replace(".", ","); };
  var gridRivals = function () {
    return RIVALS.map(function (o, i) {
      return { i: i, z: (i + 1) * 6 * SEG + PLAYER_Z, x: (i % 2 ? 0.5 : -0.5), tx: (i % 2 ? 0.5 : -0.5), speed: 0, vmax: MS * (0.78 + i * 0.04 + rnd() * 0.03), passed: false };
    });
  };
  var newGame = function () {
    circuit = byId[state.circuit] || CIRCUITS[0]; theme = THEMES[circuit.theme]; surface = state.surface;
    buildTrack(circuit);
    var dirt = surface === "tierra";
    S = { pos: 0, x: 0, xv: 0, speed: 0, steerSm: 0, time: 0, coins: 0, hits: 0, phase: "count", count: 3.9, done: false, token: "",
      max: MS * (dirt ? 0.94 : 1), accel: MS / 4.6, brake: -MS * 1.15, decel: -MS / 5, offDecel: -MS / 1.8, offMax: MS * (dirt ? 0.42 : 0.3),
      centrifugal: dirt ? 0.34 : 0.3, air: 0, noteIdx: 0, lastNote: -1, drift: 0, position: 6 };
    S.rivals = gridRivals();
    particles = []; pops = []; skyOffset = hillOffset = 0; shake = flash = 0;
    if (ENDPOINT) fetch(ENDPOINT + "?action=juego_inicio").then(function (r) { return r.json(); }).then(function (d) { if (S && d && d.token) S.token = d.token; }).catch(function () {});
  };

  /* ---------------- entrada: teclado, mando y táctil ---------------- */
  var input = function () {
    var steer = 0, gas = false, brake = false, hb = false;
    if (keys.ArrowLeft || keys.a || keys.A) steer -= 1;
    if (keys.ArrowRight || keys.d || keys.D) steer += 1;
    gas = !!(keys.ArrowUp || keys.w || keys.W);
    brake = !!(keys.ArrowDown || keys.s || keys.S);
    hb = !!keys[" "];
    if (touch.l) steer -= 1; if (touch.r) steer += 1; if (touch.g) gas = true; if (touch.b) brake = true;
    var gp = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; gp && i < gp.length; i++) {
      var p = gp[i]; if (!p) continue;
      var ax = p.axes[0] || 0; if (Math.abs(ax) > 0.15) steer += ax;
      if (p.buttons[14] && p.buttons[14].pressed) steer -= 1; if (p.buttons[15] && p.buttons[15].pressed) steer += 1;
      if ((p.buttons[7] && p.buttons[7].value > 0.2) || (p.buttons[0] && p.buttons[0].pressed)) gas = true;
      if ((p.buttons[6] && p.buttons[6].value > 0.2) || (p.buttons[1] && p.buttons[1].pressed)) brake = true;
      if (p.buttons[2] && p.buttons[2].pressed) hb = true;
    }
    if (save.autogas && !brake && !hb) gas = true;
    return { steer: clamp(steer, -1, 1), gas: gas, brake: brake, hb: hb };
  };

  /* ---------------- actualización ---------------- */
  var update = function (dt) {
    var dirt = surface === "tierra";
    if (S.phase === "count") {
      var before = Math.ceil(S.count - 0.9); S.count -= dt; var after = Math.ceil(S.count - 0.9);
      if (after !== before && after >= 0) blip(after > 0 ? 440 : 880, after > 0 ? 440 : 880, after > 0 ? 0.18 : 0.4, "square", 0.12);
      if (S.count <= 0.9) S.phase = "race";
      engineSound(0, false, 0);
      return;
    }
    if (S.phase !== "race") return;
    var inp = input(), pseg = findSeg(S.pos + PLAYER_Z), sp = S.speed / MS;
    S.time += dt;
    S.pos += S.speed * dt;
    // dirección suavizada; cuanto más rápido, más gira; en el aire no se gira
    S.steerSm += (inp.steer - S.steerSm) * Math.min(1, dt * 10);
    var dx = dt * 2 * sp, cent = S.centrifugal;
    var drifting = inp.hb && Math.abs(S.steerSm) > 0.3 && sp > 0.25;
    if (drifting) { cent *= dirt ? 0.45 : 0.6; S.speed -= MS * (dirt ? 0.18 : 0.3) * dt; }
    var lat = (S.air > 0 ? 0 : dx * S.steerSm * (dirt ? 1.05 : 1.15)) - dx * sp * pseg.curve * cent;
    if (dirt) { S.xv += (lat / dt - S.xv) * Math.min(1, dt * (drifting ? 4 : 7)); S.x += S.xv * dt; } else { S.xv = lat / dt; S.x += lat; }
    S.drift = drifting ? 1 : dirt ? clamp(Math.abs(pseg.curve) * sp * 0.25, 0, 1) : 0;
    // gas, freno y rozamiento
    if (inp.brake) S.speed += S.brake * dt;
    else if (inp.gas) S.speed += S.accel * dt * (1 - 0.45 * sp);
    else S.speed += S.decel * dt;
    S.gas = inp.gas; S.braking = inp.brake || inp.hb;
    var off = Math.abs(S.x) > 1;
    if (off) {
      if (S.speed > S.offMax) S.speed += S.offDecel * dt;
      if (Math.random() < 0.6) puff(true);
      // contra un árbol, una grada o un muro de neumáticos
      for (var n = 0; n < 2; n++) findSeg(S.pos + PLAYER_Z + n * SEG).sprites.forEach(function (o) {
        if (!o.solid || o.gone || o.arch) return;
        var ow = (o.w || 0.9) * 0.5;
        if (Math.abs(S.x - o.x) < ow + 0.12) { crash(0.25); S.x += (S.x > o.x ? 1 : -1) * 0.25; }
      });
    }
    S.x = clamp(S.x, -3.2, 3.2);
    S.speed = clamp(S.speed, 0, S.max);
    // saltos en crestas
    if (S.air > 0) S.air -= dt;
    else if (pseg.crest && sp > 0.62) { S.air = 0.25 + sp * 0.35; pop("¡Salto!", "#fff"); }
    skyOffset += 0.0009 * pseg.curve * sp; hillOffset += 0.0018 * pseg.curve * sp;
    // monedas
    var carW = 400 / ROAD_W;
    for (n = 0; n < 2; n++) {
      findSeg(S.pos + PLAYER_Z + n * SEG).coins.forEach(function (c) { if (!c.got && S.air <= 0 && Math.abs(S.x - c.x) < carW * 0.8) { c.got = true; S.coins++; pop("+1", "#ff66c4"); blip(990, 1480, 0.12, "triangle", 0.12); } });
    }
    updateRivals(dt);
    if (dirt && S.speed > MS * 0.15 && Math.random() < 0.35 + sp * 0.5) puff(false);
    if (shake > 0) shake -= dt; if (flash > 0) flash -= dt;
    engineSound(sp, inp.gas, Math.max(S.drift, off ? 0.6 : 0, inp.brake && sp > 0.4 ? 0.5 : 0));
    callouts();
    if (S.pos >= (LAP - 3) * SEG && !S.done) finish();
  };
  var crash = function (keep) {
    if (shake > 0.2) return;
    S.speed *= keep; S.hits++; shake = 0.45; flash = 0.2; pop("¡Golpe!", "#ffb000");
    blip(160, 60, 0.3, "sawtooth", 0.25);
  };
  var updateRivals = function (dt) {
    var pz = S.pos + PLAYER_Z, carW = 400 / ROAD_W, ahead = 0;
    S.rivals.forEach(function (r) {
      // frenan antes de las curvas cerradas, como un piloto
      var maxC = 0; for (var k = 0; k < 40; k += 4) maxC = Math.max(maxC, Math.abs(findSeg(r.z + k * SEG).curve));
      var vt = r.vmax * clamp(1.08 - maxC * 0.085, 0.42, 1);
      r.speed += (r.speed < vt ? MS / 4.4 : -MS * 0.9) * dt; r.speed = clamp(r.speed, 0, r.vmax);
      r.z += r.speed * dt;
      var gap = r.z - pz;
      // se apartan si el AX viene pegado por detrás
      if (gap > 0 && gap < SEG * 8 && Math.abs(r.x - S.x) < carW && Math.random() < 0.02) r.tx = r.x > 0 ? -0.4 : 0.4;
      r.x += (r.tx - r.x) * Math.min(1, dt * 1.5);
      if (Math.abs(gap) < SEG * 1.1 && Math.abs(r.x - S.x) < carW * 0.95 && S.speed > r.speed) { S.speed = r.speed * 0.85; crash(1); S.x += (S.x > r.x ? 1 : -1) * 0.08; }
      if (r.z >= pz) ahead++;
    });
    S.position = ahead + 1;
  };
  var callouts = function () {
    var segIdx = Math.floor((S.pos + PLAYER_Z) / SEG), look = isRally ? 90 : 70;
    while (S.noteIdx < notes.length && notes[S.noteIdx].at + notes[S.noteIdx].len < segIdx) S.noteIdx++;
    var nt = notes[S.noteIdx]; S.note = null;
    if (!nt || nt.at - segIdx > look) return;
    S.note = nt;
    if (S.lastNote !== S.noteIdx) { S.lastNote = S.noteIdx; if (isRally) say(noteText(nt, true)); }
  };
  var NUM = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis"];
  var noteGrade = function (r) { return r >= 250 ? 6 : r >= 150 ? 5 : r >= 90 ? 4 : r >= 55 ? 3 : r >= 30 ? 2 : r >= 20 ? 1 : 0; };
  var noteText = function (nt, spoken) {
    if (nt.jump) return nt.name ? nt.name : spoken ? "cresta, salto" : "Cresta · salto";
    if (nt.straight) return nt.name;
    var side = nt.dir > 0 ? "derecha" : "izquierda", g = noteGrade(nt.rad);
    if (!isRally) return (nt.name ? nt.name + " · " : "") + (nt.ang >= 150 && nt.rad < 45 ? "horquilla " : "") + side + " · " + (nt.rad < 45 ? "lenta" : nt.rad < 110 ? "media" : "rápida");
    var t = g === 0 ? "horquilla " + side : (spoken ? NUM[g] : g) + " " + side;
    if (g > 0 && nt.ang >= 110) t += " larga";
    if (nt.name) t += (spoken ? ", " : " · ") + nt.name;
    return t;
  };
  var puff = function (off) {
    if (reduceMotion || particles.length > 120) return;
    var col = surface === "tierra" || (off && isRally) ? "200,160,110" : off ? "120,150,80" : "220,220,220";
    particles.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.18, y: H - 30 + Math.random() * 10, vx: (Math.random() - 0.5) * 60, vy: -20 - Math.random() * 40, r: 8 + Math.random() * 10, a: off ? 0.8 : 0.5, col: col });
  };
  var pop = function (t, c) { pops.push({ t: t, c: c, y: H * 0.6, a: 1 }); };

  /* ---------------- dibujo ---------------- */
  var lerpCol = function (a, b, p) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    var r = (pa >> 16) + (((pb >> 16) - (pa >> 16)) * p), gg = ((pa >> 8) & 255) + ((((pb >> 8) & 255) - ((pa >> 8) & 255)) * p), bl = (pa & 255) + (((pb & 255) - (pa & 255)) * p);
    return "rgb(" + (r | 0) + "," + (gg | 0) + "," + (bl | 0) + ")";
  };
  var drawBackground = function () {
    var g = ctx.createLinearGradient(0, 0, 0, H / 2 + 40); g.addColorStop(0, theme.sky[0]); g.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (theme.night) { ctx.fillStyle = "rgba(255,255,255,.8)"; for (var i = 0; i < 60; i++) ctx.fillRect(((i * 97 + skyOffset * 3000) % W + W) % W, (i * 53) % (H / 2.4), 2, 2); }
    [0, 1].forEach(function (li) {
      ctx.fillStyle = li ? theme.hills : lerpCol(theme.hills, theme.fog, 0.45);
      ctx.beginPath(); ctx.moveTo(0, H);
      var off = ((li ? hillOffset : skyOffset) * W * (li ? 2 : 1)) % W, base = H / 2 + (li ? 30 : 10), amp = li ? 60 : 90;
      for (var x = -40; x <= W + 40; x += 20) { var hh = Math.sin((x + off) / (li ? 110 : 170)) * amp * 0.5 + Math.sin((x + off) / 57) * amp * 0.2 + amp * 0.5; ctx.lineTo(x, base - hh); }
      ctx.lineTo(W + 40, H); ctx.closePath(); ctx.fill();
    });
  };
  var render = function () {
    var base = findSeg(S.pos), bp = (S.pos % SEG) / SEG, pseg = findSeg(S.pos + PLAYER_Z), pp = ((S.pos + PLAYER_Z) % SEG) / SEG;
    var playerY = pseg.p1.world.y + (pseg.p2.world.y - pseg.p1.world.y) * pp;
    var maxy = H, x = 0, dx = -(base.curve * bp), n, seg, dirt = surface === "tierra";
    ctx.save();
    if (shake > 0 && !reduceMotion) ctx.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8);
    drawBackground();
    for (n = 0; n < DRAW; n++) segments[(base.index + n) % segments.length].cars.length = 0;
    if (S.rivals) S.rivals.forEach(function (r) { findSeg(r.z).cars.push(r); });
    for (n = 0; n < DRAW; n++) {
      seg = segments[(base.index + n) % segments.length];
      seg.looped = seg.index < base.index; seg.fog = fogOf(n);
      project(seg.p1, S.x * ROAD_W - x, playerY + CAM_H, S.pos - (seg.looped ? trackLength : 0));
      project(seg.p2, S.x * ROAD_W - x - dx, playerY + CAM_H, S.pos - (seg.looped ? trackLength : 0));
      x += dx; dx += seg.curve;
      seg.visible = !(seg.p1.camera.z <= CAM_D || seg.p2.screen.y >= seg.p1.screen.y || seg.p2.screen.y >= maxy);
      if (!seg.visible) continue;
      drawSegment(seg, dirt);
      maxy = seg.p1.screen.y; seg.clip = maxy;
    }
    var carW = 400 / ROAD_W;
    for (n = DRAW - 1; n > 0; n--) {
      seg = segments[(base.index + n) % segments.length];
      if (seg.p1.camera.z <= CAM_D) continue;
      var sc = seg.p1.screen.scale, half = sc * ROAD_W * W / 2, i;
      for (i = 0; i < seg.sprites.length; i++) {
        var o = seg.sprites[i]; if (o.gone) continue;
        var img = SPR[o.k]; if (!img) continue;
        var w = (o.w || (o.k === "building" ? 1.4 : o.k === "bush" ? 0.6 : 0.9)) * half, h = w * img.height / img.width;
        drawSprite(img, seg.p1.screen.x + o.x * half - w / 2, seg.p1.screen.y - h, w, h, seg.clip, seg.fog);
      }
      for (i = 0; i < seg.coins.length; i++) {
        var c = seg.coins[i]; if (c.got) continue;
        var cw = carW * 0.55 * half, spin = Math.abs(Math.cos(performance.now() / 260 + seg.index));
        drawSprite(SPR.coin, seg.p1.screen.x + c.x * half - cw * spin / 2, seg.p1.screen.y - cw * 1.3, cw * Math.max(0.15, spin), cw, seg.clip, seg.fog);
      }
      for (i = 0; i < seg.cars.length; i++) {
        var r = seg.cars[i], rc = CARS.rivals[r.i], ri = seg.curve > 1.5 ? rc.r : seg.curve < -1.5 ? rc.l : rc.c;
        if (S.phase === "race" && r.speed > MS * 0.05 && r.speed < r.vmax * 0.8) ri = rc.b;
        var rw = carW * half, rh = rw * 250 / 300;
        drawSprite(ri, seg.p1.screen.x + r.x * half - rw / 2, seg.p1.screen.y - rh, rw, rh, seg.clip, seg.fog);
      }
    }
    particles.forEach(function (p) { ctx.fillStyle = "rgba(" + p.col + "," + p.a.toFixed(2) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
    // el AX
    var tall = W / H < 1.2, cw2 = W * 0.2 * (tall ? 1.25 : 1), ch2 = cw2 * 250 / 300, carUp = tall && isTouch ? 96 : 0;
    var lift = S.air > 0 ? Math.sin(Math.min(1, S.air) * Math.PI) * 26 : 0;
    var bounce = S.phase === "race" ? Math.random() * (S.speed / MS) * (dirt ? 3 : 1.2) : 0;
    var st = S.steerSm || 0, key = (st < -0.3 ? "l" : st > 0.3 ? "r" : "c") + (S.braking ? "b" : "");
    ctx.save();
    if (S.drift > 0.5 && !reduceMotion) { ctx.translate(W / 2, H - 12 - ch2 / 2); ctx.rotate(st * 0.08); ctx.translate(-W / 2, -(H - 12 - ch2 / 2)); }
    ctx.drawImage(CARS.me[key], W / 2 - cw2 / 2, H - ch2 - 8 - bounce - lift - carUp, cw2, ch2);
    ctx.restore();
    pops.forEach(function (p) { ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.c; ctx.font = "italic 900 34px Jost, Arial"; ctx.textAlign = "center"; ctx.fillText(p.t, W / 2, p.y); ctx.globalAlpha = 1; });
    if (flash > 0) { ctx.fillStyle = "rgba(255,80,80," + (flash * 1.2).toFixed(2) + ")"; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    drawMinimap();
    if (S.note && S.phase === "race") drawNote(S.note);
    if (S.phase === "count") drawCountdown();
  };
  var drawSegment = function (seg, dirt) {
    var p1 = seg.p1.screen, p2 = seg.p2.screen, d = seg.dark, fog = seg.fog;
    var mix = function (c) { return fog < 0.98 ? lerpCol(c, theme.fog, 1 - fog) : c; };
    ctx.fillStyle = mix(theme.grass[d]); ctx.fillRect(0, p2.y, W, p1.y - p2.y);
    // escapatoria de grava por fuera de las curvas de los circuitos
    if (!isRally && seg.gravel) {
      var gx1 = p1.x + seg.gravel * p1.w, gx2 = p2.x + seg.gravel * p2.w, gw1 = p1.w * 0.9 * seg.gravel, gw2 = p2.w * 0.9 * seg.gravel;
      poly(gx1, p1.y, gx1 + gw1, p1.y, gx2 + gw2, p2.y, gx2, p2.y, mix(d ? "#d9c79a" : "#e0cfa4"));
    }
    var road = dirt ? (d ? "#a97a4c" : "#b48555") : (d ? "#5f5f64" : "#68686d");
    var r1 = p1.w / 7, r2 = p2.w / 7;
    if (isRally) {
      var edge = dirt ? (d ? "#8d6640" : "#97703f") : (d ? "#7b7b80" : "#85858a");
      poly(p1.x - p1.w - r1 * 0.6, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2 * 0.6, p2.y, mix(edge));
      poly(p1.x + p1.w + r1 * 0.6, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x + p2.w + r2 * 0.6, p2.y, mix(edge));
    } else if (seg.kerb) {
      var kc = d ? "#d32f2f" : "#f5f5f5";
      poly(p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y, mix(kc));
      poly(p1.x + p1.w + r1, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x + p2.w + r2, p2.y, mix(kc));
    }
    poly(p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y, mix(road));
    if (seg.start || seg.finish) {
      var cells = 12, c1 = p1.w * 2 / cells, c2 = p2.w * 2 / cells;
      for (var i = 0; i < cells; i++) poly(p1.x - p1.w + i * c1, p1.y, p1.x - p1.w + (i + 1) * c1, p1.y, p2.x - p2.w + (i + 1) * c2, p2.y, p2.x - p2.w + i * c2, p2.y, (i + seg.index) % 2 ? "#111" : "#fff");
      return;
    }
    if (!dirt) {
      var e1 = p1.w / 40, e2 = p2.w / 40;
      if (!isRally || d) { poly(p1.x - p1.w, p1.y, p1.x - p1.w + e1, p1.y, p2.x - p2.w + e2, p2.y, p2.x - p2.w, p2.y, mix("#efefef")); poly(p1.x + p1.w - e1, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x + p2.w - e2, p2.y, mix("#efefef")); }
      if (d && isRally) poly(p1.x - e1, p1.y, p1.x + e1, p1.y, p2.x + e2, p2.y, p2.x - e2, p2.y, mix("#efefef"));
    } else {
      var t1 = p1.w * 0.35, t2 = p2.w * 0.35, tw1 = p1.w / 14, tw2 = p2.w / 14, rc = d ? "#9a6d42" : "#a3764a";
      poly(p1.x - t1 - tw1, p1.y, p1.x - t1 + tw1, p1.y, p2.x - t2 + tw2, p2.y, p2.x - t2 - tw2, p2.y, mix(rc));
      poly(p1.x + t1 - tw1, p1.y, p1.x + t1 + tw1, p1.y, p2.x + t2 + tw2, p2.y, p2.x + t2 - tw2, p2.y, mix(rc));
    }
  };
  var drawSprite = function (img, x, y, w, h, clipY, fog) {
    if (w < 1 || y > H || x > W || x + w < 0) return;
    var clipH = clipY ? Math.max(0, y + h - clipY) : 0;
    if (clipH >= h) return;
    ctx.globalAlpha = Math.max(0.15, Math.min(1, fog + 0.2));
    ctx.drawImage(img, 0, 0, img.width, img.height * (h - clipH) / h, x, y, w, h - clipH);
    ctx.globalAlpha = 1;
  };
  var drawMinimap = function () {
    if (!mapPts.length) return;
    var tall = W / H < 1.2, size = tall ? 100 : 140, pad = 8, x0 = W - size - 12, y0 = tall ? 140 : 84;
    var sc = (size - pad * 2) / Math.max(mapBox.w, mapBox.h), ox = x0 + pad + ((size - pad * 2) - mapBox.w * sc) / 2, oy = y0 + pad + ((size - pad * 2) - mapBox.h * sc) / 2;
    var P = function (i) { var q = mapPts[clamp(i, 0, mapPts.length - 1)]; return [ox + (q[0] - mapBox.minx) * sc, oy + (q[1] - mapBox.miny) * sc]; };
    ctx.fillStyle = "rgba(8,8,10,.62)"; rr(ctx, x0, y0, size, size, 12); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.beginPath();
    for (var i = 0; i < mapPts.length; i += 6) { var p = P(i); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }
    if (!isRally) ctx.closePath(); ctx.stroke();
    var st = P(0); ctx.fillStyle = "#fff"; ctx.fillRect(st[0] - 3, st[1] - 3, 6, 6);
    if (S.rivals) S.rivals.forEach(function (r) { var q = P(Math.floor(r.z / SEG) % LAP); ctx.fillStyle = "#cbd5e1"; ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, 7); ctx.fill(); });
    var me = P(Math.floor((S.pos + PLAYER_Z) / SEG) % LAP); ctx.fillStyle = "#ff66c4"; ctx.beginPath(); ctx.arc(me[0], me[1], 5, 0, 7); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
  };
  var drawNote = function (nt) {
    var txt = noteText(nt, false); if (!txt) return;
    var arrow = nt.jump ? "▲ " : nt.straight ? "" : nt.dir > 0 ? "➜ " : "⬅ ";
    ctx.font = "italic 900 " + (W < 700 ? 22 : 26) + "px Jost, Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var w = ctx.measureText(arrow + txt).width + 40, x = W / 2 - w / 2, y = W / H < 1.2 ? 250 : 96;
    ctx.fillStyle = nt.rad && nt.rad < 40 ? "rgba(214,36,46,.9)" : "rgba(8,8,10,.75)"; rr(ctx, x, y, w, 42, 10); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(arrow + txt, W / 2, y + 22);
  };
  var drawCountdown = function () {
    var n = Math.ceil(S.count - 0.9), lights = clamp(4 - n, 0, 3);
    ctx.fillStyle = "rgba(0,0,0,.6)"; rr(ctx, W / 2 - 115, 60, 230, 72, 14); ctx.fill();
    for (var i = 0; i < 3; i++) { ctx.fillStyle = n <= 0 ? "#2bd96b" : i < lights ? "#ff2d2d" : "#2a1517"; ctx.beginPath(); ctx.arc(W / 2 - 60 + i * 60, 96, 22, 0, 7); ctx.fill(); }
    ctx.fillStyle = "#fff"; ctx.font = "italic 900 64px Jost, Arial"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(n <= 0 ? "¡YA!" : String(n), W / 2, 220);
    ctx.font = "italic 800 " + (W < 700 ? 18 : 22) + "px Jost, Arial"; ctx.fillText(circuit.flag + " " + circuit.name, W / 2, 258);
    ctx.font = "600 " + (W < 700 ? 14 : 16) + "px Arial"; ctx.fillText(isRally ? "Tramo de rally · sigue las notas del copiloto" : "Trazado real · adelanta a 5 rivales", W / 2, 284);
  };
  var updateHud = function () {
    hud.t.textContent = fmtT(S.time); hud.c.textContent = S.coins + "/" + RULES.MAX_COINS;
    hud.v.textContent = Math.round(S.speed / MS * 192) + " km/h";
    hud.pos.textContent = "P" + (S.position || 6) + "/6";
    hud.p.style.width = clamp(S.pos / ((LAP - 3) * SEG) * 100, 0, 100).toFixed(1) + "%";
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
    var dpr = Math.min(2, window.devicePixelRatio || 1), box = canvas.parentNode, fs = root.classList.contains("is-fs");
    var portrait = !fs && box.clientWidth < 620;
    if (fs) { var ar = box.clientWidth / Math.max(1, box.clientHeight); H = 540; W = Math.round(clamp(540 * ar, 420, 1200)); }
    else { W = portrait ? 540 : 960; H = portrait ? 620 : 540; }
    canvas.style.aspectRatio = fs ? "auto" : W + " / " + H;
    if (canvas.width === Math.round(W * dpr) && canvas.height === Math.round(H * dpr)) return;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  /* ---------------- puntuación, logros y garaje ---------------- */
  var points = function (coins, t, overtakes) {
    return Math.round((coins * RULES.COIN_POINTS + Math.max(0, Math.round((RULES.PAR - t) * RULES.TIME_POINTS)) + Math.min(RULES.MAX_OVERTAKES, overtakes) * RULES.OVERTAKE_POINTS) * (surface === "tierra" ? RULES.DIRT_BONUS : 1));
  };
  var ACH = [
    ["meta", "🏁", "Primera meta", "Termina tu primera carrera"],
    ["ganador", "🥇", "Ganador", "Termina 1.º contra los rivales"],
    ["coleccionista", "🪙", "Coleccionista", "Coge 50 monedas en una carrera"],
    ["limpio", "✨", "Sin un rasguño", "Termina sin ningún golpe"],
    ["tierra", "🟫", "Rey de la tierra", "Gana en tierra"],
    ["asfalto", "⬛", "Rey del asfalto", "Gana en asfalto"],
    ["trotamundos", "🌍", "Trotamundos", "Corre en 5 recorridos distintos"],
    ["rallyman", "🗺️", "Rallyman", "Termina 3 tramos de rally distintos"],
    ["diario", "📅", "Recorrido del día", "Corre el recorrido del día"],
    ["perfecto", "💯", "Perfecto", "Coge las 60 monedas"]
  ];
  var UNLOCKS = [["gold", 150, "Llantas doradas"], ["white", 400, "Carrocería blanca Kit Car"], ["wing", 800, "Alerón rosa"]];
  var last_run = null;
  var finish = function () {
    S.done = true; S.phase = "end";
    var t = Math.round(S.time * 100) / 100, overtakes = S.rivals.filter(function (r) { return r.z < S.pos + PLAYER_Z; }).length;
    var pts = points(S.coins, t, overtakes), daily = circuit.id === DAILY, win = overtakes === RIVALS.length;
    var earned = S.coins * (daily ? 2 : 1), before = save.coins;
    save.coins += earned; save.played++;
    if (save.circuits.indexOf(circuit.id) < 0) save.circuits.push(circuit.id);
    var bkey = circuit.id + "|" + surface, isBest = !save.best[bkey] || pts > save.best[bkey], prevT = save.bestTime[bkey];
    if (isBest) save.best[bkey] = pts;
    if (!prevT || t < prevT) save.bestTime[bkey] = t;
    save.runs.push({ c: circuit.id, s: surface, p: pts, t: t, m: S.coins, d: new Date().toISOString().slice(0, 10) });
    save.runs = save.runs.sort(function (a, b) { return b.p - a.p; }).slice(0, 20);
    var got = [], give = function (id) { if (save.ach.indexOf(id) < 0) { save.ach.push(id); got.push(id); } };
    give("meta"); if (win) give("ganador"); if (S.coins >= 50) give("coleccionista"); if (!S.hits) give("limpio");
    if (win && surface === "tierra") give("tierra"); if (win && surface === "asfalto") give("asfalto");
    if (save.circuits.length >= 5) give("trotamundos");
    if (save.circuits.filter(function (id) { return byId[id] && byId[id].kind === "Rally"; }).length >= 3) give("rallyman");
    if (daily) give("diario"); if (S.coins >= RULES.MAX_COINS) give("perfecto");
    var unlocked = UNLOCKS.filter(function (u) { return before < u[1] && save.coins >= u[1]; });
    persist();
    last_run = { pts: pts, t: t, coins: S.coins, hits: S.hits, overtakes: overtakes, position: RIVALS.length + 1 - overtakes, circuit: circuit, surface: surface, token: S.token, earned: earned, daily: daily, best: isBest, prevT: prevT };
    track("ax_finish", { circuit: circuit.id, surface: surface, points: pts, position: last_run.position });
    blip(660, 990, 0.5, "triangle", 0.15); say(win ? "¡Victoria!" : "Bandera a cuadros");
    setTimeout(function () { showResults(got, unlocked); }, 900);
  };

  /* ---------------- pantallas ---------------- */
  var state = { circuit: save.lastCircuit && byId[save.lastCircuit] ? save.lastCircuit : DAILY, surface: save.lastSurface || "asfalto" };
  state.kind = byId[state.circuit].kind;
  var screens = { menu: $("[data-ax-menu]"), end: $("[data-ax-end]"), hud: $("[data-ax-hud]"), pad: $("[data-ax-pad]") };
  var show = function (name) {
    screens.menu.hidden = name !== "menu"; screens.end.hidden = name !== "end";
    screens.hud.hidden = name !== "race"; screens.pad.hidden = name !== "race";
    root.classList.toggle("is-racing", name === "race");
  };
  var drawMapPreview = function () {
    var cv = $("[data-ax-mapprev]"); if (!cv) return;
    var c = byId[state.circuit], g = cv.getContext("2d"), wv = cv.width, hv = cv.height;
    var keep = { segments: segments, notes: notes, mapPts: mapPts, mapBox: mapBox, isRally: isRally, ROAD_W: ROAD_W, theme: theme };
    theme = THEMES[c.theme]; buildTrack(c);
    var pts = mapPts, bx = mapBox, sc = (Math.min(wv, hv) - 24) / Math.max(bx.w, bx.h), ox = (wv - bx.w * sc) / 2, oy = (hv - bx.h * sc) / 2;
    g.clearRect(0, 0, wv, hv); g.strokeStyle = "#ff66c4"; g.lineWidth = 4; g.lineJoin = "round"; g.beginPath();
    for (var i = 0; i < pts.length; i += 4) { var x = ox + (pts[i][0] - bx.minx) * sc, y = oy + (pts[i][1] - bx.miny) * sc; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
    if (c.kind !== "Rally") g.closePath(); g.stroke();
    var s0 = pts[0]; g.fillStyle = "#fff"; g.fillRect(ox + (s0[0] - bx.minx) * sc - 4, oy + (s0[1] - bx.miny) * sc - 4, 8, 8);
    var corners = notes.filter(function (n) { return n.dir; }).length, named = notes.filter(function (n) { return n.name; }).slice(0, 5).map(function (n) { return n.name; });
    $("[data-ax-info]").innerHTML = "<b>" + c.flag + " " + c.name + "</b><span>" + (c.kind === "Rally" ? "Tramo de " : "Circuito de ") + String(c.km).replace(".", ",") + " km · " + corners + " curvas" + (c.kind === "Rally" ? " · inspirado en el tramo real" : " · trazado real") + "</span>" +
      (named.length ? "<small>" + named.join(" · ") + "</small>" : "");
    segments = keep.segments; notes = keep.notes; mapPts = keep.mapPts; mapBox = keep.mapBox; isRally = keep.isRally; ROAD_W = keep.ROAD_W; theme = keep.theme;
  };
  var renderMenu = function () {
    var list = $("[data-ax-circuits]");
    list.innerHTML = CIRCUITS.filter(function (c) { return c.kind === state.kind; }).map(function (c) {
      var b = Math.max(save.best[c.id + "|tierra"] || 0, save.best[c.id + "|asfalto"] || 0);
      return '<button type="button" class="ax-circ' + (c.id === state.circuit ? " is-on" : "") + '" data-c="' + c.id + '" aria-pressed="' + (c.id === state.circuit) + '">' +
        '<span class="ax-circ__flag">' + c.flag + '</span><b>' + c.name + '</b><small>' + String(c.km).replace(".", ",") + " km" + (c.id === DAILY ? ' · <em>x2 monedas hoy</em>' : '') + (b ? ' · récord ' + b : '') + '</small></button>';
    }).join("");
    $$("[data-c]", list).forEach(function (b) { b.addEventListener("click", function () { state.circuit = b.getAttribute("data-c"); renderMenu(); }); });
    $$("[data-kind]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-kind") === state.kind ? "true" : "false"); });
    $$("[data-surface]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-surface") === state.surface ? "true" : "false"); });
    $("[data-ax-wallet]").textContent = save.coins;
    var sel = byId[state.circuit]; $("[data-ax-sel]").textContent = sel.flag + " " + sel.name + " · " + (state.surface === "tierra" ? "Tierra (+10 % puntos)" : "Asfalto");
    var ag = $("[data-ax-autogas]"); if (ag) ag.checked = !!save.autogas;
    var vo = $("[data-ax-voice]"); if (vo) vo.checked = !!save.voice;
    drawMapPreview(); renderGarage(); renderAch();
    if (!running) preview();
  };
  var renderGarage = function () {
    var g = $("[data-ax-garage]"); if (!g) return;
    g.innerHTML = UNLOCKS.map(function (u) {
      var on = save.coins >= u[1], act = !!(save.skin || {})[u[0]];
      return '<button type="button" class="ax-unlock' + (on ? "" : " is-locked") + (act ? " is-on" : "") + '" data-skin="' + u[0] + '"' + (on ? "" : " disabled") + '>' +
        (on ? (act ? "✓ " : "") : "🔒 ") + u[2] + '<small>' + (on ? (act ? "Puesto" : "Ponérselo") : u[1] + " monedas") + '</small></button>';
    }).join("");
    $$("[data-skin]", g).forEach(function (b) { b.addEventListener("click", function () { var k = b.getAttribute("data-skin"); save.skin = save.skin || {}; save.skin[k] = !save.skin[k]; persist(); makeCars(); applySkinSvg(); renderGarage(); if (!running) preview(); }); });
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
    $("[data-ax-achn]").textContent = save.ach.filter(function (id) { return ACH.some(function (x) { return x[0] === id; }); }).length + "/" + ACH.length;
  };
  var start = function () {
    save.lastCircuit = state.circuit; save.lastSurface = state.surface; persist();
    audioInit(); if (AU && AU.ac.state === "suspended") AU.ac.resume();
    newGame(); show("race"); running = true; paused = false; $("[data-ax-paused]").hidden = true; last = startedAt = performance.now(); acc = 0;
    keys = {}; touch = { l: false, r: false, g: false, b: false }; $$("[data-pad]").forEach(function (b) { b.classList.remove("is-on"); });
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    track("ax_start", { circuit: state.circuit, surface: state.surface });
    if (!document.fullscreenElement) { var r = canvas.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) canvas.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); }
    if (isRally) setTimeout(function () { if (S && S.phase !== "end") say(circuit.name.split("·").pop().trim() + ". Atento a las notas."); }, 300);
  };
  var stop = function () { running = false; cancelAnimationFrame(raf); if (AU) { AU.eng.gain.setTargetAtTime(0, AU.ac.currentTime, 0.05); AU.skid.gain.setTargetAtTime(0, AU.ac.currentTime, 0.05); } };

  /* ---------------- resultados y ranking ---------------- */
  var form = $("[data-ax-form]"), msg = $("[data-ax-msg]");
  var showResults = function (got, unlocked) {
    stop(); show("end");
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    var r = last_run, bonus = Math.max(0, Math.round((RULES.PAR - r.t) * RULES.TIME_POINTS));
    $("[data-ax-r-pts]").textContent = r.pts.toLocaleString("es-ES");
    $("[data-ax-r-detail]").textContent = "P" + r.position + " de 6 · " + fmtT(r.t) + (r.prevT ? " (" + (r.t <= r.prevT ? "−" : "+") + Math.abs(r.t - r.prevT).toFixed(2).replace(".", ",") + " s frente a tu mejor tiempo)" : "") +
      " · " + r.coins + " monedas × 100 + " + bonus + " por tiempo + " + r.overtakes + " adelantamientos × 150" + (r.surface === "tierra" ? " · +10 % por tierra" : "") + (r.hits ? " · " + r.hits + " golpes" : "");
    $("[data-ax-r-title]").textContent = r.position === 1 ? "¡Victoria en " + r.circuit.name + "!" : r.best ? "¡Nuevo récord personal!" : "¡Bandera a cuadros!";
    var extra = [];
    if (r.earned) extra.push("+" + r.earned + " monedas para el garaje" + (r.daily ? " (x2 recorrido del día)" : ""));
    got.forEach(function (id) { var a = ACH.filter(function (x) { return x[0] === id; })[0]; extra.push(a[1] + " Logro: " + a[2]); });
    unlocked.forEach(function (u) { extra.push("🔓 Desbloqueado: " + u[2]); });
    $("[data-ax-r-extra]").innerHTML = extra.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    msg.textContent = ""; msg.className = "form-msg";
    var p = save.player;
    $("[data-ax-known]").hidden = !p; form.hidden = !!p; $("[data-ax-save]").disabled = false;
    if (p) { $("[data-ax-known-name]").textContent = p.alias; }
    else ["alias", "nombre", "email", "telefono"].forEach(function (k) { var i = form.elements[k]; if (i && !i.value && save.draft && save.draft[k]) i.value = save.draft[k]; });
    renderMenu();
  };
  var submitScore = function (data) {
    var r = last_run;
    var body = { id: "w" + Math.random().toString(36).slice(2, 13).padEnd(11, "0"), formulario: "juego-ax", servicio: "Juego AX Rally",
      alias: data.alias, nombre: data.nombre, email: data.email, telefono: data.telefono, acepta_comunicaciones: data.comunicaciones ? "sí" : "no",
      puntos: r.pts, monedas: r.coins, tiempo: r.t, golpes: r.hits, adelantamientos: r.overtakes, circuito: r.circuit.id, superficie: r.surface, token: r.token,
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
  var GAME_KEYS = /^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|a|d|w|s|A|D|W|S| )$/;
  document.addEventListener("keydown", function (e) {
    if (!inGame()) return;
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (GAME_KEYS.test(e.key)) { keys[e.key] = true; e.preventDefault(); }
    if (e.key === "p" || e.key === "P" || e.key === "Escape") togglePause();
    if (e.key === "r" || e.key === "R") start();
    if (e.key === "m" || e.key === "M") toggleSound();
  });
  document.addEventListener("keyup", function (e) { keys[e.key] = false; if (e.key.length === 1) { keys[e.key.toLowerCase()] = false; keys[e.key.toUpperCase()] = false; } });
  window.addEventListener("blur", function () { keys = {}; });
  $$("[data-pad]").forEach(function (b) {
    var k = b.getAttribute("data-pad");
    var on = function (e) { e.preventDefault(); touch[k] = true; b.classList.add("is-on"); try { b.setPointerCapture(e.pointerId); } catch (err) { /* nada */ } };
    var off = function () { touch[k] = false; b.classList.remove("is-on"); };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("lostpointercapture", off);
    b.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  });
  var togglePause = function () { if (!inGame()) return; paused = !paused; $("[data-ax-paused]").hidden = !paused; last = performance.now(); if (paused) { keys = {}; engineSound(0, false, 0); } };
  var toggleSound = function () {
    save.sound = !save.sound; persist();
    var b = $("[data-ax-mute]"); if (b) { b.textContent = save.sound ? "🔊" : "🔇"; b.setAttribute("aria-label", save.sound ? "Silenciar" : "Activar sonido"); }
    if (AU) AU.master.gain.value = save.sound ? 0.5 : 0;
    if (!save.sound && window.speechSynthesis) speechSynthesis.cancel();
  };
  $("[data-ax-pause]").addEventListener("click", togglePause);
  $("[data-ax-paused]").addEventListener("click", togglePause);
  $("[data-ax-mute]").addEventListener("click", toggleSound);
  $("[data-ax-restart]").addEventListener("click", start);
  $("[data-ax-quit]").addEventListener("click", function () { stop(); paused = false; $("[data-ax-paused]").hidden = true; if (document.fullscreenElement) document.exitFullscreen().catch(function () {}); root.classList.remove("is-fs"); show("menu"); renderMenu(); });
  $("[data-ax-fs]").addEventListener("click", function () {
    var el = $(".ax__main");
    if (document.fullscreenElement) { document.exitFullscreen().catch(function () {}); return; }
    if (root.classList.contains("is-fs")) { root.classList.remove("is-fs"); resize(); return; }
    var fallback = function () { root.classList.add("is-fs"); resize(); };
    if (el.requestFullscreen) el.requestFullscreen().then(function () { try { screen.orientation.lock("landscape").catch(function () {}); } catch (e) { /* nada */ } }).catch(fallback);
    else fallback();
  });
  document.addEventListener("fullscreenchange", function () { root.classList.toggle("is-fs", !!document.fullscreenElement); setTimeout(function () { resize(); if (!running && circuit) preview(); }, 80); });
  document.addEventListener("visibilitychange", function () { if (document.hidden && inGame() && !paused) togglePause(); });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { en.forEach(function (x) { if (!x.isIntersecting && inGame() && !paused && !root.classList.contains("is-fs") && performance.now() - startedAt > 2500) togglePause(); }); }, { threshold: 0.2 }).observe(canvas);
  $$("[data-surface]").forEach(function (b) { b.addEventListener("click", function () { state.surface = b.getAttribute("data-surface"); renderMenu(); }); });
  $$("[data-kind]").forEach(function (b) { b.addEventListener("click", function () { state.kind = b.getAttribute("data-kind"); if (byId[state.circuit].kind !== state.kind) state.circuit = CIRCUITS.filter(function (c) { return c.kind === state.kind; })[0].id; renderMenu(); }); });
  var agEl = $("[data-ax-autogas]"); if (agEl) agEl.addEventListener("change", function () { save.autogas = agEl.checked; persist(); });
  var voEl = $("[data-ax-voice]"); if (voEl) voEl.addEventListener("change", function () { save.voice = voEl.checked; persist(); });
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
  var preview = function () {
    circuit = byId[state.circuit]; theme = THEMES[circuit.theme]; surface = state.surface; buildTrack(circuit);
    S = { pos: 0, x: 0, speed: 0, phase: "menu", time: 0, coins: 0, steerSm: 0 };
    S.rivals = gridRivals();
    render();
  };
  makeSprites(); makeCars(); resize();
  window.addEventListener("resize", function () { var w = canvas.width; resize(); if (w !== canvas.width && !running && circuit) preview(); });
  var mb = $("[data-ax-mute]"); if (mb) mb.textContent = save.sound ? "🔊" : "🔇";
  show("menu"); renderMenu(); loadRanking();
  root.classList.add("is-ready");
  // ganchos para pruebas automáticas
  if (/axdebug/.test(location.search)) window.__ax = {
    car: function (k) { return CARS.me[k || "c"].toDataURL(); }, S: function () { return S; }, jump: function (f) { S.pos = (LAP - 3) * SEG * f; },
    coins: function (n) { S.coins = n; }, curveAhead: function (k) { return findSeg(S.pos + PLAYER_Z + (k || 0) * SEG).curve; }, MS: MS,
    notes: function () { return notes.length; }, pass: function () { S.rivals.forEach(function (r) { r.z = -1e6; }); },
    circuits: function () { return CIRCUITS.map(function (c) { return c.id; }); }, set: function (id, s) { state.circuit = id; state.kind = byId[id].kind; if (s) state.surface = s; }
  };
})();
