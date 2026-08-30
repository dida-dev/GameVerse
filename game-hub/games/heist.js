const gameArea =
    document.getElementById("gameArea");

const player =
    document.getElementById("player");

const objects =
    document.getElementById("objects");

const guardsContainer =
    document.getElementById("guards");

const cashDisplay =
    document.getElementById("cash");

const comboDisplay =
    document.getElementById("combo");

const timerDisplay =
    document.getElementById("timer");

const alarmDisplay =
    document.getElementById("alarm");

const objectiveText =
    document.getElementById("objectiveText");

const message =
    document.getElementById("message");

const result =
    document.getElementById("result");

const resultTitle =
    document.getElementById("resultTitle");

const resultCash =
    document.getElementById("resultCash");

const resultCombo =
    document.getElementById("resultCombo");

const resultTime =
    document.getElementById("resultTime");

const againBtn =
    document.getElementById("againBtn");

const joystick =
    document.getElementById("joystick");

const joystickKnob =
    document.getElementById("joystickKnob");

const sneakButton =
    document.getElementById("sneakButton");


let playing = true;

let cash = 0;

let combo = 1;

let comboHits = 0;

let time = 60;

let alarm = 0;

let hasKey = false;

let vaultOpened = false;

let playerX = 80;

let playerY = 80;

let guards = [];

let keys = {};

let joystickX = 0;

let joystickY = 0;

let sneaking = false;

let timerInterval;

let animationId;

let messageTimeout;


const normalSpeed = 3.5;

const sneakSpeed = 1.7;


/* =====================================
   KEYBOARD
===================================== */

document.addEventListener(
    "keydown",
    e => {

        keys[e.key.toLowerCase()] = true;

        if (
            [
                "w",
                "a",
                "s",
                "d",
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

        keys[e.key.toLowerCase()] =
            false;
    }
);


/* =====================================
   START
===================================== */

function startGame() {

    playing = true;

    cash = 0;
    combo = 1;
    comboHits = 0;

    time = 60;
    alarm = 0;

    hasKey = false;
    vaultOpened = false;

    playerX = 80;
    playerY = 80;

    joystickX = 0;
    joystickY = 0;

    sneaking = false;

    result.classList.add("hidden");

    objects.innerHTML = "";
    guardsContainer.innerHTML = "";

    guards = [];

    objectiveText.textContent =
        "Find the 🔑 key";

    updateHUD();

    updatePlayer();

    createObjects();

    createGuards();

    clearInterval(timerInterval);

    cancelAnimationFrame(animationId);

    timerInterval =
        setInterval(
            updateTimer,
            1000
        );

    animationId =
        requestAnimationFrame(loop);
}


/* =====================================
   OBJECTS
===================================== */

function createObjects() {

    for (let i = 0; i < 12; i++) {

        createItem(
            "💵",
            "cash",
            randomX(),
            randomY(),
            randomCash()
        );
    }

    for (let i = 0; i < 3; i++) {

        createItem(
            "💎",
            "diamond",
            randomX(),
            randomY(),
            250
        );
    }

    createItem(
        "🔑",
        "key",
        180,
        90,
        0
    );
}


function createItem(
    icon,
    type,
    x,
    y,
    value
) {

    const item =
        document.createElement("div");

    item.className =
        `item ${type}`;

    item.textContent = icon;

    item.dataset.type = type;

    item.dataset.value = value;

    item.style.left =
        x + "px";

    item.style.top =
        y + "px";

    objects.appendChild(item);
}


function randomX() {

    return 50 +
        Math.random() *
        Math.max(
            100,
            gameArea.clientWidth - 110
        );
}


function randomY() {

    return 60 +
        Math.random() *
        Math.max(
            100,
            gameArea.clientHeight - 160
        );
}


function randomCash() {

    const values = [
        25,
        50,
        75,
        100,
        150,
        200
    ];

    return values[
        Math.floor(
            Math.random() *
            values.length
        )
    ];
}


/* =====================================
   GUARDS
===================================== */

function createGuards() {

    const positions = [

        [
            gameArea.clientWidth * .55,
            100
        ],

        [
            gameArea.clientWidth * .75,
            gameArea.clientHeight * .5
        ],

        [
            gameArea.clientWidth * .35,
            gameArea.clientHeight * .65
        ]

    ];

    positions.forEach(
        (position, index) => {

            const guard =
                document.createElement("div");

            guard.className =
                "guard";

            guard.textContent =
                "👮";

            guard.style.left =
                position[0] + "px";

            guard.style.top =
                position[1] + "px";

            guardsContainer.appendChild(
                guard
            );

            guards.push({

                element: guard,

                x: position[0],

                y: position[1],

                direction:
                    index % 2
                        ? -1
                        : 1,

                speed:
                    1 +
                    Math.random() * .5,

                alert: false

            });
        }
    );
}


/* =====================================
   LOOP
===================================== */

function loop() {

    if (!playing) return;

    movePlayer();

    moveGuards();

    checkItems();

    checkVault();

    checkEscape();

    checkGuardDetection();

    animationId =
        requestAnimationFrame(loop);
}


/* =====================================
   PLAYER
===================================== */

function movePlayer() {

    let dx = 0;
    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        dy--;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        dy++;
    }

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        dx--;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        dx++;
    }


    if (
        Math.abs(joystickX) > .05 ||
        Math.abs(joystickY) > .05
    ) {

        dx = joystickX;

        dy = joystickY;
    }


    if (dx !== 0 && dy !== 0) {

        const length =
            Math.hypot(dx, dy);

        dx /= length;
        dy /= length;
    }


    const speed =
        sneaking
            ? sneakSpeed
            : normalSpeed;


    const nextX =
        playerX +
        dx * speed;

    const nextY =
        playerY +
        dy * speed;


    if (
        !collidesWithWalls(
            nextX,
            playerY
        )
    ) {
        playerX = nextX;
    }


    if (
        !collidesWithWalls(
            playerX,
            nextY
        )
    ) {
        playerY = nextY;
    }


    const maxX =
        gameArea.clientWidth - 40;

    const maxY =
        gameArea.clientHeight - 40;


    playerX =
        Math.max(
            5,
            Math.min(
                maxX,
                playerX
            )
        );

    playerY =
        Math.max(
            5,
            Math.min(
                maxY,
                playerY
            )
        );


    updatePlayer();
}


function updatePlayer() {

    player.style.left =
        playerX + "px";

    player.style.top =
        playerY + "px";
}


/* =====================================
   WALL COLLISION
===================================== */

function collidesWithWalls(
    x,
    y
) {

    const size = 40;

    const playerRect = {

        left: x,

        right:
            x + size,

        top: y,

        bottom:
            y + size

    };


    const walls =
        document.querySelectorAll(
            ".wall"
        );


    for (const wall of walls) {

        const rect = {

            left:
                wall.offsetLeft,

            right:
                wall.offsetLeft +
                wall.offsetWidth,

            top:
                wall.offsetTop,

            bottom:
                wall.offsetTop +
                wall.offsetHeight

        };


        if (

            playerRect.right >
                rect.left &&

            playerRect.left <
                rect.right &&

            playerRect.bottom >
                rect.top &&

            playerRect.top <
                rect.bottom

        ) {

            return true;
        }
    }


    return false;
}


/* =====================================
   GUARDS
===================================== */

function moveGuards() {

    guards.forEach(
        guard => {

            const distance =
                getDistance(
                    playerX,
                    playerY,
                    guard.x,
                    guard.y
                );


            let targetX =
                guard.x;

            let targetY =
                guard.y;


            if (
                distance <
                (sneaking
                    ? 120
                    : 190)
            ) {

                guard.alert = true;

                guard.element
                    .classList
                    .add("alert");


                const angle =
                    Math.atan2(
                        playerY -
                            guard.y,

                        playerX -
                            guard.x
                    );


                const speed =
                    sneaking
                        ? .7
                        : 1.4;


                targetX +=
                    Math.cos(angle) *
                    speed;

                targetY +=
                    Math.sin(angle) *
                    speed;

            } else {

                guard.alert = false;

                guard.element
                    .classList
                    .remove("alert");


                targetX +=
                    guard.direction *
                    guard.speed;


                if (
                    targetX < 30 ||
                    targetX >
                    gameArea.clientWidth - 50
                ) {

                    guard.direction *= -1;
                }
            }


            if (
                !guardCollides(
                    targetX,
                    guard.y
                )
            ) {
                guard.x = targetX;
            }


            if (
                !guardCollides(
                    guard.x,
                    targetY
                )
            ) {
                guard.y = targetY;
            }


            guard.element.style.left =
                guard.x + "px";

            guard.element.style.top =
                guard.y + "px";
        }
    );
}


function guardCollides(
    x,
    y
) {

    const size = 40;

    const rect = {

        left: x,

        right:
            x + size,

        top: y,

        bottom:
            y + size

    };


    const walls =
        document.querySelectorAll(
            ".wall"
        );


    for (const wall of walls) {

        const wallRect = {

            left:
                wall.offsetLeft,

            right:
                wall.offsetLeft +
                wall.offsetWidth,

            top:
                wall.offsetTop,

            bottom:
                wall.offsetTop +
                wall.offsetHeight

        };


        if (

            rect.right >
                wallRect.left &&

            rect.left <
                wallRect.right &&

            rect.bottom >
                wallRect.top &&

            rect.top <
                wallRect.bottom

        ) {

            return true;
        }
    }


    return false;
}


/* =====================================
   DETECTION
===================================== */

function checkGuardDetection() {

    guards.forEach(
        guard => {

            const distance =
                getDistance(
                    playerX,
                    playerY,
                    guard.x,
                    guard.y
                );


            if (distance < 50) {

                alarm +=
                    sneaking
                        ? .2
                        : .8;

                combo = 1;

                comboHits = 0;

                showMessage(
                    "🚨 YOU'VE BEEN SPOTTED!"
                );
            }
        }
    );


    alarm =
        Math.max(
            0,
            Math.min(
                100,
                alarm
            )
        );


    alarmDisplay.textContent =
        Math.floor(alarm) + "%";


    if (alarm >= 100) {

        endGame(false);
    }
}


/* =====================================
   ITEMS
===================================== */

function checkItems() {

    const items =
        [
            ...document
                .querySelectorAll(
                    ".item"
                )
        ];


    items.forEach(
        item => {

            const x =
                parseFloat(
                    item.style.left
                );

            const y =
                parseFloat(
                    item.style.top
                );


            if (
                getDistance(
                    playerX,
                    playerY,
                    x,
                    y
                ) < 42
            ) {

                collectItem(item);
            }
        }
    );
}


function collectItem(item) {

    const type =
        item.dataset.type;

    const value =
        Number(
            item.dataset.value
        );


    if (type === "key") {

        hasKey = true;

        item.remove();

        objectiveText.textContent =
            "Open the 🔐 vault";

        showMessage(
            "🔑 KEY FOUND!"
        );

        return;
    }


    const reward =
        Math.floor(
            value * combo
        );


    cash += reward;

    comboHits++;


    if (type === "diamond") {

        combo++;

        comboHits = 0;

        showMessage(
            `💎 +$${reward}`
        );

    } else {

        showMessage(
            `💵 +$${reward}`
        );
    }


    if (comboHits >= 4) {

        combo++;

        comboHits = 0;

        showMessage(
            `🔥 COMBO x${combo}!`
        );
    }


    item.remove();

    updateHUD();
}


/* =====================================
   VAULT
===================================== */

function checkVault() {

    if (
        vaultOpened ||
        !hasKey
    ) return;


    const vaultX =
        gameArea.clientWidth - 75;

    const vaultY =
        gameArea.clientHeight - 75;


    if (
        getDistance(
            playerX,
            playerY,
            vaultX,
            vaultY
        ) < 90
    ) {

        vaultOpened = true;


        const jackpot =
            1000 * combo;


        cash += jackpot;

        combo += 2;


        objectiveText.textContent =
            "Reach the 🚪 escape door";


        showMessage(
            `🏦 JACKPOT +$${jackpot}!`
        );


        updateHUD();
    }
}


/* =====================================
   ESCAPE
===================================== */

function checkEscape() {

    if (!vaultOpened) return;


    if (
        getDistance(
            playerX,
            playerY,
            55,
            gameArea.clientHeight - 75
        ) < 80
    ) {

        endGame(true);
    }
}


/* =====================================
   TIMER
===================================== */

function updateTimer() {

    if (!playing) return;


    time--;

    timerDisplay.textContent =
        time;


    if (time < 20) {

        alarm += .5;

        alarm =
            Math.min(
                100,
                alarm
            );

        alarmDisplay.textContent =
            Math.floor(alarm) + "%";
    }


    if (time <= 0) {

        endGame(false);
    }
}


/* =====================================
   END
===================================== */

function endGame(success) {

    if (!playing) return;


    playing = false;

    clearInterval(
        timerInterval
    );

    cancelAnimationFrame(
        animationId
    );


    resultTitle.textContent =
        success
            ? "🏆 HEIST COMPLETE"
            : "🚨 HEIST FAILED";


    resultCash.textContent =
        "$" +
        cash.toLocaleString();


    resultCombo.textContent =
        "x" + combo;


    resultTime.textContent =
        time + "s";


    result.classList.remove(
        "hidden"
    );
}


/* =====================================
   HUD
===================================== */

function updateHUD() {

    cashDisplay.textContent =
        "$" +
        cash.toLocaleString();

    comboDisplay.textContent =
        "x" + combo;

    timerDisplay.textContent =
        time;

    alarmDisplay.textContent =
        Math.floor(alarm) +
        "%";
}


/* =====================================
   MESSAGE
===================================== */

function showMessage(text) {

    message.textContent =
        text;

    message.classList.add(
        "show"
    );

    clearTimeout(
        messageTimeout
    );

    messageTimeout =
        setTimeout(
            () => {

                message.classList.remove(
                    "show"
                );

            },
            900
        );
}


/* =====================================
   DISTANCE
===================================== */

function getDistance(
    x1,
    y1,
    x2,
    y2
) {

    return Math.hypot(
        x1 - x2,
        y1 - y2
    );
}


/* =====================================
   JOYSTICK
===================================== */

let joystickPointer = null;


joystick.addEventListener(
    "pointerdown",
    e => {

        joystickPointer =
            e.pointerId;

        joystick.setPointerCapture(
            e.pointerId
        );

        updateJoystick(e);
    }
);


joystick.addEventListener(
    "pointermove",
    e => {

        if (
            e.pointerId !==
            joystickPointer
        ) return;

        updateJoystick(e);
    }
);


function updateJoystick(e) {

    const rect =
        joystick.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;


    let x =
        e.clientX -
        centerX;

    let y =
        e.clientY -
        centerY;


    const radius =
        rect.width / 2 - 29;


    const distance =
        Math.hypot(x, y);


    if (distance > radius) {

        x =
            (x / distance) *
            radius;

        y =
            (y / distance) *
            radius;
    }


    joystickX =
        x / radius;

    joystickY =
        y / radius;


    joystickKnob.style.left =
        `calc(50% + ${x}px)`;

    joystickKnob.style.top =
        `calc(50% + ${y}px)`;
}


function resetJoystick() {

    joystickPointer = null;

    joystickX = 0;
    joystickY = 0;

    joystickKnob.style.left =
        "50%";

    joystickKnob.style.top =
        "50%";
}


joystick.addEventListener(
    "pointerup",
    resetJoystick
);

joystick.addEventListener(
    "pointercancel",
    resetJoystick
);

joystick.addEventListener(
    "lostpointercapture",
    resetJoystick
);


/* =====================================
   SNEAK
===================================== */

sneakButton.addEventListener(
    "pointerdown",
    e => {

        e.preventDefault();

        sneaking = true;

        sneakButton.classList.add(
            "active"
        );
    }
);


function stopSneaking() {

    sneaking = false;

    sneakButton.classList.remove(
        "active"
    );
}


sneakButton.addEventListener(
    "pointerup",
    stopSneaking
);

sneakButton.addEventListener(
    "pointercancel",
    stopSneaking
);

sneakButton.addEventListener(
    "pointerleave",
    stopSneaking
);


/* =====================================
   PLAY AGAIN
===================================== */

againBtn.addEventListener(
    "click",
    startGame
);


/* START */

startGame();
