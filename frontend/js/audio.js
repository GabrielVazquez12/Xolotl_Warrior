let gameMusic = null;

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

export function playSword() {
    play("sword", {
        volume: 0.7,
    });
}

export function playLaser() {
    play("laserSound", {
        volume: 0.6,
    });
}

export function playDash() {
    play("dash", {
        volume: 0.6,
    });
}

export function playEnemyHit() {
    play("enemyHit", {
        volume: 0.5,
    });
}

export function playEnemyDie() {
    play("enemyDie", {
        volume: 0.7,
    });
}

export function playPlayerHit() {
    play("playerHit", {
        volume: 0.8,
    });
}

export function playGameOver() {
    play("gameOver", {
        volume: 0.8,
    });
}