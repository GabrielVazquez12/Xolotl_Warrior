# Arquitectura General y Ciclo de Vida del Sistema

## 🏗️ Filosofía de Diseño y Separación de Responsabilidades
El motor de **Xolotl Warrior** descarta por completo el desarrollo monolítico (*spaghetti code*). La base de código implementa una estricta **Separación de Responsabilidades (Separation of Concerns)** utilizando módulos nativos de ES6 y el motor de renderizado basado en entidades de **Kaboom.js**.

La arquitectura está desacoplada en los siguientes componentes principales (`frontend/js/`):
*   **`main.js`**: Director orquestador de la máquina de estados finitos (escenas), bucles de eventos globales, gestión de colisiones cruzadas y el sistema de pausa absoluta.
*   **`player.js`**: Controlador cinemático del avatar, resolución de entradas de usuario, físicas de desplazamiento vertical/horizontal y despacho de ataques.
*   **`enemies.js`**: Inteligencia artificial de entidades hostiles, factorías de generación por niveles (*Tiers*) y el **Game Director** encargado de la progresión temporal y eventos dinámicos.
*   **`hud.js`**: Capa de interfaz reactiva estrictamente aislada del canvas principal, siendo el único punto de contacto con el DOM del navegador.
*   **`assets.js`**: Gestor centralizado de carga de recursos gráficos y hojas de sprites (*sprite sheets*).

## 🎬 Máquina de Estados Finitos (Escenas)
La aplicación opera mediante transiciones controladas de escenas administradas por el ciclo de vida del motor:
1.  **`menu`**: Pantalla de presentación que renderiza partículas procedurales en bucle (`chispa`), un avatar flotante con interpolación trigonométrica senoidal (`wave`), y tipografía reactiva con escalado dinámico. Permite iniciar el reto o acceder al Altar.
2.  **`game`**: El núcleo de la experiencia interactiva. Inicializa las constantes gravitacionales globales (`setGravity(1800)`), el plano físico de colisión inferior (`ALTO_PISO`), el Núcleo sagrado y los subsistemas externos.
3.  **`shop` (El Altar):** Escena orientada a la persistencia de progresión y personalización cosmética del avatar.
4.  **`gameover`**: Módulo de cierre que recopila métricas de rendimiento (tiempo transcurrido, bajas confirmadas, puntaje total) y evalúa la persistencia del récord histórico local.

## ⏸️ Sistema de Pausa Absoluta
Accionado mediante la interrupción de teclado `ESC`. Al activarse, muta una bandera de estado global (`window.juegoPausado = true`) que intercepta y congela de manera síncrona los bucles de actualización en entidades, colisiones y temporizadores del Game Director. Renderiza una capa de interfaz semitransparente con opciones de continuidad o retorno al menú principal (`M`).