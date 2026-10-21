/* =========================================
   GAMEVAULT — NEON MEMORY
   memory.js
   ========================================= */

const tiles = document.querySelectorAll(".memory-tile");

const startBtn = document.getElementById("startBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const statusText = document.getElementById("status");

const levelText = document.getElementById("level");
const bestText = document.getElementById("best");

const sequenceCountText =
    document.getElementById("sequenceCount");

const correctCountText =
    document.getElementById("correctCount");

const scoreText =
    document.getElementById("score");

const gameOverScreen =
    document.getElementById("gameOver");

const finalLevelText =
    document.getElementById("finalLevel");

const finalScoreText =
    document.getElementById("finalScore");


/* =========================================
   GAME SETTINGS
   ========================================= */

const TILE_COUNT = 16;

const START_FLASH_TIME = 500;

const MIN_FLASH_TIME = 180;

const START_DELAY = 650;

const MAX_LEVEL = 100;


/* =========================================
   GAME STATE
   ========================================= */

let sequence = [];

let playerSequence = [];

let level = 1;

let score = 0;

let correctCount = 0;

let bestLevel = Number(
    localStorage.getItem(
        "gamevault-memory-best"
    ) || 0
);

let acceptingInput = false;

let gameRunning = false;

let sequenceToken = 0;


/* =========================================
   INITIAL UI
   ========================================= */

bestText.textContent = bestLevel;

updateUI();


/* =========================================
   START GAME
   ========================================= */

async function startGame() {

    sequenceToken++;

    const currentToken = sequenceToken;

    gameRunning = true;

    acceptingInput = false;

    sequence = [];

    playerSequence = [];

    level = 1;

    score = 0;

    correctCount = 0;

    gameOverScreen.classList.add("hidden");

    startBtn.textContent = "Restart";

    statusText.textContent =
        "Get ready...";

    clearTiles();

    updateUI();

    await sleep(START_DELAY);

    if (currentToken !== sequenceToken) {
        return;
    }

    await startLevel(currentToken);
}


/* =========================================
   START LEVEL
   ========================================= */

async function startLevel(token) {

    if (!gameRunning || token !== sequenceToken) {
        return;
    }

    acceptingInput = false;

    playerSequence = [];

    /*
     * Add one new random tile.
     */
    sequence.push(
        randomTile()
    );

    sequenceCountText.textContent =
        sequence.length;

    levelText.textContent =
        level;

    statusText.textContent =
        "Watch carefully...";

    clearTiles();

    await sleep(450);

    if (token !== sequenceToken) {
        return;
    }

    await playSequence(token);

    if (token !== sequenceToken) {
        return;
    }

    acceptingInput = true;

    statusText.textContent =
        "Your turn!";

    updateUI();
}


/* =========================================
   PLAY SEQUENCE
   ========================================= */

async function playSequence(token) {

    const flashTime = Math.max(
        MIN_FLASH_TIME,
        START_FLASH_TIME - (level - 1) * 15
    );

    /*
     * Brief pause before sequence.
     */
    await sleep(250);

    for (const index of sequence) {

        if (token !== sequenceToken) {
            return;
        }

        await flashTile(
            index,
            flashTime
        );

        await sleep(
            Math.max(70, flashTime * 0.35)
        );
    }
}


/* =========================================
   FLASH TILE
   ========================================= */

function flashTile(index, duration) {

    return new Promise(resolve => {

        const tile = tiles[index];

        tile.classList.add("active");

        setTimeout(() => {

            tile.classList.remove("active");

            resolve();

        }, duration);
    });
}


/* =========================================
   PLAYER INPUT
   ========================================= */

tiles.forEach(tile => {

    tile.addEventListener(
        "click",
        () => {

            if (
                !gameRunning ||
                !acceptingInput
            ) {
                return;
            }

            const index =
                Number(tile.dataset.index);

            handlePlayerMove(
                index
            );
        }
    );

});


/* =========================================
   HANDLE PLAYER MOVE
   ========================================= */

async function handlePlayerMove(index) {

    if (!acceptingInput) {
        return;
    }

    const position =
        playerSequence.length;

    const expected =
        sequence[position];

    /*
     * Wrong tile.
     */
    if (index !== expected) {

        showWrongTile(index);

        acceptingInput = false;

        await sleep(350);

        endGame();

        return;
    }

    /*
     * Correct tile.
     */
    playerSequence.push(index);

    correctCount++;

    score +=
        10 * level;

    showCorrectTile(index);

    updateUI();

    /*
     * Completed sequence.
     */
    if (
        playerSequence.length ===
        sequence.length
    ) {

        acceptingInput = false;

        score +=
            level * 25;

        statusText.textContent =
            "Perfect! ⚡";

        updateUI();

        await sleep(550);

        if (!gameRunning) {
            return;
        }

        /*
         * Increase level.
         */
        if (level < MAX_LEVEL) {
            level++;
        }

        updateUI();

        await startLevel(
            sequenceToken
        );
    }
}


/* =========================================
   CORRECT TILE EFFECT
   ========================================= */

function showCorrectTile(index) {

    const tile = tiles[index];

    tile.classList.add("correct");

    setTimeout(() => {

        tile.classList.remove(
            "correct"
        );

    }, 180);
}


/* =========================================
   WRONG TILE EFFECT
   ========================================= */

function showWrongTile(index) {

    const tile = tiles[index];

    tile.classList.add("wrong");

    setTimeout(() => {

        tile.classList.remove(
            "wrong"
        );

    }, 400);
}


/* =========================================
   RANDOM TILE
   ========================================= */

function randomTile() {

    /*
     * Avoid choosing the exact same tile
     * twice in a row when possible.
     */
    let index;

    do {

        index =
            Math.floor(
                Math.random() *
                TILE_COUNT
            );

    } while (
        sequence.length > 0 &&
        index ===
        sequence[sequence.length - 1]
    );

    return index;
}


/* =========================================
   UPDATE UI
   ========================================= */

function updateUI() {

    levelText.textContent =
        level;

    scoreText.textContent =
        score;

    sequenceCountText.textContent =
        sequence.length;

    correctCountText.textContent =
        correctCount;

    bestText.textContent =
        bestLevel;
}


/* =========================================
   END GAME
   ========================================= */

function endGame() {

    sequenceToken++;

    gameRunning = false;

    acceptingInput = false;

    statusText.textContent =
        "Sequence broken!";

    /*
     * Save best level.
     */
    if (level > bestLevel) {

        bestLevel = level;

        localStorage.setItem(
            "gamevault-memory-best",
            bestLevel
        );
    }

    finalLevelText.textContent =
        level;

    finalScoreText.textContent =
        score;

    bestText.textContent =
        bestLevel;

    gameOverScreen.classList.remove(
        "hidden"
    );
}


/* =========================================
   CLEAR TILES
   ========================================= */

function clearTiles() {

    tiles.forEach(tile => {

        tile.classList.remove(
            "active",
            "correct",
            "wrong"
        );

    });
}


/* =========================================
   SLEEP
   ========================================= */

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
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
   KEYBOARD SUPPORT
   ========================================= */

/*
 * Number keys 1-9, 0 and Q-W-E-R
 * can activate tiles.
 *
 * Layout:
 *
 * 1 2 3 4
 * 5 6 7 8
 * 9 0 Q W
 * E R T Y
 */

const keyboardMap = {

    "1": 0,
    "2": 1,
    "3": 2,
    "4": 3,

    "5": 4,
    "6": 5,
    "7": 6,
    "8": 7,

    "9": 8,
    "0": 9,
    "q": 10,
    "w": 11,

    "e": 12,
    "r": 13,
    "t": 14,
    "y": 15

};


document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        /*
         * Space starts/restarts.
         */
        if (
            key === " " &&
            !gameRunning
        ) {

            event.preventDefault();

            startGame();

            return;
        }

        if (
            keyboardMap[key] === undefined
        ) {
            return;
        }

        if (
            !gameRunning ||
            !acceptingInput
        ) {
            return;
        }

        event.preventDefault();

        handlePlayerMove(
            keyboardMap[key]
        );
    }
);


/* =========================================
   PREVENT DOUBLE TOUCH / SELECTION
   ========================================= */

tiles.forEach(tile => {

    tile.addEventListener(
        "pointerdown",
        event => {

            if (gameRunning) {
                event.preventDefault();
            }

        }
    );

});


/* =========================================
   INITIAL STATE
   ========================================= */

statusText.textContent =
    "Press Start to play";

startBtn.textContent =
    "Start Game";

clearTiles();

updateUI();
