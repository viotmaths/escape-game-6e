// ===== Configuration des codes secrets =====
// PROFESSEUR : Modifiez ces codes comme vous le souhaitez !
const CODES = {
    2: "MATHS2026",    // Code pour ouvrir la porte 2
    3: "MATHS2026",     // Code pour ouvrir la porte 3
    4: "MATHS2026",     // Code pour ouvrir la porte 4
    5: "MATHS2026"      // Code pour ouvrir la porte finale
};

// URLs des activités GeoGebra (à personnaliser)
const ACTIVITY_URLS = {
    1: "defi1.html",
    2: "defi2.html",
    3: "defi3.html",
    4: "defi4.html",
    5: "defi7.html"     // La porte 5 ouvre la page de félicitations
};

// ===== État du jeu =====
let gameState = {
    unlockedDoors: [1], // La porte 1 est toujours déverrouillée
    completedDoors: [],
    currentDoorToUnlock: null
};

// Charger l'état sauvegardé
function loadGameState() {
    const saved = localStorage.getItem('escapeRoomMaths');
    if (saved) {
        gameState = JSON.parse(saved);
        updateAllDoors();
        updateProgress();
    }
}

// Sauvegarder l'état
function saveGameState() {
    localStorage.setItem('escapeRoomMaths', JSON.stringify(gameState));
}

// ===== Gestion des portes =====
function openDoor(doorNumber) {
    if (gameState.unlockedDoors.includes(doorNumber)) {
        // Rediriger vers l'activité GeoGebra
        window.location.href = ACTIVITY_URLS[doorNumber];
    }
}

function tryOpenDoor(doorNumber) {
    if (gameState.unlockedDoors.includes(doorNumber)) {
        openDoor(doorNumber);
    } else if (gameState.unlockedDoors.includes(doorNumber - 1) ||
        gameState.completedDoors.includes(doorNumber - 1)) {
        // Afficher le modal de code
        gameState.currentDoorToUnlock = doorNumber;
        showCodeModal(doorNumber);
    } else {
        // Afficher un message d'erreur
        showTemporaryMessage(`Tu dois d'abord compléter la porte ${doorNumber - 1} !`);
    }
}

function showCodeModal(doorNumber) {
    const modal = document.getElementById('codeModal');
    const doorNumberSpan = document.getElementById('doorNumberModal');
    const codeInput = document.getElementById('codeInput');
    const errorMessage = document.getElementById('errorMessage');

    doorNumberSpan.textContent = doorNumber;
    codeInput.value = '';
    errorMessage.textContent = '';
    modal.classList.add('show');

    setTimeout(() => codeInput.focus(), 100);
}

function closeModal() {
    document.getElementById('codeModal').classList.remove('show');
    gameState.currentDoorToUnlock = null;
}

function validateCode() {
    const codeInput = document.getElementById('codeInput');
    const errorMessage = document.getElementById('errorMessage');
    const enteredCode = codeInput.value.toUpperCase().trim();
    const doorNumber = gameState.currentDoorToUnlock;

    if (enteredCode === CODES[doorNumber]) {
        // Code correct !
        closeModal();
        unlockDoor(doorNumber);
    } else {
        // Code incorrect
        errorMessage.textContent = "❌ Code incorrect ! Demande à ton professeur.";
        codeInput.classList.add('shake');
        setTimeout(() => codeInput.classList.remove('shake'), 500);
    }
}

function unlockDoor(doorNumber) {
    if (!gameState.unlockedDoors.includes(doorNumber)) {
        gameState.unlockedDoors.push(doorNumber);

        // Marquer le défi précédent comme complété (sauf si c'est la porte 1)
        if (doorNumber > 1) {
            markDoorCompleted(doorNumber - 1);
        }

        saveGameState();
        updateDoorVisual(doorNumber);
        updateProgress();

        if (doorNumber === 5) {
            showSuccessModal(doorNumber); // On ouvre le modal succès qui mène à la page
        } else {
            showSuccessModal(doorNumber);
        }
    }
}

function markDoorCompleted(doorNumber) {
    if (!gameState.completedDoors.includes(doorNumber)) {
        gameState.completedDoors.push(doorNumber);
        saveGameState();
        updateDoorVisual(doorNumber);
        updateProgress();
    }
}

// ===== Mise à jour visuelle =====
function updateDoorVisual(doorNumber) {
    const door = document.getElementById(`door${doorNumber}`);
    const wrapper = door.closest('.door-wrapper');
    const status = wrapper.querySelector('.door-status');

    if (gameState.completedDoors.includes(doorNumber)) {
        door.classList.remove('locked');
        door.classList.add('unlocked', 'completed');
        status.className = 'door-status completed-status';
        status.textContent = '✅ Complété !';
    } else if (gameState.unlockedDoors.includes(doorNumber)) {
        door.classList.remove('locked');
        door.classList.add('unlocked');
        status.className = 'door-status unlocked-status';
        status.textContent = '🔓 Ouvert';
    }
}

function updateAllDoors() {
    for (let i = 1; i <= 5; i++) {
        updateDoorVisual(i);
    }
}

function updateProgress() {
    const completed = gameState.completedDoors.length;
    const total = 5;
    const percentage = (completed / total) * 100;

    document.getElementById('progressFill').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${completed} / ${total} défis complétés`;
}

// ===== Modals de succès =====
function showSuccessModal(doorNumber) {
    const modal = document.getElementById('successModal');
    const message = document.getElementById('successMessage');
    message.textContent = `La porte ${doorNumber} est maintenant ouverte ! Continue ton aventure !`;
    modal.classList.add('show');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
}

function showVictoryModal() {
    document.getElementById('victoryModal').classList.add('show');
    createConfetti();
}

function closeVictoryModal() {
    document.getElementById('victoryModal').classList.remove('show');
}

// ===== Effets visuels =====
function showTemporaryMessage(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(225, 112, 85, 0.9);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 2000;
        animation: slideUp 0.3s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createConfetti() {
    const colors = ['🎉', '🎊', '⭐', '🌟', '✨', '🎈'];
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.textContent = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.cssText = `
                position: fixed;
                top: -50px;
                left: ${Math.random() * 100}vw;
                font-size: ${20 + Math.random() * 20}px;
                z-index: 3000;
                animation: fall ${3 + Math.random() * 2}s linear forwards;
                pointer-events: none;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }, i * 100);
    }
}

// Ajouter les animations CSS dynamiquement
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translate(-50%, 100px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    @keyframes fall {
        to { transform: translateY(100vh) rotate(720deg); }
    }
    .shake {
        animation: shakeInput 0.3s ease !important;
    }
    @keyframes shakeInput {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// ===== Event Listeners =====
document.getElementById('codeInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        validateCode();
    }
});

// Fermer les modals en cliquant à l'extérieur
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function (e) {
        if (e.target === this) {
            this.classList.remove('show');
        }
    });
});

// ===== Fonction pour réinitialiser le jeu (pour le prof) =====
function resetGame() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toute la progression ?')) {
        localStorage.removeItem('escapeRoomMaths');
        location.reload();
    }
}

// ===== Initialisation =====
document.addEventListener('DOMContentLoaded', function () {
    loadGameState();
    console.log('🔐 Escape Room Maths chargé !');
    console.log('Pour réinitialiser le jeu, tapez resetGame() dans la console.');
});
