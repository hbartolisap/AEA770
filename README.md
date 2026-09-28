# ⚡ Diseño Eléctrico AEA 770 - Suite v8

Aplicación web para el diseño de instalaciones eléctricas en viviendas unifamiliares según **AEA 90364-7-770**.

## 🌐 Demo

👉 [**Abrir la app**](aea770/index.html)

## ✨ Funcionalidades

### Suite principal (`index.html`)

- Cálculo automático del Grado de Electrificación (Sla)
- Cálculo de bocas mínimas (IUG, TUG, TUE) con validación normativa
- Bocas editables por encima del mínimo
- **Asignación de tablero editable por ambiente** (desde la tabla del Paso 2, sin reingresar datos)
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
- **Acceso directo a la herramienta de Reparto de Tableros** (botón `🔀 Reparto` en el header y en el Paso 5)

### Herramienta de Reparto de Tableros (`reparto_tableros.html`) 🆕

Herramienta complementaria que permite **balancear los ambientes entre los distintos tableros** y **visualizar la distribución final de circuitos** según la norma AEA 770.

**Funcionalidades:**

- **Carga directa del JSON** exportado desde la Suite principal (`📤 JSON`)
- Edición de la asignación de cada ambiente a un tablero
- **Distribución automática** de ambientes entre tableros (balanceo por cantidad de bocas)
- Agregar o eliminar ambientes manualmente
- **Lista detallada de circuitos** por tablero, indicando:
  - Número de circuito (C1, C2, …)
  - Tipo (IUG / TUG / TUE)
  - Cantidad de bocas
  - DPMS del circuito
  - **Zona / Área que cubre cada circuito** (nombre del ambiente o ambientes que alimenta)
- Resumen por tablero (bocas, circuitos, DPMS)
- Resumen global con coeficientes de simultaneidad según grado de electrificación
- **Exportación a Excel y PDF** de todo el reparto
- Modo oscuro

**¿Para qué sirve?**

En instalaciones con varios tableros (Principal + seccionales), esta herramienta permite:

1. Definir qué ambientes se alimentan desde cada tablero.
2. Balancear la carga entre tableros para optimizar secciones de línea.
3. Ver la distribución final de circuitos por zona/área, útil para la memoria de cálculo y para el plano eléctrico.

## 🚀 Uso

### Flujo básico (Suite principal)

1. Abrir la URL principal
2. Cargar los datos del proyecto
3. Agregar ambientes y asignarlos a tableros
4. Ver los resultados en las pestañas
5. Exportar a Excel o PDF

### Flujo completo con Reparto de Tableros

1. **En la Suite principal:**
   - Ir al **Paso 3: Tableros** y agregar los tableros seccionales que se necesiten
     (ej: *Tablero Planta Alta*, *Tablero Garage*, etc.)
   - Volver al **Paso 2** y asignar cada ambiente a su tablero usando el selector de la columna **Tablero**
     (si no hay tableros seccionales, el sistema avisa: *"Creá el tablero adicional primero"*)
   - Exportar el proyecto a JSON con el botón `📤 JSON`

2. **Abrir la herramienta de Reparto:**
   - Desde el botón `🔀 Reparto` en el header o desde `🔀 Reparto de Tableros` en el Paso 5
   - Se abre en una pestaña nueva y **guarda automáticamente** el proyecto antes de abrirla

3. **En la herramienta de Reparto:**
   - Cargar el JSON con `📁 Cargar JSON de la Suite`
   - Ajustar la asignación de ambientes a tableros si hace falta
   - Usar `✨ Distribución automática` para balancear la carga entre tableros
   - Revisar la **lista de circuitos con zonas** generada automáticamente
   - Exportar a Excel o PDF con el reparto final

## 📋 Requisitos

- Navegador moderno (Chrome, Edge, Firefox, Safari)
- Para usar offline: instalarla como PWA
- Ambas páginas (`index.html` y `reparto_tableros.html`) deben estar en la **misma carpeta**
- Las librerías `jspdf`, `jspdf-autotable` y `xlsx` deben estar en la carpeta `libs/`

## 📖 Normativa aplicada

- AEA 90364-7-770 (Viviendas unifamiliares hasta 63 A)
- AEA 90364-7-701 (Baños)

### Reglas aplicadas al reparto de circuitos

- **IUG:** máx. 15 bocas/circuito · protección máx. 16 A · 440 VA por circuito
- **TUG:** máx. 15 bocas/circuito · protección máx. 20 A · 2200 VA por circuito
- **TUE:** máx. 12 bocas/circuito · protección máx. 32 A · 3300 VA por circuito
- Fórmula: `circuitos = ⌈bocas / máximo_por_circuito⌉`
- Los circuitos se generan respetando la agrupación por ambiente, de modo que cada circuito queda asociado a una **zona/área concreta**

## ⚠️ Aviso

Los cálculos son orientativos. Consultar con un profesional matriculado antes de ejecutar cualquier instalación.

## 📄 Licencia

Uso libre para Humberto Bartoli con fines educativos y profesionales.