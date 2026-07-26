import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
import { loadGameAssets } from "./assets.js";
import { setupPlayer } from "./player.js";
import { setupEnemies } from "./enemies.js";
import {
    startMusic,
    stopMusic,
    playEnemyHit,
    playEnemyDeath,
    playPlayerHit,
    playGameOver,
} from "./audio.js";

kaboom({ background: [ 22, 33, 62 ] });
loadGameAssets(); // Mandamos llamar al arte

setGravity(1800);
const ALTO_PISO = 60;

scene("game", () => {

    startGameMusic();

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
    setupEnemies(nucleo);

    // 3. Colisiones Globales (Daño y Efectos de Temblor)
    onCollide("sword_hitbox", "enemy", (hitbox, enemy) => {

        if (enemy.isSpawning) return;

        playEnemyHit();

        if (enemy.is("zombie")) {
            playEnemyDie();
            destroy(enemy);
        } else {

            enemy.hp--;

            if (enemy.hp <= 0) {
                playEnemyDie();
                destroy(enemy);
            }
        }

    });

    onCollide("laser", "enemy", (laser, enemy) => {

        if (enemy.isSpawning) return;

        destroy(laser);

        playEnemyHit();

        if (enemy.is("aerial")) {

            playEnemyDie();
            destroy(enemy);

        } else {

            enemy.hp--;

            if (enemy.hp <= 0) {

                playEnemyDie();
                destroy(enemy);

            }
        }

    });

    onCollide("enemy", "nucleo", (enemy, nuc) => {
        if (enemy.isSpawning) return;
        destroy(enemy); 
        nuc.hp -= 1; 
        playPlayerHit();
        shake(12); // Pantalla tiembla fuerte
        document.getElementById('vidas-text').innerText = nuc.hp;
        nuc.color = rgb(255, 0, 0); 
        wait(0.2, () => nuc.color = rgb(255, 215, 0)); 
        if (nuc.hp <= 0) {

            stopGameMusic();

            playGameOver();

            go("gameover");

        }
    });

    onCollide("enemy", "player", (enemy, p) => {
        if (enemy.isSpawning || p.isDashing) return; // Ignora el daño si usa el dash
        destroy(enemy); 
        p.hp -= 1; 
        playPlayerHit();
        shake(6); // Pantalla tiembla leve
        document.getElementById('vida-fantasma').innerText = p.hp; 
        p.use(color(255, 0, 0)); 
        wait(0.2, () => p.unuse("color")); 
        if (p.hp <= 0) {

            stopGameMusic();

            playGameOver();

            go("gameover");

        }
    });
});

scene("gameover", () => {
    document.getElementById('ui-layer').style.display = 'none';
    document.getElementById('health-container').style.display = 'none';
    
    add([ text("FIN DEL JUEGO", { size: 48 }), pos(width() / 2, height() / 2 - 50), anchor("center"), color(255, 50, 50) ]);
    add([ text("Presiona R para reiniciar", { size: 24 }), pos(width() / 2, height() / 2 + 50), anchor("center") ]);
    
    onKeyPress("r", () => {
        document.getElementById('ui-layer').style.display = 'block';
        document.getElementById('health-container').style.display = 'block';
        document.getElementById('vidas-text').innerText = '5';
        document.getElementById('vida-fantasma').innerText = '3';

        startGameMusic();
        
        go("game");
    });
});

go("game");