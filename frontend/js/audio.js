let gameMusic = null;

// Grabaciones disponibles por efecto. Se elige una al azar en cada disparo
// para que los golpes repetidos no suenen siempre identicos.
const VARIANTES = {
    sword: ["swordv1", "swordv2"],
    laserSound: ["laserSoundv1", "laserSoundv2", "laserSoundv3"],
    dash: ["dashv1", "dashv2", "dashv3"],
    enemyHit: ["enemyHitv1", "enemyHitv2"],
    enemyDie: ["enemyDiev1"],
};

// Evita que la Ulti (que mata a todos de golpe) dispare el mismo sonido
// diez veces en un frame y sature el audio.
const ESPERA_MINIMA = 0.05;
const ultimaVez = {};

function playEfecto(efecto, volumen) {
    const ahora = time();
    if (ultimaVez[efecto] !== undefined && ahora - ultimaVez[efecto] < ESPERA_MINIMA) return;
    ultimaVez[efecto] = ahora;

    play(choose(VARIANTES[efecto]), {
        volume: volumen,
    });
}

export function startGameMusic() {
    if (gameMusic) return;

    gameMusic = play("gameMusic", {
        loop: true,
        volume: 0.35,
    });
}

export function stopGameMusic() {
    if (!gameMusic) return;

    gameMusic.stop();
    gameMusic = null;
}

export function pausarGameMusic(pausado) {
    if (!gameMusic) return;

    gameMusic.paused = pausado;
}

export function playSword() {
    playEfecto("sword", 0.7);
}

export function playLaser() {
    playEfecto("laserSound", 0.6);
}

export function playDash() {
    playEfecto("dash", 0.6);
}

export function playEnemyHit() {
    playEfecto("enemyHit", 0.5);
}

export function playEnemyDie() {
    playEfecto("enemyDie", 0.7);
}

// Pendientes: faltan los archivos player_hit.wav y gameover.wav en assets/sounds.
// export function playPlayerHit() {
//     play("playerHit", { volume: 0.8 });
// }

// export function playGameOver() {
//     play("gameOver", { volume: 0.8 });
// }
