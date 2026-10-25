const $ = (sel) => document.querySelector(sel);

const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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

// Alojamientos
const props = $("#props");
if (props) {
  props.innerHTML = ALOJAMIENTOS.map((p) => `
    <article class="prop">
      <div class="prop-img${p.foto ? "" : " no-photo"}">
        ${p.foto ? `<img src="${escapeHtml(p.foto)}" alt="${escapeHtml(p.nombre)}" loading="lazy" />` : `<span>📷 Foto próximamente</span>`}
        ${p.destacado ? `<span class="badge">★ Experiencia destacada</span>` : ""}
        ${p.ejemplo ? `<span class="badge badge-demo">Ejemplo</span>` : ""}
      </div>
      <div class="prop-body">
        <p class="prop-zone">${escapeHtml(p.zona)}</p>
        <h3>${escapeHtml(p.nombre)}</h3>
        <p class="prop-desc">${escapeHtml(p.descripcion)}</p>
        <div class="prop-foot">
          <span><b>desde USD ${escapeHtml(p.precio)}</b> <small>/noche</small></span>
          <span class="cap">👤 ${escapeHtml(p.capacidad)}</span>
        </div>
        <a class="btn btn-dark btn-small btn-block" target="_blank" rel="noopener"
           href="${waLink(`¡Hola CórdobaHOST! Quiero consultar disponibilidad en ${p.nombre} (${p.zona}).`)}">Consultar disponibilidad</a>
      </div>
    </article>`).join("");
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

// Buscador → consulta por WhatsApp
const search = $("#searchForm");
if (search) {
  const hoy = new Date().toISOString().slice(0, 10);
  search.llegada.min = hoy;
  search.salida.min = hoy;
  search.llegada.addEventListener("change", () => {
    search.salida.min = search.llegada.value || hoy;
    if (search.salida.value && search.salida.value <= search.llegada.value) search.salida.value = "";
  });
  const fecha = (v) => v.split("-").reverse().join("/");
  search.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!search.reportValidity()) return;
    const msg = [
      "¡Hola CórdobaHOST! Quiero consultar disponibilidad:",
      `Zona: ${search.zona.value}`,
      `Llegada: ${fecha(search.llegada.value)}`,
      `Salida: ${fecha(search.salida.value)}`,
      `Huéspedes: ${search.huespedes.value}`,
    ].join("\n");
    window.open(waLink(msg), "_blank", "noopener");
  });
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
  document.querySelectorAll(".prop, .guide, .stat, .card, .steps li, .checks li, .faq details, .review").forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
}

$("#year").textContent = new Date().getFullYear();
