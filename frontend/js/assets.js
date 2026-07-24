export function loadGameAssets() {
    // ==========================================
    //  TODO: REEMPLAZAR POR ARTE FINAL (.png)
    // ==========================================
    const canvas = document.createElement('canvas');
    canvas.width = 128; 
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    function dibujarFantasma(x, offset, inclinacion) {
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(x + 16 + inclinacion, 12 + offset, 10, Math.PI, 0);
        ctx.lineTo(x + 26, 26 + offset); ctx.lineTo(x + 21, 23 + offset); 
        ctx.lineTo(x + 16, 26 + offset); ctx.lineTo(x + 11, 23 + offset); 
        ctx.lineTo(x + 6, 26 + offset); ctx.lineTo(x + 6 + inclinacion, 12 + offset);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 11 + inclinacion, 9 + offset, 3, 3);
        ctx.fillRect(x + 18 + inclinacion, 9 + offset, 3, 3);
    }

    dibujarFantasma(0, 0, 0);     
    dibujarFantasma(32, 2, 0);    
    dibujarFantasma(64, 0, 4);    
    dibujarFantasma(96, 2, 4);    
    const imagenFantasma = canvas.toDataURL();

    loadSprite("guardian", imagenFantasma, {
        sliceX: 4, sliceY: 1, 
        anims: {
            "idle": { from: 0, to: 1, loop: true, speed: 4 },
            "correr": { from: 2, to: 3, loop: true, speed: 12 }
        }
    });
    // Aquí cargarán a los enemigos y fondos después
    // loadSprite("zombie", "assets/zombie.png");
}