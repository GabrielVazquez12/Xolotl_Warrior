import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
import { loadGameAssets } from "./assets.js";
import { setupPlayer } from "./player.js";
import { setupEnemies } from "./enemies.js";
import { setupHUD, PUNTOS_ZOMBIE, PUNTOS_AEREO } from "./hud.js";

kaboom({ background: [ 22, 33, 62 ] });
loadGameAssets(); // Mandamos llamar al arte

setGravity(1800);
const ALTO_PISO = 60;

// ===============================================================
// ESCENA: MENÚ PRINCIPAL
// ===============================================================
scene("menu", () => {
    const centroX = width() / 2;
    const centroY = height() / 2;

    // 1. EL FONDO BASE
    add([
        rect(width(), height()),
        pos(0, 0),
        color(10, 15, 30),
        fixed()
    ]);

    // 2. SISTEMA DE PARTÍCULAS (Chispas)
    loop(0.1, () => {
        add([
            circle(rand(1, 3)),
            pos(rand(0, width()), height() + 10),
            color(rgb(0, 255, 255)), // Color cyan neón
            opacity(rand(0.3, 0.8)),
            move(UP, rand(20, 60)),
            offscreen({ destroy: true }),
            "chispa"
        ]);
    });

    // 3. EL XÓLOTL FLOTANTE
    const xolotlMenu = add([
        sprite("xolotl", { anim: "idle" }),
        pos(centroX, centroY - 150),
        scale(1.5),
        anchor("center")
    ]);
    
    xolotlMenu.onUpdate(() => {
        xolotlMenu.pos.y = (centroY - 150) + wave(-10, 10, time() * 2);
    });

    // 4. EL TÍTULO PULSANTE
    const titulo = add([
        text("XÓLOTL WARRIOR", { size: 72 }),
        pos(centroX, centroY - 30),
        anchor("center"),
        color(255, 215, 0)
    ]);
    
    titulo.onUpdate(() => {
        titulo.scale = vec2(wave(1, 1.03, time() * 3));
        titulo.color = rgb(255, wave(180, 215, time() * 4), 0);
    });

    // 5. BOTÓN CYBERPUNK REACTIVO
    const btnJugar = add([
        rect(280, 70, { radius: 20 }),
        pos(centroX, centroY + 90),
        anchor("center"),
        area(),
        scale(1),
        color(20, 40, 80),
        opacity(0.7),
        outline(4, rgb(0, 255, 255)),
    ]);

    const textoBtn = btnJugar.add([
        text("INICIAR RETO", { size: 26, letterSpacing: 2 }),
        anchor("center"),
        color(255, 255, 255)
    ]);

    btnJugar.onHoverUpdate(() => {
        btnJugar.scale = vec2(1.1);
        btnJugar.color = rgb(40, 70, 120);
        btnJugar.outline.color = hsl2rgb((time() * 0.5) % 1, 0.8, 0.6); 
        textoBtn.color = rgb(255, 255, 0); 
        setCursor("pointer");
    });

    btnJugar.onHoverEnd(() => {
        btnJugar.scale = vec2(1);
        btnJugar.color = rgb(20, 40, 80);
        btnJugar.outline.color = rgb(0, 255, 255);
        textoBtn.color = rgb(255, 255, 255);
        setCursor("default");
    });

    // 6. ESTELA DEL MOUSE
    onMouseMove((mpos) => {
        add([
            circle(5),
            pos(mpos),
            anchor("center"),
            color(0, 255, 255),
            opacity(0.8),
            lifespan(0.3, { fade: 0.3 }) 
        ]);
    });

    // 7. EVENTOS Y CRÉDITOS
    btnJugar.onClick(() => go("game"));
    onKeyPress("enter", () => go("game"));

    add([
        text("HackaTec 2026 - Carlos Vázquez & Alejandro Puente", { size: 16 }),
        pos(centroX, height() - 30),
        anchor("center"),
        color(100, 200, 255),
        opacity(0.8)
    ]);
});

// ===============================================================
// ESCENA: JUEGO PRINCIPAL
// ===============================================================
scene("game", () => {
    // 0. EL FONDO ÉPICO (Ajustado al tamaño del lienzo)
    add([
        sprite("fondo", { width: width(), height: height() }),
        pos(width() / 2, height() / 2),
        anchor("center"),
        z(-1) 
    ]);

    // 1. ESCENARIO (Piso invisible)
    add([
        rect(width(), ALTO_PISO), 
        pos(0, height()), 
        anchor("botleft"),
        area(), 
        body({ isStatic: true }), 
        opacity(0), 
        "ground"
    ]);

    const nucleo = add([
        rect(60, 80), pos(width() / 2, height() - ALTO_PISO), anchor("bot"), 
        area(), color(255, 215, 0), "nucleo", { hp: 5 }
    ]);

    // 2. LÓGICAS EXTERNAS
    const player = setupPlayer();
    const hud = setupHUD(nucleo.hp, player.hp);
    setupEnemies(nucleo, hud);

    // 3. FUNCIONES DE APOYO Y COMBATE
    function matarEnemigo(enemy) {
        hud.contarEnemigo(enemy.is("zombie") ? PUNTOS_ZOMBIE : PUNTOS_AEREO);
        destroy(enemy);
    }

    // Función maestra de combate con físicas de knockback (retroceso)
    function golpearEnemigo(enemy, danio) {
        if (enemy.isSpawning) return;
        
        enemy.hp -= danio;

        // Efecto visual (Flash Blanco)
        const colorOriginal = enemy.color;
        enemy.color = rgb(255, 255, 255);
        wait(0.1, () => { if (enemy.exists()) enemy.color = colorOriginal; });

        // Efecto Físico (Knockback). ¡Los Jefes (Tier 3) no retroceden!
        if (enemy.tier !== 3) {
            enemy.isKnockedBack = true; // Pausa su Inteligencia Artificial

            // Calculamos la dirección contraria al núcleo para empujarlo
            const centroNucleo = vec2(width() / 2, height() - ALTO_PISO);
            const direccionAlejamiento = enemy.pos.sub(centroNucleo).unit();
            
            tween(enemy.pos, enemy.pos.add(direccionAlejamiento.scale(40)), 0.15, (p) => enemy.pos = p, easings.easeOutQuad)
                .onEnd(() => {
                    // Reactivamos su IA cuando termina de retroceder
                    if (enemy.exists()) enemy.isKnockedBack = false;
                });
        }

        if (enemy.hp <= 0) matarEnemigo(enemy);
    }

    function terminar() {
        const resumen = hud.terminarPartida();
        hud.ocultar();
        go("gameover", resumen);
    }

    // 4. COLISIONES
    onCollide("sword_hitbox", "enemy", (hitbox, enemy) => {
        golpearEnemigo(enemy, 2); // Espada = 2 de daño (Cuerpo a cuerpo, más riesgo)
    });

    onCollide("laser", "enemy", (laser, enemy) => {
        destroy(laser); 
        golpearEnemigo(enemy, 1); // Láser = 1 de daño (A distancia, más seguro)
    });

    onCollide("enemy", "nucleo", (enemy, nuc) => {
        if (enemy.isSpawning) return;
        destroy(enemy); 
        nuc.hp -= (enemy.tier === 3) ? 3 : 1; // El Jefe quita 3 vidas de golpe
        shake(12); 
        hud.setVidaNucleo(nuc.hp);
        nuc.color = rgb(255, 0, 0); 
        wait(0.2, () => nuc.color = rgb(255, 215, 0)); 
        if (nuc.hp <= 0) terminar(); 
    });

    onCollide("enemy", "player", (enemy, p) => {
        if (enemy.isSpawning || p.isDashing) return; 
        destroy(enemy); 
        p.hp -= 1; 
        shake(6); 
        hud.setVidaJugador(p.hp);
        if (p.hp <= 0) {
            p.morir(() => terminar()); 
        } else {
            p.recibirDanio(); 
        }
    });
});

// ===============================================================
// ESCENA: GAME OVER
// ===============================================================
scene("gameover", (resumen) => {
    const centroX = width() / 2;
    const centroY = height() / 2;

    add([ text("FIN DEL JUEGO", { size: 48 }), pos(centroX, centroY - 110), anchor("center"), color(255, 50, 50) ]);

    add([
        text(`Tiempo: ${resumen.tiempo}    Enemigos: ${resumen.enemigos}`, { size: 22 }),
        pos(centroX, centroY - 45), anchor("center"), color(180, 180, 180)
    ]);

    add([
        text(`PUNTOS: ${resumen.puntos}`, { size: 36 }),
        pos(centroX, centroY), anchor("center"), color(255, 215, 0)
    ]);

    add([
        text(resumen.esRecord ? "NUEVO RECORD!" : `Record: ${resumen.record}`, { size: 22 }),
        pos(centroX, centroY + 45), anchor("center"),
        color(resumen.esRecord ? rgb(0, 255, 255) : rgb(180, 180, 180))
    ]);

    add([ text("Presiona R para reiniciar", { size: 24 }), pos(centroX, centroY + 110), anchor("center") ]);

    onKeyPress("r", () => go("game"));
});

// Arranca el juego cargando el menú primero
go("menu");