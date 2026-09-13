// ==========================================
// ELEMENTS
// ==========================================

const menu =
    document.getElementById("menu");

const game =
    document.getElementById("game");

const result =
    document.getElementById("result");

const startBtn =
    document.getElementById("startBtn");

const againBtn =
    document.getElementById("againBtn");

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

const finalCash =
    document.getElementById("finalCash");

const resultCash =
    document.getElementById("resultCash");

const resultCombo =
    document.getElementById("resultCombo");

const resultTime =
    document.getElementById("resultTime");

const resultTitle =
    document.getElementById("resultTitle");

const joystick =
    document.getElementById("joystick");

const joystickKnob =
    document.getElementById("joystickKnob");

const sneakButton =
    document.getElementById("sneakButton");


// HACK UI

const hackOverlay =
    document.getElementById("hackOverlay");

const hackButton =
    document.getElementById("hackButton");

const hackTarget =
    document.getElementById("hackTarget");

const hackCursor =
    document.getElementById("hackCursor");

const hackTimer =
    document.getElementById("hackTimer");

const hackMessage =
    document.getElementById("hackMessage");


// ==========================================
// VARIABLES
// ==========================================

let playing = false;

let cash = 0;

let combo = 1;

let comboHits = 0;

let time = 60;

let alarm = 0;

let hasKey = false;

let vaultOpened = false;

let playerX = 40;

let playerY = 40;

let guards = [];

let timerInterval = null;

let gameLoop = null;

let keys = {};

let joystickX = 0;

let joystickY = 0;

let sneaking = false;

let lastGuardHit = 0;

let messageTimeout = null;


// HACK VARIABLES

let hacking = false;

let hackPosition = 0;

let hackDirection = 1;

let hackTargetPosition = 0;

let hackCountdown = 10;

let hackInterval = null;


// SPEED

const normalSpeed = 3.5;

const sneakSpeed = 1.8;


// ==========================================
// KEYBOARD
// ==========================================

document.addEventListener(
    "keydown",
    (e) => {

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
    (e) => {

        keys[
            e.key.toLowerCase()
        ] = false;
    }
);


// ==========================================
// START GAME
// ==========================================

function startGame() {

    playing = true;

    cash = 0;

    combo = 1;

    comboHits = 0;

    time = 60;

    alarm = 0;

    hasKey = false;

    vaultOpened = false;

    sneaking = false;

    hacking = false;

    joystickX = 0;

    joystickY = 0;

    lastGuardHit = 0;

    document.body.classList.remove(
        "alarm-mode"
    );

    clearInterval(timerInterval);

    clearInterval(hackInterval);

    cancelAnimationFrame(gameLoop);

    resetJoystick();

    cashDisplay.textContent =
        "$0";

    comboDisplay.textContent =
        "x1";

    timerDisplay.textContent =
        "60";

    alarmDisplay.textContent =
        "0%";

    objectiveText.textContent =
        "Find the 🔑 key";

    menu.classList.add("hidden");

    result.classList.add("hidden");

    game.classList.remove("hidden");

    hackOverlay.classList.add(
        "hidden"
    );

    objects.innerHTML = `
        <div
            class="vault"
            style="right:45px; bottom:45px;"
        >
            🔐
        </div>

        <div
            class="escape"
            style="left:35px; bottom:45px;"
        >
            🚪
        </div>
    `;

    guardsContainer.innerHTML = "";

    guards = [];

    requestAnimationFrame(() => {

        playerX = 40;

        playerY = 40;

        player.style.left =
            playerX + "px";

        player.style.top =
            playerY + "px";

        createObjects();

        createGuards();

        timerInterval =
            setInterval(
                updateTimer,
                1000
            );

        gameLoop =
            requestAnimationFrame(loop);
    });
}


// ==========================================
// OBJECTS
// ==========================================

function createObjects() {

    for (
        let i = 0;
        i < 14;
        i++
    ) {

        const pos =
            findSafePosition();

        createItem(
            "💵",
            "cash",
            pos.x,
            pos.y,
            randomCash()
        );
    }


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const pos =
            findSafePosition();

        createItem(
            "💎",
            "diamond",
            pos.x,
            pos.y,
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

    item.textContent =
        icon;

    item.dataset.type =
        type;

    item.dataset.value =
        value;

    item.style.left =
        x + "px";

    item.style.top =
        y + "px";

    objects.appendChild(item);
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


// ==========================================
// SAFE POSITION
// ==========================================

function findSafePosition() {

    const width =
        gameArea.clientWidth;

    const height =
        gameArea.clientHeight;

    for (
        let attempt = 0;
        attempt < 50;
        attempt++
    ) {

        const x =
            50 +
            Math.random() *
            Math.max(
                50,
                width - 120
            );

        const y =
            60 +
            Math.random() *
            Math.max(
                50,
                height - 160
            );

        if (
            !collidesWithWalls(
                x,
                y,
                38
            )
        ) {

            return {
                x,
                y
            };
        }
    }

    return {
        x: 100,
        y: 100
    };
}


// ==========================================
// GUARDS
// ==========================================

function createGuards() {

    const width =
        gameArea.clientWidth;

    const height =
        gameArea.clientHeight;

    const positions = [

        {
            x: width * .55,
            y: height * .20
        },

        {
            x: width * .75,
            y: height * .55
        },

        {
            x: width * .35,
            y: height * .75
        }
    ];


    positions.forEach(
        (pos, index) => {

            const guard =
                document.createElement(
                    "div"
                );

            guard.className =
                "guard";

            guard.textContent =
                "👮";

            guard.style.left =
                pos.x + "px";

            guard.style.top =
                pos.y + "px";

            guardsContainer.appendChild(
                guard
            );

            guards.push({

                element: guard,

                x: pos.x,

                y: pos.y,

                direction:
                    index % 2 === 0
                        ? 1
                        : -1,

                speed:
                    .8 +
                    Math.random() *
                    .5,

                alert: false
            });
        }
    );
}


// ==========================================
// GAME LOOP
// ==========================================

function loop() {

    if (!playing) {
        return;
    }

    movePlayer();

    moveGuards();

    checkItems();

    checkVault();

    checkEscape();

    checkGuardDetection();

    gameLoop =
        requestAnimationFrame(loop);
}


// ==========================================
// PLAYER
// ==========================================

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


    if (
        dx !== 0 &&
        dy !== 0
    ) {

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

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
            playerY,
            38
        )
    ) {

        playerX = nextX;
    }


    if (
        !collidesWithWalls(
            playerX,
            nextY,
            38
        )
    ) {

        playerY = nextY;
    }


    const maxX =
        gameArea.clientWidth - 43;

    const maxY =
        gameArea.clientHeight - 43;


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


    player.style.left =
        playerX + "px";

    player.style.top =
        playerY + "px";
}


// ==========================================
// WALL COLLISION
// ==========================================

function collidesWithWalls(
    x,
    y,
    size = 38
) {

    const rect = {

        left: x,

        right:
            x + size,

        top: y,

        bottom:
            y + size
    };


    const walls =
        gameArea.querySelectorAll(
            ".wall"
        );


    for (
        const wall of walls
    ) {

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


// ==========================================
// GUARDS
// ==========================================

function moveGuards() {

    guards.forEach(
        (guard) => {

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


            // CHASE

            if (
                distance <
                (sneaking
                    ? 105
                    : 180)
            ) {

                guard.alert = true;

                guard.element.classList.add(
                    "alert"
                );


                const angle =
                    Math.atan2(
                        playerY -
                            guard.y,

                        playerX -
                            guard.x
                    );


                const speed =
                    sneaking
                        ? .65
                        : (
                            vaultOpened
                                ? 2.2
                                : 1.35
                        );


                targetX =
                    guard.x +
                    Math.cos(angle) *
                    speed;

                targetY =
                    guard.y +
                    Math.sin(angle) *
                    speed;

            } else {

                // PATROL

                guard.alert = false;

                guard.element.classList.remove(
                    "alert"
                );


                targetX =
                    guard.x +
                    guard.direction *
                    guard.speed;


                if (
                    targetX < 30 ||
                    targetX >
                        gameArea.clientWidth -
                        70
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

                guard.x =
                    targetX;

            } else {

                guard.direction *= -1;
            }


            if (
                !guardCollides(
                    guard.x,
                    targetY
                )
            ) {

                guard.y =
                    targetY;
            }


            guard.x =
                Math.max(
                    5,
                    Math.min(
                        gameArea.clientWidth -
                            45,
                        guard.x
                    )
                );


            guard.y =
                Math.max(
                    5,
                    Math.min(
                        gameArea.clientHeight -
                            45,
                        guard.y
                    )
                );


            guard.element.style.left =
                guard.x + "px";

            guard.element.style.top =
                guard.y + "px";
        }
    );
}


function guardCollides(x, y) {

    return collidesWithWalls(
        x,
        y,
        40
    );
}


// ==========================================
// GUARD DETECTION
// ==========================================

function checkGuardDetection() {

    const now =
        Date.now();


    guards.forEach(
        (guard) => {

            const distance =
                getDistance(
                    playerX,
                    playerY,
                    guard.x,
                    guard.y
                );


            if (
                distance < 50
            ) {

                if (
                    now -
                    lastGuardHit >
                    500
                ) {

                    lastGuardHit =
                        now;

                    alarm +=
                        sneaking
                            ? 2
                            : 7;

                    combo = 1;

                    comboHits = 0;

                    showMessage(
                        "🚨 GUARD CAUGHT YOU!"
                    );
                }
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
        Math.floor(alarm) +
        "%";


    if (
        alarm >= 100
    ) {

        endGame(false);
    }
}


// ==========================================
// ITEMS
// ==========================================

function checkItems() {

    const items = [
        ...document.querySelectorAll(
            ".item"
        )
    ];


    items.forEach(
        (item) => {

            const x =
                parseFloat(
                    item.style.left
                );

            const y =
                parseFloat(
                    item.style.top
                );


            const distance =
                getDistance(
                    playerX,
                    playerY,
                    x,
                    y
                );


            if (
                distance < 42
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


    if (
        type === "key"
    ) {

        hasKey = true;

        item.remove();

        objectiveText.textContent =
            "Open the 🔐 vault";

        showMessage(
            "🔑 KEY FOUND!"
        );

        return;
    }


    if (
        type === "cash"
    ) {

        const reward =
            Math.floor(
                value * combo
            );

        cash += reward;

        comboHits++;

        showMessage(
            `💵 +$${reward}`
        );


        if (
            comboHits >= 4
        ) {

            combo++;

            comboHits = 0;

            showMessage(
                `🔥 COMBO x${combo}!`
            );
        }
    }


    if (
        type === "diamond"
    ) {

        const reward =
            Math.floor(
                value * combo
            );

        cash += reward;

        combo++;

        comboHits = 0;

        showMessage(
            `💎 +$${reward}!`
        );
    }


    item.remove();

    updateHUD();
}


// ==========================================
// VAULT
// ==========================================

function checkVault() {

    if (
        vaultOpened ||
        hacking
    ) {
        return;
    }


    const vaultX =
        gameArea.clientWidth -
        115;

    const vaultY =
        gameArea.clientHeight -
        115;


    const distance =
        getDistance(
            playerX,
            playerY,
            vaultX,
            vaultY
        );


    if (
        distance < 100
    ) {

        if (hasKey) {

            startHack();

        } else {

            objectiveText.textContent =
                "You need the 🔑 key!";
        }
    }
}


// ==========================================
// HACKING
// ==========================================

function startHack() {

    if (
        hacking ||
        vaultOpened ||
        !hasKey
    ) {
        return;
    }


    hacking = true;

    hackCountdown = 10;

    hackPosition = 0;

    hackDirection = 1;

    hackMessage.textContent = "";

    hackMessage.style.color =
        "#ff6464";

    hackTimer.textContent =
        hackCountdown;


    hackOverlay.classList.remove(
        "hidden"
    );


    createHackTarget();


    clearInterval(hackInterval);


    hackInterval =
        setInterval(
            updateHack,
            30
        );
}


function createHackTarget() {

    const bar =
        document.getElementById(
            "hackBar"
        );


    const barWidth =
        bar.clientWidth;


    const targetWidth = 90;


    hackTargetPosition =
        Math.random() *
        Math.max(
            1,
            barWidth -
            targetWidth
        );


    hackTarget.style.left =
        hackTargetPosition +
        "px";
}


function updateHack() {

    if (!hacking) {
        return;
    }


    const bar =
        document.getElementById(
            "hackBar"
        );


    const barWidth =
        bar.clientWidth;


    const cursorWidth = 6;


    hackPosition +=
        hackDirection * 3;


    if (
        hackPosition <= 0 ||
        hackPosition >=
            barWidth -
            cursorWidth
    ) {

        hackDirection *= -1;
    }


    hackCursor.style.left =
        hackPosition + "px";
}


hackButton.addEventListener(
    "click",
    attemptHack
);


function attemptHack() {

    if (!hacking) {
        return;
    }


    const cursorCenter =
        hackPosition + 3;


    const targetLeft =
        hackTargetPosition;


    const targetRight =
        hackTargetPosition +
        90;


    if (
        cursorCenter >=
            targetLeft &&
        cursorCenter <=
            targetRight
    ) {

        successfulHack();

    } else {

        failedHack();
    }
}


function successfulHack() {

    hacking = false;

    clearInterval(
        hackInterval
    );


    hackMessage.style.color =
        "#70ff9d";

    hackMessage.textContent =
        "ACCESS GRANTED!";


    setTimeout(
        () => {

            hackOverlay.classList.add(
                "hidden"
            );

            openVault();

        },
        700
    );
}


function failedHack() {

    hackCountdown--;

    hackTimer.textContent =
        hackCountdown;

    hackMessage.style.color =
        "#ff6464";

    hackMessage.textContent =
        "ACCESS DENIED!";

    alarm += 12;

    alarm =
        Math.min(
            100,
            alarm
        );

    alarmDisplay.textContent =
        Math.floor(alarm) +
        "%";


    createHackTarget();


    if (
        hackCountdown <= 0
    ) {

        hacking = false;

        clearInterval(
            hackInterval
        );

        hackOverlay.classList.add(
            "hidden"
        );

        showMessage(
            "🚨 VAULT LOCKED!"
        );
    }
}


// ==========================================
// OPEN VAULT
// ==========================================

function openVault() {

    vaultOpened = true;


    const jackpot =
        1000 * combo;


    cash += jackpot;

    combo += 2;


    updateHUD();


    objectiveText.textContent =
        "🚨 ESCAPE! THE ALARM IS ACTIVE!";


    showMessage(
        `💰 JACKPOT +$${jackpot}!`
    );


    document.body.classList.add(
        "alarm-mode"
    );


    alarm =
        Math.max(
            alarm,
            25
        );


    alarmDisplay.textContent =
        Math.floor(alarm) +
        "%";


    guards.forEach(
        (guard) => {

            guard.alert = true;

            guard.speed *= 1.7;

            guard.element.classList.add(
                "alert"
            );
        }
    );
}


// ==========================================
// ESCAPE
// ==========================================

function checkEscape() {

    if (!vaultOpened) {
        return;
    }


    const escapeX = 55;

    const escapeY =
        gameArea.clientHeight -
        115;


    const distance =
        getDistance(
            playerX,
            playerY,
            escapeX,
            escapeY
        );


    if (
        distance < 80
    ) {

        endGame(true);
    }
}


// ==========================================
// TIMER
// ==========================================

function updateTimer() {

    if (!playing) {
        return;
    }


    time--;

    timerDisplay.textContent =
        time;


    if (
        time < 20
    ) {

        alarm += .5;

        alarm =
            Math.min(
                100,
                alarm
            );

        alarmDisplay.textContent =
            Math.floor(alarm) +
            "%";
    }


    if (
        time <= 0
    ) {

        endGame(false);
    }
}


// ==========================================
// END GAME
// ==========================================

function endGame(success) {

    if (!playing) {
        return;
    }


    playing = false;


    clearInterval(
        timerInterval
    );

    clearInterval(
        hackInterval
    );

    cancelAnimationFrame(
        gameLoop
    );


    hacking = false;

    sneaking = false;


    document.body.classList.remove(
        "alarm-mode"
    );


    hackOverlay.classList.add(
        "hidden"
    );


    finalCash.textContent =
        "$" +
        cash.toLocaleString();


    resultCash.textContent =
        "$" +
        cash.toLocaleString();


    resultCombo.textContent =
        "x" +
        combo;


    resultTime.textContent =
        time +
        "s";


    resultTitle.textContent =
        success
            ? "🏆 HEIST COMPLETE"
            : "🚨 HEIST FAILED";


    game.classList.add(
        "hidden"
    );

    result.classList.remove(
        "hidden"
    );
}


// ==========================================
// HUD
// ==========================================

function updateHUD() {

    cashDisplay.textContent =
        "$" +
        cash.toLocaleString();


    comboDisplay.textContent =
        "x" +
        combo;
}


// ==========================================
// MESSAGE
// ==========================================

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
            1000
        );
}


// ==========================================
// DISTANCE
// ==========================================

function getDistance(
    x1,
    y1,
    x2,
    y2
) {

    const dx =
        x1 - x2;

    const dy =
        y1 - y2;


    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


// ==========================================
// MOBILE JOYSTICK
// ==========================================

let joystickPointer = null;


joystick.addEventListener(
    "pointerdown",
    (e) => {

        if (!playing) {
            return;
        }

        e.preventDefault();

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
    (e) => {

        if (
            e.pointerId !==
            joystickPointer
        ) {
            return;
        }

        e.preventDefault();

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
        rect.width / 2 -
        29;


    const distance =
        Math.sqrt(
            x * x +
            y * y
        );


    if (
        distance > radius
    ) {

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


    if (joystickKnob) {

        joystickKnob.style.left =
            "50%";

        joystickKnob.style.top =
            "50%";
    }
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


// ==========================================
// SNEAK
// ==========================================

sneakButton.addEventListener(
    "pointerdown",
    (e) => {

        if (!playing) {
            return;
        }

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

sneakButton.addEventListener(
    "lostpointercapture",
    stopSneaking
);


// ==========================================
// BUTTONS
// ==========================================

startBtn.addEventListener(
    "click",
    startGame
);

againBtn.addEventListener(
    "click",
    startGame
);
