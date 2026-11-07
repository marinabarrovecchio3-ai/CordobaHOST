// Panel de administración de propiedades (Supabase: base de datos + fotos)
const $ = (sel, root = document) => root.querySelector(sel);
const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const BUCKET = "fotos";
const NUMEROS = ["precio", "limpieza", "dormitorios", "huespedes_min", "huespedes_max", "banos", "orden"];
const CHECKS = ["mascotas", "pileta", "aire", "ropa_blanca", "activo", "destacado"];
const VISTAS = ["vNoConfig", "vLogin", "vList", "vEdit"];

const mostrar = (id) => VISTAS.forEach((v) => ($(`#${v}`).hidden = v !== id));

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2800);
}

if (!SUPABASE_URL || !SUPABASE_KEY || !window.supabase) {
  mostrar("vNoConfig");
  throw new Error("Supabase no configurado");
}

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let propiedades = [];

// ---------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------
async function entrar(session) {
  if (!session) {
    $("#userBox").hidden = true;
    mostrar("vLogin");
    return;
  }
  const email = session.user.email.toLowerCase();
  const { data } = await sb.from("admins").select("email").eq("email", email).maybeSingle();
  if (!data) {
    await sb.auth.signOut();
    $("#loginError").textContent = "Este usuario no tiene permiso para administrar la web.";
    mostrar("vLogin");
    return;
  }
  $("#userEmail").textContent = email;
  $("#userBox").hidden = false;
  await cargarLista();
  mostrar("vList");
}

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const btn = $("button", f);
  btn.disabled = true;
  $("#loginError").textContent = "";
  const { data, error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value });
  btn.disabled = false;
  if (error) {
    $("#loginError").textContent = "Email o contraseña incorrectos.";
    return;
  }
  f.reset();
  entrar(data.session);
});

$("#logout").addEventListener("click", async () => {
  await sb.auth.signOut();
  entrar(null);
});

// ---------------------------------------------------------------
// Lista
// ---------------------------------------------------------------
async function cargarLista() {
  const { data, error } = await sb.from("propiedades").select("*")
    .order("destacado", { ascending: false }).order("orden").order("created_at", { ascending: false });
  if (error) {
    $("#list").innerHTML = `<div class="a-empty">No se pudieron cargar las propiedades. Recargá la página.</div>`;
    return;
  }
  propiedades = data;
  ["zona", "tipo"].forEach((k) => {
    const base = k === "zona"
      ? ["Córdoba Capital", "Villa Carlos Paz", "Valle de Calamuchita", "Punilla", "Traslasierra", "Alta Gracia"]
      : ["Casa", "Departamento", "Cabaña", "Monoambiente", "Loft"];
    const valores = [...new Set([...base, ...data.map((p) => p[k])])];
    $(`#${k}s`).innerHTML = valores.map((v) => `<option value="${escapeHtml(v)}">`).join("");
  });
  renderLista();
}

function renderLista() {
  const q = $("#search").value.trim().toLowerCase();
  const lista = propiedades.filter((p) => !q || `${p.nombre} ${p.zona} ${p.tipo}`.toLowerCase().includes(q));
  const activas = propiedades.filter((p) => p.activo).length;
  $("#listCount").textContent = `${propiedades.length} en total · ${activas} visibles en la web`;
  if (!propiedades.length) {
    $("#list").innerHTML = `<div class="a-empty">Todavía no hay propiedades. Tocá <b>+ Nueva propiedad</b> para cargar la primera.</div>`;
    return;
  }
  $("#list").innerHTML = lista.map((p) => `
    <article class="a-item${p.activo ? "" : " off"}">
      ${p.fotos[0] ? `<img class="a-thumb" src="${escapeHtml(p.fotos[0])}" alt="" loading="lazy" />` : `<div class="a-thumb">📷</div>`}
      <div>
        <h3>${escapeHtml(p.nombre)}</h3>
        <p>${escapeHtml(p.tipo)} · ${escapeHtml(p.zona)} · ${p.huespedes_min === p.huespedes_max ? p.huespedes_max : `${p.huespedes_min} a ${p.huespedes_max}`} huéspedes · ${p.precio > 0 ? `${pesos.format(p.precio)}/noche` : "Consultar precio"}${p.limpieza > 0 ? ` + ${pesos.format(p.limpieza)} limpieza` : ""}</p>
        <div class="a-tags">
          <span class="a-tag ${p.activo ? "on" : "offt"}">${p.activo ? "Visible" : "Pausada"}</span>
          ${p.destacado ? `<span class="a-tag star">★ Destacada</span>` : ""}
          <span class="a-tag">📷 ${p.fotos.length}</span>
        </div>
      </div>
      <div class="a-actions">
        <button type="button" class="btn btn-light btn-small" data-toggle="${p.id}">${p.activo ? "Pausar" : "Publicar"}</button>
        <button type="button" class="btn btn-dark btn-small" data-edit="${p.id}">Editar</button>
      </div>
    </article>`).join("") || `<div class="a-empty">No hay resultados para “${escapeHtml(q)}”.</div>`;
}

$("#search").addEventListener("input", renderLista);

$("#list").addEventListener("click", async (e) => {
  const edit = e.target.closest("[data-edit]");
  if (edit) return abrirEdicion(propiedades.find((p) => p.id === edit.dataset.edit));
  const tog = e.target.closest("[data-toggle]");
  if (tog) {
    const p = propiedades.find((x) => x.id === tog.dataset.toggle);
    tog.disabled = true;
    const { error } = await sb.from("propiedades").update({ activo: !p.activo }).eq("id", p.id);
    if (error) {
      tog.disabled = false;
      return toast("No se pudo actualizar. Probá de nuevo.");
    }
    p.activo = !p.activo;
    renderLista();
    toast(p.activo ? "Publicada en la web" : "Pausada: ya no se ve en la web");
  }
});

$("#btnNew").addEventListener("click", () => abrirEdicion(null));

// ---------------------------------------------------------------
// Edición
// ---------------------------------------------------------------
const form = $("#editForm");
let editando = null; // { id, nueva, fotos, subidas, quitadas }

function abrirEdicion(p) {
  form.reset();
  $("#editError").textContent = "";
  $("#uploadStatus").textContent = "";
  editando = { id: p?.id || crypto.randomUUID(), nueva: !p, fotos: [...(p?.fotos || [])], subidas: [], quitadas: [] };
  $("#editTitle").textContent = p ? p.nombre : "Nueva propiedad";
  $("#btnDelete").hidden = !p;
  if (p) {
    ["nombre", "zona", "tipo", "descripcion", ...NUMEROS].forEach((k) => (form[k].value = p[k] ?? ""));
    CHECKS.forEach((k) => (form[k].checked = !!p[k]));
    form.cochera_tipo.value = p.cochera ? (p.cochera_camioneta ? "camioneta" : "auto") : "no";
  }
  renderFotos();
  mostrar("vEdit");
  window.scrollTo(0, 0);
}

const rutaDeUrl = (url) => decodeURIComponent(url.split(`/object/public/${BUCKET}/`)[1] || "");

function renderFotos() {
  const f = editando.fotos;
  $("#photos").innerHTML = f.map((url, i) => `
    <div class="a-photo">
      <img src="${escapeHtml(url)}" alt="Foto ${i + 1}" />
      ${i === 0 ? `<span class="cover">Portada</span>` : ""}
      <div class="ctrls">
        <button type="button" data-mv="${i}" data-d="-1" aria-label="Mover antes" ${i === 0 ? "disabled" : ""}>←</button>
        <button type="button" class="del" data-del="${i}" aria-label="Quitar foto">✕</button>
        <button type="button" data-mv="${i}" data-d="1" aria-label="Mover después" ${i === f.length - 1 ? "disabled" : ""}>→</button>
      </div>
    </div>`).join("") || `<p class="muted">Todavía no hay fotos.</p>`;
}

$("#photos").addEventListener("click", (e) => {
  const mv = e.target.closest("[data-mv]");
  const del = e.target.closest("[data-del]");
  const f = editando.fotos;
  if (mv) {
    const i = +mv.dataset.mv, j = i + +mv.dataset.d;
    [f[i], f[j]] = [f[j], f[i]];
  } else if (del) {
    const [url] = f.splice(+del.dataset.del, 1);
    editando.quitadas.push(url);
  } else return;
  renderFotos();
});

// Achica la foto antes de subirla (máx. 1600 px, JPEG) para que la web cargue rápido
async function comprimir(file) {
  const bmp = await createImageBitmap(file);
  const escala = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * escala);
  canvas.height = Math.round(bmp.height * escala);
  canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  return new Promise((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error("No se pudo procesar"))), "image/jpeg", 0.82));
}

$("#fileInput").addEventListener("change", async (e) => {
  const files = [...e.target.files];
  e.target.value = "";
  const status = $("#uploadStatus");
  const btnSave = $("#btnSave");
  btnSave.disabled = true;
  let fallidas = 0;
  for (const [n, file] of files.entries()) {
    status.textContent = `Subiendo ${n + 1} de ${files.length}…`;
    try {
      const blob = await comprimir(file);
      const path = `${editando.id}/${crypto.randomUUID()}.jpg`;
      const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (error) throw error;
      const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      editando.fotos.push(url);
      editando.subidas.push(url);
      renderFotos();
    } catch {
      fallidas++;
    }
  }
  btnSave.disabled = false;
  status.textContent = fallidas ? `${fallidas} foto(s) no se pudieron subir. Probá con otro archivo.` : "Fotos listas. Acordate de guardar.";
});

async function borrarArchivos(urls) {
  const paths = urls.map(rutaDeUrl).filter(Boolean);
  if (paths.length) await sb.storage.from(BUCKET).remove(paths);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("#editError");
  err.textContent = "";
  const datos = { id: editando.id, fotos: editando.fotos };
  ["nombre", "zona", "tipo", "descripcion"].forEach((k) => (datos[k] = form[k].value.trim()));
  NUMEROS.forEach((k) => (datos[k] = parseInt(form[k].value, 10) || 0));
  CHECKS.forEach((k) => (datos[k] = form[k].checked));
  datos.cochera = form.cochera_tipo.value !== "no";
  datos.cochera_camioneta = form.cochera_tipo.value === "camioneta";
  if (datos.huespedes_min > datos.huespedes_max) {
    err.textContent = "El mínimo de huéspedes no puede ser mayor que el máximo.";
    return;
  }
  const btn = $("#btnSave");
  btn.disabled = true;
  const q = editando.nueva
    ? sb.from("propiedades").insert(datos)
    : sb.from("propiedades").update(datos).eq("id", editando.id);
  const { error } = await q;
  btn.disabled = false;
  if (error) {
    err.textContent = "No se pudo guardar. Revisá los datos y probá de nuevo.";
    return;
  }
  await borrarArchivos(editando.quitadas);
  editando = null;
  toast("Guardado ✓");
  await cargarLista();
  mostrar("vList");
});

async function cancelar() {
  if (editando?.subidas.length) await borrarArchivos(editando.subidas);
  editando = null;
  mostrar("vList");
}
$("#btnCancel").addEventListener("click", cancelar);
$("#btnBack").addEventListener("click", cancelar);

$("#btnDelete").addEventListener("click", async () => {
  if (!confirm("¿Eliminar esta propiedad y todas sus fotos? No se puede deshacer.")) return;
  const original = propiedades.find((p) => p.id === editando.id);
  const { error } = await sb.from("propiedades").delete().eq("id", editando.id);
  if (error) {
    $("#editError").textContent = "No se pudo eliminar. Probá de nuevo.";
    return;
  }
  await borrarArchivos([...new Set([...(original?.fotos || []), ...editando.fotos, ...editando.quitadas])]);
  editando = null;
  toast("Propiedad eliminada");
  await cargarLista();
  mostrar("vList");
});

// Arranque
sb.auth.getSession().then(({ data }) => entrar(data.session));
