import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
import { loadGameAssets } from "./assets.js";
import { setupPlayer } from "./player.js";
import { setupEnemies } from "./enemies.js";
import { setupHUD, PUNTOS_ZOMBIE, PUNTOS_AEREO } from "./hud.js";

kaboom({ background: [ 22, 33, 62 ] });
loadGameAssets(); // Mandamos llamar al arte

setGravity(1800);
const ALTO_PISO = 60;
scene("menu", () => {
    const centroX = width() / 2;
    const centroY = height() / 2;

    // 1. EL FONDO BASE
    add([
        rect(width(), height()),
        pos(0, 0),
        color(10, 15, 30), // Azul/Gris muy oscuro
        fixed()
    ]);

    // 2. SISTEMA DE PARTÍCULAS (Chispas subiendo estilo hoguera mágica)
    loop(0.1, () => {
        add([
            circle(rand(1, 3)), // Tamaño aleatorio
            pos(rand(0, width()), height() + 10), // Nacen abajo de la pantalla
            color(rgb(255, 0, 0)), // Color cyan neón
            opacity(rand(0.3, 0.8)),
            move(UP, rand(20, 60)), // Suben a diferentes velocidades
            offscreen({ destroy: true }), // Se borran al salir para no gastar RAM
            "chispa"
        ]);
    });

    // 3. EL XÓLOTL (Flotando con físicas falsas)
    const xolotlMenu = add([
        sprite("xolotl", { anim: "" }),
        pos(centroX, centroY - 150),
        scale(1.5),
        anchor("center")
    ]);
    
    // El wave() hace que suba y baje suavemente entre -10 y 10 pixeles
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
        // Escala rítmicamente simulando un latido
        titulo.scale = vec2(wave(1, 1.03, time() * 3));
        // Alterna el color dorado a uno ligeramente más naranja
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

    // MAGIA HOVER (Cuando pasas el mouse)
    btnJugar.onHoverUpdate(() => {
        btnJugar.scale = vec2(1.1);
        btnJugar.color = rgb(40, 70, 120);
        
        // hsl2rgb genera un arcoíris en base al tiempo, ¡se ve brutalisimo!
        btnJugar.outline.color = hsl2rgb((time() * 0.5) % 1, 0.8, 0.6); 
        textoBtn.color = rgb(255, 255, 0); // El texto se vuelve amarillo
        setCursor("pointer");
    });

    btnJugar.onHoverEnd(() => {
        btnJugar.scale = vec2(1);
        btnJugar.color = rgb(20, 40, 80);
        btnJugar.outline.color = rgb(0, 255, 255);
        textoBtn.color = rgb(255, 255, 255);
        setCursor("default");
    });



    // EVENTOS PARA INICIAR
    btnJugar.onClick(() => go("game"));
    onKeyPress("enter", () => go("game"));

    // 7. CRÉDITOS OFICIALES PARA LOS JUECES
    add([
        text("HackaTec 2026 ", { size: 16 }),
        pos(centroX, height() - 30),
        anchor("center"),
        color(100, 200, 255),
        opacity(0.8)
    ]);
});
scene("game", () => {
    add([
        sprite("fondo", { width: width(), height: height() }),
        pos(width() / 2, height() / 2),
        anchor("center"),
        // scale(1.2), // <-- Descomenta y juega con este número si la imagen no cubre toda tu pantalla
        z(-1) // MAGIA: El z(-1) obliga a la imagen a irse al fondo, detrás de todo
    ]);

    // 1. Escenario (Piso de colisión invisible)
    add([
        rect(width(), ALTO_PISO), 
        pos(0, height()), 
        anchor("botleft"),
        area(), 
        body({ isStatic: true }), 
        opacity(0), // MAGIA 2: opacity(0) lo hace invisible, pero sigue siendo un muro sólido para las físicas
        "ground"
    ]);
const nucleo = add([
        rect(60, 80), pos(width() / 2, height() - ALTO_PISO), anchor("bot"), 
        area(), color(255, 215, 0), "nucleo", { hp: 5 }
    ]);
    // 2. Traemos las lógicas desde los otros archivos
    const player = setupPlayer();

    // El HUD toma como maximo la vida con la que arrancan, asi no repetimos
    // los numeros aqui: si mañana cambian los hp, los corazones se ajustan solos.
    const hud = setupHUD(nucleo.hp, player.hp);

    setupEnemies(nucleo, hud);

    // 3. Ayudantes de la partida
    //    Ojo: matarEnemigo() solo se llama cuando TU lo matas. Un enemigo que
    //    choca contra el Nucleo o contra ti tambien se destruye, pero no da
    //    puntos, porque ese golpe lo perdiste tu.
    function matarEnemigo(enemy) {
        hud.contarEnemigo(enemy.is("zombie") ? PUNTOS_ZOMBIE : PUNTOS_AEREO);
        destroy(enemy);
    }

    // Se acabo: apagamos el HUD y le pasamos el resumen a la pantalla final
    function terminar() {
        const resumen = hud.terminarPartida();
        hud.ocultar();
        go("gameover", resumen);
    }

    // 4. Colisiones Globales (Daño y Efectos de Temblor)
    onCollide("sword_hitbox", "enemy", (hitbox, enemy) => {
        if (enemy.isSpawning) return; 
        if (enemy.is("zombie")) { matarEnemigo(enemy); return; } // la espada lo parte de un golpe
        enemy.hp -= 1;
        if (enemy.hp <= 0) matarEnemigo(enemy);
    });

    onCollide("laser", "enemy", (laser, enemy) => {
        if (enemy.isSpawning) return;
        destroy(laser); 
        if (enemy.is("aerial")) { matarEnemigo(enemy); return; } // el laser derriba al aereo de un tiro
        enemy.hp -= 1;
        if (enemy.hp <= 0) matarEnemigo(enemy);
    });

    onCollide("enemy", "nucleo", (enemy, nuc) => {
        if (enemy.isSpawning) return;
        destroy(enemy); // se estrello contra el Nucleo: no cuenta como kill
        nuc.hp -= 1; 
        shake(12); // Pantalla tiembla fuerte
        hud.setVidaNucleo(nuc.hp);
        nuc.color = rgb(255, 0, 0); 
        wait(0.2, () => nuc.color = rgb(255, 215, 0)); 
        if (nuc.hp <= 0) terminar(); 
    });

    onCollide("enemy", "player", (enemy, p) => {
        if (enemy.isSpawning || p.isDashing) return; // Ignora el daño si usa el dash
        destroy(enemy); // te embistio a ti: tampoco cuenta como kill
        p.hp -= 1; 
        shake(6); // Pantalla tiembla leve
        hud.setVidaJugador(p.hp);
        if (p.hp <= 0) {
            p.morir(() => terminar()); 
        } else {
            p.recibirDanio(); 
        }
    });
});

// La pantalla final recibe el resumen que arma el HUD, asi no tiene que
// andar leyendo el DOM para saber como te fue.
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

    // Si rompiste tu marca se lo decimos; si no, le recordamos cual es
    add([
        text(resumen.esRecord ? "NUEVO RECORD!" : `Record: ${resumen.record}`, { size: 22 }),
        pos(centroX, centroY + 45), anchor("center"),
        color(resumen.esRecord ? rgb(0, 255, 255) : rgb(180, 180, 180))
    ]);

    add([ text("Presiona R para reiniciar", { size: 24 }), pos(centroX, centroY + 110), anchor("center") ]);

    onKeyPress("r", () => go("game"));
});

go("menu");
