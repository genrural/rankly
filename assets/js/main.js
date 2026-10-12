/* =========================================================
   DEYSCOM MOTORSPORT — Interacción y conversión
   ========================================================= */
(function () {
  "use strict";
  var CFG = window.DEYSCOM || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  window.dataLayer = window.dataLayer || [];
  function track(event, data) {
    var payload = Object.assign({ event: event }, data || {});
    window.dataLayer.push(payload);
    if (window.DM_USE_GTAG && typeof window.gtag === "function") window.gtag("event", event, data || {});
    if (typeof window.fbq === "function" && event === "generate_lead") window.fbq("track", "Lead", data || {});
  }

  /* ---------- Enlaces de WhatsApp con mensaje contextual ---------- */
  function waUrl(topic) {
    var msg = (CFG.whatsappMsg || "") + (topic || "vuestros servicios") + ".";
    return "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(msg);
  }
  $$("[data-wa]").forEach(function (a) {
    a.href = waUrl(a.getAttribute("data-wa") || document.body.getAttribute("data-topic"));
    a.target = "_blank"; a.rel = "noopener";
    a.addEventListener("click", function () { track("whatsapp_click", { location: a.getAttribute("data-loc") || "link" }); });
  });
  $$('a[href^="tel:"]').forEach(function (a) { a.addEventListener("click", function () { track("phone_click"); }); });
  $$('a[href^="mailto:"]').forEach(function (a) { a.addEventListener("click", function () { track("email_click"); }); });

  /* ---------- Compra directa (cursos / experiencias) ---------- */
  $$("[data-buy]").forEach(function (a) {
    var url = CFG.payLinks && CFG.payLinks[a.getAttribute("data-buy")];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
    a.addEventListener("click", function () { track("begin_checkout", { item: a.getAttribute("data-buy") }); });
  });

  /* ---------- Redes ---------- */
  $$("[data-social]").forEach(function (a) {
    var url = CFG.social && CFG.social[a.getAttribute("data-social")];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
  });

  /* ---------- Menú ---------- */
  var burger = $(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open);
    });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("nav-open"); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") document.body.classList.remove("nav-open"); });
  }
  var header = $(".header");
  var onScroll = function () { if (header) header.classList.toggle("is-scrolled", window.scrollY > 20); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Abierto / cerrado ahora (hora de Madrid) ---------- */
  function madridNow() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[o.weekday], h: parseInt(o.hour, 10) % 24 + parseInt(o.minute, 10) / 60 };
    } catch (e) { var d = new Date(); return { day: d.getDay(), h: d.getHours() + d.getMinutes() / 60 }; }
  }
  var now = madridNow();
  var slot = CFG.hours && CFG.hours[now.day];
  var isOpen = !!(slot && now.h >= slot[0] && now.h < slot[1]);
  $$("[data-open-status]").forEach(function (el) {
    el.textContent = isOpen ? "Abierto ahora · hasta las 15:00" : (window.innerWidth < 760 ? "Cerrado · L-V 7–15h" : "Cerrado ahora · L-V 07:00–15:00");
  });
  $$(".status-dot").forEach(function (d) { d.classList.toggle("is-open", isOpen); });
  $$(".hours tr[data-day]").forEach(function (tr) {
    if (tr.getAttribute("data-day").split(",").indexOf(String(now.day)) > -1) tr.classList.add("is-today");
  });

  /* ---------- Imágenes: si no existe la foto, se queda el fondo artístico ---------- */
  $$("img[data-optional]").forEach(function (img) {
    var kill = function () { img.remove(); };
    if (img.complete && img.naturalWidth === 0) kill();
    img.addEventListener("error", kill);
  });

  /* ---------- Ticker infinito ---------- */
  $$(".ticker__track").forEach(function (t) { t.innerHTML += t.innerHTML; t.setAttribute("aria-hidden", "true"); });

  /* ---------- Rayas de velocidad en el hero ---------- */
  $$(".hero__speed").forEach(function (box) {
    for (var i = 0; i < 14; i++) {
      var s = document.createElement("i");
      s.style.top = Math.random() * 100 + "%";
      s.style.width = 20 + Math.random() * 45 + "%";
      s.style.animationDelay = Math.random() * 2.4 + "s";
      s.style.animationDuration = 1.4 + Math.random() * 1.8 + "s";
      s.style.opacity = 0;
      box.appendChild(s);
    }
  });

  /* ---------- Reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("is-in"); }); }

  /* ---------- Antes / Después ---------- */
  $$(".ba").forEach(function (ba) {
    var r = $(".ba__range", ba);
    if (r) r.addEventListener("input", function () { ba.style.setProperty("--pos", r.value + "%"); });
  });

  /* ---------- Burbuja de WhatsApp ---------- */
  var wa = $(".wa-float");
  if (wa) {
    setTimeout(function () { wa.classList.add("show-bubble"); }, 6000);
    setTimeout(function () { wa.classList.remove("show-bubble"); }, 16000);
  }

  /* ---------- Aviso de cookies · Google Consent Mode v2 ---------- */
  (function () {
    var box = $("#cc"); if (!box) return;
    var KEY = "dm_consent", MAX_AGE = 1000 * 60 * 60 * 24 * 395; // se vuelve a preguntar a los 13 meses
    var read = function () { try { var c = JSON.parse(localStorage.getItem(KEY) || "null"); return c && c.v === 1 && (Date.now() - c.t) < MAX_AGE ? c : null; } catch (e) { return null; } };
    var prefs = $(".cc__prefs", box), saveBtn = $('[data-cc="save"]', box), cfgBtn = $('[data-cc="config"]', box);
    var cats = $$("[data-cc-cat]", box);
    function apply(c) {
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: c.a ? "granted" : "denied",
          ad_storage: c.m ? "granted" : "denied",
          ad_user_data: c.m ? "granted" : "denied",
          ad_personalization: c.m ? "granted" : "denied",
          personalization_storage: c.p ? "granted" : "denied"
        });
      }
      window.dataLayer.push({ event: "consent_update", consent_analytics: !!c.a, consent_ads: !!c.m, consent_personalization: !!c.p });
    }
    function save(a, m, p) {
      var c = { v: 1, t: Date.now(), a: !!a, m: !!m, p: !!p };
      try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* sin almacenamiento */ }
      apply(c); close();
    }
    function open(withPrefs) {
      var c = read() || {};
      cats.forEach(function (i) { i.checked = !!c[i.getAttribute("data-cc-cat")]; });
      prefs.hidden = !withPrefs; saveBtn.hidden = !withPrefs; cfgBtn.hidden = !!withPrefs;
      box.hidden = false; document.body.classList.add("cc-open");
      setTimeout(function () { var f = $("button:not([hidden])", box); if (f) f.focus(); }, 50);
    }
    function close() { box.hidden = true; document.body.classList.remove("cc-open"); }
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cc]"); if (!b) return;
      var act = b.getAttribute("data-cc");
      if (act === "accept") save(true, true, true);
      else if (act === "reject") save(false, false, false);
      else if (act === "config") { prefs.hidden = false; saveBtn.hidden = false; cfgBtn.hidden = true; }
      else if (act === "save") { var v = {}; cats.forEach(function (i) { v[i.getAttribute("data-cc-cat")] = i.checked; }); save(v.a, v.m, v.p); }
    });
    $$("[data-cc-open]").forEach(function (b) { b.addEventListener("click", function () { open(true); }); });
    if (!read()) open(false);
  })();

  /* ---------- Año ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- UTM / origen del lead ---------- */
  var params = new URLSearchParams(location.search);
  try {
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"].forEach(function (k) {
      if (params.get(k)) sessionStorage.setItem("dm_" + k, params.get(k));
    });
    if (!sessionStorage.getItem("dm_landing")) sessionStorage.setItem("dm_landing", location.pathname);
    if (!sessionStorage.getItem("dm_referrer")) sessionStorage.setItem("dm_referrer", document.referrer || "directo");
  } catch (e) { /* almacenamiento no disponible */ }
  function attribution() {
    var out = {};
    try {
      for (var i = 0; i < sessionStorage.length; i++) {
        var k = sessionStorage.key(i);
        if (k.indexOf("dm_") === 0) out[k.slice(3)] = sessionStorage.getItem(k);
      }
    } catch (e) { /* nada */ }
    return out;
  }

  /* ---------- Formulario por pasos ---------- */
  $$("form[data-steps]").forEach(function (form) {
    var steps = $$(".fstep", form);
    var bars = $$(".stepper i", form);
    var cur = 0;
    function show(i) {
      cur = i;
      steps.forEach(function (s, j) { s.classList.toggle("is-active", j === i); });
      bars.forEach(function (b, j) { b.classList.toggle("is-on", j <= i); });
    }
    function valid(step) {
      var ok = true;
      $$("input, select, textarea", step).forEach(function (f) {
        if (ok && !f.checkValidity()) { f.reportValidity(); ok = false; }
      });
      return ok;
    }
    $$("[data-next]", form).forEach(function (b) {
      b.addEventListener("click", function () { if (valid(steps[cur])) { show(Math.min(cur + 1, steps.length - 1)); track("form_step", { step: cur + 1 }); } });
    });
    $$("[data-prev]", form).forEach(function (b) { b.addEventListener("click", function () { show(Math.max(cur - 1, 0)); }); });
    // Avanza automáticamente al elegir una opción en el primer paso
    $$('input[type="radio"]', steps[0]).forEach(function (r) {
      r.addEventListener("change", function () { setTimeout(function () { show(1); }, 260); });
    });
    show(0);
  });

  /* ---------- Ficha de producto (merch) ---------- */
  var pdp = $("[data-product]");
  if (pdp) {
    var unit = Number(pdp.getAttribute("data-price")) || 0;
    var stage = $("[data-mock]", pdp);
    var qty = $('input[name="cantidad"]', pdp);
    var fmt = function (n) { return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n).replace(",00", ""); };
    var update = function () {
      var q = Math.max(1, Math.min(50, parseInt(qty.value, 10) || 1));
      qty.value = q;
      $$("[data-total]", pdp).forEach(function (el) { el.textContent = fmt(unit * q); });
      var ti = $("[data-total-input]", pdp); if (ti) ti.value = (unit * q).toFixed(2);
    };
    $$("[data-qty]", pdp).forEach(function (b) {
      b.addEventListener("click", function () { qty.value = (parseInt(qty.value, 10) || 1) + Number(b.getAttribute("data-qty")); update(); });
    });
    qty.addEventListener("input", update);
    $$('input[name="color"]', pdp).forEach(function (r) {
      r.addEventListener("change", function () {
        (r.getAttribute("data-style") || "").split(";").forEach(function (d) {
          var kv = d.split(":"); if (kv.length === 2) stage.style.setProperty(kv[0].trim(), kv[1].trim());
        });
        var n = $("[data-color-name]", pdp); if (n) n.textContent = r.value;
      });
    });
    $$("[data-view]", pdp).forEach(function (b) {
      b.addEventListener("click", function () {
        stage.setAttribute("data-show", b.getAttribute("data-view"));
        $$("[data-view]", pdp).forEach(function (x) { x.classList.toggle("is-on", x === b); });
      });
    });
    var order = $("[data-order]", pdp);
    var openBtn = $("[data-open-order]", pdp);
    if (openBtn) openBtn.addEventListener("click", function () {
      order.hidden = false; openBtn.closest(".pdp__row").querySelector(".pdp__open").hidden = true;
      track("begin_checkout", { item: document.title, value: unit * (parseInt(qty.value, 10) || 1) });
      var f = $("input[name=nombre]", order); if (f) f.focus();
    });
    $$('input[name="entrega"]', pdp).forEach(function (r) {
      r.addEventListener("change", function () {
        var ship = r.getAttribute("data-ship") === "1";
        var a = $("[data-address]", pdp); a.hidden = !ship;
        $("textarea", a).required = ship;
      });
    });
    update();
  }

  /* ---------- Coches en venta (Wallapop vía Apps Script) ---------- */
  var stockBox = $("[data-stock]");
  if (stockBox) {
    var esc = function (t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; };
    var money = function (n, c) {
      if (n === null || n === "" || isNaN(Number(n))) return "Consultar";
      return new Intl.NumberFormat("es-ES", { style: "currency", currency: c || "EUR", maximumFractionDigits: 0 }).format(Number(n));
    };
    var empty = function () { stockBox.innerHTML = ""; var e = $("[data-stock-empty]"); if (e) e.hidden = false; };
    var render = function (res) {
      var items = (res && res.items) || [];
      if (!items.length) return empty();
      var count = $("[data-stock-count]"); if (count) count.textContent = items.length;
      stockBox.innerHTML = items.map(function (it) {
        var specs = [it.year, it.km ? Number(it.km).toLocaleString("es-ES") + " km" : "", it.fuel, it.gearbox].filter(Boolean)
          .map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
        var wa = "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent("¡Hola Deyscom! Me interesa: " + it.title + " (" + money(it.price, it.currency) + "). " + (it.url || ""));
        return '<article class="car reveal is-in">' +
          '<a class="car__media" href="' + esc(it.url) + '" target="_blank" rel="noopener">' +
            '<div class="art" aria-hidden="true"><div class="art__stripe"></div></div>' +
            (it.image ? '<img src="' + esc(it.image) + '" alt="' + esc(it.title) + '" loading="lazy">' : "") +
            (it.reserved ? '<span class="car__flag">Reservado</span>' : "") +
          "</a>" +
          '<div class="car__body">' +
            '<div class="car__price">' + money(it.price, it.currency) + "</div>" +
            "<h3>" + esc(it.title) + "</h3>" +
            (specs ? '<ul class="car__specs">' + specs + "</ul>" : "") +
            '<div class="car__cta">' +
              '<a class="btn btn--wa" href="' + wa + '" target="_blank" rel="noopener" data-track="stock_wa">Me interesa</a>' +
              '<a class="btn btn--ghost" href="' + esc(it.url) + '" target="_blank" rel="noopener">Ver en Wallapop</a>' +
            "</div>" +
          "</div>" +
        "</article>";
      }).join("");
      $$("img", stockBox).forEach(function (img) { img.addEventListener("error", function () { img.remove(); }); });
      $$('[data-track="stock_wa"]', stockBox).forEach(function (a) { a.addEventListener("click", function () { track("whatsapp_click", { location: "stock" }); }); });
    };
    if (!CFG.SHEETS_ENDPOINT) { empty(); }
    else {
      fetch(CFG.SHEETS_ENDPOINT + "?action=stock", { method: "GET" })
        .then(function (r) { return r.json(); })
        .then(render)
        .catch(empty);
    }
  }

  /* ---------- Envío de formularios → Google Sheets ---------- */
  function formToObject(form) {
    var data = {};
    new FormData(form).forEach(function (v, k) {
      if (k === "_hp") return;
      data[k] = data[k] ? data[k] + ", " + v : v;
    });
    return data;
  }
  function waFromLead(d) {
    var lines = ["¡Hola Deyscom! Os escribo desde la web:"];
    Object.keys(d).forEach(function (k) {
      if (["pagina", "fecha", "consentimiento", "formulario", "landing", "referrer", "gclid", "fbclid", "precio_unidad"].indexOf(k) > -1 || k.indexOf("utm_") === 0 || !d[k]) return;
      lines.push("• " + k.charAt(0).toUpperCase() + k.slice(1) + ": " + d[k]);
    });
    return "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  $$("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $(".form-msg", form);
      if (msg) { msg.className = "form-msg"; msg.textContent = ""; }
      if (form.elements._hp && form.elements._hp.value) return; // bot
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var btn = $('button[type="submit"]', form);
      var data = formToObject(form);
      data.formulario = form.getAttribute("data-lead");
      data.pagina = location.pathname;
      data.fecha = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
      Object.assign(data, attribution());

      var done = function (viaWa) {
        var wrap = form.closest("[data-form-wrap]") || form;
        wrap.classList.add("is-sent");
        var w = $("[data-success-wa]", wrap);
        if (w) w.href = waFromLead(data);
        if (viaWa) { var n = $("[data-success-note]", wrap); if (n) n.textContent = "Te hemos abierto WhatsApp con tu solicitud. Si no se ha abierto, pulsa el botón."; }
        track("generate_lead", { form: data.formulario, servicio: data.servicio || "" });
        var pay = $("[data-pay]", wrap);
        var slug = location.pathname.split("/").pop().replace(".html", "");
        if (pay && CFG.payLinks && CFG.payLinks[slug]) { pay.href = CFG.payLinks[slug]; pay.hidden = false; }
        wrap.scrollIntoView({ behavior: "smooth", block: "center" });
      };

      if (!CFG.SHEETS_ENDPOINT) {
        // Sin endpoint configurado: el lead no se pierde, se manda por WhatsApp.
        window.open(waFromLead(data), "_blank", "noopener");
        done(true);
        return;
      }

      if (btn) btn.classList.add("is-loading");
      var body = new URLSearchParams(); Object.keys(data).forEach(function (k) { body.append(k, data[k]); });
      fetch(CFG.SHEETS_ENDPOINT, { method: "POST", mode: "no-cors", body: body })
        .then(function () { done(false); form.reset(); })
        .catch(function () {
          if (msg) {
            msg.className = "form-msg is-error";
            msg.innerHTML = 'No hemos podido enviar el formulario. Escríbenos por <a href="' + waFromLead(data) + '" target="_blank" rel="noopener" style="text-decoration:underline">WhatsApp</a> o llama al <a href="tel:' + CFG.phone + '">' + CFG.phoneDisplay + "</a>.";
          }
        })
        .then(function () { if (btn) btn.classList.remove("is-loading"); });
    });
  });
})();
