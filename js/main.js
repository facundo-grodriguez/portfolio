// Modo claro / oscuro: el botón alterna y recuerda la elección; sin elección, sigue al sistema.
(function () {
  var root = document.documentElement;
  var btn = document.querySelector(".theme-toggle");
  if (!btn) return;
  function label() {
    btn.setAttribute("aria-label", root.dataset.theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
  }
  btn.addEventListener("click", function () {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    label();
  });
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (err) {}
    if (saved) return;
    root.dataset.theme = e.matches ? "light" : "dark";
    label();
  });
  label();
})();

// Botón para volver arriba: aparece al bajar un rato y su borde marca cuánto se bajó.
(function () {
  var btn = document.querySelector(".to-top");
  if (!btn) return;
  function toggle() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    btn.hidden = window.scrollY < 600;
    btn.style.setProperty("--progress", max > 0 ? Math.min(window.scrollY / max, 1) : 0);
  }
  window.addEventListener("scroll", toggle, { passive: true });
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0 });
  });
  toggle();
})();

// Visor de imágenes: abre las capturas encima de la página, con el fondo borroso.
// Sin JS los enlaces siguen abriendo la imagen directamente.
(function () {
  var links = document.querySelectorAll(".shots a");
  if (!links.length) return;

  var overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Imagen ampliada");
  overlay.innerHTML =
    '<button type="button" class="lightbox-close" aria-label="Cerrar">&times;</button>' +
    '<img class="lightbox-img" alt="">';
  document.body.appendChild(overlay);

  var img = overlay.querySelector(".lightbox-img");
  var closeBtn = overlay.querySelector(".lightbox-close");
  var lastFocus = null;

  function setZoom(on) {
    overlay.classList.toggle("zoomed", on);
    if (on) {
      // Tamaño real de la captura: un zoom suave, sin pixelar.
      img.style.width = img.naturalWidth + "px";
      overlay.scrollLeft = (overlay.scrollWidth - overlay.clientWidth) / 2;
      overlay.scrollTop = 0;
    } else {
      img.style.width = "";
    }
  }

  function open(a) {
    var thumb = a.querySelector("img");
    lastFocus = a;
    img.src = a.getAttribute("href");
    img.alt = thumb ? thumb.alt : "";
    setZoom(false);
    overlay.hidden = false;
    overlay.scrollTop = 0;
    document.body.classList.add("no-scroll");
    closeBtn.focus();
  }

  function close() {
    overlay.hidden = true;
    img.removeAttribute("src");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      open(a);
    });
  });

  // Click en la imagen: zoom. Click fuera de la imagen o en la X: cierra.
  overlay.addEventListener("click", function (e) {
    if (e.target === img) setZoom(!overlay.classList.contains("zoomed"));
    else close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) close();
  });
})();

// Solapas de proyectos: teclado (flechas, Inicio, Fin) y clic.
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  if (!tabs.length) return;

  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).classList.toggle("is-active", on);
    });
    if (focus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { select(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });
})();

// Chat animado del bot de alquileres: se escribe solo, en tres escenas, y marca la nota de cada una.
// Solo corre cuando está a la vista. Sin JS o con movimiento reducido queda el chat fijo del HTML.
(function () {
  var demo = document.getElementById("chat-demo");
  if (!demo || !window.IntersectionObserver) return;
  var notes = demo.querySelectorAll(".cd-notes li[data-scene]");
  function mark(scene) {
    notes.forEach(function (li) { li.classList.toggle("on", +li.getAttribute("data-scene") === scene); });
  }
  mark(0);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var chat = demo.querySelector(".cd-chat");
  var menu = Array.prototype.slice.call(demo.querySelectorAll(".cd-menu span"));
  var SCENES = [
    ["Flujo guiado · sin IA", [
      ["me", "➕ Nueva carga"],
      ["bot", "¿Qué querés cargar?", ["👤 Persona", "🏠 Propiedad", "📄 Contrato", "💰 Pago", "💡 Gasto"]],
      ["me", "💰 Pago"],
      ["bot", "¿De qué contrato?", ["Lucas — Mitre 450", "Ana — Belgrano 1200"]],
      ["me", "Lucas — Mitre 450"],
      ["bot", "¿Qué mes paga?", ["Octubre 2026", "Noviembre 2026"]],
      ["me", "Octubre 2026"],
      ["bot", "¿Medio de pago?", ["Efectivo", "Transferencia", "Ambos"]],
      ["me", "Ambos"],
      ["bot", "¿Cuánto fue en efectivo? El resto de $ 320.000 queda como transferencia."],
      ["me", "120000"],
      ["bot", "Confirmá el pago:\nMitre 450 · Octubre 2026\nEfectivo $ 120.000 + transferencia $ 200.000", ["✅ Confirmar", "❌ Cancelar"]],
      ["me", "✅ Confirmar"],
      ["bot", "✅ Pago registrado."]
    ]],
    ["Consultas · sin IA", [
      ["me", "🔎 Consultas"],
      ["bot", "¿Qué querés consultar?", ["💰 Cobros del mes", "⚠️ Meses sin pago", "💡 Gastos sin pagar", "💵 Balance"]],
      ["me", "💵 Balance"],
      ["bot", "¿General o de una propiedad?", ["Todas", "Mitre 450", "Belgrano 1200"]],
      ["me", "Mitre 450"],
      ["bot", "💵 Mitre 450 · octubre\nIngresos: $ 320.000\nGastos: $ 41.000 (arreglo)\nNeto: $ 279.000\nLa luz la pagó el inquilino: no resta."]
    ]],
    ["Texto libre · con IA", [
      ["me", "¿Lucas debe algo?"],
      ["bot", "Lucas (Mitre 450) está al día: pagó octubre el 05/10. Noviembre vence el 10/11."],
      ["me", "¿Cuándo le toca aumento?"],
      ["bot", "En diciembre. Con el IPC pasaría de $ 320.000 a $ 352.000."]
    ]]
  ];

  var visible = false, wake = null;
  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (visible && wake) { var w = wake; wake = null; w(); }
  }, { threshold: 0.35 }).observe(demo);

  // Espera el tiempo pedido, y si el chat no está a la vista, espera además a que vuelva.
  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        if (visible) resolve();
        else wake = resolve;
      }, ms);
    });
  }
  function scrollDown() {
    while (chat.children.length > 16) chat.removeChild(chat.firstChild);
  }
  function el(cls, text) {
    var d = document.createElement("div");
    d.className = cls;
    if (text) d.appendChild(document.createTextNode(text));
    chat.appendChild(d);
    scrollDown();
    return d;
  }
  function lastButtons() {
    var bots = chat.querySelectorAll(".cd-bot");
    return bots.length ? bots[bots.length - 1].querySelectorAll(".cd-btns span") : [];
  }

  async function play() {
    for (;;) {
      chat.innerHTML = "";
      for (var s = 0; s < SCENES.length; s++) {
        mark(s);
        el("cd-tag", SCENES[s][0]);
        await wait(700);
        var steps = SCENES[s][1];
        for (var i = 0; i < steps.length; i++) {
          var st = steps[i];
          if (st[0] === "bot") {
            var t = el("cd-typing");
            t.innerHTML = "<i></i><i></i><i></i>";
            await wait(1100);
            t.remove();
            var b = el("cd-m cd-bot", st[1]);
            if (st[2]) {
              var row = document.createElement("div");
              row.className = "cd-btns";
              st[2].forEach(function (txt) { var sp = document.createElement("span"); sp.textContent = txt; row.appendChild(sp); });
              b.appendChild(row);
            }
            await wait(1400 + st[1].length * 60);
          } else {
            // Antes de "escribir", se ve qué botón se toca.
            var tocado = null;
            Array.prototype.forEach.call(lastButtons(), function (sp) { if (sp.textContent === st[1]) tocado = sp; });
            menu.forEach(function (sp) { if (sp.textContent === st[1]) tocado = sp; });
            await wait(900);
            if (tocado) { tocado.classList.add(tocado.closest(".cd-menu") ? "tap" : "picked"); await wait(500); }
            el("cd-m cd-me", st[1]);
            if (tocado && tocado.closest(".cd-menu")) tocado.classList.remove("tap");
            await wait(800);
          }
        }
        await wait(3500);
      }
    }
  }
  play();
})();
