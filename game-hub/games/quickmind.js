const gameBox =
    document.getElementById("gameBox");

const reactionButton =
    document.getElementById("reactionButton");

const instruction =
    document.getElementById("instruction");

const countdown =
    document.getElementById("countdown");

const countdownNumber =
    countdown.querySelector("strong");

const feedback =
    document.getElementById("feedback");

const scoreDisplay =
    document.getElementById("score");

const streakDisplay =
    document.getElementById("streak");

const timerDisplay =
    document.getElementById("timer");

const bestDisplay =
    document.querySelector("#best strong");

const result =
    document.getElementById("result");

const finalScore =
    document.getElementById("finalScore");

const finalBest =
    document.getElementById("finalBest");

const finalStreak =
    document.getElementById("finalStreak");

const againBtn =
    document.getElementById("againBtn");


let score = 0;

let streak = 0;

let best = Number(
    localStorage.getItem(
        "quickMindBest"
    )
) || 0;

let time = 30;

let playing = false;

let waiting = false;

let ready = false;

let greenTime = 0;

let roundTimeout;

let timerInterval;


bestDisplay.textContent = best;


/* =====================================
   START
===================================== */

function startGame() {

    clearTimeout(roundTimeout);

    clearInterval(timerInterval);

    score = 0;

    streak = 0;

    time = 30;

    playing = false;

    waiting = false;

    ready = false;

    updateHUD();

    result.classList.add("hidden");

    gameBox.classList.remove(
        "go",
        "bad"
    );

    feedback.textContent = "";

    reactionButton.textContent =
        "WAIT";

    instruction.textContent =
        "WAIT FOR GREEN";

    countdown.classList.remove(
        "hidden"
    );

    startCountdown();
}


/* =====================================
   COUNTDOWN
===================================== */

function startCountdown() {

    let count = 3;

    countdownNumber.textContent =
        count;

    const interval =
        setInterval(() => {

            count--;

            if (count <= 0) {

                clearInterval(interval);

                countdown.classList.add(
                    "hidden"
                );

                playing = true;

                startTimer();

                newRound();

                return;
            }

            countdownNumber.textContent =
                count;

        }, 700);
}


/* =====================================
   NEW ROUND
===================================== */

function newRound() {

    if (!playing) return;

    waiting = true;

    ready = false;

    gameBox.classList.remove(
        "go",
        "bad"
    );

    instruction.textContent =
        "WAIT FOR GREEN";

    reactionButton.textContent =
        "WAIT";

    feedback.textContent =
        "Don't tap yet...";


    /*
       Random delay between
       1 and 4 seconds.
    */

    const delay =
        1000 +
        Math.random() * 3000;


    roundTimeout =
        setTimeout(() => {

            if (!playing) return;

            ready = true;

            waiting = false;

            greenTime =
                performance.now();

            gameBox.classList.add(
                "go"
            );

            instruction.textContent =
                "TAP NOW!";

            reactionButton.textContent =
                "GO!";

            feedback.textContent =
                "";

        }, delay);
}


/* =====================================
   BUTTON
===================================== */

reactionButton.addEventListener(
    "pointerdown",
    e => {

        e.preventDefault();

        if (!playing) return;

        /*
           Player clicked too early.
        */

        if (waiting && !ready) {

            falseStart();

            return;
        }


        /*
           Player reacted.
        */

        if (ready) {

            react();
        }
    }
);


/* =====================================
   FALSE START
===================================== */

function falseStart() {

    clearTimeout(roundTimeout);

    gameBox.classList.remove("go");

    gameBox.classList.add("bad");

    feedback.textContent =
        "❌ TOO EARLY!";

    instruction.textContent =
        "FOCUS!";

    reactionButton.textContent =
        "OOPS";

    streak = 0;

    score =
        Math.max(
            0,
            score - 25
        );

    updateHUD();

    setTimeout(() => {

        if (playing) {
            newRound();
        }

    }, 700);
}


/* =====================================
   REACTION
===================================== */

function react() {

    const reaction =
        performance.now() -
        greenTime;


    ready = false;

    gameBox.classList.remove(
        "go"
    );


    /*
       Faster reaction =
       more points.
    */

    let points;


    if (reaction < 180) {

        points = 100;

        feedback.textContent =
            `⚡ INSANE! ${Math.round(reaction)}ms`;

    } else if (reaction < 300) {

        points = 75;

        feedback.textContent =
            `🔥 GREAT! ${Math.round(reaction)}ms`;

    } else if (reaction < 500) {

        points = 50;

        feedback.textContent =
            `👍 NICE! ${Math.round(reaction)}ms`;

    } else {

        points = 25;

        feedback.textContent =
            `😎 ${Math.round(reaction)}ms`;
    }


    streak++;


    /*
       Streak multiplier.
    */

    const multiplier =
        Math.min(
            5,
            1 +
            Math.floor(
                streak / 3
            )
        );


    points *= multiplier;

    score += points;


    if (score > best) {

        best = score;

        localStorage.setItem(
            "quickMindBest",
            best
        );
    }


    updateHUD();


    reactionButton.textContent =
        "+" + points;


    setTimeout(() => {

        if (playing) {
            newRound();
        }

    }, 600);
}


/* =====================================
   TIMER
===================================== */

function startTimer() {

    timerInterval =
        setInterval(() => {

            if (!playing) return;

            time--;

            updateHUD();

            if (time <= 0) {

                endGame();
            }

        }, 1000);
}


/* =====================================
   HUD
===================================== */

function updateHUD() {

    scoreDisplay.textContent =
        score.toLocaleString();

    streakDisplay.textContent =
        streak;

    timerDisplay.textContent =
        time;

    bestDisplay.textContent =
        best;
}


/* =====================================
   END
===================================== */

function endGame() {

    playing = false;

    clearTimeout(roundTimeout);

    clearInterval(timerInterval);

    finalScore.textContent =
        score.toLocaleString();

    finalBest.textContent =
        best.toLocaleString();

    finalStreak.textContent =
        streak;

    result.classList.remove(
        "hidden"
    );
}


/* =====================================
   AGAIN
===================================== */

againBtn.addEventListener(
    "click",
    startGame
);


/* =====================================
   START
===================================== */

startGame();
