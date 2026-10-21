/* =========================================
   GAMEVAULT — SNAKE
   snake.js
   ========================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const statusElement = document.getElementById("status");

const gameOverScreen = document.getElementById("gameOver");
const finalScoreElement = document.getElementById("finalScore");

const restartButton = document.getElementById("restartBtn");
const playAgainButton = document.getElementById("playAgainBtn");

const mobileButtons = document.querySelectorAll(
    ".mobile-controls button"
);

/* =========================================
   GAME SETTINGS
   ========================================= */

const GRID_SIZE = 30;
const TILE_SIZE = canvas.width / GRID_SIZE;

const START_SPEED = 130;
const MIN_SPEED = 65;

const FOOD_COLOR = "#ff4d6d";
const SNAKE_HEAD_COLOR = "#39ff88";
const SNAKE_BODY_COLOR = "#20d879";

let snake = [];
let food = {};

let direction = {
    x: 1,
    y: 0
};

let nextDirection = {
    x: 1,
    y: 0
};

let score = 0;
let highScore = Number(
    localStorage.getItem("gamevault-snake-highscore") || 0
);

let gameSpeed = START_SPEED;
let gameTimer = null;

let gameRunning = false;
let gameOver = false;

let obstacles = [];

/* =========================================
   HIGH SCORE
   ========================================= */

highScoreElement.textContent = highScore;

/* =========================================
   START GAME
   ========================================= */

function startGame() {
    clearTimeout(gameTimer);

    snake = [
        { x: 15, y: 15 },
        { x: 14, y: 15 },
        { x: 13, y: 15 }
    ];

    direction = {
        x: 1,
        y: 0
    };

    nextDirection = {
        x: 1,
        y: 0
    };

    score = 0;
    gameSpeed = START_SPEED;

    gameRunning = true;
    gameOver = false;

    obstacles = [];

    scoreElement.textContent = score;
    statusElement.textContent = "Use WASD or Arrow Keys";

    gameOverScreen.classList.add("hidden");

    createFood();
    createInitialObstacles();

    draw();
    scheduleNextMove();
}

/* =========================================
   GAME LOOP
   ========================================= */

function scheduleNextMove() {
    if (!gameRunning) {
        return;
    }

    gameTimer = setTimeout(() => {
        update();
        draw();
        scheduleNextMove();
    }, gameSpeed);
}

function update() {
    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    /* Wall collision */
    if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
    ) {
        endGame();
        return;
    }

    /* Obstacle collision */
    if (isObstacle(head)) {
        endGame();
        return;
    }

    /* Snake collision */
    if (isSnakeCollision(head)) {
        endGame();
        return;
    }

    snake.unshift(head);

    /* Food */
    if (head.x === food.x && head.y === food.y) {
        eatFood();
    } else {
        snake.pop();
    }
}

/* =========================================
   FOOD
   ========================================= */

function createFood() {
    let position;

    do {
        position = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (
        isSnakeCollision(position) ||
        isObstacle(position)
    );

    food = position;
}

function eatFood() {
    score++;

    scoreElement.textContent = score;

    if (score > highScore) {
        highScore = score;

        highScoreElement.textContent = highScore;

        localStorage.setItem(
            "gamevault-snake-highscore",
            highScore
        );
    }

    /*
     * Increase speed gradually.
     */
    gameSpeed = Math.max(
        MIN_SPEED,
        START_SPEED - score * 3
    );

    /*
     * Add obstacles every 5 points.
     */
    if (score > 0 && score % 5 === 0) {
        createObstacle();
    }

    createFood();
}

/* =========================================
   OBSTACLES
   ========================================= */

function createInitialObstacles() {
    /*
     * Start with a few obstacles,
     * but keep them away from the snake.
     */
    for (let i = 0; i < 3; i++) {
        createObstacle();
    }
}

function createObstacle() {
    let position;
    let attempts = 0;

    do {
        position = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };

        attempts++;
    } while (
        (
            isSnakeCollision(position) ||
            isObstacle(position) ||
            (
                Math.abs(position.x - food.x) < 3 &&
                Math.abs(position.y - food.y) < 3
            )
        ) &&
        attempts < 100
    );

    if (attempts < 100) {
        obstacles.push(position);
    }
}

function isObstacle(position) {
    return obstacles.some(
        obstacle =>
            obstacle.x === position.x &&
            obstacle.y === position.y
    );
}

/* =========================================
   COLLISION
   ========================================= */

function isSnakeCollision(position) {
    return snake.some(
        segment =>
            segment.x === position.x &&
            segment.y === position.y
    );
}

/* =========================================
   DRAWING
   ========================================= */

function draw() {
    drawBackground();
    drawGrid();
    drawObstacles();
    drawFood();
    drawSnake();
}

/* =========================================
   BACKGROUND
   ========================================= */

function drawBackground() {
    const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
    );

    gradient.addColorStop(0, "#080b15");
    gradient.addColorStop(1, "#0c1020");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}

/* =========================================
   GRID
   ========================================= */

function drawGrid() {
    ctx.strokeStyle = "rgba(139, 92, 246, 0.055)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= GRID_SIZE; i++) {
        const position = i * TILE_SIZE;

        ctx.beginPath();
        ctx.moveTo(position, 0);
        ctx.lineTo(position, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, position);
        ctx.lineTo(canvas.width, position);
        ctx.stroke();
    }
}

/* =========================================
   SNAKE
   ========================================= */

function drawSnake() {
    snake.forEach((segment, index) => {
        const x = segment.x * TILE_SIZE;
        const y = segment.y * TILE_SIZE;

        const padding = index === 0 ? 2 : 3;
        const size = TILE_SIZE - padding * 2;

        ctx.save();

        if (index === 0) {
            ctx.shadowColor = SNAKE_HEAD_COLOR;
            ctx.shadowBlur = 15;

            ctx.fillStyle = SNAKE_HEAD_COLOR;
        } else {
            ctx.shadowColor = "rgba(57, 255, 136, 0.4)";
            ctx.shadowBlur = 8;

            ctx.fillStyle = SNAKE_BODY_COLOR;
        }

        roundRect(
            ctx,
            x + padding,
            y + padding,
            size,
            size,
            5
        );

        ctx.fill();

        ctx.restore();

        /*
         * Eyes on the head.
         */
        if (index === 0) {
            drawSnakeEyes(segment);
        }
    });
}

/* =========================================
   SNAKE EYES
   ========================================= */

function drawSnakeEyes(head) {
    const centerX = head.x * TILE_SIZE + TILE_SIZE / 2;
    const centerY = head.y * TILE_SIZE + TILE_SIZE / 2;

    let eyeOffsetX = 5;
    let eyeOffsetY = 5;

    if (direction.x === 1) {
        eyeOffsetX = 6;
        eyeOffsetY = 5;
    } else if (direction.x === -1) {
        eyeOffsetX = -6;
        eyeOffsetY = 5;
    } else if (direction.y === -1) {
        eyeOffsetX = 5;
        eyeOffsetY = -6;
    } else if (direction.y === 1) {
        eyeOffsetX = 5;
        eyeOffsetY = 6;
    }

    ctx.fillStyle = "#07110b";

    ctx.beginPath();

    ctx.arc(
        centerX + eyeOffsetX,
        centerY + eyeOffsetY,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

/* =========================================
   FOOD
   ========================================= */

function drawFood() {
    const centerX =
        food.x * TILE_SIZE + TILE_SIZE / 2;

    const centerY =
        food.y * TILE_SIZE + TILE_SIZE / 2;

    ctx.save();

    ctx.shadowColor = FOOD_COLOR;
    ctx.shadowBlur = 20;

    ctx.fillStyle = FOOD_COLOR;

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        TILE_SIZE * 0.28,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
     * Food highlight.
     */
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffd1da";

    ctx.beginPath();

    ctx.arc(
        centerX - 3,
        centerY - 3,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}

/* =========================================
   OBSTACLES
   ========================================= */

function drawObstacles() {
    obstacles.forEach(obstacle => {
        const x = obstacle.x * TILE_SIZE;
        const y = obstacle.y * TILE_SIZE;

        ctx.save();

        ctx.shadowColor = "rgba(139, 92, 246, 0.5)";
        ctx.shadowBlur = 10;

        const gradient = ctx.createLinearGradient(
            x,
            y,
            x + TILE_SIZE,
            y + TILE_SIZE
        );

        gradient.addColorStop(0, "#33206b");
        gradient.addColorStop(1, "#17152e");

        ctx.fillStyle = gradient;

        roundRect(
            ctx,
            x + 3,
            y + 3,
            TILE_SIZE - 6,
            TILE_SIZE - 6,
            5
        );

        ctx.fill();

        ctx.strokeStyle = "rgba(168, 85, 247, 0.45)";
        ctx.lineWidth = 1;

        ctx.stroke();

        ctx.restore();
    });
}

/* =========================================
   ROUNDED RECTANGLE
   ========================================= */

function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(
        radius,
        width / 2,
        height / 2
    );

    ctx.beginPath();

    ctx.moveTo(x + r, y);

    ctx.arcTo(
        x + width,
        y,
        x + width,
        y + height,
        r
    );

    ctx.arcTo(
        x + width,
        y + height,
        x,
        y + height,
        r
    );

    ctx.arcTo(
        x,
        y + height,
        x,
        y,
        r
    );

    ctx.arcTo(
        x,
        y,
        x + width,
        y,
        r
    );

    ctx.closePath();
}

/* =========================================
   GAME OVER
   ========================================= */

function endGame() {
    gameRunning = false;
    gameOver = true;

    clearTimeout(gameTimer);

    finalScoreElement.textContent = score;

    statusElement.textContent = "Game Over";

    gameOverScreen.classList.remove("hidden");

    /*
     * Keep the final board visible.
     */
    draw();
}

/* =========================================
   CHANGE DIRECTION
   ========================================= */

function changeDirection(newDirection) {
    if (!gameRunning) {
        return;
    }

    /*
     * Prevent instant 180° turns.
     */
    if (
        newDirection.x === -direction.x &&
        newDirection.y === -direction.y
    ) {
        return;
    }

    nextDirection = newDirection;
}

/* =========================================
   KEYBOARD CONTROLS
   ========================================= */

document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    const directions = {
        arrowup: { x: 0, y: -1 },
        w: { x: 0, y: -1 },

        arrowdown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },

        arrowleft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },

        arrowright: { x: 1, y: 0 },
        d: { x: 1, y: 0 }
    };

    if (directions[key]) {
        event.preventDefault();
        changeDirection(directions[key]);
    }

    /*
     * Press Space to restart after game over.
     */
    if (key === " " && gameOver) {
        event.preventDefault();
        startGame();
    }
});

/* =========================================
   MOBILE CONTROLS
   ========================================= */

mobileButtons.forEach(button => {
    button.addEventListener("pointerdown", event => {
        event.preventDefault();

        const directionName =
            button.dataset.direction;

        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };

        if (directions[directionName]) {
            changeDirection(
                directions[directionName]
            );
        }
    });
});

/* =========================================
   BUTTONS
   ========================================= */

restartButton.addEventListener(
    "click",
    startGame
);

playAgainButton.addEventListener(
    "click",
    startGame
);

/* =========================================
   PREVENT MOBILE SCROLLING
   ========================================= */

document.addEventListener(
    "touchmove",
    event => {
        if (gameRunning) {
            event.preventDefault();
        }
    },
    { passive: false }
);

/* =========================================
   START
   ========================================= */

startGame();