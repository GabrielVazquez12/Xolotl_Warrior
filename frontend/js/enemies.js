const VEL_ENEMIGO = 130;
const ALTO_PISO = 60;
const ZONA_SEGURA = 200;

export function setupEnemies(nucleo, hud) {
    let lunaDeSangreActiva = false;

    function isLunaDeSangreActiva() {
        return lunaDeSangreActiva;
    }
    
    // --- 1. FÁBRICA DE TERRESTRES (3 Tiers) ---
    function spawnTerrestre(tier, saleDeIzquierda) {
        let spawnX;
        
        if (tier === 3) {
            spawnX = saleDeIzquierda ? -80 : width() + 80;
        } else {
            if (saleDeIzquierda !== undefined) {
                spawnX = saleDeIzquierda ? rand(50, (width()/2) - ZONA_SEGURA) : rand((width()/2) + ZONA_SEGURA, width() - 50);
            } else {
                do { spawnX = rand(50, width() - 50); } while (Math.abs(spawnX - (width() / 2)) < ZONA_SEGURA); 
            }
        }

        let vida = 3; let velMulti = 1; let tamano = 1; let colorEnemigo = rgb(150, 255, 150);

        if (tier === 2) { vida = 5; velMulti = 1.5; colorEnemigo = rgb(255, 150, 50); } 
        if (tier === 3) { vida = 15; velMulti = 0.5; tamano = 2.5; colorEnemigo = rgb(255, 50, 50); } 

        const zombi = add([
            rect(30 * tamano, 30 * tamano), pos(spawnX, height() - ALTO_PISO), 
            area(), body(), color(colorEnemigo), 
            anchor("bot"), scale(tamano, 0.1), "enemy", "zombie", tier === 3 ? "boss" : "minion",
            { hp: vida, isSpawning: true, velocidad: VEL_ENEMIGO * velMulti, tier: tier, isKnockedBack: false } 
        ]);

        tween(0.1, tamano, 0.8, (val) => zombi.scale = vec2(tamano, val), easings.easeOutBack)
            .onEnd(() => { zombi.isSpawning = false; });
    }

    // --- 2. FÁBRICA DE AÉREOS (3 Tiers) ---
    function spawnAereo(tier, saleDeIzquierda) {
        const startX = saleDeIzquierda ? -50 : width() + 50; 
        const startY = rand(50, height() - ALTO_PISO - 150);

        let vida = 1; let velMulti = 1.2; let tamano = 1; let colorEnemigo = rgb(255, 150, 200);

        if (tier === 2) { vida = 2; velMulti = 1.8; colorEnemigo = rgb(200, 100, 255); } 
        if (tier === 3) { vida = 12; velMulti = 0.6; tamano = 2; colorEnemigo = rgb(100, 0, 255); } 

        add([
            rect(30 * tamano, 20 * tamano), pos(startX, startY), area(), color(colorEnemigo), anchor("center"),
            "enemy", "aerial", tier === 3 ? "boss" : "minion",
            { hp: vida, isSpawning: false, velocidad: VEL_ENEMIGO * velMulti, tier: tier, isKnockedBack: false }
        ]);
    }

    // --- 3. SISTEMA DE ALERTAS Y POWER-UPS ---
    function mostrarAlerta(saleDeIzquierda, esAereo) {
        const posX = saleDeIzquierda ? 40 : width() - 40;
        const posY = esAereo ? height() / 3 : height() - ALTO_PISO - 40;

        const alerta = add([
            text("!", { size: 50 }),
            pos(posX, posY),
            color(255, 0, 0),
            anchor("center"),
            lifespan(1, { fade: 0.2 }),
            fixed()
        ]);

        alerta.onUpdate(() => {
            alerta.opacity = wave(0, 1, time() * 15);
        });
    }
// --- NUEVO: SISTEMA DE MONEDAS CON FÍSICAS ---
    function soltarMoneda(posicion) {
        if (!chance(0.6)) return; // 60% de probabilidad de soltar alma/moneda

        const moneda = add([
            circle(7),
            pos(posicion),
            anchor("center"),
            area(),
            body(), // Para que caigan y choquen con el piso
            color(255, 215, 0), // Dorado brillante
            z(5),
            "coin"
        ]);

        // Impulso inicial hacia arriba al morir el enemigo (efecto explosión de botín)
        moneda.jump(rand(350, 550));
    }
    function soltarPowerUp(posicion) {
        if (!chance(0.15)) return; 

        const tipos = ["fuego", "hielo", "rayo"];
        const tipoElegido = tipos[Math.floor(Math.random() * tipos.length)];
        
        let colorOrbe = rgb(255, 100, 50); 
        if (tipoElegido === "hielo") colorOrbe = rgb(100, 200, 255);
        if (tipoElegido === "rayo") colorOrbe = rgb(255, 255, 0);

        const orbe = add([
            circle(10),
            pos(posicion),
            anchor("center"),
            area(),
            color(colorOrbe),
            scale(1),
            z(5),
            lifespan(10, { fade: 2 }),
            "powerup",
            { tipoElemento: tipoElegido }
        ]);

        orbe.onUpdate(() => {
            if (window.juegoPausado) return;
            orbe.pos.y += wave(-0.5, 0.5, time() * 5);
        });
    }

    // --- 4. EL DIRECTOR DE JUEGO (GAME DIRECTOR) ---
    let segundosJugados = 0;
    
    loop(1, () => {
        if (window.juegoPausado) return; 

        segundosJugados++;

        // --- LUNA DE SANGRE TEMPORAL (Cada 60s, dura 15s) ---
        if (segundosJugados > 0 && segundosJugados % 60 === 0) {
            lunaDeSangreActiva = true;
            
            // Flash rojo de entrada
            add([
                rect(width(), height()),
                pos(0, 0),
                color(255, 0, 0),
                opacity(0.8),
                fixed(),
                z(300),
                lifespan(0.5, { fade: 0.5 })
            ]);

            hud.avisarOleada("🔴 ¡LUNA DE SANGRE ACTIVADA! ¡Puntos dobles por 15s!");

            // Se apaga sola después de 15 segundos
            wait(15, () => {
                lunaDeSangreActiva = false;
                
                // Flash blanco de salida
                add([
                    rect(width(), height()),
                    pos(0, 0),
                    color(255, 255, 255),
                    opacity(0.5),
                    fixed(),
                    z(300),
                    lifespan(0.3, { fade: 0.3 })
                ]);

                hud.avisarOleada("🌕 La Luna de Sangre se ha disipado.");
            });
        }

        if (segundosJugados === 30) hud.avisarOleada("Fin del calentamiento. ¡Cuidado arriba!");
        if (segundosJugados === 60) hud.avisarOleada("¡Los enemigos están mutando! (Tier 2)");
        if (segundosJugados % 50 === 0 && segundosJugados > 30) hud.avisarOleada("¡ALERTA ROJA: MINIJEFES ACERCÁNDOSE!");
    });

    function planearProximoSpawn() {
        let tiempoEspera = 2.5; 

        if (segundosJugados >= 30) tiempoEspera = 1.8; 
        if (segundosJugados >= 60) tiempoEspera = 1.2; 
        if (segundosJugados >= 90) tiempoEspera = 0.8; 

        tiempoEspera += rand(-0.2, 0.3);

        wait(tiempoEspera, () => {
            if (window.juegoPausado) {
                planearProximoSpawn();
                return;
            }

            if (get("boss").length > 0) {
                wait(2, () => planearProximoSpawn());
                return; 
            }

            const permiteAereos = segundosJugados >= 30;
            const permiteTier2 = segundosJugados >= 60;
            const esJefe = (segundosJugados % 50 >= 0 && segundosJugados % 50 <= 2) && segundosJugados > 30; 

            const isAerial = permiteAereos ? chance(0.4) : false;
            const saleDeIzquierda = chance(0.5);
            let tierElegido = 1;

            if (permiteTier2 && chance(0.3)) tierElegido = 2;
            if (esJefe) tierElegido = 3;

            if (isAerial || tierElegido === 3) {
                mostrarAlerta(saleDeIzquierda, isAerial);
                
                wait(1, () => {
                    if (window.juegoPausado) return;
                    isAerial ? spawnAereo(tierElegido, saleDeIzquierda) : spawnTerrestre(tierElegido, saleDeIzquierda);
                });
            } else {
                spawnTerrestre(tierElegido, saleDeIzquierda);
            }

            planearProximoSpawn();
        });
    }

    planearProximoSpawn();

    // --- 5. IA DE MOVIMIENTO Y PATRONES ---
    onUpdate("enemy", (e) => {
        if (window.juegoPausado) return; 
        if (e.isSpawning || e.isKnockedBack) return; 
        
        if (e.is("zombie")) {
            const dirX = Math.sign(nucleo.pos.x - e.pos.x);
            e.move(dirX * e.velocidad, 0);

            if (e.tier === 3) {
                shake(1); 
            }
        } else if (e.is("aerial")) {
            const direccion = nucleo.pos.sub(e.pos).unit();
            e.move(direccion.scale(e.velocidad));

            if (e.tier === 2) {
                e.move(0, wave(-200, 200, time() * 10)); 
            }
        }
    });

    return {
        isLunaDeSangreActiva,
        soltarPowerUp,
        soltarMoneda,
    };
}