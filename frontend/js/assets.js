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
    loadSound("gameOverMusic", "assets/music/gameover.mp3");

    // ===========================
    // Efectos
    // ===========================

    loadSound("sword", "assets/sounds/sword.wav");
    loadSound("laserSound", "assets/sounds/laser.wav");
    loadSound("dash", "assets/sounds/dash.wav");
    loadSound("enemyHit", "assets/sounds/enemy_hit.wav");
    loadSound("enemyDie", "assets/sounds/enemy_die.wav");
    loadSound("playerHit", "assets/sounds/player_hit.wav");
    loadSound("gameOver", "assets/sounds/gameover.wav");
}