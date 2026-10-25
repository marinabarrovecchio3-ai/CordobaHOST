// ================================================================
//  DATOS DEL SITIO: editá este archivo para cambiar el contenido
// ================================================================

// Número de WhatsApp: código de país + área, sin "+" ni espacios.
const WHATSAPP_NUMBER = "5493510000000";

// Alojamientos. Para agregar fotos, poné el archivo en /img y completá "foto": "img/nombre.jpg".
// ⚠️ Estos tres son EJEMPLOS: reemplazalos por las propiedades reales y borrá "ejemplo: true".
const ALOJAMIENTOS = [
  {
    zona: "Nueva Córdoba",
    nombre: "Loft Buen Pastor",
    descripcion: "Departamento moderno a pasos del Paseo del Buen Pastor, ideal para escapadas urbanas y viajes de trabajo.",
    precio: 45,
    capacidad: "hasta 2",
    foto: "",
    destacado: false,
    ejemplo: true,
  },
  {
    zona: "Villa Carlos Paz",
    nombre: "Casa del Lago",
    descripcion: "Casa luminosa con vista al lago San Roque, pileta y parrilla. Perfecta para familias.",
    precio: 90,
    capacidad: "hasta 6",
    foto: "",
    destacado: true,
    ejemplo: true,
  },
  {
    zona: "Villa General Belgrano",
    nombre: "Cabaña Los Pinos",
    descripcion: "Cabaña cálida entre pinos, a minutos del centro del pueblo. Todo el encanto del valle.",
    precio: 70,
    capacidad: "hasta 4",
    foto: "",
    destacado: false,
    ejemplo: true,
  },
];

// Reseñas reales de huéspedes (copialas de Airbnb o Booking).
// La sección "Reseñas" aparece sola cuando hay al menos una.
// Ejemplo de formato:
// { texto: "Todo impecable…", autor: "Nombre", alojamiento: "Casa del Lago", puntaje: "5.0", plataforma: "Airbnb" },
const RESENAS = [];
