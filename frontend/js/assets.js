export function loadGameAssets() {
    // ==========================================
    //  HOJA DE SPRITES COMPLETA (6x6)
    // ==========================================
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
    // Aquí cargarán a los enemigos y fondos después
    // loadSprite("zombie", "assets/zombie.png");


    // ===========================
    // Música
    // ===========================

    loadSound("gameMusic", "assets/music/gameplay.mp3");
    //loadSound("gameOverMusic", "assets/music/gameover.mp3");

    // ===========================
    // Efectos
    // ===========================

    // Cada efecto tiene varias grabaciones; audio.js elige una al azar
    // para que el golpe repetido no suene siempre igual.

    loadSound("swordv1", "assets/sounds/swordv1.wav");
    loadSound("swordv2", "assets/sounds/swordv2.mp3");

    loadSound("laserSoundv1", "assets/sounds/laserSoundv1.wav");
    loadSound("laserSoundv2", "assets/sounds/laserSoundv2.wav");
    loadSound("laserSoundv3", "assets/sounds/laserSoundv3.wav");

    loadSound("dashv1", "assets/sounds/dashv1.wav");
    loadSound("dashv2", "assets/sounds/dashv2.wav");
    loadSound("dashv3", "assets/sounds/dashv3.wav");

    loadSound("enemyHitv1", "assets/sounds/enemyHitv1.wav");
    loadSound("enemyHitv2", "assets/sounds/enemyHitv2.wav");

    loadSound("enemyDiev1", "assets/sounds/enemyDiev1.wav");

    //loadSound("playerHit", "assets/sounds/player_hit.wav");
    //loadSound("gameOver", "assets/sounds/gameover.wav");
}