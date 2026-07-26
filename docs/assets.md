# Gestión de Recursos y Assets (`assets.js`)

## 📦 Arquitectura de Carga Centralizada
El módulo `frontend/js/assets.js` actúa como el gestor único de recursos estáticos del motor, centralizando la carga síncrona de texturas, fondos y hojas de sprites (*sprite sheets*) mediante la API de **Kaboom.js** (`loadSprite`).

## 🗺️ Mapeo de la Hoja de Sprites (Xolotl Sheet 6x6)
Para optimizar el rendimiento gráfico y la gestión de memoria RAM en el navegador, el personaje principal utiliza una hoja de sprites unificada de celdas de 6x6, fraccionada mediante coordenadas de corte (*slice*):

```javascript
export function loadGameAssets() {
    loadSprite("fondo", "assets/sprites/fondo.png");
    loadSprite("xolotl", "assets/sprites/xolotl_sheet.png", {
        sliceX: 6,
        sliceY: 6,
        anims: {
            idle: { from: 0, to: 5, loop: true, speed: 8 },
            walk: { from: 6, to: 11, loop: true, speed: 12 },
            melee: { from: 12, to: 17, loop: false, speed: 20 },
            shoot: { from: 18, to: 23, loop: false, speed: 15 },
            hit: { from: 24, to: 27, loop: false, speed: 12 },
            death: { from: 30, to: 32, loop: false, speed: 10 }, 
        },
    });
}

## 📐 Especificaciones de Texturas 
* **fondo.png:** Textura panorámica de fondo renderizada en el plano de profundidad negativo (z(-1)) con escalado adaptativo al tamaño de la ventana (width(), height()).

* **Entidades Geométricas de Respaldo:** Los elementos del entorno de menor complejidad visual (orbes elementales, monedas con físicas, núcleos y barras de energía) se renderizan mediante primitivas geométricas vectoriales de Kaboom (circle, rect) para garantizar tasa de refresco constante a 60 FPS sin depender de latencia de red en la carga de archivos de imagen pesados.