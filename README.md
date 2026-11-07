# CórdobaHOST

Sitio web de **CórdobaHOST**: alojamientos temporarios en Córdoba, Argentina, y administración de propiedades para dueños.

Es un sitio estático (HTML + CSS + JS), sin build ni dependencias.

## Páginas

- `index.html`: catálogo para turistas. Filtros (huéspedes, zona, tipo, dormitorios, precio y comodidades), ficha de cada propiedad con galería, guías de actividades, clima en tiempo real, reseñas y contacto.
- `admin.html` (`/admin`): panel privado para cargar y editar propiedades, precios y fotos.
- `propietarios.html`: para dueños. Servicios, cómo funciona, calculadora de ingresos, preguntas frecuentes y contacto.

Las consultas se hacen por WhatsApp: no hay reservas online ni calendario de disponibilidad.

## Propiedades y panel de administración

Las propiedades y sus fotos se guardan en **Supabase** y se editan desde `/admin`.

Configuración inicial (una sola vez):
1. Crear un proyecto en Supabase y aplicar `supabase/schema.sql`.
2. Agregar los emails autorizados a la tabla `admins` (en minúsculas).
3. Crear esos usuarios en Supabase → Authentication → Users → Add user (con contraseña).
4. Completar `SUPABASE_URL` y `SUPABASE_KEY` (clave *publishable*) en `data.js`.

Mientras `data.js` no tenga esos datos, la web muestra propiedades de ejemplo.

## Editar contenido

En **`data.js`**:
- `WHATSAPP_NUMBER`: el número de WhatsApp (formato `549` + código de área + número).
- `RESENAS`: las reseñas reales. La sección aparece sola cuando hay alguna.

Los datos de contacto (nombre y teléfono visible) están en el pie de página y la sección de contacto de cada HTML.
Las tarifas de referencia de la calculadora están en `script.js` (`TARIFA_BASE`).

## Ver localmente

```bash
npx serve .
# o
python3 -m http.server 8000
```

## Publicar

Se puede subir tal cual a Vercel, Netlify o GitHub Pages (no lleva build).
