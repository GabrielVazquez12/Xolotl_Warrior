const VEL_ENEMIGO = 130;
const ALTO_PISO = 60;
const ZONA_SEGURA = 200;

export function setupEnemies(nucleo, hud) {
    
    // --- 1. FÁBRICA DE TERRESTRES (3 Tiers) ---
    function spawnTerrestre(tier, saleDeIzquierda) {
        let spawnX;
        
        if (tier === 3) {
            // El Jefe (Tier 3) nace siempre fuera de la pantalla
            spawnX = saleDeIzquierda ? -80 : width() + 80;
        } else {
            // Los normales nacen según el lado de la alerta, respetando la Zona Segura
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
            // Etiqueta "boss" crucial para detener spawns normales
            anchor("bot"), scale(tamano, 0.1), "enemy", "zombie", tier === 3 ? "boss" : "minion",
            { hp: vida, isSpawning: true, velocidad: VEL_ENEMIGO * velMulti, tier: tier, isKnockedBack: false } 
        ]);

        tween(0.1, tamano, 0.8, (val) => zombi.scale = vec2(tamano, val), easings.easeOutBack)
            .onEnd(() => { zombi.isSpawning = false; });
    }

    // --- 2. FÁBRICA DE AÉREOS (3 Tiers) ---
    function spawnAereo(tier, saleDeIzquierda) {
        // Los aéreos siempre nacen desde fuera de la pantalla
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

    // --- 3. SISTEMA DE ALERTAS Y SONIDOS ---
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

    // --- 4. EL DIRECTOR DE JUEGO (GAME DIRECTOR) ---
    let segundosJugados = 0;
    
    loop(1, () => {
        segundosJugados++;
        if (segundosJugados === 30) hud.avisarOleada("Fin del calentamiento. ¡Cuidado arriba!");
        if (segundosJugados === 60) hud.avisarOleada("¡Los enemigos están mutando! (Tier 2)");
        if (segundosJugados % 50 === 0 && segundosJugados > 30) hud.avisarOleada("¡ALERTA ROJA: MINIJEFES ACERCÁNDOSE!");
    });

    function planearProximoSpawn() {
        // --- LA MAGIA DEL BOSS ARENA ---
        // Si hay un Jefe vivo, paramos la aparición de secuaces menores
        if (get("boss").length > 0) {
            wait(2, () => planearProximoSpawn());
            return; 
        }

        let tiempoEspera = 2.5; 

        if (segundosJugados >= 30) tiempoEspera = 1.8; 
        if (segundosJugados >= 60) tiempoEspera = 1.2; 
        if (segundosJugados >= 90) tiempoEspera = 0.8; 

        tiempoEspera += rand(-0.2, 0.3);

        wait(tiempoEspera, () => {
            const permiteAereos = segundosJugados >= 30;
            const permiteTier2 = segundosJugados >= 60;
            const esJefe = (segundosJugados % 50 >= 0 && segundosJugados % 50 <= 2) && segundosJugados > 30; 

            const isAerial = permiteAereos ? chance(0.4) : false;
            const saleDeIzquierda = chance(0.5);
            let tierElegido = 1;

            if (permiteTier2 && chance(0.3)) tierElegido = 2;
            if (esJefe) tierElegido = 3;

            // Mostramos alerta solo para enemigos voladores o jefes terrestres
            if (isAerial || tierElegido === 3) {
                mostrarAlerta(saleDeIzquierda, isAerial);
                
                wait(1, () => {
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
        // Ignora el movimiento si apenas está naciendo o si acaba de recibir un espadazo
        if (e.isSpawning || e.isKnockedBack) return; 
        
        if (e.is("zombie")) {
            const dirX = Math.sign(nucleo.pos.x - e.pos.x);
            e.move(dirX * e.velocidad, 0);

            // Patrón de Jefe: Hacer temblar la pantalla
            if (e.tier === 3) {
                shake(1); 
            }

        } else if (e.is("aerial")) {
            const direccion = nucleo.pos.sub(e.pos).unit();
            e.move(direccion.scale(e.velocidad));

            // Patrón de Volador Ágil (Tier 2): Zig-zag evasivo
            if (e.tier === 2) {
                e.move(0, wave(-200, 200, time() * 10)); 
            }
        }
    });
}