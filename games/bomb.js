/* =========================
   BOMB DEFUSAL
========================= */

const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const messageElement = document.getElementById("message");

const startButton = document.getElementById("startButton");

const bomb = document.getElementById("bomb");
const display = document.getElementById("display");

const wires = document.querySelectorAll(".wire");


/* =========================
   GAME VARIABLES
========================= */

let time = 30;
let score = 0;

let gameRunning = false;
let timerInterval = null;

let correctWire = null;

let wrongWireTimeout = null;


/* =========================
   COLORS
========================= */

const colors = [
    "red",
    "blue",
    "yellow",
    "green"
];


/* =========================
   START GAME
========================= */

function startGame() {

    /* Stop any old timer */

    clearInterval(timerInterval);

    if (wrongWireTimeout) {

        clearTimeout(wrongWireTimeout);

        wrongWireTimeout = null;
    }


    /* Reset game */

    time = 30;
    score = 0;

    gameRunning = true;


    /* Reset HUD */

    timerElement.textContent = time;

    timerElement.style.color = "";

    scoreElement.textContent = score;

    messageElement.textContent =
        "Find the correct wire!";

    display.textContent =
        "DEFUSE";


    /* Reset bomb */

    bomb.classList.remove(
        "success",
        "explode"
    );


    /* Enable wires */

    wires.forEach(wire => {

        wire.disabled = false;

        wire.style.opacity = "1";

        wire.classList.remove(
            "correct",
            "wrong"
        );
    });


    /* Pick random correct wire */

    correctWire =
        colors[
            Math.floor(
                Math.random() *
                colors.length
            )
        ];


    /* Button */

    startButton.textContent =
        "RESTART";


    /* Start timer */

    timerInterval =
        setInterval(() => {

            if (!gameRunning) {
                return;
            }


            time--;


            time =
                Math.max(
                    0,
                    time
                );


            timerElement.textContent =
                time;


            /* Red warning */

            if (time <= 5) {

                timerElement.style.color =
                    "#ff2020";

            } else {

                timerElement.style.color =
                    "";
            }


            /* Time up */

            if (time <= 0) {

                explode();

            }

        }, 1000);
}


/* =========================
   DEFUSE
========================= */

function defuse(color, wire) {

    if (!gameRunning) {
        return;
    }


    /* =========================
       CORRECT WIRE
    ========================= */

    if (color === correctWire) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;

        gameRunning = false;


        /* Score */

        score =
            time * 100 +
            1000;


        scoreElement.textContent =
            score.toLocaleString();


        /* Screen */

        display.textContent =
            "DEFUSED ✓";


        messageElement.textContent =
            "🎉 Bomb defused! Nice work!";


        /* Bomb animation */

        bomb.classList.remove(
            "explode"
        );

        bomb.classList.add(
            "success"
        );


        /* Disable wires */

        wires.forEach(
            currentWire => {

                currentWire.disabled =
                    true;

                currentWire.style.opacity =
                    "0.5";

            }
        );


        /* Highlight correct wire */

        if (wire) {

            wire.classList.add(
                "correct"
            );

        }


        startButton.textContent =
            "PLAY AGAIN";


        return;
    }


    /* =========================
       WRONG WIRE
    ========================= */

    messageElement.textContent =
        "💥 WRONG WIRE! Try again!";


    score =
        Math.max(
            0,
            score - 100
        );


    scoreElement.textContent =
        score.toLocaleString();


    /* Wrong wire animation */

    if (wire) {

        wire.classList.add(
            "wrong"
        );

        setTimeout(() => {

            wire.classList.remove(
                "wrong"
            );

        }, 500);
    }


    /* Bomb shake/explode effect */

    bomb.classList.remove(
        "explode"
    );

    /*
       Force browser to restart
       the CSS animation.
    */

    void bomb.offsetWidth;


    bomb.classList.add(
        "explode"
    );


    if (wrongWireTimeout) {

        clearTimeout(
            wrongWireTimeout
        );
    }


    wrongWireTimeout =
        setTimeout(() => {

            bomb.classList.remove(
                "explode"
            );

            wrongWireTimeout = null;

        }, 600);
}


/* =========================
   EXPLODE
========================= */

function explode() {

    if (!gameRunning) {
        return;
    }


    clearInterval(
        timerInterval
    );

    timerInterval = null;

    gameRunning = false;


    time = 0;


    timerElement.textContent =
        "0";


    timerElement.style.color =
        "#ff2020";


    display.textContent =
        "BOOM! 💥";


    messageElement.textContent =
        "💀 Too late! The bomb exploded.";


    /* Explosion animation */

    bomb.classList.remove(
        "success"
    );


    void bomb.offsetWidth;


    bomb.classList.add(
        "explode"
    );


    /* Disable wires */

    wires.forEach(wire => {

        wire.disabled = true;

        wire.style.opacity =
            "0.5";

    });


    startButton.textContent =
        "TRY AGAIN";
}


/* =========================
   WIRE BUTTONS
========================= */

wires.forEach(wire => {

    wire.addEventListener(
        "click",
        () => {

            if (!gameRunning) {
                return;
            }


            const color =
                wire.dataset.color;


            defuse(
                color,
                wire
            );

        }
    );

});


/* =========================
   START BUTTON
========================= */

startButton.addEventListener(
    "click",
    startGame
);


/* =========================
   INITIAL STATE
========================= */

function initializeGame() {

    clearInterval(
        timerInterval
    );

    gameRunning = false;

    time = 30;

    score = 0;

    timerElement.textContent =
        time;

    scoreElement.textContent =
        score;

    timerElement.style.color =
        "";

    display.textContent =
        "DEFUSE";

    messageElement.textContent =
        "Press START to begin.";

    bomb.classList.remove(
        "success",
        "explode"
    );

    wires.forEach(wire => {

        wire.disabled = true;

        wire.style.opacity =
            "0.5";

        wire.classList.remove(
            "correct",
            "wrong"
        );

    });

    startButton.textContent =
        "START GAME";
}


initializeGame();
