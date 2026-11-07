// ================================================================
//  CONFIGURACIÓN DEL SITIO
// ================================================================

// Número de WhatsApp: código de país + área, sin "+" ni espacios.
const WHATSAPP_NUMBER = "5493541586458";

// Conexión con Supabase (donde el panel /admin guarda propiedades y fotos).
// La clave "anon" es pública por diseño: los permisos los controla la base de datos.
// Mientras estén vacías, la web muestra las propiedades de ejemplo de abajo.
const SUPABASE_URL = "https://lsohhjybdshihawftkpi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzb2hoanliZHNoaWhhd2Z0a3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwODQ3MDksImV4cCI6MjEwOTY2MDcwOX0.uhLoHKNgIyFHwNkiWu0OjYMBb4RC1mvssnTj3tseDcI";

// Reseñas reales de huéspedes. La sección "Reseñas" aparece sola cuando hay al menos una.
// Formato: { texto: "Todo impecable…", autor: "Nombre", alojamiento: "Casa del Lago", puntaje: "5.0", plataforma: "Google" },
const RESENAS = [];

// Propiedades de EJEMPLO: sólo se usan mientras Supabase no esté configurado.
const ALOJAMIENTOS_EJEMPLO = [
  {
    id: "ejemplo-1", nombre: "Loft Buen Pastor", zona: "Córdoba Capital", tipo: "Departamento",
    descripcion: "Departamento moderno a pasos del Paseo del Buen Pastor, ideal para escapadas urbanas y viajes de trabajo.",
    precio: 45000, huespedes_min: 1, huespedes_max: 2, dormitorios: 1, banos: 1,
    mascotas: false, pileta: false, cochera: false, aire: true, ropa_blanca: true,
    fotos: [], destacado: false,
  },
  {
    id: "ejemplo-2", nombre: "Casa del Lago", zona: "Villa Carlos Paz", tipo: "Casa",
    descripcion: "Casa luminosa con vista al lago San Roque, pileta y parrilla. Perfecta para familias.",
    precio: 120000, huespedes_min: 4, huespedes_max: 6, dormitorios: 3, banos: 2,
    mascotas: true, pileta: true, cochera: true, aire: true, ropa_blanca: true,
    fotos: [], destacado: true,
  },
  {
    id: "ejemplo-3", nombre: "Cabaña Los Pinos", zona: "Valle de Calamuchita", tipo: "Cabaña",
    descripcion: "Cabaña cálida entre pinos, a minutos del centro de Villa General Belgrano.",
    precio: 70000, huespedes_min: 2, huespedes_max: 4, dormitorios: 2, banos: 1,
    mascotas: true, pileta: false, cochera: true, aire: false, ropa_blanca: false,
    fotos: [], destacado: false,
  },
];
