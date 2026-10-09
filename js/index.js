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
        'ID_BAÑO': 'Acti9 iID 2P 25A 30mA Clase AC'
    },
    'Siemens': {
        'PIA_IUG': 'Betagard 5SL6 1P+N C10A {pdc}kA',
        'PIA_TUG': 'Betagard 5SL6 1P+N C16A {pdc}kA',
        'PIA_TUE': 'Betagard 5SL6 1P+N C20A {pdc}kA',
        'ID_30mA': '5SM3 2P 40A 30mA Clase AC',
        'ID_300mA': '5SM3 2P 40A 300mA Selectivo Clase S',
        'ID_BAÑO': '5SM3 2P 25A 30mA Clase AC'
    },
    'ABB': {
        'PIA_IUG': 'System pro M S201 C10A {pdc}kA',
        'PIA_TUG': 'System pro M S201 C16A {pdc}kA',
        'PIA_TUE': 'System pro M S201 C20A {pdc}kA',
        'ID_30mA': 'F200 2P 40A 30mA Clase AC',
        'ID_300mA': 'F200 2P 40A 300mA Selectivo Clase S',
        'ID_BAÑO': 'F200 2P 25A 30mA Clase AC'
    },
    'Legrand': {
        'PIA_IUG': 'DX³ 1P+N C10A {pdc}kA',
        'PIA_TUG': 'DX³ 1P+N C16A {pdc}kA',
        'PIA_TUE': 'DX³ 1P+N C20A {pdc}kA',
        'ID_30mA': 'DX³ ID 2P 40A 30mA Clase AC',
        'ID_300mA': 'DX³ ID 2P 40A 300mA Selectivo Clase S',
        'ID_BAÑO': 'DX³ ID 2P 25A 30mA Clase AC'
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
    { id: 'Principal', nombre: 'Tablero Principal', planta: 'PB', long: 0, seccion: 4, iccArriba: 4.5, padre: null }
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

function calcularCaidaTension(corriente, longitud, seccion, tipo, tipoCable) {
    const gdc = getGDC(seccion, tipoCable);
    const deltaU = gdc * corriente * (longitud / 1000);
    const tension = tipo === 'TUE' ? 380 : 220;
    return (deltaU / tension) * 100;
}

function calcularIccAguasAbajo(iccArriba, longitud, seccion) {
    if (longitud === 0) return iccArriba;
    const factores = { 1.5: 0.035, 2.5: 0.025, 4: 0.018, 6: 0.013, 10: 0.009, 16: 0.006, 25: 0.004, 35: 0.003, 50: 0.002 };
    const factor = factores[seccion] || 0.02;
    const reduccion = 1 / (1 + factor * longitud * (iccArriba / 4.5));
    return Math.max(0.5, iccArriba * reduccion);
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
// CÁLCULO DE ACOMETIDA
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
        ? dpmsFinal / (1.73 * tension * 0.9)
        : dpmsFinal / (tension * 0.9);

    const gdc = getGDC(seccion, tipoCable);
    const deltaU_V = gdc * corriente * (long / 1000);
    const deltaU_pct = (deltaU_V / tension) * 100;

    const iccOrigen = parseFloat(document.getElementById('iccOrigen').value) || 4.5;
    const iccFinal = calcularIccAguasAbajo(iccOrigen, long, seccion);
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
// RENDERIZADO PRINCIPAL
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
        tbody.innerHTML = ''; tfoot.innerHTML = '';
        emptyMsg.style.display = 'block';
        document.getElementById('seccionResultados').style.display = 'none';
        document.getElementById('seccionExportar').style.display = 'none';
        return;
    }
    emptyMsg.style.display = 'none';

    let totalIUG = 0, totalTUG = 0, totalTUE = 0;

    tbody.innerHTML = ambientes.map((amb, i) => {
        const b = calcularBocas(amb);
        const alt = calcularAlturaTomas(amb);
        totalIUG += b.iug; totalTUG += b.tug; totalTUE += b.tue;

        const extraIUG = b.iug - b.minIUG;
        const extraTUG = b.tug - b.minTUG;
        const extraTUE = b.tue - b.minTUE;
        const badgeIUG = extraIUG > 0 ? `<span class="bocas-badge-extra">+${extraIUG}</span>` : '';
        const badgeTUG = extraTUG > 0 ? `<span class="bocas-badge-extra">+${extraTUG}</span>` : '';
        const badgeTUE = extraTUE > 0 ? `<span class="bocas-badge-extra">+${extraTUE}</span>` : '';

        const alturaCell = `
            <td class="alturas-cell">
                <div class="alt-row"><span class="alt-label">💡 IUG:</span><span class="alt-value">${alt.hIUG.toFixed(2)} m</span></div>
                <div class="alt-row"><span class="alt-label">🔌 TUG:</span><span class="alt-value">${alt.hTUG.toFixed(2)} m</span></div>
                ${b.tue > 0 ? `<div class="alt-row"><span class="alt-label">⚡ TUE:</span><span class="alt-value">${alt.hTUE.toFixed(2)} m</span></div>` : ''}
                <div class="alt-row"><span class="alt-label">📺 TV/Dat:</span><span class="alt-value">${alt.hTV.toFixed(2)} m</span></div>
                <div class="alt-row"><span class="alt-label">📋 Tablero:</span><span class="alt-value">${alt.hTabMin}–${alt.hTabMax} m</span></div>
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
            ${alturaCell}
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

    renderizarTablaAlturasRef();
    renderizarMatrizAEA();
    renderizarTableros();
    renderizarDPMS();
    actualizarCamposAcometida();
    renderizarIcc();
    renderizarCircuitos();
    renderizarMotores();
    renderizarDiferenciales();
    renderizarDPS();
    renderizarAlturas();
    renderizarMateriales();
    renderizarVerificaciones();
    renderizarAcometida();
    dibujarEsquemaSVG();

    document.getElementById('seccionResultados').style.display = 'block';
    document.getElementById('seccionExportar').style.display = 'block';
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
        return `<tr>
            <td><strong>${amb.nombre}</strong><br><small style="color:var(--text-light);">${amb.tipo} · ${tabNombre}</small></td>
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
                t.iccArriba = calcularIccAguasAbajo(padre.iccArriba, t.long, t.seccion);
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

    container.innerHTML = tableros.map((t, i) => {
        const esPrincipal = !t.padre;
        const pdc = t.iccArriba !== null ? pdcComercial(t.iccArriba) : '-';
        const nombrePlanta = { PB: 'PB', PA: 'PA', SS: 'Subsuelo', EXT: 'Ext.', OTRA: 'Otra' }[t.planta] || t.planta;

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
    tableros.push({ id, nombre, planta, padre, long: 10, seccion: 4, iccArriba: null });

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
// DISTRIBUCIÓN DE CIRCUITOS (CON CIRCUITOS EXCLUSIVOS PARA BAÑO Y COCINA)
// ============================================================
function distribuirCircuitosPorTablero() {
    const previos = {};
    Object.keys(circuitosPorTablero).forEach(tid => {
        circuitosPorTablero[tid].forEach(c => {
            previos[c.nombre] = {
                longitud: c.longitud,
                seccion: c.seccion,
                proteccion: c.proteccion,
                potenciaMotor: c.potenciaMotor
            };
        });
    });

    circuitosPorTablero = {};
    tableros.forEach(t => { circuitosPorTablero[t.id] = []; });

    // Agrupar ambientes por tablero y por tipo especial (Baño, Cocina)
    const ambientesPorTablero = {};
    tableros.forEach(t => {
        ambientesPorTablero[t.id] = {
            normales: [], // Ambientes que no son Baño ni Cocina
            banios: [],
            cocinas: []
        };
    });

    ambientes.forEach(amb => {
        if (!ambientesPorTablero[amb.tablero]) {
            const principal = tableros.find(t => !t.padre);
            if (principal) amb.tablero = principal.id;
            return;
        }
        const tipo = amb.tipo;
        if (tipo === 'Baño') {
            ambientesPorTablero[amb.tablero].banios.push(amb);
        } else if (tipo === 'Cocina' || tipo === 'Kitchenette') {
            ambientesPorTablero[amb.tablero].cocinas.push(amb);
        } else {
            ambientesPorTablero[amb.tablero].normales.push(amb);
        }
    });

    let nGlobal = 1;

    // Función auxiliar para crear circuitos a partir de una lista de bocas
    function crearCircuitos(tableroId, tipoCircuito, bocasTotales, maxPorCircuito, dpmsPorCircuito, valoresPrevios) {
        let restante = bocasTotales;
        while (restante > 0) {
            const cant = Math.min(restante, maxPorCircuito);
            const nombre = 'C' + nGlobal;
            const prev = valoresPrevios[nombre] || {};
            circuitosPorTablero[tableroId].push({
                nombre,
                tablero: tableroId,
                tipo: tipoCircuito,
                bocas: cant,
                dpms: dpmsPorCircuito,
                seccion: prev.seccion !== undefined ? prev.seccion : (tipoCircuito === 'IUG' ? 1.5 : 2.5),
                proteccion: prev.proteccion !== undefined ? prev.proteccion : (tipoCircuito === 'IUG' ? 10 : (tipoCircuito === 'TUG' ? 16 : 20)),
                longitud: prev.longitud !== undefined ? prev.longitud : (tipoCircuito === 'IUG' ? 10 : (tipoCircuito === 'TUG' ? 15 : 20)),
                potenciaMotor: prev.potenciaMotor,
                iccArriba: tableros.find(t => t.id === tableroId)?.iccArriba || null
            });
            restante -= cant;
            nGlobal++;
        }
    }

    // Para cada tablero, procesar primero los circuitos exclusivos de Baño y Cocina
    tableros.forEach(t => {
        const iccSeccional = t.iccArriba;
        const grupos = ambientesPorTablero[t.id];

        // --- CIRCUITOS EXCLUSIVOS DE BAÑO ---
        if (grupos.banios.length > 0) {
            let bocasIUG = 0, bocasTUG = 0, bocasTUE = 0;
            grupos.banios.forEach(amb => {
                const b = calcularBocas(amb);
                bocasIUG += b.iug;
                bocasTUG += b.tug;
                bocasTUE += b.tue;
            });

            // Para baños, forzamos que cada ambiente tenga su propio circuito
            // Pero como puede haber varios baños, agrupamos por tipo de boca
            // y creamos circuitos que no superen el máximo.
            // Además, para baños, la sección mínima suele ser 2.5 mm² para TUG.
            
            // IUG de baños: máximo 15 bocas por circuito (pero cada baño suele tener 1 IUG)
            crearCircuitos(t.id, 'IUG', bocasIUG, 15, 440, previos);
            // TUG de baños: máximo 15 bocas, pero para baños es común usar 2.5 mm²
            // Aquí ya usamos 2.5 mm² por defecto para TUG
            crearCircuitos(t.id, 'TUG', bocasTUG, 15, 2200, previos);
            // TUE de baños (si hubiera)
            crearCircuitos(t.id, 'TUE', bocasTUE, 12, 3300, previos);
        }

        // --- CIRCUITOS EXCLUSIVOS DE COCINA ---
        if (grupos.cocinas.length > 0) {
            let bocasIUG = 0, bocasTUG = 0, bocasTUE = 0;
            grupos.cocinas.forEach(amb => {
                const b = calcularBocas(amb);
                bocasIUG += b.iug;
                bocasTUG += b.tug;
                bocasTUE += b.tue;
            });

            crearCircuitos(t.id, 'IUG', bocasIUG, 15, 440, previos);
            crearCircuitos(t.id, 'TUG', bocasTUG, 15, 2200, previos);
            crearCircuitos(t.id, 'TUE', bocasTUE, 12, 3300, previos);
        }

        // --- CIRCUITOS NORMALES (RESTO DE AMBIENTES) ---
        if (grupos.normales.length > 0) {
            let bocasIUG = 0, bocasTUG = 0, bocasTUE = 0;
            grupos.normales.forEach(amb => {
                const b = calcularBocas(amb);
                bocasIUG += b.iug;
                bocasTUG += b.tug;
                bocasTUE += b.tue;
            });

            crearCircuitos(t.id, 'IUG', bocasIUG, 15, 440, previos);
            crearCircuitos(t.id, 'TUG', bocasTUG, 15, 2200, previos);
            crearCircuitos(t.id, 'TUE', bocasTUE, 12, 3300, previos);
        }
    });

    // Asegurar que todos los circuitos tengan iccArriba actualizado
    Object.keys(circuitosPorTablero).forEach(tid => {
        const icc = tableros.find(t => t.id === tid)?.iccArriba || null;
        circuitosPorTablero[tid].forEach(c => {
            c.iccArriba = icc;
        });
    });
}


// ============================================================
// DPMS
// ============================================================
function renderizarDPMS() {
    let totalCircIUG = 0, totalCircTUG = 0, totalCircTUE = 0;
    Object.values(circuitosPorTablero).forEach(circs => {
        circs.forEach(c => {
            if (c.tipo === 'IUG') totalCircIUG++;
            else if (c.tipo === 'TUG') totalCircTUG++;
            else if (c.tipo === 'TUE') totalCircTUE++;
        });
    });

    document.getElementById('totalCircIUG').textContent = totalCircIUG;
    document.getElementById('totalCircTUG').textContent = totalCircTUG;
    document.getElementById('totalCircTUE').textContent = totalCircTUE;

    const potIUG = totalCircIUG * 440;
    const potTUG = totalCircTUG * 2200;
    const potTUE = totalCircTUE * 3300;
    const dpmsTotal = potIUG + potTUG + potTUE;

    const grado = document.getElementById('gradoResult').value;
    let coefSimult = grado === 'MEDIO' ? 0.9 : grado === 'ELEVADO' ? 0.8 : grado === 'SUPERIOR' ? 0.7 : 1;
    const dpmsFinal = dpmsTotal * coefSimult;

    document.getElementById('tbodyDPMS').innerHTML = `
        <tr><td>Circuitos IUG (${totalCircIUG} × 440 VA)</td><td>${totalCircIUG}</td><td>440 VA</td><td>${potIUG.toFixed(0)} VA</td></tr>
        <tr><td>Circuitos TUG (${totalCircTUG} × 2200 VA)</td><td>${totalCircTUG}</td><td>2200 VA</td><td>${potTUG.toFixed(0)} VA</td></tr>
        <tr><td>Circuitos TUE (${totalCircTUE} × 3300 VA)</td><td>${totalCircTUE}</td><td>3300 VA</td><td>${potTUE.toFixed(0)} VA</td></tr>
    `;
    document.getElementById('tfootDPMS').innerHTML = `
        <tr style="background:var(--table-header);font-weight:700;"><td colspan="3">DPMS TOTAL</td><td>${dpmsTotal.toFixed(0)} VA</td></tr>
        <tr style="background:var(--accent);color:white;font-weight:700;"><td colspan="3">DPMS c/ Simultaneidad (${(coefSimult*100).toFixed(0)}%)</td><td>${dpmsFinal.toFixed(0)} VA</td></tr>
    `;

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
        const pdc = pdcComercial(t.iccArriba);
        return `<tr>
            <td><strong>${t.nombre}</strong></td>
            <td>${!t.padre ? acom.iccFinal.toFixed(2) : t.iccArriba.toFixed(2)}</td>
            <td>${t.long}</td>
            <td>${!t.padre ? '—' : t.seccion}</td>
            <td>${t.iccArriba.toFixed(2)}</td>
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
    let html = '';
    Object.keys(circuitosPorTablero).forEach(tableroId => {
        circuitosPorTablero[tableroId].forEach((c, idx) => {
            const caida = calcularCaidaTension(c.dpms / 220, c.longitud, c.seccion, c.tipo);
            const limite = c.tipo === 'IUG' ? 3 : 5;
            const iccAbajo = calcularIccAguasAbajo(c.iccArriba, c.longitud, c.seccion);
            const pdc = pdcComercial(iccAbajo);
            const verif = caida <= limite ? '<span class="badge ok">✔</span>' : '<span class="badge error">✖</span>';
            const tabNombre = (tableros.find(t => t.id === c.tablero) || {nombre: c.tablero}).nombre;
            const esTUE = c.tipo === 'TUE';

            html += `<tr>
                <td><strong>${c.nombre}</strong></td>
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
    circuitosPorTablero[tableroId][idx].longitud = parseFloat(valor) || 1;
    renderizarCircuitos();
    renderizarMotores();
    renderizarMateriales();
    dibujarEsquemaSVG();
}

function actualizarSeccionCircuito(tableroId, idx, valor) {
    const c = circuitosPorTablero[tableroId][idx];
    if (!c) return;
    c.seccion = parseFloat(valor) || 2.5;
    renderizarCircuitos();
    renderizarMotores();
    renderizarMateriales();
    dibujarEsquemaSVG();
}

function actualizarProteccionCircuito(tableroId, idx, valor) {
    const c = circuitosPorTablero[tableroId][idx];
    if (!c) return;
    c.proteccion = parseInt(valor) || 16;
    renderizarCircuitos();
    renderizarMateriales();
}

function actualizarPotenciaMotor(tableroId, idx, valor) {
    const c = circuitosPorTablero[tableroId][idx];
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
    dibujarEsquemaSVG();
}

// ============================================================
// MOTORES
// ============================================================
function renderizarMotores() {
    const tbody = document.getElementById('tbodyMotores');
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
    const marca = document.getElementById('marcaInterruptores').value;
    const cat = CATALOGO_MARCAS[marca] || CATALOGO_MARCAS['Schneider'];
    const corrienteTotal = (window.__datosExport?.dpmsFinal || 0) / 220;
    const tieneBaño = ambientes.some(a => a.tipo === 'Baño');
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
            <td>ID 30 mA exclusivo</td><td>30 mA</td><td>25 A</td>
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

    materiales.push([
        'Acometida',
        `${nombreCableAcom} - ${acom.conductores}×${acom.seccion} mm² (medidor → tablero principal)`,
        Math.ceil(acom.long * 1.15),
        'metros',
        `${acom.conductores} conductores · ${acom.tipoCable}`
    ]);

    if (proteccionAcom !== 'sin') {
        materiales.push([
            'Acometida',
            nombresProteccion[proteccionAcom] + ' (acometida)',
            Math.ceil(acom.long * 1.15),
            'metros',
            `Tipo de instalación: ${tipoInstAcom}`
        ]);
    }

    materiales.push(['Acometida', 'Gabinete de medidor con base portafusible (distribuidora)', 1, 'unidad', 'Según norma de la distribuidora']);
    materiales.push(['Acometida', 'Interruptor general de acometida 4P (cabecera tablero principal)', 1, 'unidad', `${pdcComercial(acom.iccFinal)} kA · ${acom.corriente.toFixed(0)} A`]);

    const pat = obtenerDatosPAT();
    materiales.push(['PAT', pat.nombreJabalina, pat.cantJabalina, 'unidad', 'Con tomacable y caja de inspección']);
    materiales.push(['PAT', 'Cámara de inspección', pat.cantJabalina, 'unidad', 'A nivel de piso']);
    materiales.push(['PAT', `Cable PAT ${pat.seccion} mm² (jabalinas → tableros)`, Math.ceil(pat.longCable * 1.15), 'metros', 'Verde/amarillo IRAM 2178']);
    materiales.push(['PAT', 'Barra de tierra', tableros.length, 'unidad', 'En cada tablero']);
    materiales.push(['PAT', 'Conector de jabalina / soldadura exotérmica', pat.cantJabalina, 'unidad', 'Unión cable-jabalina']);

    materiales.push(['Tableros', 'Gabinete doble aislación Clase II con riel DIN (altura 1.30-1.80 m)', tableros.length, 'unidad', 'Uno por tablero']);

    const contadores = {};
    Object.values(circuitosPorTablero).forEach(circs => {
        circs.forEach(c => {
            const key = `${c.tipo}_${c.seccion}_${c.proteccion}`;
            if (!contadores[key]) contadores[key] = { tipo: c.tipo, seccion: c.seccion, proteccion: c.proteccion, cantidad: 0 };
            contadores[key].cantidad++;
        });
    });
    Object.values(contadores).forEach(c => {
        const pdc = pdcComercial(4.5);
        const modelo = (cat['PIA_' + c.tipo] || '').replace('{pdc}', pdc);
        materiales.push(['Protecciones', `PIA ${c.proteccion}A ${c.seccion}mm² - ${modelo}`, c.cantidad, 'unidad', `Circuitos ${c.tipo}`]);
    });

    materiales.push(['Diferenciales', cat.ID_300mA, 1, 'unidad', 'Cabecera Principal']);
    materiales.push(['Diferenciales', cat.ID_30mA, 2, 'unidad', 'TUG + TUE']);
    if (ambientes.some(a => a.tipo === 'Baño')) materiales.push(['Diferenciales', cat.ID_BAÑO, 1, 'unidad', 'Circuito baño']);
    if (tableros.length > 1) materiales.push(['Diferenciales', cat.ID_30mA, tableros.length - 1, 'unidad', 'Cabeceras seccionales']);

    // DPS (si fue evaluado)
    const proyectoNombre = document.getElementById('nombreProyecto').value || 'proyecto';
    try {
        const dpsData = localStorage.getItem('resultadoDPS_' + proyectoNombre);
        if (dpsData) {
            const dps = JSON.parse(dpsData);
            const tipoNombre = {1: 'Tipo 1', 2: 'Tipo 2', 3: 'Tipo 3'}[dps.tipoRecomendado];
            const modelo = dps.dispositivos && dps.dispositivos[0] ? dps.dispositivos[0].modelo : `DPS ${tipoNombre} (seleccionar modelo)`;
            materiales.push([
                'Protección DPS',
                `${modelo} - Up <= ${dps.upRecomendado} kV`,
                1,
                'unidad',
                dps.esObligatorio ? 'OBLIGATORIO (AEA 771)' : 'Recomendado (AEA 771)'
            ]);
            materiales.push([
                'Protección DPS',
                'Fusible o PIA de respaldo para DPS',
                1,
                'unidad',
                'Según indicación del fabricante'
            ]);
        }
    } catch (e) { console.warn('DPS no disponible:', e); }

    const cablesPorSeccion = {};
    Object.values(circuitosPorTablero).forEach(circs => {
        circs.forEach(c => {
            const key = c.seccion;
            if (!cablesPorSeccion[key]) cablesPorSeccion[key] = 0;
            cablesPorSeccion[key] += c.longitud;
        });
    });
    let totalSeccionales = 0;
    tableros.forEach(t => { if (t.padre) totalSeccionales += t.long; });

    Object.keys(cablesPorSeccion).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach(sec => {
        const metros = Math.ceil(cablesPorSeccion[sec] * 1.15);
        const secNum = parseFloat(sec);
        let nota = 'F+N+PE';
        if (secNum <= 2.5) nota = 'IRAM NM 247-3 (F+N+PE)';
        else nota = 'IRAM 2178 (F+N+PE)';
        materiales.push(['Cables', `${nombreCable} - ${sec} mm²`, metros, 'metros', nota]);
    });

    materiales.push(['Cables', `${nombreCable} - 4 mm² (Seccionales)`, Math.ceil(totalSeccionales * 1.15), 'metros', 'F+N+PE']);
    materiales.push(['Cables', 'Cable IRAM NM 247-3 2.5 mm² (PE circuitos)', Math.ceil(Object.values(cablesPorSeccion).reduce((a,b)=>a+b,0) * 1.15), 'metros', 'Verde/amarillo']);

    const totalCanalizacion = Object.values(cablesPorSeccion).reduce((a,b)=>a+b,0);
    if (tipoInst === 'embutida') {
        materiales.push(['Canalizaciones', 'Cañería IRAM 62386-21 Rígida 20mm', Math.ceil(totalCanalizacion * 1.15), 'metros', 'Embutida']);
    } else if (tipoInst === 'vista') {
        materiales.push(['Canalizaciones', 'Cablecanal IRAM 62084 20x12mm', Math.ceil(totalCanalizacion * 1.15), 'metros', 'A la vista']);
    } else {
        materiales.push(['Canalizaciones', 'Cañería IRAM 62386-21 Rígida 20mm', Math.ceil(totalCanalizacion * 0.6), 'metros', 'Embutida']);
        materiales.push(['Canalizaciones', 'Cablecanal IRAM 62084 20x12mm', Math.ceil(totalCanalizacion * 0.5), 'metros', 'A la vista']);
    }

    const tIUG = parseInt(document.getElementById('totalIUG').textContent) || 0;
    const tTUG = parseInt(document.getElementById('totalTUG').textContent) || 0;
    const tTUE = parseInt(document.getElementById('totalTUE').textContent) || 0;
    const totalBocas = tIUG + tTUG + tTUE;

    materiales.push(['Cajas', 'Caja rectangular 5x10 (embutir)', totalBocas, 'unidad', 'Bocas']);
    materiales.push(['Cajas', 'Caja derivación 10x10', Math.ceil(totalBocas / 3), 'unidad', 'Uniones']);
    materiales.push(['Bocas', 'Tomacorriente 2P+T 10A IRAM 2071 (TUG a 0.30/1.10 m)', tTUG, 'unidad', 'Bocas TUG']);
    materiales.push(['Bocas', 'Tomacorriente 2P+T 20A IRAM 2071 (TUE a 1.10/2.00 m)', tTUE, 'unidad', 'Bocas TUE']);
    materiales.push(['Bocas', 'Interruptor de efecto (IUG a 1.10 m)', tIUG, 'unidad', 'Comando iluminación']);

    const ambientesConTV = ambientes.filter(a => ['Habitación', 'Dormitorio', 'Cocina', 'Kitchenette'].includes(a.tipo)).length;
    if (ambientesConTV > 0) {
        materiales.push(['Bocas', 'Toma TV coaxil + RJ45 (0.30/1.10 m según ambiente)', ambientesConTV, 'unidad', 'Bocas TV/datos']);
    }

    materiales.push(['Varios', 'Precintos, grapas, terminales, cintas', 1, 'global', 'Material menor']);

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
            const caida = calcularCaidaTension(c.dpms / 220, c.longitud, c.seccion, c.tipo);
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
    verifs.push({ estado: 'warn', texto: `Verificar R <= 40 Ohm en obra con telurómetro (AEA 770 Sección 770.8). La app no calcula la resistividad del terreno.` });

    verifs.push({ estado: 'info', texto: `Alturas verificadas: IUG 1.10 m · TUG 0.30/1.10 m · TUE 1.10/2.00 m · TV/datos 0.30/1.10 m · Tableros 1.30-1.80 m.` });
    if (ambientes.some(a => a.tipo === 'Baño')) {
        verifs.push({ estado: 'ok', texto: `Baños: tomas fuera del volumen de seguridad (Sección 701).` });
    }

    // Verificación DPS
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
                texto: `Módulo de DPS no evaluado. Se recomienda abrir el módulo para determinar la necesidad de protección contra sobretensiones.`
            });
        }
    } catch (e) {
        verifs.push({
            estado: 'warn',
            texto: `No se pudo verificar el estado del DPS.`
        });
    }

    document.getElementById('verificaciones').innerHTML = verifs.map(v =>
        `<div style="margin-bottom:8px;"><span class="badge ${v.estado}">${v.estado === 'ok' ? '✔' : v.estado === 'warn' ? '⚠' : v.estado === 'info' ? 'ℹ' : '✖'}</span> ${v.texto}</div>`
    ).join('');
}

// ============================================================
// PLANO
// ============================================================
function inicializarPlano() {
    const ancho = parseFloat(document.getElementById('planoAncho').value) || 15;
    const alto = parseFloat(document.getElementById('planoAlto').value) || 12;
    const canvas = document.getElementById('planoCanvas');
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

    // === MEDIDOR ===
    const acom = calcularAcometida();
    svg += `<line x1="${centroX}" y1="0" x2="${centroX}" y2="${y}" stroke="${colorLinea}" stroke-width="3"/>`;
    svg += `<text x="${centroX + 10}" y="${y - 5}" fill="${colorTexto}" font-size="10">Acometida 220/380V</text>`;
    svg += nodoSVG(centroX - 70, y, 140, altoNodo, colorNodo, colorBorde);
    svg += `<text x="${centroX}" y="${y + 22}" fill="${colorTexto}" font-size="11" font-weight="bold" text-anchor="middle">MEDIDOR</text>`;
    svg += `<text x="${centroX}" y="${y + 38}" fill="${colorTexto}" font-size="9" text-anchor="middle">Icc: ${acom.iccOrigen.toFixed(1)} kA</text>`;
    y += altoNodo + separacion;

    svg += `<line x1="${centroX}" y1="${y - separacion}" x2="${centroX}" y2="${y}" stroke="${colorLinea}" stroke-width="3"/>`;
    svg += `<text x="${centroX + 15}" y="${y - 5}" fill="${colorTexto}" font-size="9">${acom.long}m · ${acom.conductores}x${acom.seccion}mm2 · ${getNombreTipoCable(acom.tipoCable)}</text>`;

    // === TABLEROS ===
    tableros.forEach(t => {
        const circs = circuitosPorTablero[t.id] || [];
        if (t.padre && circs.length === 0) return;

        svg += `<line x1="${centroX}" y1="${y - separacion}" x2="${centroX}" y2="${y}" stroke="${colorLinea}" stroke-width="3"/>`;
        if (t.padre) svg += `<text x="${centroX + 15}" y="${y - 5}" fill="${colorTexto}" font-size="9">${t.long}m · ${t.seccion}mm2</text>`;

        const wTab = 240;
        svg += nodoSVG(centroX - wTab / 2, y, wTab, altoNodo, colorNodo, colorBorde);
        svg += `<text x="${centroX}" y="${y + 22}" fill="${colorTexto}" font-size="11" font-weight="bold" text-anchor="middle">${t.nombre.toUpperCase()}</text>`;
        svg += `<text x="${centroX}" y="${y + 38}" fill="${colorTexto}" font-size="9" text-anchor="middle">Icc: ${t.iccArriba.toFixed(2)} kA · PdC >= ${pdcComercial(t.iccArriba)} kA · Alt: 1.30-1.80 m</text>`;
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
                const color = c.tipo === 'IUG' ? '#f39c12' : c.tipo === 'TUG' ? '#3498db' : '#e74c3c';

                svg += `<line x1="${x}" y1="${yCaja}" x2="${x}" y2="${yCaja + 15}" stroke="${color}" stroke-width="2"/>`;
                svg += nodoSVG(x - 55, yCaja + 15, 110, 40, colorNodo, color);
                svg += `<text x="${x}" y="${yCaja + 30}" fill="${colorTexto}" font-size="10" font-weight="bold" text-anchor="middle">${c.nombre} · ${c.tipo}</text>`;
                svg += `<text x="${x}" y="${yCaja + 44}" fill="${colorTexto}" font-size="9" text-anchor="middle">${c.bocas}b · ${c.proteccion}A · ${c.seccion}mm2</text>`;
            });

            y += filas * 55 + separacion;
        }
    });

    // === BLOQUE DPS (si fue evaluado) ===
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

    // === PAT ===
    const pat = obtenerDatosPAT();
    svg += `<line x1="${padding}" y1="${y}" x2="${ancho - padding}" y2="${y}" stroke="${colorLinea}" stroke-width="2" stroke-dasharray="5,5"/>`;
    svg += `<text x="${centroX}" y="${y + 18}" fill="${colorTexto}" font-size="10" font-weight="bold" text-anchor="middle">PAT: ${pat.cantJabalina} jabalina(s) - R &lt;= 40 Ohm</text>`;
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

    // Preservar el proyecto activo (prioridad) o el value actual del selector
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
    return {
        __id: proyectoActualId || null,
        version: '8.4-local',
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
    });
    const tienePrincipal = tablerosMigrados.some(t => !t.padre);
    if (!tienePrincipal) {
        tablerosMigrados.unshift({
            id: 'Principal', nombre: 'Tablero Principal', planta: 'PB',
            long: 0, seccion: 4, iccArriba: 4.5, padre: null
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

    // Restaurar proyectoActualId si viene en el JSON
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

        // Re-sincronizar el selector al final (por si cambió la lista)
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
    proyectoActualId = id;   // asignar ANTES de capturar para que __id quede bien
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
        { id: 'Principal', nombre: 'Tablero Principal', planta: 'PB', long: 0, seccion: 4, iccArriba: 4.5, padre: null },
        { id: 'T1', nombre: 'Tablero Planta Alta', planta: 'PA', long: 15, seccion: 4, iccArriba: null, padre: 'Principal' }
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

        // Guardar copia específica para Reparto
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

// ============================================================
// SINCRONIZAR LONGITUDES DESDE LA TABLA DE CIRCUITOS
// ============================================================
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

        const hojaConductores = [
            ['CONDUCTORES Y CABLES PERMITIDOS SEGÚN AEA 770'],
            ['Fuente: Guía AEA 770 - "Conductores y cables permitidos"'],
            [],
            ['Tipo de instalación', 'Tipo de canalización',
             'NM 247-3', 'NM 247-3 SOH', 'IRAM 2178-1 Sub', 'IRAM 62267 T1 SOH',
             'IRAM 62266 T1 SOH', 'IRAM 2178-1 comando', 'IRAM 2204', 'IRAM NM 280']
        ];
        const columnas = ['NM247_3', 'NM247_3_SOH', 'IRAM2178_SUB', 'IRAM62267_1', 'IRAM62266_1', 'IRAM2178_COM', 'IRAM2204', 'IRAMNM280'];
        Object.keys(MATRIZ_AEA_CONDUCTORES).forEach(tipoInst => {
            const inst = MATRIZ_AEA_CONDUCTORES[tipoInst];
            Object.keys(inst.canalizaciones).forEach(canalKey => {
                const canal = inst.canalizaciones[canalKey];
                const fila = [inst.nombre, canal.nombre];
                columnas.forEach(col => {
                    if (canal.permitidos.includes(col)) {
                        if (col === 'IRAMNM280' && canalKey.startsWith('BANDEJA')) fila.push('Solo PE');
                        else if (col === 'IRAMNM280' && canalKey === 'SUB_DIRECTO') fila.push('Solo PAT');
                        else fila.push('Permitido');
                    } else {
                        fila.push('No permitido');
                    }
                });
                hojaConductores.push(fila);
            });
        });
        const wsConductores = XLSX.utils.aoa_to_sheet(hojaConductores);
        wsConductores['!cols'] = [{wch:20},{wch:55},{wch:12},{wch:15},{wch:16},{wch:18},{wch:18},{wch:20},{wch:12},{wch:18}];
        XLSX.utils.book_append_sheet(wb, wsConductores, 'Conductores AEA');

        const hoja2 = [['Ambiente', 'Tipo', 'Superficie (m²)', 'Tablero',
                        'IUG mín', 'IUG real', 'TUG mín', 'TUG real', 'TUE mín', 'TUE real',
                        'Alt. IUG (m)', 'Alt. TUG (m)', 'Alt. TUE (m)', 'Alt. TV/Datos (m)', 'Alt. Tablero (m)', 'Observaciones']];
        ambientes.forEach(amb => {
            const b = calcularBocas(amb);
            const alt = calcularAlturaTomas(amb);
            const tabNombre = (tableros.find(t => t.id === amb.tablero) || {nombre: amb.tablero}).nombre;
            hoja2.push([
                amb.nombre, amb.tipo, amb.area, tabNombre,
                b.minIUG, b.iug, b.minTUG, b.tug, b.minTUE, b.tue,
                alt.hIUG.toFixed(2), alt.hTUG.toFixed(2),
                b.tue > 0 ? alt.hTUE.toFixed(2) : '-',
                alt.hTV.toFixed(2),
                `${alt.hTabMin}-${alt.hTabMax}`,
                alt.obs
            ]);
        });
        const ws2 = XLSX.utils.aoa_to_sheet(hoja2);
        ws2['!cols'] = [
            {wch:22},{wch:16},{wch:14},{wch:20},
            {wch:8},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8},
            {wch:12},{wch:12},{wch:12},{wch:15},{wch:14},{wch:55}
        ];
        XLSX.utils.book_append_sheet(wb, ws2, 'Ambientes');

        const hoja3 = [['Circuito', 'Tablero', 'Tipo', 'Bocas', 'DPMS', 'Secc.', 'Prot.', 'Long.', 'Potencia Motor (W)', 'DU (%)', 'Icc Abajo', 'PdC', 'Verif.']];
        Object.keys(circuitosPorTablero).forEach(tid => {
            circuitosPorTablero[tid].forEach(c => {
                const caida = calcularCaidaTension(c.dpms / 220, c.longitud, c.seccion, c.tipo);
                const limite = c.tipo === 'IUG' ? 3 : 5;
                const iccAbajo = calcularIccAguasAbajo(c.iccArriba, c.longitud, c.seccion);
                const tabNombre = (tableros.find(t => t.id === c.tablero) || {nombre: c.tablero}).nombre;
                hoja3.push([
                    c.nombre, tabNombre, c.tipo, c.bocas, c.dpms, c.seccion, c.proteccion, c.longitud,
                    c.tipo === 'TUE' ? (c.potenciaMotor || 2800) : '-',
                    caida.toFixed(2), iccAbajo.toFixed(2), pdcComercial(iccAbajo),
                    caida <= limite ? 'OK' : 'EXCEDE'
                ]);
            });
        });
        const ws3 = XLSX.utils.aoa_to_sheet(hoja3);
        ws3['!cols'] = [{wch:8},{wch:20},{wch:8},{wch:8},{wch:10},{wch:8},{wch:8},{wch:8},{wch:16},{wch:10},{wch:12},{wch:8},{wch:8}];
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

        const hoja5 = [['Tablero', 'Planta', 'Padre', 'Longitud (m)', 'Sección', 'Icc Arriba (kA)', 'PdC (kA)', 'Altura recomendada']];
        tableros.forEach(t => {
            const padre = t.padre ? (tableros.find(x => x.id === t.padre) || {nombre: t.padre}).nombre : '(Acometida)';
            hoja5.push([t.nombre, t.planta, padre, t.long, t.seccion, (t.iccArriba || 0).toFixed(2), pdcComercial(t.iccArriba || 4.5), '1.30-1.80 m']);
        });
        const ws5 = XLSX.utils.aoa_to_sheet(hoja5);
        ws5['!cols'] = [{wch:30},{wch:10},{wch:25},{wch:15},{wch:10},{wch:15},{wch:10},{wch:18}];
        XLSX.utils.book_append_sheet(wb, ws5, 'Tableros');

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

        const hoja7 = [['Tipo', 'Ambiente', 'X (m)', 'Y (m)', 'Altura recomendada (m)']];
        planoElementos.forEach(el => {
            const amb = ambientes.find(a => a.nombre === el.ambiente);
            const alt = amb ? calcularAlturaTomas(amb) : null;
            let altura = '-';
            if (alt) {
                if (el.tipo === 'boca_iug') altura = alt.hIUG.toFixed(2);
                else if (el.tipo === 'boca_tug') altura = alt.hTUG.toFixed(2);
                else if (el.tipo === 'boca_tue') altura = alt.hTUE.toFixed(2);
                else if (el.tipo === 'boca_tv') altura = alt.hTV.toFixed(2);
                else if (el.tipo === 'tablero') altura = `${alt.hTabMin}-${alt.hTabMax}`;
            }
            hoja7.push([el.tipo, el.ambiente || '-', (el.x / ESCALA_PLANO).toFixed(2), (el.y / ESCALA_PLANO).toFixed(2), altura]);
        });
        const ws7 = XLSX.utils.aoa_to_sheet(hoja7);
        ws7['!cols'] = [{wch:15},{wch:20},{wch:12},{wch:12},{wch:22}];
        XLSX.utils.book_append_sheet(wb, ws7, 'Plano');

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

        XLSX.writeFile(wb, 'Diseño_Electrico_AEA770_v8_local.xlsx');
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
            ['Observaciones', limpiarTextoPDF(pat.cantJabalina > 1 ? 'Jabalinas conectadas en paralelo (reducen R total)' : 'Jabalina unica')]
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
        doc.text('1.d CONDUCTORES PERMITIDOS SEGUN AEA 770', 15, y); y += 4;
        const matrizData = [];
        Object.keys(MATRIZ_AEA_CONDUCTORES).forEach(tipoInst => {
            const inst = MATRIZ_AEA_CONDUCTORES[tipoInst];
            Object.keys(inst.canalizaciones).forEach(canalKey => {
                const canal = inst.canalizaciones[canalKey];
                matrizData.push([
                    limpiarTextoPDF(inst.nombre),
                    limpiarTextoPDF(canal.nombre.substring(0, 40) + (canal.nombre.length > 40 ? '...' : '')),
                    canal.permitidos.includes('NM247_3') ? 'Si' : 'No',
                    canal.permitidos.includes('NM247_3_SOH') ? 'Si' : 'No',
                    canal.permitidos.includes('IRAM2178_SUB') ? 'Si' : 'No',
                    canal.permitidos.includes('IRAMNM280') ? 'Solo PE/PAT' : 'No'
                ]);
            });
        });
        autoTableLimpio(doc, {
            startY: y,
            head: [['Instalacion', 'Canalizacion', 'NM 247-3', 'NM 247-3 SOH', 'IRAM 2178', 'NM 280']],
            body: matrizData, theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 6 },
            bodyStyles: { fontSize: 6 }
        });
        y = doc.lastAutoTable.finalY + 8;

        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('2. AMBIENTES Y ALTURAS', 15, y); y += 4;
        const ambData = ambientes.map(amb => {
            const b = calcularBocas(amb);
            const alt = calcularAlturaTomas(amb);
            const tabNombre = (tableros.find(t => t.id === amb.tablero) || {nombre: amb.tablero}).nombre;
            return [
                limpiarTextoPDF(amb.nombre), limpiarTextoPDF(amb.tipo), limpiarTextoPDF(amb.area + ' m2'), limpiarTextoPDF(tabNombre),
                b.iug, b.tug, b.tue,
                alt.hIUG.toFixed(2),
                alt.hTUG.toFixed(2),
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
            bodyStyles: { fontSize: 6 },
            columnStyles: {
                7: { cellWidth: 13 },
                8: { cellWidth: 13 },
                9: { cellWidth: 13 },
                10: { cellWidth: 13 },
                11: { cellWidth: 16 }
            }
        });
        y = doc.lastAutoTable.finalY + 8;

        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('3. TABLEROS (altura 1.30-1.80 m)', 15, y); y += 4;
        const tabData = tableros.map(t => {
            const padre = t.padre ? (tableros.find(x => x.id === t.padre) || {nombre: t.padre}).nombre : '-';
            return [limpiarTextoPDF(t.nombre), limpiarTextoPDF(t.planta), limpiarTextoPDF(padre), t.long, t.seccion, (t.iccArriba || 0).toFixed(2), pdcComercial(t.iccArriba || 4.5), '1.30-1.80 m'];
        });
        autoTableLimpio(doc, {
            startY: y,
            head: [['Tablero', 'Planta', 'Padre', 'Long', 'Secc.', 'Icc (kA)', 'PdC (kA)', 'Altura (m)']],
            body: tabData, theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 7 },
            bodyStyles: { fontSize: 7 }
        });
        y = doc.lastAutoTable.finalY + 8;

        if (y > 200) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('4. CIRCUITOS', 15, y); y += 4;
        const circData = [];
        Object.keys(circuitosPorTablero).forEach(tid => {
            circuitosPorTablero[tid].forEach(c => {
                const caida = calcularCaidaTension(c.dpms / 220, c.longitud, c.seccion, c.tipo);
                const iccAbajo = calcularIccAguasAbajo(c.iccArriba, c.longitud, c.seccion);
                circData.push([
                    limpiarTextoPDF(c.nombre), limpiarTextoPDF(c.tablero), limpiarTextoPDF(c.tipo),
                    c.bocas, c.seccion, c.proteccion, c.longitud,
                    c.tipo === 'TUE' ? (c.potenciaMotor || 2800) : '-',
                    caida.toFixed(1) + '%', pdcComercial(iccAbajo)
                ]);
            });
        });
        autoTableLimpio(doc, {
            startY: y,
            head: [['Cto', 'Tablero', 'Tipo', 'Bocas', 'Secc', 'Prot', 'Long', 'Pot.(W)', 'DU', 'PdC']],
            body: circData, theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 7 },
            bodyStyles: { fontSize: 7 }
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

        if (y > 200) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('6. ALTURAS DE REFERENCIA (NPT)', 15, y); y += 4;
        const altData = TABLA_ALTURAS_REFERENCIA.map(r => [
            limpiarTextoPDF(r.tipo),
            limpiarTextoPDF(r.hIUG),
            limpiarTextoPDF(r.hTUG),
            limpiarTextoPDF(r.hTUE),
            limpiarTextoPDF(r.hTV),
            limpiarTextoPDF(r.hTab)
        ]);
        autoTableLimpio(doc, {
            startY: y,
            head: [['Ambiente', 'IUG', 'TUG', 'TUE', 'TV/Datos', 'Tablero']],
            body: altData, theme: 'grid',
            headStyles: { fillColor: [230, 126, 34], fontSize: 7 },
            bodyStyles: { fontSize: 7 },
            columnStyles: { 0: { cellWidth: 60 } }
        });
        y = doc.lastAutoTable.finalY + 8;

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
        }

        doc.addPage();
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
        doc.text('PLANO DE UBICACION DE BOCAS', 105, 20, { align: 'center' });
        const canvas = document.getElementById('planoCanvas');
        if (canvas && planoElementos.length > 0) {
            try {
                const imgData = canvas.toDataURL('image/png');
                const maxW = 180;
                const ratio = canvas.height / canvas.width;
                doc.addImage(imgData, 'PNG', 15, 30, maxW, Math.min(maxW * ratio, 240));
            } catch(e) { doc.setFontSize(10); doc.text('No se pudo incluir la imagen.', 15, 40); }
        } else {
            doc.setFontSize(10);
            doc.setTextColor(120);
            doc.text('(Sin elementos en el plano)', 105, 40, { align: 'center' });
        }

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text('Pagina ' + i + ' de ' + pageCount, 105, 292, { align: 'center' });
            doc.text('Diseno orientativo segun AEA 90364-7-770. Consultar con profesional matriculado.', 105, 296, { align: 'center' });
        }

        doc.save('Diseno_Electrico_AEA770_v8_local.pdf');
        mostrarToast('✅ PDF exportado correctamente');
    } catch(e) {
        console.error('Error al exportar PDF:', e);
        alert('❌ Error al exportar PDF:\n' + e.message);
    }
}

// ============================================================
// EXPONER FUNCIONES GLOBALES (para onclick en el HTML)
// ============================================================
window.abrirManual = abrirManual;
window.irAModuloDPS = irAModuloDPS;
window.irAModuloDocumentacion = irAModuloDocumentacion;
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
window.agregarTablero = agregarTablero;
window.eliminarTablero = eliminarTablero;
window.actualizarTablero = actualizarTablero;
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
    // ✅ Volvimos del módulo DPS / Reparto / Manual (o recargamos) → autocargar
    proyectoActualId = proyectoRecordado;
    aplicarProyecto(proyectosExistentes[proyectoRecordado]);
    document.getElementById('selectorProyecto').value = proyectoRecordado;
    console.log('✅ Proyecto restaurado:', proyectosExistentes[proyectoRecordado].nombre);
} else if (idsProyectos.length > 0) {
    // Hay proyectos pero ninguno recordado → cargar el último
    const ultimoId = idsProyectos[idsProyectos.length - 1];
    proyectoActualId = ultimoId;
    localStorage.setItem('aea770_ultimo_proyecto', ultimoId);
    aplicarProyecto(proyectosExistentes[ultimoId]);
    document.getElementById('selectorProyecto').value = ultimoId;
    console.log('✅ Último proyecto cargado:', proyectosExistentes[ultimoId].nombre);
} else {
    // No hay proyectos → cargar ejemplo (sin ID, es solo demo)
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
        { id: 'Principal', nombre: 'Tablero Principal', planta: 'PB', long: 0, seccion: 4, iccArriba: 4.5, padre: null },
        { id: 'T1', nombre: 'Tablero Planta Alta', planta: 'PA', long: 15, seccion: 4, iccArriba: null, padre: 'Principal' }
    ];
    contadorTableros = 1;
    proyectoActualId = null;
    renderizarTodo();
    setTimeout(() => { inicializarPlano(); dibujarPlano(); actualizarContadoresPlano(); }, 200);
}