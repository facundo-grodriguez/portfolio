// Simulación de las pantallas del sistema de Recibos (web hecha con React + Mantine).
// No es un chat: muestra las pantallas como son, con un cursor que hace los clics.
// La usan la tarjeta del portfolio y la página recibos.html. Datos de ejemplo.
(function () {
  var EMPRESA = "Distribuidora San Martín S.R.L.";

  // ---------- Piezas de la interfaz ----------
  function badge(txt, color, variant) { return '<span class="rd-badge rd-' + color + (variant === "light" ? " rd-light" : "") + '">' + txt + "</span>"; }
  function btn(txt, id, kind) { return '<span class="rd-btn' + (kind ? " rd-" + kind : "") + '" data-id="' + id + '">' + txt + "</span>"; }
  function back(txt) { return '<div class="rd-back">← ' + txt + "</div>"; }
  function title(txt, right) { return '<div class="rd-title"><b>' + txt + "</b>" + (right ? '<span class="rd-right">' + right + "</span>" : "") + "</div>"; }
  function field(label, value, id) { return '<label class="rd-field"><span>' + label + '</span><i data-id="' + (id || "") + '">' + value + "</i></label>"; }
  function modal(t, body, actions) {
    return '<div class="rd-overlay"><div class="rd-modal"><div class="rd-mt">' + t + "</div>" + body + '<div class="rd-actions">' + actions + "</div></div></div>";
  }
  function toast(txt, color) { return '<div class="rd-toast rd-t-' + (color || "green") + '">' + txt + "</div>"; }
  function table(head, rows) {
    return '<table class="rd-table"><thead><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr" + (r.cls ? ' class="' + r.cls + '"' : "") + ">" + r.c.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
  }

  // ---------- Pantallas ----------
  var V = {};

  V.empresaForm = function () {
    return title("Empresas", btn("Nueva empresa", "nueva", "fill")) +
      '<p class="rd-dim">Todavía no cargaste ninguna empresa.</p>' +
      modal("Nueva empresa",
        field("Razón social", EMPRESA) + field("CUIT", "30-71234567-1") + field("Domicilio", "Av. San Martín 1450, San Martín, Buenos Aires"),
        btn("Cancelar", "x", "subtle") + btn("Guardar", "guardar", "fill"));
  };
  V.empresaHome = function (t) {
    return back("Empresas") + title(EMPRESA, btn("Editar", "editar", "subtle")) +
      '<p class="rd-dim">CUIT 30-71234567-1 — Av. San Martín 1450, San Martín, Buenos Aires</p>' +
      '<div class="rd-row">' + btn("Empleados", "empleados", "light") + btn("Importaciones", "importaciones", "light") + btn("Historial de recibos", "historial", "light") + btn("Conceptos", "conceptos", "light") + "</div>" +
      (t ? toast(t) : "");
  };
  V.empleados = function (o) {
    o = o || {};
    var rows = [
      { c: ["Gómez, Laura", "27-30111222-5", o.cat ? "Vendedor A" : '<span class="rd-dim">—</span>', o.cat ? "15/03/2020" : '<span class="rd-dim">—</span>', badge("Activo", "green", "light"), btn("Editar", "editar-gomez", "subtle")] },
      { c: ["Benítez, Martín", "20-28555666-0", "Repositor", "02/08/2022", o.baja ? badge("Inactivo", "gray", "light") : badge("Activo", "green", "light"), o.baja ? btn("Reactivar", "reactivar", "subtle") : btn("Dar de baja", "baja", "subtle")] }
    ];
    if (o.baja && !o.inactivos) rows = rows.slice(0, 1);
    return back(EMPRESA) + title("Empleados", '<span class="rd-check' + (o.inactivos ? " on" : "") + '" data-id="inactivos">Mostrar inactivos</span>') +
      '<p class="rd-dim">Se crean solos al confirmar una importación, por CUIL.</p>' +
      table(["Empleado", "CUIL", "Categoría", "Ingreso", "Estado", ""], rows) +
      (o.modal ? modal("Editar empleado · Gómez, Laura", field("Categoría", o.cat ? "Vendedor A" : "", "cat") + field("Fecha de ingreso", o.cat ? "15/03/2020" : "DD/MM/YYYY") + field("Legajo", o.cat ? "101" : ""), btn("Cancelar", "x", "subtle") + btn("Guardar", "guardar", "fill")) : "") +
      (o.t ? toast(o.t) : "");
  };
  V.conceptos = function (o) {
    o = o || {};
    var pend = o.hecho ? [] : [{ c: ["Horas Extra", badge("Sin clasificar", "gray", "light"), btn("Clasificar", "clasificar", "light")] }];
    return back(EMPRESA) + title("Catálogo de conceptos") +
      '<p class="rd-dim">Se clasifica una sola vez por empresa y se reutiliza todos los meses.</p>' +
      table(["Concepto", "Tipo", ""], pend.concat([
        { c: ["Sueldo Básico", "Remunerativo", ""] },
        { c: ["Obra Social", "Deducción · Obra social", ""] },
        { c: ["ART", "Contribución patronal · ART", ""] }
      ]).concat(o.hecho ? [{ c: ["Horas Extra", "Remunerativo", ""], cls: "rd-new" }] : [])) +
      (o.modal ? V.clasificarModal() : "") + (o.t ? toast(o.t) : "");
  };
  V.clasificarModal = function () {
    return modal("Clasificar concepto",
      '<p class="rd-dim">Concepto: <b>Horas Extra</b></p>' + field("Tipo", "Remunerativo ▾", "tipo"),
      btn("Cancelar", "x", "subtle") + btn("Guardar", "guardar", "fill"));
  };
  V.importaciones = function (o) {
    o = o || {};
    var rows = [];
    if (o.nov) rows.push({ c: ["Noviembre 2026", "liquidacion-noviembre.xlsx", badge("Previsualizada", "yellow")], cls: "rd-new" });
    if (o.oct) rows.push({ c: ["Octubre 2026", "liquidacion-octubre.xlsx", badge("Confirmada", "green")] });
    rows.push({ c: ["Septiembre 2026", "liquidacion-septiembre.xlsx", badge("Confirmada", "green")] });
    return back(EMPRESA) + title("Importaciones", btn("Importar archivo", "importar", "fill")) +
      table(["Período", "Archivo", "Estado"], rows) +
      (o.modal ? modal("Importar archivo",
        '<div class="rd-two">' + field("Año", "2026") + field("Mes", o.nov ? "Noviembre" : "Octubre") + "</div>" +
        field("Excel Oficial de Importación (.xlsx)", o.file ? "📄 " + (o.nov ? "liquidacion-noviembre.xlsx" : "liquidacion-octubre.xlsx") : '<span class="rd-dim">Elegí un archivo…</span>', "archivo"),
        btn("Cancelar", "x", "subtle") + btn("Importar", "subir", "fill")) : "") +
      (o.t ? toast(o.t) : "");
  };

  // Vista previa de una importación: el corazón del sistema.
  // o.error: la fila de Horas Extra tiene "monto inválido"; o.sin: Horas Extra sin clasificar; o.conf: confirmada.
  V.previa = function (o) {
    o = o || {};
    var mes = o.nov ? "Noviembre" : "Octubre";
    var estado = o.conf ? badge("Confirmada", "green") : badge("Previsualizada", "yellow");
    var acciones = o.conf ? "" : btn("Confirmar", "confirmar", "dark") + btn("Descartar", "descartar", "red-text");
    var err = o.error ? 1 : 0, sin = o.sin ? 1 : 0;
    var revisados = 14 - err - sin;
    var pct = Math.round(revisados / 14 * 100);
    function fila(n, c, m, st) {
      var b = st === "ok" ? badge("Válida", "green") : st === "err" ? badge("Error", "red") : badge("Sin clasificar", "gray", "light");
      var accion = o.conf ? "" : (st === "sin" ? btn("Clasificar", "clasificar-" + n, "light") : btn("Corregir", "corregir-" + n, "link"));
      return { c: [n, c, m, b, accion], cls: st === "err" ? "rd-bad" : (o.flash === n ? "rd-new" : "") };
    }
    var totalesG = o.tot ? '<div class="rd-tot">Costo laboral: <b>$ 657.000,00</b> Bruto: <b>$ 522.000,00</b> Neto: <b>$ 409.050,00</b></div>' : '<div class="rd-tot">Costo laboral: <b>$ 0,00</b> Bruto: <b>$ 0,00</b> Neto: <b>$ 0,00</b></div>';
    var totalesB = o.tot ? '<div class="rd-tot">Costo laboral: <b>$ 459.000,00</b> Bruto: <b>$ 440.000,00</b> Neto: <b>$ 356.000,00</b></div>' : '<div class="rd-tot">Costo laboral: <b>$ 0,00</b> Bruto: <b>$ 0,00</b> Neto: <b>$ 0,00</b></div>';
    var estB = o.error ? badge("Con error", "red") : o.sin ? badge("1 sin clasificar", "gray", "light") : (o.warn ? badge("⚠ Advertencia", "yellow", "light") : badge("✓ 6", "green", "light"));
    return back("Importaciones") + title(mes + " 2026 — liquidacion-" + mes.toLowerCase() + ".xlsx", estado + acciones) +
      '<div class="rd-card"><div class="rd-sum"><span><b>14</b> conceptos — <b>' + revisados + "</b> revisados, <b>" + (14 - revisados) + "</b> pendientes (" + pct + '%)</span></div>' +
      '<div class="rd-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="rd-row">' + badge("Total: 14", "gray") + badge("Con error: " + err, "red", "light") + badge("Sin clasificar: " + sin, "gray", "light") + "</div></div>" +
      (o.warn ? '<div class="rd-alert rd-a-yellow"><b>Benítez, Martín · Advertencia</b>El neto varió 34% respecto del período anterior (antes: $ 266.000, ahora: $ 356.000). No bloquea la emisión.</div>' : "") +
      '<div class="rd-card"><div class="rd-emp"><b>Gómez, Laura</b><small>CUIL 27301112225</small>' + badge("✓ 8", "green", "light") + "</div>" + totalesG + "</div>" +
      '<div class="rd-card"><div class="rd-emp"><b>Benítez, Martín</b><small>CUIL 20285556660</small>' + estB + "</div>" + totalesB +
      table(["#", "Concepto", "Monto", "Estado", ""], [
        fila(10, "Sueldo Básico", "$ 380.000,00", "ok"),
        fila(11, "Presentismo", "$ 38.000,00", "ok"),
        fila(12, "Horas Extra", o.error ? '<span class="rd-redtxt">22.000,5O · monto inválido</span>' : "$ 22.000,00", o.error ? "err" : (o.sin ? "sin" : "ok")),
        fila(13, "Obra Social", "$ 41.800,00", "ok")
      ]) + "</div>" +
      (o.corregir ? modal("Corregir fila", '<p class="rd-dim">Fila 12 · Benítez, Martín · Horas Extra</p>' + field("Monto", o.corregir === 2 ? "22000" : "22.000,5O", "monto"), btn("Cancelar", "x", "subtle") + btn("Guardar", "guardar", "fill")) : "") +
      (o.clasificar ? V.clasificarModal() : "") +
      (o.confirmar ? modal("Confirmar importación", '<p class="rd-dim">Se crean o actualizan 2 empleados y la importación queda confirmada.</p>', btn("Cancelar", "x", "subtle") + btn("Confirmar", "ok", "fill")) : "") +
      (o.t ? toast(o.t, o.tc) : "");
  };

  V.emision = function (o) {
    o = o || {};
    var datos = '<div class="rd-card"><div class="rd-h4">Datos de emisión</div><div class="rd-two">' +
      field("Fecha de pago", o.datos ? "01/11/2026" : "DD/MM/YYYY", "fecha") + field("Lugar de pago", o.datos ? "Av. San Martín 1450" : "") +
      field("Fecha de pago de cargas sociales", o.datos ? "09/11/2026" : "DD/MM/YYYY") + field("Lugar de pago de cargas sociales", o.datos ? "Av. San Martín 1450" : "") +
      '</div><div class="rd-row rd-end">' + btn("Guardar", "guardar-datos", "light") + "</div></div>";
    var emitir = o.emitidos ? "" : '<div class="rd-row rd-end">' + btn("Emitir recibos", "emitir", o.datos ? "fill" : "disabled") + "</div>";
    var est = function (anulado) { return anulado ? badge("Anulado", "red", "light") : badge("Vigente", "green", "light"); };
    var lista = o.emitidos ? '<div class="rd-card"><div class="rd-title rd-small"><b>Recibos emitidos</b>' + btn("Descargar todos (ZIP)", "zip", "light") + "</div>" +
      table(["Empleado", "Período", "Estado", ""], [
        { c: ["Gómez, Laura", "Octubre 2026", est(o.anulado && !o.reemitido) , o.anulado && !o.reemitido ? btn("Reemitir", "reemitir", "light") : btn("Descargar", "descargar", "subtle") + btn("Anular", "anular", "red-text")], cls: o.reemitido ? "rd-new" : "" },
        { c: ["Benítez, Martín", "Octubre 2026", est(false), btn("Descargar", "descargar-b", "subtle")] }
      ].concat(o.reemitido ? [{ c: ['<span class="rd-dim">Gómez, Laura</span>', '<span class="rd-dim">Octubre 2026</span>', est(true), '<span class="rd-dim">reemplazado</span>'] }] : [])) + "</div>" : "";
    return back("Importaciones") + title("Octubre 2026 — liquidacion-octubre.xlsx", badge("Confirmada", "green")) +
      (o.emitidos ? "" : datos) + emitir + lista +
      (o.confirmEmitir ? modal("Emitir recibos", '<p class="rd-dim">Se va a emitir el recibo de los 2 empleados de esta importación. Un recibo emitido no se edita.</p>', btn("Cancelar", "x", "subtle") + btn("Emitir", "ok", "fill")) : "") +
      (o.anular ? modal("Anular recibo", '<p class="rd-dim">Gómez, Laura · Octubre 2026</p>' + field("Motivo (obligatorio)", o.anular === 2 ? "Categoría mal cargada" : "", "motivo"), btn("Cancelar", "x", "subtle") + btn("Anular", "ok", "red")) : "") +
      (o.t ? toast(o.t) : "");
  };

  // El PDF que genera: versión reducida del recibo Anexo III real.
  V.pdf = function () {
    return '<div class="rd-pdfwrap"><div class="rd-pdf">' +
      '<b class="rd-p-emp">' + EMPRESA + '</b><small>Av. San Martín 1450, San Martín, Buenos Aires — CUIT 30-71234567-1</small>' +
      '<div class="rd-p-h">Identificación</div><div class="rd-p-grid"><span><i>Mes/año</i>Octubre 2026</span><span><i>Apellido y nombre</i>Gómez, Laura</span><span><i>Categoría</i>Vendedor A</span><span><i>Antigüedad</i>6 años y 6 meses</span></div>' +
      '<div class="rd-p-h">Contribuciones del empleador</div><div class="rd-p-dark"><span>Costo laboral total</span><b>$ 657.000,00</b></div>' +
      '<div class="rd-p-h">Remuneración bruta y deducciones</div><div class="rd-p-l"><span>Sueldo Básico</span><span>$ 450.000,00</span></div><div class="rd-p-l"><span>Presentismo</span><span>$ 45.000,00</span></div><div class="rd-p-l"><span>Antigüedad</span><span>$ 27.000,00</span></div><div class="rd-p-dark rd-p-thin"><span>Total remunerativo</span><b>$ 522.000,00</b></div>' +
      '<div class="rd-p-h">Remuneración neta</div><div class="rd-p-net"><span>Sueldo neto</span><b>$ 409.050,00</b></div>' +
      '<div class="rd-p-foot"><span>Firma del empleado</span><i class="rd-donut"></i></div>' +
      '</div><div class="rd-pdfname">Recibo - Gómez Laura - Octubre 2026.pdf</div></div>';
  };

  V.historial = function (o) {
    o = o || {};
    return back(EMPRESA) + title("Historial de recibos", '<i class="rd-select" data-id="filtro">' + (o.filtro ? "Gómez, Laura" : "Todos los empleados") + " ▾</i>") +
      table(["Período", "Empleado", "Estado", ""], [
        { c: ["Octubre 2026", "Gómez, Laura", badge("Vigente", "green", "light") + ' <span class="rd-dim">reemite al anulado</span>', btn("Auditoría", "auditoria", "subtle")] },
        { c: ["Octubre 2026", "Gómez, Laura", badge("Anulado", "red", "light") + ' <span class="rd-dim">categoría mal cargada</span>', ""] },
        { c: ["Septiembre 2026", "Gómez, Laura", badge("Vigente", "green", "light"), ""] }
      ].concat(o.filtro ? [] : [{ c: ["Octubre 2026", "Benítez, Martín", badge("Vigente", "green", "light"), ""] }])) +
      (o.audit ? modal("Historial de auditoría", '<ul class="rd-audit"><li><b>Emitido</b> 01/11/2026 10:02</li><li><b>Anulado</b> 03/11/2026 09:15 · categoría mal cargada</li><li><b>Reemitido</b> 03/11/2026 09:17</li></ul>', btn("Cerrar", "x", "subtle")) : "");
  };

  // ---------- Motor ----------
  // Un paso es una lista de cuadros: { v: html, c: id del botón que se toca, w: ms de lectura }.
  function mount(root) {
    root.innerHTML = '<div class="rd-head"><b>Recibos de sueldo</b><span>estudio@ejemplo.com · Salir</span></div><div class="rd-screen"></div><i class="rd-cursor" aria-hidden="true"></i>';
    var screen = root.querySelector(".rd-screen");
    var cursor = root.querySelector(".rd-cursor");
    var last = null;
    function render(html) {
      if (html === last) return;
      last = html;
      screen.innerHTML = html;
      var m = screen.querySelector(".rd-modal");
      // Si hay un modal o un aviso, la pantalla se acomoda para que se vean; si no, vuelve arriba.
      screen.scrollTop = 0;
      var nuevo = screen.querySelector(".rd-new, .rd-bad, .rd-alert");
      if (!m && nuevo) screen.scrollTop = Math.max(0, nuevo.offsetTop - 70);
    }
    function point(id) {
      var el = screen.querySelector('[data-id="' + id + '"]');
      if (!el) return null;
      var r = el.getBoundingClientRect(), b = root.getBoundingClientRect();
      if (!screen.querySelector(".rd-modal")) {
        var top = el.offsetTop;
        if (r.bottom > b.bottom - 10 || r.top < b.top + 40) { screen.scrollTop = Math.max(0, top - 90); r = el.getBoundingClientRect(); }
      }
      cursor.style.transform = "translate(" + (r.left - b.left + r.width * 0.6) + "px," + (r.top - b.top + r.height * 0.6) + "px)";
      cursor.classList.add("on");
      return el;
    }
    async function play(frames, wait, alive) {
      for (var k = 0; k < frames.length; k++) {
        var f = frames[k];
        render(f.v);
        await wait(f.w || 1800);
        if (!alive()) return false;
        if (f.c) {
          var el = point(f.c);
          await wait(900);
          if (!alive()) return false;
          if (el) { el.classList.add("rd-press"); cursor.classList.add("press"); }
          await wait(450);
          cursor.classList.remove("press");
          if (!alive()) return false;
        }
      }
      cursor.classList.remove("on");
      return true;
    }
    function show(frames) { cursor.classList.remove("on"); render(frames[frames.length - 1].v); }
    return { play: play, show: show };
  }

  // ---------- Recorridos ----------
  var P = V;
  var STEPS = {
    empresa: [
      { v: P.empresaForm(), w: 2600, c: "guardar" },
      { v: P.empresaHome("Empresa creada"), w: 2600 }
    ],
    empleados: [
      { v: P.empleados(), w: 2800, c: "editar-gomez" },
      { v: P.empleados({ modal: true }), w: 1400 },
      { v: P.empleados({ modal: true, cat: true }), w: 2200, c: "guardar" },
      { v: P.empleados({ cat: true, t: "Empleado actualizado · la antigüedad se calcula sola" }), w: 2800 }
    ],
    conceptos: [
      { v: P.conceptos(), w: 2600, c: "clasificar" },
      { v: P.conceptos({ modal: true }), w: 2400, c: "guardar" },
      { v: P.conceptos({ hecho: true, t: "Concepto clasificado (1 fila(s) actualizadas en toda la empresa)" }), w: 3200 }
    ],
    listo: [
      { v: P.empresaHome(), w: 3000 }
    ],
    importar: [
      { v: P.importaciones(), w: 2200, c: "importar" },
      { v: P.importaciones({ modal: true }), w: 1600, c: "archivo" },
      { v: P.importaciones({ modal: true, file: true }), w: 1800, c: "subir" }
    ],
    revisar: [
      { v: P.previa({ error: true, sin: true }), w: 4200, c: "corregir-12" },
      { v: P.previa({ error: true, sin: true, corregir: 1 }), w: 1800 },
      { v: P.previa({ error: true, sin: true, corregir: 2 }), w: 1600, c: "guardar" },
      { v: P.previa({ sin: true, flash: 12, t: "Fila corregida" }), w: 3000 }
    ],
    clasificar: [
      { v: P.previa({ sin: true }), w: 2600, c: "clasificar-12" },
      { v: P.previa({ sin: true, clasificar: true }), w: 2400, c: "guardar" },
      { v: P.previa({ flash: 12, tot: true, t: "Concepto clasificado (1 fila(s) actualizadas en toda la empresa)" }), w: 3600 }
    ],
    validar: [
      { v: P.previa({ tot: true }), w: 2200, c: "confirmar" },
      { v: P.previa({ tot: true, confirmar: true }), w: 2400, c: "ok" },
      { v: P.previa({ tot: true, conf: true, warn: true, t: "Importación confirmada" }), w: 5200 }
    ],
    emitir: [
      { v: P.emision(), w: 2200, c: "fecha" },
      { v: P.emision({ datos: true }), w: 2000, c: "guardar-datos" },
      { v: P.emision({ datos: true, t: "Datos de emisión guardados" }), w: 1800, c: "emitir" },
      { v: P.emision({ datos: true, confirmEmitir: true }), w: 2600, c: "ok" },
      { v: P.emision({ emitidos: true, t: "Recibos emitidos correctamente" }), w: 3200 }
    ],
    pdf: [
      { v: P.emision({ emitidos: true }), w: 2000, c: "descargar" },
      { v: P.pdf(), w: 5200 }
    ],
    mesSiguiente: [
      { v: P.importaciones({ oct: true }), w: 1800, c: "importar" },
      { v: P.importaciones({ oct: true, modal: true, nov: true, file: true }), w: 1800, c: "subir" },
      { v: P.importaciones({ oct: true, nov: true, t: "Los conceptos ya clasificados se aplican solos" }), w: 3200 }
    ],
    anular: [
      { v: P.emision({ emitidos: true }), w: 2000, c: "anular" },
      { v: P.emision({ emitidos: true, anular: 1 }), w: 1400 },
      { v: P.emision({ emitidos: true, anular: 2 }), w: 1800, c: "ok" },
      { v: P.emision({ emitidos: true, anulado: true, t: "Recibo anulado" }), w: 2400, c: "reemitir" },
      { v: P.emision({ emitidos: true, anulado: true, reemitido: true, t: "Recibo reemitido" }), w: 3400 }
    ],
    historial: [
      { v: P.historial(), w: 2400, c: "filtro" },
      { v: P.historial({ filtro: true }), w: 2000, c: "auditoria" },
      { v: P.historial({ filtro: true, audit: true }), w: 4200 }
    ],
    descargar: [
      { v: P.emision({ emitidos: true }), w: 2000, c: "zip" },
      { v: P.emision({ emitidos: true, t: "Descargando recibos-octubre-2026.zip" }), w: 1600 },
      { v: P.pdf(), w: 4200 }
    ],
    baja: [
      { v: P.empleados({ cat: true }), w: 2200, c: "baja" },
      { v: P.empleados({ cat: true, baja: true, t: "Empleado dado de baja · sus recibos se conservan" }), w: 2400, c: "inactivos" },
      { v: P.empleados({ cat: true, baja: true, inactivos: true }), w: 3000 }
    ],
    c_subir: [
      { v: P.importaciones({ oct: true, modal: true, nov: true, file: true }), w: 1800, c: "subir" }
    ],
    c_revisar: [
      { v: P.previa({ nov: true, error: true }), w: 3600 }
    ],
    c_corregir: [
      { v: P.previa({ nov: true, error: true, corregir: 2 }), w: 1800, c: "guardar" },
      { v: P.previa({ nov: true, flash: 12, tot: true, t: "Fila corregida" }), w: 2400 }
    ],
    c_confirmar: [
      { v: P.previa({ nov: true, tot: true }), w: 1600, c: "confirmar" },
      { v: P.previa({ nov: true, tot: true, confirmar: true }), w: 1800, c: "ok" }
    ],
    c_guardado: [
      { v: P.previa({ nov: true, tot: true, conf: true, t: "Importación confirmada" }), w: 3000 }
    ]
  };

  STEPS.clasificarValidar = STEPS.clasificar.concat(STEPS.validar);

  // Las tres escenas de la tarjeta del portfolio.
  var CARD = [
    STEPS.importar.concat(STEPS.revisar),
    STEPS.clasificar.concat(STEPS.validar),
    STEPS.emitir.concat(STEPS.pdf)
  ];

  window.RecibosDemo = { mount: mount, steps: STEPS, card: CARD };
})();
