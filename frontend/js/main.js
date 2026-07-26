import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
import { loadGameAssets } from "./assets.js";
import { setupPlayer } from "./player.js";
import { setupEnemies } from "./enemies.js";
import { setupHUD, PUNTOS_ZOMBIE, PUNTOS_AEREO } from "./hud.js";

kaboom({ background: [ 22, 33, 62 ] });
loadGameAssets(); 

setGravity(1800);
const ALTO_PISO = 60;

// ===============================================================
// SISTEMA DE ECONOMÍA Y PERSISTENCIA (LOCALSTORAGE)
// ===============================================================
const CLAVE_MONEDAS = "xolotl_monedas_demo";
const CLAVE_SKIN = "xolotl_skin_activa";

function getMonedas() {
    try { return Number(localStorage.getItem(CLAVE_MONEDAS)) || 0; } catch { return 0; }
}

function sumarMonedas(cantidad) {
    try {
        const total = getMonedas() + cantidad;
        localStorage.setItem(CLAVE_MONEDAS, String(total));
        return total;
    } catch { return 0; }
}

function gastarMonedas(cantidad) {
    const actual = getMonedas();
    if (actual >= cantidad) {
        localStorage.setItem(CLAVE_MONEDAS, String(actual - cantidad));
        return true;
    }
    return false;
}

// ===============================================================
// ESCENA: MENÚ PRINCIPAL
// ===============================================================
scene("menu", () => {
    const centroX = width() / 2;
    const centroY = height() / 2;

    add([
        rect(width(), height()),
        pos(0, 0),
        color(10, 15, 30),
        fixed()
    ]);

    loop(0.1, () => {
        add([
            circle(rand(1, 3)),
            pos(rand(0, width()), height() + 10),
            color(rgb(0, 255, 255)),
            opacity(rand(0.3, 0.8)),
            move(UP, rand(20, 60)),
            offscreen({ destroy: true }),
            "chispa"
        ]);
    });

    const xolotlMenu = add([
        sprite("xolotl"),
        pos(centroX, centroY - 140),
        scale(1.5),
        anchor("center")
    ]);
    
    xolotlMenu.onUpdate(() => {
        xolotlMenu.pos.y = (centroY - 140) + wave(-10, 10, time() * 2);
    });

    const titulo = add([
        text("XÓLOTL WARRIOR", { size: 64 }),
        pos(centroX, centroY - 20),
        anchor("center"),
        color(255, 215, 0)
    ]);
    
    titulo.onUpdate(() => {
        titulo.scale = vec2(wave(1, 1.03, time() * 3));
        titulo.color = rgb(255, wave(180, 215, time() * 4), 0);
    });

    // BOTÓN JUGAR
    const btnJugar = add([
        rect(260, 60, { radius: 15 }),
        pos(centroX, centroY + 60),
        anchor("center"),
        area(),
        color(20, 40, 80),
        outline(3, rgb(0, 255, 255)),
    ]);
    btnJugar.add([text("INICIAR RETO", { size: 22 }), anchor("center"), color(255, 255, 255)]);

    btnJugar.onClick(() => go("game"));

    // BOTÓN TIENDA (EL ALTAR)
    const btnTienda = add([
        rect(260, 60, { radius: 15 }),
        pos(centroX, centroY + 135),
        anchor("center"),
        area(),
        color(80, 20, 80),
        outline(3, rgb(255, 0, 255)),
    ]);
    btnTienda.add([text("EL ALTAR (SHOP)", { size: 22 }), anchor("center"), color(255, 255, 255)]);

    btnTienda.onClick(() => go("shop"));

    add([
        text(`Almas/Monedas: 🪙 ${getMonedas()}`, { size: 20 }),
        pos(centroX, centroY + 190),
        anchor("center"),
        color(255, 215, 0)
    ]);

    add([
        text("HackaTec 2026", { size: 16 }),
        pos(centroX, height() - 30),
        anchor("center"),
        color(100, 200, 255),
        opacity(0.8)
    ]);
});

// ===============================================================
// ESCENA: TIENDA DE SKINS (EL ALTAR)
// ===============================================================
scene("shop", () => {
    const centroX = width() / 2;

    add([
        rect(width(), height()),
        pos(0, 0),
        color(15, 10, 25),
        fixed()
    ]);

    add([
        text("EL ALTAR SAGRADO (TIENDA)", { size: 42 }),
        pos(centroX, 60),
        anchor("center"),
        color(255, 215, 0)
    ]);

    const txtMonedas = add([
        text(`Almas Disponibles: 🪙 ${getMonedas()}`, { size: 24 }),
        pos(centroX, 120),
        anchor("center"),
        color(0, 255, 255)
    ]);

    // Opciones de Skins
    const skins = [
        { id: "normal", nombre: "Xólotl Clásico", costo: 0, color: rgb(255, 255, 255) },
        { id: "serpiente", nombre: "Serpiente Emplumada", costo: 30, color: rgb(0, 255, 120) },
        { id: "mictlan", nombre: "Calavera del Mictlán", costo: 60, color: rgb(255, 50, 150) },
    ];

    skins.forEach((skin, index) => {
        const posY = 220 + (index * 110);
        const card = add([
            rect(600, 80, { radius: 10 }),
            pos(centroX, posY),
            anchor("center"),
            area(),
            color(30, 30, 50),
            outline(2, skin.color)
        ]);

        const skinActiva = localStorage.getItem(CLAVE_SKIN) || "normal";
        const esActiva = skinActiva === skin.id;

        card.add([
            text(`${skin.nombre} ${skin.costo > 0 ? `(${skin.costo} 🪙)` : "(Desbloqueado)"}`, { size: 20 }),
            pos(-270, 0),
            anchor("left"),
            color(esActiva ? rgb(255, 215, 0) : rgb(255, 255, 255))
        ]);

        const btnAccion = card.add([
            rect(140, 45, { radius: 8 }),
            pos(200, 0),
            anchor("center"),
            area(),
            color(esActiva ? rgb(50, 150, 50) : (getMonedas() >= skin.costo ? rgb(0, 100, 200) : rgb(80, 80, 80)))
        ]);

        const textoBtn = btnAccion.add([
            text(esActiva ? "EQUIPADO" : "OBTENER", { size: 16 }),
            anchor("center"),
            color(255, 255, 255)
        ]);

        btnAccion.onClick(() => {
            if (esActiva) return;

            if (skin.costo === 0 || gastarMonedas(skin.costo)) {
                localStorage.setItem(CLAVE_SKIN, skin.id);
                go("shop"); 
            } else {
                shake(4);
            }
        });
    });

    // BOTÓN VOLVER
    const btnVolver = add([
        rect(200, 50, { radius: 10 }),
        pos(centroX, height() - 70),
        anchor("center"),
        area(),
        color(50, 50, 50),
        outline(2, rgb(255, 255, 255))
    ]);
    btnVolver.add([text("REGRESAR", { size: 20 }), anchor("center"), color(255, 255, 255)]);
    btnVolver.onClick(() => go("menu"));
});

// ===============================================================
// ESCENA: JUEGO PRINCIPAL
// ===============================================================
scene("game", () => {
    const fondo = add([
        sprite("fondo", { width: width(), height: height() }),
        pos(width() / 2, height() / 2),
        anchor("center"),
        color(255, 255, 255), 
        z(-1) 
    ]);

    add([
        rect(width(), ALTO_PISO), 
        pos(0, height()), 
        anchor("botleft"),
        area(), 
        body({ isStatic: true }), 
        opacity(0), 
        "ground"
    ]);

    const nucleo = add([
        rect(60, 80), pos(width() / 2, height() - ALTO_PISO), anchor("bot"), 
        area(), color(255, 215, 0), "nucleo", { hp: 5 }
    ]);

    const player = setupPlayer();
    const hud = setupHUD(nucleo.hp, player.hp);
    const enemiesSystem = setupEnemies(nucleo, hud);

    const skinActiva = localStorage.getItem(CLAVE_SKIN) || "normal";
    if (skinActiva === "serpiente") player.color = rgb(0, 255, 120);
    if (skinActiva === "mictlan") player.color = rgb(255, 50, 150);

    onUpdate(() => {
        if (window.juegoPausado) return;
        if (enemiesSystem.isLunaDeSangreActiva()) {
            fondo.color = rgb(255, 100, 100); 
        } else {
            fondo.color = rgb(255, 255, 255); 
        }
    });

    onCollide("player", "coin", (p, coin) => {
        if (window.juegoPausado) return;
        destroy(coin);
        sumarMonedas(1);
    });

    player.elemento = "normal";
    let temporizadorElemento = null;

    function aplicarElemento(nuevoElemento) {
        player.elemento = nuevoElemento;
        if (nuevoElemento === "fuego") player.color = rgb(255, 100, 50);
        else if (nuevoElemento === "hielo") player.color = rgb(100, 200, 255);
        else if (nuevoElemento === "rayo") player.color = rgb(255, 255, 0);

        clearTimeout(temporizadorElemento);
        temporizadorElemento = setTimeout(() => {
            player.elemento = "normal";
            if (skinActiva === "serpiente") player.color = rgb(0, 255, 120);
            else if (skinActiva === "mictlan") player.color = rgb(255, 50, 150);
            else player.color = rgb(255, 255, 255);
        }, 12000);
    }

    onCollide("player", "powerup", (p, powerup) => {
        if (window.juegoPausado) return;
        aplicarElemento(powerup.tipoElemento);
        destroy(powerup);
    });

    let pausado = false;
    onKeyPress("escape", () => {
        pausado = !pausado;
        window.juegoPausado = pausado;
        if (pausado) {
            add([rect(width(), height()), pos(0, 0), color(0, 0, 0), opacity(0.6), fixed(), z(100), "pause-ui"]);
            add([text("JUEGO PAUSADO", { size: 48 }), pos(width() / 2, height() / 2 - 40), anchor("center"), color(255, 215, 0), fixed(), z(101), "pause-ui"]);
            add([text("Presiona ESC para continuar\nPresiona M para volver al Menú", { size: 20, align: "center" }), pos(width() / 2, height() / 2 + 30), anchor("center"), color(255, 255, 255), fixed(), z(101), "pause-ui"]);
        } else {
            destroyAll("pause-ui");
        }
    });

    onKeyPress("m", () => { if (pausado) go("menu"); });

    onKeyPress("e", () => {
        if (window.juegoPausado) return;
        if (!hud.gastarEnergia()) {
            hud.avisarOleada("¡Energía insuficiente!");
            return;
        }

        shake(24);
        add([rect(width(), height()), pos(0, 0), color(0, 255, 255), opacity(0.8), fixed(), z(200), lifespan(0.3, { fade: 0.3 })]);

        const playerObj = get("player")[0];
        const centroOnda = playerObj ? playerObj.pos : vec2(width()/2, height()/2);
        const onda = add([circle(10), pos(centroOnda), anchor("center"), color(255, 215, 0), opacity(0.6), area(), z(199), "ulti-wave"]);

        tween(10, Math.max(width(), height()) * 1.5, 0.4, (r) => onda.radius = r, easings.easeOutQuad).onEnd(() => destroy(onda));

        get("enemy").forEach((enemy) => {
            if (enemy.isSpawning) return;
            if (enemy.tier === 3) golpearEnemigo(enemy, 8); 
            else matarEnemigo(enemy);
        });
    });

    function matarEnemigo(enemy) {
        const basePuntos = enemy.is("zombie") ? PUNTOS_ZOMBIE : PUNTOS_AEREO;
        const puntosFinales = basePuntos * (enemiesSystem.isLunaDeSangreActiva() ? 2 : 1);
        
        hud.contarEnemigo(puntosFinales);
        hud.cargarEnergia(25);
        
        enemiesSystem.soltarPowerUp(enemy.pos);
        enemiesSystem.soltarMoneda(enemy.pos);
        destroy(enemy);
    }

    function golpearEnemigo(enemy, danio) {
        if (enemy.isSpawning) return;
        enemy.hp -= danio;

        const colorOriginal = enemy.color;
        enemy.color = rgb(255, 255, 255);
        wait(0.1, () => { if (enemy.exists()) enemy.color = colorOriginal; });

        if (enemy.tier !== 3) {
            enemy.isKnockedBack = true; 
            const centroNucleo = vec2(width() / 2, height() - ALTO_PISO);
            const direccionAlejamiento = enemy.pos.sub(centroNucleo).unit();
            
            tween(enemy.pos, enemy.pos.add(direccionAlejamiento.scale(40)), 0.15, (p) => enemy.pos = p, easings.easeOutQuad)
                .onEnd(() => { if (enemy.exists()) enemy.isKnockedBack = false; });
        }

        if (enemy.hp <= 0) matarEnemigo(enemy);
    }

    function terminar() {
        const resumen = hud.terminarPartida();
        hud.ocultar();
        go("gameover", resumen);
    }

    onCollide("sword_hitbox", "enemy", (hitbox, enemy) => {
        let danio = 2;
        if (player.elemento === "fuego") danio = 4;
        golpearEnemigo(enemy, danio);
        if (player.elemento === "rayo") {
            get("enemy").forEach((otro) => {
                if (otro !== enemy && otro.pos.dist(enemy.pos) < 100) golpearEnemigo(otro, 2);
            });
        }
    });

    onCollide("laser", "enemy", (laser, enemy) => {
        destroy(laser); 
        let danio = 1;
        if (player.elemento === "fuego") danio = 2;
        if (player.elemento === "hielo") {
            enemy.velocidad *= 0.3;
            wait(3, () => { if (enemy.exists()) enemy.velocidad = 130; });
        }
        golpearEnemigo(enemy, danio); 
    });

    onCollide("enemy", "nucleo", (enemy, nuc) => {
        if (enemy.isSpawning) return;
        destroy(enemy); 
        nuc.hp -= (enemy.tier === 3) ? 3 : 1; 
        shake(12); 
        hud.setVidaNucleo(nuc.hp);
        nuc.color = rgb(255, 0, 0); 
        wait(0.2, () => nuc.color = rgb(255, 215, 0)); 
        if (nuc.hp <= 0) terminar(); 
    });

    onCollide("enemy", "player", (enemy, p) => {
        if (enemy.isSpawning || p.isDashing) return; 
        destroy(enemy); 
        p.hp -= 1; 
        shake(6); 
        hud.setVidaJugador(p.hp);
        if (p.hp <= 0) p.morir(() => terminar()); 
        else p.recibirDanio(); 
    });
});

// ===============================================================
// ESCENA: GAME OVER & LEADERBOARD (BACKEND INTEGRATION)
// ===============================================================
scene("gameover", (resumen) => {
    const centroX = width() / 2;
    const centroY = height() / 2;

    add([ text("FIN DEL JUEGO", { size: 48 }), pos(centroX, centroY - 180), anchor("center"), color(255, 50, 50) ]);
    add([ text(`Tiempo: ${resumen.tiempo}    Enemigos: ${resumen.enemigos}`, { size: 20 }), pos(centroX, centroY - 120), anchor("center"), color(180, 180, 180) ]);
    add([ text(`PUNTOS: ${resumen.puntos}`, { size: 32 }), pos(centroX, centroY - 80), anchor("center"), color(255, 215, 0) ]);

    // Input visual para iniciales estilo arcade
    let iniciales = "AAA";
    let indiceActual = 0;
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const txtIniciales = add([
        text(`REGISTRAR INICIALES: [ ${iniciales} ]`, { size: 24 }),
        pos(centroX, centroY - 30),
        anchor("center"),
        color(0, 255, 255)
    ]);

    add([ text("Usa ARRIBA/ABAJO para cambiar letra, IZQ/DER para mover, ENTER para guardar", { size: 14 }), pos(centroX, centroY + 10), anchor("center"), color(150, 150, 150) ]);

    // Control de selección de iniciales
    onKeyPress("up", () => {
        let charCode = iniciales.charCodeAt(indiceActual);
        let indexLetra = letras.indexOf(String.fromCharCode(charCode));
        indexLetra = (indexLetra + 1) % letras.length;
        iniciales = iniciales.substring(0, indiceActual) + letras[indexLetra] + iniciales.substring(indiceActual + 1);
        txtIniciales.text = `REGISTRAR INICIALES: [ ${iniciales} ]`;
    });

    onKeyPress("down", () => {
        let charCode = iniciales.charCodeAt(indiceActual);
        let indexLetra = letras.indexOf(String.fromCharCode(charCode));
        indexLetra = (indexLetra - 1 + letras.length) % letras.length;
        iniciales = iniciales.substring(0, indiceActual) + letras[indexLetra] + iniciales.substring(indiceActual + 1);
        txtIniciales.text = `REGISTRAR INICIALES: [ ${iniciales} ]`;
    });

    onKeyPress("right", () => {
        indiceActual = (indiceActual + 1) % 3;
    });

    onKeyPress("left", () => {
        indiceActual = (indiceActual - 1 + 3) % 3;
    });

    let scoreGuardado = false;

    // Al presionar ENTER se envía el score al servidor backend de Node.js
    onKeyPress("enter", async () => {
        if (scoreGuardado) return;
        scoreGuardado = true;

        try {
            await fetch("https://k572xn1fxj.execute-api.us-east-2.amazonaws.com/default/XolotlApi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: iniciales,
                    puntos: resumen.puntos,
                    tiempo: resumen.tiempo
                })
            });
            txtIniciales.text = "¡GUARDADO EN EL BACKEND! (Presiona R para reiniciar)";
            txtIniciales.color = rgb(0, 255, 120);
        } catch (error) {
            console.error("Error al conectar con el backend:", error);
            txtIniciales.text = "ERROR DE CONEXIÓN CON EL SERVIDOR";
            txtIniciales.color = rgb(255, 0, 0);
        }
    });

    add([ text("Presiona R para reiniciar la partida", { size: 20 }), pos(centroX, height() - 50), anchor("center"), color(255, 255, 255) ]);

    onKeyPress("r", () => go("game"));
});

go("menu");