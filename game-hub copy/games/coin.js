const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOver = document.getElementById("gameOver");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const scoreElement = document.getElementById("score");
const comboElement = document.getElementById("combo");
const timeElement = document.getElementById("time");
const bestElement = document.getElementById("best");

const finalScoreElement = document.getElementById("finalScore");
const finalComboElement = document.getElementById("finalCombo");
const finalCoinsElement = document.getElementById("finalCoins");

const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");


/* =========================
   SPEED BOOST
========================= */

let speedBoostActive = false;
let speedBoostTimer = 0;

const NORMAL_SPEED = 480;
const BOOST_SPEED = 850;
const BOOST_DURATION = 5;


/* =========================
   CANVAS
========================= */

let width = 0;
let height = 0;

function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    width = rect.width;
    height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    if (!gameRunning) {
        resetPlayer();
        drawBackground();
        drawPlayer();
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
let coinsCaught = 0;

let combo = 0;
let bestCombo = 0;

let time = 45;

let gameRunning = false;

let lastTime = 0;
let spawnTimer = 0;

let coins = [];
let particles = [];

let leftPressed = false;
let rightPressed = false;

let timerInterval = null;


/* =========================
   PLAYER
========================= */

const player = {

    x: 0,

    y: 0,

    width: 110,

    height: 28,

    speed: NORMAL_SPEED

};


function resetPlayer() {

    player.x =
        width / 2 -
        player.width / 2;

    player.y =
        height - 65;

    player.speed =
        NORMAL_SPEED;
}


/* =========================
   HIGH SCORE
========================= */

let bestScore =
    Number(
        localStorage.getItem(
            "coinCatcherBest"
        )
    ) || 0;

bestElement.textContent =
    bestScore.toLocaleString();


/* =========================
   START GAME
========================= */

function startGame() {

    clearInterval(timerInterval);

    score = 0;

    coinsCaught = 0;

    combo = 0;

    bestCombo = 0;

    time = 45;

    coins = [];

    particles = [];

    gameRunning = true;

    spawnTimer = 0;

    speedBoostActive = false;

    speedBoostTimer = 0;

    player.speed =
        NORMAL_SPEED;

    resetPlayer();

    startScreen.style.display =
        "none";

    gameOver.style.display =
        "none";

    updateHUD();

    lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );


    timerInterval =
        setInterval(() => {

            if (!gameRunning) return;

            time--;

            time =
                Math.max(
                    0,
                    time
                );

            updateHUD();

            if (time <= 0) {

                endGame();

            }

        }, 1000);
}


/* =========================
   END GAME
========================= */

function endGame() {

    if (!gameRunning) return;

    gameRunning = false;

    clearInterval(
        timerInterval
    );

    speedBoostActive = false;

    player.speed =
        NORMAL_SPEED;

    finalScoreElement.textContent =
        score.toLocaleString();

    finalComboElement.textContent =
        "x" +
        Math.max(
            bestCombo,
            1
        );

    finalCoinsElement.textContent =
        coinsCaught;


    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "coinCatcherBest",
            bestScore
        );

        bestElement.textContent =
            bestScore.toLocaleString();
    }


    gameOver.style.display =
        "flex";
}


/* =========================
   HUD
========================= */

function updateHUD() {

    scoreElement.textContent =
        score.toLocaleString();

    comboElement.textContent =
        "x" +
        Math.max(
            combo,
            1
        );

    timeElement.textContent =
        time;

    bestElement.textContent =
        bestScore.toLocaleString();
}


/* =========================
   SPAWN OBJECT
========================= */

function spawnCoin() {

    const radius =
        14 +
        Math.random() * 5;


    /*
       10% chance of a speed boost.
    */

    const isBoost =
        Math.random() <
        0.10 &&
        time < 40;


    const coin = {

        x:
            radius +
            Math.random() *
            (width -
                radius * 2),

        y:
            -radius,

        radius,

        speed:
            150 +
            Math.random() * 100 +
            (45 - time) * 2,

        rotation:
            Math.random() *
            Math.PI * 2,

        rotationSpeed:
            (Math.random() - .5) * 5,

        type:
            isBoost
                ? "boost"
                : "coin"

    };


    coins.push(coin);
}


/* =========================
   UPDATE COINS
========================= */

function updateCoins(delta) {

    spawnTimer += delta;


    const spawnRate =
        Math.max(
            0.25,
            0.65 -
            (45 - time) *
            0.006
        );


    if (
        spawnTimer >=
        spawnRate
    ) {

        spawnTimer = 0;

        spawnCoin();


        /*
           Extra coins later in
           the game.
        */

        if (
            time < 25 &&
            Math.random() < 0.18
        ) {

            spawnCoin();

        }
    }


    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coins[i];


        coin.y +=
            coin.speed *
            delta;


        coin.rotation +=
            coin.rotationSpeed *
            delta;


        /* =========================
           COLLISION
        ========================= */

        const caught =

            coin.y +
                coin.radius >=
                player.y &&

            coin.y -
                coin.radius <=
                player.y +
                player.height &&

            coin.x +
                coin.radius >=
                player.x &&

            coin.x -
                coin.radius <=
                player.x +
                player.width;


        if (caught) {

            if (
                coin.type ===
                "boost"
            ) {

                activateSpeedBoost(
                    coin
                );

            } else {

                catchCoin(
                    coin
                );

            }


            coins.splice(
                i,
                1
            );

            continue;
        }


        /* =========================
           MISSED COIN
        ========================= */

        if (
            coin.y -
                coin.radius >
                height
        ) {

            /*
               Only normal coins
               reset combo.
            */

            if (
                coin.type ===
                "coin"
            ) {

                combo = 0;

                updateHUD();

            }


            coins.splice(
                i,
                1
            );
        }
    }
}


/* =========================
   CATCH COIN
========================= */

function catchCoin(coin) {

    coinsCaught++;

    combo++;


    bestCombo =
        Math.max(
            bestCombo,
            combo
        );


    const multiplier =
        Math.min(
            combo,
            10
        );


    const points =
        10 *
        multiplier;


    score += points;


    createParticles(
        coin.x,
        coin.y,
        "#facc15"
    );


    updateHUD();
}


/* =========================
   SPEED BOOST
========================= */

function activateSpeedBoost(
    coin
) {

    speedBoostActive =
        true;

    speedBoostTimer =
        BOOST_DURATION;


    player.speed =
        BOOST_SPEED;


    score += 50;


    createParticles(
        coin.x,
        coin.y,
        "#c084fc"
    );


    updateHUD();
}


/* =========================
   UPDATE BOOST
========================= */

function updateSpeedBoost(
    delta
) {

    if (!speedBoostActive) {
        return;
    }


    speedBoostTimer -=
        delta;


    if (
        speedBoostTimer <=
        0
    ) {

        speedBoostTimer = 0;

        speedBoostActive =
            false;

        player.speed =
            NORMAL_SPEED;
    }
}


/* =========================
   PLAYER
========================= */

function updatePlayer(delta) {

    if (leftPressed) {

        player.x -=
            player.speed *
            delta;

    }


    if (rightPressed) {

        player.x +=
            player.speed *
            delta;

    }


    player.x =
        Math.max(
            0,
            Math.min(
                width -
                    player.width,
                player.x
            )
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
        i < 10;
        i++
    ) {

        particles.push({

            x,

            y,

            vx:
                (Math.random() - .5) *
                180,

            vy:
                (Math.random() - .5) *
                180,

            life: 0.5,

            maxLife: 0.5,

            size:
                2 +
                Math.random() * 3,

            color

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
            300 *
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
   BACKGROUND
========================= */

function drawBackground() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* GRID */

    ctx.strokeStyle =
        "rgba(255,255,255,.025)";

    ctx.lineWidth = 1;


    const gridSize = 45;


    for (
        let x = 0;
        x < width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            height
        );

        ctx.stroke();
    }


    for (
        let y = 0;
        y < height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            width,
            y
        );

        ctx.stroke();
    }


    /* PURPLE GLOW */

    const gradient =
        ctx.createRadialGradient(
            width / 2,
            height,
            10,
            width / 2,
            height,
            height * .7
        );


    gradient.addColorStop(
        0,
        "rgba(139,92,246,.14)"
    );

    gradient.addColorStop(
        1,
        "rgba(139,92,246,0)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );
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


    /* =========================
       SPEED BOOST
    ========================= */

    if (
        coin.type ===
        "boost"
    ) {

        ctx.shadowColor =
            "rgba(168,85,247,.95)";

        ctx.shadowBlur = 30;


        /* OUTER RING */

        ctx.strokeStyle =
            "rgba(192,132,252,.45)";

        ctx.lineWidth = 4;


        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius + 6,
            0,
            Math.PI * 2
        );

        ctx.stroke();


        /* BOOST CIRCLE */

        const boostGradient =
            ctx.createRadialGradient(
                -4,
                -5,
                2,
                0,
                0,
                coin.radius
            );


        boostGradient.addColorStop(
            0,
            "#f3e8ff"
        );

        boostGradient.addColorStop(
            .4,
            "#c084fc"
        );

        boostGradient.addColorStop(
            1,
            "#7c3aed"
        );


        ctx.fillStyle =
            boostGradient;


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
            "white";


        ctx.font =
            `bold ${
                coin.radius * 1.3
            }px Arial`;


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

        return;
    }


    /* =========================
       NORMAL COIN
    ========================= */

    ctx.shadowColor =
        "rgba(250,204,21,.8)";

    ctx.shadowBlur = 20;


    const gradient =
        ctx.createRadialGradient(
            -4,
            -5,
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
        .35,
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


    ctx.strokeStyle =
        "#fde68a";

    ctx.lineWidth = 2;

    ctx.stroke();


    /* DOLLAR */

    ctx.fillStyle =
        "#92400e";

    ctx.font =
        `bold ${
            coin.radius
        }px Arial`;

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
   DRAW PLAYER
========================= */

function drawPlayer() {

    const x = player.x;

    const y = player.y;


    ctx.save();


    /* BOOST GLOW */

    if (
        speedBoostActive
    ) {

        ctx.shadowColor =
            "rgba(168,85,247,.95)";

        ctx.shadowBlur = 35;

    } else {

        ctx.shadowColor =
            "rgba(139,92,246,.7)";

        ctx.shadowBlur = 25;

    }


    /* BASKET */

    const gradient =
        ctx.createLinearGradient(
            x,
            y,
            x,
            y +
                player.height
        );


    gradient.addColorStop(
        0,
        "#a855f7"
    );

    gradient.addColorStop(
        1,
        "#6d28d9"
    );


    ctx.fillStyle =
        gradient;


    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        player.width,
        player.height,
        8
    );

    ctx.fill();


    ctx.shadowBlur = 0;


    /* RIM */

    ctx.fillStyle =
        "#c084fc";


    ctx.fillRect(
        x - 5,
        y,
        player.width + 10,
        7
    );


    /* INNER */

    ctx.fillStyle =
        "rgba(0,0,0,.25)";


    ctx.fillRect(
        x + 7,
        y + 10,
        player.width - 14,
        13
    );


    /* HIGHLIGHT */

    ctx.fillStyle =
        "rgba(255,255,255,.18)";


    ctx.fillRect(
        x + 10,
        y + 3,
        player.width - 20,
        3
    );


    /* BOOST LABEL */

    if (
        speedBoostActive
    ) {

        ctx.fillStyle =
            "#c084fc";

        ctx.font =
            "bold 13px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "bottom";


        ctx.fillText(
            `⚡ SPEED ${Math.ceil(
                speedBoostTimer
            )}s`,
            x +
                player.width / 2,
            y - 10
        );
    }


    ctx.restore();
}


/* =========================
   DRAW PARTICLES
========================= */

function drawParticles() {

    particles.forEach(
        p => {

            const alpha =
                p.life /
                p.maxLife;


            ctx.globalAlpha =
                alpha;


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

function gameLoop(
    timestamp
) {

    if (!gameRunning) {
        return;
    }


    const delta =
        Math.min(
            (timestamp -
                lastTime) /
                1000,
            0.05
        );


    lastTime =
        timestamp;


    updatePlayer(
        delta
    );

    updateCoins(
        delta
    );

    updateParticles(
        delta
    );

    updateSpeedBoost(
        delta
    );


    drawBackground();

    coins.forEach(
        drawCoin
    );

    drawParticles();

    drawPlayer();


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
                "ArrowLeft" ||
            event.key.toLowerCase() ===
                "a"
        ) {

            leftPressed = true;

            event.preventDefault();
        }


        if (
            event.key ===
                "ArrowRight" ||
            event.key.toLowerCase() ===
                "d"
        ) {

            rightPressed = true;

            event.preventDefault();
        }
    }
);


document.addEventListener(
    "keyup",
    event => {

        if (
            event.key ===
                "ArrowLeft" ||
            event.key.toLowerCase() ===
                "a"
        ) {

            leftPressed = false;
        }


        if (
            event.key ===
                "ArrowRight" ||
            event.key.toLowerCase() ===
                "d"
        ) {

            rightPressed = false;
        }
    }
);


/* =========================
   MOBILE CONTROLS
========================= */

function holdButton(
    button,
    direction
) {

    const start = event => {

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


    const stop = event => {

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


holdButton(
    leftButton,
    "left"
);

holdButton(
    rightButton,
    "right"
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
