# HUD

Interfaz que se dibuja **encima** del canvas del juego: vidas, tiempo, puntaje y
avisos. Vive en `frontend/js/hud.js` y es el único archivo del proyecto que toca el
DOM de la interfaz — el resto del juego nunca llama a `document.getElementById`.

## Qué muestra

| Zona | Qué hay |
|---|---|
| Arriba a la izquierda | Título y controles (`#ui-layer`, ya existía) |
| Arriba al centro | Tiempo sobrevivido, puntos y récord |
| Arriba a la derecha | Corazones del Núcleo (dorados) y de Xolotl (cyan) |
| Al centro | Aviso pasajero, p. ej. cuando sube la dificultad |

Las vidas se dibujan con corazones de texto: los que te quedan salen llenos (`♥`) y
los que perdiste vacíos (`♡`), así se ve el daño de un vistazo y no hace falta
cargar ninguna imagen.

## Cómo se calcula el puntaje

El juego es de supervivencia infinita: no hay meta ni cuenta regresiva, se juega
hasta que el Núcleo o Xolotl se quedan sin vida. El puntaje mide qué tan lejos
llegaste:

- **1 punto por segundo** sobrevivido.
- **10 puntos** por matar un zombie.
- **15 puntos** por derribar un aéreo (vuela, es más difícil de acertar).

Sólo cuentan los enemigos que **tú** matas con la espada o el láser. Un enemigo que
se estrella contra el Núcleo o contra ti también desaparece, pero no da puntos:
ese golpe lo perdiste.

El mejor puntaje se guarda en el navegador (`localStorage`, clave `xolotl_record`) y
se muestra en el HUD y en la pantalla de fin del juego. Si el navegador tiene el
almacenamiento bloqueado (modo incógnito, permisos), el juego sigue funcionando
igual; sólo no se conserva el récord.

## Cómo se usa

`setupHUD()` se llama una vez al entrar a la escena `game` y devuelve las funciones
para actualizarlo. Como se llama al entrar a la escena, **todos los contadores nacen
en cero solos**: no hay que resetear nada a mano al reiniciar la partida.

```js
import { setupHUD, PUNTOS_ZOMBIE, PUNTOS_AEREO } from "./hud.js";

// Los máximos salen de la vida con la que arrancan, para no repetir los números
const hud = setupHUD(nucleo.hp, player.hp);

hud.setVidaNucleo(3);                 // repinta los corazones dorados
hud.setVidaJugador(1);                // repinta los corazones cyan
hud.contarEnemigo(PUNTOS_ZOMBIE);     // suma puntos y cuenta el kill
hud.sumarPuntos(50);                  // suma puntos sueltos, sin contar kill
hud.avisarOleada("Oleada mas rapida"); // mensaje al centro, se desvanece solo
hud.ocultar();                        // esconde el HUD (al perder)
hud.mostrar();                        // lo vuelve a mostrar

const resumen = hud.terminarPartida();
// -> { tiempo: "01:35", puntos: 250, enemigos: 14, record: 400, esRecord: false }
```

`terminarPartida()` cierra la partida: guarda el récord si lo rompiste y devuelve el
resumen que la escena `gameover` usa para mostrarte cómo te fue.

## Dónde vive cada pieza

- `frontend/js/hud.js` — toda la lógica y el estado del HUD.
- `frontend/index.html` — el markup dentro de `#hud`. Los ids son los que busca
  `hud.js`, así que conviene no renombrarlos a la ligera.
- `frontend/css/style.css` — los estilos, bajo el comentario `HUD`. La capa lleva
  `pointer-events: none` para que los clics pasen de largo hacia el juego.

## Probarlo en local

`main.js` usa módulos ES, así que abrir el `index.html` con doble clic **no**
funciona (el navegador lo bloquea por CORS). Hay que servirlo. Desde la carpeta
`frontend/` del repo:

```bash
python3 -m http.server 8000
```

Y abrir <http://localhost:8000>. Cualquier servidor estático sirve igual.
