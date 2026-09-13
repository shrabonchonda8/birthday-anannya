/* =========================================================
   BATTLE ROYALE MOBILE GAME
   main.js
   Pure HTML + CSS + JavaScript + Canvas
   No external libraries
========================================================= */

"use strict";

/* =========================================================
   CONFIG
========================================================= */

const CFG = window.GAME_CONFIG || {
    world: {
        width: 3200,
        height: 3200
    },
    player: {
        health: 100,
        speed: 245,
        radius: 18
    },
    maxPlayers: 15,
    ammo: {
        magazine: 30,
        reserve: 120
    },
    zone: {
        startRadius: 1400,
        minRadius: 220,
        shrinkDuration: 35,
        waitDuration: 55,
        damagePerSecond: 6
    },
    graphics: {
        maxPixelRatio: 2
    }
};


/* =========================================================
   DOM
========================================================= */

const $ = id => document.getElementById(id);

const canvas = $("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const screens = {
    loading: $("loadingScreen"),
    menu: $("mainMenu"),
    game: $("gameScreen"),
    loadout: $("loadoutScreen"),
    settings: $("settingsScreen"),
    pause: $("pauseMenu"),
    gameover: $("gameOverScreen")
};

const UI = {
    loadingProgress: $("loadingProgress"),

    playButton: $("playButton"),
    loadoutButton: $("loadoutButton"),
    settingsButton: $("settingsButton"),

    resumeButton: $("resumeButton"),
    pauseRestartButton: $("pauseRestartButton"),
    exitMatchButton: $("exitMatchButton"),

    playAgainButton: $("playAgainButton"),
    resultMenuButton: $("resultMenuButton"),

    loadoutBackButton: $("loadoutBackButton"),
    settingsBackButton: $("settingsBackButton"),
    resetSettingsButton: $("resetSettingsButton"),

    fireButton: $("fireButton"),
    reloadButton: $("reloadButton"),
    healButton: $("healButton"),
    crouchButton: $("crouchButton"),

    movementJoystick: $("movementJoystick"),
    joystickKnob: $("joystickKnob"),
    aimArea: $("aimArea"),

    healthBar: $("healthBar"),
    healthText: $("healthText"),
    aliveCount: $("aliveCount"),
    zoneTimer: $("zoneTimer"),

    killFeed: $("killFeed"),

    miniMap: $("miniMap"),

    weaponName: $("weaponName"),
    weaponAmmo: $("weaponAmmo"),

    damageVignette: $("damageVignette"),

    reloadIndicator: $("reloadIndicator"),
    reloadProgress: $("reloadProgress"),

    resultPlacement: $("resultPlacement"),
    resultKills: $("resultKills"),
    resultDamage: $("resultDamage"),
    resultXP: $("resultXP"),
    resultXPFill: $("resultXPFill"),
    resultTitle: $("resultTitle"),
    resultSubtitle: $("resultSubtitle"),
    resultBadge: $("resultBadge"),

    menuPlayerName: $("menuPlayerName"),
    menuPlayerLevel: $("menuPlayerLevel"),
    menuCoins: $("menuCoins"),
    menuGold: $("menuGold"),

    hudPlayerName: $("hudPlayerName"),

    graphicsQuality: $("graphicsQuality"),
    screenShakeToggle: $("screenShakeToggle"),
    soundToggle: $("soundToggle"),
    musicToggle: $("musicToggle"),
    sensitivitySlider: $("sensitivitySlider"),
    vibrationToggle: $("vibrationToggle"),

    menuCharacterSVG: $("menuCharacterSVG"),

    toast: $("toast"),
    orientationWarning: $("orientationWarning")
};


/* =========================================================
   UTILITIES
========================================================= */

const TAU = Math.PI * 2;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function normalize(x, y) {
    const len = Math.hypot(x, y);

    if (len < 0.0001) {
        return {
            x: 0,
            y: 0
        };
    }

    return {
        x: x / len,
        y: y / len
    };
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function formatTime(seconds) {
    seconds = Math.max(0, Math.ceil(seconds));

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


/* =========================================================
   SETTINGS / SAVE DATA
========================================================= */

const DEFAULT_SETTINGS = {
    graphicsQuality: "high",
    screenShake: true,
    sound: true,
    music: true,
    sensitivity: 1,
    vibration: true
};

let settings = loadSettings();

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem("BR_SETTINGS"));

        return {
            ...DEFAULT_SETTINGS,
            ...(saved || {})
        };
    } catch (error) {
        return {
            ...DEFAULT_SETTINGS
        };
    }
}

function saveSettings() {
    try {
        localStorage.setItem(
            "BR_SETTINGS",
            JSON.stringify(settings)
        );
    } catch (error) {}
}


/* =========================================================
   PLAYER PROFILE
========================================================= */

let profile = loadProfile();

function loadProfile() {
    try {
        const saved = JSON.parse(localStorage.getItem("BR_PROFILE"));

        return {
            name: saved?.name || "PLAYER",
            level: saved?.level || 1,
            coins: saved?.coins || 1250,
            gold: saved?.gold || 50,
            xp: saved?.xp || 0
        };
    } catch (error) {
        return {
            name: "PLAYER",
            level: 1,
            coins: 1250,
            gold: 50,
            xp: 0
        };
    }
}

function saveProfile() {
    try {
        localStorage.setItem(
            "BR_PROFILE",
            JSON.stringify(profile)
        );
    } catch (error) {}
}

function updateProfileUI() {
    if (UI.menuPlayerName) {
        UI.menuPlayerName.textContent = profile.name;
    }

    if (UI.menuPlayerLevel) {
        UI.menuPlayerLevel.textContent = `LVL ${profile.level}`;
    }

    if (UI.menuCoins) {
        UI.menuCoins.textContent = profile.coins;
    }

    if (UI.menuGold) {
        UI.menuGold.textContent = profile.gold;
    }

    if (UI.hudPlayerName) {
        UI.hudPlayerName.textContent = profile.name;
    }
}


/* =========================================================
   GAME STATE
========================================================= */

let gameState = "loading";

let lastTime = 0;
let accumulator = 0;

let gameTime = 0;

let player = null;

let enemies = [];
let bullets = [];
let particles = [];
let lootItems = [];
let obstacles = [];
let trees = [];
let rocks = [];
let buildings = [];

let killFeedMessages = [];

let camera = {
    x: 0,
    y: 0
};

let zone = {
    x: CFG.world.width / 2,
    y: CFG.world.height / 2,
    radius: CFG.zone.startRadius,

    phase: 0,
    state: "waiting",

    timer: CFG.zone.waitDuration,

    startRadius: CFG.zone.startRadius,
    targetRadius: CFG.zone.startRadius,

    startX: CFG.world.width / 2,
    startY: CFG.world.height / 2,

    targetX: CFG.world.width / 2,
    targetY: CFG.world.height / 2,

    progress: 0
};

let stats = {
    kills: 0,
    damage: 0,
    shots: 0,
    hits: 0,
    survivalTime: 0
};

let shake = {
    time: 0,
    power: 0
};

let damageFlash = 0;

let muzzleFlash = 0;

let toastTimeout = null;

let audioContext = null;
let musicTimer = null;


/* =========================================================
   WEAPONS
========================================================= */

const WEAPONS = {
    rifle: {
        id: "rifle",
        name: "ASSAULT RIFLE",

        damage: 27,

        fireRate: 0.105,

        magazine: 30,
        reserve: 120,

        reloadTime: 1.65,

        bulletSpeed: 1050,

        spread: 0.035,

        range: 1100,

        pellets: 1,

        recoil: 0.025,

        color: "#f4c84a"
    },

    smg: {
        id: "smg",
        name: "SMG",

        damage: 19,

        fireRate: 0.075,

        magazine: 35,
        reserve: 140,

        reloadTime: 1.45,

        bulletSpeed: 1000,

        spread: 0.075,

        range: 850,

        pellets: 1,

        recoil: 0.035,

        color: "#63e6ff"
    },

    shotgun: {
        id: "shotgun",
        name: "SHOTGUN",

        damage: 12,

        fireRate: 0.7,

        magazine: 6,
        reserve: 36,

        reloadTime: 1.8,

        bulletSpeed: 850,

        spread: 0.19,

        range: 600,

        pellets: 8,

        recoil: 0.08,

        color: "#ff9d45"
    }
};


/* =========================================================
   INPUT
========================================================= */

const input = {
    keys: new Set(),

    mouseX: 0,
    mouseY: 0,

    mouseDown: false,

    firing: false,

    joystickX: 0,
    joystickY: 0,

    joystickPointer: null,

    aimPointer: null,

    aimActive: false,

    aimX: 0,
    aimY: 0,

    firePointer: null,

    crouch: false,

    heal: false,

    reload: false
};


/* =========================================================
   RESIZE
========================================================= */

let viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: 1
};

function resizeCanvas() {
    if (!canvas || !ctx) return;

    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;

    const maxDPR =
        settings.graphicsQuality === "low"
            ? 1
            : settings.graphicsQuality === "medium"
                ? 1.5
                : CFG.graphics.maxPixelRatio || 2;

    viewport.dpr = Math.min(
        window.devicePixelRatio || 1,
        maxDPR
    );

    canvas.width =
        Math.floor(viewport.width * viewport.dpr);

    canvas.height =
        Math.floor(viewport.height * viewport.dpr);

    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    ctx.setTransform(
        viewport.dpr,
        0,
        0,
        viewport.dpr,
        0,
        0
    );

    if (player) {
        updateCamera(1);
    }

    updateOrientationWarning();
}

window.addEventListener("resize", resizeCanvas);

window.addEventListener(
    "orientationchange",
    () => {
        setTimeout(resizeCanvas, 150);
    }
);


/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function showScreen(name) {
    Object.keys(screens).forEach(key => {
        const screen = screens[key];

        if (!screen) return;

        const shouldShow = key === name;

        screen.classList.toggle(
            "hidden",
            !shouldShow
        );

        screen.setAttribute(
            "aria-hidden",
            String(!shouldShow)
        );
    });
}

function openMenu() {
    gameState = "menu";

    showScreen("menu");

    updateProfileUI();

    stopMusic();
}

function openLoadout() {
    gameState = "loadout";

    showScreen("loadout");
}

function openSettings() {
    gameState = "settings";

    syncSettingsUI();

    showScreen("settings");
}

function startGame() {
    createNewMatch();

    gameState = "playing";

    showScreen("game");

    initAudio();

    if (settings.music) {
        startMusic();
    }

    vibrate(25);

    showToast("MATCH STARTED");

    lastTime = performance.now();
}

function pauseGame() {
    if (gameState !== "playing") return;

    gameState = "paused";

    showScreen("pause");

    stopMusic();
}

function resumeGame() {
    if (gameState !== "paused") return;

    gameState = "playing";

    showScreen("game");

    if (settings.music) {
        startMusic();
    }

    lastTime = performance.now();
}

function restartGame() {
    startGame();
}

function exitMatch() {
    stopMusic();

    gameState = "menu";

    showScreen("menu");

    updateProfileUI();
}

function finishGame(victory = false) {
    if (gameState === "gameover") return;

    gameState = "gameover";

    const placement =
        victory
            ? 1
            : Math.min(
                CFG.maxPlayers,
                enemies.length + 1
            );

    const xp =
        50 +
        stats.kills * 35 +
        Math.floor(stats.survivalTime / 10) +
        (victory ? 250 : 0);

    stats.placement = placement;
    stats.xp = xp;

    addXP(xp);

    if (UI.resultPlacement) {
        UI.resultPlacement.textContent =
            `#${placement}`;
    }

    if (UI.resultKills) {
        UI.resultKills.textContent =
            stats.kills;
    }

    if (UI.resultDamage) {
        UI.resultDamage.textContent =
            Math.floor(stats.damage);
    }

    if (UI.resultXP) {
        UI.resultXP.textContent =
            `+${xp} XP`;
    }

    if (UI.resultXPFill) {
        const currentXP =
            profile.xp % 1000;

        UI.resultXPFill.style.width =
            `${clamp(currentXP / 10, 0, 100)}%`;
    }

    if (UI.resultTitle) {
        UI.resultTitle.textContent =
            victory
                ? "VICTORY"
                : "MATCH OVER";
    }

    if (UI.resultSubtitle) {
        UI.resultSubtitle.textContent =
            victory
                ? "You are the last survivor."
                : "Better luck next time.";
    }

    if (UI.resultBadge) {
        UI.resultBadge.textContent =
            victory
                ? "BOOYAH!"
                : "DEFEATED";

        UI.resultBadge.style.color =
            victory
                ? "#7cff8a"
                : "#ff6868";
    }

    showScreen("gameover");

    stopMusic();

    if (victory) {
        playVictorySound();
        vibrate([50, 80, 100]);
    } else {
        playDefeatSound();
    }
}


/* =========================================================
   PROFILE XP
========================================================= */

function addXP(amount) {
    profile.xp += amount;

    while (profile.xp >= 1000) {
        profile.xp -= 1000;
        profile.level++;
        profile.coins += 100;

        showToast(
            `LEVEL UP! LEVEL ${profile.level}`
        );
    }

    saveProfile();
    updateProfileUI();
}


/* =========================================================
   MATCH GENERATION
========================================================= */

function createNewMatch() {
    gameTime = 0;

    enemies = [];
    bullets = [];
    particles = [];
    lootItems = [];
    obstacles = [];
    trees = [];
    rocks = [];
    buildings = [];

    killFeedMessages = [];

    stats = {
        kills: 0,
        damage: 0,
        shots: 0,
        hits: 0,
        survivalTime: 0
    };

    damageFlash = 0;
    muzzleFlash = 0;

    shake.time = 0;
    shake.power = 0;

    createWorld();

    createPlayer();

    createEnemies();

    createLoot();

    resetZone();

    updateCamera(1);

    updateHUD();
}


/* =========================================================
   WORLD
========================================================= */

function createWorld() {

    /*
       Buildings
    */

    const buildingCount = 18;

    for (let i = 0; i < buildingCount; i++) {

        const width = randInt(120, 300);
        const height = randInt(100, 260);

        const x = rand(
            180,
            CFG.world.width - width - 180
        );

        const y = rand(
            180,
            CFG.world.height - height - 180
        );

        const rect = {
            type: "building",

            x,
            y,

            width,
            height,

            color: randomChoice([
                "#343a40",
                "#3d4147",
                "#444a50",
                "#30353b"
            ])
        };

        if (!nearWorldCenter(rect, 170)) {
            buildings.push(rect);
            obstacles.push(rect);
        }
    }


    /*
       Rocks
    */

    for (let i = 0; i < 90; i++) {

        const rock = {
            type: "rock",

            x: rand(50, CFG.world.width - 50),
            y: rand(50, CFG.world.height - 50),

            radius: rand(12, 30)
        };

        if (!nearWorldCenter(rock, 90)) {
            rocks.push(rock);
        }
    }


    /*
       Trees
    */

    for (let i = 0; i < 170; i++) {

        const tree = {
            type: "tree",

            x: rand(40, CFG.world.width - 40),
            y: rand(40, CFG.world.height - 40),

            radius: rand(14, 24)
        };

        if (!nearWorldCenter(tree, 80)) {
            trees.push(tree);
        }
    }
}

function nearWorldCenter(object, distanceFromCenter) {

    const cx = CFG.world.width / 2;
    const cy = CFG.world.height / 2;

    let ox = object.x;
    let oy = object.y;

    if (object.width) {
        ox += object.width / 2;
        oy += object.height / 2;
    }

    return distance(
        cx,
        cy,
        ox,
        oy
    ) < distanceFromCenter;
}


/* =========================================================
   PLAYER
========================================================= */

function createPlayer() {

    const centerX =
        CFG.world.width / 2;

    const centerY =
        CFG.world.height / 2;

    player = {

        id: "player",

        x: centerX,
        y: centerY,

        radius:
            CFG.player.radius || 18,

        speed:
            CFG.player.speed || 245,

        health:
            CFG.player.health || 100,

        maxHealth:
            CFG.player.health || 100,

        armor: 50,

        angle: 0,

        crouching: false,

        weapon: "rifle",

        ammo: WEAPONS.rifle.magazine,

        reserveAmmo: WEAPONS.rifle.reserve,

        fireCooldown: 0,

        reloadTimer: 0,

        healingTimer: 0,

        healCharges: 2,

        invulnerable: 0,

        moving: false,

        kills: 0,

        damageTaken: 0
    };
}


/* =========================================================
   ENEMIES
========================================================= */

const BOT_NAMES = [
    "Shadow",
    "Raptor",
    "Ghost",
    "Venom",
    "Hunter",
    "Falcon",
    "Blaze",
    "Titan",
    "Sniper",
    "Reaper",
    "Wolf",
    "Viper",
    "Storm",
    "Phantom",
    "Rogue",
    "Inferno",
    "Ace",
    "Dragon"
];

function createEnemies() {

    const count =
        Math.max(
            4,
            (CFG.maxPlayers || 15) - 1
        );

    const usedNames = new Set();

    for (let i = 0; i < count; i++) {

        let spawn = findSafeSpawn(
            player.x,
            player.y,
            650
        );

        let name = randomChoice(BOT_NAMES);

        while (usedNames.has(name)) {
            name = randomChoice(BOT_NAMES);
        }

        usedNames.add(name);

        const enemy = {

            id: `bot_${i}`,

            name,

            x: spawn.x,
            y: spawn.y,

            radius: 17,

            health: 100,
            maxHealth: 100,

            armor: randInt(0, 50),

            angle: rand(-Math.PI, Math.PI),

            speed: rand(130, 190),

            weapon: randomChoice([
                "rifle",
                "rifle",
                "smg"
            ]),

            ammo: 30,

            reserveAmmo: 120,

            fireCooldown: rand(0, 1),

            reloadTimer: 0,

            thinkTimer: rand(0, 1),

            targetX: player.x,
            targetY: player.y,

            state: "patrol",

            strafeDirection:
                Math.random() > 0.5 ? 1 : -1,

            strafeTimer: rand(1, 3),

            accuracy: rand(0.48, 0.78),

            aggression: rand(0.5, 1),

            lastSeen: 0,

            hitFlash: 0
        };

        enemies.push(enemy);
    }
}


/* =========================================================
   SPAWN
========================================================= */

function findSafeSpawn(
    avoidX,
    avoidY,
    minDistance
) {

    for (let attempts = 0; attempts < 200; attempts++) {

        const x = rand(
            120,
            CFG.world.width - 120
        );

        const y = rand(
            120,
            CFG.world.height - 120
        );

        if (
            distance(
                x,
                y,
                avoidX,
                avoidY
            ) < minDistance
        ) {
            continue;
        }

        if (isPositionBlocked(x, y, 30)) {
            continue;
        }

        return { x, y };
    }

    return {
        x: rand(200, CFG.world.width - 200),
        y: rand(200, CFG.world.height - 200)
    };
}


/* =========================================================
   LOOT
========================================================= */

function createLoot() {

    for (let i = 0; i < 50; i++) {

        const type = randomChoice([
            "ammo",
            "medkit",
            "armor",
            "ammo",
            "ammo"
        ]);

        const x = rand(
            80,
            CFG.world.width - 80
        );

        const y = rand(
            80,
            CFG.world.height - 80
        );

        if (isPositionBlocked(x, y, 20)) {
            continue;
        }

        lootItems.push({
            id: `loot_${i}`,

            type,

            x,
            y,

            radius: 12,

            amount:
                type === "ammo"
                    ? randInt(20, 50)
                    : 1,

            bob:
                rand(0, TAU)
        });
    }
}


/* =========================================================
   ZONE
========================================================= */

function resetZone() {

    zone.x =
        CFG.world.width / 2;

    zone.y =
        CFG.world.height / 2;

    zone.radius =
        CFG.zone.startRadius;

    zone.startRadius =
        CFG.zone.startRadius;

    zone.targetRadius =
        CFG.zone.startRadius;

    zone.startX =
        zone.x;

    zone.startY =
        zone.y;

    zone.targetX =
        zone.x;

    zone.targetY =
        zone.y;

    zone.phase = 0;

    zone.state = "waiting";

    zone.timer =
        CFG.zone.waitDuration;

    zone.progress = 0;
}

function updateZone(dt) {

    zone.timer -= dt;

    if (zone.state === "waiting") {

        if (zone.timer <= 0) {

            zone.state = "shrinking";

            zone.phase++;

            zone.startRadius =
                zone.radius;

            zone.targetRadius =
                Math.max(
                    CFG.zone.minRadius,
                    zone.radius * 0.68
                );

            zone.startX = zone.x;
            zone.startY = zone.y;

            const maxMove =
                Math.max(
                    0,
                    zone.radius -
                    zone.targetRadius
                );

            const angle =
                rand(0, TAU);

            const moveDistance =
                rand(
                    0,
                    maxMove * 0.55
                );

            zone.targetX =
                clamp(
                    zone.x +
                    Math.cos(angle) *
                    moveDistance,

                    zone.targetRadius,

                    CFG.world.width -
                    zone.targetRadius
                );

            zone.targetY =
                clamp(
                    zone.y +
                    Math.sin(angle) *
                    moveDistance,

                    zone.targetRadius,

                    CFG.world.height -
                    zone.targetRadius
                );

            zone.timer =
                CFG.zone.shrinkDuration;

            zone.progress = 0;
        }

    } else if (zone.state === "shrinking") {

        zone.progress =
            1 -
            zone.timer /
            CFG.zone.shrinkDuration;

        const t =
            clamp(zone.progress, 0, 1);

        zone.radius =
            lerp(
                zone.startRadius,
                zone.targetRadius,
                t
            );

        zone.x =
            lerp(
                zone.startX,
                zone.targetX,
                t
            );

        zone.y =
            lerp(
                zone.startY,
                zone.targetY,
                t
            );

        if (zone.timer <= 0) {

            zone.radius =
                zone.targetRadius;

            zone.x =
                zone.targetX;

            zone.y =
                zone.targetY;

            if (
                zone.radius <=
                CFG.zone.minRadius + 1
            ) {

                zone.state = "final";

                zone.timer = 999999;

            } else {

                zone.state = "waiting";

                zone.timer =
                    CFG.zone.waitDuration;
            }
        }
    }


    /*
       Zone damage
    */

    if (player) {

        const d =
            distance(
                player.x,
                player.y,
                zone.x,
                zone.y
            );

        if (
            d >
            zone.radius
        ) {

            damagePlayer(
                CFG.zone.damagePerSecond * dt,
                null,
                true
            );
        }
    }

    for (const enemy of enemies) {

        const d =
            distance(
                enemy.x,
                enemy.y,
                zone.x,
                zone.y
            );

        if (
            d >
            zone.radius
        ) {

            enemy.health -=
                CFG.zone.damagePerSecond *
                dt;

            if (enemy.health <= 0) {
                killEnemy(
                    enemy,
                    null,
                    "ZONE"
                );
            }
        }
    }
}


/* =========================================================
   UPDATE
========================================================= */

function update(dt) {

    if (gameState !== "playing") {
        return;
    }

    dt = Math.min(dt, 0.05);

    gameTime += dt;

    stats.survivalTime =
        gameTime;

    updatePlayer(dt);

    updateEnemies(dt);

    updateBullets(dt);

    updateParticles(dt);

    updateLoot(dt);

    updateZone(dt);

    updateCamera(dt);

    updateEffects(dt);

    updateHUD();

    updateKillFeed(dt);

    if (
        enemies.length === 0 &&
        player &&
        player.health > 0
    ) {
        finishGame(true);
    }

    if (
        player &&
        player.health <= 0
    ) {
        finishGame(false);
    }
}


/* =========================================================
   PLAYER UPDATE
========================================================= */

function updatePlayer(dt) {

    if (!player) return;

    player.fireCooldown =
        Math.max(
            0,
            player.fireCooldown - dt
        );

    player.invulnerable =
        Math.max(
            0,
            player.invulnerable - dt
        );

    /*
       Reload
    */

    if (player.reloadTimer > 0) {

        player.reloadTimer -= dt;

        if (UI.reloadProgress) {

            const weapon =
                WEAPONS[player.weapon];

            const progress =
                1 -
                player.reloadTimer /
                weapon.reloadTime;

            UI.reloadProgress.style.width =
                `${clamp(progress * 100, 0, 100)}%`;
        }

        if (
            player.reloadTimer <= 0
        ) {
            completeReload();
        }
    }


    /*
       Heal
    */

    if (player.healingTimer > 0) {

        player.healingTimer -= dt;

        if (
            player.healingTimer <= 0
        ) {

            player.health =
                Math.min(
                    player.maxHealth,
                    player.health + 50
                );

            player.healCharges =
                Math.max(
                    0,
                    player.healCharges - 1
                );

            playHealSound();

            showToast("+50 HP");

            vibrate(30);
        }
    }


    /*
       Movement
    */

    let moveX = 0;
    let moveY = 0;

    if (
        input.keys.has("w") ||
        input.keys.has("arrowup")
    ) {
        moveY -= 1;
    }

    if (
        input.keys.has("s") ||
        input.keys.has("arrowdown")
    ) {
        moveY += 1;
    }

    if (
        input.keys.has("a") ||
        input.keys.has("arrowleft")
    ) {
        moveX -= 1;
    }

    if (
        input.keys.has("d") ||
        input.keys.has("arrowright")
    ) {
        moveX += 1;
    }

    moveX += input.joystickX;
    moveY += input.joystickY;

    const normalized =
        normalize(moveX, moveY);

    const moving =
        Math.hypot(
            moveX,
            moveY
        ) > 0.08;

    player.moving = moving;

    let speed =
        player.speed;

    if (player.crouching) {
        speed *= 0.58;
    }

    if (moving) {

        movePlayer(
            normalized.x *
            speed *
            dt,

            normalized.y *
            speed *
            dt
        );
    }


    /*
       Aim
    */

    updatePlayerAim();


    /*
       Fire
    */

    if (
        input.firing &&
        player.reloadTimer <= 0 &&
        player.healingTimer <= 0
    ) {
        shootPlayer();
    }


    /*
       Keyboard actions
    */

    if (input.reload) {
        input.reload = false;
        reloadPlayer();
    }

    if (input.heal) {
        input.heal = false;
        startHeal();
    }

    if (input.crouch) {
        input.crouch = false;
        player.crouching =
            !player.crouching;
    }


    /*
       Automatic reload
    */

    if (
        player.ammo <= 0 &&
        player.reserveAmmo > 0 &&
        player.reloadTimer <= 0
    ) {
        reloadPlayer();
    }


    /*
       Loot pickup
    */

    autoPickupLoot();
}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function movePlayer(dx, dy) {

    if (!player) return;

    const newX =
        clamp(
            player.x + dx,
            player.radius,
            CFG.world.width -
            player.radius
        );

    const newY =
        clamp(
            player.y + dy,
            player.radius,
            CFG.world.height -
            player.radius
        );

    if (
        !isPositionBlocked(
            newX,
            player.y,
            player.radius
        )
    ) {
        player.x = newX;
    }

    if (
        !isPositionBlocked(
            player.x,
            newY,
            player.radius
        )
    ) {
        player.y = newY;
    }
}


/* =========================================================
   PLAYER AIM
========================================================= */

function updatePlayerAim() {

    if (!player) return;

    let targetX;
    let targetY;

    if (input.aimActive) {

        const world =
            screenToWorld(
                input.aimX,
                input.aimY
            );

        targetX = world.x;
        targetY = world.y;

    } else {

        targetX = screenToWorld(
            input.mouseX,
            input.mouseY
        ).x;

        targetY = screenToWorld(
            input.mouseX,
            input.mouseY
        ).y;
    }

    player.angle =
        angleBetween(
            player.x,
            player.y,
            targetX,
            targetY
        );
}


/* =========================================================
   SHOOTING
========================================================= */

function shootPlayer() {

    if (!player) return;

    const weapon =
        WEAPONS[player.weapon];

    if (
        player.fireCooldown > 0
    ) {
        return;
    }

    if (
        player.ammo <= 0
    ) {
        reloadPlayer();
        return;
    }

    player.ammo--;

    player.fireCooldown =
        weapon.fireRate;

    stats.shots++;

    muzzleFlash =
        0.06;

    addShake(
        settings.screenShake
            ? 2.5
            : 0
    );

    playShootSound(
        weapon.id
    );

    vibrate(
        settings.vibration
            ? 8
            : 0
    );

    for (
        let i = 0;
        i < weapon.pellets;
        i++
    ) {

        const spread =
            rand(
                -weapon.spread,
                weapon.spread
            );

        const angle =
            player.angle +
            spread;

        const speed =
            weapon.bulletSpeed;

        bullets.push({

            owner: "player",

            x:
                player.x +
                Math.cos(angle) *
                28,

            y:
                player.y +
                Math.sin(angle) *
                28,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            damage:
                weapon.damage,

            life:
                weapon.range /
                speed,

            radius: 3,

            color:
                weapon.color
        });
    }

    createMuzzleParticles(
        player.x +
        Math.cos(player.angle) *
        25,

        player.y +
        Math.sin(player.angle) *
        25,

        player.angle
    );
}

function reloadPlayer() {

    if (!player) return;

    const weapon =
        WEAPONS[player.weapon];

    if (
        player.reloadTimer > 0
    ) {
        return;
    }

    if (
        player.ammo >=
        weapon.magazine
    ) {
        return;
    }

    if (
        player.reserveAmmo <= 0
    ) {
        showToast("NO AMMO");
        return;
    }

    player.reloadTimer =
        weapon.reloadTime;

    playReloadSound();

    if (UI.reloadIndicator) {
        UI.reloadIndicator.classList.add(
            "active"
        );
    }

    if (UI.reloadProgress) {
        UI.reloadProgress.style.width =
            "0%";
    }
}

function completeReload() {

    const weapon =
        WEAPONS[player.weapon];

    const needed =
        weapon.magazine -
        player.ammo;

    const amount =
        Math.min(
            needed,
            player.reserveAmmo
        );

    player.ammo += amount;
    player.reserveAmmo -= amount;

    if (UI.reloadIndicator) {
        UI.reloadIndicator.classList.remove(
            "active"
        );
    }

    if (UI.reloadProgress) {
        UI.reloadProgress.style.width =
            "100%";
    }

    showToast("RELOADED");
}


/* =========================================================
   HEAL
========================================================= */

function startHeal() {

    if (!player) return;

    if (
        player.healCharges <= 0
    ) {
        showToast("NO MEDKIT");
        return;
    }

    if (
        player.health >=
        player.maxHealth
    ) {
        showToast("HP FULL");
        return;
    }

    if (
        player.healingTimer > 0
    ) {
        return;
    }

    player.healingTimer = 2.0;

    showToast(
        "HEALING..."
    );
}


/* =========================================================
   ENEMY AI
========================================================= */

function updateEnemies(dt) {

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];

        if (!enemy) continue;

        enemy.fireCooldown =
            Math.max(
                0,
                enemy.fireCooldown - dt
            );

        enemy.reloadTimer =
            Math.max(
                0,
                enemy.reloadTimer - dt
            );

        enemy.thinkTimer -= dt;

        enemy.strafeTimer -= dt;

        enemy.hitFlash =
            Math.max(
                0,
                enemy.hitFlash - dt
            );


        /*
           Remove dead
        */

        if (enemy.health <= 0) {

            killEnemy(
                enemy,
                null,
                "UNKNOWN"
            );

            continue;
        }


        /*
           AI decision
        */

        const d =
            distance(
                enemy.x,
                enemy.y,
                player.x,
                player.y
            );

        const visible =
            d < 1050 &&
            hasLineOfSight(
                enemy.x,
                enemy.y,
                player.x,
                player.y
            );

        if (visible) {

            enemy.state =
                d < 650
                    ? "combat"
                    : "chase";

            enemy.targetX =
                player.x;

            enemy.targetY =
                player.y;

            enemy.lastSeen = 2.5;

        } else {

            enemy.lastSeen -= dt;

            if (
                enemy.lastSeen <= 0
            ) {
                enemy.state = "patrol";
            }
        }


        /*
           Think timer
        */

        if (enemy.thinkTimer <= 0) {

            enemy.thinkTimer =
                rand(0.25, 0.8);

            if (
                enemy.strafeTimer <= 0
            ) {

                enemy.strafeTimer =
                    rand(1, 2.5);

                enemy.strafeDirection *=
                    -1;
            }

            if (
                enemy.state === "patrol"
            ) {

                const angle =
                    rand(0, TAU);

                const roamDistance =
                    rand(120, 500);

                enemy.targetX =
                    clamp(
                        enemy.x +
                        Math.cos(angle) *
                        roamDistance,

                        80,
                        CFG.world.width -
                        80
                    );

                enemy.targetY =
                    clamp(
                        enemy.y +
                        Math.sin(angle) *
                        roamDistance,

                        80,
                        CFG.world.height -
                        80
                    );
            }
        }


        /*
           Aim
        */

        if (
            enemy.state === "combat" ||
            enemy.state === "chase"
        ) {

            const desiredAngle =
                angleBetween(
                    enemy.x,
                    enemy.y,
                    player.x,
                    player.y
                );

            let aimError =
                (1 -
                    enemy.accuracy) *
                0.25;

            enemy.angle =
                lerpAngle(
                    enemy.angle,
                    desiredAngle +
                    rand(
                        -aimError,
                        aimError
                    ),
                    dt * 5
                );
        } else {

            const desiredAngle =
                angleBetween(
                    enemy.x,
                    enemy.y,
                    enemy.targetX,
                    enemy.targetY
                );

            enemy.angle =
                lerpAngle(
                    enemy.angle,
                    desiredAngle,
                    dt * 2
                );
        }


        /*
           Movement
        */

        let moveX = 0;
        let moveY = 0;

        if (
            enemy.state === "combat"
        ) {

            if (d > 330) {

                moveX =
                    Math.cos(enemy.angle);

                moveY =
                    Math.sin(enemy.angle);

            } else if (d < 190) {

                moveX =
                    -Math.cos(enemy.angle);

                moveY =
                    -Math.sin(enemy.angle);

            } else {

                const strafeAngle =
                    enemy.angle +
                    Math.PI / 2 *
                    enemy.strafeDirection;

                moveX =
                    Math.cos(strafeAngle);

                moveY =
                    Math.sin(strafeAngle);
            }

        } else {

            const targetAngle =
                angleBetween(
                    enemy.x,
                    enemy.y,
                    enemy.targetX,
                    enemy.targetY
                );

            moveX =
                Math.cos(targetAngle);

            moveY =
                Math.sin(targetAngle);
        }


        /*
           Avoid obstacles
        */

        const avoidance =
            getAvoidanceVector(
                enemy.x,
                enemy.y,
                enemy.radius
            );

        moveX +=
            avoidance.x * 1.5;

        moveY +=
            avoidance.y * 1.5;

        const n =
            normalize(
                moveX,
                moveY
            );

        moveEnemy(
            enemy,
            n.x *
            enemy.speed *
            dt,

            n.y *
            enemy.speed *
            dt
        );


        /*
           Enemy shooting
        */

        if (
            enemy.state === "combat" &&
            visible &&
            d < 900
        ) {

            shootEnemy(enemy);
        }
    }
}


/* =========================================================
   ENEMY SHOOTING
========================================================= */

function shootEnemy(enemy) {

    const weapon =
        WEAPONS[enemy.weapon];

    if (
        enemy.reloadTimer > 0
    ) {
        return;
    }

    if (
        enemy.fireCooldown > 0
    ) {
        return;
    }

    if (
        enemy.ammo <= 0
    ) {

        enemy.reloadTimer =
            weapon.reloadTime;

        setTimeout(() => {

            if (
                enemy &&
                enemies.includes(enemy)
            ) {
                enemy.ammo =
                    weapon.magazine;
            }

        }, weapon.reloadTime * 1000);

        return;
    }

    enemy.ammo--;

    enemy.fireCooldown =
        weapon.fireRate *
        rand(1.5, 2.3);

    /*
       AI accuracy
    */

    const error =
        (1 - enemy.accuracy) *
        0.22;

    const angle =
        enemy.angle +
        rand(-error, error);

    bullets.push({

        owner: enemy.id,

        x:
            enemy.x +
            Math.cos(angle) *
            26,

        y:
            enemy.y +
            Math.sin(angle) *
            26,

        vx:
            Math.cos(angle) *
            weapon.bulletSpeed,

        vy:
            Math.sin(angle) *
            weapon.bulletSpeed,

        damage:
            weapon.damage *
            rand(0.75, 1.05),

        life:
            weapon.range /
            weapon.bulletSpeed,

        radius: 3,

        color: "#ff5d62"
    });

    createMuzzleParticles(
        enemy.x +
        Math.cos(angle) *
        25,

        enemy.y +
        Math.sin(angle) *
        25,

        angle
    );
}


/* =========================================================
   ENEMY MOVEMENT
========================================================= */

function moveEnemy(
    enemy,
    dx,
    dy
) {

    const newX =
        clamp(
            enemy.x + dx,
            enemy.radius,
            CFG.world.width -
            enemy.radius
        );

    const newY =
        clamp(
            enemy.y + dy,
            enemy.radius,
            CFG.world.height -
            enemy.radius
        );

    if (
        !isPositionBlocked(
            newX,
            enemy.y,
            enemy.radius
        )
    ) {
        enemy.x = newX;
    }

    if (
        !isPositionBlocked(
            enemy.x,
            newY,
            enemy.radius
        )
    ) {
        enemy.y = newY;
    }

    /*
       Avoid player overlap
    */

    if (player) {

        const d =
            distance(
                enemy.x,
                enemy.y,
                player.x,
                player.y
            );

        const minD =
            enemy.radius +
            player.radius +
            3;

        if (d < minD) {

            const n =
                normalize(
                    enemy.x - player.x,
                    enemy.y - player.y
                );

            enemy.x +=
                n.x *
                (minD - d);

            enemy.y +=
                n.y *
                (minD - d);
        }
    }
}


/* =========================================================
   BULLETS
========================================================= */

function updateBullets(dt) {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];

        bullet.life -= dt;

        if (bullet.life <= 0) {

            bullets.splice(i, 1);

            continue;
        }

        const oldX =
            bullet.x;

        const oldY =
            bullet.y;

        bullet.x +=
            bullet.vx * dt;

        bullet.y +=
            bullet.vy * dt;


        /*
           World bounds
        */

        if (
            bullet.x < 0 ||
            bullet.y < 0 ||
            bullet.x >
                CFG.world.width ||
            bullet.y >
                CFG.world.height
        ) {

            bullets.splice(i, 1);

            continue;
        }


        /*
           Obstacle collision
        */

        if (
            bulletHitsObstacle(
                bullet,
                oldX,
                oldY
            )
        ) {

            createImpactParticles(
                bullet.x,
                bullet.y
            );

            bullets.splice(i, 1);

            continue;
        }


        /*
           Player bullet
        */

        if (
            bullet.owner === "player"
        ) {

            let hit = false;

            for (
                let e = enemies.length - 1;
                e >= 0;
                e--
            ) {

                const enemy =
                    enemies[e];

                if (!enemy) continue;

                if (
                    distance(
                        bullet.x,
                        bullet.y,
                        enemy.x,
                        enemy.y
                    ) <=
                    bullet.radius +
                    enemy.radius
                ) {

                    damageEnemy(
                        enemy,
                        bullet.damage
                    );

                    createImpactParticles(
                        bullet.x,
                        bullet.y
                    );

                    bullets.splice(i, 1);

                    hit = true;

                    break;
                }
            }

            if (hit) {
                continue;
            }

        } else {

            /*
               Enemy bullet hits player
            */

            if (
                player &&
                distance(
                    bullet.x,
                    bullet.y,
                    player.x,
                    player.y
                ) <=
                bullet.radius +
                player.radius
            ) {

                damagePlayer(
                    bullet.damage,
                    bullet.owner,
                    false
                );

                createImpactParticles(
                    bullet.x,
                    bullet.y
                );

                bullets.splice(i, 1);

                continue;
            }
        }
    }
}


/* =========================================================
   DAMAGE
========================================================= */

function damageEnemy(
    enemy,
    damage
) {

    if (!enemy) return;

    stats.hits++;

    let remaining =
        damage;

    /*
       Armor absorbs part
    */

    if (enemy.armor > 0) {

        const absorbed =
            Math.min(
                enemy.armor,
                remaining * 0.55
            );

        enemy.armor -=
            absorbed;

        remaining -=
            absorbed;
    }

    enemy.health -=
        remaining;

    stats.damage +=
        damage;

    enemy.hitFlash =
        0.12;

    addDamageNumber(
        enemy.x,
        enemy.y - 25,
        Math.round(damage)
    );

    addShake(
        settings.screenShake
            ? 1.2
            : 0
    );

    if (
        enemy.health <= 0
    ) {

        killEnemy(
            enemy,
            player,
            "PLAYER"
        );
    }
}

function damagePlayer(
    damage,
    attacker,
    zoneDamage = false
) {

    if (!player) return;

    if (
        player.invulnerable > 0
    ) {
        return;
    }

    let remaining =
        damage;

    /*
       Armor
    */

    if (
        player.armor > 0 &&
        !zoneDamage
    ) {

        const absorbed =
            Math.min(
                player.armor,
                remaining * 0.6
            );

        player.armor -=
            absorbed;

        remaining -=
            absorbed;
    }

    player.health -=
        remaining;

    player.damageTaken +=
        damage;

    damageFlash =
        Math.min(
            1,
            damageFlash + 0.5
        );

    addShake(
        settings.screenShake
            ? 5
            : 0
    );

    playHitSound();

    vibrate(
        settings.vibration
            ? 12
            : 0
    );

    if (!zoneDamage) {

        showToast(
            `-${Math.round(damage)} HP`
        );
    }

    if (
        player.health <= 0
    ) {

        player.health = 0;
    }
}


/* =========================================================
   KILL
========================================================= */

function killEnemy(
    enemy,
    killer,
    cause
) {

    const index =
        enemies.indexOf(enemy);

    if (index === -1) {
        return;
    }

    if (
        killer === player
    ) {

        stats.kills++;

        player.kills++;

        showKillFeed(
            `YOU eliminated ${enemy.name}`
        );

        playKillSound();

        profile.coins += 25;

        saveProfile();

    } else if (
        cause === "ZONE"
    ) {

        showKillFeed(
            `${enemy.name} was lost to the zone`
        );
    } else {

        showKillFeed(
            `${enemy.name} was eliminated`
        );
    }

    spawnEnemyLoot(enemy);

    createDeathParticles(
        enemy.x,
        enemy.y
    );

    enemies.splice(
        index,
        1
    );
}


/* =========================================================
   ENEMY LOOT
========================================================= */

function spawnEnemyLoot(enemy) {

    const amount =
        randInt(1, 2);

    for (let i = 0; i < amount; i++) {

        const types = [
            "ammo",
            "medkit",
            "armor"
        ];

        const type =
            randomChoice(types);

        lootItems.push({

            id:
                `drop_${Date.now()}_${i}`,

            type,

            x:
                enemy.x +
                rand(-25, 25),

            y:
                enemy.y +
                rand(-25, 25),

            radius: 12,

            amount:
                type === "ammo"
                    ? randInt(25, 60)
                    : 1,

            bob:
                rand(0, TAU)
        });
    }
}


/* =========================================================
   COLLISION
========================================================= */

function isPositionBlocked(
    x,
    y,
    radius
) {

    /*
       Buildings
    */

    for (const building of buildings) {

        const closestX =
            clamp(
                x,
                building.x,
                building.x +
                building.width
            );

        const closestY =
            clamp(
                y,
                building.y,
                building.y +
                building.height
            );

        const d =
            distance(
                x,
                y,
                closestX,
                closestY
            );

        if (d < radius) {
            return true;
        }
    }


    /*
       Rocks
    */

    for (const rock of rocks) {

        if (
            distance(
                x,
                y,
                rock.x,
                rock.y
            ) <
            radius +
            rock.radius * 0.75
        ) {
            return true;
        }
    }

    /*
       Trees
    */

    for (const tree of trees) {

        if (
            distance(
                x,
                y,
                tree.x,
                tree.y
            ) <
            radius +
            tree.radius * 0.55
        ) {
            return true;
        }
    }

    return false;
}

function bulletHitsObstacle(
    bullet,
    oldX,
    oldY
) {

    for (const building of buildings) {

        if (
            segmentIntersectsRect(
                oldX,
                oldY,
                bullet.x,
                bullet.y,
                building
            )
        ) {
            return true;
        }
    }

    for (const rock of rocks) {

        if (
            segmentCircleCollision(
                oldX,
                oldY,
                bullet.x,
                bullet.y,
                rock.x,
                rock.y,
                rock.radius
            )
        ) {
            return true;
        }
    }

    /*
       Trees are soft cover,
       bullets can pass through.
    */

    return false;
}

function segmentIntersectsRect(
    x1,
    y1,
    x2,
    y2,
    rect
) {

    const steps =
        Math.max(
            2,
            Math.ceil(
                distance(
                    x1,
                    y1,
                    x2,
                    y2
                ) / 12
            )
        );

    for (let i = 0; i <= steps; i++) {

        const t =
            i / steps;

        const x =
            lerp(x1, x2, t);

        const y =
            lerp(y1, y2, t);

        if (
            x >= rect.x &&
            x <= rect.x + rect.width &&
            y >= rect.y &&
            y <= rect.y + rect.height
        ) {
            return true;
        }
    }

    return false;
}

function segmentCircleCollision(
    x1,
    y1,
    x2,
    y2,
    cx,
    cy,
    radius
) {

    const dx =
        x2 - x1;

    const dy =
        y2 - y1;

    const lenSq =
        dx * dx +
        dy * dy;

    if (lenSq === 0) {

        return distance(
            x1,
            y1,
            cx,
            cy
        ) <= radius;
    }

    const t =
        clamp(
            (
                (cx - x1) * dx +
                (cy - y1) * dy
            ) /
            lenSq,
            0,
            1
        );

    const px =
        x1 + dx * t;

    const py =
        y1 + dy * t;

    return distance(
        px,
        py,
        cx,
        cy
    ) <= radius;
}


/* =========================================================
   LINE OF SIGHT
========================================================= */

function hasLineOfSight(
    x1,
    y1,
    x2,
    y2
) {

    for (const building of buildings) {

        if (
            segmentIntersectsRect(
                x1,
                y1,
                x2,
                y2,
                building
            )
        ) {
            return false;
        }
    }

    return true;
}


/* =========================================================
   AVOIDANCE
========================================================= */

function getAvoidanceVector(
    x,
    y,
    radius
) {

    let ax = 0;
    let ay = 0;

    for (const building of buildings) {

        const cx =
            clamp(
                x,
                building.x,
                building.x +
                building.width
            );

        const cy =
            clamp(
                y,
                building.y,
                building.y +
                building.height
            );

        const dx =
            x - cx;

        const dy =
            y - cy;

        const d =
            Math.hypot(dx, dy);

        if (
            d > 0 &&
            d < 100
        ) {

            const strength =
                (100 - d) /
                100;

            ax +=
                dx / d *
                strength;

            ay +=
                dy / d *
                strength;
        }
    }

    return normalize(
        ax,
        ay
    );
}


/* =========================================================
   LOOT UPDATE / PICKUP
========================================================= */

function updateLoot(dt) {

    for (const item of lootItems) {

        item.bob += dt * 2;
    }
}

function autoPickupLoot() {

    if (!player) return;

    for (
        let i = lootItems.length - 1;
        i >= 0;
        i--
    ) {

        const item =
            lootItems[i];

        const d =
            distance(
                player.x,
                player.y,
                item.x,
                item.y
            );

        if (d > 42) {
            continue;
        }

        let picked = false;

        if (
            item.type === "ammo"
        ) {

            const weapon =
                WEAPONS[player.weapon];

            if (
                player.reserveAmmo <
                weapon.reserve * 2
            ) {

                player.reserveAmmo +=
                    item.amount;

                player.reserveAmmo =
                    Math.min(
                        player.reserveAmmo,
                        weapon.reserve * 2
                    );

                picked = true;

                showToast(
                    `+${item.amount} AMMO`
                );
            }

        } else if (
            item.type === "medkit"
        ) {

            if (
                player.healCharges < 4
            ) {

                player.healCharges++;

                picked = true;

                showToast(
                    "+1 MEDKIT"
                );
            }

        } else if (
            item.type === "armor"
        ) {

            if (
                player.armor < 100
            ) {

                player.armor =
                    Math.min(
                        100,
                        player.armor + 25
                    );

                picked = true;

                showToast(
                    "+25 ARMOR"
                );
            }
        }

        if (picked) {

            playPickupSound();

            lootItems.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   CAMERA
========================================================= */

function updateCamera(dt) {

    if (!player) return;

    const halfW =
        viewport.width / 2;

    const halfH =
        viewport.height / 2;

    const targetX =
        player.x -
        halfW;

    const targetY =
        player.y -
        halfH;

    const maxX =
        Math.max(
            0,
            CFG.world.width -
            viewport.width
        );

    const maxY =
        Math.max(
            0,
            CFG.world.height -
            viewport.height
        );

    camera.x =
        lerp(
            camera.x,
            clamp(
                targetX,
                0,
                maxX
            ),
            clamp(
                dt * 8,
                0,
                1
            )
        );

    camera.y =
        lerp(
            camera.y,
            clamp(
                targetY,
                0,
                maxY
            ),
            clamp(
                dt * 8,
                0,
                1
            )
        );
}

function screenToWorld(
    sx,
    sy
) {

    return {
        x:
            sx +
            camera.x,

        y:
            sy +
            camera.y
    };
}

function worldToScreen(
    x,
    y
) {

    return {
        x:
            x -
            camera.x,

        y:
            y -
            camera.y
    };
}


/* =========================================================
   PARTICLES
========================================================= */

function createParticle(
    x,
    y,
    options = {}
) {

    particles.push({

        x,
        y,

        vx:
            options.vx ??
            rand(-80, 80),

        vy:
            options.vy ??
            rand(-80, 80),

        life:
            options.life ??
            rand(0.25, 0.6),

        maxLife:
            options.life ??
            rand(0.25, 0.6),

        size:
            options.size ??
            rand(2, 5),

        color:
            options.color ??
            "#ffffff",

        gravity:
            options.gravity ??
            0,

        drag:
            options.drag ??
            0.96
    });
}

function createMuzzleParticles(
    x,
    y,
    angle
) {

    for (let i = 0; i < 6; i++) {

        const a =
            angle +
            rand(-0.35, 0.35);

        createParticle(
            x,
            y,
            {
                vx:
                    Math.cos(a) *
                    rand(80, 220),

                vy:
                    Math.sin(a) *
                    rand(80, 220),

                life:
                    rand(0.06, 0.18),

                size:
                    rand(2, 5),

                color:
                    randomChoice([
                        "#fff5a3",
                        "#ffd15c",
                        "#ffffff"
                    ])
            }
        );
    }
}

function createImpactParticles(
    x,
    y
) {

    for (let i = 0; i < 7; i++) {

        createParticle(
            x,
            y,
            {
                vx:
                    rand(-120, 120),

                vy:
                    rand(-120, 120),

                life:
                    rand(0.15, 0.35),

                size:
                    rand(1.5, 4),

                color:
                    randomChoice([
                        "#d9d9d9",
                        "#a6a6a6",
                        "#f1d28a"
                    ])
            }
        );
    }
}

function createDeathParticles(
    x,
    y
) {

    for (let i = 0; i < 25; i++) {

        const angle =
            rand(0, TAU);

        const speed =
            rand(50, 180);

        createParticle(
            x,
            y,
            {
                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                life:
                    rand(0.3, 0.8),

                size:
                    rand(2, 6),

                gravity:
                    80,

                color:
                    randomChoice([
                        "#ff5d5d",
                        "#ff8a4c",
                        "#d7d7d7"
                    ])
            }
        );
    }
}

function updateParticles(dt) {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];

        p.life -= dt;

        if (p.life <= 0) {

            particles.splice(i, 1);

            continue;
        }

        p.x +=
            p.vx * dt;

        p.y +=
            p.vy * dt;

        p.vy +=
            p.gravity * dt;

        p.vx *=
            Math.pow(
                p.drag,
                dt * 60
            );

        p.vy *=
            Math.pow(
                p.drag,
                dt * 60
            );
    }
}


/* =========================================================
   EFFECTS
========================================================= */

function updateEffects(dt) {

    damageFlash =
        Math.max(
            0,
            damageFlash -
            dt * 1.7
        );

    muzzleFlash =
        Math.max(
            0,
            muzzleFlash -
            dt
        );

    shake.time =
        Math.max(
            0,
            shake.time - dt
        );

    if (
        UI.damageVignette
    ) {

        UI.damageVignette.style.opacity =
            String(
                clamp(
                    damageFlash,
                    0,
                    0.9
                )
            );
    }
}

function addShake(power) {

    if (!settings.screenShake) {
        return;
    }

    shake.power =
        Math.max(
            shake.power,
            power
        );

    shake.time =
        Math.max(
            shake.time,
            0.12
        );
}


/* =========================================================
   RENDER
========================================================= */

function render() {

    if (!ctx || !canvas) return;

    /*
       Clear
    */

    ctx.clearRect(
        0,
        0,
        viewport.width,
        viewport.height
    );

    if (
        gameState === "playing" ||
        gameState === "paused" ||
        gameState === "gameover"
    ) {

        renderGame();
    }
}

function renderGame() {

    ctx.save();

    /*
       Screen shake
    */

    if (
        settings.screenShake &&
        shake.time > 0
    ) {

        const strength =
            shake.power *
            (shake.time / 0.12);

        ctx.translate(
            rand(-strength, strength),
            rand(-strength, strength)
        );
    }


    /*
       Ground
    */

    renderGround();

    /*
       Zone
    */

    renderZone();

    /*
       World objects
    */

    renderBuildings();

    renderRocks();

    renderTrees();

    renderLoot();

    /*
       Bullets
    */

    renderBullets();

    /*
       Enemies
    */

    renderEnemies();

    /*
       Player
    */

    renderPlayer();

    /*
       Particles
    */

    renderParticles();

    /*
       Zone overlay
    */

    renderZoneOverlay();

    ctx.restore();


    /*
       Crosshair
    */

    renderCrosshair();


    /*
       Minimap
    */

    renderMiniMap();
}


/* =========================================================
   GROUND
========================================================= */

function renderGround() {

    ctx.fillStyle =
        "#17251d";

    ctx.fillRect(
        0,
        0,
        viewport.width,
        viewport.height
    );

    const gridSize = 80;

    const startX =
        Math.floor(
            camera.x /
            gridSize
        ) *
        gridSize -
        camera.x;

    const startY =
        Math.floor(
            camera.y /
            gridSize
        ) *
        gridSize -
        camera.y;

    ctx.strokeStyle =
        "rgba(255,255,255,0.035)";

    ctx.lineWidth = 1;

    for (
        let x = startX;
        x < viewport.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            viewport.height
        );

        ctx.stroke();
    }

    for (
        let y = startY;
        y < viewport.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            viewport.width,
            y
        );

        ctx.stroke();
    }


    /*
       Roads
    */

    const roadY =
        CFG.world.height * 0.5;

    const roadScreenY =
        roadY - camera.y;

    ctx.fillStyle =
        "#262b2c";

    ctx.fillRect(
        0,
        roadScreenY - 55,
        viewport.width,
        110
    );

    ctx.strokeStyle =
        "rgba(255,210,90,0.35)";

    ctx.setLineDash([
        30,
        20
    ]);

    ctx.beginPath();

    ctx.moveTo(
        0,
        roadScreenY
    );

    ctx.lineTo(
        viewport.width,
        roadScreenY
    );

    ctx.stroke();

    ctx.setLineDash([]);


    /*
       Vertical road
    */

    const roadX =
        CFG.world.width * 0.5;

    const roadScreenX =
        roadX - camera.x;

    ctx.fillStyle =
        "#262b2c";

    ctx.fillRect(
        roadScreenX - 55,
        0,
        110,
        viewport.height
    );

    ctx.strokeStyle =
        "rgba(255,210,90,0.35)";

    ctx.setLineDash([
        30,
        20
    ]);

    ctx.beginPath();

    ctx.moveTo(
        roadScreenX,
        0
    );

    ctx.lineTo(
        roadScreenX,
        viewport.height
    );

    ctx.stroke();

    ctx.setLineDash([]);
}


/* =========================================================
   ZONE
========================================================= */

function renderZone() {

    const p =
        worldToScreen(
            zone.x,
            zone.y
        );

    /*
       Dark outside
    */

    ctx.save();

    ctx.fillStyle =
        "rgba(80,20,100,0.20)";

    ctx.fillRect(
        0,
        0,
        viewport.width,
        viewport.height
    );

    /*
       Clear circle
    */

    ctx.globalCompositeOperation =
        "destination-out";

    ctx.beginPath();

    ctx.arc(
        p.x,
        p.y,
        zone.radius,
        0,
        TAU
    );

    ctx.fill();

    ctx.globalCompositeOperation =
        "source-over";

    /*
       Zone ring
    */

    ctx.strokeStyle =
        "rgba(129,232,255,0.95)";

    ctx.lineWidth = 4;

    ctx.shadowBlur = 14;
    ctx.shadowColor =
        "#69e6ff";

    ctx.beginPath();

    ctx.arc(
        p.x,
        p.y,
        zone.radius,
        0,
        TAU
    );

    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.restore();
}


/* =========================================================
   ZONE OVERLAY
========================================================= */

function renderZoneOverlay() {

    if (!player) return;

    const d =
        distance(
            player.x,
            player.y,
            zone.x,
            zone.y
        );

    if (
        d <= zone.radius
    ) {
        return;
    }

    const intensity =
        clamp(
            (
                d -
                zone.radius
            ) / 300,
            0.1,
            0.5
        );

    ctx.fillStyle =
        `rgba(180,35,120,${intensity})`;

    ctx.fillRect(
        0,
        0,
        viewport.width,
        viewport.height
    );
}


/* =========================================================
   BUILDINGS
========================================================= */

function renderBuildings() {

    for (const building of buildings) {

        const s =
            worldToScreen(
                building.x,
                building.y
            );

        /*
           Shadow
        */

        ctx.fillStyle =
            "rgba(0,0,0,0.35)";

        ctx.fillRect(
            s.x + 8,
            s.y + 10,
            building.width,
            building.height
        );

        /*
           Building
        */

        ctx.fillStyle =
            building.color;

        ctx.fillRect(
            s.x,
            s.y,
            building.width,
            building.height
        );

        /*
           Roof
        */

        ctx.strokeStyle =
            "rgba(255,255,255,0.12)";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            s.x,
            s.y,
            building.width,
            building.height
        );

        /*
           Windows
        */

        ctx.fillStyle =
            "rgba(255,218,105,0.55)";

        const cols =
            Math.floor(
                building.width / 60
            );

        const rows =
            Math.floor(
                building.height / 55
            );

        for (
            let cx = 0;
            cx < cols;
            cx++
        ) {

            for (
                let cy = 0;
                cy < rows;
                cy++
            ) {

                if (
                    Math.random() >
                    0.3
                ) continue;

                ctx.fillRect(
                    s.x +
                    18 +
                    cx * 60,

                    s.y +
                    15 +
                    cy * 55,

                    18,
                    12
                );
            }
        }
    }
}


/* =========================================================
   ROCKS
========================================================= */

function renderRocks() {

    for (const rock of rocks) {

        const s =
            worldToScreen(
                rock.x,
                rock.y
            );

        if (
            s.x < -60 ||
            s.x >
                viewport.width + 60 ||
            s.y < -60 ||
            s.y >
                viewport.height + 60
        ) {
            continue;
        }

        ctx.fillStyle =
            "rgba(0,0,0,0.3)";

        ctx.beginPath();

        ctx.ellipse(
            s.x + 5,
            s.y + 7,
            rock.radius,
            rock.radius * 0.65,
            0,
            0,
            TAU
        );

        ctx.fill();

        ctx.fillStyle =
            "#62676b";

        ctx.beginPath();

        ctx.arc(
            s.x,
            s.y,
            rock.radius,
            0,
            TAU
        );

        ctx.fill();

        ctx.fillStyle =
            "rgba(255,255,255,0.15)";

        ctx.beginPath();

        ctx.arc(
            s.x - rock.radius * 0.25,
            s.y - rock.radius * 0.3,
            rock.radius * 0.3,
            0,
            TAU
        );

        ctx.fill();
    }
}


/* =========================================================
   TREES
========================================================= */

function renderTrees() {

    for (const tree of trees) {

        const s =
            worldToScreen(
                tree.x,
                tree.y
            );

        if (
            s.x < -70 ||
            s.x >
                viewport.width + 70 ||
            s.y < -70 ||
            s.y >
                viewport.height + 70
        ) {
            continue;
        }

        /*
           Shadow
        */

        ctx.fillStyle =
            "rgba(0,0,0,0.28)";

        ctx.beginPath();

        ctx.ellipse(
            s.x + 4,
            s.y + 12,
            tree.radius * 1.1,
            tree.radius * 0.55,
            0,
            0,
            TAU
        );

        ctx.fill();

        /*
           Trunk
        */

        ctx.fillStyle =
            "#65482e";

        ctx.fillRect(
            s.x - 4,
            s.y,
            8,
            18
        );

        /*
           Crown
        */

        ctx.fillStyle =
            "#1e633d";

        ctx.beginPath();

        ctx.arc(
            s.x,
            s.y - 7,
            tree.radius,
            0,
            TAU
        );

        ctx.fill();

        ctx.fillStyle =
            "#2d8a50";

        ctx.beginPath();

        ctx.arc(
            s.x - 5,
            s.y - 13,
            tree.radius * 0.55,
            0,
            TAU
        );

        ctx.fill();
    }
}


/* =========================================================
   LOOT RENDER
========================================================= */

function renderLoot() {

    for (const item of lootItems) {

        const s =
            worldToScreen(
                item.x,
                item.y
            );

        if (
            s.x < -30 ||
            s.x >
                viewport.width + 30 ||
            s.y < -30 ||
            s.y >
                viewport.height + 30
        ) {
            continue;
        }

        const bob =
            Math.sin(item.bob) *
            3;

        let color =
            "#ffd34d";

        let symbol =
            "A";

        if (
            item.type === "medkit"
        ) {

            color =
                "#63f08b";

            symbol =
                "+";

        } else if (
            item.type === "armor"
        ) {

            color =
                "#62c7ff";

            symbol =
                "◆";
        }

        ctx.shadowBlur = 15;
        ctx.shadowColor = color;

        ctx.fillStyle =
            color;

        ctx.beginPath();

        ctx.arc(
            s.x,
            s.y + bob,
            11,
            0,
            TAU
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle =
            "#111";

        ctx.font =
            "bold 12px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            symbol,
            s.x,
            s.y + bob
        );
    }
}


/* =========================================================
   BULLET RENDER
========================================================= */

function renderBullets() {

    for (const bullet of bullets) {

        const s =
            worldToScreen(
                bullet.x,
                bullet.y
            );

        const angle =
            Math.atan2(
                bullet.vy,
                bullet.vx
            );

        ctx.strokeStyle =
            bullet.color;

        ctx.lineWidth = 3;

        ctx.shadowBlur = 8;
        ctx.shadowColor =
            bullet.color;

        ctx.beginPath();

        ctx.moveTo(
            s.x -
            Math.cos(angle) * 10,

            s.y -
            Math.sin(angle) * 10
        );

        ctx.lineTo(
            s.x,
            s.y
        );

        ctx.stroke();

        ctx.shadowBlur = 0;
    }
}


/* =========================================================
   PLAYER RENDER
========================================================= */

function renderPlayer() {

    if (!player) return;

    const s =
        worldToScreen(
            player.x,
            player.y
        );

    /*
       Shadow
    */

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.beginPath();

    ctx.ellipse(
        s.x,
        s.y + 14,
        22,
        10,
        0,
        0,
        TAU
    );

    ctx.fill();


    /*
       Aim direction
    */

    ctx.save();

    ctx.translate(
        s.x,
        s.y
    );

    ctx.rotate(
        player.angle
    );


    /*
       Gun
    */

    ctx.fillStyle =
        "#16191c";

    ctx.fillRect(
        8,
        -5,
        30,
        9
    );

    ctx.fillStyle =
        "#454b50";

    ctx.fillRect(
        17,
        3,
        8,
        13
    );


    /*
       Body
    */

    ctx.fillStyle =
        player.crouching
            ? "#2362b0"
            : "#2878d2";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        player.crouching
            ? 15
            : 18,
        0,
        TAU
    );

    ctx.fill();


    /*
       Armor
    */

    ctx.strokeStyle =
        "#6fd4ff";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        18,
        0,
        TAU
    );

    ctx.stroke();


    /*
       Head
    */

    ctx.fillStyle =
        "#e8b18d";

    ctx.beginPath();

    ctx.arc(
        -2,
        -8,
        8,
        0,
        TAU
    );

    ctx.fill();


    /*
       Helmet
    */

    ctx.fillStyle =
        "#222b35";

    ctx.beginPath();

    ctx.arc(
        -2,
        -10,
        9,
        Math.PI,
        TAU
    );

    ctx.fill();


    /*
       Muzzle
    */

    if (
        muzzleFlash > 0
    ) {

        ctx.fillStyle =
            "#fff1a3";

        ctx.beginPath();

        ctx.moveTo(
            38,
            0
        );

        ctx.lineTo(
            52,
            -7
        );

        ctx.lineTo(
            48,
            0
        );

        ctx.lineTo(
            52,
            7
        );

        ctx.closePath();

        ctx.fill();
    }

    ctx.restore();


    /*
       Health bar
    */

    drawHealthBar(
        s.x,
        s.y - 32,
        42,
        5,
        player.health /
        player.maxHealth
    );
}


/* =========================================================
   ENEMY RENDER
========================================================= */

function renderEnemies() {

    for (const enemy of enemies) {

        const s =
            worldToScreen(
                enemy.x,
                enemy.y
            );

        if (
            s.x < -80 ||
            s.x >
                viewport.width + 80 ||
            s.y < -80 ||
            s.y >
                viewport.height + 80
        ) {
            continue;
        }

        /*
           Shadow
        */

        ctx.fillStyle =
            "rgba(0,0,0,0.35)";

        ctx.beginPath();

        ctx.ellipse(
            s.x,
            s.y + 13,
            21,
            9,
            0,
            0,
            TAU
        );

        ctx.fill();


        ctx.save();

        ctx.translate(
            s.x,
            s.y
        );

        ctx.rotate(
            enemy.angle
        );


        /*
           Gun
        */

        ctx.fillStyle =
            "#17191c";

        ctx.fillRect(
            8,
            -4,
            28,
            8
        );


        /*
           Body
        */

        ctx.fillStyle =
            enemy.hitFlash > 0
                ? "#ffffff"
                : "#c7464e";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            17,
            0,
            TAU
        );

        ctx.fill();


        /*
           Armor
        */

        ctx.strokeStyle =
            "#ff8585";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            17,
            0,
            TAU
        );

        ctx.stroke();


        /*
           Head
        */

        ctx.fillStyle =
            "#dba681";

        ctx.beginPath();

        ctx.arc(
            -2,
            -8,
            8,
            0,
            TAU
        );

        ctx.fill();


        /*
           Helmet
        */

        ctx.fillStyle =
            "#38252b";

        ctx.beginPath();

        ctx.arc(
            -2,
            -10,
            9,
            Math.PI,
            TAU
        );

        ctx.fill();

        ctx.restore();


        /*
           Enemy health
        */

        drawHealthBar(
            s.x,
            s.y - 31,
            40,
            4,
            enemy.health /
            enemy.maxHealth
        );


        /*
           Name
        */

        ctx.fillStyle =
            "rgba(255,255,255,0.85)";

        ctx.font =
            "10px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "bottom";

        ctx.fillText(
            enemy.name,
            s.x,
            s.y - 36
        );
    }
}


/* =========================================================
   HEALTH BAR
========================================================= */

function drawHealthBar(
    x,
    y,
    width,
    height,
    ratio
) {

    ratio =
        clamp(
            ratio,
            0,
            1
        );

    ctx.fillStyle =
        "rgba(0,0,0,0.65)";

    ctx.fillRect(
        x - width / 2,
        y,
        width,
        height
    );

    ctx.fillStyle =
        ratio > 0.5
            ? "#58ef7b"
            : ratio > 0.25
                ? "#ffd05a"
                : "#ff5f62";

    ctx.fillRect(
        x - width / 2,
        y,
        width * ratio,
        height
    );
}


/* =========================================================
   PARTICLE RENDER
========================================================= */

function renderParticles() {

    for (const p of particles) {

        const s =
            worldToScreen(
                p.x,
                p.y
            );

        const alpha =
            clamp(
                p.life /
                p.maxLife,
                0,
                1
            );

        ctx.globalAlpha =
            alpha;

        ctx.fillStyle =
            p.color;

        ctx.beginPath();

        ctx.arc(
            s.x,
            s.y,
            p.size,
            0,
            TAU
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}


/* =========================================================
   CROSSHAIR
========================================================= */

function renderCrosshair() {

    const x =
        input.aimActive
            ? input.aimX
            : input.mouseX;

    const y =
        input.aimActive
            ? input.aimY
            : input.mouseY;

    /*
       On mobile keep crosshair near
       the aim position.
    */

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.strokeStyle =
        "rgba(255,255,255,0.9)";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        8,
        0,
        TAU
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        -15,
        0
    );

    ctx.lineTo(
        -6,
        0
    );

    ctx.moveTo(
        15,
        0
    );

    ctx.lineTo(
        6,
        0
    );

    ctx.moveTo(
        0,
        -15
    );

    ctx.lineTo(
        0,
        -6
    );

    ctx.moveTo(
        0,
        15
    );

    ctx.lineTo(
        0,
        6
    );

    ctx.stroke();

    ctx.restore();
}


/* =========================================================
   MINIMAP
========================================================= */

function renderMiniMap() {

    if (!UI.miniMap) return;

    const mapCtx =
        UI.miniMap.getContext("2d");

    if (!mapCtx) return;

    const w =
        UI.miniMap.width;

    const h =
        UI.miniMap.height;

    mapCtx.clearRect(
        0,
        0,
        w,
        h
    );

    mapCtx.fillStyle =
        "#142019";

    mapCtx.fillRect(
        0,
        0,
        w,
        h
    );

    const scaleX =
        w /
        CFG.world.width;

    const scaleY =
        h /
        CFG.world.height;


    /*
       Buildings
    */

    mapCtx.fillStyle =
        "rgba(100,100,100,0.7)";

    for (const building of buildings) {

        mapCtx.fillRect(
            building.x * scaleX,
            building.y * scaleY,
            building.width * scaleX,
            building.height * scaleY
        );
    }


    /*
       Zone
    */

    mapCtx.strokeStyle =
        "#72e7ff";

    mapCtx.lineWidth = 2;

    mapCtx.beginPath();

    mapCtx.arc(
        zone.x * scaleX,
        zone.y * scaleY,
        zone.radius * scaleX,
        0,
        TAU
    );

    mapCtx.stroke();


    /*
       Enemies
    */

    mapCtx.fillStyle =
        "#ff575f";

    for (const enemy of enemies) {

        mapCtx.beginPath();

        mapCtx.arc(
            enemy.x * scaleX,
            enemy.y * scaleY,
            2.5,
            0,
            TAU
        );

        mapCtx.fill();
    }


    /*
       Player
    */

    if (player) {

        mapCtx.fillStyle =
            "#5feaff";

        mapCtx.beginPath();

        mapCtx.arc(
            player.x * scaleX,
            player.y * scaleY,
            4,
            0,
            TAU
        );

        mapCtx.fill();


        /*
           Direction
        */

        mapCtx.strokeStyle =
            "#ffffff";

        mapCtx.lineWidth = 1;

        mapCtx.beginPath();

        mapCtx.moveTo(
            player.x * scaleX,
            player.y * scaleY
        );

        mapCtx.lineTo(
            (
                player.x +
                Math.cos(player.angle) *
                80
            ) * scaleX,

            (
                player.y +
                Math.sin(player.angle) *
                80
            ) * scaleY
        );

        mapCtx.stroke();
    }
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    if (!player) return;

    if (UI.healthBar) {

        const ratio =
            clamp(
                player.health /
                player.maxHealth,
                0,
                1
            );

        UI.healthBar.style.width =
            `${ratio * 100}%`;
    }

    if (UI.healthText) {

        UI.healthText.textContent =
            `${Math.ceil(player.health)}`;
    }

    if (UI.aliveCount) {

        UI.aliveCount.textContent =
            enemies.length + 1;
    }

    if (UI.zoneTimer) {

        UI.zoneTimer.textContent =
            formatTime(
                zone.timer
            );
    }

    if (UI.weaponName) {

        UI.weaponName.textContent =
            WEAPONS[player.weapon].name;
    }

    if (UI.weaponAmmo) {

        UI.weaponAmmo.textContent =
            `${player.ammo} / ${player.reserveAmmo}`;
    }

    /*
       Button states
    */

    if (UI.healButton) {

        UI.healButton.classList.toggle(
            "disabled",
            player.healCharges <= 0 ||
            player.health >=
            player.maxHealth
        );
    }

    if (UI.crouchButton) {

        UI.crouchButton.classList.toggle(
            "active",
            player.crouching
        );
    }

    /*
       Reload indicator
    */

    if (
        UI.reloadIndicator &&
        player.reloadTimer <= 0
    ) {

        UI.reloadIndicator.classList.remove(
            "active"
        );
    }
}


/* =========================================================
   KILL FEED
========================================================= */

function showKillFeed(message) {

    killFeedMessages.unshift({

        text: message,

        time: 4
    });

    killFeedMessages =
        killFeedMessages.slice(
            0,
            4
        );

    renderKillFeed();
}

function updateKillFeed(dt) {

    for (
        let i = killFeedMessages.length - 1;
        i >= 0;
        i--
    ) {

        killFeedMessages[i].time -= dt;

        if (
            killFeedMessages[i].time <= 0
        ) {

            killFeedMessages.splice(
                i,
                1
            );
        }
    }

    renderKillFeed();
}

function renderKillFeed() {

    if (!UI.killFeed) return;

    UI.killFeed.innerHTML =
        killFeedMessages
            .map(
                item =>
                    `<div class="kill-feed-item">
                        ${escapeHTML(item.text)}
                    </div>`
            )
            .join("");
}

function escapeHTML(text) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   DAMAGE NUMBER
========================================================= */

function addDamageNumber(
    x,
    y,
    value
) {

    /*
       Lightweight floating number.
       Stored as particle-like object.
    */

    for (let i = 0; i < 1; i++) {

        particles.push({

            x,
            y,

            vx: rand(-10, 10),
            vy: -45,

            life: 0.65,
            maxLife: 0.65,

            size: 0,

            color: "#ffffff",

            text:
                String(value),

            gravity: 0,

            drag: 1
        });
    }
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    if (!UI.toast) return;

    UI.toast.textContent =
        message;

    UI.toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimeout
    );

    toastTimeout =
        setTimeout(() => {

            UI.toast.classList.remove(
                "show"
            );

        }, 1600);
}


/* =========================================================
   ANGLE
========================================================= */

function lerpAngle(
    a,
    b,
    t
) {

    let diff =
        b - a;

    while (
        diff > Math.PI
    ) {
        diff -= TAU;
    }

    while (
        diff < -Math.PI
    ) {
        diff += TAU;
    }

    return a +
        diff *
        clamp(t, 0, 1);
}


/* =========================================================
   AUDIO ENGINE
========================================================= */

function initAudio() {

    if (
        audioContext ||
        !settings.sound
    ) {
        return;
    }

    try {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    } catch (error) {

        audioContext = null;
    }
}

function ensureAudio() {

    if (!settings.sound) {
        return null;
    }

    if (!audioContext) {
        initAudio();
    }

    if (
        audioContext &&
        audioContext.state === "suspended"
    ) {
        audioContext.resume();
    }

    return audioContext;
}

function beep(
    frequency,
    duration,
    type = "sine",
    volume = 0.05
) {

    const ac =
        ensureAudio();

    if (!ac) return;

    const oscillator =
        ac.createOscillator();

    const gain =
        ac.createGain();

    oscillator.type =
        type;

    oscillator.frequency.value =
        frequency;

    gain.gain.setValueAtTime(
        0.0001,
        ac.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        volume,
        ac.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ac.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(ac.destination);

    oscillator.start();

    oscillator.stop(
        ac.currentTime +
        duration +
        0.02
    );
}

function playShootSound(
    weapon
) {

    if (!settings.sound) return;

    if (weapon === "shotgun") {

        beep(
            75,
            0.08,
            "sawtooth",
            0.12
        );

    } else if (
        weapon === "smg"
    ) {

        beep(
            150,
            0.045,
            "square",
            0.05
        );

    } else {

        beep(
            110,
            0.055,
            "square",
            0.065
        );
    }
}

function playReloadSound() {

    if (!settings.sound) return;

    beep(
        400,
        0.07,
        "square",
        0.035
    );

    setTimeout(() => {

        beep(
            650,
            0.08,
            "square",
            0.04
        );

    }, 180);
}

function playHitSound() {

    if (!settings.sound) return;

    beep(
        85,
        0.06,
        "sawtooth",
        0.04
    );
}

function playKillSound() {

    if (!settings.sound) return;

    beep(
        700,
        0.08,
        "square",
        0.05
    );

    setTimeout(() => {

        beep(
            1000,
            0.12,
            "square",
            0.05
        );

    }, 80);
}

function playPickupSound() {

    if (!settings.sound) return;

    beep(
        650,
        0.07,
        "sine",
        0.035
    );

    setTimeout(() => {

        beep(
            900,
            0.08,
            "sine",
            0.035
        );

    }, 70);
}

function playHealSound() {

    if (!settings.sound) return;

    beep(
        500,
        0.1,
        "sine",
        0.04
    );

    setTimeout(() => {

        beep(
            750,
            0.15,
            "sine",
            0.04
        );

    }, 100);
}

function playVictorySound() {

    if (!settings.sound) return;

    [523, 659, 784, 1046]
        .forEach(
            (freq, index) => {

                setTimeout(() => {

                    beep(
                        freq,
                        0.22,
                        "sine",
                        0.06
                    );

                }, index * 140);
            }
        );
}

function playDefeatSound() {

    if (!settings.sound) return;

    beep(
        220,
        0.3,
        "sawtooth",
        0.05
    );

    setTimeout(() => {

        beep(
            150,
            0.4,
            "sawtooth",
            0.04
        );

    }, 180);
}


/* =========================================================
   MUSIC
========================================================= */

function startMusic() {

    if (
        !settings.music
    ) {
        return;
    }

    if (musicTimer) {
        return;
    }

    const notes = [
        196,
        247,
        294,
        247,
        220,
        294,
        330,
        294
    ];

    let index = 0;

    musicTimer =
        setInterval(() => {

            if (
                gameState !==
                "playing"
            ) {
                return;
            }

            if (
                !settings.music
            ) {
                return;
            }

            beep(
                notes[index % notes.length],
                0.18,
                "triangle",
                0.012
            );

            index++;

        }, 430);
}

function stopMusic() {

    if (musicTimer) {

        clearInterval(
            musicTimer
        );

        musicTimer = null;
    }
}


/* =========================================================
   VIBRATION
========================================================= */

function vibrate(pattern) {

    if (
        !settings.vibration
    ) {
        return;
    }

    if (
        "vibrate" in navigator
    ) {

        try {
            navigator.vibrate(
                pattern
            );
        } catch (error) {}
    }
}


/* =========================================================
   SETTINGS UI
========================================================= */

function syncSettingsUI() {

    if (
        UI.graphicsQuality
    ) {
        UI.graphicsQuality.value =
            settings.graphicsQuality;
    }

    if (
        UI.screenShakeToggle
    ) {
        UI.screenShakeToggle.checked =
            settings.screenShake;
    }

    if (
        UI.soundToggle
    ) {
        UI.soundToggle.checked =
            settings.sound;
    }

    if (
        UI.musicToggle
    ) {
        UI.musicToggle.checked =
            settings.music;
    }

    if (
        UI.sensitivitySlider
    ) {
        UI.sensitivitySlider.value =
            settings.sensitivity;
    }

    if (
        UI.vibrationToggle
    ) {
        UI.vibrationToggle.checked =
            settings.vibration;
    }
}

function resetSettings() {

    settings = {
        ...DEFAULT_SETTINGS
    };

    saveSettings();

    syncSettingsUI();

    resizeCanvas();

    showToast(
        "SETTINGS RESET"
    );
}


/* =========================================================
   ORIENTATION
========================================================= */

function updateOrientationWarning() {

    if (
        !UI.orientationWarning
    ) {
        return;
    }

    const isMobile =
        window.matchMedia(
            "(pointer: coarse)"
        ).matches;

    const portrait =
        window.innerHeight >
        window.innerWidth;

    /*
       Don't block the game.
       Just show a warning on small screens.
    */

    const show =
        isMobile &&
        portrait &&
        gameState === "playing";

    UI.orientationWarning.classList.toggle(
        "show",
        show
    );
}


/* =========================================================
   POINTER HELPERS
========================================================= */

function getPointerPosition(
    event
) {

    const rect =
        canvas.getBoundingClientRect();

    return {
        x:
            event.clientX -
            rect.left,

        y:
            event.clientY -
            rect.top
    };
}


/* =========================================================
   JOYSTICK
========================================================= */

function updateJoystick(
    clientX,
    clientY
) {

    if (
        !UI.movementJoystick ||
        !UI.joystickKnob
    ) {
        return;
    }

    const rect =
        UI.movementJoystick.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    const max =
        Math.min(
            rect.width,
            rect.height
        ) * 0.32;

    let dx =
        clientX -
        centerX;

    let dy =
        clientY -
        centerY;

    const length =
        Math.hypot(
            dx,
            dy
        );

    if (
        length > max
    ) {

        dx =
            dx / length *
            max;

        dy =
            dy / length *
            max;
    }

    input.joystickX =
        dx / max;

    input.joystickY =
        dy / max;

    UI.joystickKnob.style.transform =
        `translate(${dx}px, ${dy}px)`;
}

function resetJoystick() {

    input.joystickX = 0;
    input.joystickY = 0;

    if (
        UI.joystickKnob
    ) {

        UI.joystickKnob.style.transform =
            "translate(0, 0)";
    }
}


/* =========================================================
   EVENT LISTENERS
========================================================= */


/*
   Keyboard
*/

window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        input.keys.add(key);

        if (
            key === "r"
        ) {
            input.reload = true;
        }

        if (
            key === "h"
        ) {
            input.heal = true;
        }

        if (
            key === "c"
        ) {
            input.crouch = true;
        }

        if (
            key === "escape" ||
            key === "p"
        ) {

            if (
                gameState ===
                "playing"
            ) {

                pauseGame();

            } else if (
                gameState ===
                "paused"
            ) {

                resumeGame();
            }
        }

        if (
            key === " "
        ) {

            input.firing = true;

            event.preventDefault();
        }
    }
);

window.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();

        input.keys.delete(key);

        if (
            key === " "
        ) {
            input.firing = false;
        }
    }
);


/*
   Mouse
*/

window.addEventListener(
    "mousemove",
    event => {

        input.mouseX =
            event.clientX;

        input.mouseY =
            event.clientY;
    }
);

window.addEventListener(
    "mousedown",
    event => {

        if (
            event.button === 0 &&
            gameState === "playing"
        ) {

            input.mouseDown = true;
            input.firing = true;
        }
    }
);

window.addEventListener(
    "mouseup",
    event => {

        if (
            event.button === 0
        ) {

            input.mouseDown = false;
            input.firing = false;
        }
    }
);


/*
   Prevent context menu
*/

window.addEventListener(
    "contextmenu",
    event => {
        event.preventDefault();
    }
);


/* =========================================================
   MOBILE JOYSTICK EVENTS
========================================================= */

if (
    UI.movementJoystick
) {

    UI.movementJoystick.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            input.joystickPointer =
                event.pointerId;

            UI.movementJoystick.setPointerCapture(
                event.pointerId
            );

            updateJoystick(
                event.clientX,
                event.clientY
            );
        }
    );

    UI.movementJoystick.addEventListener(
        "pointermove",
        event => {

            if (
                input.joystickPointer !==
                event.pointerId
            ) {
                return;
            }

            event.preventDefault();

            updateJoystick(
                event.clientX,
                event.clientY
            );
        }
    );

    const reset =
        event => {

            if (
                input.joystickPointer ===
                event.pointerId
            ) {

                input.joystickPointer =
                    null;

                resetJoystick();
            }
        };

    UI.movementJoystick.addEventListener(
        "pointerup",
        reset
    );

    UI.movementJoystick.addEventListener(
        "pointercancel",
        reset
    );
}


/* =========================================================
   AIM AREA
========================================================= */

if (
    UI.aimArea
) {

    UI.aimArea.addEventListener(
        "pointerdown",
        event => {

            if (
                gameState !==
                "playing"
            ) {
                return;
            }

            event.preventDefault();

            input.aimPointer =
                event.pointerId;

            input.aimActive =
                true;

            input.aimX =
                event.clientX;

            input.aimY =
                event.clientY;

            try {
                UI.aimArea.setPointerCapture(
                    event.pointerId
                );
            } catch (error) {}
        }
    );

    UI.aimArea.addEventListener(
        "pointermove",
        event => {

            if (
                input.aimPointer !==
                event.pointerId
            ) {
                return;
            }

            event.preventDefault();

            input.aimX =
                event.clientX;

            input.aimY =
                event.clientY;
        }
    );

    const endAim =
        event => {

            if (
                input.aimPointer ===
                event.pointerId
            ) {

                input.aimPointer =
                    null;

                input.aimActive =
                    false;
            }
        };

    UI.aimArea.addEventListener(
        "pointerup",
        endAim
    );

    UI.aimArea.addEventListener(
        "pointercancel",
        endAim
    );
}


/* =========================================================
   FIRE BUTTON
========================================================= */

if (
    UI.fireButton
) {

    UI.fireButton.addEventListener(
        "pointerdown",
        event => {

            if (
                gameState !==
                "playing"
            ) {
                return;
            }

            event.preventDefault();

            input.firing = true;

            input.firePointer =
                event.pointerId;

            UI.fireButton.classList.add(
                "pressed"
            );

            try {
                UI.fireButton.setPointerCapture(
                    event.pointerId
                );
            } catch (error) {}
        }
    );

    const stopFire =
        event => {

            if (
                input.firePointer ===
                event.pointerId
            ) {

                input.firePointer =
                    null;

                input.firing =
                    false;

                UI.fireButton.classList.remove(
                    "pressed"
                );
            }
        };

    UI.fireButton.addEventListener(
        "pointerup",
        stopFire
    );

    UI.fireButton.addEventListener(
        "pointercancel",
        stopFire
    );

    UI.fireButton.addEventListener(
        "pointerleave",
        event => {

            if (
                event.pointerType ===
                "mouse"
            ) {
                input.firing = false;
            }
        }
    );
}


/* =========================================================
   ACTION BUTTONS
========================================================= */

function addButtonAction(
    element,
    action
) {

    if (!element) return;

    element.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            if (
                gameState !==
                "playing"
            ) {
                return;
            }

            action();

            element.classList.add(
                "pressed"
            );

            setTimeout(() => {

                element.classList.remove(
                    "pressed"
                );

            }, 100);
        }
    );
}

addButtonAction(
    UI.reloadButton,
    () => reloadPlayer()
);

addButtonAction(
    UI.healButton,
    () => startHeal()
);

addButtonAction(
    UI.crouchButton,
    () => {

        if (!player) return;

        player.crouching =
            !player.crouching;
    }
);


/* =========================================================
   BUTTON NAVIGATION
========================================================= */

if (UI.playButton) {

    UI.playButton.addEventListener(
        "click",
        startGame
    );
}

if (UI.loadoutButton) {

    UI.loadoutButton.addEventListener(
        "click",
        openLoadout
    );
}

if (UI.settingsButton) {

    UI.settingsButton.addEventListener(
        "click",
        openSettings
    );
}

if (UI.resumeButton) {

    UI.resumeButton.addEventListener(
        "click",
        resumeGame
    );
}

if (UI.pauseRestartButton) {

    UI.pauseRestartButton.addEventListener(
        "click",
        restartGame
    );
}

if (UI.exitMatchButton) {

    UI.exitMatchButton.addEventListener(
        "click",
        exitMatch
    );
}

if (UI.playAgainButton) {

    UI.playAgainButton.addEventListener(
        "click",
        startGame
    );
}

if (UI.resultMenuButton) {

    UI.resultMenuButton.addEventListener(
        "click",
        exitMatch
    );
}

if (UI.loadoutBackButton) {

    UI.loadoutBackButton.addEventListener(
        "click",
        openMenu
    );
}

if (UI.settingsBackButton) {

    UI.settingsBackButton.addEventListener(
        "click",
        openMenu
    );
}

if (UI.resetSettingsButton) {

    UI.resetSettingsButton.addEventListener(
        "click",
        resetSettings
    );
}


/* =========================================================
   SETTINGS EVENTS
========================================================= */

if (
    UI.graphicsQuality
) {

    UI.graphicsQuality.addEventListener(
        "change",
        () => {

            settings.graphicsQuality =
                UI.graphicsQuality.value;

            saveSettings();

            resizeCanvas();
        }
    );
}

if (
    UI.screenShakeToggle
) {

    UI.screenShakeToggle.addEventListener(
        "change",
        () => {

            settings.screenShake =
                UI.screenShakeToggle.checked;

            saveSettings();
        }
    );
}

if (
    UI.soundToggle
) {

    UI.soundToggle.addEventListener(
        "change",
        () => {

            settings.sound =
                UI.soundToggle.checked;

            if (
                settings.sound
            ) {
                initAudio();
            }

            saveSettings();
        }
    );
}

if (
    UI.musicToggle
) {

    UI.musicToggle.addEventListener(
        "change",
        () => {

            settings.music =
                UI.musicToggle.checked;

            saveSettings();

            if (
                settings.music &&
                gameState ===
                "playing"
            ) {

                startMusic();

            } else {

                stopMusic();
            }
        }
    );
}

if (
    UI.sensitivitySlider
) {

    UI.sensitivitySlider.addEventListener(
        "input",
        () => {

            settings.sensitivity =
                Number(
                    UI.sensitivitySlider.value
                );

            saveSettings();
        }
    );
}

if (
    UI.vibrationToggle
) {

    UI.vibrationToggle.addEventListener(
        "change",
        () => {

            settings.vibration =
                UI.vibrationToggle.checked;

            saveSettings();
        }
    );
}


/* =========================================================
   OPTIONAL WEAPON SWITCHING
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            gameState !==
            "playing"
        ) {
            return;
        }

        if (
            event.key === "1"
        ) {

            equipWeapon("rifle");

        } else if (
            event.key === "2"
        ) {

            equipWeapon("smg");

        } else if (
            event.key === "3"
        ) {

            equipWeapon("shotgun");
        }
    }
);

function equipWeapon(
    weaponId
) {

    if (
        !WEAPONS[weaponId] ||
        !player
    ) {
        return;
    }

    player.weapon =
        weaponId;

    const weapon =
        WEAPONS[weaponId];

    player.ammo =
        Math.min(
            player.ammo,
            weapon.magazine
        );

    showToast(
        weapon.name
    );
}


/* =========================================================
   DYNAMIC PAUSE BUTTON
========================================================= */

function createPauseButton() {

    if (
        document.getElementById(
            "dynamicPauseButton"
        )
    ) {
        return;
    }

    const button =
        document.createElement(
            "button"
        );

    button.id =
        "dynamicPauseButton";

    button.textContent =
        "Ⅱ";

    button.setAttribute(
        "aria-label",
        "Pause game"
    );

    Object.assign(
        button.style,
        {
            position: "fixed",
            top: "12px",
            right: "12px",
            zIndex: "1000",
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,.18)",
            background: "rgba(10,15,20,.78)",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "800",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            touchAction: "manipulation"
        }
    );

    button.addEventListener(
        "click",
        () => {

            if (
                gameState ===
                "playing"
            ) {
                pauseGame();
            }
        }
    );

    document.body.appendChild(
        button
    );
}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(timestamp) {

    if (!lastTime) {
        lastTime =
            timestamp;
    }

    let dt =
        (timestamp -
            lastTime) /
        1000;

    lastTime =
        timestamp;

    dt =
        Math.min(
            dt,
            0.1
        );

    update(dt);

    render();

    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   LOADING
========================================================= */

function startLoading() {

    let progress = 0;

    const interval =
        setInterval(() => {

            progress +=
                rand(4, 12);

            progress =
                Math.min(
                    100,
                    progress
                );

            if (
                UI.loadingProgress
            ) {

                UI.loadingProgress.style.width =
                    `${progress}%`;
            }

            if (
                progress >= 100
            ) {

                clearInterval(
                    interval
                );

                setTimeout(
                    () => {

                        openMenu();

                    },
                    250
                );
            }

        }, 100);
}


/* =========================================================
   TOUCH / BROWSER BEHAVIOR
========================================================= */

document.addEventListener(
    "touchmove",
    event => {

        if (
            event.target.closest(
                "#gameScreen"
            )
        ) {

            event.preventDefault();
        }

    },
    {
        passive: false
    }
);


/* =========================================================
   VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            gameState ===
            "playing"
        ) {

            pauseGame();
        }
    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

function init() {

    /*
       Apply settings
    */

    syncSettingsUI();

    updateProfileUI();

    /*
       Canvas
    */

    resizeCanvas();

    /*
       Pause button
    */

    createPauseButton();

    /*
       Initial screen
    */

    showScreen("loading");

    /*
       Start loading
    */

    startLoading();

    /*
       Game loop
    */

    requestAnimationFrame(
        gameLoop
    );

    /*
       Orientation
    */

    updateOrientationWarning();

    /*
       Initial mouse position
    */

    input.mouseX =
        viewport.width / 2;

    input.mouseY =
        viewport.height / 2;
}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

} else {

    init();
}