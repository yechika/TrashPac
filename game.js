let isSoundOn = true;
let audio;

document.addEventListener("DOMContentLoaded", function () {
  const muteButton = document.getElementById("mute-button");
  const muteIcon = document.getElementById("mute-icon");

  muteButton.addEventListener("click", function () {
    isSoundOn = !isSoundOn;
    muteIcon.src = isSoundOn ? "images/sound-svgrepo-com.svg" : "images/sound-off-svgrepo-com.svg";

    if (audio) {
      if (isSoundOn) {
        audio.play();
      } else {
        audio.pause();
      }
    }

    document.querySelectorAll("audio").forEach((audioElement) => {
      audioElement.muted = !isSoundOn;
    });
  });
});

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

document.getElementById("start-game-btn").addEventListener("click", function () {
  document.querySelector(".start-screen").style.display = "none";
  document.querySelector(".game-container").style.display = "block";
  document.querySelector(".player-info").style.display = "block";
  document.querySelector(".mobile-controls").style.display = "block";
  document.querySelector(".timer-container").style.display = "block";
  document.querySelector(".round-container").style.display = "block";
  document.querySelector(".leaderboard-container").style.display = "block";

  audio = new Audio("audio/lagu.mp3");
  audio.loop = true;
  if (isSoundOn) {
    audio.play().catch((error) => {
      console.error("Audio playback was prevented:", error);
    });
  }
});