# Subsistemas Avanzados: Combate Elemental, Luna de Sangre y Economía

## 🪙 1. Economía, Progresión y "El Altar" (Tienda de Skins)
Subsistema diseñado para asegurar la retención del jugador mediante incentivos de progresión persistente.

*   **Drops con Físicas de Rebote:** Al aniquilar una entidad, se evalúa un umbral estocástico (`chance(0.6)`). De cumplirse, se instancia una divisa (*alma*) con el componente físico `body()`, recibiendo un impulso vertical inicial mediante `moneda.jump()` para simular una caída orgánica sobre el suelo.
*   **Persistencia de Estado:** El saldo y las preferencias cosméticas se resguardan en el cliente mediante claves tipadas (`xolotl_monedas_demo` y `xolotl_skin_activa`).
*   **El Altar (Escena `"shop"`):** Módulo desacoplado que procesa transacciones comerciales seguras, validando saldos y actualizando los flags de renderizado estético del avatar (*Serpiente Emplumada*, *Calavera del Mictlán*, etc.).

## 🔥 2. Orbes Elementales y Modificadores de Combate
Con el fin de elevar el techo de habilidad (*skill ceiling*), el motor procesa drops estocásticos de orbes al desintegrar entidades enemigas (`chance(0.15)`), con una vigencia de búfer temporal de 12 segundos:
*   **Fuego (`#ff6432`):** Duplica pasivamente el daño base del avatar (de `2` a `4` en melé; de `1` a `2` en láser) y modifica el tinte cromático del jugador.
*   **Hielo (`#64c8ff`):** Aplica un factor severo de reducción de velocidad cinemática (`enemy.velocidad *= 0.3`) a los enemigos impactados por proyectiles a distancia.
*   **Rayo (`#ffff00`):** Introduce propagación de daño en área por proximidad vectorial. Un ciclo síncrono evalúa la distancia euclidiana (`pos.dist()`) para fulminar entidades secundarias en un radio de 100 píxeles al conectar un golpe de espada.

## 🔴 3. Evento Dinámico: Luna de Sangre
Un disparador de alta entropía gobernado por el bucle temporal del **Game Director**, activándose cada 60 segundos de juego continuo durante una ventana estricta de **15 segundos**:
1.  **Transición Visual:** Ejecuta un destello de pantalla mediante un componente de vida útil (`lifespan`) e interpola el color del fondo principal hacia un tono carmesí de alerta (`rgb(255, 100, 100)`).
2.  **Multiplicador de Rendimiento:** Modifica el cálculo de puntuación en la función de bajas, aplicando un factor estricto de `x2` sobre los puntos obtenidos durante el evento.
3.  **Reseteo Automático:** Un temporizador asíncrono (`wait(15, ...)`), desactiva el indicador booleano `lunaDeSangreActiva`, restablece las propiedades cromáticas del entorno y emite un aviso táctico al HUD.