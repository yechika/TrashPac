const mapData = {
  minX: 1,
  maxX: 14,
  minY: 4,
  maxY: 12,
  blockedSpaces: {
    "7x4": true,
    "1x11": true,
    "12x10": true,
    "4x7": true,
    "5x7": true,
    "6x7": true,
    "8x6": true,
    "9x6": true,
    "10x6": true,
    "7x9": true,
    "8x9": true,
    "9x9": true
  }
};

const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"];

function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function getKeyString(x, y) {
  return `${x}x${y}`;
}

function createName() {
  const prefix = randomFromArray([
    "COOL",
    "SUPER",
    "HIP",
    "SMUG",
    "COOL",
    "SILKY",
    "GOOD",
    "SAFE",
    "DEAR",
    "DAMP",
    "WARM",
    "RICH",
    "LONG",
    "DARK",
    "SOFT",
    "BUFF",
    "DOPE"
  ]);
  const animal = randomFromArray([
    "BEAR",
    "DOG",
    "CAT",
    "FOX",
    "LAMB",
    "LION",
    "BOAR",
    "GOAT",
    "VOLE",
    "SEAL",
    "PUMA",
    "MULE",
    "BULL",
    "BIRD",
    "BUG"
  ]);
  return `${prefix} ${animal}`;
}

function isSolid(x, y) {
  const blockedNextSpace = mapData.blockedSpaces[getKeyString(x, y)];
  return (
    blockedNextSpace ||
    x >= mapData.maxX ||
    x < mapData.minX ||
    y >= mapData.maxY ||
    y < mapData.minY
  );
}

function getRandomSafeSpot() {
  return randomFromArray([
    { x: 1, y: 4 },
    { x: 2, y: 4 },
    { x: 1, y: 5 },
    { x: 2, y: 6 },
    { x: 2, y: 8 },
    { x: 2, y: 9 },
    { x: 4, y: 8 },
    { x: 5, y: 5 },
    { x: 5, y: 8 },
    { x: 5, y: 10 },
    { x: 5, y: 11 },
    { x: 11, y: 7 },
    { x: 12, y: 7 },
    { x: 13, y: 7 },
    { x: 13, y: 6 },
    { x: 13, y: 8 },
    { x: 7, y: 6 },
    { x: 7, y: 7 },
    { x: 7, y: 8 },
    { x: 8, y: 8 },
    { x: 10, y: 8 },
    { x: 8, y: 8 },
    { x: 11, y: 4 }
  ]);
}

(function () {
  let playerId;
  let playerRef;
  let players = {};
  let playerElements = {};
  let trash = {};
  let trashElements = {};
  let gameTimer;
  let canMove = true;
  let timeRemaining = 60;
  let round = 1;

  const gameContainer = document.querySelector(".game-container");
  const playerNameInput = document.querySelector("#player-name");
  const playerColorButton = document.querySelector("#player-color");
  const roundEndPopup = document.querySelector(".round-end-popup");
  const finalLeaderboard = document.querySelector(".final-leaderboard");
  const rounds = document.querySelector(".round-container");

  const timerDisplay = document.getElementById("timer");
  const leaderboardList = document.getElementById("leaderboard-list");
  const nextRoundBtn = document.getElementById("next-round-btn");
  const walkSound = document.getElementById("walk-sound");

  const TRASH_TYPES = {
    BOTTLE: "bottle",
    BANANA: "banana"
  };

  function endRound() {
    clearInterval(gameTimer);

    canMove = false;

    const allTrashRef = firebase.database().ref("trash");
    allTrashRef.remove();

    Object.values(trashElements).forEach((element) => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    trashElements = {};
    // Update final leaderboard
    const allPlayersRef = firebase.database().ref(`players`);
    allPlayersRef.orderByChild("trash").once("value", (snapshot) => {
      const players = [];
      snapshot.forEach((child) => {
        players.push({
          name: child.val().name,
          trash: child.val().trash
        });
      });

      players.sort((a, b) => b.trash - a.trash);

      finalLeaderboard.innerHTML = `
      <h3>Final Scores</h3>
      ${players
        .map(
          (player, index) => `
          <div class="leaderboard-item">
          <span>#${index + 1} ${player.name}</span>
          <span>${player.trash}</span>
          </div>
          `
        )
        .join("")}
        `;
    });

    roundEndPopup.style.display = "block";
    roundEndPopup.classList.add("active");
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  function startTimer() {
    timeRemaining = 30;
    updateTimerDisplay();

    gameTimer = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();

      if (timeRemaining <= 0) {
        endRound();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timeRemaining);
  }

  function updateLeaderboard() {
    const allPlayersRef = firebase.database().ref(`players`);

    allPlayersRef.orderByChild("trash").once("value", (snapshot) => {
      const players = [];
      snapshot.forEach((child) => {
        players.push({
          name: child.val().name,
          trash: child.val().trash
        });
      });

      // Sort players by trash count
      players.sort((a, b) => b.trash - a.trash);

      // Update leaderboard display
      leaderboardList.innerHTML = players
        .map(
          (player) => `
          <div class="leaderboard-item">
            <span>${player.name}</span>
            <span>${player.trash}</span>
          </div>
        `
        )
        .join("");
    });
  }

  function updateRound(round) {
    rounds.innerHTML = `
      <span id="round">Round ${round}</span>
    `;
  }

  function placeTrash() {
    const { x, y } = getRandomSafeSpot();
    const trashRef = firebase.database().ref(`trash/${getKeyString(x, y)}`);

    const isBanana = Math.random() < 0.2;
    const trashType = isBanana ? TRASH_TYPES.BANANA : TRASH_TYPES.BOTTLE;

    trashRef.set({ x, y, type: trashType });

    const trashTimeouts = [1000];
    setTimeout(() => {
      placeTrash();
    }, trashTimeouts);
  }

  function attemptGrabTrash(x, y) {
    const key = getKeyString(x, y);
    if (trash[key]) {
      const trashItem = trash[key];
      const pointsToAdd = trashItem.type === TRASH_TYPES.BANANA ? 2 : 1;
      firebase.database().ref(`trash/${key}`).remove();
      playerRef.update({ trash: players[playerId].trash + pointsToAdd });

      const claimTrashSound = new Audio("audio/claimTrash.mp3");
      claimTrashSound.play();
    }
  }

  function startNewRound() {
    roundEndPopup.style.display = "none";
    roundEndPopup.classList.remove("active");

    canMove = true;

    startTimer();

    // Reset trash positions but keep player scores
    const allTrashRef = firebase.database().ref(`trash`);
    allTrashRef.remove().then(() => {
      placeTrash();
    });
    round++;
    updateRound(round);
  }

  function handleArrowPress(xChange = 0, yChange = 0) {
    if (!canMove) return;
    const newX = players[playerId].x + xChange;
    const newY = players[playerId].y + yChange;
    if (!isSolid(newX, newY)) {
      players[playerId].x = newX;
      players[playerId].y = newY;
      if (xChange === 1) {
        players[playerId].direction = "right";
      }
      if (xChange === -1) {
        players[playerId].direction = "left";
      }
      playerRef.set(players[playerId]);
      attemptGrabTrash(newX, newY);
      walkSound.play();
    }
  }

  function initGame() {
    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1));
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1));
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0));
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0));

    new KeyPressListener("KeyW", () => handleArrowPress(0, -1));
    new KeyPressListener("KeyS", () => handleArrowPress(0, 1));
    new KeyPressListener("KeyA", () => handleArrowPress(-1, 0));
    new KeyPressListener("KeyD", () => handleArrowPress(1, 0));

    startTimer();
    updateRound(round);

    const allPlayersRef = firebase.database().ref(`players`);
    const allTrashRef = firebase.database().ref(`trash`);

    allPlayersRef.on("value", () => {
      updateLeaderboard();
    });

    allPlayersRef.on("value", (snapshot) => {
      players = snapshot.val() || {};
      Object.keys(players).forEach((key) => {
        const characterState = players[key];
        let el = playerElements[key];
        el.querySelector(".Character_name").innerText = characterState.name;
        el.querySelector(".Character_trash").innerText = characterState.trash;
        el.setAttribute("data-color", characterState.color);
        el.setAttribute("data-direction", characterState.direction);
        const left = 16 * characterState.x + "px";
        const top = 16 * characterState.y - 4 + "px";
        el.style.transform = `translate3d(${left}, ${top}, 0)`;
      });
    });

    allPlayersRef.on("child_added", (snapshot) => {
      const addedPlayer = snapshot.val();
      const characterElement = document.createElement("div");
      characterElement.classList.add("Character", "grid-cell");
      if (addedPlayer.id === playerId) {
        characterElement.classList.add("you");
      }
      characterElement.innerHTML = `
      <div class="Character_shadow grid-cell"></div>
      <div class="Character_sprite grid-cell"></div>
      <div class="Character_name-container">
      <span class="Character_name"></span>
      <span class="Character_trash">0</span>
      </div>
      <div class="Character_you-arrow"></div>
      `;
      playerElements[addedPlayer.id] = characterElement;

      characterElement.querySelector(".Character_name").innerText =
        addedPlayer.name;
      characterElement.querySelector(".Character_trash").innerText =
        addedPlayer.trash;
      characterElement.setAttribute("data-color", addedPlayer.color);
      characterElement.setAttribute("data-direction", addedPlayer.direction);
      const left = 16 * addedPlayer.x + "px";
      const top = 16 * addedPlayer.y - 4 + "px";
      characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;
      gameContainer.appendChild(characterElement);
    });

    allPlayersRef.on("child_removed", (snapshot) => {
      const removedKey = snapshot.val().id;
      gameContainer.removeChild(playerElements[removedKey]);
      delete playerElements[removedKey];
    });

    allTrashRef.on("value", (snapshot) => {
      trash = snapshot.val() || {};
    });

    allTrashRef.on("child_added", (snapshot) => {
      let trashIndeed;
      const trashData = snapshot.val();
      const key = getKeyString(trashData.x, trashData.y);
      trash[key] = trashData;

      const trashElement = document.createElement("div");
      trashElement.classList.add("trash", "grid-cell");

      trashElement.innerHTML = `
      <div class="trash_shadow grid-cell"></div>
      <div class="trash_sprite grid-cell"></div>
      `;

      if (trashData.type === TRASH_TYPES.BANANA) {
        trashElement.querySelector(".trash_sprite").classList.add("banana");
      }

      const left = 16 * trashData.x + "px";
      const top = 16 * trashData.y - 4 + "px";
      trashElement.style.transform = `translate3d(${left}, ${top}, 0)`;

      trashElements[key] = trashElement;
      gameContainer.appendChild(trashElement);
    });

    allTrashRef.on("child_removed", (snapshot) => {
      const { x, y } = snapshot.val();
      const keyToRemove = getKeyString(x, y);
      gameContainer.removeChild(trashElements[keyToRemove]);
      delete trashElements[keyToRemove];
    });

    playerNameInput.addEventListener("change", (e) => {
      const newName = e.target.value || createName();
      playerNameInput.value = newName;
      playerRef.update({ name: newName });
    });

    playerColorButton.addEventListener("click", () => {
      const mySkinIndex = playerColors.indexOf(players[playerId].color);
      const nextColor = playerColors[mySkinIndex + 1] || playerColors[0];
      playerRef.update({ color: nextColor });
    });
    placeTrash();

    nextRoundBtn.addEventListener("click", startNewRound);
  }

  document.getElementById("start-game-btn").addEventListener("click", () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        playerId = user.uid;
        playerRef = firebase.database().ref(`players/${playerId}`);
        const name = createName();
        playerNameInput.value = name;
        const { x, y } = getRandomSafeSpot();
        playerRef.set({
          id: playerId,
          name,
          direction: "right",
          color: randomFromArray(playerColors),
          x,
          y,
          trash: 0
        });
        playerRef.onDisconnect().remove();
        initGame();
      } else {
      }
    });
  });

  firebase
    .auth()
    .signInAnonymously()
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
})();
