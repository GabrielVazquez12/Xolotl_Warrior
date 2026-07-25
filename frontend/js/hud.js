// ============================================================
//  HUD: todo lo que se ve ENCIMA del canvas (vidas, tiempo,
//  puntaje y avisos).
//
//  Este archivo es el UNICO que toca el DOM de la interfaz.
//  El resto del juego nunca llama a document.getElementById:
//  solo usa las funciones que devuelve setupHUD().
// ============================================================

// --- Cuanto vale cada cosa ---
const PUNTOS_POR_SEGUNDO = 1;    // por sobrevivir
export const PUNTOS_ZOMBIE = 10; // por matar a un zombie
export const PUNTOS_AEREO = 15;  // por matar a un aereo (vuela, es mas dificil)

const DURACION_AVISO = 1800;          // milisegundos que dura el mensaje de oleada
const CLAVE_RECORD = "xolotl_record"; // nombre con el que el navegador guarda el record

// Los corazones son solo texto, asi no hace falta cargar ninguna imagen
const CORAZON_LLENO = "♥";
const CORAZON_VACIO = "♡";

/**
 * Devuelve una fila de corazones: los que te quedan llenos y el resto vacios.
 * Ejemplo: corazones(2, 5) -> llenos, llenos, vacio, vacio, vacio
 */
function corazones(vidas, maximo) {
    const llenos = Math.max(0, vidas); // por si la vida alcanza a bajar de cero
    const vacios = Math.max(0, maximo - llenos);
    return CORAZON_LLENO.repeat(llenos) + CORAZON_VACIO.repeat(vacios);
}

/** Convierte 95 segundos en "01:35" */
function formatearTiempo(segundos) {
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

// El navegador puede tener el almacenamiento bloqueado (modo incognito, permisos).
// Si falla, el juego debe seguir corriendo: simplemente no hay record.
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
    } catch {
        // Sin almacenamiento no pasa nada, el record solo no se conserva
    }
}

/**
 * Prepara el HUD para una partida nueva y devuelve las funciones para actualizarlo.
 *
 * Se llama al entrar a la escena "game", asi que todos los contadores nacen en cero
 * solos: no hay que resetear nada a mano al reiniciar.
 *
 * @param {number} hpNucleoMax  vidas totales del Nucleo (cuantos corazones dibujar)
 * @param {number} hpJugadorMax vidas totales de Xolotl
 */
export function setupHUD(hpNucleoMax, hpJugadorMax) {
    // 1. Buscamos los elementos del HTML una sola vez
    const elTiempo = document.getElementById("hud-tiempo");
    const elPuntos = document.getElementById("hud-puntos");
    const elRecord = document.getElementById("hud-record");
    const elVidaNucleo = document.getElementById("hud-vida-nucleo");
    const elVidaJugador = document.getElementById("hud-vida-jugador");
    const elAviso = document.getElementById("hud-aviso");

    // Lo que se esconde al perder. Incluimos #ui-layer (titulo y controles) para
    // conservar el comportamiento que ya tenia la pantalla de fin del juego.
    const capas = [document.getElementById("hud"), document.getElementById("ui-layer")];

    // 2. Estado de ESTA partida
    let tiempo = 0;            // segundos, con decimales
    let segundosPremiados = 0; // ultimo segundo entero por el que ya dimos puntos
    let puntos = 0;
    let enemigos = 0;
    const record = leerRecord();

    // 3. Pintamos el estado inicial
    elTiempo.innerText = formatearTiempo(0);
    elPuntos.innerText = "0";
    elRecord.innerText = String(record);
    elVidaNucleo.innerText = corazones(hpNucleoMax, hpNucleoMax);
    elVidaJugador.innerText = corazones(hpJugadorMax, hpJugadorMax);
    elAviso.classList.remove("visible");
    mostrar();

    // 4. El cronometro corre solo mientras dure la escena
    onUpdate(() => {
        tiempo += dt();
        elTiempo.innerText = formatearTiempo(tiempo);

        // Cada vez que se completa un segundo, premiamos al jugador por seguir vivo
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

    /** Un enemigo cayo: suma sus puntos y lo cuenta para el resumen final. */
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

    // 5. Aviso pasajero al centro de la pantalla (lo usa enemies.js cuando sube la
    //    dificultad). Se desvanece solo; el CSS se encarga de la transicion.
    let temporizadorAviso = null;
    function avisarOleada(texto) {
        elAviso.innerText = texto;
        elAviso.classList.add("visible");

        // Si llega otro aviso antes de que se vaya el anterior, reiniciamos la cuenta
        clearTimeout(temporizadorAviso);
        temporizadorAviso = setTimeout(() => {
            elAviso.classList.remove("visible");
        }, DURACION_AVISO);
    }

    function ocultar() {
        capas.forEach((capa) => { capa.style.display = "none"; });
    }

    function mostrar() {
        capas.forEach((capa) => { capa.style.display = "block"; });
    }

    /**
     * Cierra la partida: guarda el record si lo rompiste y devuelve el resumen
     * que muestra la pantalla de fin del juego.
     */
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
        avisarOleada,
        ocultar,
        mostrar,
        terminarPartida,
    };
}
