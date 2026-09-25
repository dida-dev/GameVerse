const gameArea =
    document.getElementById("gameArea");

const rocket =
    document.getElementById("rocket");

const objects =
    document.getElementById("objects");

const startScreen =
    document.getElementById("startScreen");

const resultScreen =
    document.getElementById("resultScreen");

const startBtn =
    document.getElementById("startBtn");

const againBtn =
    document.getElementById("againBtn");

const scoreDisplay =
    document.getElementById("score");

const energyDisplay =
    document.getElementById("energy");

const speedDisplay =
    document.getElementById("speed");

const bestDisplay =
    document.getElementById("bestScore");

const message =
    document.getElementById("message");

const finalScore =
    document.getElementById("finalScore");

const finalBest =
    document.getElementById("finalBest");

const finalEnergy =
    document.getElementById("finalEnergy");

const finalMeteors =
    document.getElementById("finalMeteors");

const resultTitle =
    document.getElementById("resultTitle");

const resultIcon =
    document.getElementById("resultIcon");


/* =========================
   VARIABLES
========================= */

let playing = false;

let score = 0;

let energy = 100;

let speedLevel = 1;

let meteorsDodged = 0;

let playerX = 50;

let playerY = 80;

let targetX = 50;

let targetY = 80;

let keys = {};

let objectsList = [];

let animationFrame;

let spawnTimer;

let difficultyTimer;

let lastTime = 0;

let touchActive = false;

let best =
    Number(
        localStorage.getItem(
            "gameverseRocketBest"
        )
    ) || 0;


bestDisplay.textContent =
    best.toLocaleString();


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    e => {

        keys[
            e.key.toLowerCase()
        ] = true;

        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                " "
            ].includes(
                e.key.toLowerCase()
            )
        ) {
            e.preventDefault();
        }

    }
);


document.addEventListener(
    "keyup",
    e => {

        keys[
            e.key.toLowerCase()
        ] = false;

    }
);


/* =========================
   START
========================= */

function startGame() {

    stopGame();

    playing = true;

    score = 0;

    energy = 100;

    speedLevel = 1;

    meteorsDodged = 0;

    objects.innerHTML = "";

    objectsList = [];

    playerX = 50;

    playerY = 80;

    targetX = 50;

    targetY = 80;

    rocket.style.left =
        playerX + "%";

    rocket.style.top =
        playerY + "%";

    updateHUD();

    startScreen.classList.add(
        "hidden"
    );

    resultScreen.classList.add(
        "hidden"
    );

    lastTime = performance.now();

    animationFrame =
        requestAnimationFrame(loop);

    spawnTimer =
        setInterval(
            spawnObject,
            650
        );

    difficultyTimer =
        setInterval(
            increaseDifficulty,
            8000
        );

    spawnObject();

}


/* =========================
   GAME LOOP
========================= */

function loop(now) {

    if (!playing) return;

    const delta =
        Math.min(
            32,
            now - lastTime
        );

    lastTime = now;

    movePlayer(delta);

    updateObjects(delta);

    checkCollisions();

    score +=
        delta * 0.012 * speedLevel;

    updateHUD();

    animationFrame =
        requestAnimationFrame(loop);
}


/* =========================
   PLAYER
========================= */

function movePlayer(delta) {

    let dx = 0;
    let dy = 0;


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        dx -= 1;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        dx += 1;
    }

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        dy -= 1;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        dy += 1;
    }


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        dx /= length;
        dy /= length;

        targetX +=
            dx * 0.22 * delta;

        targetY +=
            dy * 0.22 * delta;
    }


    /*
       Mobile dragging uses
       targetX / targetY.
    */

    playerX +=
        (targetX - playerX) *
        0.18;

    playerY +=
        (targetY - playerY) *
        0.18;


    playerX =
        Math.max(
            6,
            Math.min(
                94,
                playerX
            )
        );

    playerY =
        Math.max(
            8,
            Math.min(
                92,
                playerY
            )
        );


    targetX =
        Math.max(
            6,
            Math.min(
                94,
                targetX
            )
        );

    targetY =
        Math.max(
            8,
            Math.min(
                92,
                targetY
            )
        );


    rocket.style.left =
        playerX + "%";

    rocket.style.top =
        playerY + "%";
}


/* =========================
   SPAWN OBJECT
========================= */

function spawnObject() {

    if (!playing) return;


    const isEnergy =
        Math.random() < 0.18;


    const element =
        document.createElement("div");


    if (isEnergy) {

        element.className =
            "energy";

        element.textContent =
            "⚡";

    } else {

        element.className =
            "meteor";

        element.textContent =
            Math.random() < .25
                ? "☄️"
                : "🪨";

        if (
            Math.random() < .2
        ) {
            element.classList.add(
                "big"
            );
        }
    }


    const x =
        8 +
        Math.random() * 84;


    const y = -8;


    element.style.left =
        x + "%";

    element.style.top =
        y + "%";


    objects.appendChild(
        element
    );


    objectsList.push({

        element,

        x,

        y,

        type:
            isEnergy
                ? "energy"
                : "meteor",

        speed:
            0.08 +
            Math.random() *
            0.05 +
            speedLevel *
            0.012

    });
}


/* =========================
   MOVE OBJECTS
========================= */

function updateObjects(delta) {

    for (
        let i =
            objectsList.length - 1;

        i >= 0;

        i--
    ) {

        const obj =
            objectsList[i];


        obj.y +=
            obj.speed * delta;


        obj.element.style.top =
            obj.y + "%";


        if (
            obj.y > 110
        ) {

            if (
                obj.type ===
                "meteor"
            ) {

                meteorsDodged++;

                score +=
                    20 * speedLevel;
            }


            obj.element.remove();

            objectsList.splice(
                i,
                1
            );
        }
    }
}


/* =========================
   COLLISIONS
========================= */

function checkCollisions() {

    const playerSize = 4.5;


    for (
        let i =
            objectsList.length - 1;

        i >= 0;

        i--
    ) {

        const obj =
            objectsList[i];


        const dx =
            playerX - obj.x;

        const dy =
            playerY - obj.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const hitDistance =
            obj.type ===
                "energy"
                ? 5
                : 5.5;


        if (
            distance <
            hitDistance + playerSize
        ) {

            if (
                obj.type ===
                "energy"
            ) {

                energy =
                    Math.min(
                        100,
                        energy + 25
                    );

                score +=
                    100 * speedLevel;

                showMessage(
                    "⚡ ENERGY +25"
                );

            } else {

                energy -=
                    25;

                score =
                    Math.max(
                        0,
                        score - 100
                    );

                createExplosion(
                    obj.x,
                    obj.y
                );

                showMessage(
                    "💥 HIT! -25 ENERGY"
                );


                if (
                    energy <= 0
                ) {

                    endGame();

                }

            }


            obj.element.remove();

            objectsList.splice(
                i,
                1
            );

            updateHUD();
        }
    }
}


/* =========================
   EXPLOSION
========================= */

function createExplosion(
    x,
    y
) {

    const explosion =
        document.createElement(
            "div"
        );

    explosion.className =
        "explosion";

    explosion.style.left =
        x + "%";

    explosion.style.top =
        y + "%";

    objects.appendChild(
        explosion
    );


    setTimeout(() => {

        explosion.remove();

    }, 500);
}


/* =========================
   DIFFICULTY
========================= */

function increaseDifficulty() {

    if (!playing) return;

    speedLevel++;

    showMessage(
        `🔥 SPEED x${speedLevel}`
    );
}


/* =========================
   HUD
========================= */

function updateHUD() {

    scoreDisplay.textContent =
        Math.floor(score)
            .toLocaleString();

    energyDisplay.textContent =
        Math.max(
            0,
            Math.floor(energy)
        );

    speedDisplay.textContent =
        speedLevel + "x";

    bestDisplay.textContent =
        best.toLocaleString();
}


/* =========================
   MESSAGE
========================= */

let messageTimer;

function showMessage(
    text
) {

    message.textContent =
        text;

    message.classList.add(
        "show"
    );

    clearTimeout(
        messageTimer
    );

    messageTimer =
        setTimeout(() => {

            message.classList.remove(
                "show"
            );

        }, 650);
}


/* =========================
   END GAME
========================= */

function endGame() {

    if (!playing) return;

    stopGame();


    const final =
        Math.floor(score);


    const newBest =
        final > best;


    if (newBest) {

        best = final;

        localStorage.setItem(
            "gameverseRocketBest",
            best
        );

    }


    finalScore.textContent =
        final.toLocaleString();

    finalBest.textContent =
        best.toLocaleString();

    finalEnergy.textContent =
        Math.max(
            0,
            Math.floor(energy)
        );

    finalMeteors.textContent =
        meteorsDodged;


    if (newBest) {

        resultIcon.textContent =
            "🏆";

        resultTitle.textContent =
            "NEW HIGH SCORE!";

    } else {

        resultIcon.textContent =
            "💥";

        resultTitle.textContent =
            "SHIP DESTROYED";

    }


    resultScreen.classList.remove(
        "hidden"
    );
}


/* =========================
   STOP
========================= */

function stopGame() {

    playing = false;

    cancelAnimationFrame(
        animationFrame
    );

    clearInterval(
        spawnTimer
    );

    clearInterval(
        difficultyTimer
    );
}


/* =========================
   MOBILE DRAG
========================= */

function moveWithTouch(e) {

    if (!playing) return;

    const rect =
        gameArea.getBoundingClientRect();


    const x =
        (
            e.clientX -
            rect.left
        ) / rect.width * 100;


    const y =
        (
            e.clientY -
            rect.top
        ) / rect.height * 100;


    targetX = x;

    targetY = y;
}


gameArea.addEventListener(
    "pointerdown",
    e => {

        if (!playing) return;

        touchActive = true;

        gameArea.setPointerCapture(
            e.pointerId
        );

        moveWithTouch(e);
    }
);


gameArea.addEventListener(
    "pointermove",
    e => {

        if (
            !touchActive ||
            !playing
        ) return;

        moveWithTouch(e);
    }
);


gameArea.addEventListener(
    "pointerup",
    () => {

        touchActive = false;

    }
);


gameArea.addEventListener(
    "pointercancel",
    () => {

        touchActive = false;

    }
);


/* =========================
   BUTTONS
========================= */

startBtn.addEventListener(
    "click",
    startGame
);

againBtn.addEventListener(
    "click",
    startGame
);


/* =========================
   INITIAL POSITION
========================= */

rocket.style.left =
    "50%";

rocket.style.top =
    "80%";

updateHUD();
