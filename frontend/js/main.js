import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
import { loadGameAssets } from "./assets.js";
import { setupPlayer } from "./player.js";
import { setupEnemies } from "./enemies.js";
import { setupHUD, PUNTOS_ZOMBIE, PUNTOS_AEREO } from "./hud.js";

kaboom({ background: [ 22, 33, 62 ] });
loadGameAssets(); // Mandamos llamar al arte

setGravity(1800);
const ALTO_PISO = 60;

scene("game", () => {
    // 1. Escenario
    add([
        rect(width(), ALTO_PISO), pos(0, height()), anchor("botleft"),
        area(), body({ isStatic: true }), color(15, 52, 96), "ground"
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
        p.use(color(255, 0, 0)); 
        wait(0.2, () => p.unuse("color")); 
        if (p.hp <= 0) terminar(); 
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

    // No hace falta resetear nada a mano: al volver a "game", setupHUD()
    // vuelve a poner los contadores en cero y a mostrar el HUD.
    onKeyPress("r", () => go("game"));
});

go("game");
