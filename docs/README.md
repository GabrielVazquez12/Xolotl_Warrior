# `docs/` — Documentación técnica

> Los documentos de profundidad, uno por subsistema. Aquí se explica **cómo está construido** el juego; en los READMEs de cada carpeta se explica **por qué está construido así**.

[← Volver al README principal](../README.md) · [Jugar](https://main.d5hw5vsttp0x1.amplifyapp.com)

---

## Cómo navegar la documentación

El proyecto tiene dos niveles de documentación que se complementan.

```mermaid
flowchart TD
    ROOT["<b>README.md</b> (raíz)<br/>Temática · cómo jugar · controles<br/><i>para cualquiera que llegue al repo</i>"]

    ROOT --> FE["<b>frontend/README.md</b><br/>Arranque · dos capas · sin build step"]
    ROOT --> BE["<b>backend/README.md</b><br/>API · serverless · contrato"]
    ROOT --> DOCS["<b>docs/</b><br/>profundidad por subsistema"]

    FE --> JS["<b>js/README.md</b><br/>los 6 módulos, línea por línea"]
    FE --> CSS["<b>css/README.md</b><br/>capa de interfaz"]
    FE --> AS["<b>assets/README.md</b><br/>sprites y sprite sheet"]

    DOCS --> D1["architecture.md"]
    DOCS --> D2["player.md · enemies.md · mechanics.md"]
    DOCS --> D3["hud.md · assets.md"]
    DOCS --> D4["ci-cd.md"]

    classDef entrada fill:#3a2a1a,stroke:#ffd700,stroke-width:3px,color:#fff
    classDef carpeta fill:#1a2a3a,stroke:#00cfff,stroke-width:2px,color:#fff
    classDef doc fill:#1a3a2a,stroke:#00ff9f,stroke-width:2px,color:#fff
    class ROOT entrada
    class FE,BE,DOCS,JS,CSS,AS carpeta
    class D1,D2,D3,D4 doc
```

**Regla práctica:**

| Si quieres... | Ve a... |
|---|---|
| Jugar o entender de qué va el juego | [`README.md`](../README.md) raíz |
| Entender **por qué** un archivo existe y qué decisiones lo formaron | El `README.md` de su carpeta |
| Entender **cómo** funciona un subsistema en detalle | Los documentos de aquí |

---

## Índice

| Documento | Cubre | Léelo si... |
|---|---|---|
| [`architecture.md`](architecture.md) | Filosofía de diseño, separación de responsabilidades, la máquina de estados de escenas y el sistema de pausa absoluta | Es tu primer contacto con el código y quieres el mapa general |
| [`player.md`](player.md) | El controlador del avatar: locomoción, sprint, vuelo, dash espectral, los dos ataques, la ulti y las mutaciones de color | Vas a tocar `player.js` o ajustar el *game feel* |
| [`enemies.md`](enemies.md) | El Game Director, la curva de progresión, los tres tiers de amenaza, el sistema de alertas y el knockback | Vas a balancear la dificultad o agregar un enemigo |
| [`mechanics.md`](mechanics.md) | Los tres subsistemas avanzados: economía y El Altar, orbes elementales y la Luna de Sangre | Vas a tocar la progresión o el combate elemental |
| [`hud.md`](hud.md) | La interfaz, la gestión del DOM, el algoritmo de puntuación y la persistencia del récord | Vas a modificar el HUD o el sistema de puntos |
| [`assets.md`](assets.md) | Carga centralizada de recursos y el mapeo de la hoja de sprites 6×6 | Vas a agregar sprites, animaciones o sonido |
| [`ci-cd.md`](ci-cd.md) | Topología cloud, el pipeline de despliegue en AWS Amplify y el endpoint de producción | Vas a desplegar, romper el build o mover la infraestructura |

---

## El sistema completo de un vistazo

```mermaid
flowchart LR
    subgraph ENTRADA["Entrada del jugador"]
        KB["Teclado<br/>WASD · flechas · Q J K E · ESC"]
    end

    subgraph JUEGO["Bucle de juego"]
        PL["<b>player.js</b><br/>movimiento · vuelo<br/>dash · ataques"]
        MAIN["<b>main.js</b><br/>colisiones · daño<br/>elementos · ulti · pausa"]
        EN["<b>enemies.js</b><br/>spawn por tiers · IA<br/>Game Director · drops"]
    end

    subgraph SALIDA["Salida al jugador"]
        HUD["<b>hud.js</b><br/>vidas · tiempo<br/>puntos · avisos"]
        CV["<b>canvas</b><br/>sprites y efectos"]
    end

    subgraph NUBE["Persistencia"]
        LS[("localStorage<br/>récord · almas · skin")]
        AWS[("AWS<br/>leaderboard global")]
    end

    KB --> PL
    PL --> MAIN
    EN --> MAIN
    MAIN --> HUD
    MAIN --> CV
    EN -.->|avisos| HUD
    HUD --> LS
    MAIN --> LS
    MAIN -->|"POST al morir"| AWS

    classDef in fill:#3a1a4a,stroke:#ff55ff,stroke-width:2px,color:#fff
    classDef core fill:#3a2a1a,stroke:#ffd700,stroke-width:2px,color:#fff
    classDef out fill:#1a3a2a,stroke:#00ff9f,stroke-width:2px,color:#fff
    classDef store fill:#1a3a5c,stroke:#ff9900,stroke-width:2px,color:#fff
    class KB in
    class PL,MAIN,EN core
    class HUD,CV out
    class LS,AWS store
```

---

## Estado de la documentación

Todos los documentos de esta carpeta reflejan el código en `main` a la fecha de la última revisión. Los puntos donde documentación y código **no** coinciden están señalados explícitamente en lugar de omitirse:

| Desfase conocido | Dónde |
|---|---|
| `ci-cd.md` describe un `amplify.yml`, pero ese archivo **no está versionado** en el repo — la configuración vive en la consola de Amplify | [`ci-cd.md`](ci-cd.md) §4 |
| El código de la Lambda de producción **no está en el repositorio**; `backend/server.js` es la implementación de referencia local | [`backend/README.md`](../backend/README.md#lo-primero-que-hay-que-entender-hay-dos-backends) |
| `audio.js` está completo pero **desconectado**: faltan los archivos de sonido | [`frontend/js/README.md`](../frontend/js/README.md#audiojs--el-sonido-en-espera) |
| Los enemigos se dibujan con primitivas geométricas; aún no tienen sprites | [`frontend/assets/README.md`](../frontend/assets/README.md#los-enemigos-no-tienen-sprites-todavía) |

---

## Al escribir documentación nueva

1. **Un documento por subsistema**, no por archivo. Si un subsistema cruza varios archivos (como la pausa absoluta), se documenta completo en un solo lugar.
2. **Explicar el porqué, no solo el qué.** El código ya dice qué hace; la documentación existe para decir por qué se decidió así y qué se descartó.
3. **Marcar los desfases en vez de ocultarlos.** Una sección honesta sobre lo que falta vale más que una que finge que está todo terminado.
4. **En español**, como el resto del proyecto.
5. **Diagramas en Mermaid**, no en ASCII: GitHub los renderiza nativamente y se mantienen legibles al editarlos.
