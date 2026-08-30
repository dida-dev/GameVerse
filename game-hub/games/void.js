/* =========================================
   GAMEVAULT — VOID SWARM
   void.js
   ========================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;


/* =========================================
   UI
   ========================================= */

const startBtn =
    document.getElementById("startBtn");

const playAgainBtn =
    document.getElementById("playAgainBtn");

const statusText =
    document.getElementById("status");

const waveText =
    document.getElementById("wave");

const scoreText =
    document.getElementById("score");

const health1 =
    document.getElementById("health1");

const health2 =
    document.getElementById("health2");

const gameOver =
    document.getElementById("gameOver");

const finalScore =
    document.getElementById("finalScore");

const finalWave =
    document.getElementById("finalWave");


/* =========================================
   SETTINGS
   ========================================= */

const PLAYER_SIZE = 22;

const PLAYER_SPEED = 4.5;

const BULLET_SPEED = 9;

const ENEMY_START_COUNT = 8;

const MAX_WAVE_ENEMIES = 45;

const ENEMY_BASE_SPEED = 0.8;

const MAX_HEALTH = 100;


/* =========================================
   GAME STATE
   ========================================= */

let players = [];

let bullets = [];

let enemies = [];

let particles = [];

let stars = [];

let powerUps = [];

let score = 0;

let wave = 1;

let enemiesToSpawn = 0;

let spawnTimer = 0;

let waveDelay = 0;

let gameRunning = false;

let waveTransition = false;

let lastTime = 0;

let animationId = null;


/* =========================================
   INPUT
   ========================================= */

const keys = {};


/* =========================================
   INITIALIZE
   ========================================= */

createStars();

draw();

statusText.textContent =
    "Ready for battle";


/* =========================================
   START GAME
   ========================================= */

function startGame() {

    cancelAnimationFrame(animationId);

    players = [

        createPlayer(
            WIDTH * 0.25,
            HEIGHT / 2,
            "#22d3ee",
            "P1"
        ),

        createPlayer(
            WIDTH * 0.75,
            HEIGHT / 2,
            "#f43f8f",
            "P2"
        )

    ];

    bullets = [];
    enemies = [];
    particles = [];
    powerUps = [];

    score = 0;

    wave = 1;

    enemiesToSpawn =
        ENEMY_START_COUNT;

    spawnTimer = 0;

    waveDelay = 0;

    waveTransition = false;

    gameRunning = true;

    gameOver.classList.add(
        "hidden"
    );

    statusText.textContent =
        "SURVIVE THE SWARM";

    startBtn.textContent =
        "Restart";

    lastTime =
        performance.now();

    updateUI();

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================
   CREATE PLAYER
   ========================================= */

function createPlayer(
    x,
    y,
    color,
    id
) {

    return {

        x,
        y,

        width:
            PLAYER_SIZE,

        height:
            PLAYER_SIZE,

        color,

        id,

        health:
            MAX_HEALTH,

        fireCooldown: 0,

        fireRate: 150,

        invulnerable: 0,

        flash: 0
    };
}


/* =========================================
   GAME LOOP
   ========================================= */

function gameLoop(time) {

    if (!gameRunning) {
        return;
    }

    const delta =
        Math.min(
            (time - lastTime) / 16.67,
            2
        );

    lastTime = time;

    update(delta);

    draw();

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================
   UPDATE
   ========================================= */

function update(delta) {

    updatePlayers(delta);

    updateBullets(delta);

    updateEnemies(delta);

    updatePowerUps(delta);

    updateParticles(delta);

    updateSpawning(delta);

    checkBulletCollisions();

    checkEnemyCollisions();

    checkPowerUpCollisions();

    checkGameOver();

    updateUI();
}


/* =========================================
   PLAYER UPDATE
   ========================================= */

function updatePlayers(delta) {

    if (players.length === 0) {
        return;
    }

    const p1 = players[0];
    const p2 = players[1];

    /*
     * PLAYER 1
     */

    movePlayer(
        p1,
        "w",
        "s",
        "a",
        "d",
        delta
    );

    if (
        isKeyPressed("f") ||
        isKeyPressed(" ")
    ) {

        shoot(p1);
    }


    /*
     * PLAYER 2
     */

    movePlayer(
        p2,
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        delta
    );

    if (
        isKeyPressed("enter")
    ) {

        shoot(p2);
    }


    /*
     * Cooldowns.
     */

    players.forEach(
        player => {

            if (
                player.fireCooldown > 0
            ) {

                player.fireCooldown -=
                    delta *
                    16.67;
            }

            if (
                player.invulnerable > 0
            ) {

                player.invulnerable -=
                    delta;
            }

            if (
                player.flash > 0
            ) {

                player.flash -=
                    delta;
            }
        }
    );
}


/* =========================================
   MOVE PLAYER
   ========================================= */

function movePlayer(
    player,
    up,
    down,
    left,
    right,
    delta
) {

    let dx = 0;
    let dy = 0;

    if (isKeyPressed(up)) {
        dy--;
    }

    if (isKeyPressed(down)) {
        dy++;
    }

    if (isKeyPressed(left)) {
        dx--;
    }

    if (isKeyPressed(right)) {
        dx++;
    }

    /*
     * Normalize diagonal movement.
     */

    if (dx !== 0 || dy !== 0) {

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        dx /= length;
        dy /= length;
    }

    player.x +=
        dx *
        PLAYER_SPEED *
        delta;

    player.y +=
        dy *
        PLAYER_SPEED *
        delta;

    /*
     * Keep players inside arena.
     */

    player.x =
        clamp(
            player.x,
            player.width / 2,
            WIDTH -
                player.width / 2
        );

    player.y =
        clamp(
            player.y,
            player.height / 2,
            HEIGHT -
                player.height / 2
        );
}


/* =========================================
   SHOOTING
   ========================================= */

function shoot(player) {

    if (
        player.fireCooldown > 0
    ) {
        return;
    }

    player.fireCooldown =
        player.fireRate;

    /*
     * Bullets move toward the
     * nearest enemy.
     */

    let target =
        findNearestEnemy(
            player
        );

    let dx = 1;
    let dy = 0;

    if (target) {

        dx =
            target.x -
            player.x;

        dy =
            target.y -
            player.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (distance > 0) {

            dx /= distance;
            dy /= distance;
        }
    }

    bullets.push({

        x: player.x,

        y: player.y,

        vx:
            dx *
            BULLET_SPEED,

        vy:
            dy *
            BULLET_SPEED,

        owner:
            player.id,

        color:
            player.color,

        radius: 4
    });

    createMuzzleFlash(
        player
    );
}


/* =========================================
   FIND NEAREST ENEMY
   ========================================= */

function findNearestEnemy(
    player
) {

    let closest = null;

    let closestDistance =
        Infinity;

    enemies.forEach(
        enemy => {

            const dx =
                enemy.x -
                player.x;

            const dy =
                enemy.y -
                player.y;

            const distance =
                dx * dx +
                dy * dy;

            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                closest =
                    enemy;
            }
        }
    );

    return closest;
}


/* =========================================
   BULLETS
   ========================================= */

function updateBullets(delta) {

    bullets.forEach(
        bullet => {

            bullet.x +=
                bullet.vx *
                delta;

            bullet.y +=
                bullet.vy *
                delta;
        }
    );

    bullets =
        bullets.filter(
            bullet =>

                bullet.x > -20 &&
                bullet.x < WIDTH + 20 &&
                bullet.y > -20 &&
                bullet.y < HEIGHT + 20
        );
}


/* =========================================
   ENEMY SPAWNING
   ========================================= */

function updateSpawning(delta) {

    if (
        waveTransition
    ) {

        waveDelay -=
            delta;

        if (
            waveDelay <= 0
        ) {

            waveTransition =
                false;

            enemiesToSpawn =
                Math.min(
                    MAX_WAVE_ENEMIES,
                    ENEMY_START_COUNT +
                    wave * 3
                );

            statusText.textContent =
                `WAVE ${wave}`;
        }

        return;
    }

    spawnTimer -=
        delta;

    if (
        enemiesToSpawn > 0 &&
        spawnTimer <= 0
    ) {

        spawnEnemy();

        enemiesToSpawn--;

        spawnTimer =
            Math.max(
                8,
                35 -
                wave * 1.5
            );
    }

    /*
     * When the wave is cleared,
     * start the next wave.
     */

    if (
        enemiesToSpawn <= 0 &&
        enemies.length === 0
    ) {

        wave++;

        score +=
            wave * 100;

        waveTransition =
            true;

        waveDelay = 70;

        statusText.textContent =
            `WAVE ${wave - 1} CLEARED!`;
    }
}


/* =========================================
   SPAWN ENEMY
   ========================================= */

function spawnEnemy() {

    const side =
        Math.floor(
            Math.random() * 4
        );

    let x;
    let y;

    if (side === 0) {

        x = Math.random() * WIDTH;
        y = -30;

    } else if (side === 1) {

        x = WIDTH + 30;
        y = Math.random() * HEIGHT;

    } else if (side === 2) {

        x = Math.random() * WIDTH;
        y = HEIGHT + 30;

    } else {

        x = -30;
        y = Math.random() * HEIGHT;
    }

    const typeRoll =
        Math.random();

    let type =
        "normal";

    if (
        wave >= 3 &&
        typeRoll < 0.18
    ) {

        type = "fast";

    } else if (
        wave >= 5 &&
        typeRoll < 0.28
    ) {

        type = "tank";
    }

    let enemy = {

        x,
        y,

        type,

        radius: 13,

        speed:
            ENEMY_BASE_SPEED +
            wave * 0.035,

        health: 1,

        color: "#8b5cf6",

        wobble:
            Math.random() *
            Math.PI * 2
    };


    if (type === "fast") {

        enemy.radius = 9;

        enemy.speed *= 1.8;

        enemy.health = 1;

        enemy.color =
            "#f43f8f";

    }


    if (type === "tank") {

        enemy.radius = 19;

        enemy.speed *= 0.55;

        enemy.health = 3;

        enemy.color =
            "#ef4444";
    }


    enemies.push(enemy);
}


/* =========================================
   ENEMY UPDATE
   ========================================= */

function updateEnemies(delta) {

    enemies.forEach(
        enemy => {

            const target =
                findNearestLivingPlayer(
                    enemy
                );

            if (!target) {
                return;
            }

            let dx =
                target.x -
                enemy.x;

            let dy =
                target.y -
                enemy.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (distance > 0) {

                dx /= distance;
                dy /= distance;
            }

            /*
             * Slight swarm wobble.
             */

            enemy.wobble +=
                0.035 *
                delta;

            const wobble =
                Math.sin(
                    enemy.wobble
                ) *
                0.25;

            enemy.x +=
                (dx + wobble) *
                enemy.speed *
                delta;

            enemy.y +=
                (dy - wobble) *
                enemy.speed *
                delta;
        }
    );
}


/* =========================================
   FIND TARGET PLAYER
   ========================================= */

function findNearestLivingPlayer(
    enemy
) {

    let target = null;

    let distance =
        Infinity;

    players.forEach(
        player => {

            if (
                player.health <= 0
            ) {
                return;
            }

            const dx =
                player.x -
                enemy.x;

            const dy =
                player.y -
                enemy.y;

            const d =
                dx * dx +
                dy * dy;

            if (d < distance) {

                distance = d;

                target = player;
            }
        }
    );

    return target;
}


/* =========================================
   BULLET COLLISIONS
   ========================================= */

function checkBulletCollisions() {

    for (
        let b = bullets.length - 1;
        b >= 0;
        b--
    ) {

        const bullet =
            bullets[b];

        for (
            let e = enemies.length - 1;
            e >= 0;
            e--
        ) {

            const enemy =
                enemies[e];

            const dx =
                bullet.x -
                enemy.x;

            const dy =
                bullet.y -
                enemy.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance <
                bullet.radius +
                enemy.radius
            ) {

                enemy.health--;

                createBurst(
                    bullet.x,
                    bullet.y,
                    bullet.color,
                    5
                );

                bullets.splice(
                    b,
                    1
                );

                if (
                    enemy.health <= 0
                ) {

                    score +=
                        enemy.type ===
                        "tank"
                            ? 75
                            : enemy.type ===
                              "fast"
                                ? 40
                                : 25;

                    createBurst(
                        enemy.x,
                        enemy.y,
                        enemy.color,
                        enemy.type ===
                        "tank"
                            ? 25
                            : 14
                    );

                    maybeDropPowerUp(
                        enemy
                    );

                    enemies.splice(
                        e,
                        1
                    );
                }

                break;
            }
        }
    }
}


/* =========================================
   ENEMY COLLISIONS
   ========================================= */

function checkEnemyCollisions() {

    enemies.forEach(
        enemy => {

            players.forEach(
                player => {

                    if (
                        player.health <= 0 ||
                        player.invulnerable > 0
                    ) {
                        return;
                    }

                    const dx =
                        player.x -
                        enemy.x;

                    const dy =
                        player.y -
                        enemy.y;

                    const distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );

                    if (
                        distance <
                        enemy.radius +
                        player.width / 2
                    ) {

                        player.health -=
                            enemy.type ===
                            "tank"
                                ? 20
                                : enemy.type ===
                                  "fast"
                                    ? 12
                                    : 8;

                        player.invulnerable =
                            45;

                        player.flash =
                            10;

                        createBurst(
                            player.x,
                            player.y,
                            player.color,
                            16
                        );

                        /*
                         * Knock enemy away.
                         */

                        const angle =
                            Math.atan2(
                                enemy.y -
                                player.y,
                                enemy.x -
                                player.x
                            );

                        enemy.x +=
                            Math.cos(angle) *
                            30;

                        enemy.y +=
                            Math.sin(angle) *
                            30;
                    }
                }
            );
        }
    );
}


/* =========================================
   POWER-UPS
   ========================================= */

function maybeDropPowerUp(
    enemy
) {

    if (
        Math.random() > 0.08
    ) {
        return;
    }

    const type =
        Math.random() < 0.5
            ? "health"
            : "rapid";

    powerUps.push({

        x: enemy.x,

        y: enemy.y,

        radius: 10,

        type,

        life: 600,

        rotation: 0
    });
}


function updatePowerUps(delta) {

    powerUps.forEach(
        powerUp => {

            powerUp.life -=
                delta;

            powerUp.rotation +=
                0.05 *
                delta;
        }
    );

    powerUps =
        powerUps.filter(
            powerUp =>
                powerUp.life > 0
        );
}


function checkPowerUpCollisions() {

    powerUps =
        powerUps.filter(
            powerUp => {

                let collected = false;

                players.forEach(
                    player => {

                        if (
                            player.health <= 0
                        ) {
                            return;
                        }

                        const dx =
                            player.x -
                            powerUp.x;

                        const dy =
                            player.y -
                            powerUp.y;

                        const distance =
                            Math.sqrt(
                                dx * dx +
                                dy * dy
                            );

                        if (
                            distance <
                            powerUp.radius +
                            player.width / 2
                        ) {

                            collected = true;

                            if (
                                powerUp.type ===
                                "health"
                            ) {

                                player.health =
                                    Math.min(
                                        MAX_HEALTH,
                                        player.health +
                                        30
                                    );

                            } else {

                                player.fireRate =
                                    60;

                                setTimeout(
                                    () => {

                                        player.fireRate =
                                            150;

                                    },
                                    5000
                                );
                            }

                            score += 50;

                            createBurst(
                                powerUp.x,
                                powerUp.y,
                                powerUp.type ===
                                "health"
                                    ? "#39ff88"
                                    : "#facc15",
                                15
                            );
                        }
                    }
                );

                return !collected;
            }
        );
}


/* =========================================
   PARTICLES
   ========================================= */

function createBurst(
    x,
    y,
    color,
    amount = 12
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            Math.random() * 4 + 1;

        particles.push({

            x,
            y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            size:
                Math.random() * 4 + 1,

            life: 1,

            color
        });
    }
}


function createMuzzleFlash(
    player
) {

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        particles.push({

            x:
                player.x + 13,

            y:
                player.y,

            vx:
                Math.random() * 3 + 1,

            vy:
                (Math.random() - 0.5) *
                2,

            size:
                Math.random() * 3 + 2,

            life: 0.5,

            color:
                player.color
        });
    }
}


function updateParticles(delta) {

    particles.forEach(
        particle => {

            particle.x +=
                particle.vx *
                delta;

            particle.y +=
                particle.vy *
                delta;

            particle.vx *=
                0.96;

            particle.vy *=
                0.96;

            particle.life -=
                0.035 *
                delta;

            particle.size *=
                0.98;
        }
    );

    particles =
        particles.filter(
            particle =>
                particle.life > 0
        );
}


/* =========================================
   STARS
   ========================================= */

function createStars() {

    stars = [];

    for (
        let i = 0;
        i < 110;
        i++
    ) {

        stars.push({

            x:
                Math.random() *
                WIDTH,

            y:
                Math.random() *
                HEIGHT,

            size:
                Math.random() * 2 + 0.4,

            alpha:
                Math.random() * 0.7 +
                0.2
        });
    }
}


/* =========================================
   DRAW
   ========================================= */

function draw() {

    drawBackground();

    drawStars();

    drawGrid();

    drawPowerUps();

    drawBullets();

    drawEnemies();

    drawPlayers();

    drawParticles();
}


/* =========================================
   BACKGROUND
   ========================================= */

function drawBackground() {

    const gradient =
        ctx.createRadialGradient(
            WIDTH / 2,
            HEIGHT / 2,
            50,
            WIDTH / 2,
            HEIGHT / 2,
            WIDTH
        );

    gradient.addColorStop(
        0,
        "#081225"
    );

    gradient.addColorStop(
        1,
        "#02040a"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );
}


/* =========================================
   STARS
   ========================================= */

function drawStars() {

    stars.forEach(
        star => {

            ctx.globalAlpha =
                star.alpha;

            ctx.fillStyle =
                "#dbeafe";

            ctx.fillRect(
                star.x,
                star.y,
                star.size,
                star.size
            );
        }
    );

    ctx.globalAlpha = 1;
}


/* =========================================
   GRID
   ========================================= */

function drawGrid() {

    const grid = 45;

    ctx.strokeStyle =
        "rgba(34, 211, 238, 0.045)";

    ctx.lineWidth = 1;

    for (
        let x = 0;
        x < WIDTH;
        x += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            HEIGHT
        );

        ctx.stroke();
    }

    for (
        let y = 0;
        y < HEIGHT;
        y += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            WIDTH,
            y
        );

        ctx.stroke();
    }
}


/* =========================================
   PLAYERS
   ========================================= */

function drawPlayers() {

    players.forEach(
        player => {

            if (
                player.health <= 0
            ) {
                return;
            }

            /*
             * Damage blink.
             */

            if (
                player.invulnerable > 0 &&
                Math.floor(
                    player.invulnerable / 4
                ) % 2 === 0
            ) {
                return;
            }

            ctx.save();

            ctx.translate(
                player.x,
                player.y
            );

            ctx.shadowColor =
                player.color;

            ctx.shadowBlur = 20;

            /*
             * Player body.
             */

            ctx.fillStyle =
                player.color;

            ctx.beginPath();

            ctx.moveTo(
                14,
                0
            );

            ctx.lineTo(
                -9,
                -11
            );

            ctx.lineTo(
                -5,
                0
            );

            ctx.lineTo(
                -9,
                11
            );

            ctx.closePath();

            ctx.fill();

            /*
             * Core.
             */

            ctx.shadowBlur = 0;

            ctx.fillStyle =
                "#ffffff";

            ctx.beginPath();

            ctx.arc(
                2,
                0,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();

            /*
             * Player number.
             */

            ctx.fillStyle =
                player.color;

            ctx.font =
                "bold 9px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                player.id,
                0,
                -18
            );

            ctx.restore();
        }
    );
}


/* =========================================
   ENEMIES
   ========================================= */

function drawEnemies() {

    enemies.forEach(
        enemy => {

            ctx.save();

            ctx.translate(
                enemy.x,
                enemy.y
            );

            ctx.shadowColor =
                enemy.color;

            ctx.shadowBlur = 18;

            ctx.fillStyle =
                enemy.color;

            /*
             * Alien body.
             */

            ctx.beginPath();

            const points =
                enemy.type ===
                "tank"
                    ? 8
                    : 6;

            for (
                let i = 0;
                i < points;
                i++
            ) {

                const angle =
                    i /
                    points *
                    Math.PI *
                    2;

                const radius =
                    enemy.radius *
                    (
                        i % 2 === 0
                            ? 1
                            : 0.68
                    );

                const x =
                    Math.cos(angle) *
                    radius;

                const y =
                    Math.sin(angle) *
                    radius;

                if (i === 0) {
                    ctx.moveTo(
                        x,
                        y
                    );
                } else {
                    ctx.lineTo(
                        x,
                        y
                    );
                }
            }

            ctx.closePath();

            ctx.fill();

            /*
             * Alien eye.
             */

            ctx.shadowBlur = 0;

            ctx.fillStyle =
                "#ffffff";

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                enemy.type ===
                "tank"
                    ? 5
                    : 3,
                0,
                Math.PI * 2
            );

            ctx.fill();

            /*
             * Tank health indicator.
             */

            if (
                enemy.type === "tank"
            ) {

                ctx.fillStyle =
                    "rgba(0,0,0,0.5)";

                ctx.fillRect(
                    -15,
                    -27,
                    30,
                    3
                );

                ctx.fillStyle =
                    "#ff405f";

                ctx.fillRect(
                    -15,
                    -27,
                    10 *
                    enemy.health,
                    3
                );
            }

            ctx.restore();
        }
    );
}


/* =========================================
   BULLETS
   ========================================= */

function drawBullets() {

    bullets.forEach(
        bullet => {

            ctx.save();

            ctx.fillStyle =
                bullet.color;

            ctx.shadowColor =
                bullet.color;

            ctx.shadowBlur = 15;

            ctx.beginPath();

            ctx.arc(
                bullet.x,
                bullet.y,
                bullet.radius,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();
        }
    );
}


/* =========================================
   POWER-UPS
   ========================================= */

function drawPowerUps() {

    powerUps.forEach(
        powerUp => {

            ctx.save();

            ctx.translate(
                powerUp.x,
                powerUp.y
            );

            ctx.rotate(
                powerUp.rotation
            );

            const color =
                powerUp.type ===
                "health"
                    ? "#39ff88"
                    : "#facc15";

            ctx.shadowColor =
                color;

            ctx.shadowBlur = 20;

            ctx.strokeStyle =
                color;

            ctx.lineWidth = 3;

            ctx.strokeRect(
                -9,
                -9,
                18,
                18
            );

            ctx.shadowBlur = 0;

            ctx.fillStyle =
                color;

            ctx.font =
                "bold 13px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                powerUp.type ===
                "health"
                    ? "+"
                    : "⚡",
                0,
                1
            );

            ctx.restore();
        }
    );
}


/* =========================================
   PARTICLES
   ========================================= */

function drawParticles() {

    particles.forEach(
        particle => {

            ctx.save();

            ctx.globalAlpha =
                Math.max(
                    0,
                    particle.life
                );

            ctx.fillStyle =
                particle.color;

            ctx.shadowColor =
                particle.color;

            ctx.shadowBlur = 10;

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();
        }
    );

    ctx.globalAlpha = 1;
}


/* =========================================
   GAME OVER
   ========================================= */

function checkGameOver() {

    const alivePlayers =
        players.filter(
            player =>
                player.health > 0
        );

    if (
        alivePlayers.length === 0
    ) {

        endGame();
    }
}


function endGame() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    statusText.textContent =
        "THE VOID HAS WON";

    finalScore.textContent =
        Math.floor(score);

    finalWave.textContent =
        Math.max(
            1,
            wave - 1
        );

    gameOver.classList.remove(
        "hidden"
    );

    draw();
}


/* =========================================
   UI
   ========================================= */

function updateUI() {

    waveText.textContent =
        wave;

    scoreText.textContent =
        Math.floor(score);

    if (players.length >= 2) {

        health1.style.width =
            `${clamp(
                players[0].health,
                0,
                100
            )}%`;

        health2.style.width =
            `${clamp(
                players[1].health,
                0,
                100
            )}%`;
    }
}


/* =========================================
   KEY INPUT
   ========================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        keys[key] = true;

        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                " ",
                "enter"
            ].includes(key)
        ) {

            event.preventDefault();
        }

        /*
         * Space can also start game.
         */

        if (
            key === " " &&
            !gameRunning
        ) {

            startGame();
        }
    }
);


document.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();

        keys[key] = false;
    }
);


function isKeyPressed(key) {

    return keys[key] === true;
}


/* =========================================
   BUTTONS
   ========================================= */

startBtn.addEventListener(
    "click",
    startGame
);

playAgainBtn.addEventListener(
    "click",
    startGame
);


/* =========================================
   UTILITY
   ========================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );
}


/* =========================================
   RESET KEYS
   ========================================= */

window.addEventListener(
    "blur",
    () => {

        for (const key in keys) {
            keys[key] = false;
        }
    }
);


/* =========================================
   INITIAL DRAW
   ========================================= */

draw();

/* =========================================
   MOBILE MULTIPLAYER JOYSTICKS
   ========================================= */

function setupJoystick(
    joystickId,
    knobId,
    playerIndex
) {

    const joystick =
        document.getElementById(
            joystickId
        );

    const knob =
        document.getElementById(
            knobId
        );

    if (!joystick || !knob) {
        return;
    }

    let active = false;

    let pointerId = null;

    const radius =
        50;

    const maxDistance =
        27;


    function moveJoystick(
        clientX,
        clientY
    ) {

        const rect =
            joystick.getBoundingClientRect();

        const centerX =
            rect.left +
            rect.width / 2;

        const centerY =
            rect.top +
            rect.height / 2;

        let dx =
            clientX - centerX;

        let dy =
            clientY - centerY;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance > maxDistance
        ) {

            dx =
                dx /
                distance *
                maxDistance;

            dy =
                dy /
                distance *
                maxDistance;
        }


        knob.style.transform =
            `translate(
                calc(-50% + ${dx}px),
                calc(-50% + ${dy}px)
            )`;


        /*
         * Convert joystick direction
         * into keyboard-style controls.
         */

        const deadZone = 7;

        if (playerIndex === 0) {

            keys.w =
                dy < -deadZone;

            keys.s =
                dy > deadZone;

            keys.a =
                dx < -deadZone;

            keys.d =
                dx > deadZone;

        } else {

            keys.arrowup =
                dy < -deadZone;

            keys.arrowdown =
                dy > deadZone;

            keys.arrowleft =
                dx < -deadZone;

            keys.arrowright =
                dx > deadZone;
        }
    }


    function reset() {

        active = false;

        pointerId = null;

        knob.style.transform =
            "translate(-50%, -50%)";


        if (playerIndex === 0) {

            keys.w = false;
            keys.s = false;
            keys.a = false;
            keys.d = false;

        } else {

            keys.arrowup = false;
            keys.arrowdown = false;
            keys.arrowleft = false;
            keys.arrowright = false;
        }
    }


    joystick.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            active = true;

            pointerId =
                event.pointerId;

            joystick.setPointerCapture(
                event.pointerId
            );

            moveJoystick(
                event.clientX,
                event.clientY
            );
        }
    );


    joystick.addEventListener(
        "pointermove",
        event => {

            if (
                !active ||
                event.pointerId !==
                pointerId
            ) {
                return;
            }

            event.preventDefault();

            moveJoystick(
                event.clientX,
                event.clientY
            );
        }
    );


    joystick.addEventListener(
        "pointerup",
        event => {

            if (
                event.pointerId !==
                pointerId
            ) {
                return;
            }

            reset();
        }
    );


    joystick.addEventListener(
        "pointercancel",
        reset
    );
}


/* =========================================
   MOBILE FIRE BUTTONS
   ========================================= */

function setupFireButton(
    buttonId,
    playerIndex
) {

    const button =
        document.getElementById(
            buttonId
        );

    if (!button) {
        return;
    }

    const fireKey =
        playerIndex === 0
            ? "f"
            : "enter";


    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            keys[fireKey] = true;
        }
    );


    button.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();

            keys[fireKey] = false;
        }
    );


    button.addEventListener(
        "pointercancel",
        () => {

            keys[fireKey] = false;
        }
    );


    button.addEventListener(
        "pointerleave",
        () => {

            keys[fireKey] = false;
        }
    );
}


/* =========================================
   ACTIVATE MOBILE CONTROLS
   ========================================= */

setupJoystick(
    "joystick1",
    "knob1",
    0
);

setupJoystick(
    "joystick2",
    "knob2",
    1
);

setupFireButton(
    "fire1",
    0
);

setupFireButton(
    "fire2",
    1
);
