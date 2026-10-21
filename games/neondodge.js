const arena = document.getElementById("arena");
const player = document.getElementById("player");
const objects = document.getElementById("objects");
const powerups = document.getElementById("powerups");
const scoreDisplay = document.getElementById("score");
const comboDisplay = document.getElementById("combo");
const timerDisplay = document.getElementById("timer");
const bestDisplay = document.getElementById("best");
const warning = document.getElementById("warning");
const message = document.getElementById("message");
const result = document.getElementById("result");
const finalScore = document.getElementById("finalScore");
const finalBest = document.getElementById("finalBest");
const finalTime = document.getElementById("finalTime");
const againBtn = document.getElementById("againBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const boostBtn = document.getElementById("boostBtn");

let playing = true;
let score = 0;
let combo = 1;
let comboHits = 0;
let time = 0;
let playerX = 50;
let objectsArray = [];
let energyArray = [];
let lastTime = 0;
let spawnTimer = 0;
let energyTimer = 0;
let animationId;
let timerInterval;
let boosting = false;
let movingLeft = false;
let movingRight = false;
let best = Number(localStorage.getItem("neonDodgeBest")) || 0;

bestDisplay.textContent = best;

/* =====================================
   START
===================================== */
function startGame() {
    playing = true;
    score = 0;
    combo = 1;
    comboHits = 0;
    time = 0;
    playerX = 50;
    objects.innerHTML = "";
    powerups.innerHTML = "";
    objectsArray = [];
    energyArray = [];
    lastTime = performance.now();
    spawnTimer = 0;
    energyTimer = 0;
    result.classList.add("hidden");
    warning.classList.remove("show");
    updatePlayer();
    updateHUD();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!playing) return;
        time++;
        updateHUD();
    }, 1000);
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
}

/* =====================================
   LOOP
===================================== */
function loop(now) {
    if (!playing) return;
    const delta = Math.min(40, now - lastTime);
    lastTime = now;
    movePlayer(delta);
    spawnTimer += delta;
    energyTimer += delta;

    /* The longer you survive, the faster the game gets. */
    const spawnRate = Math.max(230, 850 - time * 12);
    if (spawnTimer >= spawnRate) {
        spawnTimer = 0;
        spawnObstacle();
    }
    if (energyTimer > 2800) {
        energyTimer = 0;
        spawnEnergy();
    }

    moveObjects(delta);
    moveEnergy(delta);
    checkCollisions();

    /* Passive survival score. */
    score += 0.025 * delta * combo;
    updateHUD();
    animationId = requestAnimationFrame(loop);
}

/* =====================================
   PLAYER
===================================== */
function movePlayer(delta) {
    let movement = 0;
    if (movingLeft) movement -= 1;
    if (movingRight) movement += 1;
    if (boosting) movement *= 1.8;

    const speed = boosting ? .22 : .12;
    playerX += movement * speed * delta;
    playerX = Math.max(4, Math.min(96, playerX));
    updatePlayer();
}

function updatePlayer() {
    player.style.left = playerX + "%";
}

/* =====================================
   OBSTACLES
===================================== */
function spawnObstacle() {
    const obstacle = document.createElement("div");
    obstacle.className = "obstacle";
    const x = 4 + Math.random() * 92;
    obstacle.style.left = x + "%";
    obstacle.style.top = "-50px";
    objects.appendChild(obstacle);
    objectsArray.push({
        element: obstacle,
        x: x,
        y: -50,
        speed: 2.2 + time * .025 + Math.random() * 1.2
    });

    /* Warning flashes after the game gets difficult. */
    if (time > 20 && Math.random() < .18) {
        warning.classList.add("show");
        setTimeout(() => warning.classList.remove("show"), 450);
    }
}

/* =====================================
   ENERGY
===================================== */
function spawnEnergy() {
    const energy = document.createElement("div");
    energy.className = "energy";
    energy.textContent = "⚡";
    const x = 5 + Math.random() * 90;
    energy.style.left = x + "%";
    energy.style.top = "-35px";
    powerups.appendChild(energy);
    energyArray.push({
        element: energy,
        x: x,
        y: -35,
        speed: 2.2
    });
}

/* =====================================
   MOVE OBJECTS
===================================== */
function moveObjects(delta) {
    for (let i = objectsArray.length - 1; i >= 0; i--) {
        const object = objectsArray[i];
        object.y += object.speed * delta / 16;
        object.element.style.top = object.y + "px";

        if (object.y > arena.clientHeight + 60) {
            object.element.remove();
            objectsArray.splice(i, 1);
            comboHits++;
            if (comboHits >= 5) {
                combo++;
                comboHits = 0;
                showMessage(`🔥 COMBO x${combo}`);
            }
        }
    }
}

/* =====================================
   MOVE ENERGY
===================================== */
function moveEnergy(delta) {
    for (let i = energyArray.length - 1; i >= 0; i--) {
        const energy = energyArray[i];
        energy.y += energy.speed * delta / 16;
        energy.element.style.top = energy.y + "px";

        if (energy.y > arena.clientHeight + 50) {
            energy.element.remove();
            energyArray.splice(i, 1);
        }
    }
}

/* =====================================
   COLLISIONS
===================================== */
function checkCollisions() {
    const playerRect = player.getBoundingClientRect();
    /* Obstacles */
    objectsArray.forEach(object => {
        const rect = object.element.getBoundingClientRect();
        if (intersects(playerRect, rect)) crash();
    });
    /* Energy */
    for (let i = energyArray.length - 1; i >= 0; i--) {
        const energy = energyArray[i];
        const rect = energy.element.getBoundingClientRect();
        if (intersects(playerRect, rect)) collectEnergy(i);
    }
}

function intersects(a, b) {
    return (
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top
    );
}

/* =====================================
   ENERGY COLLECT
===================================== */
function collectEnergy(index) {
    const energy = energyArray[index];
    const bonus = 100 * combo;
    score += bonus;
    combo++;
    comboHits = 0;
    showMessage(`⚡ +${bonus}`);
    energy.element.remove();
    energyArray.splice(index, 1);
    updateHUD();
}

/* =====================================
   CRASH
===================================== */
function crash() {
    if (!playing) return;
    playing = false;
    clearInterval(timerInterval);
    cancelAnimationFrame(animationId);

    if (score > best) {
        best = Math.floor(score);
        localStorage.setItem("neonDodgeBest", best);
    }

    finalScore.textContent = Math.floor(score).toLocaleString();
    finalBest.textContent = best.toLocaleString();
    finalTime.textContent = time + "s";
    result.classList.remove("hidden");
}

/* =====================================
   HUD
===================================== */
function updateHUD() {
    scoreDisplay.textContent = Math.floor(score).toLocaleString();
    comboDisplay.textContent = "x" + combo;
    timerDisplay.textContent = time;
    bestDisplay.textContent = best.toLocaleString();
}

/* =====================================
   MESSAGE
===================================== */
let messageTimeout;
function showMessage(text) {
    message.textContent = text;
    message.classList.add("show");
    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
        message.classList.remove("show");
    }, 700);
}

/* =====================================
   BUTTON MOVEMENT
===================================== */
function holdButton(button, callback) {
    button.addEventListener("pointerdown", e => {
        e.preventDefault();
        callback(true);
        button.setPointerCapture(e.pointerId);
    });
    button.addEventListener("pointerup", () => callback(false));
    button.addEventListener("pointercancel", () => callback(false));
    button.addEventListener("lostpointercapture", () => callback(false));
}

holdButton(leftBtn, value => { movingLeft = value; });
holdButton(rightBtn, value => { movingRight = value; });
holdButton(boostBtn, value => {
    boosting = value;
    boostBtn.classList.toggle("active", value);
});

/* =====================================
   KEYBOARD
===================================== */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") { movingLeft = true; e.preventDefault(); }
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") { movingRight = true; e.preventDefault(); }
    if (e.code === "Space") { boosting = true; e.preventDefault(); }
});
document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") movingLeft = false;
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") movingRight = false;
    if (e.code === "Space") boosting = false;
});

/* =====================================
   AGAIN
===================================== */
againBtn.addEventListener("click", startGame);

/* =====================================
   ADDED: JOYSTICK MECHANIC
===================================== */
const joystickZone = document.getElementById("joystickZone");
const joystickBase = document.getElementById("joystickBase");
const joystickStick = document.getElementById("joystickStick");

let joystickActive = false;
let joystickTouchId = null;
const maxRadius = 40;

if (joystickZone) {
    joystickZone.addEventListener("pointerdown", e => {
        e.preventDefault();
        joystickActive = true;
        joystickTouchId = e.pointerId;
        joystickZone.setPointerCapture(e.pointerId);
        updateJoystick(e);
    });

    joystickZone.addEventListener("pointermove", e => {
        if (!joystickActive || e.pointerId !== joystickTouchId) return;
        updateJoystick(e);
    });

    const stopJoystick = e => {
        if (e && e.pointerId !== joystickTouchId) return;
        joystickActive = false;
        joystickTouchId = null;

        joystickStick.style.transform = `translate(-50%, -50%)`;
        movingLeft = false;
        movingRight = false;
    };

    joystickZone.addEventListener("pointerup", stopJoystick);
    joystickZone.addEventListener("pointercancel", stopJoystick);
    joystickZone.addEventListener("lostpointercapture", stopJoystick);
}

function updateJoystick(e) {
    const rect = joystickBase.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const deltaX = e.clientX - centerX;

    const distance = Math.min(Math.abs(deltaX), maxRadius);
    const direction = Math.sign(deltaX);

    const moveX = distance * direction;
    joystickStick.style.transform = `translate(calc(-50% + ${moveX}px), -50%)`;

    const threshold = 8;
    if (moveX < -threshold) {
        movingLeft = true;
        movingRight = false;
    } else if (moveX > threshold) {
        movingRight = true;
        movingLeft = false;
    } else {
        movingLeft = false;
        movingRight = false;
    }
}

/* =====================================
   START
===================================== */
startGame();