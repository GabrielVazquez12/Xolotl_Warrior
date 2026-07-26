// Valores constantes para el jugador
const VEL_NORMAL = 300;
const VEL_CORRER = 600;
const VEL_LASER = 900;
const VEL_DASH = 1200;
const COOLDOWN_ATAQUE = 0.25;

export function setupPlayer() {
    // 1. Creamos al personaje
    const player = add([
        sprite("guardian", { anim: "idle" }),
        pos(width() / 2 - 200, height() - 160),
        scale(1.5),
        anchor("center"),
        area({ shape: new Rect(vec2(0,0), 20, 25) }),
        body(),
        "player",
        {
            direccion: 1,
            canAttack: true,
            hp: 3,
            isFlying: false,
            isDashing: false
        }
    ]);

    // 2. Funciones auxiliares
    function getVelocidadActual() { return isKeyDown("shift") ? VEL_CORRER : VEL_NORMAL; }
    function iniciarAnimacionCorrer() {
        if (player.curAnim() !== "correr") player.play("correr");
    }

    // 3. Movimiento Izquierda / Derecha
    onKeyDown("left", () => { player.move(-getVelocidadActual(), 0); player.direccion = -1; player.flipX = true; iniciarAnimacionCorrer(); });
    onKeyDown("a", () => { player.move(-getVelocidadActual(), 0); player.direccion = -1; player.flipX = true; iniciarAnimacionCorrer(); });
    
    onKeyDown("right", () => { player.move(getVelocidadActual(), 0); player.direccion = 1; player.flipX = false; iniciarAnimacionCorrer(); });
    onKeyDown("d", () => { player.move(getVelocidadActual(), 0); player.direccion = 1; player.flipX = false; iniciarAnimacionCorrer(); });

    onKeyRelease(["left", "right", "a", "d"], () => {
        if (!isKeyDown("left") && !isKeyDown("right") && !isKeyDown("a") && !isKeyDown("d")) {
            player.play("idle");
        }
    });

    // 4. Sistema de Vuelo y Salto (Estilo Kirby)
    onKeyDown("up", () => { if (player.isFlying) player.move(0, -getVelocidadActual()); });
    onKeyDown("w", () => { if (player.isFlying) player.move(0, -getVelocidadActual()); });
    onKeyDown("down", () => { if (player.isFlying) player.move(0, getVelocidadActual()); });
    onKeyDown("s", () => { if (player.isFlying) player.move(0, getVelocidadActual()); });

    onKeyPress("space", () => {
        if (player.isGrounded()) {
            player.jump(700);
        } else if (!player.isFlying) {
            player.isFlying = true;
            player.gravityScale = 0;
            player.jump(0.1); 
        }
    });

    player.onGround(() => {
        player.isFlying = false;
        player.gravityScale = 1;
    });

    // 5. Dash Espectral (Faseo con la tecla Q)
    let puedeDashear = true;
    onKeyPress("q", () => {
        if (!puedeDashear) return;
        puedeDashear = false;
        player.isDashing = true;
        player.opacity = 0.5; // Semitransparente
        
        const impulso = player.direccion === 1 ? VEL_DASH : -VEL_DASH;
        const dashAnim = onUpdate(() => { player.move(impulso, 0); });

        wait(0.2, () => {
            dashAnim.cancel();
            player.isDashing = false;
            player.opacity = 1;
        });

        wait(1, () => { puedeDashear = true; }); // Cooldown del dash
    });

    // 6. Sistema de Combate (Espada y Láser)
    function resetAttack() { wait(COOLDOWN_ATAQUE, () => { player.canAttack = true; }); }

    onKeyPress("j", () => {
        if (!player.canAttack) return;
        player.canAttack = false;
        const offsetX = player.direccion === 1 ? 40 : -40;
        const hitbox = add([ rect(50, 40), pos(player.pos.add(offsetX, 0)), anchor("center"), area(), color(255, 100, 100), "sword_hitbox" ]);
        wait(0.1, () => { destroy(hitbox); });
        resetAttack();
    });

    onKeyPress("k", () => {
        if (!player.canAttack) return;
        player.canAttack = false;
        const offsetX = player.direccion === 1 ? 30 : -30;
        add([ circle(10), pos(player.pos.add(offsetX, 10)), anchor("center"), area(), color(100, 100, 255), move(player.direccion === 1 ? RIGHT : LEFT, VEL_LASER), offscreen({ destroy: true }), "laser" ]);
        resetAttack();
    });

    // 7. Límites de la pantalla (Para que no se escape)
    onUpdate(() => {
        if (player.pos.x < 20) player.pos.x = 20;
        if (player.pos.x > width() - 20) player.pos.x = width() - 20;
        if (player.pos.y < 20) player.pos.y = 20;
    });

    // Devolvemos el jugador al final
    return player;
}