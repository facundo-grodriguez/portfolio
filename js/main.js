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

// Demos animadas de los proyectos: cada una se escribe sola, en tres escenas, y marca la nota de cada escena.
// Solo corren cuando están a la vista. Sin JS o con movimiento reducido queda la versión fija del HTML.
// Recibos no es un chat: sus pantallas salen de js/recibos-demo.js.
// Tipos de mensaje: "bot" (izquierda), "me" (derecha), "sys" (tarjeta al centro) y "act" (toca un botón sin escribir nada).
(function () {
  var DEMOS = {
    alquileres: [
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
    ],
    whatsapp: [
      ["Preguntas frecuentes · sin IA", [
        ["me", "Hola! ¿a qué hora abren?"],
        ["bot", "Trabajamos de lunes a viernes de 10 a 19hs, y sábados de 10 a 14hs."],
        ["me", "¿aceptan stl?"],
        ["bot", "Aceptamos archivos STL y OBJ. Si no tenés el diseño, también podemos ayudarte a modelarlo."]
      ]],
      ["Intención de compra", [
        ["me", "Quiero cotizar una pieza"],
        ["bot", "¡Perfecto! Ya te conecto con alguien de ventas. En breve te escriben por acá."],
        ["sys", "Conversación derivada: el bot deja de responder y la toma una persona"],
        ["me", "¿hacen envíos?"],
        ["sys", "Sin respuesta automática: lo contesta el vendedor"]
      ]],
      ["Dashboard del equipo", [
        ["me", "¿pueden imprimir en nylon?"],
        ["bot", "¡Recibimos tu mensaje! En breve te responde alguien del equipo."],
        ["sys", "Dashboard · Pendientes de revisión\n• Sin respuesta · “¿pueden imprimir en nylon?”\n• Intención de compra · “Quiero cotizar una pieza”", ["Abrir chat", "Reactivar bot", "Marcar como atendido"]],
        ["act", "Marcar como atendido"],
        ["sys", "✓ Atendido · pasa a Resueltas recientemente"]
      ]]
    ]
  };

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  Array.prototype.forEach.call(document.querySelectorAll(".chat-demo[data-demo]"), function (demo) {
    var kind = demo.getAttribute("data-demo");
    var SCENES = DEMOS[kind];
    var notes = demo.querySelectorAll(".cd-notes li[data-scene]");
    function mark(scene) {
      notes.forEach(function (li) { li.classList.toggle("on", +li.getAttribute("data-scene") === scene); });
    }
    mark(0);
    // Recibos es un sistema web: muestra sus pantallas en vez de un chat (js/recibos-demo.js).
    var rd = kind === "recibos" && window.RecibosDemo ? window.RecibosDemo : null;
    if ((!SCENES && !rd) || reduce || !window.IntersectionObserver) return;

    var chat = demo.querySelector(".cd-chat");
    var menu = Array.prototype.slice.call(demo.querySelectorAll(".cd-menu span"));

    var visible = false, wake = null;
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && wake) { var w = wake; wake = null; w(); }
    }, { threshold: 0.35 }).observe(demo);

    // Espera el tiempo pedido, y si la demo no está a la vista (o su solapa está cerrada), espera además a que vuelva.
    function wait(ms) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          if (visible) resolve();
          else wake = resolve;
        }, ms);
      });
    }
    function el(cls, text) {
      var d = document.createElement("div");
      d.className = cls;
      if (text) d.appendChild(document.createTextNode(text));
      chat.appendChild(d);
      while (chat.children.length > 16) chat.removeChild(chat.firstChild);
      return d;
    }
    function buttons(box, list) {
      var row = document.createElement("div");
      row.className = "cd-btns";
      list.forEach(function (txt) { var sp = document.createElement("span"); sp.textContent = txt; row.appendChild(sp); });
      box.appendChild(row);
    }
    // Busca el botón que se va a tocar: en la última tarjeta con botones o en el menú de abajo.
    function findButton(text) {
      var found = null;
      var boxes = chat.querySelectorAll(".cd-bot, .cd-sys");
      var last = boxes.length ? boxes[boxes.length - 1] : null;
      if (last) Array.prototype.forEach.call(last.querySelectorAll(".cd-btns span"), function (sp) { if (sp.textContent === text) found = sp; });
      menu.forEach(function (sp) { if (sp.textContent === text) found = sp; });
      return found;
    }

    async function playScreens() {
      var app = window.RecibosDemo.mount(demo.querySelector(".rd-app"));
      var yes = function () { return true; };
      for (;;) {
        for (var s = 0; s < rd.card.length; s++) {
          mark(s);
          await app.play(rd.card[s], wait, yes);
          await wait(2500);
        }
      }
    }
    if (rd) { playScreens(); return; }

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
            if (st[0] === "bot" || st[0] === "sys") {
              if (st[0] === "bot") {
                var t = el("cd-typing");
                t.innerHTML = "<i></i><i></i><i></i>";
                await wait(1100);
                t.remove();
              } else {
                await wait(900);
              }
              var b = el("cd-m cd-" + st[0], st[1]);
              if (st[2]) buttons(b, st[2]);
              await wait(1400 + st[1].length * 60);
            } else {
              // Antes de escribir, se ve qué botón se toca.
              var tocado = findButton(st[1]);
              await wait(900);
              if (tocado) { tocado.classList.add(tocado.closest(".cd-menu") ? "tap" : "picked"); await wait(500); }
              if (st[0] === "me") el("cd-m cd-me", st[1]);
              if (tocado && tocado.closest(".cd-menu")) tocado.classList.remove("tap");
              await wait(800);
            }
          }
          await wait(3500);
        }
      }
    }
    play();
  });
})();
