
function showEndRoundModal(isHost) {
    const existingModal = document.querySelector('.end-round-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'end-round-modal active';
    modal.innerHTML = `
        <div class="end-round-content">
            <h2>⏰ Time's Up! ⏰</h2>
            <div class="final-leaderboard">
                <h3>Final Scores</h3>
                <div id="final-scores"></div>
            </div>
            <div class="modal-buttons">
                ${isHost ? '<button class="modal-button play-again-btn">Play Again</button>' : ''}
                <button class="modal-button continue-btn">Continue</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    if (isHost) {
        modal.querySelector('.play-again-btn').addEventListener('click', () => {
            hideEndRoundModal();
            startTimer();
        });
    }

    modal.querySelector('.continue-btn').addEventListener('click', () => {
        hideEndRoundModal();
    });
}

function hideEndRoundModal() {
    const modal = document.querySelector('.end-round-modal');
    if(modal) {
        modal.remove();
    }
}

function updateFinalLeaderboard(players) {
    const scoresContainer = document.getElementById('final-scores');
    if(!scoresContainer) return;

    const sortedPlayers = Object.values(players)
        .sort((a, b) => (b.roundCoins || 0) - (a.roundCoins || 0));

    scoresContainer.innerHTML = sortedPlayers
        .map((player, index) => `
            <div class="leaderboard-item">
                <span>${index + 1}. ${player.name}</span>
                <span>${player.roundCoins || 0} 🗑️</span>
            </div>
        `)
        .join('');
}

function showFinalLeaderboard() {
    console.log("Showing final leaderboard"); 
    firebase.database().ref("players").once("value").then((snapshot) => {
        const players = snapshot.val();
        if (players) {
            updateFinalLeaderboard(players);
            showEndRoundModal(window.isHost); 
        }
    }).catch(error => {
        console.error("Error fetching players:", error);
    });
}


firebase.database().ref("roundStatus").on("value", (snapshot) => {
    console.log("Round status changed:", snapshot.val()); 
    const roundStatus = snapshot.val();
    if (roundStatus && roundStatus.status === "ended") {
        showFinalLeaderboard();
    }
});

firebase.database().ref("gameState").on("value", (snapshot) => {
    const gameState = snapshot.val();
    if (gameState && gameState.status === "countdown") {
        window.startCountdown(() => {});
    }
});