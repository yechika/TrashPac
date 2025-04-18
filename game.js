function simulateKeyPress(keyCode) {
  var downEvent = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key: keyCode,
    code: keyCode
  });
  document.dispatchEvent(downEvent);

  var upEvent = new KeyboardEvent("keyup", {
    bubbles: true,
    cancelable: true,
    key: keyCode,
    code: keyCode
  });
  document.dispatchEvent(upEvent);
}

let laguAudio = null;

document
  .getElementById("start-game-btn")
  .addEventListener("click", function () {
    document.querySelector(".start-screen").style.display = "none";
    document.querySelector(".game-container").style.display = "block";
    document.querySelector(".player-info").style.display = "block";
    document.querySelector(".mobile-controls").style.display = "block";
    document.querySelector(".timer-container").style.display = "block";
    document.querySelector(".round-container").style.display = "block";
    document.querySelector(".leaderboard-container").style.display = "block";
    document.getElementById("mute-btn").style.display = "block"; // Show mute button

    // Use a global variable for laguAudio so mute works
    if (!laguAudio) {
      laguAudio = new Audio("audio/lagu.mp3");
      laguAudio.loop = true;
    }
    laguAudio.play().catch(function (error) {
      console.error("Audio playback was prevented:", error);
    });
  });

// Mute button logic
const muteBtn = document.getElementById("mute-btn");
const muteIcon = document.getElementById("mute-icon");
let isMuted = false;

// Helper to set mute state for all audio elements including laguAudio
function setMuteAll(mute) {
  document.querySelectorAll("audio").forEach(audio => {
    audio.muted = mute;
  });
  if (laguAudio) {
    laguAudio.muted = mute;
  }
  muteIcon.src = mute ? "images/sound-off-svgrepo-com.svg" : "images/sound-svgrepo-com.svg";
}

muteBtn.addEventListener("click", function () {
  isMuted = !isMuted;
  setMuteAll(isMuted);
});

// Optionally, set initial mute state on page load
setMuteAll(isMuted);