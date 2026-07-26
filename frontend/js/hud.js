// ============================================================
//  HUD: todo lo que se ve ENCIMA del canvas (vidas, tiempo,
//  puntaje y avisos).
// ============================================================

const PUNTOS_POR_SEGUNDO = 1;    
export const PUNTOS_ZOMBIE = 10; 
export const PUNTOS_AEREO = 15;  

const DURACION_AVISO = 1800;          
const CLAVE_RECORD = "xolotl_record"; 

const CORAZON_LLENO = "♥";
const CORAZON_VACIO = "♡";

function corazones(vidas, maximo) {
    const llenos = Math.max(0, vidas);
    const vacios = Math.max(0, maximo - llenos);
    return CORAZON_LLENO.repeat(llenos) + CORAZON_VACIO.repeat(vacios);
}

function formatearTiempo(segundos) {
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

function leerRecord() {
    try {
        return Number(localStorage.getItem(CLAVE_RECORD)) || 0;
    } catch {
        return 0;
    }
}

function guardarRecord(puntos) {
    try {
        localStorage.setItem(CLAVE_RECORD, String(puntos));
    } catch {}
}

export function setupHUD(hpNucleoMax, hpJugadorMax) {
    const elTiempo = document.getElementById("hud-tiempo");
    const elPuntos = document.getElementById("hud-puntos");
    const elRecord = document.getElementById("hud-record");
    const elVidaNucleo = document.getElementById("hud-vida-nucleo");
    const elVidaJugador = document.getElementById("hud-vida-jugador");
    const elAviso = document.getElementById("hud-aviso");

    const capas = [document.getElementById("hud"), document.getElementById("ui-layer")];

    let tiempo = 0;            
    let segundosPremiados = 0; 
    let puntos = 0;
    let enemigos = 0;
    const record = leerRecord();

    // Estado de la barra de energía espiritual (0 a 100)
    let energia = 0;
    const elEnergia = document.getElementById("hud-energia"); // Opcional si lo agregas al HTML

    elTiempo.innerText = formatearTiempo(0);
    elPuntos.innerText = "0";
    elRecord.innerText = String(record);
    elVidaNucleo.innerText = corazones(hpNucleoMax, hpNucleoMax);
    elVidaJugador.innerText = corazones(hpJugadorMax, hpJugadorMax);
    if (elEnergia) elEnergia.innerText = "0%";
    elAviso.classList.remove("visible");
    mostrar();

    // Cronómetro protegido con el candado de pausa
    onUpdate(() => {
        if (window.juegoPausado) return;

        tiempo += dt();
        elTiempo.innerText = formatearTiempo(tiempo);

        const enteros = Math.floor(tiempo);
        if (enteros > segundosPremiados) {
            sumarPuntos((enteros - segundosPremiados) * PUNTOS_POR_SEGUNDO);
            segundosPremiados = enteros;
        }
    });

    function sumarPuntos(cantidad) {
        puntos += cantidad;
        elPuntos.innerText = String(puntos);
    }

    function contarEnemigo(valor) {
        enemigos += 1;
        sumarPuntos(valor);
    }

    function setVidaNucleo(vidas) {
        elVidaNucleo.innerText = corazones(vidas, hpNucleoMax);
    }

    function setVidaJugador(vidas) {
        elVidaJugador.innerText = corazones(vidas, hpJugadorMax);
    }

    function cargarEnergia(cantidad) {
        if (energia < 100) {
            energia = Math.min(100, energia + cantidad);
            if (elEnergia) elEnergia.innerText = `${energia}%`;
            if (energia === 100) {
                avisarOleada("¡⚡ ULTI ESPIRITUAL LISTA! (Presiona E)");
            }
        }
    }

    function gastarEnergia() {
        if (energia >= 100) {
            energia = 0;
            if (elEnergia) elEnergia.innerText = "0%";
            return true;
        }
        return false;
    }

    let temporizadorAviso = null;
    function avisarOleada(texto) {
        elAviso.innerText = texto;
        elAviso.classList.add("visible");

        clearTimeout(temporizadorAviso);
        temporizadorAviso = setTimeout(() => {
            elAviso.classList.remove("visible");
        }, DURACION_AVISO);
    }

    function ocultar() {
        capas.forEach((capa) => { if (capa) capa.style.display = "none"; });
    }

    function mostrar() {
        capas.forEach((capa) => { if (capa) capa.style.display = "block"; });
    }

    function terminarPartida() {
        const esRecord = puntos > record;
        if (esRecord) guardarRecord(puntos);

        return {
            tiempo: formatearTiempo(tiempo),
            puntos,
            enemigos,
            record: Math.max(puntos, record),
            esRecord,
        };
    }

    return {
        setVidaNucleo,
        setVidaJugador,
        sumarPuntos,
        contarEnemigo,
        cargarEnergia,
        gastarEnergia,
        avisarOleada,
        ocultar,
        mostrar,
        terminarPartida,
    };
}