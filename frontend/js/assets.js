export function loadGameAssets() {
    // ==========================================
    //  HOJA DE SPRITES COMPLETA (6x6)
    // ==========================================
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
}