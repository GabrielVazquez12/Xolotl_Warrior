const VEL_ENEMIGO = 130;
const ALTO_PISO = 60;
const ZONA_SEGURA = 200;

// Recibe el hud para poder avisar en pantalla cuando la cosa se pone mas dificil.
export function setupEnemies(nucleo, hud) {
    function spawnEnemy() {
        const isAerial = chance(0.5); 

        if (isAerial) {
            const startX = chance(0.5) ? width() + 50 : -50; 
            const startY = rand(50, height() - ALTO_PISO - 150);

            add([
                rect(30, 20), pos(startX, startY), area(), color(255, 150, 200),
                "enemy", "aerial", { hp: 3, isSpawning: false }
            ]);
        } else {
            let spawnX;
            do { spawnX = rand(50, width() - 50); } while (Math.abs(spawnX - (width() / 2)) < ZONA_SEGURA); 

            const zombi = add([
                rect(30, 30), pos(spawnX, height() - ALTO_PISO), 
                area(), body(), color(150, 255, 150), 
                anchor("bot"), scale(1, 0.1), "enemy", "zombie", 
                { hp: 3, isSpawning: true } 
            ]);

            tween(0.1, 1, 0.8, (val) => zombi.scale = vec2(1, val), easings.easeOutBack)
                .onEnd(() => { zombi.isSpawning = false; });
        }
    }

    // --- DIFICULTAD PROGRESIVA ---
    let tiempoAparicion = 1.2;
    let temporizadorEnemigos = loop(tiempoAparicion, () => { spawnEnemy(); });

    loop(10, () => {
        if (tiempoAparicion > 0.4) { 
            tiempoAparicion -= 0.15; 
            temporizadorEnemigos.cancel();
            temporizadorEnemigos = loop(tiempoAparicion, () => { spawnEnemy(); });
            hud.avisarOleada("Oleada mas rapida"); // que se note que el juego aprieta
        }
    });

    // --- IA DE MOVIMIENTO ---
    onUpdate("enemy", (e) => {
        if (e.isSpawning) return; 
        if (e.is("zombie")) {
            const dirX = Math.sign(nucleo.pos.x - e.pos.x);
            e.move(dirX * VEL_ENEMIGO, 0);
        } else {
            const direccion = nucleo.pos.sub(e.pos).unit();
            e.move(direccion.scale(VEL_ENEMIGO));
        }
    });
}
