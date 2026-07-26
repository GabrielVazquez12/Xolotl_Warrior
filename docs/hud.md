# Interfaz de Usuario (HUD) y Gestión del DOM

## 🖥️ Arquitectura de la Interfaz
El HUD se dibuja de forma independiente en una capa superpuesta al canvas del juego. Su lógica reside exclusivamente en `frontend/js/hud.js`, constituyendo **el único punto del proyecto autorizado para manipular el DOM** (`document.getElementById`). Ninguna otra entidad del juego interactúa directamente con los elementos HTML de la interfaz.

## 📐 Distribución de Zonas (`#hud`)
| Zona del DOM | Componente Visual | Descripción Técnica |
|---|---|---|
| Superior Izquierda | Trazador de Control | Contenedor estático con metadatos de accesos directos y branding. |
| Superior Central | Métricas de Partida | Indicadores en tiempo real del cronómetro de supervivencia, puntaje actual y récord histórico. |
| Superior Derecha | Vidades Sanitarias | Renderizado textual de corazones dorados para el Núcleo y cian para Xolotl. |
| Centro Dinámico | Sistema de Alertas | Emisión temporal de notificaciones tácticas sobre escalados de dificultad o eventos. |

*Nota de rendimiento:* Las vidas se representan mediante caracteres tipográficos dinámicos (`♥` para estados activos, `♡` para estados críticos), eliminando la sobrecarga de renderizado de texturas adicionales.

## 🧮 Algoritmo de Puntuación
Al tratarse de un entorno de supervivencia infinita, el rendimiento se cuantifica mediante una función lineal acumulativa:
*   **1 punto por segundo** de supervivencia activa.
*   **10 puntos** por neutralización confirmada de unidades terrestres (`minion` / `zombie`).
*   **15 puntos** por neutralización de unidades aéreas (*skill shot* debido a su movilidad multidimensional).

*Restricción de Bajas:* Únicamente otorgan puntuación las entidades destruidas de forma directa por el jugador mediante melé o proyectiles a distancia. Las colisiones directas de enemigos contra el Núcleo o el avatar provocan daño al jugador pero se descartan del cómputo de puntaje.

## 💾 Mecánica de Persistencia del Récord
El puntaje máximo histórico se sincroniza de forma segura con el almacenamiento local del cliente (`localStorage`, clave `xolotl_record`). En arquitecturas con restricciones de seguridad de sesión (navegación en modo incógnito o bloqueo de permisos), el sistema degrada de manera elegante manteniendo la operatividad en memoria volátil sin comprometer la ejecución del bucle de juego.

## 🔌 API y Contrato de Uso (`setupHUD`)
La función `setupHUD()` se inicializa de manera síncrona al instanciar la escena `game`, garantizando un estado inicial limpio en cero:

```js
import { setupHUD, PUNTOS_ZOMBIE, PUNTOS_AEREO } from "./hud.js";

const hud = setupHUD(nucleo.hp, player.hp);

hud.setVidaNucleo(3);             // Actualiza corazones dorados del núcleo
hud.setVidaJugador(1);            // Actualiza corazones cian del avatar
hud.contarEnemigo(PUNTOS_ZOMBIE); // Incrementa puntaje y contador de bajas
hud.sumarPuntos(50);              // Inyección de puntaje asíncrono
hud.avisarOleada("Alerta Roja");  // Despliegue de notificación central
hud.ocultar();                    // Ocultamiento de la capa en Game Over
hud.mostrar();                    // Restablecimiento visual

const resumen = hud.terminarPartida();
// Retorno estructurado: { tiempo: "01:35", puntos: 250, enemigos: 14, record: 400, esRecord: false }