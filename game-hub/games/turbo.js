const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOver");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const scoreElement =
    document.getElementById("score");

const coinsElement =
    document.getElementById("coins");

const speedElement =
    document.getElementById("speed");

const bestElement =
    document.getElementById("best");

const finalScoreElement =
    document.getElementById("finalScore");

const finalCoinsElement =
    document.getElementById("finalCoins");

const finalBestElement =
    document.getElementById("finalBest");

const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");


/* =========================
CANVAS
========================= */

let width = 0;
let height = 0;
let dpr = 1;

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    width =
        rect.width;

    height =
        rect.height;

    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    if (gameRunning) {
        resetPlayer();
    }

}

window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================
GAME VARIABLES
========================= */

let score = 0;

let coinsCollected = 0;

let gameRunning = false;

let lastTime = 0;

let roadOffset = 0;

let spawnTimer = 0;

let coinTimer = 0;

let boostTimer = 0;

let enemies = [];

let coins = [];

let boosts = [];

let particles = [];

let leftPressed = false;

let rightPressed = false;


/* =========================
SPEED
========================= */

const BASE_SPEED = 260;

const MAX_SPEED = 650;

let currentSpeed =
    BASE_SPEED;

let turboActive = false;

let turboTime = 0;

const TURBO_DURATION = 4;

const TURBO_SPEED = 1.8;


/* =========================
PLAYER
========================= */

const player = {

    x: 0,

    y: 0,

    width: 42,

    height: 72,

    moveSpeed: 390

};

function resetPlayer() {

    player.x =
        width / 2 -
        player.width / 2;

    player.y =
        height - 105;

}


/* =========================
HIGH SCORE
========================= */

let bestScore =
    Number(
        localStorage.getItem(
            "turboBest"
        )
    ) || 0;

bestElement.textContent =
    bestScore.toLocaleString();


/* =========================
ROAD
========================= */

const road = {

    width: 360,

    get left() {

        return (
            width / 2 -
            this.width / 2
        );

    },

    get right() {

        return (
            width / 2 +
            this.width / 2
        );

    }

};


/* =========================
START GAME
========================= */

function startGame() {

    score = 0;

    coinsCollected = 0;

    currentSpeed =
        BASE_SPEED;

    turboActive = false;

    turboTime = 0;

    enemies = [];

    coins = [];

    boosts = [];

    particles = [];

    spawnTimer = 0;

    coinTimer = 0;

    boostTimer = 0;

    roadOffset = 0;

    gameRunning = true;

    resetPlayer();

    resetJoystick();

    startScreen.style.display =
        "none";

    gameOverScreen.style.display =
        "none";

    updateHUD();

    lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );

}


/* =========================
END GAME
========================= */

function endGame() {

    if (!gameRunning) return;

    gameRunning = false;

    resetJoystick();

    finalScoreElement.textContent =
        Math.floor(
            score
        ).toLocaleString();

    finalCoinsElement.textContent =
        coinsCollected;

    if (score > bestScore) {

        bestScore =
            Math.floor(score);

        localStorage.setItem(
            "turboBest",
            bestScore
        );

    }

    finalBestElement.textContent =
        bestScore.toLocaleString();

    bestElement.textContent =
        bestScore.toLocaleString();

    gameOverScreen.style.display =
        "flex";

}


/* =========================
HUD
========================= */

function updateHUD() {

    scoreElement.textContent =
        Math.floor(
            score
        ).toLocaleString();

    coinsElement.textContent =
        coinsCollected;

    let multiplier =
        currentSpeed /
        BASE_SPEED;

    if (turboActive) {

        multiplier *=
            TURBO_SPEED;

    }

    speedElement.textContent =
        multiplier.toFixed(1) +
        "x";

    bestElement.textContent =
        bestScore.toLocaleString();

}


/* =========================
SPAWN ENEMY
========================= */

function spawnEnemy() {

    const laneCount = 4;

    const laneWidth =
        road.width /
        laneCount;

    const lane =
        Math.floor(
            Math.random() *
            laneCount
        );

    const enemyWidth = 42;

    const enemyHeight = 70;

    const x =
        road.left +
        lane * laneWidth +
        (laneWidth -
            enemyWidth) / 2;

    const colors = [

        "#ef4444",

        "#3b82f6",

        "#22c55e",

        "#f59e0b",

        "#ec4899",

        "#8b5cf6"

    ];

    enemies.push({

        x,

        y:
            -enemyHeight - 20,

        width:
            enemyWidth,

        height:
            enemyHeight,

        color:
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ],

        speed:
            50 +
            Math.random() * 90

    });

}


/* =========================
SPAWN COIN
========================= */

function spawnCoin() {

    const margin = 25;

    coins.push({

        x:
            road.left +
            margin +
            Math.random() *
            (
                road.width -
                margin * 2
            ),

        y: -20,

        radius: 11,

        rotation:
            Math.random() *
            Math.PI * 2

    });

}


/* =========================
SPAWN TURBO
========================= */

function spawnTurbo() {

    const margin = 30;

    boosts.push({

        x:
            road.left +
            margin +
            Math.random() *
            (
                road.width -
                margin * 2
            ),

        y: -25,

        radius: 17,

        rotation: 0

    });

}


/* =========================
UPDATE PLAYER
========================= */

function updatePlayer(delta) {

    if (leftPressed) {

        player.x -=
            player.moveSpeed *
            delta;

    }

    if (rightPressed) {

        player.x +=
            player.moveSpeed *
            delta;

    }

    player.x =
        Math.max(

            road.left + 8,

            Math.min(

                road.right -
                player.width -
                8,

                player.x

            )

        );

}


/* =========================
UPDATE GAME
========================= */

function updateGame(delta) {

    currentSpeed =
        Math.min(

            MAX_SPEED,

            BASE_SPEED +
            score * 0.08

        );


    /* TURBO */

    if (turboActive) {

        turboTime -=
            delta;

        if (turboTime <= 0) {

            turboTime = 0;

            turboActive = false;

        }

    }


    const actualSpeed =
        currentSpeed *
        (
            turboActive
                ? TURBO_SPEED
                : 1
        );


    /* ROAD */

    roadOffset +=
        actualSpeed *
        delta;

    roadOffset %= 80;


    /* ENEMIES */

    spawnTimer += delta;

    const spawnRate =
        Math.max(

            0.38,

            1.05 -
            score * 0.0015

        );

    if (
        spawnTimer >=
        spawnRate
    ) {

        spawnTimer = 0;

        spawnEnemy();

        if (
            score > 1000 &&
            Math.random() < 0.22
        ) {

            spawnEnemy();

        }

    }


    /* COINS */

    coinTimer += delta;

    if (
        coinTimer >= 0.65
    ) {

        coinTimer = 0;

        spawnCoin();

    }


    /* TURBO BOOSTS */

    boostTimer += delta;

    if (
        boostTimer >= 7 &&
        Math.random() < 0.08
    ) {

        boostTimer = 0;

        spawnTurbo();

    }


    /* ENEMIES */

    for (
        let i =
            enemies.length - 1;

        i >= 0;

        i--
    ) {

        const enemy =
            enemies[i];

        enemy.y +=
            (
                actualSpeed * 0.7 +
                enemy.speed
            ) * delta;


        if (
            checkCollision(
                player,
                enemy
            )
        ) {

            createExplosion(

                player.x +
                player.width / 2,

                player.y +
                player.height / 2

            );

            endGame();

            return;

        }


        if (
            enemy.y >
            height + 100
        ) {

            enemies.splice(
                i,
                1
            );

            score += 5;

        }

    }


    /* COINS */

    for (
        let i =
            coins.length - 1;

        i >= 0;

        i--
    ) {

        const coin =
            coins[i];

        coin.y +=
            actualSpeed *
            delta;

        coin.rotation +=
            delta * 5;


        if (
            circleRectCollision(
                coin,
                player
            )
        ) {

            coinsCollected++;

            score += 50;

            createParticles(

                coin.x,

                coin.y,

                "#facc15"

            );

            coins.splice(
                i,
                1
            );

            continue;

        }


        if (
            coin.y >
            height + 30
        ) {

            coins.splice(
                i,
                1
            );

        }

    }


    /* TURBO ITEMS */

    for (
        let i =
            boosts.length - 1;

        i >= 0;

        i--
    ) {

        const boost =
            boosts[i];

        boost.y +=
            actualSpeed *
            delta;

        boost.rotation +=
            delta * 4;


        if (
            circleRectCollision(
                boost,
                player
            )
        ) {

            activateTurbo(
                boost
            );

            boosts.splice(
                i,
                1
            );

            continue;

        }


        if (
            boost.y >
            height + 40
        ) {

            boosts.splice(
                i,
                1
            );

        }

    }


    /* SCORE */

    score +=
        actualSpeed *
        delta *
        0.035;

    updateParticles(
        delta
    );

    updateHUD();

}


/* =========================
TURBO
========================= */

function activateTurbo(boost) {

    turboActive = true;

    turboTime =
        TURBO_DURATION;

    score += 100;

    createParticles(

        boost.x,

        boost.y,

        "#22d3ee"

    );

    updateHUD();

}


/* =========================
COLLISION
========================= */

function checkCollision(a, b) {

    const padding = 7;

    return (

        a.x + padding <
        b.x +
        b.width -
        padding &&

        a.x +
        a.width -
        padding >
        b.x +
        padding &&

        a.y + padding <
        b.y +
        b.height -
        padding &&

        a.y +
        a.height -
        padding >
        b.y +
        padding

    );

}


function circleRectCollision(
    circle,
    rect
) {

    const closestX =
        Math.max(

            rect.x,

            Math.min(

                circle.x,

                rect.x +
                rect.width

            )

        );

    const closestY =
        Math.max(

            rect.y,

            Math.min(

                circle.y,

                rect.y +
                rect.height

            )

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


/* =========================
PARTICLES
========================= */

function createParticles(
    x,
    y,
    color
) {

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        particles.push({

            x,

            y,

            vx:
                (
                    Math.random() -
                    0.5
                ) * 300,

            vy:
                (
                    Math.random() -
                    0.5
                ) * 300,

            life: 0.6,

            maxLife: 0.6,

            size:
                2 +
                Math.random() * 4,

            color

        });

    }

}


function createExplosion(
    x,
    y
) {

    for (
        let i = 0;
        i < 45;
        i++
    ) {

        particles.push({

            x,

            y,

            vx:
                (
                    Math.random() -
                    0.5
                ) * 600,

            vy:
                (
                    Math.random() -
                    0.5
                ) * 600,

            life: 0.9,

            maxLife: 0.9,

            size:
                3 +
                Math.random() * 6,

            color:
                Math.random() < .5
                    ? "#ef4444"
                    : "#facc15"

        });

    }

}


function updateParticles(
    delta
) {

    for (
        let i =
            particles.length - 1;

        i >= 0;

        i--
    ) {

        const p =
            particles[i];

        p.x +=
            p.vx *
            delta;

        p.y +=
            p.vy *
            delta;

        p.vy +=
            200 *
            delta;

        p.life -=
            delta;


        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }

}


/* =========================
DRAW BACKGROUND
========================= */

function drawBackground() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* SKY */

    const sky =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );

    sky.addColorStop(
        0,
        "#070711"
    );

    sky.addColorStop(
        1,
        "#10101f"
    );

    ctx.fillStyle =
        sky;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /* ROAD */

    ctx.fillStyle =
        "#11111b";

    ctx.fillRect(

        road.left,

        0,

        road.width,

        height

    );


    /* ROAD GLOW */

    ctx.shadowColor =
        "rgba(139,92,246,.4)";

    ctx.shadowBlur = 25;

    ctx.strokeStyle =
        "rgba(139,92,246,.35)";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        road.left,
        0
    );

    ctx.lineTo(
        road.left,
        height
    );

    ctx.moveTo(
        road.right,
        0
    );

    ctx.lineTo(
        road.right,
        height
    );

    ctx.stroke();

    ctx.shadowBlur = 0;


    /* LANE MARKINGS */

    const laneWidth =
        road.width / 4;

    ctx.fillStyle =
        "rgba(255,255,255,.18)";

    for (
        let lane = 1;
        lane < 4;
        lane++
    ) {

        const x =
            road.left +
            lane * laneWidth;

        for (
            let y =
                -80 + roadOffset;

            y < height;

            y += 80
        ) {

            ctx.fillRect(
                x - 2,
                y,
                4,
                38
            );

        }

    }


    /* SPEED STREAKS */

    if (turboActive) {

        ctx.strokeStyle =
            "rgba(34,211,238,.25)";

        ctx.lineWidth = 2;

        for (
            let i = 0;
            i < 18;
            i++
        ) {

            const x =
                road.left +
                Math.random() *
                road.width;

            const y =
                Math.random() *
                height;

            ctx.beginPath();

            ctx.moveTo(
                x,
                y
            );

            ctx.lineTo(
                x,
                y + 35
            );

            ctx.stroke();

        }

    }

}


/* =========================
DRAW PLAYER
========================= */

function drawPlayer() {

    const x =
        player.x;

    const y =
        player.y;

    ctx.save();


    /* TURBO GLOW */

    ctx.shadowColor =
        turboActive
            ? "#22d3ee"
            : "#8b5cf6";

    ctx.shadowBlur =
        turboActive
            ? 35
            : 20;


    /* CAR BODY */

    const gradient =
        ctx.createLinearGradient(

            x,
            y,

            x +
            player.width,
            y

        );


    if (turboActive) {

        gradient.addColorStop(
            0,
            "#0891b2"
        );

        gradient.addColorStop(
            .5,
            "#67e8f9"
        );

        gradient.addColorStop(
            1,
            "#0891b2"
        );

    } else {

        gradient.addColorStop(
            0,
            "#6d28d9"
        );

        gradient.addColorStop(
            .5,
            "#a855f7"
        );

        gradient.addColorStop(
            1,
            "#6d28d9"
        );

    }


    ctx.fillStyle =
        gradient;

    ctx.beginPath();

    ctx.roundRect(

        x,
        y,

        player.width,
        player.height,

        12

    );

    ctx.fill();

    ctx.shadowBlur = 0;


    /* WINDSHIELD */

    ctx.fillStyle =
        "#172033";

    ctx.beginPath();

    ctx.roundRect(

        x + 8,
        y + 12,

        player.width - 16,
        19,

        7

    );

    ctx.fill();


    /* REFLECTION */

    ctx.fillStyle =
        "rgba(255,255,255,.2)";

    ctx.fillRect(

        x + 11,
        y + 15,

        player.width - 22,
        3

    );


    /* HEADLIGHTS */

    ctx.fillStyle =
        "#e0f2fe";

    ctx.fillRect(

        x + 5,
        y + 4,

        10,
        5

    );

    ctx.fillRect(

        x +
        player.width -
        15,

        y + 4,

        10,
        5

    );


    /* WHEELS */

    ctx.fillStyle =
        "#050509";

    ctx.fillRect(

        x - 4,
        y + 14,

        7,
        20

    );

    ctx.fillRect(

        x +
        player.width -
        3,

        y + 14,

        7,
        20

    );

    ctx.fillRect(

        x - 4,
        y + 48,

        7,
        18

    );

    ctx.fillRect(

        x +
        player.width -
        3,

        y + 48,

        7,
        18

    );


    /* TURBO FLAME */

    if (turboActive) {

        const flame =
            ctx.createLinearGradient(

                x +
                player.width / 2,

                y +
                player.height,

                x +
                player.width / 2,

                y +
                player.height +
                35

            );

        flame.addColorStop(
            0,
            "#ffffff"
        );

        flame.addColorStop(
            .3,
            "#22d3ee"
        );

        flame.addColorStop(
            1,
            "rgba(34,211,238,0)"
        );

        ctx.fillStyle =
            flame;

        ctx.beginPath();

        ctx.moveTo(

            x + 12,

            y +
            player.height -
            2

        );

        ctx.lineTo(

            x +
            player.width / 2,

            y +
            player.height +
            35

        );

        ctx.lineTo(

            x +
            player.width -
            12,

            y +
            player.height -
            2

        );

        ctx.closePath();

        ctx.fill();

    }

    ctx.restore();

}


/* =========================
DRAW ENEMY
========================= */

function drawEnemy(enemy) {

    ctx.save();

    ctx.shadowColor =
        enemy.color;

    ctx.shadowBlur = 12;

    ctx.fillStyle =
        enemy.color;

    ctx.beginPath();

    ctx.roundRect(

        enemy.x,
        enemy.y,

        enemy.width,
        enemy.height,

        10

    );

    ctx.fill();

    ctx.shadowBlur = 0;


    /* WINDOW */

    ctx.fillStyle =
        "#111827";

    ctx.beginPath();

    ctx.roundRect(

        enemy.x + 7,
        enemy.y + 13,

        enemy.width - 14,
        20,

        6

    );

    ctx.fill();


    /* LIGHTS */

    ctx.fillStyle =
        "#ffefef";

    ctx.fillRect(

        enemy.x + 5,
        enemy.y + 5,

        9,
        4

    );

    ctx.fillRect(

        enemy.x +
        enemy.width -
        14,

        enemy.y + 5,

        9,
        4

    );


    /* WHEELS */

    ctx.fillStyle =
        "#050509";

    ctx.fillRect(

        enemy.x - 3,
        enemy.y + 15,

        6,
        18

    );

    ctx.fillRect(

        enemy.x +
        enemy.width -
        3,

        enemy.y + 15,

        6,
        18

    );

    ctx.fillRect(

        enemy.x - 3,
        enemy.y + 46,

        6,
        18

    );

    ctx.fillRect(

        enemy.x +
        enemy.width -
        3,

        enemy.y + 46,

        6,
        18

    );

    ctx.restore();

}


/* =========================
DRAW COIN
========================= */

function drawCoin(coin) {

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


    const gradient =
        ctx.createRadialGradient(

            -3,
            -4,
            2,

            0,
            0,
            coin.radius

        );

    gradient.addColorStop(
        0,
        "#fff7a8"
    );

    gradient.addColorStop(
        .4,
        "#facc15"
    );

    gradient.addColorStop(
        1,
        "#d97706"
    );

    ctx.fillStyle =
        gradient;

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

    ctx.fillStyle =
        "#92400e";

    ctx.font =
        "bold 13px Arial";

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


/* =========================
DRAW TURBO
========================= */

function drawTurbo(boost) {

    ctx.save();

    ctx.translate(
        boost.x,
        boost.y
    );

    ctx.rotate(
        boost.rotation
    );

    ctx.shadowColor =
        "#22d3ee";

    ctx.shadowBlur = 30;

    ctx.strokeStyle =
        "rgba(34,211,238,.4)";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.arc(

        0,
        0,

        boost.radius + 6,

        0,
        Math.PI * 2

    );

    ctx.stroke();


    const gradient =
        ctx.createRadialGradient(

            -4,
            -4,
            2,

            0,
            0,
            boost.radius

        );

    gradient.addColorStop(
        0,
        "#ecfeff"
    );

    gradient.addColorStop(
        .4,
        "#67e8f9"
    );

    gradient.addColorStop(
        1,
        "#0891b2"
    );

    ctx.fillStyle =
        gradient;

    ctx.beginPath();

    ctx.arc(

        0,
        0,

        boost.radius,

        0,
        Math.PI * 2

    );

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle =
        "white";

    ctx.font =
        "bold 22px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        "⚡",
        0,
        1
    );

    ctx.restore();

}


/* =========================
DRAW PARTICLES
========================= */

function drawParticles() {

    particles.forEach(
        p => {

            ctx.globalAlpha =
                p.life /
                p.maxLife;

            ctx.fillStyle =
                p.color;

            ctx.beginPath();

            ctx.arc(

                p.x,
                p.y,

                p.size,

                0,
                Math.PI * 2

            );

            ctx.fill();

        }
    );

    ctx.globalAlpha = 1;

}


/* =========================
GAME LOOP
========================= */

function gameLoop(timestamp) {

    if (!gameRunning) {
        return;
    }

    const delta =
        Math.min(

            (
                timestamp -
                lastTime
            ) / 1000,

            0.05

        );

    lastTime =
        timestamp;

    updatePlayer(
        delta
    );

    updateGame(
        delta
    );

    drawBackground();

    enemies.forEach(
        drawEnemy
    );

    coins.forEach(
        drawCoin
    );

    boosts.forEach(
        drawTurbo
    );

    drawParticles();

    drawPlayer();


    if (gameRunning) {

        requestAnimationFrame(
            gameLoop
        );

    }

}


/* =========================
KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            event.key ===
                "ArrowLeft" ||
            key === "a"
        ) {

            leftPressed = true;

            event.preventDefault();

        }


        if (
            event.key ===
                "ArrowRight" ||
            key === "d"
        ) {

            rightPressed = true;

            event.preventDefault();

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            event.key ===
                "ArrowLeft" ||
            key === "a"
        ) {

            leftPressed = false;

        }


        if (
            event.key ===
                "ArrowRight" ||
            key === "d"
        ) {

            rightPressed = false;

        }

    }
);


/* =========================
DESKTOP HOLD BUTTONS
========================= */

function setupHoldButton(
    button,
    direction
) {

    const start =
        event => {

            event.preventDefault();

            if (
                direction ===
                "left"
            ) {

                leftPressed =
                    true;

            } else {

                rightPressed =
                    true;

            }

        };


    const stop =
        event => {

            event.preventDefault();

            if (
                direction ===
                "left"
            ) {

                leftPressed =
                    false;

            } else {

                rightPressed =
                    false;

            }

        };


    button.addEventListener(
        "pointerdown",
        start
    );

    button.addEventListener(
        "pointerup",
        stop
    );

    button.addEventListener(
        "pointerleave",
        stop
    );

    button.addEventListener(
        "pointercancel",
        stop
    );

}


setupHoldButton(
    leftButton,
    "left"
);

setupHoldButton(
    rightButton,
    "right"
);


/* =========================
VIRTUAL JOYSTICK
========================= */

const joystick =
    document.getElementById(
        "joystick"
    );

const joystickKnob =
    document.getElementById(
        "joystickKnob"
    );

let joystickActive =
    false;

let joystickPointerId =
    null;

let joystickX = 0;


/* RESET JOYSTICK */

function resetJoystick() {

    joystickActive =
        false;

    joystickPointerId =
        null;

    joystickX = 0;

    leftPressed =
        false;

    rightPressed =
        false;

    joystickKnob.style.transform =
        "translate(-50%, -50%)";

    joystick.classList.remove(
        "active"
    );

}


/* UPDATE JOYSTICK */

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
        clientX -
        centerX;

    let dy =
        clientY -
        centerY;


    const maxDistance =
        rect.width *
        0.28;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance >
        maxDistance
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


    /* Horizontal steering */

    joystickX =
        dx /
        maxDistance;


    /* DEAD ZONE */

    const deadZone =
        0.15;


    if (
        joystickX <
        -deadZone
    ) {

        leftPressed =
            true;

        rightPressed =
            false;

    }

    else if (
        joystickX >
        deadZone
    ) {

        rightPressed =
            true;

        leftPressed =
            false;

    }

    else {

        leftPressed =
            false;

        rightPressed =
            false;

    }


    joystickKnob.style.transform =
        `translate(
            calc(-50% + ${dx}px),
            calc(-50% + ${dy}px)
        )`;

}


/* =========================
JOYSTICK TOUCH START
========================= */

joystick.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        joystickActive =
            true;

        joystickPointerId =
            event.pointerId;

        joystick.classList.add(
            "active"
        );

        joystick.setPointerCapture(
            event.pointerId
        );

        updateJoystick(

            event.clientX,

            event.clientY

        );

    }
);


/* =========================
JOYSTICK MOVE
========================= */

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


/* =========================
JOYSTICK RELEASE
========================= */

joystick.addEventListener(
    "pointerup",
    event => {

        if (
            event.pointerId !==
            joystickPointerId
        ) {

            return;

        }

        resetJoystick();

    }
);


joystick.addEventListener(
    "pointercancel",
    event => {

        if (
            event.pointerId !==
            joystickPointerId
        ) {

            return;

        }

        resetJoystick();

    }
);


/* =========================
BUTTONS
========================= */

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    startGame
);


/* =========================
INITIALIZE
========================= */

resizeCanvas();

resetPlayer();

drawBackground();

drawPlayer();
