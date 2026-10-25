# CórdobaHOST

Sitio web de **CórdobaHOST**: alojamientos temporarios en Córdoba, Argentina, y administración de propiedades para dueños.

Es un sitio estático (HTML + CSS + JS), sin build ni dependencias.

## Páginas

- `index.html`: para huéspedes. Buscador por fechas, alojamientos, guías de actividades, clima en tiempo real, reseñas y contacto.
- `propietarios.html`: para dueños. Servicios, cómo funciona, calculadora de ingresos, preguntas frecuentes y contacto.

Los formularios y botones arman un mensaje y lo abren en WhatsApp.

## Editar contenido

Casi todo se cambia en **`data.js`**:
- `WHATSAPP_NUMBER`: el número de WhatsApp (formato `549` + código de área + número).
- `ALOJAMIENTOS`: las propiedades (las que hay son ejemplos). Para las fotos, subilas a `img/` y poné la ruta en `foto`.
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
