const $ = (sel, root = document) => root.querySelector(sel);

const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const COMODIDADES = [
  ["mascotas", "🐾", "Mascotas pequeñas"],
  ["pileta", "🏊", "Pileta"],
  ["cochera", "🚗", "Cochera"],
  ["aire", "❄️", "Aire acondicionado"],
  ["ropa_blanca", "🛏️", "Ropa blanca"],
];

// Texto de cada comodidad: la cochera puede ser sólo para auto o también para camioneta
const comodidad = (p, k, ico, txt) =>
  k === "cochera" ? [p.cochera_camioneta ? "🚙" : "🚗", p.cochera_camioneta ? "Cochera para auto o camioneta" : "Cochera para auto"] :
  k === "mascotas" ? [ico, "Mascotas pequeñas (consultar por medianas o grandes)"] : [ico, txt];

// Links de WhatsApp
document.querySelectorAll(".js-wa").forEach((a) => {
  a.href = waLink("¡Hola CórdobaHOST! Quiero hacer una consulta.");
  a.target = "_blank";
  a.rel = "noopener";
});

// Menú mobile
const toggle = $(".nav-toggle");
const menu = $("#menu");
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
menu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// ---------------------------------------------------------------
// Catálogo de propiedades
// ---------------------------------------------------------------
const props = $("#props");
const filters = $("#filters");
let catalogo = [];

async function cargarPropiedades() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return ALOJAMIENTOS_EJEMPLO.map((p) => ({ ...p, ejemplo: true }));
  const url = `${SUPABASE_URL}/rest/v1/propiedades?select=*&activo=eq.true&order=destacado.desc,orden.asc,created_at.desc`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

const capacidad = (p) =>
  p.huespedes_min === p.huespedes_max
    ? `${p.huespedes_max} ${p.huespedes_max === 1 ? "huésped" : "huéspedes"}`
    : `${p.huespedes_min} a ${p.huespedes_max} huéspedes`;

const precioHtml = (p) =>
  `<span>${p.precio > 0
    ? `${p.precio_desde ? "<small>desde</small> " : ""}<b>${pesos.format(p.precio)}</b> <small>/noche</small>`
    : `<b>Consultar precio</b>`}${p.precio_nota
    ? `<small class="nota">${escapeHtml(p.precio_nota)}</small>`
    : ""}${p.limpieza > 0
    ? `<small class="extra">+ ${pesos.format(p.limpieza)} de limpieza por estadía</small>`
    : ""}</span>`;

const dorms = (p) => (p.dormitorios === 0 ? "Monoambiente" : `${p.dormitorios} ${p.dormitorios === 1 ? "dormitorio" : "dormitorios"}`);

const consultaMsg = (p) => {
  const h = filters?.huespedes.value;
  return `¡Hola CórdobaHOST! Quiero consultar disponibilidad en ${p.nombre} (${p.zona})` +
    (h ? ` para ${h === "10" ? "10 o más" : h} ${h === "1" ? "persona" : "personas"}` : "") + ".";
};

function tarjeta(p, i) {
  const foto = p.fotos?.[0];
  const iconos = [["📶", "Wi-Fi"], ...COMODIDADES.filter(([k]) => p[k]).map(([k, ico, txt]) => comodidad(p, k, ico, txt))]
    .map(([ico, txt]) => `<span title="${txt}" aria-label="${txt}">${ico}</span>`).join("");
  return `
    <article class="prop">
      <button type="button" class="prop-img${foto ? "" : " no-photo"}" data-i="${i}" aria-label="Ver ${escapeHtml(p.nombre)}">
        ${foto ? `<img src="${escapeHtml(foto)}" alt="" loading="lazy" />` : `<span>📷 Foto próximamente</span>`}
        ${p.destacado ? `<span class="badge">★ Destacada</span>` : ""}
        ${p.ejemplo ? `<span class="badge badge-demo">Ejemplo</span>` : ""}
        ${p.fotos?.length > 1 ? `<span class="badge badge-count">📷 ${p.fotos.length}</span>` : ""}
      </button>
      <div class="prop-body">
        <p class="prop-zone">${escapeHtml(p.tipo)} · ${escapeHtml(p.zona)}</p>
        <h3>${escapeHtml(p.nombre)}</h3>
        <p class="prop-facts">👤 ${capacidad(p)} · 🛏️ ${dorms(p)}</p>
        ${iconos ? `<p class="prop-icons">${iconos}</p>` : ""}
        <div class="prop-foot">
          ${precioHtml(p)}
        </div>
        <div class="prop-actions">
          <button type="button" class="btn btn-light btn-small" data-i="${i}">Ver más</button>
          <a class="btn btn-dark btn-small" target="_blank" rel="noopener" href="${waLink(consultaMsg(p))}">Consultar</a>
        </div>
      </div>
    </article>`;
}

function filtrar() {
  const f = filters;
  const h = parseInt(f.huespedes.value, 10);
  const d = parseInt(f.dormitorios.value, 10);
  const max = parseInt(f.precio.value, 10);
  const sinLimite = max >= parseInt(f.precio.max, 10);
  return catalogo.filter((p) =>
    (!h || (h >= 10 ? p.huespedes_max >= 10 : p.huespedes_min <= h && h <= p.huespedes_max)) &&
    (!f.zona.value || p.zona === f.zona.value) &&
    (!f.tipo.value || p.tipo === f.tipo.value) &&
    (!d || (d >= 4 ? p.dormitorios >= 4 : p.dormitorios === d)) &&
    (sinLimite || (p.precio > 0 && p.precio <= max)) &&
    COMODIDADES.every(([k]) => !f[k].checked || p[k]) &&
    (!f.cochera_camioneta.checked || p.cochera_camioneta)
  );
}

let visibles = [];
function render() {
  visibles = filtrar();
  props.innerHTML = visibles.map(tarjeta).join("");
  $("#emptyState").hidden = visibles.length > 0 || catalogo.length === 0;
  $("#resultCount").textContent = catalogo.length
    ? `${visibles.length} ${visibles.length === 1 ? "propiedad" : "propiedades"} · 📶 todas con Wi-Fi`
    : "";
  const precio = parseInt(filters.precio.value, 10);
  $("#precioOut").textContent = precio >= parseInt(filters.precio.max, 10) ? "Sin límite" : pesos.format(precio);
}

function opciones(select, valores) {
  [...new Set(valores)].sort((a, b) => a.localeCompare(b, "es")).forEach((v) => select.add(new Option(v, v)));
}

function prepararFiltros() {
  opciones(filters.zona, catalogo.map((p) => p.zona));
  opciones(filters.tipo, catalogo.map((p) => p.tipo));
  const precios = catalogo.map((p) => p.precio);
  const step = 5000;
  filters.precio.min = Math.floor(Math.min(...precios, 0) / step) * step;
  filters.precio.max = Math.ceil(Math.max(...precios, step) / step) * step;
  filters.precio.value = filters.precio.max;
  filters.addEventListener("input", render);
  filters.addEventListener("submit", (e) => e.preventDefault());
  filters.addEventListener("reset", () => setTimeout(() => {
    filters.precio.value = filters.precio.max;
    render();
  }));
  $("#emptyReset").addEventListener("click", () => filters.reset());
}

// Ficha de la propiedad (modal con galería)
const modal = $("#propModal");
function abrirFicha(p) {
  const fotos = p.fotos || [];
  $("#modalBody").innerHTML = `
    <div class="gallery">
      <div class="g-main${fotos.length ? "" : " no-photo"}">
        ${fotos.length ? `<img src="${escapeHtml(fotos[0])}" alt="${escapeHtml(p.nombre)}" />` : `<span>📷 Foto próximamente</span>`}
        ${fotos.length > 1 ? `<button type="button" class="g-nav g-prev" aria-label="Foto anterior">‹</button><button type="button" class="g-nav g-next" aria-label="Foto siguiente">›</button>` : ""}
      </div>
      ${fotos.length > 1 ? `<div class="g-thumbs">${fotos.map((f, i) => `<button type="button" data-f="${i}" class="${i ? "" : "on"}" aria-label="Foto ${i + 1}"><img src="${escapeHtml(f)}" alt="" loading="lazy" /></button>`).join("")}</div>` : ""}
    </div>
    <div class="m-info">
      <p class="prop-zone">${escapeHtml(p.tipo)} · ${escapeHtml(p.zona)}</p>
      <h2 id="modalTitle">${escapeHtml(p.nombre)}</h2>
      <p class="prop-facts">👤 ${capacidad(p)} · 🛏️ ${dorms(p)}${p.banos ? ` · 🚿 ${p.banos} ${p.banos === 1 ? "baño" : "baños"}` : ""}</p>
      ${p.descripcion ? `<p class="m-desc">${escapeHtml(p.descripcion)}</p>` : ""}
      <ul class="m-amen">
        <li>📶 Wi-Fi</li>
        ${COMODIDADES.map(([k, ico, txt]) => {
          if (!p[k]) return `<li class="no">${ico} ${txt}: no</li>`;
          const [i, t] = comodidad(p, k, ico, txt);
          return `<li>${i} ${t}</li>`;
        }).join("")}
      </ul>
      <div class="m-foot">
        ${precioHtml(p)}
        <a class="btn" target="_blank" rel="noopener" href="${waLink(consultaMsg(p))}">Consultar disponibilidad</a>
      </div>
      <p class="fine">La disponibilidad y el precio final se confirman por WhatsApp según las fechas.</p>
    </div>`;
  let actual = 0;
  const ver = (i) => {
    actual = (i + fotos.length) % fotos.length;
    $(".g-main img", modal).src = fotos[actual];
    modal.querySelectorAll(".g-thumbs button").forEach((b, j) => b.classList.toggle("on", j === actual));
  };
  modal.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => ver(+b.dataset.f)));
  $(".g-prev", modal)?.addEventListener("click", () => ver(actual - 1));
  $(".g-next", modal)?.addEventListener("click", () => ver(actual + 1));
  modal.showModal();
}

if (props) {
  props.addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) abrirFicha(visibles[+b.dataset.i]);
  });
  $(".modal-close", modal).addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  props.innerHTML = `<p class="on-dark">Cargando propiedades…</p>`;
  cargarPropiedades()
    .then((data) => {
      catalogo = data;
      prepararFiltros();
      render();
      if (!catalogo.length) props.innerHTML = `<p class="on-dark">Muy pronto vas a ver nuestras propiedades acá. Mientras tanto, <a href="${waLink("¡Hola CórdobaHOST! Quiero hacer una consulta.")}" target="_blank" rel="noopener">escribinos por WhatsApp</a>.</p>`;
    })
    .catch(() => {
      props.innerHTML = `<p class="on-dark">No pudimos cargar las propiedades. <a href="${waLink("¡Hola CórdobaHOST! Quiero hacer una consulta.")}" target="_blank" rel="noopener">Escribinos por WhatsApp</a> y te ayudamos.</p>`;
    });
}

// Reseñas: la sección se muestra sólo si hay reseñas cargadas
const reviews = $("#reviews");
if (reviews && RESENAS.length) {
  reviews.innerHTML = RESENAS.map((r) => `
    <figure class="review">
      <blockquote>“${escapeHtml(r.texto)}”</blockquote>
      <figcaption><b>${escapeHtml(r.autor)}</b>${r.alojamiento ? ` · ${escapeHtml(r.alojamiento)}` : ""}
        <span>★ ${escapeHtml(r.puntaje)} · ${escapeHtml(r.plataforma)}</span></figcaption>
    </figure>`).join("");
  $("#resenas").hidden = false;
  document.querySelectorAll(".js-resenas-link").forEach((a) => (a.hidden = false));
}

// Formularios de contacto → WhatsApp
document.querySelectorAll("#contactForm").forEach((f) =>
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const campos = [...f.elements]
      .filter((el) => el.name && el.name !== "nombre" && el.value.trim())
      .map((el) => `${el.closest("label").firstChild.textContent.trim()}: ${el.value.trim()}`);
    const msg = [f.dataset.intro, `Nombre: ${f.nombre.value.trim()}`, ...campos].join("\n");
    window.open(waLink(msg), "_blank", "noopener");
  })
);

// Calculadora de ingresos (página Propietarios)
const calc = $("#calc");
if (calc) {
  // Tarifa base por noche (USD) de un monoambiente en cada zona. Valores de referencia, ajustalos.
  const TARIFA_BASE = { capital: 40, carlospaz: 45, calamuchita: 50, punilla: 45, traslasierra: 45, altagracia: 40 };
  const fmt = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const updateCalc = () => {
    const noche = TARIFA_BASE[calc.zona.value] * parseFloat(calc.tipo.value);
    const ocupacion = parseInt(calc.ocupacion.value, 10);
    $("#ocupOut").textContent = `${ocupacion}%`;
    $("#calcTotal").textContent = fmt.format(noche * 30 * (ocupacion / 100));
    $("#calcNoche").textContent = `≈ ${fmt.format(noche)} por noche · ${Math.round(30 * ocupacion / 100)} noches/mes`;
  };
  calc.addEventListener("input", updateCalc);
  updateCalc();
}

// Clima en tiempo real (Open-Meteo, sin API key)
const WMO = (c) =>
  c === 0 ? ["☀️", "Despejado"] :
  c <= 2 ? ["🌤️", "Parcialmente nublado"] :
  c === 3 ? ["☁️", "Nublado"] :
  c <= 48 ? ["🌫️", "Niebla"] :
  c <= 67 ? ["🌧️", "Lluvia"] :
  c <= 77 ? ["❄️", "Nieve"] :
  c <= 82 ? ["🌦️", "Chaparrones"] : ["⛈️", "Tormenta"];

async function loadWeather() {
  const box = $("#weather");
  if (!box) return;
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=-31.42&longitude=-64.19" +
      "&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&timezone=America%2FArgentina%2FCordoba&forecast_days=6";
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const d = await res.json();
    const [ico, desc] = WMO(d.current.weather_code);
    $("#wTemp").textContent = `${Math.round(d.current.temperature_2m)}°`;
    $("#wDesc").textContent = `${ico} ${desc}`;
    const dia = new Intl.DateTimeFormat("es-AR", { weekday: "short" });
    $("#wDays").innerHTML = d.daily.time.map((t, i) => `
      <div><span>${i === 0 ? "Hoy" : dia.format(new Date(t + "T12:00")).replace(".", "")}</span>
      <b>${WMO(d.daily.weather_code[i])[0]}</b>
      <small>${Math.round(d.daily.temperature_2m_max[i])}° / ${Math.round(d.daily.temperature_2m_min[i])}°</small></div>`).join("");
  } catch {
    box.hidden = true;
  }
}
loadWeather();

// Animación al hacer scroll
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        io.unobserve(en.target);
      }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll(".guide, .stat, .card, .steps li, .checks li, .faq details, .review").forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
}

$("#year").textContent = new Date().getFullYear();
