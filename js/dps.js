// ============================================================
// DPS.JS - Lógica del Módulo de DPS (AEA 771)
// ============================================================

// ============================================================
// CATÁLOGO DE DPS COMERCIALES
// ============================================================
const CATALOGO_DPS = {
    'Schneider': {
        'Tipo1': [
            { modelo: 'iPRD1 12.5r 1P+N', Imax: 12.5, In: 12.5, Up: 1.5, polos: '1P+N', tipo: 1, Iimp: 12.5 },
            { modelo: 'iPRD1 25r 1P+N', Imax: 25, In: 25, Up: 1.5, polos: '1P+N', tipo: 1, Iimp: 25 },
            { modelo: 'iPRD1 25r 3P+N', Imax: 25, In: 25, Up: 1.5, polos: '3P+N', tipo: 1, Iimp: 25 }
        ],
        'Tipo2': [
            { modelo: 'iPRD 20r 1P+N', Imax: 20, In: 20, Up: 1.2, polos: '1P+N', tipo: 2, Iimp: null },
            { modelo: 'iPRD 40r 1P+N', Imax: 40, In: 20, Up: 1.2, polos: '1P+N', tipo: 2, Iimp: null },
            { modelo: 'iPRD 40r 3P+N', Imax: 40, In: 20, Up: 1.2, polos: '3P+N', tipo: 2, Iimp: null },
            { modelo: 'iPRD 65r 3P+N', Imax: 65, In: 20, Up: 1.5, polos: '3P+N', tipo: 2, Iimp: null }
        ],
        'Tipo3': [
            { modelo: 'iPRD 8r 1P+N', Imax: 8, In: 5, Up: 0.9, polos: '1P+N', tipo: 3, Iimp: null }
        ]
    },
    'ABB': {
        'Tipo1': [
            { modelo: 'OVR T1 25-255 P', Imax: 25, In: 25, Up: 1.5, polos: '1P', tipo: 1, Iimp: 25 },
            { modelo: 'OVR T1 25-255 4L', Imax: 25, In: 25, Up: 1.5, polos: '4P', tipo: 1, Iimp: 25 }
        ],
        'Tipo2': [
            { modelo: 'OVR T2 40-275 P', Imax: 40, In: 20, Up: 1.5, polos: '1P', tipo: 2, Iimp: null },
            { modelo: 'OVR T2 40-275 4L', Imax: 40, In: 20, Up: 1.5, polos: '4P', tipo: 2, Iimp: null },
            { modelo: 'OVR T2 65-275 4L', Imax: 65, In: 20, Up: 1.5, polos: '4P', tipo: 2, Iimp: null }
        ],
        'Tipo3': [
            { modelo: 'OVR T3 10-275 P', Imax: 10, In: 5, Up: 1.0, polos: '1P', tipo: 3, Iimp: null }
        ]
    },
    'Siemens': {
        'Tipo1': [
            { modelo: '5SD7 471-1 (Tipo 1)', Imax: 25, In: 25, Up: 1.5, polos: '1P+N', tipo: 1, Iimp: 25 }
        ],
        'Tipo2': [
            { modelo: '5SD7 431-1 (Tipo 2)', Imax: 40, In: 20, Up: 1.2, polos: '1P+N', tipo: 2, Iimp: null },
            { modelo: '5SD7 421-1 (Tipo 2)', Imax: 20, In: 20, Up: 1.2, polos: '1P+N', tipo: 2, Iimp: null }
        ],
        'Tipo3': [
            { modelo: '5SD7 411-1 (Tipo 3)', Imax: 10, In: 5, Up: 1.0, polos: '1P+N', tipo: 3, Iimp: null }
        ]
    },
    'Legrand': {
        'Tipo1': [
            { modelo: 'SPD T1 25kA 1P+N', Imax: 25, In: 25, Up: 1.5, polos: '1P+N', tipo: 1, Iimp: 25 }
        ],
        'Tipo2': [
            { modelo: 'SPD T2 20kA 1P+N', Imax: 20, In: 20, Up: 1.2, polos: '1P+N', tipo: 2, Iimp: null },
            { modelo: 'SPD T2 40kA 1P+N', Imax: 40, In: 20, Up: 1.2, polos: '1P+N', tipo: 2, Iimp: null },
            { modelo: 'SPD T2 40kA 3P+N', Imax: 40, In: 20, Up: 1.2, polos: '3P+N', tipo: 2, Iimp: null }
        ],
        'Tipo3': [
            { modelo: 'SPD T3 10kA', Imax: 10, In: 5, Up: 1.0, polos: '1P+N', tipo: 3, Iimp: null }
        ]
    }
};

// ============================================================
// NIVEL DE RIESGO POR ZONA GEOGRÁFICA (Simplificado - AEA 771 Anexo)
// Basado en densidad de descargas a tierra (DDT) aproximada
// ============================================================
const NIVELES_RIESGO = {
    'bajo':      { nombre: 'Bajo (DDT < 2 rayos/km²/año)',   coef: 1.0,  tipo_min: 'Tipo 3' },
    'medio':     { nombre: 'Medio (DDT 2-4 rayos/km²/año)',  coef: 1.3,  tipo_min: 'Tipo 2' },
    'alto':      { nombre: 'Alto (DDT 4-8 rayos/km²/año)',   coef: 1.6,  tipo_min: 'Tipo 2' },
    'muy_alto':  { nombre: 'Muy Alto (DDT > 8 rayos/km²/año)', coef: 2.0, tipo_min: 'Tipo 1' }
};

let proyecto = null;
let resultadoActual = null;

// ============================================================
// CARGA INICIAL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const data = localStorage.getItem('proyectoAEA_para_DPS');
    if (!data) {
        alert('No se encontró un proyecto. Por favor, volvé a la página principal.');
        window.location.href = 'index.html';
        return;
    }
    try {
        proyecto = JSON.parse(data);
        const previo = localStorage.getItem('resultadoDPS_' + (proyecto.nombre || 'proyecto'));
        if (previo) {
            try { resultadoActual = JSON.parse(previo); } catch(e) {}
        }
        renderizarInterfaz();
    } catch (e) {
        console.error(e);
        alert('Error al leer los datos del proyecto.');
        window.location.href = 'index.html';
    }
});

// ============================================================
// RENDERIZADO DE LA INTERFAZ
// ============================================================
function renderizarInterfaz() {
    const iccOrigen = parseFloat(proyecto.iccOrigen) || 4.5;
    const tipoAcometida = proyecto.acometida ? proyecto.acometida.tipoInst : 'enterrado';
    const esAerea = tipoAcometida.includes('aereo');
    const marcaProyecto = proyecto.marca || 'Schneider';
    const esTrifasico = proyecto.acometida ? parseInt(proyecto.acometida.conductores) >= 4 : true;

    const html = `
        <div class="info-tip">
            📘 Este módulo evalúa la <strong>necesidad de instalar un DPS</strong> y recomienda un dispositivo del catálogo comercial
            según la sección <strong>771 de la AEA 90364</strong>. Los resultados se guardan automáticamente y se integran al proyecto principal.
        </div>

        <h2>1. Datos de la Instalación</h2>
        <div class="form-grid">
            <div class="form-group">
                <label for="tipoAcometida">Tipo de Acometida</label>
                <select id="tipoAcometida" onchange="evaluarDPS()">
                    <option value="aerea" ${esAerea ? 'selected' : ''}>Aérea</option>
                    <option value="subterranea" ${!esAerea ? 'selected' : ''}>Subterránea</option>
                </select>
            </div>
            <div class="form-group">
                <label for="tienePararrayos">¿El inmueble posee sistema de pararrayos?</label>
                <select id="tienePararrayos" onchange="evaluarDPS()">
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                </select>
            </div>
            <div class="form-group">
                <label for="nivelRiesgo">Nivel de Riesgo por Zona Geográfica (DDT)</label>
                <select id="nivelRiesgo" onchange="evaluarDPS()">
                    ${Object.keys(NIVELES_RIESGO).map(k =>
                        `<option value="${k}" ${k === 'medio' ? 'selected' : ''}>${NIVELES_RIESGO[k].nombre}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="marcaDPS">Marca del DPS (según proyecto)</label>
                <select id="marcaDPS" onchange="evaluarDPS()">
                    ${Object.keys(CATALOGO_DPS).map(m =>
                        `<option value="${m}" ${m === marcaProyecto ? 'selected' : ''}>${m}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="iccOrigen">Icc Presunta en Origen (kA) - del Proyecto</label>
                <input type="text" id="iccOrigen" value="${iccOrigen.toFixed(2)}" readonly>
            </div>
            <div class="form-group">
                <label for="configTablero">Configuración del Tablero Principal</label>
                <input type="text" id="configTablero" value="${esTrifasico ? 'Trifásico (3F+N)' : 'Monofásico (1F+N)'}" readonly>
            </div>
        </div>

        <h2>2. Resultado de la Evaluación</h2>
        <div id="resultadoDPS"></div>

        <h2>3. DPS Recomendados del Catálogo</h2>
        <div id="catalogoDPS"></div>

        <h2>4. Notas Técnicas Complementarias</h2>
        <div id="notasTecnicas"></div>

        <div class="actions">
            <button class="success" onclick="guardarResultado()">💾 Guardar Resultado</button>
            <div class="actions-right">
                <button onclick="volverAlDiseno()">← Volver al Diseño</button>
                <button onclick="exportarPDFDPS()">📄 Exportar Informe a PDF</button>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;

    if (resultadoActual && resultadoActual.entrada) {
        document.getElementById('tipoAcometida').value = resultadoActual.entrada.tipoAcometida || 'subterranea';
        document.getElementById('tienePararrayos').value = resultadoActual.entrada.tienePararrayos || 'no';
        document.getElementById('nivelRiesgo').value = resultadoActual.entrada.nivelRiesgo || 'medio';
        document.getElementById('marcaDPS').value = resultadoActual.entrada.marca || 'Schneider';
    }

    evaluarDPS();
}

// ============================================================
// LÓGICA PRINCIPAL DE EVALUACIÓN
// ============================================================
function evaluarDPS() {
    const tipoAcometida = document.getElementById('tipoAcometida').value;
    const tienePararrayos = document.getElementById('tienePararrayos').value;
    const nivelRiesgoKey = document.getElementById('nivelRiesgo').value;
    const marca = document.getElementById('marcaDPS').value;
    const iccOrigen = parseFloat(document.getElementById('iccOrigen').value) || 4.5;
    const esTrifasico = document.getElementById('configTablero').value.includes('Trifásico');

    const nivelRiesgo = NIVELES_RIESGO[nivelRiesgoKey];

    let esObligatorio = false;
    let motivosObligatorio = [];

    if (tipoAcometida === 'aerea') {
        esObligatorio = true;
        motivosObligatorio.push('La acometida es <strong>aérea</strong> (línea expuesta a sobretensiones atmosféricas).');
    }
    if (tienePararrayos === 'si') {
        esObligatorio = true;
        motivosObligatorio.push('El inmueble <strong>posee pararrayos</strong> (riesgo de sobretensión inducida).');
    }
    if (nivelRiesgoKey === 'muy_alto') {
        esObligatorio = true;
        motivosObligatorio.push('La zona geográfica tiene <strong>nivel de riesgo muy alto</strong> (DDT > 8).');
    }

    let tipoRecomendado = 3;
    let motivoTipo = [];

    if (esObligatorio) {
        tipoRecomendado = 2;
        motivoTipo.push('Al ser obligatorio, se requiere como mínimo un DPS de <strong>Tipo 2</strong>.');
    }

    if (tienePararrayos === 'si' || iccOrigen > 6 || nivelRiesgoKey === 'muy_alto' || nivelRiesgoKey === 'alto') {
        tipoRecomendado = 1;
        if (tienePararrayos === 'si') motivoTipo.push('Presencia de pararrayos → se requiere <strong>Tipo 1</strong>.');
        if (iccOrigen > 6) motivoTipo.push('Icc de origen > 6 kA → se recomienda <strong>Tipo 1</strong>.');
        if (nivelRiesgoKey === 'muy_alto') motivoTipo.push('Nivel de riesgo muy alto → se recomienda <strong>Tipo 1</strong>.');
        if (nivelRiesgoKey === 'alto') motivoTipo.push('Nivel de riesgo alto → se recomienda <strong>Tipo 1</strong> o Tipo 2 reforzado.');
    } else if (esObligatorio) {
        tipoRecomendado = 2;
        if (tipoAcometida === 'aerea') motivoTipo.push('Acometida aérea → <strong>Tipo 2</strong> con Imax ≥ 40 kA.');
    }

    if (!esObligatorio) {
        tipoRecomendado = nivelRiesgoKey === 'medio' ? 2 : 3;
        motivoTipo.push('No es obligatorio, pero se recomienda su instalación para proteger equipos electrónicos sensibles.');
    }

    const tensionNominal = esTrifasico ? 400 : 230;
    const upMax = 1.5;
    const upRecomendado = tipoRecomendado === 1 ? 1.5 : (tipoRecomendado === 2 ? 1.2 : 1.0);

    const tipoKey = 'Tipo' + tipoRecomendado;
    const catalogoMarca = CATALOGO_DPS[marca] || CATALOGO_DPS['Schneider'];
    let dispositivos = catalogoMarca[tipoKey] || [];

    dispositivos = dispositivos.filter(d => {
        if (esTrifasico) return d.polos.includes('3P') || d.polos.includes('4P');
        return d.polos.includes('1P') || d.polos.includes('2P');
    });

    let tipoFinal = tipoRecomendado;
    let dispositivosFinales = dispositivos;
    if (dispositivosFinales.length === 0) {
        for (let t = tipoRecomendado + 1; t <= 3; t++) {
            const alt = (catalogoMarca['Tipo' + t] || []).filter(d => {
                if (esTrifasico) return d.polos.includes('3P') || d.polos.includes('4P');
                return d.polos.includes('1P') || d.polos.includes('2P');
            });
            if (alt.length > 0) {
                dispositivosFinales = alt;
                tipoFinal = t;
                break;
            }
        }
    }

    resultadoActual = {
        entrada: { tipoAcometida, tienePararrayos, nivelRiesgo: nivelRiesgoKey, marca, iccOrigen, esTrifasico },
        esObligatorio,
        motivosObligatorio,
        tipoRecomendado: tipoFinal,
        motivoTipo,
        upRecomendado,
        upMax,
        dispositivos: dispositivosFinales,
        fecha: new Date().toISOString()
    };

    renderizarResultado();
    renderizarCatalogo();
    renderizarNotas();
}

// ============================================================
// RENDERIZAR RESULTADO
// ============================================================
function renderizarResultado() {
    const div = document.getElementById('resultadoDPS');
    const r = resultadoActual;

    let clase = 'ok';
    let titulo = '';
    let mensaje = '';

    if (r.esObligatorio) {
        clase = 'error';
        titulo = '✔ DPS OBLIGATORIO';
        mensaje = `<strong>Motivos:</strong><ul>${r.motivosObligatorio.map(m => `<li>${m}</li>`).join('')}</ul>`;
    } else {
        clase = 'ok';
        titulo = '⚠ DPS NO OBLIGATORIO (pero recomendado)';
        mensaje = `Con los datos ingresados, la instalación de un DPS no es obligatoria según AEA 771. Sin embargo, se <strong>recomienda su instalación</strong> para proteger equipos electrónicos sensibles.`;
    }

    const tipoNombre = {
        1: 'Tipo 1 (Clase B) - Protección contra impactos directos',
        2: 'Tipo 2 (Clase C) - Protección contra sobretensiones inducidas',
        3: 'Tipo 3 (Clase D) - Protección fina de equipos'
    }[r.tipoRecomendado];

    div.className = `result-box ${clase}`;
    div.innerHTML = `
        <h3>${titulo}</h3>
        <p>${mensaje}</p>
        <div class="stat-grid">
            <div class="stat">
                <div class="value">${r.tipoRecomendado}</div>
                <div class="label">Tipo de DPS</div>
            </div>
            <div class="stat">
                <div class="value">${r.upRecomendado} kV</div>
                <div class="label">Nivel de Protección (Up)</div>
            </div>
            <div class="stat">
                <div class="value">${r.entrada.iccOrigen.toFixed(1)} kA</div>
                <div class="label">Icc Origen</div>
            </div>
            <div class="stat">
                <div class="value">${r.entrada.esTrifasico ? '3F+N' : '1F+N'}</div>
                <div class="label">Configuración</div>
            </div>
        </div>
        <p style="margin-top:10px;"><strong>Tipo recomendado:</strong> ${tipoNombre}</p>
        ${r.motivoTipo.length ? `<ul>${r.motivoTipo.map(m => `<li>${m}</li>`).join('')}</ul>` : ''}
    `;
}

// ============================================================
// RENDERIZAR CATÁLOGO
// ============================================================
function renderizarCatalogo() {
    const div = document.getElementById('catalogoDPS');
    const r = resultadoActual;

    if (!r.dispositivos || r.dispositivos.length === 0) {
        div.innerHTML = `<div class="info-tip">⚠ No se encontraron dispositivos en el catálogo para la configuración seleccionada. Consultar con el fabricante.</div>`;
        return;
    }

    const filas = r.dispositivos.map(d => `
        <tr>
            <td><strong>${d.modelo}</strong></td>
            <td>${d.polos}</td>
            <td>Tipo ${d.tipo}</td>
            <td>${d.Iimp ? d.Iimp + ' kA' : '—'}</td>
            <td>${d.Imax} kA</td>
            <td>${d.In} kA</td>
            <td><span class="badge ${d.Up <= r.upRecomendado ? 'ok' : 'warn'}">${d.Up} kV</span></td>
        </tr>
    `).join('');

    div.innerHTML = `
        <div class="info-tip">
            💡 Se recomienda un DPS de <strong>Tipo ${r.tipoRecomendado}</strong> con Up ≤ <strong>${r.upRecomendado} kV</strong>
            y configurado para <strong>${r.entrada.esTrifasico ? 'trifásico (3F+N)' : 'monofásico (1F+N)'}</strong>.
            Marca: <strong>${r.entrada.marca}</strong>.
        </div>
        <table>
            <thead>
                <tr>
                    <th>Modelo</th>
                    <th>Polos</th>
                    <th>Tipo</th>
                    <th>Iimp</th>
                    <th>Imax</th>
                    <th>In</th>
                    <th>Up</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
        <div class="card">
            <h4>📋 Características a verificar antes de la compra:</h4>
            <ul style="margin-left:20px;line-height:1.8;font-size:0.9em;">
                <li><strong>Up (Nivel de Protección):</strong> Debe ser ≤ ${r.upRecomendado} kV para proteger los equipos.</li>
                <li><strong>Imax (Corriente máxima de descarga):</strong> ≥ ${r.tipoRecomendado === 1 ? '25' : (r.tipoRecomendado === 2 ? '20' : '8')} kA.</li>
                <li><strong>Iimp (Corriente de impulso):</strong> ${r.tipoRecomendado === 1 ? '≥ 12.5 kA (10/350 µs)' : 'No aplica para Tipo 2/3'}.</li>
                <li><strong>Configuración:</strong> ${r.entrada.esTrifasico ? 'Trifásico (3F+N)' : 'Monofásico (1F+N)'}.</li>
                <li><strong>Coordinación:</strong> Si se instalan varios DPS en cascada, deben estar coordinados energéticamente.</li>
                <li><strong>Protección de respaldo:</strong> Instalar fusible o PIA aguas arriba del DPS según indicación del fabricante.</li>
            </ul>
        </div>
    `;
}

// ============================================================
// RENDERIZAR NOTAS TÉCNICAS
// ============================================================
function renderizarNotas() {
    const div = document.getElementById('notasTecnicas');
    const r = resultadoActual;
    const notas = [];

    notas.push({
        tipo: 'info',
        texto: 'El DPS debe instalarse en el <strong>tablero principal</strong>, lo más cerca posible de la entrada de la acometida, con conductores lo más cortos posible (< 50 cm idealmente).'
    });

    notas.push({
        tipo: 'info',
        texto: 'La sección mínima recomendada de los conductores de conexión del DPS es de <strong>6 mm² (Cu)</strong> para Tipo 2 y <strong>16 mm² (Cu)</strong> para Tipo 1.'
    });

    notas.push({
        tipo: 'warn',
        texto: 'Verificar que la <strong>tensión de servicio (Uc)</strong> del DPS sea ≥ 1.1 × tensión nominal de la red (ej. 275 V para 230 V).'
    });

    if (r.esObligatorio) {
        notas.push({
            tipo: 'error',
            texto: 'La instalación de DPS es <strong>obligatoria</strong>. Su ausencia puede invalidar la cobertura del seguro del inmueble y no cumple con AEA 90364-7-771.'
        });
    }

    notas.push({
        tipo: 'warn',
        texto: 'Si el inmueble tiene pararrayos, se debe instalar <strong>obligatoriamente</strong> un DPS Tipo 1 coordinado con el sistema de captación.'
    });

    notas.push({
        tipo: 'info',
        texto: `Basado en el nivel de riesgo <strong>${NIVELES_RIESGO[r.entrada.nivelRiesgo].nombre}</strong>, se aplica un coeficiente de ${NIVELES_RIESGO[r.entrada.nivelRiesgo].coef} para la selección del DPS.`
    });

    notas.push({
        tipo: 'info',
        texto: 'Este informe es orientativo. La selección final debe ser validada por un profesional matriculado y coordinada con el fabricante del DPS.'
    });

    div.innerHTML = notas.map(n => `
        <div class="result-box ${n.tipo}" style="margin-top:10px;padding:12px 15px;">
            <p style="font-size:0.9em;">${n.texto}</p>
        </div>
    `).join('');
}

// ============================================================
// GUARDAR RESULTADO EN LOCALSTORAGE
// ============================================================
function guardarResultado() {
    if (!resultadoActual) {
        alert('⚠️ Primero realizá la evaluación.');
        return;
    }
    const key = 'resultadoDPS_' + (proyecto.nombre || 'proyecto');
    try {
        localStorage.setItem(key, JSON.stringify(resultadoActual));
        proyecto.dps = {
            evaluado: true,
            esObligatorio: resultadoActual.esObligatorio,
            tipoRecomendado: resultadoActual.tipoRecomendado,
            upRecomendado: resultadoActual.upRecomendado,
            dispositivoSugerido: resultadoActual.dispositivos[0] ? resultadoActual.dispositivos[0].modelo : null,
            fecha: resultadoActual.fecha
        };
        localStorage.setItem('proyectoAEA_para_DPS', JSON.stringify(proyecto));
        alert('✅ Resultado del DPS guardado. Ya está disponible en el proyecto principal.');
    } catch (e) {
        alert('❌ Error al guardar: ' + e.message);
    }
}

// ============================================================
// VOLVER AL DISEÑO
// ============================================================
function volverAlDiseno() {
    if (resultadoActual) {
        try {
            const key = 'resultadoDPS_' + (proyecto.nombre || 'proyecto');
            localStorage.setItem(key, JSON.stringify(resultadoActual));
            proyecto.dps = {
                evaluado: true,
                esObligatorio: resultadoActual.esObligatorio,
                tipoRecomendado: resultadoActual.tipoRecomendado,
                upRecomendado: resultadoActual.upRecomendado,
                dispositivoSugerido: resultadoActual.dispositivos[0] ? resultadoActual.dispositivos[0].modelo : null,
                fecha: resultadoActual.fecha
            };
            localStorage.setItem('proyectoAEA_para_DPS', JSON.stringify(proyecto));
        } catch (e) {}
    }
    window.location.href = 'index.html';
}

// ============================================================
// EXPORTAR PDF
// ============================================================
function exportarPDFDPS() {
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
        alert('❌ La librería jsPDF no está cargada.');
        return;
    }
    if (!resultadoActual) {
        alert('⚠️ Primero realizá la evaluación.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-AR');
    const r = resultadoActual;

    const limpiarTextoPDF = (texto) => String(texto || '')
        .replace(/[→←↔≤≥≠Ω°²³·✔✖⚠ℹ⏚🔌📋📏✅🚀🧲📊⚡📦📐🔧💡Δ—–""'']/g, (ch) => {
            const map = {'→':'->','←':'<-','↔':'<->','≤':'<=','≥':'>=','≠':'!=','Ω':'Ohm','°':' deg','²':'2','³':'3','·':'.','✔':'[OK]','✖':'[X]','⚠':'[!]','ℹ':'[i]','Δ':'DU','—':'-','–':'-','"':'"','"':'"',"'":"'","'":"'",'⏚':'PAT','🔌':'','📋':'','📏':'','✅':'[OK]','🚀':'','🧲':'','📊':'','⚡':'','📦':'','📐':'','🔧':'','💡':''};
            return map[ch] || '';
        });

    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME DE EVALUACION DE DPS', 105, 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(limpiarTextoPDF(`Proyecto: ${proyecto.nombre || 'Sin nombre'} | Fecha: ${fecha}`), 105, 19, { align: 'center' });
    doc.text(limpiarTextoPDF('AEA 90364-7-771'), 105, 25, { align: 'center' });

    doc.setTextColor(0,0,0);
    let y = 40;

    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('1. DATOS DE ENTRADA', 15, y); y += 6;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(limpiarTextoPDF(`Tipo de Acometida: ${r.entrada.tipoAcometida}`), 15, y); y += 5;
    doc.text(limpiarTextoPDF(`Posee Pararrayos: ${r.entrada.tienePararrayos}`), 15, y); y += 5;
    doc.text(limpiarTextoPDF(`Nivel de Riesgo: ${NIVELES_RIESGO[r.entrada.nivelRiesgo].nombre}`), 15, y); y += 5;
    doc.text(limpiarTextoPDF(`Icc Origen: ${r.entrada.iccOrigen.toFixed(2)} kA`), 15, y); y += 5;
    doc.text(limpiarTextoPDF(`Configuracion: ${r.entrada.esTrifasico ? 'Trifasico (3F+N)' : 'Monofasico (1F+N)'}`), 15, y); y += 10;

    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('2. RESULTADO DE LA EVALUACION', 15, y); y += 6;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(limpiarTextoPDF(`DPS Obligatorio: ${r.esObligatorio ? 'SI' : 'NO (pero recomendado)'}`), 15, y); y += 5;
    doc.text(limpiarTextoPDF(`Tipo Recomendado: Tipo ${r.tipoRecomendado}`), 15, y); y += 5;
    doc.text(limpiarTextoPDF(`Up Recomendado: <= ${r.upRecomendado} kV`), 15, y); y += 8;

    if (r.motivosObligatorio.length) {
        doc.setFont('helvetica', 'bold');
        doc.text('Motivos:', 15, y); y += 5;
        doc.setFont('helvetica', 'normal');
        r.motivosObligatorio.forEach(m => {
            const texto = limpiarTextoPDF('- ' + m.replace(/<[^>]*>/g, ''));
            const split = doc.splitTextToSize(texto, 180);
            doc.text(split, 15, y);
            y += split.length * 5;
        });
    }
    y += 5;

    if (r.dispositivos && r.dispositivos.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text('3. DPS RECOMENDADOS DEL CATALOGO', 15, y); y += 6;

        const body = r.dispositivos.map(d => [
            limpiarTextoPDF(d.modelo),
            limpiarTextoPDF(d.polos),
            'Tipo ' + d.tipo,
            d.Iimp ? d.Iimp + ' kA' : '-',
            d.Imax + ' kA',
            d.In + ' kA',
            d.Up + ' kV'
        ]);

        doc.autoTable({
            startY: y,
            head: [['Modelo', 'Polos', 'Tipo', 'Iimp', 'Imax', 'In', 'Up']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 8 },
            bodyStyles: { fontSize: 8 }
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('4. NOTAS TECNICAS', 15, y); y += 6;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');

    const notas = [
        'El DPS debe instalarse en el tablero principal, cerca de la entrada de la acometida.',
        'Conductores de conexion lo mas cortos posible (< 50 cm).',
        'Seccion minima: 6 mm2 (Tipo 2) o 16 mm2 (Tipo 1).',
        'Verificar Uc >= 1.1 x tension nominal (ej. 275 V para 230 V).',
        'Si hay pararrayos, instalar DPS Tipo 1 obligatoriamente.',
        'Este informe es orientativo. Validar con profesional matriculado.'
    ];
    notas.forEach(n => {
        const split = doc.splitTextToSize('- ' + n, 180);
        doc.text(split, 15, y);
        y += split.length * 5;
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text('Pagina ' + i + ' de ' + pageCount, 105, 292, { align: 'center' });
        doc.text('Informe orientativo segun AEA 90364-7-771. Consultar con profesional matriculado.', 105, 296, { align: 'center' });
    }

    doc.save('Informe_DPS_' + (proyecto.nombre || 'Proyecto').replace(/\s+/g, '_') + '.pdf');
}

// ============================================================
// TEMA OSCURO
// ============================================================
function toggleTema() {
    document.body.classList.toggle('dark');
}

// ============================================================
// EXPONER FUNCIONES AL WINDOW (necesario para onclick="...")
// ============================================================
window.evaluarDPS = evaluarDPS;
window.guardarResultado = guardarResultado;
window.volverAlDiseno = volverAlDiseno;
window.exportarPDFDPS = exportarPDFDPS;
window.toggleTema = toggleTema;