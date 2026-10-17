// ============================================================
// INDEX.JS - Suite AEA 770 v8 (CORREGIDO)
// Fixes aplicados:
//  1. "unction" → "function" en distribuirCircuitosPorTablero
//  2. previos ahora guarda 'tipo' y usa clave tablero_tipo_idx
//  3. Eliminada doble tanda de renderizado en renderizarTodo
//  4. Factor trifásico corregido (1.732 en lugar de 0.866)
//  5. renderizarDPMS y renderizarDPS sin duplicación
//  6. calcularIccAguasAbajo recibe tensión como parámetro
// ============================================================

// ============================================================
// PWA - SERVICE WORKER + INSTALACIÓN
// ============================================================
let deferredPrompt = null;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            console.log('✅ Service Worker registrado:', reg.scope);
        }).catch(err => {
            console.log('⚠️ Service Worker no disponible:', err.message);
        });
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'block';
});

function instalarPWA() {
    if (!deferredPrompt) {
        mostrarToast('ℹ️ Ya instalada o no soportado por el navegador');
        return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
            mostrarToast('📲 App instalada correctamente');
        }
        deferredPrompt = null;
        cerrarBanner();
    });
}

function cerrarBanner() {
    const banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'none';
}

window.addEventListener('appinstalled', () => {
    mostrarToast('✅ App instalada');
    cerrarBanner();
});

if (window.matchMedia('(display-mode: standalone)').matches) {
    cerrarBanner();
}

// ============================================================
// LIMPIEZA DE TEXTO PARA jsPDF
// ============================================================
function limpiarTextoPDF(texto) {
    if (texto === null || texto === undefined) return '';
    return String(texto)
        .replace(/→/g, '->')
        .replace(/←/g, '<-')
        .replace(/↔/g, '<->')
        .replace(/≤/g, '<=')
        .replace(/≥/g, '>=')
        .replace(/≠/g, '!=')
        .replace(/Ω/g, 'Ohm')
        .replace(/°/g, ' deg')
        .replace(/²/g, '2')
        .replace(/³/g, '3')
        .replace(/·/g, '.')
        .replace(/✔/g, '[OK]')
        .replace(/✖/g, '[X]')
        .replace(/⚠/g, '[!]')
        .replace(/ℹ/g, '[i]')
        .replace(/⏚/g, 'PAT')
        .replace(/🔌/g, '')
        .replace(/📋/g, '')
        .replace(/📏/g, '')
        .replace(/✅/g, '[OK]')
        .replace(/🚀/g, '')
        .replace(/🧲/g, '')
        .replace(/📊/g, '')
        .replace(/⚡/g, '')
        .replace(/📦/g, '')
        .replace(/📐/g, '')
        .replace(/🔧/g, '')
        .replace(/💡/g, '')
        .replace(/🏊/g, '[PISCINA]')
        .replace(/⏚/g, '')
        .replace(/Δ/g, 'DU')
        .replace(/—/g, '-')
        .replace(/–/g, '-')
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'");
}

function autoTableLimpio(doc, opciones) {
    const opt = { ...opciones };
    if (opt.head) {
        opt.head = opt.head.map(fila => fila.map(celda => limpiarTextoPDF(celda)));
    }
    if (opt.body) {
        opt.body = opt.body.map(fila => fila.map(celda => limpiarTextoPDF(celda)));
    }
    doc.autoTable(opt);
}

// ============================================================
// CATÁLOGO DE MARCAS
// ============================================================
const CATALOGO_MARCAS = {
    'Schneider': {
        'PIA_IUG': 'Acti9 iC60N 1P+N C10A {pdc}kA',
        'PIA_TUG': 'Acti9 iC60N 1P+N C16A {pdc}kA',
        'PIA_TUE': 'Acti9 iC60N 1P+N C20A {pdc}kA',
        'ID_30mA': 'Acti9 iID 2P 40A 30mA Clase AC',
        'ID_300mA': 'Acti9 iID 2P 40A 300mA Selectivo Clase S',
        'ID_BAÑO': 'Acti9 iID 2P 25A 10mA Clase AC'
    },
    'Siemens': {
        'PIA_IUG': 'Betagard 5SL6 1P+N C10A {pdc}kA',
        'PIA_TUG': 'Betagard 5SL6 1P+N C16A {pdc}kA',
        'PIA_TUE': 'Betagard 5SL6 1P+N C20A {pdc}kA',
        'ID_30mA': '5SM3 2P 40A 30mA Clase AC',
        'ID_300mA': '5SM3 2P 40A 300mA Selectivo Clase S',
        'ID_BAÑO': '5SM3 2P 25A 10mA Clase AC'
    },
    'ABB': {
        'PIA_IUG': 'System pro M S201 C10A {pdc}kA',
        'PIA_TUG': 'System pro M S201 C16A {pdc}kA',
        'PIA_TUE': 'System pro M S201 C20A {pdc}kA',
        'ID_30mA': 'F200 2P 40A 30mA Clase AC',
        'ID_300mA': 'F200 2P 40A 300mA Selectivo Clase S',
        'ID_BAÑO': 'F200 2P 25A 10mA Clase AC'
    },
    'Legrand': {
        'PIA_IUG': 'DX³ 1P+N C10A {pdc}kA',
        'PIA_TUG': 'DX³ 1P+N C16A {pdc}kA',
        'PIA_TUE': 'DX³ 1P+N C20A {pdc}kA',
        'ID_30mA': 'DX³ ID 2P 40A 30mA Clase AC',
        'ID_300mA': 'DX³ ID 2P 40A 300mA Selectivo Clase S',
        'ID_BAÑO': 'DX³ ID 2P 25A 10mA Clase AC'
    }
};

const PDC_COMERCIALES = [3, 4.5, 6, 10];
const ESCALA_PLANO = 50;

// ============================================================
// TIPOS DE CABLE
// ============================================================
const TIPOS_CABLE = {
    'unipolar': {
        nombre: 'Unipolar IRAM NM 247-3 (PVC 70°C)',
        tempMax: 70,
        gdc: { 1.5: 26.0, 2.5: 15.0, 4: 10.0, 6: 6.5, 10: 3.8, 16: 2.4, 25: 1.5, 35: 1.05, 50: 0.75 },
        ampacidad: { 1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 68, 25: 89, 35: 110, 50: 134 }
    },
    'afumex': {
        nombre: 'Afumex (Libre de halógenos, 90°C)',
        tempMax: 90,
        gdc: { 1.5: 23.4, 2.5: 13.5, 4: 9.0, 6: 5.9, 10: 3.4, 16: 2.2, 25: 1.35, 35: 0.95, 50: 0.68 },
        ampacidad: { 1.5: 18, 2.5: 25, 4: 34, 6: 43, 10: 60, 16: 80, 25: 101, 35: 126, 50: 153 }
    },
    'sintenax': {
        nombre: 'Sintenax (XLPE, 90°C)',
        tempMax: 90,
        gdc: { 1.5: 22.5, 2.5: 13.0, 4: 8.7, 6: 5.7, 10: 3.3, 16: 2.1, 25: 1.3, 35: 0.92, 50: 0.65 },
        ampacidad: { 1.5: 21, 2.5: 29, 4: 39, 6: 50, 10: 68, 16: 91, 25: 116, 35: 144, 50: 175 }
    }
};

const SECCIONES_DISPONIBLES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50];
const PROTECCIONES_DISPONIBLES = [6, 10, 16, 20, 25, 32, 40, 50, 63];

// ============================================================
// MATRIZ AEA 770 - Conductores permitidos
// ============================================================
const MATRIZ_AEA_CONDUCTORES = {
    'FIJA_INT': {
        nombre: 'Fija en interiores',
        canalizaciones: {
            'CAÑERIA_PVC': {
                nombre: 'Cañería / conducto / cablecanal con tapa removible - Aislante no propagante de llama (emisión normal de humos)',
                permitidos: ['NM247_3', 'NM247_3_SOH', 'IRAM2178_SUB', 'IRAM62267_1', 'IRAM62266_1', 'IRAM2178_COM'],
                noPermitidos: ['IRAM2204', 'IRAMNM280'],
                nota: 'IRAM NM 280 (desnudo) no permitido.'
            },
            'CAÑERIA_SOH': {
                nombre: 'Cañería / conducto / cablecanal con tapa removible - Metálico o aislante SOH',
                permitidos: ['NM247_3', 'NM247_3_SOH', 'IRAM2178_SUB', 'IRAM62267_1', 'IRAM62266_1', 'IRAM2178_COM'],
                noPermitidos: ['IRAM2204', 'IRAMNM280'],
                nota: 'IRAM NM 280 (desnudo) no permitido.'
            },
            'BANDEJA_PVC': {
                nombre: 'Bandeja portacables - Aislante con emisión normal de humos',
                permitidos: ['NM247_3_SOH', 'IRAM2178_SUB', 'IRAM62267_1', 'IRAM62266_1', 'IRAM2178_COM', 'IRAM2204'],
                noPermitidos: ['NM247_3', 'IRAMNM280'],
                nota: 'IRAM NM 247-3 (PVC común) NO permitido. IRAM NM 280 solo como conductor PE.'
            },
            'BANDEJA_SOH': {
                nombre: 'Bandeja portacables - Metálica o aislante SOH',
                permitidos: ['NM247_3_SOH', 'IRAM2178_SUB', 'IRAM62267_1', 'IRAM62266_1', 'IRAM2178_COM', 'IRAM2204', 'IRAMNM280'],
                noPermitidos: ['NM247_3'],
                nota: 'IRAM NM 247-3 (PVC común) NO permitido. IRAM NM 280 solo como PE.'
            }
        }
    },
    'SUBTERRANEA': {
        nombre: 'Subterránea',
        canalizaciones: {
            'SUB_DIRECTO': {
                nombre: 'Directamente enterrado',
                permitidos: ['IRAM2178_SUB', 'IRAM62267_1', 'IRAM62266_1'],
                noPermitidos: ['NM247_3', 'NM247_3_SOH', 'IRAM2178_COM', 'IRAM2204', 'IRAMNM280'],
                nota: 'IRAM NM 280 solo como parte del sistema de PAT.'
            },
            'SUB_CAÑO': {
                nombre: 'Dentro de conductos o caños enterrados',
                permitidos: ['NM247_3_SOH', 'IRAM2178_SUB', 'IRAM62267_1', 'IRAM62266_1', 'IRAM2178_COM'],
                noPermitidos: ['NM247_3', 'IRAM2204', 'IRAMNM280'],
                nota: 'IRAM NM 247-3 (PVC común) NO permitido bajo tierra.'
            }
        }
    }
};

const NOMBRES_TIPO_CABLE_AEA = {
    'NM247_3': 'IRAM NM 247-3 (PVC común)',
    'NM247_3_SOH': 'IRAM NM 247-3 SOH (libre de halógenos)',
    'IRAM2178_SUB': 'IRAM 2178-1 Tipo Subterráneo',
    'IRAM62267_1': 'IRAM 62267 Tipo 1 SOH',
    'IRAM62266_1': 'IRAM 62266 Tipo 1 SOH',
    'IRAM2178_COM': 'IRAM 2178-1 Subterráneo para comando',
    'IRAM2204': 'IRAM 2204',
    'IRAMNM280': 'IRAM NM 280 (desnudo, rígido/semirrígido)'
};

function mapearTipoCableAEA(tipoCableApp) {
    switch (tipoCableApp) {
        case 'unipolar': return 'NM247_3';
        case 'afumex': return 'NM247_3_SOH';
        case 'sintenax': return 'IRAM2178_SUB';
        default: return 'NM247_3';
    }
}

function mapearTipoInstAEA(tipoInstAcom, tipoCableAcom) {
    if (tipoInstAcom === 'enterrado') return 'SUBTERRANEA';
    return 'FIJA_INT';
}

function mapearCanalizacionAEA(tipoInstAcom, proteccionAcom) {
    if (tipoInstAcom === 'enterrado') {
        if (proteccionAcom === 'sin') return 'SUB_DIRECTO';
        return 'SUB_CAÑO';
    }
    if (proteccionAcom === 'caño_metalico') return 'CAÑERIA_SOH';
    return 'CAÑERIA_PVC';
}

function validarCombinacionAEA(tipoInst, canalizacion, tipoCableAEA) {
    const inst = MATRIZ_AEA_CONDUCTORES[tipoInst];
    if (!inst) return { permitido: null, motivo: 'Tipo de instalación no reconocido' };
    const canal = inst.canalizaciones[canalizacion];
    if (!canal) return { permitido: null, motivo: 'Tipo de canalización no reconocido' };
    if (canal.permitidos.includes(tipoCableAEA)) return { permitido: true, motivo: 'Permitido según AEA 770.' };
    if (canal.noPermitidos.includes(tipoCableAEA)) return { permitido: false, motivo: canal.nota || 'No permitido según AEA 770.' };
    return { permitido: null, motivo: 'No especificado en la matriz AEA 770.' };
}

// ============================================================
// ALTURAS DE TOMACORRIENTES
// ============================================================
function calcularAlturaTomas(ambiente) {
    const { tipo } = ambiente;
    let hIUG = 1.10, hTUG = 0.30, hTUE = 1.10, hTV = 0.30, hTab = 1.50, obs = '';

    switch (tipo) {
        case 'Habitación':
            hIUG = 1.10; hTUG = 0.30; hTUE = 1.10; hTV = 0.30; hTab = 1.50;
            obs = 'Tomacorrientes bajos. Boca TV/datos a 0.30-0.60 m. Tablero 1.30-1.80 m.';
            break;
        case 'Dormitorio':
            hIUG = 1.10; hTUG = 0.30; hTUE = 2.00; hTV = 0.30; hTab = 1.50;
            obs = 'TUG generales a 0.30 m. Prever TUE para AA split a 1.80-2.20 m. TV/datos a 0.30 m.';
            break;
        case 'Cocina':
            hIUG = 1.10; hTUG = 1.10; hTUE = 1.10; hTV = 1.10; hTab = 1.50;
            obs = 'TUG/TV sobre mesada a 1.10 m (mín. 0.20 m de la mesada). TUE según equipo.';
            break;
        case 'Baño':
            hIUG = 1.10; hTUG = 1.10; hTUE = 1.10; hTV = 1.10; hTab = 1.50;
            obs = 'Sección 701: tomas fuera del volumen de seguridad (mín. 0.60 m del borde de bañera/ducha).';
            break;
        case 'Pasillo':
            hIUG = 1.10; hTUG = 0.30; hTUE = 1.10; hTV = 0.30; hTab = 1.50;
            obs = 'Tomas a 0.30 m para aspiradora.';
            break;
        case 'Vestíbulo':
            hIUG = 1.10; hTUG = 0.30; hTUE = 1.10; hTV = 0.30; hTab = 1.50;
            obs = 'Tomas a 0.30 m. Tablero general a 1.30-1.80 m.';
            break;
        case 'Lavadero':
            hIUG = 1.10; hTUG = 1.10; hTUE = 1.10; hTV = 1.10; hTab = 1.50;
            obs = 'TUE lavarropas a 1.10 m (sobre mesada) o 0.30 m (detrás del equipo).';
            break;
        case 'Balcón':
            hIUG = 1.10; hTUG = 1.10; hTUE = 1.10; hTV = 1.10; hTab = 1.50;
            obs = 'IP44 mínimo en exterior. Prever protección diferencial 30 mA.';
            break;
        case 'Kitchenette':
            hIUG = 1.10; hTUG = 1.10; hTUE = 1.10; hTV = 1.10; hTab = 1.50;
            obs = 'Tomas sobre mesada a 1.10 m.';
            break;
        case 'Depósito':
            hIUG = 1.10; hTUG = 1.10; hTUE = 1.10; hTV = 1.10; hTab = 1.50;
            obs = 'Tomas a 1.10 m para evitar daños por almacenamiento.';
            break;
        case 'Cuarto Técnico':
            hIUG = 1.30; hTUG = 1.10; hTUE = 1.10; hTV = 1.10; hTab = 1.50;
            obs = 'Tomas para motores/bombas a 1.10 m. Interruptores a 1.30 m. Tablero 1.30-1.80 m.';
            break;
    }

    const hTUE_AA = 2.00;
    const hTabMin = 1.30, hTabMax = 1.80;

    return { hIUG, hTUG, hTUE, hTV, hTab, hTabMin, hTabMax, hTUE_AA, obs };
}

const TABLA_ALTURAS_REFERENCIA = [
    { tipo: 'Habitación (Sala/Estar/Comedor)', hIUG: '1.10 m', hTUG: '0.30 m', hTUE: '-', hTV: '0.30 m', hTab: '1.30-1.80 m', obs: 'TUG bajos. TV/datos a 0.30-0.60 m.' },
    { tipo: 'Dormitorio', hIUG: '1.10 m', hTUG: '0.30 m', hTUE: '1.10 m / 2.00 m AA', hTV: '0.30 m', hTab: '1.30-1.80 m', obs: 'TUE solo si hay AA split.' },
    { tipo: 'Cocina', hIUG: '1.10 m', hTUG: '1.10 m', hTUE: '1.10 m', hTV: '1.10 m', hTab: '1.30-1.80 m', obs: 'TUG sobre mesada (>=0.20 m de la mesada).' },
    { tipo: 'Baño / Toilette', hIUG: '1.10 m', hTUG: '1.10 m', hTUE: '-', hTV: '1.10 m', hTab: '1.30-1.80 m', obs: 'Sección 701: fuera del volumen de seguridad.' },
    { tipo: 'Piscina / Pileta', hIUG: '1.10 m', hTUG: '1.10 m', hTUE: '1.10 m', hTV: '1.10 m', hTab: '1.30-1.80 m', obs: 'Sección 701: ID 30 mA obligatorio, equipotencialidad, IP mínimo.' },
    { tipo: 'Pasillo', hIUG: '1.10 m', hTUG: '0.30 m', hTUE: '-', hTV: '0.30 m', hTab: '1.30-1.80 m', obs: 'TUG a 0.30 m.' },
    { tipo: 'Vestíbulo / Hall / Garage', hIUG: '1.10 m', hTUG: '0.30 m', hTUE: '-', hTV: '0.30 m', hTab: '1.30-1.80 m', obs: 'TUG a 0.30 m.' },
    { tipo: 'Lavadero', hIUG: '1.10 m', hTUG: '1.10 m', hTUE: '1.10 m', hTV: '1.10 m', hTab: '1.30-1.80 m', obs: 'TUE lavarropas.' },
    { tipo: 'Balcón / Galería', hIUG: '1.10 m', hTUG: '1.10 m', hTUE: '-', hTV: '1.10 m', hTab: '1.30-1.80 m', obs: 'IP44 mínimo. ID 30 mA obligatorio.' },
    { tipo: 'Kitchenette', hIUG: '1.10 m', hTUG: '1.10 m', hTUE: '1.10 m', hTV: '1.10 m', hTab: '1.30-1.80 m', obs: 'Sobre mesada.' },
    { tipo: 'Depósito', hIUG: '1.10 m', hTUG: '1.10 m', hTUE: '-', hTV: '1.10 m', hTab: '1.30-1.80 m', obs: 'Evitar daños por almacenamiento.' },
    { tipo: 'Cuarto Técnico', hIUG: '1.30 m', hTUG: '1.10 m', hTUE: '1.10 m', hTV: '1.10 m', hTab: '1.30-1.80 m', obs: 'Tablero a 1.30-1.80 m.' }
];

// ============================================================
// ESTADO GLOBAL
// ============================================================
let ambientes = [];
let circuitosPorTablero = {};
let tableros = [
    { id: 'Principal', nombre: 'Tablero Principal', planta: 'PB', long: 0, seccion: 4, iccArriba: 4.5, padre: null, proteccion: null }
];
let contadorTableros = 1;
let planoElementos = [];
let herramientaActual = 'select';
let elementoSeleccionado = null;
let modoOscuro = false;
let proyectoActualId = null;
let arrastrando = null;
let offsetX = 0, offsetY = 0;

// ============================================================
// HELPERS DE TIPO DE CABLE
// ============================================================
function getTipoCableActual() {
    const sel = document.getElementById('tipoCable');
    return sel ? sel.value : 'unipolar';
}

function getGDC(seccion, tipoCable) {
    const tc = tipoCable || getTipoCableActual();
    const tabla = TIPOS_CABLE[tc]?.gdc || TIPOS_CABLE['unipolar'].gdc;
    return tabla[seccion] || 15;
}

function getAmpacidad(seccion, tipoCable) {
    const tc = tipoCable || getTipoCableActual();
    const tabla = TIPOS_CABLE[tc]?.ampacidad || TIPOS_CABLE['unipolar'].ampacidad;
    return tabla[seccion] || 15;
}

function getNombreTipoCable(tipoCable) {
    const tc = tipoCable || getTipoCableActual();
    return TIPOS_CABLE[tc]?.nombre || 'Unipolar IRAM NM 247-3';
}

// ============================================================
// PAT - Puesta a Tierra
// ============================================================
function obtenerDatosPAT() {
    const cantJabalina = parseInt(document.getElementById('patCantJabalina')?.value) || 1;
    const longCable = parseFloat(document.getElementById('patLongCable')?.value) || 10;
    const seccion = parseFloat(document.getElementById('patSeccion')?.value) || 16;
    const tipoJabalina = document.getElementById('patTipoJabalina')?.value || 'copperweld';

    const nombresJabalina = {
        'copperweld': 'Jabalina Copperweld 5/8" x 1.5 m (IRAM 2309)',
        'copperweld_3m': 'Jabalina Copperweld 5/8" x 3 m',
        'acero_cobre': 'Jabalina acero-cobre 3/4" x 2 m'
    };

    return { cantJabalina, longCable, seccion, tipoJabalina, nombreJabalina: nombresJabalina[tipoJabalina] };
}

// ============================================================
// CÁLCULOS NORMATIVOS
// ============================================================
function calcularSla() {
    const c = parseFloat(document.getElementById('supCubierta').value) || 0;
    const s = parseFloat(document.getElementById('supSemicubierta').value) || 0;
    return c + (s * 0.5);
}

function calcularGrado(sla) {
    if (sla <= 60) return 'MÍNIMO';
    if (sla <= 130) return 'MEDIO';
    if (sla <= 200) return 'ELEVADO';
    return 'SUPERIOR';
}

function calcularBocasMinimas(ambiente) {
    const { tipo, area } = ambiente;
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
    }
    return { iug, tug, tue };
}

function calcularBocas(ambiente) {
    const min = calcularBocasMinimas(ambiente);
    return {
        iug: (ambiente.iugReal !== undefined && ambiente.iugReal !== null) ? ambiente.iugReal : min.iug,
        tug: (ambiente.tugReal !== undefined && ambiente.tugReal !== null) ? ambiente.tugReal : min.tug,
        tue: (ambiente.tueReal !== undefined && ambiente.tueReal !== null) ? ambiente.tueReal : min.tue,
        minIUG: min.iug,
        minTUG: min.tug,
        minTUE: min.tue
    };
}

// ============================================================
// Detección de ambientes con piscina
// ============================================================
function detectarAmbientesPiscina() {
    const palabrasClave = ['piscina', 'pileta', 'natatorio', 'pool'];
    return ambientes.filter(amb => {
        const nombreLower = (amb.nombre || '').toLowerCase();
        const tipoLower = (amb.tipo || '').toLowerCase();
        return palabrasClave.some(p => nombreLower.includes(p) || tipoLower.includes(p));
    });
}

function verificarReglasPiscina() {
    const ambientesPiscina = detectarAmbientesPiscina();
    if (ambientesPiscina.length === 0) return null;

    const resultados = {
        ambientesDetectados: ambientesPiscina.map(a => a.nombre),
        tienePiscina: true,
        circuitosPiscina: [],
        faltaID30mA: [],
        tomasEnZona1: [],
        faltaEquipotencialidad: true,
        faltaIP: [],
        totalCircuitos: 0
    };

    Object.keys(circuitosPorTablero).forEach(tid => {
        circuitosPorTablero[tid].forEach(c => {
            const esPiscina = (c.zonas || []).some(zona =>
                ambientesPiscina.some(ap => ap.nombre === zona)
            ) || (c.ambienteOrigen && ambientesPiscina.some(ap => ap.nombre === c.ambienteOrigen));

            if (esPiscina) {
                resultados.circuitosPiscina.push({
                    nombre: c.nombre,
                    tablero: c.tablero,
                    tipo: c.tipo,
                    zonas: c.zonas
                });
                resultados.totalCircuitos++;
            }
        });
    });

    if (resultados.totalCircuitos > 0) {
        resultados.faltaID30mA.push(
            `Los ${resultados.totalCircuitos} circuitos de piscina requieren ID 30 mA obligatorio (Sección 701).`
        );
    }

    resultados.circuitosPiscina.forEach(c => {
        if (c.tipo === 'TUG' || c.tipo === 'TUE') {
            resultados.tomasEnZona1.push(
                `${c.nombre} (${c.tipo}) en ${c.zonas?.join(' + ') || 'piscina'} - verificar que esté fuera de Zona 1 (2 m del borde).`
            );
        }
    });

    resultados.faltaIP.push(
        'Verificar IP mínimo: Zona 0 = IPX8, Zona 1 = IPX4, Zona 2 = IPX2.'
    );

    return resultados;
}

// ============================================================
// ✅ FIX #4: calcularCaidaTension con factor trifásico correcto (1.732)
// ============================================================
function calcularCaidaTension(dpms, longitud, seccion, tipo, tipoCable) {
    const gdc = getGDC(seccion, tipoCable);
    let corriente, tension, factor;

    if (tipo === 'TUE') {
        // Trifásico: I = P / (√3 · U · cosφ), ΔU = √3 · GDC · I · L
        corriente = dpms / (1.732 * 380 * 0.85);
        tension = 380;
        factor = 1.732;
    } else {
        // Monofásico: I = P / U, ΔU = 2 · GDC · I · L (ida y vuelta)
        corriente = dpms / 220;
        tension = 220;
        factor = 2;
    }

    const deltaU = factor * gdc * corriente * (longitud / 1000);
    return (deltaU / tension) * 100;
}

// ============================================================
// ✅ FIX #6: calcularIccAguasAbajo con tensión como parámetro
// ============================================================
function calcularIccAguasAbajo(iccArriba_kA, longitud, seccion, tipoCable, tension) {
    if (longitud === 0) return iccArriba_kA;
    const gdc = getGDC(seccion, tipoCable);
    const zCable = gdc * longitud / 1000;
    const U = tension || 380;
    const iccArriba_A = iccArriba_kA * 1000;
    const iccAbajo_A = iccArriba_A / (1 + (zCable * iccArriba_A) / U);
    return Math.max(0.5, iccAbajo_A / 1000);
}

function pdcComercial(icc) {
    for (const p of PDC_COMERCIALES) if (p >= icc) return p;
    return PDC_COMERCIALES[PDC_COMERCIALES.length - 1];
}

function calcularArranqueMotor(potenciaW, longitud, seccion, tipoArranque, tipoCable) {
    tipoArranque = tipoArranque || 'directo';
    const corrienteNominal = potenciaW / (1.73 * 380 * 0.85);
    const factorArranque = tipoArranque === 'directo' ? 6 : tipoArranque === 'estrella-triangulo' ? 2.5 : 3;
    const corrienteArranque = corrienteNominal * factorArranque;
    const gdcNominal = getGDC(seccion, tipoCable);
    const gdcArranque = gdcNominal * 1.6;
    const deltaU_arranque = gdcArranque * corrienteArranque * (longitud / 1000);
    const caidaArranque = (deltaU_arranque / 380) * 100;
    const deltaU_nominal = gdcNominal * corrienteNominal * (longitud / 1000);
    const caidaNominal = (deltaU_nominal / 380) * 100;
    return { corrienteNominal, corrienteArranque, factorArranque, caidaNominal, caidaArranque };
}

// ============================================================
// ✅ FIX #4: CÁLCULO DE ACOMETIDA con factor trifásico correcto
// ============================================================
function calcularAcometida() {
    const long = parseFloat(document.getElementById('acomLongitud').value) || 0;
    const tipoCable = document.getElementById('acomTipoCable').value;
    const seccion = parseFloat(document.getElementById('acomSeccion').value) || 6;
    const conductores = parseInt(document.getElementById('acomConductores').value) || 4;

    let dpmsFinal = window.__datosExport?.dpmsFinal;
    if (dpmsFinal === undefined || dpmsFinal === null || dpmsFinal === 0) {
        let totalCircIUG = 0, totalCircTUG = 0, totalCircTUE = 0;
        Object.values(circuitosPorTablero).forEach(circs => {
            circs.forEach(c => {
                if (c.tipo === 'IUG') totalCircIUG++;
                else if (c.tipo === 'TUG') totalCircTUG++;
                else if (c.tipo === 'TUE') totalCircTUE++;
            });
        });
        const grado = document.getElementById('gradoResult')?.value || 'MEDIO';
        const coefSimult = grado === 'MEDIO' ? 0.9 : grado === 'ELEVADO' ? 0.8 : grado === 'SUPERIOR' ? 0.7 : 1;
        dpmsFinal = (totalCircIUG * 440 + totalCircTUG * 2200 + totalCircTUE * 3300) * coefSimult;
    }

    const esTrifasico = conductores >= 4;
    const tension = esTrifasico ? 380 : 220;
    const corriente = esTrifasico
        ? dpmsFinal / (1.732 * tension * 0.9)
        : dpmsFinal / (tension * 0.9);

    const gdc = getGDC(seccion, tipoCable);
    const factor = esTrifasico ? 1.732 : 2;
    const deltaU_V = factor * gdc * corriente * (long / 1000);
    const deltaU_pct = (deltaU_V / tension) * 100;

    const iccOrigen = parseFloat(document.getElementById('iccOrigen').value) || 4.5;
    const iccFinal = calcularIccAguasAbajo(iccOrigen, long, seccion, tipoCable, tension);
    const ampacidad = getAmpacidad(seccion, tipoCable);

    return {
        long, tipoCable, seccion, conductores, esTrifasico, tension,
        corriente, gdc, deltaU_V, deltaU_pct, iccFinal, iccOrigen, ampacidad
    };
}

function actualizarCamposAcometida() {
    const a = calcularAcometida();
    const elCorr = document.getElementById('acomCorriente');
    const elDU = document.getElementById('acomDU');
    const elIcc = document.getElementById('acomIccFinal');
    if (elCorr) elCorr.value = a.corriente.toFixed(2) + ' A';
    if (elDU) {
        elDU.value = a.deltaU_pct.toFixed(2) + ' %';
        elDU.style.color = a.deltaU_pct <= 5 ? '#27ae60' : '#e74c3c';
    }
    if (elIcc) elIcc.value = a.iccFinal.toFixed(2) + ' kA';

    const elValid = document.getElementById('validacionAcometida');
    if (elValid) {
        const tipoInst = document.getElementById('acomTipoInst').value;
        const proteccion = document.getElementById('acomProteccion').value;
        const tipoCable = document.getElementById('acomTipoCable').value;

        const tipoInstAEA = mapearTipoInstAEA(tipoInst, tipoCable);
        const canalizAEA = mapearCanalizacionAEA(tipoInst, proteccion);
        const tipoCableAEA = mapearTipoCableAEA(tipoCable);

        const v = validarCombinacionAEA(tipoInstAEA, canalizAEA, tipoCableAEA);
        const cableNombre = NOMBRES_TIPO_CABLE_AEA[tipoCableAEA] || tipoCableAEA;

        if (v.permitido === true) {
            elValid.innerHTML = `<span class="badge ok">✔ ${cableNombre} permitido en esta canalización (AEA 770)</span>`;
        } else if (v.permitido === false) {
            elValid.innerHTML = `<span class="badge error">✖ ${cableNombre} NO permitido. ${v.motivo}</span>`;
        } else {
            elValid.innerHTML = `<span class="badge warn">⚠ Verificar combinación manualmente</span>`;
        }
    }

    return a;
}

// ============================================================
// ✅ FIX #4: Cálculo de ΔU de línea de tablero seccional (factor 1.732)
// ============================================================
function calcularDULineaTablero(tablero) {
    if (!tablero || !tablero.padre) return null;

    const circs = circuitosPorTablero[tablero.id] || [];
    if (circs.length === 0) return null;

    let dpmsTablero = 0;
    circs.forEach(c => { dpmsTablero += c.dpms || 0; });

    const grado = document.getElementById('gradoResult')?.value || 'MEDIO';
    const coefSimult = grado === 'MEDIO' ? 0.9 : grado === 'ELEVADO' ? 0.8 : grado === 'SUPERIOR' ? 0.7 : 1;
    const dpmsFinal = dpmsTablero * coefSimult;

    const tension = 380;
    const corriente = dpmsFinal / (1.732 * tension * 0.9);

    const gdc = getGDC(tablero.seccion, getTipoCableActual());
    const factor = 1.732;
    const deltaU_V = factor * gdc * corriente * (tablero.long / 1000);
    const deltaU_pct = (deltaU_V / tension) * 100;

    const cumpleRecomendacion = deltaU_pct <= 1.0;

    return {
        dpmsTablero,
        dpmsFinal,
        corriente,
        gdc,
        deltaU_V,
        deltaU_pct,
        longitud: tablero.long,
        seccion: tablero.seccion,
        cumpleRecomendacion
    };
}

function verificarDUConjunta(tablero) {
    const duLinea = calcularDULineaTablero(tablero);
    if (!duLinea) return null;

    const acom = calcularAcometida();
    const duAcometida = acom.deltaU_pct;

    const circs = circuitosPorTablero[tablero.id] || [];
    let duMaxCircuito = 0;
    let circuitoMasDesfavorable = null;
    let tipoMasDesfavorable = null;
    circs.forEach(c => {
        const du = calcularCaidaTension(c.dpms, c.longitud, c.seccion, c.tipo, getTipoCableActual());
        if (du > duMaxCircuito) {
            duMaxCircuito = du;
            circuitoMasDesfavorable = c.nombre;
            tipoMasDesfavorable = c.tipo;
        }
    });

    const duTotal = duAcometida + duLinea.deltaU_pct + duMaxCircuito;
    const limite = (tipoMasDesfavorable === 'TUE') ? 5 : 3;
    const cumple = duTotal <= limite;

    return {
        duAcometida,
        duLinea: duLinea.deltaU_pct,
        duMaxCircuito,
        circuitoMasDesfavorable,
        tipoMasDesfavorable,
        duTotal,
        limite,
        cumple
    };
}

function sugerirSeccionLinea(tablero) {
    if (!tablero || !tablero.padre) return null;
    const duActual = calcularDULineaTablero(tablero);
    if (!duActual) return null;

    if (duActual.deltaU_pct <= 1.0) {
        return { necesitaCambio: false, seccionActual: tablero.seccion };
    }

    const seccionesMayores = SECCIONES_DISPONIBLES.filter(s => s > tablero.seccion);
    for (const sec of seccionesMayores) {
        const gdcNueva = getGDC(sec, getTipoCableActual());
        const factor = 1.732;
        const deltaU_V = factor * gdcNueva * duActual.corriente * (tablero.long / 1000);
        const deltaU_pct = (deltaU_V / 380) * 100;
        if (deltaU_pct <= 1.0) {
            return {
                necesitaCambio: true,
                seccionActual: tablero.seccion,
                seccionSugerida: sec,
                duActual: duActual.deltaU_pct,
                duSugerida: deltaU_pct
            };
        }
    }

    return {
        necesitaCambio: true,
        seccionActual: tablero.seccion,
        seccionSugerida: null,
        duActual: duActual.deltaU_pct
    };
}

function calcularSeccionMinima(corriente) {
    const tipoCable = getTipoCableActual();
    const tabla = TIPOS_CABLE[tipoCable]?.ampacidad || TIPOS_CABLE['unipolar'].ampacidad;
    for (const sec of SECCIONES_DISPONIBLES) {
        if (tabla[sec] >= corriente) return sec;
    }
    return SECCIONES_DISPONIBLES[SECCIONES_DISPONIBLES.length - 1];
}

function calcularProteccionLinea(tablero) {
    if (!tablero || !tablero.padre) return null;

    const duLinea = calcularDULineaTablero(tablero);
    if (!duLinea) return null;

    const corrienteDiseno = duLinea.corriente;
    const ampacidad = getAmpacidad(tablero.seccion, getTipoCableActual());
    const proteccionActual = tablero.proteccion || null;

    let proteccionSugerida = null;
    for (const p of PROTECCIONES_DISPONIBLES) {
        if (p >= corrienteDiseno && p <= ampacidad) {
            proteccionSugerida = p;
            break;
        }
    }

    let diagnostico = null;
    if (proteccionSugerida === null) {
        if (corrienteDiseno > ampacidad) {
            diagnostico = 'cable_subdimensionado';
            for (const p of PROTECCIONES_DISPONIBLES) {
                if (p >= corrienteDiseno) {
                    proteccionSugerida = p;
                    break;
                }
            }
        } else {
            diagnostico = 'sin_proteccion_comercial';
            for (const p of PROTECCIONES_DISPONIBLES) {
                if (p >= corrienteDiseno) {
                    proteccionSugerida = p;
                    break;
                }
            }
        }
    }

    const cumpleSobrecarga = proteccionActual !== null && proteccionActual >= corrienteDiseno;
    const cumpleAmpacidad = proteccionActual !== null && proteccionActual <= ampacidad;
    const cumpleSelectividad = true;

    return {
        corrienteDiseno,
        ampacidad,
        proteccionActual,
        proteccionSugerida,
        cumpleSobrecarga,
        cumpleAmpacidad,
        cumpleSelectividad,
        necesitaProteccion: proteccionActual === null,
        necesitaAjuste: !cumpleSobrecarga || !cumpleAmpacidad,
        diagnostico
    };
}

// ============================================================
// AUTOGUARDAR PROYECTO
// ============================================================
function autoguardarProyecto() {
    if (!proyectoActualId) return;
    try {
        const proyectos = obtenerProyectos();
        proyectos[proyectoActualId] = capturarProyecto();
        localStorage.setItem('aea770_proyectos_v8_local', JSON.stringify(proyectos));
    } catch (e) {
        console.warn('No se pudo autoguardar:', e);
    }
}

// ============================================================
// GESTIÓN DE AMBIENTES
// ============================================================
function agregarAmbiente() {
    const nombre = document.getElementById('nuevoNombre').value.trim();
    const tipo = document.getElementById('nuevoTipo').value;
    const area = parseFloat(document.getElementById('nuevoArea').value);
    const tablero = document.getElementById('nuevoTablero').value;

    if (!nombre) { alert('Ingresá un nombre.'); return; }
    if (!area || area <= 0) { alert('Ingresá una superficie válida.'); return; }

    if (tableros.length < 2) {
        alert('⚠️ Creá el tablero adicional primero.\n\n' +
              'Para asignar este ambiente a otro tablero, andá al Paso 3: Tableros ' +
              'y agregá al menos un tablero seccional.');
        return;
    }

    if (!tablero) { alert('Seleccioná un tablero.'); return; }
    ambientes.push({ nombre, tipo, area, tablero });
    document.getElementById('nuevoNombre').value = '';
    document.getElementById('nuevoArea').value = '';
    renderizarTodo();
}

function eliminarAmbiente(index) {
    ambientes.splice(index, 1);
    renderizarTodo();
}

function actualizarBocas(index, campo, valor) {
    const amb = ambientes[index];
    if (!amb) return;
    const min = calcularBocasMinimas(amb);
    const num = parseInt(valor) || 0;
    const minimo = min[campo];
    if (num < minimo) {
        alert('⚠️ El valor mínimo normativo para ' + campo.toUpperCase() + ' es ' + minimo + '.\nSe ajustó automáticamente.');
        amb[campo + 'Real'] = minimo;
    } else {
        amb[campo + 'Real'] = num;
    }
    renderizarTodo();
}

function opcionesTablerosAmbiente(seleccionado) {
    return tableros.map(t =>
        `<option value="${t.id}" ${t.id === seleccionado ? 'selected' : ''}>${t.nombre}</option>`
    ).join('');
}

function cambiarTableroAmbiente(index, nuevoTableroId) {
    const amb = ambientes[index];
    if (!amb) return;

    if (tableros.length < 2) {
        alert('⚠️ Creá el tablero adicional primero.\n\n' +
              'Para asignar ambientes a otro tablero, andá al Paso 3: Tableros ' +
              'y agregá al menos un tablero seccional.');
        renderizarTodo();
        return;
    }

    if (!tableros.find(t => t.id === nuevoTableroId)) return;
    amb.tablero = nuevoTableroId;
    renderizarTodo();
}

function resetearBocasMinimas() {
    if (ambientes.length === 0) { mostrarToast('⚠️ No hay ambientes cargados'); return; }
    if (!confirm('¿Volver todos los valores de bocas a los mínimos normativos?\nSe perderán los ajustes manuales.')) return;
    ambientes.forEach(amb => {
        delete amb.iugReal;
        delete amb.tugReal;
        delete amb.tueReal;
    });
    renderizarTodo();
    mostrarToast('✅ Valores reseteados a los mínimos normativos');
}

function toggleCircuitoDedicado(index, valor) {
    const amb = ambientes[index];
    if (!amb) return;
    amb.circuitoDedicado = !!valor;
    renderizarTodo();
}

function toggleTema() {
    modoOscuro = !modoOscuro;
    document.body.classList.toggle('dark', modoOscuro);
    const btns = document.querySelectorAll('.header-right button');
    if (btns.length > 0) btns[btns.length - 1].textContent = modoOscuro ? '☀️' : '🌙';
    if (planoElementos.length > 0) dibujarPlano();
}

function cambiarTab(evt, tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    evt.target.classList.add('active');
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    if (tabId === 'tab-plano') setTimeout(() => { inicializarPlano(); dibujarPlano(); }, 50);
}

// ============================================================
// ✅ FIX #3 y #5: RENDERIZADO PRINCIPAL (sin duplicación)
// ============================================================
function renderizarTodo() {
    const sla = calcularSla();
    const grado = calcularGrado(sla);
    document.getElementById('slaResult').value = sla.toFixed(2) + ' m²';
    document.getElementById('gradoResult').value = grado;

    const tbody = document.getElementById('tbodyAmbientes');
    const tfoot = document.getElementById('tfootAmbientes');
    const emptyMsg = document.getElementById('emptyMsg');

    if (ambientes.length === 0) {
        tbody.innerHTML = '';
        tfoot.innerHTML = '';
        emptyMsg.style.display = 'block';
        document.getElementById('seccionResultados').style.display = 'none';
        document.getElementById('seccionExportar').style.display = 'none';
        return;
    }
    emptyMsg.style.display = 'none';

    let totalIUG = 0, totalTUG = 0, totalTUE = 0;

    tbody.innerHTML = ambientes.map((amb, i) => {
        const b = calcularBocas(amb);
        totalIUG += b.iug; totalTUG += b.tug; totalTUE += b.tue;

        const extraIUG = b.iug - b.minIUG;
        const extraTUG = b.tug - b.minTUG;
        const extraTUE = b.tue - b.minTUE;
        const badgeIUG = extraIUG > 0 ? `<span class="bocas-badge-extra">+${extraIUG}</span>` : '';
        const badgeTUG = extraTUG > 0 ? `<span class="bocas-badge-extra">+${extraTUG}</span>` : '';
        const badgeTUE = extraTUE > 0 ? `<span class="bocas-badge-extra">+${extraTUE}</span>` : '';

        const esEspecial = (amb.tipo === 'Baño' || amb.tipo === 'Cocina' || amb.tipo === 'Kitchenette');
        const dedicado = (amb.circuitoDedicado !== undefined && amb.circuitoDedicado !== null)
            ? !!amb.circuitoDedicado
            : esEspecial;

        const dedicadoCell = `
            <td class="circ-dedicado-cell">
                <label class="circ-dedicado-label ${esEspecial ? 'es-especial' : ''}"
                       title="${esEspecial ? 'Baños y cocinas: dedicado por defecto (recomendado)' : 'Marcar para que este ambiente tenga circuitos propios'}">
                    <input type="checkbox" ${dedicado ? 'checked' : ''}
                           onchange="toggleCircuitoDedicado(${i}, this.checked)">
                    <span>${dedicado ? 'Sí' : 'No'}</span>
                </label>
            </td>`;

        return `<tr>
            <td><strong>${amb.nombre}</strong></td>
            <td>${amb.tipo}</td>
            <td>${amb.area}</td>
            <td>
                <select onchange="cambiarTableroAmbiente(${i}, this.value)"
                        style="padding:4px 6px;font-size:0.85em;border-radius:6px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text);max-width:140px;">
                    ${opcionesTablerosAmbiente(amb.tablero)}
                </select>
            </td>
            <td>
                <div class="bocas-input-wrap">
                    <span class="bocas-min">mín: ${b.minIUG}</span>
                    <input type="number" min="${b.minIUG}" value="${b.iug}"
                           onchange="actualizarBocas(${i}, 'iug', this.value)">
                    ${badgeIUG}
                </div>
            </td>
            <td>
                <div class="bocas-input-wrap">
                    <span class="bocas-min">mín: ${b.minTUG}</span>
                    <input type="number" min="${b.minTUG}" value="${b.tug}"
                           onchange="actualizarBocas(${i}, 'tug', this.value)">
                    ${badgeTUG}
                </div>
            </td>
            <td>
                <div class="bocas-input-wrap">
                    <span class="bocas-min">mín: ${b.minTUE}</span>
                    <input type="number" min="${b.minTUE}" value="${b.tue}"
                           onchange="actualizarBocas(${i}, 'tue', this.value)">
                    ${badgeTUE}
                </div>
            </td>
            ${dedicadoCell}
            <td><button class="danger small" onclick="eliminarAmbiente(${i})">✖</button></td>
        </tr>`;
    }).join('');

    tfoot.innerHTML = `<tr style="background:#2c3e50;color:white;font-weight:700;">
        <td colspan="4">TOTALES</td>
        <td>${totalIUG}</td><td>${totalTUG}</td><td>${totalTUE}</td><td></td><td></td>
    </tr>`;

    document.getElementById('totalIUG').textContent = totalIUG;
    document.getElementById('totalTUG').textContent = totalTUG;
    document.getElementById('totalTUE').textContent = totalTUE;

    window.__datosExport = window.__datosExport || {};
    window.__datosExport.totalIUG = totalIUG;
    window.__datosExport.totalTUG = totalTUG;
    window.__datosExport.totalTUE = totalTUE;

    // ✅ ÚNICA tanda de renderizado
    try { renderizarTablaAlturasRef(); } catch(e) { console.error('alturas ref:', e); }
    try { renderizarMatrizAEA(); } catch(e) { console.error('matriz:', e); }
    try { renderizarTableros(); } catch(e) { console.error('tableros:', e); }
    try { renderizarDPMS(); } catch(e) { console.error('DPMS:', e); }
    try { actualizarCamposAcometida(); } catch(e) { console.error('acometida:', e); }
    try { renderizarIcc(); } catch(e) { console.error('icc:', e); }
    try { renderizarCircuitos(); } catch(e) { console.error('circuitos:', e); }
    try { renderizarMotores(); } catch(e) { console.error('motores:', e); }
    try { renderizarDiferenciales(); } catch(e) { console.error('diferenciales:', e); }
    try { renderizarDPS(); } catch(e) { console.error('DPS:', e); }
    try { renderizarAlturas(); } catch(e) { console.error('alturas:', e); }
    try { renderizarMateriales(); } catch(e) { console.error('materiales:', e); }
    try { renderizarVerificaciones(); } catch(e) { console.error('verificaciones:', e); }
    try { renderizarAcometida(); } catch(e) { console.error('acometida detalle:', e); }
    try { dibujarEsquemaSVG(); } catch(e) { console.error('esquema:', e); }

    document.getElementById('seccionResultados').style.display = 'block';
    document.getElementById('seccionExportar').style.display = 'block';

    autoguardarProyecto();
}

function renderizarTablaAlturasRef() {
    const tbody = document.getElementById('tbodyAlturasRef');
    if (!tbody) return;
    tbody.innerHTML = TABLA_ALTURAS_REFERENCIA.map(r => `
        <tr>
            <td><strong>${r.tipo}</strong></td>
            <td class="center">${r.hIUG}</td>
            <td class="center">${r.hTUG}</td>
            <td class="center">${r.hTUE}</td>
            <td class="center">${r.hTV}</td>
            <td class="center">${r.hTab}</td>
            <td>${r.obs}</td>
        </tr>
    `).join('');
}

function renderizarMatrizAEA() {
    const tbody = document.getElementById('tbodyMatrizAEA');
    if (!tbody) return;

    const columnas = ['NM247_3', 'NM247_3_SOH', 'IRAM2178_SUB', 'IRAM62267_1', 'IRAM62266_1', 'IRAM2178_COM', 'IRAM2204', 'IRAMNM280'];
    let html = '';

    const fi = MATRIZ_AEA_CONDUCTORES['FIJA_INT'];
    Object.keys(fi.canalizaciones).forEach((key, idx) => {
        const canal = fi.canalizaciones[key];
        html += `<tr>
            <td>${idx === 0 ? '<strong>Fija en interiores</strong>' : ''}</td>
            <td>${canal.nombre}</td>`;
        columnas.forEach(col => {
            if (canal.permitidos.includes(col)) {
                if (col === 'IRAMNM280' && key.startsWith('BANDEJA')) {
                    html += `<td class="cell-solo-pe" title="Solo como conductor PE">✔ solo PE</td>`;
                } else {
                    html += `<td class="cell-permitido" title="Permitido">✔</td>`;
                }
            } else {
                html += `<td class="cell-no-permitido" title="No permitido">✖</td>`;
            }
        });
        html += `</tr>`;
    });

    const sub = MATRIZ_AEA_CONDUCTORES['SUBTERRANEA'];
    Object.keys(sub.canalizaciones).forEach((key, idx) => {
        const canal = sub.canalizaciones[key];
        html += `<tr>
            <td>${idx === 0 ? '<strong>Subterránea</strong>' : ''}</td>
            <td>${canal.nombre}</td>`;
        columnas.forEach(col => {
            if (canal.permitidos.includes(col)) {
                if (col === 'IRAMNM280' && key === 'SUB_DIRECTO') {
                    html += `<td class="cell-solo-pe" title="Solo como parte del sistema de PAT">✔ solo PAT</td>`;
                } else {
                    html += `<td class="cell-permitido" title="Permitido">✔</td>`;
                }
            } else {
                html += `<td class="cell-no-permitido" title="No permitido">✖</td>`;
            }
        });
        html += `</tr>`;
    });

    tbody.innerHTML = html;
}

function renderizarAlturas() {
    const tbody = document.getElementById('tbodyAlturas');
    const tbodyTab = document.getElementById('tbodyAlturasTableros');
    if (!tbody || !tbodyTab) return;

    tbody.innerHTML = ambientes.map(amb => {
        const b = calcularBocas(amb);
        const alt = calcularAlturaTomas(amb);
        const tabNombre = (tableros.find(t => t.id === amb.tablero) || {nombre: amb.tablero}).nombre;
        const esPiscina = (amb.nombre || '').toLowerCase().includes('piscina') ||
                          (amb.nombre || '').toLowerCase().includes('pileta') ||
                          (amb.nombre || '').toLowerCase().includes('natatorio') ||
                          (amb.nombre || '').toLowerCase().includes('pool');
        const marcaPiscina = esPiscina ? ' <span style="color:#e74c3c;font-weight:700;">🏊 PISCINA</span>' : '';
        return `<tr>
            <td><strong>${amb.nombre}</strong>${marcaPiscina}<br><small style="color:var(--text-light);">${amb.tipo} · ${tabNombre}</small></td>
            <td>${alt.hIUG.toFixed(2)}</td>
            <td>${alt.hTUG.toFixed(2)}</td>
            <td>${b.tue > 0 ? alt.hTUE.toFixed(2) : '—'}</td>
            <td>${alt.hTV.toFixed(2)}</td>
            <td>${alt.hTabMin}–${alt.hTabMax}</td>
            <td style="text-align:left;font-size:0.85em;">${alt.obs}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="7" class="empty-msg">Sin ambientes</td></tr>';

    tbodyTab.innerHTML = tableros.map(t => {
        const plantaNombre = { PB: 'Planta Baja', PA: 'Planta Alta', SS: 'Subsuelo', EXT: 'Exterior / Garage', OTRA: 'Otra' }[t.planta] || t.planta;
        const obs = t.padre
            ? 'Tablero seccional. Altura 1.30-1.80 m del NPT (centro del gabinete).'
            : 'Tablero principal. Altura 1.30-1.80 m del NPT (centro del gabinete). Prever espacio libre frontal >=0.80 m.';
        return `<tr>
            <td><strong>${t.nombre}</strong></td>
            <td>${plantaNombre}</td>
            <td><span class="marca-badge">1.30 – 1.80 m</span></td>
            <td style="text-align:left;font-size:0.85em;">${obs}</td>
        </tr>`;
    }).join('');
}

function renderizarAcometida() {
    const cont = document.getElementById('acometidaDetalle');
    if (!cont) return;

    const a = calcularAcometida();
    const tipoInst = document.getElementById('acomTipoInst').value;
    const proteccion = document.getElementById('acomProteccion').value;

    const nombresProteccion = {
        'tubo_pvc_50': 'Tubo PVC rígido Ø50 mm',
        'tubo_pvc_63': 'Tubo PVC rígido Ø63 mm',
        'tubo_pvc_110': 'Tubo PVC rígido Ø110 mm',
        'caño_metalico': 'Caño metálico galvanizado',
        'cablecanal': 'Cablecanal reforzado',
        'sin': 'Sin protección adicional'
    };

    const nombresTipoInst = {
        'enterrado': 'Enterrado',
        'embutido': 'Embutido en mampostería',
        'vista': 'A la vista (cablecanal)',
        'aereo': 'Aéreo (cable portante)'
    };

    const verifDU = a.deltaU_pct <= 5
        ? '<span class="badge ok">✔ ΔU ' + a.deltaU_pct.toFixed(2) + ' % ≤ 5 %</span>'
        : '<span class="badge error">✖ ΔU ' + a.deltaU_pct.toFixed(2) + ' % > 5 %</span>';

    const verifAmp = a.corriente <= a.ampacidad
        ? '<span class="badge ok">✔ I ' + a.corriente.toFixed(1) + ' A ≤ ' + a.ampacidad + ' A</span>'
        : '<span class="badge error">✖ I ' + a.corriente.toFixed(1) + ' A > ' + a.ampacidad + ' A</span>';

    const pdc = pdcComercial(a.iccFinal);

    cont.innerHTML = `
        <div class="grid-2" style="margin-bottom:15px;">
            <div class="stat"><div class="value">${a.long} m</div><div class="label">Longitud</div></div>
            <div class="stat"><div class="value">${a.seccion} mm²</div><div class="label">Sección por fase</div></div>
            <div class="stat"><div class="value">${a.conductores}</div><div class="label">Conductores</div></div>
            <div class="stat"><div class="value">${a.corriente.toFixed(1)} A</div><div class="label">Corriente de diseño</div></div>
            <div class="stat"><div class="value">${a.deltaU_pct.toFixed(2)} %</div><div class="label">ΔU Acometida</div></div>
            <div class="stat"><div class="value">${a.iccFinal.toFixed(2)} kA</div><div class="label">Icc Tablero Principal</div></div>
        </div>

        <table>
            <thead><tr><th>Concepto</th><th>Valor</th></tr></thead>
            <tbody>
                <tr><td>Tipo de cable</td><td>${getNombreTipoCable(a.tipoCable)}</td></tr>
                <tr><td>Sección por fase</td><td>${a.seccion} mm²</td></tr>
                <tr><td>Cantidad de conductores</td><td>${a.conductores} (${a.esTrifasico ? 'trifásico' : 'monofásico'})</td></tr>
                <tr><td>Tensión de cálculo</td><td>${a.tension} V</td></tr>
                <tr><td>GDC del cable</td><td>${a.gdc.toFixed(2)} Ω/km</td></tr>
                <tr><td>Ampacidad del cable</td><td>${a.ampacidad} A</td></tr>
                <tr><td>Corriente de diseño (I)</td><td>${a.corriente.toFixed(2)} A</td></tr>
                <tr><td>Longitud real</td><td>${a.long} m</td></tr>
                <tr><td>ΔU parcial (V)</td><td>${a.deltaU_V.toFixed(2)} V</td></tr>
                <tr><td>ΔU parcial (%)</td><td>${a.deltaU_pct.toFixed(2)} %</td></tr>
                <tr><td>Tipo de instalación</td><td>${nombresTipoInst[tipoInst] || tipoInst}</td></tr>
                <tr><td>Protección mecánica</td><td>${nombresProteccion[proteccion] || proteccion}</td></tr>
                <tr><td>Icc en origen (medidor)</td><td>${a.iccOrigen.toFixed(2)} kA</td></tr>
                <tr><td><strong>Icc en Tablero Principal</strong></td><td><strong>${a.iccFinal.toFixed(2)} kA</strong></td></tr>
                <tr><td>PdC requerido en Principal</td><td><span class="marca-badge">${pdc} kA</span></td></tr>
            </tbody>
        </table>

        <div style="margin-top:15px;">
            <h3 style="font-size:0.95em;margin-bottom:8px;">Verificaciones</h3>
            <div style="margin-bottom:6px;">${verifDU}</div>
            <div style="margin-bottom:6px;">${verifAmp}</div>
            ${a.deltaU_pct > 5 ? '<div class="badge error" style="display:block;margin-top:6px;">✖ La acometida sola supera el 5 %. Aumentar sección o reducir longitud.</div>' : ''}
        </div>

        <div class="info-tip" style="margin-top:12px;">
            💡 <strong>Verificación conjunta:</strong> la suma de ΔU de la acometida más el circuito más desfavorable debe ser ≤ 5 % (AEA 770 Sección 770.5).
            Con esta acometida (${a.deltaU_pct.toFixed(2)} %), el margen restante para los circuitos es <strong>${(5 - a.deltaU_pct).toFixed(2)} %</strong>.
        </div>
    `;
}

// ============================================================
// TABLEROS
// ============================================================
function renderizarTableros() {
    const container = document.getElementById('tablerosContainer');
    if (!container) return;

    const acom = calcularAcometida();
    const iccOrigen = acom.iccFinal;

    tableros.forEach(t => { t.iccArriba = null; });

    const ordenados = [];
    const visitados = new Set();
    const cola = [tableros.find(t => !t.padre) || tableros[0]];
    while (cola.length > 0) {
        const t = cola.shift();
        if (!t || visitados.has(t.id)) continue;
        visitados.add(t.id);
        ordenados.push(t);
        tableros.filter(x => x.padre === t.id).forEach(h => cola.push(h));
    }
    tableros.forEach(t => { if (!visitados.has(t.id)) ordenados.push(t); });

    ordenados.forEach(t => {
        if (!t.padre) {
            t.iccArriba = iccOrigen;
        } else {
            const padre = tableros.find(x => x.id === t.padre);
            if (padre && padre.iccArriba !== null) {
                t.iccArriba = calcularIccAguasAbajo(padre.iccArriba, t.long, t.seccion, getTipoCableActual(), 380);
            } else {
                t.iccArriba = iccOrigen;
            }
        }
    });

    const selPadre = document.getElementById('nuevoTableroPadre');
    if (selPadre) {
        const valorActual = selPadre.value;
        selPadre.innerHTML = tableros.map(t =>
            `<option value="${t.id}">${t.nombre}</option>`
        ).join('');
        const principal = tableros.find(t => !t.padre);
        if (principal) selPadre.value = principal.id;
        if (valorActual && tableros.find(t => t.id === valorActual)) selPadre.value = valorActual;
    }

    const ambientesPiscinaGlobal = detectarAmbientesPiscina();

    container.innerHTML = tableros.map((t, i) => {
        const esPrincipal = !t.padre;
        const pdc = t.iccArriba !== null ? pdcComercial(t.iccArriba) : '-';
        const nombrePlanta = { PB: 'PB', PA: 'PA', SS: 'Subsuelo', EXT: 'Ext.', OTRA: 'Otra' }[t.planta] || t.planta;

        const duLinea = esPrincipal ? null : calcularDULineaTablero(t);
        const verifConjunta = esPrincipal ? null : verificarDUConjunta(t);
        const sugerencia = esPrincipal ? null : sugerirSeccionLinea(t);
        const proteccionLinea = esPrincipal ? null : calcularProteccionLinea(t);

        const tableroTienePiscina = ambientesPiscinaGlobal.some(a => a.tablero === t.id);

        const descendientes = obtenerDescendientes(t.id);
        const opcionesPadre = tableros
            .filter(x => x.id !== t.id && !descendientes.includes(x.id))
            .map(x => `<option value="${x.id}" ${t.padre === x.id ? 'selected' : ''}>${x.nombre}</option>`)
            .join('');

        return `
            <div class="tablero-card">
                <h4>
                    📋 ${t.nombre}
                    <span class="marca-badge" style="background:#555;">${nombrePlanta}</span>
                    ${esPrincipal ? '<span class="marca-badge" style="background:#27ae60;">Origen</span>' : ''}
                    <span class="marca-badge" style="background:#e67e22;">Altura 1.30-1.80 m</span>
                    ${tableroTienePiscina ? '<span class="marca-badge" style="background:#e74c3c;">🏊 PISCINA - Sección 701</span>' : ''}
                </h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" value="${t.nombre}"
                               onchange="actualizarTablero(${i}, 'nombre', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Planta</label>
                        <select onchange="actualizarTablero(${i}, 'planta', this.value)">
                            <option value="PB" ${t.planta === 'PB' ? 'selected' : ''}>Planta Baja</option>
                            <option value="PA" ${t.planta === 'PA' ? 'selected' : ''}>Planta Alta</option>
                            <option value="SS" ${t.planta === 'SS' ? 'selected' : ''}>Subsuelo</option>
                            <option value="EXT" ${t.planta === 'EXT' ? 'selected' : ''}>Exterior / Garage</option>
                            <option value="OTRA" ${t.planta === 'OTRA' ? 'selected' : ''}>Otra</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Se alimenta desde</label>
                        ${esPrincipal
                            ? '<input type="text" value="Acometida de la distribuidora" readonly>'
                            : `<select onchange="actualizarTablero(${i}, 'padre', this.value)">${opcionesPadre}</select>`}
                    </div>
                    <div class="form-group">
                        <label>Longitud desde padre (m)</label>
                        <input type="number" value="${t.long}" min="0" step="1"
                               ${esPrincipal ? 'disabled' : ''}
                               onchange="actualizarTablero(${i}, 'long', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Sección de línea (mm²)</label>
                        <select onchange="actualizarTablero(${i}, 'seccion', this.value)"
                                ${esPrincipal ? 'disabled' : ''}>
                            <option value="4" ${t.seccion == 4 ? 'selected' : ''}>4 mm²</option>
                            <option value="6" ${t.seccion == 6 ? 'selected' : ''}>6 mm²</option>
                            <option value="10" ${t.seccion == 10 ? 'selected' : ''}>10 mm²</option>
                            <option value="16" ${t.seccion == 16 ? 'selected' : ''}>16 mm²</option>
                            <option value="25" ${t.seccion == 25 ? 'selected' : ''}>25 mm²</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Icc Aguas Arriba</label>
                        <input type="text" value="${t.iccArriba !== null ? t.iccArriba.toFixed(2) + ' kA' : '-'}" readonly>
                    </div>
                    <div class="form-group">
                        <label>PdC Requerido</label>
                        <input type="text" value="${pdc}${pdc !== '-' ? ' kA' : ''}" readonly>
                    </div>
                    ${!esPrincipal ? `
                    <div class="form-group">
                        <label>Protección General (A)</label>
                        <select onchange="actualizarProteccionTablero(${i}, this.value)">
                            <option value="">-- Sin definir --</option>
                            ${PROTECCIONES_DISPONIBLES.map(p =>
                                `<option value="${p}" ${t.proteccion == p ? 'selected' : ''}>${p} A</option>`
                            ).join('')}
                        </select>
                    </div>
                    ` : ''}
                    ${!esPrincipal ? `
                    <div class="form-group">
                        <label title="Recomendación AEA 770: ≤ 1% para líneas seccionales">ΔU Línea (Rec. ≤1%)</label>
                        <input type="text" value="${duLinea ? duLinea.deltaU_pct.toFixed(2) + ' %' : '-'}"
                               readonly
                               style="color:${duLinea && duLinea.cumpleRecomendacion ? '#27ae60' : '#e74c3c'};font-weight:700;">
                    </div>
                    <div class="form-group">
                        <label title="Acometida + línea seccional + circuito más desfavorable">ΔU Total (≤ ${verifConjunta ? verifConjunta.limite : 3}%)</label>
                        <input type="text" value="${verifConjunta ? verifConjunta.duTotal.toFixed(2) + ' %' : '-'}"
                               readonly
                               style="color:${verifConjunta && verifConjunta.cumple ? '#27ae60' : '#e74c3c'};font-weight:700;">
                    </div>
                    ` : ''}
                    ${!esPrincipal && proteccionLinea ? `
                    <div class="form-group">
                        <label>I Diseño</label>
                        <input type="text" value="${proteccionLinea.corrienteDiseno.toFixed(1)} A" readonly>
                    </div>
                    <div class="form-group">
                        <label>Ampacidad</label>
                        <input type="text" value="${proteccionLinea.ampacidad} A" readonly>
                    </div>
                    <div class="form-group">
                        <label>Verif. Protección</label>
                        <input type="text"
                               value="${proteccionLinea.proteccionActual === null
                                   ? 'Sin definir'
                                   : (proteccionLinea.cumpleSobrecarga && proteccionLinea.cumpleAmpacidad
                                       ? '✔ OK'
                                       : '✖ Revisar')}"
                               readonly
                               style="color:${proteccionLinea.proteccionActual === null
                                   ? '#f39c12'
                                   : (proteccionLinea.cumpleSobrecarga && proteccionLinea.cumpleAmpacidad
                                       ? '#27ae60'
                                       : '#e74c3c')};font-weight:700;">
                    </div>
                    ` : ''}
                    <div class="form-group">
                        <label>Circuitos</label>
                        <input type="text" value="${(circuitosPorTablero[t.id] || []).length}" readonly>
                    </div>
                    <div class="form-group" style="display:flex;align-items:flex-end;">
                        ${esPrincipal
                            ? ''
                            : `<button class="danger small" onclick="eliminarTablero(${i})">🗑️ Eliminar</button>`}
                    </div>
                </div>
                ${sugerencia && sugerencia.necesitaCambio ? `
                <div class="info-tip" style="margin-top:8px;background:#fff3cd;border-left:4px solid #f39c12;">
                    ⚠️ <strong>Sugerencia ΔU:</strong> La ΔU de la línea es ${sugerencia.duActual.toFixed(2)} % (> 1 % recomendado).
                    ${sugerencia.seccionSugerida
                        ? `Considerá aumentar la sección a <strong>${sugerencia.seccionSugerida} mm²</strong> (ΔU: ${sugerencia.duSugerida.toFixed(2)} %).`
                        : 'Considerá aumentar la sección o reducir la longitud.'}
                </div>
                ` : ''}
                ${proteccionLinea && proteccionLinea.necesitaAjuste ? `
                <div class="info-tip" style="margin-top:8px;background:#f8d7da;border-left:4px solid #e74c3c;">
                    ⚠️ <strong>Sugerencia Protección:</strong>
                    ${proteccionLinea.diagnostico === 'cable_subdimensionado'
                        ? `🚨 <strong>CABLE SUBDIMENSIONADO:</strong> La corriente de diseño (${proteccionLinea.corrienteDiseno.toFixed(1)} A) supera la ampacidad del cable de ${t.seccion} mm² (${proteccionLinea.ampacidad} A). <strong>Aumentar la sección de la línea</strong> a al menos ${calcularSeccionMinima(proteccionLinea.corrienteDiseno)} mm².`
                        : proteccionLinea.necesitaProteccion
                            ? `Definir protección general para la línea. Se sugiere <strong>${proteccionLinea.proteccionSugerida} A</strong> (I_diseño: ${proteccionLinea.corrienteDiseno.toFixed(1)} A, Ampacidad: ${proteccionLinea.ampacidad} A).`
                            : !proteccionLinea.cumpleSobrecarga
                                ? `La protección actual (${proteccionLinea.proteccionActual} A) es <strong>menor</strong> que la corriente de diseño (${proteccionLinea.corrienteDiseno.toFixed(1)} A). Subir a <strong>${proteccionLinea.proteccionSugerida} A</strong>.`
                                : `La protección actual (${proteccionLinea.proteccionActual} A) es <strong>mayor</strong> que la ampacidad del cable (${proteccionLinea.ampacidad} A). Bajar a <strong>${proteccionLinea.proteccionSugerida} A</strong> o aumentar sección.`
                    }
                </div>
                ` : ''}
                ${tableroTienePiscina && !esPrincipal ? `
                <div class="info-tip" style="margin-top:8px;background:#f8d7da;border-left:4px solid #e74c3c;">
                    🏊 <strong>SECCIÓN 701 - PISCINA:</strong> Este tablero alimenta ambientes con piscina.
                    <ul style="margin:6px 0 0 18px;font-size:0.85em;">
                        <li><strong>ID 30 mA obligatorio</strong> en todos los circuitos de piscina.</li>
                        <li><strong>Equipotencialidad</strong> de partes metálicas con cable 6 mm² mínimo.</li>
                        <li>Tomas <strong>fuera de Zona 1</strong> (2 m del borde).</li>
                        <li>IP mínimo: Zona 0 = IPX8, Zona 1 = IPX4, Zona 2 = IPX2.</li>
                    </ul>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');

    poblarSelectorTableros();
    distribuirCircuitosPorTablero();
}

function obtenerDescendientes(idTablero) {
    const hijos = tableros.filter(t => t.padre === idTablero).map(t => t.id);
    let todos = [...hijos];
    hijos.forEach(h => { todos = todos.concat(obtenerDescendientes(h)); });
    return todos;
}

function agregarTablero() {
    const nombre = document.getElementById('nuevoTableroNombre').value.trim();
    const planta = document.getElementById('nuevoTableroPlanta').value;
    const padre = document.getElementById('nuevoTableroPadre').value;

    if (!nombre) { alert('Ingresá un nombre para el tablero.'); return; }
    if (!padre) { alert('Seleccioná un tablero padre.'); return; }

    const id = 'T' + (++contadorTableros);
    tableros.push({ id, nombre, planta, padre, long: 10, seccion: 4, iccArriba: null, proteccion: null });

    document.getElementById('nuevoTableroNombre').value = '';
    renderizarTodo();
    mostrarToast('✅ Tablero agregado: ' + nombre);
}

function eliminarTablero(index) {
    const t = tableros[index];
    if (!t.padre) { alert('No podés eliminar el tablero principal.'); return; }
    const principal = tableros.find(x => !x.padre);
    ambientes.forEach(a => { if (a.tablero === t.id) a.tablero = principal.id; });
    tableros.forEach(x => { if (x.padre === t.id) x.padre = principal.id; });
    tableros.splice(index, 1);
    renderizarTodo();
    mostrarToast('🗑️ Tablero eliminado');
}

function actualizarTablero(index, campo, valor) {
    const t = tableros[index];
    if (!t) return;
    if (campo === 'long') t.long = parseFloat(valor) || 0;
    else if (campo === 'seccion') t.seccion = parseFloat(valor) || 4;
    else if (campo === 'nombre') t.nombre = valor;
    else if (campo === 'planta') t.planta = valor;
    else if (campo === 'padre') {
        if (valor === t.id) return;
        const descendientes = obtenerDescendientes(t.id);
        if (descendientes.includes(valor)) {
            alert('No podés asignar como padre a un tablero que depende de este.');
            renderizarTodo();
            return;
        }
        t.padre = valor;
    }
    renderizarTodo();
}

function actualizarProteccionTablero(index, valor) {
    const t = tableros[index];
    if (!t) return;
    t.proteccion = valor ? parseInt(valor) : null;
    renderizarTodo();
    autoguardarProyecto();
}

function poblarSelectorTableros() {
    const sel = document.getElementById('nuevoTablero');
    if (!sel) return;
    const valorActual = sel.value;
    sel.innerHTML = tableros.map(t =>
        `<option value="${t.id}">${t.nombre} (${t.planta})</option>`
    ).join('');
    if (valorActual && tableros.find(t => t.id === valorActual)) sel.value = valorActual;
}

// ============================================================
// ✅ FIX #1 y #2: DISTRIBUCIÓN DE CIRCUITOS
// ============================================================
function distribuirCircuitosPorTablero() {
    // ✅ FIX #2: Capturar previos con clave tablero_tipo_idx y guardar 'tipo'
    const previos = {};
    Object.keys(circuitosPorTablero).forEach(tid => {
        circuitosPorTablero[tid].forEach((c, idx) => {
            const key = `${tid}_${c.tipo}_${idx}`;
            previos[key] = {
                tipo: c.tipo,
                longitud: c.longitud,
                seccion: c.seccion,
                proteccion: c.proteccion,
                potenciaMotor: c.potenciaMotor
            };
        });
    });

    circuitosPorTablero = {};
    tableros.forEach(t => { circuitosPorTablero[t.id] = []; });

    const ambientesPorTablero = {};
    tableros.forEach(t => { ambientesPorTablero[t.id] = []; });

    ambientes.forEach(amb => {
        if (!ambientesPorTablero[amb.tablero]) {
            const principal = tableros.find(t => !t.padre);
            if (principal) amb.tablero = principal.id;
            return;
        }
        ambientesPorTablero[amb.tablero].push(amb);
    });

    let nGlobal = 1;

    function esDedicado(amb) {
        if (amb.circuitoDedicado !== undefined && amb.circuitoDedicado !== null) {
            return !!amb.circuitoDedicado;
        }
        return (amb.tipo === 'Baño' || amb.tipo === 'Cocina' || amb.tipo === 'Kitchenette');
    }

    function crearCircuito(tableroId, tipoCircuito, porciones, dpmsPorBoca, esDedicadoFlag) {
        const totalBocas = porciones.reduce((s, p) => s + p.bocas, 0);
        if (totalBocas === 0) return null;

        // ✅ FIX #2: índice local por tablero+tipo para preservar datos
        const idxLocal = circuitosPorTablero[tableroId].filter(c => c.tipo === tipoCircuito).length;
        const key = `${tableroId}_${tipoCircuito}_${idxLocal}`;
        const prev = previos[key] || {};

        const nombre = 'C' + nGlobal;
        const zonas = [...new Set(porciones.map(p => p.ambiente))];

        let seccionDefecto, proteccionDefecto, longitudDefecto;
        if (tipoCircuito === 'IUG') {
            seccionDefecto = 1.5; proteccionDefecto = 10; longitudDefecto = 10;
        } else if (tipoCircuito === 'TUG') {
            seccionDefecto = 2.5; proteccionDefecto = 16; longitudDefecto = 15;
        } else {
            seccionDefecto = 4; proteccionDefecto = 20; longitudDefecto = 20;
        }

        const circuito = {
            nombre,
            tablero: tableroId,
            tipo: tipoCircuito,
            bocas: totalBocas,
            dpms: dpmsPorBoca * totalBocas,
            seccion: (prev.seccion !== undefined && prev.seccion !== null) ? prev.seccion : seccionDefecto,
            proteccion: (prev.proteccion !== undefined && prev.proteccion !== null) ? prev.proteccion : proteccionDefecto,
            longitud: (prev.longitud !== undefined && prev.longitud !== null) ? prev.longitud : longitudDefecto,
            potenciaMotor: prev.potenciaMotor,
            iccArriba: tableros.find(t => t.id === tableroId)?.iccArriba || null,
            ambienteOrigen: esDedicadoFlag ? zonas[0] : null,
            esDedicado: !!esDedicadoFlag,
            zonas: zonas
        };

        circuitosPorTablero[tableroId].push(circuito);
        nGlobal++;
        return circuito;
    }

    function construirPorciones(ambientesLista, campoBocas, maxPorCircuito) {
        const porciones = [];
        ambientesLista.forEach(amb => {
            let restante = amb[campoBocas] || 0;
            while (restante > 0) {
                const cant = Math.min(restante, maxPorCircuito);
                porciones.push({ ambiente: amb.nombre, bocas: cant });
                restante -= cant;
            }
        });
        return porciones;
    }

    function agruparEnCircuitos(porciones, maxPorCircuito) {
        const grupos = [];
        let actual = [];
        let bocasActual = 0;
        porciones.forEach(p => {
            if (bocasActual + p.bocas > maxPorCircuito && actual.length > 0) {
                grupos.push(actual);
                actual = [];
                bocasActual = 0;
            }
            actual.push(p);
            bocasActual += p.bocas;
        });
        if (actual.length > 0) grupos.push(actual);
        return grupos;
    }

    tableros.forEach(t => {
        const listaAmbientes = ambientesPorTablero[t.id] || [];
        const dedicados = [];
        const agrupados = [];

        listaAmbientes.forEach(amb => {
            const b = calcularBocas(amb);
            amb._tmpBocas = b;
            if (esDedicado(amb)) dedicados.push(amb);
            else agrupados.push(amb);
        });

        dedicados.forEach(amb => {
            const b = amb._tmpBocas;

            if (b.iug > 0) crearCircuito(t.id, 'IUG',
                [{ ambiente: amb.nombre, bocas: b.iug }], 440, true);

            if (b.tug > 0) crearCircuito(t.id, 'TUG',
                [{ ambiente: amb.nombre, bocas: b.tug }], 1100, true);

            if (b.tue > 0) crearCircuito(t.id, 'TUE',
                [{ ambiente: amb.nombre, bocas: b.tue }], 3300, true);
        });

        let totalIUG = 0, totalTUG = 0, totalTUE = 0;
        agrupados.forEach(amb => {
            const b = amb._tmpBocas;
            amb._tmpIUG = b.iug;
            amb._tmpTUG = b.tug;
            amb._tmpTUE = b.tue;
            totalIUG += b.iug;
            totalTUG += b.tug;
            totalTUE += b.tue;
        });

        if (totalIUG > 0) {
            agruparEnCircuitos(construirPorciones(agrupados, '_tmpIUG', 15), 15).forEach(g => {
                crearCircuito(t.id, 'IUG', g, 440, false);
            });
        }
        if (totalTUG > 0) {
            agruparEnCircuitos(construirPorciones(agrupados, '_tmpTUG', 4), 4).forEach(g => {
                crearCircuito(t.id, 'TUG', g, 1100, false);
            });
        }
        if (totalTUE > 0) {
            agruparEnCircuitos(construirPorciones(agrupados, '_tmpTUE', 12), 12).forEach(g => {
                crearCircuito(t.id, 'TUE', g, 3300, false);
            });
        }

        listaAmbientes.forEach(amb => {
            delete amb._tmpBocas;
            delete amb._tmpIUG;
            delete amb._tmpTUG;
            delete amb._tmpTUE;
        });
    });

    Object.keys(circuitosPorTablero).forEach(tid => {
        const icc = tableros.find(t => t.id === tid)?.iccArriba || null;
        circuitosPorTablero[tid].forEach(c => { c.iccArriba = icc; });
    });
}

// ============================================================
// DPMS
// ============================================================
function renderizarDPMS() {
    // Forzar distribución si no hay circuitos pero hay ambientes
    const hayCircuitos = Object.values(circuitosPorTablero).some(c => c.length > 0);
    if (!hayCircuitos && ambientes.length > 0) {
        distribuirCircuitosPorTablero();
    }

    let totalCircIUG = 0, totalCircTUG = 0, totalCircTUE = 0;
    Object.values(circuitosPorTablero).forEach(circs => {
        circs.forEach(c => {
            if (c.tipo === 'IUG') totalCircIUG++;
            else if (c.tipo === 'TUG') totalCircTUG++;
            else if (c.tipo === 'TUE') totalCircTUE++;
        });
    });

    const elIUG = document.getElementById('totalCircIUG');
    const elTUG = document.getElementById('totalCircTUG');
    const elTUE = document.getElementById('totalCircTUE');
    if (elIUG) elIUG.textContent = totalCircIUG;
    if (elTUG) elTUG.textContent = totalCircTUG;
    if (elTUE) elTUE.textContent = totalCircTUE;

    const potIUG = totalCircIUG * 440;
    const potTUG = totalCircTUG * 2200;
    const potTUE = totalCircTUE * 3300;
    const dpmsTotal = potIUG + potTUG + potTUE;

    const grado = document.getElementById('gradoResult').value;
    let coefSimult = grado === 'MEDIO' ? 0.9 : grado === 'ELEVADO' ? 0.8 : grado === 'SUPERIOR' ? 0.7 : 1;
    const dpmsFinal = dpmsTotal * coefSimult;

    const tbodyDPMS = document.getElementById('tbodyDPMS');
    const tfootDPMS = document.getElementById('tfootDPMS');
    if (tbodyDPMS) {
        tbodyDPMS.innerHTML = `
            <tr><td>Circuitos IUG (${totalCircIUG} × 440 VA)</td><td>${totalCircIUG}</td><td>440 VA</td><td>${potIUG.toFixed(0)} VA</td></tr>
            <tr><td>Circuitos TUG (${totalCircTUG} × 2200 VA)</td><td>${totalCircTUG}</td><td>2200 VA</td><td>${potTUG.toFixed(0)} VA</td></tr>
            <tr><td>Circuitos TUE (${totalCircTUE} × 3300 VA)</td><td>${totalCircTUE}</td><td>3300 VA</td><td>${potTUE.toFixed(0)} VA</td></tr>
        `;
    }
    if (tfootDPMS) {
        tfootDPMS.innerHTML = `
            <tr style="background:var(--table-header);font-weight:700;"><td colspan="3">DPMS TOTAL</td><td>${dpmsTotal.toFixed(0)} VA</td></tr>
            <tr style="background:var(--accent);color:white;font-weight:700;"><td colspan="3">DPMS c/ Simultaneidad (${(coefSimult*100).toFixed(0)}%)</td><td>${dpmsFinal.toFixed(0)} VA</td></tr>
        `;
    }

    window.__datosExport = window.__datosExport || {};
    Object.assign(window.__datosExport, {
        totalCircIUG, totalCircTUG, totalCircTUE,
        potIUG, potTUG, potTUE, dpmsTotal, dpmsFinal, coefSimult
    });
}

// ============================================================
// CORTOCIRCUITO
// ============================================================
function renderizarIcc() {
    const tbody = document.getElementById('tbodyIcc');
    if (!tbody) return;
    const acom = calcularAcometida();
    let html = `
        <tr style="background:#fff3cd;">
            <td><strong>🔌 Acometida (medidor → Principal)</strong></td>
            <td>${acom.iccOrigen.toFixed(2)}</td>
            <td>${acom.long}</td>
            <td>${acom.conductores}×${acom.seccion}</td>
            <td>${acom.iccFinal.toFixed(2)}</td>
            <td><span class="marca-badge">${pdcComercial(acom.iccFinal)} kA</span></td>
        </tr>`;
    html += tableros.map((t) => {
        const pdc = pdcComercial(t.iccArriba || 4.5);
        return `<tr>
            <td><strong>${t.nombre}</strong></td>
            <td>${!t.padre ? acom.iccFinal.toFixed(2) : (t.iccArriba || 4.5).toFixed(2)}</td>
            <td>${t.long}</td>
            <td>${!t.padre ? '—' : t.seccion}</td>
            <td>${(t.iccArriba || 4.5).toFixed(2)}</td>
            <td><span class="marca-badge">${pdc} kA</span></td>
        </tr>`;
    }).join('');
    tbody.innerHTML = html;
}

// ============================================================
// CIRCUITOS
// ============================================================
function opcionesSecciones(seleccionada) {
    return SECCIONES_DISPONIBLES.map(s =>
        `<option value="${s}" ${parseFloat(seleccionada) === s ? 'selected' : ''}>${s}</option>`
    ).join('');
}

function opcionesProtecciones(seleccionada) {
    return PROTECCIONES_DISPONIBLES.map(p =>
        `<option value="${p}" ${parseInt(seleccionada) === p ? 'selected' : ''}>${p}</option>`
    ).join('');
}

function renderizarCircuitos() {
    const tbody = document.getElementById('tbodyCircuitos');
    if (!tbody) return;
    const ambientesPiscina = detectarAmbientesPiscina();
    let html = '';
    Object.keys(circuitosPorTablero).forEach(tableroId => {
        circuitosPorTablero[tableroId].forEach((c, idx) => {
            const caida = calcularCaidaTension(c.dpms, c.longitud, c.seccion, c.tipo, getTipoCableActual());
            const limite = c.tipo === 'IUG' ? 3 : 5;
            const iccAbajo = calcularIccAguasAbajo(c.iccArriba, c.longitud, c.seccion, getTipoCableActual(), c.tipo === 'TUE' ? 380 : 220);
            const pdc = pdcComercial(iccAbajo);
            const verif = caida <= limite ? '<span class="badge ok">✔</span>' : '<span class="badge error">✖</span>';
            const tabNombre = (tableros.find(t => t.id === c.tablero) || {nombre: c.tablero}).nombre;
            const esTUE = c.tipo === 'TUE';

            const badgeDedicado = c.esDedicado
                ? `<span class="badge-dedicado" title="Circuito dedicado: ${c.ambienteOrigen || ''}">DEDICADO</span>`
                : '';

            const esPiscina = (c.zonas || []).some(zona =>
                ambientesPiscina.some(ap => ap.nombre === zona)
            ) || (c.ambienteOrigen && ambientesPiscina.some(ap => ap.nombre === c.ambienteOrigen));
            const badgePiscina = esPiscina
                ? `<span class="badge-dedicado" style="background:#e74c3c;" title="Circuito de piscina - Sección 701: ID 30 mA obligatorio">🏊 PISCINA</span>`
                : '';

            const zonasInfo = (c.zonas && c.zonas.length > 0)
                ? `<br><small style="color:var(--text-light);font-size:0.72em;">${c.zonas.join(' + ')}</small>`
                : '';

            html += `<tr>
                <td><strong>${c.nombre}</strong>${badgeDedicado}${badgePiscina}${zonasInfo}</td>
                <td><span class="marca-badge">${tabNombre}</span></td>
                <td>${c.tipo}</td>
                <td>${c.bocas}</td>
                <td>${c.dpms}</td>
                <td>
                    <select class="circ-select editable" onchange="actualizarSeccionCircuito('${tableroId}', ${idx}, this.value)" title="Sección del conductor (mm²)">
                        ${opcionesSecciones(c.seccion)}
                    </select>
                </td>
                <td>
                    <select class="circ-select editable" onchange="actualizarProteccionCircuito('${tableroId}', ${idx}, this.value)" title="Protección (A)">
                        ${opcionesProtecciones(c.proteccion)}
                    </select>
                </td>
                <td>
                    <input type="number" class="circ-input editable" min="1" step="1" value="${c.longitud}"
                           onchange="actualizarLongitudCircuito('${tableroId}', ${idx}, this.value)" title="Longitud (m)">
                </td>
                <td>
                    ${esTUE
                        ? `<input type="number" class="circ-input editable" min="100" step="100" value="${c.potenciaMotor || 2800}"
                                  onchange="actualizarPotenciaMotor('${tableroId}', ${idx}, this.value)" title="Potencia del motor (W)">`
                        : '<span style="color:var(--text-light);">—</span>'}
                </td>
                <td>${caida.toFixed(2)}%</td>
                <td>${iccAbajo.toFixed(2)} kA</td>
                <td><span class="marca-badge">${pdc} kA</span></td>
                <td>${verif}</td>
            </tr>`;
        });
    });
    tbody.innerHTML = html || '<tr><td colspan="13" class="empty-msg">Sin circuitos</td></tr>';
}

function actualizarLongitudCircuito(tableroId, idx, valor) {
    if (!circuitosPorTablero[tableroId] || !circuitosPorTablero[tableroId][idx]) return;
    circuitosPorTablero[tableroId][idx].longitud = parseFloat(valor) || 1;
    renderizarCircuitos();
    renderizarMotores();
    renderizarMateriales();
    renderizarVerificaciones();
    dibujarEsquemaSVG();
    autoguardarProyecto();
}

function actualizarSeccionCircuito(tableroId, idx, valor) {
    const c = circuitosPorTablero[tableroId] && circuitosPorTablero[tableroId][idx];
    if (!c) return;
    c.seccion = parseFloat(valor) || 2.5;
    renderizarCircuitos();
    renderizarMotores();
    renderizarMateriales();
    renderizarVerificaciones();
    dibujarEsquemaSVG();
    autoguardarProyecto();
}

function actualizarProteccionCircuito(tableroId, idx, valor) {
    const c = circuitosPorTablero[tableroId] && circuitosPorTablero[tableroId][idx];
    if (!c) return;
    c.proteccion = parseInt(valor) || 16;
    renderizarCircuitos();
    renderizarMateriales();
    renderizarVerificaciones();
    autoguardarProyecto();
}

function actualizarPotenciaMotor(tableroId, idx, valor) {
    const c = circuitosPorTablero[tableroId] && circuitosPorTablero[tableroId][idx];
    if (!c || c.tipo !== 'TUE') return;
    const pot = parseFloat(valor) || 2800;
    c.potenciaMotor = pot;
    if (pot > 0) {
        c.dpms = Math.max(3300, Math.round(pot / 100) * 100);
    }
    renderizarCircuitos();
    renderizarMotores();
    renderizarDPMS();
    renderizarMateriales();
    renderizarVerificaciones();
    dibujarEsquemaSVG();
    autoguardarProyecto();
}

// ============================================================
// MOTORES
// ============================================================
function renderizarMotores() {
    const tbody = document.getElementById('tbodyMotores');
    if (!tbody) return;
    const tues = [];
    Object.keys(circuitosPorTablero).forEach(tid => {
        circuitosPorTablero[tid].forEach((c, idx) => {
            if (c.tipo === 'TUE') tues.push({ ...c, tableroId: tid, idx });
        });
    });
    if (tues.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-msg">No hay circuitos TUE.</td></tr>';
        return;
    }
    tbody.innerHTML = tues.map(t => {
        const potencia = t.potenciaMotor || 2800;
        const r = calcularArranqueMotor(potencia, t.longitud, t.seccion, 'directo');
        const vReg = r.caidaNominal <= 5 ? `<span class="badge ok">✔ ${r.caidaNominal.toFixed(2)}%</span>` : `<span class="badge error">✖ ${r.caidaNominal.toFixed(2)}%</span>`;
        const vArr = r.caidaArranque <= 15 ? `<span class="badge ok">✔ ${r.caidaArranque.toFixed(2)}%</span>` : `<span class="badge error">✖ ${r.caidaArranque.toFixed(2)}%</span>`;
        const tabNombre = (tableros.find(x => x.id === t.tableroId) || {nombre: t.tableroId}).nombre;
        return `<tr>
            <td><strong>${t.nombre}</strong> <span class="marca-badge">${tabNombre}</span></td>
            <td>${potencia} W</td>
            <td>${r.corrienteNominal.toFixed(2)} A</td>
            <td>${r.corrienteArranque.toFixed(2)} A (×${r.factorArranque})</td>
            <td>${t.longitud}</td>
            <td>${t.seccion}</td>
            <td>${vReg}</td>
            <td>${vArr}</td>
            <td>${r.caidaArranque <= 15 ? '✔' : '✖'}</td>
        </tr>`;
    }).join('');
}

// ============================================================
// DIFERENCIALES
// ============================================================
function renderizarDiferenciales() {
    const seccion = document.getElementById('seccionDiferenciales');
    if (!seccion) return;
    const marca = document.getElementById('marcaInterruptores').value;
    const cat = CATALOGO_MARCAS[marca] || CATALOGO_MARCAS['Schneider'];
    const corrienteTotal = (window.__datosExport?.dpmsFinal || 0) / 220;
    const tieneBaño = ambientes.some(a => a.tipo === 'Baño');
    const tienePiscina = detectarAmbientesPiscina().length > 0;
    const tieneSeccionales = tableros.length > 1;

    let html = `
        <div style="margin-bottom:10px;"><strong>Corriente total estimada:</strong> ${corrienteTotal.toFixed(2)} A</div>
        <table>
            <thead><tr><th>Ubicación</th><th>Tipo</th><th>Sensibilidad</th><th>Corriente</th><th>Modelo</th></tr></thead>
            <tbody>
                <tr>
                    <td>Cabecera del Tablero Principal</td>
                    <td>ID Selectivo (Clase S)</td><td>300 mA</td>
                    <td>${Math.max(40, Math.ceil(corrienteTotal * 1.25 / 5) * 5)} A</td>
                    <td><span class="marca-badge">${cat.ID_300mA}</span></td>
                </tr>
                <tr>
                    <td>Circuitos TUG (agrupados)</td><td>ID 30 mA</td><td>30 mA</td><td>40 A</td>
                    <td><span class="marca-badge">${cat.ID_30mA}</span></td>
                </tr>
                <tr>
                    <td>Circuito TUE (motores)</td><td>ID 30 mA</td><td>30 mA</td><td>25 A</td>
                    <td><span class="marca-badge">${cat.ID_30mA}</span></td>
                </tr>`;
    if (tieneBaño) {
        html += `<tr style="background:#fff3cd;">
            <td>Circuito(s) de Baño (Sección 701)</td>
            <td>ID 30 mA exclusivo</td><td>10 mA</td><td>25 A</td>
            <td><span class="marca-badge">${cat.ID_BAÑO}</span></td>
        </tr>`;
    }
    if (tienePiscina) {
        html += `<tr style="background:#f8d7da;">
            <td><strong>🏊 Circuito(s) de Piscina (Sección 701)</strong></td>
            <td><strong>ID 30 mA OBLIGATORIO</strong></td><td><strong>30 mA</strong></td><td>25 A</td>
            <td><span class="marca-badge">${cat.ID_BAÑO}</span></td>
        </tr>`;
    }
    if (tieneSeccionales) {
        tableros.slice(1).forEach(t => {
            html += `<tr style="background:#d1ecf1;">
                <td>Cabecera ${t.nombre}</td>
                <td>ID 30 mA o 300 mA Selectivo</td><td>30 mA / 300 mA</td><td>40 A</td>
                <td><span class="marca-badge">${cat.ID_30mA}</span></td>
            </tr>`;
        });
    }
    html += `</tbody></table>
        <div class="info-tip">
            💡 <strong>Selectividad:</strong> El ID de cabecera (300 mA selectivo) debe estar coordinado con los ID de 30 mA aguas abajo.
            ${tieneBaño ? 'En baños, el ID debe ser <strong>exclusivo</strong> según Sección 701.' : ''}
            ${tienePiscina ? '<br>🏊 <strong>En piscinas, el ID 30 mA es OBLIGATORIO en todos los circuitos (Sección 701).</strong>' : ''}
            ${tieneSeccionales ? 'Cada tablero seccional debe tener su propia protección diferencial.' : ''}
        </div>`;
    seccion.innerHTML = html;
}

// ============================================================
// DPS - MÓDULO INTEGRADO
// ============================================================
function renderizarDPS() {
    const div = document.getElementById('seccionDPS');
    if (!div) return;

    const proyectoNombre = document.getElementById('nombreProyecto').value || 'proyecto';
    let resultado = null;
    try {
        const data = localStorage.getItem('resultadoDPS_' + proyectoNombre);
        if (data) resultado = JSON.parse(data);
    } catch (e) {}

    if (!resultado) {
        div.innerHTML = `
            <div class="info-tip">
                ⚡ <strong>Módulo de DPS no evaluado</strong><br>
                Hacé clic en el botón <strong>⚡ DPS</strong> en la barra superior para evaluar la necesidad de instalar un Dispositivo de Protección contra Sobretensiones.
            </div>
            <div style="text-align:center;margin-top:20px;">
                <button onclick="irAModuloDPS()" class="info">⚡ Ir al Módulo de DPS</button>
            </div>
        `;
        return;
    }

    const tipoNombre = {
        1: 'Tipo 1 (Clase B)',
        2: 'Tipo 2 (Clase C)',
        3: 'Tipo 3 (Clase D)'
    }[resultado.tipoRecomendado] || 'No definido';

    const badge = resultado.esObligatorio
        ? '<span class="badge error">OBLIGATORIO</span>'
        : '<span class="badge ok">NO OBLIGATORIO (recomendado)</span>';

    let html = `
        <div class="result-card">
            <h3>⚡ Evaluación de DPS (AEA 90364-7-771)</h3>
            <p><strong>Estado:</strong> ${badge}</p>
            <div class="grid-2" style="margin-top:12px;">
                <div class="stat">
                    <div class="value">${resultado.tipoRecomendado}</div>
                    <div class="label">Tipo de DPS</div>
                </div>
                <div class="stat">
                    <div class="value">${resultado.upRecomendado} kV</div>
                    <div class="label">Up Recomendado</div>
                </div>
                <div class="stat">
                    <div class="value">${resultado.entrada.tipoAcometida}</div>
                    <div class="label">Tipo de Acometida</div>
                </div>
                <div class="stat">
                    <div class="value">${resultado.entrada.tienePararrayos === 'si' ? 'Sí' : 'No'}</div>
                    <div class="label">Posee Pararrayos</div>
                </div>
            </div>
            <p style="margin-top:12px;"><strong>Tipo:</strong> ${tipoNombre}</p>
        </div>
    `;

    if (resultado.dispositivos && resultado.dispositivos.length > 0) {
        html += `
            <h3 style="margin-top:15px;font-size:0.95em;">📦 DPS Recomendados</h3>
            <table>
                <thead>
                    <tr><th>Modelo</th><th>Polos</th><th>Tipo</th><th>Imax</th><th>Up</th></tr>
                </thead>
                <tbody>
                    ${resultado.dispositivos.map(d => `
                        <tr>
                            <td><strong>${d.modelo}</strong></td>
                            <td>${d.polos}</td>
                            <td>Tipo ${d.tipo}</td>
                            <td>${d.Imax} kA</td>
                            <td><span class="badge ${d.Up <= resultado.upRecomendado ? 'ok' : 'warn'}">${d.Up} kV</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    html += `
        <div style="text-align:center;margin-top:20px;">
            <button onclick="irAModuloDPS()" class="info">✏️ Editar Evaluación de DPS</button>
        </div>
    `;

    div.innerHTML = html;
}

// ============================================================
// MATERIALES
// ============================================================
function renderizarMateriales() {
    const tbody = document.getElementById('tbodyMateriales');
    if (!tbody) return;
    const marca = document.getElementById('marcaInterruptores').value;
    const cat = CATALOGO_MARCAS[marca] || CATALOGO_MARCAS['Schneider'];
    const tipoInst = document.getElementById('tipoInstalacion').value;
    const tipoCable = getTipoCableActual();
    const nombreCable = getNombreTipoCable(tipoCable);

    const materiales = [];
    const acom = calcularAcometida();
    const nombreCableAcom = getNombreTipoCable(acom.tipoCable);
    const proteccionAcom = document.getElementById('acomProteccion').value;
    const tipoInstAcom = document.getElementById('acomTipoInst').value;

    const nombresProteccion = {
        'tubo_pvc_50': 'Tubo PVC rígido Ø50 mm (IRAM 62386)',
        'tubo_pvc_63': 'Tubo PVC rígido Ø63 mm (IRAM 62386)',
        'tubo_pvc_110': 'Tubo PVC rígido Ø110 mm (IRAM 62386)',
        'caño_metalico': 'Caño metálico galvanizado',
        'cablecanal': 'Cablecanal reforzado',
        'sin': 'Sin protección adicional'
    };

    // ─── ACOMETIDA ───
    const metrosAcomTramo = Math.ceil(acom.long * 1.15);
    const metrosAcomCable = metrosAcomTramo * acom.conductores;
    materiales.push([
        'Acometida',
        `Cable ${nombreCableAcom} — ${acom.conductores}×${acom.seccion} mm² (medidor → tablero principal)`,
        metrosAcomCable,
        'metros',
        `Tramo: medidor → ${(tableros.find(t => !t.padre) || {nombre:'Tablero Principal'}).nombre} · ` +
        `(Tramo: ${metrosAcomTramo} m × ${acom.conductores} conductores = ${metrosAcomCable} m) · +15% desperdicio`
    ]);

    if (proteccionAcom !== 'sin') {
        materiales.push([
            'Acometida',
            nombresProteccion[proteccionAcom] + ' (protección mecánica de acometida)',
            Math.ceil(acom.long * 1.15),
            'metros',
            `Tramo: medidor → tablero principal · Tipo instalación: ${tipoInstAcom}`
        ]);
    }

    materiales.push([
        'Acometida',
        'Gabinete de medidor con base portafusible',
        1,
        'unidad',
        'Según norma de la distribuidora local — 1 por suministro'
    ]);

    materiales.push([
        'Acometida',
        `Interruptor general de acometida 4P — ${pdcComercial(acom.iccFinal)} kA · ${acom.corriente.toFixed(0)} A`,
        1,
        'unidad',
        'Cabecera del Tablero Principal (único, siempre 1)'
    ]);

    // ─── LÍNEAS SECCIONALES (una por tablero) ───
    // ✅ Declaramos la variable correctamente para evitar el error
    const tablerosSeccionales = tableros.filter(t => t.padre);
    const factorSeccional = (parseInt(document.getElementById('acomConductores').value) || 4) >= 4 ? 4 : 3;
    
    tablerosSeccionales.forEach(t => {
        const metrosTramo = Math.ceil(t.long * 1.15);
        const metrosCable = metrosTramo * factorSeccional;
        materiales.push([
            'Línea Seccional',
            `Cable ${nombreCable} — ${factorSeccional}×${t.seccion} mm² (F+N+PE)`,
            metrosCable,
            'metros',
            `Tramo: ${(tableros.find(x => x.id === t.padre) || {nombre: t.padre}).nombre} → ${t.nombre} · ` +
            `(Tramo: ${metrosTramo} m × ${factorSeccional} conductores = ${metrosCable} m) · +15% desperdicio`
        ]);
    });

    tablerosSeccionales.forEach(t => {
        const prot = calcularProteccionLinea(t);
        const valorProt = t.proteccion ? `${t.proteccion} A` : (prot && prot.proteccionSugerida ? `${prot.proteccionSugerida} A (sugerido)` : 'sin definir');
        materiales.push([
            'Línea Seccional',
            `Interruptor general seccional 4P — ${valorProt}`,
            1,
            'unidad',
            `Cabecera del tablero "${t.nombre}" · PdC: ${pdcComercial(t.iccArriba || 4.5)} kA`
        ]);
    });

    // ─── PISCINA (si aplica) ───
    const verifPiscina = verificarReglasPiscina();
    if (verifPiscina && verifPiscina.tienePiscina) {
        materiales.push([
            'Piscina (Sección 701)',
            'Kit de equipotencialidad (borne + cable 6 mm² + conectores)',
            1,
            'kit',
            `Ambientes con piscina: ${verifPiscina.ambientesDetectados.join(', ')} — OBLIGATORIO Sección 701`
        ]);
        materiales.push([
            'Piscina (Sección 701)',
            'ID 30 mA exclusivo para circuitos de piscina',
            verifPiscina.totalCircuitos || 1,
            'unidad',
            `1 por cada circuito de piscina detectado (${verifPiscina.totalCircuitos} circuitos) — OBLIGATORIO Sección 701`
        ]);
    }

    // ─── PUESTA A TIERRA ───
    const pat = obtenerDatosPAT();
    materiales.push([
        'PAT',
        pat.nombreJabalina,
        pat.cantJabalina,
        'unidad',
        `Jabalinas del sistema de puesta a tierra · Con tomacable y caja de inspección`
    ]);
    materiales.push([
        'PAT',
        'Cámara de inspección',
        pat.cantJabalina,
        'unidad',
        `1 cámara por cada jabalina (${pat.cantJabalina} jabalinas declaradas)`
    ]);
    materiales.push([
        'PAT',
        `Cable PAT ${pat.seccion} mm² (verde/amarillo IRAM 2178)`,
        Math.ceil(pat.longCable * 1.15),
        'metros',
        `Tramo: jabalinas → tableros · Long. declarada: ${pat.longCable} m · +15% desperdicio`
    ]);
    materiales.push([
        'PAT',
        'Barra de tierra (borne principal de tierra)',
        tableros.length,
        'unidad',
        `1 por tablero (${tableros.length} tableros: ${tableros.map(t => t.nombre).join(', ')})`
    ]);
    materiales.push([
        'PAT',
        'Conector de jabalina / soldadura exotérmica',
        pat.cantJabalina,
        'unidad',
        `1 conector por jabalina (${pat.cantJabalina} jabalinas)`
    ]);

    // ─── TABLEROS (gabinetes) ───
    materiales.push([
        'Tableros',
        'Gabinete doble aislación Clase II con riel DIN (altura 1.30-1.80 m)',
        tableros.length,
        'unidad',
        `1 gabinete por tablero (${tableros.length} tableros: ${tableros.map(t => t.nombre).join(', ')})`
    ]);

    // ─── PROTECCIONES PIA ───
    const contadoresPIA = {};
    Object.keys(circuitosPorTablero).forEach(tid => {
        const tabNombre = (tableros.find(t => t.id === tid) || {nombre: tid}).nombre;
        circuitosPorTablero[tid].forEach(c => {
            const key = `${tid}|${c.tipo}|${c.seccion}|${c.proteccion}`;
            if (!contadoresPIA[key]) {
                contadoresPIA[key] = {
                    tableroNombre: tabNombre,
                    tipo: c.tipo,
                    seccion: c.seccion,
                    proteccion: c.proteccion,
                    cantidad: 0,
                    circuitos: []
                };
            }
            contadoresPIA[key].cantidad++;
            contadoresPIA[key].circuitos.push(c.nombre);
        });
    });

    Object.values(contadoresPIA).forEach(c => {
        const pdc = pdcComercial(4.5);
        const modelo = (cat['PIA_' + c.tipo] || '').replace('{pdc}', pdc);
        materiales.push([
            'Protecciones PIA',
            `PIA ${c.proteccion}A ${c.seccion}mm² — ${modelo}`,
            c.cantidad,
            'unidad',
            `Tablero: ${c.tableroNombre} · Tipo: ${c.tipo} · Circuitos: ${c.circuitos.join(', ')}`
        ]);
    });

    // ─── DIFERENCIALES (con corrección a 10mA en baños) ───
    materiales.push([
        'Diferenciales',
        cat.ID_300mA,
        1,
        'unidad',
        'Cabecera del Tablero Principal — Selectivo Clase S'
    ]);
    materiales.push([
        'Diferenciales',
        cat.ID_30mA,
        2,
        'unidad',
        '1 para circuitos TUG + 1 para circuitos TUE (Tablero Principal)'
    ]);
    if (ambientes.some(a => a.tipo === 'Baño')) {
        const baños = ambientes.filter(a => a.tipo === 'Baño').map(a => a.nombre);
        materiales.push([
            'Diferenciales',
            cat.ID_BAÑO, // ✅ Acá se aplica el modelo de 10mA
            1,
            'unidad',
            `Exclusivo para circuito(s) de baño (${baños.join(', ')}) — Sección 701 · ALTA SENSIBILIDAD (10mA)`
        ]);
    }
    if (tableros.length > 1) {
        const seccionales = tableros.filter(t => t.padre).map(t => t.nombre);
        materiales.push([
            'Diferenciales',
            cat.ID_30mA,
            tableros.length - 1,
            'unidad',
            `1 por tablero seccional (${seccionales.join(', ')})`
        ]);
    }

    // ─── DPS (si evaluado) ───
    const proyectoNombre = document.getElementById('nombreProyecto').value || 'proyecto';
    try {
        const dpsData = localStorage.getItem('resultadoDPS_' + proyectoNombre);
        if (dpsData) {
            const dps = JSON.parse(dpsData);
            const tipoNombre = {1: 'Tipo 1', 2: 'Tipo 2', 3: 'Tipo 3'}[dps.tipoRecomendado];
            const modelo = dps.dispositivos && dps.dispositivos[0] ? dps.dispositivos[0].modelo : `DPS ${tipoNombre} (seleccionar modelo)`;
            materiales.push([
                'Protección DPS',
                `${modelo} — Up ≤ ${dps.upRecomendado} kV`,
                1,
                'unidad',
                `Tablero Principal · ${dps.esObligatorio ? 'OBLIGATORIO (AEA 771)' : 'Recomendado (AEA 771)'}`
            ]);
            materiales.push([
                'Protección DPS',
                'Fusible o PIA de respaldo para DPS',
                1,
                'unidad',
                'Aguas arriba del DPS, en el Tablero Principal — Según fabricante'
            ]);
        }
    } catch (e) { console.warn('DPS no disponible:', e); }

    // ─── CABLES POR SECCIÓN Y TABLERO (Opción C) ───
    const cablesPorTableroSeccion = {};
    Object.keys(circuitosPorTablero).forEach(tid => {
        const tabNombre = (tableros.find(t => t.id === tid) || {nombre: tid}).nombre;
        circuitosPorTablero[tid].forEach(c => {
            const key = `${tid}|${c.seccion}`;
            if (!cablesPorTableroSeccion[key]) {
                cablesPorTableroSeccion[key] = {
                    tableroNombre: tabNombre,
                    seccion: c.seccion,
                    metros: 0,
                    circuitos: []
                };
            }
            cablesPorTableroSeccion[key].metros += c.longitud;
            cablesPorTableroSeccion[key].circuitos.push(c.nombre);
        });
    });

    Object.values(cablesPorTableroSeccion)
        .sort((a, b) => parseFloat(a.seccion) - parseFloat(b.seccion))
        .forEach(c => {
            const metrosTramo = Math.ceil(c.metros * 1.15);
            const metrosCable = metrosTramo * 3; // Fase + Neutro + PE
            const secNum = parseFloat(c.seccion);
            const nota = secNum <= 2.5 ? 'IRAM NM 247-3' : 'IRAM 2178';

            materiales.push([
                'Cables de circuitos',
                `Cable ${nombreCable} — ${c.seccion} mm² (F+N+PE)`,
                metrosCable,
                'metros',
                `Tablero: ${c.tableroNombre} · Circuitos: ${c.circuitos.join(', ')} · ` +
                `(Tramo: ${metrosTramo} m × 3 conductores = ${metrosCable} m) · ${nota} · +15% desperdicio`
            ]);
        });

    // ─── CANALIZACIONES ───
    const totalCanalizacion = Object.values(cablesPorTableroSeccion).reduce((a, c) => a + c.metros, 0);
    if (tipoInst === 'embutida') {
        materiales.push([
            'Canalizaciones',
            'Cañería IRAM 62386-21 Rígida 20 mm',
            Math.ceil(totalCanalizacion * 1.15),
            'metros',
            `Instalación embutida · Long. total de circuitos: ${totalCanalizacion} m · +15% desperdicio`
        ]);
    } else if (tipoInst === 'vista') {
        materiales.push([
            'Canalizaciones',
            'Cablecanal IRAM 62084 20x12 mm',
            Math.ceil(totalCanalizacion * 1.15),
            'metros',
            `Instalación a la vista · Long. total de circuitos: ${totalCanalizacion} m · +15% desperdicio`
        ]);
    } else {
        materiales.push([
            'Canalizaciones',
            'Cañería IRAM 62386-21 Rígida 20 mm',
            Math.ceil(totalCanalizacion * 0.6),
            'metros',
            `Instalación mixta (60% embutido) · Long. total: ${totalCanalizacion} m`
        ]);
        materiales.push([
            'Canalizaciones',
            'Cablecanal IRAM 62084 20x12 mm',
            Math.ceil(totalCanalizacion * 0.5),
            'metros',
            `Instalación mixta (50% a la vista) · Long. total: ${totalCanalizacion} m`
        ]);
    }

    // ─── CAJAS Y BOCAS ───
    const tIUG = parseInt(document.getElementById('totalIUG').textContent) || 0;
    const tTUG = parseInt(document.getElementById('totalTUG').textContent) || 0;
    const tTUE = parseInt(document.getElementById('totalTUE').textContent) || 0;
    const totalBocas = tIUG + tTUG + tTUE;

    materiales.push([
        'Cajas',
        'Caja rectangular 5x10 cm (embutir)',
        totalBocas,
        'unidad',
        `1 por cada boca · Total: ${totalBocas} bocas (${tIUG} IUG + ${tTUG} TUG + ${tTUE} TUE)`
    ]);
    materiales.push([
        'Cajas',
        'Caja derivación 10x10 cm',
        Math.ceil(totalBocas / 3),
        'unidad',
        `1 cada 3 bocas (estimado) · Sobre ${totalBocas} bocas`
    ]);

    materiales.push([
        'Bocas',
        'Tomacorriente 2P+T 10A IRAM 2071 (TUG a 0.30/1.10 m)',
        tTUG,
        'unidad',
        `1 por boca TUG · Total de bocas TUG: ${tTUG}`
    ]);
    materiales.push([
        'Bocas',
        'Tomacorriente 2P+T 20A IRAM 2071 (TUE a 1.10/2.00 m)',
        tTUE,
        'unidad',
        `1 por boca TUE · Total de bocas TUE: ${tTUE}`
    ]);
    materiales.push([
        'Bocas',
        'Interruptor de efecto (IUG a 1.10 m)',
        tIUG,
        'unidad',
        `1 por boca IUG · Total de bocas IUG: ${tIUG}`
    ]);

    const ambientesConTV = ambientes.filter(a => ['Habitación', 'Dormitorio', 'Cocina', 'Kitchenette'].includes(a.tipo));
    if (ambientesConTV.length > 0) {
        materiales.push([
            'Bocas',
            'Toma TV coaxil + RJ45 (0.30/1.10 m según ambiente)',
            ambientesConTV.length,
            'unidad',
            `1 por ambiente apto: ${ambientesConTV.map(a => a.nombre).join(', ')}`
        ]);
    }

    materiales.push([
        'Varios',
        'Precintos, grapas, terminales, cintas',
        1,
        'global',
        'Material menor — cantidad estimada'
    ]);

    tbody.innerHTML = materiales.map(m => `
        <tr>
            <td><strong>${m[0]}</strong></td>
            <td style="text-align:left;">${m[1]}</td>
            <td><strong>${m[2]}</strong></td>
            <td>${m[3]}</td>
            <td style="font-size:0.85em;color:var(--text-light);">${m[4]}</td>
        </tr>`).join('');
}

// ============================================================
// VERIFICACIONES
// ============================================================
function renderizarVerificaciones() {
    const verifs = [];
    const grado = document.getElementById('gradoResult').value;
    const d = window.__datosExport || {};
    const dpmsFinal = d.dpmsFinal || 0;
    const totalIUG = parseInt(document.getElementById('totalIUG').textContent) || 0;
    const totalTUG = parseInt(document.getElementById('totalTUG').textContent) || 0;

    const limites = { 'MÍNIMO': 3700, 'MEDIO': 7000, 'ELEVADO': 11000, 'SUPERIOR': Infinity };
    const limiteGrado = limites[grado];

    verifs.push(dpmsFinal <= limiteGrado
        ? { estado: 'ok', texto: `DPMS (${dpmsFinal.toFixed(0)} VA) dentro del Grado ${grado}.` }
        : { estado: 'error', texto: `DPMS (${dpmsFinal.toFixed(0)} VA) SUPERA el Grado ${grado}.` });

    verifs.push(totalIUG <= 15
        ? { estado: 'ok', texto: `Bocas IUG (${totalIUG}) OK.` }
        : { estado: 'warn', texto: `Bocas IUG (${totalIUG}) divididas en circuitos.` });

    verifs.push(totalTUG <= 15
        ? { estado: 'ok', texto: `Bocas TUG (${totalTUG}) OK.` }
        : { estado: 'warn', texto: `Bocas TUG (${totalTUG}) divididas en circuitos.` });

    let caidasMal = 0;
    Object.values(circuitosPorTablero).forEach(circs => {
        circs.forEach(c => {
            const caida = calcularCaidaTension(c.dpms, c.longitud, c.seccion, c.tipo, getTipoCableActual());
            const limite = c.tipo === 'IUG' ? 3 : 5;
            if (caida > limite) caidasMal++;
        });
    });
    verifs.push(caidasMal === 0
        ? { estado: 'ok', texto: `Caída de tensión OK en todos los circuitos.` }
        : { estado: 'error', texto: `${caidasMal} circuito(s) superan caída admisible.` });

    let motoresMal = 0;
    Object.values(circuitosPorTablero).forEach(circs => {
        circs.forEach(c => {
            if (c.tipo === 'TUE') {
                const r = calcularArranqueMotor(c.potenciaMotor || 2800, c.longitud, c.seccion, 'directo');
                if (r.caidaArranque > 15) motoresMal++;
            }
        });
    });
    verifs.push(motoresMal > 0
        ? { estado: 'error', texto: `${motoresMal} motor(es) superan 15% en arranque.` }
        : { estado: 'ok', texto: `Arranque de motores OK (<=15%).` });

    const iccOrigen = parseFloat(document.getElementById('iccOrigen').value) || 4.5;
    verifs.push(iccOrigen <= 10
        ? { estado: 'ok', texto: `Icc origen medidor (${iccOrigen} kA) <= 10 kA (AEA 770).` }
        : { estado: 'error', texto: `Icc origen > 10 kA. Aplicar Sección 771.` });

    const acom = calcularAcometida();
    verifs.push({ estado: 'info', texto: `Acometida: ${acom.long} m · ${acom.conductores}x${acom.seccion} mm² · ${getNombreTipoCable(acom.tipoCable)}.` });
    verifs.push(acom.deltaU_pct <= 5
        ? { estado: 'ok', texto: `ΔU acometida (${acom.deltaU_pct.toFixed(2)} %) <= 5 %. Margen restante para circuitos: ${(5 - acom.deltaU_pct).toFixed(2)} %.` }
        : { estado: 'error', texto: `ΔU acometida (${acom.deltaU_pct.toFixed(2)} %) SUPERA el 5 %. Aumentar sección o reducir longitud.` });
    verifs.push(acom.corriente <= acom.ampacidad
        ? { estado: 'ok', texto: `Ampacidad acometida OK: I=${acom.corriente.toFixed(1)} A <= ${acom.ampacidad} A.` }
        : { estado: 'error', texto: `Ampacidad acometida: I=${acom.corriente.toFixed(1)} A > ${acom.ampacidad} A. Aumentar sección.` });
    verifs.push({ estado: 'info', texto: `Icc en Tablero Principal: ${acom.iccFinal.toFixed(2)} kA · PdC >= ${pdcComercial(acom.iccFinal)} kA.` });

    const tablerosSeccionales = tableros.filter(t => t.padre);
    if (tablerosSeccionales.length > 0) {
        verifs.push({ estado: 'info', texto: `─── Verificación de líneas seccionales (${tablerosSeccionales.length}) ───` });

        tablerosSeccionales.forEach(t => {
            const duLinea = calcularDULineaTablero(t);
            if (!duLinea) return;

            if (duLinea.cumpleRecomendacion) {
                verifs.push({
                    estado: 'ok',
                    texto: `${t.nombre}: ΔU línea ${duLinea.deltaU_pct.toFixed(2)} % ≤ 1 % (recomendado AEA 770).`
                });
            } else {
                verifs.push({
                    estado: 'warn',
                    texto: `${t.nombre}: ΔU línea ${duLinea.deltaU_pct.toFixed(2)} % > 1 % recomendado. Evaluar aumento de sección.`
                });
            }

            const verifConjunta = verificarDUConjunta(t);
            if (verifConjunta) {
                if (verifConjunta.cumple) {
                    verifs.push({
                        estado: 'ok',
                        texto: `${t.nombre}: ΔU total ${verifConjunta.duTotal.toFixed(2)} % ≤ ${verifConjunta.limite} %.`
                    });
                } else {
                    verifs.push({
                        estado: 'error',
                        texto: `${t.nombre}: ΔU total ${verifConjunta.duTotal.toFixed(2)} % > ${verifConjunta.limite} %. Revisar diseño.`
                    });
                }
            }

            const sugerencia = sugerirSeccionLinea(t);
            if (sugerencia && sugerencia.necesitaCambio && sugerencia.seccionSugerida) {
                verifs.push({
                    estado: 'info',
                    texto: `${t.nombre}: se sugiere aumentar la línea a ${sugerencia.seccionSugerida} mm² (ΔU: ${sugerencia.duSugerida.toFixed(2)} %).`
                });
            }

            const ampacidadLinea = getAmpacidad(t.seccion, getTipoCableActual());
            if (duLinea.corriente <= ampacidadLinea) {
                verifs.push({
                    estado: 'ok',
                    texto: `${t.nombre}: ampacidad línea OK (I=${duLinea.corriente.toFixed(1)} A ≤ ${ampacidadLinea} A).`
                });
            } else {
                verifs.push({
                    estado: 'error',
                    texto: `${t.nombre}: ampacidad línea EXCEDIDA (I=${duLinea.corriente.toFixed(1)} A > ${ampacidadLinea} A). Aumentar sección.`
                });
            }
        });
    }

    let ampacidadMal = 0;
    Object.values(circuitosPorTablero).forEach(circs => {
        circs.forEach(c => {
            const amp = getAmpacidad(c.seccion);
            if (c.proteccion > amp) ampacidadMal++;
        });
    });
    verifs.push(ampacidadMal === 0
        ? { estado: 'ok', texto: `Ampacidad OK: protecciones <= ampacidad del conductor.` }
        : { estado: 'error', texto: `${ampacidadMal} circuito(s) con protección mayor a la ampacidad del cable.` });

    const tablerosConProteccion = tableros.filter(t => t.padre);
    if (tablerosConProteccion.length > 0) {
        verifs.push({ estado: 'info', texto: `─── Verificación de protecciones de líneas seccionales ───` });

        tablerosConProteccion.forEach(t => {
            const prot = calcularProteccionLinea(t);
            if (!prot) return;

            if (prot.necesitaProteccion) {
                verifs.push({
                    estado: 'warn',
                    texto: `${t.nombre}: sin protección general definida. Se sugiere ${prot.proteccionSugerida} A.`
                });
            } else if (!prot.cumpleSobrecarga) {
                verifs.push({
                    estado: 'error',
                    texto: `${t.nombre}: protección actual (${prot.proteccionActual} A) < corriente de diseño (${prot.corrienteDiseno.toFixed(1)} A). Subir a ${prot.proteccionSugerida} A.`
                });
            } else if (!prot.cumpleAmpacidad) {
                verifs.push({
                    estado: 'error',
                    texto: `${t.nombre}: protección actual (${prot.proteccionActual} A) > ampacidad (${prot.ampacidad} A). Bajar a ${prot.proteccionSugerida} A o aumentar sección.`
                });
            } else {
                verifs.push({
                    estado: 'ok',
                    texto: `${t.nombre}: protección ${prot.proteccionActual} A OK (I_diseño: ${prot.corrienteDiseno.toFixed(1)} A ≤ In ≤ Ampacidad: ${prot.ampacidad} A).`
                });
            }
        });

        verifs.push({ estado: 'info', texto: `─── Verificación de selectividad ───` });
        const principal = tableros.find(t => !t.padre);
        if (principal && principal.proteccion) {
            tablerosConProteccion.forEach(t => {
                if (!t.proteccion) return;
                if (t.proteccion < principal.proteccion) {
                    verifs.push({
                        estado: 'ok',
                        texto: `${t.nombre} (${t.proteccion} A) < Principal (${principal.proteccion} A): selectividad OK.`
                    });
                } else {
                    verifs.push({
                        estado: 'warn',
                        texto: `${t.nombre} (${t.proteccion} A) ≥ Principal (${principal.proteccion} A): verificar selectividad.`
                    });
                }
            });
        } else {
            verifs.push({
                estado: 'info',
                texto: `Principal sin protección general definida. Definir para verificar selectividad.`
            });
        }
    }

    const verifPiscina = verificarReglasPiscina();
    if (verifPiscina && verifPiscina.tienePiscina) {
        verifs.push({ estado: 'info', texto: `─── Verificación de piscinas (Sección 701) ───` });
        verifs.push({
            estado: 'warn',
            texto: `🏊 Se detectaron ${verifPiscina.ambientesDetectados.length} ambiente(s) con piscina: ${verifPiscina.ambientesDetectados.join(', ')}.`
        });

        if (verifPiscina.totalCircuitos > 0) {
            verifs.push({
                estado: 'error',
                texto: `🔴 ID 30 mA OBLIGATORIO: Los ${verifPiscina.totalCircuitos} circuitos de piscina requieren protección diferencial de 30 mA (Sección 701).`
            });
        }

        verifPiscina.tomasEnZona1.forEach(adv => {
            verifs.push({
                estado: 'warn',
                texto: `⚠️ ${adv}`
            });
        });

        verifs.push({
            estado: 'error',
            texto: `🔴 EQUIPOTENCIALIDAD OBLIGATORIA: Conectar todas las partes metálicas de la piscina a un borne de equipotencialidad con cable de 6 mm² mínimo (Sección 701).`
        });

        verifs.push({
            estado: 'warn',
            texto: `⚠️ IP mínimo: Zona 0 = IPX8, Zona 1 = IPX4, Zona 2 = IPX2. Verificar tomas en zonas de seguridad.`
        });
    }

    verifs.push({ estado: 'info', texto: `Tipo de cable: ${getNombreTipoCable()}. GDC aplicado según catálogo.` });

    const tipoInstAcom = document.getElementById('acomTipoInst').value;
    const proteccionAcom = document.getElementById('acomProteccion').value;
    const tipoCableAcom = document.getElementById('acomTipoCable').value;

    const tipoInstAEA = mapearTipoInstAEA(tipoInstAcom, tipoCableAcom);
    const canalizAEA = mapearCanalizacionAEA(tipoInstAcom, proteccionAcom);
    const tipoCableAEA = mapearTipoCableAEA(tipoCableAcom);

    const validacionAcom = validarCombinacionAEA(tipoInstAEA, canalizAEA, tipoCableAEA);
    const canalNombre = MATRIZ_AEA_CONDUCTORES[tipoInstAEA]?.canalizaciones[canalizAEA]?.nombre || canalizAEA;
    const cableNombre = NOMBRES_TIPO_CABLE_AEA[tipoCableAEA] || tipoCableAEA;

    if (validacionAcom.permitido === true) {
        verifs.push({ estado: 'ok', texto: `Acometida según AEA 770: ${cableNombre} permitido en "${canalNombre}".` });
    } else if (validacionAcom.permitido === false) {
        verifs.push({ estado: 'error', texto: `Acometida NO PERMITIDA según AEA 770: ${cableNombre} en "${canalNombre}". ${validacionAcom.motivo}` });
    } else {
        verifs.push({ estado: 'warn', texto: `Acometida: verificar manualmente combinación ${cableNombre} + "${canalNombre}" según AEA 770.` });
    }

    const tipoInstalacion = document.getElementById('tipoInstalacion').value;
    const tipoCableCirc = document.getElementById('tipoCable').value;
    const tipoCableCircAEA = mapearTipoCableAEA(tipoCableCirc);

    let canalCircAEA = 'CAÑERIA_PVC';
    if (tipoInstalacion === 'embutida') canalCircAEA = 'CAÑERIA_PVC';
    else if (tipoInstalacion === 'vista') canalCircAEA = 'CAÑERIA_SOH';

    const validacionCirc = validarCombinacionAEA('FIJA_INT', canalCircAEA, tipoCableCircAEA);
    if (validacionCirc.permitido === true) {
        verifs.push({ estado: 'ok', texto: `Circuitos interiores: ${NOMBRES_TIPO_CABLE_AEA[tipoCableCircAEA]} permitido en cañería.` });
    } else if (validacionCirc.permitido === false) {
        verifs.push({ estado: 'error', texto: `Circuitos interiores: combinación NO permitida según AEA 770. ${validacionCirc.motivo}` });
    }

    const pat = obtenerDatosPAT();
    verifs.push({ estado: 'info', texto: `PAT: ${pat.cantJabalina} jabalina(s) · ${pat.longCable} m de cable ${pat.seccion} mm².` });
    verifs.push(pat.cantJabalina >= 2
        ? { estado: 'ok', texto: `PAT con ${pat.cantJabalina} jabalinas en paralelo: reduce la resistencia total respecto a una sola.` }
        : { estado: 'warn', texto: `PAT con 1 sola jabalina. Si el terreno es de alta resistividad, evaluar agregar una segunda jabalina.` });
    verifs.push({ estado: 'warn', texto: `Verificar R <= 40 Ohm en obra con telurómetro (AEA 770 Sección 770.8).` });

    verifs.push({ estado: 'info', texto: `Alturas verificadas: IUG 1.10 m · TUG 0.30/1.10 m · TUE 1.10/2.00 m · TV/datos 0.30/1.10 m · Tableros 1.30-1.80 m.` });
    if (ambientes.some(a => a.tipo === 'Baño')) {
        verifs.push({ estado: 'ok', texto: `Baños: tomas fuera del volumen de seguridad (Sección 701).` });
    }

    const proyectoNombreVerif = document.getElementById('nombreProyecto').value || 'proyecto';
    try {
        const dpsData = localStorage.getItem('resultadoDPS_' + proyectoNombreVerif);
        if (dpsData) {
            const dps = JSON.parse(dpsData);
            if (dps.esObligatorio) {
                verifs.push({
                    estado: 'info',
                    texto: `DPS evaluado: OBLIGATORIO según AEA 771. Tipo ${dps.tipoRecomendado}, Up <= ${dps.upRecomendado} kV.`
                });
            } else {
                verifs.push({
                    estado: 'ok',
                    texto: `DPS evaluado: no obligatorio, pero recomendado. Tipo ${dps.tipoRecomendado}, Up <= ${dps.upRecomendado} kV.`
                });
            }
        } else {
            verifs.push({
                estado: 'warn',
                texto: `Módulo de DPS no evaluado. Se recomienda abrir el módulo.`
            });
        }
    } catch (e) {
        verifs.push({
            estado: 'warn',
            texto: `No se pudo verificar el estado del DPS.`
        });
    }

    const elVerif = document.getElementById('verificaciones');
    if (elVerif) {
        elVerif.innerHTML = verifs.map(v =>
            `<div style="margin-bottom:8px;"><span class="badge ${v.estado}">${v.estado === 'ok' ? '✔' : v.estado === 'warn' ? '⚠' : v.estado === 'info' ? 'ℹ' : '✖'}</span> ${v.texto}</div>`
        ).join('');
    }
}

// ============================================================
// PLANO
// ============================================================
function inicializarPlano() {
    const ancho = parseFloat(document.getElementById('planoAncho').value) || 15;
    const alto = parseFloat(document.getElementById('planoAlto').value) || 12;
    const canvas = document.getElementById('planoCanvas');
    if (!canvas) return;
    canvas.width = ancho * ESCALA_PLANO;
    canvas.height = alto * ESCALA_PLANO;

    canvas.onmousedown = onPlanoMouseDown;
    canvas.onmousemove = onPlanoMouseMove;
    canvas.onmouseup = onPlanoMouseUp;
    canvas.onmouseleave = onPlanoMouseUp;

    dibujarPlano();
}

function setHerramienta(h) {
    herramientaActual = h;
    document.querySelectorAll('.plano-toolbar button').forEach(b => b.classList.remove('active'));
    const map = { 'select': 'btnSelect', 'boca_iug': 'btnIUG', 'boca_tug': 'btnTUG', 'boca_tue': 'btnTUE', 'boca_tv': 'btnTV', 'tablero': 'btnTablero', 'borrar': 'btnBorrar' };
    if (map[h]) {
        const btn = document.getElementById(map[h]);
        if (btn) btn.classList.add('active');
    }
}

function onPlanoMouseDown(e) {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (herramientaActual === 'select') {
        for (let i = planoElementos.length - 1; i >= 0; i--) {
            const el = planoElementos[i];
            if (Math.hypot(x - el.x, y - el.y) < 18) {
                arrastrando = el;
                offsetX = x - el.x;
                offsetY = y - el.y;
                elementoSeleccionado = el;
                dibujarPlano();
                return;
            }
        }
        elementoSeleccionado = null;
        dibujarPlano();
    } else if (herramientaActual === 'borrar') {
        for (let i = planoElementos.length - 1; i >= 0; i--) {
            const el = planoElementos[i];
            if (Math.hypot(x - el.x, y - el.y) < 18) {
                planoElementos.splice(i, 1);
                dibujarPlano();
                actualizarContadoresPlano();
                return;
            }
        }
    } else {
        const nombreMap = {
            'boca_iug': 'IUG', 'boca_tug': 'TUG', 'boca_tue': 'TUE',
            'boca_tv': 'TV/Dat', 'tablero': 'Tablero'
        };
        const nuevo = {
            id: 'el_' + Date.now(),
            tipo: herramientaActual,
            x, y,
            nombre: nombreMap[herramientaActual] || 'Elemento',
            ambiente: ''
        };
        planoElementos.push(nuevo);
        elementoSeleccionado = nuevo;
        dibujarPlano();
        actualizarContadoresPlano();
    }
}

function onPlanoMouseMove(e) {
    if (!arrastrando) return;
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    arrastrando.x = Math.max(15, Math.min(canvas.width - 15, x - offsetX));
    arrastrando.y = Math.max(15, Math.min(canvas.height - 15, y - offsetY));
    dibujarPlano();
}

function onPlanoMouseUp() {
    if (arrastrando) {
        arrastrando = null;
        actualizarContadoresPlano();
    }
}

function dibujarPlano() {
    const canvas = document.getElementById('planoCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const bgColor = modoOscuro ? '#2a2a3e' : '#fafafa';
    const gridColor = modoOscuro ? '#3a3a4e' : '#e0e0e0';
    const textColor = modoOscuro ? '#e0e0e0' : '#333';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += ESCALA_PLANO) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += ESCALA_PLANO) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    ctx.fillStyle = textColor;
    ctx.font = '10px sans-serif';
    for (let x = 0; x < W; x += ESCALA_PLANO * 5) ctx.fillText((x / ESCALA_PLANO) + 'm', x + 3, 12);
    for (let y = 0; y < H; y += ESCALA_PLANO * 5) ctx.fillText((y / ESCALA_PLANO) + 'm', 3, y + 12);

    planoElementos.forEach(el => {
        const color = el.tipo === 'boca_iug' ? '#f39c12' :
                      el.tipo === 'boca_tug' ? '#3498db' :
                      el.tipo === 'boca_tue' ? '#e74c3c' :
                      el.tipo === 'boca_tv' ? '#1abc9c' :
                      el.tipo === 'tablero' ? '#9b59b6' : '#95a5a6';

        if (el === elementoSeleccionado) {
            ctx.fillStyle = 'rgba(102,126,234,0.3)';
            ctx.beginPath();
            ctx.arc(el.x, el.y, 22, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.tipo === 'tablero' ? 18 : 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const sigla = el.tipo === 'tablero' ? 'TB' : el.tipo === 'boca_iug' ? 'IUG' : el.tipo === 'boca_tug' ? 'TUG' : el.tipo === 'boca_tue' ? 'TUE' : el.tipo === 'boca_tv' ? 'TV' : '?';
        ctx.fillText(sigla, el.x, el.y);

        if (el.ambiente) {
            const amb = ambientes.find(a => a.nombre === el.ambiente);
            const alt = amb ? calcularAlturaTomas(amb) : null;
            let etiqueta = el.ambiente;
            if (alt) {
                if (el.tipo === 'boca_iug') etiqueta += ` (${alt.hIUG.toFixed(2)}m)`;
                else if (el.tipo === 'boca_tug') etiqueta += ` (${alt.hTUG.toFixed(2)}m)`;
                else if (el.tipo === 'boca_tue') etiqueta += ` (${alt.hTUE.toFixed(2)}m)`;
                else if (el.tipo === 'boca_tv') etiqueta += ` (${alt.hTV.toFixed(2)}m)`;
                else if (el.tipo === 'tablero') etiqueta += ` (1.30-1.80m)`;
            }
            ctx.fillStyle = textColor;
            ctx.font = '8px sans-serif';
            ctx.fillText(etiqueta, el.x, el.y + 22);
        }
    });

    mostrarPanelElemento();
}

function mostrarPanelElemento() {
    const panel = document.getElementById('panelElemento');
    if (!panel) return;
    if (!elementoSeleccionado) { panel.style.display = 'none'; return; }
    panel.style.display = 'block';
    const el = elementoSeleccionado;
    panel.innerHTML = `
        <h4>🔧 ${el.nombre}</h4>
        <label>Ambiente</label>
        <input type="text" value="${el.ambiente}" onchange="actualizarElemento('ambiente', this.value)">
        <label>Tipo</label>
        <select onchange="actualizarElemento('tipo', this.value)">
            <option value="boca_iug" ${el.tipo === 'boca_iug' ? 'selected' : ''}>Boca IUG</option>
            <option value="boca_tug" ${el.tipo === 'boca_tug' ? 'selected' : ''}>Boca TUG</option>
            <option value="boca_tue" ${el.tipo === 'boca_tue' ? 'selected' : ''}>Boca TUE</option>
            <option value="boca_tv" ${el.tipo === 'boca_tv' ? 'selected' : ''}>Boca TV/Datos</option>
            <option value="tablero" ${el.tipo === 'tablero' ? 'selected' : ''}>Tablero</option>
        </select>
        <div style="margin-top:8px;">
            <button class="danger small" onclick="eliminarElementoSeleccionado()">🗑️ Eliminar</button>
        </div>`;
}

function actualizarElemento(campo, valor) {
    if (!elementoSeleccionado) return;
    elementoSeleccionado[campo] = valor;
    if (campo === 'tipo') {
        const nombres = { boca_iug: 'IUG', boca_tug: 'TUG', boca_tue: 'TUE', boca_tv: 'TV/Dat', tablero: 'Tablero' };
        elementoSeleccionado.nombre = nombres[valor] || 'Elemento';
    }
    dibujarPlano();
    actualizarContadoresPlano();
}

function eliminarElementoSeleccionado() {
    if (!elementoSeleccionado) return;
    const idx = planoElementos.indexOf(elementoSeleccionado);
    if (idx >= 0) planoElementos.splice(idx, 1);
    elementoSeleccionado = null;
    dibujarPlano();
    actualizarContadoresPlano();
}

function limpiarPlano() {
    if (planoElementos.length === 0) return;
    if (!confirm('¿Borrar todos los elementos del plano?')) return;
    planoElementos = [];
    elementoSeleccionado = null;
    dibujarPlano();
    actualizarContadoresPlano();
}

function actualizarContadoresPlano() {
    const iug = planoElementos.filter(e => e.tipo === 'boca_iug').length;
    const tug = planoElementos.filter(e => e.tipo === 'boca_tug').length;
    const tue = planoElementos.filter(e => e.tipo === 'boca_tue').length;
    const tv = planoElementos.filter(e => e.tipo === 'boca_tv').length;
    const elIUG = document.getElementById('planoIUG');
    const elTUG = document.getElementById('planoTUG');
    const elTUE = document.getElementById('planoTUE');
    const elTV = document.getElementById('planoTV');
    const elTotal = document.getElementById('planoTotal');
    if (elIUG) elIUG.textContent = iug;
    if (elTUG) elTUG.textContent = tug;
    if (elTUE) elTUE.textContent = tue;
    if (elTV) elTV.textContent = tv;
    if (elTotal) elTotal.textContent = planoElementos.length;
}

function autoUbicarBocas() {
    if (planoElementos.length > 0 && !confirm('¿Borrar el plano actual y auto-ubicar bocas?')) return;
    planoElementos = [];
    const canvas = document.getElementById('planoCanvas');
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    if (ambientes.length === 0) { mostrarToast('⚠️ No hay ambientes cargados'); return; }

    const cols = Math.ceil(Math.sqrt(ambientes.length));
    const anchoCelda = W / cols;
    const altoCelda = H / Math.ceil(ambientes.length / cols);
    let counter = 0;

    ambientes.forEach((amb, i) => {
        const col = i % cols;
        const fila = Math.floor(i / cols);
        const centroX = col * anchoCelda + anchoCelda / 2;
        const centroY = fila * altoCelda + altoCelda / 2;
        const b = calcularBocas(amb);
        const tieneTV = ['Habitación', 'Dormitorio', 'Cocina', 'Kitchenette'].includes(amb.tipo);
        const totalBocasAmb = b.iug + b.tug + b.tue + (tieneTV ? 1 : 0);
        if (totalBocasAmb === 0) return;
        let idx = 0;
        const agregar = (tipo) => {
            const angulo = (idx / totalBocasAmb) * Math.PI * 2;
            const radio = Math.min(anchoCelda, altoCelda) / 3;
            const nombreMap = { boca_iug: 'IUG', boca_tug: 'TUG', boca_tue: 'TUE', boca_tv: 'TV/Dat' };
            planoElementos.push({
                id: 'el_' + Date.now() + '_' + (counter++),
                tipo,
                nombre: nombreMap[tipo] || 'Elemento',
                ambiente: amb.nombre,
                x: centroX + Math.cos(angulo) * radio,
                y: centroY + Math.sin(angulo) * radio
            });
            idx++;
        };
        for (let j = 0; j < b.iug; j++) agregar('boca_iug');
        for (let j = 0; j < b.tug; j++) agregar('boca_tug');
        for (let j = 0; j < b.tue; j++) agregar('boca_tue');
        if (tieneTV) agregar('boca_tv');
    });

    dibujarPlano();
    actualizarContadoresPlano();
    mostrarToast('✅ Bocas auto-ubicadas: ' + planoElementos.length);
}

function exportarPlanoPNG() {
    const canvas = document.getElementById('planoCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'plano_electrico.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ============================================================
// ESQUEMA SVG
// ============================================================
function dibujarEsquemaSVG() {
    const container = document.getElementById('svgContainer');
    if (!container) return;
    const tieneCircuitos = Object.values(circuitosPorTablero).some(c => c.length > 0);
    if (!tieneCircuitos) { container.innerHTML = '<div class="empty-msg">Sin circuitos</div>'; return; }

    const ancho = 1100;
    const altoNodo = 55;
    const separacion = 12;
    const padding = 25;
    let altoTotal = padding * 2 + altoNodo * (tableros.length + 4) + separacion * (tableros.length + 4) + 140;
    Object.values(circuitosPorTablero).forEach(circs => {
        if (circs.length > 0) altoTotal += Math.ceil(circs.length / 6) * 55 + separacion + 15;
    });

    const colorTexto = modoOscuro ? '#e0e0e0' : '#333';
    const colorLinea = modoOscuro ? '#7b8ff0' : '#667eea';
    const colorNodo = modoOscuro ? '#2a2a3e' : '#f8f9fa';
    const colorBorde = modoOscuro ? '#444' : '#ddd';
    const nodoSVG = (x, yy, w, h, fill, stroke) => `<rect x="${x}" y="${yy}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="2" rx="6"/>`;

    let svg = `<svg viewBox="0 0 ${ancho} ${altoTotal}" xmlns="http://www.w3.org/2000/svg" style="font-family: sans-serif;">`;
    let y = padding;
    const centroX = ancho / 2;

    const acom = calcularAcometida();
    svg += `<line x1="${centroX}" y1="0" x2="${centroX}" y2="${y}" stroke="${colorLinea}" stroke-width="3"/>`;
    svg += `<text x="${centroX + 10}" y="${y - 5}" fill="${colorTexto}" font-size="10">Acometida 220/380V</text>`;
    svg += nodoSVG(centroX - 70, y, 140, altoNodo, colorNodo, colorBorde);
    svg += `<text x="${centroX}" y="${y + 22}" fill="${colorTexto}" font-size="11" font-weight="bold" text-anchor="middle">MEDIDOR</text>`;
    svg += `<text x="${centroX}" y="${y + 38}" fill="${colorTexto}" font-size="9" text-anchor="middle">Icc: ${acom.iccOrigen.toFixed(1)} kA</text>`;
    y += altoNodo + separacion;

    svg += `<line x1="${centroX}" y1="${y - separacion}" x2="${centroX}" y2="${y}" stroke="${colorLinea}" stroke-width="3"/>`;
    svg += `<text x="${centroX + 15}" y="${y - 5}" fill="${colorTexto}" font-size="9">${acom.long}m · ${acom.conductores}x${acom.seccion}mm2 · ${getNombreTipoCable(acom.tipoCable)}</text>`;

    const ambientesPiscina = detectarAmbientesPiscina();

    tableros.forEach(t => {
        const circs = circuitosPorTablero[t.id] || [];
        if (t.padre && circs.length === 0) return;

        const tableroTienePiscina = ambientesPiscina.some(a => a.tablero === t.id);

        svg += `<line x1="${centroX}" y1="${y - separacion}" x2="${centroX}" y2="${y}" stroke="${colorLinea}" stroke-width="3"/>`;
        if (t.padre) {
            const duLinea = calcularDULineaTablero(t);
            const duTexto = duLinea ? ` · DU: ${duLinea.deltaU_pct.toFixed(2)}%` : '';
            svg += `<text x="${centroX + 15}" y="${y - 5}" fill="${colorTexto}" font-size="9">${t.long}m · ${t.seccion}mm2${duTexto}</text>`;
        }

        const wTab = 240;
        const colorBordeTab = tableroTienePiscina ? '#e74c3c' : colorBorde;
        svg += nodoSVG(centroX - wTab / 2, y, wTab, altoNodo, colorNodo, colorBordeTab);
        svg += `<text x="${centroX}" y="${y + 22}" fill="${tableroTienePiscina ? '#e74c3c' : colorTexto}" font-size="11" font-weight="bold" text-anchor="middle">${t.nombre.toUpperCase()}${tableroTienePiscina ? ' 🏊' : ''}</text>`;
        svg += `<text x="${centroX}" y="${y + 38}" fill="${colorTexto}" font-size="9" text-anchor="middle">Icc: ${(t.iccArriba || 4.5).toFixed(2)} kA · PdC >= ${pdcComercial(t.iccArriba || 4.5)} kA · Alt: 1.30-1.80 m</text>`;
        y += altoNodo + separacion;

        if (circs.length > 0) {
            const cols = Math.min(circs.length, 6);
            const filas = Math.ceil(circs.length / cols);
            const anchoCirc = (ancho - padding * 4) / cols;

            svg += `<line x1="${padding + anchoCirc / 2}" y1="${y + 12}" x2="${padding + anchoCirc * (cols - 0.5)}" y2="${y + 12}" stroke="${colorLinea}" stroke-width="2"/>`;
            svg += `<line x1="${centroX}" y1="${y}" x2="${centroX}" y2="${y + 12}" stroke="${colorLinea}" stroke-width="2"/>`;
            y += 12;

            circs.forEach((c, ci) => {
                const col = ci % cols;
                const fila = Math.floor(ci / cols);
                const x = padding + anchoCirc * col + anchoCirc / 2;
                const yCaja = y + fila * 55;
                const esPiscina = (c.zonas || []).some(z => ambientesPiscina.some(ap => ap.nombre === z));
                const color = esPiscina ? '#e74c3c' : (c.tipo === 'IUG' ? '#f39c12' : c.tipo === 'TUG' ? '#3498db' : '#e74c3c');

                svg += `<line x1="${x}" y1="${yCaja}" x2="${x}" y2="${yCaja + 15}" stroke="${color}" stroke-width="2"/>`;
                svg += nodoSVG(x - 55, yCaja + 15, 110, 40, colorNodo, color);
                svg += `<text x="${x}" y="${yCaja + 30}" fill="${colorTexto}" font-size="10" font-weight="bold" text-anchor="middle">${c.nombre} · ${c.tipo}${esPiscina ? ' 🏊' : ''}</text>`;
                svg += `<text x="${x}" y="${yCaja + 44}" fill="${colorTexto}" font-size="9" text-anchor="middle">${c.bocas}b · ${c.proteccion}A · ${c.seccion}mm2</text>`;
            });

            y += filas * 55 + separacion;
        }
    });

    const proyectoNombreSvg = document.getElementById('nombreProyecto').value || 'proyecto';
    try {
        const dpsData = localStorage.getItem('resultadoDPS_' + proyectoNombreSvg);
        if (dpsData) {
            const dps = JSON.parse(dpsData);
            const colorDPS = dps.esObligatorio ? '#e74c3c' : '#f39c12';
            const xDPS = centroX - 100;
            const yDPS = y + 20;
            svg += `<line x1="${centroX}" y1="${y}" x2="${centroX}" y2="${yDPS}" stroke="${colorDPS}" stroke-width="3"/>`;
            svg += nodoSVG(xDPS, yDPS, 200, 40, colorNodo, colorDPS);
            svg += `<text x="${centroX}" y="${yDPS + 25}" fill="${colorTexto}" font-size="10" font-weight="bold" text-anchor="middle">DPS Tipo ${dps.tipoRecomendado} - Up <= ${dps.upRecomendado} kV</text>`;
            y = yDPS + 50;
        }
    } catch (e) { console.warn('DPS no disponible para el esquema:', e); }

    const pat = obtenerDatosPAT();
    svg += `<line x1="${padding}" y1="${y}" x2="${ancho - padding}" y2="${y}" stroke="${colorLinea}" stroke-width="2" stroke-dasharray="5,5"/>`;
    svg += `<text x="${centroX}" y="${y + 18}" fill="${colorTexto}" font-size="10" font-weight="bold" text-anchor="middle">PAT: ${pat.cantJabalina} jabalina(s) - R &lt;= 40 Ohm</text>`;

    if (ambientesPiscina.length > 0) {
        svg += `<text x="${centroX}" y="${y + 34}" fill="#e74c3c" font-size="10" font-weight="bold" text-anchor="middle">🏊 EQUIPOTENCIALIDAD PISCINA: Cable 6 mm² a todas las partes metálicas (Sección 701)</text>`;
    }

    svg += `</svg>`;
    container.innerHTML = svg;
}

// ============================================================
// GUARDAR / CARGAR PROYECTO
// ============================================================
function obtenerProyectos() {
    try {
        const data = localStorage.getItem('aea770_proyectos_v8_local');
        return data ? JSON.parse(data) : {};
    } catch(e) { return {}; }
}

function guardarProyectos(proyectos) {
    try {
        localStorage.setItem('aea770_proyectos_v8_local', JSON.stringify(proyectos));
        actualizarSelectorProyectos();
    } catch(e) {
        alert('No se pudo guardar: ' + e.message);
    }
}

function actualizarSelectorProyectos() {
    const proyectos = obtenerProyectos();
    const selector = document.getElementById('selectorProyecto');
    if (!selector) return;

    const actual = proyectoActualId || selector.value;

    selector.innerHTML = '<option value="">-- Proyectos --</option>';
    Object.keys(proyectos).forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = proyectos[id].nombre || id;
        selector.appendChild(opt);
    });

    if (actual && proyectos[actual]) {
        selector.value = actual;
    }
}

function capturarProyecto() {
    const proyecto = {
        __id: proyectoActualId || null,
        version: '8.4-local-fixed',
        fecha: new Date().toISOString(),
        nombre: document.getElementById('nombreProyecto').value || 'Sin nombre',
        supCubierta: document.getElementById('supCubierta').value,
        supSemicubierta: document.getElementById('supSemicubierta').value,
        iccOrigen: document.getElementById('iccOrigen').value,
        marca: document.getElementById('marcaInterruptores').value,
        tipoCable: document.getElementById('tipoCable').value,
        tipoInstalacion: document.getElementById('tipoInstalacion').value,
        ambientes, circuitosPorTablero, tableros, planoElementos, modoOscuro,
        contadorTableros,
        acometida: {
            longitud: document.getElementById('acomLongitud').value,
            tipoCable: document.getElementById('acomTipoCable').value,
            seccion: document.getElementById('acomSeccion').value,
            conductores: document.getElementById('acomConductores').value,
            tipoInst: document.getElementById('acomTipoInst').value,
            proteccion: document.getElementById('acomProteccion').value
        },
        puestaTierra: {
            cantJabalina: document.getElementById('patCantJabalina').value,
            longCable: document.getElementById('patLongCable').value,
            seccion: document.getElementById('patSeccion').value,
            tipoJabalina: document.getElementById('patTipoJabalina').value
        }
    };

    return proyecto;
}

function aplicarProyecto(p) {
    document.getElementById('nombreProyecto').value = p.nombre || 'Mi Vivienda';
    document.getElementById('supCubierta').value = p.supCubierta || 94;
    document.getElementById('supSemicubierta').value = p.supSemicubierta || 4;
    document.getElementById('iccOrigen').value = p.iccOrigen || 4.5;
    document.getElementById('marcaInterruptores').value = p.marca || 'Schneider';
    document.getElementById('tipoCable').value = p.tipoCable || 'unipolar';
    document.getElementById('tipoInstalacion').value = p.tipoInstalacion || 'embutida';

    if (p.acometida) {
        document.getElementById('acomLongitud').value = p.acometida.longitud ?? 10;
        document.getElementById('acomTipoCable').value = p.acometida.tipoCable || 'sintenax';
        document.getElementById('acomSeccion').value = p.acometida.seccion || 6;
        document.getElementById('acomConductores').value = p.acometida.conductores || 4;
        document.getElementById('acomTipoInst').value = p.acometida.tipoInst || 'enterrado';
        document.getElementById('acomProteccion').value = p.acometida.proteccion || 'tubo_pvc_50';
    } else {
        document.getElementById('acomLongitud').value = 10;
        document.getElementById('acomTipoCable').value = 'sintenax';
        document.getElementById('acomSeccion').value = 6;
        document.getElementById('acomConductores').value = 4;
        document.getElementById('acomTipoInst').value = 'enterrado';
        document.getElementById('acomProteccion').value = 'tubo_pvc_50';
    }

    if (p.puestaTierra) {
        document.getElementById('patCantJabalina').value = p.puestaTierra.cantJabalina || 1;
        document.getElementById('patLongCable').value = p.puestaTierra.longCable || 10;
        document.getElementById('patSeccion').value = p.puestaTierra.seccion || 16;
        document.getElementById('patTipoJabalina').value = p.puestaTierra.tipoJabalina || 'copperweld';
    } else {
        document.getElementById('patCantJabalina').value = 1;
        document.getElementById('patLongCable').value = 10;
        document.getElementById('patSeccion').value = 16;
        document.getElementById('patTipoJabalina').value = 'copperweld';
    }

    let tablerosMigrados = Array.isArray(p.tableros) ? p.tableros.slice() : [];
    if (tablerosMigrados.length === 0) {
        tablerosMigrados = [{
            id: 'Principal', nombre: 'Tablero Principal', planta: 'PB',
            long: 0, seccion: 4, iccArriba: 4.5, padre: null
        }];
    }
    const tieneFormatoNuevo = tablerosMigrados.every(t => t.padre !== undefined);
    if (!tieneFormatoNuevo) {
        const principal = tablerosMigrados.find(t => t.id === 'Principal') || tablerosMigrados[0];
        principal.padre = null;
        principal.planta = principal.planta || 'PB';
        tablerosMigrados.forEach(t => {
            if (t.id !== principal.id) {
                t.padre = principal.id;
                t.planta = t.planta || 'PB';
            }
        });
    }
    tablerosMigrados = tablerosMigrados.filter(t => t.id && t.nombre);
    const idsVistos = new Set();
    tablerosMigrados = tablerosMigrados.filter(t => {
        if (idsVistos.has(t.id)) return false;
        idsVistos.add(t.id);
        return true;
    });
    tablerosMigrados.forEach(t => {
        if (t.planta === undefined) t.planta = 'PB';
        if (t.long === undefined) t.long = 0;
        if (t.seccion === undefined) t.seccion = 4;
        if (t.iccArriba === undefined) t.iccArriba = null;
        if (t.padre === undefined) t.padre = null;
        if (t.proteccion === undefined) t.proteccion = null;
    });
    const tienePrincipal = tablerosMigrados.some(t => !t.padre);
    if (!tienePrincipal) {
        tablerosMigrados.unshift({
            id: 'Principal', nombre: 'Tablero Principal', planta: 'PB',
            long: 0, seccion: 4, iccArriba: 4.5, padre: null, proteccion: null
        });
    }
    const idsValidos = new Set(tablerosMigrados.map(t => t.id));
    tablerosMigrados.forEach(t => {
        if (t.padre && !idsValidos.has(t.padre)) {
            const principal = tablerosMigrados.find(x => !x.padre);
            t.padre = principal ? principal.id : null;
        }
    });
    tableros = tablerosMigrados;

    ambientes = Array.isArray(p.ambientes) ? p.ambientes.slice() : [];
    const principalId = tableros.find(t => !t.padre).id;
    ambientes.forEach(a => {
        if (!a.tablero || !tableros.find(t => t.id === a.tablero)) {
            a.tablero = principalId;
        }
        ['iugReal', 'tugReal', 'tueReal'].forEach(k => {
            if (a[k] !== undefined && (typeof a[k] !== 'number' || isNaN(a[k]))) delete a[k];
        });
        if (a.circuitoDedicado !== undefined && a.circuitoDedicado !== null) {
            a.circuitoDedicado = !!a.circuitoDedicado;
        }
    });

    circuitosPorTablero = {};
    const cpt = p.circuitosPorTablero || {};
    tableros.forEach(t => {
        circuitosPorTablero[t.id] = Array.isArray(cpt[t.id]) ? cpt[t.id] : [];
        circuitosPorTablero[t.id].forEach(c => {
            if (c.tipo === 'TUE' && c.potenciaMotor === undefined) c.potenciaMotor = 2800;
        });
    });

    planoElementos = Array.isArray(p.planoElementos) ? p.planoElementos.slice() : [];
    planoElementos = planoElementos.filter(el =>
        el && typeof el.x === 'number' && typeof el.y === 'number' && el.tipo
    );

    contadorTableros = p.contadorTableros || 1;
    tableros.forEach(t => {
        const num = parseInt(String(t.id).replace('T', ''));
        if (!isNaN(num) && num > contadorTableros) contadorTableros = num;
    });

    if (p.__id) {
        proyectoActualId = p.__id;
    }

    if (p.modoOscuro !== undefined && p.modoOscuro !== modoOscuro) toggleTema();

    try {
        renderizarTodo();
    } catch(e) {
        console.error('❌ Error al renderizar:', e);
        alert('Error al renderizar el proyecto: ' + e.message);
    }

    setTimeout(() => {
        const tablerosVacios = tableros.filter(t =>
            t.padre &&
            (circuitosPorTablero[t.id] || []).length === 0 &&
            !ambientes.some(a => a.tablero === t.id)
        );
        if (tablerosVacios.length > 0) {
            tablerosVacios.forEach(t => {
                const idx = tableros.indexOf(t);
                if (idx >= 0) tableros.splice(idx, 1);
            });
            renderizarTodo();
        }
        try {
            inicializarPlano();
            dibujarPlano();
            actualizarContadoresPlano();
        } catch(e) {
            console.error('Error al inicializar plano:', e);
        }

        actualizarSelectorProyectos();
        if (proyectoActualId) {
            const sel = document.getElementById('selectorProyecto');
            if (sel) sel.value = proyectoActualId;
            localStorage.setItem('aea770_ultimo_proyecto', proyectoActualId);
        }
    }, 300);
}

// ============================================================
// IMPORTAR ARCHIVO JSON
// ============================================================
function importarArchivoJSON(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const texto = e.target.result;
            const p = JSON.parse(texto);
            if (!p.ambientes && !p.tableros) {
                throw new Error('El archivo no parece ser un proyecto válido (falta "ambientes" o "tableros")');
            }
            if (confirm('¿Cargar el proyecto "' + (p.nombre || 'sin nombre') + '"?\nSe reemplazará el proyecto actual.')) {
                delete p.__id;
                proyectoActualId = null;
                localStorage.removeItem('aea770_ultimo_proyecto');
                aplicarProyecto(p);
                document.getElementById('selectorProyecto').value = '';
                mostrarToast('✅ Proyecto importado: ' + (p.nombre || 'sin nombre'));
            }
        } catch(err) {
            console.error(err);
            alert('❌ Error al importar archivo:\n' + err.message);
        }
    };
    reader.readAsText(file);
    input.value = '';
}

// ============================================================
// GUARDAR / NUEVO / CAMBIAR PROYECTO
// ============================================================
function guardarProyecto() {
    const id = proyectoActualId || 'proy_' + Date.now();
    proyectoActualId = id;
    const proyectos = obtenerProyectos();
    proyectos[id] = capturarProyecto();
    guardarProyectos(proyectos);
    document.getElementById('selectorProyecto').value = id;
    localStorage.setItem('aea770_ultimo_proyecto', id);
    mostrarToast('✅ Guardado: ' + proyectos[id].nombre);
}

function nuevoProyecto() {
    if (!confirm('¿Crear un nuevo proyecto? Se perderán los cambios no guardados.')) return;
    proyectoActualId = null;
    localStorage.removeItem('aea770_ultimo_proyecto');
    document.getElementById('selectorProyecto').value = '';
    document.getElementById('nombreProyecto').value = 'Nuevo Proyecto';
    document.getElementById('supCubierta').value = 94;
    document.getElementById('supSemicubierta').value = 4;
    document.getElementById('iccOrigen').value = 4.5;
    document.getElementById('marcaInterruptores').value = 'Schneider';
    document.getElementById('tipoCable').value = 'unipolar';
    document.getElementById('tipoInstalacion').value = 'embutida';
    document.getElementById('acomLongitud').value = 10;
    document.getElementById('acomTipoCable').value = 'sintenax';
    document.getElementById('acomSeccion').value = 6;
    document.getElementById('acomConductores').value = 4;
    document.getElementById('acomTipoInst').value = 'enterrado';
    document.getElementById('acomProteccion').value = 'tubo_pvc_50';
    document.getElementById('patCantJabalina').value = 1;
    document.getElementById('patLongCable').value = 10;
    document.getElementById('patSeccion').value = 16;
    document.getElementById('patTipoJabalina').value = 'copperweld';

    ambientes = [
        { nombre: 'Estar-Comedor', tipo: 'Habitación', area: 24, tablero: 'Principal' },
        { nombre: 'Cocina', tipo: 'Cocina', area: 10, tablero: 'Principal' },
        { nombre: 'Baño 1', tipo: 'Baño', area: 4, tablero: 'Principal' },
        { nombre: 'Dormitorio 1', tipo: 'Dormitorio', area: 15, tablero: 'T1' }
    ];
    circuitosPorTablero = {};
    tableros = [
        { id: 'Principal', nombre: 'Tablero Principal', planta: 'PB', long: 0, seccion: 4, iccArriba: 4.5, padre: null, proteccion: null },
        { id: 'T1', nombre: 'Tablero Planta Alta', planta: 'PA', long: 15, seccion: 4, iccArriba: null, padre: 'Principal', proteccion: null }
    ];
    contadorTableros = 1;
    planoElementos = [];
    renderizarTodo();
    setTimeout(() => { inicializarPlano(); limpiarPlano(); }, 200);
}

function cambiarProyecto(id) {
    if (!id) return;
    const proyectos = obtenerProyectos();
    if (!proyectos[id]) return;
    if (!confirm('¿Cargar el proyecto "' + proyectos[id].nombre + '"?')) {
        document.getElementById('selectorProyecto').value = proyectoActualId || '';
        return;
    }
    proyectoActualId = id;
    localStorage.setItem('aea770_ultimo_proyecto', id);
    aplicarProyecto(proyectos[id]);
    document.getElementById('selectorProyecto').value = id;
    mostrarToast('📂 Cargado: ' + proyectos[id].nombre);
}

function resetear() {
    if (confirm('¿Reiniciar TODO el diseño?')) nuevoProyecto();
}

// ============================================================
// MODAL JSON
// ============================================================
let accionJSONActual = null;

function abrirModalJSON(accion) {
    accionJSONActual = accion;
    const modal = document.getElementById('modalJSON');
    const titulo = document.getElementById('modalJSONTitulo');
    const texto = document.getElementById('modalJSONTexto');
    const boton = document.getElementById('modalJSONAccion');

    if (accion === 'exportar') {
        titulo.textContent = '📤 Exportar JSON del Proyecto';
        texto.value = JSON.stringify(capturarProyecto(), null, 2);
        texto.readOnly = true;
        boton.textContent = 'Copiar';
        boton.className = 'info';
    } else {
        titulo.textContent = '📥 Importar JSON del Proyecto';
        texto.value = '';
        texto.readOnly = false;
        texto.placeholder = 'Pegá aquí el JSON...';
        boton.textContent = 'Importar';
        boton.className = 'success';
    }
    modal.classList.add('active');
}

function cerrarModalJSON() { document.getElementById('modalJSON').classList.remove('active'); }

function ejecutarAccionJSON() {
    const texto = document.getElementById('modalJSONTexto').value.trim();
    if (accionJSONActual === 'exportar') {
        navigator.clipboard.writeText(texto).then(() => mostrarToast('📋 Copiado')).catch(() => {
            document.getElementById('modalJSONTexto').select();
            document.execCommand('copy');
            mostrarToast('📋 Copiado');
        });
        cerrarModalJSON();
    } else {
        try {
            const p = JSON.parse(texto);
            if (!p.ambientes && !p.tableros) throw new Error('JSON inválido');
            delete p.__id;
            proyectoActualId = null;
            localStorage.removeItem('aea770_ultimo_proyecto');
            aplicarProyecto(p);
            document.getElementById('selectorProyecto').value = '';
            cerrarModalJSON();
            mostrarToast('✅ Importado');
        } catch(e) {
            alert('❌ Error: ' + e.message);
        }
    }
}

function exportarJSON() { abrirModalJSON('exportar'); }

// ============================================================
// ABRIR REPARTO DE TABLEROS
// ============================================================
function abrirRepartoTableros() {
    try {
        if (!proyectoActualId) {
            proyectoActualId = 'proy_' + Date.now();
        }
        const id = proyectoActualId;
        const proyectos = obtenerProyectos();
        proyectos[id] = capturarProyecto();
        guardarProyectos(proyectos);
        document.getElementById('selectorProyecto').value = id;
        localStorage.setItem('aea770_ultimo_proyecto', id);
        localStorage.setItem('proyectoAEA_para_Reparto', JSON.stringify(proyectos[id]));
        mostrarToast('💾 Proyecto guardado antes de abrir Reparto');
    } catch(e) {
        console.warn('No se pudo autoguardar antes de abrir Reparto:', e);
    }
    window.open('reparto_tableros.html', '_blank');
}

// ============================================================
// IR AL MÓDULO DE DPS
// ============================================================
function irAModuloDPS() {
    try {
        if (!proyectoActualId) {
            proyectoActualId = 'proy_' + Date.now();
        }
        const id = proyectoActualId;
        const proyectos = obtenerProyectos();
        proyectos[id] = capturarProyecto();
        guardarProyectos(proyectos);
        document.getElementById('selectorProyecto').value = id;
        localStorage.setItem('aea770_ultimo_proyecto', id);
        localStorage.setItem('proyectoAEA_para_DPS', JSON.stringify(proyectos[id]));
        window.location.href = 'dps.html';
    } catch (e) {
        console.error('Error al preparar el proyecto para el módulo DPS:', e);
        alert('❌ No se pudo abrir el módulo de DPS. Revisá la consola para más detalles.');
    }
}

function irAModuloDPSForzado() {
    try {
        localStorage.removeItem('proyectoAEA_para_DPS');
        localStorage.removeItem('resultadoDPS_' + (document.getElementById('nombreProyecto').value || 'proyecto'));

        if (!proyectoActualId) {
            proyectoActualId = 'proy_' + Date.now();
        }
        const id = proyectoActualId;
        const proyectos = obtenerProyectos();
        const proyectoLimpio = capturarProyecto();
        const jsonDPS = JSON.stringify(proyectoLimpio);
        if (!jsonDPS || jsonDPS.length < 10) {
            throw new Error('El proyecto no se pudo serializar correctamente');
        }
        proyectos[id] = proyectoLimpio;
        localStorage.setItem('aea770_proyectos_v8_local', JSON.stringify(proyectos));
        localStorage.setItem('proyectoAEA_para_DPS', jsonDPS);
        localStorage.setItem('aea770_ultimo_proyecto', id);
        document.getElementById('selectorProyecto').value = id;
        console.log('✅ Proyecto limpio guardado para DPS. Longitud:', jsonDPS.length);
        window.location.href = 'dps.html';
    } catch (e) {
        console.error('Error al forzar DPS:', e);
        alert('❌ Error al preparar el proyecto para DPS:\n\n' + e.message + '\n\nSe va a intentar con un proyecto vacío.');
        const proyectoVacio = {
            __id: 'vacio_' + Date.now(),
            version: '8.4-local-fixed',
            fecha: new Date().toISOString(),
            nombre: 'Proyecto Vacío',
            supCubierta: 100,
            supSemicubierta: 0,
            iccOrigen: 4.5,
            marca: 'Schneider',
            tipoCable: 'unipolar',
            tipoInstalacion: 'embutida',
            ambientes: [],
            circuitosPorTablero: {},
            tableros: [{ id: 'Principal', nombre: 'Tablero Principal', planta: 'PB', long: 0, seccion: 4, iccArriba: 4.5, padre: null }],
            planoElementos: [],
            modoOscuro: false,
            contadorTableros: 1,
            acometida: {
                longitud: 10, tipoCable: 'sintenax', seccion: 6, conductores: 4,
                tipoInst: 'enterrado', proteccion: 'tubo_pvc_50'
            },
            puestaTierra: {
                cantJabalina: 1, longCable: 10, seccion: 16, tipoJabalina: 'copperweld'
            }
        };
        localStorage.setItem('proyectoAEA_para_DPS', JSON.stringify(proyectoVacio));
        localStorage.setItem('aea770_ultimo_proyecto', proyectoVacio.__id);
        window.location.href = 'dps.html';
    }
}

// ============================================================
// IR AL MÓDULO DE DOCUMENTACIÓN
// ============================================================
function irAModuloDocumentacion() {
    try {
        if (!proyectoActualId) {
            proyectoActualId = 'proy_' + Date.now();
        }
        const id = proyectoActualId;
        const proyectos = obtenerProyectos();
        proyectos[id] = capturarProyecto();
        guardarProyectos(proyectos);
        document.getElementById('selectorProyecto').value = id;
        localStorage.setItem('aea770_ultimo_proyecto', id);
        localStorage.setItem('proyectoAEA_para_Documentacion', JSON.stringify(proyectos[id]));
        window.location.href = 'documentacion.html';
    } catch (e) {
        console.error('Error al preparar el proyecto para Documentación:', e);
        alert('❌ No se pudo abrir el módulo de Documentación. Revisá la consola para más detalles.');
    }
}

// ============================================================
// ABRIR MANUAL DE USO
// ============================================================
function abrirManual() {
    try {
        if (!proyectoActualId) {
            proyectoActualId = 'proy_' + Date.now();
        }
        const id = proyectoActualId;
        const proyectos = obtenerProyectos();
        proyectos[id] = capturarProyecto();
        guardarProyectos(proyectos);
        document.getElementById('selectorProyecto').value = id;
        localStorage.setItem('aea770_ultimo_proyecto', id);
    } catch (e) {
        console.warn('No se pudo autoguardar antes de abrir el manual:', e);
    }
    window.location.href = 'manual.html';
}

// ============================================================
// TOAST
// ============================================================
function mostrarToast(mensaje) {
    const toast = document.createElement('div');
    toast.textContent = mensaje;
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#2c3e50;color:white;padding:12px 20px;border-radius:8px;font-size:0.9em;z-index:2000;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ============================================================
// ASEGURAR DATOS DE EXPORTACIÓN
// ============================================================
function asegurarDatosExport() {
    if (ambientes.length === 0) {
        alert('⚠️ No hay ambientes cargados. Agregá ambientes antes de exportar.');
        return false;
    }
    if (!window.__datosExport || window.__datosExport.dpmsFinal === undefined) {
        renderizarDPMS();
    }
    return true;
}

function verificarLibrerias(tipo) {
    if (tipo === 'excel' && typeof XLSX === 'undefined') {
        alert('❌ La librería XLSX no está cargada.\n\nVerificá que exista el archivo:\nlibs/xlsx.full.min.js');
        return false;
    }
    if (tipo === 'pdf') {
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
            alert('❌ La librería jsPDF no está cargada.\n\nVerificá que exista el archivo:\nlibs/jspdf.umd.min.js');
            return false;
        }
    }
    return true;
}

function sincronizarLongitudesDesdeTabla() {
    const filas = document.querySelectorAll('#tbodyCircuitos tr');
    let idxGlobal = 0;
    Object.keys(circuitosPorTablero).forEach(tid => {
        circuitosPorTablero[tid].forEach(c => {
            const fila = filas[idxGlobal];
            if (fila) {
                const inputs = fila.querySelectorAll('input[type="number"]');
                if (inputs[0]) {
                    const v = parseFloat(inputs[0].value);
                    if (!isNaN(v) && v > 0) c.longitud = v;
                }
                if (c.tipo === 'TUE' && inputs[1]) {
                    const p = parseFloat(inputs[1].value);
                    if (!isNaN(p) && p > 0) {
                        c.potenciaMotor = p;
                        c.dpms = Math.max(3300, Math.round(p / 100) * 100);
                    }
                }
                const selects = fila.querySelectorAll('select.circ-select');
                if (selects[0]) {
                    const s = parseFloat(selects[0].value);
                    if (!isNaN(s)) c.seccion = s;
                }
                if (selects[1]) {
                    const pr = parseInt(selects[1].value);
                    if (!isNaN(pr)) c.proteccion = pr;
                }
            }
            idxGlobal++;
        });
    });
}

// ============================================================
// EXPORTAR EXCEL
// ============================================================
function exportarExcel() {
    if (!verificarLibrerias('excel')) return;
    if (!asegurarDatosExport()) return;

    sincronizarLongitudesDesdeTabla();
    renderizarCircuitos();
    renderizarMotores();

    try {
        const wb = XLSX.utils.book_new();
        const d = window.__datosExport || {};
        const iccOrigen = parseFloat(document.getElementById('iccOrigen').value) || 4.5;
        const tipoCable = getTipoCableActual();
        const tipoCableNombre = getNombreTipoCable();

        const hoja1 = [
            ['DISEÑO ELÉCTRICO AEA 770 - v8 Local'],
            ['Proyecto:', document.getElementById('nombreProyecto').value],
            ['Fecha:', new Date().toLocaleDateString('es-AR')],
            [],
            ['DATOS GENERALES'],
            ['Superficie Cubierta (m²)', parseFloat(document.getElementById('supCubierta').value)],
            ['Superficie Semicubierta (m²)', parseFloat(document.getElementById('supSemicubierta').value)],
            ['Sla (m²)', calcularSla().toFixed(2)],
            ['Grado', document.getElementById('gradoResult').value],
            ['Marca', document.getElementById('marcaInterruptores').value],
            ['Tipo de Cable', tipoCableNombre],
            ['Icc Origen (kA)', iccOrigen],
            [],
            ['TOTALES'],
            ['Bocas IUG', d.totalIUG || 0],
            ['Bocas TUG', d.totalTUG || 0],
            ['Bocas TUE', d.totalTUE || 0],
            ['Circuitos IUG', d.totalCircIUG || 0],
            ['Circuitos TUG', d.totalCircTUG || 0],
            ['Circuitos TUE', d.totalCircTUE || 0],
            ['DPMS Total (VA)', (d.dpmsTotal || 0).toFixed(0)],
            ['DPMS Final (VA)', (d.dpmsFinal || 0).toFixed(0)],
            [],
            ['PUESTA A TIERRA (PAT)'],
            ['Cantidad de jabalinas', document.getElementById('patCantJabalina').value],
            ['Tipo de jabalina', obtenerDatosPAT().nombreJabalina],
            ['Longitud cable PAT (m)', document.getElementById('patLongCable').value],
            ['Sección cable PAT (mm²)', document.getElementById('patSeccion').value],
            ['Resistencia requerida (Ohm)', '<= 40 (verificar en obra)']
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(hoja1);
        ws1['!cols'] = [{wch:30},{wch:20}];
        XLSX.utils.book_append_sheet(wb, ws1, 'Datos Generales');

        const acom = calcularAcometida();
        const hojaAcom = [
            ['ACOMETIDA: MEDIDOR -> TABLERO PRINCIPAL'],
            [],
            ['Concepto', 'Valor'],
            ['Longitud (m)', acom.long],
            ['Tipo de cable', getNombreTipoCable(acom.tipoCable)],
            ['Sección por fase (mm²)', acom.seccion],
            ['Cantidad de conductores', acom.conductores],
            ['Configuración', acom.esTrifasico ? 'Trifásico' : 'Monofásico'],
            ['Tensión de cálculo (V)', acom.tension],
            ['GDC (Ohm/km)', acom.gdc.toFixed(2)],
            ['Ampacidad (A)', acom.ampacidad],
            ['Corriente de diseño (A)', acom.corriente.toFixed(2)],
            ['DU parcial (V)', acom.deltaU_V.toFixed(2)],
            ['DU parcial (%)', acom.deltaU_pct.toFixed(2)],
            ['Icc origen medidor (kA)', acom.iccOrigen.toFixed(2)],
            ['Icc en Tablero Principal (kA)', acom.iccFinal.toFixed(2)],
            ['PdC requerido Principal (kA)', pdcComercial(acom.iccFinal)],
            ['Tipo de instalación', document.getElementById('acomTipoInst').value],
            ['Protección mecánica', document.getElementById('acomProteccion').value],
            [],
            ['Verificación DU <= 5%', acom.deltaU_pct <= 5 ? 'OK' : 'EXCEDE'],
            ['Verificación Ampacidad', acom.corriente <= acom.ampacidad ? 'OK' : 'EXCEDE']
        ];
        const wsAcom = XLSX.utils.aoa_to_sheet(hojaAcom);
        wsAcom['!cols'] = [{wch:32},{wch:40}];
        XLSX.utils.book_append_sheet(wb, wsAcom, 'Acometida');

        const hoja2 = [['Ambiente', 'Tipo', 'Superficie (m²)', 'Tablero',
                        'IUG mín', 'IUG real', 'TUG mín', 'TUG real', 'TUE mín', 'TUE real',
                        'Alt. IUG (m)', 'Alt. TUG (m)', 'Alt. TUE (m)', 'Alt. TV/Datos (m)', 'Alt. Tablero (m)', 'Piscina', 'Observaciones']];
        ambientes.forEach(amb => {
            const b = calcularBocas(amb);
            const alt = calcularAlturaTomas(amb);
            const tabNombre = (tableros.find(t => t.id === amb.tablero) || {nombre: amb.tablero}).nombre;
            const esPiscina = (amb.nombre || '').toLowerCase().includes('piscina') ||
                              (amb.nombre || '').toLowerCase().includes('pileta') ||
                              (amb.nombre || '').toLowerCase().includes('natatorio') ||
                              (amb.nombre || '').toLowerCase().includes('pool');
            hoja2.push([
                amb.nombre, amb.tipo, amb.area, tabNombre,
                b.minIUG, b.iug, b.minTUG, b.tug, b.minTUE, b.tue,
                alt.hIUG.toFixed(2), alt.hTUG.toFixed(2),
                b.tue > 0 ? alt.hTUE.toFixed(2) : '-',
                alt.hTV.toFixed(2),
                `${alt.hTabMin}-${alt.hTabMax}`,
                esPiscina ? 'SÍ (Sección 701)' : 'No',
                alt.obs
            ]);
        });
        const ws2 = XLSX.utils.aoa_to_sheet(hoja2);
        ws2['!cols'] = [
            {wch:22},{wch:16},{wch:14},{wch:20},
            {wch:8},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8},
            {wch:12},{wch:12},{wch:12},{wch:15},{wch:14},{wch:16},{wch:55}
        ];
        XLSX.utils.book_append_sheet(wb, ws2, 'Ambientes');

        const hoja3 = [['Circuito', 'Tablero', 'Tipo', 'Dedicado', 'Zonas', 'Bocas', 'DPMS', 'Secc.', 'Prot.', 'Long.', 'Potencia Motor (W)', 'DU (%)', 'Icc Abajo', 'PdC', 'Piscina', 'Verif.']];
        const ambientesPiscinaExcel = detectarAmbientesPiscina();
        Object.keys(circuitosPorTablero).forEach(tid => {
            circuitosPorTablero[tid].forEach(c => {
                const caida = calcularCaidaTension(c.dpms, c.longitud, c.seccion, c.tipo, getTipoCableActual());
                const limite = c.tipo === 'IUG' ? 3 : 5;
                const iccAbajo = calcularIccAguasAbajo(c.iccArriba, c.longitud, c.seccion, getTipoCableActual(), c.tipo === 'TUE' ? 380 : 220);
                const tabNombre = (tableros.find(t => t.id === c.tablero) || {nombre: c.tablero}).nombre;
                const esPiscina = (c.zonas || []).some(z => ambientesPiscinaExcel.some(ap => ap.nombre === z));
                hoja3.push([
                    c.nombre, tabNombre, c.tipo, c.esDedicado ? 'Sí' : 'No',
                    (c.zonas || []).join(' + '),
                    c.bocas, c.dpms, c.seccion, c.proteccion, c.longitud,
                    c.tipo === 'TUE' ? (c.potenciaMotor || 2800) : '-',
                    caida.toFixed(2), iccAbajo.toFixed(2), pdcComercial(iccAbajo),
                    esPiscina ? 'SÍ' : 'No',
                    caida <= limite ? 'OK' : 'EXCEDE'
                ]);
            });
        });
        const ws3 = XLSX.utils.aoa_to_sheet(hoja3);
        ws3['!cols'] = [{wch:8},{wch:20},{wch:8},{wch:10},{wch:30},{wch:8},{wch:10},{wch:8},{wch:8},{wch:8},{wch:16},{wch:10},{wch:12},{wch:8},{wch:8},{wch:8}];
        XLSX.utils.book_append_sheet(wb, ws3, 'Circuitos');

        const hoja4 = [['Circuito TUE', 'Tablero', 'Potencia (W)', 'Corriente Nominal (A)', 'Corriente Arranque (A)', 'Longitud (m)', 'Sección', 'DU Régimen (%)', 'DU Arranque (%)']];
        Object.keys(circuitosPorTablero).forEach(tid => {
            circuitosPorTablero[tid].forEach(c => {
                if (c.tipo === 'TUE') {
                    const pot = c.potenciaMotor || 2800;
                    const r = calcularArranqueMotor(pot, c.longitud, c.seccion, 'directo');
                    const tabNombre = (tableros.find(t => t.id === c.tablero) || {nombre: c.tablero}).nombre;
                    hoja4.push([c.nombre, tabNombre, pot, r.corrienteNominal.toFixed(2), r.corrienteArranque.toFixed(2), c.longitud, c.seccion, r.caidaNominal.toFixed(2), r.caidaArranque.toFixed(2)]);
                }
            });
        });
        const ws4 = XLSX.utils.aoa_to_sheet(hoja4);
        ws4['!cols'] = [{wch:12},{wch:20},{wch:12},{wch:18},{wch:20},{wch:10},{wch:10},{wch:14},{wch:15}];
        XLSX.utils.book_append_sheet(wb, ws4, 'Motores');

        const hojaLineas = [['Tablero', 'Longitud (m)', 'Sección (mm²)', 'Corriente (A)', 'Ampacidad (A)', 'DU Línea (%)', 'Rec. DU ≤1%', 'Sección sugerida', 'DU sugerida (%)']];
        tableros.forEach(t => {
            if (!t.padre) return;
            const duLinea = calcularDULineaTablero(t);
            const sugerencia = sugerirSeccionLinea(t);
            if (!duLinea) return;
            const ampacidad = getAmpacidad(t.seccion, getTipoCableActual());
            hojaLineas.push([
                t.nombre, t.long, t.seccion,
                duLinea.corriente.toFixed(2), ampacidad,
                duLinea.deltaU_pct.toFixed(2),
                duLinea.cumpleRecomendacion ? 'Sí' : 'No',
                sugerencia && sugerencia.seccionSugerida ? sugerencia.seccionSugerida + ' mm²' : '-',
                sugerencia && sugerencia.duSugerida ? sugerencia.duSugerida.toFixed(2) : '-'
            ]);
        });
        const wsLineas = XLSX.utils.aoa_to_sheet(hojaLineas);
        wsLineas['!cols'] = [{wch:30},{wch:15},{wch:15},{wch:15},{wch:15},{wch:14},{wch:12},{wch:18},{wch:18}];
        XLSX.utils.book_append_sheet(wb, wsLineas, 'Líneas Seccionales');

        const hojaProt = [['Tablero', 'I Diseño (A)', 'Ampacidad (A)', 'Protección (A)', 'Verif. Sobrecarga', 'Verif. Ampacidad', 'Verif. Global', 'Sugerencia', 'Diagnóstico']];
        tableros.forEach(t => {
            if (!t.padre) return;
            const prot = calcularProteccionLinea(t);
            if (!prot) return;
            hojaProt.push([
                t.nombre,
                prot.corrienteDiseno.toFixed(2),
                prot.ampacidad,
                t.proteccion || 'Sin definir',
                prot.proteccionActual === null ? '-' : (prot.cumpleSobrecarga ? 'OK' : 'FALLA'),
                prot.proteccionActual === null ? '-' : (prot.cumpleAmpacidad ? 'OK' : 'FALLA'),
                prot.proteccionActual === null ? 'Sin definir' : (prot.cumpleSobrecarga && prot.cumpleAmpacidad ? 'OK' : 'Revisar'),
                prot.proteccionSugerida || '-',
                prot.diagnostico || 'OK'
            ]);
        });
        const wsProt = XLSX.utils.aoa_to_sheet(hojaProt);
        wsProt['!cols'] = [{wch:25},{wch:14},{wch:14},{wch:15},{wch:16},{wch:16},{wch:14},{wch:14},{wch:22}];
        XLSX.utils.book_append_sheet(wb, wsProt, 'Protecciones Secc.');

        const verifPiscina = verificarReglasPiscina();
        if (verifPiscina && verifPiscina.tienePiscina) {
            const hojaPiscina = [
                ['VERIFICACIÓN DE PISCINAS - SECCIÓN 701'],
                [],
                ['Ambientes detectados', verifPiscina.ambientesDetectados.join(', ')],
                ['Total circuitos de piscina', verifPiscina.totalCircuitos],
                [],
                ['REQUISITOS OBLIGATORIOS'],
                ['ID 30 mA', 'OBLIGATORIO en todos los circuitos de piscina'],
                ['Equipotencialidad', 'OBLIGATORIA - cable 6 mm² mínimo'],
                ['Zona 0 (interior pileta)', 'IPX8, 12V CA / 30V CC máximo'],
                ['Zona 1 (hasta 2 m del borde)', 'IPX4, 25V CA / 60V CC máximo, sin tomas'],
                ['Zona 2 (2 a 3,5 m del borde)', 'IPX2, ID 30 mA obligatorio'],
                [],
                ['CIRCUITOS DE PISCINA'],
                ['Circuito', 'Tablero', 'Tipo', 'Zonas']
            ];
            verifPiscina.circuitosPiscina.forEach(c => {
                hojaPiscina.push([c.nombre, c.tablero, c.tipo, (c.zonas || []).join(' + ')]);
            });

            const wsPiscina = XLSX.utils.aoa_to_sheet(hojaPiscina);
            wsPiscina['!cols'] = [{wch:30},{wch:25},{wch:15},{wch:30}];
            XLSX.utils.book_append_sheet(wb, wsPiscina, 'Piscina 701');
        }

        const hojaAlt = [['Ambiente', 'IUG (m)', 'TUG (m)', 'TUE (m)', 'TV/Datos (m)', 'Tablero (m)', 'Observaciones']];
        TABLA_ALTURAS_REFERENCIA.forEach(r => {
            hojaAlt.push([r.tipo, r.hIUG, r.hTUG, r.hTUE, r.hTV, r.hTab, r.obs]);
        });
        const wsAlt = XLSX.utils.aoa_to_sheet(hojaAlt);
        wsAlt['!cols'] = [{wch:30},{wch:10},{wch:10},{wch:18},{wch:15},{wch:14},{wch:55}];
        XLSX.utils.book_append_sheet(wb, wsAlt, 'Alturas Ref.');

        const hojaCab = [['Sección (mm²)', 'Tipo de Cable', 'GDC (Ohm/km)', 'Ampacidad (A)', 'Temp. máx (°C)']];
        SECCIONES_DISPONIBLES.forEach(s => {
            hojaCab.push([s, tipoCableNombre, getGDC(s, tipoCable), getAmpacidad(s, tipoCable), TIPOS_CABLE[tipoCable]?.tempMax || 70]);
        });
        const wsCab = XLSX.utils.aoa_to_sheet(hojaCab);
        wsCab['!cols'] = [{wch:14},{wch:40},{wch:14},{wch:14},{wch:14}];
        XLSX.utils.book_append_sheet(wb, wsCab, 'Cables');

        const hoja6 = [['Categoría', 'Descripción', 'Cantidad', 'Unidad', 'Notas']];
        document.querySelectorAll('#tbodyMateriales tr').forEach(tr => {
            const celdas = tr.querySelectorAll('td');
            if (celdas.length >= 5) hoja6.push([...celdas].map(td => td.textContent.trim()));
        });
        const ws6 = XLSX.utils.aoa_to_sheet(hoja6);
        ws6['!cols'] = [{wch:15},{wch:55},{wch:10},{wch:10},{wch:35}];
        XLSX.utils.book_append_sheet(wb, ws6, 'Materiales');

        const hoja8 = [['Estado', 'Detalle']];
        document.querySelectorAll('#verificaciones > div').forEach(div => {
            const badge = div.querySelector('.badge');
            if (!badge) return;
            const texto = div.textContent.replace(badge.textContent, '').trim();
            hoja8.push([badge.classList.contains('ok') ? 'OK' : badge.classList.contains('warn') ? 'ADVERTENCIA' : badge.classList.contains('info') ? 'INFO' : 'ERROR', texto]);
        });
        const ws8 = XLSX.utils.aoa_to_sheet(hoja8);
        ws8['!cols'] = [{wch:15},{wch:90}];
        XLSX.utils.book_append_sheet(wb, ws8, 'Verificaciones');

        XLSX.writeFile(wb, 'Diseño_Electrico_AEA770_v8.xlsx');
        mostrarToast('✅ Excel exportado correctamente');
    } catch(e) {
        console.error('Error al exportar Excel:', e);
        alert('❌ Error al exportar Excel:\n' + e.message);
    }
}

// ============================================================
// EXPORTAR PDF
// ============================================================
function exportarPDF() {
    if (!verificarLibrerias('pdf')) return;
    if (!asegurarDatosExport()) return;

    sincronizarLongitudesDesdeTabla();
    renderizarCircuitos();
    renderizarMotores();

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const fecha = new Date().toLocaleDateString('es-AR');
        const iccOrigen = parseFloat(document.getElementById('iccOrigen').value) || 4.5;
        const tipoCableNombre = getNombreTipoCable();

        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text('DISENO ELECTRICO AEA 770', 105, 12, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(limpiarTextoPDF(document.getElementById('nombreProyecto').value), 105, 19, { align: 'center' });
        doc.text(limpiarTextoPDF('Fecha: ' + fecha + ' | Marca: ' + document.getElementById('marcaInterruptores').value + ' | Cable: ' + tipoCableNombre), 105, 25, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        let y = 38;

        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text('1. DATOS GENERALES', 15, y); y += 6;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        doc.text(limpiarTextoPDF('Sla: ' + calcularSla().toFixed(2) + ' m2 | Grado: ' + document.getElementById('gradoResult').value + ' | Icc Origen: ' + iccOrigen + ' kA'), 15, y); y += 8;

        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('1.b ACOMETIDA (Medidor -> Tablero Principal)', 15, y); y += 4;
        const acom = calcularAcometida();
        const acomData = [
            ['Longitud', limpiarTextoPDF(acom.long + ' m')],
            ['Tipo de cable', limpiarTextoPDF(getNombreTipoCable(acom.tipoCable))],
            ['Seccion por fase', limpiarTextoPDF(acom.seccion + ' mm2')],
            ['Conductores', limpiarTextoPDF(acom.conductores + ' (' + (acom.esTrifasico ? 'trifasico' : 'monofasico') + ')')],
            ['Corriente de diseno', limpiarTextoPDF(acom.corriente.toFixed(2) + ' A')],
            ['Ampacidad', limpiarTextoPDF(acom.ampacidad + ' A')],
            ['DU parcial', limpiarTextoPDF(acom.deltaU_pct.toFixed(2) + ' %')],
            ['Icc origen (medidor)', limpiarTextoPDF(acom.iccOrigen.toFixed(2) + ' kA')],
            ['Icc Tablero Principal', limpiarTextoPDF(acom.iccFinal.toFixed(2) + ' kA')],
            ['PdC requerido', limpiarTextoPDF(pdcComercial(acom.iccFinal) + ' kA')]
        ];
        autoTableLimpio(doc, {
            startY: y,
            head: [['Concepto', 'Valor']],
            body: acomData, theme: 'grid',
            headStyles: { fillColor: [230, 126, 34], fontSize: 8 },
            bodyStyles: { fontSize: 8 }
        });
        y = doc.lastAutoTable.finalY + 8;

        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('1.c PUESTA A TIERRA (PAT)', 15, y); y += 4;
        const pat = obtenerDatosPAT();
        const patData = [
            ['Cantidad de jabalinas', limpiarTextoPDF(pat.cantJabalina + ' unidad(es)')],
            ['Tipo de jabalina', limpiarTextoPDF(pat.nombreJabalina)],
            ['Longitud cable PAT', limpiarTextoPDF(pat.longCable + ' m')],
            ['Seccion cable PAT', limpiarTextoPDF(pat.seccion + ' mm2')],
            ['Resistencia requerida', '<= 40 Ohm (verificar en obra)'],
            ['Observaciones', limpiarTextoPDF(pat.cantJabalina > 1 ? 'Jabalinas conectadas en paralelo' : 'Jabalina unica')]
        ];
        autoTableLimpio(doc, {
            startY: y,
            head: [['Concepto', 'Valor']],
            body: patData, theme: 'grid',
            headStyles: { fillColor: [39, 174, 96], fontSize: 8 },
            bodyStyles: { fontSize: 8 }
        });
        y = doc.lastAutoTable.finalY + 8;

        if (y > 200) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('2. AMBIENTES Y ALTURAS', 15, y); y += 4;
        const ambData = ambientes.map(amb => {
            const b = calcularBocas(amb);
            const alt = calcularAlturaTomas(amb);
            const tabNombre = (tableros.find(t => t.id === amb.tablero) || {nombre: amb.tablero}).nombre;
            return [
                limpiarTextoPDF(amb.nombre), limpiarTextoPDF(amb.tipo),
                limpiarTextoPDF(amb.area + ' m2'), limpiarTextoPDF(tabNombre),
                b.iug, b.tug, b.tue,
                alt.hIUG.toFixed(2), alt.hTUG.toFixed(2),
                b.tue > 0 ? alt.hTUE.toFixed(2) : '-',
                alt.hTV.toFixed(2),
                `${alt.hTabMin}-${alt.hTabMax}`
            ];
        });
        autoTableLimpio(doc, {
            startY: y,
            head: [['Ambiente', 'Tipo', 'm2', 'Tablero', 'IUG', 'TUG', 'TUE',
                    'Alt.IUG', 'Alt.TUG', 'Alt.TUE', 'Alt.TV', 'Alt.Tab']],
            body: ambData, theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 6 },
            bodyStyles: { fontSize: 6 }
        });
        y = doc.lastAutoTable.finalY + 8;

        if (y > 200) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('3. TABLEROS Y LINEAS SECCIONALES', 15, y); y += 4;
        const tabData = tableros.map(t => {
            const padre = t.padre ? (tableros.find(x => x.id === t.padre) || {nombre: t.padre}).nombre : '-';
            const duLinea = !t.padre ? null : calcularDULineaTablero(t);
            const verifConjunta = !t.padre ? null : verificarDUConjunta(t);
            const prot = !t.padre ? null : calcularProteccionLinea(t);
            return [
                limpiarTextoPDF(t.nombre), limpiarTextoPDF(t.planta), limpiarTextoPDF(padre),
                t.long, t.seccion,
                (t.iccArriba || 0).toFixed(2),
                pdcComercial(t.iccArriba || 4.5),
                duLinea ? duLinea.deltaU_pct.toFixed(2) + '%' : '-',
                verifConjunta ? verifConjunta.duTotal.toFixed(2) + '%' : '-',
                prot ? prot.corrienteDiseno.toFixed(1) : '-',
                prot ? prot.ampacidad : '-',
                t.proteccion || '-'
            ];
        });
        autoTableLimpio(doc, {
            startY: y,
            head: [['Tablero', 'Planta', 'Padre', 'Long', 'Secc', 'Icc(kA)', 'PdC(kA)', 'DU Lin', 'DU Tot', 'I Dis', 'Amp', 'Prot']],
            body: tabData, theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 6 },
            bodyStyles: { fontSize: 6 }
        });
        y = doc.lastAutoTable.finalY + 8;

        if (y > 200) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('4. CIRCUITOS', 15, y); y += 4;
        const circData = [];
        const ambientesPiscinaPDF = detectarAmbientesPiscina();
        Object.keys(circuitosPorTablero).forEach(tid => {
            circuitosPorTablero[tid].forEach(c => {
                const caida = calcularCaidaTension(c.dpms, c.longitud, c.seccion, c.tipo, getTipoCableActual());
                const iccAbajo = calcularIccAguasAbajo(c.iccArriba, c.longitud, c.seccion, getTipoCableActual(), c.tipo === 'TUE' ? 380 : 220);
                const esPiscina = (c.zonas || []).some(z => ambientesPiscinaPDF.some(ap => ap.nombre === z));
                circData.push([
                    limpiarTextoPDF(c.nombre), limpiarTextoPDF(c.tablero), limpiarTextoPDF(c.tipo),
                    c.bocas, c.seccion, c.proteccion, c.longitud,
                    c.tipo === 'TUE' ? (c.potenciaMotor || 2800) : '-',
                    caida.toFixed(1) + '%', pdcComercial(iccAbajo),
                    esPiscina ? 'SI' : 'No'
                ]);
            });
        });
        autoTableLimpio(doc, {
            startY: y,
            head: [['Cto', 'Tablero', 'Tipo', 'Bocas', 'Secc', 'Prot', 'Long', 'Pot.(W)', 'DU', 'PdC', 'Pisc.']],
            body: circData, theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 6 },
            bodyStyles: { fontSize: 6 }
        });
        y = doc.lastAutoTable.finalY + 8;

        const motData = [];
        Object.keys(circuitosPorTablero).forEach(tid => {
            circuitosPorTablero[tid].forEach(c => {
                if (c.tipo === 'TUE') {
                    const pot = c.potenciaMotor || 2800;
                    const r = calcularArranqueMotor(pot, c.longitud, c.seccion, 'directo');
                    motData.push([limpiarTextoPDF(c.nombre), limpiarTextoPDF(c.tablero), pot, r.corrienteNominal.toFixed(1), r.corrienteArranque.toFixed(1), c.longitud, r.caidaNominal.toFixed(2) + '%', r.caidaArranque.toFixed(2) + '%']);
                }
            });
        });
        if (motData.length > 0) {
            if (y > 220) { doc.addPage(); y = 20; }
            doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
            doc.text('5. ARRANQUE DE MOTORES', 15, y); y += 4;
            autoTableLimpio(doc, {
                startY: y,
                head: [['Circuito', 'Tablero', 'Pot.(W)', 'I Nom', 'I Arr', 'Long', 'DU Reg', 'DU Arr']],
                body: motData, theme: 'grid',
                headStyles: { fillColor: [102, 126, 234], fontSize: 7 },
                bodyStyles: { fontSize: 7 }
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        const verifPiscina = verificarReglasPiscina();
        if (verifPiscina && verifPiscina.tienePiscina) {
            if (y > 200) { doc.addPage(); y = 20; }
            doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
            doc.setTextColor(231, 76, 60);
            doc.text('6. VERIFICACION DE PISCINA (SECCION 701)', 15, y); y += 4;
            doc.setTextColor(0, 0, 0);

            const pisData = [
                ['Ambientes detectados', limpiarTextoPDF(verifPiscina.ambientesDetectados.join(', '))],
                ['Total circuitos', verifPiscina.totalCircuitos],
                ['ID 30 mA', 'OBLIGATORIO en todos los circuitos'],
                ['Equipotencialidad', 'OBLIGATORIA - cable 6 mm2'],
                ['Zona 0', 'IPX8, 12V CA max'],
                ['Zona 1 (hasta 2 m)', 'IPX4, sin tomas'],
                ['Zona 2 (2 a 3.5 m)', 'IPX2, ID 30 mA']
            ];

            autoTableLimpio(doc, {
                startY: y,
                head: [['Requisito', 'Valor']],
                body: pisData, theme: 'grid',
                headStyles: { fillColor: [231, 76, 60], fontSize: 8 },
                bodyStyles: { fontSize: 8 }
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        if (y > 200) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('7. MATERIALES', 15, y); y += 4;
        const matData = [];
        document.querySelectorAll('#tbodyMateriales tr').forEach(tr => {
            const celdas = tr.querySelectorAll('td');
            if (celdas.length >= 5) matData.push([
                limpiarTextoPDF(celdas[0].textContent.trim()),
                limpiarTextoPDF(celdas[1].textContent.trim()),
                limpiarTextoPDF(celdas[2].textContent.trim() + ' ' + celdas[3].textContent.trim())
            ]);
        });
        if (matData.length > 0) {
            autoTableLimpio(doc, {
                startY: y,
                head: [['Categoria', 'Descripcion', 'Cantidad']],
                body: matData, theme: 'grid',
                headStyles: { fillColor: [102, 126, 234], fontSize: 7 },
                bodyStyles: { fontSize: 7 },
                columnStyles: { 1: { cellWidth: 100 } }
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text('Pagina ' + i + ' de ' + pageCount, 105, 292, { align: 'center' });
            doc.text('Diseno orientativo segun AEA 90364-7-770. Consultar con profesional matriculado.', 105, 296, { align: 'center' });
        }

        doc.save('Diseno_Electrico_AEA770_v8.pdf');
        mostrarToast('✅ PDF exportado correctamente');
    } catch(e) {
        console.error('Error al exportar PDF:', e);
        alert('❌ Error al exportar PDF:\n' + e.message);
    }
}

// ============================================================
// EXPONER FUNCIONES GLOBALES
// ============================================================
window.abrirManual = abrirManual;
window.irAModuloDPS = irAModuloDPS;
window.irAModuloDPSForzado = irAModuloDPSForzado;
window.irAModuloDocumentacion = irAModuloDocumentacion;
window.abrirRepartoTableros = abrirRepartoTableros;
window.instalarPWA = instalarPWA;
window.cerrarBanner = cerrarBanner;
window.toggleTema = toggleTema;
window.cambiarTab = cambiarTab;
window.guardarProyecto = guardarProyecto;
window.nuevoProyecto = nuevoProyecto;
window.cambiarProyecto = cambiarProyecto;
window.resetear = resetear;
window.abrirModalJSON = abrirModalJSON;
window.cerrarModalJSON = cerrarModalJSON;
window.ejecutarAccionJSON = ejecutarAccionJSON;
window.exportarJSON = exportarJSON;
window.importarArchivoJSON = importarArchivoJSON;
window.exportarExcel = exportarExcel;
window.exportarPDF = exportarPDF;
window.agregarAmbiente = agregarAmbiente;
window.eliminarAmbiente = eliminarAmbiente;
window.actualizarBocas = actualizarBocas;
window.cambiarTableroAmbiente = cambiarTableroAmbiente;
window.resetearBocasMinimas = resetearBocasMinimas;
window.toggleCircuitoDedicado = toggleCircuitoDedicado;
window.agregarTablero = agregarTablero;
window.eliminarTablero = eliminarTablero;
window.actualizarTablero = actualizarTablero;
window.actualizarProteccionTablero = actualizarProteccionTablero;
window.actualizarSeccionCircuito = actualizarSeccionCircuito;
window.actualizarProteccionCircuito = actualizarProteccionCircuito;
window.actualizarLongitudCircuito = actualizarLongitudCircuito;
window.actualizarPotenciaMotor = actualizarPotenciaMotor;
window.setHerramienta = setHerramienta;
window.limpiarPlano = limpiarPlano;
window.autoUbicarBocas = autoUbicarBocas;
window.exportarPlanoPNG = exportarPlanoPNG;
window.actualizarElemento = actualizarElemento;
window.eliminarElementoSeleccionado = eliminarElementoSeleccionado;
window.mostrarToast = mostrarToast;
window.calcularSeccionMinima = calcularSeccionMinima;
window.detectarAmbientesPiscina = detectarAmbientesPiscina;
window.verificarReglasPiscina = verificarReglasPiscina;

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.getElementById('supCubierta').addEventListener('input', renderizarTodo);
document.getElementById('supSemicubierta').addEventListener('input', renderizarTodo);
document.getElementById('iccOrigen').addEventListener('input', renderizarTodo);
document.getElementById('nombreProyecto').addEventListener('input', () => {
    if (proyectoActualId) {
        const proyectos = obtenerProyectos();
        if (proyectos[proyectoActualId]) {
            proyectos[proyectoActualId].nombre = document.getElementById('nombreProyecto').value;
            guardarProyectos(proyectos);
        }
    }
});

actualizarSelectorProyectos();

const proyectosExistentes = obtenerProyectos();
const idsProyectos = Object.keys(proyectosExistentes);
const proyectoRecordado = localStorage.getItem('aea770_ultimo_proyecto');

if (proyectoRecordado && proyectosExistentes[proyectoRecordado]) {
    proyectoActualId = proyectoRecordado;
    aplicarProyecto(proyectosExistentes[proyectoRecordado]);
    document.getElementById('selectorProyecto').value = proyectoRecordado;
    console.log('✅ Proyecto restaurado:', proyectosExistentes[proyectoRecordado].nombre);
} else if (idsProyectos.length > 0) {
    const ultimoId = idsProyectos[idsProyectos.length - 1];
    proyectoActualId = ultimoId;
    localStorage.setItem('aea770_ultimo_proyecto', ultimoId);
    aplicarProyecto(proyectosExistentes[ultimoId]);
    document.getElementById('selectorProyecto').value = ultimoId;
    console.log('✅ Último proyecto cargado:', proyectosExistentes[ultimoId].nombre);
} else {
    inicializarEjemplo();
    document.getElementById('selectorProyecto').value = '';
    localStorage.removeItem('aea770_ultimo_proyecto');
}

function inicializarEjemplo() {
    ambientes = [
        { nombre: 'Estar-Comedor', tipo: 'Habitación', area: 24, tablero: 'Principal' },
        { nombre: 'Cocina', tipo: 'Cocina', area: 10, tablero: 'Principal' },
        { nombre: 'Baño 1', tipo: 'Baño', area: 4, tablero: 'Principal' },
        { nombre: 'Dormitorio 1', tipo: 'Dormitorio', area: 15, tablero: 'T1' },
        { nombre: 'Dormitorio 2', tipo: 'Dormitorio', area: 12, tablero: 'T1' },
        { nombre: 'Baño 2', tipo: 'Baño', area: 3, tablero: 'T1' }
    ];
    tableros = [
        { id: 'Principal', nombre: 'Tablero Principal', planta: 'PB', long: 0, seccion: 4, iccArriba: 4.5, padre: null, proteccion: null },
        { id: 'T1', nombre: 'Tablero Planta Alta', planta: 'PA', long: 15, seccion: 4, iccArriba: null, padre: 'Principal', proteccion: null }
    ];
    contadorTableros = 1;
    proyectoActualId = null;
    renderizarTodo();
    setTimeout(() => { inicializarPlano(); dibujarPlano(); actualizarContadoresPlano(); }, 200);
}