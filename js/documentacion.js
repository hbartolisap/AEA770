// ============================================================
// DOCUMENTACION.JS - Módulo de Documentación AEA 770 Anexo A
// ============================================================

let proyecto = null;

// ============================================================
// CARGA INICIAL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const data = localStorage.getItem('proyectoAEA_para_Documentacion');
    if (!data) {
        alert('No se encontró un proyecto. Por favor, volvé a la página principal.');
        window.location.href = 'index.html';
        return;
    }
    try {
        proyecto = JSON.parse(data);
        renderizarInterfaz();
    } catch (e) {
        console.error(e);
        alert('Error al leer los datos del proyecto.');
        window.location.href = 'index.html';
    }
});

// ============================================================
// HELPERS
// ============================================================
function limpiarTextoPDF(texto) {
    if (texto === null || texto === undefined) return '';
    return String(texto)
        .replace(/→/g, '->').replace(/←/g, '<-').replace(/↔/g, '<->')
        .replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/≠/g, '!=')
        .replace(/Ω/g, 'Ohm').replace(/°/g, ' deg')
        .replace(/²/g, '2').replace(/³/g, '3').replace(/·/g, '.')
        .replace(/✔/g, '[OK]').replace(/✖/g, '[X]').replace(/⚠/g, '[!]')
        .replace(/ℹ/g, '[i]').replace(/⏚/g, 'PAT').replace(/Δ/g, 'DU')
        .replace(/[—–]/g, '-').replace(/[""]/g, '"').replace(/['']/g, "'")
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
        .replace(/[\u{2600}-\u{27BF}]/gu, '');
}

function autoTableLimpio(doc, opciones) {
    const opt = { ...opciones };
    if (opt.head) opt.head = opt.head.map(f => f.map(c => limpiarTextoPDF(c)));
    if (opt.body) opt.body = opt.body.map(f => f.map(c => limpiarTextoPDF(c)));
    doc.autoTable(opt);
}

function fechaHoy() {
    return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ============================================================
// RECOPILACIÓN DE DATOS
// ============================================================
function recopilarDatosCompletos() {
    const datos = {
        // Datos del proyecto
        nombre: proyecto.nombre || 'Sin nombre',
        fecha: fechaHoy(),
        supCubierta: parseFloat(proyecto.supCubierta) || 0,
        supSemicubierta: parseFloat(proyecto.supSemicubierta) || 0,
        sla: 0,
        grado: 'MEDIO',
        iccOrigen: parseFloat(proyecto.iccOrigen) || 4.5,
        marca: proyecto.marca || 'Schneider',
        tipoCable: proyecto.tipoCable || 'unipolar',
        tipoInstalacion: proyecto.tipoInstalacion || 'embutida',

        // Acometida
        acometida: proyecto.acometida || {},

        // PAT
        puestaTierra: proyecto.puestaTierra || {},

        // Ambientes, tableros, circuitos
        ambientes: proyecto.ambientes || [],
        tableros: proyecto.tableros || [],
        circuitosPorTablero: proyecto.circuitosPorTablero || {},
        planoElementos: proyecto.planoElementos || [],

        // DPS (si fue evaluado)
        dps: null
    };

    datos.sla = datos.supCubierta + (datos.supSemicubierta * 0.5);
    if (datos.sla <= 60) datos.grado = 'MÍNIMO';
    else if (datos.sla <= 130) datos.grado = 'MEDIO';
    else if (datos.sla <= 200) datos.grado = 'ELEVADO';
    else datos.grado = 'SUPERIOR';

    // DPS
    try {
        const dpsData = localStorage.getItem('resultadoDPS_' + datos.nombre);
        if (dpsData) datos.dps = JSON.parse(dpsData);
    } catch (e) { console.warn('DPS no disponible:', e); }

    return datos;
}

// ============================================================
// CÁLCULOS DERIVADOS (duplicados mínimos del index.js)
// ============================================================
function calcularBocasMinimas(amb) {
    const { tipo, area } = amb;
    let iug = 0, tug = 0, tue = 0;
    switch(tipo) {
        case 'Habitación': iug = Math.max(1, Math.ceil(area / 18)); tug = Math.max(2, Math.ceil(area / 6)); break;
        case 'Dormitorio':
            iug = 1;
            if (area < 10) tug = 2; else if (area <= 36) tug = 3; else { tug = 3; tue = 1; }
            break;
        case 'Cocina': iug = 2; tug = 3; break;
        case 'Baño': iug = 1; tug = 1; break;
        case 'Pasillo': iug = Math.max(1, Math.ceil(area / 5)); tug = area > 2 ? Math.max(1, Math.ceil(area / 5)) : 0; break;
        case 'Vestíbulo': iug = 1; tug = Math.max(1, Math.ceil(area / 12)); break;
        case 'Lavadero': iug = 1; tug = 2; break;
        case 'Balcón': iug = Math.max(1, Math.ceil(area / 5)); break;
        case 'Kitchenette': iug = 1; tug = 2; break;
        case 'Depósito': iug = Math.max(1, Math.ceil(area / 15)); tug = Math.max(1, Math.ceil(area / 9)); break;
        case 'Cuarto Técnico': iug = 1; tug = 1; tue = 1; break;
    }
    return { iug, tug, tue };
}

function calcularBocas(amb) {
    const min = calcularBocasMinimas(amb);
    return {
        iug: (amb.iugReal !== undefined && amb.iugReal !== null) ? amb.iugReal : min.iug,
        tug: (amb.tugReal !== undefined && amb.tugReal !== null) ? amb.tugReal : min.tug,
        tue: (amb.tueReal !== undefined && amb.tueReal !== null) ? amb.tueReal : min.tue
    };
}

// ============================================================
// RENDERIZADO DE LA INTERFAZ
// ============================================================
function renderizarInterfaz() {
    const datos = recopilarDatosCompletos();

    const html = `
        <div class="info-tip">
            📄 Este módulo genera la <strong>documentación completa exigida por el Anexo A de la AEA 770</strong>.
            Se recopilan todos los datos del proyecto (diseño + verificación + DPS) y se genera un PDF profesional.
        </div>

        <h2>1. Resumen del Proyecto</h2>
        <div class="stat-grid">
            <div class="stat">
                <div class="value">${datos.nombre}</div>
                <div class="label">Proyecto</div>
            </div>
            <div class="stat">
                <div class="value">${datos.sla.toFixed(0)} m²</div>
                <div class="label">Sla</div>
            </div>
            <div class="stat">
                <div class="value">${datos.grado}</div>
                <div class="label">Grado</div>
            </div>
            <div class="stat">
                <div class="value">${datos.ambientes.length}</div>
                <div class="label">Ambientes</div>
            </div>
            <div class="stat">
                <div class="value">${datos.tableros.length}</div>
                <div class="label">Tableros</div>
            </div>
            <div class="stat">
                <div class="value">${Object.values(datos.circuitosPorTablero).reduce((s, c) => s + c.length, 0)}</div>
                <div class="label">Circuitos</div>
            </div>
            <div class="stat">
                <div class="value">${datos.dps ? 'Sí' : 'No'}</div>
                <div class="label">DPS Evaluado</div>
            </div>
        </div>

        <h2>2. Documentos a incluir en el PDF</h2>
        <div class="doc-list">
            <div class="doc-item">
                <div class="doc-info">
                    <h4>📝 Memoria Técnica Descriptiva</h4>
                    <p>Resumen del proyecto, cálculo de Sla, grado de electrificación, descripción de la instalación.</p>
                </div>
                <button class="btn-secundario" onclick="previsualizarMemoria()">👁️ Previsualizar</button>
            </div>
            <div class="doc-item">
                <div class="doc-info">
                    <h4>🔧 Esquema Unifilar</h4>
                    <p>Diagrama SVG con medidor, tableros en cascada, circuitos, DPS y PAT.</p>
                </div>
                <button class="btn-secundario" onclick="previsualizarEsquema()">👁️ Previsualizar</button>
            </div>
            <div class="doc-item">
                <div class="doc-info">
                    <h4>📦 Listado de Materiales Detallado</h4>
                    <p>Materiales con marca, modelo, cantidad y norma IRAM aplicable.</p>
                </div>
                <button class="btn-secundario" onclick="previsualizarMateriales()">👁️ Previsualizar</button>
            </div>
            <div class="doc-item">
                <div class="doc-info">
                    <h4>✅ Protocolo de Verificación</h4>
                    <p>Ensayos y verificaciones según AEA 770: continuidad, aislamiento, PAT, diferenciales.</p>
                </div>
                <button class="btn-secundario" onclick="previsualizarProtocolo()">👁️ Previsualizar</button>
            </div>
            <div class="doc-item">
                <div class="doc-info">
                    <h4>📖 Manual de Uso y Mantenimiento</h4>
                    <p>Recomendaciones para el usuario final y el mantenedor de la instalación.</p>
                </div>
                <button class="btn-secundario" onclick="previsualizarManual()">👁️ Previsualizar</button>
            </div>
        </div>

        <h2>3. Checklist Anexo A</h2>
        <div id="checklistContenido" class="checklist"></div>

        <div class="botones-principales">
            <button class="btn-generar" onclick="generarPDFCompleto()" id="btnGenerar">
                📄 Generar PDF Completo
            </button>
            <button class="btn-secundario" onclick="volverAlDiseno()">
                ← Volver al Diseño
            </button>
        </div>

        <div id="statusGeneracion"></div>
    `;

    document.getElementById('mainContent').innerHTML = html;
    renderizarChecklist(datos);
}

// ============================================================
// CHECKLIST ANEXO A
// ============================================================
function renderizarChecklist(datos) {
    const items = [
        { ok: datos.ambientes.length > 0, texto: 'Datos de la instalación (ambientes cargados)' },
        { ok: datos.tableros.length > 0, texto: 'Tableros definidos' },
        { ok: datos.acometida && datos.acometida.longitud, texto: 'Acometida configurada' },
        { ok: datos.puestaTierra && datos.puestaTierra.cantJabalina, texto: 'Puesta a tierra configurada' },
        { ok: true, texto: 'Cálculo de Sla y grado de electrificación' },
        { ok: true, texto: 'Cálculo de caídas de tensión' },
        { ok: true, texto: 'Cálculo de corriente de cortocircuito (Icc)' },
        { ok: Object.values(datos.circuitosPorTablero).reduce((s,c)=>s+c.length,0) > 0, texto: 'Circuitos con protecciones' },
        { ok: !!datos.dps, texto: 'Evaluación de DPS (recomendado)', warn: !datos.dps }
    ];

    document.getElementById('checklistContenido').innerHTML = items.map(i => `
        <div class="checklist-item ${i.ok ? 'ok' : (i.warn ? 'warn' : 'error')}">
            <span class="check-icon">${i.ok ? '✔' : (i.warn ? '⚠' : '✖')}</span>
            <span>${i.texto}</span>
        </div>
    `).join('');
}

// ============================================================
// PREVISUALIZACIONES
// ============================================================
function previsualizarMemoria() {
    const datos = recopilarDatosCompletos();
    const texto = generarTextoMemoria(datos);
    abrirModalPreview('📝 Memoria Técnica Descriptiva', `<div class="memoria-preview">${texto}</div>`);
}

function previsualizarEsquema() {
    const datos = recopilarDatosCompletos();
    const svg = generarEsquemaSVG(datos);
    abrirModalPreview('🔧 Esquema Unifilar', `<div class="svg-preview">${svg}</div>`);
}

function previsualizarMateriales() {
    const datos = recopilarDatosCompletos();
    const html = generarTablaMaterialesHTML(datos);
    abrirModalPreview('📦 Listado de Materiales', `<div class="tabla-preview">${html}</div>`);
}

function previsualizarProtocolo() {
    const datos = recopilarDatosCompletos();
    const html = generarTablaProtocoloHTML(datos);
    abrirModalPreview('✅ Protocolo de Verificación', `<div class="tabla-preview">${html}</div>`);
}

function previsualizarManual() {
    const html = generarManualHTML();
    abrirModalPreview('📖 Manual de Uso y Mantenimiento', `<div class="memoria-preview">${html}</div>`);
}

function abrirModalPreview(titulo, contenidoHTML) {
    let modal = document.getElementById('modalPreview');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalPreview';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:900px;">
                <h3 id="modalPreviewTitulo"></h3>
                <div id="modalPreviewContenido"></div>
                <div style="margin-top:15px;text-align:right;">
                    <button onclick="cerrarModalPreview()">Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById('modalPreviewTitulo').textContent = titulo;
    document.getElementById('modalPreviewContenido').innerHTML = contenidoHTML;
    modal.classList.add('active');
}

function cerrarModalPreview() {
    const modal = document.getElementById('modalPreview');
    if (modal) modal.classList.remove('active');
}

// ============================================================
// GENERACIÓN DE MEMORIA TÉCNICA
// ============================================================
function generarTextoMemoria(datos) {
    const lines = [];
    lines.push(`MEMORIA TÉCNICA DESCRIPTIVA`);
    lines.push(`Proyecto: ${datos.nombre}`);
    lines.push(`Fecha: ${datos.fecha}`);
    lines.push(``);
    lines.push(`1. DATOS GENERALES`);
    lines.push(`Superficie cubierta: ${datos.supCubierta} m²`);
    lines.push(`Superficie semicubierta: ${datos.supSemicubierta} m²`);
    lines.push(`Sla (superficie límite de aplicación): ${datos.sla.toFixed(2)} m²`);
    lines.push(`Grado de electrificación: ${datos.grado}`);
    lines.push(`Icc presunta en origen: ${datos.iccOrigen} kA`);
    lines.push(`Marca de interruptores: ${datos.marca}`);
    lines.push(``);
    lines.push(`2. CARACTERÍSTICAS DE LA INSTALACIÓN`);
    lines.push(`Tipo de cable de circuitos: ${datos.tipoCable}`);
    lines.push(`Tipo de instalación: ${datos.tipoInstalacion}`);
    lines.push(`Cantidad de tableros: ${datos.tableros.length}`);
    lines.push(`Cantidad de ambientes: ${datos.ambientes.length}`);
    const totalCirc = Object.values(datos.circuitosPorTablero).reduce((s, c) => s + c.length, 0);
    lines.push(`Cantidad de circuitos: ${totalCirc}`);
    lines.push(``);
    lines.push(`3. ACOMETIDA`);
    const ac = datos.acometida || {};
    lines.push(`Longitud: ${ac.longitud || 10} m`);
    lines.push(`Tipo de cable: ${ac.tipoCable || 'sintenax'}`);
    lines.push(`Sección: ${ac.seccion || 6} mm²`);
    lines.push(`Conductores: ${ac.conductores || 4}`);
    lines.push(``);
    lines.push(`4. PUESTA A TIERRA`);
    const pt = datos.puestaTierra || {};
    lines.push(`Cantidad de jabalinas: ${pt.cantJabalina || 1}`);
    lines.push(`Longitud cable: ${pt.longCable || 10} m`);
    lines.push(`Sección cable: ${pt.seccion || 16} mm²`);
    lines.push(`Verificar R <= 40 Ohm en obra con telurómetro.`);
    lines.push(``);
    lines.push(`5. DPS`);
    if (datos.dps) {
        lines.push(`Estado: ${datos.dps.esObligatorio ? 'OBLIGATORIO' : 'Recomendado'}`);
        lines.push(`Tipo: Tipo ${datos.dps.tipoRecomendado}`);
        lines.push(`Up recomendado: ${datos.dps.upRecomendado} kV`);
    } else {
        lines.push(`No evaluado.`);
    }
    lines.push(``);
    lines.push(`6. OBSERVACIONES`);
    lines.push(`Este documento es orientativo. Consultar con profesional matriculado.`);
    return lines.join('\n');
}

// ============================================================
// GENERACIÓN DE ESQUEMA SVG (reutiliza lógica del index)
// ============================================================
function generarEsquemaSVG(datos) {
    const ancho = 1100;
    const altoNodo = 55;
    const separacion = 12;
    const padding = 25;
    let altoTotal = padding * 2 + altoNodo * (datos.tableros.length + 4) + separacion * (datos.tableros.length + 4) + 140;
    Object.values(datos.circuitosPorTablero).forEach(circs => {
        if (circs.length > 0) altoTotal += Math.ceil(circs.length / 6) * 55 + separacion + 15;
    });

    const colorTexto = '#333';
    const colorLinea = '#667eea';
    const colorNodo = '#f8f9fa';
    const colorBorde = '#ddd';
    const nodoSVG = (x, yy, w, h, fill, stroke) =>
        `<rect x="${x}" y="${yy}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="2" rx="6"/>`;

    let svg = `<svg viewBox="0 0 ${ancho} ${altoTotal}" xmlns="http://www.w3.org/2000/svg" style="font-family: sans-serif;">`;
    let y = padding;
    const centroX = ancho / 2;

    // MEDIDOR
    svg += nodoSVG(centroX - 70, y, 140, altoNodo, colorNodo, colorBorde);
    svg += `<text x="${centroX}" y="${y + 22}" fill="${colorTexto}" font-size="11" font-weight="bold" text-anchor="middle">MEDIDOR</text>`;
    svg += `<text x="${centroX}" y="${y + 38}" fill="${colorTexto}" font-size="9" text-anchor="middle">Icc: ${datos.iccOrigen} kA</text>`;
    y += altoNodo + separacion;

    // TABLEROS
    datos.tableros.forEach(t => {
        const circs = datos.circuitosPorTablero[t.id] || [];
        if (t.padre && circs.length === 0) return;

        svg += `<line x1="${centroX}" y1="${y - separacion}" x2="${centroX}" y2="${y}" stroke="${colorLinea}" stroke-width="3"/>`;
        const wTab = 240;
        svg += nodoSVG(centroX - wTab / 2, y, wTab, altoNodo, colorNodo, colorBorde);
        svg += `<text x="${centroX}" y="${y + 22}" fill="${colorTexto}" font-size="11" font-weight="bold" text-anchor="middle">${t.nombre.toUpperCase()}</text>`;
        y += altoNodo + separacion;

        if (circs.length > 0) {
            const cols = Math.min(circs.length, 6);
            const filas = Math.ceil(circs.length / cols);
            const anchoCirc = (ancho - padding * 4) / cols;

            circs.forEach((c, ci) => {
                const col = ci % cols;
                const fila = Math.floor(ci / cols);
                const x = padding + anchoCirc * col + anchoCirc / 2;
                const yCaja = y + fila * 55;
                const color = c.tipo === 'IUG' ? '#f39c12' : c.tipo === 'TUG' ? '#3498db' : '#e74c3c';

                svg += nodoSVG(x - 55, yCaja, 110, 40, colorNodo, color);
                svg += `<text x="${x}" y="${yCaja + 15}" fill="${colorTexto}" font-size="10" font-weight="bold" text-anchor="middle">${c.nombre} · ${c.tipo}</text>`;
                svg += `<text x="${x}" y="${yCaja + 28}" fill="${colorTexto}" font-size="9" text-anchor="middle">${c.bocas}b · ${c.proteccion}A · ${c.seccion}mm2</text>`;
            });

            y += filas * 55 + separacion;
        }
    });

    // DPS
    if (datos.dps) {
        const colorDPS = datos.dps.esObligatorio ? '#e74c3c' : '#f39c12';
        svg += nodoSVG(centroX - 100, y + 20, 200, 40, colorNodo, colorDPS);
        svg += `<text x="${centroX}" y="${y + 45}" fill="${colorTexto}" font-size="10" font-weight="bold" text-anchor="middle">DPS Tipo ${datos.dps.tipoRecomendado} - Up <= ${datos.dps.upRecomendado} kV</text>`;
        y += 70;
    }

    // PAT
    svg += `<line x1="${padding}" y1="${y}" x2="${ancho - padding}" y2="${y}" stroke="${colorLinea}" stroke-width="2" stroke-dasharray="5,5"/>`;
    svg += `<text x="${centroX}" y="${y + 18}" fill="${colorTexto}" font-size="10" font-weight="bold" text-anchor="middle">PAT: ${datos.puestaTierra?.cantJabalina || 1} jabalina(s) - R &lt;= 40 Ohm</text>`;
    svg += `</svg>`;
    return svg;
}

// ============================================================
// GENERACIÓN DE LISTADO DE MATERIALES
// ============================================================
function generarMateriales(datos) {
    const materiales = [];
    const ac = datos.acometida || {};
    const pt = datos.puestaTierra || {};

    materiales.push({
        cat: 'Acometida',
        desc: `Cable ${ac.tipoCable || 'sintenax'} ${ac.conductores || 4}×${ac.seccion || 6} mm²`,
        cant: `${Math.ceil((ac.longitud || 10) * 1.15)} m`,
        norma: 'IRAM 2178 / IRAM NM 247-3'
    });

    materiales.push({
        cat: 'PAT',
        desc: `Jabalina Copperweld 5/8" x 1.5 m`,
        cant: `${pt.cantJabalina || 1} u`,
        norma: 'IRAM 2309'
    });

    materiales.push({
        cat: 'PAT',
        desc: `Cable verde/amarillo ${pt.seccion || 16} mm²`,
        cant: `${Math.ceil((pt.longCable || 10) * 1.15)} m`,
        norma: 'IRAM 2178'
    });

    materiales.push({
        cat: 'Tableros',
        desc: `Gabinete doble aislación Clase II con riel DIN`,
        cant: `${datos.tableros.length} u`,
        norma: 'IRAM 62262'
    });

    // Contadores de protecciones
    const contadores = {};
    Object.values(datos.circuitosPorTablero).forEach(circs => {
        circs.forEach(c => {
            const key = `${c.tipo}_${c.seccion}_${c.proteccion}`;
            if (!contadores[key]) {
                contadores[key] = { tipo: c.tipo, seccion: c.seccion, proteccion: c.proteccion, cantidad: 0 };
            }
            contadores[key].cantidad++;
        });
    });
    Object.values(contadores).forEach(c => {
        materiales.push({
            cat: 'Protecciones',
            desc: `PIA ${c.proteccion}A curva C ${c.seccion}mm² — ${datos.marca}`,
            cant: `${c.cantidad} u`,
            norma: 'IRAM 2168'
        });
    });

    materiales.push({
        cat: 'Diferenciales',
        desc: `ID 2P 40A 300mA Selectivo Clase S — ${datos.marca}`,
        cant: '1 u',
        norma: 'IRAM 2301'
    });
    materiales.push({
        cat: 'Diferenciales',
        desc: `ID 2P 40A 30mA Clase AC — ${datos.marca}`,
        cant: '2 u',
        norma: 'IRAM 2301'
    });

    if (datos.dps) {
        const tipoNombre = { 1: 'Tipo 1', 2: 'Tipo 2', 3: 'Tipo 3' }[datos.dps.tipoRecomendado];
        const modelo = datos.dps.dispositivos && datos.dps.dispositivos[0]
            ? datos.dps.dispositivos[0].modelo
            : `DPS ${tipoNombre}`;
        materiales.push({
            cat: 'DPS',
            desc: `${modelo} - Up <= ${datos.dps.upRecomendado} kV`,
            cant: '1 u',
            norma: 'IEC 61643-11'
        });
    }

    // Bocas
    let totalIUG = 0, totalTUG = 0, totalTUE = 0;
    datos.ambientes.forEach(amb => {
        const b = calcularBocas(amb);
        totalIUG += b.iug;
        totalTUG += b.tug;
        totalTUE += b.tue;
    });

    materiales.push({ cat: 'Bocas', desc: 'Interruptor de efecto (IUG)', cant: `${totalIUG} u`, norma: 'IRAM 2122' });
    materiales.push({ cat: 'Bocas', desc: 'Tomacorriente 2P+T 10A (TUG)', cant: `${totalTUG} u`, norma: 'IRAM 2071' });
    materiales.push({ cat: 'Bocas', desc: 'Tomacorriente 2P+T 20A (TUE)', cant: `${totalTUE} u`, norma: 'IRAM 2071' });

    // Cables por sección
    const cablesPorSeccion = {};
    Object.values(datos.circuitosPorTablero).forEach(circs => {
        circs.forEach(c => {
            if (!cablesPorSeccion[c.seccion]) cablesPorSeccion[c.seccion] = 0;
            cablesPorSeccion[c.seccion] += c.longitud;
        });
    });
    Object.keys(cablesPorSeccion).sort((a,b) => parseFloat(a) - parseFloat(b)).forEach(sec => {
        materiales.push({
            cat: 'Cables',
            desc: `Cable ${datos.tipoCable} ${sec} mm²`,
            cant: `${Math.ceil(cablesPorSeccion[sec] * 1.15)} m`,
            norma: 'IRAM NM 247-3 / IRAM 2178'
        });
    });

    return materiales;
}

function generarTablaMaterialesHTML(datos) {
    const mats = generarMateriales(datos);
    return `<table>
        <thead><tr><th>Categoría</th><th>Descripción</th><th>Cantidad</th><th>Norma</th></tr></thead>
        <tbody>
            ${mats.map(m => `<tr>
                <td><strong>${m.cat}</strong></td>
                <td>${m.desc}</td>
                <td>${m.cant}</td>
                <td>${m.norma}</td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

// ============================================================
// GENERACIÓN DE PROTOCOLO DE VERIFICACIÓN
// ============================================================
function generarProtocolo(datos) {
    return [
        { ensayo: 'Continuidad de conductores de protección', valor: 'R <= 1 Ohm', estado: 'A verificar en obra', tipo: 'Obligatorio' },
        { ensayo: 'Resistencia de aislamiento (500 V DC)', valor: 'R >= 1 MOhm', estado: 'A verificar en obra', tipo: 'Obligatorio' },
        { ensayo: 'Resistencia de puesta a tierra', valor: 'R <= 40 Ohm', estado: `Config: ${datos.puestaTierra?.cantJabalina || 1} jabalina(s)`, tipo: 'Obligatorio' },
        { ensayo: 'Continuidad del conductor de tierra principal', valor: 'Conectado', estado: 'A verificar en obra', tipo: 'Obligatorio' },
        { ensayo: 'Funcionamiento de interruptores diferenciales', valor: 'I_disp <= 30 mA en <= 300 ms', estado: 'A verificar con pulsador de prueba', tipo: 'Obligatorio' },
        { ensayo: 'Verificación de polaridad', valor: 'Correcta', estado: 'A verificar en obra', tipo: 'Obligatorio' },
        { ensayo: 'Medición de impedancia de línea', valor: 'Coherente con Icc', estado: 'Opcional', tipo: 'Recomendado' },
        { ensayo: 'Verificación de orden de fases', valor: 'Correcto (si trifásico)', estado: 'Solo si aplica', tipo: 'Recomendado' },
        { ensayo: 'Funcionamiento de DPS', valor: 'Operativo', estado: datos.dps ? 'Instalado según evaluación' : 'No instalado', tipo: 'Informativo' }
    ];
}

function generarTablaProtocoloHTML(datos) {
    const items = generarProtocolo(datos);
    return `<table>
        <thead><tr><th>Ensayo</th><th>Valor admisible</th><th>Estado</th><th>Tipo</th></tr></thead>
        <tbody>
            ${items.map(i => `<tr>
                <td>${i.ensayo}</td>
                <td>${i.valor}</td>
                <td>${i.estado}</td>
                <td>${i.tipo}</td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

// ============================================================
// GENERACIÓN DEL MANUAL DE USO Y MANTENIMIENTO
// ============================================================
function generarManualHTML() {
    return `
1. RECOMENDACIONES DE USO

- No sobrecargar los tomacorrientes.
- No conectar equipos de alta potencia a tomacorrientes de uso general (TUG).
- Usar los tomacorrientes de uso especial (TUE) para motores, AA, lavarropas, etc.
- En baños, no usar artefactos eléctricos cerca de la bañera o ducha.
- Ante disparo del diferencial, NO rearmar sin identificar la causa.

2. MANTENIMIENTO PREVENTIVO

- Realizar una inspección visual anual del tablero.
- Verificar el funcionamiento del pulsador de prueba del interruptor diferencial mensualmente.
- Reapretar bornes y conexiones cada 2 años.
- Verificar la resistencia de puesta a tierra cada 5 años con telurómetro.
- Si el DPS tiene indicador de fin de vida útil, reemplazarlo cuando lo indique.

3. QUÉ HACER ANTE UNA FALLA

- Si salta una térmica (PIA): identificar el circuito, desenchufar los artefactos, rearmar.
- Si salta el diferencial (ID): NO rearmar sin identificar la fuga. Llamar al electricista.
- Si hay olor a quemado o chispas: cortar la llave general y llamar al electricista.
- Si el DPS indica fin de vida útil: reemplazarlo por un profesional.

4. DATOS DEL INSTALADOR

- Nombre: __________________________________
- Matrícula: __________________________________
- Teléfono: __________________________________
- Fecha de instalación: ${fechaHoy()}

5. CONTACTO DE EMERGENCIA

- Distribuidora eléctrica: __________________________________
- Electricista de guardia: __________________________________
    `.trim();
}

// ============================================================
// GENERACIÓN DEL PDF COMPLETO
// ============================================================
async function generarPDFCompleto() {
    const btn = document.getElementById('btnGenerar');
    const status = document.getElementById('statusGeneracion');
    btn.disabled = true;
    btn.textContent = '⏳ Generando PDF...';
    status.innerHTML = '<div class="status-panel info">Generando documentación completa... Esto puede demorar unos segundos.</div>';

    try {
        if (typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF no está cargado. Verificá que exista libs/jspdf.umd.min.js');
        }

        const datos = recopilarDatosCompletos();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // ==================== PORTADA ====================
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 60, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('DOCUMENTACIÓN TÉCNICA', 105, 25, { align: 'center' });
        doc.setFontSize(12);
        doc.text('AEA 90364-7-770 — Anexo A', 105, 35, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(limpiarTextoPDF(datos.nombre), 105, 48, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        let y = 80;
        doc.setFont('helvetica', 'bold');
        doc.text('ÍNDICE', 15, y); y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const indice = [
            '1. Memoria Técnica Descriptiva',
            '2. Esquema Unifilar',
            '3. Listado de Materiales Detallado',
            '4. Protocolo de Verificación',
            '5. Manual de Uso y Mantenimiento'
        ];
        indice.forEach(item => {
            doc.text(limpiarTextoPDF(item), 20, y);
            y += 6;
        });

        y += 10;
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text('Fecha de emisión: ' + datos.fecha, 15, y);
        doc.text('Documento generado automáticamente por la Suite AEA 770 v8.', 15, y + 5);

        // ==================== 1. MEMORIA TÉCNICA ====================
        doc.addPage();
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('1. MEMORIA TÉCNICA DESCRIPTIVA', 105, 13, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        y = 30;
        doc.setFontSize(10);

        // 1.a Datos generales
        doc.setFont('helvetica', 'bold');
        doc.text('1.a Datos Generales', 15, y); y += 4;
        autoTableLimpio(doc, {
            startY: y,
            head: [['Concepto', 'Valor']],
            body: [
                ['Proyecto', limpiarTextoPDF(datos.nombre)],
                ['Fecha', datos.fecha],
                ['Superficie Cubierta', datos.supCubierta + ' m2'],
                ['Superficie Semicubierta', datos.supSemicubierta + ' m2'],
                ['Sla', datos.sla.toFixed(2) + ' m2'],
                ['Grado de Electrificación', datos.grado],
                ['Icc Origen', datos.iccOrigen + ' kA'],
                ['Marca Interruptores', datos.marca],
                ['Tipo de Cable', datos.tipoCable],
                ['Tipo de Instalación', datos.tipoInstalacion]
            ],
            theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 9 },
            bodyStyles: { fontSize: 9 }
        });
        y = doc.lastAutoTable.finalY + 8;

        // 1.b Acometida
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text('1.b Acometida', 15, y); y += 4;
        autoTableLimpio(doc, {
            startY: y,
            head: [['Concepto', 'Valor']],
            body: [
                ['Longitud', (datos.acometida?.longitud || 10) + ' m'],
                ['Tipo de Cable', datos.acometida?.tipoCable || 'sintenax'],
                ['Sección', (datos.acometida?.seccion || 6) + ' mm2'],
                ['Conductores', String(datos.acometida?.conductores || 4)]
            ],
            theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 9 },
            bodyStyles: { fontSize: 9 }
        });
        y = doc.lastAutoTable.finalY + 8;

        // 1.c PAT
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text('1.c Puesta a Tierra (PAT)', 15, y); y += 4;
        autoTableLimpio(doc, {
            startY: y,
            head: [['Concepto', 'Valor']],
            body: [
                ['Cantidad de Jabalinas', String(datos.puestaTierra?.cantJabalina || 1)],
                ['Longitud del Cable', (datos.puestaTierra?.longCable || 10) + ' m'],
                ['Sección del Cable', (datos.puestaTierra?.seccion || 16) + ' mm2'],
                ['Resistencia requerida', '<= 40 Ohm (verificar en obra)']
            ],
            theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 9 },
            bodyStyles: { fontSize: 9 }
        });
        y = doc.lastAutoTable.finalY + 8;

        // 1.d DPS
        if (datos.dps) {
            if (y > 220) { doc.addPage(); y = 20; }
            doc.setFont('helvetica', 'bold');
            doc.text('1.d Protección contra Sobretensiones (DPS)', 15, y); y += 4;
            autoTableLimpio(doc, {
                startY: y,
                head: [['Concepto', 'Valor']],
                body: [
                    ['Estado', datos.dps.esObligatorio ? 'OBLIGATORIO' : 'Recomendado'],
                    ['Tipo', 'Tipo ' + datos.dps.tipoRecomendado],
                    ['Up Recomendado', datos.dps.upRecomendado + ' kV'],
                    ['Tipo de Acometida', datos.dps.entrada?.tipoAcometida || '-'],
                    ['Posee Pararrayos', datos.dps.entrada?.tienePararrayos === 'si' ? 'Sí' : 'No']
                ],
                theme: 'grid',
                headStyles: { fillColor: [230, 126, 34], fontSize: 9 },
                bodyStyles: { fontSize: 9 }
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        // ==================== 2. ESQUEMA UNIFILAR ====================
        doc.addPage();
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('2. ESQUEMA UNIFILAR', 105, 13, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        try {
            const svg = generarEsquemaSVG(datos);
            // Convertir SVG a PNG usando canvas
            const pngDataUrl = await svgToPng(svg);
            if (pngDataUrl) {
                const imgWidth = 180;
                const ratio = 1400 / 900;
                doc.addImage(pngDataUrl, 'PNG', 15, 30, imgWidth, imgWidth / ratio);
            } else {
                doc.setFontSize(10);
                doc.text('No se pudo renderizar el esquema.', 15, 40);
            }
        } catch (e) {
            console.error(e);
            doc.setFontSize(10);
            doc.text('Error al generar el esquema: ' + e.message, 15, 40);
        }

        // ==================== 3. LISTADO DE MATERIALES ====================
        doc.addPage();
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('3. LISTADO DE MATERIALES', 105, 13, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        const mats = generarMateriales(datos);
        autoTableLimpio(doc, {
            startY: 30,
            head: [['Categoría', 'Descripción', 'Cantidad', 'Norma']],
            body: mats.map(m => [m.cat, m.desc, m.cant, m.norma]),
            theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 90 },
                2: { cellWidth: 25 },
                3: { cellWidth: 40 }
            }
        });

        // ==================== 4. PROTOCOLO DE VERIFICACIÓN ====================
        doc.addPage();
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('4. PROTOCOLO DE VERIFICACIÓN', 105, 13, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        const proto = generarProtocolo(datos);
        autoTableLimpio(doc, {
            startY: 30,
            head: [['Ensayo', 'Valor Admisible', 'Estado', 'Tipo']],
            body: proto.map(p => [p.ensayo, p.valor, p.estado, p.tipo]),
            theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 50 },
                2: { cellWidth: 50 },
                3: { cellWidth: 25 }
            }
        });

        // ==================== 5. MANUAL DE USO Y MANTENIMIENTO ====================
        doc.addPage();
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('5. MANUAL DE USO Y MANTENIMIENTO', 105, 13, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const manualTexto = generarManualHTML();
        const lineas = doc.splitTextToSize(limpiarTextoPDF(manualTexto), 180);
        doc.text(lineas, 15, 30);

        // ==================== PIE DE PÁGINA ====================
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text('Página ' + i + ' de ' + pageCount, 105, 292, { align: 'center' });
            doc.text('Documentación orientativa según AEA 90364-7-770 Anexo A. Consultar con profesional matriculado.', 105, 296, { align: 'center' });
        }

        // ==================== GUARDAR ====================
        const nombreLimpio = datos.nombre.replace(/[^\w]/g, '_');
        doc.save('Documentacion_AEA770_' + nombreLimpio + '.pdf');

        status.innerHTML = '<div class="status-panel ok">✅ PDF generado correctamente. Revisá tu carpeta de descargas.</div>';
    } catch (e) {
        console.error('Error al generar PDF:', e);
        status.innerHTML = '<div class="status-panel error">❌ Error al generar el PDF: ' + e.message + '</div>';
    } finally {
        btn.disabled = false;
        btn.textContent = '📄 Generar PDF Completo';
    }
}

// ============================================================
// UTILIDAD: SVG -> PNG (para incluirlo en el PDF)
// ============================================================
function svgToPng(svgString) {
    return new Promise((resolve) => {
        try {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
            const svgEl = svgDoc.documentElement;

            // Dimensiones del viewBox
            const viewBox = svgEl.getAttribute('viewBox') || '0 0 1100 1000';
            const parts = viewBox.split(' ').map(Number);
            const width = parts[2] || 1100;
            const height = parts[3] || 1000;

            // Ajustar el SVG para que renderice a tamaño conocido
            svgEl.setAttribute('width', width);
            svgEl.setAttribute('height', height);
            svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            const svgData = new XMLSerializer().serializeToString(svgEl);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = 2; // Aumentar resolución
                canvas.width = width * scale;
                canvas.height = height * scale;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = (err) => {
                console.error('Error al cargar SVG:', err);
                URL.revokeObjectURL(url);
                resolve(null);
            };
            img.src = url;
        } catch (e) {
            console.error('Error svgToPng:', e);
            resolve(null);
        }
    });
}

// ============================================================
// TEMA OSCURO
// ============================================================
function toggleTema() {
    document.body.classList.toggle('dark');
}

// ============================================================
// VOLVER AL DISEÑO
// ============================================================
function volverAlDiseno() {
    window.location.href = 'index.html';
}

// ============================================================
// EXPONER FUNCIONES AL WINDOW
// ============================================================
window.toggleTema = toggleTema;
window.volverAlDiseno = volverAlDiseno;
window.previsualizarMemoria = previsualizarMemoria;
window.previsualizarEsquema = previsualizarEsquema;
window.previsualizarMateriales = previsualizarMateriales;
window.previsualizarProtocolo = previsualizarProtocolo;
window.previsualizarManual = previsualizarManual;
window.cerrarModalPreview = cerrarModalPreview;
window.generarPDFCompleto = generarPDFCompleto;