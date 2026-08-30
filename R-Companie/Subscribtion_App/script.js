// --- 1. STATE ARRAYS CONTAINER ---
let currentUserEmail = null;
let gameState = {
    isPremium: false,
    level: 1,
    currentXp: 0,
    xpToNextLevel: 100,
    gold: 0,
    title: "Novice",
    avatar: "👤",
    tasks: [],
    routines: [],
    statTotalXpEarned: 0,
    statTotalCompleted: 0
};

// --- 2. DOM ASSIGNMENTS ---
const authScreen = document.getElementById('auth-screen');
const authEmail = document.getElementById('auth-email');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const googleAuthBtn = document.getElementById('google-auth-btn');
const mainApp = document.getElementById('main-app');

const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const historyList = document.getElementById('history-list');

const routineInput = document.getElementById('routine-input');
const addRoutineBtn = document.getElementById('add-routine-btn');
const routineList = document.getElementById('routine-list');

const userLevelEl = document.getElementById('user-level');
const currentXpEl = document.getElementById('current-xp');
const nextLevelXpEl = document.getElementById('next-level-xp');
const progressBar = document.getElementById('progress-bar');
const premiumBadge = document.getElementById('premium-badge');
const openShopBtn = document.getElementById('open-shop-btn');

const goldCountEl = document.getElementById('gold-count');
const profileTitleEl = document.getElementById('profile-title');
const userAvatarEl = document.getElementById('user-avatar');

const avatarLockOverlay = document.getElementById('avatar-lock-overlay');
const customAvatarInput = document.getElementById('custom-avatar-input');
const saveAvatarBtn = document.getElementById('save-avatar-btn');

const analyticsLockTag = document.getElementById('analytics-lock-tag');
const analyticsBlurOverlay = document.getElementById('analytics-blur-overlay');
const metricTotalXp = document.getElementById('metric-total-xp');
const metricCompletionRate = document.getElementById('metric-completion-rate');

const premiumModal = document.getElementById('premium-modal');
const closeShopBtn = document.getElementById('close-shop-btn');
const subscribeBtn = document.getElementById('subscribe-btn');

// --- 3. IDENTITY ENTRY & GMAIL AUTH ENGINE ---
function initializeSession(email) {
    currentUserEmail = email;
    authScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');

    const savedData = localStorage.getItem(`questFocusData_v4_${currentUserEmail}`);
    if (savedData) {
        gameState = JSON.parse(savedData);
        if (!gameState.routines) gameState.routines = [];
    } else {
        gameState = { isPremium: false, level: 1, currentXp: 0, xpToNextLevel: 100, gold: 0, title: "Novice", avatar: "👤", tasks: [], routines: [], statTotalXpEarned: 0, statTotalCompleted: 0 };
    }
    updateUI();
}

authSubmitBtn.addEventListener('click', () => {
    const email = authEmail.value.trim();
    if (!email || !email.includes('@')) {
        alert("Please enter a valid email address.");
        return;
    }
    initializeSession(email);
});

// Google Signature Simulation Engine Flow
googleAuthBtn.addEventListener('click', () => {
    const targetGoogleEmail = prompt("Enter your Gmail address to securely sync accounts via Google Identity Services:", "player@gmail.com");
    if (targetGoogleEmail && targetGoogleEmail.includes('@gmail.com')) {
        alert(`🔑 Google Verification Complete: Authenticated token for ${targetGoogleEmail}`);
        initializeSession(targetGoogleEmail);
    } else if (targetGoogleEmail) {
        alert("❌ Authentication Failed: Must use a valid @gmail.com workspace handle.");
    }
});

// --- 4. CHECKOUT SYSTEM ---
openShopBtn.addEventListener('click', () => premiumModal.classList.remove('hidden'));
closeShopBtn.addEventListener('click', () => premiumModal.classList.add('hidden'));

subscribeBtn.addEventListener('click', () => {
    alert(`⚡ Connecting to Stripe Checkout...`);
    setTimeout(() => {
        gameState.isPremium = true;
        premiumModal.classList.add('hidden');
        saveGame();
        updateUI();
    }, 1000);
});

// --- 5. PREMIUM ICON LOGIC ---
saveAvatarBtn.addEventListener('click', () => {
    if (!gameState.isPremium) {
        premiumModal.classList.remove('hidden');
        return;
    }
    const dynamicIcon = customAvatarInput.value.trim();
    if (dynamicIcon) {
        gameState.avatar = dynamicIcon;
        saveGame();
        updateUI();
    }
});

function buyCosmetic(type, value, cost) {
    if (gameState.gold < cost) {
        alert("❌ Insufficient Gold!");
        return;
    }
    gameState.gold -= cost;
    if (type === 'avatar') gameState.avatar = value;
    if (type === 'title') gameState.title = value;
    saveGame();
    updateUI();
}

// --- 6. ROUTINES & OPERATIONS ---
function addRoutine() {
    const text = routineInput.value.trim();
    if (!text) return;

    if (!gameState.isPremium && gameState.routines.length >= 1) {
        premiumModal.classList.remove('hidden');
        alert("🔒 Planning Cap! Free accounts are limited to 1 scheduled routine. Upgrade to build an infinite matrix!");
        return;
    }

    const newRoutine = { id: Date.now(), text: text, completedToday: false };
    gameState.routines.push(newRoutine);
    routineInput.value = '';
    saveGame();
    updateUI();
}

function toggleRoutine(id) {
    const index = gameState.routines.findIndex(r => r.id === id);
    if (index !== -1) {
        const item = gameState.routines[index];
        if (!item.completedToday) {
            item.completedToday = true;
            gameState.statTotalCompleted += 1;
            gainXp(15);
        } else {
            item.completedToday = false;
            gameState.statTotalCompleted = Math.max(0, gameState.statTotalCompleted - 1);
        }
        saveGame();
        updateUI();
    }
}

function calculateQuestXp(taskText) {
    let text = taskText.toLowerCase();
    let xp = 25; 
    if (text.includes("hour") || text.includes("hr")) xp += 35;
    if (text.includes("study") || text.includes("learn")) xp += 20;
    return Math.min(xp, 120);
}

function saveGame() {
    if (currentUserEmail) {
        localStorage.setItem(`questFocusData_v4_${currentUserEmail}`, JSON.stringify(gameState));
    }
}

function updateUI() {
    userLevelEl.textContent = gameState.level;
    currentXpEl.textContent = gameState.currentXp;
    nextLevelXpEl.textContent = gameState.xpToNextLevel;
    goldCountEl.textContent = gameState.gold;
    profileTitleEl.textContent = gameState.title;
    userAvatarEl.textContent = gameState.avatar;
    
    const percentage = (gameState.currentXp / gameState.xpToNextLevel) * 100;
    progressBar.style.width = `${percentage}%`;

    if (gameState.isPremium) {
        premiumBadge.classList.remove('hidden');
        avatarLockOverlay.classList.add('hidden');
        analyticsLockTag.textContent = "🟢 Active";
        analyticsLockTag.style.color = "#04d361";
        analyticsBlurOverlay.classList.add('hidden');
        
        metricTotalXp.textContent = gameState.statTotalXpEarned;
        const overall = gameState.tasks.length + gameState.routines.length;
        const rate = overall > 0 ? Math.round((gameState.statTotalCompleted / overall) * 100) : 0;
        metricCompletionRate.textContent = `${rate}%`;

        openShopBtn.textContent = "✨ Premium Status Verified";
        openShopBtn.disabled = true;
    } else {
        premiumBadge.classList.add('hidden');
        avatarLockOverlay.classList.remove('hidden');
        analyticsLockTag.textContent = "🔒 Locked";
        analyticsLockTag.style.color = "#ff4747";
        analyticsBlurOverlay.classList.remove('hidden');
        openShopBtn.textContent = "✨ Upgrade to Premium — $5/mo";
        openShopBtn.disabled = false;
    }

    renderTasks();
}

function gainXp(amount) {
    gameState.currentXp += amount;
    gameState.statTotalXpEarned += amount;
    
    let goldEarned = Math.floor(amount / 2);
    if (gameState.isPremium) goldEarned *= 2;
    gameState.gold += goldEarned;

    while (gameState.currentXp >= gameState.xpToNextLevel) {
        if (!gameState.isPremium && gameState.level >= 10) {
            gameState.currentXp = gameState.xpToNextLevel;
            premiumModal.classList.remove('hidden');
            break;
        }
        gameState.currentXp -= gameState.xpToNextLevel;
        gameState.level += 1;
        gameState.xpToNextLevel = Math.floor(gameState.xpToNextLevel * 1.25);
        alert(`🎉 LEVEL UP! You reached Level ${gameState.level}!`);
    }
    saveGame();
    updateUI();
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const activeTasks = gameState.tasks.filter(t => !t.completed);
    if (!gameState.isPremium && activeTasks.length >= 3) {
        premiumModal.classList.remove('hidden');
        return;
    }

    const newTask = { id: Date.now(), text: taskText, completed: false, xpReward: calculateQuestXp(taskText) };
    gameState.tasks.push(newTask);
    taskInput.value = ''; 
    saveGame();
    updateUI();
}

function completeTask(taskId) {
    const taskIndex = gameState.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1 && !gameState.tasks[taskIndex].completed) {
        gameState.tasks[taskIndex].completed = true;
        gameState.statTotalCompleted += 1;
        gainXp(gameState.tasks[taskIndex].xpReward);
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    historyList.innerHTML = '';
    routineList.innerHTML = '';

    gameState.routines.forEach(item => {
        const li = document.createElement('li');
        li.className = `routine-item ${item.completedToday ? 'routine-checked' : ''}`;
        li.innerHTML = `
            <span>🔁 ${item.text}</span>
            <button class="complete-btn" onclick="toggleRoutine(${item.id})">
                ${item.completedToday ? 'Reset' : 'Check'}
            </button>
        `;
        routineList.appendChild(li);
    });

    gameState.tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        
        if (!task.completed) {
            li.innerHTML = `
                <span>${task.text} <small style="color: #04d361; margin-left: 10px;">(+${task.xpReward} XP)</small></span>
                <button class="complete-btn" onclick="completeTask(${task.id})">Complete</button>
            `;
            taskList.appendChild(li);
        } else {
            li.innerHTML = `<span>✔ ${task.text}</span>`;
            historyList.appendChild(li);
        }
    });
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
addRoutineBtn.addEventListener('click', addRoutine);
routineInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addRoutine(); });