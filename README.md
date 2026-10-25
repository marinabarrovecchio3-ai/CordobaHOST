# CórdobaHOST

Sitio web de **CórdobaHOST**, una administradora de alquileres temporarios en Córdoba, Argentina (Capital, Carlos Paz, Calamuchita, Punilla, Traslasierra y Alta Gracia).

Es un sitio estático (HTML + CSS + JS), sin build ni dependencias.

## Ver localmente

```bash
npx serve .
# o
python3 -m http.server 8000
```

## Antes de publicar

En `script.js`:
- `WHATSAPP_NUMBER`: el número real de WhatsApp (formato `549351XXXXXXX`).
- `TARIFA_BASE`: las tarifas de referencia por noche de cada zona para la calculadora.

En `index.html`:
- El email de contacto y el link de Instagram.

## Publicar

Se puede subir tal cual a Vercel, Netlify o GitHub Pages (no lleva build).
