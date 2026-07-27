# `frontend/assets/` — Recursos gráficos

> Dos archivos. 500 KB. Todo el arte del juego.

[← Volver a frontend](../README.md) · [← README principal](../../README.md)

---

## Qué hay aquí

```
assets/
└── sprites/
    ├── xolotl_sheet.png    417 KB · 840×684 · PNG RGBA · hoja de 6×6
    └── fondo.png            86 KB · 1024×572 · fondo del escenario
```

Los carga [`../js/assets.js`](../js/README.md#assetsjs--los-recursos), que es el único módulo autorizado a hacerlo.

---

## El personaje

El protagonista es un **fantasma**: un espíritu blanco y flotante, sin piernas, con la cola difuminada típica de las apariciones. Es un guiño directo al fantasma de **Kiro**, la herramienta con la que se construyó buena parte de este proyecto.

Sobre esa base espectral se monta la identidad mexica: un **penacho de guerrero águila** con plumas verdes, rojas, azules y doradas, y una **máscara de jaguar** con ojos brillantes. El resultado es un fantasma que no se lee como genérico, sino como un guerrero del Mictlán.

Empuña dos armas distintas según la animación:
- Una **lanza / átlatl** de punta de pedernal para el ataque cuerpo a cuerpo (`J`)
- Un **tridente con llama espectral cian** para el disparo a distancia (`K`)

---

## La hoja de sprites (`xolotl_sheet.png`)

Una sola imagen contiene las 6 animaciones del personaje, repartidas en una rejilla de **6 columnas × 6 filas = 36 celdas**.

|  | col 0 | col 1 | col 2 | col 3 | col 4 | col 5 | Animación |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **fila 0** | `0` | `1` | `2` | `3` | `4` | `5` | **`idle`** — flotando en reposo |
| **fila 1** | `6` | `7` | `8` | `9` | `10` | `11` | **`walk`** — desplazándose |
| **fila 2** | `12` | `13` | `14` | `15` | `16` | `17` | **`melee`** — lanzazo |
| **fila 3** | `18` | `19` | `20` | `21` | `22` | `23` | **`shoot`** — tridente con llama |
| **fila 4** | `24` | `25` | `26` | `27` | *vacía* | *vacía* | **`hit`** — retroceso |
| **fila 5** | `30` | `31` | `32` | `33`\* | *vacía* | *vacía* | **`death`** — disipación |

\* La celda `33` tiene arte pero no está declarada en la animación. Ver [Los cuadros que no se usan](#los-cuadros-que-no-se-usan).

Cada celda mide **140 × 114 px** (840÷6 × 684÷6).

### El mapeo en código

```js
loadSprite("xolotl", "assets/sprites/xolotl_sheet.png", {
    sliceX: 6, sliceY: 6,
    anims: {
        idle:  { from: 0,  to: 5,  loop: true,  speed: 8  },
        walk:  { from: 6,  to: 11, loop: true,  speed: 12 },
        melee: { from: 12, to: 17, loop: false, speed: 20 },
        shoot: { from: 18, to: 23, loop: false, speed: 15 },
        hit:   { from: 24, to: 27, loop: false, speed: 12 },
        death: { from: 30, to: 32, loop: false, speed: 10 },
    },
});
```

`sliceX: 6, sliceY: 6` le dice a Kaboom cómo cortar la imagen. A partir de ahí los cuadros se numeran **de izquierda a derecha, de arriba a abajo**, empezando en 0.

### Por qué cada animación tiene esa velocidad

| Animación | Cuadros | `speed` | Bucle | Razón |
|---|---|---|---|---|
| `idle` | 0–5 | 8 | Sí | Lenta y suave. Es el flotado en reposo del fantasma; a más velocidad se vería nervioso |
| `walk` | 6–11 | 12 | Sí | Más ágil que el idle para que se lea el desplazamiento |
| `melee` | 12–17 | **20** | No | **La más rápida.** El lanzazo debe sentirse instantáneo y contundente. Encaja con el cooldown de 0.25s del ataque |
| `shoot` | 18–23 | 15 | No | Rápida pero con más presencia que la espada: hay que ver encenderse la llama del tridente |
| `hit` | 24–27 | 12 | No | Solo 4 cuadros. Corta a propósito: interrumpe pero devuelve el control rápido |
| `death` | 30–32 | 10 | No | La más lenta. El fantasma se disipa; darle peso es parte del cierre de la partida |

**Ninguna de las animaciones de acción hace bucle** (`loop: false`). Al terminar, `player.js` las devuelve a `idle`:

```js
player.onAnimEnd((anim) => {
    if (anim === "melee" || anim === "shoot" || anim === "hit") player.play("idle");
});
```

### Los cuadros que no se usan

De las 36 celdas, **34 tienen arte y 33 se usan**:

- **Celdas 28 y 29** están vacías. `hit` solo necesitaba 4 cuadros, no 6, y la fila se dejó incompleta en vez de rellenarla con cuadros de relleno.
- **Celda 33** existe (es el último resto del fantasma casi disuelto) pero **no está declarada**: `death` va de 30 a 32. Extender la animación a `to: 33` haría la desaparición más completa. Es un cambio de un carácter, pendiente de revisar cómo se siente en juego.

---

## El fondo (`fondo.png`)

Se dibuja detrás de todo con profundidad negativa y escalado a la ventana:

```js
const fondo = add([
    sprite("fondo", { width: width(), height: height() }),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(255, 255, 255),   // ← tinte neutro, se modifica en runtime
    z(-1)                   // ← siempre al fondo
]);
```

### El tinte de la Luna de Sangre

El `color()` del fondo arranca en blanco puro (`255, 255, 255`), que en Kaboom significa **sin teñir**. Durante la Luna de Sangre, `main.js` lo cambia cada frame:

```js
onUpdate(() => {
    if (window.juegoPausado) return;
    if (enemiesSystem.isLunaDeSangreActiva()) {
        fondo.color = rgb(255, 100, 100);    // carmesí
    } else {
        fondo.color = rgb(255, 255, 255);    // normal
    }
});
```

**Por eso el fondo se guarda en una variable** en vez de añadirlo y olvidarlo: es la única forma de teñirlo en tiempo real. Un multiplicador de color sobre una textura existente cuesta prácticamente cero, mucho menos que cargar y cruzar dos imágenes distintas.

> **Nota técnica:** el archivo se llama `fondo.png` pero su contenido es en realidad un **JPEG** (`JPEG image data, 1024x572`). Los navegadores detectan el formato real por los bytes del archivo, no por la extensión, así que **carga y funciona sin problema**. Vale la pena renombrarlo a `.jpg` en algún momento por higiene, pero no es un bug.

---

## Por qué una sola hoja y no 36 archivos

| Razón | Detalle |
|---|---|
| **Una petición de red** | 36 imágenes sueltas serían 36 peticiones HTTP. Con una hoja, el juego arranca tras una sola descarga |
| **Una textura en GPU** | Kaboom sube la imagen a memoria de video una vez. Cambiar de animación es mover coordenadas UV, no rebindear texturas: el dibujado se mantiene barato |
| **Sin desgarro visual** | Con archivos sueltos, uno podría llegar tarde y verse un cuadro faltante a mitad de animación. Con la hoja, o está todo o no está nada |
| **Consistencia de arte** | Trabajar en una sola imagen mantiene alineado el registro entre cuadros: el personaje no "salta" de posición al cambiar de animación |

---

## Los enemigos no tienen sprites (todavía)

Actualmente **todos** los enemigos, orbes, monedas y el Núcleo se dibujan con **primitivas geométricas** de Kaboom:

```js
// Enemigo terrestre
add([ rect(30 * tamano, 30 * tamano), color(colorEnemigo), /* ... */ ]);
// Alma / moneda
add([ circle(7), color(255, 215, 0), body(), /* ... */ ]);
// Orbe elemental
add([ circle(10), color(colorOrbe), /* ... */ ]);
// Núcleo Sagrado
add([ rect(60, 80), color(255, 215, 0), /* ... */ ]);
```

Esto **no es un placeholder roto**: es una decisión que sostiene el juego completo. Las primitivas se rasterizan directo en GPU sin textura ni descarga, así que la tasa de refresco se mantiene estable aunque haya decenas de enemigos en pantalla, y el juego arranca al instante.

El **código de colores es funcional**, no decorativo: te dice al instante qué amenaza tienes enfrente sin necesidad de leer una barra de vida.

| Color | Entidad |
|---|---|
| Verde claro | Terrestre Tier 1 |
| Naranja | Terrestre Tier 2 |
| Rojo | Terrestre Tier 3 (jefe) |
| Rosa | Aéreo Tier 1 |
| Morado | Aéreo Tier 2 |
| Violeta | Aéreo Tier 3 (jefe) |
| Dorado | Núcleo Sagrado y almas |

Cuando existan sprites de enemigos, sustituir `rect(...)` por `sprite(...)` es un cambio localizado dentro de `spawnTerrestre` y `spawnAereo` en [`../js/enemies.js`](../js/README.md#enemiesjs--la-horda). El resto del código no se entera: la IA, las colisiones y el sistema de tiers no dependen de cómo se dibuja el enemigo.

---

## Carpetas pendientes

`assets.js` ya tiene las rutas de audio escritas y comentadas, esperando los archivos:

```js
//loadSound("gameMusic",     "assets/music/gameplay.mp3");
//loadSound("gameOverMusic", "assets/music/gameover.mp3");
//loadSound("sword",         "assets/sounds/sword.wav");
//loadSound("laserSound",    "assets/sounds/laser.wav");
//loadSound("dash",          "assets/sounds/dash.wav");
//loadSound("enemyHit",      "assets/sounds/enemy_hit.wav");
//loadSound("enemyDie",      "assets/sounds/enemy_die.wav");
//loadSound("playerHit",     "assets/sounds/player_hit.wav");
//loadSound("gameOver",      "assets/sounds/gameover.wav");
```

Las carpetas `assets/music/` y `assets/sounds/` **aún no existen**. Crearlas y poner los archivos con esos nombres exactos es todo lo que falta del lado de recursos; el código de reproducción ya está escrito en [`../js/audio.js`](../js/README.md#audiojs--el-sonido-en-espera).

---

## Convenciones para agregar recursos

1. **Todo se carga en `assets.js`**, nunca desde otro módulo. Un solo punto de entrada para saber qué pesa el juego.
2. **Rutas relativas a `frontend/`**, no a `js/`. Kaboom las resuelve desde el documento HTML, no desde el módulo.
3. **Preferir hojas de sprites** sobre archivos sueltos cuando sean varios cuadros del mismo elemento.
4. **Registrar las animaciones nuevas en el bloque `anims`** en vez de reproducir rangos de cuadros a mano desde el código de juego.
