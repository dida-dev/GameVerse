const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================
   HTML
========================= */

const startScreen =
    document.getElementById("startScreen");

const gameOver =
    document.getElementById("gameOver");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const scoreElement =
    document.getElementById("score");

const levelElement =
    document.getElementById("level");

const livesElement =
    document.getElementById("lives");

const bestElement =
    document.getElementById("best");

const finalScoreElement =
    document.getElementById("finalScore");

const finalLevelElement =
    document.getElementById("finalLevel");

const finalBlocksElement =
    document.getElementById("finalBlocks");

const gameOverTitle =
    document.getElementById("gameOverTitle");

const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");


/* =========================
   CANVAS
========================= */

let width = 0;
let height = 0;

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    width = rect.width;
    height = rect.height;

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

    if (!gameRunning) {

        drawBackground();

        drawPaddle();

        drawBall();

        drawBlocks();
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

let level = 1;

let lives = 3;

let blocksBroken = 0;

let gameRunning = false;

let gameWon = false;

let lastTime = 0;

let animationId = null;


/* =========================
   CONTROLS
========================= */

let leftPressed = false;

let rightPressed = false;


/* =========================
   HIGH SCORE
========================= */

let bestScore =
    Number(
        localStorage.getItem(
            "blockBreakerBest"
        )
    ) || 0;

bestElement.textContent =
    bestScore.toLocaleString();


/* =========================
   PADDLE
========================= */

const paddle = {

    x: 0,

    y: 0,

    width: 125,

    height: 16,

    speed: 620

};


function resetPaddle() {

    paddle.x =
        width / 2 -
        paddle.width / 2;

    paddle.y =
        height - 45;
}


/* =========================
   BALL
========================= */

const ball = {

    x: 0,

    y: 0,

    radius: 9,

    speed: 390,

    dx: 0,

    dy: 0

};


function resetBall() {

    ball.x =
        width / 2;

    ball.y =
        paddle.y -
        ball.radius -
        3;


    ball.speed =
        390 +
        (level - 1) * 35;


    const direction =
        Math.random() < .5
            ? -1
            : 1;


    ball.dx =
        direction *
        ball.speed *
        .65;


    ball.dy =
        -ball.speed *
        .76;


    normalizeBallSpeed();
}


function normalizeBallSpeed() {

    const length =
        Math.sqrt(
            ball.dx * ball.dx +
            ball.dy * ball.dy
        );

    if (!length) {
        return;
    }

    ball.dx =
        (ball.dx / length) *
        ball.speed;

    ball.dy =
        (ball.dy / length) *
        ball.speed;
}


/* =========================
   BLOCKS
========================= */

let blocks = [];

const blockColors = [
    "#a855f7",
    "#8b5cf6",
    "#6366f1",
    "#3b82f6",
    "#06b6d4",
    "#14b8a6",
    "#22c55e"
];


function createBlocks() {

    blocks = [];


    const rows =
        Math.min(
            4 + level,
            8
        );


    const columns =
        Math.min(
            7,
            Math.max(
                5,
                Math.floor(
                    width / 100
                )
            )
        );


    const gap = 8;

    const sidePadding = 25;

    const totalWidth =
        width -
        sidePadding * 2;


    const blockWidth =
        (
            totalWidth -
            gap * (columns - 1)
        ) /
        columns;


    const blockHeight = 25;


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            blocks.push({

                x:
                    sidePadding +
                    column *
                    (blockWidth + gap),

                y:
                    45 +
                    row *
                    (blockHeight + gap),

                width:
                    blockWidth,

                height:
                    blockHeight,

                color:
                    blockColors[
                        row %
                        blockColors.length
                    ],

                alive: true

            });
        }
    }
}


/* =========================
   POWER-UPS
========================= */

let powerUps = [];


/*
   Power-ups:

   widen  = wider paddle
   slow   = slow ball
   score  = bonus points
*/

function spawnPowerUp(
    x,
    y
) {

    if (
        Math.random() >
        0.14
    ) {
        return;
    }


    const types = [
        "widen",
        "slow",
        "score"
    ];


    powerUps.push({

        x,

        y,

        width: 26,

        height: 26,

        speed: 130,

        type:
            types[
                Math.floor(
                    Math.random() *
                    types.length
                )
            ]

    });
}


function updatePowerUps(delta) {

    for (
        let i =
            powerUps.length - 1;
        i >= 0;
        i--
    ) {

        const powerUp =
            powerUps[i];


        powerUp.y +=
            powerUp.speed *
            delta;


        const caught =

            powerUp.y +
                powerUp.height >=
                paddle.y &&

            powerUp.y <=
                paddle.y +
                paddle.height &&

            powerUp.x +
                powerUp.width >=
                paddle.x &&

            powerUp.x <=
                paddle.x +
                paddle.width;


        if (caught) {

            applyPowerUp(
                powerUp
            );

            powerUps.splice(
                i,
                1
            );

            continue;
        }


        if (
            powerUp.y >
            height
        ) {

            powerUps.splice(
                i,
                1
            );
        }
    }
}


function applyPowerUp(
    powerUp
) {

    if (
        powerUp.type ===
        "widen"
    ) {

        paddle.width = 180;

        setTimeout(() => {

            paddle.width = 125;

        }, 7000);
    }


    if (
        powerUp.type ===
        "slow"
    ) {

        ball.speed *= .7;

        normalizeBallSpeed();

        setTimeout(() => {

            ball.speed =
                390 +
                (level - 1) *
                35;

            normalizeBallSpeed();

        }, 5000);
    }


    if (
        powerUp.type ===
        "score"
    ) {

        score += 250;

        updateHUD();
    }
}


/* =========================
   START GAME
========================= */

function startGame() {

    cancelAnimationFrame(
        animationId
    );


    score = 0;

    level = 1;

    lives = 3;

    blocksBroken = 0;

    gameRunning = true;

    gameWon = false;

    powerUps = [];


    startScreen.style.display =
        "none";

    gameOver.style.display =
        "none";


    resetPaddle();

    createBlocks();

    resetBall();

    updateHUD();


    lastTime =
        performance.now();


    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================
   NEXT LEVEL
========================= */

function nextLevel() {

    level++;

    powerUps = [];

    paddle.width = 125;

    createBlocks();

    resetPaddle();

    resetBall();

    updateHUD();
}


/* =========================
   LOSE LIFE
========================= */

function loseLife() {

    lives--;

    updateHUD();


    if (lives <= 0) {

        endGame(false);

        return;
    }


    resetPaddle();

    resetBall();
}


/* =========================
   END GAME
========================= */

function endGame(won) {

    if (!gameRunning) {
        return;
    }


    gameRunning = false;

    gameWon = won;


    cancelAnimationFrame(
        animationId
    );


    if (
        score >
        bestScore
    ) {

        bestScore =
            score;

        localStorage.setItem(
            "blockBreakerBest",
            bestScore
        );
    }


    bestElement.textContent =
        bestScore.toLocaleString();


    finalScoreElement.textContent =
        score.toLocaleString();

    finalLevelElement.textContent =
        level;

    finalBlocksElement.textContent =
        blocksBroken;


    gameOverTitle.textContent =
        won
            ? "YOU WIN!"
            : "GAME OVER";


    gameOver.style.display =
        "flex";
}


/* =========================
   UPDATE HUD
========================= */

function updateHUD() {

    scoreElement.textContent =
        score.toLocaleString();

    levelElement.textContent =
        level;

    livesElement.textContent =
        "❤️".repeat(lives) +
        "🖤".repeat(
            Math.max(
                0,
                3 - lives
            )
        );

    bestElement.textContent =
        bestScore.toLocaleString();
}


/* =========================
   UPDATE PADDLE
========================= */

function updatePaddle(delta) {

    if (leftPressed) {

        paddle.x -=
            paddle.speed *
            delta;
    }


    if (rightPressed) {

        paddle.x +=
            paddle.speed *
            delta;
    }


    paddle.x =
        Math.max(
            0,
            Math.min(
                width -
                    paddle.width,
                paddle.x
            )
        );
}


/* =========================
   UPDATE BALL
========================= */

function updateBall(delta) {

    ball.x +=
        ball.dx *
        delta;

    ball.y +=
        ball.dy *
        delta;


    /* LEFT / RIGHT */

    if (
        ball.x -
            ball.radius <=
        0
    ) {

        ball.x =
            ball.radius;

        ball.dx =
            Math.abs(
                ball.dx
            );
    }


    if (
        ball.x +
            ball.radius >=
        width
    ) {

        ball.x =
            width -
            ball.radius;

        ball.dx =
            -Math.abs(
                ball.dx
            );
    }


    /* TOP */

    if (
        ball.y -
            ball.radius <=
        0
    ) {

        ball.y =
            ball.radius;

        ball.dy =
            Math.abs(
                ball.dy
            );
    }


    /* PADDLE */

    if (
        ball.dy > 0 &&

        ball.y +
            ball.radius >=
            paddle.y &&

        ball.y -
            ball.radius <=
            paddle.y +
            paddle.height &&

        ball.x >=
            paddle.x &&

        ball.x <=
            paddle.x +
            paddle.width
    ) {

        ball.y =
            paddle.y -
            ball.radius;


        /*
           Change angle based
           on where the ball
           hits the paddle.
        */

        const hitPosition =
            (
                ball.x -
                (
                    paddle.x +
                    paddle.width / 2
                )
            ) /
            (
                paddle.width / 2
            );


        const maxAngle =
            Math.PI * .42;


        const angle =
            hitPosition *
            maxAngle;


        ball.dx =
            ball.speed *
            Math.sin(angle);


        ball.dy =
            -Math.abs(
                ball.speed *
                Math.cos(angle)
            );
    }


    /* BALL MISSED */

    if (
        ball.y -
            ball.radius >
        height
    ) {

        loseLife();

        return;
    }


    checkBlockCollisions();
}


/* =========================
   BLOCK COLLISION
========================= */

function checkBlockCollisions() {

    for (
        let i = 0;
        i < blocks.length;
        i++
    ) {

        const block =
            blocks[i];


        if (!block.alive) {
            continue;
        }


        const collision =

            ball.x +
                ball.radius >=
                block.x &&

            ball.x -
                ball.radius <=
                block.x +
                block.width &&

            ball.y +
                ball.radius >=
                block.y &&

            ball.y -
                ball.radius <=
                block.y +
                block.height;


        if (!collision) {
            continue;
        }


        block.alive = false;


        score += 100;

        blocksBroken++;


        spawnPowerUp(
            block.x +
                block.width / 2,
            block.y +
                block.height / 2
        );


        updateHUD();


        /*
           Determine which direction
           the ball should bounce.
        */

        const previousX =
            ball.x -
            ball.dx * .016;

        const previousY =
            ball.y -
            ball.dy * .016;


        if (
            previousY +
                ball.radius <=
            block.y ||

            previousY -
                ball.radius >=
            block.y +
                block.height
        ) {

            ball.dy *= -1;

        } else {

            ball.dx *= -1;

        }


        /* LEVEL COMPLETE */

        const remaining =
            blocks.some(
                b => b.alive
            );


        if (!remaining) {

            if (
                level >= 5
            ) {

                endGame(true);

            } else {

                nextLevel();

            }

        }


        break;
    }
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

            .025
        );


    lastTime =
        timestamp;


    updatePaddle(delta);

    updateBall(delta);

    updatePowerUps(delta);


    drawBackground();

    drawBlocks();

    drawPowerUps();

    drawPaddle();

    drawBall();


    animationId =
        requestAnimationFrame(
            gameLoop
        );
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


    /* Grid */

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


    /* Purple glow */

    const gradient =
        ctx.createRadialGradient(
            width / 2,
            height,
            20,
            width / 2,
            height,
            height * .8
        );


    gradient.addColorStop(
        0,
        "rgba(139,92,246,.15)"
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
   DRAW BLOCKS
========================= */

function drawBlocks() {

    blocks.forEach(
        block => {

            if (!block.alive) {
                return;
            }


            ctx.save();


            ctx.shadowColor =
                block.color;

            ctx.shadowBlur = 12;


            const gradient =
                ctx.createLinearGradient(
                    block.x,
                    block.y,
                    block.x,
                    block.y +
                        block.height
                );


            gradient.addColorStop(
                0,
                block.color
            );


            gradient.addColorStop(
                1,
                "#151526"
            );


            ctx.fillStyle =
                gradient;


            ctx.beginPath();


            ctx.roundRect(
                block.x,
                block.y,
                block.width,
                block.height,
                6
            );


            ctx.fill();


            ctx.shadowBlur = 0;


            ctx.fillStyle =
                "rgba(255,255,255,.22)";


            ctx.fillRect(
                block.x + 5,
                block.y + 4,
                block.width - 10,
                3
            );


            ctx.restore();
        }
    );
}


/* =========================
   DRAW PADDLE
========================= */

function drawPaddle() {

    ctx.save();


    ctx.shadowColor =
        "rgba(168,85,247,.9)";

    ctx.shadowBlur = 25;


    const gradient =
        ctx.createLinearGradient(
            paddle.x,
            paddle.y,
            paddle.x,
            paddle.y +
                paddle.height
        );


    gradient.addColorStop(
        0,
        "#c084fc"
    );


    gradient.addColorStop(
        1,
        "#7c3aed"
    );


    ctx.fillStyle =
        gradient;


    ctx.beginPath();


    ctx.roundRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height,
        8
    );


    ctx.fill();


    ctx.shadowBlur = 0;


    ctx.fillStyle =
        "rgba(255,255,255,.35)";


    ctx.fillRect(
        paddle.x + 12,
        paddle.y + 3,
        paddle.width - 24,
        3
    );


    ctx.restore();
}


/* =========================
   DRAW BALL
========================= */

function drawBall() {

    ctx.save();


    ctx.shadowColor =
        "#facc15";

    ctx.shadowBlur = 22;


    const gradient =
        ctx.createRadialGradient(
            ball.x - 3,
            ball.y - 3,
            2,
            ball.x,
            ball.y,
            ball.radius
        );


    gradient.addColorStop(
        0,
        "#fff7a8"
    );


    gradient.addColorStop(
        .45,
        "#facc15"
    );


    gradient.addColorStop(
        1,
        "#f59e0b"
    );


    ctx.fillStyle =
        gradient;


    ctx.beginPath();


    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.restore();
}


/* =========================
   DRAW POWER-UPS
========================= */

function drawPowerUps() {

    powerUps.forEach(
        powerUp => {

            let color =
                "#c084fc";

            let icon =
                "⚡";


            if (
                powerUp.type ===
                "widen"
            ) {

                color =
                    "#22c55e";

                icon =
                    "↔";

            } else if (
                powerUp.type ===
                "slow"
            ) {

                color =
                    "#38bdf8";

                icon =
                    "⏱";

            } else if (
                powerUp.type ===
                "score"
            ) {

                color =
                    "#facc15";

                icon =
                    "+";
            }


            ctx.save();


            ctx.shadowColor =
                color;

            ctx.shadowBlur = 20;


            ctx.fillStyle =
                color;


            ctx.beginPath();


            ctx.roundRect(
                powerUp.x,
                powerUp.y,
                powerUp.width,
                powerUp.height,
                7
            );


            ctx.fill();


            ctx.shadowBlur = 0;


            ctx.fillStyle =
                "white";


            ctx.font =
                "bold 17px Arial";


            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";


            ctx.fillText(
                icon,
                powerUp.x +
                    powerUp.width / 2,
                powerUp.y +
                    powerUp.height / 2
            );


            ctx.restore();
        }
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

    const start =
        event => {

            event.preventDefault();

            if (
                direction ===
                "left"
            ) {

                leftPressed = true;

            } else {

                rightPressed = true;
            }
        };


    const stop =
        event => {

            event.preventDefault();

            if (
                direction ===
                "left"
            ) {

                leftPressed = false;

            } else {

                rightPressed = false;
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

resetPaddle();

resetBall();

drawBackground();

drawBlocks();

drawPaddle();

drawBall();
