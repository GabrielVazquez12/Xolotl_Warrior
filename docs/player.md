# Controlador del Jugador y Cinemática (`player.js`)

## 🕹️ Arquitectura del Avatar
El módulo `frontend/js/player.js` encapsula toda la lógica de control, físicas de movimiento, estados elementales y sistemas ofensivos de **Xolotl**. Se comunica con el director principal mediante un objeto de retorno que expone las propiedades de estado y salud.

## 🏃 Locomoción y Cinemática
*   **Desplazamiento Horizontal:** Movimiento fluido sobre el eje X controlado mediante las entradas de teclado `A`/`D` o flechas direccionales.
*   **Velocidad de Sprint (`SHIFT`):** Multiplicador de velocidad de desplazamiento activo al mantener presionada la tecla de carrera.
*   **Sistema de Vuelo / Planeo (`SPACE x2`):** Mecánica de elevación asistida por gravedad reducida al pulsar dos veces la barra espaciadora, emulando un comportamiento de flotación táctica.

## ⚡ Habilidades Especiales y Combate
*   **Spectral Dash (`Q`):** Desplazamiento cinemático evasivo de alta velocidad que otorga un búfer de invulnerabilidad temporal al jugador, permitiendo cruzar oleadas hostiles sin recibir daño.
*   **Ataque Melé con Espada (`J`):** Generación dinámica de una hitbox direccional orientada al vector de vista del avatar, con cálculo de daño base escalable por elementos.
*   **Láser Espiritual (`K`):** Emisión de proyectiles a distancia que interactúan con las físicas de colisión de los enemigos y aplican penalizaciones de velocidad (efecto hielo).
*   **Ultimate Espiritual (`E`):** Onda expansiva de limpieza de pantalla basada en el consumo de energía acumulada por bajas. Utiliza curvas de aceleración (`easings.easeOutQuad`) para desintegrar enemigos menores y aplicar daño masivo a jefes de Tier 3.

## 🎨 Mutaciones de Estado y Skins
El avatar procesa cambios cromáticos dinámicos en tiempo real según dos factores:
1.  **Skins del Altar:** Aplicación de colores base al iniciar la partida según la personalización elegida en `localStorage` (*Serpiente Emplumada*, *Calavera del Mictlán*).
2.  **Orbes Elementales:** Alteración temporal de la propiedad `player.color` y del factor de daño al capturar orbes de **Fuego**, **Hielo** o **Rayo**.