import {
    playSword,
    playLaser,
    playDash
} from "./audio.js";

// Valores constantes para el jugador
const VEL_NORMAL = 300;
const VEL_CORRER = 600;
const VEL_LASER = 900;
const VEL_DASH = 1200;
const COOLDOWN_ATAQUE = 0.25;

export function setupPlayer() {
    const player = add([
        sprite("xolotl", { anim: "idle" }),
        pos(width() / 2 - 200, height() - 160),
        scale(0.8),
        anchor("center"),
        area({ shape: new Rect(vec2(0, 0), 20, 25) }),
        body(),
        "player",
        {
            direccion: 1,
            canAttack: true,
            hp: 3,
            isFlying: false,
            isDashing: false,

            recibirDanio() {
                this.play("hit");
            },

            morir(callbackTerminar) {
                this.play("death");
                this.unuse("body");
                this.isDashing = true;
                wait(0.5, () => {
                    callbackTerminar();
                });
            }
        }
    ]);

    function getVelocidadActual() { return isKeyDown("shift") ? VEL_CORRER : VEL_NORMAL; }

    function iniciarAnimacionCorrer() {
        if (player.curAnim() !== "walk" && player.curAnim() !== "melee" && player.curAnim() !== "shoot" && player.curAnim() !== "hit") {
            player.play("walk");
        }
    }

    // Movimiento con candado de pausa
    onKeyDown("left", () => {
        if (window.juegoPausado) return;
        player.move(-getVelocidadActual(), 0); player.direccion = -1; player.flipX = true; iniciarAnimacionCorrer();
    });
    onKeyDown("a", () => {
        if (window.juegoPausado) return;
        player.move(-getVelocidadActual(), 0); player.direccion = -1; player.flipX = true; iniciarAnimacionCorrer();
    });

    onKeyDown("right", () => {
        if (window.juegoPausado) return;
        player.move(getVelocidadActual(), 0); player.direccion = 1; player.flipX = false; iniciarAnimacionCorrer();
    });
    onKeyDown("d", () => {
        if (window.juegoPausado) return;
        player.move(getVelocidadActual(), 0); player.direccion = 1; player.flipX = false; iniciarAnimacionCorrer();
    });

    onKeyRelease(["left", "right", "a", "d"], () => {
        if (window.juegoPausado) return;
        if (!isKeyDown("left") && !isKeyDown("right") && !isKeyDown("a") && !isKeyDown("d")) {
            if (player.curAnim() !== "melee" && player.curAnim() !== "shoot" && player.curAnim() !== "hit") {
                player.play("idle");
            }
        }
    });

    // Vuelo con candado de pausa
    onKeyDown("up", () => { if (window.juegoPausado) return; if (player.isFlying) player.move(0, -getVelocidadActual()); });
    onKeyDown("w", () => { if (window.juegoPausado) return; if (player.isFlying) player.move(0, -getVelocidadActual()); });
    onKeyDown("down", () => { if (window.juegoPausado) return; if (player.isFlying) player.move(0, getVelocidadActual()); });
    onKeyDown("s", () => { if (window.juegoPausado) return; if (player.isFlying) player.move(0, getVelocidadActual()); });

    onKeyPress("space", () => {
        if (window.juegoPausado) return;
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

    // Dash Espectral con candado de pausa
    let puedeDashear = true;
    onKeyPress("q", () => {
        if (window.juegoPausado) return;
        if (!puedeDashear || player.isDashing) return;
        puedeDashear = false;
        player.isDashing = true;
        player.opacity = 0.5; // Semitransparente
        playDash();
        player.opacity = 0.5;

        const impulso = player.direccion === 1 ? VEL_DASH : -VEL_DASH;
        const dashAnim = onUpdate(() => {
            if (window.juegoPausado) return;
            player.move(impulso, 0);
        });

        wait(0.2, () => {
            dashAnim.cancel();
            player.isDashing = false;
            player.opacity = 1;
        });

        wait(1, () => { puedeDashear = true; });
    });

    // Combate con candado de pausa
    function resetAttack() { wait(COOLDOWN_ATAQUE, () => { player.canAttack = true; }); }

    onKeyPress("j", () => {
        if (window.juegoPausado) return;
        if (!player.canAttack || player.isDashing) return;
        player.canAttack = false;
        playSword();
        player.play("melee");
        const offsetX = player.direccion === 1 ? 40 : -40;
        const hitbox = add([rect(50, 40), pos(player.pos.add(offsetX, 0)), anchor("center"), area(), color(255, 100, 100), "sword_hitbox"]);
        wait(0.1, () => { destroy(hitbox); });
        resetAttack();
    });

    onKeyPress("k", () => {
        if (window.juegoPausado) return;
        if (!player.canAttack || player.isDashing) return;
        player.canAttack = false;
        playLaser();
        player.play("shoot");
        const offsetX = player.direccion === 1 ? 30 : -30;
        add([circle(10), pos(player.pos.add(offsetX, 10)), anchor("center"), area(), color(100, 100, 255), move(player.direccion === 1 ? RIGHT : LEFT, VEL_LASER), offscreen({ destroy: true }), "laser"]);
        resetAttack();
    });

    player.onAnimEnd((anim) => {
        if (anim === "melee" || anim === "shoot" || anim === "hit") {
            player.play("idle");
        }
    });

    onUpdate(() => {
        if (window.juegoPausado) return;
        if (player.pos.x < 20) player.pos.x = 20;
        if (player.pos.x > width() - 20) player.pos.x = width() - 20;
        if (player.pos.y < 20) player.pos.y = 20;
    });

    return player;
}