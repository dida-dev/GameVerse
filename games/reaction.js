/* =========================
ELEMENTS
========================= */

const reactionArea =
    document.getElementById(
        "reactionArea"
    );

const reactionIcon =
    document.getElementById(
        "reactionIcon"
    );

const reactionEyebrow =
    document.getElementById(
        "reactionEyebrow"
    );

const reactionTitle =
    document.getElementById(
        "reactionTitle"
    );

const reactionText =
    document.getElementById(
        "reactionText"
    );

const reactionTime =
    document.getElementById(
        "reactionTime"
    );

const startButton =
    document.getElementById(
        "startButton"
    );

const resetButton =
    document.getElementById(
        "resetButton"
    );

const timeElement =
    document.getElementById(
        "time"
    );

const roundsElement =
    document.getElementById(
        "rounds"
    );

const bestElement =
    document.getElementById(
        "best"
    );

const joystick =
    document.getElementById(
        "joystick"
    );

const joystickKnob =
    document.getElementById(
        "joystickKnob"
    );


/* =========================
GAME VARIABLES
========================= */

let gameState =
    "waiting";

let startTime = 0;

let greenTime = 0;

let reactionTimer = null;

let rounds = 0;

let bestTime =
    Number(
        localStorage.getItem(
            "reactionBest"
        )
    ) || 0;


/* =========================
JOYSTICK
========================= */

let joystickActive = false;

let joystickPointerId = null;

let joystickX = 0;

let joystickY = 0;


/* =========================
INITIAL HUD
========================= */

if (bestTime > 0) {

    bestElement.textContent =
        bestTime + " ms";

} else {

    bestElement.textContent =
        "---";

}

roundsElement.textContent =
    rounds;


/* =========================
START TEST
========================= */

function startTest() {

    clearTimeout(
        reactionTimer
    );

    resetJoystick();

    gameState =
        "ready";

    reactionArea.className =
        "reactionArea ready";

    reactionIcon.textContent =
        "🔴";

    reactionEyebrow.textContent =
        "GET READY";

    reactionTitle.textContent =
        "WAIT...";

    reactionText.textContent =
        "Don't move yet. Wait for green.";

    reactionTime.textContent =
        "---";

    timeElement.textContent =
        "---";

    startButton.textContent =
        "WAITING...";

    startButton.disabled =
        true;


    /* Random delay */

    const delay =
        1500 +
        Math.random() *
        4000;


    reactionTimer =
        setTimeout(
            showGreen,
            delay
        );

}


/* =========================
SHOW GREEN
========================= */

function showGreen() {

    gameState =
        "go";

    greenTime =
        performance.now();

    reactionArea.className =
        "reactionArea go";

    reactionIcon.textContent =
        "🟢";

    reactionEyebrow.textContent =
        "GO!";

    reactionTitle.textContent =
        "MOVE!";

    reactionText.textContent =
        "Push the joystick to the right!";

    reactionTime.textContent =
        "0 ms";

}


/* =========================
SUCCESS
========================= */

function finishRound() {

    if (
        gameState !==
        "go"
    ) {

        return;

    }

    const currentTime =
        performance.now();

    const result =
        Math.round(
            currentTime -
            greenTime
        );

    rounds++;

    timeElement.textContent =
        result + " ms";

    roundsElement.textContent =
        rounds;

    reactionTime.textContent =
        result + " ms";


    /* Best time */

    if (
        bestTime === 0 ||
        result < bestTime
    ) {

        bestTime =
            result;

        localStorage.setItem(
            "reactionBest",
            bestTime
        );

        bestElement.textContent =
            bestTime + " ms";

    }


    gameState =
        "result";

    reactionArea.className =
        "reactionArea result";

    reactionIcon.textContent =
        "⚡";

    reactionEyebrow.textContent =
        "NICE REFLEX";

    reactionTitle.textContent =
        result + " MS";

    reactionText.textContent =
        getResultMessage(
            result
        );

    reactionTime.textContent =
        "Round " + rounds;

    startButton.disabled =
        false;

    startButton.textContent =
        "TRY AGAIN";

    resetJoystick();

}


/* =========================
RESULT MESSAGE
========================= */

function getResultMessage(
    result
) {

    if (result < 180) {

        return "INSANE! Your reflexes are lightning fast.";

    }

    if (result < 250) {

        return "Amazing reaction speed!";

    }

    if (result < 350) {

        return "Great reflexes!";

    }

    if (result < 500) {

        return "Good job! Keep practicing.";

    }

    return "Not bad. Try to beat your time!";

}


/* =========================
FALSE START
========================= */

function falseStart() {

    if (
        gameState !==
        "ready"
    ) {

        return;

    }

    clearTimeout(
        reactionTimer
    );

    gameState =
        "waiting";

    reactionArea.className =
        "reactionArea waiting";

    reactionIcon.textContent =
        "💥";

    reactionEyebrow.textContent =
        "TOO SOON";

    reactionTitle.textContent =
        "FALSE START";

    reactionText.textContent =
        "You moved before the green signal.";

    reactionTime.textContent =
        "---";

    timeElement.textContent =
        "EARLY";

    startButton.disabled =
        false;

    startButton.textContent =
        "TRY AGAIN";

    resetJoystick();

}


/* =========================
RESET
========================= */

function resetGame() {

    clearTimeout(
        reactionTimer
    );

    gameState =
        "waiting";

    rounds =
        0;

    reactionArea.className =
        "reactionArea waiting";

    reactionIcon.textContent =
        "⚡";

    reactionEyebrow.textContent =
        "REACTION TEST";

    reactionTitle.textContent =
        "READY?";

    reactionText.textContent =
        "Press START and wait for the screen to turn green.";

    reactionTime.textContent =
        "---";

    timeElement.textContent =
        "---";

    roundsElement.textContent =
        "0";

    startButton.disabled =
        false;

    startButton.textContent =
        "START TEST";

    resetJoystick();

}


/* =========================
JOYSTICK UPDATE
========================= */

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


    joystickX =
        dx /
        maxDistance;

    joystickY =
        dy /
        maxDistance;


    joystickKnob.style.transform =
        `translate(
            calc(-50% + ${dx}px),
            calc(-50% + ${dy}px)
        )`;


    /*
        Reaction:
        Move joystick to the RIGHT
        after the green signal.
    */

    if (
        gameState ===
        "go"
    ) {

        if (
            joystickX >
            0.45
        ) {

            finishRound();

        }

    }


    /*
        Moving before green =
        false start.
    */

    else if (
        gameState ===
        "ready"
    ) {

        if (
            Math.abs(joystickX) >
                0.25 ||
            Math.abs(joystickY) >
                0.25
        ) {

            falseStart();

        }

    }

}


/* =========================
RESET JOYSTICK
========================= */

function resetJoystick() {

    joystickActive =
        false;

    joystickPointerId =
        null;

    joystickX = 0;

    joystickY = 0;

    joystickKnob.style.transform =
        "translate(-50%, -50%)";

    joystick.classList.remove(
        "active"
    );

}


/* =========================
JOYSTICK DOWN
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
JOYSTICK UP
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


/* =========================
JOYSTICK CANCEL
========================= */

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
START BUTTON
========================= */

startButton.addEventListener(
    "click",
    () => {

        startTest();

    }
);


/* =========================
RESET BUTTON
========================= */

resetButton.addEventListener(
    "click",
    () => {

        resetGame();

    }
);


/* =========================
KEYBOARD SUPPORT
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            if (
                gameState ===
                "waiting"
            ) {

                startTest();

            }

            else if (
                gameState ===
                "ready"
            ) {

                falseStart();

            }

            else if (
                gameState ===
                "go"
            ) {

                finishRound();

            }

        }


        if (
            gameState ===
            "go" &&
            (
                event.key ===
                    "ArrowRight" ||
                event.key.toLowerCase() ===
                    "d"
            )
        ) {

            finishRound();

        }


        if (
            gameState ===
            "ready" &&
            (
                event.key ===
                    "ArrowRight" ||
                event.key ===
                    "ArrowLeft" ||
                event.key ===
                    "ArrowUp" ||
                event.key ===
                    "ArrowDown"
            )
        ) {

            falseStart();

        }

    }
);
