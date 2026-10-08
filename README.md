⚡ Diseño Eléctrico AEA 770 - Suite v8

Aplicación web para el diseño de instalaciones eléctricas en viviendas unifamiliares según AEA 90364-7-770.

🌐 Demo

👉 [Abrir la app](https://tu-usuario.github.io/aea770app/index.html)

	> Reemplazá `tu-usuario` y `aea770app` por tu usuario de GitHub y el nombre del repositorio.

✨ Funcionalidades

Suite principal (`index.html`)

	- Cálculo automático del Grado de Electrificación (Sla)
	- Cálculo de bocas mínimas (IUG, TUG, TUE) con validación normativa
	- Bocas editables por encima del mínimo
	- Asignación de tablero editable por ambiente (desde la tabla del Paso 2)
	- Tableros dinámicos con jerarquía (Principal + seccionales)
	- Cálculo de Icc en cascada
	- Caída de tensión por circuito
	- Arranque de motores (≤15%)
	- Protección diferencial sugerida (30/300 mA)
	- Plano interactivo con drag & drop
	- Exportación a Excel, PDF y JSON
	- Multi-proyecto con localStorage
	- Modo oscuro
	- PWA instalable en celular
	- Acceso directo a la herramienta de Reparto de Tableros (botón `🔀 Reparto`)

Módulo de DPS (`dps.html`)

Evaluación de la necesidad de instalar un Dispositivo de Protección contra Sobretensiones según AEA 90364-7-771.

	- Determinación de obligatoriedad (aérea, pararrayos, nivel de riesgo)
	- Recomendación del tipo de DPS (Tipo 1, 2 o 3)
	- Selección de dispositivos del catálogo comercial (Schneider, ABB, Siemens, Legrand)
	- Cálculo del nivel de protección requerido (Up)
	- Informe exportable a PDF

Herramienta de Reparto de Tableros (`reparto_tableros.html`)

Permite balancear los ambientes entre los distintos tableros y visualizar la distribución final de circuitos.

Funcionalidades:
	- Carga automática del proyecto desde el `localStorage` (si venís del botón `🔀 Reparto`)
	- Edición de la asignación de cada ambiente a un tablero
	- Distribución automática de ambientes entre tableros
	- Lista detallada de circuitos por tablero, indicando:
	- Número de circuito (C1, C2, …)
  	- Tipo (IUG / TUG / TUE)
  	- Cantidad de bocas
  	- DPMS del circuito
	- Zona / Área que cubre cada circuito
	- Resumen por tablero (bocas, circuitos, DPMS)
	- Resumen global con coeficientes de simultaneidad según grado
	- Exportación a Excel y PDF
	- Modo oscuro

## 📁 Estructura del proyecto
aea770app/
├── index.html ← Suite principal
├── dps.html ← Módulo de DPS
├── reparto_tableros.html ← Reparto de tableros
├── manifest.json ← Manifest PWA
├── sw.js ← Service Worker (cachea todo)
├── README.md ← Este archivo
│
├── css/
│ ├── base.css ← Variables, reset y componentes comunes
│ ├── index.css ← Estilos de la suite principal
│ ├── dps.css ← Estilos del módulo de DPS
│ └── reparto.css ← Estilos del reparto de tableros
│
├── js/
│ ├── index.js ← Lógica de la suite principal
│ ├── dps.js ← Lógica del módulo de DPS
│ └── reparto.js ← Lógica del reparto de tableros
│
├── libs/
│ ├── jspdf.umd.min.js
│ ├── jspdf.plugin.autotable.min.js
│ └── xlsx.full.min.js
│
└── icons/
├── icon-192.png
└── icon-512.png

Notas sobre la estructura

	- CSS separado: Cada página enlaza `base.css` + su CSS específico.
	- JS separado: Cada página tiene su propio archivo JS. Las funciones que se llaman desde `onclick="..."` están expuestas al `window` al final de cada 				archivo.
	- Service Worker: Cachea todos los archivos (HTML, CSS, JS, librerías e íconos) para funcionamiento offline.

🚀 Uso

Flujo básico (Suite principal)

1. Abrir la URL principal
2. Cargar los datos del proyecto (nombre, superficies, marca de interruptores, tipo de cable)
3. Configurar la acometida (longitud, sección, tipo de instalación)
4. Configurar la puesta a tierra (cantidad de jabalinas, sección de cable)
5. Agregar ambientes y asignarlos a tableros
6. Ver los resultados en las pestañas del Paso 4:
   	- Acometida
   	- DPMS
   	- Cortocircuito
   	- Circuitos
   	- Motores
   	- Diferenciales
   	- DPS
   	- Alturas
   	- Materiales
   	- Plano
   	- Esquema
   	- Verificaciones
7. Exportar a Excel, PDF o JSON

Flujo completo con Reparto de Tableros

1. En la Suite principal:
   	- Ir al Paso 3: Tableros y agregar los tableros seccionales
   	- Volver al Paso 2 y asignar cada ambiente a su tablero
   	- Exportar el proyecto a JSON con `📤 JSON` (opcional)

2. Abrir la herramienta de Reparto:
   	- Desde el botón `🔀 Reparto` en el header (guarda automáticamente y abre la herramienta)
   	- O desde el botón `🔀 Reparto de Tableros` en el Paso 5

3. En la herramienta de Reparto:
   	- El proyecto se carga **automáticamente** desde el `localStorage`
   	- Ajustar la asignación de ambientes a tableros si hace falta
   	- Usar `✨ Distribución automática` para balancear la carga
   	- Revisar la lista de circuitos con zonas generada
   	- Exportar a Excel o PDF

Flujo del módulo de DPS

1. En la Suite principal:
   	- Cargar el proyecto (o usar uno existente)
   	- Hacer clic en el botón `⚡ DPS` en el header

2. En el módulo de DPS:
   	- Seleccionar el tipo de acometida, pararrayos, nivel de riesgo
   	- Ver el resultado de la evaluación (obligatorio / recomendado)
   	- Revisar el catálogo de dispositivos recomendados
   	- Guardar el resultado con `💾 Guardar Resultado`
	- Volver al diseño con `← Volver al Diseño`

3. De vuelta en la Suite:
	- La pestaña `⚡ DPS` del Paso 4 muestra el resultado guardado
	- La pestaña `📦 Materiales` incluye el DPS recomendado

📋 Requisitos

	- Navegador moderno (Chrome, Edge, Firefox, Safari)
	- Para usar offline: instalarla como PWA
	- Servidor local o hosting (NO abrir con `file://` porque el Service Worker y el Manifest requieren `http://` o `https://`)

Servidores locales recomendados

	- Live Server (extensión de VS Code)
	- Python: `python -m http.server 8000`
	- Node.js: `npx http-server -p 8000`
	- GitHub Pages (para producción)

🧪 Verificación después de cambios

Después de modificar cualquier archivo, hacé esta verificación:

1. Abrí la consola (F12).
2. Recargá con `Ctrl + Shift + R` (fuerza recarga, ignora caché).
3. Verificá que en la consola:
	- ❌ Sin `Uncaught SyntaxError`
	- ❌ Sin `Uncaught ReferenceError`
	- ❌ Sin errores 404 de archivos
	- ✅ Service Worker registrado correctamente
4. Probá la funcionalidad afectada:
	- Guardar/Importar JSON con un proyecto de prueba
	- Exportar a Excel y PDF
	- Cambiar de pestaña sin errores
	- Cambiar de tema (claro/oscuro)
	- Modo offline: cerrá el servidor y recargá (debe funcionar con caché)

📖 Normativa aplicada

	- AEA 90364-7-770 — Viviendas unifamiliares hasta 63 A
	- AEA 90364-7-701 — Baños y locales con bañeras/duchas
	- AEA 90364-7-771 — Protección contra sobretensiones (DPS)

Reglas aplicadas al reparto de circuitos

	- IUG: máx. 15 bocas/circuito · protección máx. 16 A · 440 VA por circuito
	- TUG: máx. 15 bocas/circuito · protección máx. 20 A · 2200 VA por circuito
	- TUE: máx. 12 bocas/circuito · protección máx. 32 A · 3300 VA por circuito
	- Fórmula: `circuitos = ⌈bocas / máximo_por_circuito⌉`
	- Los circuitos se generan respetando la agrupación por ambiente, de modo que cada circuito queda asociado a una **zona/área concreta**

🔧 Mantenimiento

Modificar el CSS

	- Los estilos comunes a todas las páginas van en `css/base.css`
	- Los estilos específicos de cada página van en su propio archivo (`css/index.css`, `css/dps.css`, `css/reparto.css`)
	- Las variables de color (tema claro/oscuro) están definidas al inicio de `base.css`

Modificar el JS

	- Cada página tiene su propio archivo JS (`js/index.js`, `js/dps.js`, `js/reparto.js`)
	- IMPORTANTE: Si agregás una nueva función que se llama desde un `onclick="..."` en el HTML, tenés que **exponerla al `window`** al final del archivo JS:
  			```javascript
  window.nombreDeLaFuncion = nombreDeLaFuncion;

Notas sobre la estructura

	- CSS separado: Cada página enlaza `base.css` + su CSS específico.
	- JS separado: Cada página tiene su propio archivo JS. Las funciones que se llaman desde `onclick="..."` están expuestas al `window` al final de cada 			   	 archivo.
	- Service Worker: Cachea todos los archivos (HTML, CSS, JS, librerías e íconos) para funcionamiento offline.

🚀 Uso

Flujo básico (Suite principal)

1. Abrir la URL principal
2. Cargar los datos del proyecto (nombre, superficies, marca de interruptores, tipo de cable)
3. Configurar la acometida (longitud, sección, tipo de instalación)
4. Configurar la puesta a tierra (cantidad de jabalinas, sección de cable)
5. Agregar ambientes y asignarlos a tableros
6. Ver los resultados en las pestañas del Paso 4:
	   - Acometida
	   - DPMS
	   - Cortocircuito
	   - Circuitos
	   - Motores
	   - Diferenciales
	   - DPS
	   - Alturas
	   - Materiales
	   - Plano
	   - Esquema
	   - Verificaciones
7. Exportar a Excel, PDF o JSON

Flujo completo con Reparto de Tableros

1. En la Suite principal:
	   - Ir al Paso 3: Tableros y agregar los tableros seccionales
	   - Volver al Paso 2 y asignar cada ambiente a su tablero
	   - Exportar el proyecto a JSON con `📤 JSON` (opcional)

2. Abrir la herramienta de Reparto:
	   - Desde el botón `🔀 Reparto` en el header (guarda automáticamente y abre la herramienta)
	   - O desde el botón `🔀 Reparto de Tableros` en el Paso 5

3. En la herramienta de Reparto:
	   - El proyecto se carga automáticamente desde el `localStorage`
	   - Ajustar la asignación de ambientes a tableros si hace falta
	   - Usar `✨ Distribución automática` para balancear la carga
	   - Revisar la lista de circuitos con zonas generada
	   - Exportar a Excel o PDF

Flujo del módulo de DPS

1. En la Suite principal:
	   - Cargar el proyecto (o usar uno existente)
	   - Hacer clic en el botón `⚡ DPS` en el header

2. En el módulo de DPS:
	   - Seleccionar el tipo de acometida, pararrayos, nivel de riesgo
	   - Ver el resultado de la evaluación (obligatorio / recomendado)
	   - Revisar el catálogo de dispositivos recomendados
	   - Guardar el resultado con `💾 Guardar Resultado`
	   - Volver al diseño con `← Volver al Diseño`

3. De vuelta en la Suite:
	   - La pestaña `⚡ DPS` del Paso 4 muestra el resultado guardado
	   - La pestaña `📦 Materiales` incluye el DPS recomendado

📋 Requisitos

	- Navegador moderno (Chrome, Edge, Firefox, Safari)
	- Para usar offline: instalarla como PWA
	- Servidor local o hosting (NO abrir con `file://` porque el Service Worker y el Manifest requieren `http://` o `https://`)

Servidores locales recomendados

	- Live Server (extensión de VS Code)
	- Python: `python -m http.server 8000`
	- Node.js: `npx http-server -p 8000`
	- GitHub Pages (para producción)

 🧪 Verificación después de cambios

	Después de modificar cualquier archivo, hacé esta verificación:

1. Abrí la consola (F12).
2. Recargá con `Ctrl + Shift + R` (fuerza recarga, ignora caché).
3. Verificá que en la consola:
   	- ❌ Sin `Uncaught SyntaxError`
   	- ❌ Sin `Uncaught ReferenceError`
  	- ❌ Sin errores 404 de archivos
  	- ✅ Service Worker registrado correctamente
4. Probá la funcionalidad afectada:
   	- Guardar/Importar JSON con un proyecto de prueba
   	- Exportar a Excel y PDF
   	- Cambiar de pestaña sin errores
   	- Cambiar de tema (claro/oscuro)
   	- Modo offline: cerrá el servidor y recargá (debe funcionar con caché)

 📖 Normativa aplicada

	- AEA 90364-7-770 — Viviendas unifamiliares hasta 63 A
	- AEA 90364-7-701 — Baños y locales con bañeras/duchas
	- AEA 90364-7-771 — Protección contra sobretensiones (DPS)

Reglas aplicadas al reparto de circuitos

	- IUG: máx. 15 bocas/circuito · protección máx. 16 A · 440 VA por circuito
	- TUG: máx. 15 bocas/circuito · protección máx. 20 A · 2200 VA por circuito
	- TUE: máx. 12 bocas/circuito · protección máx. 32 A · 3300 VA por circuito
	- Fórmula: `circuitos = ⌈bocas / máximo_por_circuito⌉`
	- Los circuitos se generan respetando la agrupación por ambiente, de modo que cada circuito queda asociado a una zona/área concreta

🔧 Mantenimiento

	Modificar el CSS

	- Los estilos comunes a todas las páginas van en `css/base.css`
	- Los estilos específicos de cada página van en su propio archivo (`css/index.css`, `css/dps.css`, `css/reparto.css`)
	- Las variables de color (tema claro/oscuro) están definidas al inicio de `base.css`

	Modificar el JS

	- Cada página tiene su propio archivo JS (`js/index.js`, `js/dps.js`, `js/reparto.js`)
	- IMPORTANTE: Si agregás una nueva función que se llama desde un `onclick="..."` en el HTML, tenés que **exponerla al `window`** al final del archivo JS:
  ```javascript
  window.nombreDeLaFuncion = nombreDeLaFuncion;

	Los addEventListener se registran al final del archivo JS.

	Agregar un nuevo módulo
	Crear el HTML (con <link> a css/base.css + css/nuevoModulo.css)

	Crear el JS (js/nuevoModulo.js)

	Crear el CSS (css/nuevoModulo.css)

	Agregar el archivo HTML a sw.js (lista ASSETS)

	Agregar el CSS y JS nuevos a sw.js

	Actualizar el CACHE_NAME en sw.js (ej: aea770-v8.3) para forzar la recarga

	Actualizar el Service Worker
	Cada vez que modifiques archivos cacheados, cambiá el CACHE_NAME en sw.js:

		javascript
		const CACHE_NAME = 'aea770-v8.3';  // <-- subir la versión
	Esto fuerza a los navegadores a descargar los archivos nuevos.

⚠️ Aviso
	Los cálculos son orientativos. Consultar con un profesional matriculado antes de ejecutar cualquier instalación.

	La app no calcula:

	Resistividad del terreno (hay que verificar R ≤ 40 Ω en obra con telurómetro)

	Curvas de disparo de protecciones (solo sugiere PdC comercial)

	Coordinación de protecciones en cascada (hay que verificar manualmente)

📄 Licencia
	Uso libre para Humberto Bartoli con fines educativos y profesionales.

🙏 Créditos
	jsPDF — Generación de PDF del lado del cliente

	jsPDF-AutoTable — Tablas en PDF

	SheetJS (xlsx) — Generación de Excel

	Basado en la normativa AEA 90364-7-770

📅 Changelog
	v8.2 (actual)
	✅ CSS separado en 4 archivos (base.css + 3 específicos)

	✅ JS separado en 3 archivos (index.js, dps.js, reparto.js)

	✅ Persistencia automática del proyecto entre index.html y reparto_tableros.html

	✅ Service Worker cachea CSS y JS separados

	✅ manifest.json corregido (sin comas extra)

	✅ Módulo de DPS integrado con la suite principal

	v8.1
	✅ Corrección del sw.js para cachear CSS

	✅ Corrección del manifest.json

	v8.0
	✅ Suite principal completa

	✅ Módulo de DPS

	✅ Reparto de Tableros

	✅ PWA instalable

	✅ Multi-proyecto con localStorage