/* =========================================
   GAMEVAULT — DASH REACTOR
   dash.js
   ========================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const mobileDash = document.getElementById("mobileDash");

const statusText = document.getElementById("status");

const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");

const speedText = document.getElementById("speed");
const energyText = document.getElementById("energy");
const distanceText = document.getElementById("distance");

const gameOverScreen = document.getElementById("gameOver");
const finalScoreText = document.getElementById("finalScore");
const finalBestText = document.getElementById("finalBest");


/* =========================================
   GAME SETTINGS
   ========================================= */

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PLAYER_SIZE = 24;

const START_SPEED = 4;
const MAX_SPEED = 13;

const PLAYER_SPEED = 6;

const DASH_SPEED = 18;
const DASH_DURATION = 350;

const MAX_ENERGY = 100;

const ENERGY_RECHARGE = 18;

const DASH_COST = 35;


/* =========================================
   GAME STATE
   ========================================= */

let player;

let obstacles = [];
let particles = [];
let stars = [];
let coins = [];

let score = 0;
let best = Number(
    localStorage.getItem(
        "gamevault-dash-best"
    ) || 0
);

let distance = 0;

let gameSpeed = START_SPEED;

let energy = MAX_ENERGY;

let gameRunning = false;

let isDashing = false;
let dashEndTime = 0;

let lastTime = 0;

let obstacleTimer = 0;
let coinTimer = 0;

let animationId = null;

let keys = {
    up: false,
    down: false,
    left: false,
    right: false
};


/* =========================================
   INITIAL UI
   ========================================= */

bestText.textContent = best;

createStars();

draw();

updateUI();


/* =========================================
   START GAME
   ========================================= */

function startGame() {

    cancelAnimationFrame(animationId);

    player = {
        x: WIDTH * 0.2,
        y: HEIGHT / 2,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        rotation: 0
    };

    obstacles = [];
    particles = [];
    coins = [];

    score = 0;
    distance = 0;

    gameSpeed = START_SPEED;

    energy = MAX_ENERGY;

    isDashing = false;
    dashEndTime = 0;

    obstacleTimer = 0;
    coinTimer = 0;

    gameRunning = true;

    lastTime = performance.now();

    statusText.textContent =
        "Dodge everything!";

    startBtn.textContent =
        "Restart";

    gameOverScreen.classList.add(
        "hidden"
    );

    updateUI();

    animationId =
        requestAnimationFrame(gameLoop);
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

    update(delta, time);

    draw();

    animationId =
        requestAnimationFrame(gameLoop);
}


/* =========================================
   UPDATE
   ========================================= */

function update(delta, time) {

    updatePlayer(delta);

    updateDifficulty(delta);

    spawnObjects(delta);

    updateObstacles(delta);

    updateCoins(delta);

    updateParticles(delta);

    updateStars(delta);

    checkCollisions();

    collectCoins();

    updateDash(time);

    updateUI();
}


/* =========================================
   PLAYER
   ========================================= */

function updatePlayer(delta) {

    let dx = 0;
    let dy = 0;

    if (keys.left) {
        dx -= 1;
    }

    if (keys.right) {
        dx += 1;
    }

    if (keys.up) {
        dy -= 1;
    }

    if (keys.down) {
        dy += 1;
    }

    /*
     * Normalize diagonal movement.
     */
    if (dx !== 0 || dy !== 0) {

        const length =
            Math.sqrt(
                dx * dx + dy * dy
            );

        dx /= length;
        dy /= length;
    }

    const movementSpeed =
        isDashing
            ? DASH_SPEED
            : PLAYER_SPEED;

    player.x +=
        dx *
        movementSpeed *
        delta;

    player.y +=
        dy *
        movementSpeed *
        delta;

    /*
     * Keep player inside arena.
     */
    player.x = clamp(
        player.x,
        PLAYER_SIZE / 2,
        WIDTH - PLAYER_SIZE / 2
    );

    player.y = clamp(
        player.y,
        PLAYER_SIZE / 2,
        HEIGHT - PLAYER_SIZE / 2
    );

    /*
     * Rotate player based on movement.
     */
    if (dx !== 0 || dy !== 0) {

        const targetRotation =
            Math.atan2(dy, dx);

        player.rotation +=
            angleDifference(
                targetRotation,
                player.rotation
            ) * 0.18;
    }

    /*
     * Dash trail.
     */
    if (isDashing) {

        for (let i = 0; i < 2; i++) {

            particles.push({
                x: player.x -
                    Math.cos(player.rotation) * 10,

                y: player.y -
                    Math.sin(player.rotation) * 10,

                vx: 0,
                vy: 0,

                size:
                    Math.random() * 5 + 3,

                life: 0.4,

                color:
                    Math.random() > 0.5
                        ? "#22d3ee"
                        : "#facc15"
            });
        }
    }
}


/* =========================================
   DIFFICULTY
   ========================================= */

function updateDifficulty(delta) {

    distance +=
        gameSpeed *
        delta *
        0.08;

    score +=
        gameSpeed *
        delta *
        0.025;

    /*
     * Speed increases with distance.
     */
    gameSpeed =
        Math.min(
            MAX_SPEED,
            START_SPEED +
            distance / 500
        );
}


/* =========================================
   SPAWNING
   ========================================= */

function spawnObjects(delta) {

    obstacleTimer += delta;

    coinTimer += delta;

    /*
     * Spawn obstacles more frequently
     * as the game gets faster.
     */
    const obstacleDelay =
        Math.max(
            22,
            58 -
            gameSpeed * 2.5
        );

    if (obstacleTimer >= obstacleDelay) {

        obstacleTimer = 0;

        spawnObstacle();
    }

    /*
     * Coins.
     */
    if (coinTimer >= 75) {

        coinTimer = 0;

        spawnCoin();
    }
}


/* =========================================
   OBSTACLES
   ========================================= */

function spawnObstacle() {

    const size =
        Math.random() * 24 + 24;

    const type =
        Math.random();

    let obstacle;

    if (type < 0.5) {

        obstacle = {
            x: WIDTH + size,
            y:
                Math.random() *
                (HEIGHT - size),

            width: size,
            height: size,

            rotation:
                Math.random() *
                Math.PI,

            rotationSpeed:
                (Math.random() - 0.5) *
                0.08,

            color:
                "#ff4d6d",

            type: "square"
        };

    } else {

        obstacle = {
            x: WIDTH + size,
            y:
                Math.random() *
                (HEIGHT - size),

            width: size,
            height: size,

            rotation: 0,

            rotationSpeed: 0,

            color:
                "#a855f7",

            type: "laser"
        };
    }

    obstacles.push(obstacle);
}


/* =========================================
   UPDATE OBSTACLES
   ========================================= */

function updateObstacles(delta) {

    obstacles.forEach(
        obstacle => {

            obstacle.x -=
                gameSpeed *
                delta;

            obstacle.rotation +=
                obstacle.rotationSpeed *
                delta;
        }
    );

    obstacles =
        obstacles.filter(
            obstacle =>
                obstacle.x >
                -obstacle.width - 50
        );
}


/* =========================================
   COINS
   ========================================= */

function spawnCoin() {

    coins.push({

        x: WIDTH + 20,

        y:
            Math.random() *
            (HEIGHT - 80) +
            40,

        radius: 9,

        rotation: 0
    });
}


function updateCoins(delta) {

    coins.forEach(
        coin => {

            coin.x -=
                gameSpeed *
                delta;

            coin.rotation +=
                0.08 *
                delta;
        }
    );

    coins =
        coins.filter(
            coin =>
                coin.x > -30
        );
}


function collectCoins() {

    coins = coins.filter(
        coin => {

            const collected =
                circleRectCollision(
                    coin,
                    player
                );

            if (collected) {

                score += 25;

                energy =
                    Math.min(
                        MAX_ENERGY,
                        energy + 10
                    );

                createBurst(
                    coin.x,
                    coin.y,
                    "#facc15"
                );

                return false;
            }

            return true;
        }
    );
}


/* =========================================
   COLLISION
   ========================================= */

function checkCollisions() {

    if (isDashing) {
        return;
    }

    for (const obstacle of obstacles) {

        if (
            rectangleCollision(
                player,
                obstacle
            )
        ) {

            createBurst(
                player.x,
                player.y,
                "#ff4d6d",
                30
            );

            endGame();

            return;
        }
    }
}


/* =========================================
   DASH
   ========================================= */

function activateDash() {

    if (
        !gameRunning ||
        isDashing ||
        energy < DASH_COST
    ) {
        return;
    }

    energy -= DASH_COST;

    isDashing = true;

    dashEndTime =
        performance.now() +
        DASH_DURATION;

    statusText.textContent =
        "⚡ DASHING!";

    createBurst(
        player.x,
        player.y,
        "#22d3ee",
        18
    );
}


function updateDash(time) {

    if (
        isDashing &&
        time >= dashEndTime
    ) {

        isDashing = false;

        statusText.textContent =
            "Keep moving!";
    }

    /*
     * Recharge energy when not dashing.
     */
    if (!isDashing) {

        energy +=
            ENERGY_RECHARGE *
            0.016;

        energy =
            Math.min(
                MAX_ENERGY,
                energy
            );
    }
}


/* =========================================
   PARTICLES
   ========================================= */

function createBurst(
    x,
    y,
    color,
    amount = 15
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
            Math.random() * 5 + 1;

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
                Math.random() * 5 + 2,

            life: 1,

            color
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
                0.97;

            particle.vy *=
                0.97;

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
        i < 90;
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
                Math.random() * 2 + 0.5,

            speed:
                Math.random() * 1.5 + 0.3,

            alpha:
                Math.random() * 0.7 + 0.2
        });
    }
}


function updateStars(delta) {

    stars.forEach(
        star => {

            star.x -=
                star.speed *
                delta;

            if (star.x < 0) {

                star.x = WIDTH;

                star.y =
                    Math.random() *
                    HEIGHT;
            }
        }
    );
}


/* =========================================
   DRAW
   ========================================= */

function draw() {

    drawBackground();

    drawStars();

    drawGrid();

    drawCoins();

    drawObstacles();

    drawParticles();

    if (player) {
        drawPlayer();
    }
}


/* =========================================
   BACKGROUND
   ========================================= */

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            WIDTH,
            HEIGHT
        );

    gradient.addColorStop(
        0,
        "#050811"
    );

    gradient.addColorStop(
        0.5,
        "#08101c"
    );

    gradient.addColorStop(
        1,
        "#070812"
    );

    ctx.fillStyle = gradient;

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

    const gridSize = 50;

    ctx.strokeStyle =
        "rgba(34, 211, 238, 0.055)";

    ctx.lineWidth = 1;

    for (
        let x = 0;
        x < WIDTH;
        x += gridSize
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
        y += gridSize
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
   PLAYER
   ========================================= */

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

    ctx.rotate(
        player.rotation
    );

    /*
     * Glow.
     */
    ctx.shadowColor =
        isDashing
            ? "#facc15"
            : "#22d3ee";

    ctx.shadowBlur =
        isDashing
            ? 30
            : 18;

    /*
     * Player body.
     */
    const gradient =
        ctx.createLinearGradient(
            -12,
            0,
            12,
            0
        );

    gradient.addColorStop(
        0,
        "#8b5cf6"
    );

    gradient.addColorStop(
        1,
        isDashing
            ? "#facc15"
            : "#22d3ee"
    );

    ctx.fillStyle = gradient;

    ctx.beginPath();

    ctx.moveTo(
        14,
        0
    );

    ctx.lineTo(
        -10,
        -10
    );

    ctx.lineTo(
        -6,
        0
    );

    ctx.lineTo(
        -10,
        10
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

    ctx.restore();
}


/* =========================================
   OBSTACLE DRAWING
   ========================================= */

function drawObstacles() {

    obstacles.forEach(
        obstacle => {

            ctx.save();

            ctx.translate(
                obstacle.x +
                    obstacle.width / 2,

                obstacle.y +
                    obstacle.height / 2
            );

            ctx.rotate(
                obstacle.rotation
            );

            ctx.shadowColor =
                obstacle.color;

            ctx.shadowBlur = 18;

            if (
                obstacle.type ===
                "square"
            ) {

                ctx.fillStyle =
                    obstacle.color;

                ctx.fillRect(
                    -obstacle.width / 2,
                    -obstacle.height / 2,
                    obstacle.width,
                    obstacle.height
                );

                ctx.shadowBlur = 0;

                ctx.fillStyle =
                    "rgba(255,255,255,0.2)";

                ctx.fillRect(
                    -obstacle.width / 2 + 5,
                    -obstacle.height / 2 + 5,
                    obstacle.width - 10,
                    4
                );

            } else {

                /*
                 * Laser-style obstacle.
                 */
                ctx.fillStyle =
                    obstacle.color;

                ctx.fillRect(
                    -obstacle.width / 2,
                    -4,
                    obstacle.width,
                    8
                );

                ctx.fillStyle =
                    "#ffffff";

                ctx.fillRect(
                    -obstacle.width / 2 + 5,
                    -1,
                    obstacle.width - 10,
                    2
                );
            }

            ctx.restore();
        }
    );
}


/* =========================================
   COIN DRAWING
   ========================================= */

function drawCoins() {

    coins.forEach(
        coin => {

            ctx.save();

            ctx.translate(
                coin.x,
                coin.y
            );

            ctx.rotate(
                coin.rotation
            );

            ctx.shadowColor =
                "#facc15";

            ctx.shadowBlur = 18;

            ctx.fillStyle =
                "#facc15";

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                coin.radius,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.strokeStyle =
                "#fff7ae";

            ctx.lineWidth = 2;

            ctx.stroke();

            ctx.fillStyle =
                "#fff7ae";

            ctx.font =
                "bold 11px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                "$",
                0,
                1
            );

            ctx.restore();
        }
    );
}


/* =========================================
   PARTICLE DRAWING
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
   COLLISION HELPERS
   ========================================= */

function rectangleCollision(
    a,
    b
) {

    return (
        a.x - a.width / 2 <
            b.x + b.width / 2 &&

        a.x + a.width / 2 >
            b.x - b.width / 2 &&

        a.y - a.height / 2 <
            b.y + b.height / 2 &&

        a.y + a.height / 2 >
            b.y - b.height / 2
    );
}


function circleRectCollision(
    circle,
    rect
) {

    const closestX =
        clamp(
            circle.x,
            rect.x -
                rect.width / 2,

            rect.x +
                rect.width / 2
        );

    const closestY =
        clamp(
            circle.y,
            rect.y -
                rect.height / 2,

            rect.y +
                rect.height / 2
        );

    const dx =
        circle.x -
        closestX;

    const dy =
        circle.y -
        closestY;

    return (
        dx * dx +
        dy * dy <
        circle.radius *
        circle.radius
    );
}


/* =========================================
   UTILITIES
   ========================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


function angleDifference(
    target,
    current
) {

    let difference =
        target - current;

    while (
        difference > Math.PI
    ) {
        difference -=
            Math.PI * 2;
    }

    while (
        difference < -Math.PI
    ) {
        difference +=
            Math.PI * 2;
    }

    return difference;
}


/* =========================================
   UI
   ========================================= */

function updateUI() {

    scoreText.textContent =
        Math.floor(score);

    bestText.textContent =
        best;

    speedText.textContent =
        (
            gameSpeed /
            START_SPEED
        ).toFixed(1) + "x";

    energyText.textContent =
        Math.floor(energy) + "%";

    distanceText.textContent =
        Math.floor(distance) + "m";
}


/* =========================================
   GAME OVER
   ========================================= */

function endGame() {

    gameRunning = false;

    isDashing = false;

    /*
     * Round score.
     */
    score =
        Math.floor(score);

    /*
     * Save best.
     */
    if (score > best) {

        best = score;

        localStorage.setItem(
            "gamevault-dash-best",
            best
        );
    }

    finalScoreText.textContent =
        score;

    finalBestText.textContent =
        best;

    statusText.textContent =
        "Reactor critical!";

    gameOverScreen.classList.remove(
        "hidden"
    );

    updateUI();

    draw();
}


/* =========================================
   KEYBOARD CONTROLS
   ========================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                "w",
                "a",
                "s",
                "d",
                " "
            ].includes(key)
        ) {
            event.preventDefault();
        }

        if (
            key === "arrowup" ||
            key === "w"
        ) {
            keys.up = true;
        }

        if (
            key === "arrowdown" ||
            key === "s"
        ) {
            keys.down = true;
        }

        if (
            key === "arrowleft" ||
            key === "a"
        ) {
            keys.left = true;
        }

        if (
            key === "arrowright" ||
            key === "d"
        ) {
            keys.right = true;
        }

        if (key === " ") {

            if (gameRunning) {
                activateDash();
            } else {
                startGame();
            }
        }
    }
);


document.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();

        if (
            key === "arrowup" ||
            key === "w"
        ) {
            keys.up = false;
        }

        if (
            key === "arrowdown" ||
            key === "s"
        ) {
            keys.down = false;
        }

        if (
            key === "arrowleft" ||
            key === "a"
        ) {
            keys.left = false;
        }

        if (
            key === "arrowright" ||
            key === "d"
        ) {
            keys.right = false;
        }
    }
);


/* =========================================
   MOBILE CONTROLS
   ========================================= */

/* =========================================
   MOBILE JOYSTICK
   ========================================= */

const joystick =
    document.getElementById("joystick");

const joystickKnob =
    document.getElementById("joystickKnob");


let joystickActive = false;

let joystickPointerId = null;


/* =========================================
   JOYSTICK SETTINGS
   ========================================= */

const JOYSTICK_RADIUS = 52;

const KNOB_RADIUS = 23;

const MAX_KNOB_DISTANCE =
    JOYSTICK_RADIUS - KNOB_RADIUS;


/* =========================================
   JOYSTICK POSITION
   ========================================= */

function updateJoystick(
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

    /*
     * Keep the knob inside the joystick.
     */
    if (
        distance >
        MAX_KNOB_DISTANCE
    ) {

        dx =
            dx /
            distance *
            MAX_KNOB_DISTANCE;

        dy =
            dy /
            distance *
            MAX_KNOB_DISTANCE;
    }

    /*
     * Move visual knob.
     */
    joystickKnob.style.transform =
        `translate(
            calc(-50% + ${dx}px),
            calc(-50% + ${dy}px)
        )`;

    /*
     * Convert joystick position
     * into analog movement.
     */
    const normalizedX =
        dx /
        MAX_KNOB_DISTANCE;

    const normalizedY =
        dy /
        MAX_KNOB_DISTANCE;

    /*
     * Dead zone prevents tiny
     * accidental movements.
     */
    const deadZone = 0.12;

    keys.left =
        normalizedX < -deadZone;

    keys.right =
        normalizedX > deadZone;

    keys.up =
        normalizedY < -deadZone;

    keys.down =
        normalizedY > deadZone;
}


/* =========================================
   RESET JOYSTICK
   ========================================= */

function resetJoystick() {

    joystickActive = false;

    joystickPointerId = null;

    joystick.classList.remove(
        "active"
    );

    joystickKnob.style.transform =
        "translate(-50%, -50%)";

    keys.up = false;
    keys.down = false;
    keys.left = false;
    keys.right = false;
}


/* =========================================
   POINTER DOWN
   ========================================= */

joystick.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        joystickActive = true;

        joystickPointerId =
            event.pointerId;

        joystick.setPointerCapture(
            event.pointerId
        );

        joystick.classList.add(
            "active"
        );

        updateJoystick(
            event.clientX,
            event.clientY
        );
    }
);


/* =========================================
   POINTER MOVE
   ========================================= */

joystick.addEventListener(
    "pointermove",
    event => {

        if (
            !joystickActive ||
            event.pointerId !==
            joystickPointerId
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


/* =========================================
   POINTER UP
   ========================================= */

joystick.addEventListener(
    "pointerup",
    event => {

        if (
            event.pointerId !==
            joystickPointerId
        ) {
            return;
        }

        event.preventDefault();

        resetJoystick();
    }
);


/* =========================================
   POINTER CANCEL
   ========================================= */

joystick.addEventListener(
    "pointercancel",
    resetJoystick
);


/* =========================================
   DASH BUTTON
   ========================================= */

mobileDash.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        activateDash();
    }
);


/* =========================================
   MOBILE DASH
   ========================================= */

mobileDash.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        activateDash();
    }
);


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
   RESET KEYS WHEN WINDOW LOSES FOCUS
   ========================================= */

window.addEventListener(
    "blur",
    () => {

        keys.up = false;
        keys.down = false;
        keys.left = false;
        keys.right = false;
    }
);


/* =========================================
   START SCREEN
   ========================================= */

statusText.textContent =
    "Press Start to launch";

bestText.textContent =
    best;

updateUI();

draw();
