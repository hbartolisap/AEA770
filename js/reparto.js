// ============================================================
// REPARTO.JS - Lógica de Reparto de Circuitos por Tablero
// ============================================================

// ============================================================
// ESTADO
// ============================================================
let filas = [];
let tablerosProyecto = [];
let proyectoNombre = '';

const MAX = { iug: 15, tug: 15, tue: 12 };
const VA  = { iug: 440, tug: 2200, tue: 3300 };

// ============================================================
// CARGA DEL JSON DE LA SUITE
// ============================================================
function cargarJSONSuite(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const p = JSON.parse(e.target.result);
            importarProyecto(p);
            input.value = '';
        } catch(err) {
            alert('❌ Error al leer el JSON:\n' + err.message);
        }
    };
    reader.readAsText(file);
}

function importarProyecto(p) {
    if (!p || (!p.ambientes && !p.tableros)) {
        alert('⚠️ El JSON no parece ser de la Suite AEA 770 (faltan "ambientes" o "tableros").');
        return;
    }
    proyectoNombre = p.nombre || 'Proyecto sin nombre';
    tablerosProyecto = Array.isArray(p.tableros) ? p.tableros.slice() : [];
    if (tablerosProyecto.length === 0) {
        tablerosProyecto = [{ id: 'Principal', nombre: 'Tablero Principal', planta: 'PB', padre: null }];
    }

    const ambientes = Array.isArray(p.ambientes) ? p.ambientes : [];
    filas = ambientes.map(a => {
        const b = calcularBocasDesdeAmbiente(a, p);
        return {
            tablero: a.tablero || tablerosProyecto[0].id,
            ambiente: a.nombre || '(sin nombre)',
            tipo: a.tipo || '',
            area: a.area || 0,
            iug: b.iug, tug: b.tug, tue: b.tue
        };
    });

    const sla = (parseFloat(p.supCubierta) || 0) + (parseFloat(p.supSemicubierta) || 0) * 0.5;
    const grado = sla <= 60 ? 'MÍNIMO' : sla <= 130 ? 'MEDIO' : sla <= 200 ? 'ELEVADO' : 'SUPERIOR';
    document.getElementById('infoProyecto').innerHTML = `
        ✅ <strong>${proyectoNombre}</strong> cargado.<br>
        Sla: <strong>${sla.toFixed(2)} m²</strong> · Grado: <strong>${grado}</strong> ·
        Tableros: <strong>${tablerosProyecto.length}</strong> ·
        Ambientes: <strong>${filas.length}</strong>
    `;
    render();
}

function calcularBocasDesdeAmbiente(amb, p) {
    const min = calcularBocasMinimas(amb.tipo, amb.area);
    return {
        iug: (amb.iugReal !== undefined && amb.iugReal !== null) ? amb.iugReal : min.iug,
        tug: (amb.tugReal !== undefined && amb.tugReal !== null) ? amb.tugReal : min.tug,
        tue: (amb.tueReal !== undefined && amb.tueReal !== null) ? amb.tueReal : min.tue
    };
}

function calcularBocasMinimas(tipo, area) {
    area = parseFloat(area) || 0;
    let iug = 0, tug = 0, tue = 0;
    switch(tipo) {
        case 'Habitación':
            iug = Math.max(1, Math.ceil(area / 18));
            tug = Math.max(2, Math.ceil(area / 6));
            break;
        case 'Dormitorio':
            iug = 1;
            if (area < 10) tug = 2;
            else if (area <= 36) tug = 3;
            else { tug = 3; tue = 1; }
            break;
        case 'Cocina': iug = 2; tug = 3; break;
        case 'Baño': iug = 1; tug = 1; break;
        case 'Pasillo':
            iug = Math.max(1, Math.ceil(area / 5));
            tug = area > 2 ? Math.max(1, Math.ceil(area / 5)) : 0;
            break;
        case 'Vestíbulo': iug = 1; tug = Math.max(1, Math.ceil(area / 12)); break;
        case 'Lavadero': iug = 1; tug = 2; break;
        case 'Balcón': iug = Math.max(1, Math.ceil(area / 5)); break;
        case 'Kitchenette': iug = 1; tug = 2; break;
        case 'Depósito':
            iug = Math.max(1, Math.ceil(area / 15));
            tug = Math.max(1, Math.ceil(area / 9));
            break;
        case 'Cuarto Técnico': iug = 1; tug = 1; tue = 1; break;
        default: iug = 1; tug = 1;
    }
    return { iug, tug, tue };
}

function cargarEjemplo() {
    const ejemplo = {
        nombre: 'Vivienda Ejemplo',
        supCubierta: 120, supSemicubierta: 10,
        tableros: [
            { id: 'Principal', nombre: 'Tablero Principal', planta: 'PB', padre: null },
            { id: 'T1', nombre: 'Tablero Planta Alta', planta: 'PA', padre: 'Principal' },
            { id: 'T2', nombre: 'Tablero Garage', planta: 'EXT', padre: 'Principal' }
        ],
        ambientes: [
            { nombre: 'Estar-Comedor', tipo: 'Habitación', area: 24, tablero: 'Principal' },
            { nombre: 'Cocina', tipo: 'Cocina', area: 10, tablero: 'Principal' },
            { nombre: 'Baño 1', tipo: 'Baño', area: 4, tablero: 'Principal' },
            { nombre: 'Lavadero', tipo: 'Lavadero', area: 5, tablero: 'Principal' },
            { nombre: 'Dormitorio 1', tipo: 'Dormitorio', area: 15, tablero: 'T1' },
            { nombre: 'Dormitorio 2', tipo: 'Dormitorio', area: 12, tablero: 'T1' },
            { nombre: 'Dormitorio 3', tipo: 'Dormitorio', area: 14, tablero: 'T1' },
            { nombre: 'Baño 2', tipo: 'Baño', area: 3, tablero: 'T1' },
            { nombre: 'Garage', tipo: 'Vestíbulo', area: 18, tablero: 'T2' },
            { nombre: 'Cuarto Máquinas', tipo: 'Cuarto Técnico', area: 6, tablero: 'T2' }
        ]
    };
    importarProyecto(ejemplo);
}

function limpiarTodo() {
    filas = []; tablerosProyecto = []; proyectoNombre = '';
    document.getElementById('infoProyecto').innerHTML =
        'Sin proyecto cargado. Cargá el JSON exportado desde la Suite AEA 770 v8 o usá el ejemplo.';
    render();
}

// ============================================================
// RENDER DE LA TABLA
// ============================================================
function render() {
    const tbody = document.getElementById('cuerpoTabla');
    if (filas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty">Sin ambientes. Cargá un JSON o agregá filas manualmente.</td></tr>';
    } else {
        tbody.innerHTML = filas.map((f, i) => `
            <tr>
                <td>
                    <select onchange="actualizar(${i}, 'tablero', this.value)"
                            style="padding:5px;border-radius:5px;border:1px solid var(--border);background:var(--card);color:var(--text);">
                        ${opcionesTableros(f.tablero)}
                    </select>
                </td>
                <td><input type="text" value="${f.ambiente}" onchange="actualizar(${i}, 'ambiente', this.value)" style="width:150px;"></td>
                <td><input type="text" value="${f.tipo}" onchange="actualizar(${i}, 'tipo', this.value)" style="width:110px;"></td>
                <td><input type="number" step="0.1" value="${f.area}" onchange="actualizar(${i}, 'area', this.value)"></td>
                <td><input type="number" min="0" value="${f.iug}" onchange="actualizar(${i}, 'iug', this.value)"></td>
                <td><input type="number" min="0" value="${f.tug}" onchange="actualizar(${i}, 'tug', this.value)"></td>
                <td><input type="number" min="0" value="${f.tue}" onchange="actualizar(${i}, 'tue', this.value)"></td>
                <td><button class="btn-del" onclick="eliminar(${i})">✖</button></td>
            </tr>
        `).join('');
    }
    calcular();
}

function opcionesTableros(seleccionado) {
    let lista = tablerosProyecto.length > 0
        ? tablerosProyecto
        : [...new Set(filas.map(f => f.tablero))].map(id => ({ id, nombre: id }));
    return lista.map(t => {
        const nombre = t.nombre || t.id;
        return `<option value="${t.id}" ${t.id === seleccionado ? 'selected' : ''}>${nombre}</option>`;
    }).join('');
}

function agregarFila() {
    const tableroDefecto = tablerosProyecto[0]?.id || 'Principal';
    filas.push({ tablero: tableroDefecto, ambiente: 'Nuevo ambiente', tipo: 'Habitación', area: 0, iug: 0, tug: 0, tue: 0 });
    render();
}

function eliminar(i) { filas.splice(i, 1); render(); }

function actualizar(i, campo, valor) {
    if (campo === 'tablero' || campo === 'ambiente' || campo === 'tipo') {
        filas[i][campo] = valor;
    } else {
        filas[i][campo] = parseFloat(valor) || 0;
    }
    calcular();
}

// ============================================================
// DISTRIBUCIÓN AUTOMÁTICA
// ============================================================
function distribuirAuto() {
    if (filas.length === 0) { alert('No hay ambientes cargados.'); return; }
    if (tablerosProyecto.length < 2) {
        alert('Solo hay un tablero. No hace falta distribuir.');
        return;
    }
    if (!confirm('¿Distribuir automáticamente los ambientes entre los tableros?\nSe reemplazará la asignación actual.')) return;

    const tableros = tablerosProyecto.map(t => ({ id: t.id, bocas: 0 }));
    const bocasPorAmbiente = filas.map(f => f.iug + f.tug + f.tue);

    filas.forEach((f, idx) => {
        let mejor = 0, menor = Infinity;
        tableros.forEach((t, i) => { if (t.bocas < menor) { menor = t.bocas; mejor = i; } });
        filas[idx].tablero = tableros[mejor].id;
        tableros[mejor].bocas += bocasPorAmbiente[idx];
    });
    render();
    alert('✅ Distribución automática aplicada.');
}

// ============================================================
// CÁLCULO Y RESÚMENES
// ============================================================
function calcular() {
    const tableros = {};
    filas.forEach(f => {
        if (!tableros[f.tablero]) tableros[f.tablero] = { iug: 0, tug: 0, tue: 0, ambientes: [] };
        tableros[f.tablero].iug += f.iug;
        tableros[f.tablero].tug += f.tug;
        tableros[f.tablero].tue += f.tue;
        tableros[f.tablero].ambientes.push(f);
    });
    renderResumenPorTablero(tableros);
    renderListaCircuitos(tableros);
    renderResumenGlobal(tableros);
    window.__repartoData = { tableros };
}

function renderResumenPorTablero(tableros) {
    const cont = document.getElementById('resumen');
    if (Object.keys(tableros).length === 0) { cont.innerHTML = '<div class="empty">Sin datos.</div>'; return; }
    let html = '';
    Object.keys(tableros).forEach(tId => {
        const b = tableros[tId];
        const cIUG = b.iug > 0 ? Math.ceil(b.iug / MAX.iug) : 0;
        const cTUG = b.tug > 0 ? Math.ceil(b.tug / MAX.tug) : 0;
        const cTUE = b.tue > 0 ? Math.ceil(b.tue / MAX.tue) : 0;
        const dpms = cIUG * VA.iug + cTUG * VA.tug + cTUE * VA.tue;
        const nombre = nombreTablero(tId);
        html += `
            <div class="tablero-card">
                <h3>📋 ${nombre}</h3>
                <table>
                    <tr><th>Tipo</th><th>Bocas</th><th>Máx/Cto</th><th>Circuitos</th><th>DPMS</th></tr>
                    <tr><td><span class="badge iug">IUG</span></td><td>${b.iug}</td><td>${MAX.iug}</td><td><strong>${cIUG}</strong></td><td>${cIUG * VA.iug} VA</td></tr>
                    <tr><td><span class="badge tug">TUG</span></td><td>${b.tug}</td><td>${MAX.tug}</td><td><strong>${cTUG}</strong></td><td>${cTUG * VA.tug} VA</td></tr>
                    <tr><td><span class="badge tue">TUE</span></td><td>${b.tue}</td><td>${MAX.tue}</td><td><strong>${cTUE}</strong></td><td>${cTUE * VA.tue} VA</td></tr>
                    <tr class="total"><td colspan="3">Total ${nombre}</td><td>${cIUG + cTUG + cTUE} circuitos</td><td>${dpms} VA</td></tr>
                </table>
            </div>`;
    });
    cont.innerHTML = html;
}

function renderListaCircuitos(tableros) {
    const cont = document.getElementById('listaCircuitos');
    if (Object.keys(tableros).length === 0) { cont.innerHTML = '<div class="empty">Sin datos.</div>'; return; }
    let html = '';
    let contadorGlobal = 1;
    Object.keys(tableros).forEach(tId => {
        const b = tableros[tId];
        const nombre = nombreTablero(tId);
        const circuitos = generarCircuitos(b.ambientes);
        if (circuitos.length === 0) return;
        html += `<div class="tablero-card"><h3>📋 ${nombre}</h3><table>
            <thead><tr><th>Cto</th><th>Tipo</th><th>Bocas</th><th>DPMS</th><th>Zona / Área</th></tr></thead><tbody>`;
        circuitos.forEach(c => {
            const nombreCto = 'C' + (contadorGlobal++);
            const zona = c.zonas.join(' + ');
            html += `<tr class="circuito-row">
                <td><strong>${nombreCto}</strong></td>
                <td><span class="badge ${c.tipo.toLowerCase()}">${c.tipo}</span></td>
                <td>${c.bocas}</td><td>${c.dpms} VA</td><td class="zona">${zona}</td>
            </tr>`;
        });
        const totalBocas = circuitos.reduce((s, c) => s + c.bocas, 0);
        const totalDpms = circuitos.reduce((s, c) => s + c.dpms, 0);
        html += `<tr class="subtotal-row"><td colspan="2">Subtotal ${nombre}</td><td>${totalBocas}</td><td>${totalDpms} VA</td><td>${circuitos.length} circuitos</td></tr></tbody></table></div>`;
    });
    cont.innerHTML = html || '<div class="empty">Sin circuitos generados.</div>';
}

function generarCircuitos(ambientesTablero) {
    const circuitos = [];
    function agruparPorTipo(tipo, maxPorCircuito, vaPorCircuito) {
        const porciones = [];
        ambientesTablero.forEach(amb => {
            let restante = amb[tipo.toLowerCase()];
            if (!restante || restante <= 0) return;
            while (restante > 0) {
                const cant = Math.min(restante, maxPorCircuito);
                porciones.push({ zona: amb.ambiente, bocas: cant });
                restante -= cant;
            }
        });
        let actual = { tipo, bocas: 0, dpms: 0, zonas: [] };
        porciones.forEach(p => {
            if (actual.bocas + p.bocas > maxPorCircuito) {
                circuitos.push(actual);
                actual = { tipo, bocas: 0, dpms: 0, zonas: [] };
            }
            actual.bocas += p.bocas;
            actual.dpms = vaPorCircuito;
            if (!actual.zonas.includes(p.zona)) actual.zonas.push(p.zona);
        });
        if (actual.bocas > 0) circuitos.push(actual);
    }
    agruparPorTipo('IUG', MAX.iug, VA.iug);
    agruparPorTipo('TUG', MAX.tug, VA.tug);
    agruparPorTipo('TUE', MAX.tue, VA.tue);
    return circuitos;
}

function renderResumenGlobal(tableros) {
    let totalIUG = 0, totalTUG = 0, totalTUE = 0;
    let totalCircIUG = 0, totalCircTUG = 0, totalCircTUE = 0;
    let dpmsTotal = 0;
    Object.keys(tableros).forEach(t => {
        const b = tableros[t];
        const cIUG = b.iug > 0 ? Math.ceil(b.iug / MAX.iug) : 0;
        const cTUG = b.tug > 0 ? Math.ceil(b.tug / MAX.tug) : 0;
        const cTUE = b.tue > 0 ? Math.ceil(b.tue / MAX.tue) : 0;
        totalIUG += b.iug; totalTUG += b.tug; totalTUE += b.tue;
        totalCircIUG += cIUG; totalCircTUG += cTUG; totalCircTUE += cTUE;
        dpmsTotal += cIUG * VA.iug + cTUG * VA.tug + cTUE * VA.tue;
    });
    document.getElementById('resumenGlobal').innerHTML = `
        <table>
            <tr><th>Tipo</th><th>Bocas Totales</th><th>Circuitos Totales</th><th>DPMS Total</th></tr>
            <tr><td><span class="badge iug">IUG</span></td><td>${totalIUG}</td><td>${totalCircIUG}</td><td>${totalCircIUG * VA.iug} VA</td></tr>
            <tr><td><span class="badge tug">TUG</span></td><td>${totalTUG}</td><td>${totalCircTUG}</td><td>${totalCircTUG * VA.tug} VA</td></tr>
            <tr><td><span class="badge tue">TUE</span></td><td>${totalTUE}</td><td>${totalCircTUE}</td><td>${totalCircTUE * VA.tue} VA</td></tr>
            <tr class="total"><td>TOTAL</td><td>${totalIUG + totalTUG + totalTUE} bocas</td><td>${totalCircIUG + totalCircTUG + totalCircTUE} circuitos</td><td>${dpmsTotal} VA</td></tr>
        </table>
        <div class="resumen">
            💡 <strong>DPMS Total del inmueble:</strong> ${dpmsTotal} VA<br>
            Con coeficiente de simultaneidad según grado:
            <ul>
                <li>Mínimo: ${dpmsTotal} VA</li>
                <li>Medio (×0.9): ${(dpmsTotal * 0.9).toFixed(0)} VA</li>
                <li>Elevado (×0.8): ${(dpmsTotal * 0.8).toFixed(0)} VA</li>
                <li>Superior (×0.7): ${(dpmsTotal * 0.7).toFixed(0)} VA</li>
            </ul>
        </div>`;
}

// ============================================================
// EXPORTAR EXCEL
// ============================================================
function exportarExcelReparto() {
    if (typeof XLSX === 'undefined') {
        alert('❌ La librería XLSX no está cargada.\n\nVerificá que exista:\nlibs/xlsx.full.min.js');
        return;
    }
    if (filas.length === 0) {
        alert('⚠️ No hay datos para exportar.');
        return;
    }
    try {
        const wb = XLSX.utils.book_new();

        const hoja1 = [['REPARTO DE CIRCUITOS POR TABLERO - AEA 770'],
                       ['Proyecto:', proyectoNombre],
                       ['Fecha:', new Date().toLocaleDateString('es-AR')],
                       []];
        hoja1.push(['TABLERO', 'AMBIENTE', 'TIPO', 'm²', 'IUG', 'TUG', 'TUE']);
        filas.forEach(f => {
            hoja1.push([nombreTablero(f.tablero), f.ambiente, f.tipo, f.area, f.iug, f.tug, f.tue]);
        });
        const ws1 = XLSX.utils.aoa_to_sheet(hoja1);
        ws1['!cols'] = [{wch:25},{wch:25},{wch:16},{wch:8},{wch:6},{wch:6},{wch:6}];
        XLSX.utils.book_append_sheet(wb, ws1, 'Ambientes');

        const hoja2 = [['RESUMEN POR TABLERO'], []];
        hoja2.push(['Tablero', 'Tipo', 'Bocas', 'Máx/Cto', 'Circuitos', 'DPMS (VA)']);
        const tableros = window.__repartoData?.tableros || {};
        Object.keys(tableros).forEach(tId => {
            const b = tableros[tId];
            const cIUG = b.iug > 0 ? Math.ceil(b.iug / MAX.iug) : 0;
            const cTUG = b.tug > 0 ? Math.ceil(b.tug / MAX.tug) : 0;
            const cTUE = b.tue > 0 ? Math.ceil(b.tue / MAX.tue) : 0;
            hoja2.push([nombreTablero(tId), 'IUG', b.iug, MAX.iug, cIUG, cIUG * VA.iug]);
            hoja2.push([nombreTablero(tId), 'TUG', b.tug, MAX.tug, cTUG, cTUG * VA.tug]);
            hoja2.push([nombreTablero(tId), 'TUE', b.tue, MAX.tue, cTUE, cTUE * VA.tue]);
        });
        const ws2 = XLSX.utils.aoa_to_sheet(hoja2);
        ws2['!cols'] = [{wch:25},{wch:8},{wch:8},{wch:10},{wch:10},{wch:12}];
        XLSX.utils.book_append_sheet(wb, ws2, 'Resumen por Tablero');

        const hoja3 = [['LISTA DE CIRCUITOS CON ZONA/ÁREA'], []];
        hoja3.push(['Tablero', 'Cto', 'Tipo', 'Bocas', 'DPMS (VA)', 'Zona / Área']);
        let contadorGlobal = 1;
        Object.keys(tableros).forEach(tId => {
            const b = tableros[tId];
            const circuitos = generarCircuitos(b.ambientes);
            circuitos.forEach(c => {
                hoja3.push([nombreTablero(tId), 'C' + (contadorGlobal++), c.tipo, c.bocas, c.dpms, c.zonas.join(' + ')]);
            });
        });
        const ws3 = XLSX.utils.aoa_to_sheet(hoja3);
        ws3['!cols'] = [{wch:25},{wch:8},{wch:8},{wch:8},{wch:12},{wch:60}];
        XLSX.utils.book_append_sheet(wb, ws3, 'Circuitos');

        let totalIUG = 0, totalTUG = 0, totalTUE = 0;
        let tCircIUG = 0, tCircTUG = 0, tCircTUE = 0, dpmsTotal = 0;
        Object.keys(tableros).forEach(t => {
            const b = tableros[t];
            const cIUG = b.iug > 0 ? Math.ceil(b.iug / MAX.iug) : 0;
            const cTUG = b.tug > 0 ? Math.ceil(b.tug / MAX.tug) : 0;
            const cTUE = b.tue > 0 ? Math.ceil(b.tue / MAX.tue) : 0;
            totalIUG += b.iug; totalTUG += b.tug; totalTUE += b.tue;
            tCircIUG += cIUG; tCircTUG += cTUG; tCircTUE += cTUE;
            dpmsTotal += cIUG * VA.iug + cTUG * VA.tug + cTUE * VA.tue;
        });
        const hoja4 = [
            ['RESUMEN GLOBAL'],
            [],
            ['Tipo', 'Bocas Totales', 'Circuitos Totales', 'DPMS Total (VA)'],
            ['IUG', totalIUG, tCircIUG, tCircIUG * VA.iug],
            ['TUG', totalTUG, tCircTUG, tCircTUG * VA.tug],
            ['TUE', totalTUE, tCircTUE, tCircTUE * VA.tue],
            ['TOTAL', totalIUG + totalTUG + totalTUE, tCircIUG + tCircTUG + tCircTUE, dpmsTotal],
            [],
            ['DPMS con coeficiente de simultaneidad:'],
            ['Mínimo (×1.0)', dpmsTotal],
            ['Medio (×0.9)', (dpmsTotal * 0.9).toFixed(0)],
            ['Elevado (×0.8)', (dpmsTotal * 0.8).toFixed(0)],
            ['Superior (×0.7)', (dpmsTotal * 0.7).toFixed(0)]
        ];
        const ws4 = XLSX.utils.aoa_to_sheet(hoja4);
        ws4['!cols'] = [{wch:25},{wch:18},{wch:18},{wch:18}];
        XLSX.utils.book_append_sheet(wb, ws4, 'Resumen Global');

        XLSX.writeFile(wb, 'Reparto_Tableros_AEA770.xlsx');
        alert('✅ Excel exportado correctamente.');
    } catch(e) {
        console.error('Error al exportar Excel:', e);
        alert('❌ Error al exportar Excel:\n' + e.message);
    }
}

// ============================================================
// EXPORTAR PDF
// ============================================================
function exportarPDFReparto() {
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
        alert('❌ La librería jsPDF no está cargada.\n\nVerificá que exista:\nlibs/jspdf.umd.min.js');
        return;
    }
    if (filas.length === 0) {
        alert('⚠️ No hay datos para exportar.');
        return;
    }
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const fecha = new Date().toLocaleDateString('es-AR');

        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text('REPARTO DE CIRCUITOS POR TABLERO', 105, 12, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(proyectoNombre || 'Proyecto', 105, 19, { align: 'center' });
        doc.text('Fecha: ' + fecha, 105, 25, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        let y = 38;

        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text('1. AMBIENTES POR TABLERO', 15, y); y += 4;
        const ambData = filas.map(f => [
            nombreTablero(f.tablero), f.ambiente, f.tipo, f.area + ' m²', f.iug, f.tug, f.tue
        ]);
        doc.autoTable({
            startY: y,
            head: [['Tablero', 'Ambiente', 'Tipo', 'm²', 'IUG', 'TUG', 'TUE']],
            body: ambData, theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 8 },
            bodyStyles: { fontSize: 8 }
        });
        y = doc.lastAutoTable.finalY + 8;

        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('2. RESUMEN POR TABLERO', 15, y); y += 4;
        const tableros = window.__repartoData?.tableros || {};
        const resData = [];
        Object.keys(tableros).forEach(tId => {
            const b = tableros[tId];
            const cIUG = b.iug > 0 ? Math.ceil(b.iug / MAX.iug) : 0;
            const cTUG = b.tug > 0 ? Math.ceil(b.tug / MAX.tug) : 0;
            const cTUE = b.tue > 0 ? Math.ceil(b.tue / MAX.tue) : 0;
            resData.push([nombreTablero(tId), 'IUG', b.iug, cIUG, cIUG * VA.iug]);
            resData.push([nombreTablero(tId), 'TUG', b.tug, cTUG, cTUG * VA.tug]);
            resData.push([nombreTablero(tId), 'TUE', b.tue, cTUE, cTUE * VA.tue]);
        });
        doc.autoTable({
            startY: y,
            head: [['Tablero', 'Tipo', 'Bocas', 'Circuitos', 'DPMS (VA)']],
            body: resData, theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 8 },
            bodyStyles: { fontSize: 8 }
        });
        y = doc.lastAutoTable.finalY + 8;

        if (y > 200) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('3. LISTA DE CIRCUITOS CON ZONA/ÁREA', 15, y); y += 4;
        const circData = [];
        let contadorGlobal = 1;
        Object.keys(tableros).forEach(tId => {
            const b = tableros[tId];
            const circuitos = generarCircuitos(b.ambientes);
            circuitos.forEach(c => {
                circData.push([nombreTablero(tId), 'C' + (contadorGlobal++), c.tipo, c.bocas, c.dpms, c.zonas.join(' + ')]);
            });
        });
        doc.autoTable({
            startY: y,
            head: [['Tablero', 'Cto', 'Tipo', 'Bocas', 'DPMS', 'Zona / Área']],
            body: circData, theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: { 5: { cellWidth: 70 } }
        });
        y = doc.lastAutoTable.finalY + 8;

        if (y > 200) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('4. RESUMEN GLOBAL', 15, y); y += 4;
        let totalIUG = 0, totalTUG = 0, totalTUE = 0;
        let tCircIUG = 0, tCircTUG = 0, tCircTUE = 0, dpmsTotal = 0;
        Object.keys(tableros).forEach(t => {
            const b = tableros[t];
            const cIUG = b.iug > 0 ? Math.ceil(b.iug / MAX.iug) : 0;
            const cTUG = b.tug > 0 ? Math.ceil(b.tug / MAX.tug) : 0;
            const cTUE = b.tue > 0 ? Math.ceil(b.tue / MAX.tue) : 0;
            totalIUG += b.iug; totalTUG += b.tug; totalTUE += b.tue;
            tCircIUG += cIUG; tCircTUG += cTUG; tCircTUE += cTUE;
            dpmsTotal += cIUG * VA.iug + cTUG * VA.tug + cTUE * VA.tue;
        });
        doc.autoTable({
            startY: y,
            head: [['Tipo', 'Bocas Totales', 'Circuitos Totales', 'DPMS Total (VA)']],
            body: [
                ['IUG', totalIUG, tCircIUG, tCircIUG * VA.iug],
                ['TUG', totalTUG, tCircTUG, tCircTUG * VA.tug],
                ['TUE', totalTUE, tCircTUE, tCircTUE * VA.tue],
                ['TOTAL', totalIUG + totalTUG + totalTUE, tCircIUG + tCircTUG + tCircTUE, dpmsTotal]
            ],
            theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 9 },
            bodyStyles: { fontSize: 9 }
        });
        y = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        doc.text('DPMS con coeficiente de simultaneidad:', 15, y); y += 5;
        doc.text('• Mínimo (×1.0): ' + dpmsTotal + ' VA', 15, y); y += 5;
        doc.text('• Medio (×0.9): ' + (dpmsTotal * 0.9).toFixed(0) + ' VA', 15, y); y += 5;
        doc.text('• Elevado (×0.8): ' + (dpmsTotal * 0.8).toFixed(0) + ' VA', 15, y); y += 5;
        doc.text('• Superior (×0.7): ' + (dpmsTotal * 0.7).toFixed(0) + ' VA', 15, y);

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text('Página ' + i + ' de ' + pageCount, 105, 292, { align: 'center' });
            doc.text('Diseño orientativo según AEA 90364-7-770.', 105, 296, { align: 'center' });
        }

        doc.save('Reparto_Tableros_AEA770.pdf');
        alert('✅ PDF exportado correctamente.');
    } catch(e) {
        console.error('Error al exportar PDF:', e);
        alert('❌ Error al exportar PDF:\n' + e.message);
    }
}

// ============================================================
// UTILIDADES
// ============================================================
function nombreTablero(id) {
    const t = tablerosProyecto.find(x => x.id === id);
    return t ? (t.nombre || t.id) : id;
}

function toggleTema() {
    document.body.classList.toggle('dark', document.getElementById('temaOscuro').checked);
}

// ============================================================
// EXPONER FUNCIONES AL WINDOW (necesario para onclick="...")
// ============================================================
window.cargarJSONSuite = cargarJSONSuite;
window.importarProyecto = importarProyecto;
window.cargarEjemplo = cargarEjemplo;
window.limpiarTodo = limpiarTodo;
window.agregarFila = agregarFila;
window.eliminar = eliminar;
window.actualizar = actualizar;
window.distribuirAuto = distribuirAuto;
window.exportarExcelReparto = exportarExcelReparto;
window.exportarPDFReparto = exportarPDFReparto;
window.toggleTema = toggleTema;

// ============================================================
// INICIO
// ============================================================
render();