const gameArea =
    document.getElementById("gameArea");

const targetContainer =
    document.getElementById("targetContainer");

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

const comboDisplay =
    document.getElementById("combo");

const timerDisplay =
    document.getElementById("timer");

const bestScoreDisplay =
    document.getElementById("bestScore");

const message =
    document.getElementById("message");

const finalScore =
    document.getElementById("finalScore");

const finalBest =
    document.getElementById("finalBest");

const finalHits =
    document.getElementById("finalHits");

const finalAccuracy =
    document.getElementById("finalAccuracy");

const resultTitle =
    document.getElementById("resultTitle");

const resultIcon =
    document.getElementById("resultIcon");


/* =========================
   VARIABLES
========================= */

let playing = false;

let score = 0;

let combo = 1;

let hits = 0;

let attempts = 0;

let time = 30;

let best =
    Number(
        localStorage.getItem(
            "gameverseTargetBest"
        )
    ) || 0;

let targetTimer = null;

let gameTimer = null;

let messageTimer = null;


/* =========================
   INITIAL HUD
========================= */

bestScoreDisplay.textContent =
    best.toLocaleString();


/* =========================
   START GAME
========================= */

function startGame() {

    clearTimeout(targetTimer);

    clearInterval(gameTimer);

    playing = false;

    score = 0;

    combo = 1;

    hits = 0;

    attempts = 0;

    time = 30;

    targetContainer.innerHTML = "";

    updateHUD();

    startScreen.classList.add(
        "hidden"
    );

    resultScreen.classList.add(
        "hidden"
    );


    /*
       Tiny delay makes
       the start feel cleaner.
    */

    setTimeout(() => {

        playing = true;

        spawnTarget();

        gameTimer =
            setInterval(() => {

                if (!playing) return;

                time--;

                updateHUD();

                if (time <= 0) {

                    endGame();

                }

            }, 1000);

    }, 250);
}


/* =========================
   SPAWN TARGET
========================= */

function spawnTarget() {

    if (!playing) return;

    targetContainer.innerHTML = "";

    const target =
        document.createElement("button");

    target.type = "button";

    target.className =
        "target";


    /*
       12% → 88%
       keeps target away
       from the edges.
    */

    const x =
        12 +
        Math.random() * 76;

    const y =
        14 +
        Math.random() * 72;


    target.style.left =
        x + "%";

    target.style.top =
        y + "%";


    /*
       Bonus targets appear
       occasionally.
    */

    const isBonus =
        Math.random() < 0.12;


    if (isBonus) {

        target.classList.add(
            "bonus"
        );
    }


    target.classList.add(
        "shrinking"
    );


    targetContainer.appendChild(
        target
    );


    /*
       Target disappears after
       a short amount of time.
    */

    const lifetime =
        isBonus
            ? 1100
            : Math.max(
                650,
                1100 - hits * 8
            );


    targetTimer =
        setTimeout(() => {

            if (!playing) return;

            attempts++;

            combo = 1;

            showMessage(
                "MISS!"
            );

            spawnTarget();

        }, lifetime);


    /*
       Pointer is better than
       click for mobile.
    */

    target.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            hitTarget(
                target,
                isBonus,
                event
            );

        }
    );
}


/* =========================
   HIT TARGET
========================= */

function hitTarget(
    target,
    isBonus,
    event
) {

    if (!playing) return;

    /*
       Prevent double taps.
    */

    if (
        target.dataset.hit === "true"
    ) {
        return;
    }

    target.dataset.hit = "true";

    clearTimeout(targetTimer);

    attempts++;

    hits++;


    /*
       Normal target:
       50 points × combo

       Bonus:
       200 points × combo
    */

    const base =
        isBonus
            ? 200
            : 50;


    const gained =
        base * combo;


    score += gained;


    /*
       Combo increases every
       3 successful hits.
    */

    if (
        hits % 3 === 0
    ) {

        combo++;

        showMessage(
            `🔥 COMBO x${combo}`
        );

    } else {

        showMessage(
            isBonus
                ? `💎 BONUS +${gained}`
                : `+${gained}`
        );
    }


    createHitEffect(
        target
    );


    target.remove();

    updateHUD();


    setTimeout(() => {

        spawnTarget();

    }, 70);
}


/* =========================
   HIT EFFECT
========================= */

function createHitEffect(
    target
) {

    const effect =
        document.createElement(
            "div"
        );

    effect.className =
        "hitEffect";


    effect.style.left =
        target.style.left;

    effect.style.top =
        target.style.top;


    targetContainer.appendChild(
        effect
    );


    setTimeout(() => {

        effect.remove();

    }, 400);
}


/* =========================
   HUD
========================= */

function updateHUD() {

    scoreDisplay.textContent =
        Math.floor(score)
            .toLocaleString();

    comboDisplay.textContent =
        "x" + combo;

    timerDisplay.textContent =
        time;

    bestScoreDisplay.textContent =
        best.toLocaleString();
}


/* =========================
   MESSAGE
========================= */

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

        }, 500);
}


/* =========================
   END GAME
========================= */

function endGame() {

    if (!playing) return;

    playing = false;

    clearInterval(
        gameTimer
    );

    clearTimeout(
        targetTimer
    );


    targetContainer.innerHTML =
        "";


    const final =
        Math.floor(score);


    const newBest =
        final > best;


    if (newBest) {

        best = final;

        localStorage.setItem(
            "gameverseTargetBest",
            best
        );

    }


    const accuracy =
        attempts > 0
            ? Math.round(
                (hits / attempts) * 100
            )
            : 0;


    finalScore.textContent =
        final.toLocaleString();

    finalBest.textContent =
        best.toLocaleString();

    finalHits.textContent =
        hits;

    finalAccuracy.textContent =
        accuracy + "%";


    if (newBest) {

        resultIcon.textContent =
            "🏆";

        resultTitle.textContent =
            "NEW HIGH SCORE!";

    } else {

        resultIcon.textContent =
            "🎯";

        resultTitle.textContent =
            "ROUND COMPLETE";

    }


    resultScreen.classList.remove(
        "hidden"
    );

    updateHUD();
}


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
   PREVENT ACCIDENTAL
   MOBILE SCROLLING
========================= */

gameArea.addEventListener(
    "touchstart",
    e => {

        if (playing) {
            e.preventDefault();
        }

    },
    {
        passive: false
    }
);

gameArea.addEventListener(
    "touchmove",
    e => {

        if (playing) {
            e.preventDefault();
        }

    },
    {
        passive: false
    }
);
