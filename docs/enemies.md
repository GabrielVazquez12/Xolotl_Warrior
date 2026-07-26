# Inteligencia Artificial, Tiers de Amenaza y Game Director

## 🎯 1. El Game Director y Curva de Progresión
La generación de entidades hostiles no opera mediante oleadas estáticas, sino a través de un algoritmo adaptativo gestionado en `frontend/js/enemies.js`. Un acumulador temporal (`segundosJugados`) incrementa la dificultad de forma orgánica:
*   **Frecuencia de Spawn:** Los intervalos de aparición de enemigos se reducen progresivamente a medida que transcurren los minutos de supervivencia.
*   **Activación de Contenido:** Las unidades aéreas se habilitan a partir del segundo 30; los enemigos de Tier 2 (mutados) ingresan en el segundo 60; y los minijefes de Tier 3 despliegan alertas críticas en ciclos regulares.

## 🧟 2. Clasificación de Amenazas por Tiers
El ecosistema hostil se divide en tres jerarquías técnicas con comportamientos específicos:
*   **Tier 1 (Minions / Soldados rasos):** Unidades terrestres (`zombie`) y aéreas (`aerial`) con lógica de persecución vectorial directa hacia las coordenadas del Núcleo. Poseen baja salud y velocidad estándar.
*   **Tier 2 (Mutados):** Variantes mejoradas con mayor resistencia estructural, incremento de velocidad de desplazamiento y patrones de movimiento senoidal en el eje vertical (`wave`) para dificultar la intercepción de unidades voladoras.
*   **Tier 3 (Minijefes / Bosses):** Entidades de proporciones colosales con una barra de salud extendida (`hp: 15` para terrestres, `12` para aéreos). Su desplazamiento genera sacudidas físicas continuas en la cámara mediante la función `shake()`.

## ⚠️ 3. Sistemas de Alerta y Retroceso Físico (*Knockback*)
*   **Indicadores de Advertencia:** Previo al despliegue de unidades aéreas o jefes en los extremos del canvas, se renderizan marcadores de exclamación intermitentes (`!`) en los márgenes laterales como aviso preventivo al jugador.
*   **Efecto de Retroceso (*Knockback*):** Al recibir impactos que no resulten en destrucción inmediata, las entidades enemigas activan un estado de interrupción cinemática (`isKnockedBack = true`), ejecutando una interpolación de retroceso vectorial calculada desde el centro del Núcleo para evitar el bloqueo por saturación en colisiones corporales.