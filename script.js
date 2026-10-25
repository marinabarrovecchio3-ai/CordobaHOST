// ⚙️ Configuración: reemplazá por el número real (código país + área, sin + ni espacios)
const WHATSAPP_NUMBER = "5493510000000";

// Tarifa base por noche (USD) para un monoambiente en cada zona. Valores de referencia, ajustalos.
const TARIFA_BASE = {
  capital: 40,
  carlospaz: 45,
  calamuchita: 50,
  punilla: 45,
  traslasierra: 45,
  altagracia: 40,
};

const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

// Links de WhatsApp
document.querySelectorAll(".js-wa").forEach((a) => {
  a.href = waLink("¡Hola CórdobaHOST! Quiero información sobre la administración de mi propiedad.");
  a.target = "_blank";
  a.rel = "noopener";
});

// Menú mobile
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("menu");
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

// Calculadora de ingresos
const calc = document.getElementById("calc");
const fmt = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
function updateCalc() {
  const zona = calc.zona.value;
  const factor = parseFloat(calc.tipo.value);
  const ocupacion = parseInt(calc.ocupacion.value, 10);
  const noche = TARIFA_BASE[zona] * factor;
  const total = noche * 30 * (ocupacion / 100);
  document.getElementById("ocupOut").textContent = `${ocupacion}%`;
  document.getElementById("calcTotal").textContent = fmt.format(total);
  document.getElementById("calcNoche").textContent = `≈ ${fmt.format(noche)} por noche · ${Math.round(30 * ocupacion / 100)} noches/mes`;
}
calc.addEventListener("input", updateCalc);
updateCalc();

// Formulario de contacto → WhatsApp
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  if (!f.nombre.value.trim()) {
    f.nombre.focus();
    return;
  }
  const msg = [
    "¡Hola CórdobaHOST! Quiero sumar mi propiedad.",
    `Nombre: ${f.nombre.value.trim()}`,
    `Zona: ${f.zona.value}`,
    f.tipo.value.trim() && `Propiedad: ${f.tipo.value.trim()}`,
    f.mensaje.value.trim() && `Mensaje: ${f.mensaje.value.trim()}`,
  ].filter(Boolean).join("\n");
  window.open(waLink(msg), "_blank", "noopener");
});

// Animación al hacer scroll
const io = new IntersectionObserver(
  (entries) => entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add("visible");
      io.unobserve(en.target);
    }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll(".card, .steps li, .destino, .checks li, details").forEach((el) => {
  el.classList.add("reveal");
  io.observe(el);
});

document.getElementById("year").textContent = new Date().getFullYear();
